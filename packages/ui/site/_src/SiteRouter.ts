import { UI } from "$/ui/runtime"
import { RootLoader } from "$/ui/components/ui-root/RootLoader"
import { ExampleSource } from "$/ui/docs-components/ui-docs-example/ExampleSource"
import { NavIndex } from "$/ui/docs-components/ui-docs-nav/NavIndex"

import { SiteSections } from "./SiteSections"
import { SiteShell } from "./SiteShell"

/****************
 * ### `SiteRouter`
 * Moves between the site's pages WITHOUT leaving the layout:  a click on a link to another page of the site swaps
 * only the page's `main`, through a `<ui-include select="main#main">` in the layout's content box, and
 * `history.pushState`s the page's real URL.  Back / forward swap it back.
 * - Each swap:  the new page's text is fetched (`UI.sources`, cached), the families it uses loaded, THEN the include
 *   pointed at it, so it goes in already defined;  inside a View Transition where the browser has them.
 * - On `ui-insert` (any include, the footer too, before its markup goes in):  examples keep their authored markup
 *   (`ExampleSource.keep()`), and every relative URL left is made absolute, so it holds after the next swap.
 * - After a swap:  the title, the nav's `current`, live reload's file (`SPELL_SERVER.file`), inline scripts run
 *   again, then the hash (or the top, or the scroll kept for back / forward), and focus to `main`.
 * - Anything that fails falls back to a full load of the URL.
 * - Plain DOM, no Solid.
 ****************/
export class SiteRouter {
  /** Folders under the site root that hold no pages:  their links load normally. */
  static readonly NOT_PAGES = ["_assets/", "_data/", "_parts/", "examples/", "images/"]

  /** Dispatched on `document` after a swap (`SiteHeader.PAGE_EVENT`, spelled out:  the header's module is the server's). */
  static readonly PAGE_EVENT = "spell-site:page"

  /** Give up on a swap that hasn't arrived after this long, ms:  full load instead. */
  static readonly TIMEOUT = 10_000

  /** The include that swaps pages, once the first swap made it. */
  private include?: HTMLElement

  /** Path of the page shown (no hash). */
  private page = location.pathname

  /** Bumped by every navigation:  a slower, older one finds it moved on and stops. */
  private navigation = 0

  /** The first page's path, and its file as the page server named it:  `serverFile()`'s anchor. */
  private readonly firstPage = location.pathname
  private readonly firstFile = SiteRouter.server()?.file

  /**
   * - `siteRoot`:  the site's root URL (`/ui/`)
   * - `content`:  the layout's content box, holding the page's `main`
   */
  constructor(
    private readonly siteRoot: URL,
    private readonly content: HTMLElement
  ) {}

  /** Listen for links, the nav, includes and history.  SIDE EFFECT:  document and window listeners, for good. */
  start(): void {
    history.scrollRestoration = "manual"
    document.addEventListener("click", (event) => this.onClick(event))
    document.addEventListener("ui-navigate", (event) => this.onNavigate(event as CustomEvent<{ href: string }>))
    document.addEventListener("ui-insert", (event) =>
      this.onInsert(event as CustomEvent<{ fragment: DocumentFragment }>)
    )
    window.addEventListener("popstate", () => this.onPopState())
    window.addEventListener("pagehide", () => this.keepScroll())
  }

  /** Go to `href`, as a click on a link to it would. */
  go(href: string): Promise<void> {
    const url = new URL(href, location.href)
    if (!this.routable(url)) {
      location.assign(url.href)
      return Promise.resolve()
    }
    this.keepScroll()
    history.pushState({ scrollY: 0 }, "", url.href)
    return this.load(url)
  }

  ////////////////
  // ## Listeners
  ////////////////

