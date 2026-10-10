import { E, UI } from "$/ui/core"
import {
  DOCS_DARK_QUERY,
  DOCS_DEFAULT_THEME,
  DOCS_LEGACY_SCHEME_KEYS,
  DOCS_LOOK_KEYS,
  DOCS_PLAIN_THEME,
  DOCS_SCHEME_SWITCHING,
  DocsSchemes,
  type DocsLook,
  type DocsScheme,
  type DocsShownScheme
} from "./docs-components.types"

/****************
 * ### `ThemePreference`
 * The docs site viewer's LOOK -- theme (`UI.themes`) and colour scheme --
 * remembered per viewer, re-applied on every page.
 * `<ui-docs-themes>` changes it;  the site entry (`site/_src/site.ts`) calls `restore()` once per page.
 * - Theme:  `DOCS_DEFAULT_THEME` (`spell`, the brand) until the viewer picks another;
 *   picking Plain (our own look, `undefined`) is stored as `DOCS_PLAIN_THEME`, so it outlives the page.
 * - Stored in `localStorage` (`DOCS_LOOK_KEYS`), every access in try/catch:
 *   a private window or blocked storage just forgets between pages.
 *   The look is ALSO kept in memory, so it works for the page either way.
 * - Scheme:  ONE store for every doc site.
 *   - `DOCS_LOOK_KEYS.scheme` is the key `<spell-site-header>` uses on the docs, plan docs and goals (`SCHEME_KEY`),
 *     with the same values (`light` / `dark`, absent:  follow the OS).
 *   - Applied the same way:  `ui-light` / `ui-dark` on `<html>` (UI's tokens and `--ui-scheme` follow)
 *     AND inline `color-scheme` (the site header's own `light-dark()`).
 *   - The old keys (`DOCS_LEGACY_SCHEME_KEYS`) are read once, when the new one is absent.
 *   - For the frame it switches in, `DOCS_SCHEME_SWITCHING` is on `<html>` too:
 *     a theme can turn transitions off under it.
 * - `system` follows the OS:  `shownScheme()` resolves it through `prefers-color-scheme`,
 *   and `subscribe()`d listeners hear when the OS switches (the icon showing the scheme stays right).
 *   Other tabs' switches arrive through `storage` events.
 * - Before first paint:  a module script runs too late,
 *   so pages inline `HEAD_SCRIPT` in `<head>` (the page template, `templates/spell-ui-docs.html`).
 *   - It re-applies the SCHEME synchronously.
 *   - The THEME can't be:  its sheet is a lazy chunk.
 *     `restore()` starts that load as the site bundle evaluates, alongside the families' own chunks,
 *     so it usually lands with their first render;  page text may flash the default look for a frame.
 * - Several pickers on one page (the right column's, a component page's `for` one)
 *   stay in step through `subscribe()`.
 * - Imports the core entry (`UI`, `$/ui/core`), which the site entry loads anyway;
 *   the runtime chunk (`UI.themes`) loads only to apply a theme.
 * - Static only:  the look is one per page.
 ****************/
export class ThemePreference {
  /**
   * Inline `<head>` script re-applying the stored scheme before first paint, as `applyScheme()` does.
   * - The page template (`templates/spell-ui-docs.html`) inlines it, in `<head>` before the stylesheet `<link>`.
   * - ES5, no dependencies, never throws.
   * - Reads the old keys too (`DOCS_LEGACY_SCHEME_KEYS`) while the new one is absent:  `restore()` moves them over.
   */
  static readonly HEAD_SCRIPT =
    `try{var l=localStorage,d=document.documentElement,s=` +
    [DOCS_LOOK_KEYS.scheme, ...DOCS_LEGACY_SCHEME_KEYS].map((key) => `l.getItem(${JSON.stringify(key)})`).join("||") +
    `;if(s==="light"||s==="dark"){d.classList.add("ui-"+s);d.style.colorScheme=s}}catch(e){}`

  /** The look now:  stored on first read, then kept in memory. */
  static get look(): DocsLook {
    return (ThemePreference.current ??= ThemePreference.read())
  }

  /** The scheme the OS asks for (`prefers-color-scheme`);  `light` where there's no `matchMedia` (a server). */
  static osScheme(): DocsShownScheme {
    return typeof matchMedia === "function" && matchMedia(DOCS_DARK_QUERY).matches ? "dark" : "light"
  }

