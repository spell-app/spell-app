/****************
 * ### `HtmlFormatter`
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
 ****************/
export class HtmlFormatter {
  /** Max line length before an element is expanded onto several lines. */
  readonly width: number

  /** One level of indentation. */
  readonly indent: string

  constructor({ width = 100, indent = "  " }: HtmlFormatterProps = {}) {
    this.width = width
    this.indent = indent
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
  private parse(html: string): HtmlElementNode {
    const root: HtmlElementNode = { kind: "element", tag: "#root", open: "", children: [] }
    const stack: HtmlElementNode[] = [root]
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
        const depth = stack.findLastIndex((open) => open.tag === tagName!.toLowerCase())
        if (depth > 0) stack.length = depth
      } else {
        const tag = tagName!.toLowerCase()
        const element: HtmlElementNode = { kind: "element", tag, open: HtmlFormatter.cleanOpenTag(token), children: [] }
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
  private printElement(element: HtmlElementNode, depth: number): string[] {
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
  private inlineChildren(element: HtmlElementNode): string {
    return element.children
      .map((child) => this.inline(child))
      .join("")
      .replace(/\s+/g, " ")
      .trim()
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * Format `html` with default options.
   * - Static:  the one call `ExampleSource` needs;  a formatter with other options is `new HtmlFormatter(props)`.
   */
  static format(html: string): string {
    return new HtmlFormatter().format(html)
  }

  /**
   * Undo artefacts in an opening tag, so the shown code reads as authored:
   * - whitespace (newlines between attributes) collapses to one space, outside quoted values
   * - `basic=""` => `basic`:  `innerHTML` serializes every boolean attribute with an empty value
   * - `basic="true"` => `basic`:  JSX renders a bare attribute as `="true"`;  the library reads both alike.
   *   NEVER for `aria-*` or enumerated attributes (`draggable` ...), where `"true"` is the value.
   * - Static:  pure, whatever the options.
   */
  private static cleanOpenTag(tag: string): string {
    return tag
      .replace(/("[^"]*"|'[^']*')|\s+/g, (whole, quoted: string | undefined) => quoted ?? " ")
      .replace(/ (\/?>)$/, "$1")
      .replace(/(\s)([\w:-]+)=""/g, "$1$2")
      .replace(/(\s)([\w:-]+)="true"/g, (whole, space: string, name: string) =>
        name.startsWith(ARIA_PREFIX) || ENUMERATED_TRUE.has(name) ? whole : space + name
      )
  }
}

/** Props of `new HtmlFormatter()`. */
export type HtmlFormatterProps = {
  /** max line length before expanding an element, default `100` */
  width?: number
  /** one indentation level, default two spaces */
  indent?: string
}

/** A parsed node. */
type HtmlNode = HtmlElementNode | { kind: "text"; text: string } | { kind: "comment"; text: string }

/** A parsed element. */
type HtmlElementNode = {
  kind: "element"
  /** lower-case tag name, `#root` for the synthetic root */
  tag: string
  /** the opening tag as written, whitespace collapsed, minus rendering artefacts (`cleanOpenTag()`) */
  open: string
  /** child nodes, empty for void and raw-text elements */
  children: HtmlNode[]
  /** verbatim content of a raw-text element (`<pre>`, `<script>` ...) */
  raw?: string
}

/** Attribute prefix whose `"true"` is a value, never a boolean presence. */
const ARIA_PREFIX = "aria-"

/** Attributes whose `"true"` is an enumerated VALUE, not a boolean presence. */
const ENUMERATED_TRUE = new Set(["contenteditable", "draggable", "spellcheck", "translate", "autocapitalize"])

/**
 * One token:  a comment (group 1), or a tag with an optional `/` (group 2) and its name (group 3).
 * - Attribute values may contain `>`, so quoted values are matched explicitly.
 * - Global:  `parse()` walks it with `exec()`, resetting `lastIndex` first.
 */
const TOKEN =
  /(<!--[\s\S]*?-->)|<(\/?)([a-zA-Z][\w:-]*)(?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*\s*\/?>/g

/** Elements with no content or closing tag. */
const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr"
])

/** Elements whose content is not parsed:  kept as text. */
const RAW = new Set(["pre", "textarea", "script", "style", "ui-code", "ui-markdown"])

/** Raw elements whose content is printed exactly as found, never re-indented. */
const VERBATIM = new Set(["pre", "textarea", "ui-code", "ui-markdown"])

/** Text-level elements that stay on the same line as surrounding text. */
const INLINE = new Set([
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "q",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr"
])
