import React from 'react';
/** One control with a label row: label · actions · value · info icon (tooltip) — then the control (children). */
export function Fieldset({ label, actions, value, icon, tooltip, children }) {
  return (
    <fieldset className="sp-fieldset">
      <div className="sp-fieldset__row">
        <span>{label}</span>
        <span className="sp-fieldset__actions">
          {actions}
          {value != null && <span className="sp-fieldset__value">{value}</span>}
        </span>
        {(tooltip || icon) && (
          <span className="sp-tooltip-wrap sp-fieldset__icon" tabIndex={0}>
            {icon || <i className="fa-solid fa-circle-info" />}
            {tooltip && <span className="sp-tooltip" role="tooltip">{tooltip}</span>}
          </span>
        )}
      </div>
      {children}
    </fieldset>
  );
}
