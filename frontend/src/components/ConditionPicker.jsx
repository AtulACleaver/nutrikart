import React, { useRef } from 'react';
import { Check } from 'lucide-react';

const CONDITIONS = [
  {
    id: null,
    title: 'All Foods',
    limits: 'Balanced selection without dietary restrictions',
    bullets: ['Full catalogue selection', 'Balanced nutrition & protein', 'No dietary exclusions'],
  },
  {
    id: 'diabetic',
    title: 'Diabetic-Friendly',
    limits: '≤ 5g sugar, ≤ 200 kcal per serving',
    bullets: ['Low added sugar (≤ 5g/serving)', 'Under 200 calories per serving', 'High in complex fiber'],
  },
  {
    id: 'hypertension',
    title: 'Hypertension-Conscious',
    limits: '≤ 200mg sodium, ≤ 5g fat per serving',
    bullets: ['Low sodium (≤ 200mg/serving)', 'Low saturated fat', 'Heart-healthy choices'],
  },
  {
    id: 'weight_loss',
    title: 'Weight Management',
    limits: '≤ 150 kcal, ≤ 3g sat-fat per serving',
    bullets: ['Calorie-conscious (≤ 150 kcal)', 'Low saturated fat', 'Nutrient-dense whole foods'],
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
              <h4 className="font-['Caprasimo',serif] text-[17px] text-[var(--color-ink,#201e1d)] mb-2">
                {cond.title}
              </h4>
              <ul className="space-y-1.5">
                {cond.bullets.map((bullet, bIdx) => (
                  <li
                    key={bIdx}
                    className="text-[13px] text-[var(--color-neutral-800,#474238)] flex items-start gap-2 leading-snug"
                  >
                    <span className="text-[var(--color-sage-700,#56633f)] font-bold shrink-0">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ConditionPicker;

