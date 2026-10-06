import { Warnings } from "$/ui/util"
import { APP_STYLESHEET_ID, LAYER_ORDER } from "./runtime.types"

/**
 * The page's ONE app stylesheet (`id="ui-app-stylesheet"`), mirrored into a constructable sheet
 * that `Styles` appends LAST in every component's shadow root.
 * - Why:  page CSS can't reach into shadow roots.  Convention over configuration -- the app marks one
 *   `<link>` or `<style>` and every component picks it up, no per-component wiring.
 * - Sources:
 *   - `<style>`:  its text
 *   - same-origin `<link rel="stylesheet">`:  its `cssRules`, once loaded
 *   - cross-origin `<link>` (reading `cssRules` throws):  `fetch()` the `href`
 * - `@import` -- constructable sheets IGNORE `@import`, so imports are inlined:
 *   - `<link>` read via CSSOM:  every level, from each `CSSImportRule.styleSheet`
 *   - text (`<style>`, fetched `<link>`):  ONE level deep, fetched relative to the importing sheet;
 *     an `@import` inside an imported file is dropped (warns)
 *   - `layer()`, `supports()` and media on the `@import` become wrapping `@layer` / `@supports` / `@media` blocks
 *   - relative `url()`s in inlined files are made absolute, since the combined sheet has one base URL
 * - Kept in sync:  a `MutationObserver` watches the element (text / `href`) and `<head>` / `<body>` children
 *   (late insertion, removal, replacement);  changes are debounced.
 * - NOTE: an element that GAINS the id later via `setAttribute("id")` is not noticed -- insert it instead.
 */
export class AppStylesheet {
  /** current sheet;  replaced (and `onSheetChange` called) only when its base URL must change */
  sheet: CSSStyleSheet
  /** called when `sheet` is swapped for a new object, so `Styles` can re-push it */
  private readonly onSheetChange: (sheet: CSSStyleSheet) => void
  /** ms to coalesce bursts of mutations */
  private readonly debounce: number
  /** the watched `<link>` / `<style>` */
  private element: HTMLLinkElement | HTMLStyleElement | null = null
  /** last text applied, to skip no-op syncs */
  private text = ""
  /** bumped per sync;  a sync whose number is stale by the time its fetches finish is dropped */
  private generation = 0
  /** latest sync, see `ready` */
  private latest: Promise<void> = Promise.resolve()
  /** debounce timer */
  private timer?: ReturnType<typeof setTimeout>
  /** watches `<head>` / `<body>` / `<html>` children */
  private treeObserver?: MutationObserver
  /** watches the element's text or `href` */
  private elementObserver?: MutationObserver

  constructor({ onSheetChange, debounce = 30 }: AppStylesheetProps) {
    this.onSheetChange = onSheetChange
    this.debounce = debounce
    this.sheet = this.createSheet(document.baseURI)
  }

  /** Resolves once the sheet reflects the element as of the most recent change seen. */
  get ready(): Promise<void> {
    return this.latest
  }

  /** Is it watching? */
  get started(): boolean {
    return !!this.treeObserver
  }

  /**
   * Find the element, sync once, start watching.  Idempotent.
   * - SIDE EFFECT:  `MutationObserver`s on the document until `stop()`.
   */
  start(): Promise<void> {
    if (this.started || typeof document === "undefined") return this.latest
    this.treeObserver = new MutationObserver(() => this.onTreeChange())
    for (const parent of [document.documentElement, document.head, document.body]) {
      if (parent) this.treeObserver.observe(parent, { childList: true })
    }
    this.elementObserver = new MutationObserver(() => this.schedule())
    this.latest = this.sync()
    return this.latest
  }

  /** Stop watching;  the sheet keeps its last content. */
  stop() {
    this.treeObserver?.disconnect()
    this.elementObserver?.disconnect()
    this.treeObserver = this.elementObserver = undefined
    this.element?.removeEventListener("load", this.onLoad)
    this.element = null
    clearTimeout(this.timer)
  }

  ////////////////
  // ## Watching
  ////////////////

  /** Children of `<head>` / `<body>` changed:  resync if our element appeared, vanished or was replaced. */
  private onTreeChange() {
    if (document.getElementById(APP_STYLESHEET_ID) !== this.element) this.schedule()
  }

  /** `<link>` finished (re)loading. */
  private readonly onLoad = () => this.schedule()

