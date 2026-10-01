/**
 * Shared constants, types and helpers of the `ui-nag` family:  what its element classes, vocabularies and native fallback share.
 * - Runtime-light:  no element code, so every file of the family may import it.
 */

import type { EventName, UIT } from "$/ui/core"
import type { nagVocabulary } from "./ui-nag.vocabulary.en"

/** Cookie options of a `DismissalStore`. */
export type DismissalCookieOptions = {
  /** default `/` */
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: string
}

/** Constructor props for `DismissalStore`. */
export type DismissalStoreProps = {
  storage: UIT.NagStorage
  key: string
  value: string
  /** days;  `0` for no expiry */
  expires: number
  cookie?: DismissalCookieOptions
}

/** Storage kinds it branches on. */
export const LOCAL = "local"
export const SESSION = "session"
export const COOKIE = "cookie"

/** Suffix of the expiry item in `localStorage` (Fomantic's `expirationKey`). */
export const EXPIRATION_SUFFIX = "ExpirationDate"

/** Default cookie path. */
export const DEFAULT_PATH = "/"

/** ms in a day. */
export const DAY = 864e5

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof nagVocabulary
/** Defaults of a dismissal:  its stored value, and its lifetime in days. */
export const DEFAULT_VALUE = "dismiss"
export const DEFAULT_EXPIRES = 30

/** Close reasons it names itself. */
export const TIMEOUT = "timeout"
export const DISMISS = "dismiss"

/** `UI.transitions` animation (Fomantic's `slide`). */
export const SLIDE = "slide-down"

/** What the host asks of its controller (`UINag`). */
export type NagController = {
  close(): boolean
  show(): boolean
  clear(): void
  isDismissed(): boolean
}

/** Event it still fires, checked against the vocabulary. */
export const HIDE: EventName<typeof nagVocabulary> = "ui-hide"
