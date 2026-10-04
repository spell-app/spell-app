import React from 'react';
export function SpellComposer({ value, defaultValue, onChange, onSubmit, placeholder = 'Describe what you want to build…', toolbar, rows = 2 }) {
  const [v, setV] = React.useState(defaultValue || '');
  const val = value != null ? value : v;
  const set = x => { if (value == null) setV(x); onChange && onChange(x); };
  return (
    <form className="sp-composer" onSubmit={e => { e.preventDefault(); if (val.trim()) onSubmit && onSubmit(val); }}>
      <textarea rows={rows} value={val} placeholder={placeholder} onChange={e => set(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && val.trim()) onSubmit && onSubmit(val); }} />
      <div className="sp-composer__bar">
        {toolbar}
        <button type="submit" className="sp-composer__send" aria-label="Cast spell" disabled={!val.trim()}><i className="fa-solid fa-arrow-right" /></button>
      </div>
    </form>
  );
}