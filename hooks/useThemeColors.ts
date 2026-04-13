import { useTheme } from '@/context/ThemeContext';

export function useThemeColors() {
  const { colors } = useTheme();
  return colors;
}
