import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SAMPRADAYA_COLORS: Record<string, string> = {
  digambar: '#D97757',
  shvetambar: '#6A9BCC',
  sthanakvasi: '#788C5D',
  unknown: '#B0AEA5',
};

interface TempleMarkerProps {
  sampradaya: string;
  selected?: boolean;
}

export function TempleMarker({ sampradaya, selected }: TempleMarkerProps) {
  const color = SAMPRADAYA_COLORS[sampradaya] || SAMPRADAYA_COLORS.unknown;

  return (
    <View style={[styles.container, selected && styles.selected]}>
      <View style={[styles.marker, { backgroundColor: color }]}>
        <Ionicons name="diamond" size={16} color="#FFFFFF" />
      </View>
      <View style={[styles.tail, { borderTopColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  selected: {
    transform: [{ scale: 1.2 }],
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});
