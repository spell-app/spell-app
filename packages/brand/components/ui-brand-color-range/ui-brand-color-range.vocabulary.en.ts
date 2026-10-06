/**
 * Every name `<ui-brand-color-range>` uses:  tag, attributes, events, parts, texts.  Schema:  `ComponentVocabulary`.
 * - Pure data:  `import type` only;  the steps are written out (`STEPS` in `$/brand` is a value).
 * - Class words:  `contrast`, `details`, `strip` their names;  `copy` as `<ui-brand-color>`'s.  The element adds
 *   `color brand` after the noun (`range color brand`).
 */

import type { ComponentVocabulary } from "$/ui/core"

/****************
 * ### `<ui-brand-color-range>`
 * A 17-step LADDER made from one base colour (`Palette.generateScale()`):  17 chips, the step under each, the base
 * colour's chip ringed.
 ****************/
export const brandColorRangeVocabulary = {
  tag: "ui-brand-color-range",
  topics: ["data display", "lists"],
  aka: ["color scale", "colour scale", "color ramp", "shades", "tints and shades", "color ladder", "palette row"],
  skeleton: "4 tall",
  noun: "range",
  ui: false,
  description:
    "A brand color range is a 17-step ladder of shades made from one base colour, the base colour's step ringed.",
  attributes: [
    {
      name: "value",
      kind: "string",
      description:
        "The base colour (`#8E96B5`, `R G B`, `oklch(...)`).  It lands EXACTLY on its step;  none:  no ladder."
    },
    {
      name: "anchor",
      kind: "enum",
      values: [
        "auto",
        "25",
        "50",
        "75",
        "100",
        "150",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "850",
        "900",
        "925",
        "950",
        "975"
      ],
      default: "auto",
      description: "The step the base colour sits at;  `auto`:  the step nearest its lightness."
    },
    {
      name: "vibrancy",
      kind: "number",
      default: 100,
      description: "How colourful the steps are, in percent of the base colour's (the Chooser's Vibrancy):  0 is grey."
    },
    {
      name: "hue-shift",
      kind: "number",
      default: 0,
      description: "Degrees the hue drifts toward the dark end:  the darker steps lean toward a neighbouring hue."
    },
    {
      name: "name",
      kind: "string",
      description:
        "Token prefix:  chips are named `<name>-25` ... `<name>-975`, and `css()` writes those tokens.  None:  `color`."
    },
    {
      name: "label",
      kind: "enum",
      values: ["none", "hex", "oklch", "name", "step"],
      default: "none",
      description: "Text inside every chip, as `<ui-brand-color label>`."
    },
    { name: "contrast", kind: "keyOnly", description: "Marks `AA` on the steps text reads clearly on." },
    {
      name: "copy",
      kind: "keyOrValueAndKey",
      values: ["hex", "oklch", "token", "css"],
      description: "A click on a chip copies it, as `<ui-brand-color copy>`."
    },
    { name: "details", kind: "keyOnly", description: "Each chip's details tip, on hover and focus." },
    {
      name: "numbers",
      kind: "enum",
      values: ["shown", "none"],
      default: "shown",
      description:
        "Step numbers under the chips:  `shown`, or `none` (no numbers, nor their row:  a page numbering many " +
        "ladders once, in a header row)."
    },
    {
      name: "strip",
      kind: "keyOnly",
      description: "A small strip of 17 dots instead of chips (the Chooser's folded Variants header)."
    }
  ],
  events: [
    {
      name: "ui-change",
      detail: "{ value: string, scale: Record<Step, string>, anchor: Step }",
      description: "The ladder changed (`value`, `anchor`, `vibrancy`, `hue-shift`):  not on first render."
    }
  ],
  slots: [],
  parts: [
    { name: "range", description: "The ladder (an `<ol>`), or the strip." },
    { name: "step", description: "One step:  its chip and number." },
    { name: "chip", description: "A step's `<ui-brand-color>`." },
    { name: "number", description: "A step's number, under its chip." },
    { name: "dot", description: "A step's dot (`strip`)." }
  ],
  states: [],
  texts: [{ key: "ladder", text: "{name}:  17 shades of {seed}", description: "Names the ladder or strip." }]
} as const satisfies ComponentVocabulary
