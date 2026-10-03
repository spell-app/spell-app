/**
 * Shared types for `$/ui/components` -- event details and the CSS contracts every implementation of a component
 * (the element and its native fallback) must honour.
 * - Runtime-light:  `import type` only, plus a few constants.
 */

import type { FieldValue, MenuOption, ValidationRule } from "$/ui/elements"
import type { SourceErrorKind } from "$/ui/runtime"

////////////////
// ## Button
////////////////

/** `detail` of `ui-toggle`, from a `toggle` `<ui-button>`. */
export type ButtonToggleDetail = {
  /** new `active` state */
  active: boolean
  /** click / key event that flipped it */
  originalEvent?: Event
}

////////////////
// ## Dropdown
////////////////

/** A dropdown's value:  one string, or one per chosen option with `multiple`. */
export type DropdownValue = string | string[]

/** `options` property of `<ui-dropdown>`:  the `MenuOptions` model's option shape. */
export type DropdownOptions = readonly MenuOption[]

/** `detail` of `ui-change`. */
export type DropdownChangeDetail = {
  /** value after the change */
  value: DropdownValue
  originalEvent?: Event
}

/** `detail` of the cancelable `ui-open` / `ui-close`. */
export type DropdownOpenDetail = {
  /** state it's ABOUT to enter */
  open: boolean
  originalEvent?: Event
}

/** `detail` of `ui-search`. */
export type DropdownSearchDetail = {
  /** current query */
  query: string
  originalEvent?: Event
}

/** `detail` of `ui-add` / `ui-remove`:  the one value added or removed. */
export type DropdownItemDetail = {
  value: string
  originalEvent?: Event
}

////////////////
// ## Item
////////////////

/** `<ui-item type>`:  an option, a group header, or a divider. */
export type ItemType = "item" | "header" | "divider"

/**
 * How an OWNER wants its generic `<ui-item>`s rendered, from `ItemOwner.itemContext()`.
 * - The item finds its owner through `PartContext` (the owner's vocabulary `ownsParts` has `item`) and reads
 *   this in a memo, so an owner attribute change (`<ui-list selection>`, `<ui-menu interactive>`) re-renders
 *   every item.
 */
export type ItemContext = {
  /** Role of the item HOST (internals), e.g. `listitem`;  `null` for none. */
  hostRole: string | null
  /** Role of the item's ROOT, e.g. `menuitem` in a menubar;  `undefined` keeps the native element's. */
  role?: ItemRole
  /** An item without `href` renders a `<button>` (selection list, menubar);  else a `<div>` (unless `link`). */
  interactive: boolean
  /** `aria-current` of a SELECTED item that is a link:  `page` in a navigation menu. */
  current: "page" | "true"
  /**
   * The item OWNS its content parts (`:state(in-item)`):  the Items view.  Default false:  a list's or menu's parts
   * see through the item to the list / menu (`:state(in-list)`).  See `ConditionalOwner`.
   */
  ownsParts?: boolean
  /** Classes of the `image` shorthand's `<img>`;  default `ui avatar image` (a list's avatar). */
  imageClass?: string
}

/** Roles an owner may give an item's root. */
export type ItemRole = "menuitem" | "menuitemradio" | "menuitemcheckbox" | "option" | "treeitem"

/**
 * What an owner of `<ui-item>`s (`<ui-list>`, `<ui-menu>`, `<ui-items>`) implements on its CONTROLLER;  the item
 * calls it as `(owner as UIHost).controller.itemContext(item)`, tracked.
 * - The item also adopts the owner's `styles`:  the owner's sheet holds its item rules
 *   (`:host(:state(in-list)) > .item`), next to the static class-grammar ones (`.ui.list > .item`).
 */
export type ItemOwner = {
  itemContext(item: Element): ItemContext
}

////////////////
// ## CSS contracts
////////////////

/**
 * Custom property `ui-dropdown.css` reads for the anchor name, e.g. `--_ui-dropdown-anchor: --ui-dropdown-7`.
 * - The element sets it INLINE on its root, to a per-instance dashed ident (`UI.ids`);  the root's
 *   `anchor-name` and the menu's `position-anchor` both read it.
 * - PRIVATE (`--_ui-`):  a switch the element decides, never a theming surface.
 * - Falls back to `--ui-dropdown`, which is enough inside one shadow root.
 */
export const DROPDOWN_ANCHOR_PROPERTY = "--_ui-dropdown-anchor"

////////////////
// ## Icon
////////////////

/**
 * Custom property an owner sets on itself to steer a slotted `<ui-icon>` (a `display: contents` host takes no box
 * styles from `::slotted()`), e.g. `--_ui-icon-owner-margin: 0 0.75em 0 0` on a label root.  See `ui-icon.css`.
 * - PRIVATE (`--_ui-`):  an internal switch between components, never a theming surface
 *   (`docs/theming.md` "Owner tokens").
 */
export type IconOwnerToken =
  | "--_ui-icon-owner-display"
  | "--_ui-icon-owner-size"
  | "--_ui-icon-owner-margin"
  | "--_ui-icon-owner-opacity"
  | "--_ui-icon-owner-align"

////////////////
// ## Label
////////////////

/** `detail` of the cancelable `ui-remove`, from a `removable` `<ui-label>`'s delete icon. */
export type LabelRemoveDetail = {
  /** click / key event on the delete icon */
  originalEvent?: Event
}

////////////////
// ## Parts
////////////////

/** `<ui-header level>`:  renders `<h1>` ... `<h6>`, a page header. */
export type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6

