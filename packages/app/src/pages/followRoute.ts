import { createEffect } from "solid-js"

import { SP } from "$/spell"
import { editor } from "$/app/editor"
import type { EditorPage, SpellRouteParams } from "./pages.types"

/**
 * Show what the route's `params` name in `page`:  `editor.selectPath()` on the path they spell, now and whenever
 * they change.
 * - Call in a route component's body:  the effect goes with it.  The route stays mounted while only its params
 *   change (`routes.tsx`), so moving between files of a project re-selects without redrawing the page.
 * - SIDE EFFECT:  sets `editor.projectPage` first:  `selectPath()` reads it to redirect to the page's own URL.
 * - A bad path shows as `editor.showError()`, never a throw:  an effect that throws halts Solid for the whole page.
 */
export function followRoute(params: () => Partial<SpellRouteParams>, page: EditorPage): void {
  createEffect(
    () => {
      const { domain, project, filePath } = params()
      return { domain, project, filePath }
    },
    (route) => {
      let path: string
      try {
        path = SP.SpellLocation.pathForUrl(route)
      } catch (error) {
        editor.showError(error)
        return
      }
      editor.projectPage = page
      editor.selectPath(path).catch((error: unknown) => editor.showError(error))
    }
  )
}
