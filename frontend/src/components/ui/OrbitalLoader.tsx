import { motion } from 'framer-motion';
import clsx from 'clsx';

type MessagePlacement = 'top' | 'bottom' | 'left' | 'right';

interface OrbitalLoaderProps {
  message?: string;
  messagePlacement?: MessagePlacement;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const placementClass: Record<MessagePlacement, string> = {
  bottom: 'flex-col',
  top: 'flex-col-reverse',
  right: 'flex-row',
  left: 'flex-row-reverse',
};

const sizeClass = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
};

export function OrbitalLoader({
  message,
  messagePlacement = 'bottom',
  size = 'md',
  className,
}: OrbitalLoaderProps) {
  return (
    <div className={clsx('flex gap-3 items-center justify-center', placementClass[messagePlacement], className)}>
      <div className={clsx('relative', sizeClass[size])}>
        <motion.div
          className="absolute inset-0 border-2 border-transparent border-t-brand rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 border-2 border-transparent border-t-brand/60 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-4 border-2 border-transparent border-t-brand/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {message && (
        <p className="text-sm font-body text-slate-500">{message}</p>
      )}
    </div>
  );
}
