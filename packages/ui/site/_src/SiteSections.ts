import { SiteData } from "$/ui/docs-components/SiteData"
// A leaf, not the barrel:  the barrel defines `<ui-docs-toc>`, which `<ui-root>` does on first use
import { TocIndex } from "$/ui/docs-components/ui-docs-toc/TocIndex"
import { FOLDS_KEY } from "./site.types"

/****************
 * ### `SiteSections`
 * The page side of the site's nested `<ui-section>`s (written into the pages by `yarn site:sections`):  where their
 * titles stick, the reader's folds, and LANDING on a `#hash`.  ONE per page (`SiteSections.instance`), following
 * whichever `main` the router shows (`show()`).
 * - Sticky:  the tabs' bar sticks at the top of the page column (`site.css`, "Sections and tabs");  every
 *   top-level section's title sticks just below it:  its `offset` (px) is set here, from the bar's measured height
 *   and `--site-top` (resolved through a hidden probe), again whenever the bar or the window resizes.  Nested titles
 *   stack below their parents' (the element does that).  The same line goes on `main` as `--site-sections-top`, for
 *   the browser's own anchor scrolling (`scroll-margin-top`).  A page's own sticky bar (`PAGE_BAR`) stacks between.
 * - Folds:  remembered per page (`localStorage`, `FOLDS_KEY` + the path:  `{ [section id]: folded }`):  the reader's
 *   (`ui-open` / `ui-close` that can be cancelled) are saved, and restored on every visit;  everything else starts
 *   OPEN.  An unfold made by a landing, or by find-in-page, is never saved.
 * - Landing (`land()`):  the target's pane selected (the first word of a section id IS its tab:  `#usage-keyboard`),
 *   every section around it (and itself) unfolded without animation, then scrolled so its title sits just below the
 *   stuck ones;  once more after `SETTLE_MS` (late layout, the toc's own first scroll), unless the reader scrolled,
 *   clicked or typed meanwhile.  Old hashes still land (`resolve()`).
 * - SIDE EFFECTS:  document `ui-open` / `ui-close` and window `hashchange` / `resize` listeners, a `ResizeObserver`,
 *   the probe `<div>` in `<body>`;  `offset` attributes on the sections, an inline `--site-sections-top` on `main`,
 *   `history.replaceState()` of an old hash to the id it found.
 ****************/
export class SiteSections {
  /** The one instance, made on first use:  static, as the page has one set of sections and one scroll. */
  static get instance(): SiteSections {
    return (SiteSections.only ??= new SiteSections())
  }
  private static only?: SiteSections

  /** The page's `main`, from the last `show()`. */
  private main?: HTMLElement

  /** Where top-level titles stick, px from the viewport's top (last `measure()`). */
  private top = 0

  /** Resolves `--site-top` to pixels (`site.css` `.site-sections-probe`). */
  private readonly probe: HTMLElement

  /** Re-measures when the tabs' bar resizes (its labels wrap, the font loads). */
  private readonly resized = new ResizeObserver(() => this.measure())

  /** Bumped by every landing:  an older one, still waiting, stops. */
  private landings = 0

  /** The reader scrolled, clicked or typed since the last landing began:  its settle doesn't land again. */
  private hasReaderMoved = false

  private constructor() {
    this.probe = document.createElement("div")
    this.probe.className = "site-sections-probe"
    this.probe.setAttribute("aria-hidden", "true")
    document.body.append(this.probe)
    document.addEventListener("ui-open", (event) => this.onToggle(event as CustomEvent<{ open: boolean }>))
    document.addEventListener("ui-close", (event) => this.onToggle(event as CustomEvent<{ open: boolean }>))
    window.addEventListener("hashchange", () => this.onHash())
    // the reader moving on:  a landing's second try must not pull the page back
    for (const type of ["wheel", "touchstart", "keydown", "pointerdown"])
      window.addEventListener(type, () => (this.hasReaderMoved = true), { capture: true, passive: true })
    window.addEventListener("resize", () => this.measure(), { passive: true })
  }

