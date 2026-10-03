import type { CodeSpan } from "$/ui/core"

import { HLJS_PREFIX } from "./ui-code.types"

/****************
 * ### `CodeLines`
 * Highlighted code as lines:  `<ui-code>` wraps each line in its own `<span class="line">`, so line numbers (CSS
 * counters) and wrapping work per line.
 * - `split()` cuts highlighted HTML at its newlines, closing the spans open at the cut and reopening them on the
 *   next line:  a multi-line comment stays coloured on every line.
 * - `fromSpans()` turns a highlighter of our own's spans (spell's) into the same HTML highlight.js makes.
 * - Input HTML is ONLY what these make or highlight.js makes:  escaped text and `<span class="...">`.
 ****************/
export class CodeLines {
  /** HTML escapes. */
  private static readonly ESCAPES: Readonly<Record<string, string>> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }

  /** The tokens `split()` cares about:  span tags and newlines. */
  private static readonly TOKENS = /(<span[^>]*>|<\/span>|\n)/

  /** A span's opening and closing tags. */
  private static readonly OPEN = "<span"
  private static readonly CLOSE = "</span>"

  /** `text` safe as HTML text. */
  static escape(text: string): string {
    return text.replace(/[&<>"']/g, (char) => CodeLines.ESCAPES[char]!)
  }

  /** highlight.js's class for scope `kind`:  `keyword` => `hljs-keyword`, `title.function` => `hljs-title function_`. */
  static className(kind: string): string {
    const [first, ...rest] = kind.split(".")
    return [HLJS_PREFIX + first, ...rest.map((piece, index) => piece + "_".repeat(index + 1))].join(" ")
  }

  /** `code` as HTML, each span in `spans` (in order, not overlapping) coloured by its `kind`. */
  static fromSpans(code: string, spans: readonly CodeSpan[]): string {
    let html = ""
    let at = 0
    for (const { start, end, kind } of [...spans].sort((a, b) => a.start - b.start)) {
      if (start < at || end <= start) continue
      html += CodeLines.escape(code.slice(at, start))
      html += `<span class="${CodeLines.className(kind)}">${CodeLines.escape(code.slice(start, end))}</span>`
      at = end
    }
    return html + CodeLines.escape(code.slice(at))
  }

  /**
   * `html` cut into lines, each closing the spans still open at its end;  the next line reopens them.
   * - A final newline makes no empty last line (files end with one).
   */
  static split(html: string): string[] {
    const lines: string[] = []
    const open: string[] = []
    let line = ""
    for (const token of html.split(CodeLines.TOKENS)) {
      if (!token) continue
      if (token === "\n") {
        lines.push(line + CodeLines.CLOSE.repeat(open.length))
        line = open.join("")
      } else if (token === CodeLines.CLOSE) {
        open.pop()
        line += token
      } else {
        if (token.startsWith(CodeLines.OPEN)) open.push(token)
        line += token
      }
    }
    if (line !== open.join("") || !lines.length) lines.push(line + CodeLines.CLOSE.repeat(open.length))
    return lines
  }
}
