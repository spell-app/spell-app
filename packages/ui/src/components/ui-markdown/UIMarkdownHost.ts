import { SourceHost } from "$/ui/core"

import type { MarkdownController, MarkdownHeading } from "./ui-markdown.types"

/****************
 * ### `UIMarkdownHost`
 * Host base of `<ui-markdown>`:  the source API (`content`, `save()` ... from `SourceHost`), plus `headings`.
 * - `headings` -- `{ level, text, id }` of each heading of the last render, e.g. for a table of contents;  `[]`
 *   before the first (`ui-render` says when).
 ****************/
export class UIMarkdownHost extends SourceHost {
  get headings(): MarkdownHeading[] {
    return (this.controller as unknown as MarkdownController | undefined)?.getHeadings() ?? []
  }
}
