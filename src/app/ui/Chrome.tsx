//
//  ## Generic SUI-derived app chrome: menus, submenus, dropdowns and pass-through views.
//
//  NOTE: this was `ui.tsx`, and used to BE the `UI` barrel itself -- re-exporting `./Form`,
//  `./ProjectDropdown`, `./FileDropdown` and `./Actions` so they showed up on it.
//  `./index.ts` owns `UI` now, so this is a plain leaf module -- add new exports there, not here.
//

import * as SUI from "semantic-ui-react"

import { view } from "~/util"

import { Actions } from "./Actions"
/** SUI pass-throughs as reactive views. */
export const Button = view(SUI.Button)
export const Card = view(SUI.Card)
export const Column = view(SUI.Grid.Column)
export const Container = view(SUI.Container)
export const Grid = view(SUI.Grid)
export const Icon = view(SUI.Icon)
export const Row = view(SUI.Grid.Row)
export const Segment = view(SUI.Segment)

/**
 * Component: Top-level app menu.
 */
export const AppMenu = view((props: SUI.MenuProps) => (
  <SUI.Menu inverted color="violet" attached className="AppMenu medium-short tight" {...props} />
))

/**
 * Component: Panel menu.
 */
export const PanelMenu = view((props: SUI.MenuProps) => (
  <SUI.Menu inverted color="purple" attached="top" className="PanelMenu short tight" {...props} />
))

/**
 * Component: Left / Center / Right Sub-Menus.
 */
export const Submenu = view(({ left, center, right, spring, children, ...props }: SubmenuProps) => {
  const style: { minWidth?: string } = {}
  if (left || center || right) style.minWidth = "33.3%"
  return (
    <SUI.Menu.Menu position={right ? "right" : "left"} style={style} {...props}>
      {spring && (center || right) && <Spring />}
      {children}
      {spring && (center || left) && <Spring />}
    </SUI.Menu.Menu>
  )
})
export type SubmenuProps = Prettify<
  SUI.MenuProps & {
    left?: boolean
    center?: boolean
    right?: boolean
    spring?: boolean
    children?: ReactNode
  }
>
/**
 * Component: Menu header item.
 */
export const MenuHeader = view((props: SUI.MenuItemProps) => <SUI.Menu.Item header {...props} />)

/**
 * Component: `Spring` to eat up space beside objects.
 */
export const Spring = view((props: SUI.MenuItemProps) => <SUI.Menu.Item className="spring no-border" {...props} />)

/** Component: A "..." menu. */
export const MoreMenu = view(
  ({ stub, item = true, icon = "ellipsis horizontal", children, ...props }: MoreMenuProps) => {
    if (stub) return <SUI.Menu.Item disabled icon={icon} {...(props as SUI.MenuItemProps)} />
    return (
      <SUI.Dropdown item={item} icon={icon} {...props}>
        <SUI.Dropdown.Menu>{children}</SUI.Dropdown.Menu>
      </SUI.Dropdown>
    )
  }
)
/**
 * Component: Label that goes next to a dropdown.
 */
export const DropdownLabel = view((props: SUI.MenuItemProps) => <SUI.Menu.Item className="dropdown-label" {...props} />)

/**
 * Icons
 */
export const ARROW_COLLAPSED_ICON = "caret right"
export const ARROW_EXPANDED_ICON = "caret down"

//////////////////////
// Project UI
//////////////////////
export const PROJECT_ICON = "app store ios"
export const ProjectActionsDropdown = view((props: MoreMenuProps) => {
  return <MoreMenu {...props}>{Actions.PROJECT_DROPDOWN_ACTIONS}</MoreMenu>
})

//////////////////////
// File UI
//////////////////////
export const FileActionsDropdown = view((props: MoreMenuProps) => {
  return <MoreMenu {...props}>{Actions.FILE_DROPDOWN_ACTIONS}</MoreMenu>
})
export const FILE_ICON = "file code"
export type MoreMenuProps = Prettify<
  SUI.DropdownProps & {
    stub?: boolean
    item?: boolean
    icon?: string
    children?: ReactNode
  }
>
