import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  withLink?: boolean;
}

export function Logo({ variant = 'dark', size = 'md', withLink = true }: LogoProps) {
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  const textSize = size === 'sm' ? '1rem' : size === 'lg' ? '1.4rem' : '1.2rem';
  const subSize = size === 'sm' ? '0.65rem' : size === 'lg' ? '0.78rem' : '0.7rem';

  const textColor = variant === 'light' ? '#FFFFFF' : '#0F172A';
  const subColor = variant === 'light' ? '#94A3B8' : '#0F766E';

  const content = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', userSelect: 'none' }}>
      {/* Original Medical Emblem SVG */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <rect width="48" height="48" rx="12" fill={variant === 'light' ? '#1E293B' : '#E0F2FE'} />
        {/* Soft health aura ring */}
        <circle cx="24" cy="24" r="17" stroke="#0F766E" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
        {/* Medical Cross Stem */}
        <rect x="21" y="10" width="6" height="28" rx="3" fill="#155E75" />
        <rect x="10" y="21" width="28" height="6" rx="3" fill="#155E75" />
        {/* Caring Heart/Crescent Curve Accent in Center */}
        <path
          d="M24 16C26.5 13 31 14 31 18C31 22 24 27 24 27C24 27 17 22 17 18C17 14 21.5 13 24 16Z"
          fill="#0F766E"
          opacity="0.88"
        />
        <circle cx="24" cy="20" r="2.5" fill="#FFFFFF" />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span
          style={{
            fontSize: textSize,
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: textColor,
            fontFamily: 'var(--font-family)',
          }}
        >
          MADNI CLINIC
        </span>
        <span
          style={{
            fontSize: subSize,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: subColor,
            fontFamily: 'var(--font-family)',
          }}
        >
          D.I. Khan • Medical Care
        </span>
      </div>
    </div>
  );

  if (!withLink) return content;

  return (
    <Link href="/" aria-label="Madni Clinic Home" style={{ display: 'inline-block' }}>
      {content}
    </Link>
  );
}
