import React from 'react';

export function Skeleton({
  className = '',
  radius = 'rounded-md',
  width,
  height,
  style = {},
  ...props
}) {
  const dynamicStyle = {
    ...style,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  return (
    <div
      aria-hidden="true"
      style={dynamicStyle}
      className={`bg-[var(--color-neutral-200,#eee7db)] animate-pulse motion-reduce:animate-none ${radius} ${className}`}
      {...props}
    />
  );
}

export default Skeleton;
