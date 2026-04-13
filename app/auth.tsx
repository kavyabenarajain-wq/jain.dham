import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/context/ThemeContext';

export default function AuthScreen() {
  const { signInWithGoogle, continueAsGuest, isAuthenticated } = useAuthStore();
  const { colors } = useTheme();
  const [signingIn, setSigningIn] = useState(false);

  // If auth state changes (e.g. after OAuth callback), navigate to tabs
  if (isAuthenticated) {
    router.replace('/(tabs)');
    return null;
  }

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
      // Navigation happens via the auth state listener or the check above
    } catch {
      setSigningIn(false);
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
        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
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
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
  },
  middleSection: {
    marginBottom: 48,
  },
  heading: {
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  guestButton: {
    marginTop: 20,
    paddingVertical: 12,
  },
  guestButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#6A9BCC',
  },
  terms: {
    fontFamily: 'Inter-Variable',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});
