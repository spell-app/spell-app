import { SourceHost } from "$/ui/core"

import type { MarkdownController, MarkdownHeading } from "./ui-markdown.types"

/****************
 * ### `UIMarkdownHost`
 * Host base of `<ui-markdown>`:  the source API (`content`, `save()` ... from `SourceHost`), plus `headings` and
 * `reveal()`.
 * - `headings` -- `{ level, text, id }` of each heading of the last render, e.g. for a table of contents;  `[]`
 *   before the first (`ui-render` says when).
 * - `reveal(id)` -- scroll to one of them from outside.
 ****************/
export class UIMarkdownHost extends SourceHost {
  get headings(): MarkdownHeading[] {
    return this.markdown?.getHeadings() ?? []
  }

  /**
   * Scroll to the rendered heading `id` (a `headings` entry's) and put `#id` in the address, as a `#id` link inside
   * does;  `false` when no such heading is rendered (yet).
   * - Why a method:  the headings live in the shadow root, which the page's own fragment navigation can't see, e.g.
   *   from a table of contents outside the element.
   */
  reveal(id: string): boolean {
    return this.markdown?.reveal(id) ?? false
  }

  /** The controller, once created. */
  private get markdown(): MarkdownController | undefined {
    return this.controller as unknown as MarkdownController | undefined
  }
}
