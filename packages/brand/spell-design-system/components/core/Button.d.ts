import * as React from 'react';
/**
 * Pill-shaped action button. One primary per view.
 * @startingPoint section="Core" subtitle="Pill buttons — primary, ink, secondary, soft, ghost" viewport="700x260"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = purple fill; ink = aubergine fill (marketing); secondary = outlined card; soft = lavender tint; ghost = text-only; danger */
  variant?: 'primary' | 'ink' | 'secondary' | 'soft' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;