import { forwardRef, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, hint, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <textarea
          ref={ref}
          aria-invalid={!!error}
          className={clsx(
            'flex min-h-[80px] w-full rounded-xl border bg-gray-50 px-3.5 py-3',
            'text-sm font-body text-slate-700 placeholder:text-slate-400',
            'outline-none focus:bg-white transition-colors resize-none',
            error
              ? 'border-red-300 focus:border-red-400'
              : 'border-gray-200 focus:border-brand',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-xs font-body text-red-500" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs font-body text-slate-400">{hint}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
