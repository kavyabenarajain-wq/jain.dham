export type PrayerSect = 'both' | 'shvetambar' | 'digambar';

export type PrayerCategory =
  | 'mantra'
  | 'stotra'
  | 'sutra'
  | 'aradhana'
  | 'devotional';

export interface Prayer {
  id: string;
  name: string;
  nameDevanagari?: string;
  category: PrayerCategory;
  sect: PrayerSect;
  shortDescription: string;
  // Original text in Devanagari (Sanskrit/Prakrit)
  textDevanagari: string;
  // Romanized transliteration for non-Devanagari readers
  transliteration: string;
  // English meaning / translation
  meaning: string;
  // YouTube SEARCH URL — never a direct video link, so it's never broken
  youtubeSearchUrl: string;
}
