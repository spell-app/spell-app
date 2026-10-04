import * as React from 'react';
/** Spell's signature "building" checklist: done = filled check, current = pulsing lavender dot, pending = outline. */
export interface BuildProgressProps {
  title?: string;
  steps: string[];
  /** Index of the in-progress step; steps.length = all done */
  current?: number;
}
export declare function BuildProgress(props: BuildProgressProps): JSX.Element;