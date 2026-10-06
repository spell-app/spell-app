/**
 * `UIT` -- what several component families share:  event details, the CSS contracts every implementation of a
 * component (the element and its native fallback) must honour, vocabulary pieces, and the words more than one family
 * reads (`UIT.ACTIVE`, `UIT.Key`).
 * - Read as `UIT.X`:  element and fallback files `import { E, UI, UIT } from "$/ui/core"`;  vocabularies and types
 *   files, which node imports (`yarn site:data`, `yarn gen:root`), value-import this file directly,
 *   `import * as UIT from "$/ui/components/components.types"` (`AGENTS.md` "Imports").
 * - PURE DATA, at the bottom of the import graph:  `import type` only, so node loads it and it never pulls in the
 *   element layer.  Its small helper classes (`Flags`, `StackClasses`, `ToggleCommands`) read only what's here.
 * - A constant ONE family reads stays in that family's types file;  it moves here once a second family needs it.
 */

import type { E } from "$/ui/core"

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
export type DropdownOptions = readonly E.MenuOption[]

/** `detail` of `ui-change`. */
export type DropdownChangeDetail = {
  /** value after the change */
  value: DropdownValue
  /** event of the person's action, when there was one */
  originalEvent?: Event
}

/** `detail` of the cancelable `ui-open` / `ui-close`. */
export type DropdownOpenDetail = {
  /** state it's ABOUT to enter */
  open: boolean
  /** event of the person's action, when there was one */
  originalEvent?: Event
}

/** `detail` of `ui-search`. */
export type DropdownSearchDetail = {
  /** current query */
  query: string
  /** `input` event that changed it */
  originalEvent?: Event
}

/** `detail` of `ui-add` / `ui-remove`:  the one value added or removed. */
export type DropdownItemDetail = {
  /** value added or removed */
  value: string
  /** event of the person's action, when there was one */
  originalEvent?: Event
}

////////////////
// ## Flag
////////////////

/****************
 * ### `Flags`
 * Flag code => Unicode flag emoji:  ONE rule for `<ui-flag>` (`FlagCountry`, after its names) and the `flag` of a
 * menu option (`<ui-dropdown>`, `<ui-select>`), so a flag draws the same everywhere (epic `wwod-spell-ui`, I6).
 * - A two-letter code (ISO 3166-1 alpha-2, any case) => its regional-indicator pair (`fr` => `🇫🇷`);  a code of
 *   `SPECIAL_FLAGS` (`rainbow`, `gb-eng` ...) => its emoji sequence;  anything else => `""`.
 * - Here, not in the `flag` family:  a menu importing that family's files would split a chunk both entries share.
 *   Fomantic's country NAMES (`FLAG_ALIASES`, ~250 of them) stay there, out of `core`:  a menu option takes codes.
 * - STATIC and instance-free:  pure lookups.
 ****************/
export class Flags {
  /** Emoji of flag `code`, in any case;  `""` when it names no flag. */
  static emojiFor(code: string): string {
    const key = code.toLowerCase()
    if (Flags.isSpecial(key)) return SPECIAL_FLAGS[key]
    if (!TWO_LETTERS.test(key)) return ""
    return String.fromCodePoint(...Array.from(key, (letter) => INDICATOR_A + letter.charCodeAt(0) - LETTER_A))
  }

  /** Is lowercase `code` a flag that isn't a country's, a key of `SPECIAL_FLAGS`? */
  static isSpecial(code: string): code is SpecialFlag {
    return Object.hasOwn(SPECIAL_FLAGS, code)
  }
}

/**
 * Flags that aren't a regional-indicator pair, by code:  emoji ZWJ sequences, and the England / Scotland / Wales
 * subdivision flags (tag sequences named by their ISO 3166-2 codes, `gb-eng` ...).
 * - Why data:  the code => emoji rule only covers two-letter codes.
 * - Each one's name is a `<ui-flag>` text, its code in camel case (`gb-eng` => `gbEng`).
 * - NOTE: subdivision flags only render where the emoji font has them (Apple, Google, Samsung, Twemoji);
 *   Windows shows a black flag.
 */
