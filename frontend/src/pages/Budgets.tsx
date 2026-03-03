import { useState } from 'react';
import { Plus, Trash2, Target, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useBudgets, useCreateBudget, useDeleteBudget, useCategories } from '../hooks/useApi';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

interface BudgetForm {
  name: string;
  amount: string;
  period: string;
  startDate: string;
  categoryId: string;
  endDate: string;
}

const defaultForm: BudgetForm = {
  name: '',
  amount: '',
  period: 'monthly',
  startDate: new Date().toISOString().slice(0, 10),
  categoryId: '',
  endDate: '',
};

export function Budgets() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<BudgetForm>(defaultForm);

  const { data: budgets, isLoading, error } = useBudgets();
  const categories = useCategories();
  const createBudget = useCreateBudget();
  const deleteBudget = useDeleteBudget();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createBudget.mutateAsync({
      name: form.name,
      amount: parseFloat(form.amount),
      period: form.period,
      startDate: form.startDate,
      ...(form.categoryId ? { categoryId: form.categoryId } : {}),
      ...(form.endDate ? { endDate: form.endDate } : {}),
    });
    setModalOpen(false);
    setForm(defaultForm);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this budget?')) return;
    await deleteBudget.mutateAsync(id);
  }

  function getBarColor(pct: number, over: boolean) {
    if (over) return 'bg-red-500';
    if (pct >= 80) return 'bg-amber-400';
    return 'bg-emerald-500';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary-dark flex-1">
          Budgets
        </h1>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-1" /> Add Budget
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 justify-center py-8 font-body text-sm">
          <AlertCircle size={20} /> Failed to load budgets.
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : (budgets ?? []).length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center py-16 text-gray-400">
              <Target size={48} className="mb-3 opacity-30" />
              <p className="font-body text-sm">
                No budgets yet. Create one to track your spending.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(budgets ?? []).map((b) => {
            const pct = Math.min(b.percentUsed, 100);
            return (
              <Card key={b.id}>
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-heading font-semibold text-primary-dark">
                        {b.name}
                      </p>
                      <span className="text-xs font-body text-gray-400 capitalize">
                        {b.period}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors cursor-pointer"
                      aria-label="Delete budget"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex justify-between font-body text-sm mb-2">
                    <span className="text-gray-500">
                      Spent:{' '}
                      <span className="font-semibold text-primary-dark">
                        {fmt(b.spent)}
                      </span>
                    </span>
                    <span className="text-gray-400">of {fmt(b.amount)}</span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${getBarColor(
                        b.percentUsed,
                        b.isOverBudget,
                      )}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between font-body text-xs">
                    <span
                      className={
                        b.isOverBudget
                          ? 'text-red-500 font-semibold'
                          : b.isNearLimit
                            ? 'text-amber-500 font-semibold'
                            : 'text-gray-400'
                      }
                    >
                      {b.isOverBudget
                        ? 'Over budget!'
                        : b.isNearLimit
                          ? 'Near limit'
                          : `${fmt(b.remaining)} remaining`}
                    </span>
                    <span className="text-gray-400">{b.percentUsed.toFixed(0)}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Budget"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-body text-gray-700 mb-1">
              Budget Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              placeholder="e.g. Monthly Groceries"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-body text-gray-700 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-body text-gray-700 mb-1">Period</label>
            <select
              value={form.period}
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-body text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-body text-gray-700 mb-1">
              Category (optional)
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Categories</option>
              {(categories.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createBudget.isPending}
            >
              Create Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