/**
 * Inherited tokens OWNERS set on their root for the generic content parts, which style-query them
 * (`@container style(...)`).  See the "Owner tokens" table in `ui-parts.css`.
 * - Switches are PRIVATE (`--_ui-`):  what the owner's attributes decide, never a theming surface.
 * - `--ui-inverted` is the shared remap.
 * - The look tokens (`modalHeaderSize`, `statisticValueSize`) name the owner's private ALIAS of a public token
 *   (`--_ui-modal-header-size: var(--ui-modal-header-size, 1.42857em)`):  the page sets the public one, the
 *   owner's variations write the alias, and parts read only the alias (`docs/theming.md` "Owner tokens").
 * - MUST be declared on EVERY root of the owner, default value included, so a nested owner never inherits an
 *   outer owner's layout.
 * - `inverted` owners also set `color-scheme: dark`;  the token is only for looks the dark scheme doesn't give.
 */
export const PART_OWNER_TOKENS = {
  inverted: "--ui-inverted",
  cardLayout: "--_ui-card-layout",
  cardLeading: "--_ui-card-leading",
  itemLayout: "--_ui-item-layout",
  itemState: "--_ui-item-state",
  commentsMinimal: "--_ui-comments-minimal",
  modalBasic: "--_ui-modal-basic",
  modalHeaderSize: "--_ui-modal-header-size",
  messageLayout: "--_ui-message-layout",
  listLayout: "--_ui-list-layout",
  itemMedia: "--_ui-item-media",
  eventLabel: "--_ui-event-label",
  statisticLayout: "--_ui-statistic-layout",
  statisticValueSize: "--_ui-statistic-value-size",
  stepState: "--_ui-step-state",
  stepLayout: "--_ui-step-layout",
  accordionStyle: "--_ui-accordion-style",
  accordionOpen: "--_ui-accordion-open",
  searchResult: "--_ui-search-result",
  headerLayout: "--_ui-header-layout",
  labelLayout: "--_ui-label-layout",
  part: "--_ui-part"
} as const

/**
 * Class a STATIC part carries in place of the `:state(in-<owner>)` its element sets, e.g. `in-card`.
 * - Elements NEVER set it:  it exists for static markup (examples, SSR without scripts);  see `ui-parts.css`.
 * - Same text as `OwnerContext.stateName(ownerNoun)`.
 */
export const PART_STATIC_CLASS_PREFIX = "in-"

/**
 * Marks the NATIVE control in a static server render (`$/ui/server`), for the flattener:  the host's `id` and ARIA
 * names belong there, so a `<label for>` the host's id labels the control.
 * - Elements NEVER set it in a browser;  `StaticFlattener` moves the host's `id` / `aria-label*` /
 *   `aria-describedby` there, then drops the mark (seo plan, T5).
 */
export const STATIC_CONTROL = "data-ui-control"

////////////////
// ## Grid
////////////////

/**
 * Size container a top-level `<ui-grid>` HOST establishes (`container: ui-grid / inline-size`), see `ui-grid.css`.
 * - `stackable`, `doubling`, `reversed` and per-device widths answer to it, not to the viewport.
 * - Page CSS may query it too, e.g. `@container ui-grid (width < 768px) { ... }` inside a column.
 */
export const GRID_CONTAINER_NAME = "ui-grid"

////////////////
// ## Message
////////////////

/** `detail` of the cancelable `ui-dismiss`, from a `dismissible` `<ui-message>`'s close button. */
export type MessageDismissDetail = {
  /** click / key event on the close button */
  originalEvent?: Event
}

////////////////
// ## Breadcrumb
////////////////

/**
 * Inherited tokens a `<ui-breadcrumb>` sets INLINE on its root, which every `<ui-breadcrumb-section>` draws as
 * its leading divider.  See "Dividers" in `ui-breadcrumb.css`.
 * - `text` -- a CSS STRING (`"›"`), from `divider`;  quote and escape it as CSS (`\"`, `\\`, `\A `), not JSON
 * - `icon` -- an `<image>`, `url("data:image/svg+xml,...")` of the `divider-icon` SVG;  painted as a mask in
 *   `currentColor`
 * - `layout` -- `icon` while `divider-icon` is set;  removed otherwise.  PRIVATE (`--_ui-`):  a switch the
 *   element decides;  static markup sets it by hand
 */
export const BREADCRUMB_DIVIDER_TOKENS = {
  text: "--ui-breadcrumb-divider",
  icon: "--ui-breadcrumb-divider-icon",
  layout: "--_ui-breadcrumb-divider-layout"
} as const

////////////////
// ## Placeholder
////////////////

/**
 * Custom state every `<ui-placeholder>` host MUST carry, always:  `ui-placeholder.css` spaces consecutive
 * placeholders with `:host(:nth-child(n + 2 of :state(placeholder)))`, since a shadow root can't see its host's
 * previous sibling.
 */
export const PLACEHOLDER_HOST_STATE = "placeholder"

////////////////
// ## Input
////////////////

/** `detail` of `ui-input` (every keystroke) and `ui-change` (commit), from `<ui-input>` / `<ui-textarea>`. */
export type InputChangeDetail = {
  /** value after the change */
  value: string
  originalEvent?: Event
}

/**
 * Inherited tokens an OWNER sets for the text controls inside it (`ui-input.css`), e.g. `<ui-field>` on its root.
 * - `width` -- the host's inline size (`100%` in a field, `auto` in an inline one)
 * - `color` / `background` / `border` -- a field's state, RESOLVED colours (declared where the state's remap
 *   runs), so a control's own `state` still wins
 */
