import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { LoadingView } from '../../components/LoadingView';
import { TransactionItem } from '../../components/TransactionItem';
import { colors, spacing } from '../../constants/theme';
import { useApiResource } from '../../hooks/useApiResource';
import { createOrUpdateRevenue, getRevenues } from '../../services/api';
import type { RevenuePayload, Transaction } from '../../types/api';

const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`;

export default function RevenueScreen() {
  const { data, loading, refreshing, error, reload } = useApiResource(getRevenues);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(localDate());
  const [cash, setCash] = useState('');
  const [transfer, setTransfer] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const items = useMemo(() => [...(data || [])].sort((a, b) => b.date.localeCompare(a.date)), [data]);

  const handleSave = async () => {
    const payload: RevenuePayload = { date, tien_mat: Number(cash) || 0, chuyen_khoan: Number(transfer) || 0 };
    if (!payload.tien_mat && !payload.chuyen_khoan) {
      setFormError('Nhập tiền mặt hoặc chuyển khoản trước khi lưu.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await createOrUpdateRevenue(payload);
      setCash('');
      setTransfer('');
      setDate(localDate());
      setShowForm(false);
      reload();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Không thể lưu doanh thu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) return <LoadingView />;
  if (error && !data) return <SafeAreaView style={styles.safe}><ErrorView message={error} onRetry={reload} /></SafeAreaView>;

  const records = data ?? [];
  const month = localDate().slice(0, 7);
  const monthTotal = records.filter((item) => item.date.slice(0, 7) === month).reduce((sum, item) => sum + Number(item.total || 0), 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={colors.green} />}>
        <AppHeader title="Doanh thu" trailing={`${items.length} ngày`} />
        {error ? <Text style={styles.inlineError}>{error}</Text> : null}
        <View style={styles.totalCard}>
          <View style={styles.totalHeader}><Text style={styles.totalLabel}>DOANH THU THÁNG NÀY</Text><Ionicons name="trending-up" size={18} color={colors.lime} /></View>
          <Text style={styles.totalValue}>{money(monthTotal)}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => { setShowForm((visible) => !visible); setFormError(''); }} style={styles.addButton}>
          <Ionicons name={showForm ? 'close' : 'add'} size={19} color="#ffffff" />
          <Text style={styles.addButtonText}>{showForm ? 'Đóng biểu mẫu' : 'Thêm doanh thu'}</Text>
        </Pressable>

        {showForm ? (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Ghi nhận doanh thu</Text>
            <Text style={styles.fieldLabel}>Ngày phát sinh</Text>
            <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" style={styles.input} autoCapitalize="none" />
            <Text style={styles.fieldLabel}>Tiền mặt</Text>
            <TextInput value={cash} onChangeText={setCash} keyboardType="decimal-pad" placeholder="0 đ" style={styles.input} />
            <Text style={styles.fieldLabel}>Chuyển khoản</Text>
            <TextInput value={transfer} onChangeText={setTransfer} keyboardType="decimal-pad" placeholder="0 đ" style={styles.input} />
            {formError ? <Text style={styles.inlineError}>{formError}</Text> : null}
            <Pressable accessibilityRole="button" disabled={saving} onPress={handleSave} style={[styles.saveButton, saving && styles.disabled]}>
              <Text style={styles.saveText}>{saving ? 'Đang lưu...' : 'Lưu doanh thu'}</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Lịch sử doanh thu</Text><Text style={styles.sectionSubtitle}>Theo dõi các ngày đã ghi nhận</Text></View></View>
        <View style={styles.list}>
          {items.length ? items.map((item) => {
            const transaction: Transaction = {
              id: `revenue-${item.id}`,
              title: 'Doanh thu bán hàng',
              subtitle: [item.tien_mat > 0 ? 'Tiền mặt' : '', item.chuyen_khoan > 0 ? 'Chuyển khoản' : ''].filter(Boolean).join(' · '),
              date: item.date,
              amount: Number(item.total || 0),
              kind: 'revenue',
            };
            return <TransactionItem key={item.id} transaction={transaction} />;
          }) : <EmptyState title="Chưa có doanh thu" detail="Thêm doanh thu theo ngày để xem tổng quan tại đây." icon="trending-up-outline" />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 24, gap: 12 },
  totalCard: { minHeight: 120, justifyContent: 'center', padding: 18, borderRadius: 14, backgroundColor: colors.green },
  totalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: '#d5e4dc', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  totalValue: { color: '#ffffff', fontSize: 27, fontWeight: '700', marginTop: 13 },
  addButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 11, backgroundColor: colors.green },
  addButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  form: { padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface, gap: 9 },
  formTitle: { color: colors.ink, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  fieldLabel: { color: colors.muted, fontSize: 10, fontWeight: '600', marginBottom: -4 },
  input: { minHeight: 42, paddingHorizontal: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 9, color: colors.ink, fontSize: 13, backgroundColor: '#fbfcfb' },
  saveButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.green, marginTop: 2 },
  saveText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  sectionHeading: { marginTop: 11 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  sectionSubtitle: { color: colors.muted, fontSize: 11, marginTop: 4 },
  list: { paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface },
  inlineError: { color: colors.red, fontSize: 12, lineHeight: 18 },
});