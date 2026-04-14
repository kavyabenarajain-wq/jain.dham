import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/stores/authStore';
import {
  isUserAdmin,
  fetchAllZones,
  fetchAllZoneHeads,
  createZone,
  deleteZone,
  upsertZoneHead,
  deleteZoneHead,
} from '@/services/supabaseDb';
import type { Zone, ZoneHead } from '@/types/temple';

type AuthState = 'checking' | 'unauthorized' | 'ok';

export default function AdminZonesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const [authState, setAuthState] = useState<AuthState>('checking');
  const [zones, setZones] = useState<Zone[]>([]);
  const [heads, setHeads] = useState<ZoneHead[]>([]);

  // Zone form state
  const [zName, setZName] = useState('');
  const [zCity, setZCity] = useState('');
  const [zState, setZState] = useState('');
  const [zLat, setZLat] = useState('');
  const [zLng, setZLng] = useState('');
  const [zRadius, setZRadius] = useState('25');
  const [savingZone, setSavingZone] = useState(false);

  // Head form state (per zone)
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [hName, setHName] = useState('');
  const [hPhone, setHPhone] = useState('');
  const [hEmail, setHEmail] = useState('');
  const [savingHead, setSavingHead] = useState(false);

  useEffect(() => {
    if (!user) {
      setAuthState('unauthorized');
      return;
    }
    isUserAdmin(user.uid).then((ok) => {
      setAuthState(ok ? 'ok' : 'unauthorized');
      if (ok) refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  async function refresh() {
    const [zs, hs] = await Promise.all([fetchAllZones(), fetchAllZoneHeads()]);
    setZones(zs);
    setHeads(hs);
  }

  async function handleCreateZone() {
    const lat = Number(zLat);
    const lng = Number(zLng);
    const radius = Number(zRadius);
    if (!zName.trim() || Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radius)) {
      Alert.alert('Missing fields', 'Name, latitude, longitude and radius (km) are required.');
      return;
    }
    setSavingZone(true);
    const zone = await createZone({
      name: zName.trim(),
      city: zCity.trim() || null,
      state: zState.trim() || null,
      centerLat: lat,
      centerLng: lng,
      radiusKm: radius,
    });
    setSavingZone(false);
    if (!zone) {
      Alert.alert('Could not create zone', 'Check the console for the Supabase error.');
      return;
    }
    setZName('');
    setZCity('');
    setZState('');
    setZLat('');
    setZLng('');
    setZRadius('25');
    refresh();
  }

  async function handleDeleteZone(zone: Zone) {
    Alert.alert('Delete zone?', `Remove "${zone.name}" and all its zone heads.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteZone(zone.id);
          refresh();
        },
      },
    ]);
  }

  function startAddHead(zone: Zone) {
    setEditingZoneId(zone.id);
    setHName('');
    setHPhone('');
    setHEmail('');
  }

  async function handleSaveHead(zoneId: string) {
    if (!hName.trim() || !hPhone.trim()) {
      Alert.alert('Missing fields', 'Name and WhatsApp number are required.');
      return;
    }
    setSavingHead(true);
    const digits = hPhone.replace(/[^\d]/g, '');
    const saved = await upsertZoneHead({
      zoneId,
      name: hName.trim(),
      whatsappNumber: digits,
      email: hEmail.trim() || null,
      isActive: true,
    });
    setSavingHead(false);
    if (!saved) {
      Alert.alert('Could not save', 'Check the console for the Supabase error.');
      return;
    }
    setEditingZoneId(null);
    refresh();
  }

  async function handleDeleteHead(head: ZoneHead) {
    Alert.alert('Remove zone head?', `Remove ${head.name}.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteZoneHead(head.id);
          refresh();
        },
      },
    ]);
  }

  if (authState === 'checking') {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (authState === 'unauthorized') {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="lock-closed" size={40} color={colors.muted} />
        <Text style={[styles.centeredTitle, { color: colors.text }]}>Admins only</Text>
        <Text style={[styles.centeredBody, { color: colors.muted }]}>
          Your account doesn’t have admin access to zone management.
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.link, { color: colors.accent }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Zone Management</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Define zones and assign heads for Assistance routing
          </Text>
        </View>
      </View>

      <FlatList
        data={zones}
        keyExtractor={(z) => z.id}
        ListHeaderComponent={
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Create new zone</Text>
            <LabeledInput label="Zone name" value={zName} onChange={setZName} colors={colors} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <LabeledInput label="City" value={zCity} onChange={setZCity} colors={colors} />
              </View>
              <View style={{ flex: 1 }}>
                <LabeledInput label="State" value={zState} onChange={setZState} colors={colors} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <LabeledInput
                  label="Latitude"
                  value={zLat}
                  onChange={setZLat}
                  colors={colors}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <LabeledInput
                  label="Longitude"
                  value={zLng}
                  onChange={setZLng}
                  colors={colors}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ width: 90 }}>
                <LabeledInput
                  label="Radius (km)"
                  value={zRadius}
                  onChange={setZRadius}
                  colors={colors}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.accent, opacity: savingZone ? 0.7 : 1 }]}
              onPress={handleCreateZone}
              disabled={savingZone}
            >
              {savingZone ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryBtnLabel}>Create zone</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item: zone }) => {
          const zoneHeads = heads.filter((h) => h.zoneId === zone.id);
          const isEditingHead = editingZoneId === zone.id;
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.zoneHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.zoneName, { color: colors.text }]}>{zone.name}</Text>
                  <Text style={[styles.zoneMeta, { color: colors.muted }]}>
                    {[zone.city, zone.state].filter(Boolean).join(', ') || 'Unspecified area'}
                    {' · '}
                    {zone.centerLat.toFixed(3)}, {zone.centerLng.toFixed(3)} · {zone.radiusKm} km
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteZone(zone)}>
                  <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                </TouchableOpacity>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <Text style={[styles.sectionLabel, { color: colors.muted }]}>Zone heads</Text>

              {zoneHeads.length === 0 ? (
                <Text style={[styles.hint, { color: colors.muted }]}>
                  No heads assigned yet. Devotees in this zone will see an error on Assistance tap.
                </Text>
              ) : (
                zoneHeads.map((h) => (
                  <View key={h.id} style={styles.headRow}>
                    <Ionicons name="logo-whatsapp" size={18} color={colors.success} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.headName, { color: colors.text }]}>{h.name}</Text>
                      <Text style={[styles.headMeta, { color: colors.muted }]}>
                        +{h.whatsappNumber}
                        {h.email ? ` · ${h.email}` : ''}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteHead(h)}>
                      <Ionicons name="close-circle-outline" size={20} color={colors.muted} />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {isEditingHead ? (
                <View style={styles.headForm}>
                  <LabeledInput label="Full name" value={hName} onChange={setHName} colors={colors} />
                  <LabeledInput
                    label="WhatsApp (with country code, digits only)"
                    value={hPhone}
                    onChange={setHPhone}
                    colors={colors}
                    keyboardType="phone-pad"
                    placeholder="e.g. 919876543210"
                  />
                  <LabeledInput
                    label="Email (optional)"
                    value={hEmail}
                    onChange={setHEmail}
                    colors={colors}
                    keyboardType="email-address"
                  />
                  <View style={styles.formActions}>
                    <TouchableOpacity
                      style={[styles.ghostBtn, { borderColor: colors.border }]}
                      onPress={() => setEditingZoneId(null)}
                    >
                      <Text style={[styles.ghostBtnLabel, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.accent, flex: 1, opacity: savingHead ? 0.7 : 1 }]}
                      onPress={() => handleSaveHead(zone.id)}
                      disabled={savingHead}
                    >
                      {savingHead ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryBtnLabel}>Save zone head</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.ghostBtn, { borderColor: colors.accent }]}
                  onPress={() => startAddHead(zone)}
                >
                  <Ionicons name="person-add-outline" size={16} color={colors.accent} />
                  <Text style={[styles.ghostBtnLabel, { color: colors.accent }]}>Add zone head</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.hint, { color: colors.muted, textAlign: 'center', marginTop: 20 }]}>
            No zones yet. Create one above to start routing assistance requests.
          </Text>
        }
      />
    </View>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  colors,
  keyboardType,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: any;
  keyboardType?: 'default' | 'decimal-pad' | 'phone-pad' | 'email-address';
  placeholder?: string;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: colors.muted, fontFamily: 'Inter-Variable', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {label}
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: colors.text,
          backgroundColor: colors.surface,
          fontFamily: 'Inter-Variable',
          fontSize: 14,
        }}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType ?? 'default'}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 30,
  },
  centeredTitle: { fontFamily: 'Geist_600SemiBold', fontSize: 18 },
  centeredBody: { fontFamily: 'Inter-Variable', fontSize: 14, textAlign: 'center' },
  link: { fontFamily: 'Geist_600SemiBold', fontSize: 14, marginTop: 6 },

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
  title: { fontFamily: 'Geist_700Bold', fontSize: 20 },
  subtitle: { fontFamily: 'Inter-Variable', fontSize: 12 },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 15,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  primaryBtnLabel: {
    color: '#FFFFFF',
    fontFamily: 'Geist_600SemiBold',
    fontSize: 14,
  },

  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  zoneName: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 16,
  },
  zoneMeta: {
    fontFamily: 'Inter-Variable',
    fontSize: 12,
    marginTop: 3,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  sectionLabel: {
    fontFamily: 'Inter-Variable',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  hint: {
    fontFamily: 'Inter-Variable',
    fontSize: 13,
    lineHeight: 18,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  headName: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 14,
  },
  headMeta: {
    fontFamily: 'Inter-Variable',
    fontSize: 12,
    marginTop: 2,
  },
  headForm: {
    marginTop: 12,
    gap: 6,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  ghostBtnLabel: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 13,
  },
});
