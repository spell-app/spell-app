import * as React from 'react';
/** Hover/focus label above the trigger. Keep under ~6 words. */
export interface TooltipProps {
  content: React.ReactNode;
  /** Force visible (specimens) */
  open?: boolean;
  children: React.ReactNode;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;