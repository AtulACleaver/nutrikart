import React from 'react';

export function Icon({ icon: LucideIcon, size = 18, className = '', strokeWidth = 2.75, ...props }) {
  if (!LucideIcon) return null;
  return (
    <LucideIcon
      size={size}
      strokeWidth={strokeWidth}
      className={`shrink-0 ${className}`}
      {...props}
    />
  );
}

export default Icon;
