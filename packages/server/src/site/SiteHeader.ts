import type { ServerConfig, ServerInfo } from "$/server"
import {
  DARK_QUERY,
  EDIT_KEY,
  FAVICON_SVG,
  forcedScheme,
  LEGACY_SCHEME_KEYS,
  LOGO_MARK,
  PROPERTIES,
  SCHEME_CLASSES,
  SCHEME_KEY,
  SITE_HOME,
  type SiteProperty,
  type SiteScheme
} from "$/server/site"

/****************
 * ### `<spell-site-header>`
 * The fixed bar on top of every page of the site, with a tab to switch to each of its parts:
 * docs, plan docs, goals, Spell UI docs, the editor.
 * Each part is a PROPERTY (`SiteProperty`, `PROPERTIES`):  a part with its own home page.
 * - In each page and template, right after `<body>`, with `root` = the path from the page to the repo root:
 *   `<spell-site-header root="../.."></spell-site-header>`.
 *   - from `file://`:  its links stay relative
 *   - served by the page server:  they're absolute, and server-only properties (Spell UI, App) turn on
 * - Brand:  the hat mark (`LOGO_MARK`), a link to the docs home (`SITE_HOME`), which lights no tab.
 * - Also shows:
 *   - the page's place:  `Guides › Unified Server` (the property, a link to its home, then `document.title`;  the home:
 *     its title)
 *   - narrow (720px or less:  VS Code's side bar, a phone):  those crumbs IN PLACE of the tabs (Owen, 2026-10-10:
 *     "instead of keeping 'Guides', you could keep the breadcrumb, saves space on smaller screen");  the hat goes
 *     home, the property's crumb to its home.  The pages' own eyebrow crumbs hide at that width
 *   - the checkout serving it:  `⎇ <worktree or branch>` (served pages only)
 *   - "open in VS Code":  a `vscode://file/...` link to the page's source
 *   - edit mode (pages the page server serves):  hover a section, edit its source in place -- `<spell-section-editor>`
 *   - neither in a FRAME (VS Code's side bar):  they do nothing there
 *   - light / dark:  ONE button showing the scheme the page shows (sun / moon);  a click flips it
 *     - until the first click, it follows the OS
 *     - flipping BACK to the OS's own scheme follows the OS again, so two clicks always undo one (`flipTheme()`)
 *     - stored under `SCHEME_KEY`, the one key every doc site shares (Spell UI's `ThemePreference` too)
 *     - applied as `ui-light` / `ui-dark` on `<html>` (UI's tokens, `--ui-scheme`)
 *       AND as inline `color-scheme` (pages without UI's sheets, and this bar's own `light-dark()`)
 *     - follows the OS while it changes, and other tabs' switches (`storage`)
 *   - the icon shows what `<html>` shows:  a page that switches its own scheme
 *     (toggles `ui-light` / `ui-dark`, as Spell App's pill does) re-draws it too,
 *     through a `MutationObserver` on `<html>`'s class;  a click then flips from what the page shows
 * - Self-contained:  its own shadow DOM and CSS, no UI elements, so it looks the same on every property.
 * - `docked`:  a compact row in place, not a fixed bar, inside the page's own chrome
 *   (the Spell UI site's side column and top bar)
 *   - no crumbs (the page shows its own title)
 *   - no light / dark button (the page has its own)
 *   - no room kept on the page (`--spell-site-header-height` is 0)
 * - Re-draws on `spell-site:page` (a router swapped the page in place:  new title, new source file).
 * - SIDE EFFECT:  adds a `<style>` to the page:  `--spell-site-header-height`, body padding, scroll padding.
 * - SIDE EFFECT:  adds Spell's favicon (`FAVICON_SVG`, as a `data:` URI) to a page that links no icon:
 *   `file://` pages, and servers that don't inject one (the page server's `WebServer` does).
 ****************/
export class SiteHeader extends HTMLElement {
  /** the tag */
  static readonly tag = "spell-site-header"

  /** height of the bar, px:  also `--spell-site-header-height` */
  static readonly height = 44

  /** define the element, once */
  static define(): void {
    if (!customElements.get(SiteHeader.tag)) customElements.define(SiteHeader.tag, SiteHeader)
  }

  /** event a router dispatches on `document` after swapping the page in place:  re-draw */
  static readonly PAGE_EVENT = "spell-site:page"

  /** server info, once known:  injected `SPELL_SERVER`, else `/_server/ping` */
  private info?: Partial<ServerInfo & ServerConfig>

