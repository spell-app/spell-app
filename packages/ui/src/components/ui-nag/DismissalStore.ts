import type { NagStorage } from "$/ui/core"
import {
  LOCAL,
  SESSION,
  COOKIE,
  EXPIRATION_SUFFIX,
  DEFAULT_PATH,
  DAY,
  type DismissalCookieOptions,
  type DismissalStoreProps
} from "./ui-nag.types"

/****************
 * ### `DismissalStore`
 * Where a `<ui-nag>` remembers that it was dismissed (Fomantic's nag `storage`):  `localStorage`, `sessionStorage`
 * or a cookie, holding `value` under `key`.
 * - EVERY access is guarded:  storage can be missing (SSR), blocked (privacy settings throw a `SecurityError` on
 *   the mere `localStorage` getter) or full.  A failed read counts as "not dismissed", a failed write is dropped:
 *   the nag still renders and still closes, it just won't remember.
 * - Expiry (`expires`, days;  `0` never):  a cookie's own `expires`;  in `localStorage` a second item
 *   `<key>ExpirationDate` (Fomantic's `expirationKey`) holding the UTC date, checked (and the pair removed) on read.
 *   `sessionStorage` ends with the tab anyway.
 * - Cookies:  Fomantic's RFC 6265 encoding;  `path` (default `/`), `domain`, `secure`, `samesite`.
 ****************/
export class DismissalStore {
  /** Where. */
  readonly storage: NagStorage

  /** Item / cookie name. */
  readonly key: string

  /** What a dismissal stores. */
  readonly value: string

  /** Days a dismissal lasts;  `0` for no expiry. */
  readonly expires: number

  /** Cookie options. */
  private readonly cookie: DismissalCookieOptions

  constructor({ storage, key, value, expires, cookie = {} }: DismissalStoreProps) {
    this.storage = storage
    this.key = key
    this.value = value
    this.expires = expires
    this.cookie = cookie
  }

  /** Was it dismissed (and not expired)?  `false` when the storage can't be read. */
  isDismissed(): boolean {
    try {
      return this.read() === this.value
    } catch {
      return false
    }
  }

  /** Remember the dismissal;  false when the storage refused. */
  dismiss(): boolean {
    try {
      if (this.storage === COOKIE) {
        this.writeCookie(this.value, this.expiryDate(this.expires))
        return true
      }
      const store = this.webStorage()
      if (!store) return false
      const expiry = this.expiryDate(this.expires)
      if (this.storage === LOCAL && expiry) store.setItem(this.key + EXPIRATION_SUFFIX, expiry)
      store.setItem(this.key, this.value)
      return true
    } catch {
      return false
    }
  }

  /** Forget the dismissal (Fomantic's `clear`). */
  clear() {
    try {
      if (this.storage === COOKIE) return this.writeCookie("", this.expiryDate(-1))
      const store = this.webStorage()
      store?.removeItem(this.key)
      store?.removeItem(this.key + EXPIRATION_SUFFIX)
    } catch {
      // nothing stored that we could reach
    }
  }

  ////////////////
  // ## Reading
  ////////////////

  /** The stored value, `undefined` when absent or expired.  MAY throw (blocked storage). */
  private read(): string | undefined {
    if (this.storage === COOKIE) return this.readCookie()
    const store = this.webStorage()
    if (!store) return undefined
    if (this.storage === LOCAL) {
      const expiration = store.getItem(this.key + EXPIRATION_SUFFIX)
      if (expiration && new Date(expiration) < new Date()) {
        store.removeItem(this.key)
        store.removeItem(this.key + EXPIRATION_SUFFIX)
        return undefined
      }
    }
    return store.getItem(this.key) ?? undefined
  }

  /** `localStorage` / `sessionStorage`, or `undefined` outside a browser.  MAY throw (blocked storage). */
  private webStorage(): Storage | undefined {
    if (typeof window === "undefined") return undefined
    return this.storage === SESSION ? window.sessionStorage : window.localStorage
  }

  /** The cookie's decoded value.  MAY throw (a sandboxed document). */
  private readCookie(): string | undefined {
    if (typeof document === "undefined") return undefined
    for (const pair of document.cookie.split("; ")) {
      const [name = "", ...rest] = pair.split("=")
      if (name.replace(/(%[\da-f]{2})+/gi, decodeURIComponent) === this.key) {
        return decodeURIComponent(rest.join("="))
      }
    }
    return undefined
  }

  ////////////////
  // ## Writing
  ////////////////

  /** Set the cookie to `value`, expiring at `expires` (a UTC date) or with the session.  MAY throw. */
  private writeCookie(value: string, expires: string | undefined) {
    if (typeof document === "undefined") return
    // RFC 6265 encoding, as Fomantic's nag
    const name = encodeURIComponent(this.key)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    const text = encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[B-D])/g, decodeURIComponent)
    const { path = DEFAULT_PATH, domain, secure, sameSite } = this.cookie
    const options = [
      expires && `expires=${expires}`,
      path && `path=${path}`,
      domain && `domain=${domain}`,
      secure && "secure",
      sameSite && `samesite=${sameSite}`
    ].filter(Boolean)
    document.cookie = [`${name}=${text}`, ...options].join("; ")
  }

  /** UTC date `days` from now, or `undefined` for `0` (no expiry). */
  private expiryDate(days: number): string | undefined {
    if (!days || !Number.isFinite(days)) return undefined
    return new Date(Date.now() + days * DAY).toUTCString()
  }
}
