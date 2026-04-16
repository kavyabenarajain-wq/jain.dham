import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const ENV = {
  GOOGLE_PLACES_API_KEY: extra.GOOGLE_PLACES_API_KEY ?? '',
  OPENAI_API_KEY: extra.OPENAI_API_KEY ?? '',
  AZURE_OPENAI_ENDPOINT: extra.AZURE_OPENAI_ENDPOINT ?? '',
  AZURE_OPENAI_DEPLOYMENT: extra.AZURE_OPENAI_DEPLOYMENT ?? '',
  SUPABASE_URL: extra.SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: extra.SUPABASE_ANON_KEY ?? '',
  GOOGLE_IOS_CLIENT_ID: extra.GOOGLE_IOS_CLIENT_ID ?? '',
  GOOGLE_WEB_CLIENT_ID: extra.GOOGLE_WEB_CLIENT_ID ?? '',
} as const;
