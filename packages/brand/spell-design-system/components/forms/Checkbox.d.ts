import * as React from 'react';
/** Checkbox. Round by default (Spell's to-do motif); `square` for forms/settings. `strike` crosses out the label when checked. */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  shape?: 'round' | 'square';
  strike?: boolean;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;