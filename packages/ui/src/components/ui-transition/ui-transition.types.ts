/**
 * Constants and types of the `ui-transition` family:  what its element (`UITransition`), vocabulary and native
 * fallback share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`),
 *   and the vocabulary can value-import the animation names.  A constant only one class reads sits below that
 *   class (epic `wwod-spell-ui`, Q18).
 */

import type { transitionVocabulary } from "./ui-transition.vocabulary.en"

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof transitionVocabulary

////////////////
// ## Animations
////////////////

/** Fomantic's appear / disappear animations, as the `animation` attribute takes them:  run `in` or `out`. */
export const VisibilityAnimations = [
  "fade",
  "fade up",
  "fade down",
  "fade left",
  "fade right",
  "scale",
  "zoom",
  "drop",
  "browse",
  "browse right",
  "fly",
  "fly up",
  "fly down",
  "fly left",
  "fly right",
  "slide",
  "slide up",
  "slide down",
  "slide left",
  "slide right",
  "swing",
  "swing up",
  "swing down",
  "swing left",
  "swing right",
  "horizontal flip",
  "vertical flip"
] as const

/** Fomantic's attention animations:  run `static`, in place, visibility unchanged. */
export const AttentionAnimations = ["flash", "shake", "bounce", "tada", "pulse", "jiggle", "glow"] as const

/** Every animation name `animation` takes. */
export const TransitionAnimations = [...VisibilityAnimations, ...AttentionAnimations] as const

/** One of `TransitionAnimations`, Fomantic's spelling (`fade up`). */
export type TransitionAnimation = (typeof TransitionAnimations)[number]

/** Default of `animation`:  the vocabulary's default, and the fallback's `detail.animation` without one. */
export const DEFAULT_ANIMATION = "fade" satisfies TransitionAnimation
