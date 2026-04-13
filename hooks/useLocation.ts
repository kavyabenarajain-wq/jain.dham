import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { DEFAULT_LOCATION } from '@/constants/config';

interface LocationState {
  latitude: number;
  longitude: number;
  loading: boolean;
  permissionGranted: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    loading: true,
    permissionGranted: false,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    async function getLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (mounted) {
            setState((prev) => ({
              ...prev,
              loading: false,
              permissionGranted: false,
              error: 'Location permission denied',
            }));
          }
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (mounted) {
          setState({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            loading: false,
            permissionGranted: true,
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: 'Failed to get location',
          }));
        }
      }
    }

    getLocation();

    return () => {
      mounted = false;
    };
  }, []);

  const refresh = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setState({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        loading: false,
        permissionGranted: true,
        error: null,
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return { ...state, refresh };
}
