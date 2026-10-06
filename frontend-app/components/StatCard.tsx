import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import React from 'react';

type StatCardProps = {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent?: 'green' | 'gold' | 'lime';
  featured?: boolean;
};

export function StatCard({
  label,
  value,
  icon,
  accent = 'green',
  featured = false,
}: StatCardProps) {
  const accentColor =
    accent === 'gold'
      ? colors.gold
      : accent === 'lime'
        ? colors.lime
        : colors.green;
  return (
    <View style={[styles.card, featured && styles.featured]}>
      <View style={styles.top}>
        <Text style={[styles.label, featured && styles.featuredLabel]}>
          {label}
        </Text>
        <View
          style={[
            styles.icon,
            { backgroundColor: featured ? '#ffffff1c' : colors.greenSoft },
          ]}
        >
          <Ionicons
            name={icon}
            size={16}
            color={featured ? colors.lime : accentColor}
          />
        </View>
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.value, featured && styles.featuredValue]}
      >
        {value}
      </Text>
      {featured ? (
        <Text style={styles.note}>Doanh thu sau khi trừ chi phí</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'space-between',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  featured: {
    minHeight: 132,
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  label: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  featuredLabel: { color: '#d5e4dc' },
  icon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  value: { color: colors.ink, fontSize: 20, fontWeight: '700', marginTop: 10 },
  featuredValue: { color: '#ffffff', fontSize: 27 },
  note: { color: '#d5e4dc', fontSize: 10, marginTop: 4 },
});
