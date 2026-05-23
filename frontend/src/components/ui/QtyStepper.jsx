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

  const config = {
    sm: {
      btn: 'w-[28px] h-[28px]',
      icon: 13,
      num: 'min-w-[18px] text-[13px]',
      container: 'p-0.5 gap-1',
    },
    md: {
      btn: 'w-[32px] h-[32px]',
      icon: 14,
      num: 'min-w-[22px] text-[14px]',
      container: 'p-0.5 gap-1.5',
    },
    lg: {
      btn: 'w-[38px] h-[38px]',
      icon: 16,
      num: 'min-w-[26px] text-[15px]',
      container: 'p-1 gap-2',
    },
  }[size] || {
    btn: 'w-[30px] h-[30px]',
    icon: 13,
    num: 'min-w-[20px] text-[13px]',
    container: 'p-0.5 gap-1',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full bg-[var(--color-surface,#ebddc5)] select-none shrink-0 ${config.container} ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || isMin}
        onClick={handleDecrement}
        className={`inline-flex items-center justify-center rounded-full bg-[var(--color-ground,#f5ead8)] text-[var(--color-ink,#201e1d)] transition-colors hover:bg-[var(--color-neutral-100,#f9f4ed)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${config.btn}`}
      >
        <Minus size={config.icon} strokeWidth={2.5} />
      </button>

      <span
        aria-live="polite"
        className={`text-center font-semibold text-[var(--color-ink,#201e1d)] ${config.num}`}
      >
        {value}
      </span>

      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || isMax}
        onClick={handleIncrement}
        className={`inline-flex items-center justify-center rounded-full bg-[var(--color-ground,#f5ead8)] text-[var(--color-ink,#201e1d)] transition-colors hover:bg-[var(--color-neutral-100,#f9f4ed)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${config.btn}`}
      >
        <Plus size={config.icon} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default QtyStepper;