  ////////////////
  // ## Showing a page
  ////////////////

  /**
   * `main` is the page shown (its first load, or a swap):  restore its folds, set the sticky offsets, and again once
   * its `<ui-root>` is ready (the tabs' bar has drawn).
   * - `isFirst`:  before the sections are defined, so a restored fold just starts folded;  after a swap they have
   *   drawn, so it folds without its animation.
   */
  show(main: HTMLElement, { isFirst = false }: { isFirst?: boolean } = {}): void {
    this.main = main
    this.restoreFolds(main, { isInstant: !isFirst })
    this.measure()
    TocIndex.whenReady(main, () => {
      if (this.main !== main) return
      this.measure()
      this.resized.disconnect()
      const bar = SiteSections.barOf(main)
      if (bar) this.resized.observe(bar)
    })
  }

  /**
   * Set every top-level section's `offset`, and `main`'s `--site-sections-top`, to the line below the stuck bar:
   * `--site-top`, plus the tabs' bar and its band when the page has tabs.
   */
  private measure(): void {
    const main = this.main
    if (!main?.isConnected) return
    const siteTop = parseFloat(getComputedStyle(this.probe).top) || 0
    const bar = SiteSections.barOf(main)
    const band = parseFloat(getComputedStyle(main).getPropertyValue("--site-tabs-band")) || 0
    let top = siteTop + (bar ? bar.getBoundingClientRect().height + band : 0)
    // a page's own sticky bar (the kitchen sink's theme picker):  stuck below that, the titles below it
    const pageBar = main.querySelector<HTMLElement>(PAGE_BAR)
    if (pageBar) {
      SiteSections.setOffset(pageBar, String(Math.round(top)))
      top += SiteSections.heightOf(pageBar)
    }
    this.top = Math.round(top)
    const value = `${this.top}px`
    if (main.style.getPropertyValue(SECTIONS_TOP) !== value) main.style.setProperty(SECTIONS_TOP, value)
    const offset = String(this.top)
    for (const section of SiteSections.topSections(main)) SiteSections.setOffset(section, offset)
  }

  ////////////////
  // ## Folds
  ////////////////

  /** Fold or unfold `main`'s sections as the reader left them on this page;  `isInstant`:  without the animation. */
  private restoreFolds(main: HTMLElement, { isInstant }: { isInstant: boolean }): void {
    const saved = SiteSections.readFolds()
    let hasChanged = false
    for (const section of SiteSections.pageSections(main)) {
      if (!section.hasAttribute("collapsible") || !(section.id in saved)) continue
      const isCollapsed = !!saved[section.id]
      if (section.hasAttribute(COLLAPSED) === isCollapsed) continue
      if (isInstant && !hasChanged) SiteSections.instantly(main)
      section.toggleAttribute(COLLAPSED, isCollapsed)
      hasChanged = true
    }
  }

  /**
   * The reader folded or unfolded a section:  remember it.
   * - Not ours:  accordions' `ui-open` / `ui-close`, demo sections inside examples, a vetoed toggle, a `ui-open` that
   *   can't be cancelled (find-in-page's reveal:  never saved, as a landing's unfold isn't).
   */
  private onToggle(event: CustomEvent<{ open: boolean }>): void {
    const section = event.target as HTMLElement
    if (section.localName !== SECTION_TAG || !section.id || !this.main?.contains(section)) return
    if (!event.cancelable || event.defaultPrevented || section.parentElement?.closest(NOT_PAGE)) return
    const saved = SiteSections.readFolds()
    saved[section.id] = !event.detail.open
    SiteSections.writeFolds(saved)
  }

  /** Unfold every section around `target` (and `target`, a section), without the animation;  true if any was. */
  private static unfold(main: HTMLElement, target: Element): boolean {
    let hasUnfolded = false
    for (let section = target.closest(SECTION_TAG) ?? undefined; section && main.contains(section);) {
      if (section.hasAttribute(COLLAPSED)) {
        if (!hasUnfolded) SiteSections.instantly(main)
        // controlled:  writing it announces nothing, so it isn't saved
        section.removeAttribute(COLLAPSED)
        hasUnfolded = true
      }
      section = SiteSections.sectionAround(section)
    }
    return hasUnfolded
  }

