import * as React from 'react';
/** Native select styled to match Input. */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options: Array<string | { value: string; label: string }>;
}
export declare function Select(props: SelectProps): JSX.Element;