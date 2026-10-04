import React from 'react';
import { LogoMark } from './LogoMark.jsx';
export function AppIcon({ size = 64, tone = 'white' }) {
  const mod = tone === 'aubergine' ? ' sp-appicon--aubergine' : tone === 'lavender' ? ' sp-appicon--lavender' : '';
  return <span className={'sp-appicon' + mod} style={{ width: size }}><LogoMark size={size * 0.72} /></span>;
}
