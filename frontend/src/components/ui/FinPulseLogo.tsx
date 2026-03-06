import { useRef } from 'react';

interface Props {
  /** Base size for the icon square (px). Text scales proportionally. */
  size?: number;
  /** 'icon' = square only | 'full' = icon + wordmark */
  variant?: 'icon' | 'full';
  className?: string;
  /** White/light version for dark backgrounds */
  light?: boolean;
}

export function FinPulseLogo({ size = 32, variant = 'full', className = '', light = false }: Props) {
  const idRef = useRef(`fp-${Math.random().toString(36).slice(2, 8)}`);
  const gradId = idRef.current;

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="45%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect width="32" height="32" rx="8" fill={`url(#${gradId})`} />

      {/* Letter P — vertical stem */}
      <path
        d="M9 25 L9 7"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Letter P — bowl */}
      <path
        d="M9 7 L17 7 Q24 7 24 13.5 Q24 20 17 20 L9 20"
        stroke="white"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pulse sparkle — small 4-point star accent bottom-right */}
      <path
        d="M24.5 22.5 L25.5 20.5 L26.5 22.5 L28.5 23 L26.5 23.5 L25.5 25.5 L24.5 23.5 L22.5 23 Z"
        fill="white"
        opacity="0.85"
      />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={className}>{icon}</div>;
  }

  const textSize = Math.round(size * 0.59);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {icon}
      <span
        className="font-heading font-bold tracking-tight leading-none select-none"
        style={{
          fontSize: textSize,
          ...(light
            ? { color: 'white' }
            : {
                background: 'linear-gradient(135deg, #1e3a8a 0%, #4338ca 50%, #0891b2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }),
        }}
      >
        FinPulse
      </span>
    </div>
  );
}
