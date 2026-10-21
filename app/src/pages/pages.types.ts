import type { EditorStore } from "$/app/editor"

// ## Shared types for app pages.

// ## Routing

/** Params parsed out of the `/edit/*address` and `/run/*address` routes. */
export type SpellRouteParams = {
  /**
   * The address, as the router has it:  each part still encoded, e.g. `@spell/examples/drawable-solitaire/a%20b.spell` --
   * `SP.SpellLocation.addressForUrl()` reads it.
   */
  address: string
}

/** Which page shows a project:  `editor.projectPage`, set by `followRoute()`. */
export type EditorPage = EditorStore["projectPage"]
