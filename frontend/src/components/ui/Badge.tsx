import clsx from 'clsx';

type BadgeVariant = 'income' | 'expense' | 'high' | 'medium' | 'low';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  income: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expense: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium font-body border',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
