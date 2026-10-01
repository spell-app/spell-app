/**
 * Loose constants, types and helpers of `<ui-visibility>`:  its element classes and native fallback import them from here.
 */

import type { visibilityVocabulary } from "./ui-visibility.vocabulary.en"

////////////////
// ## UIVisibility
////////////////

/** VisibilityVocabulary type, for brevity. */
export type VisibilityVocabulary = typeof visibilityVocabulary

/** What a watch depends on. */
export type VisibilityConfig = {
  connected: boolean
  once: boolean
  continuous: boolean
  offset: number
  images: boolean
  transition: string | null | undefined
  duration: number
}

/** Default transition (Fomantic's `fade in`, 1000ms). */
export const FADE = "fade"
export const DEFAULT_DURATION = 1000

/** Lazy images (Fomantic's `metadata.src`). */
export const DATA_SRC = "data-src"
export const LAZY_IMAGES = "img[data-src]"
