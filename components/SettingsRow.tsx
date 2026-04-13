import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
  destructive?: boolean;
}

export function SettingsRow({
  icon,
  label,
  value,
  isSwitch,
  switchValue,
  onPress,
  onSwitchChange,
  destructive,
}: SettingsRowProps) {
  const colors = useThemeColors();
  const textColor = destructive ? colors.destructive : colors.text;

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={isSwitch ? 1 : 0.7}
      disabled={isSwitch}
    >
      <Ionicons
        name={icon}
        size={22}
        color={destructive ? colors.destructive : colors.accent}
        style={styles.icon}
      />
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.accent + '60' }}
          thumbColor={switchValue ? colors.accent : colors.muted}
        />
      ) : (
        <View style={styles.rightSection}>
          {value && (
            <Text style={[styles.value, { color: colors.muted }]}>{value}</Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 14,
  },
  label: {
    fontFamily: 'Inter-Variable',
    fontSize: 15,
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontFamily: 'Inter-Variable',
    fontSize: 14,
  },
});
