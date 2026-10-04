import * as React from 'react';
/** Sidebar navigation row. Active = lavender fill (light) / purple fill (dark). */
export interface NavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  active?: boolean;
  count?: number;
  children: React.ReactNode;
}
export declare function NavItem(props: NavItemProps): JSX.Element;