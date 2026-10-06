/**
 * Every name `<ui-menu>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Pure data:  node imports it (`yarn site:data`, `yarn gen:root`), so `$/ui/core` for types only, `UIT` by value
 *   straight from `components.types`.
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-menu secondary pointing size="large" items="3">` => `ui large pointing secondary three item menu`.
 *   `ui-menu.css` keys on those words.
 * - Items are the generic `<ui-item>` (`$/ui/components/ui-item`), styled by owner context:  `ownsParts` has `item`.
 *   A `<ui-menu>` inside a menu is a SUB-MENU (Fomantic's `<div class="right menu">`), so `menu` is owned too;
 *   a `<ui-header>` inside an item is a vertical menu's sub header.
 * - `tabular` is Fomantic's classic word;  2.9 renamed it `tabbed` (`@variationMenuTabbedLegacyTabular`).
 * - The look is ONE word, `appearance` (`UIT.MenuAppearances`), shared with `<ui-tabs>`;  the older booleans
 *   (`tabular`, `pointing`, `secondary`, `text`) stay as aliases and emit the same class words.
 * - Item layout:  `alignment` (`UIT.ItemAlignments`) places the items, `equal` sizes them alike from the items
 *   themselves;  `items="3"` / `items="equal"` stay as the older count-based aliases.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"

/****************
 * ### `<ui-menu>`
 * A menu:  a `<nav>` of items (links) by default, a `role="menubar"` with roving focus when `interactive`,
 * or a sub-menu `<div class="right menu">` inside another menu.
 ****************/
