import React from 'react';
export function Tag({ selected, onClick, onRemove, children }) {
  return (
    <button type="button" className="sp-tag" aria-pressed={!!selected} onClick={onClick}>
      {children}
      {onRemove && <span className="sp-tag__x" onClick={e => { e.stopPropagation(); onRemove(); }}>×</span>}
    </button>
  );
}