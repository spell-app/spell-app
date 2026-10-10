import { Show, omit } from "solid-js"
import type { JSX } from "@solidjs/web"

import { Actions, on, type UIElementAttributes } from "$/app/solid"

import "./chrome.css"

//
//  ## App chrome on `@spell-app/ui`:  menus, sub-menus and the "..." dropdown.
//  Same names and props as React's `$/app/ui/chrome.tsx` had.  Look:  `chrome.css`.
//  - Menus are `<ui-menu>` of `<ui-item>`s;  a sub-menu is a `<ui-menu position>` inside one.
//  - Hosts are `display: contents`:  style the boxes with `::part(menu)` / `::part(item)`, never the host.
//

/****************
 * ### `<AppMenu>`
 * Top-level app menu, attached to the top of the page.
 ****************/
export function AppMenu(props: MenuProps) {
  return (
    <ui-menu
      inverted=""
      color="violet"
      attached=""
      {...omit(props, "class", "children")}
      class={["AppMenu", "medium-short", "tight", props.class]}
    >
      {props.children}
    </ui-menu>
  )
}

/****************
 * ### `<PanelMenu>`
 * Menu attached to the top of a panel, e.g. a viewer's toolbar.
 ****************/
export function PanelMenu(props: MenuProps) {
  return (
    <ui-menu
      inverted=""
      color="purple"
      attached="top"
      {...omit(props, "class", "children")}
      class={["PanelMenu", "short", "tight", props.class]}
    >
      {props.children}
    </ui-menu>
  )
}

/** Props for `<AppMenu>` / `<PanelMenu>`:  any `<ui-menu>` attribute (`size`, `color` ...), its items as children. */
export type MenuProps = UIElementAttributes

/****************
 * ### `<Submenu>`
 * Left / center / right section of a menu, with optional `<Spring>` spacers between sections.
 * - A sub-menu:  `<ui-menu position="right">` when `right`, else `"left"`.
 ****************/
export function Submenu(props: SubmenuProps) {
  return (
    <ui-menu
      position={props.right ? "right" : "left"}
      {...omit(props, "left", "center", "right", "spring", "class", "children")}
      class={[props.class, { third: !!(props.left || props.center || props.right) }]}
    >
      <Show when={props.spring && (props.center || props.right)}>
        <Spring />
      </Show>
      {props.children}
      <Show when={props.spring && (props.center || props.left)}>
        <Spring />
      </Show>
    </ui-menu>
  )
}

/** Props for `<Submenu>`. */
export type SubmenuProps = UIElementAttributes & {
  /** Left-aligned section -- a `33.3%` min-width, so left / center / right line up. */
  left?: boolean
  /** Center section -- a `33.3%` min-width, so left / center / right line up. */
  center?: boolean
  /** Right-aligned section -- a `33.3%` min-width, so left / center / right line up. */
  right?: boolean
  /** Add a `<Spring>` between this section and its neighbor(s). */
  spring?: boolean
}

/****************
 * ### `<MenuHeader>`
 * Menu header item.
 ****************/
export function MenuHeader(props: UIElementAttributes) {
  return (
    <ui-item type="header" {...omit(props, "children")}>
      {props.children}
    </ui-item>
  )
}

/****************
 * ### `<Spring>`
 * Invisible, borderless menu item that eats up remaining space -- pushes its neighbors apart.
 ****************/
export function Spring(props: UIElementAttributes) {
  return <ui-item {...omit(props, "class")} class={["spring", "no-border", props.class]} />
}

/****************
 * ### `<MoreMenu>`
 * A "..." dropdown of actions:  a `<ui-dropdown>` whose trigger is just `icon`, holding `<Action>` items.
 * - Choosing an item CLICKS it, so an `<Action>`'s `onClick` runs whether it's in a menu or here;  the dropdown
 *   keeps no value (`ui-change` resets it), so the trigger stays the icon.
 * - Items are found by `value`, else text:  give same-titled items distinct `value`s.
 * - `stub`:  a disabled placeholder item with the icon instead, e.g. while the real menu isn't built yet.
 * - `item` (default `true`):  wrapped in a `<ui-item>`, to sit in a menu.
 ****************/
