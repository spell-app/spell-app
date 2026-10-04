import * as React from 'react';
/** Title band at the top of a Panel — 14px mono caps on brand-100, flush to the panel's top edge. */
export interface PanelHeaderProps { title: string; tooltip?: React.ReactNode; open?: boolean; onToggle?: () => void; children?: React.ReactNode; }
export declare function PanelHeader(props: PanelHeaderProps): JSX.Element;
