import type { ServerConfig, ServerInfo } from "$/server"
import { EDIT_KEY, FAVICON_SVG, LOGO_MARK, PROPERTIES, THEME_KEY, type SiteProperty } from "$/server/site"

/****************
 * ### `<spell-site-header>`
 * The fixed bar on top of every page of the site -- docs, plan docs, goals, Spell UI docs, the editor -- that
 * switches between them.
 * - In each page and template, right after `<body>`, with `root` = the path from the page to the repo root:
 *   `<spell-site-header root="../.."></spell-site-header>`.  From `file://` its links stay relative;  served by
 *   the page server they're absolute, and server-only properties (Spell UI, App) turn on.
 * - Brand:  the hat mark (`LOGO_MARK`), a link to the docs index.
 * - Also shows:
 *   - the page's place:  `Docs › Unified Server` (the property, then `document.title`)
 *   - the checkout serving it:  `⎇ <worktree or branch>` (served pages only)
 *   - "open in VS Code":  a `vscode://file/...` link to the page's source
 *   - edit mode (pages the page server serves):  hover a section, edit its source in place -- `<spell-section-editor>`
 *   - light / dark / OS:  sets `color-scheme` on `<html>`, which UI's `light-dark()` tokens follow;  remembered
 * - Self-contained:  its own shadow DOM and CSS, no UI elements, so it looks the same on every property.
 * - SIDE EFFECT:  adds a `<style>` to the page:  `--spell-site-header-height`, body padding, scroll padding.
 * - SIDE EFFECT:  adds Spell's favicon (`FAVICON_SVG`, as a `data:` URI) to a page that links no icon:  `file://`
 *   pages, and servers that don't inject one (the page server's `WebServer` does).
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

  /** server info, once known:  injected `SPELL_SERVER`, else `/_server/ping` */
  private info?: Partial<ServerInfo & ServerConfig>

  connectedCallback(): void {
    applyTheme(readTheme())
    installPageStyle()
    installFavicon()
    if (!this.shadowRoot) this.attachShadow({ mode: "open" })
    this.info = serverConfig()
    this.render()
    if (!this.info && location.protocol.startsWith("http")) void this.ping()
  }

  /** path from this page to the repo root, from the `root` attribute (default `.`) */
  get root(): string {
    return (this.getAttribute("root") ?? ".").replace(/\/$/, "")
  }

  /** whether the page came over http (the page server, or a proxy through it) */
  get served(): boolean {
    return location.protocol.startsWith("http")
  }

  /** the URL of `property`'s home, or `undefined` where it can't be reached (server-only, from `file://`) */
  href(property: SiteProperty): string | undefined {
    if (this.served) return property.path.startsWith("/") ? property.path : `/${property.path}`
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
        : `<span class="tab off" title="only when served:  yarn server ensure">${escape(property.name)}</span>`
    }).join("")
    const title = document.title.trim()
    const crumbs = active
      ? `<span class="crumb">${escape(active.name)}</span>${title ? `<span class="sep">›</span><span class="title">${escape(title)}</span>` : ""}`
      : `<span class="title">${escape(title)}</span>`
    const checkout = this.info?.worktree ?? this.info?.branch
    const badge = checkout
      ? `<span class="badge${this.info?.worktree ? " worktree" : ""}" title="${escape(this.info?.root ?? "")}">⎇ ${escape(checkout)}</span>`
      : ""
    const file = this.sourceFile
    const vscode = file
      ? `<a class="tool" href="vscode://file${escape(encodeURI(file))}" title="Open the source in VS Code" aria-label="Open the source in VS Code">${ICONS.code}</a>`
      : ""
    const canEdit = Boolean(serverConfig()?.token)
    const editing = canEdit && readEdit()
    const edit = canEdit
      ? `<button class="tool${editing ? " on" : ""}" data-action="edit" aria-pressed="${editing}" title="Edit sections in place" aria-label="Edit sections in place">${ICONS.pencil}</button>`
      : ""
    const theme = readTheme()
    const themeLabel =
      theme === "dark"
        ? "Dark (click:  follow the OS)"
        : theme === "light"
          ? "Light (click:  dark)"
          : "Following the OS (click:  light)"
    shadow.innerHTML = `<style>${STYLE}</style>
<header part="bar">
  <a class="brand" href="${escape(this.href(PROPERTIES[0]!) ?? "#")}" title="Spell docs" aria-label="Spell docs">${LOGO_MARK}</a>
  <nav aria-label="Site">${tabs}</nav>
  <div class="crumbs">${crumbs}</div>
  ${badge}${edit}${vscode}
  <button class="tool" data-action="theme" title="${themeLabel}" aria-label="${themeLabel}">${ICONS[theme ?? "auto"]}</button>
</header>`
    shadow.querySelector<HTMLButtonElement>(`[data-action="theme"]`)!.onclick = () => this.cycleTheme()
    const editButton = shadow.querySelector<HTMLButtonElement>(`[data-action="edit"]`)
    if (editButton) editButton.onclick = () => this.toggleEdit()
  }

  /** OS -> light -> dark -> OS */
  private cycleTheme(): void {
    const next = { auto: "light", light: "dark", dark: undefined }[readTheme() ?? "auto"] as Theme | undefined
    try {
      if (next) localStorage.setItem(THEME_KEY, next)
      else localStorage.removeItem(THEME_KEY)
    } catch {
      // storage blocked:  this page only
    }
    applyTheme(next)
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
type Theme = "light" | "dark"

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

/** The remembered color scheme. */
function readTheme(): Theme | undefined {
  try {
    const theme = localStorage.getItem(THEME_KEY)
    return theme === "light" || theme === "dark" ? theme : undefined
  } catch {
    return undefined
  }
}

/** Set `color-scheme` on `<html>`;  `undefined`:  back to the page's own (the OS). */
function applyTheme(theme: Theme | undefined): void {
  if (theme) document.documentElement.style.colorScheme = theme
  else document.documentElement.style.removeProperty("color-scheme")
}

/** Add the page-level rules once:  header height, room for the bar, anchors below it. */
function installPageStyle(): void {
  if (document.getElementById("spell-site-header-page")) return
  const style = document.createElement("style")
  style.id = "spell-site-header-page"
  style.textContent = `:root { --spell-site-header-height: ${SiteHeader.height}px; scroll-padding-top: var(--spell-site-header-height); }
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
  dark: svg(`<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>`),
  auto: svg(`<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>`)
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
@media (max-width: 720px) {
  .crumbs { display: none; }
  header { gap: 6px; padding: 0 8px; }
  nav { overflow-x: auto; flex: 1; scrollbar-width: none; }
  .tab { padding: 7px 8px; }
  .badge { display: none; }
}
`
