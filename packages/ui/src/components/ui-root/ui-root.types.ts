/**
 * Loose constants, types and helpers of `<ui-root>`:  its element class, loader, renderers and native fallback import
 * them from here.
 */
import type { SkeletonSpec } from "$/ui/core"

import type { rootVocabulary } from "./ui-root.vocabulary.en"

/** `rootVocabulary`'s type. */
export type RootVocabulary = typeof rootVocabulary

/** What `<ui-root>` knows about a tag before its family loads (`ui-root.catalog.ts`, generated). */
export type RootCatalogEntry = {
  /** Its folder under `src/components/` (or `src/docs-components/`):  its family, imported to define it. */
  readonly folder: string
  /** What `display="skeleton"` draws in its place;  none:  hidden until ready (or covered by its owner's). */
  readonly skeleton?: SkeletonSpec
}

/** One skeleton to draw:  the element it stands for and its description. */
export type RootSkeleton = {
  readonly element: Element
  readonly spec: SkeletonSpec
}

/** Why a tag inside a root didn't load:  no such component, its family's import failed, or not ready in time. */
export type RootFailureReason = "unknown" | "failed" | "timeout"

/** One tag that didn't load:  `ui-ready`'s `failed` list, `ui-error`'s detail. */
export type RootFailure = {
  readonly tag: string
  readonly reason: RootFailureReason
  readonly error?: unknown
}

/** `display` values. */
export const DISPLAY = { skeleton: "skeleton", whenReady: "when-ready", immediately: "immediately" } as const

/** Bars in a skeleton paragraph unless it says. */
export const DEFAULT_LINES = 3

/** Bars in a skeleton header. */
export const HEADER_LINES = 2

/** Separates the packs in `icons="fa7-free, /packs/lucide/pack.js"`. */
export const PACK_SEPARATOR = ","

/** `width` / `height` value meaning "the viewport's". */
export const WINDOW = "window"

/**
 * A length a static server render accepts for `width` / `height` (node has no `CSS.supports()`):  numbers, units,
 * `%`, `calc()` / `var()` / `min()` ... -- never `;`, `:`, braces or quotes, which could inject other declarations.
 */
export const SERVER_LENGTH = /^[\w.%+\-*/(), ]+$/

/** The static server render's wrapper when it isn't a box:  no box of its own, as the browser's host. */
export const SERVER_CONTENTS = "display: contents"

/** Fallback `timeout`, ms:  `rootVocabulary`'s default, `5s`. */
export const DEFAULT_TIMEOUT = 5000

/** Rounds of "load what's undefined, wait for what's defined":  content that keeps adding new tags stops here. */
export const MAX_ROUNDS = 10

/** Prefix of the tags a root loads:  anything else undefined (an app's own element) is not ours. */
export const TAG_PREFIX = "ui-"

/****************
 * ### `RootTimeout`
 * `timeout="5s"` => milliseconds.
 ****************/
export class RootTimeout {
  /** `5s`, `2.5s`, `500ms`, `3000` => ms;  anything else (or nothing) => `DEFAULT_TIMEOUT`. */
  static parse(value: string | undefined | null): number {
    const match = /^\s*(\d+(?:\.\d+)?)\s*(ms|s)?\s*$/.exec(value ?? "")
    if (!match) return DEFAULT_TIMEOUT
    const amount = Number(match[1])
    return match[2] === "s" ? amount * 1000 : amount
  }
}
