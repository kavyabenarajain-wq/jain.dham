import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { SPLASH_DURATION } from '@/constants/config';
import { useAuthStore } from '@/stores/authStore';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { isAuthenticated, isGuest } = useAuthStore();

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Request location permission during splash (before app loads)
    Location.requestForegroundPermissionsAsync().catch(() => {});

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        if (isAuthenticated || isGuest) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth');
        }
      });
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="diamond" size={80} color="#D97757" />
        </View>
        <Text style={styles.title}>Jain Dham</Text>
        <Text style={styles.subtitle}>जय जिनेंद्र — Your Spiritual Companion</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141413',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(217, 119, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    color: '#FAF9F5',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#B0AEA5',
    textAlign: 'center',
  },
});
