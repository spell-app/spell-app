import * as React from 'react';
/** The Spell hat mark as inline SVG; inherits currentColor. */
export interface LogoMarkProps extends React.SVGAttributes<SVGSVGElement> {
  /** Height in px (width follows 218:192) */
  size?: number;
  color?: string;
}
export declare function LogoMark(props: LogoMarkProps): JSX.Element;
