import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { SkeletonRow } from '../components/ui/Skeleton';
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useCategories,
  useAccounts,
} from '../hooks/useApi';
import type { Transaction, TransactionType } from '../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const inputCls =
  'border border-border dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-body ' +
  'text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/50 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ' +
  'transition-colors duration-150';

const selectFullCls = `w-full ${inputCls}`;

interface TxForm {
  type: TransactionType;
  amount: string;
  description: string;
  categoryId: string;
  accountId: string;
  transactionDate: string;
  notes: string;
}

const defaultForm: TxForm = {
  type: 'expense',
  amount: '',
  description: '',
  categoryId: '',
  accountId: '',
  transactionDate: new Date().toISOString().slice(0, 10),
  notes: '',
};

export function Transactions() {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [form, setForm] = useState<TxForm>(defaultForm);

  const params = {
    page,
    limit: 20,
    ...(filterType ? { type: filterType } : {}),
    ...(filterCategory ? { categoryId: filterCategory } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };

  const { data, isLoading, error } = useTransactions(params);
  const categories = useCategories();
  const accounts = useAccounts();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  const catMap = Object.fromEntries(
    (categories.data ?? []).map((c) => [c.id, c.name]),
  );

  function openCreate() {
    setEditTx(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditTx(tx);
    setForm({
      type: tx.type,
      amount: String(tx.amount),
      description: tx.description,
      categoryId: tx.categoryId,
      accountId: tx.accountId,
      transactionDate: tx.transactionDate.slice(0, 10),
      notes: tx.notes ?? '',
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTx(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount) };
    if (editTx) {
      await updateTx.mutateAsync({ id: editTx.id, ...payload });
    } else {
      await createTx.mutateAsync(payload);
    }
    closeModal();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this transaction?')) return;
    await deleteTx.mutateAsync(id);
  }

  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-body text-slate-400 mb-1.5">
            <span>Home</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-600">Transactions</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Transactions</h1>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus size={16} className="mr-1" /> Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-body text-slate-500 dark:text-slate-400 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                className={inputCls}
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-body text-slate-500 dark:text-slate-400 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className={inputCls}
              >
                <option value="">All Categories</option>
                {(categories.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-body text-slate-500 dark:text-slate-400 mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-body text-slate-500 dark:text-slate-400 mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className={inputCls}
              />
            </div>

            {(filterType || filterCategory || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFilterType(''); setFilterCategory(''); setStartDate(''); setEndDate(''); setPage(1); }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 text-red-500 py-8 justify-center font-body text-sm">
              <AlertCircle size={20} /> Failed to load transactions.
            </div>
          )}
          {isLoading ? (
            <div className="divide-y divide-border dark:divide-slate-700">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : (data?.data ?? []).length === 0 ? (
            <p className="text-center py-12 text-slate-400 dark:text-slate-500 font-body text-sm">
              No transactions found
            </p>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-border dark:divide-slate-700">
                {(data?.data ?? []).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-body font-medium text-slate-800 dark:text-slate-100 text-sm truncate">
                        {tx.description}
                      </p>
                      <p className="font-body text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(tx.transactionDate).toLocaleDateString()} &middot;{' '}
                        {catMap[tx.categoryId] ?? '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className={`font-heading font-semibold text-sm ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                          {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                        </p>
                        <Badge variant={tx.type}>{tx.type}</Badge>
                      </div>
                      <div className="flex flex-col gap-1 ml-1">
                        <button
                          onClick={() => openEdit(tx)}
                          className="p-2 rounded-lg hover:bg-brand/10 text-brand dark:text-brand-light transition-colors cursor-pointer"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 transition-colors cursor-pointer"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full font-body text-sm">
                  <thead>
                    <tr className="border-b border-border dark:border-slate-700">
                      {['Date', 'Description', 'Category', 'Amount', 'Type', 'Actions'].map((h) => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.data ?? []).map((tx) => (
                      <tr key={tx.id} className="border-b border-border dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150">
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(tx.transactionDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-slate-800 dark:text-slate-100 font-medium max-w-[200px] truncate">
                          {tx.description}
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                          {catMap[tx.categoryId] ?? '—'}
                        </td>
                        <td className={`py-3 px-3 font-heading font-semibold whitespace-nowrap ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                          {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={tx.type}>{tx.type}</Badge>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(tx)}
                              className="p-1.5 rounded-lg hover:bg-brand/10 text-brand dark:text-brand-light transition-colors cursor-pointer"
                              aria-label="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 transition-colors cursor-pointer"
                              aria-label="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border dark:border-slate-700">
                  <p className="font-body text-sm text-slate-500 dark:text-slate-400">
                    Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} total
                  </p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
                      Previous
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editTx ? 'Edit Transaction' : 'Add Transaction'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            {(['expense', 'income'] as TransactionType[]).map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer font-body text-sm">
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={form.type === t}
                  onChange={() => setForm((f) => ({ ...f, type: t }))}
                  className="accent-brand"
                />
                <span className={t === 'income' ? 'text-income font-medium' : 'text-expense font-medium'}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </label>
            ))}
          </div>

          <Input label="Amount" type="number" step="0.01" min="0" value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />

          <Input label="Description" value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />

          <div>
            <label className="block text-sm font-body text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} required className={selectFullCls}>
              <option value="">Select category</option>
              {(categories.data ?? []).filter((c) => !form.type || c.type === form.type).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-body text-slate-700 dark:text-slate-300 mb-1">Account</label>
            <select value={form.accountId} onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))} required className={selectFullCls}>
              <option value="">Select account</option>
              {(accounts.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-body text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <input type="date" value={form.transactionDate}
              onChange={(e) => setForm((f) => ({ ...f, transactionDate: e.target.value }))}
              required className={selectFullCls} />
          </div>

          <div>
            <label className="block text-sm font-body text-slate-700 dark:text-slate-300 mb-1">Notes (optional)</label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Add a note..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="primary" loading={createTx.isPending || updateTx.isPending}>
              {editTx ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
