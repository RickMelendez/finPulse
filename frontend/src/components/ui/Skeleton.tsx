import { type CSSProperties } from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

function Base({ className, style }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'rounded-lg shimmer',
        className,
      )}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 2, className }: { lines?: number; className?: string }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Base
          key={i}
          className={clsx(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full',
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonRow({ className }: SkeletonProps) {
  return (
    <div className={clsx('flex items-center gap-3 py-3', className)}>
      <Base className="w-9 h-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Base className="h-3.5 w-1/2" />
        <Base className="h-3 w-1/3" />
      </div>
      <Base className="h-4 w-16 shrink-0" />
    </div>
  );
}

export function SkeletonCard({ h = 96, className }: { h?: number; className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-surface-2 p-5 space-y-3',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Base className="h-4 w-28" />
        <Base className="h-4 w-12" />
      </div>
      <Base className={clsx('w-full rounded-xl')} style={{ height: h - 64 }} />
    </div>
  );
}

export function SkeletonStat({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-surface-2 p-5',
        className,
      )}
    >
      <Base className="h-3.5 w-24 mb-3" />
      <Base className="h-8 w-36 mb-1" />
      <Base className="h-3 w-16" />
    </div>
  );
}
