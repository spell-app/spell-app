/**
 * Pretty-prints an HTML fragment for the "Show code" pane of `Example.astro`.
 * - Why not the author's own text:  Astro only hands a component its slot RENDERED
 *   (`Astro.slots.render()`), and MDX drops the original whitespace, so the source is rebuilt from the
 *   rendered HTML.  Authors write each example once.
 * - Deliberately small, not a full HTML parser:  examples are hand-written, well-formed fragments.
 * - Rules, prettier-ish:
 *   - text-level elements (`<a>`, `<code>`, `<strong>` ...) and text stay together on one line as a "run"
 *   - every other element, `ui-*` included, starts its own line
 *   - an element with no block-level children that fits in `width` stays on one line
 *   - `<pre>`, `<textarea>`, `<script>`, `<style>` keep their content verbatim
 * - SIDE EFFECT free:  Astro's own annotations (`data-astro-cid-*`, `data-astro-source-*`) are dropped from
 *   the OUTPUT only;  the live example keeps whatever Astro rendered.
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
        const element: HtmlElement = { kind: "element", tag, open: cleanOpenTag(token), children: [] }
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
      // `<pre>` / `<textarea>` whitespace is content:  never re-indent it
      if (element.tag === "pre" || element.tag === "textarea") return [pad + element.open + element.raw + close]
      const raw = element.raw.replace(/^\n+|\s+$/g, "")
      if (!raw.includes("\n")) return [`${pad}${element.open}${raw}${close}`]
      return [pad + element.open, raw, pad + close]
    }
    if (!element.children.some((child) => !this.isInline(child))) {
      const oneLine = pad + element.open + this.inlineChildren(element) + close
      if (oneLine.length <= this.width) return [oneLine]
    }
    const inner = this.printChildren(element.children, depth + 1)
    if (!inner.length) return [pad + element.open + close]
    return [pad + element.open, ...inner, pad + close]
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
}

/** Options for `new HtmlFormatter()`. */
export type HtmlFormatterOptions = {
  /** max line length before expanding an element, default `100` */
  width?: number
  /** one indentation level, default two spaces */
  indent?: string
}

/** A parsed node. */
export type HtmlNode = HtmlElement | { kind: "text"; text: string } | { kind: "comment"; text: string }

/** A parsed element. */
export type HtmlElement = {
  kind: "element"
  /** lower-case tag name, `#root` for the synthetic root */
  tag: string
  /** the opening tag as written, minus Astro's annotations */
  open: string
  /** child nodes, empty for void and raw-text elements */
  children: HtmlNode[]
  /** verbatim content of a raw-text element (`<pre>`, `<script>` ...) */
  raw?: string
}

/**
 * Undo rendering artefacts in an opening tag, so the shown code reads as authored:
 * - drop Astro's `data-astro-*` annotations (scoped-style ids, dev source locations)
 * - `basic="true"` => `basic`:  MDX renders a bare JSX attribute as `="true"`;  the library reads both alike.
 *   NEVER for `aria-*` or enumerated attributes (`draggable` ...), where `"true"` is the value.
 */
function cleanOpenTag(tag: string): string {
  return tag
    .replace(/\s+data-astro-[\w-]+(?:="[^"]*")?/g, "")
    .replace(/(\s)([\w:-]+)="true"/g, (whole, space: string, name: string) =>
      name.startsWith("aria-") || ENUMERATED_TRUE.has(name) ? whole : space + name
    )
}

/** Attributes whose `"true"` is an enumerated VALUE, not a boolean presence. */
const ENUMERATED_TRUE = new Set(["contenteditable", "draggable", "spellcheck", "translate", "autocapitalize"])

/**
 * One token:  a comment (group 1), or a tag with an optional `/` (group 2) and its name (group 3).
 * - Attribute values may contain `>`, so quoted values are matched explicitly.
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

/** Elements whose content is kept verbatim. */
const RAW = new Set(["pre", "textarea", "script", "style"])

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