export const INPUT_OWNER_TOKENS = {
  width: "--_ui-input-owner-width",
  color: "--_ui-field-state-color",
  background: "--_ui-field-state-background",
  border: "--_ui-field-state-border"
} as const

////////////////
// ## Checkbox
////////////////

/** `detail` of `ui-change`, from `<ui-checkbox>` / `<ui-radio>`. */
export type CheckboxChangeDetail = {
  /** chosen after the change */
  selected: boolean
  /** the element's `value` (default `on`) */
  value: string
  originalEvent?: Event
}

////////////////
// ## Form
////////////////

/** One field's value as `<ui-form>` reads it (`values`):  the `Validator`'s `FieldValue`. */
export type FormFieldValue = FieldValue

/** `<ui-form>`'s `values`:  by field name (or id). */
export type FormValues = Record<string, FieldValue>

/**
 * One field's rules in `<ui-form rules>`, Fomantic's `fields` shape:
 * - a shorthand string (`"notEmpty"`, `"minLength[6]"`) or a list of them / rule objects
 * - or `{ rules, optional?, depends?, identifier? }`:  `optional` skips a blank field, `depends` skips the field
 *   while another is blank, `identifier` names the control when the key doesn't
 * - NOTE: Fomantic's deprecated `empty` means `notEmpty`
 */
export type FormFieldRules =
  | ValidationRule
  | readonly ValidationRule[]
  | {
      rules: readonly ValidationRule[]
      optional?: boolean
      depends?: string
      identifier?: string
    }

/** `<ui-form>`'s `rules` property. */
export type FormRules = Record<string, FormFieldRules>

/** `detail` of `ui-valid`. */
export type FormValidDetail = {
  /** field name (or id) */
  field: string
  value: FieldValue
  values: FormValues
}

/** `detail` of `ui-invalid`. */
export type FormInvalidDetail = FormValidDetail & {
  /** the field's prompts */
  errors: string[]
}

/** `detail` of the cancelable `ui-success`. */
export type FormSuccessDetail = {
  values: FormValues
  originalEvent?: Event
}

/** `detail` of `ui-failure`. */
export type FormFailureDetail = FormSuccessDetail & {
  /** prompts by field */
  errors: Record<string, string[]>
}

/**
 * Custom state every `<ui-field>` host carries, always:  `<ui-form>` finds a control's field with
 * `control.closest(":state(field)")`, whatever the field's tag is called in a translation.
 */
export const FIELD_HOST_STATE = "field"

////////////////
// ## Table
////////////////

/** Direction of a sorted `<ui-table>` column (`sort-direction`, `aria-sort`). */
export type TableSortDirection = "ascending" | "descending"

/** `detail` of the cancelable `ui-sort`, from a `sortable` `<ui-table>`'s header. */
export type TableSortDetail = {
  /** column index (0-based, counting `colspan`s) */
  column: number
  /** data mode:  the column's `key`;  slotted:  the header's `data-key`, if any */
  key?: string
  /** direction it's ABOUT to sort in:  flipped for the sorted column, else `ascending` */
  direction: TableSortDirection
  /** click / key event on the header */
  originalEvent?: Event
}

/** One column of `<ui-table>`'s data mode (`columnDefs`). */
export type TableColumn = {
  /** property of each row shown in this column */
  key: string
  /** header text;  default `key` */
  header?: string
  /** cell alignment (`left aligned` ...) */
  textAlign?: "left" | "center" | "right"
  /** `false` opts the column out of sorting;  default sortable when the table is */
  sortable?: boolean
  /** Fomantic width, `1` ... `16` (or `1/4`, `25%`):  `four wide` */
  width?: number | string
}

/** One row of `<ui-table>`'s data mode (`rows`):  values by column key, shown as text. */
export type TableRow = Record<string, unknown>

/**
 * Header attribute that opts one `th` out of a `sortable` table:  `data-sortable="false"`.
 * - Fomantic's `class="disabled"` on a `th` opts out too (and greys it on hover).
 */
export const TABLE_SORT_OPT_OUT = { attribute: "data-sortable", value: "false" } as const

/** Header attribute naming a slotted column for `ui-sort`'s `key`, e.g. `<th data-key="name">`. */
export const TABLE_SORT_KEY = "data-key"

////////////////
// ## List
////////////////

/** `detail` of `ui-select`, from a `<ui-list>` when one of its interactive items is activated. */
export type ListSelectDetail = {
  /** the item's `value`, else its `text`, else its trimmed text content */
  value: string
  /** the `<ui-item>` host */
  item: Element
  /** click (or the click Enter / Space made) on the item's link / button */
  originalEvent?: Event
}

////////////////
// ## Card
////////////////

/**
 * Variations of a `<ui-cards>` group that every card in it takes as its OWN class when it doesn't set the
 * attribute itself (Fomantic's `.ui.raised.cards > .card`), read through `UICards.shared()`.
 */
export type CardSharedVariation = "size" | "color" | "horizontal" | "raised" | "link" | "basic" | "inverted"

////////////////
// ## Popup
////////////////

/** What opens a `<ui-popup>` (`on`):  Fomantic's names;  `hover` also opens on keyboard focus. */
export type PopupTrigger = "hover" | "focus" | "click" | "manual"

