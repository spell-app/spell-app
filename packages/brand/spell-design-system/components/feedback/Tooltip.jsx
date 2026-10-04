import React from 'react';
export function Tooltip({ content, open, children }) {
  return (
    <span className="sp-tooltip-wrap">
      {children}
      <span className="sp-tooltip" role="tooltip" data-open={open ? 'true' : undefined}>{content}</span>
    </span>
  );
}