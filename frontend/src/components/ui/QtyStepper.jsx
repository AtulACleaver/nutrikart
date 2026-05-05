import React from 'react';
import { Minus, Plus } from 'lucide-react';

export function QtyStepper({
  value = 0,
  min = 0,
  max = 99,
  size = 'md',
  onChange,
  disabled = false,
  className = '',
  ariaLabel = 'Quantity',
}) {
  const isMin = value <= min;
  const isMax = value >= max;

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (!isMin && onChange && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (!isMax && onChange && !disabled) {
      onChange(value + 1);
    }
  };

  const btnSize = size === 'sm' ? 'w-[36px] h-[36px]' : 'w-[44px] h-[44px]';

  return (
    <div
      className={`inline-flex items-center gap-2 p-1 rounded-full bg-[var(--color-surface,#ebddc5)] select-none ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || isMin}
        onClick={handleDecrement}
        className={`inline-flex items-center justify-center rounded-full bg-[var(--color-ground,#f5ead8)] text-[var(--color-ink,#201e1d)] transition-colors hover:bg-[var(--color-neutral-100,#f9f4ed)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${btnSize}`}
      >
        <Minus size={16} strokeWidth={2.75} />
      </button>

      <span
        aria-live="polite"
        className="min-w-[28px] text-center font-bold text-[16px] text-[var(--color-ink,#201e1d)]"
      >
        {value}
      </span>

      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || isMax}
        onClick={handleIncrement}
        className={`inline-flex items-center justify-center rounded-full bg-[var(--color-ground,#f5ead8)] text-[var(--color-ink,#201e1d)] transition-colors hover:bg-[var(--color-neutral-100,#f9f4ed)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${btnSize}`}
      >
        <Plus size={16} strokeWidth={2.75} />
      </button>
    </div>
  );
}

export default QtyStepper;