/** `detail` of the cancelable `ui-open` / `ui-close`, from a `<ui-popup>`. */
export type PopupOpenDetail = {
  /** state it's ABOUT to enter */
  open: boolean
  /** pointer / focus / click / key event that caused it;  none for a delayed hover or a dismissal request */
  originalEvent?: Event
}

////////////////
// ## Modal
////////////////

/**
 * Why a `<ui-modal>` is closing, in `ui-close`'s `detail.reason`.
 * - `escape` / `outside` / `close-all` -- as `UI.overlays` asks (`DismissReason`);  `outside` is a click on the
 *   `::backdrop`
 * - `close` -- the close icon
 * - `approve` / `deny` -- an approve / deny button (after its own `ui-approve` / `ui-deny`)
 */
export type ModalCloseReason = "escape" | "outside" | "close-all" | "close" | "approve" | "deny"

/** `detail` of the cancelable `ui-open`, and of `ui-show` / `ui-hide` (after the transition). */
export type ModalOpenDetail = {
  /** state it's entering / entered */
  open: boolean
  originalEvent?: Event
}

/** `detail` of the cancelable `ui-close`. */
export type ModalCloseDetail = {
  open: false
  reason: ModalCloseReason
  originalEvent?: Event
}

/** `detail` of the cancelable `ui-approve` / `ui-deny`. */
export type ModalActionDetail = {
  /** the button (or other element) that was activated, in the light DOM */
  action: Element
  originalEvent?: Event
}

/**
 * Which activated elements inside a `<ui-modal>` approve or deny it:  Fomantic's `.actions` classes, plus the
 * `positive` / `negative` attributes of a `<ui-button>`.
 * - Matched against the light-DOM elements on a click's composed path, innermost first;  the native fallback
 *   uses the same selectors.
 */
export const MODAL_ACTION_SELECTORS = {
  approve: `.approve, .ok, .positive, [positive]:not([positive="false"], [positive="no"])`,
  deny: `.deny, .cancel, .negative, [negative]:not([negative="false"], [negative="no"])`
} as const

////////////////
// ## Select
////////////////

/** A select's value:  one string, or one per chosen option with `multiple`. */
export type SelectValue = string | string[]

/** `options` property of `<ui-select>`:  the `MenuOptions` model's option shape, as the dropdown's. */
export type SelectOptions = readonly MenuOption[]

/** `detail` of `ui-change`, from `<ui-select>`. */
export type SelectChangeDetail = {
  /** value after the change */
  value: SelectValue
  originalEvent?: Event
}

////////////////
// ## Search
////////////////

/**
 * One result of a `<ui-search>`, Fomantic's result fields;  other fields may ride along (`search-fields` can name
 * them).
 */
export type SearchResult = {
  /** shown, and what choosing the result puts in the input */
  title: string
  description?: string
  /** image URL, shown at the result's end */
  image?: string
  /** `alt` of the image;  default `""` (decorative) */
  alt?: string
  /** shown at the end, in green */
  price?: string
  /** the `category` variation groups a LOCAL source by it */
  category?: string
  /** choosing the result follows it;  the result is a link */
  url?: string
  id?: string
  [field: string]: unknown
}

/** A named group of results, Fomantic's category shape (`{ name, results }`). */
export type SearchCategory = {
  name: string
  results: readonly SearchResult[]
}

/**
 * What a remote `url` may answer, as Fomantic's API search:
 * - `{ results: SearchResult[] }` -- standard
 * - `{ results: { [key]: SearchCategory } }` or `{ results: SearchCategory[] }` -- category
 * - a bare `SearchResult[]`
 */
export type SearchResponse =
  | readonly SearchResult[]
  | { results?: readonly SearchResult[] | readonly SearchCategory[] | Readonly<Record<string, SearchCategory>> }

/**
 * How a local search matches, Fomantic's `fullTextSearch`:  a query at the START of a word always matches (and
 * sorts first);  then
 * - `exact` -- anywhere in the field (default)
 * - `fuzzy` -- its characters in order, gaps allowed (Fomantic's `true`)
 * - `prefix` -- nothing more (Fomantic's `false`)
 * - `some` -- any of its words, anywhere
 * - `all` -- all of its words, anywhere in the fields together
 */
export type SearchMatch = "exact" | "fuzzy" | "prefix" | "some" | "all"

/** `detail` of the cancelable `ui-select`, from `<ui-search>`. */
export type SearchSelectDetail = {
  result: SearchResult
  originalEvent?: Event
}

/** `detail` of `ui-search`:  the query about to run. */
export type SearchQueryDetail = {
  query: string
  originalEvent?: Event
}

/** `detail` of `ui-results`:  what a query found (before `max-results` for a remote one). */
export type SearchResultsDetail = {
  query: string
  results: readonly SearchResult[]
}

/** `detail` of `ui-change`, from `<ui-search>`:  its text was committed. */
export type SearchChangeDetail = {
  value: string
  originalEvent?: Event
}

/**
 * Custom property `ui-search.css` reads for the anchor name, e.g. `--_ui-search-anchor: --ui-search-3`.
 * - The element sets it inline on its root, as the dropdown does (`DROPDOWN_ANCHOR_PROPERTY`).
 * - PRIVATE (`--_ui-`):  a switch the element decides, never a theming surface.
 */
export const SEARCH_ANCHOR_PROPERTY = "--_ui-search-anchor"

////////////////
// ## Toast
////////////////

