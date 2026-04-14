import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/hooks/useThemeColors';
import { useLocation } from '@/hooks/useLocation';
import { useZoneStore } from '@/stores/zoneStore';
import { useAuthStore } from '@/stores/authStore';
import { logAssistanceRequest } from '@/services/supabaseDb';

interface AssistanceButtonProps {
  /** Optional: anchor the request to a specific temple. */
  placeId?: string;
  templeName?: string;
  /** Layout style — floating FAB (default) or an inline row. */
  variant?: 'fab' | 'inline';
  /** Only used when variant === 'fab'. */
  bottom?: number;
  /** Which side of the screen to pin the FAB to. Defaults to 'right'. */
  side?: 'left' | 'right';
}

function cleanWhatsAppNumber(raw: string): string {
  return raw.replace(/[^\d]/g, '');
}

export function AssistanceButton({
  placeId,
  templeName,
  variant = 'fab',
  bottom = 120,
  side = 'right',
}: AssistanceButtonProps) {
  const colors = useThemeColors();
  const { latitude, longitude } = useLocation();
  const user = useAuthStore((s) => s.user);
  const { zones, loadAll, findZoneForLocation, fetchHeadForZone } = useZoneStore();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleTap = () => {
    Haptics.selectionAsync();
    setMessage(
      templeName
        ? `Namaste 🙏 I need assistance at ${templeName}.`
        : 'Namaste 🙏 I need assistance.'
    );
    setOpen(true);
  };

  const handleSend = async () => {
    if (sending) return;
    setSending(true);

    try {
      if (zones.length === 0) {
        Alert.alert(
          'Assistance unavailable',
          'No zone coverage is configured yet. Please try again later.'
        );
        return;
      }

      const zone = findZoneForLocation(latitude, longitude);
      if (!zone) {
        Alert.alert('Assistance unavailable', 'Could not locate your zone.');
        return;
      }

      const head = await fetchHeadForZone(zone.id);
      if (!head) {
        Alert.alert(
          'No zone head assigned',
          `Zone "${zone.name}" does not have an active zone head yet.`
        );
        return;
      }

      const phone = cleanWhatsAppNumber(head.whatsappNumber);
      if (!phone) {
        Alert.alert('Invalid number', 'Zone head WhatsApp number is misconfigured.');
        return;
      }

      const fullMessage = [
        message.trim() || 'I need assistance.',
        '',
        `— Zone: ${zone.name}`,
        templeName ? `— Temple: ${templeName}` : null,
        `— Location: https://maps.google.com/?q=${latitude},${longitude}`,
      ]
        .filter(Boolean)
        .join('\n');

      const encoded = encodeURIComponent(fullMessage);
      const appUrl = `whatsapp://send?phone=${phone}&text=${encoded}`;
      const webUrl = `https://wa.me/${phone}?text=${encoded}`;

      // Log first (fire-and-forget) so the audit row exists even if the user
      // backgrounds the app on the WhatsApp handoff.
      logAssistanceRequest({
        userId: user?.uid ?? null,
        zoneId: zone.id,
        zoneHeadId: head.id,
        message: fullMessage,
        userLat: latitude,
        userLng: longitude,
        placeId: placeId ?? null,
      }).catch(() => {});

      const canOpenApp = await Linking.canOpenURL(appUrl);
      await Linking.openURL(canOpenApp ? appUrl : webUrl);
      setOpen(false);
    } catch (err) {
      console.warn('[Assistance] send failed', err);
      Alert.alert('Could not send', 'Please try again in a moment.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {variant === 'fab' ? (
        <TouchableOpacity
          style={[
            styles.fab,
            side === 'left' ? { left: 16 } : { right: 16 },
            { bottom, backgroundColor: colors.accent },
          ]}
          onPress={handleTap}
          activeOpacity={0.85}
          accessibilityLabel="Get assistance"
        >
          <Ionicons name="help-buoy" size={22} color="#FFFFFF" />
          <Text style={styles.fabLabel}>Assist</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.inline, { backgroundColor: colors.accent }]}
          onPress={handleTap}
          activeOpacity={0.85}
        >
          <Ionicons name="help-buoy" size={18} color="#FFFFFF" />
          <Text style={styles.inlineLabel}>Need assistance</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="help-buoy" size={22} color={colors.accent} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Need assistance?</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
              Your message will be sent on WhatsApp to the zone head for your area, along with
              your location so they can reach you quickly.
            </Text>

            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your query..."
              placeholderTextColor={colors.muted}
            />

            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.accent, opacity: sending ? 0.7 : 1 }]}
              onPress={handleSend}
              disabled={sending}
              activeOpacity={0.85}
            >
              {sending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                  <Text style={styles.sendLabel}>Send via WhatsApp</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 20,
  },
  fabLabel: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  inlineLabel: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 17,
    flex: 1,
  },
  modalBody: {
    fontFamily: 'Inter-Variable',
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    fontFamily: 'Inter-Variable',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  sendLabel: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
