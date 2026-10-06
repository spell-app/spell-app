/**
 * Every name `<ui-transition>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-transition color="red" pulsating looping>` => `ui red looping pulsating transition`;  the element adds
 *   its state after the noun (`visible`, `animating`), as Fomantic's script did.
 * - `animation` values are Fomantic's names, spaces and all (`fade up`, `horizontal flip`);  the element maps
 *   them onto the runtime's kebab-cased catalogue (`TransitionAnimations`).
 */

import type { E } from "$/ui/core"
import { DEFAULT_ANIMATION, TransitionAnimations } from "./ui-transition.types"

/****************
 * ### `<ui-transition>`
 * Shows / hides (or shakes, pulses ...) its content with the animation catalogue:
 * `<div class="ui ... transition" part="transition"><slot>`.
 ****************/
export const transitionVocabulary = {
  tag: "ui-transition",
  topics: ["animation", "modules"],
  aka: ["animate", "fade", "slide", "motion", "effect"],
  skeleton: "none",
  noun: "transition",
  description: "A transition is an animation used to show or hide content, or to draw attention to it.",
  attributes: [
    {
      name: "animation",
      kind: "enum",
      values: TransitionAnimations,
      default: DEFAULT_ANIMATION,
      description:
        "Animation for showing / hiding (Fomantic's names:  `fade up`, `scale`, `horizontal flip` ...);  an " +
        "attention one (`shake`, `pulse` ...) shows / hides at once, and runs through `transition()`."
    },
    {
      name: "duration",
      kind: "string",
      description: "Length of each animation:  ms (`300`) or a CSS time (`0.3s`);  default the animation's own."
    },
    {
      name: "visible",
      kind: "boolean",
      description:
        "Shown.  Changing it animates in / out;  absent => hidden (its content is out of the page and the " +
        "accessibility tree)."
    },
    {
      name: "interrupt",
      kind: "boolean",
      description: "A new animation stops the running one instead of waiting for it (Fomantic's `queue: false`)."
    },
    {
      name: "allow-repeats",
      kind: "boolean",
      description: "Queue the same animation twice in a row (Fomantic's `allowRepeats`);  by default it's dropped."
    },
    { name: "color", kind: "color", description: "Hue of a `pulsating` ring." },
    { name: "inline", kind: "keyOnly", description: "An inline block around inline content (an image, a button)." },
    { name: "inverted", kind: "keyOnly", description: "A `pulsating` ring for dark backgrounds." },
    { name: "looping", kind: "keyOnly", description: "Repeats every animation until removed." },
    { name: "pulsating", kind: "keyOnly", description: "A ring pulsing out of the box (with `looping`, forever)." },
    { name: "disabled", kind: "keyOnly", description: "Pauses the running animation." }
  ],
  events: [
    {
      name: "ui-show",
      detail: "{ visible: true, animation: string }",
      description: "Shown, its animation finished (Fomantic's `onVisible`)."
    },
    {
      name: "ui-hide",
      detail: "{ visible: false, animation: string }",
      description: "Hidden, its animation finished (Fomantic's `onHidden`)."
    },
    {
      name: "ui-complete",
      detail: "{ visible: boolean, animation: string }",
      description: "Any animation finished, attention ones included (Fomantic's `onComplete`)."
    }
  ],
  slots: [{ name: "", description: "The content to animate." }],
  parts: [{ name: "transition", description: "The animated box around the content." }],
  states: [
    { name: "visible", description: "Shown, or animating in." },
    { name: "animating", description: "An animation is running." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
