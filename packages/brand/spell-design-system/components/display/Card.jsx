import React from 'react';
export function Card({ tone = 'default', interactive = false, padding, className, style, children, ...rest }) {
  const cls = ['sp-card', tone === 'flat' && 'sp-card--flat', tone === 'tint' && 'sp-card--tint', tone === 'warm' && 'sp-card--warm', interactive && 'sp-card--interactive', className].filter(Boolean).join(' ');
  return <div className={cls} style={{ ...(padding != null ? { padding } : null), ...style }} {...rest}>{children}</div>;
}