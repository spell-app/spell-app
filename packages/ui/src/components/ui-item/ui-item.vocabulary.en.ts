/**
 * Every name `<ui-item>` uses:  tag, attributes (kind + allowed values), slots, parts, states.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - ONE generic item, as Fomantic's `.item` is shared by dropdown, list and menu:  it renders by OWNER
 *   (`PartContext`), never `ui-list-item` / `ui-menu-item`.  See `docs/grammar.md`, "Items".
 * - Class words come out through `ClassBuilder`, no `ui`:  `<ui-item color="red" selected link>` =>
 *   `red active link item` -- the owner's sheet (`ui-list.css`, `ui-menu.css`) styles them by context.
 * - Attributes name what ANY owner needs;  each description says who reads it.
 * - `ownsParts`:  CONDITIONAL (`ConditionalOwner`) -- the item owns them only in the Items view (`<ui-items>`);  in a
 *   list or menu they see through it to their owner.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-item>`
 * One item of a dropdown (data), list, menu or Items view (a rendered `.item`).
 ****************/
export const itemVocabulary = {
  tag: "ui-item",
  topics: ["lists", "content parts", "data display", "views"],
  aka: ["list item", "media object", "row"],
  noun: "item",
  ui: false,
  description: "An item of a dropdown, list, menu or Items view.",
  attributes: [
    {
      name: "color",
      kind: "color",
      description: "Menu:  hue of the item while selected (`red active item`)."
    },
    {
      name: "position",
      kind: "valueOnly",
      values: ["left", "right"],
      description: "Menu:  `right` pushes the item (and what follows) to the far end."
    },
    { name: "value", kind: "string", description: "Value;  defaults to `text`.  Ordered list:  shown as the marker." },
    { name: "text", kind: "string", description: "Dropdown:  text;  defaults to the text content." },
    { name: "description", kind: "string", description: "Dropdown:  secondary text, shown at the end." },
    { name: "icon", kind: "icon", description: "Icon name, shown before the text." },
    {
      name: "image",
      kind: "string",
      description: "Image URL, shown before the text:  an avatar in a list, the item's picture in the Items view."
    },
    { name: "flag", kind: "string", description: "Dropdown:  country code, shown as a flag before the text." },
    { name: "href", kind: "string", description: "List / menu:  renders a link (`<a>`)." },
    { name: "target", kind: "string", description: "Link target, with `href`." },
    {
      name: "link",
      kind: "keyOnly",
      description: "List / menu:  interactive without `href` -- renders a `<button>`, with the link hover."
    },
    { name: "disabled", kind: "keyOnly", description: "Can't be chosen or followed." },
    {
      name: "selected",
      kind: "keyOnly",
      key: "active",
      description:
        "Chosen:  the dropdown's value, the list's / menu's current item (`aria-current`).  Alias:  `active`.  " +
        "NOTE: Fomantic's word for it is `active`;  its `selected` means highlighted."
    },
    {
      name: "fitted",
      kind: "keyOrValueAndKey",
      values: ["horizontally", "vertically"],
      description: "Menu:  no padding;  `horizontally` / `vertically` keep the other axis' padding."
    },
    {
      name: "type",
      kind: "enum",
      values: ["item", "header", "divider"],
      default: "item",
      description: "An item, a group `header` (dropdown, menu), or a `divider` line (dropdown)."
    }
  ],
  events: [],
  slots: [
    {
      name: "",
      description: "Content:  text, `<ui-icon>`, `<ui-content>` (header, description), a nested list / menu."
    },
    { name: "icon", description: "List / menu:  replaces the `icon` shorthand's glyph." }
  ],
  parts: [
    { name: "item", description: "List / menu:  the item box (`<a>`, `<button>` or `<div>`)." },
    { name: "icon", description: "List / menu:  the icon box of the `icon` shorthand." },
    { name: "image", description: "List / menu:  the `<img>` of the `image` shorthand." }
  ],
  states: [
    { name: "selected", description: "Chosen (`selected` or `active`)." },
    { name: "disabled", description: "Can't be chosen." }
  ],
  texts: [],
  ownsParts: ["content", "header", "meta", "description", "extra", "avatar"]
} as const satisfies E.ComponentVocabulary