  ////////////////
  // ## Landing
  ////////////////

  /**
   * Land on `hash` in `main`, if it names something there;  false when it doesn't (or names a pane:  the tabs show
   * it themselves), so the caller can scroll to the top instead.
   * - The scroll happens once `<ui-root>` is ready, the pane has swapped in and the folds have drawn.
   */
  land(main: HTMLElement, hash: string): boolean {
    const id = TocIndex.decode(hash.replace(/^#/, ""))
    if (!id) return false
    const tabs = SiteSections.tabsOf(main)
    if (tabs && SiteSections.paneValues(tabs).includes(id)) return false
    const found = SiteSections.resolve(main, id)
    if (!found) return false
    // an old link:  the URL names what it found
    if ("id" in found && found.id !== id) history.replaceState(history.state, "", `#${encodeURIComponent(found.id)}`)
    this.hasReaderMoved = false
    void this.go(main, found, ++this.landings)
    return true
  }

  /**
   * What `id` names in `main`:
   * - an element with that id
   * - an OLD link:  a pane's section of that name (`#types` => `#examples-types`), else the first page section whose
   *   id ends with it (an example's old slug:  `#vertical-divider` => `#examples-types-vertical-divider`)
   * - a tag's own page's `<ui-docs-api tag>` for that tag (`ui-radio.html#ui-radio`):  the tables, headerless
   * - a tag of the family (`#ui-or`):  its tables in the `<ui-docs-api>`, drawn in its shadow root later
   */
  private static resolve(main: HTMLElement, id: string): Found | undefined {
    const own = document.getElementById(id)
    if (own && main.contains(own)) return { target: own, id }
    const tabs = SiteSections.tabsOf(main)
    for (const value of tabs ? SiteSections.paneValues(tabs) : []) {
      const section = document.getElementById(`${value}-${id}`)
      if (section && main.contains(section)) return { target: section, id: section.id }
    }
    const suffix = `-${id}`
    const section = SiteSections.pageSections(main).find((element) => element.id.endsWith(suffix))
    if (section) return { target: section, id: section.id }
    const single = [...main.querySelectorAll<HTMLElement>("ui-docs-api[tag]")].find(
      (element) => element.getAttribute("tag") === id
    )
    if (single) return { target: single, id }
    const api = main.querySelector<HTMLElement>("ui-docs-api[family]")
    if (api && TAG_NAME.test(id)) return { api, tag: id }
    return undefined
  }

  /** Bring `found` on screen (see `land()`), unless a newer landing (`landing`) started meanwhile. */
  private async go(main: HTMLElement, found: Found, landing: number): Promise<void> {
    await new Promise<void>((resolve) => TocIndex.whenReady(main, resolve))
    if (landing !== this.landings) return
    const target = "api" in found ? await SiteSections.apiHeader(found.api, found.tag) : found.target
    if (!target || landing !== this.landings) return
    const holder = "api" in found ? found.api : target
    const tabs = SiteSections.tabsOf(main)
    const pane = tabs && TocIndex.paneOf(tabs, holder)
    if (tabs && pane && TocIndex.shownPane(tabs) !== pane)
      (tabs as HTMLElement & { value?: string }).value = TocIndex.paneValue(tabs, pane)
    const hasUnfolded = SiteSections.unfold(main, holder)
    for (let frame = 0; frame < SHOW_FRAMES && !SiteSections.boxOf(target); frame++) await SiteSections.frames(1)
    // after the toc's own first-load scroll (`<ui-docs-toc>` lands a hash a frame after the root is ready)
    await SiteSections.frames(hasUnfolded ? UNFOLD_FRAMES : 2)
    if (landing !== this.landings) return
    this.measure()
    this.scrollTo(target, holder)
    setTimeout(() => {
      if (landing === this.landings && !this.hasReaderMoved) this.scrollTo(target, holder)
    }, SETTLE_MS)
  }

  /**
   * Scroll so `target`'s top sits on its line:  below the stuck bar and the titles of the sections around `holder`
   * (`target` itself, or the host whose shadow root holds it);  a section's own title sits right on the line, where
   * it sticks.
   */
  private scrollTo(target: Element, holder: Element): void {
    const box = SiteSections.boxOf(target)
    if (!box) return
    let line = this.top
    for (let section = SiteSections.sectionAround(holder); section; section = SiteSections.sectionAround(section)) {
      if (section.hasAttribute("sticky")) line += SiteSections.titleHeight(section)
    }
    if (target.localName !== SECTION_TAG) line += GAP
    window.scrollTo({ top: Math.max(0, scrollY + box.top - line), behavior: "instant" })
  }

  /** The hash changed on this page (a toc or `#id` link, back / forward):  land again, through ours. */
  private onHash(): void {
    const main = this.main
    if (main?.isConnected && location.hash) this.land(main, location.hash)
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** `<ui-docs-api>`'s header for `tag`, once drawn (its data loads first);  `undefined` if it isn't the family's. */
  private static async apiHeader(api: HTMLElement, tag: string): Promise<Element | undefined> {
    const data = await SiteData.load().catch(() => undefined)
    const family = api.getAttribute("family") ?? ""
    if (!data || !SiteData.family(data, family)?.tags.includes(tag)) return undefined
    const deadline = performance.now() + API_WAIT_MS
    while (performance.now() < deadline) {
      const header = api.shadowRoot?.getElementById(tag)
      if (header) return header
      await SiteSections.frames(1)
    }
    return undefined
  }

  /**
   * Where `target`'s top is now, unstuck:  a section's sentinel (where its title would be, even while stuck), else
   * its box;  a box-less host (`display: contents`):  its parent's.  `undefined` while it has none (a hidden pane).
   */
  private static boxOf(target: Element): DOMRect | undefined {
    const sentinel = target.localName === SECTION_TAG ? target.shadowRoot?.querySelector(".sentinel") : undefined
    for (const element of [sentinel, target, target.parentElement]) {
      if (element?.getClientRects().length) return element.getBoundingClientRect()
    }
    return undefined
  }

  /**
   * Height of `element`'s box, px;  a box-less host (`display: contents`, as `<ui-sticky>` and many hosts are):  the
   * tallest box in its shadow root, else among its children, looking through box-less ones the same way.
   */
  private static heightOf(element: Element): number {
    const height = element.getBoundingClientRect().height
    if (height) return height
    const inside = [...(element.shadowRoot?.children ?? []), ...element.children]
    return Math.max(0, ...inside.filter((child) => child.localName !== "style").map(SiteSections.heightOf))
  }

  /** Height of `section`'s title bar, px (0 before it draws). */
  private static titleHeight(section: Element): number {
    return section.shadowRoot?.querySelector('[part~="title"]')?.getBoundingClientRect().height ?? 0
  }

  /** The page's tabs (`#site-tabs`), if any. */
  private static tabsOf(main: HTMLElement): HTMLElement | undefined {
    return main.querySelector<HTMLElement>("ui-tabs#site-tabs") ?? undefined
  }

  /** The values of `tabs`' panes. */
  private static paneValues(tabs: HTMLElement): string[] {
    return [...tabs.children]
      .filter((pane) => pane.localName !== "template")
      .map((pane) => TocIndex.paneValue(tabs, pane))
  }

  /** The tabs' bar (its `menu` part), once drawn. */
  private static barOf(main: HTMLElement): HTMLElement | undefined {
    return SiteSections.tabsOf(main)?.shadowRoot?.querySelector<HTMLElement>('[part~="menu"]') ?? undefined
  }

  /** `main`'s page sections:  every `<ui-section>` but the demos inside examples. */
  private static pageSections(main: HTMLElement): HTMLElement[] {
    return [...main.querySelectorAll<HTMLElement>(SECTION_TAG)].filter(
      (section) => !section.parentElement?.closest(NOT_PAGE)
    )
  }

  /** `main`'s TOP-LEVEL page sections:  inside no other. */
  private static topSections(main: HTMLElement): HTMLElement[] {
    return SiteSections.pageSections(main).filter((section) => !SiteSections.sectionAround(section))
  }

  /** The `<ui-section>` around `element` (not `element` itself), if any. */
  private static sectionAround(element: Element): Element | undefined {
    return element.parentElement?.closest(SECTION_TAG) ?? undefined
  }

  /** Set `element`'s `offset` to `offset`, unless it has it:  re-setting would restart its sticky watch for nothing. */
  private static setOffset(element: Element, offset: string): void {
    if (element.getAttribute(OFFSET) !== offset) element.setAttribute(OFFSET, offset)
  }

  /** Folds and unfolds in `main` skip their animation for a few frames:  a landing measures right after. */
  private static instantly(main: HTMLElement): void {
    main.style.setProperty(SECTION_DURATION, "0s")
    void SiteSections.frames(UNFOLD_FRAMES + 1).then(() => main.style.removeProperty(SECTION_DURATION))
  }

  /** Resolves after `count` animation frames. */
  private static async frames(count: number): Promise<void> {
    for (let frame = 0; frame < count; frame++) await new Promise((resolve) => requestAnimationFrame(resolve))
  }

  /** This page's saved folds, `{}` when none (or storage is blocked). */
  private static readFolds(): Record<string, boolean> {
    try {
      const saved = JSON.parse(localStorage.getItem(FOLDS_KEY + location.pathname) ?? "{}") as unknown
      return saved && typeof saved === "object" ? (saved as Record<string, boolean>) : {}
    } catch {
      return {}
    }
  }

  /** Save this page's folds;  silently not, where storage is blocked. */
  private static writeFolds(folds: Record<string, boolean>): void {
    try {
      localStorage.setItem(FOLDS_KEY + location.pathname, JSON.stringify(folds))
    } catch {
      // private window, blocked storage:  folds last until the next visit only
    }
  }
}

/**
 * What a hash names:  an element (with the id the URL should say), or a tag of the family, drawn by
 * `<ui-docs-api>` in its shadow root.
 */
type Found = { target: Element; id: string } | { api: HTMLElement; tag: string }

/** Frames a section takes to draw what an unfold revealed (the write lands on a microtask, the render next frame). */
const UNFOLD_FRAMES = 3

/** Frames to wait at most for a target to get a box (its pane swapping in, inside a View Transition). */
const SHOW_FRAMES = 30

/** Land once more after this long, ms:  late layout (images, a fold's last frame) moves the target a little. */
const SETTLE_MS = 400

/** Gap between the stuck titles and a target that isn't a section (an example, a heading), px. */
const GAP = 8

/** Wait at most this long for `<ui-docs-api>` to draw the tag a hash names, ms. */
const API_WAIT_MS = 5000

/**
 * A page's own sticky bar above its sections (a `<ui-sticky>`:  the kitchen sink's theme picker):  its `offset` is
 * set to stick below the site's top, and the section titles stick below it.  One per page.
 */
const PAGE_BAR = "ui-sticky.site-sticky-bar"

/** What can't be a page section:  a demo inside an example, a template. */
const NOT_PAGE = "ui-docs-example, template"

/** The section tag. */
const SECTION_TAG = "ui-section"

/** A section's folded attribute (controlled:  writing it announces nothing). */
const COLLAPSED = "collapsed"

/** The sticky offset attribute of a section or `<ui-sticky>`, px. */
const OFFSET = "offset"

/** `main`'s custom property:  the line below the stuck bar, for anchor scrolling (`site.css`). */
const SECTIONS_TOP = "--site-sections-top"

/** `<ui-section>`'s fold duration token:  `0s` while folds go instantly. */
const SECTION_DURATION = "--ui-section-duration"

/** A tag name, as `<ui-docs-api>` gives each tag's header its id (`ui-or`). */
const TAG_NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/
