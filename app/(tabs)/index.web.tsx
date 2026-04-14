import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { useTempleStore } from '@/stores/templeStore';
import { searchNearbyTemples, searchTemplesByText, calculateDistance } from '@/services/placesApi';
import { SAMPRADAYA_OPTIONS } from '@/constants/config';
import { TempleCard } from '@/components/TempleCard';
import { SuggestedChips } from '@/components/SuggestedChips';

export default function MapScreenWeb() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { latitude, longitude, loading: locationLoading } = useLocation();

  const {
    activeFilter,
    isLoading,
    setTemples,
    setFilter,
    setLoading,
    getFilteredTemples,
  } = useTempleStore();

  const [searchQuery, setSearchQuery] = useState('');
  const filteredTemples = getFilteredTemples();

  const fetchTemples = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      const results = await searchNearbyTemples(lat, lng);
      const withDistance = results.map((t) => ({
        ...t,
        distance: calculateDistance(lat, lng, t.location.latitude, t.location.longitude),
      }));
      withDistance.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      setTemples(withDistance);
      setLoading(false);
    },
    [setTemples, setLoading]
  );

  useEffect(() => {
    if (!locationLoading) {
      fetchTemples(latitude, longitude);
    }
  }, [locationLoading, latitude, longitude]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    const results = await searchTemplesByText(searchQuery);
    setTemples(
      results.map((t) => ({
        ...t,
        distance: calculateDistance(latitude, longitude, t.location.latitude, t.location.longitude),
      }))
    );
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>Temples</Text>
        <Text style={[styles.subtext, { color: colors.muted }]}>
          Map view available on iOS & Android. Browse the list below.
        </Text>
      </View>

      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search temples, cities..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      <View style={styles.chipRow}>
        <SuggestedChips
          chips={[...SAMPRADAYA_OPTIONS]}
          activeChip={activeFilter}
          onPress={setFilter}
        />
      </View>

      <Text style={[styles.count, { color: colors.text }]}>
        {filteredTemples.length} temple{filteredTemples.length !== 1 ? 's' : ''} nearby
      </Text>

      <FlatList
        data={filteredTemples}
        keyExtractor={(item) => item.placeId}
        renderItem={({ item }) => <TempleCard temple={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.accent} />
            ) : (
              <>
                <Ionicons name="search-outline" size={48} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  No temples found in this area
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  heading: { fontFamily: 'Geist_700Bold', fontSize: 28 },
  subtext: { fontFamily: 'Inter-Variable', fontSize: 13, marginTop: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontFamily: 'Inter-Variable', fontSize: 15 },
  chipRow: { marginTop: 12 },
  count: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 15,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  list: { paddingBottom: 40 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: 'Inter-Variable', fontSize: 15, textAlign: 'center' },
});
