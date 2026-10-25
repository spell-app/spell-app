import type { EditorStore } from "spell-app/app/editor"

// ## Shared types for app pages.

// ## Routing

/** Params parsed out of the `/:page/*address` route:  `/edit/...`, `/run/...`. */
export type SpellRouteParams = {
  /** Which page:  `edit` or `run`. */
  page: string
  /**
   * The address, each part decoded by the router, e.g. `@spell/examples/Solitaire/a b.spell`.
   * - NEVER decode it again:  a name with an encoded `%` in it, `a%25b`, would lose it.
   */
  address: string
}

/** Which page shows a project:  `editor.projectPage`, set by `followRoute()`. */
export type EditorPage = EditorStore["projectPage"]
