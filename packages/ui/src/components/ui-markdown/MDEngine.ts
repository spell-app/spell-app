import DOMPurify from "dompurify"

import engine from "./MDBundle"
import type { MarkdownOptions, MarkdownRendering, MarkdownResult } from "./ui-markdown.types"

import "$/ui/components/ui-checkbox"
import "$/ui/components/ui-divider"
import "$/ui/components/ui-list"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-segment"
import "$/ui/components/ui-table"

/****************
 * ### `MDEngine`
 * Spell's markdown engine (`@spell-app/markdown`, on the parser), for `<ui-markdown editable>`:  in a LAZY chunk of
 * its own, imported by `MarkdownRenderer.loadMD()` on the first preview.  Same contract as `MarkdownEngine`.
 * - Draws with `ui-*` elements (`ui-header`, `ui-list`, `ui-table`, `ui-message` alerts, `ui-checkbox` tasks ...),
 *   so this chunk defines those families;  `ui-code` and `ui-message` come with the element's barrel.
 * - The engine is the PRE-COMPILED bundle (`MDBundle`, `yarn gen:markdown`):  `ui` never imports `$/markdown`.
 * - Sanitized with DOMPurify unless `trusted`, as marked's output is, but letting `ui-*` tags through with any
 *   attribute but an `on*` handler.
 * - Why not plain `<ui-markdown>` too:  the bundle is ~3.5x marked + DOMPurify (plan doc, P7);  until it's slimmer,
 *   only the editable one pays for it.
 ****************/
export class MDEngine implements MarkdownRendering {
  /** The one engine. */
  static readonly instance = new MDEngine()

  /** `text` rendered as `options` say. */
  render(text: string, options: MarkdownOptions): MarkdownResult {
    const { html, headings } = engine.render(text, {
      ui: true,
      breaks: options.breaks,
      headingOffset: options.headingOffset
    })
    const fragment = options.trusted
      ? document.createRange().createContextualFragment(html)
      : // `SANITIZE_DOM` off:  see `MarkdownEngine`
        DOMPurify.sanitize(html, {
          RETURN_DOM_FRAGMENT: true,
          SANITIZE_DOM: false,
          CUSTOM_ELEMENT_HANDLING: {
            tagNameCheck: UI_TAG,
            attributeNameCheck: (name: string) => !HANDLER.test(name),
            allowCustomizedBuiltInElements: false
          }
        })
    return { fragment, headings }
  }
}

/** Custom elements the preview keeps. */
const UI_TAG = /^ui-[a-z-]+$/

/** Event-handler attributes, never kept. */
const HANDLER = /^on/i
