import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { Colors, type ThemeColors, type ColorScheme } from '@/constants/colors';
import { useSettingsStore } from '@/stores/settingsStore';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: 'light',
  colors: Colors.light,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const appearance = useSettingsStore((s) => s.appearance);
  const deviceScheme = useDeviceColorScheme();

  const colorScheme: ColorScheme = useMemo(() => {
    if (appearance === 'system') {
      return deviceScheme === 'dark' ? 'dark' : 'light';
    }
    return appearance;
  }, [appearance, deviceScheme]);

  const value = useMemo(
    () => ({
      colorScheme,
      colors: Colors[colorScheme],
      isDark: colorScheme === 'dark',
    }),
    [colorScheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
