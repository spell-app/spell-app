import { isServer, type JSX } from "@solidjs/web"

import { editor } from "spell-app/app/editor"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { uiReady } from "./loadUI"

import "./EditorTheme.css"

/****************
 * ### `EditorTheme`
 * The editor app's theme:  one of Spell's themes and light / dark, picked from its menu bar, remembered in the browser.
 * - The same set and the same menu as every other place (epic `debut` P17):
 *   - the remembering and applying:  Spell UI's `ThemePreference`
 *   - the menu:  `<ui-theme-menu>` (`<ThemeMenu>`, below)
 * - The editor starts in Fruity (`DEFAULT_THEME`, epic `debut` Q14), and keeps its own theme key:
 *   a theme picked on the docs site never changes the editor's, nor the other way round.
 *   - Light / dark is ONE choice for every Spell site:  the docs' key.
 * - Every theme dresses the editor's chrome (`EditorTheme.css`):
 *   a floating top bar, panels with gaps and rounded corners,
 *   from the theme's own bar and panel tokens (`--ui-bar-*`, `--ui-panel-*`, epic `debut` J89).
 *   - The theme chosen is marked by its own name:  `<html data-spell-theme="glass">`.
 *   - What's the editor's alone is keyed on that name:
 *     Glass and Fruity share the glass chrome, Merlot's panels meet edge to edge, Spell's bar has no box.
 * - A theme made with Spell UI's theme editor and kept there (Use this theme) is worn over its base,
 *   while that base is the theme chosen (`SavedTheme.follow()`, epic `debut` P6).
 * - The code's colours aren't a page theme:  Monaco's Purple follows the page's light / dark by itself
 *   (`spell-app/app/ui/monaco/themes`).
 * - Loads lazily, as `loadUI()` does:  Spell UI's half is its own chunk, off the app's first paint.
 * - The editor app's only:  NEVER from `<spell-viewer>` / `<spell-editor>`, which live on other people's pages.
 ****************/
export class EditorTheme {
  /** The theme the editor starts in:  Fruity, Glass on its pastel wallpaper (epic `debut` Q14). */
  static DEFAULT_THEME = "fruity"

  /** The `localStorage` key of the editor's chosen theme. */
  static THEME_KEY = "spell-app:theme"

  /**
   * Apply the remembered theme:  light / dark at once, the theme once its sheet loads.
   * - Call once, from the editor's entry.
   * - SIDE EFFECTS:
   *   - keeps `<html data-spell-theme>` in step with the theme chosen
   *   - follows the OS's light / dark, and other tabs' switches, from then on
   * - NEVER throws:  a failure leaves Spell UI's own look, and says so on the console.
   */
  static async restore(): Promise<void> {
    if (isServer) return
    try {
      await uiReady
      const { ThemePreference } = await import("spell-ui/components/ui-theme-menu/ThemePreference")
      ThemePreference.site({ defaultTheme: EditorTheme.DEFAULT_THEME, themeKey: EditorTheme.THEME_KEY })
      EditorTheme.follow(ThemePreference.chosen.theme)
      ThemePreference.subscribe((chosen) => EditorTheme.follow(chosen.theme))
      await ThemePreference.restore()
    } catch (error) {
      console.error("EditorTheme.restore():  couldn't apply the editor's theme", error)
    }
  }

  /**
   * Wear the theme the theme editor kept (Use this theme):  its base chosen, as the menu would, and its sheet over it;
   * none kept (Stop using):  take its sheet off.
   * - NEVER throws:  a failure says so on the console.
   */
  static async wearKept(): Promise<void> {
    try {
      const [{ ThemePreference }, { SavedTheme }] = await Promise.all([
        import("spell-ui/components/ui-theme-menu/ThemePreference"),
        import("spell-ui/components/ui-theme-editor/SavedTheme")
      ])
      const base = SavedTheme.choices?.base
      // a new base:  choosing it puts the kept sheet on too (`follow()`);  the same one:  the sheet changed
      if (base && base !== ThemePreference.chosen.theme) await ThemePreference.setTheme(base)
      else await SavedTheme.follow(ThemePreference.chosen.theme)
    } catch (error) {
      console.error("EditorTheme.wearKept():  couldn't wear the kept theme", error)
    }
  }

  /** Theme `theme` is chosen:  mark `<html>` with its name, and wear the kept theme on it, if any. */
  private static follow(theme: string | undefined): void {
    if (theme) document.documentElement.dataset.spellTheme = theme
    else delete document.documentElement.dataset.spellTheme
    // the theme made in Spell UI's theme editor and kept there (Use this theme), worn while its base is chosen
    void import("spell-ui/components/ui-theme-editor/SavedTheme")
      .then(({ SavedTheme }) => SavedTheme.follow(theme))
      .catch((error: unknown) => console.error("EditorTheme:  couldn't wear the theme kept in the browser", error))
  }
}

/****************
 * ### `<ThemeMenu>`
 * The editor's theme menu, in a menu bar:  a palette button opening Light | Dark | Auto and every theme.
 * - The palette:  `<ui-theme-menu>`, defined with every other Spell UI tag (`loadUI()`);
 *   until then it waits, as any `<ui-*>` does.
 *   - Until epic `debut` P17 (T34) the editor defined it itself, and drew it only then:
 *     it was a docs-only widget, which `spell-ui`'s barrel didn't carry.
 * - Picking applies at once, and the editor remembers it (`EditorTheme`).
 * - At its foot, "Edit theme...":  the theme editor's page (`<ThemeEditorPage>`, epic `debut` P6).
 ****************/
export function ThemeMenu(): JSX.Element {
  return (
    <ui-item class="ThemeMenu">
      <ui-theme-menu size="small">
        <button type="button" slot="end" class="EditThemeEntry" onClick={() => editor.showThemeEditor()}>
          <ui-icon name="paint brush" />
          {appTexts.text("editTheme")}
        </button>
      </ui-theme-menu>
    </ui-item>
  )
}

/****************
 * ### `<AppMark>`
 * Spell's hat and name, first in the editor's top bar:  a link to the landing page.
 * - The hat alone, in the theme's primary colour:  the favicon's hat without its dark square
 *   (`/static/favicon/hat.svg`, drawn as a mask, `EditorTheme.css`).
 * - On a phone, the hat alone (`.AppName` read, not shown:  `chrome.css`).
 ****************/
export function AppMark(): JSX.Element {
  return (
    <ui-item class="AppMark">
      <a link="" href="/">
        <span class="hat" />
        <span class="AppName">{appTexts.text("appName")}</span>
      </a>
    </ui-item>
  )
}
