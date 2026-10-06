import { Marked, type Tokens } from "marked"

// Import directly:  see the class docs
import { SourceError } from "$/ui/runtime/runtime.types"

import type { MarkdownHeading, MarkdownOptions, MarkdownResult } from "./ui-markdown.types"

/****************
 * ### `MarkdownEngine`
 * marked, in `<ui-markdown>`'s LAZY chunk:  imported by `MarkdownRenderer` on the first render, so a page pays for it
 * only when it shows markdown.
 * - GitHub-flavoured (`gfm`):  tables, task lists, strikethrough, autolinks.
 * - Headings get GitHub's ids (`slug()`:  lowercase, punctuation dropped, spaces to `-`, repeats numbered), so
 *   `[see](#setup)` links work;  `headingOffset` shifts their levels.
 * - Returns MARKUP, never sanitized:  the element sanitizes it when `sanitized`, in a chunk of its own
 *   (`MarkdownSanitizer`).
 * - The element turns code blocks into `<ui-code>` and resolves URLs.
 * - NEVER a value import but marked and `SourceError`:  the docs bundler builds this file ALONE into a
 *   classic script (`MarkdownRenderer.engineLoader`).
 * - Imports `SourceError` straight from `$/ui/runtime/runtime.types` (built into `core.js`), and USES it:  a lazy
 *   chunk that needs Rolldown's helpers (`__name`, from `keepNames`) without depending on core makes Rolldown split
 *   them into a `rolldown-runtime-<hash>.js` EVERY page loads (`yarn measure`'s `runtimeChunks`;  see
 *   `runtime/TemporalPolyfill.ts`).  Straight, not through `$/ui/core`:  the docs bundler builds this file alone, and
 *   `runtime.types` is all it may pull in.
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
    if (typeof html !== "string") {
      throw new SourceError("MarkdownEngine.render():  marked rendered asynchronously;  drop its async extensions", {
        cause: { kind: "render" }
      })
    }
    return { html, headings }
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
