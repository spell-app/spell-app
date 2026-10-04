import { MD } from "$/markdown"

/**
 * `MD.toHTML(markdown)` -- markdown to PLAIN HTML, as the GFM spec spells it:  blocks, then their markup, then HTML.
 * - TODO: P4 plugs inline parsing in;  until then inline text is drawn as it is (escaped).
 */
export function toHTML(markdown: string): string {
  return MD.markupToHTML(MD.renderBlocks(MD.BlockScanner.parse(markdown)))
}