export const SPECIAL_FLAGS = {
  rainbow: "\u{1F3F3}\u{FE0F}\u{200D}\u{1F308}",
  transgender: "\u{1F3F3}\u{FE0F}\u{200D}\u{26A7}\u{FE0F}",
  pirate: "\u{1F3F4}\u{200D}\u{2620}\u{FE0F}",
  "gb-eng": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  "gb-sct": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
  "gb-wls": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}"
} as const

/** Code of a flag in `SPECIAL_FLAGS`, e.g. `"gb-eng"`. */
export type SpecialFlag = keyof typeof SPECIAL_FLAGS

/** An ISO 3166-1 alpha-2 code, lowercase. */
const TWO_LETTERS = /^[a-z]{2}$/

/** `U+1F1E6`, REGIONAL INDICATOR SYMBOL LETTER A. */
const INDICATOR_A = 0x1f1e6

/** Char code of `a`. */
const LETTER_A = 0x61

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
  /** Role of the item HOST (internals), e.g. `listitem`;  `undefined` for none. */
  hostRole?: string
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
 * reaches it through `PartContext.ownerController()` and calls `itemContext(item)`, tracked.
 * - The item also adopts the owner's `styles`:  the owner's sheet holds its item rules
 *   (`:host(:state(in-list)) > .item`), next to the static class-grammar ones (`.ui.list > .item`).
 */
