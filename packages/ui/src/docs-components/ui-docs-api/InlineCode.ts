import type { InlinePiece } from "./ui-docs-api.types"

/****************
 * ### `InlineCode`
 * The one bit of markdown the vocabularies' descriptions use:  `` `code` `` spans, split out of plain text so the
 * element can draw them as `<code>` -- never as HTML:  the text stays text.
 * - CommonMark's rules:  a run of N backticks opens a span that only a run of EXACTLY N closes (so
 *   `` `` `x` `` `` shows `` `x` ``);  an unclosed run is literal;  one space is trimmed from each end of a span
 *   that has both (and isn't all spaces).
 * - Why not `<ui-markdown>`:  it has no inline mode (it always renders a block `<article>` of `<p>`s), and one per
 *   table cell would be hundreds of elements (plan-doc gap).
 * - Static:  pure, text in, pieces out;  shared by the element, its fallback and `ApiModel`.
 ****************/
export class InlineCode {
  /** `text` as plain and code pieces, in order;  empty pieces dropped. */
  static parse(text: string): InlinePiece[] {
    const pieces: InlinePiece[] = []
    const runs = [...text.matchAll(BACKTICKS)]
    let plain = ""
    let at = 0
    for (let index = 0; index < runs.length; index++) {
      const open = runs[index]!
      if (open.index < at) continue
      const close = runs.findIndex((run, later) => later > index && run[0].length === open[0].length)
      if (close < 0) continue
      const end = runs[close]!
      plain += text.slice(at, open.index)
      if (plain) pieces.push({ text: plain, isCode: false })
      plain = ""
      pieces.push({ text: InlineCode.trim(text.slice(open.index + open[0].length, end.index)), isCode: true })
      at = end.index + end[0].length
      index = close
    }
    plain += text.slice(at)
    if (plain) pieces.push({ text: plain, isCode: false })
    return pieces
  }

  /**
   * `code` as a code span:  fenced by one more backtick than its longest run, padded with spaces when it starts or
   * ends with a backtick.  `InlineCode.parse(InlineCode.wrap(x))` ~== one code piece `x`.
   */
  static wrap(code: string): string {
    const longest = Math.max(0, ...[...code.matchAll(BACKTICKS)].map((run) => run[0].length))
    const fence = BACKTICK.repeat(longest + 1)
    const pad = code.startsWith(BACKTICK) || code.endsWith(BACKTICK) ? " " : ""
    return `${fence}${pad}${code}${pad}${fence}`
  }

  /** A span's content:  line breaks as spaces, one space off each end when both have one. */
  private static trim(content: string): string {
    const flat = content.replace(/\r?\n/g, " ")
    return flat.length > 2 && flat.startsWith(" ") && flat.endsWith(" ") && flat.trim() ? flat.slice(1, -1) : flat
  }
}

/** One backtick. */
const BACKTICK = "`"

/** A run of backticks (a code span's fence). */
const BACKTICKS = /`+/g
