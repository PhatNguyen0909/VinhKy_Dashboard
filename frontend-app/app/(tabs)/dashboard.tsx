import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { LoadingView } from '../../components/LoadingView';
import { StatCard } from '../../components/StatCard';
import { TransactionItem } from '../../components/TransactionItem';
import { expenseFields, totalExpenseItem } from '../../constants/expenseFields';
import { colors, spacing } from '../../constants/theme';
import { useApiResource } from '../../hooks/useApiResource';
import { getDashboardSnapshot } from '../../services/api';
import type { Transaction } from '../../types/api';

const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
const localMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function DashboardScreen() {
  const { data, loading, refreshing, error, reload } = useApiResource(getDashboardSnapshot);

  if (loading && !data) return <LoadingView />;
  if (error && !data) return <SafeAreaView style={styles.safe}><ErrorView message={error} onRetry={reload} /></SafeAreaView>;

  const snapshot = data ?? { expenses: [], expenseItems: [], revenues: [] };
  const month = localMonth();
  const revenues = snapshot.revenues.filter((item) => item.date.slice(0, 7) === month);
  const expenses = snapshot.expenses.filter((item) => item.date.slice(0, 7) === month);
  const revenueTotal = revenues.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const expenseTotal = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const recent: Transaction[] = [
    ...snapshot.expenseItems.map((item) => {
      const labels = expenseFields
        .filter((field) => Number(item[field.key] || 0) > 0)
        .map((field) => field.label);
      return {
        id: `expense-${item.id}`,
        title: labels.slice(0, 2).join(', ') || 'Phiếu chi',
        subtitle: labels.length > 2 ? `${labels.length} hạng mục` : 'Chi phí',
        date: item.date,
        amount: totalExpenseItem(item),
        kind: 'expense' as const,
      };
    }),
    ...snapshot.revenues.map((item) => ({
      id: `revenue-${item.id}`,
      title: 'Doanh thu bán hàng',
      subtitle: [item.tien_mat > 0 ? 'Tiền mặt' : '', item.chuyen_khoan > 0 ? 'Chuyển khoản' : ''].filter(Boolean).join(' · ') || 'Doanh thu',
      date: item.date,
      amount: Number(item.total || 0),
      kind: 'revenue' as const,
    })),
  ]
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={colors.green} />}
      >
        <AppHeader title="Tổng quan" trailing={`${month.slice(5)}/${month.slice(0, 4)}`} />
        {error ? <Text style={styles.inlineError}>{error}</Text> : null}
        <View style={styles.statRow}>
          <StatCard label="Doanh thu" value={money(revenueTotal)} icon="trending-up" />
          <StatCard label="Chi phí" value={money(expenseTotal)} icon="receipt-outline" accent="gold" />
        </View>
        <StatCard label="Lợi nhuận ròng" value={money(revenueTotal - expenseTotal)} icon="wallet-outline" accent="lime" featured />

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
            <Text style={styles.sectionSubtitle}>Các khoản thu và chi mới nhất</Text>
          </View>
          <Text style={styles.count}>{recent.length} mục</Text>
        </View>
        <View style={styles.transactionList}>
          {recent.length ? recent.map((transaction) => <TransactionItem key={transaction.id} transaction={transaction} />) : (
            <EmptyState title="Chưa có giao dịch" detail="Các khoản thu và chi mới sẽ xuất hiện tại đây." />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 24, gap: 12 },
  statRow: { flexDirection: 'row', gap: 10 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13, marginBottom: 1 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  sectionSubtitle: { color: colors.muted, fontSize: 11, marginTop: 4 },
  count: { color: colors.green, fontSize: 10, fontWeight: '700' },
  transactionList: { paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface },
  inlineError: { color: colors.red, fontSize: 12, marginBottom: 4 },
});