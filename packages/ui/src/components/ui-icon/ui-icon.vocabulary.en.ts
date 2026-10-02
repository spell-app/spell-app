/**
 * Every name `<ui-icon>` and `<ui-icons>` use:  tags, attributes (kind + allowed values), slots, parts, states.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-icon name="heart" size="large" color="red" circular>` => `ui large red circular icon`.  `ui-icon.css` keys
 *   on those words;  `name` / `outline` / `label` are property-only and pick the SVG (`UI.icons`).
 * - `iconsVocabulary.ownsParts` lists `icon`:  a `<ui-icon>` directly inside a `<ui-icons>` finds it through
 *   `OwnerContext` and sets `:state(in-icons)`, which `ui-icon.css` stacks and positions it by.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-icon>`
 * An SVG glyph from the page's icon packs (Font Awesome 7 Free by default):  `<span class="ui ... icon" part="icon">
 * <svg>` in the shadow root.
 ****************/
export const iconVocabulary = {
  tag: "ui-icon",
  topics: ["icons", "basic", "images", "elements"],
  aka: ["glyph", "symbol", "font awesome", "svg icon"],
  skeleton: { display: "inline", width: "1em", height: "1em" },
  noun: "icon",
  description: "An icon is a glyph used to represent something else.",
  attributes: [
    {
      name: "size",
      kind: "size",
      description: "Size relative to the surrounding text, `mini` (0.4em) ... `massive` (8em)."
    },
    {
      name: "color",
      kind: "color",
      description: "Hue of the glyph;  with `inverted` `circular` / `bordered`, the disc."
    },
    {
      name: "name",
      kind: "string",
      description:
        "Icon name in the page's packs:  `circle check`, `bell outline`, `lucide:bell` (one pack).  " +
        "Dashes ~== spaces, so Font Awesome's `circle-check` works too.  See `docs/icons.md`."
    },
    {
      name: "outline",
      kind: "boolean",
      description: "Appends ` outline` to `name`:  Fomantic's `bell outline icon` spelling.  No class of its own."
    },
    {
      name: "label",
      kind: "string",
      description:
        "Accessible name:  makes the icon an image (`role=img`, `aria-label`).  Without it the icon is decorative " +
        "and hidden from assistive technology."
    },
    { name: "disabled", kind: "keyOnly", description: "Dimmed and inert." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds;  fills a `circular` / `bordered` icon." },
    { name: "loading", kind: "keyOnly", description: "Spins, e.g. a `spinner` or `circle-notch` glyph." },
    { name: "fitted", kind: "keyOnly", description: "No gap after the glyph and no extra width." },
    { name: "link", kind: "keyOnly", description: "Clickable look:  dimmed until hovered, pointer cursor." },
    { name: "circular", kind: "keyOnly", description: "Inside a circular ring." },
    { name: "bordered", kind: "keyOnly", description: "Inside a square ring." },
    {
      name: "flipped",
      kind: "keyOrValueAndKey",
      values: ["horizontally", "vertically"],
      description: "Mirrored:  `flipped` / `horizontally`, or `vertically`."
    },
    {
      name: "rotated",
      kind: "keyOrValueAndKey",
      values: ["clockwise", "counterclockwise", "halfway"],
      description: "Turned a quarter:  `rotated` / `clockwise`, `counterclockwise`, or `halfway` (180°)."
    },
    {
      name: "corner",
      kind: "keyOrValueAndKey",
      values: ["top left", "top right", "bottom left", "bottom right"],
      description: "Inside `<ui-icons>`:  a small badge on a corner of the group;  bare `corner` is bottom right."
    }
  ],
  events: [],
  slots: [],
  parts: [{ name: "icon", description: "The glyph box holding the `<svg>`." }],
  states: [
    { name: "in-icons", description: "Directly inside a `<ui-icons>` group:  stacked on the group's first icon." },
    { name: "disabled", description: "Dimmed and inert." },
    { name: "loading", description: "Spinning." }
  ],
  texts: []
} as const satisfies ComponentVocabulary
