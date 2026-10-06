import engine from "./MDBundle"
import type { MarkdownOptions, MarkdownRendering, MarkdownResult } from "./ui-markdown.types"

/****************
 * ### `MDEngine`
 * Spell's markdown engine (`@spell-app/markdown`, on the parser), for `<ui-markdown editable>`:  in a LAZY chunk of
 * its own, imported by `MarkdownRenderer.loadMD()` on the first preview.  Same contract as `MarkdownEngine`.
 * - Draws with `ui-*` elements (`ui-header`, `ui-list`, `ui-table`, `ui-message` alerts, `ui-checkbox` tasks ...),
 *   whose families `MarkdownRenderer.loadMD()` imports beside this chunk (`mdFamilies()`), NEVER this file:  a lazy
 *   chunk that imports families imports the core through them, and splits core's modules out of `core.js`
 *   (epic `wwod-spell-ui`, I12).
 * - The engine is the PRE-COMPILED bundle (`MDBundle`, `yarn gen:markdown`):  `ui` never imports `$/markdown`.
 * - Returns MARKUP, never sanitized, as marked's engine does:  the element sanitizes it when `sanitized`
 *   (`MarkdownSanitizer`), keeping `ui-*` tags.
 * - Why not plain `<ui-markdown>` too:  the bundle is ~4x marked (59 vs 14 kB gzipped:  plan doc, P7 and I6);
 *   until it's slimmer, only the editable one pays for it.
 ****************/
export class MDEngine implements MarkdownRendering {
  /** The one engine. */
  static readonly instance = new MDEngine()

  /** `text` rendered as `options` say. */
  render(text: string, options: MarkdownOptions): MarkdownResult {
    return engine.render(text, { ui: true, breaks: options.breaks, headingOffset: options.headingOffset })
  }
}
