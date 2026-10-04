import * as React from 'react';
/** Numbered how-to step: serif numeral in a lavender (or ivory) disc, serif title, italic subtitle. */
export interface NumberedStepProps {
  n: number | string;
  title: string;
  subtitle?: string;
  tone?: 'accent' | 'warm';
  children?: React.ReactNode;
}
export declare function NumberedStep(props: NumberedStepProps): JSX.Element;