  /** re-draw on `PAGE_EVENT` */
  private readonly onPage = () => this.render()

  /** the OS's scheme, watched while connected:  the button shows it while following the OS */
  private readonly osDark = matchMedia(DARK_QUERY)

  /** the OS switched scheme:  re-draw (the button shows the scheme the page shows) */
  private readonly onOsScheme = () => this.render()

  /** another tab switched the scheme:  apply it here too, and re-draw */
  private readonly onStorage = (event: StorageEvent) => {
    if (event.key !== SCHEME_KEY && event.key !== null) return
    applyTheme(readTheme())
    this.render()
  }

  /** the scheme the icon shows now, so `<html>` class changes that keep it re-draw nothing */
  private drawnTheme?: Theme

  /** watches `<html>`'s class while connected:  a page that switches its own scheme */
  private readonly pageScheme = new MutationObserver(() => {
    if (this.shownTheme() !== this.drawnTheme) this.render()
  })

  connectedCallback(): void {
    applyTheme(readTheme())
    installPageStyle(this.docked)
    installFavicon()
    if (!this.shadowRoot) this.attachShadow({ mode: "open" })
    this.info = serverConfig()
    this.render()
    document.addEventListener(SiteHeader.PAGE_EVENT, this.onPage)
    this.osDark.addEventListener("change", this.onOsScheme)
    window.addEventListener("storage", this.onStorage)
    this.pageScheme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    if (!this.info && location.protocol.startsWith("http")) void this.ping()
  }

  disconnectedCallback(): void {
    document.removeEventListener(SiteHeader.PAGE_EVENT, this.onPage)
    this.osDark.removeEventListener("change", this.onOsScheme)
    window.removeEventListener("storage", this.onStorage)
    this.pageScheme.disconnect()
  }

  /** a compact row inside the page's own chrome, not the fixed bar (the `docked` attribute) */
  get docked(): boolean {
    return this.hasAttribute("docked")
  }

  /** path from this page to the repo root, from the `root` attribute (default `.`) */
  get root(): string {
    return (this.getAttribute("root") ?? ".").replace(/\/$/, "")
  }

  /** whether the page came over http (the page server, or a proxy through it) */
  get served(): boolean {
    return location.protocol.startsWith("http")
  }

  /**
   * The URL of `property`'s home (or the site's, `SITE_HOME`), or `undefined` where it can't be reached
   * (server-only, from `file://`).
   * - A worktree's page on the main checkout's server (`/worktrees/<w>/...`) keeps that prefix on repo paths,
   *   so a tab stays in the worktree:  a property only the branch has (Brand, before it merges) is a 404 on `main`.
   * - A server route (`/ui/`, `/editor/`) is the server's own:  never prefixed.
   */
  href(property: Pick<SiteProperty, "path" | "serverOnly">): string | undefined {
    if (this.served) {
      if (property.path.startsWith("/")) return property.path
      const worktree = /^\/worktrees\/[^/]+\//.exec(location.pathname)?.[0] ?? "/"
      return `${worktree}${property.path}`
    }
    if (property.serverOnly) return undefined
    return `${this.root}/${property.path}`
  }

  /** absolute path of the page's source file, for VS Code;  `undefined` when unknown (a proxied page) */
  get sourceFile(): string | undefined {
    if (location.protocol === "file:") return decodeURIComponent(location.pathname)
    const config = serverConfig()
    if (config?.root && config.file) return config.root + decodeURIComponent(config.file)
    return undefined
  }