  /** The scheme the page SHOWS:  the chosen one, or while following the OS, the OS's. */
  static shownScheme(scheme: DocsScheme = ThemePreference.look.scheme): DocsShownScheme {
    return scheme === "system" ? ThemePreference.osScheme() : scheme
  }

  /**
   * Choose theme `name` (`undefined` or `""`:  our own look):  remember it, tell subscribers, apply it.
   * - Resolves once its sheets are registered.
   * - An unknown name (a renamed sheet) is forgotten:  the default theme.
   */
  static async setTheme(name: string | undefined): Promise<void> {
    const theme = name || undefined
    ThemePreference.update({ ...ThemePreference.look, theme })
    ThemePreference.store(DOCS_LOOK_KEYS.theme, theme === DOCS_DEFAULT_THEME ? undefined : (theme ?? DOCS_PLAIN_THEME))
    await ThemePreference.applyTheme(theme)
  }

  /** Choose colour scheme `scheme` (`system`:  follow the OS):  remember it, tell subscribers, show it on `<html>`. */
  static setScheme(scheme: DocsScheme): void {
    ThemePreference.update({ ...ThemePreference.look, scheme })
    ThemePreference.store(DOCS_LOOK_KEYS.scheme, scheme === "system" ? undefined : scheme)
    ThemePreference.applyScheme(scheme)
  }

  /** Flip the scheme the page shows, light <-> dark, and remember it (no longer following the OS).  Returns it. */
  static flipScheme(): DocsShownScheme {
    const next = ThemePreference.shownScheme() === "dark" ? "light" : "dark"
    ThemePreference.setScheme(next)
    return next
  }

  /**
   * Show `scheme` on `root` (default `<html>`):
   * its `ui-light` / `ui-dark` class (the other one off) and the same inline `color-scheme`;  `system`:  neither.
   * - SIDE EFFECT:  `DOCS_SCHEME_SWITCHING` on `root` until the frame after next (`withoutTransitions()`).
   */
  static applyScheme(scheme: DocsScheme, root: HTMLElement = document.documentElement): void {
    ThemePreference.withoutTransitions(root)
    root.classList.toggle("ui-light", scheme === "light")
    root.classList.toggle("ui-dark", scheme === "dark")
    if (scheme === "system") root.style.removeProperty("color-scheme")
    else root.style.colorScheme = scheme
  }

  /**
   * Re-apply the stored look:  the scheme at once, the theme once its sheets load.  Call once per page.
   * - SIDE EFFECT:  from then on, follows the OS's scheme and other tabs' switches (`watch()`).
   */
  static async restore(): Promise<void> {
    const { theme, scheme } = ThemePreference.look
    ThemePreference.applyScheme(scheme)
    ThemePreference.watch()
    if (theme !== undefined) await ThemePreference.applyTheme(theme)
  }

  /**
   * Call `listener` with the look on every change --
   * and when the OS switches scheme, since the scheme the page shows changed (`shownScheme()`);
   * returns the unsubscribe.
   * - SIDE EFFECT:  starts watching the OS and other tabs (`watch()`), once.
   */
  static subscribe(listener: (look: DocsLook) => void): () => void {
    ThemePreference.watch()
    ThemePreference.listeners.add(listener)
    return () => {
      ThemePreference.listeners.delete(listener)
    }
  }

  /**
   * The OS switched scheme:  tell listeners, since the scheme the page shows changed while following it.
   * - Called by the `prefers-color-scheme` watch (`watch()`);  public for tests, which can't switch the OS.
   */
  static osChanged(): void {
    ThemePreference.tell(ThemePreference.look)
  }

  /** Forget the in-memory look (tests):  the next read goes back to storage. */
  static reset(): void {
    ThemePreference.current = undefined
  }

  ////////////////
  // ## Internals
  ////////////////

  /** The look in memory;  `undefined` until first read. */
  @E.state private static accessor current: DocsLook | undefined = undefined

  /** `subscribe()`d listeners. */
  private static readonly listeners = new Set<(look: DocsLook) => void>()

