import * as React from 'react';
/** Collapsible group band inside a Panel — 12px mono caps on surface-tint, full-bleed. Hover shows tooltip; no (i) icon. */
export interface PanelSubHeadProps { title: string; tooltip?: React.ReactNode; open?: boolean; onToggle?: () => void; children?: React.ReactNode; }
export declare function PanelSubHead(props: PanelSubHeadProps): JSX.Element;
