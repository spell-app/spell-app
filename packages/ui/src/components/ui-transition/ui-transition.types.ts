/**
 * Loose constants, types and helpers of `<ui-transition>`:  the element class, the vocabulary and the native fallback
 * import them from here.
 */

import { transitionVocabulary } from "./ui-transition.vocabulary.en"
import type { AnimationDirection, EventName } from "$/ui/core"

/** Fomantic's appear / disappear animations, as the `animation` attribute takes them:  run `in` or `out`. */
export const TRANSITION_VISIBILITY_ANIMATIONS = [
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
export const TRANSITION_ATTENTION_ANIMATIONS = ["flash", "shake", "bounce", "tada", "pulse", "jiggle", "glow"] as const

/** Every animation name `animation` takes. */
export const TRANSITION_ANIMATIONS = [...TRANSITION_VISIBILITY_ANIMATIONS, ...TRANSITION_ATTENTION_ANIMATIONS] as const

////////////////
// ## UITransition
////////////////

/** TransitionVocabulary type, for brevity. */
export type TransitionVocabulary = typeof transitionVocabulary

/** One queued animation. */
export type TransitionStep = {
  direction: AnimationDirection
  /** Fomantic's name */
  animation: string
  /** resolves when it has run:  `true` finished, `false` superseded */
  done: Promise<boolean>
  resolve: (completed: boolean) => void
}
export const STATIC = "static"

/** Default of `animation` (the vocabulary's). */
export const DEFAULT_ANIMATION = "fade"

/** Fomantic names whose runtime name isn't the kebab-cased one. */
export const RUNTIME_NAMES: Readonly<Record<string, string>> = {
  "horizontal flip": "flip-horizontal",
  "vertical flip": "flip-vertical",
  slide: "slide-down",
  swing: "swing-down"
}

////////////////
// ## ui-transition.fallback
////////////////

/** Events it still fires, checked against the vocabulary. */
export const SHOW: EventName<typeof transitionVocabulary> = "ui-show"
export const HIDE: EventName<typeof transitionVocabulary> = "ui-hide"
export const COMPLETE: EventName<typeof transitionVocabulary> = "ui-complete"