export const menuVocabulary = {
  tag: "ui-menu",
  topics: ["menus", "navigation", "basic", "collections"],
  aka: ["navbar", "nav", "tabs bar", "toolbar", "sidebar menu", "pagination"],
  skeleton: { height: "3em" },
  noun: "menu",
  description: "A menu displays grouped navigation actions.",
  attributes: [
    { name: "size", kind: "size", description: "Size, `mini` ... `massive`;  `medium` is the default." },
    {
      name: "color",
      kind: "color",
      description: "Hue of the active item;  with `inverted`, the menu's fill;  `segmented`, the selected item's fill."
    },
    {
      name: "appearance",
      kind: "valueOnly",
      values: UIT.MenuAppearances,
      description:
        "The look:  `tabular` (tabs on a rule), `pointing` (the active item points at the content), `secondary` " +
        "(no box, rounded items), `text` (plain words), `segmented` (a segmented control:  a bordered group of " +
        "joined items, the selected one filled with `color`, else the primary colour;  it moves `selected` to the " +
        "item chosen itself;  `--ui-menu-segmented-*` restyle it as a pill track with a raised thumb).  The " +
        "booleans `tabular`, `pointing`, `secondary`, `text` are aliases:  " +
        '`appearance="pointing" secondary` ~== `secondary pointing`.'
    },
    {
      name: "position",
      kind: "valueOnly",
      values: ["left", "right", "center"],
      description:
        "Sub-menu:  pushes it to the `right` / `left` end, or the `center`.  A `vertical tabular` menu:  `right` " +
        "opens its tabs to the left, for a menu on the content's right (`ui right vertical tabular menu`)."
    },
    {
      name: "secondary",
      kind: "keyOnly",
      description: 'De-emphasized:  no box, rounded items.  Alias of `appearance="secondary"`.'
    },
    {
      name: "pointing",
      kind: "keyOnly",
      description:
        "The active item points at the content below (an arrow;  an underline with `secondary`).  Alias of " +
        '`appearance="pointing"`.'
    },
    {
      name: "tabular",
      kind: "keyOnly",
      description: 'Looks like tabs (Fomantic 2.9\'s `tabbed`).  Alias of `appearance="tabular"`.'
    },
    { name: "text", kind: "keyOnly", description: 'Plain text items, no box.  Alias of `appearance="text"`.' },
    { name: "vertical", kind: "keyOnly", description: "Items stacked top to bottom." },
    { name: "pagination", kind: "keyOnly", description: "Page links:  compact, centred items." },
    { name: "icon", kind: "keyOnly", description: "Icon-only items." },
    {
      name: "labeled",
      kind: "keyOnly",
      key: "labeled icon",
      description: "Labeled icon items:  a large icon above each item's text."
    },
    { name: "link", kind: "keyOnly", description: "Every item is interactive:  a `<button>` with the link hover." },
    { name: "fluid", kind: "keyOnly", description: "Takes the full width of its container." },
    { name: "stackable", kind: "keyOnly", description: "Stacks its items on mobile." },
    { name: "centered", kind: "keyOnly", description: "Centred in its container, items centred." },
    { name: "borderless", kind: "keyOnly", description: "No dividers between items." },
    { name: "compact", kind: "keyOnly", description: "Only as wide as its items." },
    { name: "wrapping", kind: "keyOnly", description: "Items wrap onto more lines when they don't fit." },
    { name: "wrapped", kind: "keyOnly", description: "With `wrapping`:  square corners where the lines meet." },
    {
      name: "inverted",
      kind: "keyOnly",
      description: "The dark scheme;  with `color`, filled with the colour."
    },
    {
      name: "floated",
      kind: "keyOrValueAndKey",
      values: ["left", "right"],
      description: "Floats beside the content;  `right` floats right."
    },
    {
      name: "fitted",
      kind: "keyOrValueAndKey",
      values: ["horizontally", "vertically"],
      description: "No item padding;  `horizontally` / `vertically` keep the other axis' padding."
    },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom"],
      description: "Joined edge to edge with a segment above / below;  bare `attached` sits in the middle."
    },
    {
      name: "fixed",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom", "left", "right"],
      description: "Fixed to an edge of the viewport."
    },
    {
      name: "alignment",
      kind: "valueAndKey",
      key: "aligned",
      values: UIT.ItemAlignments,
      description:
        "Where the items sit:  `fluid` -- they fill the bar;  `left` / `center` / `right` -- packed at that end of " +
        'a full-width bar (a `segmented` menu moves as a whole).  `alignment="center"` => `center aligned`.'
    },
    {
      name: "equal",
      kind: "keyOnly",
      description:
        'Every item the same width, from the items themselves (no count):  with `alignment="fluid"` each takes an ' +
        "equal share of the bar;  otherwise each is as wide as the widest, packed."
    },
    {
      name: "items",
      kind: "width",
      widthClass: "item",
      canEqual: true,
      description:
        'Older, count-based alias of `equal`:  divides the width evenly between N items (`items="3"` => ' +
        '`three item`);  `items="equal"` => `equal width` (Fomantic\'s, ~== `equal alignment="fluid"`).'
    },
    {
      name: "interactive",
      kind: "boolean",
      description:
        "An application menubar (`role=menubar`):  one Tab stop, arrow keys between items, every item a " +
        "`menuitem`.  Default:  a `<nav>` landmark of links."
    }
  ],
  events: [
    {
      name: "ui-select",
      detail: "{ value: string, item: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "An interactive item (a link or button) was activated.  `value` is the item's `value`, else its text.  " +
        "The menu doesn't move `selected` itself, except a `segmented` one (a single-choice control), which " +
        "selects the item and unselects the rest:  `preventDefault()` keeps the old choice."
    }
  ],
  slots: [{ name: "", description: "`<ui-item>`s, sub-menus (`<ui-menu position>`), and other content." }],
  parts: [{ name: "menu", description: "The menu box:  `<nav>`, `<div role=menubar>`, or a sub-menu's `<div>`." }],
  states: [
    { name: "interactive", description: "A menubar (`interactive`)." },
    { name: "vertical", description: "Items stacked (`vertical`)." }
  ],
  texts: [],
  ownsParts: ["item", "menu", "header"]
} as const satisfies E.ComponentVocabulary