/**
 * Why a `<ui-toast>` is closing, in `ui-close` / `ui-hide`'s `detail.reason`.
 * - `timeout` -- its display time ran out
 * - `close` -- the close icon
 * - `click` -- a click on it (`close-on-click`)
 * - `escape` -- Escape with focus inside it
 * - `approve` / `deny` / `action` -- an action button (after its own `ui-approve` / `ui-deny`)
 * - `dismiss` -- script:  `host.close()`, `UI.toasts.dismiss(id)`
 * - `close-all` -- `UI.overlays.closeAll("toast")`
 */
export type ToastCloseReason =
  | "timeout"
  | "close"
  | "click"
  | "escape"
  | "approve"
  | "deny"
  | "action"
  | "dismiss"
  | "close-all"

/** `detail` of the cancelable `ui-close`, and of `ui-hide` (without the event). */
export type ToastCloseDetail = {
  reason: ToastCloseReason
  originalEvent?: Event
}

/** `detail` of `ui-show`. */
export type ToastShowDetail = {
  /** ms it stays before closing itself;  `0` for "until closed" */
  displayTime: number
}

/** `detail` of the cancelable `ui-approve` / `ui-deny`, from a `<ui-toast>`. */
export type ToastActionDetail = {
  /** the button (or other element) that was activated, in the light DOM */
  action: Element
  originalEvent?: Event
}

////////////////
// ## Nag
////////////////

/** Where a `<ui-nag>` remembers its dismissal (`storage`). */
export type NagStorage = "local" | "session" | "cookie"

/**
 * Why a `<ui-nag>` is closing, in `ui-close` / `ui-hide`'s `detail.reason`.
 * - `close` -- its close icon (the dismissal is stored)
 * - `timeout` -- its display time ran out (nothing stored)
 * - `dismiss` -- script:  `host.close()` (stored)
 */
export type NagCloseReason = "close" | "timeout" | "dismiss"

/** `detail` of the cancelable `ui-close`, and of `ui-hide` (without the event). */
export type NagCloseDetail = {
  reason: NagCloseReason
  originalEvent?: Event
}

////////////////
// ## Sticky
////////////////

/** Which viewport edge a `<ui-sticky>` is stuck to. */
export type StickyEdge = "top" | "bottom"

/** `detail` of `ui-stick` / `ui-unstick`. */
export type StickyDetail = {
  /** the edge it stuck to (`ui-stick`) or left (`ui-unstick`) */
  edge: StickyEdge
}

////////////////
// ## Embed
////////////////

/** Known video hosts of `<ui-embed source>`. */
export type EmbedSource = "youtube" | "vimeo"

/** `detail` of the cancelable `ui-activate`, from a `<ui-embed>` about to load its frame. */
export type EmbedActivateDetail = {
  /** the frame's `src`, parameters included */
  url: string
  originalEvent?: Event
}

////////////////
// ## Transition
////////////////

/** `detail` of `ui-show` / `ui-hide` / `ui-complete`, from a `<ui-transition>` once an animation has run. */
export type TransitionDetail = {
  /** shown now */
  visible: boolean
  /** the animation that ran, Fomantic's name (`fade up`) */
  animation: string
}

/**
 * Invoker commands a `<ui-transition>` answers, `<button commandfor="id" command="--toggle">`:
 * - `--show` / `--close` / `--toggle` -- animate in / out / whichever it isn't
 * - `--transition` -- run its `animation` (an attention one in place)
 */
export const TRANSITION_COMMANDS = {
  show: "--show",
  close: "--close",
  toggle: "--toggle",
  transition: "--transition"
} as const

////////////////
// ## Dimmer
////////////////

/**
 * Why a `<ui-dimmer>` is hiding, in `ui-close`'s `detail.reason`.
 * - `escape` / `close-all` -- as `UI.overlays` asks (a page dimmer)
 * - `click` -- a click on the dimmer itself, outside its content (`closedby="any"`)
 * - `hover` -- the pointer and focus left an `on="hover"` dimmer's target
 */
export type DimmerCloseReason = "escape" | "close-all" | "click" | "hover"

/** `detail` of the cancelable `ui-open`, and of `ui-show` / `ui-hide` (after the transition). */
export type DimmerOpenDetail = {
  /** state it's entering / entered */
  active: boolean
  originalEvent?: Event
}

/** `detail` of the cancelable `ui-close`. */
export type DimmerCloseDetail = {
  active: false
  reason: DimmerCloseReason
  originalEvent?: Event
}

////////////////
// ## Sidebar
////////////////

/**
 * Why a `<ui-sidebar>` is closing, in `ui-close`'s `detail.reason`.
 * - `escape` / `outside` / `close-all` -- as `UI.overlays` asks;  `outside` is a click on the pusher (or anywhere
 *   else outside the sidebar)
 * - `close` -- the `--close` / `--toggle` invoker command
 */
export type SidebarCloseReason = "escape" | "outside" | "close-all" | "close"

/** `detail` of the cancelable `ui-open`, and of `ui-show` / `ui-hide` (after the transition). */
export type SidebarOpenDetail = {
  /** state it's entering / entered */
  visible: boolean
  originalEvent?: Event
}

/** `detail` of the cancelable `ui-close`. */
export type SidebarCloseDetail = {
  visible: false
  reason: SidebarCloseReason
  originalEvent?: Event
}

/**
 * Invoker commands a `<ui-modal>`, `<ui-flyout>`, `<ui-sidebar>`, `<ui-dimmer>`, `<ui-popup>`, `<ui-dropdown>` and
 * `<ui-toast>` (`--close` only) answer
 * (`<button commandfor="id" command="--toggle">`):  custom commands, since a custom element gets no built-in ones
 * (`show-modal` only reaches a real `<dialog>`).  All are user actions (the cancelable `ui-open` / `ui-close` first).
 * - `--show` -- open
 * - `--close` -- close, reason `close`
 * - `--toggle` -- either
 */
