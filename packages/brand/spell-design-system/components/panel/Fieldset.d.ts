import * as React from 'react';
/** A labelled control. Slots: label, actions (e.g. Auto toggle), value (current reading), icon (defaults to info), tooltip; children = the control. */
export interface FieldsetProps { label: React.ReactNode; actions?: React.ReactNode; value?: React.ReactNode; icon?: React.ReactNode; tooltip?: React.ReactNode; children?: React.ReactNode; }
export declare function Fieldset(props: FieldsetProps): JSX.Element;
