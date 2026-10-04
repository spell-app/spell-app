import * as React from 'react';
/** Inverse (aubergine) notification. Short, past-tense, one action max. */
export interface ToastProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}
export declare function Toast(props: ToastProps): JSX.Element;