export const TOGGLE_COMMANDS = { show: "--show", close: "--close", toggle: "--toggle" } as const

/** Reads `TOGGLE_COMMANDS` off a `command` event:  the shared first step of every family's `onCommand`. */
export class ToggleCommands {
  /**
   * What `event` asks of an element that is `open` now:  `"show"`, `"close"`, or `undefined` for a command it doesn't
   * know (`--toggle` flips `open`).
   */
  static action(event: Event, open: boolean): "show" | "close" | undefined {
    const { command } = event as Event & { command?: string }
    if (command === TOGGLE_COMMANDS.show || (command === TOGGLE_COMMANDS.toggle && !open)) return "show"
    if (command === TOGGLE_COMMANDS.close || command === TOGGLE_COMMANDS.toggle) return "close"
    return undefined
  }
}

/** Custom state every `<ui-pusher>` host carries:  `<ui-pushable>` finds and moves it by this, whatever its tag. */
export const PUSHER_HOST_STATE = "pusher"

/** Custom state every `<ui-sidebar>` host carries:  `<ui-pushable>` finds its sidebars by this. */
export const SIDEBAR_HOST_STATE = "sidebar"

/** Custom state every `<ui-pushable>` host carries:  a `<ui-sidebar>` finds its pushable by this. */
export const PUSHABLE_HOST_STATE = "pushable"

/**
 * Inherited tokens a `<ui-pushable>` sets INLINE on its root for its `<ui-pusher>`s (`ui-sidebar.css`), from the
 * visible sidebar:
 * - `transform` -- where the pusher moves (`translate3d(260px, 0, 0)`, `scale(0.75)`), `none` when nothing is open
 * - `origin` -- its `transform-origin` (scale down)
 * - `dimmed` -- `1` while a modal sidebar is open:  the pusher's dimmer shows
 * - `blurring` -- `1` while that sidebar is `blurring`:  the dimmer blurs the pusher
 * - PRIVATE (`--_ui-`):  switches the pushable decides, never a theming surface;  `ui-sidebar.css` declares their
 *   defaults on the pushable box, which the inline values beat
 */
export const PUSHER_TOKENS = {
  transform: "--_ui-pusher-transform",
  origin: "--_ui-pusher-origin",
  dimmed: "--_ui-pusher-dimmed",
  blurring: "--_ui-pusher-blurring"
} as const

/** What a visible `<ui-sidebar>` asks of its `<ui-pushable>` (`UIPushable.report()`). */
export type SidebarLayout = {
  /** where the pushers move, e.g. `translate3d(260px, 0, 0)`;  `none` for `overlay` */
  transform: string
  /** the pushers' `transform-origin` (`scale down`) */
  origin: string
  /** modal:  the pushers are dimmed and `inert` */
  modal: boolean
  /** the dimmer blurs */
  blurring: boolean
}

////////////////
// ## Shape
////////////////

/** Which way a `<ui-shape>` flips to its next side (Fomantic's `flip up` ... `flip back`). */
export type ShapeFlip = "up" | "down" | "left" | "right" | "over" | "back"

/** `detail` of `ui-change`, from a `<ui-shape>` once it shows another side. */
export type ShapeChangeDetail = {
  /** index of the side now shown */
  activeIndex: number
  /** that side */
  side: Element
  /** how it got there */
  flip: ShapeFlip
}

/** Custom state every `<ui-side>` host carries:  `<ui-shape>` finds its sides by this, whatever their tag. */
export const SIDE_HOST_STATE = "side"

////////////////
// ## Accordion
////////////////

/**
 * One panel of a `<ui-accordion>`:  a title child and the child after it, wrapped in one `<details>` in the shadow
 * root.  `AccordionPanels.read()` keeps the same object while the pair is unchanged, so the panel isn't re-rendered.
 */
export type AccordionPanel = {
  /** the `<ui-title>` child */
  title: Element
  /** the element after it, usually a `<ui-content>`;  none when the title is last or another title follows */
  content?: Element
}

/** `detail` of the cancelable `ui-open` / `ui-close`, from a `<ui-section>`. */
export type SectionToggleDetail = {
  /** state the section is ABOUT to enter:  `true` unfolding */
  open: boolean
  /** the `<ui-section>` host */
  section: Element
  /** the click / key event on the toggle;  none for a browser-made change (find-in-page) */
  originalEvent?: Event
}

/** `detail` of the cancelable `ui-open` / `ui-close`, from a `<ui-accordion>`. */
export type AccordionToggleDetail = {
  /** panel index (0-based) */
  index: number
  /** state the panel is ABOUT to enter */
  open: boolean
  /** the panel's title element */
  title: Element
  /** its content element, if any */
  content?: Element
  /** the click / key event on the title;  none for a browser-made change (find-in-page) */
  originalEvent?: Event
}

////////////////
// ## Tab
////////////////

/** `<ui-tabs activation>`:  the WAI-ARIA APG's two ways a focused tab gets selected. */
export type TabActivation = "automatic" | "manual"

/** `detail` of the cancelable `ui-change`, from a `<ui-tabs>`. */
export type TabChangeDetail = {
  /** value of the tab about to be selected */
  value: string
  /** that `<ui-tab>` pane */
  tab: Element
  /** click / key event, or the `hashchange` / `popstate` of `history` */
  originalEvent?: Event
}

