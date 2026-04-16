import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/context/ThemeContext';

export default function AuthScreen() {
  const { signInWithGoogle, signInWithApple, continueAsGuest, isAuthenticated } = useAuthStore();
  const { colors, isDark } = useTheme();
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    router.replace('/(tabs)');
    return null;
  }

  const handleGoogle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      Alert.alert('Sign-in failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleApple = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signInWithApple();
    } catch (e: any) {
      Alert.alert('Sign-in failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="diamond" size={48} color="#D97757" />
        </View>
        <Text style={[styles.appName, { color: colors.text }]}>Jain Dham</Text>
      </View>

      <View style={styles.middleSection}>
        <Text style={[styles.heading, { color: colors.text }]}>Welcome</Text>
        <Text style={[styles.subtext, { color: colors.muted }]}>
          Sign in to save temples, follow maharajis, and personalise your experience.
        </Text>
      </View>

      <View style={styles.bottomSection}>
        {Platform.OS === 'ios' && AppleAuthentication.isAvailableAsync && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={
              isDark
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={12}
            style={styles.appleButton}
            onPress={handleApple}
          />
        )}

        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleGoogle}
          activeOpacity={0.8}
          disabled={busy}
        >
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text style={[styles.googleButtonText, { color: colors.text }]}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGuest} style={styles.guestButton}>
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>

        <Text style={[styles.terms, { color: colors.muted }]}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(217, 119, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontFamily: 'Geist_700Bold',
    fontSize: 24,
  },
  middleSection: {
    marginBottom: 48,
  },
  heading: {
    fontFamily: 'Geist_700Bold',
    fontSize: 28,
    marginBottom: 12,
  },
  subtext: {
    fontFamily: 'Inter-Variable',
    fontSize: 15,
    lineHeight: 22,
  },
  bottomSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 60,
    gap: 12,
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    gap: 12,
  },
  googleButtonText: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 16,
  },
  guestButton: {
    marginTop: 8,
    paddingVertical: 12,
  },
  guestButtonText: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 15,
    color: '#6A9BCC',
  },
  terms: {
    fontFamily: 'Inter-Variable',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
