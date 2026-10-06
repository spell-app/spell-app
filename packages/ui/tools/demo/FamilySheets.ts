/**
 * Every family's sheet on the PAGE, for the dev pages that show CLASS-GRAMMAR markup:  `yarn dev`'s examples page
 * (`index.ts`) and `yarn test:visual`'s fixture (`tools/visual/fixture.ts`).
 * - A page script, served by Vite (browser code, `$/ui` aliases):  never imported by node.
 */

import { UI } from "$/ui/runtime"

import popupAnchoredCSS from "$/ui/components/ui-popup/ui-popup.anchored.css?raw"

/****************
 * ### `FamilySheets`
 * Registers every `ui-<family>/ui-<family>.css` on the page, by its bare name (`button`):  the class-grammar
 * originals and the light-DOM `<button class="ui button">` triggers of element examples need them there.
 * - Globbed (`import.meta.glob`), so a new family needs no edit here.
 * - The other sheets of a family (`ui-dimmer.page.css`, `ui-toast.container.css`) are the components' own,
 *   registered when used.
 * - STATIC:  a page has one set of sheets.
 ****************/
export class FamilySheets {
  /** Register every family sheet, plus the popup's anchored sheet;  call after `UI.load()`. */
  static register(): void {
    for (const [path, css] of Object.entries(SHEETS)) {
      const [, family, file] = FAMILY_SHEET.exec(path) ?? []
      if (family && family === file) UI.styles.register(family.replace(/^ui-/, ""), css, { page: true })
    }
    UI.styles.register("popup-anchored", popupAnchoredCSS, { page: true })
  }
}

/**
 * Every component sheet, by path.
 * - NOTE: `ui-popup.anchored.css` is excluded:  Lightning CSS can't parse its `@container anchored(...)`
 *   (`agents/CODE-DEBT.md`), so it's imported `?raw` above.
 */
const SHEETS = import.meta.glob<string>(["/src/components/*/*.css", "!**/ui-popup.anchored.css"], {
  query: "?inline",
  import: "default",
  eager: true
})

/** A sheet's path:  its family folder and file name, the same for the family's main sheet. */
const FAMILY_SHEET = /\/components\/([\w-]+)\/([\w.-]+)\.css$/
