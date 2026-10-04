import * as React from 'react';
/**
 * Spell lockup as outlined SVG (Palatino-metric paths + hat mark), hat vertically centred on the cap height.
 * Also shipped as files: assets/logo/spell-lockup*.svg (currentColor / -aubergine / -white).
 * @startingPoint section="Brand" subtitle="Spell / Spell App lockups" viewport="700x240"
 */
export interface LogoProps {
  /** Lockup height in px for the plain lockup (others scale proportionally) */
  size?: number;
  product?: 'spell' | 'app';
  /** Adds "All magic, no fuss." beneath the wordmark (product="spell" only) */
  tagline?: boolean;
  color?: string;
  markOnly?: boolean;
  title?: string;
}
export declare function Logo(props: LogoProps): JSX.Element;
