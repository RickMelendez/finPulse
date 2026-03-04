import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

interface AnimatedNumberProps {
  value: number;
  /** Intl.NumberFormat options. Defaults to USD currency. */
  format?: Intl.NumberFormatOptions;
  locale?: string;
  duration?: number;
  className?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const defaultFormat: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

export function AnimatedNumber({
  value,
  format = defaultFormat,
  locale = 'en-US',
  duration = 800,
  className,
}: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);

  useEffect(() => {
    const startValue = displayed;
    startValueRef.current = startValue;
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = startValue + (value - startValue) * eased;
      setDisplayed(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const formatted = new Intl.NumberFormat(locale, format).format(displayed);

  return (
    <span className={clsx('font-numeric tabular-nums', className)}>
      {formatted}
    </span>
  );
}
