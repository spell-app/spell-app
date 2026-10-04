import React from 'react';
export function Input({ label, hint, error, id, className, ...rest }) {
  const fid = id || (label ? 'in-' + String(label).toLowerCase().replace(/\W+/g, '-') : undefined);
  return (
    <label className="sp-field" htmlFor={fid}>
      {label && <span className="sp-label">{label}</span>}
      <input id={fid} className={'sp-input ' + (className || '')} aria-invalid={!!error} {...rest} />
      {(error || hint) && <span className={'sp-hint' + (error ? ' sp-hint--error' : '')}>{error || hint}</span>}
    </label>
  );
}