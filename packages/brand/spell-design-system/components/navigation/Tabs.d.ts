import * as React from 'react';
/** Underline tabs for switching views within a page. */
export interface TabsProps {
  tabs: Array<string | { value: string; label: React.ReactNode }>;
  value: string;
  onChange?: (value: string) => void;
}
export declare function Tabs(props: TabsProps): JSX.Element;