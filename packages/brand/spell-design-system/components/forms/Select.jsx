import React from 'react';
export function Select({ label, hint, options = [], className, ...rest }) {
  return (
    <label className="sp-field">
      {label && <span className="sp-label">{label}</span>}
      <select className={'sp-select ' + (className || '')} {...rest}>
        {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <span className="sp-hint">{hint}</span>}
    </label>
  );
}