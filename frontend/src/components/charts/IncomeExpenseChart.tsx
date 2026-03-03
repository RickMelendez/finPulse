import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  data: Array<{ month: string; income: number; expenses: number }>;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

export function IncomeExpenseChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Fira Sans' }} />
        <YAxis
          tickFormatter={fmt}
          tick={{ fontSize: 11, fontFamily: 'Fira Sans' }}
          width={75}
        />
        <Tooltip
          formatter={(value: number) => fmt(value)}
          contentStyle={{ fontFamily: 'Fira Sans', fontSize: 13 }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#10B981"
          strokeWidth={2}
          fill="url(#gradIncome)"
          name="Income"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke="#EF4444"
          strokeWidth={2}
          fill="url(#gradExpenses)"
          name="Expenses"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
