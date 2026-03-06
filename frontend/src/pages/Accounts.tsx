import { useState } from 'react';
import { Plus, Trash2, Wallet, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { SkeletonStat } from '../components/ui/Skeleton';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { useAccounts, useCreateAccount, useDeleteAccount } from '../hooks/useApi';

const inputCls =
  'w-full border border-border dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm font-body ' +
  'text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/50 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ' +
  'transition-colors duration-150';

interface AccountForm {
  name: string;
  type: string;
  balance: string;
  currency: string;
}

const defaultForm: AccountForm = { name: '', type: 'checking', balance: '0', currency: 'USD' };
const ACCOUNT_TYPES = ['checking', 'savings', 'credit', 'investment', 'cash'];

export function Accounts() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AccountForm>(defaultForm);

  const { data: accounts, isLoading, error } = useAccounts();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createAccount.mutateAsync({
      name: form.name,
      type: form.type,
      balance: parseFloat(form.balance),
      currency: form.currency,
    });
    setModalOpen(false);
    setForm(defaultForm);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this account?')) return;
    await deleteAccount.mutateAsync(id);
  }

  const totalBalance = (accounts ?? []).reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold text-slate-800 dark:text-white">Accounts</h1>
          <p className="font-body text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Total balance:{' '}
            <AnimatedNumber
              value={totalBalance}
              className={`font-semibold ${totalBalance >= 0 ? 'text-income' : 'text-expense'}`}
            />
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-1" /> Add Account
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 justify-center py-8 font-body text-sm">
          <AlertCircle size={20} /> Failed to load accounts.
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
      ) : (accounts ?? []).length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center py-16 text-slate-400 dark:text-slate-500">
              <Wallet size={48} className="mb-3 opacity-30" />
              <p className="font-body text-sm">No accounts yet. Add one to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {(accounts ?? []).map((a) => (
            <Card key={a.id} className="border-l-4 border-l-brand">
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-heading font-semibold text-slate-800 dark:text-white">{a.name}</p>
                    <span className="text-xs font-body text-slate-400 dark:text-slate-500 capitalize">{a.type}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 transition-colors cursor-pointer"
                    aria-label="Delete account"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <AnimatedNumber
                  value={a.balance}
                  className={`font-heading text-2xl font-bold ${a.balance >= 0 ? 'text-income' : 'text-expense'}`}
                />
                <p className="font-body text-xs text-slate-400 dark:text-slate-500 mt-1">{a.currency}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Account">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-body text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required placeholder="e.g. Main Checking" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-body text-slate-700 dark:text-slate-300 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputCls}>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-body text-slate-700 dark:text-slate-300 mb-1">Initial Balance ($)</label>
            <input type="number" step="0.01" value={form.balance}
              onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))} required className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-body text-slate-700 dark:text-slate-300 mb-1">Currency</label>
            <input value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
              maxLength={3} className={`${inputCls} uppercase`} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={createAccount.isPending}>Add Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
