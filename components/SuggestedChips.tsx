import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SuggestedChipsProps {
  chips: string[];
  activeChip?: string;
  onPress: (chip: string) => void;
}

export function SuggestedChips({ chips, activeChip, onPress }: SuggestedChipsProps) {
  const colors = useThemeColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => {
        const isActive = activeChip === chip;
        return (
          <TouchableOpacity
            key={chip}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? colors.accent : 'transparent',
                borderColor: isActive ? colors.accent : colors.border,
              },
            ]}
            onPress={() => onPress(chip)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                { color: isActive ? '#FFFFFF' : colors.text },
              ]}
            >
              {chip}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 13,
  },
});
