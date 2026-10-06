/**
 * Types and helpers of `<ui-root>` that several of its files share:  its element class, loader, renderers, native
 * fallback and the generated catalog.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn gen:root`).
 */

import type { E } from "$/ui/core"
import type { rootVocabulary } from "./ui-root.vocabulary.en"

////////////////
// ## Vocabulary and catalog
////////////////

/** `rootVocabulary`'s type. */
export type RootVocabulary = typeof rootVocabulary

/** What `<ui-root>` knows about a tag before its family loads (`ui-root.catalog.ts`, generated). */
export type RootCatalogEntry = {
  /** Its folder under `src/components/` (or `src/docs-components/`):  its family, imported to define it. */
  readonly folder: string
  /** What `display="skeleton"` draws in its place;  none:  hidden until ready (or covered by its owner's). */
  readonly skeleton?: E.SkeletonSpec
}

////////////////
// ## Loading
////////////////

/** One skeleton to draw:  the element it stands for and its description. */
export type RootSkeleton = {
  /** Element inside the root that the skeleton stands for. */
  readonly element: Element
  /** Its tag's skeleton, from the catalog. */
  readonly spec: E.SkeletonSpec
}

/** Why a tag inside a root didn't load:  no such component, its family's import failed, or not ready in time. */
export const RootFailureReasons = ["unknown", "failed", "timeout"] as const

/** One of `RootFailureReasons`. */
export type RootFailureReason = (typeof RootFailureReasons)[number]

/** One tag that didn't load:  `ui-ready`'s `failed` list, `ui-error`'s detail. */
export type RootFailure = {
  /** The tag, e.g. `ui-card`. */
  readonly tag: string
  /** Why it didn't load. */
  readonly reason: RootFailureReason
  /** What its family's import threw (`failed` only). */
  readonly error?: unknown
}

/****************
 * ### `RootTimeout`
 * `timeout="5s"` => milliseconds.
 * - Static:  a pure parse, kept apart from `UIRoot` so tests reach it.
 ****************/
export class RootTimeout {
  /** `5s`, `2.5s`, `500ms`, `3000` => ms;  anything else (or nothing) => `DEFAULT_TIMEOUT`. */
  static parse(value: string | undefined): number {
    const match = TIMEOUT.exec(value ?? "")
    if (!match) return DEFAULT_TIMEOUT
    const amount = Number(match[1])
    return match[2] === "s" ? amount * 1000 : amount
  }
}

/** Fallback `timeout`, ms:  `rootVocabulary`'s default, `5s`. */
const DEFAULT_TIMEOUT = 5000

/** A `timeout` value:  a number, then `ms`, `s` or nothing (ms). */
const TIMEOUT = /^\s*(\d+(?:\.\d+)?)\s*(ms|s)?\s*$/