  /** draw the bar */
  render(): void {
    const shadow = this.shadowRoot!
    const path = location.pathname
    const active = PROPERTIES.find((property) => property.match(path))
    const tabs = PROPERTIES.map((property) => {
      const href = this.href(property)
      const current = property === active ? ` aria-current="page"` : ""
      // its own tab:  `target` in a browser;  `data-spell-open` tells the side bar's frame (`liveClient.ts`)
      const own = property.ownTab
        ? ` target="spell-${escape(property.name.toLowerCase())}" data-spell-open="browser"`
        : ""
      return href
        ? `<a class="tab" href="${escape(href)}"${current}${own}>${escape(property.name)}</a>`
        : `<span class="tab off" title="only when served:  spell dev server ensure">${escape(property.name)}</span>`
    }).join("")
    const title = document.title.trim()
    // the property a link to its home, where it can be reached:  narrow, the crumbs stand in for the tabs
    const home = active && this.href(active)
    const crumb = active
      ? home
        ? `<a class="crumb" href="${escape(home)}">${escape(active.name)}</a>`
        : `<span class="crumb">${escape(active.name)}</span>`
      : ""
    const crumbs = active
      ? `${crumb}${title ? `<span class="sep">›</span><span class="title">${escape(title)}</span>` : ""}`
      : `<span class="title">${escape(title)}</span>`
    const checkout = this.info?.worktree ?? this.info?.branch
    const badge = checkout
      ? `<span class="badge${this.info?.worktree ? " worktree" : ""}" title="${escape(this.info?.root ?? "")}">⎇ ${escape(checkout)}</span>`
      : ""
    // framed (VS Code's side bar):  no "open in VS Code" (a framed page can't follow a `vscode://` link) and no edit
    // mode -- they did nothing there (Owen, 2026-10-08);  a browser tab keeps both
    const framed = window.self !== window.top
    const file = framed ? undefined : this.sourceFile
    const vscode = file
      ? `<a class="tool" href="vscode://file${escape(encodeURI(file))}" title="Open the source in VS Code" aria-label="Open the source in VS Code">${ICONS.code}</a>`
      : ""
    const canEdit = !framed && Boolean(serverConfig()?.token)
    const editing = canEdit && readEdit()
    const edit = canEdit
      ? `<button class="tool${editing ? " on" : ""}" data-action="edit" aria-pressed="${editing}" title="Edit sections in place" aria-label="Edit sections in place">${ICONS.pencil}</button>`
      : ""
    const shown = this.shownTheme()
    this.drawnTheme = shown
    const themeLabel = this.themeLabel()
    shadow.innerHTML = `<style>${STYLE}</style>
<header part="bar">
  <a class="brand" href="${escape(this.href({ path: SITE_HOME }) ?? "#")}" title="Spell docs" aria-label="Spell docs">${LOGO_MARK}</a>
  <nav aria-label="Site">${tabs}</nav>
  <div class="crumbs">${crumbs}</div>
  ${badge}${edit}${vscode}
  ${this.docked ? "" : `<button class="tool" data-action="theme" title="${themeLabel}" aria-label="${themeLabel}">${ICONS[shown]}</button>`}
</header>`
    const themeButton = shadow.querySelector<HTMLButtonElement>(`[data-action="theme"]`)
    if (themeButton) themeButton.onclick = () => this.flipTheme()
    const editButton = shadow.querySelector<HTMLButtonElement>(`[data-action="edit"]`)
    if (editButton) editButton.onclick = () => this.toggleEdit()
  }

  /** the scheme the OS asks for */
  private osTheme(): Theme {
    return this.osDark.matches ? "dark" : "light"
  }

  /** the scheme the page shows:  what `<html>`'s classes force (this bar's choice, or the page's own), else the OS's */
  private shownTheme(): Theme {
    return forcedScheme(document.documentElement.classList) ?? readTheme() ?? this.osTheme()
  }

  /**
   * The theme button's name:  what the page shows, and what a click does.
   * - `Dark, as the OS (click:  light)` while following the OS
   * - `Light (click:  dark, as the OS)` when a click goes back to following it
   */
  private themeLabel(): string {
    const chosen = readTheme()
    const os = this.osTheme()
    const shown = this.shownTheme()
    const next = shown === "dark" ? "light" : "dark"
    const name = { light: "Light", dark: "Dark" }[shown]
    if (!chosen && shown === os) return `${name}, as the OS (click:  ${next})`
    return `${name} (click:  ${next}${next === os ? ", as the OS" : ""})`
  }

  /**
   * Flip the scheme the page shows (`<html>`'s, which a page may have switched itself):  light <-> dark.
   * - Landing on the OS's own scheme FORGETS the choice:  the page follows the OS again.
   * - Why:  the one way back to the OS without an extra state.
   *   - a bar has no room for Spell UI's "Match system" switch
   *   - a third "auto" state on one button makes every other click look like it did nothing
   */
  private flipTheme(): void {
    const next: Theme = this.shownTheme() === "dark" ? "light" : "dark"
    const stored = next === this.osTheme() ? undefined : next
    themeFallback = stored
    try {
      if (stored) localStorage.setItem(SCHEME_KEY, stored)
      else localStorage.removeItem(SCHEME_KEY)
    } catch {
      // storage blocked:  this page only (`themeFallback`)
    }
    applyTheme(stored)
    this.render()
  }

