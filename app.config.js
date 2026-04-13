// Reads API keys from .env so secrets stay out of git.
// .env is in .gitignore — never commit it.
require('dotenv').config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || GOOGLE_MAPS_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

module.exports = {
  expo: {
    name: 'Jain Dham',
    slug: 'jain-dham',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'jaindham',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.jaindham.app',
      config: {
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Jain Dham uses your location to find nearby Jain temples and show them on the map.',
      },
    },
    android: {
      package: 'com.jaindham.app',
      adaptiveIcon: {
        backgroundColor: '#141413',
        foregroundImage: './assets/images/icon.png',
      },
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#141413',
        },
      ],
      'expo-font',
      'expo-secure-store',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Jain Dham uses your location to find nearby Jain temples.',
        },
      ],
    ],
    extra: {
      GOOGLE_PLACES_API_KEY,
      OPENAI_API_KEY,
      AZURE_OPENAI_ENDPOINT,
      AZURE_OPENAI_DEPLOYMENT,
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
    },
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
