import {
  DOCS_DEFAULT_THEME,
  DOCS_LOOK_KEYS,
  DOCS_PLAIN_THEME,
  DOCS_SCHEME_SWITCHING,
  DOCS_SCHEMES,
  type DocsLook,
  type DocsScheme
} from "./docs-components.types"

/****************
 * ### `ThemePreference`
 * The docs site viewer's LOOK -- theme (`ThemeSheets`) and colour scheme -- remembered per viewer, re-applied on
 * every page.  `<ui-docs-themes>` changes it;  the site entry (`site/_src/site.ts`) calls `restore()` once per page.
 * - Theme:  `DOCS_DEFAULT_THEME` (`spell`, the brand) until the viewer picks another;  picking Plain (our own look,
 *   `undefined`) is stored as `DOCS_PLAIN_THEME`, so it outlives the page.
 * - Stored in `localStorage` (`DOCS_LOOK_KEYS`), every access in try/catch:  a private window or blocked storage
 *   just forgets between pages.  The look is ALSO kept in memory, so it works for the page either way.
 * - Scheme:  `ui-light` / `ui-dark` on `<html>` (`system`:  neither), as the Astro site did, with its key.  For the
 *   frame it switches in, `DOCS_SCHEME_SWITCHING` is on `<html>` too:  a theme can turn transitions off under it.
 * - Before first paint:  a module script runs too late, so pages inline `HEAD_SCRIPT` in `<head>` (P3's template):
 *   it re-applies the SCHEME synchronously.  The THEME can't be:  its sheet is a lazy chunk.  `restore()` starts that
 *   load as the site bundle evaluates, alongside the families' own chunks, so it usually lands with their first
 *   render;  page text may flash the default look for a frame.
 * - Several pickers on one page (the header's, a component page's `for` one) stay in step through `subscribe()`.
 * - Cheap to import:  `$/ui/styles` (`ThemeSheets`, every foundation sheet as text) is a DYNAMIC import, loaded only
 *   to apply a theme;  the site entry's chunk stays small.
 * - Static only:  the look is one per page.
 ****************/
export class ThemePreference {
  /**
   * Inline `<head>` script re-applying the stored scheme before first paint;  P3's page template inlines it, in
   * `<head>` before the stylesheet `<link>`.  ES5, no dependencies, never throws.
   */
  static readonly HEAD_SCRIPT =
    `try{var s=localStorage.getItem(${JSON.stringify(DOCS_LOOK_KEYS.scheme)});` +
    `if(s==="light"||s==="dark")document.documentElement.classList.add("ui-"+s)}catch(e){}`

  /** The look now:  stored on first read, then kept in memory. */
  static get look(): DocsLook {
    return (ThemePreference.state ??= ThemePreference.read())
  }

  /**
   * Choose theme `name` (`undefined` or `""`:  our own look):  remember it, tell subscribers, apply it.
   * - Resolves once its sheets are registered.  An unknown name (a renamed sheet) is forgotten:  the default theme.
   */
  static async setTheme(name: string | undefined): Promise<void> {
    const theme = name || undefined
    ThemePreference.update({ ...ThemePreference.look, theme })
    ThemePreference.store(DOCS_LOOK_KEYS.theme, theme === DOCS_DEFAULT_THEME ? undefined : (theme ?? DOCS_PLAIN_THEME))
    await ThemePreference.applyTheme(theme)
  }

  /** Choose colour scheme `scheme`:  remember it, tell subscribers, put its class on `<html>`. */
  static setScheme(scheme: DocsScheme): void {
    ThemePreference.update({ ...ThemePreference.look, scheme })
    ThemePreference.store(DOCS_LOOK_KEYS.scheme, scheme === "system" ? undefined : scheme)
    ThemePreference.applyScheme(scheme)
  }

  /**
   * Put `scheme`'s class on `root` (default `<html>`), and take the other one off.
   * - SIDE EFFECT:  `DOCS_SCHEME_SWITCHING` on `root` until the frame after next (`withoutTransitions()`).
   */
  static applyScheme(scheme: DocsScheme, root: Element = document.documentElement): void {
    ThemePreference.withoutTransitions(root)
    root.classList.toggle("ui-light", scheme === "light")
    root.classList.toggle("ui-dark", scheme === "dark")
  }

  /** Re-apply the stored look:  the scheme at once, the theme once its sheets load.  Call once per page. */
  static async restore(): Promise<void> {
    const { theme, scheme } = ThemePreference.look
    ThemePreference.applyScheme(scheme)
    if (theme !== undefined) await ThemePreference.applyTheme(theme)
  }

  /** Call `listener` with the new look on every change;  returns the unsubscribe. */
  static subscribe(listener: (look: DocsLook) => void): () => void {
    ThemePreference.listeners.add(listener)
    return () => {
      ThemePreference.listeners.delete(listener)
    }
  }

  /** Forget the in-memory look (tests):  the next read goes back to storage. */
  static reset(): void {
    ThemePreference.state = undefined
  }

  ////////////////
  // ## Internals
  ////////////////

  /** The look in memory;  `undefined` until first read. */
  private static state: DocsLook | undefined

  /** `subscribe()`d listeners. */
  private static readonly listeners = new Set<(look: DocsLook) => void>()

  /**
   * Put `DOCS_SCHEME_SWITCHING` on `root` until the frame after next:  the first frame paints the new scheme with
   * transitions off, the second turns them back on.  A second switch meanwhile just ends it a frame early.
   */
  private static withoutTransitions(root: Element): void {
    if (typeof requestAnimationFrame !== "function") return
    root.classList.add(DOCS_SCHEME_SWITCHING)
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove(DOCS_SCHEME_SWITCHING)))
  }

  /** Set the look in memory and tell subscribers, if it changed. */
  private static update(look: DocsLook): void {
    const old = ThemePreference.look
    ThemePreference.state = look
    if (old.theme === look.theme && old.scheme === look.scheme) return
    for (const listener of [...ThemePreference.listeners]) listener(look)
  }

  /**
   * Apply theme `name` with `ThemeSheets` (loaded now, if need be).
   * - Only a picker's names:  one of ours (`ThemeSheets.OWN`), `classic` or a Fomantic theme (`ThemeSheets.names`);
   *   anything else is forgotten, for the default theme.
   */
  private static async applyTheme(name: string | undefined): Promise<void> {
    const { ThemeSheets } = await import("$/ui/styles")
    const known = [...ThemeSheets.OWN, ThemeSheets.BASE, ...ThemeSheets.names]
    if (name !== undefined && !known.includes(name)) {
      return ThemePreference.setTheme(name === DOCS_DEFAULT_THEME ? undefined : DOCS_DEFAULT_THEME)
    }
    await ThemeSheets.apply(name)
  }

  /** The stored look;  anything unreadable is the default (`DOCS_DEFAULT_THEME`, `system`). */
  private static read(): DocsLook {
    const scheme = ThemePreference.load(DOCS_LOOK_KEYS.scheme) as DocsScheme | undefined
    const theme = ThemePreference.load(DOCS_LOOK_KEYS.theme) || DOCS_DEFAULT_THEME
    return {
      theme: theme === DOCS_PLAIN_THEME ? undefined : theme,
      scheme: scheme && DOCS_SCHEMES.includes(scheme) ? scheme : "system"
    }
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
