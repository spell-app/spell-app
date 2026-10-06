import { MD, type MarkdownHeading, type MarkdownOptions, type RenderOptions } from "$/markdown"

/**
 * `MD.toHTML(markdown)` -- markdown to PLAIN HTML, as the GFM spec spells it.
 * - Blocks (`MD.BlockScanner`), then link reference definitions out of the paragraphs (`MD.extractReferences()`),
 *   then each leaf's inlines (`MD.InlineParser`, GFM autolinks), drawn as `MD.Markup` and written as HTML.
 * - `options`:  GFM autolinks and tagfilter, both on unless turned off.
 */
export function toHTML(markdown: string, options: MarkdownOptions = {}): string {
  return MD.markupToHTML(toMarkup(markdown, options))
}

/** `markdown` as plain-HTML `MD.Markup`. */
export function toMarkup(markdown: string, options: MarkdownOptions = {}): MD.Markup {
  return render(markdown, { ...options, ui: false, headingIds: false }).markup
}

/**
 * `markdown` drawn for a page:  `ui-*` elements (unless `ui: false`), GitHub heading ids, and the heading outline --
 * what `<ui-markdown>`'s engine returns (`{ fragment, headings }`), minus the DOM, which the caller makes from
 * `html` (and sanitizes).
 */
export function render(markdown: string, options: RenderOptions = {}): MarkdownRender {
  const {
    autolinks = true,
    tagfilter = true,
    ui = true,
    headingIds = true,
    headingOffset = 0,
    breaks = false
  } = options
  const doc = MD.BlockScanner.parse(markdown)
  const refmap = MD.extractReferences(doc)
  const headings: MarkdownHeading[] = []
  const inline = (text: string) => {
    const root = MD.InlineParser.parse(text, refmap)
    if (autolinks) MD.autolinkText(root)
    return MD.renderInlines(root, { tagfilter, breaks })
  }
  const markup = MD.renderBlocks(doc, inline, { tagfilter, ui, headingIds, headingOffset, headings })
  return { markup, html: MD.markupToHTML(markup), headings }
}

/** What `MD.render()` returns. */
export type MarkdownRender = {
  /** The document as `MD.Markup`. */
  markup: MD.Markup
  /** ... written as HTML. */
  html: string
  /** Every heading, in order. */
  headings: MarkdownHeading[]
}