/** `detail` of `ui-show`, from a `<ui-tab>` each time it becomes the shown pane. */
export type TabShowDetail = {
  /** the pane's value */
  value: string
  /** the first time it's shown:  fill a lazy pane now */
  first: boolean
}

////////////////
// ## Calendar
////////////////

/** `<ui-calendar type>`:  what it picks, and so the ISO shape of its value. */
export type CalendarType = "date" | "time" | "datetime" | "month" | "year"

/** A view of the picker, coarse to fine;  also the unit a cell stands for. */
export type CalendarMode = "year" | "month" | "day" | "hour" | "minute"

/** `detail` of the cancelable `ui-change`, from a `<ui-calendar>`. */
export type CalendarChangeDetail = {
  /**
   * the new value, ISO by `type`:  `2026-09-30`, `14:30`, `2026-09-30T14:30`, `2026-09`, `2026`;  `""` when
   * cleared
   */
  value: string
  /** the click / key / `change` event */
  originalEvent?: Event
}

/** `detail` of the cancelable `ui-open` / `ui-close`, from a popup `<ui-calendar>`. */
export type CalendarOpenDetail = {
  /** the state it's about to take */
  open: boolean
  /** the click / key event;  none for a dismissal from `UI.overlays` */
  originalEvent?: Event
}

/**
 * Invoker commands a `<ui-shape>` answers, `<button commandfor="id" command="--next">`:  turn to the next / previous
 * side, the `direction` attribute's way.
 */
export const SHAPE_COMMANDS = { next: "--next", previous: "--previous" } as const

////////////////
// ## Shared words
// Constants two or more families read, lifted out of their files.
////////////////

/** The `active` state / class word. */
export const ACTIVE = "active"

/** The `aria-label` attribute:  a host's label, forwarded to its inner element. */
export const ARIA_LABEL = "aria-label"

/** `KeyboardEvent.key` of the down arrow. */
export const ARROW_DOWN = "ArrowDown"

/** The `content` word:  a part, a class, a slot. */
export const CONTENT = "content"

/** The `disabled` state / class word. */
export const DISABLED = "disabled"

/** The `header` word:  a part, a class, a slot. */
export const HEADER = "header"

/** The `icon` word:  a part, a class, a slot. */
export const ICON = "icon"

/** Grammar word the element adds itself (not an attribute):  the `icon` class. */
export const ICON_CLASS = "icon"

/** ARIA role of a decorative or labelled picture. */
export const IMG = "img"

/** ARIA role of a list root. */
export const LIST = "list"

/** ARIA role of an item of a list. */
export const LISTITEM = "listitem"

/** The `none` value:  an ARIA role to remove, an attribute value that switches a thing off. */
export const NONE = "none"

/** Pseudo-class of an open popover. */
export const POPOVER_OPEN = ":popover-open"

/** ARIA boolean, `aria-*="true"`. */
export const TRUE = "true"

/** The `notEmpty` validation rule a `required` field applies. */
export const REQUIRED_RULE: ValidationRule = "notEmpty"

////////////////
// ## Constants shared by ui-popup, ui-toast, ui-search, ui-progress, ui-tab, ui-rating, ui-table, ui-visibility, ui-segment, ui-step, ui-shape, ui-transition, ui-sidebar, ui-sticky
////////////////

export const MANUAL = "manual"

export const AUTO = "auto"

/** The one trigger with interactive content. */
export const CLICK = "click"

/** The native tooltip attribute. */
export const TITLE = "title"

/** Class words of Fomantic's markup. */
export const BAR = "bar"

export const LABEL = "label"

export const SELECTED = "selected"

/** Runs of whitespace, between query words. */
export const WHITESPACE = /\s+/

export const FLUID = "fluid"

export const IMAGE = "image"

export const MESSAGE = "message"

export const STATUS = "status"

/** Utility class (`utilities.css`, adopted in every root) for the loading announcement. */
export const VISUALLY_HIDDEN = "ui-visually-hidden-force"

export const ANIMATING = "animating"

/** A duration of bare digits, in ms. */
export const DIGITS = /^\d+(\.\d+)?$/

/** State of a shown sidebar. */
export const VISIBLE = "visible"

/** Positions. */
export const LEFT = "left"

export const TOP = "top"

/** Close reason of a command. */
export const CLOSE = "close"

/** Root of a `link` step without `href`;  also its `type`. */
export const BUTTON = "button"

export const BOTTOM = "bottom"

/** Host attribute for the pane's Tab stop. */
export const TABINDEX = "tabindex"

export const BASIC = "basic"

export const FALSE = "false"

export const IN = "in"

export const OUT = "out"

///////////////////////////////////////////
// ## Shared by the form, input, item, list, menu, message, modal, nag and parts families
///////////////////////////////////////////

/** The form states:  tint a form, field or input and show the matching `<ui-message>`s. */
export const FORM_STATES = ["error", "info", "success", "warning"] as const

/** The `submit` word:  a button `type`, a form event. */
export const SUBMIT = "submit"

/** The `aria-invalid` attribute, set on a failing control. */
export const ARIA_INVALID = "aria-invalid"

/** The key that submits a prompt or a form. */
export const ENTER = "Enter"

/** The `item` word:  an item's part noun, class and `type`. */
export const ITEM = "item"

/** The `a` tag:  the root of a linked item, title or section. */
export const LINK = "a"

/** `aria-current="page"`:  the selected link of a list or menu. */
export const PAGE = "page"

