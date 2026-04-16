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
const GOOGLE_IOS_CLIENT_ID = process.env.GOOGLE_IOS_CLIENT_ID || '';
const GOOGLE_WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID || '';

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
      buildNumber: '1',
      config: {
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          'Jain Dham uses your location to find nearby Jain temples and show them on the map.',
        NSCameraUsageDescription:
          'Jain Dham may use the camera if you share a temple photo. You can deny this without affecting other features.',
        NSPhotoLibraryUsageDescription:
          'Jain Dham may access your photo library if you share a temple photo.',
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
      'expo-apple-authentication',
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: process.env.GOOGLE_IOS_URL_SCHEME || 'com.googleusercontent.apps.PLACEHOLDER',
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
      GOOGLE_IOS_CLIENT_ID,
      GOOGLE_WEB_CLIENT_ID,
      eas: {
        projectId: 'beebc298-e052-4c66-9545-4b839339328f',
      },
    },
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
