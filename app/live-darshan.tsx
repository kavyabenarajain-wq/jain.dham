import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
  RefreshControl,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { useLiveStreamStore } from '@/stores/liveStreamStore';
import type { LiveStream } from '@/types/temple';

type FilterKind = 'all' | 'shantidhara' | 'regular';

const FILTERS: { key: FilterKind; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'all', label: 'All', icon: 'apps-outline' },
  { key: 'shantidhara', label: 'Shantidhara', icon: 'water' },
  { key: 'regular', label: 'Partner Temples', icon: 'videocam-outline' },
];

export default function LiveDarshanScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { streams, isLoading, loadAll } = useLiveStreamStore();
  const [filter, setFilter] = useState<FilterKind>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const visible = useMemo(() => {
    if (filter === 'all') return streams;
    return streams.filter((s) => s.kind === filter);
  }, [streams, filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Bypass cache by resetting timestamp.
    useLiveStreamStore.setState({ lastLoadedAt: null });
    await loadAll();
    setRefreshing(false);
  };

  const openStream = async (stream: LiveStream) => {
    try {
      await Linking.openURL(stream.streamUrl);
    } catch {
      Alert.alert('Cannot open stream', 'Please check your internet connection and try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Live Darshan</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Real-time streams from temples
          </Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? colors.accent : colors.card,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.85}
            >
              <Ionicons
                name={f.icon}
                size={14}
                color={active ? '#FFFFFF' : colors.muted}
              />
              <Text
                style={[
                  styles.filterLabel,
                  { color: active ? '#FFFFFF' : colors.text },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.9}
            onPress={() => openStream(item)}
          >
            <View style={styles.thumbWrap}>
              {item.thumbnail ? (
                <Image
                  source={{ uri: item.thumbnail }}
                  style={styles.thumb}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.thumb,
                    {
                      backgroundColor:
                        item.kind === 'shantidhara'
                          ? colors.accentBlue + '33'
                          : colors.accent + '33',
                    },
                  ]}
                >
                  <Ionicons
                    name={item.kind === 'shantidhara' ? 'water' : 'videocam'}
                    size={44}
                    color={item.kind === 'shantidhara' ? colors.accentBlue : colors.accent}
                  />
                </View>
              )}
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
              {item.kind === 'shantidhara' && (
                <View style={[styles.kindBadge, { backgroundColor: colors.accentBlue }]}>
                  <Ionicons name="water" size={10} color="#FFFFFF" />
                  <Text style={styles.kindBadgeText}>Shantidhara</Text>
                </View>
              )}
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.cardTemple, { color: colors.muted }]} numberOfLines={1}>
                {item.templeName}
              </Text>
              {item.description ? (
                <Text
                  style={[styles.cardDescription, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="videocam-off-outline" size={44} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No live streams right now
              </Text>
              <Text style={[styles.emptyBody, { color: colors.muted }]}>
                {filter === 'shantidhara'
                  ? 'Shantidhara streams from our associated temples will appear here when live.'
                  : 'Pull to refresh, or check back during darshan timings.'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Geist_700Bold',
    fontSize: 22,
  },
  subtitle: {
    fontFamily: 'Inter-Variable',
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  filterLabel: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  thumbWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(217, 68, 68, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Geist_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
  },
  kindBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  kindBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Geist_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 14,
  },
  cardTitle: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
  },
  cardTemple: {
    fontFamily: 'Inter-Variable',
    fontSize: 13,
    marginTop: 4,
  },
  cardDescription: {
    fontFamily: 'Inter-Variable',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 16,
  },
  emptyBody: {
    fontFamily: 'Inter-Variable',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