  /**
   * Once per page:
   * - tell listeners when the OS switches scheme (the shown scheme changed while following it)
   * - take other tabs' scheme switches (`storage`):  applied here too
   * - page-wide for the page's life:  nothing to undo
   */
  @E.once private static watch(): void {
    if (typeof window === "undefined") return
    matchMedia(DOCS_DARK_QUERY).addEventListener("change", () => ThemePreference.osChanged())
    window.addEventListener("storage", (event) => {
      if (event.key !== DOCS_LOOK_KEYS.scheme && event.key !== null) return
      const scheme = ThemePreference.read().scheme
      ThemePreference.update({ ...ThemePreference.look, scheme })
      ThemePreference.applyScheme(scheme)
    })
  }

  /**
   * Put `DOCS_SCHEME_SWITCHING` on `root` until the frame after next:
   * the first frame paints the new scheme with transitions off, the second turns them back on.
   * - A second switch meanwhile just ends it a frame early.
   */
  private static withoutTransitions(root: Element): void {
    if (typeof requestAnimationFrame !== "function") return
    root.classList.add(DOCS_SCHEME_SWITCHING)
    E.beforeNextPaint(() => E.beforeNextPaint(() => root.classList.remove(DOCS_SCHEME_SWITCHING)))
  }

  /** Set the look in memory and tell subscribers, if it changed. */
  private static update(look: DocsLook): void {
    const old = ThemePreference.look
    ThemePreference.current = look
    if (old.theme === look.theme && old.scheme === look.scheme) return
    ThemePreference.tell(look)
  }

  /** Call every listener with `look`. */
  private static tell(look: DocsLook): void {
    for (const listener of [...ThemePreference.listeners]) listener(look)
  }

  /**
   * Apply theme `name` with `UI.themes` (the runtime loaded now, if need be).
   * - Only a picker's names:  one of ours (`UI.themes.own`), `classic` or a Fomantic theme (`UI.themes.names`);
   *   anything else is forgotten, for the default theme.
   */
  private static async applyTheme(name: string | undefined): Promise<void> {
    const { themes } = await UI.load()
    const known = [...themes.own, themes.base, ...themes.names]
    if (name !== undefined && !known.includes(name)) {
      return ThemePreference.setTheme(name === DOCS_DEFAULT_THEME ? undefined : DOCS_DEFAULT_THEME)
    }
    await themes.apply(name)
  }

  /** The stored look;  anything unreadable is the default (`DOCS_DEFAULT_THEME`, `system`). */
  private static read(): DocsLook {
    const scheme = (ThemePreference.load(DOCS_LOOK_KEYS.scheme) ?? ThemePreference.migrateScheme()) as
      | DocsScheme
      | undefined
    const theme = ThemePreference.load(DOCS_LOOK_KEYS.theme) || DOCS_DEFAULT_THEME
    return {
      theme: theme === DOCS_PLAIN_THEME ? undefined : theme,
      scheme: scheme && scheme !== "system" && DocsSchemes.includes(scheme) ? scheme : "system"
    }
  }

  /**
   * Move the scheme from its old keys (`DOCS_LEGACY_SCHEME_KEYS`), while the new one is absent:
   * the first valid one is copied to `DOCS_LOOK_KEYS.scheme`, and every old key removed, so this runs once.
   * - Returns the scheme.
   * - The same steps as `<spell-site-header>`'s:  whichever site the viewer opens first moves it.
   */
  private static migrateScheme(): string | undefined {
    const found = DOCS_LEGACY_SCHEME_KEYS.map((key) => ThemePreference.load(key)).find(
      (value) => value === "light" || value === "dark"
    )
    if (found) ThemePreference.store(DOCS_LOOK_KEYS.scheme, found)
    for (const key of DOCS_LEGACY_SCHEME_KEYS) ThemePreference.store(key, undefined)
    return found
  }

  /** `localStorage[key]`, or `undefined` (absent, or storage blocked). */
  private static load(key: string): string | undefined {
    try {
      return globalThis.localStorage?.getItem(key) ?? undefined
    } catch {
      return undefined
    }
  }

  /** Write `value` under `key` (`undefined`:  remove it);  storage blocked:  nothing. */
  private static store(key: string, value: string | undefined): void {
    try {
      if (value === undefined) globalThis.localStorage?.removeItem(key)
      else globalThis.localStorage?.setItem(key, value)
    } catch {
      // private window / blocked storage:  the look still holds for this page, in memory
    }
  }
}
