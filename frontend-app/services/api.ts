import type {
  DashboardSnapshot,
  Expense,
  ExpenseItem,
  ExpenseItemPayload,
  HealthStatus,
  Revenue,
  RevenuePayload,
} from '../types/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const REQUEST_TIMEOUT_MS = 12_000;

export const BASE_API_URL = (API_URL || '').trim().replace(/\/+$/, '');
export const API_BASE_URL = BASE_API_URL
  ? BASE_API_URL.endsWith('/api')
    ? BASE_API_URL
    : `${BASE_API_URL}/api`
  : '';

export const isApiConfigured = () =>
  Boolean(API_BASE_URL && !API_BASE_URL.includes('YOUR-BACKEND-DOMAIN'));

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
};

const getErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== 'object' || !('detail' in payload)) {
    return fallback;
  }
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === 'string') return detail;
  if (detail && typeof detail === 'object' && 'message' in detail) {
    return String((detail as { message: unknown }).message);
  }
  if (Array.isArray(detail)) {
    return detail
      .map((issue) =>
        issue && typeof issue === 'object' && 'msg' in issue
          ? String(issue.msg)
          : String(issue)
      )
      .join('; ');
  }
  return fallback;
};

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError(
      'Hãy điền EXPO_PUBLIC_API_URL trong frontend-app/.env bằng URL backend đang chạy.'
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined
          ? {}
          : { 'Content-Type': 'application/json' }),
      },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(payload, `Yêu cầu thất bại (${response.status}).`),
        response.status
      );
    }
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Máy chủ phản hồi quá lâu. Hãy thử lại.');
    }
    throw new ApiError(
      'Không thể kết nối backend. Kiểm tra URL, Wi-Fi và trạng thái máy chủ.'
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const getExpenses = () => request<Expense[]>('/expenses');
export const getExpenseItems = () => request<ExpenseItem[]>('/expense_items');
export const getRevenues = () => request<Revenue[]>('/revenues');
export const checkHealth = () => request<HealthStatus>('/health/db');

export const createExpenseItem = (payload: ExpenseItemPayload) =>
  request<ExpenseItem>('/expense_items', { method: 'POST', body: payload });

export const createOrUpdateRevenue = async (payload: RevenuePayload) => {
  try {
    return await request<Revenue>('/revenues', {
      method: 'POST',
      body: payload,
    });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 400) throw error;
    const existing = (await getRevenues()).find(
      (revenue) => revenue.date === payload.date
    );
    if (!existing) throw error;
    return request<Revenue>(`/revenues/${existing.id}`, {
      method: 'PATCH',
      body: payload,
    });
  }
};

export const getDashboardSnapshot = async (): Promise<DashboardSnapshot> => {
  const [expenses, expenseItems, revenues] = await Promise.all([
    getExpenses(),
    getExpenseItems(),
    getRevenues(),
  ]);
  return { expenses, expenseItems, revenues };
};
