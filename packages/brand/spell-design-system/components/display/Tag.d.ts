import * as React from 'react';
/** Selectable filter chip; optional remove affordance. */
export interface TagProps {
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  children: React.ReactNode;
}
export declare function Tag(props: TagProps): JSX.Element;