export function MoreMenu(props: MoreMenuProps) {
  const icon = () => props.icon ?? MORE_ICON
  const rest = omit(props, "stub", "item", "icon", "class", "children")
  return (
    <Show
      when={!props.stub}
      fallback={
        // HACK: a slotted `<ui-icon>`, not `icon`:  see `<Action>`
        <ui-item disabled="" {...rest}>
          <ui-icon name={icon()} />
        </ui-item>
      }
    >
      <Show when={props.item ?? true} fallback={dropdown()}>
        <ui-item class="more-menu">{dropdown()}</ui-item>
      </Show>
    </Show>
  )

  /** The dropdown itself. */
  function dropdown() {
    return (
      <ui-dropdown {...rest} class={["MoreMenu", props.class]} ref={on<{ value: string }>("ui-change", choose)}>
        <ui-icon slot="icon" name={icon()} />
        {props.children}
      </ui-dropdown>
    )
  }
}

/** Props for `<MoreMenu>`:  these, plus any `<ui-dropdown>` attribute (`direction`, `pointing` ...). */
export type MoreMenuProps = UIElementAttributes & {
  /** A disabled placeholder item instead of the real dropdown. */
  stub?: boolean
  /** Wrapped in a `<ui-item>`, to sit in a menu.  Default:  `true`. */
  item?: boolean
  /** Icon name.  Default:  `"ellipsis horizontal"`. */
  icon?: string
}

/**
 * A `<MoreMenu>`'s `ui-change`:  click the item chosen, and clear the value.
 * - SIDE EFFECT:  sets the dropdown's `value` DURING the event, so the dropdown keeps ours (`""`):  the host decides
 *   (`requestChange()` on a `@controlled` member, `packages/ui/src/elements/Reactive.ts`).
 */
function choose(event: CustomEvent<{ value: string }>) {
  const dropdown = event.currentTarget as HTMLElement & { value?: unknown }
  dropdown.value = ""
  const item = [...dropdown.children].find(
    (child) =>
      child.localName === "ui-item" && (child.getAttribute("value") ?? child.textContent?.trim()) === event.detail.value
  )
  ;(item as HTMLElement | undefined)?.click()
}

/****************
 * ### `<DropdownLabel>`
 * Label that goes next to a dropdown in a menu, e.g. a project dropdown's "Project:".
 ****************/
export function DropdownLabel(props: UIElementAttributes) {
  return (
    <ui-item {...omit(props, "class", "children")} class={["dropdown-label", props.class]}>
      {props.children}
    </ui-item>
  )
}

////////////////
// ## Icons
////////////////

/** Icon of a `<MoreMenu>`. */
export const MORE_ICON = "ellipsis horizontal"
/** Icon name for a collapsed (pointing right) disclosure arrow. */
export const ARROW_COLLAPSED_ICON = "caret right"
/** Icon name for an expanded (pointing down) disclosure arrow. */
export const ARROW_EXPANDED_ICON = "caret down"

////////////////
// ## Project UI
////////////////

/** Icon name used for projects, e.g. by a project dropdown. */
export const PROJECT_ICON = "app store ios"

/****************
 * ### `<ProjectActionsDropdown>`
 * `<MoreMenu>` of `Actions.PROJECT_DROPDOWN_ACTIONS`.
 ****************/
export function ProjectActionsDropdown(props: MoreMenuProps): JSX.Element {
  return (
    <MoreMenu {...props}>
      <Actions.PROJECT_DROPDOWN_ACTIONS />
    </MoreMenu>
  )
}

////////////////
// ## File UI
////////////////

/** Icon name used for files, e.g. by a file dropdown. */
export const FILE_ICON = "file code"

/****************
 * ### `<FileActionsDropdown>`
 * `<MoreMenu>` of `Actions.FILE_DROPDOWN_ACTIONS`.
 ****************/
export function FileActionsDropdown(props: MoreMenuProps): JSX.Element {
  return (
    <MoreMenu {...props}>
      <Actions.FILE_DROPDOWN_ACTIONS />
    </MoreMenu>
  )
}
