import * as React from 'react';
/** Modal dialog on a blurred aubergine scrim. `inline` renders the panel without overlay (for specimens). */
export interface DialogProps {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
  inline?: boolean;
}
export declare function Dialog(props: DialogProps): JSX.Element | null;