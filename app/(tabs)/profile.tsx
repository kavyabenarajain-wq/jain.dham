import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTempleStore } from '@/stores/templeStore';
import { UserCard } from '@/components/UserCard';
import { SettingsRow } from '@/components/SettingsRow';
import { TempleCard } from '@/components/TempleCard';

const APPEARANCE_OPTIONS = ['Light', 'Dark', 'System'] as const;
const SAMPRADAYA_OPTIONS = ['All', 'Digambar', 'Shvetambar', 'Sthanakvasi'] as const;

export default function ProfileScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, signOut, signInWithGoogle } = useAuthStore();
  const {
    appearance,
    sampradaya,
    notificationsEnabled,
    setAppearance,
    setSampradaya,
    toggleNotifications,
  } = useSettingsStore();
  const { temples, savedTempleIds } = useTempleStore();
  const [showAbout, setShowAbout] = useState(false);

  const savedTemples = temples.filter((t) => savedTempleIds.includes(t.placeId));

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all saved data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const cycleAppearance = () => {
    const idx = APPEARANCE_OPTIONS.findIndex(
      (o) => o.toLowerCase() === appearance
    );
    const next = APPEARANCE_OPTIONS[(idx + 1) % APPEARANCE_OPTIONS.length];
    setAppearance(next.toLowerCase() as 'light' | 'dark' | 'system');
  };

  const cycleSampradaya = () => {
    const idx = SAMPRADAYA_OPTIONS.findIndex(
      (o) => o.toLowerCase() === sampradaya
    );
    const next = SAMPRADAYA_OPTIONS[(idx + 1) % SAMPRADAYA_OPTIONS.length];
    setSampradaya(next.toLowerCase() as any);
  };

  const handleSignIn = async () => {
    await signInWithGoogle();
    router.replace('/(tabs)/profile');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top }}
    >
      {/* Header */}
      <Text style={[styles.screenTitle, { color: colors.text }]}>Profile</Text>

      {/* User Card */}
      <UserCard onSignIn={handleSignIn} />

      {/* Saved Temples */}
      {isAuthenticated && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Saved Temples
          </Text>
          {savedTemples.length > 0 ? (
            <FlatList
              data={savedTemples}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.placeId}
              renderItem={({ item }) => <TempleCard temple={item} compact />}
              contentContainerStyle={styles.savedList}
              scrollEnabled
            />
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="map-outline" size={32} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                No saved temples yet — explore the map!
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsRow
            icon="color-palette-outline"
            label="Appearance"
            value={appearance.charAt(0).toUpperCase() + appearance.slice(1)}
            onPress={cycleAppearance}
          />
          <SettingsRow
            icon="diamond-outline"
            label="Sampradaya Preference"
            value={sampradaya.charAt(0).toUpperCase() + sampradaya.slice(1)}
            onPress={cycleSampradaya}
          />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            isSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={toggleNotifications}
          />
          <SettingsRow
            icon="language-outline"
            label="Language"
            value="English"
            onPress={() => {}}
          />
          <SettingsRow
            icon="information-circle-outline"
            label="About Jain Dham"
            onPress={() => setShowAbout(true)}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => {}}
          />
        </View>
      </View>

      {/* Sign Out / Delete Account */}
      <View style={styles.section}>
        <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsRow
            icon="log-out-outline"
            label={isAuthenticated ? 'Sign Out' : 'Exit Guest Mode'}
            destructive
            onPress={handleSignOut}
          />
          {isAuthenticated && (
            <SettingsRow
              icon="trash-outline"
              label="Delete Account"
              destructive
              onPress={handleDeleteAccount}
            />
          )}
        </View>
      </View>

      {/* About Modal */}
      <Modal visible={showAbout} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowAbout(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={[styles.aboutIcon, { backgroundColor: colors.accent + '15' }]}>
              <Ionicons name="diamond" size={40} color={colors.accent} />
            </View>
            <Text style={[styles.aboutTitle, { color: colors.text }]}>Jain Dham</Text>
            <Text style={[styles.aboutVersion, { color: colors.muted }]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.aboutMission, { color: colors.textSecondary }]}>
              A spiritual companion for the global Jain community. Discover temples,
              connect with your faith, and explore the teachings of the Tirthankars.
            </Text>
            <Text style={[styles.aboutFooter, { color: colors.accent }]}>
              Jai Jinendra
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 12,
  },
  savedList: {
    paddingRight: 16,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  emptyText: {
    fontFamily: 'Inter-Variable',
    fontSize: 14,
    textAlign: 'center',
  },
  settingsCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  modalClose: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  aboutIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  aboutTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
  },
  aboutVersion: {
    fontFamily: 'Inter-Variable',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  aboutMission: {
    fontFamily: 'Inter-Variable',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  aboutFooter: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
});
