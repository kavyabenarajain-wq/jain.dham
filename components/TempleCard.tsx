import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTempleStore } from '@/stores/templeStore';
import { useAuthStore } from '@/stores/authStore';
import type { Temple } from '@/types/temple';

interface TempleCardProps {
  temple: Temple;
  compact?: boolean;
  onPress?: () => void;
}

const SAMPRADAYA_COLORS: Record<string, string> = {
  digambar: '#D97757',
  shvetambar: '#6A9BCC',
  sthanakvasi: '#788C5D',
  unknown: '#B0AEA5',
};

export function TempleCard({ temple, compact, onPress }: TempleCardProps) {
  const colors = useThemeColors();
  const { toggleSavedTemple, isTempleSaved } = useTempleStore();
  const { isAuthenticated } = useAuthStore();
  const saved = isTempleSaved(temple.placeId);

  const openDirections = async () => {
    const { latitude, longitude } = temple.location;
    // Try the Google Maps app first; fall back to the universal Google Maps web URL
    // (which itself prompts to open in the Google Maps app on iOS/Android if installed).
    const googleMapsApp = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
    const googleMapsWeb = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

    try {
      const canOpenApp = await Linking.canOpenURL(googleMapsApp);
      await Linking.openURL(canOpenApp ? googleMapsApp : googleMapsWeb);
    } catch {
      Linking.openURL(googleMapsWeb);
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name="diamond" size={24} color={SAMPRADAYA_COLORS[temple.sampradaya]} />
        <Text style={[styles.compactName, { color: colors.text }]} numberOfLines={1}>
          {temple.name}
        </Text>
        {temple.distance != null && (
          <Text style={[styles.distance, { color: colors.muted }]}>
            {temple.distance.toFixed(1)} km
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconWrapper}>
          <Ionicons name="diamond" size={28} color={SAMPRADAYA_COLORS[temple.sampradaya]} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {temple.name}
          </Text>
          <Text style={[styles.address, { color: colors.muted }]} numberOfLines={1}>
            {temple.address}
          </Text>
        </View>
        {isAuthenticated && (
          <TouchableOpacity onPress={() => toggleSavedTemple(temple.placeId)}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={saved ? colors.accent : colors.muted}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              { backgroundColor: SAMPRADAYA_COLORS[temple.sampradaya] + '20' },
            ]}
          >
            <Text
              style={[styles.badgeText, { color: SAMPRADAYA_COLORS[temple.sampradaya] }]}
            >
              {temple.sampradaya === 'unknown' ? 'Jain' : temple.sampradaya.charAt(0).toUpperCase() + temple.sampradaya.slice(1)}
            </Text>
          </View>
          {temple.distance != null && (
            <Text style={[styles.distance, { color: colors.muted }]}>
              {temple.distance.toFixed(1)} km away
            </Text>
          )}
          {temple.rating != null && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F5C518" />
              <Text style={[styles.rating, { color: colors.muted }]}>{temple.rating}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.directionsButton} onPress={openDirections}>
          <Ionicons name="navigate" size={16} color="#FFFFFF" />
          <Text style={styles.directionsText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 119, 87, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    lineHeight: 20,
  },
  address: {
    fontFamily: 'Inter-Variable',
    fontSize: 13,
    marginTop: 2,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
  },
  distance: {
    fontFamily: 'Inter-Variable',
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontFamily: 'Inter-Variable',
    fontSize: 12,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97757',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  directionsText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  compactCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    width: 160,
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
  },
  compactName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    textAlign: 'center',
  },
});
