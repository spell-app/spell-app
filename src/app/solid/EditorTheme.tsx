import { Show, createSignal } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { editor } from "spell-app/app/editor"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { uiReady } from "./loadUI"

import "./EditorTheme.css"

/****************
 * ### `EditorTheme`
 * The editor app's look:  a Spell UI theme and light / dark, picked from its menu bar, remembered in the browser.
 * - Spell UI's docs site does the same, and this reuses it:
 *   - the remembering and applying:  its `ThemePreference`
 *   - the menu:  its `<ui-docs-themes>` (`<ThemeMenu>`, below)
 * - The editor starts in Fruity (`DEFAULT_THEME`, epic `debut` Q14), and keeps its own theme key:
 *   a theme picked on the docs site never changes the editor's, nor the other way round.
 *   - Light / dark is ONE choice for every Spell site:  the docs' key.
 * - Three of the themes are the editor's LOOKS (`LOOKS`, the facelift boards of epic `debut` P1):
 *   Glass (Fruity), Brand (Spell Brand) and Studio, picked from the theme menu as any other theme is.
 *   - One of them chosen:  `<html data-spell-look="glass">`, and the editor's chrome takes that look's shape
 *     (`EditorTheme.css`):  a floating top bar, panels with gaps and rounded corners.
 *   - Any other theme (GitHub, Classic ...):  no `data-spell-look`, and the chrome as it always was.
 * - A theme made with Spell UI's theme editor and kept there (Use this theme) is worn over its base,
 *   while that base is the theme chosen (`SavedTheme.follow()`, epic `debut` P6).
 * - The code's colours aren't a page theme:  Monaco's Purple follows the page's light / dark by itself
 *   (`spell-app/app/ui/monaco/themes`).
 * - Loads lazily, as `loadUI()` does:  Spell UI's docs half is its own chunk, off the app's first paint.
 * - The editor app's only:  NEVER from `<spell-viewer>` / `<spell-editor>`, which live on other people's pages.
 ****************/
export class EditorTheme {
  /** The theme the editor starts in:  Fruity, the Glass look of the facelift boards (epic `debut` Q14). */
  static DEFAULT_THEME = "fruity"

  /** The `localStorage` key of the editor's chosen theme. */
  static THEME_KEY = "spell-app:theme"

  /** The editor's looks:  each a Spell UI theme. */
  static LOOKS: readonly EditorLook[] = [
    { id: "brand", theme: "spell-brand" },
    { id: "studio", theme: "studio" },
    { id: "glass", theme: "fruity" }
  ]

  /** The look chosen now, or `undefined` while another theme is (reactive). */
  static get look(): EditorLook | undefined {
    return lookFor(chosenTheme())
  }

  /**
   * Apply the remembered look:  light / dark at once, the theme once its sheet loads.
   * - Call once, from the editor's entry.
   * - SIDE EFFECTS:
   *   - defines `<ui-docs-themes>`, for `<ThemeMenu>`
   *   - keeps `<html data-spell-look>` in step with the theme chosen
   *   - follows the OS's light / dark, and other tabs' switches, from then on
   * - NEVER throws:  a failure leaves Spell UI's own look, and says so on the console.
   */
  static async restore(): Promise<void> {
    if (isServer) return
    try {
      await uiReady
      const { ThemePreference } = await import("spell-ui/docs-components")
      ThemePreference.site({ defaultTheme: EditorTheme.DEFAULT_THEME, themeKey: EditorTheme.THEME_KEY })
      EditorTheme.follow(ThemePreference.look.theme)
      ThemePreference.subscribe((look) => EditorTheme.follow(look.theme))
      await Promise.all([ThemePreference.restore(), EditorTheme.defineMenu()])
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
        import("spell-ui/docs-components"),
        import("spell-ui/components/ui-theme-editor/SavedTheme")
      ])
      const base = SavedTheme.choices?.base
      // a new base:  choosing it puts the kept sheet on too (`follow()`);  the same one:  the sheet changed
      if (base && base !== ThemePreference.look.theme) await ThemePreference.setTheme(base)
      else await SavedTheme.follow(ThemePreference.look.theme)
    } catch (error) {
      console.error("EditorTheme.wearKept():  couldn't wear the kept theme", error)
    }
  }

  /** Theme `theme` is chosen:  note it, mark `<html>` with its look, and wear the kept theme on it, if any. */
  private static follow(theme: string | undefined): void {
    setChosenTheme(theme)
    const look = lookFor(theme)
    if (look) document.documentElement.dataset.spellLook = look.id
    else delete document.documentElement.dataset.spellLook
    // the theme made in Spell UI's theme editor and kept there (Use this theme), worn while its base is chosen
    void import("spell-ui/components/ui-theme-editor/SavedTheme")
      .then(({ SavedTheme }) => SavedTheme.follow(theme))
      .catch((error: unknown) => console.error("EditorTheme:  couldn't wear the theme kept in the browser", error))
  }

  /** Define `<ui-docs-themes>`, then show `<ThemeMenu>`s. */
  private static async defineMenu(): Promise<void> {
    await import("spell-ui/docs-components/ui-docs-themes")
    setMenuDefined(true)
  }
}

/** One of the editor's looks (`EditorTheme.LOOKS`). */
export type EditorLook = {
  /** its id, as `<html data-spell-look>` holds it:  `glass` */
  id: string
  /** its Spell UI theme:  `fruity` */
  theme: string
}

/** The look of theme `theme`, if it's one of the editor's. */
function lookFor(theme: string | undefined): EditorLook | undefined {
  return EditorTheme.LOOKS.find((look) => look.theme === theme)
}

/** The theme chosen now, as `ThemePreference` last said:  what `EditorTheme.look` follows. */
const [chosenTheme, setChosenTheme] = createSignal<string | undefined>(undefined)

/**
 * `<ui-docs-themes>` is defined:  `<ThemeMenu>` draws it only then.
 * - Before, `<ui-root>` would try to load its family itself, and fail:  its docs-only families aren't the root's.
 */
const [isMenuDefined, setMenuDefined] = createSignal(false)

/****************
 * ### `<ThemeMenu>`
 * The editor's theme menu, in a menu bar:  a palette button opening Light | Dark | Auto and every theme.
 * - The palette:  `<ui-docs-themes>`, inverted while the bar is the old violet one (no look).
 * - Picking applies at once, and the editor remembers it (`EditorTheme`).
 * - At its foot, "Edit theme...":  the theme editor's page (`<ThemeEditorPage>`, epic `debut` P6).
 ****************/
export function ThemeMenu(): JSX.Element {
  return (
    <Show when={isMenuDefined()}>
      <ui-item class="ThemeMenu">
        <ui-docs-themes inverted={EditorTheme.look ? undefined : ""} size="small">
          <button type="button" slot="end" class="EditThemeEntry" onClick={() => editor.showThemeEditor()}>
            <ui-icon name="paint brush" />
            {appTexts.text("editTheme")}
          </button>
        </ui-docs-themes>
      </ui-item>
    </Show>
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

declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      // Spell UI's docs-only theme menu:  not in its generated types, which name the component tags only
      "ui-docs-themes": JSX.HTMLAttributes<HTMLElement> & { inverted?: string; size?: string; show?: string }
    }
  }
}
