import React from 'react';
export function Badge({ tone = 'accent', dot = false, children }) {
  return <span className={'sp-badge' + (tone !== 'accent' ? ' sp-badge--' + tone : '')}>{dot && <span className="sp-badge__dot" />}{children}</span>;
}