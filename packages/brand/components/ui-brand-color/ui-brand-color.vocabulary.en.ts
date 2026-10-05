/**
 * Every name `<ui-brand-color>` uses:  tag, attributes, events, parts, states, texts.  Schema:  `ComponentVocabulary`.
 * - Pure data:  `import type` only.
 * - Class words:  `contrast`, `selected`, `details` their names;  `copy` as `copy` or `<format> copy`;  `size` its
 *   value.  The element adds `brand` after the noun (`color brand`).
 */

import type { ComponentVocabulary } from "$/ui/core"

/****************
 * ### `<ui-brand-color>`
 * One square colour CHIP:  the colour, optionally a small label inside (hex, OKLCH, token or step), an AA mark, a
 * selected ring and a details tip;  click to copy it.
 ****************/
export const brandColorVocabulary = {
  tag: "ui-brand-color",
  topics: ["data display", "selection"],
  aka: ["swatch", "color chip", "colour chip", "color swatch", "color sample", "color tile"],
  skeleton: { display: "inline", width: "3em", height: "3em" },
  noun: "color",
  ui: false,
  description:
    "A brand color is a square colour chip:  a label inside, an AA mark, a selected ring, a details tip;  click to copy.",
  attributes: [
    {
      name: "value",
      kind: "string",
      description:
        "The colour:  `#RRGGBB`, `#RGB`, `R G B` (0-255) or `oklch(67.7% 0.047 274)`.  Anything else draws no colour."
    },
    {
      name: "name",
      kind: "string",
      description: 'Token or step name (`brand-500`):  names the chip, and what `copy="token"` copies.'
    },
    {
      name: "label",
      kind: "enum",
      values: ["none", "hex", "oklch", "name", "step"],
      default: "none",
      description:
        "Text inside the chip, bottom-left:  `hex` (`8E96B5`), `oklch` (`68 0.05 274`), `name`, or `step` (`500`, the " +
        "name's last number).  In white or ink, whichever reads better."
    },
    {
      name: "contrast",
      kind: "keyOnly",
      description: "Marks the chip `AA` when white or ink text on it passes 4.5:1."
    },
    {
      name: "copy",
      kind: "keyOrValueAndKey",
      values: ["hex", "oklch", "token", "css"],
      description:
        "Click copies the colour:  `hex` (bare `copy` too), `oklch`, `token` (`var(--brand-500)`) or `css` " +
        '(`--brand-500: #8E96B5;`).  The chip becomes a button, named "Copy <name>".'
    },
    { name: "selected", kind: "keyOnly", description: "The chosen chip:  a double ring around it." },
    {
      name: "details",
      kind: "keyOnly",
      description: "A tip on hover and focus:  name, hex, OKLCH and contrast against white and ink."
    },
    { name: "size", kind: "size", description: "Chip size;  `medium` is the default (3em)." }
  ],
  events: [
    {
      name: "ui-copy",
      detail: "{ value: string, originalEvent?: Event }",
      description: "A click copied `value` to the clipboard (`copy`)."
    }
  ],
  slots: [],
  parts: [
    { name: "chip", description: "The chip:  a `<button>` with `copy`, else an image." },
    { name: "label", description: "The text inside the chip (`label`)." },
    { name: "mark", description: "The `AA` mark (`contrast`)." },
    { name: "copied", description: "The check shown for a moment after a copy." },
    { name: "tip", description: "The details tip (`details`)." }
  ],
  states: [
    { name: "copied", description: "Just copied:  for about 1.4 seconds after a click." },
    { name: "choice", description: "One choice of a `selectable` `<ui-brand-color-set>`:  the host is a radio." }
  ],
  texts: [
    { key: "copy", text: "Copy {name}", description: "The copy button's name;  `{name}` is `name`, else the colour." },
    { key: "copied", text: "Copied {value}", description: "Announced after a copy." },
    { key: "aa", text: "AA", description: "The contrast mark." },
    { key: "hex", text: "Hex", description: "Details tip:  the hex row." },
    { key: "oklch", text: "OKLCH", description: "Details tip:  the OKLCH row." },
    { key: "onWhite", text: "On white", description: "Details tip:  contrast of white text." },
    { key: "onInk", text: "On ink", description: "Details tip:  contrast of ink (near-black) text." },
    { key: "ratio", text: "{ratio}:1", description: "A contrast ratio." },
    {
      key: "goodText",
      text: "Good for text:  {ink} text reads clearly on this shade.",
      description: "Details tip, 4.5:1 or more;  `{ink}` is `white` or `dark`."
    },
    {
      key: "largeText",
      text: "Not enough contrast for small text.  Use for large headlines, icons and borders only.",
      description: "Details tip, 3:1 to 4.5:1."
    },
    {
      key: "noText",
      text: "Not enough contrast for text.  Use for backgrounds, fills and dividers only.",
      description: "Details tip, under 3:1."
    },
    { key: "white", text: "white", description: "`{ink}` in `goodText`, for white text." },
    { key: "dark", text: "dark", description: "`{ink}` in `goodText`, for ink text." }
  ]
} as const satisfies ComponentVocabulary
