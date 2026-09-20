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

////////////////
// ## SUI pass-throughs
////////////////

/**
 * `semantic-ui-react` components re-exported onto `UI` for spell programs to use.
 * - NEVER wrap these in `view()`.  As of v3 every SUI component is a `forwardRef` OBJECT, and
 *   `view()` observes by CALLING what you hand it -- so it throws "Function.prototype.apply was
 *   called on #<Object>" on anything that isn't a plain function.
 * - Going bare costs ONE narrow thing, measured.  A wrapped leaf ALSO subscribed to observables
 *   that only IT read:
 *
 *       const thing = createStore({ label: { content: "before" } })
 *       // parent passes `label` straight through -- only `SUI.Button` ever reads `.content`
 *       <UI.Button label={thing.label} />
 *       thing.label.content = "after"   // in place, so the parent's `label` value never changed
 *
 *   Wrapped, the button re-rendered and showed `after`.  Bare, it sits on `before` forever.
 * - Takes ALL THREE to bite:  observable object passed straight through, mutated IN PLACE, and a
 *   field the parent never read.  Nothing does this today -- every binding we have computes its
 *   value in the parent (e.g. spell's `<UI.Button disabled={the newTaskName of the app is ""}>`),
 *   so the parent re-renders and hands the leaf a new prop.
 * - NOTE: children are immune -- React validates child keys by ITERATING them inside the PARENT's
 *   render, which subscribes the parent whether we wrap the leaf or not.
 * - NEVER "fix" this by wrapping in a function component.  It does NOT restore tracking -- the
 *   wrapper only builds an element, and `SUI.Button` still renders in its own fiber, outside the
 *   reaction -- and it additionally drops statics (`UI.Button.Group`) and refs.
 * - To actually restore it, observe the component's OWN render fn so it runs inside the reaction:
 *
 *       const inner = SUI.Button.render          // `.type` instead, for a `memo` component
 *       const Reactive = view((props) => inner(props, props.__ref))
 *       export const Button = Object.assign(
 *         React.forwardRef((props, ref) => <Reactive {...props} __ref={ref} />),
 *         SUI.Button                             // carry `.Group` etc. across
 *       )
 */
export const Button = SUI.Button
export const Card = SUI.Card
export const Column = SUI.Grid.Column
export const Container = SUI.Container
export const Grid = SUI.Grid
export const Icon = SUI.Icon
export const Row = SUI.Grid.Row
export const Segment = SUI.Segment

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
