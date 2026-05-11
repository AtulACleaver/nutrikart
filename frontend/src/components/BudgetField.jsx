import React from 'react';
import { Chip } from './ui';

const PRESET_BUDGETS = [300, 500, 1000, 1500, 2000];

export function BudgetField({ value = 500, onChange, className = '' }) {
  const numValue = Number(value) || 0;
  const isTooLow = numValue < 50;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor="plan-budget-input"
          className="font-bold text-[15px] text-[var(--color-ink,#201e1d)]"
        >
          Weekly Grocery Budget
        </label>
        <span className="text-[13px] text-[var(--color-neutral-700,#645c50)]">
          Target spending limit
        </span>
      </div>

      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute left-5 top-1/2 -translate-y-1/2 font-['Caprasimo',serif] text-[26px] text-[var(--color-neutral-700,#645c50)] select-none"
        >
          ₹
        </span>
        <input
          id="plan-budget-input"
          type="number"
          min="50"
          step="50"
          value={value === '' ? '' : value}
          onChange={(e) => {
            const val = e.target.value === '' ? '' : Number(e.target.value);
            onChange?.(val);
          }}
          aria-invalid={isTooLow}
          aria-describedby={isTooLow ? 'budget-min-warning' : undefined}
          className={`w-full h-[64px] pl-12 pr-6 rounded-2xl bg-[var(--color-surface,#ebddc5)] font-['Caprasimo',serif] text-[28px] text-[var(--color-ink,#201e1d)] border focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)] ${
            isTooLow
              ? 'border-[var(--color-terracotta-600,#b2622d)] text-[var(--color-terracotta-800,#643312)]'
              : 'border-[var(--color-divider)]'
          }`}
        />
      </div>

      {isTooLow && (
        <p
          id="budget-min-warning"
          role="alert"
          className="text-[13px] font-semibold text-[var(--color-terracotta-700,#8c491a)]"
        >
          Minimum plan budget is ₹50 to assemble a viable basket.
        </p>
      )}

      {/* Preset quick chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[12px] font-bold text-[var(--color-neutral-700,#645c50)] mr-1">
          Quick:
        </span>
        {PRESET_BUDGETS.map((amt) => (
          <Chip
            key={amt}
            selected={numValue === amt}
            onClick={() => onChange?.(amt)}
            className="h-[36px] text-[13px] px-3.5"
          >
            ₹{amt}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export default BudgetField;
