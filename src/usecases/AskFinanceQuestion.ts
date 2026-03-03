import db from '../infrastructure/config/database';
import { ClaudeInsightsService } from '../adapters/services/ClaudeInsightsService';
import { PgTransactionRepo } from '../adapters/repositories/PgTransactionRepo';

const claude = new ClaudeInsightsService();
const txnRepo = new PgTransactionRepo();

export async function askFinanceQuestion(userId: string, question: string): Promise<string> {
  // Get current month summary
  const now = new Date();
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const today = now.toISOString().split('T')[0];

  const summary = await txnRepo.getSummary(userId, startDate, today);

  // Get recent 10 transactions with category names
  const recentRows = await db('transactions as t')
    .join('categories as c', 't.category_id', 'c.id')
    .where('t.user_id', userId)
    .orderBy('t.transaction_date', 'desc')
    .limit(10)
    .select(
      't.description',
      't.amount',
      't.type',
      't.transaction_date as date',
      'c.name as category'
    );

  const recentTransactions = recentRows.map((r: {
    description: string;
    amount: string;
    type: string;
    date: string;
    category: string;
  }) => ({
    description: r.description,
    amount: parseFloat(r.amount),
    type: r.type,
    category: r.category,
    date: r.date,
  }));

  return claude.askQuestion(question, {
    recentTransactions,
    totalIncome: summary.totalIncome,
    totalExpenses: summary.totalExpenses,
    netBalance: summary.netBalance,
  });
}
