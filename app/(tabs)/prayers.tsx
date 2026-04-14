import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { PRAYERS } from '@/constants/prayers';
import { SuggestedChips } from '@/components/SuggestedChips';
import type { Prayer, PrayerSect } from '@/types/prayer';

const FILTER_OPTIONS = ['All', 'Shvetambar', 'Digambar'] as const;
type Filter = typeof FILTER_OPTIONS[number];

const SECT_COLORS: Record<PrayerSect, string> = {
  both: '#788C5D',
  shvetambar: '#6A9BCC',
  digambar: '#D97757',
};

const SECT_LABELS: Record<PrayerSect, string> = {
  both: 'Universal',
  shvetambar: 'Shvetambar',
  digambar: 'Digambar',
};

export default function PrayersScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('All');
  const [selected, setSelected] = useState<Prayer | null>(null);
  const [tab, setTab] = useState<'devanagari' | 'transliteration' | 'meaning'>('transliteration');

  const filteredPrayers = useMemo(() => {
    if (filter === 'All') return PRAYERS;
    const target = filter.toLowerCase() as PrayerSect;
    return PRAYERS.filter((p) => p.sect === target || p.sect === 'both');
  }, [filter]);

  const openYouTube = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Prayers</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Sacred stotras, sutras, and mantras from Jinvani
        </Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        <SuggestedChips
          chips={[...FILTER_OPTIONS]}
          activeChip={filter}
          onPress={(c) => setFilter(c as Filter)}
        />
      </View>

      {/* Prayer list */}
      <FlatList
        data={filteredPrayers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => {
              setSelected(item);
              setTab('transliteration');
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, { backgroundColor: SECT_COLORS[item.sect] + '20' }]}>
              <Ionicons name="diamond" size={20} color={SECT_COLORS[item.sect]} />
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              {item.nameDevanagari && (
                <Text style={[styles.cardDevanagari, { color: colors.textSecondary }]}>
                  {item.nameDevanagari}
                </Text>
              )}
              <Text style={[styles.cardDesc, { color: colors.muted }]} numberOfLines={2}>
                {item.shortDescription}
              </Text>
              <View style={styles.cardBadges}>
                <View
                  style={[
                    styles.sectBadge,
                    { backgroundColor: SECT_COLORS[item.sect] + '20' },
                  ]}
                >
                  <Text style={[styles.sectBadgeText, { color: SECT_COLORS[item.sect] }]}>
                    {SECT_LABELS[item.sect]}
                  </Text>
                </View>
                <View style={[styles.categoryBadge, { borderColor: colors.border }]}>
                  <Text style={[styles.categoryText, { color: colors.muted }]}>
                    {item.category}
                  </Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>
        )}
      />

      {/* Detail Modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            {/* Modal header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeButton}>
                <Ionicons name="close" size={26} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                  {selected.name}
                </Text>
                {selected.nameDevanagari && (
                  <Text style={[styles.modalDevanagari, { color: colors.textSecondary }]}>
                    {selected.nameDevanagari}
                  </Text>
                )}
              </View>
              <View style={{ width: 26 }} />
            </View>

            {/* YouTube button */}
            <View style={styles.modalYoutubeRow}>
              <TouchableOpacity
                style={styles.youtubeButton}
                onPress={() => openYouTube(selected.youtubeSearchUrl)}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-youtube" size={22} color="#FFFFFF" />
                <Text style={styles.youtubeButtonText}>Watch on YouTube</Text>
              </TouchableOpacity>
            </View>

            {/* Tab switcher: Devanagari / Transliteration / Meaning */}
            <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
              {(['devanagari', 'transliteration', 'meaning'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.tab,
                    tab === t && { borderBottomColor: colors.accent },
                  ]}
                  onPress={() => setTab(t)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: tab === t ? colors.accent : colors.muted },
                    ]}
                  >
                    {t === 'devanagari' ? 'देवनागरी' : t === 'transliteration' ? 'Roman' : 'Meaning'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text
                style={[
                  styles.contentText,
                  {
                    color: colors.text,
                    fontFamily: tab === 'devanagari' ? undefined : 'Inter-Variable',
                    fontSize: tab === 'meaning' ? 15 : 17,
                    lineHeight: tab === 'meaning' ? 24 : 28,
                  },
                ]}
              >
                {tab === 'devanagari'
                  ? selected.textDevanagari
                  : tab === 'transliteration'
                  ? selected.transliteration
                  : selected.meaning}
              </Text>

              <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.modalFooterText, { color: colors.muted }]}>
                  Tradition: {SECT_LABELS[selected.sect]}  ·  {selected.category}
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'Geist_700Bold',
    fontSize: 28,
  },
  subtitle: {
    fontFamily: 'Inter-Variable',
    fontSize: 13,
    marginTop: 4,
  },
  filterRow: { paddingVertical: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 15,
  },
  cardDevanagari: {
    fontSize: 13,
    marginTop: 1,
  },
  cardDesc: {
    fontFamily: 'Inter-Variable',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  sectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sectBadgeText: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: 'Inter-Variable',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: { padding: 4 },
  modalHeaderText: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  modalTitle: {
    fontFamily: 'Geist_700Bold',
    fontSize: 17,
  },
  modalDevanagari: {
    fontSize: 14,
    marginTop: 1,
  },
  modalYoutubeRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  youtubeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    gap: 8,
  },
  youtubeButtonText: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 13,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 60,
  },
  contentText: {
    textAlign: 'left',
  },
  modalFooter: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  modalFooterText: {
    fontFamily: 'Inter-Variable',
    fontSize: 12,
  },
});
