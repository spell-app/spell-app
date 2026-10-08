/**
 * The types and helpers the `ui-root` family's files share:  its component (`UIRoot`), its loader and renderers,
 * and the generated catalog;  a component pack's catalog (`ComponentPack.catalog`) has the catalog's shape.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn gen:root`).
 */

import type { E } from "$/ui/core"
import type { rootVocabulary } from "./UIRoot.en"

////////////////
// ## Vocabulary and catalog
////////////////

/** `rootVocabulary`'s type. */
export type RootVocabulary = typeof rootVocabulary

/**
 * What `<ui-root>` knows about a tag before its family loads (`UIRoot.catalog.ts`, generated);  a component pack's
 * catalog has the same shape (`ComponentPack.catalog`, built by `spell dev pack build`).
 */
export type RootCatalogEntry = {
  /**
   * Its folder under `src/components/` (or `src/docs-components/`):  its family, imported to define it.  A pack's:
   * the folder of its component in the pack's package.
   */
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

/** One tag (or component pack) that didn't load:  `ui-ready`'s `failed` list, `ui-error`'s detail. */
export type RootFailure = {
  /** The tag, e.g. `ui-card`. */
  readonly tag: string
  /** Why it didn't load. */
  readonly reason: RootFailureReason
  /** What its family's import (or its pack's load) threw (`failed` only). */
  readonly error?: unknown
  /** A component pack's `source` (`tag` is `ui-components`):  the pack that didn't load. */
  readonly source?: string
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

/** The default `timeout`, ms:  `rootVocabulary`'s default, `5s`. */
const DEFAULT_TIMEOUT = 5000

/** A `timeout` value:  a number, then `ms`, `s` or nothing (ms). */
const TIMEOUT = /^\s*(\d+(?:\.\d+)?)\s*(ms|s)?\s*$/
