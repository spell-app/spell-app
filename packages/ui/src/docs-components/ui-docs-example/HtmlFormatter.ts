import {
  ENUMERATED_TRUE,
  INLINE,
  RAW,
  TOKEN,
  VERBATIM,
  VOID,
  type HtmlElement,
  type HtmlFormatterOptions,
  type HtmlNode
} from "./ui-docs-example.types"

/**
 * Pretty-prints an HTML fragment for `<ui-docs-example>`'s code pane (`ExampleSource`).
 * - Why re-indent, not show the markup as found:  it comes from `innerHTML`, indented however the page around it
 *   was (and a `<ui-include>`d part, or a live tree, has no indentation of its own), so it's rebuilt to one style.
 * - From the old Astro site's `HtmlFormatter` (deleted with it, epic `spell-ui-pages` P7), plus:
 *   - whitespace inside an opening tag collapses to one space (an author's attributes over several lines)
 *   - `<ui-code>` and `<ui-markdown>` keep their content verbatim, like `<pre>`:  it's code / markdown text
 * - Deliberately small, not a full HTML parser:  examples are hand-written, well-formed fragments.
 * - Rules, prettier-ish:
 *   - text-level elements (`<a>`, `<code>`, `<strong>` ...) and text stay together on one line as a "run"
 *   - every other element, `ui-*` included, starts its own line
 *   - an element with no block-level children that fits in `width` stays on one line
 *   - `<pre>`, `<textarea>`, `<script>`, `<style>`, `<ui-code>`, `<ui-markdown>` keep their content verbatim
 * - Pure:  text in, text out.
 */
export class HtmlFormatter {
  /** Max line length before an element is expanded onto several lines. */
  readonly width: number
  /** One level of indentation. */
  readonly indent: string

  constructor({ width = 100, indent = "  " }: HtmlFormatterOptions = {}) {
    this.width = width
    this.indent = indent
  }

  /** Format `html` with default options. */
  static format(html: string): string {
    return new HtmlFormatter().format(html)
  }

  /** Format `html`:  parse it into a tree, then print it. */
  format(html: string): string {
    const root = this.parse(html)
    return this.printChildren(root.children, 0).join("\n").trim()
  }

  ////////////////
  // ## Parsing
  ////////////////

  /** Parse `html` into a tree of `HtmlNode`s under a synthetic root;  unbalanced closers are ignored. */
  private parse(html: string): HtmlElement {
    const root: HtmlElement = { kind: "element", tag: "#root", open: "", children: [] }
    const stack: HtmlElement[] = [root]
    let last = 0
    TOKEN.lastIndex = 0
    for (let match = TOKEN.exec(html); match; match = TOKEN.exec(html)) {
      const parent = stack.at(-1)!
      if (match.index > last) parent.children.push({ kind: "text", text: html.slice(last, match.index) })
      last = TOKEN.lastIndex
      const [token, comment, closing, tagName] = match
      if (comment !== undefined) {
        parent.children.push({ kind: "comment", text: token })
      } else if (closing) {
        const depth = stack.findLastIndex((el) => el.tag === tagName!.toLowerCase())
        if (depth > 0) stack.length = depth
      } else {
        const tag = tagName!.toLowerCase()
        const element: HtmlElement = { kind: "element", tag, open: HtmlFormatter.cleanOpenTag(token), children: [] }
        parent.children.push(element)
        if (RAW.has(tag)) {
          // raw text elements:  everything up to the matching closer is content, verbatim
          const end = html.toLowerCase().indexOf(`</${tag}`, last)
          const stop = end === -1 ? html.length : end
          element.raw = html.slice(last, stop)
          const close = html.indexOf(">", stop)
          last = close === -1 ? html.length : close + 1
          TOKEN.lastIndex = last
        } else if (!VOID.has(tag) && !token.endsWith("/>")) {
          stack.push(element)
        }
      }
    }
    if (last < html.length) stack.at(-1)!.children.push({ kind: "text", text: html.slice(last) })
    return root
  }

  ////////////////
  // ## Printing
  ////////////////

