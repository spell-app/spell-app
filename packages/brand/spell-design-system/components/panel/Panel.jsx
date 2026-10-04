import React from 'react';
export function Panel({ children, className = '', style }) {
  return <div className={'sp-panel ' + className} style={style}>{children}</div>;
}
