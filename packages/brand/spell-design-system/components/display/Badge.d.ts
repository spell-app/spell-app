import * as React from 'react';
/** Small status pill. */
export interface BadgeProps {
  tone?: 'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'solid';
  dot?: boolean;
  children: React.ReactNode;
}
export declare function Badge(props: BadgeProps): JSX.Element;