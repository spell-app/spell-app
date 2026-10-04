import * as React from 'react';
/**
 * The spell input: serif natural-language textarea with a round purple send button. Spell's hero component.
 * @startingPoint section="Brand" subtitle="Prompt composer for writing a spell" viewport="700x200"
 */
export interface SpellComposerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  /** Extra controls left of the send button (e.g. language select, attach) */
  toolbar?: React.ReactNode;
  rows?: number;
}
export declare function SpellComposer(props: SpellComposerProps): JSX.Element;