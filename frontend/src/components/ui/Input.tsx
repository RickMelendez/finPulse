import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...rest }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="text-sm font-medium font-body text-primary-dark"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-3 py-2 rounded-lg border font-body text-sm text-primary-dark',
            'bg-white placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all duration-150',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-200 hover:border-primary/40',
            className,
          )}
          {...rest}
        />
        {error && (
          <p className="text-xs font-body text-red-500 mt-0.5" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