  /** A plain left click on a link to another page of the site. */
  private onClick(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = event.composedPath().find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement)
    if (!anchor?.href || anchor.hasAttribute("download")) return
    if (anchor.target && anchor.target !== "_self") return
    const url = new URL(anchor.href)
    if (!this.routable(url) || this.samePage(url)) return
    event.preventDefault()
    void this.go(url.href)
  }

  /** `<ui-docs-nav>` followed a link:  take it over. */
  private onNavigate(event: CustomEvent<{ href: string }>): void {
    const url = new URL(event.detail.href, location.href)
    if (!this.routable(url) || this.samePage(url)) return
    event.preventDefault()
    void this.go(url.href)
  }

  /** An include's markup is about to go in. */
  private onInsert(event: CustomEvent<{ fragment: DocumentFragment }>): void {
    const { fragment } = event.detail
    ExampleSource.keep(fragment)
    SiteShell.absolutize(fragment, location.href)
  }

  /** Back / forward:  another page swaps in;  the same page with another hash is the tabs' and the toc's. */
  private onPopState(): void {
    const url = new URL(location.href)
    if (url.pathname === this.page) return
    const state = history.state as { scrollY?: number } | null
    void this.load(url, state?.scrollY)
  }

  ////////////////
  // ## Swapping
  ////////////////

  /** Show `url`'s page;  `scrollY` restores a scroll position (back / forward). */
  private async load(url: URL, scrollY?: number): Promise<void> {
    const navigation = ++this.navigation
    const page = new URL(url.pathname + url.search, url)
    try {
      await UI.load()
      const { text } = await UI.sources.load(page.href)
      if (navigation !== this.navigation) return
      const parsed = new DOMParser().parseFromString(text, "text/html")
      const main = parsed.querySelector("main#main")
      if (!main) throw new Error(`${page.href}:  no main#main`)
      await Promise.allSettled([...RootLoader.undefinedTags(main)].map((tag) => SiteRouter.loadFamily(tag)))
      if (navigation !== this.navigation) return
      await this.swap(page.href)
      if (navigation !== this.navigation) return
      this.page = url.pathname
      this.shown(parsed.title, url)
      this.land(url, scrollY)
    } catch (error) {
      console.warn(`Spell UI site:  couldn't swap in ${url.href};  loading it`, error)
      location.assign(url.href)
    }
  }

  /**
   * Point the include at `href` and wait until its markup is in, inside a View Transition when the browser has them
   * (and motion isn't reduced);  rejects on an include error or a timeout.
   * - The include is made (or re-pointed) INSIDE the transition's callback:  the old page is captured first.
   */
  private async swap(href: string): Promise<void> {
    const point = () => {
      const include = this.ensureInclude(href)
      const inserted = SiteRouter.inserted(include, href)
      if (include.getAttribute("source") !== href) include.setAttribute("source", href)
      return inserted
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
    if (document.startViewTransition && !reduced) await document.startViewTransition(point).updateCallbackDone
    else await point()
  }

  /** Resolves once `include`'s next markup is in;  rejects on its `ui-error` or after `TIMEOUT`. */
  private static inserted(include: HTMLElement, href: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => done(new Error(`${href}:  timed out`)), SiteRouter.TIMEOUT)
      const onInsert = (event: Event) => {
        if (event.target === include) queueMicrotask(() => done())
      }
      const onError = (event: Event) => {
        if (event.target !== include) return
        event.preventDefault()
        done(new Error(`${href}:  ${(event as CustomEvent<{ kind: string }>).detail.kind}`))
      }
      include.addEventListener("ui-insert", onInsert)
      include.addEventListener("ui-error", onError)

      /** Settle once, dropping the listeners and the timer. */
      function done(error?: Error) {
        clearTimeout(timer)
        include.removeEventListener("ui-insert", onInsert)
        include.removeEventListener("ui-error", onError)
        if (error) reject(error)
        else resolve()
      }
    })
  }

  /**
   * The include that swaps pages, made on the first swap:  `source` set BEFORE it connects (an include without one
   * would empty itself), the page's first `main` moved in as its placeholder.
   */
  private ensureInclude(href: string): HTMLElement {
    if (this.include) return this.include
    const include = document.createElement("ui-include")
    include.className = "site-content-include"
    include.setAttribute("page-styles", "")
    include.setAttribute("select", "main#main")
    include.setAttribute("source", href)
    include.append(...this.content.childNodes)
    this.content.append(include)
    this.include = include
    return include
  }

  /** After a swap:  title, nav, live reload, scripts.  SIDE EFFECT:  re-runs the page's inline scripts. */
  private shown(title: string, url: URL): void {
    if (title) document.title = title
    const current = NavIndex.page()
    for (const nav of document.querySelectorAll("ui-docs-nav")) nav.setAttribute("current", current)
    const server = SiteRouter.server()
    const file = this.serverFile(url)
    if (server && file) server.file = file
    const main = this.content.querySelector("main#main")
    if (main) SiteRouter.runScripts(main)
    this.followPage()
    // the nav flyout (narrow screens) closes, as a full load would have closed it
    document.querySelector("ui-flyout#site-nav-flyout[open]")?.removeAttribute("open")
    // `<spell-site-header>` re-draws:  its title and "open in VS Code" link
    document.dispatchEvent(new Event(SiteRouter.PAGE_EVENT))
  }

  /**
   * Point the layout's "On this page" toc at the page shown:  `for` its tabs (`#site-tabs`;  none:  its `main`),
   * `header` its main's `data-toc-header`.
   * - Before `<ui-root>` loads the toc (first load):  its attributes, in place.  After:  a NEW toc, since one follows
   *   the element it found when it connected.
   */
  followPage(): void {
    const main = this.content.querySelector<HTMLElement>("main#main")
    const old = document.querySelector("ui-docs-toc.site-toc")
    if (!main || !old) return
    const toc = old.matches(":defined") ? document.createElement("ui-docs-toc") : old
    toc.className = old.className
    toc.toggleAttribute("for", false)
    if (main.querySelector("#site-tabs")) toc.setAttribute("for", "site-tabs")
    if (main.dataset.tocHeader) toc.setAttribute("header", main.dataset.tocHeader)
    else toc.removeAttribute("header")
    if (toc !== old) old.replaceWith(toc)
  }

  /**
   * The page's sections shown (folds, sticky offsets:  `SiteSections`), then land:  on `url`'s hash (its tab
   * selected, the sections around it unfolded, just below the stuck titles;  old hashes too), on `scrollY` (back /
   * forward), or at the top;  focus `main`.
   * - `first`:  the page's first load, from `site.ts`, BEFORE `<ui-root>` is defined:  saved folds go in before the
   *   sections draw, the landing waits for the root to be ready;  focus and a hash-less scroll stay the browser's.
   * - A hash that is a pane's value (`#usage`):  the tabs show that pane themselves (`<ui-tabs history>`).
   */
  land(url: URL, scrollY?: number, first = false): void {
    const main = this.content.querySelector<HTMLElement>("main#main")
    if (!main) return
    SiteSections.instance.show(main, first)
    if (!first) {
      if (!main.hasAttribute("tabindex")) main.tabIndex = -1
      main.focus({ preventScroll: true })
    }
    if (scrollY !== undefined) {
      scrollTo(0, scrollY)
      return
    }
    if (url.hash && SiteSections.instance.land(main, url.hash)) return
    if (!first) scrollTo(0, 0)
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A page of this site:  same origin, under the site root, an `.html` file or a folder, not an asset folder. */
  private routable(url: URL): boolean {
    if (url.origin !== location.origin) return false
    const root = this.siteRoot.pathname
    if (!url.pathname.startsWith(root)) return false
    const rest = url.pathname.slice(root.length)
    if (SiteRouter.NOT_PAGES.some((folder) => rest.startsWith(folder))) return false
    return rest === "" || rest.endsWith("/") || rest.endsWith(".html")
  }

  /** `url` is the page shown (maybe another hash):  the browser, the tabs and the toc handle it. */
  private samePage(url: URL): boolean {
    return url.pathname === this.page && url.search === location.search
  }

  /** Keep the scroll position in the current history entry, for back / forward. */
  private keepScroll(): void {
    history.replaceState({ ...(history.state as object | null), scrollY }, "")
  }

  /**
   * The page server's file for `url`, from the first page's:  the page's URL and file share their tail
   * (`/ui/components/x.html` <=> `/packages/ui/site/components/x.html`).
   */
  private serverFile(url: URL): string | undefined {
    if (!this.firstFile) return undefined
    const siteFolder = this.firstFile.slice(0, this.firstFile.length - this.tail(this.firstPage).length)
    return siteFolder + this.tail(url.pathname)
  }

  /** `path` below the site root, a folder as its `index.html`:  `/ui/` => `index.html`. */
  private tail(path: string): string {
    const rest = path.slice(this.siteRoot.pathname.length)
    return rest === "" || rest.endsWith("/") ? `${rest}index.html` : rest
  }

  /** What the page server injected (`window.SPELL_SERVER`);  live reload reads its `file`. */
  private static server(): { file?: string } | undefined {
    return (globalThis as { SPELL_SERVER?: { file?: string } }).SPELL_SERVER
  }

  /** Load the family defining `tag`, if any. */
  private static loadFamily(tag: string): Promise<void> {
    const folder = RootLoader.folderOf(tag)
    return folder ? RootLoader.load(folder) : Promise.resolve()
  }

  /** Run `root`'s inline scripts:  markup that came in through an include never ran them. */
  private static runScripts(root: Element): void {
    for (const script of root.querySelectorAll("script")) {
      if (script.type && script.type !== "module" && script.type !== "text/javascript") continue
      const fresh = document.createElement("script")
      for (const attribute of script.attributes) fresh.setAttribute(attribute.name, attribute.value)
      fresh.textContent = script.textContent
      script.replaceWith(fresh)
    }
  }
}
