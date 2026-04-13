import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/stores/authStore';

interface UserCardProps {
  onSignIn?: () => void;
}

export function UserCard({ onSignIn }: UserCardProps) {
  const colors = useThemeColors();
  const { user, isGuest, isAuthenticated } = useAuthStore();

  if (isGuest || !isAuthenticated) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accent + '15' }]}>
          <Ionicons name="diamond" size={32} color={colors.accent} />
        </View>
        <Text style={[styles.guestName, { color: colors.text }]}>Guest User</Text>
        <Text style={[styles.guestSubtext, { color: colors.muted }]}>
          Sign in to unlock full features
        </Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={onSignIn}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-google" size={18} color="#FFFFFF" />
          <Text style={styles.signInText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {user?.photoURL ? (
        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accent + '15' }]}>
          <Ionicons name="person" size={32} color={colors.accent} />
        </View>
      )}
      <Text style={[styles.name, { color: colors.text }]}>
        {user?.displayName || 'Jain Devotee'}
      </Text>
      <Text style={[styles.email, { color: colors.muted }]}>{user?.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  email: {
    fontFamily: 'Inter-Variable',
    fontSize: 14,
    marginTop: 4,
  },
  guestName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  guestSubtext: {
    fontFamily: 'Inter-Variable',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97757',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  signInText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
