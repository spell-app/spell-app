import React from 'react';
export function Tabs({ tabs = [], value, onChange }) {
  return (
    <div className="sp-tabs" role="tablist">
      {tabs.map(t => { const v = typeof t === 'string' ? t : t.value; const l = typeof t === 'string' ? t : t.label;
        return <button key={v} role="tab" className="sp-tab" aria-selected={v === value} onClick={() => onChange && onChange(v)}>{l}</button>; })}
    </div>
  );
}