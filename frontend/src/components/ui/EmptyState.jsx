import React from 'react';

const TONE_STYLES = {
  sage: 'bg-[var(--color-sage-100,#f0fae1)] text-[var(--color-sage-700,#56633f)]',
  terracotta: 'bg-[var(--color-terracotta-100,#fff2eb)] text-[var(--color-terracotta-700,#8c491a)]',
  neutral: 'bg-[var(--color-neutral-200,#eee7db)] text-[var(--color-neutral-700,#645c50)]',
};

export function EmptyState({
  icon: IconComponent,
  tone = 'sage',
  title,
  body,
  primaryAction,
  secondaryAction,
  className = '',
}) {
  const toneClass = TONE_STYLES[tone] || TONE_STYLES.sage;

  return (
    <div
      className={`flex flex-col items-start text-left max-w-[560px] py-8 ${className}`}
      role="region"
      aria-label={title || 'Empty state'}
    >
      {IconComponent && (
        <div
          className={`w-[64px] h-[64px] rounded-full flex items-center justify-center mb-4 shrink-0 ${toneClass}`}
        >
          {IconComponent}
        </div>
      )}

      {title && (
        <h3 className="font-['Caprasimo',serif] text-[22px] md:text-[24px] text-[var(--color-ink,#201e1d)] leading-tight mb-2">
          {title}
        </h3>
      )}

      {body && (
        <p className="text-[14px] md:text-[15px] text-[var(--color-neutral-800,#474238)] leading-relaxed mb-5">
          {body}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export default EmptyState;

