import * as React from 'react';
/** Pill segmented control for 2–4 mutually exclusive modes (e.g. Light / Dark, Phone / Desktop). */
export interface SegmentedControlProps {
  options: Array<string | { value: string; label: React.ReactNode }>;
  value: string;
  onChange?: (value: string) => void;
}
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;