/**
 * Every family's sheet on the PAGE, for the dev pages that show CLASS-GRAMMAR markup:  `yarn dev`'s examples page
 * (`index.ts`) and `yarn test:visual`'s fixture (`tools/visual/fixture.ts`).
 * - A page script, served by Vite (browser code, `$/ui` aliases):  never imported by node.
 */

import { UI } from "$/ui/runtime"

import popupAnchoredCSS from "$/ui/components/ui-popup/UIPopup.anchored.css?raw"

/****************
 * ### `FamilySheets`
 * Registers every family's main sheet (`ui-button/UIButton.css`) on the page, by its bare name (`button`):
 * the class-grammar originals and the light-DOM `<button class="ui button">` triggers of element examples
 * need them there.
 * - Globbed (`import.meta.glob`), so a new family needs no edit here.
 * - The other sheets of a family (`UIDimmer.page.css`, `UIToast.container.css`) are the components' own,
 *   registered when used.
 * - STATIC:  a page has one set of sheets.
 ****************/
export class FamilySheets {
  /** Register every family sheet, plus the popup's anchored sheet;  call after `UI.load()`. */
  static register(): void {
    for (const [path, css] of Object.entries(SHEETS)) {
      const [, family, file] = FAMILY_SHEET.exec(path) ?? []
      if (family && FamilySheets.isMainSheet(family, file!)) {
        UI.styles.register(family.replace(/^ui-/, ""), css, { page: true })
      }
    }
    UI.styles.register("popup-anchored", popupAnchoredCSS, { page: true })
  }

  /**
   * Is `file` (no `.css`) the main sheet of the family in folder `family`?
   * - Named for the family's component:  `UIButton` in `ui-button/` (the rule of `tools/FamilyFiles.ts`,
   *   which a page script can't import:  it's node code).
   */
  private static isMainSheet(family: string, file: string): boolean {
    const stem = `UI${family
      .replace(/^ui-/, "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("")}`
    return file === stem
  }
}

/**
 * Every component sheet, by path.
 * - NOTE: `UIPopup.anchored.css` is excluded:  Lightning CSS can't parse its `@container anchored(...)`
 *   (`agents/CODE-DEBT.md`), so it's imported `?raw` above.
 */
const SHEETS = import.meta.glob<string>(["/src/components/*/*.css", "!**/UIPopup.anchored.css"], {
  query: "?inline",
  import: "default",
  eager: true
})

/** A sheet's path:  its family folder and file name, the same for the family's main sheet. */
const FAMILY_SHEET = /\/components\/([\w-]+)\/([\w.-]+)\.css$/