  /** edit mode on / off, for this tab;  tells `<spell-section-editor>` */
  private toggleEdit(): void {
    const on = !readEdit()
    try {
      if (on) sessionStorage.setItem(EDIT_KEY, "1")
      else sessionStorage.removeItem(EDIT_KEY)
    } catch {
      // storage blocked:  until reload
    }
    editFallback = on
    document.dispatchEvent(new CustomEvent("spell-site:edit", { detail: { on } }))
    this.render()
  }

  /** ask the server who it is, for the badge (pages it proxies have no `SPELL_SERVER`) */
  private async ping(): Promise<void> {
    try {
      const answer = await fetch("/_server/ping")
      if (!answer.ok) return
      this.info = (await answer.json()) as ServerInfo
      this.render()
    } catch {
      // not the page server
    }
  }
}

/** A chosen color scheme;  `undefined` follows the OS. */
type Theme = SiteScheme

/** The chosen scheme when storage is blocked:  this page only. */
let themeFallback: Theme | undefined

/** Edit mode when storage is blocked. */
let editFallback = false

/** The page's `window.SPELL_SERVER`, if the page server injected one. */
export function serverConfig(): ServerConfig | undefined {
  return (window as unknown as { SPELL_SERVER?: ServerConfig }).SPELL_SERVER
}

/** Whether edit mode is on in this tab. */
export function readEdit(): boolean {
  try {
    return sessionStorage.getItem(EDIT_KEY) === "1"
  } catch {
    return editFallback
  }
}

/**
 * The remembered color scheme;  `undefined`:  follow the OS.
 * - SIDE EFFECT:  while `SCHEME_KEY` is absent, moves an old key's scheme over (`migrateTheme()`).
 */
function readTheme(): Theme | undefined {
  try {
    const theme = localStorage.getItem(SCHEME_KEY) ?? migrateTheme(localStorage)
    return theme === "light" || theme === "dark" ? theme : undefined
  } catch {
    return themeFallback
  }
}

/**
 * Move the scheme from the keys it lived under before `SCHEME_KEY` (`LEGACY_SCHEME_KEYS`).
 * Returns the scheme, else `null`.
 * - the first valid one is copied to `SCHEME_KEY`, and every old key removed, so this runs once
 * - the same steps as Spell UI's `ThemePreference`:  whichever site the viewer opens first moves it
 */
function migrateTheme(storage: Storage): string | null {
  const found = LEGACY_SCHEME_KEYS.map((key) => storage.getItem(key)).find(
    (value) => value === "light" || value === "dark"
  )
  if (found) storage.setItem(SCHEME_KEY, found)
  for (const key of LEGACY_SCHEME_KEYS) storage.removeItem(key)
  return found ?? null
}

/**
 * Show `theme` on the page;  `undefined`:  back to the page's own (the OS).
 * - `ui-light` / `ui-dark` on `<html>`, as Spell UI's `ThemePreference` does:  UI's tokens and `--ui-scheme` follow
 * - AND inline `color-scheme`:  pages without UI's sheets (goals), and this bar's `light-dark()`
 */
function applyTheme(theme: Theme | undefined): void {
  const root = document.documentElement
  root.classList.toggle(SCHEME_CLASSES.light, theme === "light")
  root.classList.toggle(SCHEME_CLASSES.dark, theme === "dark")
  if (theme) root.style.colorScheme = theme
  else root.style.removeProperty("color-scheme")
}

/**
 * Add the page-level rules once:  header height, room for the bar, anchors below it.
 * - `docked`:  no fixed bar, so no room:  the height is 0
 * - a page holding both a fixed and a docked header keeps the first one's rules
 */
function installPageStyle(docked: boolean): void {
  if (document.getElementById("spell-site-header-page")) return
  const style = document.createElement("style")
  style.id = "spell-site-header-page"
  const height = docked ? 0 : SiteHeader.height
  style.textContent = `:root { --spell-site-header-height: ${height}px; scroll-padding-top: var(--spell-site-header-height); }
html body { padding-top: var(--spell-site-header-height); }`
  document.head.append(style)
}

/** Add Spell's favicon, as a `data:` URI, unless the page already links an icon (e.g. the page server's). */
function installFavicon(): void {
  if (document.head.querySelector(`link[rel~="icon" i]`)) return
  const link = document.createElement("link")
  link.rel = "icon"
  link.type = "image/svg+xml"
  link.href = `data:image/svg+xml,${encodeURIComponent(FAVICON_SVG)}`
  document.head.append(link)
}

/** `text` safe in HTML text and attributes. */
function escape(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)
}

