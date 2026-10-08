import {
  EN_STRINGS,
  type I18nKey,
  type I18nParams,
  type NameStyle,
  type StringPack,
  type TemporalAPI
} from "./runtime.types"
import type { Browser } from "./Browser"

/****************
 * ### `I18n`
 * Text strings and locale-aware formatting, as `UI.i18n`.
 * - In the runtime's lazy chunk;  `temporal-polyfill` is a lazy chunk of its own (`./TemporalPolyfill`).
 * - Strings:  packs per locale (`register("de", {...})`);  `t(key)` looks up the exact locale (`pt-BR`),
 *   then its language (`pt`), then `en`, then the English DEFAULTS, then returns the key itself -- a missing
 *   string is visible, not blank.
 * - SCOPED strings:  `t(key, params, scope)` with a component's canonical tag (`ui-table`), as `UIComponent.text()`
 *   calls it.  Per locale it tries that component's strings (`register("es", {...}, "ui-table")`), then the
 *   shared ones (`register("es", {...})`):  a shared translation covers every component using the key, a scoped
 *   one overrides it for one component.  Why:  two families may share a key (`label`) with different text.
 * - DEFAULTS are the English source texts, below every registered string:  `EN_STRINGS` and each component's
 *   vocabulary texts (`registerDefaults()`, by `UIComponent.define()`).  A component's own default beats another
 *   family's;  an unscoped `t(key)` gets the FIRST default registered for the key.
 * - Formatting via `Intl`, with formatters cached per locale + options (they're costly to build).
 * - Temporal:  `temporal` is the browser's own when `UI.browser.supports.temporal`, else `temporal-polyfill`'s
 *   once `loadTemporal()` has loaded it -- a dynamic import, so a lazy chunk only browsers without Temporal
 *   fetch, and NEVER installed on `globalThis`.
 ****************/
export class I18n {
  /** BCP 47 locale for lookups and formatting;  default the browser's */
  locale: string
  /** locale -> shared strings */
  private readonly packs = new Map<string, StringPack>()
  /** locale -> scope (canonical tag) -> that component's strings */
  private readonly scoped = new Map<string, Map<string, StringPack>>()
  /** English source texts shared by every scope:  `EN_STRINGS`, then the first family default per key */
  private readonly defaults: StringPack = { ...EN_STRINGS }
  /** scope -> that component's English source texts */
  private readonly scopedDefaults = new Map<string, StringPack>()
  /** feature flags (`supports.temporal`);  none => always the polyfill */
  private readonly browser: Browser | undefined
  /** `temporal-polyfill`'s `Temporal`, once loaded */
  private polyfill: TemporalAPI | undefined
  /** the polyfill's pending import, shared by every caller */
  private polyfilling: Promise<TemporalAPI> | undefined
  /** formatter cache, keyed by kind + locale + options */
  private readonly formatters = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat>()

  constructor({ locale, browser }: I18nProps = {}) {
    this.locale = locale ?? globalThis.navigator?.language ?? ENGLISH
    this.browser = browser
  }

  ////////////////
  // ## Strings
  ////////////////

  /**
   * Merge `pack` into `locale`'s strings;  later registrations win per key.
   * - `scope` (a canonical tag, `ui-table`):  strings for that component only, ahead of the shared ones.
   * - Beats the English defaults, `en` included:  `register("en", { close: "Dismiss" })` rewords a default.
   */
  register(locale: string, pack: StringPack, scope?: string) {
    if (scope === undefined) return void this.packs.set(locale, { ...this.packs.get(locale), ...pack })
    let scopes = this.scoped.get(locale)
    if (!scopes) this.scoped.set(locale, (scopes = new Map()))
    scopes.set(scope, { ...scopes.get(scope), ...pack })
  }

  /**
   * English SOURCE texts of component `scope` (its canonical tag), below every registered string.
   * - Replaces that scope's earlier defaults per key (a hot-reloaded vocabulary);  fills the shared defaults
   *   only where empty, so an unscoped `t(key)` keeps the first family's text.
   */
  registerDefaults(pack: StringPack, scope: string) {
    this.scopedDefaults.set(scope, { ...this.scopedDefaults.get(scope), ...pack })
    Object.assign(this.defaults, { ...pack, ...this.defaults })
  }

