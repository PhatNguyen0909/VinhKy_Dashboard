import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';

type AppHeaderProps = {
  title: string;
  eyebrow?: string;
  trailing?: string;
};

export function AppHeader({
  title,
  eyebrow = 'VINHKY DASHBOARD',
  trailing,
}: AppHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <View style={styles.mark}>
          <Ionicons name='stats-chart' size={18} color={colors.lime} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.green,
  },
  copy: { gap: 3 },
  eyebrow: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: { color: colors.ink, fontSize: 23, fontWeight: '700' },
  trailing: { color: colors.muted, fontSize: 12, fontWeight: '600' },
});
