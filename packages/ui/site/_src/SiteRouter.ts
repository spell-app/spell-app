import { E, UI } from "$/ui/core"
// Leaves, not barrels:  a family's barrel defines its tags, which `<ui-root>` does on first use
import { RootLoader } from "$/ui/components/ui-root/RootLoader"
import { ExampleSource } from "$/ui/docs-components/ui-docs-example/ExampleSource"
import { NavIndex } from "$/ui/docs-components/ui-docs-nav/NavIndex"
import { SiteSections } from "./SiteSections"
import { SiteShell } from "./SiteShell"
import { PAGE_MAIN } from "./site.types"

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
  /** The site's root URL (`/ui/`):  what's under it is routable. */
  private readonly siteRoot: URL

  /** The layout's content box, holding the page's `main`. */
  private readonly content: HTMLElement

  /** The include that swaps pages, once the first swap made it. */
  private include?: HTMLElement

  /** Path of the page shown (no hash). */
  private page = location.pathname

  /** Bumped by every navigation:  a slower, older one finds it moved on and stops. */
  private navigation = 0

  /** The first page's path:  `serverFile()`'s anchor, with `firstFile`. */
  private readonly firstPage = location.pathname

  /** The first page's file, as the page server named it (`SPELL_SERVER.file`). */
  private readonly firstFile = SiteRouter.server()?.file

  constructor({ siteRoot, content }: SiteRouterProps) {
    this.siteRoot = siteRoot
    this.content = content
  }

  ////////////////
  // ## What the site entry calls
  ////////////////

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
    if (!this.isRoutable(url)) {
      location.assign(url.href)
      return Promise.resolve()
    }
    this.keepScroll()
    history.pushState({ scrollY: 0 }, "", url.href)
    return this.load(url)
  }

  /**
   * Point the layout's "On this page" toc at the page shown:  `for` its tabs (`#site-tabs`;  none:  its `main`),
   * `header` its main's `data-toc-header`.
   * - Before `<ui-root>` loads the toc (first load):  its attributes, in place.  After:  a NEW toc, since one follows
   *   the element it found when it connected.
   */
  followPage(): void {
    const main = this.main()
    const old = document.querySelector(SITE_TOC)
    if (!main || !old) return
    const toc = old.matches(":defined") ? document.createElement(TOC_TAG) : old
    toc.className = old.className
    toc.toggleAttribute("for", false)
    if (main.querySelector(`#${SITE_TABS_ID}`)) toc.setAttribute("for", SITE_TABS_ID)
    if (main.dataset.tocHeader) toc.setAttribute("header", main.dataset.tocHeader)
    else toc.removeAttribute("header")
    if (toc !== old) old.replaceWith(toc)
  }

  /**
   * The page's sections shown (folds, sticky offsets:  `SiteSections`), then land:  on `url`'s hash (its tab
   * selected, the sections around it unfolded, just below the stuck titles;  old hashes too), on `scrollY` (back /
   * forward), or at the top;  focus `main`.
   * - `isFirst`:  the page's first load, from `site.ts`, BEFORE `<ui-root>` is defined:  saved folds go in before the
   *   sections draw, the landing waits for the root to be ready;  focus and a hash-less scroll stay the browser's.
   * - A hash that is a pane's value (`#usage`):  the tabs show that pane themselves (`<ui-tabs history>`).
   */
  land(url: URL, { scrollY, isFirst = false }: LandOptions = {}): void {
    const main = this.main()
    if (!main) return
    SiteSections.instance.show(main, { isFirst })
    if (!isFirst) {
      if (!main.hasAttribute("tabindex")) main.tabIndex = -1
      main.focus({ preventScroll: true })
    }
    if (scrollY !== undefined) {
      scrollTo(0, scrollY)
      return
    }
    if (url.hash && SiteSections.instance.land(main, url.hash)) return
    if (!isFirst) scrollTo(0, 0)
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
    if (!this.isRoutable(url) || this.isSamePage(url)) return
    event.preventDefault()
    void this.go(url.href)
  }

  /** `<ui-docs-nav>` followed a link:  take it over. */
  private onNavigate(event: CustomEvent<{ href: string }>): void {
    const url = new URL(event.detail.href, location.href)
    if (!this.isRoutable(url) || this.isSamePage(url)) return
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

  /**
   * Show `url`'s page;  `scrollY` restores a scroll position (back / forward).
   * - NEVER throws:  a swap that fails is a warning (`E.Warnings`), then a full load of `url`.
   */
  private async load(url: URL, scrollY?: number): Promise<void> {
    const navigation = ++this.navigation
    const page = new URL(url.pathname + url.search, url)
    try {
      await UI.load()
      const { text } = await UI.sources.load(page.href)
      if (navigation !== this.navigation) return
      const parsed = new DOMParser().parseFromString(text, "text/html")
      const main = parsed.querySelector(PAGE_MAIN)
      if (!main) {
        throw new E.SourceError(`SiteRouter.load():  ${page.href} has no ${PAGE_MAIN};  give the page one`, {
          cause: { kind: "render" }
        })
      }
      await Promise.allSettled([...RootLoader.undefinedTags(main)].map((tag) => SiteRouter.loadFamily(tag)))
      if (navigation !== this.navigation) return
      await this.swap(page.href)
      if (navigation !== this.navigation) return
      this.page = url.pathname
      this.shown(parsed.title, url)
      this.land(url, { scrollY })
    } catch (error) {
      E.Warnings.warn("Spell UI site", `couldn't swap in ${url.href};  loading it`, error)
      location.assign(url.href)
    }
  }

  /**
   * Point the include at `href` and wait until its markup is in, inside a View Transition when the browser has them
   * (and motion isn't reduced);  rejects on an include error or a timeout.
   * - The include is made (or re-pointed) INSIDE the transition's callback:  the old page is captured first.
   */
  private async swap(href: string): Promise<void> {
    const point = () => this.point(href)
    const isReduced = matchMedia(REDUCED_MOTION).matches
    if (document.startViewTransition && !isReduced) await document.startViewTransition(point).updateCallbackDone
    else await point()
  }

  /** Point the include at `href` (made on the first swap);  resolves once its markup is in (`inserted()`). */
  private point(href: string): Promise<void> {
    const include = this.ensureInclude(href)
    const inserted = SiteRouter.inserted(include, href)
    if (include.getAttribute("source") !== href) include.setAttribute("source", href)
    return inserted
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
    include.setAttribute("select", PAGE_MAIN)
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
    const main = this.main()
    if (main) SiteRouter.runScripts(main)
    this.followPage()
    // the nav flyout (narrow screens) closes, as a full load would have closed it
    const flyout = document.querySelector<HTMLElement>("ui-flyout#site-nav-flyout")
    if (flyout && !flyout.hidden) flyout.hidden = true
    // `<spell-site-header>` re-draws:  its title and "open in VS Code" link
    document.dispatchEvent(new Event(PAGE_EVENT))
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** The page's `main`, in the layout's content box (or the include in it). */
  private main(): HTMLElement | undefined {
    return this.content.querySelector<HTMLElement>(PAGE_MAIN) ?? undefined
  }

  /** A page of this site:  same origin, under the site root, an `.html` file or a folder, not an asset folder. */
  private isRoutable(url: URL): boolean {
    if (url.origin !== location.origin) return false
    const root = this.siteRoot.pathname
    if (!url.pathname.startsWith(root)) return false
    const rest = url.pathname.slice(root.length)
    if (NOT_PAGES.some((folder) => rest.startsWith(folder))) return false
    return rest === "" || rest.endsWith("/") || rest.endsWith(".html")
  }

  /** `url` is the page shown (maybe another hash):  the browser, the tabs and the toc handle it. */
  private isSamePage(url: URL): boolean {
    return url.pathname === this.page && url.search === location.search
  }

  /** Keep the scroll position in the current history entry, for back / forward. */
  private keepScroll(): void {
    history.replaceState({ ...(history.state as object | null), scrollY }, "")
  }

  /**
   * The page server's file for `url`, from the first page's:  the page's URL and file share their tail
   * (`/ui/components/x.html` <=> `/ui/components/x.html`, the root's `ui` link;  a worktree's on the main
   * server:  `/worktrees/<w>/ui/...` <=> `/.claude/worktrees/<w>/ui/...`).
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
    return RootLoader.loadTag(tag) ?? Promise.resolve()
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

  /** Resolves once `include`'s next markup is in;  rejects on its `ui-error` or after `TIMEOUT_MS`. */
  private static inserted(include: HTMLElement, href: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => done(timedOut()), TIMEOUT_MS)
      include.addEventListener("ui-insert", onInsert)
      include.addEventListener("ui-error", onError)

      /** The include's markup is in:  settle once it has gone in. */
      function onInsert(event: Event) {
        if (event.target === include) queueMicrotask(() => done())
      }

      /** The include failed:  it shows no error (vetoed), the swap rejects with its kind. */
      function onError(event: Event) {
        if (event.target !== include) return
        event.preventDefault()
        const { kind } = (event as CustomEvent<{ kind: E.SourceErrorKind }>).detail
        done(
          new E.SourceError(`SiteRouter.load():  the include couldn't show ${href} (${kind});  loading it in full`, {
            cause: { kind }
          })
        )
      }

      /** The swap took too long. */
      function timedOut() {
        return new E.SourceError(`SiteRouter.load():  ${href} took over ${TIMEOUT_MS} ms;  loading it in full`, {
          cause: { kind: "load" }
        })
      }

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
}

/** What a `SiteRouter` routes:  the site's root, and the layout's box the pages swap in. */
export type SiteRouterProps = {
  /** the site's root URL (`/ui/`) */
  siteRoot: URL
  /** the layout's content box, holding the page's `main` */
  content: HTMLElement
}

/** How `SiteRouter.land()` lands. */
export type LandOptions = {
  /** a scroll position to restore (back / forward) instead of landing on the hash */
  scrollY?: number
  /** the page's first load (see `land()`).  Default:  `false` */
  isFirst?: boolean
}

/** Folders under the site root that hold no pages:  their links load normally. */
const NOT_PAGES = ["_assets/", "_data/", "_parts/", "examples/", "images/"]

/** Dispatched on `document` after a swap (`SiteHeader.PAGE_EVENT`, spelled out:  the header's module is the server's). */
const PAGE_EVENT = "spell-site:page"

/** Give up on a swap that hasn't arrived after this long, ms:  full load instead. */
const TIMEOUT_MS = 10_000

/** Motion is reduced:  no View Transition. */
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

/** The layout's "On this page" toc. */
const SITE_TOC = "ui-docs-toc.site-toc"

/** The toc's tag:  a new one per swap, once defined. */
const TOC_TAG = "ui-docs-toc"

/** Id of a page's tabs, which the toc follows. */
const SITE_TABS_ID = "site-tabs"
