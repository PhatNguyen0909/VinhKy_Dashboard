import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { LoadingView } from '../../components/LoadingView';
import { TransactionItem } from '../../components/TransactionItem';
import { expenseFields, totalExpenseItem } from '../../constants/expenseFields';
import { colors, spacing } from '../../constants/theme';
import { useApiResource } from '../../hooks/useApiResource';
import { createExpenseItem, getExpenseItems } from '../../services/api';
import type { ExpenseFieldKey, ExpenseItemPayload, Transaction } from '../../types/api';

const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const blankValues = (): Record<ExpenseFieldKey, string> =>
  Object.fromEntries(expenseFields.map(({ key }) => [key, ''])) as Record<ExpenseFieldKey, string>;

export default function ExpensesScreen() {
  const { data, loading, refreshing, error, reload } = useApiResource(getExpenseItems);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(localDate());
  const [values, setValues] = useState(blankValues);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const items = useMemo(() => [...(data || [])].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id), [data]);

  const handleSave = async () => {
    const fields = Object.fromEntries(expenseFields.map(({ key }) => [key, Number(values[key]) || 0])) as Record<ExpenseFieldKey, number>;
    if (!Object.values(fields).some((value) => value > 0)) {
      setFormError('Nhập ít nhất một khoản chi trước khi lưu.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await createExpenseItem({ date, ...fields } as ExpenseItemPayload);
      setValues(blankValues());
      setDate(localDate());
      setShowForm(false);
      reload();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Không thể lưu phiếu chi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) return <LoadingView />;
  if (error && !data) return <SafeAreaView style={styles.safe}><ErrorView message={error} onRetry={reload} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={colors.green} />}
      >
        <AppHeader title="Chi phí" trailing={`${items.length} phiếu`} />
        {error ? <Text style={styles.inlineError}>{error}</Text> : null}
        <Pressable accessibilityRole="button" onPress={() => { setShowForm((visible) => !visible); setFormError(''); }} style={styles.addButton}>
          <Ionicons name={showForm ? 'close' : 'add'} size={19} color="#ffffff" />
          <Text style={styles.addButtonText}>{showForm ? 'Đóng biểu mẫu' : 'Thêm phiếu chi'}</Text>
        </Pressable>

        {showForm ? (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Phiếu chi mới</Text>
            <Text style={styles.fieldLabel}>Ngày phát sinh</Text>
            <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" style={styles.input} autoCapitalize="none" />
            <View style={styles.fieldsGrid}>
              {expenseFields.map((field) => (
                <View key={field.key} style={styles.fieldCell}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <TextInput
                    value={values[field.key]}
                    onChangeText={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
                    keyboardType="decimal-pad"
                    placeholder="0 đ"
                    style={styles.input}
                  />
                </View>
              ))}
            </View>
            {formError ? <Text style={styles.inlineError}>{formError}</Text> : null}
            <Pressable accessibilityRole="button" disabled={saving} onPress={handleSave} style={[styles.saveButton, saving && styles.disabled]}>
              <Text style={styles.saveText}>{saving ? 'Đang lưu...' : 'Lưu phiếu chi'}</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeading}>
          <View><Text style={styles.sectionTitle}>Danh sách chi phí</Text><Text style={styles.sectionSubtitle}>Phiếu chi mới nhất trước</Text></View>
        </View>
        <View style={styles.list}>
          {items.length ? items.map((item) => {
            const names = expenseFields.filter((field) => Number(item[field.key] || 0) > 0).map((field) => field.label);
            const transaction: Transaction = {
              id: `expense-${item.id}`,
              title: names.slice(0, 2).join(', ') || 'Phiếu chi',
              subtitle: names.length > 2 ? `${names.length} hạng mục` : 'Chi phí',
              date: item.date,
              amount: totalExpenseItem(item),
              kind: 'expense',
            };
            return <TransactionItem key={item.id} transaction={transaction} />;
          }) : <EmptyState title="Chưa có chi phí" detail="Thêm phiếu chi đầu tiên để theo dõi các khoản của bạn." icon="receipt-outline" />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 24, gap: 12 },
  addButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 11, backgroundColor: colors.green },
  addButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  form: { padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface, gap: 9 },
  formTitle: { color: colors.ink, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  fieldLabel: { color: colors.muted, fontSize: 10, fontWeight: '600', marginBottom: 5 },
  input: { minHeight: 42, paddingHorizontal: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 9, color: colors.ink, fontSize: 13, backgroundColor: '#fbfcfb' },
  fieldsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 9 },
  fieldCell: { width: '48%' },
  saveButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.green, marginTop: 2 },
  saveText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  sectionHeading: { marginTop: 11 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  sectionSubtitle: { color: colors.muted, fontSize: 11, marginTop: 4 },
  list: { paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface },
  inlineError: { color: colors.red, fontSize: 12, lineHeight: 18 },
});