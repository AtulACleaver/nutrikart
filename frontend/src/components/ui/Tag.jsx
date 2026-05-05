import React from 'react';

const TONE_STYLES = {
  sage: 'bg-[var(--color-sage-100,#f0fae1)] text-[var(--color-sage-800,#3d472b)]',
  terracotta: 'bg-[var(--color-terracotta-100,#fff2eb)] text-[var(--color-terracotta-800,#643312)]',
  neutral: 'bg-[var(--color-neutral-200,#eee7db)] text-[var(--color-neutral-800,#474238)]',
};

export function Tag({ children, tone = 'neutral', className = '', ...props }) {
  const toneClass = TONE_STYLES[tone] || TONE_STYLES.neutral;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase select-none ${toneClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Tag;
