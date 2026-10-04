import React from 'react';
export function BuildProgress({ title = 'Building your app…', steps = [], current = 0 }) {
  return (
    <div className="sp-progress">
      <div className="sp-progress__title"><i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--text-strong)' }} />{title}</div>
      {steps.map((s, i) => (
        <div key={s} className={'sp-progress__item' + (i === current ? ' sp-progress__item--active' : i > current ? ' sp-progress__item--pending' : '')}>
          <span className="sp-progress__mark" />{s}
        </div>
      ))}
    </div>
  );
}