/** Inline icons:  24-unit stroke SVGs, `currentColor`. */
const ICONS: Record<string, string> = {
  code: svg(`<path d="M8 6 2 12l6 6M16 6l6 6-6 6"/>`),
  pencil: svg(`<path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"/>`),
  light: svg(
    `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>`
  ),
  dark: svg(`<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>`)
}

/** An icon from SVG `body`. */
function svg(body: string): string {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
}

/** The bar's look:  follows the page's `color-scheme` through `light-dark()`. */
const STYLE = `
:host { display: block; }
header {
  box-sizing: border-box;
  position: fixed; inset: 0 0 auto 0; z-index: 1000; height: ${SiteHeader.height}px;
  display: flex; align-items: center; gap: 12px; padding: 0 16px;
  font: 500 14px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  color: light-dark(#1d1d22, #ececf1);
  background: light-dark(rgb(255 255 255 / 0.86), rgb(24 24 28 / 0.86));
  backdrop-filter: saturate(1.4) blur(10px); -webkit-backdrop-filter: saturate(1.4) blur(10px);
  border-bottom: 1px solid light-dark(#e3e0d8, #34343b);
}
a { color: inherit; text-decoration: none; }
.brand { flex: none; display: inline-flex; align-items: center; color: light-dark(#5b3fd0, #b3a2ff); }
.brand svg { display: block; height: 26px; width: auto; }
nav { display: flex; gap: 2px; }
.tab { padding: 7px 10px; border-radius: 999px; color: light-dark(#55555f, #a9a9b6); white-space: nowrap; }
.tab:hover { background: light-dark(#f0eef8, #2c2a38); color: inherit; }
.tab[aria-current="page"] { background: light-dark(#e9e4ff, #33295e); color: light-dark(#3d2a9e, #d9d0ff); }
.tab.off { opacity: 0.45; cursor: default; }
.tab.off:hover { background: none; color: light-dark(#55555f, #a9a9b6); }
.crumbs { flex: 1; min-width: 0; display: flex; gap: 6px; overflow: hidden; color: light-dark(#6b6b76, #9a9aa6); }
.crumbs > * { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.crumb { flex: none; }
.title { color: inherit; font-weight: 600; color: light-dark(#1d1d22, #ececf1); }
.sep { flex: none; opacity: 0.6; }
.badge { flex: none; padding: 4px 9px; border-radius: 999px; font-size: 12px; background: light-dark(#eef0f3, #2a2d33); }
.badge.worktree { background: light-dark(#fff1d6, #4a3610); color: light-dark(#7a4c00, #ffd48a); }
.tool {
  flex: none; display: inline-grid; place-items: center; width: 30px; height: 30px; padding: 0;
  border: 0; border-radius: 999px; background: none; color: light-dark(#55555f, #a9a9b6); cursor: pointer;
}
.tool:hover { background: light-dark(#f0eef8, #2c2a38); color: inherit; }
.tool.on { background: light-dark(#e9e4ff, #33295e); color: light-dark(#3d2a9e, #d9d0ff); }
.tool:focus-visible, .tab:focus-visible, .brand:focus-visible { outline: 2px solid light-dark(#5b3fd0, #b3a2ff); outline-offset: 2px; }
/* docked:  a compact row in the page's own chrome */
:host([docked]) header {
  position: static; height: auto; flex-wrap: wrap; gap: 4px 6px; padding: 0;
  font-size: 13px; background: none; border: 0; backdrop-filter: none; -webkit-backdrop-filter: none;
}
:host([docked]) .crumbs { display: none; }
:host([docked]) nav { flex-wrap: wrap; }
:host([docked]) .brand svg { height: 20px; }
:host([docked]) .tab { padding: 5px 8px; }
:host([docked]) .tool { width: 26px; height: 26px; }
:host([docked]) .tool svg { width: 16px; height: 16px; }
a.crumb:hover { color: light-dark(#3d2a9e, #d9d0ff); text-decoration: underline; }
/* narrow (VS Code's side bar, a phone):  the crumbs in place of the tabs (Owen, 2026-10-10:  "instead of keeping
   'Guides', you could keep the breadcrumb, saves space on smaller screen");  the pages' own eyebrow crumbs hide at the
   same width (spell-doc.css, <epic-page>'s Crumbs.css).  Docked, the tabs stay:  it has no crumbs */
@media (max-width: 720px) {
  header { gap: 6px; padding: 0 8px; }
  :host(:not([docked])) nav { display: none; }
  .crumbs { padding-inline-start: 4px; }
  .badge { display: none; }
}
`
