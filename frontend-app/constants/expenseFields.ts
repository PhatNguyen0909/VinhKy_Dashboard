import type { ExpenseFieldKey } from '../types/api';

export const expenseFields: { key: ExpenseFieldKey; label: string }[] = [
  { key: 'ha', label: 'Tiền nhà' },
  { key: 'gao', label: 'Tiền gạo' },
  { key: 'cho', label: 'Tiền chợ' },
  { key: 'kho', label: 'Tiền khô' },
  { key: 'gas', label: 'Tiền gas' },
  { key: 'dau', label: 'Tiền dầu' },
  { key: 'trung', label: 'Trứng' },
  { key: 'hop', label: 'Tiền hộp' },
  { key: 'luong', label: 'Tiền lương' },
  { key: 'ga', label: 'Tiền gà' },
  { key: 'khac', label: 'Tiền khác' },
];

export const expenseFieldLabel = (key: ExpenseFieldKey) =>
  expenseFields.find((field) => field.key === key)?.label ?? 'Chi phí';

export const totalExpenseItem = (
  item: Partial<Record<ExpenseFieldKey, number>>
) =>
  expenseFields.reduce((sum, field) => sum + Number(item[field.key] || 0), 0);
