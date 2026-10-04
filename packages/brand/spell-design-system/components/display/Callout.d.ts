import * as React from 'react';
/** Ivory tip / note block. Defaults to the hat mark as icon; pass icon={null} to hide. */
export interface CalloutProps {
  tone?: 'warm' | 'tint';
  eyebrow?: string;
  title?: string;
  icon?: React.ReactNode | null;
  children: React.ReactNode;
}
export declare function Callout(props: CalloutProps): JSX.Element;