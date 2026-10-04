import React from 'react';
export function Radio({ label, className, ...rest }) {
  return (
    <label className={'sp-check ' + (className || '')}>
      <input type="radio" {...rest} />
      {label && <span>{label}</span>}
    </label>
  );
}