import { createEffect } from "solid-js"

import { SP } from "spell-lang/spell"
import { editor } from "spell-app/app/editor"
import type { EditorPage, SpellRouteParams } from "./pages.types"

/**
 * Show what the route's `params` name in `page`, now and whenever they change.
 * - It calls `editor.selectPath()` on the address they spell.
 * - Call in a route component's body:  the effect goes with it.
 * - The route stays mounted while only its params change (`routes.tsx`),
 *   so moving between a project's files re-selects without redrawing the page.
 * - SIDE EFFECT:  sets `editor.projectPage` first:  `selectPath()` reads it to redirect to the page's own URL.
 * - A bad address shows as `editor.showError()`, never a throw:  an effect that throws halts Solid for the whole page.
 * - A page of a running app, `/run/owen@spell/solitaire/rules`, runs its app:  `rules` is left for the app's own
 *   pages, which don't exist yet (`SP.SpellUrls.withoutPage()`).
 */
export function followRoute(params: () => Partial<SpellRouteParams>, page: EditorPage): void {
  createEffect(
    () => params().address ?? "",
    (tail) => {
      let path: string
      try {
        path = SP.SpellUrls.withoutPage(tail)
      } catch (error) {
        editor.showError(error)
        return
      }
      editor.projectPage = page
      editor.selectPath(path).catch((error: unknown) => editor.showError(error))
    }
  )
}
