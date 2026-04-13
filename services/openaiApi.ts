import type { ChatMessage } from '@/types/chat';
import { DHAMBOT_SYSTEM_PROMPT } from '@/constants/config';
import { ENV } from '@/constants/env';

// ─── Provider config ─────────────────────────────────────────
// Supports both Azure OpenAI (v1 endpoint format) and standard OpenAI.
// If AZURE_OPENAI_ENDPOINT is set, Azure is used; otherwise standard OpenAI.

const AZURE_ENDPOINT = ENV.AZURE_OPENAI_ENDPOINT;
const AZURE_DEPLOYMENT = ENV.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
const API_KEY = ENV.OPENAI_API_KEY;

const isAzure = !!AZURE_ENDPOINT;

// Azure v1 endpoint format:
//   https://<resource>.openai.azure.com/openai/v1/chat/completions
// Standard OpenAI:
//   https://api.openai.com/v1/chat/completions
const API_URL = isAzure
  ? `${AZURE_ENDPOINT.replace(/\/$/, '')}/chat/completions`
  : 'https://api.openai.com/v1/chat/completions';

const MODEL = isAzure ? AZURE_DEPLOYMENT : 'gpt-4o';

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  if (!API_KEY) {
    throw new Error('Dhambot is not configured. Please set OPENAI_API_KEY in .env.');
  }

  try {
    const apiMessages = [
      { role: 'system' as const, content: DHAMBOT_SYSTEM_PROMPT },
      ...messages.slice(-20).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Azure accepts both `Authorization: Bearer` and `api-key` headers on the v1 endpoint.
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    };
    if (isAzure) {
      headers['api-key'] = API_KEY;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        max_completion_tokens: 500,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(
        `[${isAzure ? 'Azure OpenAI' : 'OpenAI'}] error:`,
        response.status,
        errorData
      );
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content ||
      'I could not generate a response. Please try again.'
    );
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    console.error('[Dhambot] sendChatMessage failed:', error);
    throw new Error('Dhambot is unavailable right now, please try again.');
  }
}
