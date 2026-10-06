/**
 * Every name `<ui-visibility>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - No class attributes:  visibility is a behaviour (Fomantic's has no stylesheet);  the root is `ui visibility`.
 * - Events are Fomantic's callbacks as `ui-*` events, `detail` the calculations (`VisibilityCalculations`).
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-visibility>`
 * A wrapper that reports where it is against the screen, and can lazy-load the images inside it:
 * `<div class="ui visibility" part="visibility">` around the slot.
 ****************/
export const visibilityVocabulary = {
  tag: "ui-visibility",
  topics: ["animation", "media", "modules"],
  aka: ["scroll spy", "in view", "intersection", "lazy load", "on screen"],
  skeleton: "none",
  noun: "visibility",
  description: "Visibility provides a set of callbacks for when content appears in the viewport.",
  attributes: [
    {
      name: "once",
      kind: "boolean",
      default: true,
      description: 'Each event fires at most once (Fomantic\'s default);  `once="false"`:  each time it turns true.'
    },
    {
      name: "continuous",
      kind: "boolean",
      description: "Events fire at every check while their condition holds (each crossing, not every scrolled pixel)."
    },
    {
      name: "offset",
      kind: "number",
      default: 0,
      description: "Pixels below the viewport top that count as the screen top, e.g. under a fixed menu."
    },
    {
      name: "type",
      kind: "enum",
      values: ["image"],
      description: "`image`:  every `<img data-src>` inside gets its source once on screen, then fades in (`ui-load`)."
    },
    {
      name: "transition",
      kind: "string",
      default: "fade",
      description: '`type="image"`:  animation once loaded, a `UI.transitions` name;  `none` for none.'
    },
    { name: "duration", kind: "number", default: 1000, description: '`type="image"`:  that animation\'s ms.' }
  ],
  events: [
    { name: "ui-visible", detail: "VisibilityCalculations", description: "Some of it came on screen (`onOnScreen`)." },
    { name: "ui-hidden", detail: "VisibilityCalculations", description: "None of it is on screen (`onOffScreen`)." },
    { name: "ui-top-visible", detail: "VisibilityCalculations", description: "Its top came on screen." },
    { name: "ui-bottom-visible", detail: "VisibilityCalculations", description: "Its bottom came on screen." },
    { name: "ui-top-passed", detail: "VisibilityCalculations", description: "Its top passed the screen top." },
    { name: "ui-bottom-passed", detail: "VisibilityCalculations", description: "Its bottom passed the screen top." },
    { name: "ui-passing", detail: "VisibilityCalculations", description: "It spans the screen top." },
    {
      name: "ui-load",
      detail: "{ image: HTMLImageElement }",
      description: '`type="image"`:  an image got its source (and finished its transition).'
    }
  ],
  slots: [{ name: "", description: 'The content;  its `<img data-src>`s with `type="image"`.' }],
  parts: [{ name: "visibility", description: "The box around the slot." }],
  states: [{ name: "visible", description: "Some of it is on screen now (as of the last check)." }],
  texts: []
} as const satisfies E.ComponentVocabulary
