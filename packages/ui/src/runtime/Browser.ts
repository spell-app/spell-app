import { isBrowser, lazy } from "$/ui/util"

import type { BrowserSupports } from "./runtime.types"

/****************
 * ### `Browser`
 * Browser sniffing and feature flags, as `UI.browser`.
 * - ONE place for "can this browser do X":  call sites read `UI.browser.supports.popoverHint`,
 *   NEVER a user-agent check of their own (see `AGENTS.md` "Platform").
 * - Constructs anywhere:  outside a browser (SSR, node tooling) every flag is `false`.
 * - `supports` is detected once, on first read;  media-query flags (`isReducedMotion`, `isDark`)
 *   are live, re-read on every access.
 ****************/
export class Browser {
  /** Feature flags, detected once on first read -- see `BrowserSupports`. */
  @lazy get supports(): BrowserSupports {
    return this.detect()
  }

  ////////////////
  // ## Engines and platforms
  ////////////////

  /**
   * Chromium-based (Chrome, Edge, Opera, Brave ...).
   * - Prefers `navigator.userAgentData` brands, which only Chromium ships.
   */
  get isChromium(): boolean {
    const brands = (this.navigator as NavigatorWithUAData | undefined)?.userAgentData?.brands
    if (brands) return brands.some((entry) => entry.brand === "Chromium")
    return /Chrom(e|ium)\//.test(this.userAgent)
  }

  /** Firefox (Gecko). */
  get isFirefox(): boolean {
    return /Firefox\//.test(this.userAgent)
  }

  /**
   * Safari (WebKit), including every iOS browser -- they're all WebKit.
   * - NOTE: Chrome / Edge / Android UAs also say "Safari", hence the exclusions.
   */
  get isSafari(): boolean {
    const userAgent = this.userAgent
    return /Safari\//.test(userAgent) && !/Chrom(e|ium)\/|Edg\/|Android/.test(userAgent)
  }

  /** iPhone / iPad, including iPadOS which reports itself as a Mac with a touch screen. */
  get isIOS(): boolean {
    const navigator = this.navigator
    if (!navigator) return false
    const { userAgent } = navigator
    return /iPad|iPhone|iPod/.test(userAgent) || (/Mac/.test(userAgent) && navigator.maxTouchPoints > 1)
  }

  /** Apple platform:  `Mod` in shortcuts means Meta (Cmd), not Ctrl. */
  get isApple(): boolean {
    return Browser.isApplePlatform(this.navigator)
  }

  /** Primary pointer is coarse (finger), or the device has a touch screen. */
  get isTouch(): boolean {
    return this.matches("(pointer: coarse)") || (this.navigator?.maxTouchPoints ?? 0) > 0
  }

  ////////////////
  // ## Preferences (live)
  ////////////////

  /** The person asked for reduced motion (`prefers-reduced-motion`);  `Transitions` then skips animations.  Live. */
  get isReducedMotion(): boolean {
    return this.matches("(prefers-reduced-motion: reduce)")
  }

  /** The OS / browser is in dark mode (`prefers-color-scheme`).  Live. */
  get isDark(): boolean {
    return this.matches("(prefers-color-scheme: dark)")
  }

  ////////////////
  // ## Internals
  ////////////////

  /** `navigator`, or `undefined` outside a browser. */
  private get navigator(): Navigator | undefined {
    return globalThis.navigator
  }

  /** `navigator.userAgent`, or `""` outside a browser. */
  private get userAgent(): string {
    return this.navigator?.userAgent ?? ""
  }

  /** `matchMedia(query).matches`, `false` without `matchMedia`. */
  private matches(query: string): boolean {
    return typeof matchMedia === "function" && matchMedia(query).matches
  }

  /**
   * Detect every flag in `BrowserSupports`.
   * - Each probe is wrapped:  a throwing probe (odd embedded webviews) means "unsupported", not a crash.
   */
  private detect(): BrowserSupports {
    const dom = isBrowser()
    const css = typeof CSS !== "undefined" && typeof CSS.supports === "function"
    return {
      anchorPositioning: css && probe(() => CSS.supports("anchor-name: --x")),
      popover: dom && probe(() => Object.hasOwn(HTMLElement.prototype, "popover")),
      popoverHint: dom && probe(() => this.popoverHintReflects()),
      invokers: dom && probe(() => "commandForElement" in HTMLButtonElement.prototype),
      dialogClosedBy: dom && probe(() => "closedBy" in HTMLDialogElement.prototype),
      closeWatcher: "CloseWatcher" in globalThis,
      baseSelect: css && probe(() => CSS.supports("appearance", "base-select")),
      styleContainerQueries: dom && probe(() => this.parsesStyleQuery()),
      startingStyle: "CSSStartingStyleRule" in globalThis,
      customStates: typeof ElementInternals !== "undefined" && "states" in ElementInternals.prototype,
      viewTransitions: dom && "startViewTransition" in document,
      temporal: "Temporal" in globalThis,
      interpolateSize: css && probe(() => CSS.supports("interpolate-size: allow-keywords")),
      anchoredQueries: css && probe(() => CSS.supports("container-type: anchored"))
    }

    /** Run a feature probe;  `false` if it throws. */
    function probe(test: () => boolean): boolean {
      try {
        return test()
      } catch {
        return false
      }
    }
  }

  /**
   * `popover="hint"` is supported when it reflects back as `"hint"`.
   * - Browsers without it map unknown values to `"manual"`.
   */
  private popoverHintReflects(): boolean {
    const element = document.createElement("div")
    element.setAttribute("popover", "hint")
    return element.popover === "hint"
  }

  /**
   * Style container queries parse into a `CSSContainerRule` whose condition keeps the `style()` query.
   * - NOTE: there's no `CSS.supports()` for at-rules;  a browser without style queries drops the
   *   condition (or the rule), which is what this checks.
   */
  private parsesStyleQuery(): boolean {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync("@container style(--ui-probe: 1) { a { color: red } }")
    const rule = sheet.cssRules[0]
    return (
      typeof CSSContainerRule !== "undefined" && rule instanceof CSSContainerRule && /style\(/.test(rule.conditionText)
    )
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * Is `navigator` an Apple platform's (`Mod` means Meta, not Ctrl)?  `false` outside a browser.
   * - STATIC:  `Chord.parse()` asks before any runtime exists (and in tests);  `isApple` asks it too.
   * - `navigator.platform`, falling back to `navigator.userAgent`.
   */
  static isApplePlatform(navigator: Navigator | undefined = globalThis.navigator): boolean {
    return !!navigator && APPLE_PLATFORM.test(navigator.platform || navigator.userAgent)
  }
}

/**
 * Platforms whose primary shortcut modifier is Meta (Cmd), not Ctrl.
 * - Tested against `navigator.platform`, falling back to `navigator.userAgent`.
 */
const APPLE_PLATFORM = /Mac|iPhone|iPad|iPod/i

/** `navigator` with Chromium's `userAgentData`, which TypeScript's DOM lib doesn't declare. */
type NavigatorWithUAData = Navigator & {
  /** Chromium-only client hints */
  userAgentData?: { brands: { brand: string; version: string }[] }
}
