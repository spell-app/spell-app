import { Show, createSignal } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { uiReady } from "./loadUI"

/****************
 * ### `EditorTheme`
 * The editor app's look:  a Spell UI theme and light / dark, picked from its menu bar, remembered in the browser.
 * - Spell UI's docs site does the same, and this reuses it:
 *   - the remembering and applying:  its `ThemePreference`
 *   - the menu:  its `<ui-docs-themes>` (`<ThemeMenu>`, below)
 * - The editor starts in Fruity (`DEFAULT_THEME`, epic `debut` Q14), and keeps its own theme key:
 *   a theme picked on the docs site never changes the editor's, nor the other way round.
 *   - Light / dark is ONE choice for every Spell site:  the docs' key.
 * - The code's colours aren't a page theme:  Monaco's Purple follows the page's light / dark by itself
 *   (`spell-app/app/ui/monaco/themes`).
 * - Loads lazily, as `loadUI()` does:  Spell UI's docs half is its own chunk, off the app's first paint.
 * - The editor app's only:  NEVER from `<spell-app>` / `<spell-editor>`, which live on other people's pages.
 ****************/
export class EditorTheme {
  /** The theme the editor starts in:  Fruity, the Glass look of the facelift boards (epic `debut` Q14). */
  static DEFAULT_THEME = "fruity"

  /** The `localStorage` key of the editor's chosen theme. */
  static THEME_KEY = "spell-app:theme"

  /**
   * Apply the remembered look:  light / dark at once, the theme once its sheet loads.
   * - Call once, from the editor's entry.
   * - SIDE EFFECTS:
   *   - defines `<ui-docs-themes>`, for `<ThemeMenu>`
   *   - follows the OS's light / dark, and other tabs' switches, from then on
   * - NEVER throws:  a failure leaves Spell UI's own look, and says so on the console.
   */
  static async restore(): Promise<void> {
    if (isServer) return
    try {
      await uiReady
      const { ThemePreference } = await import("spell-ui/docs-components")
      ThemePreference.site({ defaultTheme: EditorTheme.DEFAULT_THEME, themeKey: EditorTheme.THEME_KEY })
      await Promise.all([ThemePreference.restore(), EditorTheme.defineMenu()])
    } catch (error) {
      console.error("EditorTheme.restore():  couldn't apply the editor's theme", error)
    }
  }

  /** Define `<ui-docs-themes>`, then show `<ThemeMenu>`s. */
  private static async defineMenu(): Promise<void> {
    await import("spell-ui/docs-components/ui-docs-themes")
    setMenuDefined(true)
  }
}

/**
 * `<ui-docs-themes>` is defined:  `<ThemeMenu>` draws it only then.
 * - Before, `<ui-root>` would try to load its family itself, and fail:  its docs-only families aren't the root's.
 */
const [isMenuDefined, setMenuDefined] = createSignal(false)

/****************
 * ### `<ThemeMenu>`
 * The editor's look menu, in a menu bar:  one palette button opening Light | Dark | Auto and the theme list.
 * - `<ui-docs-themes>` in a `<ui-item>`, inverted for the menu bar's dark violet.
 * - Picking one applies it at once, and the editor remembers it (`EditorTheme`).
 ****************/
export function ThemeMenu(): JSX.Element {
  return (
    <Show when={isMenuDefined()}>
      <ui-item class="ThemeMenu">
        <ui-docs-themes inverted="" size="small" />
      </ui-item>
    </Show>
  )
}

declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      // Spell UI's docs-only theme menu:  not in its generated types, which name the component tags only
      "ui-docs-themes": JSX.HTMLAttributes<HTMLElement> & { inverted?: string; size?: string; show?: string }
    }
  }
}
