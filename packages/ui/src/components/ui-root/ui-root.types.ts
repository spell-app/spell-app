/**
 * Loose constants, types and helpers of `<ui-root>`:  its element class, loader, renderers and native fallback import
 * them from here.
 */
import type { rootVocabulary } from "./ui-root.vocabulary.en"

/** `rootVocabulary`'s type. */
export type RootVocabulary = typeof rootVocabulary

/** What `<ui-root>` knows about a tag before its family loads (`ui-root.catalog.ts`, generated). */
export type RootCatalogEntry = {
  /** Its folder under `src/components/`:  its family, imported to define it. */
  readonly folder: string
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

/** Separates the packs in `icons="fa7-free, /packs/lucide/pack.js"`. */
export const PACK_SEPARATOR = ","

/** `width` / `height` value meaning "the viewport's". */
export const WINDOW = "window"

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
