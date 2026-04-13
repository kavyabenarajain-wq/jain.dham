import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

interface PreviewCard {
  title: string;
  subtitle: string;
}

interface ComingSoonProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  previewCards?: PreviewCard[];
  onNotify?: () => void;
  notified?: boolean;
}

export function ComingSoon({
  icon,
  title,
  description,
  previewCards,
  onNotify,
  notified,
}: ComingSoonProps) {
  const colors = useThemeColors();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.accent + '15' }]}>
        <Ionicons name={icon} size={48} color={colors.accent} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>

      {previewCards && previewCards.length > 0 && (
        <View style={styles.previewSection}>
          {previewCards.map((card, index) => (
            <View
              key={index}
              style={[
                styles.previewCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: 0.6,
                },
              ]}
            >
              <View style={[styles.previewIcon, { backgroundColor: colors.accent + '15' }]}>
                <Ionicons name="diamond-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.previewText}>
                <Text style={[styles.previewTitle, { color: colors.text }]}>
                  {card.title}
                </Text>
                <Text style={[styles.previewSubtitle, { color: colors.muted }]}>
                  {card.subtitle}
                </Text>
              </View>
              <Ionicons name="lock-closed-outline" size={16} color={colors.muted} />
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.notifyButton,
          { backgroundColor: notified ? colors.success : colors.accent },
        ]}
        onPress={onNotify}
        activeOpacity={0.8}
        disabled={notified}
      >
        <Ionicons
          name={notified ? 'checkmark-circle' : 'notifications-outline'}
          size={20}
          color="#FFFFFF"
        />
        <Text style={styles.notifyText}>
          {notified ? 'We\'ll notify you!' : 'Notify Me'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Variable',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  previewSection: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    flex: 1,
  },
  previewTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  previewSubtitle: {
    fontFamily: 'Inter-Variable',
    fontSize: 12,
    marginTop: 2,
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 28,
    gap: 8,
  },
  notifyText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
