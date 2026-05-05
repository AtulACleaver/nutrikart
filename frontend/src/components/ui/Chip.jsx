import React from 'react';

export function Chip({
  children,
  selected = false,
  onClick,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`h-[44px] px-5 rounded-full border border-[var(--color-divider)] text-[15px] font-semibold transition-all inline-flex items-center justify-center gap-2 select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)] focus-visible:outline-offset-2 ${
        selected
          ? 'bg-[var(--color-neutral-800,#474238)] text-[var(--color-ground,#f5ead8)] border-transparent'
          : 'bg-transparent text-[var(--color-ink,#201e1d)] hover:bg-[color-mix(in_srgb,var(--color-ink,#201e1d)_6%,transparent)]'
      } ${disabled ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Chip;
