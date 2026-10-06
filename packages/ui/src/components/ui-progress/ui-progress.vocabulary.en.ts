/**
 * Every name `<ui-progress>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-progress size="small" color="teal" active indicating attached="top">` =>
 *   `ui small teal active indicating top attached progress`.
 * - `state` and `speed` are `kind: "valueOnly"`:  each emits its value alone, as Fomantic writes `success` / `slow`.
 * - `value` / `percent` are STRINGS:  one number, or a comma list for several bars (`value="10,20,30"`).
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-progress>`
 * A progress bar:  `<div class="ui … progress" part="progress">` holding one `bar` per value (with an optional
 * `bar-text`) and a `label` below it.
 ****************/
export const progressVocabulary = {
  tag: "ui-progress",
  topics: ["progress", "loading", "feedback", "status", "modules"],
  aka: ["progress bar", "meter", "percent bar", "upload progress"],
  skeleton: "2 tall",
  noun: "progress",
  description: "A progress bar shows the progression of a task.",
  attributes: [
    { name: "size", kind: "size", description: "Bar height and text size, `mini` ... `massive`." },
    { name: "color", kind: "color", description: "Hue of the bar." },
    {
      name: "state",
      kind: "valueOnly",
      values: ["success", "warning", "error"],
      description:
        "Outcome, tinting bar and label;  stops the animations.  Without it a single bar turns `success` at 100%."
    },
    {
      name: "speed",
      kind: "valueOnly",
      values: ["slow", "fast"],
      description: "With `indeterminate`:  a `slow` or `fast` animation;  absent is normal."
    },
    { name: "active", kind: "keyOnly", description: "Shows activity:  a pulse runs along the bar." },
    { name: "basic", kind: "keyOnly", description: "No background behind the bar." },
    { name: "disabled", kind: "keyOnly", description: "Dimmed, animations stopped." },
    {
      name: "indicating",
      kind: "keyOnly",
      description: "The bar's colour follows the percentage, red through green."
    },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds." },
    {
      name: "right-aligned",
      kind: "keyOnly",
      key: "right aligned",
      description: "The bar grows from the right;  its text sits at its left end."
    },
    {
      name: "indeterminate",
      kind: "keyOrValueAndKey",
      values: ["filling", "sliding", "swinging"],
      description: "Unknown progress:  a pulsing full bar, or a `filling` / `sliding` / `swinging` one."
    },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom"],
      description: "A thin line joined to the edge of the content above (`bottom`, bare) or below (`top`)."
    },
    {
      name: "value",
      kind: "string",
      description: "Amount done:  a number, or a comma list for several bars.  A share of `total`, else a percentage."
    },
    { name: "total", kind: "number", description: "What `value` counts up to;  unset, `value` is a percentage." },
    {
      name: "percent",
      kind: "string",
      description: "Percentage done, bypassing `value` / `total`;  a comma list for several bars."
    },
    { name: "precision", kind: "number", default: 0, description: "Decimal places shown in texts." },
    {
      name: "bar-text",
      kind: "enum",
      values: ["percent", "ratio"],
      description: "Text inside the bar:  `percent` (`45%`) or `ratio` (`9 of 20`, needs `total`);  unset, none."
    },
    {
      name: "bar-colors",
      kind: "string",
      description: "Hue per bar, space or comma separated, e.g. `red green blue`;  each wins over `color`."
    },
    {
      name: "label",
      kind: "string",
      description: "Label under the bar;  `{percent}`, `{value}`, `{total}`, `{left}` are filled in."
    }
  ],
  events: [
    {
      name: "ui-change",
      detail: "{ percent: number, percents: number[], value?: number, total?: number }",
      description: "The percentage changed (after the first render)."
    },
    {
      name: "ui-complete",
      detail: "{ value?: number, total?: number }",
      description: "The percentage reached 100."
    }
  ],
  slots: [{ name: "", description: "Label content (rich version of `label`);  also the accessible name." }],
  parts: [
    { name: "progress", description: "The track holding the bars." },
    { name: "bar", description: "One bar." },
    { name: "bar-text", description: "Text inside a bar (`bar-text`)." },
    { name: "label", description: "The label under the track." }
  ],
  states: [
    { name: "active", description: "Shows activity." },
    { name: "indeterminate", description: "Unknown progress." },
    { name: "complete", description: "At 100%." },
    { name: "disabled", description: "Dimmed." }
  ],
  texts: [
    { key: "progressPercent", text: "{percent}%", description: '`bar-text="percent"` and the spoken value.' },
    { key: "progressRatio", text: "{value} of {total}", description: '`bar-text="ratio"`.' }
  ]
} as const satisfies E.ComponentVocabulary
