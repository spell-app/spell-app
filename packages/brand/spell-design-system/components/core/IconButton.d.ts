import * as React from 'react';
/** Square/round icon-only button. Always pass a label. */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ink' | 'secondary' | 'soft' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label; also used as title */
  label: string;
  children: React.ReactNode;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;