  /** Print `nodes` at `depth`:  inline runs joined onto one line, block elements one per line. */
  private printChildren(nodes: HtmlNode[], depth: number): string[] {
    const lines: string[] = []
    const pad = this.indent.repeat(depth)
    let run = ""
    for (const node of nodes) {
      if (this.isInline(node)) {
        run += this.inline(node)
        continue
      }
      flushRun()
      if (node.kind === "comment") lines.push(pad + node.text.trim())
      else if (node.kind === "element") lines.push(...this.printElement(node, depth))
    }
    flushRun()
    return lines

    /** Push the pending inline run as one line, whitespace collapsed. */
    function flushRun() {
      const text = run.replace(/\s+/g, " ").trim()
      if (text) lines.push(pad + text)
      run = ""
    }
  }

  /** Print one block-level element:  on one line if it fits and has no block children, else expanded. */
  private printElement(element: HtmlElement, depth: number): string[] {
    const pad = this.indent.repeat(depth)
    const close = VOID.has(element.tag) ? "" : `</${element.tag}>`
    if (element.raw !== undefined) {
      // `<pre>` / `<textarea>` / code text:  whitespace is content, never re-indent it
      if (VERBATIM.has(element.tag)) return [pad + element.open + element.raw + close]
      const raw = element.raw.replace(/^\n+|\s+$/g, "")
      if (!raw.includes("\n")) return [`${pad}${element.open}${raw}${close}`]
      return [pad + element.open, ...this.reindent(raw, pad + this.indent), pad + close]
    }
    if (!element.children.some((child) => !this.isInline(child))) {
      const oneLine = pad + element.open + this.inlineChildren(element) + close
      if (oneLine.length <= this.width) return [oneLine]
    }
    const inner = this.printChildren(element.children, depth + 1)
    if (!inner.length) return [pad + element.open + close]
    return [pad + element.open, ...inner, pad + close]
  }

  /**
   * `raw`'s lines (a `<script>` / `<style>` body) moved to `pad`:  their common leading whitespace dropped, so a
   * script indented with the page around it reads like the markup around it.  Blank lines stay blank.
   */
  private reindent(raw: string, pad: string): string[] {
    const lines = raw.split("\n")
    const common = Math.min(...lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)![0].length))
    return lines.map((line) => (line.trim() ? pad + line.slice(common) : ""))
  }

  /** Is `node` part of an inline run (text, or a text-level element with only inline content)? */
  private isInline(node: HtmlNode): boolean {
    if (node.kind === "text") return true
    if (node.kind === "comment") return false
    return INLINE.has(node.tag) && node.children.every((child) => this.isInline(child))
  }

  /** `node` on one line. */
  private inline(node: HtmlNode): string {
    if (node.kind !== "element") return node.text
    const close = VOID.has(node.tag) ? "" : `</${node.tag}>`
    return node.open + (node.raw ?? this.inlineChildren(node)) + close
  }

  /** `element`'s children on one line, whitespace collapsed and trimmed. */
  private inlineChildren(element: HtmlElement): string {
    return element.children
      .map((child) => this.inline(child))
      .join("")
      .replace(/\s+/g, " ")
      .trim()
  }

  /**
   * Undo artefacts in an opening tag, so the shown code reads as authored:
   * - whitespace (newlines between attributes) collapses to one space, outside quoted values
   * - `basic=""` => `basic`:  `innerHTML` serializes every boolean attribute with an empty value
   * - `basic="true"` => `basic`:  JSX renders a bare attribute as `="true"`;  the library reads both alike.
   *   NEVER for `aria-*` or enumerated attributes (`draggable` ...), where `"true"` is the value.
   */
  private static cleanOpenTag(tag: string): string {
    return tag
      .replace(/("[^"]*"|'[^']*')|\s+/g, (whole, quoted: string | undefined) => quoted ?? " ")
      .replace(/ (\/?>)$/, "$1")
      .replace(/(\s)([\w:-]+)=""/g, "$1$2")
      .replace(/(\s)([\w:-]+)="true"/g, (whole, space: string, name: string) =>
        name.startsWith("aria-") || ENUMERATED_TRUE.has(name) ? whole : space + name
      )
  }
}