export type ItemOwner = {
  /** How `item` (the `<ui-item>` host) renders;  tracked, so an owner attribute change re-renders it. */
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
 * Marks the NATIVE control in a static server render (`$/ui/static`), for the flattener:  the host's `id` and ARIA
 * names belong there, so a `<label for>` the host's id labels the control.
 * - Elements NEVER set it in a browser;  `StaticFlattener` moves the host's `id` / `aria-label*` /
 *   `aria-describedby` there, then drops the mark (seo plan, T5).
 */
export const STATIC_CONTROL = "data-ui-control"

/**
 * Marks each component ROOT in a static server render (`$/ui/static`) with its family's kind (`data-ui="table"`).
 * - The flattener writes it (as `SSR.ROOT_ATTRIBUTE`, which IS this);  a component writes it itself only on what the
 *   flattener never sees as a root:  `<ui-table>`'s slotted author table.
 * - PUBLISHED spelling:  component sheets (`:not([data-ui])`) and `native.css` spell it out.
 */
export const STATIC_ROOT = "data-ui"

////////////////
// ## Grid
////////////////

/**
 * Size container a top-level `<ui-grid>` HOST establishes (`container: ui-grid / inline-size`), see `ui-grid.css`.
 * - `stackable`, `doubling`, `reversed` and per-device widths answer to it, not to the viewport (unless
 *   `stack-with="page"`, see "Stacking").
 * - Page CSS may query it too, e.g. `@container ui-grid (width < 768px) { ... }` inside a column.
 */
export const GRID_CONTAINER_NAME = "ui-grid"

////////////////
// ## Stacking
////////////////

/**
 * `stack-with`'s values:  what a stacking layout's breakpoints (`stackable`, `doubling` ...) compare with.
 * - `container`:  the element's OWN width (container queries), the default
 * - `page`:  the screen's width (`@media`), as Fomantic
 * - On `<ui-grid>`, `<ui-cards>`, `<ui-steps>`, `<ui-form>`, `<ui-items>`, `<ui-statistics>`, and on `<ui-root>`,
 *   which sets `STACK_WITH_TOKEN` for everything inside
 */
export const StackWithValues = ["container", "page"] as const

/** One of `StackWithValues`. */
export type StackWith = (typeof StackWithValues)[number]

/**
 * Page-wide token the stacking sheets read when an element has no `stack-with` of its own:
 * `--ui-stack-with: page` on any ancestor (`<ui-root stack-with="page">` sets it).
 * - Inherited, global:  NOT a component token, declared nowhere by default (unset ~== `container`)
 */
export const STACK_WITH_TOKEN = "--ui-stack-with"

/**
 * Prefix of the private class an element's `stack-with` adds after the noun:  `ui stackable grid stack-with-page`.
 * - A class, not a host state:  `:state()` rules left WebKit with stale viewport media queries (`ui-table.css`'s
 *   `stack-by`, the same mechanism)
 * - From the CANONICAL value, so a translated attribute still works
 */
export const STACK_WITH_CLASS = "stack-with-"

/****************
 * ### `StackClasses`
 * The class `stack-with` adds, shared by every element that has the attribute.
 * - STATIC and instance-free:  a pure lookup.
 ****************/
export class StackClasses {
  /** `stack-with-page` / `stack-with-container` for `value`;  `undefined` when unset (the token decides). */
  static classFor(value: StackWith | undefined): string | undefined {
    return value ? `${STACK_WITH_CLASS}${value}` : undefined
  }
}

////////////////
// ## Menu appearance
////////////////

/**
 * `appearance` of `<ui-menu>` and `<ui-tabs>` (whose tab list IS a menu):  the menu's LOOK, one word.
 * - Each value emits itself as the class word (`kind: "valueOnly"`), so `appearance="tabular"` ~== the older
 *   boolean `tabular`, which stays as an alias;  `appearance="pointing" secondary` ~== `secondary pointing`.
 * - `segmented` is ours:  a bordered group of joined items, the selected one filled with the menu's colour (the
 *   primary colour by default) -- a segmented control.  It hugs its items;  `alignment` places it.
 * - NOTE: not `vertical` (an orientation every look combines with) or `basic` (`<ui-tabs basic>` is the panes')
 */
export const MenuAppearances = ["tabular", "pointing", "secondary", "text", "segmented"] as const

/** One of `MenuAppearances`. */
export type MenuAppearance = (typeof MenuAppearances)[number]

/**
 * `alignment` of `<ui-menu>` and `<ui-tabs>`:  where the items sit along the bar, emitted as `<value> aligned`.
 * - `fluid`:  the items fill the bar (each grows from its own width;  with `equal`, every item the same share)
 * - `left` / `center` / `right`:  the items pack at that end;  the bar itself spans the row, except a `segmented`
 *   one, which IS its items and moves as a whole
 * - Unset:  as before (packed left, the bar as its look makes it)
 */
export const ItemAlignments = ["fluid", "left", "center", "right"] as const

/** One of `ItemAlignments`. */
export type ItemAlignment = (typeof ItemAlignments)[number]

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
  /** event of the person's action, when there was one */
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
  /** event of the person's action, when there was one */
  originalEvent?: Event
}

/**
 * What a chosen checkbox / radio submits without a `value`:  the native default.
 * - Shared by `ui-checkbox` (the elements, the fallback) and `ui-form` (`values` of native and `ui-*` checkables).
 */
export const CHECKBOX_DEFAULT_VALUE = "on"

////////////////
// ## Form
////////////////

/** One field's value as `<ui-form>` reads it (`values`):  the `Validator`'s `E.FieldValue`. */
export type FormFieldValue = E.FieldValue

/** `<ui-form>`'s `values`:  by field name (or id). */
export type FormValues = Record<string, E.FieldValue>

/**
 * One field's rules in `<ui-form rules>`, Fomantic's `fields` shape:
 * - a shorthand string (`"notEmpty"`, `"minLength[6]"`) or a list of them / rule objects
 * - or `{ rules, optional?, depends?, identifier? }`:  `optional` skips a blank field, `depends` skips the field
 *   while another is blank, `identifier` names the control when the key doesn't
 * - NOTE: Fomantic's deprecated `empty` means `notEmpty`
 */
export type FormFieldRules =
  | E.ValidationRule
  | readonly E.ValidationRule[]
  | {
      /** the rules, in order */
      rules: readonly E.ValidationRule[]
      /** skip the field while it's blank */
      optional?: boolean
      /** skip the field while the field of this name is blank */
      depends?: string
      /** the control's name or id, when the key isn't */
      identifier?: string
    }

