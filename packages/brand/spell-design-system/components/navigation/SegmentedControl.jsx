import React from 'react';
export function SegmentedControl({ options = [], value, onChange }) {
  return (
    <div className="sp-seg" role="group">
      {options.map(o => { const v = typeof o === 'string' ? o : o.value; const l = typeof o === 'string' ? o : o.label;
        return <button key={v} type="button" className="sp-seg__opt" aria-pressed={v === value} onClick={() => onChange && onChange(v)}>{l}</button>; })}
    </div>
  );
}