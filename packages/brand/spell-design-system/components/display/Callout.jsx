import React from 'react';
import { LogoMark } from '../brand/LogoMark.jsx';
export function Callout({ tone = 'warm', eyebrow, title, icon, children }) {
  return (
    <div className={'sp-callout' + (tone === 'tint' ? ' sp-callout--tint' : '')}>
      {icon !== null && <div className="sp-callout__icon">{icon || <LogoMark size={30} style={{ color: 'var(--text-strong)' }} />}</div>}
      <div>
        {eyebrow && <div className="sp-callout__eyebrow">{eyebrow}</div>}
        {title && <h4 className="sp-callout__title">{title}</h4>}
        <p className="sp-callout__body">{children}</p>
      </div>
    </div>
  );
}