/** `<ui-form>`'s `rules` property. */
export type FormRules = Record<string, FormFieldRules>

/** `detail` of `ui-valid`. */
export type FormValidDetail = {
  /** field name (or id) */
  field: string
  /** the field's value */
  value: E.FieldValue
  /** every field's value */
  values: FormValues
}

/** `detail` of `ui-invalid`. */
export type FormInvalidDetail = FormValidDetail & {
  /** the field's prompts */
  errors: string[]
}

/** `detail` of the cancelable `ui-success`. */
export type FormSuccessDetail = {
  /** every field's value */
  values: FormValues
  /** event of the person's action, when there was one */
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
 * attribute itself (Fomantic's `.ui.raised.cards > .card`), read through `UICards.variationFor()`.
 */
export type CardSharedVariation = "size" | "color" | "horizontal" | "raised" | "link" | "basic" | "inverted"

////////////////
// ## Popup
////////////////

/**
 * What opens a `<ui-popup>` (`on`):  Fomantic's names;  `hover` also opens on keyboard focus.
 * - A const object (the `Key` shape), so the element compares `trigger === UIT.PopupTrigger.click`.
 */
export const PopupTrigger = { hover: "hover", focus: "focus", click: "click", manual: "manual" } as const
/** One of `PopupTrigger`'s values, e.g. `"click"`. */
export type PopupTrigger = (typeof PopupTrigger)[keyof typeof PopupTrigger]

/** Every `PopupTrigger`, in Fomantic's order:  the vocabulary's `on` values. */
export const PopupTriggers = [PopupTrigger.hover, PopupTrigger.focus, PopupTrigger.click, PopupTrigger.manual] as const

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
  /** event of the person's action, when there was one */
  originalEvent?: Event
}

/** `detail` of the cancelable `ui-close`. */
export type ModalCloseDetail = {
  /** always `false`:  it's closing */
  open: false
  /** why it's closing */
  reason: ModalCloseReason
  /** event of the person's action, when there was one */
  originalEvent?: Event
}

/** `detail` of the cancelable `ui-approve` / `ui-deny`. */
export type ModalActionDetail = {
  /** the button (or other element) that was activated, in the light DOM */
  action: Element
  /** event of the person's action, when there was one */
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
export type SelectOptions = readonly E.MenuOption[]

/** `detail` of `ui-change`, from `<ui-select>`. */
export type SelectChangeDetail = {
  /** value after the change */
  value: SelectValue
  /** event of the person's action, when there was one */
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
  /** shown under the title */
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
  /** Fomantic's result id:  the page's own, unread here;  it rides along in `ui-select`'s `result` */
  id?: string
  [field: string]: unknown
}

/** A named group of results, Fomantic's category shape (`{ name, results }`). */
export type SearchCategory = {
  /** the category's heading */
  name: string
  /** its results, in order */
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
 *
 * A const object (the `Key` shape), so `SearchMatcher` compares `match === UIT.SearchMatch.fuzzy`.
 */
export const SearchMatch = { exact: "exact", fuzzy: "fuzzy", prefix: "prefix", some: "some", all: "all" } as const
/** One of `SearchMatch`'s values, e.g. `"fuzzy"`. */
export type SearchMatch = (typeof SearchMatch)[keyof typeof SearchMatch]

/** Every `SearchMatch`, in Fomantic's order:  the vocabulary's `full-text-search` values. */
export const SearchMatches = [
  SearchMatch.exact,
  SearchMatch.fuzzy,
  SearchMatch.prefix,
  SearchMatch.some,
  SearchMatch.all
] as const

/** `detail` of the cancelable `ui-select`, from `<ui-search>`. */
export type SearchSelectDetail = {
  /** the result chosen */
  result: SearchResult
  /** event of the person's action, when there was one */
  originalEvent?: Event
}

/** `detail` of `ui-search`:  the query about to run. */
export type SearchQueryDetail = {
  /** the query */
  query: string
  /** event of the person's action, when there was one */
  originalEvent?: Event
}

/** `detail` of `ui-results`:  what a query found (before `max-results` for a remote one). */
export type SearchResultsDetail = {
  /** the query */
  query: string
  /** what matched */
  results: readonly SearchResult[]
}

/** `detail` of `ui-change`, from `<ui-search>`:  its text was committed. */
export type SearchChangeDetail = {
  /** the committed text */
  value: string
  /** event of the person's action, when there was one */
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
  /** why it's closing */
  reason: ToastCloseReason
  /** event of the person's action, when there was one */
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
  /** event of the person's action, when there was one */
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
  /** why it's closing */
  reason: NagCloseReason
  /** event of the person's action, when there was one */
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
  /** event of the person's action, when there was one */
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
  /** event of the person's action, when there was one */
  originalEvent?: Event
}

/** `detail` of the cancelable `ui-close`. */
export type DimmerCloseDetail = {
  /** always `false`:  it's hiding */
  active: false
  /** why it's hiding */
  reason: DimmerCloseReason
  /** event of the person's action, when there was one */
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
  /** event of the person's action, when there was one */
  originalEvent?: Event
}

/** `detail` of the cancelable `ui-close`. */
export type SidebarCloseDetail = {
  /** always `false`:  it's closing */
  visible: false
  /** why it's closing */
  reason: SidebarCloseReason
  /** event of the person's action, when there was one */
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

/** Fomantic's word widths (`thin sidebar`, `very wide flyout`):  `<ui-sidebar>` / `<ui-flyout>` `width` beside columns. */
export const WordWidths = ["very thin", "thin", "wide", "very wide"] as const

/** One of `WordWidths`. */
export type WordWidth = (typeof WordWidths)[number]

/****************
 * ### `WordWidthClasses`
 * The word a `width` adds after the noun (`ui left sidebar thin`), shared by `<ui-sidebar>`, `<ui-flyout>` and their
 * fallbacks:  `ClassBuilder`'s `width` kind only knows columns.
 ****************/
export class WordWidthClasses {
  /**
   * `width` as one of `WordWidths`, its words joined by spaces or dashes (`very-thin` ~== `very thin`);  `undefined`
   * for columns or nothing.
   * - Takes `null`:  a fallback passes `getAttribute()`'s.
   */
  static classFor(width: string | number | null | undefined): WordWidth | undefined {
    const text = typeof width === "string" ? width.trim().replace(WORD_SEPARATORS, " ") : undefined
    return WordWidths.find((word) => word === text)
  }
}

/** Runs of spaces or dashes between a word width's words. */
const WORD_SEPARATORS = /[\s-]+/g

////////////////
// ## Shape
////////////////

/** Each way a `<ui-shape>` flips to its next side (Fomantic's `flip up` ... `flip back`), for `--flip-<way>`. */
export const ShapeFlips = ["up", "down", "left", "right", "over", "back"] as const

/** One of `ShapeFlips`. */
export type ShapeFlip = (typeof ShapeFlips)[number]

/**
 * Invoker commands a `<ui-shape>` answers, `<button commandfor="id" command="--next">`.
 * - `next` / `previous`:  turn to the next / previous side, the `direction` attribute's way
 * - `flip` + a `ShapeFlip`:  turn to the next side THAT way (`--flip-up` ...), Fomantic's `flip up` behaviour
 */
export const SHAPE_COMMANDS = { next: "--next", previous: "--previous", flip: "--flip-" } as const

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

/**
 * What acts on its own inside a title that folds (a `<ui-accordion>` panel's, a collapsible `<ui-section>`'s):  a
 * click on one never folds it.
 */
export const TITLE_CONTROLS = "a[href], button, input, select, textarea, label, [contenteditable], [tabindex]"

/** Tells a click on a folding title from a click on a control inside it (`TITLE_CONTROLS`). */
export class TitleControls {
  /**
   * Did `event` land on a control inside the title, before reaching its toggle (`toggle`, a selector:  the
   * accordion's `summary`, the section's fold button)?
   * - Climbs `composedPath()`, so a control slotted into the title counts.
   */
  static isClicked(event: Event, toggle: string): boolean {
    for (const target of event.composedPath()) {
      // elements only:  the path ends in shadow roots, the document and the window, which can't `matches()`
      const element = target as Partial<Element>
      if (!element.matches) continue
      if (element.matches(toggle)) return false
      if (element.matches(TITLE_CONTROLS)) return true
    }
    return false
  }
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

////////////////
// ## Keys
////////////////

/**
 * `KeyboardEvent.key` of every key a family handles:  `event.key === UIT.Key.arrowDown`.
 * - ONE set for every family (epic `wwod-spell-ui`, P2), instead of a constant per family per key.
 */
export const Key = {
  arrowUp: "ArrowUp",
  arrowDown: "ArrowDown",
  arrowLeft: "ArrowLeft",
  arrowRight: "ArrowRight",
  home: "Home",
  end: "End",
  pageUp: "PageUp",
  pageDown: "PageDown",
  enter: "Enter",
  space: " ",
  escape: "Escape",
  tab: "Tab",
  backspace: "Backspace",
  delete: "Delete"
} as const
/** One of `Key`'s values, e.g. `"ArrowDown"`. */
export type Key = (typeof Key)[keyof typeof Key]

////////////////
// ## ARIA:  attributes, roles and values
////////////////

/** The `aria-label` attribute:  a host's label, forwarded to its inner element. */
export const ARIA_LABEL = "aria-label"

/** The `aria-invalid` attribute, set on a failing control. */
export const ARIA_INVALID = "aria-invalid"

/** The `aria-expanded` attribute:  a disclosure's state (a popup's trigger, an item's button). */
export const ARIA_EXPANDED = "aria-expanded"

/** ARIA boolean `true`, as attribute text (`aria-*="true"`, `internals.ariaBusy`). */
export const TRUE = "true"

/** ARIA boolean `false`, as attribute text;  also a boolean attribute's "off" (`collapsible="false"`). */
export const FALSE = "false"

/** `aria-current="page"`:  the selected link of a list or menu. */
export const PAGE = "page"

/** The `none` value:  an ARIA role to remove, an attribute value that switches a thing off. */
export const NONE = "none"

/** ARIA role of a decorative or labelled picture. */
export const IMG = "img"

/** ARIA role of a list root. */
export const LIST = "list"

/** ARIA role of an item of a list. */
export const LISTITEM = "listitem"

/** ARIA role of a root that groups its parts while it is the tab stop (a reveal, a range slider). */
export const GROUP = "group"

/** ARIA role of a polite live region:  a loading announcement, a toast. */
export const STATUS = "status"

/** ARIA role of an assertive live region:  an error line, an error toast. */
export const ALERT = "alert"

/** ARIA role of a dividing line:  a divider, a divider item. */
export const SEPARATOR = "separator"

/** Orientation (`aria-orientation`, roving focus, a layout word):  side by side. */
export const HORIZONTAL = "horizontal"

/** Orientation (`aria-orientation`, roving focus, a layout word):  one above the other. */
export const VERTICAL = "vertical"

/** ARIA role of a named landmark:  a root's or a table's scrolling box, a toast container. */
export const REGION = "region"

////////////////
// ## Tags and selectors
////////////////

/** The anchor tag, `a`:  the root of a linked item, card, step, title or section. */
export const ANCHOR_TAG = "a"

/** The `button` tag (a `link` item or step without `href`), and its `type`. */
export const BUTTON = "button"

/** Tag of an unordered list's root. */
export const UL = "ul"

/** Tag of an ordered (`ordered`) list's root. */
export const OL = "ol"

/** Pseudo-class of an open popover. */
export const POPOVER_OPEN = ":popover-open"

/** Selector of a disabled custom element (`:state(disabled)`). */
export const DISABLED_STATE = ":state(disabled)"

////////////////
// ## Attributes and their values
////////////////

/** The native tooltip attribute, `title`. */
export const TITLE = "title"

/** The `tabindex` attribute:  a tab stop (roving focus, a scrolling pane). */
export const TABINDEX = "tabindex"

/** The `ordered` attribute:  a numbered list or feed;  a nested one reads its outer one's. */
export const ORDERED = "ordered"

/** The `auto` value:  decided by the platform or the element (`popover="auto"`, a toast's `display-time`). */
export const AUTO = "auto"

/** The `manual` value:  left to script (`popover="manual"`, a tab list's `activation`). */
export const MANUAL = "manual"

/** The `click` event, and the trigger value meaning it (a popup's `on`, the one with interactive content). */
export const CLICK = "click"

/** The `close` word:  the close reason of a close icon or command, the close button's part and text key. */
export const CLOSE = "close"

/** A side:  the `left` position word. */
export const LEFT = "left"

/** A side:  the `top` position word. */
export const TOP = "top"

/** A side:  the `bottom` position word. */
export const BOTTOM = "bottom"

/** Transition direction:  showing (`UI.transitions.animate({ direction })`). */
export const IN = "in"

/** Transition direction:  hiding. */
export const OUT = "out"

////////////////
// ## Class and part words
////////////////

/** The `active` state / class word. */
export const ACTIVE = "active"

/** The `disabled` state / class word. */
export const DISABLED = "disabled"

/** The `selected` state / class word. */
export const SELECTED = "selected"

/** The `animating` class word:  a box mid-transition. */
export const ANIMATING = "animating"

/** The `visible` class / state word:  a shown sidebar, tab or transition. */
export const VISIBLE = "visible"

/** The `content` word:  a part, a class, a slot. */
export const CONTENT = "content"

/** The `header` word:  a part, a class, a slot. */
export const HEADER = "header"

/** The `description` word:  a part, a class. */
export const DESCRIPTION = "description"

/** The `icon` word:  a part, a class, a slot. */
export const ICON = "icon"

/** Grammar word the element adds itself (not an attribute):  the `icon` class. */
export const ICON_CLASS = "icon"

/** The `image` word:  a part, a class. */
export const IMAGE = "image"

/** The `item` word:  an item's part noun, class and `type`. */
export const ITEM = "item"

/** The `label` word:  a part, a class. */
export const LABEL = "label"

/** The `message` word:  a class, a part. */
export const MESSAGE = "message"

/** The `text` word:  a class, a part, a value (`language="text"`). */
export const TEXT = "text"

/** The `bar` class word (a progress bar, a toast's progress). */
export const BAR = "bar"

/** The `basic` class word. */
export const BASIC = "basic"

/** The `fluid` class word. */
export const FLUID = "fluid"

/** Class words of a close button's icon (`close icon`). */
export const CLOSE_CLASS = "close icon"

/** Glyph of a close button's icon (Fomantic's `close icon`). */
export const CLOSE_ICON = "xmark"

/** Text a native fallback's close button shows instead of `CLOSE_ICON`'s glyph (no icon packs without Solid). */
export const CLOSE_TEXT = "×"

/**
 * Prefix of the colour remap class a coloured box adds without the `ui` word (`ui-red`):  an item, a step, a feed
 * event.  Why:  the generic remap (`colors.css`) keys on `.ui.red` or `.ui-red`.
 */
export const COLOR_CLASS_PREFIX = "ui-"

/** Utility class (`utilities.css`, adopted in every root) of a visually hidden announcement. */
export const VISUALLY_HIDDEN = "ui-visually-hidden-force"

////////////////
// ## Form words
////////////////

/** The form states:  tint a form, field or input and show the matching `<ui-message>`s. */
export const FormStates = ["error", "info", "success", "warning"] as const

/** One of `FormStates`. */
export type FormState = (typeof FormStates)[number]

/** The `submit` word:  a button `type`, a form event. */
export const SUBMIT = "submit"

/** The `notEmpty` validation rule a `required` field applies. */
export const REQUIRED_RULE: E.ValidationRule = "notEmpty"

////////////////
// ## Patterns
////////////////

/** Runs of whitespace:  between query words, class words, country names. */
export const WHITESPACE = /\s+/

/** A duration of bare digits, in ms (`duration="300"`). */
export const DIGITS = /^\d+(\.\d+)?$/

////////////////
// ## Sources:  shared by ui-include, ui-code, ui-markdown (`SourceElement`)
////////////////

/** When a `source` is fetched:  now, once scrolled into view, or when the browser is idle (Astro's islands). */
export const SourceLoadModes = ["eager", "visible", "idle"] as const

/** One of `SourceLoadModes`. */
export type SourceLoadMode = (typeof SourceLoadModes)[number]

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
    values: SourceLoadModes,
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

/**
 * Error messages of a failed load;  `{source}` is the URL as written.
 * - Spread on their own by `<ui-section>` / `<ui-accordion>`, whose `source` body shows them (`SourceBody`).
 */
export const SOURCE_FAILURE_TEXTS = [
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

/** Texts every source element shows;  `{source}` is the URL as written. */
export const SOURCE_TEXTS = [
  { key: "sourceLoading", text: "Loading {source}", description: "Accessible name of the loader." },
  ...SOURCE_FAILURE_TEXTS
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
  /** `source` as written, or `undefined` for the element's own content */
  source?: string
  /** what's about to be saved */
  content: string
  /** version it was edited from */
  etag?: string
}

/** `detail` of `ui-saved`. */
export type SourceSavedDetail = {
  /** `source` as written, or `undefined` for the element's own content */
  source?: string
  /** the file's new version */
  etag?: string
}

/** `detail` of a source element's `ui-error`. */
export type SourceErrorDetail = {
  /** why, see `E.SourceErrorKind` */
  kind: E.SourceErrorKind
  /** `source` as written, or `undefined` for the element's own content */
  source?: string
  /** what was thrown */
  error: unknown
}

////////////////
// ## Source bodies:  shared by ui-section and ui-accordion (`SourceBody`)
////////////////

/**
 * Attributes of an element whose BODY can come from a file, loaded the first time it opens;  spread into its
 * vocabulary's `attributes` (`<ui-section>`, and so every subclass reusing its vocabulary, `<ui-accordion>`).
 */
export const SOURCE_BODY_ATTRIBUTES = [
  {
    name: "source",
    kind: "string",
    description:
      "URL of an HTML file whose `<body>` is the content, fetched the first time it opens (at once when it starts " +
      "open);  same origin only.  Any content already there is a placeholder the file replaces.  " +
      "`load()` fetches it now, `reload()` again."
  },
  {
    name: "select",
    kind: "string",
    description: "With `source`:  a CSS selector;  only its first match in the file becomes the content."
  }
] as const

/** Events of a source body;  spread into the vocabulary's `events`. */
export const SOURCE_BODY_EVENTS = [
  {
    name: "ui-load",
    detail: "{ source: string, content: string }",
    description: "The `source` file arrived and its body is in place (`content` is the file's text)."
  },
  {
    name: "ui-error",
    detail: "{ kind: 'load' | 'cross-origin' | 'file-protocol' | 'render', source: string, error: unknown }",
    cancelable: true,
    description:
      "The `source` file couldn't be loaded or shown;  `kind` says why.  An error line shows in the content " +
      "unless cancelled;  opening it again tries again."
  }
] as const

/** Parts of a source body. */
export const SOURCE_BODY_PARTS = [
  { name: "error", description: "With `source`:  the line saying the file couldn't be loaded." }
] as const

/** States of a source body (`loading` is the element's own:  `<ui-section>` already has one). */
export const SOURCE_BODY_STATES = [
  { name: "loaded", description: "With `source`:  the file's body is in place." },
  { name: "error", description: "With `source`:  the file couldn't be loaded or shown." }
] as const
