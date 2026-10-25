import { appTexts } from "spell-app/app/ui/AppTexts"
import { EditorTheme, SpellPage, on } from "spell-app/app/solid"
import { navigate } from "./navigation"
import { ChooserToolbar } from "./ProjectChooser"

import "./ThemeEditorPage.css"

/****************
 * ### `<ThemeEditorPage>`
 * The editor's theme editor, full size:  Spell UI's `<ui-theme-editor>` under the top bar (epic `debut` P6),
 * at `/theme`.
 * - Reached from the palette menu's "Edit theme..." (`<ThemeMenu>`).
 * - It starts from the theme the editor wears, or the one kept in this browser (`SavedTheme`), as the element does.
 * - Use this theme (`ui-saved`):  the editor wears it at once (`EditorTheme.wearKept()`), and goes back to the page it
 *   came from, else the landing page.  Stop using:  the same, taking it off.
 * - Its element loads with the page, a chunk of its own:  no other page of the editor carries it.
 ****************/
export function ThemeEditorPage() {
  void import("spell-ui/components/ui-theme-editor").catch((error: unknown) =>
    console.error("ThemeEditorPage:  couldn't load the theme editor", error)
  )
  return (
    <SpellPage id="ThemeEditorPage" fillWindow dark scrolling>
      <div class="ThemeEditorPage">
        <ChooserToolbar isHome={false} />
        <h1 class="ThemeEditorTitle">{appTexts.text("themeEditorTitle")}</h1>
        <ui-theme-editor ref={on("ui-saved", () => void wearAndGoBack())} />
      </div>
    </SpellPage>
  )
}

/** Wear the theme just kept (or taken off), then go back where the editor came from. */
async function wearAndGoBack(): Promise<void> {
  await EditorTheme.wearKept()
  if (history.length > 1) history.back()
  else navigate("/")
}