/** Selector of a disabled custom element (`:state(disabled)`). */
export const DISABLED_STATE = ":state(disabled)"

/** Class words of a close button's icon (`close icon`). */
export const CLOSE_CLASS = "close icon"

/** Glyph of a close button's icon (Fomantic's `close icon`). */
export const CLOSE_ICON = "xmark"

////////////////
// ## Constants shared by ui-slider, ui-tab
////////////////

export const VERTICAL = "vertical"

////////////////
// ## More constants shared by ui-rating, ui-slider, ui-reveal, ui-search, ui-select, ui-statistic, ui-tab, ui-toast
////////////////

/** Keys. */
export const HOME = "Home"

export const END = "End"

/** Role of the root while it is the tab stop:  a group of the two contents. */
export const GROUP = "group"

export const DESCRIPTION = "description"

export const TEXT = "text"

/** Orientations (`aria-orientation`, roving). */
export const HORIZONTAL = "horizontal"

////////////////
// ## Sources:  shared by ui-include, ui-code, ui-markdown (`SourceElement`)
////////////////

/** When a `source` is fetched:  now, once scrolled into view, or when the browser is idle (Astro's islands). */
export const SOURCE_LOAD_MODES = ["eager", "visible", "idle"] as const

/** A `SOURCE_LOAD_MODES` value. */
export type SourceLoadMode = (typeof SOURCE_LOAD_MODES)[number]

/** Attributes every source element has;  spread first into its vocabulary's `attributes`. */
export const SOURCE_ATTRIBUTES = [
  {
    name: "source",
    kind: "string",
    description:
      "URL of the file to show, relative to the page;  same origin only (another site's URL shows an error).  " +
      "Changing it loads the new file.  Without it, the element shows its own content."
  },
  {
    name: "load",
    kind: "enum",
    values: SOURCE_LOAD_MODES,
    default: "eager",
    description:
      "When to fetch `source`:  `eager` (at once), `visible` (once scrolled into view) or `idle` (when the browser " +
      "has nothing else to do).  Like Astro's `client:visible` / `client:idle`."
  }
] as const

/** Events every source element dispatches;  spread into its vocabulary's `events`. */
export const SOURCE_EVENTS = [
  {
    name: "ui-load",
    detail: "{ source?: string, content: string }",
    description: "Content arrived:  fetched from `source`, or read from the element's own content."
  },
  {
    name: "ui-change",
    detail: "{ content: string }",
    description: "The `content` property was set:  the element shows the new text, and is `dirty` until saved."
  },
  {
    name: "ui-save",
    detail: "{ source?: string, content: string, etag?: string }",
    cancelable: true,
    description:
      "`host.save()` is about to save:  `preventDefault()` to save it yourself (an editor posting elsewhere)."
  },
  {
    name: "ui-saved",
    detail: "{ source?: string, etag?: string }",
    description: "Saved;  `etag` is the file's new version."
  },
  {
    name: "ui-error",
    detail:
      "{ kind: 'load' | 'cross-origin' | 'file-protocol' | 'save' | 'conflict' | 'no-saver' | 'render', source?: string, error: unknown }",
    cancelable: true,
    description:
      "Loading, showing or saving failed;  `kind` says why.  Load and render failures show an error message " +
      "unless cancelled;  save failures keep the content as it is."
  }
] as const

/** Parts every source element has. */
export const SOURCE_PARTS = [
  { name: "loader", description: "The `<ui-loader>` shown while `source` loads." },
  { name: "error", description: "The `<ui-message>` shown when loading or showing failed." }
] as const

/** States every source element has. */
export const SOURCE_STATES = [
  { name: "loading", description: "Fetching `source`." },
  { name: "error", description: "Loading or showing failed:  the error message shows." },
  { name: "saving", description: "`save()` is in progress." },
  { name: "dirty", description: "`content` changed since it was loaded or saved." }
] as const

/** Texts every source element shows;  `{source}` is the URL as written. */
export const SOURCE_TEXTS = [
  { key: "sourceLoading", text: "Loading {source}", description: "Accessible name of the loader." },
  { key: "sourceLoadError", text: "Couldn't load {source}.", description: "The fetch failed." },
  {
    key: "sourceCrossOrigin",
    text: "Can't show {source}:  only files from this site can be shown.",
    description: "`source` is on another origin."
  },
  {
    key: "sourceFileProtocol",
    text: "Can't load {source}:  this page was opened from disk.  Open it from a web server to see it.",
    description: "The page is a `file://` page."
  },
  { key: "sourceRenderError", text: "Couldn't show {source}.", description: "The text arrived, but couldn't be shown." }
] as const

/** `detail` of `ui-load`. */
export type SourceLoadDetail = {
  /** `source` as written, or `undefined` for the element's own content */
  source?: string
  /** the text */
  content: string
}

/** `detail` of `ui-change`. */
export type SourceChangeDetail = {
  /** the new text */
  content: string
}

/** `detail` of the cancelable `ui-save`. */
export type SourceSaveDetail = {
  source?: string
  /** what's about to be saved */
  content: string
  /** version it was edited from */
  etag?: string
}

/** `detail` of `ui-saved`. */
export type SourceSavedDetail = {
  source?: string
  /** the file's new version */
  etag?: string
}

/** `detail` of a source element's `ui-error`. */
export type SourceErrorDetail = {
  /** why, see `SourceErrorKind` */
  kind: SourceErrorKind
  source?: string
  /** what was thrown */
  error: unknown
}
