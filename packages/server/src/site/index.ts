/**
 * `$/server/site` barrel:  browser code every page of the site shares -- the site header and the section editor.
 * - Opt-in, NOT in `$/server`'s barrel:  browser code (DOM), while the barrel is node's.
 * - Importing defines nothing:  call `defineSite()` -- the docs bundle (`spell-ui.entry.js`) and Spell UI's site
 *   bundle (`packages/ui/site/_src/site.ts`) do.
 */
import { SectionEditor, SiteHeader } from "$/server/site"

export * from "./site.types"

export * from "./SiteHeader"
export * from "./SectionEditor"

/**
 * Define `<spell-site-header>`, and mount the section editor on pages the page server serves.
 * - safe to call more than once
 */
export function defineSite(): void {
  SiteHeader.define()
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", SectionEditor.mount, { once: true })
  else SectionEditor.mount()
}
