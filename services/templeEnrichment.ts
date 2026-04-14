import type { Temple, TempleEnrichment } from '@/types/temple';
import { ENV } from '@/constants/env';
import { fetchTempleEnrichment, upsertTempleEnrichment } from './supabaseDb';

const AZURE_ENDPOINT = ENV.AZURE_OPENAI_ENDPOINT;
const AZURE_DEPLOYMENT = ENV.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
const API_KEY = ENV.OPENAI_API_KEY;

const isAzure = !!AZURE_ENDPOINT;
const API_URL = isAzure
  ? `${AZURE_ENDPOINT.replace(/\/$/, '')}/chat/completions`
  : 'https://api.openai.com/v1/chat/completions';
const MODEL = isAzure ? AZURE_DEPLOYMENT : 'gpt-4o';

const SYSTEM_PROMPT = `You are a Jain heritage guide producing a "digi tour" of a Jain temple.
Given the temple's name and location, write grounded, devotee-friendly content for each section below.

Sections:
- description: 2-3 sentences summarising the temple — principal idol (mool nayak) if known, sampradaya, and one distinctive feature.
- idols: array of idol / murti names in the temple. Empty array if unknown — never invent names.
- history: 2-4 sentences on founding, key restorations, or legends. Omit (null) if unknown.
- significance: 2-4 sentences on religious / cultural importance — why devotees visit.
- rituals: 2-4 sentences on daily puja, abhishek, aarti times, festivals typically observed.
- architecture: 2-4 sentences on style (shikhar / mandapa / garbhagriha / marble work), era, distinctive carvings.

If a section is unknown for this specific temple, return null for that section. Do NOT fabricate specific
facts, dates, or idol names. If you only know general conventions of the inferred sampradaya, you may give
those in "rituals" or "architecture" — but flag with a phrase like "typically" so devotees know it is general.

Respond as strict JSON:
{
  "description": "string",
  "idols": ["name", ...],
  "history": "string or null",
  "significance": "string or null",
  "rituals": "string or null",
  "architecture": "string or null",
  "confidence": "high" | "medium" | "low"
}`;

interface AiResponse {
  description: string;
  idols: string[];
  history: string | null;
  significance: string | null;
  rituals: string | null;
  architecture: string | null;
  confidence: 'high' | 'medium' | 'low';
}

async function callOpenAi(temple: Temple): Promise<AiResponse | null> {
  if (!API_KEY) {
    throw new Error('OpenAI not configured — set OPENAI_API_KEY in .env.');
  }

  const userPrompt = `Temple: ${temple.name}
Address: ${temple.address}
Coordinates: ${temple.location.latitude.toFixed(4)}, ${temple.location.longitude.toFixed(4)}
Inferred sampradaya from name: ${temple.sampradaya}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  };
  if (isAzure) headers['api-key'] = API_KEY;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 1200,
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[Enrichment] OpenAI error:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as Partial<AiResponse>;
    if (typeof parsed.description !== 'string') return null;
    const clean = (v: unknown): string | null =>
      typeof v === 'string' && v.trim().length > 0 ? v : null;
    return {
      description: parsed.description,
      idols: Array.isArray(parsed.idols) ? parsed.idols : [],
      history: clean(parsed.history),
      significance: clean(parsed.significance),
      rituals: clean(parsed.rituals),
      architecture: clean(parsed.architecture),
      confidence: parsed.confidence || 'low',
    };
  } catch (error) {
    console.warn('[Enrichment] failed:', error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Returns a description of the temple's idols and significance. Checks
 * Supabase cache first; on miss, calls OpenAI and writes the result back
 * so future opens (by any user) are free.
 */
export async function getTempleEnrichment(temple: Temple): Promise<TempleEnrichment | null> {
  const cached = await fetchTempleEnrichment(temple.placeId);
  if (cached) return cached;

  const ai = await callOpenAi(temple);
  if (!ai) return null;

  const record: Omit<TempleEnrichment, 'fetchedAt'> = {
    placeId: temple.placeId,
    description: ai.description,
    idols: ai.idols,
    history: ai.history,
    significance: ai.significance,
    rituals: ai.rituals,
    architecture: ai.architecture,
    source: 'ai',
  };

  // Fire-and-forget: cache write shouldn't block the UI.
  upsertTempleEnrichment(record).catch(() => {});

  return { ...record, fetchedAt: new Date().toISOString() };
}
