import db from '../infrastructure/config/database';
import { ClaudeInsightsService, BudgetPlan } from '../adapters/services/ClaudeInsightsService';
import { PgTransactionRepo } from '../adapters/repositories/PgTransactionRepo';

const claude = new ClaudeInsightsService();
const txnRepo = new PgTransactionRepo();

export async function generateBudgetPlan(userId: string): Promise<BudgetPlan & { totalIncome: number; totalExpenses: number }> {
  const now = new Date();
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const today = now.toISOString().split('T')[0];

  const summary = await txnRepo.getSummary(userId, startDate, today);

  // Get expense breakdown by category name
  const categoryRows = await db('transactions as t')
    .join('categories as c', 't.category_id', 'c.id')
    .where('t.user_id', userId)
    .where('t.type', 'expense')
    .whereBetween('t.transaction_date', [startDate, today])
    .groupBy('c.name')
    .select(db.raw('c.name, SUM(t.amount::numeric) as total'))
    .orderBy('total', 'desc');

  const categorySpending = categoryRows.map((r: { name: string; total: string }) => ({
    name: r.name,
    spent: parseFloat(r.total),
  }));

  const plan = await claude.generateBudgetPlan(summary.totalIncome, categorySpending);

  return {
    ...plan,
    totalIncome: summary.totalIncome,
    totalExpenses: summary.totalExpenses,
  };
}
