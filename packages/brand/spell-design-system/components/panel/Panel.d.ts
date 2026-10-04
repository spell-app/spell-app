import * as React from 'react';
/**
 * Inspector-style side panel: white card, 16px padding, 8px rhythm. Holds PanelHeader, PanelSubHead and Fieldset.
 * @startingPoint section="Panel" subtitle="Inspector panel with header, sub-heads and fieldsets" viewport="420x560"
 */
export interface PanelProps { children?: React.ReactNode; className?: string; style?: React.CSSProperties; }
export declare function Panel(props: PanelProps): JSX.Element;
