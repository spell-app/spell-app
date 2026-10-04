import React from 'react';
/** Collapsible group band inside a Panel. Collapsed siblings stack tightly. */
export function PanelSubHead({ title, tooltip, open = true, onToggle, children }) {
  return (
    <>
      <div className="sp-panel__subhead sp-tooltip-wrap" role="button" aria-expanded={open} onClick={onToggle}>
        <span className="sp-panel__title">{title}</span>
        <i className={'sp-panel__chevron fa-solid ' + (open ? 'fa-chevron-up' : 'fa-chevron-down')} />
        {tooltip && <span className="sp-tooltip" role="tooltip">{tooltip}</span>}
      </div>
      {open && <div className="sp-panel__body">{children}</div>}
    </>
  );
}
