import { monaco } from "spell-app/app/ui/monaco/monaco"
import { ShadesOfPurple } from "./ShadesOfPurple"

/****************
 * ### `CodeThemes`
 * The code's colours in every Monaco editor on the page:  Purple (`ShadesOfPurple`), light or dark as the PAGE is.
 * - Purple is the code's colours only (epic `debut` Q12):  the page's own theme (Fruity, Spell Brand ...) never
 *   changes them, and they sit beside any page theme.
 * - Light or dark follows the page, as Spell UI's themes read it:
 *   - `<html>` with `ui-dark` / `ui-light` (what a theme menu sets, `ThemePreference.applyScheme()`):  that one
 *   - neither:  the OS's (`prefers-color-scheme`)
 *   - so the editor app, a docs page and another page holding a `<spell-editor>` all work, with no import of the
 *     page's own theme code
 * - Monaco has ONE theme per page:  every editor follows at once.
 * - `register()` once, before the first editor:  `SpellMonaco.register()` does.
 ****************/
export class CodeThemes {
  /** The theme's name for the page's scheme now:  `ShadesOfPurple.DARK` or `.LIGHT`. */
  static get current(): string {
    return CodeThemes.isPageDark() ? ShadesOfPurple.DARK : ShadesOfPurple.LIGHT
  }

  /**
   * Define Purple's two themes with Monaco, apply the one for the page now, and follow the page from then on.
   * - SIDE EFFECTS:  watches `<html>`'s classes and the OS's scheme, for the page's life.
   * - Called again:  does nothing.
   */
  static register(): void {
    if (CodeThemes.isRegistered) return
    CodeThemes.isRegistered = true
    monaco.editor.defineTheme(ShadesOfPurple.DARK, ShadesOfPurple.dark)
    monaco.editor.defineTheme(ShadesOfPurple.LIGHT, ShadesOfPurple.light)
    CodeThemes.apply()
    if (typeof document === "undefined") return
    new MutationObserver(() => CodeThemes.apply()).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })
    matchMedia(DARK_QUERY).addEventListener("change", () => CodeThemes.apply())
  }

  /** Is the page dark?  `<html>`'s `ui-dark` / `ui-light`, else the OS's scheme. */
  static isPageDark(): boolean {
    if (typeof document === "undefined") return false
    const { classList } = document.documentElement
    if (classList.contains(DARK_CLASS)) return true
    if (classList.contains(LIGHT_CLASS)) return false
    return typeof matchMedia === "function" && matchMedia(DARK_QUERY).matches
  }

  /** Set Monaco's theme for the page's scheme, if it changed. */
  private static apply(): void {
    const theme = CodeThemes.current
    if (theme === CodeThemes.applied) return
    CodeThemes.applied = theme
    monaco.editor.setTheme(theme)
  }

  /** `register()` ran. */
  private static isRegistered = false

  /** The theme last set. */
  private static applied: string | undefined
}

/** `<html>`'s class for a page shown dark, as Spell UI's themes read it. */
const DARK_CLASS = "ui-dark"

/** `<html>`'s class for a page shown light. */
const LIGHT_CLASS = "ui-light"

/** Media query of the OS's dark scheme. */
const DARK_QUERY = "(prefers-color-scheme: dark)"
