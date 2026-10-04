import type { P } from "$/parser"
import { MD, type MarkdownOptions } from "$/markdown"

/**
 * `MD.toHTML(markdown)` -- markdown to PLAIN HTML, as the GFM spec spells it.
 * - Blocks (`MD.BlockScanner`), then link reference definitions out of the paragraphs (`MD.extractReferences()`),
 *   then each leaf's inlines (`MD.InlineParser`, GFM autolinks), drawn as `P.Markup` and written as HTML.
 * - `options`:  GFM autolinks and tagfilter, both on unless turned off.
 */
export function toHTML(markdown: string, options: MarkdownOptions = {}): string {
  return MD.markupToHTML(toMarkup(markdown, options))
}

/** `markdown` as plain-HTML `P.Markup`. */
export function toMarkup(markdown: string, options: MarkdownOptions = {}): P.Markup {
  const { autolinks = true, tagfilter = true } = options
  const doc = MD.BlockScanner.parse(markdown)
  const refmap = MD.extractReferences(doc)
  const inline = (text: string) => {
    const root = MD.InlineParser.parse(text, refmap)
    if (autolinks) MD.autolinkText(root)
    return MD.renderInlines(root, { tagfilter })
  }
  return MD.renderBlocks(doc, inline, { tagfilter })
}
