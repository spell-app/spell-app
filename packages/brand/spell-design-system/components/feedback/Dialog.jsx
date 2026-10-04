import React from 'react';
export function Dialog({ open, title, children, actions, onClose, inline = false }) {
  if (!open) return null;
  const box = (
    <div className="sp-dialog" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
      {title && <h3 className="sp-dialog__title">{title}</h3>}
      <div className="sp-dialog__body">{children}</div>
      {actions && <div className="sp-dialog__actions">{actions}</div>}
    </div>
  );
  return inline ? box : <div className="sp-overlay" onClick={onClose}>{box}</div>;
}