import React from 'react';
export function NumberedStep({ n, title, subtitle, tone = 'accent', children }) {
  return (
    <div className={'sp-step' + (tone === 'warm' ? ' sp-step--warm' : '')}>
      <span className="sp-step__num">{n}</span>
      <h4 className="sp-step__title">{title}</h4>
      {subtitle && <p className="sp-step__sub">{subtitle}</p>}
      {children && <p className="sp-step__body">{children}</p>}
    </div>
  );
}