import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type {
  Transaction,
  Category,
  BudgetProgress,
  Account,
  TransactionSummary,
  SpendingInsight,
  InsightResult,
  BudgetPlan,
} from '../types';

// --- Transactions ---
export function useTransactions(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () =>
      api
        .get('/transactions', { params })
        .then(
          (r) =>
            r.data as {
              data: Transaction[];
              pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
              };
            },
        ),
  });
}

export function useTransactionSummary(period: string) {
  return useQuery({
    queryKey: ['transactions', 'summary', period],
    queryFn: () =>
      api
        .get('/transactions/summary', { params: { period } })
        .then((r) => r.data.data as TransactionSummary),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post('/transactions', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.put(`/transactions/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

// --- Categories ---
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data as Category[]),
  });
}

// --- Budgets ---
export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => api.get('/budgets').then((r) => r.data.data as BudgetProgress[]),
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post('/budgets', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/budgets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
}

// --- Accounts ---
export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get('/accounts').then((r) => r.data.data as Account[]),
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post('/accounts', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

// --- Insights ---
export function useInsights(period: string) {
  const [year, month] = period.split('-').map(Number);
  const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const periodEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return useQuery({
    queryKey: ['insights', period],
    queryFn: () =>
      api
        .get('/insights', { params: { periodStart, periodEnd } })
        .then((r) => r.data.data as SpendingInsight),
  });
}

export function useInsightTrends() {
  return useQuery({
    queryKey: ['insights', 'trends'],
    queryFn: () =>
      api.get('/insights/trends').then((r) => r.data.data as InsightResult),
  });
}

export function useAskQuestion() {
  return useMutation({
    mutationFn: (question: string) =>
      api
        .post('/insights/ask', { question })
        .then((r) => r.data.data.answer as string),
  });
}

export function useGenerateBudgetPlan() {
  return useMutation({
    mutationFn: () =>
      api.get('/insights/budget-plan').then((r) => r.data.data as BudgetPlan),
  });
}
