import { type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary disabled:bg-primary/50',
  secondary:
    'bg-primary-light/10 text-primary border border-primary/20 hover:bg-primary-light/20 focus-visible:ring-primary disabled:opacity-50',
  ghost:
    'bg-transparent text-primary-dark hover:bg-primary/5 focus-visible:ring-primary disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-400',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-body font-medium rounded-lg',
        'cursor-pointer select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'transition-all duration-150',
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'cursor-not-allowed',
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="animate-spin shrink-0" size={size === 'lg' ? 18 : 16} />}
      {children}
    </button>
  );
}
