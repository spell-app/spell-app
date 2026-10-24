import { For, Show, createSignal } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"
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
 *   Glass (Fruity), Brand (Spell Brand) and Studio.
 *   - One of them chosen:  `<html data-spell-look="glass">`, and the editor's chrome takes that look's shape
 *     (`EditorTheme.css`):  a floating top bar, panels with gaps and rounded corners.
 *   - Any other theme (GitHub, Classic ...):  no `data-spell-look`, and the chrome as it always was.
 * - A theme made with Spell UI's theme editor and kept there (Use this theme) is worn over its base,
 *   while that base is the theme chosen (`SavedTheme.follow()`, epic `debut` P6).
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

  /** The editor's looks, in the menu's order:  each a Spell UI theme, and its name's text key. */
  static LOOKS: readonly EditorLook[] = [
    { id: "brand", theme: "spell-brand", text: "lookBrand" },
    { id: "studio", theme: "studio", text: "lookStudio" },
    { id: "glass", theme: "fruity", text: "lookGlass" }
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
   * Choose look `id`:  apply its theme, and remember it.
   * - NEVER throws:  a theme that won't load says so on the console.
   */
  static async choose(id: string): Promise<void> {
    const look = EditorTheme.LOOKS.find((each) => each.id === id)
    if (!look) return
    try {
      const { ThemePreference } = await import("spell-ui/docs-components")
      await ThemePreference.setTheme(look.theme)
    } catch (error) {
      console.error(`EditorTheme.choose():  couldn't apply the ${id} look`, error)
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
  /** its name's key in the editor's texts */
  text: AppTextKey
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
 * The editor's look menu, in a menu bar:  the looks (Brand | Studio | Glass) as a segmented control, then a palette
 * button opening Light | Dark | Auto and every theme.
 * - The looks:  a segmented control, a radio group of buttons;  none checked while another theme is chosen.
 *   - Plain buttons, not `<ui-menu appearance="segmented">`:  inside the bar's menu, a menu is its sub-menu, and
 *     loses its segmented look.  They take the theme's segmented tokens (`--ui-menu-segmented-*`) all the same.
 * - The palette:  `<ui-docs-themes>`, inverted while the bar is the old violet one (no look).
 * - Picking applies at once, and the editor remembers it (`EditorTheme`).
 ****************/
export function ThemeMenu(): JSX.Element {
  return (
    <ui-item class="ThemeMenu">
      <div class="EditorLooks" role="radiogroup" aria-label={appTexts.text("looksName")}>
        <For each={EditorTheme.LOOKS}>
          {(look) => (
            <button
              type="button"
              role="radio"
              class={{ checked: EditorTheme.look?.id === look.id }}
              aria-checked={EditorTheme.look?.id === look.id ? "true" : "false"}
              onClick={() => void EditorTheme.choose(look.id)}
            >
              {appTexts.text(look.text)}
            </button>
          )}
        </For>
      </div>
      <Show when={isMenuDefined()}>
        <ui-docs-themes inverted={EditorTheme.look ? undefined : ""} size="small" />
      </Show>
    </ui-item>
  )
}

/****************
 * ### `<AppMark>`
 * Spell's hat and name, first in the editor's top bar:  a link to the landing page.
 ****************/
export function AppMark(): JSX.Element {
  return (
    <ui-item class="AppMark">
      <a link="" href="/">
        <img src={HAT_URL} alt="" />
        <span>{appTexts.text("appName")}</span>
      </a>
    </ui-item>
  )
}

/** Spell's hat:  the favicon's picture (`index.html`). */
const HAT_URL = "/static/favicon/favicon.svg"

declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      // Spell UI's docs-only theme menu:  not in its generated types, which name the component tags only
      "ui-docs-themes": JSX.HTMLAttributes<HTMLElement> & { inverted?: string; size?: string; show?: string }
    }
  }
}
