import React from 'react';
export function Textarea({ label, hint, spell = false, className, ...rest }) {
  return (
    <label className="sp-field">
      {label && <span className="sp-label">{label}</span>}
      <textarea className={'sp-textarea' + (spell ? ' sp-textarea--spell' : '') + ' ' + (className || '')} {...rest} />
      {hint && <span className="sp-hint">{hint}</span>}
    </label>
  );
}