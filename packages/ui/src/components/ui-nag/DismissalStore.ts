import type { UIT } from "$/ui/core"

/****************
 * ### `DismissalStore`
 * Where a `<ui-nag>` remembers that it was dismissed (Fomantic's nag `storage`):  `localStorage`, `sessionStorage`
 * or a cookie, holding `value` under `key`.
 * - Plain DOM, no Solid:  `UINag` makes one per access, from its current attributes.
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
  readonly storage: UIT.NagStorage

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

  /** Was it dismissed (and not expired)?  `false` when the storage can't be read.  Reads the storage on every access. */
  get isDismissed(): boolean {
    try {
      return this.read() === this.value
    } catch {
      return false
    }
  }

  /** Remember the dismissal;  false when the storage refused.  NEVER throws. */
  dismiss(): boolean {
    try {
      if (this.storage === "cookie") {
        this.writeCookie(this.value, this.expiryDate(this.expires))
        return true
      }
      const store = this.webStorage()
      if (!store) return false
      const expiry = this.expiryDate(this.expires)
      if (this.storage === "local" && expiry) store.setItem(this.key + EXPIRATION_SUFFIX, expiry)
      store.setItem(this.key, this.value)
      return true
    } catch {
      return false
    }
  }

  /** Forget the dismissal (Fomantic's `clear`).  NEVER throws. */
  clear() {
    try {
      if (this.storage === "cookie") return this.writeCookie("", this.expiryDate(-1))
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
    if (this.storage === "cookie") return this.readCookie()
    const store = this.webStorage()
    if (!store) return undefined
    if (this.storage === "local") {
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
    return this.storage === "session" ? window.sessionStorage : window.localStorage
  }

  /** The cookie's decoded value.  MAY throw (a sandboxed document). */
  private readCookie(): string | undefined {
    if (typeof document === "undefined") return undefined
    for (const pair of document.cookie.split(COOKIE_SEPARATOR)) {
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
    document.cookie = [`${name}=${text}`, ...options].join(COOKIE_SEPARATOR)
  }

  /** UTC date `days` from now, or `undefined` for `0` (no expiry). */
  private expiryDate(days: number): string | undefined {
    if (!days || !Number.isFinite(days)) return undefined
    return new Date(Date.now() + days * DAY).toUTCString()
  }
}

/** Constructor props for `DismissalStore`. */
export type DismissalStoreProps = {
  /** where:  `localStorage`, `sessionStorage` or a cookie */
  storage: UIT.NagStorage
  /** item / cookie name */
  key: string
  /** what a dismissal stores */
  value: string
  /** days;  `0` for no expiry */
  expires: number
  /** cookie options;  read only with `storage: "cookie"` */
  cookie?: DismissalCookieOptions
}

/** Cookie options of a `DismissalStore`. */
export type DismissalCookieOptions = {
  /** cookie path.  Default:  `/` */
  path?: string
  /** cookie domain;  default the page's host */
  domain?: string
  /** HTTPS only */
  secure?: boolean
  /** `samesite` value, as written (`lax`, `strict`, `none`) */
  sameSite?: string
}

/** Suffix of the expiry item in `localStorage` (Fomantic's `expirationKey`). */
const EXPIRATION_SUFFIX = "ExpirationDate"

/** Default cookie path. */
const DEFAULT_PATH = "/"

/** Separator of `document.cookie`'s pairs, and of a cookie's options. */
const COOKIE_SEPARATOR = "; "

/** ms in a day. */
const DAY = 864e5