  /** Debounced `sync()`;  `ready` covers it immediately. */
  private schedule() {
    clearTimeout(this.timer)
    this.latest = new Promise((resolve) => {
      this.timer = setTimeout(() => resolve(this.sync()), this.debounce)
    })
  }

  /** Point the element observer at `element` (or nothing). */
  private watch(element: HTMLLinkElement | HTMLStyleElement | null) {
    if (element === this.element) return
    this.element?.removeEventListener("load", this.onLoad)
    this.elementObserver?.disconnect()
    this.element = element
    if (!element || !this.elementObserver) return
    if (element instanceof HTMLLinkElement) {
      this.elementObserver.observe(element, { attributes: true, attributeFilter: ["href", "media", "disabled"] })
      element.addEventListener("load", this.onLoad)
    } else {
      this.elementObserver.observe(element, { characterData: true, childList: true, subtree: true })
    }
  }

  ////////////////
  // ## Reading
  ////////////////

  /** Re-read the element and apply its CSS if it changed. */
  private async sync(): Promise<void> {
    const generation = ++this.generation
    const found = document.getElementById(APP_STYLESHEET_ID)
    const element = found instanceof HTMLLinkElement || found instanceof HTMLStyleElement ? found : null
    if (found && !element)
      Warnings.warn(`#${APP_STYLESHEET_ID}`, `must be a <link rel="stylesheet"> or <style>:`, found)
    this.watch(element)
    let text = ""
    let base = document.baseURI
    try {
      // NOTE: test `HTMLLinkElement` first -- TS narrows it away after a failed `instanceof HTMLStyleElement`
      if (element instanceof HTMLLinkElement) {
        if (element.href) {
          base = element.href
          text = await this.readLink(element)
        }
      } else if (element) {
        text = await this.inlineImports(element.textContent ?? "", base)
      }
    } catch (error) {
      Warnings.warn(`#${APP_STYLESHEET_ID}`, "couldn't read the stylesheet:", error)
      return
    }
    if (generation !== this.generation) return
    this.apply(text, base)
  }

  /** Put `text` into the sheet, swapping in a new sheet when the base URL differs. */
  private apply(text: string, base: string) {
    if (base !== (this.sheet as SheetWithBase).baseURLForUI) {
      const sheet = this.createSheet(base)
      sheet.replaceSync(text)
      this.sheet = sheet
      this.text = text
      this.onSheetChange(sheet)
    } else if (text !== this.text) {
      this.sheet.replaceSync(text)
      this.text = text
    }
  }

  /** Empty sheet resolving relative `url()`s against `base`, remembering it. */
  private createSheet(base: string): CSSStyleSheet {
    const sheet: SheetWithBase = new CSSStyleSheet({ baseURL: base })
    sheet.baseURLForUI = base
    return sheet
  }

  /**
   * CSS text of a `<link>`:  its CSSOM once loaded, or a fetch when CSSOM is cross-origin.
   * - `disabled` links (or a non-matching `media`) contribute nothing, like on the page.
   */
  private async readLink(link: HTMLLinkElement): Promise<string> {
    if (link.disabled) return ""
    const sheet = await this.loadedSheet(link)
    let text: string
    try {
      text = sheet ? this.serialize(sheet.cssRules) : await this.fetchText(link.href, link.href)
    } catch {
      // cross-origin CSSOM throws SecurityError -- fall back to fetching the text
      text = await this.fetchText(link.href, link.href)
    }
    const media = link.media.trim()
    return media && media !== "all" ? `@media ${media} {\n${text}\n}` : text
  }

  /** `link.sheet` once the CURRENT `href` has loaded;  `null` if loading failed. */
  private loadedSheet(link: HTMLLinkElement): Promise<CSSStyleSheet | null> {
    if (link.sheet && link.sheet.href === link.href) return Promise.resolve(link.sheet)
    return new Promise((resolve) => {
      link.addEventListener("load", () => resolve(link.sheet), { once: true })
      link.addEventListener("error", () => resolve(null), { once: true })
    })
  }

  /** CSS text of `rules`, with `@import`s replaced by their (recursively serialized) contents. */
  private serialize(rules: CSSRuleList): string {
    const parts: string[] = []
    for (const rule of rules) {
      if (!(rule instanceof CSSImportRule)) {
        parts.push(rule.cssText)
        continue
      }
      const imported = rule.styleSheet
      if (!imported) continue
      let inner: string
      try {
        inner = this.absolutizeUrls(this.serialize(imported.cssRules), imported.href ?? document.baseURI)
      } catch {
        Warnings.warn(`#${APP_STYLESHEET_ID}`, `can't read cross-origin @import ${rule.href};  use a <style> instead`)
        continue
      }
      parts.push(this.wrap(inner, rule.layerName, rule.supportsText, rule.media.mediaText))
    }
    return parts.join("\n")
  }

