import * as React from 'react';
/** Rounded-square app icon. Primary: aubergine hat on white (most common use). Alternates: white on aubergine, aubergine on lavender. */
export interface AppIconProps {
  size?: number;
  /** white = primary (default); aubergine and lavender are alternates */
  tone?: 'white' | 'aubergine' | 'lavender';
}
export declare function AppIcon(props: AppIconProps): JSX.Element;
