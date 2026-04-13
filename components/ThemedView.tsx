import { View, type ViewProps } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface ThemedViewProps extends ViewProps {
  surface?: boolean;
}

export function ThemedView({ style, surface, ...props }: ThemedViewProps) {
  const colors = useThemeColors();
  const backgroundColor = surface ? colors.surface : colors.background;

  return <View style={[{ backgroundColor }, style]} {...props} />;
}
