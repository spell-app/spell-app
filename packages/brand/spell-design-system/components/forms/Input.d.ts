import * as React from 'react';
/** Single-line text field with optional label, hint and error. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}
export declare function Input(props: InputProps): JSX.Element;