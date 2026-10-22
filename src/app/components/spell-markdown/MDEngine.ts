import { MD } from "spell-lang/markdown"
import type { MarkdownOptions, MarkdownRendering, MarkdownResult } from "spell-ui/components/ui-markdown"

/****************
 * ### `MDEngine`
 * Spell's markdown engine (`spell-lang/markdown`, on the parser), what `<spell-markdown>` draws with, plain and `editable`.
 * - In a LAZY chunk of its own, imported by `SpellMarkdown.loadEngine()` on the first render.
 *   The same contract as Spell UI's `MarkdownEngine` (marked):  `MarkdownRendering`.
 * - Draws with `ui-*` elements (`ui-header`, `ui-list`, `ui-table`, `ui-message` alerts, `ui-checkbox` tasks ...),
 *   whose families the `spell-markdown` barrel brings (`drawsUITags`:  `sanitized` keeps them).
 * - Built from source with the rest of the app, no pre-compiled bundle (epic `repo-split` P2).
 * - Returns MARKUP, never sanitized, as marked's engine does:  the element sanitizes it when `sanitized`.
 ****************/
export class MDEngine implements MarkdownRendering {
  /** The one engine:  static, as it keeps no state and every element shares it. */
  static readonly instance = new MDEngine()

  /** Its markup holds `ui-*` elements:  `sanitized` keeps them. */
  readonly drawsUITags = true

  /** `text` rendered as `options` say. */
  render(text: string, options: MarkdownOptions): MarkdownResult {
    const { html, headings } = MD.render(text, {
      ui: true,
      breaks: options.breaks,
      headingOffset: options.headingOffset
    })
    return { html, headings }
  }
}
