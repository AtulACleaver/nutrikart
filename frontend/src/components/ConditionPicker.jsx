import React, { useRef } from 'react';
import { Check } from 'lucide-react';

const CONDITIONS = [
  {
    id: null,
    title: 'All Foods',
    subtitle: 'Standard Basket',
    limits: 'Balanced catalogue without condition filtering',
    bullets: ['Open catalogue selection', 'Optimizes for protein & fiber density', 'No heuristic exclusions'],
  },
  {
    id: 'diabetic',
    title: 'Diabetic-Friendly',
    subtitle: 'Sugar & Calorie Limits',
    limits: '≤ 5g sugar, ≤ 200 kcal per serving',
    bullets: ['≤ 5.0g added sugar/serving', '≤ 200 kcal energy limit', 'Rewards complex fiber & protein'],
  },
  {
    id: 'hypertension',
    title: 'Hypertension-Conscious',
    subtitle: 'Sodium & Fat Limits',
    limits: '≤ 200mg sodium, ≤ 5g fat per serving',
    bullets: ['≤ 200mg sodium/serving', '≤ 5.0g total fat/serving', 'Penalizes high-sodium preserves'],
  },
  {
    id: 'weight_loss',
    title: 'Weight Management',
    subtitle: 'Calorie & Sat-Fat Limits',
    limits: '≤ 150 kcal, ≤ 3g sat-fat per serving',
    bullets: ['≤ 150 kcal energy limit/serving', '≤ 3.0g saturated fat limit', '≤ 8.0g sugar limit per serving'],
  },
];

export function ConditionPicker({
  value = null,
  onChange,
  variant = 'cards', // 'cards' (desktop 2x2) | 'pills' (mobile)
  className = '',
}) {
  const containerRef = useRef(null);

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % CONDITIONS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + CONDITIONS.length) % CONDITIONS.length;
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange?.(CONDITIONS[index].id);
      return;
    }

    if (nextIndex !== null) {
      onChange?.(CONDITIONS[nextIndex].id);
      const buttons = containerRef.current?.querySelectorAll('[role="radio"]');
      buttons?.[nextIndex]?.focus();
    }
  };

  if (variant === 'pills') {
    return (
      <div
        ref={containerRef}
        role="radiogroup"
        aria-label="Health condition options"
        className={`flex flex-col gap-2.5 ${className}`}
      >
        {CONDITIONS.map((cond, idx) => {
          const isSelected = value === cond.id;
          return (
            <button
              key={String(cond.id)}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange?.(cond.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`h-[56px] px-5 rounded-full flex items-center justify-between border transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)] ${
                isSelected
                  ? 'bg-[var(--color-sage-100,#f0fae1)] border-[var(--color-sage-700,#56633f)] text-[var(--color-sage-900,#272e1b)] font-bold'
                  : 'bg-[var(--color-surface,#ebddc5)] border-[var(--color-divider)] text-[var(--color-ink,#201e1d)] font-medium hover:bg-[var(--color-neutral-200,#eee7db)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-[var(--color-sage-700,#56633f)] bg-[var(--color-sage-700,#56633f)]'
                      : 'border-[var(--color-neutral-600,#82796a)]'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className="text-[15px]">{cond.title}</span>
              </div>
              <span className="text-[12px] text-[var(--color-neutral-700,#645c50)] truncate max-w-[160px]">
                {cond.limits}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="Health condition options"
      className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 ${className}`}
    >
      {CONDITIONS.map((cond, idx) => {
        const isSelected = value === cond.id;
        return (
          <button
            key={String(cond.id)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange?.(cond.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative p-5 rounded-[24px] text-left border transition-all cursor-pointer flex flex-col justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)] ${
              isSelected
                ? 'bg-[var(--color-sage-100,#f0fae1)] border-2 border-[var(--color-sage-700,#56633f)] shadow-sm'
                : 'bg-[var(--color-surface,#ebddc5)] border-[var(--color-divider)] hover:border-[var(--color-neutral-500,#a19786)]'
            }`}
          >
            {isSelected && (
              <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--color-sage-700,#56633f)] text-white flex items-center justify-center shadow-xs">
                <Check size={14} strokeWidth={3} />
              </span>
            )}

            <div>
              <h4 className="font-['Caprasimo',serif] text-[18px] text-[var(--color-ink,#201e1d)] mb-1">
                {cond.title}
              </h4>
              <p className="text-[12px] font-semibold text-[var(--color-sage-800,#3d472b)] mb-3">
                {cond.subtitle}
              </p>
              <ul className="space-y-1 mb-2">
                {cond.bullets.map((bullet, bIdx) => (
                  <li
                    key={bIdx}
                    className="text-[12px] text-[var(--color-neutral-800,#474238)] flex items-start gap-1.5 leading-snug"
                  >
                    <span className="text-[var(--color-sage-600,#728157)] shrink-0">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-[var(--color-divider)] text-[11px] text-[var(--color-neutral-700,#645c50)] italic">
              Basis: per serving (normalized)
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ConditionPicker;
