/**
 * The types and helpers the `ui-root` family's files share:  its components (`UIRoot`, `UIComponents`),
 * its loader, component packs and renderers, and the generated catalog.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn gen:root`).
 */

import type { E } from "$/ui/core"
import type { componentsVocabulary } from "./UIComponents.vocabulary.en"
import type { rootVocabulary } from "./UIRoot.vocabulary.en"

////////////////
// ## Vocabulary and catalog
////////////////

/** `rootVocabulary`'s type. */
export type RootVocabulary = typeof rootVocabulary

/** `componentsVocabulary`'s type. */
export type ComponentsVocabulary = typeof componentsVocabulary

/** What `<ui-root>` knows about a tag before its family loads (`UIRoot.catalog.ts`, generated). */
export type RootCatalogEntry = {
  /** Its folder under `src/components/` (or `src/docs-components/`):  its family, imported to define it. */
  readonly folder: string
  /** What `display="skeleton"` draws in its place;  none:  hidden until ready (or covered by its owner's). */
  readonly skeleton?: E.SkeletonSpec
}

////////////////
// ## Component packs
////////////////

/**
 * When a component pack's tag loads:  `on-demand` (the default), when a root meets the tag, as every catalog tag
 * does;  `eager`, as soon as the pack is read.
 */
export const ComponentLoadPolicies = ["on-demand", "eager"] as const

/** One of `ComponentLoadPolicies`. */
export type ComponentLoadPolicy = (typeof ComponentLoadPolicies)[number]

/**
 * One entry of a component pack file, as written (`<ui-components source="pack.json">`, `ComponentPack`):
 * the file is a JSON array of these.
 */
export type ComponentPackEntry = {
  /** Its custom-element tag, any valid name (`ui-docs-example`, `x-chart`):  not only `ui-*`. */
  readonly tag: string
  /** The module to `import()`, which defines the tag;  relative to the PACK file. */
  readonly source: string
  /** When it loads;  default `on-demand`. */
  readonly load?: ComponentLoadPolicy
  /**
   * What a root draws for it while it loads, as skeleton text (`SkeletonText`).
   * - Left out:  nothing of its own, even for a tag the catalog draws one for (the pack's word wins).
   */
  readonly skeleton?: string
}

/** A pack's tag, as `RootLoader.addTags()` takes it:  `source` absolute, `skeleton` parsed. */
export type RootPackTag = {
  /** Its custom-element tag. */
  readonly tag: string
  /** Absolute URL of the module that defines it. */
  readonly source: string
  /** When it loads. */
  readonly load: ComponentLoadPolicy
  /** What a root draws for it while it loads;  none:  nothing of its own. */
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

/** The default `timeout`, ms:  `rootVocabulary`'s default, `5s`. */
const DEFAULT_TIMEOUT = 5000

/** A `timeout` value:  a number, then `ms`, `s` or nothing (ms). */
const TIMEOUT = /^\s*(\d+(?:\.\d+)?)\s*(ms|s)?\s*$/
