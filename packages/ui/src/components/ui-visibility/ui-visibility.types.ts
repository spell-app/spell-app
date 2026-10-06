/**
 * Constants of the `ui-visibility` family that its element (`UIVisibility`) and its native fallback
 * (`VisibilityFallback`) share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 */

import type { visibilityVocabulary } from "./ui-visibility.vocabulary.en"

/** `<ui-visibility>`'s vocabulary type, for brevity. */
export type VisibilityVocabulary = typeof visibilityVocabulary

////////////////
// ## Lazy images
////////////////

/** A lazy image's source, until it's on screen (Fomantic's `metadata.src`). */
export const DATA_SRC = "data-src"

/** A lazy image's `srcset`, until it's on screen. */
export const DATA_SRCSET = "data-srcset"

/** The lazy images inside `type="image"`. */
export const LAZY_IMAGES = "img[data-src]"

/** Where `DATA_SRC` goes once the image may load. */
export const SRC = "src"

/**
 * The image attribute the browser's own lazy loading reads:  set to `LAZY` where nothing observes (a server render,
 * the fallback).
 */
export const LOADING = "loading"

/** `LOADING`'s value that defers the image until it's near the screen. */
export const LAZY = "lazy"
