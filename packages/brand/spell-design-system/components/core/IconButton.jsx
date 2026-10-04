import React from 'react';
const cx = (...a) => a.filter(Boolean).join(' ');
export function IconButton({ variant = 'ghost', size = 'md', label, children, className, ...rest }) {
  return (
    <button type="button" aria-label={label} title={label} className={cx('sp-btn sp-iconbtn', 'sp-btn--' + variant, size !== 'md' && 'sp-btn--' + size, className)} {...rest}>{children}</button>
  );
}