  /**
   * String for `key` in the current locale (see class docs for fallback), with `{name}` placeholders
   * filled from `params`.
   * - `scope`:  a component's canonical tag;  its own strings first, per locale (see class docs).
   * - A placeholder without a param stays as-is (`{value}`), so the gap is visible.
   */
  t(key: I18nKey, params?: I18nParams, scope?: string): string {
    const text = this.lookup(key, scope) ?? key
    if (!params) return text
    return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match))
  }

  /** Is there a string for `key` (in `scope`, or shared) in the current locale's chain or the defaults? */
  has(key: I18nKey, scope?: string): boolean {
    return this.lookup(key, scope) !== undefined
  }

  ////////////////
  // ## Formatting
  ////////////////

  /**
   * Format a date with `Intl.DateTimeFormat`;  default:  medium date.
   * - `locale`:  instead of `this.locale`, e.g. an element's own `locale` attribute.
   */
  formatDate(
    date: Date | number,
    options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
    locale = this.locale
  ): string {
    return this.dateFormat(options, locale).format(date)
  }

  /** Format a number with `Intl.NumberFormat`. */
  formatNumber(value: number | bigint, options: Intl.NumberFormatOptions = {}): string {
    return this.numberFormat(options).format(value)
  }

  /**
   * Weekday names, Sunday first (index === `Date.getDay()`).
   * - Rotate by `firstDayOfWeek()` for calendar headers.
   */
  weekdays(style: NameStyle = "long", locale = this.locale): string[] {
    const format = this.dateFormat({ weekday: style, timeZone: "UTC" }, locale)
    return Array.from({ length: 7 }, (_, day) => format.format(Date.UTC(SUNDAY_YEAR, 0, 1 + day)))
  }

  /** Month names, January first (index === `Date.getMonth()`). */
  months(style: NameStyle = "long", locale = this.locale): string[] {
    const format = this.dateFormat({ month: style, timeZone: "UTC" }, locale)
    return Array.from({ length: 12 }, (_, month) => format.format(Date.UTC(SUNDAY_YEAR, month, 1)))
  }

  /**
   * First day of the week for the locale, `0` = Sunday (as `Date.getDay()`).
   * - From `Intl.Locale` week info where the browser has it (`1` = Monday ... `7` = Sunday there), else Sunday.
   */
  firstDayOfWeek(locale = this.locale): number {
    try {
      const localeInfo = new Intl.Locale(locale) as Intl.Locale & WeekInfoLocale
      const info = localeInfo.getWeekInfo?.() ?? localeInfo.weekInfo
      return info ? info.firstDay % 7 : 0
    } catch {
      return 0
    }
  }

  ////////////////
  // ## Temporal
  ////////////////

  /**
   * `Temporal` if it's here NOW:  the browser's own (`supports.temporal`), else the polyfill once
   * `loadTemporal()` has resolved, else `undefined`.
   * - For code that must run synchronously (a render), after awaiting `loadTemporal()` once.
   */
  get temporal(): TemporalAPI | undefined {
    if (this.browser?.supports.temporal) return (globalThis as { Temporal?: TemporalAPI }).Temporal
    return this.polyfill
  }

  /**
   * `Temporal`, loading `temporal-polyfill` the first time a browser without it asks.
   * - SIDE EFFECT:  one dynamic `import()` per page, a lazy chunk;  the polyfill is kept here, never put on
   *   `globalThis`.
   */
  loadTemporal(): Promise<TemporalAPI> {
    const now = this.temporal
    if (now) return Promise.resolve(now)
    return (this.polyfilling ??= import("./TemporalPolyfill").then(({ Temporal }) => (this.polyfill = Temporal)))
  }

  /** Localized name of a language / region / currency code via `Intl.DisplayNames`, e.g. `("region", "DE")`. */
  displayName(type: Intl.DisplayNamesType, code: string): string {
    try {
      return new Intl.DisplayNames([this.locale, ENGLISH], { type }).of(code) ?? code
    } catch {
      return code
    }
  }

  ////////////////
  // ## Internals
  ////////////////

  /**
   * Walk the locale chain for `key`:  per locale, `scope`'s string, then the shared one;  then `scope`'s
   * English default, then the shared default.
   */
  private lookup(key: I18nKey, scope?: string): string | undefined {
    for (const locale of this.chain()) {
      const text =
        (scope === undefined ? undefined : this.scoped.get(locale)?.get(scope)?.[key]) ?? this.packs.get(locale)?.[key]
      if (text !== undefined) return text
    }
    return (scope === undefined ? undefined : this.scopedDefaults.get(scope)?.[key]) ?? this.defaults[key]
  }

  /** Locales to try, most specific first:  `pt-BR`, `pt`, `en`. */
  private chain(): string[] {
    const language = this.locale.split("-")[0] ?? this.locale
    return [...new Set([this.locale, language, ENGLISH])]
  }

  /** Cached `Intl.DateTimeFormat`. */
  private dateFormat(options: Intl.DateTimeFormatOptions, locale = this.locale): Intl.DateTimeFormat {
    return this.cachedFormat(Intl.DateTimeFormat, locale, options)
  }

  /** Cached `Intl.NumberFormat`. */
  private numberFormat(options: Intl.NumberFormatOptions): Intl.NumberFormat {
    return this.cachedFormat(Intl.NumberFormat, this.locale, options)
  }

  /** The `Format` for `locale` + `options`, built once (`Intl` formatters are costly to build). */
  private cachedFormat<O, F extends Intl.DateTimeFormat | Intl.NumberFormat>(
    Format: new (locale: string, options: O) => F,
    locale: string,
    options: O
  ): F {
    const key = `${Format.name}|${locale}|${JSON.stringify(options)}`
    let format = this.formatters.get(key) as F | undefined
    if (!format) this.formatters.set(key, (format = new Format(locale, options)))
    return format
  }
}

/** The locale every lookup ends at, and the last resort for the page's own. */
const ENGLISH = "en"

/** A year whose January 1st was a Sunday (2023), so day `n` of its January is weekday `n`. */
const SUNDAY_YEAR = 2023

/** Constructor props for `I18n`. */
export type I18nProps = {
  /** starting locale;  default `navigator.language` */
  locale?: string
  /** feature flags, for `supports.temporal`;  without them `Temporal` is always the polyfill */
  browser?: Browser
}

/** `Intl.Locale` week info, not yet in TypeScript's lib (`getWeekInfo()` newer, `weekInfo` older). */
type WeekInfoLocale = {
  /** current spelling */
  getWeekInfo?: () => { firstDay: number }
  /** older spelling (Chromium, Safari) */
  weekInfo?: { firstDay: number }
}
