import React from 'react';

const VARIANT_STYLES = {
  basket: 'bg-[var(--color-terracotta-700,#8c491a)] hover:bg-[var(--color-terracotta-800,#643312)] active:bg-[var(--color-terracotta-900,#402310)] text-[#fff2eb]',
  plan: 'bg-[var(--color-sage-700,#56633f)] hover:bg-[var(--color-sage-800,#3d472b)] active:bg-[var(--color-sage-900,#272e1b)] text-[#fff2eb]',
  secondary: 'bg-transparent border border-[var(--color-divider)] text-[var(--color-ink,#201e1d)] hover:bg-[color-mix(in_srgb,var(--color-ink,#201e1d)_7%,transparent)] active:bg-[color-mix(in_srgb,var(--color-ink,#201e1d)_14%,transparent)]',
  ghost: 'bg-transparent text-[var(--color-terracotta-700,#8c491a)] hover:bg-[var(--color-terracotta-100,#fff2eb)] active:bg-[var(--color-terracotta-200,#ffe1d0)]',
  danger: 'bg-[var(--color-terracotta-700,#8c491a)] hover:bg-[var(--color-terracotta-800,#643312)] text-[#fff2eb]',
};

const SIZE_STYLES = {
  sm: 'h-[44px] px-4 text-[15px]',
  md: 'h-[48px] px-5 text-[16px]',
  lg: 'h-[52px] px-6 text-[17px]',
  xl: 'h-[56px] px-7 text-[18px]',
};

export function Button({
  children,
  variant = 'plan',
  size = 'md',
  icon: IconComponent,
  iconPosition = 'left',
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.plan;
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-["Caprasimo",serif] whitespace-nowrap transition-colors select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)] focus-visible:outline-offset-2 ${variantClass} ${sizeClass} ${
        disabled ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      {...props}
    >
      {IconComponent && iconPosition === 'left' && (
        <span className="inline-flex shrink-0 items-center">{IconComponent}</span>
      )}
      <span className="inline-flex items-center justify-center gap-2 [&>svg]:shrink-0">{children}</span>
      {IconComponent && iconPosition === 'right' && (
        <span className="inline-flex shrink-0 items-center">{IconComponent}</span>
      )}
    </button>
  );
}

export default Button;

