import React from 'react';
export function Toast({ icon, children, actionLabel, onAction }) {
  return (
    <div className="sp-toast" role="status">
      <span className="sp-toast__icon">{icon || <i className="fa-solid fa-wand-magic-sparkles" />}</span>
      <span>{children}</span>
      {actionLabel && <button className="sp-toast__action" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}