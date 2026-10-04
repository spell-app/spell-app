import React from 'react';
import { LOCKUPS } from './lockupPaths.js';
import { LogoMark } from './LogoMark.jsx';
// Outlined lockups (P052/Palatino paths) — hat is centred on the wordmark's cap height. No font needed.
export function Logo({ size = 32, product = 'spell', tagline = false, color = 'currentColor', markOnly = false, title = 'Spell' }) {
  if (markOnly) return <LogoMark size={size} color={color} />;
  const key = product === 'app' ? 'spell-app-lockup' : tagline ? 'spell-lockup-tagline' : 'spell-lockup';
  const L = LOCKUPS[key];
  const [, , w, h] = L.vb.split(' ').map(Number);
  // size = cap-height-ish wordmark height; tagline lockup is taller
  const height = size * (h / 118);
  return <svg role="img" aria-label={title} viewBox={L.vb} height={height} width={height * w / h} style={{ display: 'block', color, flex: 'none' }}><g fill="currentColor" dangerouslySetInnerHTML={{ __html: L.body }} /></svg>;
}
