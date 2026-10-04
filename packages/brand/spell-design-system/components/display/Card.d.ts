import * as React from 'react';
/**
 * Surface container. 16px radius, hairline border, soft violet-tinted shadow.
 * @startingPoint section="Display" subtitle="Card surfaces — default, tint, warm, interactive" viewport="700x300"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** default = white + shadow; flat = border only; tint = lavender wash; warm = ivory (previews, quotes, tips) */
  tone?: 'default' | 'flat' | 'tint' | 'warm';
  interactive?: boolean;
  padding?: number | string;
}
export declare function Card(props: CardProps): JSX.Element;