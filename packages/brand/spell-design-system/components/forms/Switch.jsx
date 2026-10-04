import React from 'react';
export function Switch({ checked = false, onChange, label, disabled }) {
  const btn = <button type="button" role="switch" aria-checked={checked} disabled={disabled} className="sp-switch" onClick={() => onChange && onChange(!checked)} />;
  if (!label) return btn;
  return <label className="sp-check" style={{ justifyContent: 'space-between', width: '100%' }}><span>{label}</span>{btn}</label>;
}