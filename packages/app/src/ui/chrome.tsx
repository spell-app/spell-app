/** @jsxImportSource react */
//
//  ## Generic SUI-derived app chrome: menus, submenus and dropdowns.
//  Plain `semantic-ui-react` pass-throughs (`UI.Button` ...) live in `SUIPassThroughs.ts`.
//
//  NOTE: this was `ui.tsx`, and used to BE the `UI` barrel itself -- re-exporting `./Form`,
//  `./ProjectDropdown`, `./FileDropdown` and `./Actions` so they showed up on it.
//  `./index.ts` owns `UI` now, so this is a plain leaf module -- add new exports there, not here.
//

import * as SUI from "semantic-ui-react"

import { view } from "$/util"

import { Actions } from "./Actions"

/****************
 * ### `<AppMenu>`
 * Top-level app menu, attached to top of the page.
 ****************/
export const AppMenu = view((props: SUI.MenuProps) => (
  <SUI.Menu inverted color="violet" attached className="AppMenu medium-short tight" {...props} />
))

/****************
 * ### `<PanelMenu>`
 * Menu attached to top of a panel, e.g. `<AppToolbar>`.
 ****************/
export const PanelMenu = view((props: SUI.MenuProps) => (
  <SUI.Menu inverted color="purple" attached="top" className="PanelMenu short tight" {...props} />
))

/****************
 * ### `<Submenu>`
 * Left / center / right sub-menu, with optional `<Spring>` spacers between sections.
 ****************/
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

/** Props for `<Submenu>`. */
export type SubmenuProps = Prettify<
  SUI.MenuProps & {
    /** Left-aligned section -- gets a fixed `33.3%` min-width so left/center/right line up. */
    left?: boolean
    /** Center section -- gets a fixed `33.3%` min-width so left/center/right line up. */
    center?: boolean
    /** Right-aligned section -- gets a fixed `33.3%` min-width so left/center/right line up. */
    right?: boolean
    /** Add a `<Spring>` spacer between this section and its neighbor(s). */
    spring?: boolean
    children?: ReactNode
  }
>

/****************
 * ### `<MenuHeader>`
 * Menu header item.
 ****************/
export const MenuHeader = view((props: SUI.MenuItemProps) => <SUI.Menu.Item header {...props} />)

/****************
 * ### `<Spring>`
 * Invisible, borderless menu item that eats up remaining space -- used to push neighbors apart.
 ****************/
export const Spring = view((props: SUI.MenuItemProps) => <SUI.Menu.Item className="spring no-border" {...props} />)

/****************
 * ### `<MoreMenu>`
 * A "..." dropdown menu.
 * - Pass `stub` to render a disabled placeholder icon instead (e.g. while the real menu isn't implemented yet).
 ****************/
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

/****************
 * ### `<DropdownLabel>`
 * Label that goes next to a dropdown, e.g. `<UI.ProjectDropdown showLabel>`'s "Project:" label.
 ****************/
export const DropdownLabel = view((props: SUI.MenuItemProps) => <SUI.Menu.Item className="dropdown-label" {...props} />)

////////////////
// ## Icons
////////////////

/** Icon name for a collapsed (pointing right) disclosure arrow. */
export const ARROW_COLLAPSED_ICON = "caret right"
/** Icon name for an expanded (pointing down) disclosure arrow. */
export const ARROW_EXPANDED_ICON = "caret down"

////////////////
// ## Project UI
////////////////

/** Icon name used for projects, e.g. by `<UI.ProjectDropdown>`. */
export const PROJECT_ICON = "app store ios"

/****************
 * ### `<ProjectActionsDropdown>`
 * `<MoreMenu>` populated with `Actions.PROJECT_DROPDOWN_ACTIONS`.
 ****************/
export const ProjectActionsDropdown = view((props: MoreMenuProps) => {
  return <MoreMenu {...props}>{Actions.PROJECT_DROPDOWN_ACTIONS}</MoreMenu>
})

////////////////
// ## File UI
////////////////

/****************
 * ### `<FileActionsDropdown>`
 * `<MoreMenu>` populated with `Actions.FILE_DROPDOWN_ACTIONS`.
 ****************/
export const FileActionsDropdown = view((props: MoreMenuProps) => {
  return <MoreMenu {...props}>{Actions.FILE_DROPDOWN_ACTIONS}</MoreMenu>
})

/** Icon name used for files, e.g. by `<UI.FileDropdown>`. */
export const FILE_ICON = "file code"
/** Props for `<MoreMenu>`. */
export type MoreMenuProps = Prettify<
  SUI.DropdownProps & {
    /** Render a disabled placeholder icon instead of the real dropdown. */
    stub?: boolean
    /** Render as a menu item, e.g. inside a `<SUI.Menu>`.  Defaults `true`. */
    item?: boolean
    /** Icon name.  Defaults `"ellipsis horizontal"`. */
    icon?: string
    children?: ReactNode
  }
>