  /** Replace each top-level `@import` in `text` with the fetched file (one level deep). */
  private async inlineImports(text: string, base: string): Promise<string> {
    const imports = [...text.matchAll(IMPORT_RULE)]
    if (!imports.length) return text
    const bodies = await Promise.all(
      imports.map(async (match) => {
        const href = new URL(match[2] ?? match[4] ?? "", base).href
        const body = await this.fetchText(href, href)
        return this.wrap(body, ...this.parseImportConditions(match[5] ?? ""))
      })
    )
    let index = 0
    return text.replace(IMPORT_RULE, () => bodies[index++] ?? "")
  }

  /** Fetch a stylesheet's text, with relative `url()`s made absolute against `base`. */
  private async fetchText(href: string, base: string): Promise<string> {
    const response = await fetch(href)
    if (!response.ok) throw new Error(`${response.status} fetching ${href}`)
    const text = this.absolutizeUrls(await response.text(), base)
    if (IMPORT_RULE.test(text)) {
      Warnings.warn(`#${APP_STYLESHEET_ID}`, `nested @import in ${href} is ignored (only one level is inlined)`)
    }
    IMPORT_RULE.lastIndex = 0
    return text
  }

  /**
   * Split what follows the URL in an `@import`:  `layer(x) supports(display: grid) screen`.
   * - Returns `[layer, supports, media]` for `wrap()`:  `layer` is `null` for none, `""` for anonymous.
   */
  private parseImportConditions(rest: string): [string | null, string | null, string] {
    let remaining = rest.trim()
    let layer: string | null = null
    let supports: string | null = null
    const layerMatch = /^layer(?:\(\s*([^)]*?)\s*\))?/.exec(remaining)
    if (layerMatch) {
      layer = layerMatch[1] ?? ""
      remaining = remaining.slice(layerMatch[0].length).trim()
    }
    const supportsMatch = /^supports\(((?:[^()]|\([^()]*\))*)\)/.exec(remaining)
    if (supportsMatch) {
      supports = supportsMatch[1]!.trim()
      remaining = remaining.slice(supportsMatch[0].length).trim()
    }
    return [layer, supports, remaining]
  }

  /** Wrap `text` in the blocks an `@import`'s conditions imply. */
  private wrap(text: string, layer: string | null, supports: string | null, media: string): string {
    let result = text
    if (layer !== null) result = `@layer ${layer} {\n${result}\n}`
    if (supports) result = `@supports (${supports.replace(/^\((.*)\)$/, "$1")}) {\n${result}\n}`
    if (media && media !== "all") result = `@media ${media} {\n${result}\n}`
    // re-declare the package layer order first, so an inlined `@layer` can't establish a different one
    return layer !== null ? `${LAYER_ORDER}\n${result}` : result
  }

  /** Make relative `url()`s in `text` absolute against `base`. */
  private absolutizeUrls(text: string, base: string): string {
    return text.replace(RELATIVE_URL, (_match, quote: string, path: string) => {
      try {
        return `url(${quote}${new URL(path, base).href}${quote})`
      } catch {
        return _match
      }
    })
  }
}

/** Constructor props for `AppStylesheet`. */
export type AppStylesheetProps = {
  /** told when the sheet object is replaced */
  onSheetChange: (sheet: CSSStyleSheet) => void
  /** ms to coalesce mutation bursts;  default `30` */
  debounce?: number
}

/** A sheet remembering the base URL it was built with (`CSSStyleSheet` doesn't expose it). */
type SheetWithBase = CSSStyleSheet & {
  /** base URL passed to the constructor */
  baseURLForUI?: string
}

/**
 * An `@import` rule in CSS text.
 * - Groups:  `2` url in `url()`, `4` quoted string url, `5` conditions (layer / supports / media)
 */
const IMPORT_RULE = /@import\s+(?:url\(\s*(['"]?)([^'")]+)\1\s*\)|(['"])([^'"]+)\3)\s*([^;]*);/g

/** A relative `url(...)`:  not `data:`, not absolute, not root-relative-to-origin handled by `URL` anyway. */
const RELATIVE_URL = /url\(\s*(['"]?)(?![a-z][\w+.-]*:|#)([^'")]+)\1\s*\)/gi
