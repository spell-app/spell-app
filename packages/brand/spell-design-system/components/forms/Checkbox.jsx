import React from 'react';
export function Checkbox({ label, shape = 'round', strike = false, checked, className, ...rest }) {
  return (
    <label className={'sp-check' + (shape === 'square' ? ' sp-check--square' : '') + (strike && checked ? ' sp-check--done' : '') + ' ' + (className || '')}>
      <input type="checkbox" checked={checked} {...rest} />
      {label && <span>{label}</span>}
    </label>
  );
}