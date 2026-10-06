/**
 * Every name `<ui-slider>` uses:  tag, attributes (kind + allowed values), events, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-slider color="blue" labeled ticked range aligned="bottom">` => `ui blue labeled range ticked bottom aligned
 *   slider`.
 * - `value` and `end` are Fomantic's `start` / `end` settings:  the (first) thumb, and a `range`'s second thumb.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-slider>`
 * A slider:  one thumb, or two for a `range`, on a track, with optional step labels and ticks.
 ****************/
export const sliderVocabulary = {
  tag: "ui-slider",
  topics: ["inputs", "forms", "controls", "modules"],
  aka: ["range", "range slider", "volume", "scrubber", "track bar"],
  skeleton: { width: "16em", height: "1.25em" },
  noun: "slider",
  description: "A slider lets people select values within a range.",
  attributes: [
    { name: "size", kind: "size", description: "Size of track and thumbs, `mini` ... `massive`." },
    { name: "color", kind: "color", description: "Hue of the filled track (and of `basic` thumbs)." },
    { name: "basic", kind: "keyOnly", description: "Thumbs in the fill colour instead of white." },
    { name: "disabled", kind: "keyOnly", description: "Can't be used:  dimmed, not focusable, left out of the form." },
    {
      name: "readonly",
      kind: "keyOnly",
      key: "read-only",
      description: "Shows its value but can't be changed;  still focusable and submitted."
    },
    { name: "hover", kind: "keyOnly", description: "Thumbs show only while the slider is hovered or focused." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds." },
    { name: "labeled", kind: "keyOnly", description: "Labels along the track, at the steps." },
    {
      name: "range",
      kind: "keyOnly",
      description: "Two thumbs:  `value` .. `end`.  The form gets two entries under `name`."
    },
    { name: "reversed", kind: "keyOnly", description: "Runs from the right (or, `vertical`, from the bottom)." },
    { name: "smooth", kind: "keyOnly", description: "Thumbs follow the pointer smoothly;  values still snap." },
    {
      name: "ticked",
      kind: "keyOnly",
      description:
        "A tick at every step (or `tick-step`):  through the track with `labeled`;  alone, a short tick under the " +
        "track, no numbers (as a native range's tick marks)."
    },
    { name: "vertical", kind: "keyOnly", description: "Upright, filling the host's height;  min at the top." },
    {
      name: "aligned",
      kind: "valueAndKey",
      values: ["bottom", "right"],
      description: "With `labeled`:  labels `bottom` (below the track) or, `vertical`, `right` of it."
    },
    { name: "min", kind: "number", default: 0, description: "Lowest value." },
    { name: "max", kind: "number", default: 20, description: "Highest value (Fomantic's default:  20)." },
    { name: "step", kind: "number", default: 1, description: "Values snap to multiples of it from `min`;  `0`:  any." },
    {
      name: "tick-step",
      kind: "number",
      description:
        "Labels and ticks every this much from `min` (e.g. `20` on `0` ... `200`), instead of every `step`;  " +
        "values still snap to `step`."
    },
    {
      name: "value",
      kind: "number",
      reflect: false,
      description:
        "The (first) thumb's value, default `min`.  Attribute:  the starting (and reset) value;  property:  the live one."
    },
    {
      name: "end",
      kind: "number",
      reflect: false,
      description: "`range`:  the second thumb's value, default `max`.  Attribute / property as `value`."
    },
    {
      name: "step-labels",
      kind: "json",
      description: 'Label per step, from `min` (e.g. `["XS", "S", "M"]`), also the spoken value;  default the numbers.'
    },
    { name: "name", kind: "string", description: "Form field name." }
  ],
  events: [
    {
      name: "ui-input",
      detail: "{ value: number, end?: number, originalEvent?: Event }",
      description: "A thumb moved (each drag step or key).  A handler that re-sets `value` / `end` wins."
    },
    {
      name: "ui-change",
      detail: "{ value: number, end?: number, originalEvent?: Event }",
      description: "A change was committed:  on a key, or when a drag ends somewhere new."
    }
  ],
  slots: [],
  parts: [
    { name: "slider", description: "The root box." },
    { name: "track", description: "The empty track." },
    { name: "track-fill", description: "The filled part of the track." },
    { name: "thumb", description: "A thumb (`role=slider`)." },
    { name: "labels", description: "The list of step labels." },
    { name: "label", description: "One step label (and its tick)." }
  ],
  states: [
    { name: "disabled", description: "Can't be used." },
    { name: "dragging", description: "A thumb is being dragged." }
  ],
  texts: [
    { key: "sliderMinimum", text: "Minimum", description: "Name of a range's first thumb." },
    { key: "sliderMaximum", text: "Maximum", description: "Name of a range's second thumb." }
  ]
} as const satisfies E.ComponentVocabulary
