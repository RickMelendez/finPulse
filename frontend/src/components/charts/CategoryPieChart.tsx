import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  data: Array<{ name: string; value: number }>;
}

const COLORS = [
  '#1E40AF',
  '#3B82F6',
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#EF4444',
  '#F97316',
  '#06B6D4',
];

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

export function CategoryPieChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_entry, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => fmt(value)}
          contentStyle={{ fontFamily: 'Fira Sans', fontSize: 13 }}
        />
        <Legend
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontFamily: 'Fira Sans', fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
