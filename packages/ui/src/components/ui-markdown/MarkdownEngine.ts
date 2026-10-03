import DOMPurify from "dompurify"
import { Marked, type Tokens } from "marked"

import type { MarkdownHeading, MarkdownOptions, MarkdownResult } from "./ui-markdown.types"

/****************
 * ### `MarkdownEngine`
 * marked + DOMPurify, in `<ui-markdown>`'s LAZY chunk:  imported by `MarkdownRenderer` on the first render, so a page
 * pays for them only when it shows markdown.
 * - GitHub-flavoured (`gfm`):  tables, task lists, strikethrough, autolinks.
 * - Headings get GitHub's ids (`slug()`:  lowercase, punctuation dropped, spaces to `-`, repeats numbered), so
 *   `[see](#setup)` links work;  `headingOffset` shifts their levels.
 * - Sanitized with DOMPurify in EVERY browser, unless `trusted` (ids kept:  see `render()`).  Why not the
 *   platform's `Element.setHTML()`:  by default it drops task-list checkboxes, images, heading ids and code-language
 *   classes, and it differs by browser (none in Safari).
 * - Returns a fragment of this document;  the element turns code blocks into `<ui-code>` and resolves URLs.
 ****************/
export class MarkdownEngine {
  /** The one engine. */
  static readonly instance = new MarkdownEngine()

  /** `text` rendered as `options` say. */
  render(text: string, options: MarkdownOptions): MarkdownResult {
    const headings: MarkdownHeading[] = []
    const ids = new Map<string, number>()
    const marked = new Marked({
      gfm: true,
      breaks: options.breaks,
      renderer: {
        heading({ tokens, depth }: Tokens.Heading) {
          const html = this.parser.parseInline(tokens)
          const plain = MarkdownEngine.plainText(html)
          const id = MarkdownEngine.unique(MarkdownEngine.slug(plain), ids)
          const level = Math.min(6, Math.max(1, depth + options.headingOffset))
          headings.push({ level, text: plain, id })
          return `<h${level} id="${id}">${html}</h${level}>\n`
        }
      }
    })
    const html = marked.parse(text, { async: false })
    const fragment = options.trusted
      ? document.createRange().createContextualFragment(html)
      : // `SANITIZE_DOM` off:  it drops ids that shadow DOM properties (`id="elements"`, `id="forms"`), to stop DOM
        // clobbering -- which can't happen here:  the markup lives in a shadow root, out of `document`'s named access
        DOMPurify.sanitize(html, { RETURN_DOM_FRAGMENT: true, SANITIZE_DOM: false })
    return { fragment, headings }
  }

  /** GitHub's heading slug:  `Getting started!` => `getting-started`. */
  static slug(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, "")
      .replace(/\s/g, "-")
  }

  /** `slug`, or `slug-1`, `slug-2` ... when `seen` has it already;  records it. */
  private static unique(slug: string, seen: Map<string, number>): string {
    const count = seen.get(slug)
    seen.set(slug, (count ?? -1) + 1)
    return count === undefined ? slug : `${slug}-${count + 1}`
  }

  /** `html`'s text:  tags dropped, entities decoded. */
  private static plainText(html: string): string {
    const holder = document.createElement("template")
    holder.innerHTML = html
    return holder.content.textContent ?? ""
  }
}
