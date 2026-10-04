import * as React from 'react';
/** Multi-line field. `spell` sets the text in the serif spell face — use for natural-language program text. */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  spell?: boolean;
}
export declare function Textarea(props: TextareaProps): JSX.Element;