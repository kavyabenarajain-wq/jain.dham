import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { useTempleStore } from '@/stores/templeStore';
import { useAuthStore } from '@/stores/authStore';
import { fetchTempleDetails, getPhotoUrl } from '@/services/placesApi';
import { getTempleEnrichment } from '@/services/templeEnrichment';
import { fetchLiveStreamsForTemple } from '@/services/supabaseDb';
import { AssistanceButton } from '@/components/AssistanceButton';
import type { Temple, TempleEnrichment, LiveStream } from '@/types/temple';

const SAMPRADAYA_COLORS: Record<string, string> = {
  digambar: '#D97757',
  shvetambar: '#6A9BCC',
  sthanakvasi: '#788C5D',
  unknown: '#B0AEA5',
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_HEIGHT = 260;

function EnrichmentSection({
  icon,
  title,
  body,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  colors: { card: string; border: string; text: string; accent: string };
}) {
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color={colors.accent} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.body, { color: colors.text }]}>{body}</Text>
    </View>
  );
}

export default function TempleDetailScreen() {
  const { placeId: rawPlaceId } = useLocalSearchParams<{ placeId: string }>();
  const placeId = decodeURIComponent(rawPlaceId || '');
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { temples, toggleSavedTemple, isTempleSaved, mergeTemples } = useTempleStore();
  const { isAuthenticated } = useAuthStore();

  const initial = temples.find((t) => t.placeId === placeId) ?? null;
  const [temple, setTemple] = useState<Temple | null>(initial);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [enrichment, setEnrichment] = useState<TempleEnrichment | null>(null);
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [streams, setStreams] = useState<LiveStream[]>([]);

  const saved = temple ? isTempleSaved(temple.placeId) : false;

  // Load Google Place Details (phone, website, hours, more photos)
  useEffect(() => {
    if (!temple) return;
    let cancelled = false;
    setDetailsLoading(true);
    fetchTempleDetails(temple.placeId).then((details) => {
      if (cancelled || !details) {
        setDetailsLoading(false);
        return;
      }
      const merged: Temple = { ...temple, ...details };
      setTemple(merged);
      mergeTemples([merged]);
      setDetailsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [temple?.placeId]);

  // Live streams attached to this temple (shantidhara / regular)
  useEffect(() => {
    if (!placeId) return;
    let cancelled = false;
    fetchLiveStreamsForTemple(placeId).then((rows) => {
      if (!cancelled) setStreams(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [placeId]);

  // Load AI idol description (cached in Supabase)
  useEffect(() => {
    if (!temple) return;
    let cancelled = false;
    setEnrichmentLoading(true);
    getTempleEnrichment(temple)
      .then((result) => {
        if (!cancelled) setEnrichment(result);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setEnrichmentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [temple?.placeId]);

  if (!temple) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.muted }}>Temple not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLinkButton}>
          <Text style={{ color: colors.accent }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const photos = temple.photoReferences?.length
    ? temple.photoReferences
    : temple.photoReference
    ? [temple.photoReference]
    : [];

  const openDirections = async () => {
    const { latitude, longitude } = temple.location;
    const app = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
    const web = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    try {
      const canOpenApp = await Linking.canOpenURL(app);
      await Linking.openURL(canOpenApp ? app : web);
    } catch {
      Linking.openURL(web);
    }
  };

  const openWebsite = () => {
    if (temple.website) Linking.openURL(temple.website);
  };

  const openPhone = () => {
    if (temple.phone) Linking.openURL(`tel:${temple.phone.replace(/\s+/g, '')}`);
  };

  const sampradayaColor = SAMPRADAYA_COLORS[temple.sampradaya];
  const sampradayaLabel =
    temple.sampradaya === 'unknown'
      ? 'Jain'
      : temple.sampradaya.charAt(0).toUpperCase() + temple.sampradaya.slice(1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo hero / gallery */}
        <View style={styles.heroWrap}>
          {photos.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setActivePhoto(idx);
              }}
            >
              {photos.map((ref, i) => (
                <Image
                  key={`${ref}-${i}`}
                  source={{ uri: getPhotoUrl(ref, 1200) }}
                  style={styles.heroImage}
                  contentFit="cover"
                  transition={200}
                />
              ))}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.heroImage,
                styles.placeholderHero,
                { backgroundColor: isDark ? '#1F1E1C' : '#EDEBE6' },
              ]}
            >
              <Ionicons name="image-outline" size={48} color={colors.muted} />
              <Text style={{ color: colors.muted, marginTop: 8 }}>No photos available</Text>
            </View>
          )}

          {photos.length > 1 && (
            <View style={styles.dotsRow}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === activePhoto ? '#FFFFFF' : 'rgba(255,255,255,0.4)' },
                  ]}
                />
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + 8 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {isAuthenticated && (
            <TouchableOpacity
              style={[styles.bookmarkButton, { top: insets.top + 8 }]}
              onPress={() => toggleSavedTemple(temple.placeId)}
            >
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={[styles.name, { color: colors.text }]}>{temple.name}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: sampradayaColor + '22' }]}>
              <Text style={[styles.badgeText, { color: sampradayaColor }]}>{sampradayaLabel}</Text>
            </View>
            {temple.rating != null && (
              <View style={styles.inlineRow}>
                <Ionicons name="star" size={14} color="#F5C518" />
                <Text style={[styles.inlineText, { color: colors.muted }]}>
                  {temple.rating.toFixed(1)}
                  {temple.userRatingsTotal ? ` (${temple.userRatingsTotal})` : ''}
                </Text>
              </View>
            )}
            {temple.distance != null && (
              <Text style={[styles.inlineText, { color: colors.muted }]}>
                {temple.distance.toFixed(1)} km
              </Text>
            )}
          </View>
          <Text style={[styles.address, { color: colors.muted }]}>{temple.address}</Text>
        </View>

        {/* Action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryAction} onPress={openDirections}>
            <Ionicons name="navigate" size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Directions</Text>
          </TouchableOpacity>

          {temple.phone && (
            <TouchableOpacity
              style={[styles.secondaryAction, { borderColor: colors.border }]}
              onPress={openPhone}
            >
              <Ionicons name="call-outline" size={18} color={colors.text} />
              <Text style={[styles.secondaryActionText, { color: colors.text }]}>Call</Text>
            </TouchableOpacity>
          )}

          {temple.website && (
            <TouchableOpacity
              style={[styles.secondaryAction, { borderColor: colors.border }]}
              onPress={openWebsite}
            >
              <Ionicons name="globe-outline" size={18} color={colors.text} />
              <Text style={[styles.secondaryActionText, { color: colors.text }]}>Website</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* AI description */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About this temple</Text>
          </View>
          {enrichmentLoading && !enrichment ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator color={colors.accent} />
              <Text style={[styles.muted, { color: colors.muted, marginTop: 8 }]}>
                Gathering information...
              </Text>
            </View>
          ) : enrichment ? (
            <>
              <Text style={[styles.body, { color: colors.text }]}>{enrichment.description}</Text>
              {enrichment.idols.length > 0 && (
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.subheading, { color: colors.text }]}>Idols & murtis</Text>
                  <View style={styles.idolWrap}>
                    {enrichment.idols.map((idol, i) => (
                      <View
                        key={i}
                        style={[styles.idolChip, { backgroundColor: sampradayaColor + '1A' }]}
                      >
                        <Text style={[styles.idolChipText, { color: sampradayaColor }]}>
                          {idol}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              <Text style={[styles.disclaimer, { color: colors.muted }]}>
                AI-generated summary — verify details before visiting.
              </Text>
            </>
          ) : (
            <Text style={[styles.muted, { color: colors.muted }]}>
              No description available for this temple yet.
            </Text>
          )}
        </View>

        {/* Digi-tour sections */}
        {enrichment?.history && (
          <EnrichmentSection
            icon="book-outline"
            title="History"
            body={enrichment.history}
            colors={colors}
          />
        )}
        {enrichment?.significance && (
          <EnrichmentSection
            icon="heart-outline"
            title="Significance"
            body={enrichment.significance}
            colors={colors}
          />
        )}
        {enrichment?.rituals && (
          <EnrichmentSection
            icon="flame-outline"
            title="Rituals & puja"
            body={enrichment.rituals}
            colors={colors}
          />
        )}
        {enrichment?.architecture && (
          <EnrichmentSection
            icon="business-outline"
            title="Architecture"
            body={enrichment.architecture}
            colors={colors}
          />
        )}

        {/* Live Darshan attached to this temple */}
        {streams.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="videocam-outline" size={18} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Darshan</Text>
            </View>
            {streams.map((s) => {
              const isShantidhara = s.kind === 'shantidhara';
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.streamRow,
                    { borderColor: colors.border },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => Linking.openURL(s.streamUrl)}
                >
                  <View
                    style={[
                      styles.streamIconWrap,
                      {
                        backgroundColor: isShantidhara
                          ? colors.accentBlue + '22'
                          : colors.accent + '22',
                      },
                    ]}
                  >
                    <Ionicons
                      name={isShantidhara ? 'water' : 'videocam'}
                      size={20}
                      color={isShantidhara ? colors.accentBlue : colors.accent}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.streamTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {s.title}
                    </Text>
                    <Text style={[styles.streamMeta, { color: colors.muted }]}>
                      {isShantidhara ? 'Shantidhara · Live' : 'Live now'}
                    </Text>
                  </View>
                  <Ionicons name="play-circle" size={26} color={colors.accent} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Assistance */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <AssistanceButton
            variant="inline"
            placeId={temple.placeId}
            templeName={temple.name}
          />
        </View>

        {/* Hours */}
        {temple.timings && (
          <View
            style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={18} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Opening hours</Text>
              {temple.isOpen != null && (
                <View
                  style={[
                    styles.openBadge,
                    { backgroundColor: temple.isOpen ? '#2E7D3220' : '#B7332520' },
                  ]}
                >
                  <Text
                    style={[
                      styles.openBadgeText,
                      { color: temple.isOpen ? '#2E7D32' : '#B73325' },
                    ]}
                  >
                    {temple.isOpen ? 'Open now' : 'Closed'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.body, { color: colors.text }]}>{temple.timings}</Text>
          </View>
        )}

        {detailsLoading && (
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <ActivityIndicator color={colors.accent} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  backLinkButton: { padding: 12 },
  heroWrap: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  placeholderHero: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  backButton: {
    position: 'absolute',
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkButton: {
    position: 'absolute',
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  name: {
    fontFamily: 'Geist_700Bold',
    fontSize: 22,
    lineHeight: 28,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 11,
  },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inlineText: { fontFamily: 'Inter-Variable', fontSize: 13 },
  address: {
    fontFamily: 'Inter-Variable',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryAction: {
    flexDirection: 'row',
    backgroundColor: '#D97757',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    alignItems: 'center',
    gap: 6,
  },
  primaryActionText: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  secondaryAction: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  secondaryActionText: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 13,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 15,
    flex: 1,
  },
  body: {
    fontFamily: 'Inter-Variable',
    fontSize: 14,
    lineHeight: 21,
  },
  subheading: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 13,
    marginBottom: 8,
  },
  idolWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  idolChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  idolChipText: {
    fontFamily: 'Inter-Variable',
    fontSize: 12,
  },
  disclaimer: {
    fontFamily: 'Inter-Variable',
    fontSize: 11,
    marginTop: 12,
    fontStyle: 'italic',
  },
  muted: {
    fontFamily: 'Inter-Variable',
    fontSize: 13,
  },
  openBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  openBadgeText: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 11,
  },
  streamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  streamIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamTitle: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 14,
  },
  streamMeta: {
    fontFamily: 'Inter-Variable',
    fontSize: 12,
    marginTop: 2,
  },
});
