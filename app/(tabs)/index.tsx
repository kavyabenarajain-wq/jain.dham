import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '@/context/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { useTempleStore } from '@/stores/templeStore';
import {
  searchNearbyTemples,
  searchTemplesByText,
  searchTemplesInViewport,
  calculateDistance,
} from '@/services/placesApi';
import { lightMapStyle, darkMapStyle } from '@/constants/mapStyle';
import { SAMPRADAYA_OPTIONS } from '@/constants/config';
import { TempleCard } from '@/components/TempleCard';
import { TempleMarker } from '@/components/TempleMarker';
import { SuggestedChips } from '@/components/SuggestedChips';
import { AssistanceButton } from '@/components/AssistanceButton';

const VIEWPORT_REFETCH_KM = 20;
// Skip auto-refetch when zoomed out beyond this — too many tiles would be needed.
const COUNTRY_ZOOM_THRESHOLD = 12;
const INDIA_REGION: Region = {
  latitude: 22.5937,
  longitude: 80.9629,
  latitudeDelta: 28,
  longitudeDelta: 28,
};

export default function MapScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { latitude, longitude, loading: locationLoading } = useLocation();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const lastFetchCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const refetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    temples,
    selectedTemple,
    activeFilter,
    isLoading,
    setTemples,
    mergeTemples,
    selectTemple,
    setFilter,
    setLoading,
    getFilteredTemples,
  } = useTempleStore();

  const [searchQuery, setSearchQuery] = useState('');
  const filteredTemples = getFilteredTemples();

  const fetchNearMe = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      const results = await searchNearbyTemples(lat, lng);
      const withDistance = results.map((t) => ({
        ...t,
        distance: calculateDistance(lat, lng, t.location.latitude, t.location.longitude),
      }));
      withDistance.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      setTemples(withDistance);
      lastFetchCenterRef.current = { lat, lng };
      setLoading(false);
    },
    [setTemples, setLoading]
  );

  const fetchViewport = useCallback(
    async (region: Region) => {
      setLoading(true);
      const bounds = {
        north: region.latitude + region.latitudeDelta / 2,
        south: region.latitude - region.latitudeDelta / 2,
        east: region.longitude + region.longitudeDelta / 2,
        west: region.longitude - region.longitudeDelta / 2,
      };
      const results = await searchTemplesInViewport(bounds);
      const withDistance = results.map((t) => ({
        ...t,
        distance: calculateDistance(latitude, longitude, t.location.latitude, t.location.longitude),
      }));
      mergeTemples(withDistance);
      lastFetchCenterRef.current = { lat: region.latitude, lng: region.longitude };
      setLoading(false);
    },
    [mergeTemples, setLoading, latitude, longitude]
  );

  useEffect(() => {
    if (!locationLoading) {
      fetchNearMe(latitude, longitude);
    }
  }, [locationLoading, latitude, longitude]);

  const onRegionChangeComplete = (region: Region) => {
    // Don't auto-refetch at country zoom — the viewport would require too many tiles.
    if (region.latitudeDelta > COUNTRY_ZOOM_THRESHOLD) return;

    const last = lastFetchCenterRef.current;
    if (last) {
      const moved = calculateDistance(last.lat, last.lng, region.latitude, region.longitude);
      if (moved < VIEWPORT_REFETCH_KM) return;
    }

    // Debounce so we don't fire mid-pan.
    if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
    refetchTimerRef.current = setTimeout(() => {
      fetchViewport(region);
    }, 600);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    const results = await searchTemplesByText(searchQuery);
    if (results.length > 0) {
      const first = results[0];
      setTemples(
        results.map((t) => ({
          ...t,
          distance: calculateDistance(
            first.location.latitude,
            first.location.longitude,
            t.location.latitude,
            t.location.longitude
          ),
        }))
      );
      mapRef.current?.animateToRegion(
        {
          latitude: first.location.latitude,
          longitude: first.location.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        800
      );
      lastFetchCenterRef.current = {
        lat: first.location.latitude,
        lng: first.location.longitude,
      };
    }
    setLoading(false);
  };

  const handleNearMe = () => {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      800
    );
    fetchNearMe(latitude, longitude);
  };

  const handleShowIndia = () => {
    mapRef.current?.animateToRegion(INDIA_REGION, 800);
    // At country zoom we rely on seed data already loaded; don't fire viewport fetch.
  };

  const openTempleDetail = (placeId: string) => {
    router.push(`/temple/${encodeURIComponent(placeId)}` as any);
  };

  const handleMarkerPress = (temple: typeof temples[0]) => {
    selectTemple(temple);
    openTempleDetail(temple.placeId);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={isDark ? darkMapStyle : lightMapStyle}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {filteredTemples.map((temple) => (
          <Marker
            key={temple.placeId}
            coordinate={temple.location}
            onPress={() => handleMarkerPress(temple)}
          >
            <TempleMarker
              sampradaya={temple.sampradaya}
              selected={selectedTemple?.placeId === temple.placeId}
            />
          </Marker>
        ))}
      </MapView>

      {/* Search bar */}
      <View style={[styles.searchContainer, { top: insets.top + 12 }]}>
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
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.chipRow}>
          <SuggestedChips
            chips={[...SAMPRADAYA_OPTIONS]}
            activeChip={activeFilter}
            onPress={setFilter}
          />
        </View>
      </View>

      <View style={[styles.fabColumn, { bottom: 320 }]}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/live-darshan')}
          activeOpacity={0.8}
          accessibilityLabel="Live Darshan"
        >
          <Ionicons name="videocam-outline" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleShowIndia}
          activeOpacity={0.8}
        >
          <Ionicons name="globe-outline" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nearMeButton}
          onPress={handleNearMe}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <AssistanceButton bottom={320} side="left" />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={['12%', '45%', '85%']}
        backgroundStyle={{
          backgroundColor: colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        handleIndicatorStyle={{ backgroundColor: colors.muted }}
      >
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>
            {filteredTemples.length} temple{filteredTemples.length !== 1 ? 's' : ''} visible
          </Text>
        </View>
        <BottomSheetFlatList
          data={filteredTemples}
          keyExtractor={(item) => item.placeId}
          renderItem={({ item }) => (
            <TempleCard
              temple={item}
              onPress={() => {
                selectTemple(item);
                openTempleDetail(item.placeId);
              }}
            />
          )}
          contentContainerStyle={styles.sheetList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {isLoading ? 'Searching for temples...' : 'No temples found in this area'}
              </Text>
            </View>
          }
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Variable',
    fontSize: 15,
    paddingVertical: 2,
  },
  chipRow: { marginTop: 10 },
  fabColumn: {
    position: 'absolute',
    right: 16,
    gap: 10,
    zIndex: 10,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nearMeButton: {
    backgroundColor: '#D97757',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    zIndex: 15,
  },
  sheetHeader: { paddingHorizontal: 20, paddingBottom: 12 },
  sheetTitle: { fontFamily: 'Geist_600SemiBold', fontSize: 16 },
  sheetList: { paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyText: {
    fontFamily: 'Inter-Variable',
    fontSize: 15,
    textAlign: 'center',
  },
});
