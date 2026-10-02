/**
 * Every name `<ui-menu>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-menu secondary pointing size="large" items="3">` => `ui large pointing secondary three item menu`.
 *   `ui-menu.css` keys on those words.
 * - Items are the generic `<ui-item>` (`$/ui/components/ui-item`), styled by owner context:  `ownsParts` has `item`.
 *   A `<ui-menu>` inside a menu is a SUB-MENU (Fomantic's `<div class="right menu">`), so `menu` is owned too;
 *   a `<ui-header>` inside an item is a vertical menu's sub header.
 * - `tabular` is Fomantic's classic word;  2.9 renamed it `tabbed` (`@variationMenuTabbedLegacyTabular`).
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

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
      description: "Hue of the active item;  with `inverted`, the menu's fill."
    },
    {
      name: "position",
      kind: "valueOnly",
      values: ["left", "right", "center"],
      description: "Sub-menu only:  pushes it to the `right` / `left` end, or the `center`."
    },
    { name: "secondary", kind: "keyOnly", description: "De-emphasized:  no box, rounded items." },
    {
      name: "pointing",
      kind: "keyOnly",
      description: "The active item points at the content below (an arrow;  an underline with `secondary`)."
    },
    { name: "tabular", kind: "keyOnly", description: "Looks like tabs (Fomantic 2.9's `tabbed`)." },
    { name: "text", kind: "keyOnly", description: "Plain text items, no box." },
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
      name: "items",
      kind: "width",
      widthClass: "item",
      canEqual: true,
      description: 'Divides the width evenly between N items (`items="3"` => `three item`), or `equal` widths.'
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
      description:
        "An interactive item (a link or button) was activated.  `value` is the item's `value`, else its text.  " +
        "The menu doesn't move `selected` itself."
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
} as const satisfies ComponentVocabulary
