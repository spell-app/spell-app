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

/**
 * A lazy image's attributes in a static server render (`$/ui/static`):  `data-src` / `data-srcset` become the real
 * ones, and the browser's own lazy loading (`loading="lazy"`) stands in for the observer.
 */
export const DATA_SRCSET = "data-srcset"
export const SRC = "src"
export const SRCSET = "srcset"
export const LOADING = "loading"
export const LAZY = "lazy"
