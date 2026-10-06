export type ExpenseFieldKey =
  | 'ha'
  | 'gao'
  | 'cho'
  | 'kho'
  | 'gas'
  | 'dau'
  | 'trung'
  | 'hop'
  | 'luong'
  | 'ga'
  | 'khac';

export type Expense = {
  id: number;
  date: string;
  amount: number;
};

export type ExpenseItem = Record<ExpenseFieldKey, number> & {
  id: number;
  date: string;
  expense_id: number | null;
};

export type ExpenseItemPayload = Record<ExpenseFieldKey, number> & {
  date: string;
};

export type Revenue = {
  id: number;
  date: string;
  chuyen_khoan: number;
  tien_mat: number;
  total: number;
};

export type RevenuePayload = {
  date: string;
  chuyen_khoan: number;
  tien_mat: number;
};

export type HealthStatus = {
  status: string;
  database: string;
};

export type DashboardSnapshot = {
  expenses: Expense[];
  expenseItems: ExpenseItem[];
  revenues: Revenue[];
};

export type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  amount: number;
  kind: 'expense' | 'revenue';
};
