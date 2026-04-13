import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTempleStore } from '@/stores/templeStore';

SplashScreen.preventAutoHideAsync();

function RootNav() {
  const { isDark } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
    'Inter-Variable': require('@/assets/fonts/Inter-Variable.ttf'),
  });

  const initialize = useAuthStore((s) => s.initialize);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadSavedTemples = useTempleStore((s) => s.loadSavedTemples);

  // Initialize Supabase auth listener + restore session
  useEffect(() => {
    initialize();
    restoreSession();
  }, []);

  // When user is authenticated, load their settings and saved temples from Supabase
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
      loadSavedTemples();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootNav />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
