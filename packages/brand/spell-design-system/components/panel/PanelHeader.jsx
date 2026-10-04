import React from 'react';
/** Title band at the top of a Panel. Collapsible when onToggle is passed. */
export function PanelHeader({ title, tooltip, open = true, onToggle, children }) {
  return (
    <>
      <div className="sp-panel__header sp-tooltip-wrap" role={onToggle ? 'button' : undefined} aria-expanded={onToggle ? open : undefined} onClick={onToggle}>
        <span className="sp-panel__title">{title}</span>
        {onToggle && <i className={'sp-panel__chevron fa-solid ' + (open ? 'fa-chevron-up' : 'fa-chevron-down')} />}
        {tooltip && <span className="sp-tooltip" role="tooltip">{tooltip}</span>}
      </div>
      {open && children && <div className="sp-panel__body">{children}</div>}
    </>
  );
}
