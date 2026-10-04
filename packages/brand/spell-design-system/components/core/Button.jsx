import React from 'react';
const cx = (...a) => a.filter(Boolean).join(' ');
export function Button({ variant = 'primary', size = 'md', block = false, leadingIcon, trailingIcon, children, className, type = 'button', ...rest }) {
  return (
    <button type={type} className={cx('sp-btn', 'sp-btn--' + variant, size !== 'md' && 'sp-btn--' + size, block && 'sp-btn--block', className)} {...rest}>
      {leadingIcon}{children}{trailingIcon}
    </button>
  );
}