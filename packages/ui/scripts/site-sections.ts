/**
 * `yarn site:sections [--check] [page ...]`:  turn the Spell UI site's flat pages into NESTED `<ui-section>`s, with
 * ids that spell out their nesting, written into the markup (plan doc ui-docs-rework, D8).
 * - Content roots:  each pane of a page's `<ui-tabs id="site-tabs">` (`<ui-tab value>`), else its
 *   `<article class="site-article">`.  Only their DIRECT children are read:  headers inside an example, a grid or a
 *   demo are content, never sections.
 * - Within a root:
 *   - a level 2 `<ui-header>` and everything after it (until the next one) becomes
 *     `<ui-section id="<tab>-<slug>" header="<text>" sticky collapsible dividing>`
 *   - a level 3 `<ui-header>` becomes a section nested in the level 2 one, the same way
 *   - a `<ui-docs-example header="X">` becomes a section nested in the innermost one, `id="<parent id>-<slug(X)>"`,
 *     holding the example WITHOUT its `header`;  the header-less examples right after it (Fomantic's
 *     `.another.example`) go in with it
 *   - a header holding markup (`<code>` ...) keeps it as the section's `<span slot="header">`
 *   - ids:  the pane's value, then each level's slug (lowercase kebab of its header, `TocIndex.slug()`);  a page
 *     without tabs starts at the slug (`#general-usage`, `#general-usage-descriptive-attributes`).  Made unique in
 *     the page with `-2`, `-3` ...
 * - Comments go with the content they precede:  a `GAP` note before an example lands just before that example's
 *   section.  A generator's marker (`<!-- kitchen:start -->`, `<!-- components:end -->`) closes every open section
 *   and stays at the root, so `yarn site:index` / `yarn site:kitchen` can splice between them (both run this on
 *   their output).
 * - Existing sections:  their ids are checked against their nesting and FIXED (a renamed header, a moved section);
 *   their content is converted the same way.  So running it twice changes nothing, and it is the fix for
 *   `yarn site:check`'s "section id doesn't follow its nesting".
 * - Text-level, not a DOM round trip:  every untouched line keeps its bytes;  moved content is re-indented 2 spaces
 *   per new level (markdown / code blocks strip common indentation, so they read the same).
 * - `--check`:  write nothing;  exit 1 if a page would change.  No pages named:  every page of the site.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { TocIndex } from "../src/docs-components/ui-docs-toc/TocIndex.ts"

/** `packages/ui/`. */
const UI = path.resolve(import.meta.dirname, "..")

/** The site's folder. */
const SITE = path.join(UI, "site")

/****************
 * ### `SiteSections`
 * Converts one page's text:  `SiteSections.convert(html)`.  See the file's header.
 ****************/
export class SiteSections {
  /** oxfmt's line width (`.oxfmtrc.json`):  a longer start tag breaks one attribute per line. */
  static readonly WIDTH = 120

  /** Attributes every page section gets after `id` and `header`. */
  static readonly FLAGS = ["sticky", "collapsible", "dividing"]

  /** A generator's marker comment:  `<!-- kitchen:start -->`, `<!-- site:page:end -->`. */
  static readonly MARKER = /^<!--\s*[\w:-]+:(start|end)\s*-->$/

  /** Levels of what opens a section:  a level 2 header, a level 3 header, an example. */
  static readonly EXAMPLE_LEVEL = 4

  /** `html` with its sections nested and their ids fixed;  the same text when nothing changes. */
  static convert(html: string): string {
    return new SiteSections(html).run()
  }

  /** The page's parsed tree. */
  private readonly root: HtmlNode

  /** Replacements, as `[start, end, text]` over the original, applied last-first. */
  private readonly edits: [number, number, string][] = []

  /** Ids taken in the page:  every element id except the sections' and the headers' this converts. */
  private readonly taken = new Set<string>()

  /** Changes made so far (sections made, ids fixed):  a container without any keeps its exact text. */
  private changes = 0

  private constructor(private readonly html: string) {
    this.root = HtmlParser.parse(html)
  }

  /** Convert every content root;  apply the edits. */
  private run(): string {
    const roots = this.contentRoots()
    if (!roots.length) return this.html
    this.collectTaken(roots)
    for (const { element, prefix } of roots) this.convertRoot(element, prefix)
    let out = this.html
    for (const [start, end, text] of this.edits.sort((a, b) => b[0] - a[0])) {
      out = out.slice(0, start) + text + out.slice(end)
    }
    return out
  }

  ////////////////
  // ## Content roots
  ////////////////

  /** The panes of `#site-tabs` (prefix:  their value), else every `article.site-article` (no prefix). */
  private contentRoots(): { element: HtmlNode; prefix: string }[] {
    const tabs = HtmlNode.find(this.root, (node) => node.tag === "ui-tabs" && node.attr("id") === "site-tabs")
    if (tabs) {
      return tabs.children
        .filter((child) => child.tag === "ui-tab" && child.attr("value"))
        .map((element) => ({ element, prefix: element.attr("value")! }))
    }
    return HtmlNode.findAll(this.root, (node) => node.tag === "article" && node.hasClass("site-article")).map(
      (element) => ({ element, prefix: "" })
    )
  }

  /** Every id in the page that isn't a page section's or a header's about to become one. */
  private collectTaken(roots: { element: HtmlNode }[]): void {
    const own = new Set<HtmlNode>()
    for (const { element } of roots) for (const node of this.sectionLike(element)) own.add(node)
    for (const node of HtmlNode.findAll(this.root, (node) => !!node.attr("id"))) {
      if (!own.has(node)) this.taken.add(node.attr("id")!)
    }
  }

  /** The page sections and section headers under `container`, at any depth of page sections. */
  private *sectionLike(container: HtmlNode): Generator<HtmlNode> {
    for (const child of container.children) {
      if (SiteSections.headerLevel(child)) yield child
      else if (child.tag === "ui-section") {
        yield child
        yield* this.sectionLike(child)
      }
    }
  }

  ////////////////
  // ## Converting
  ////////////////

  /**
   * Convert `container`'s children, whose own id (the prefix of theirs) is `parentId`;  `extra`:  spaces every line
   * of the result moves right (the new sections around it).  Returns the new inner text.
   * - Nothing to change (no header, headed example or stale id among the children, nor deeper):  the original
   *   text, only moved.
   */
  private convertInner(container: HtmlNode, parentId: string, extra: number): string {
    const changes = this.changes
    const items = this.build(container, parentId)
    const inner = this.renderItems(items, container, extra)
    const original = this.html.slice(container.innerStart, container.innerEnd)
    return this.changes === changes ? SiteSections.shift(original, extra, true) : inner
  }

  /** Convert a content root in place:  an edit over its inner text. */
  private convertRoot(container: HtmlNode, prefix: string): void {
    if (container.innerStart === undefined) return
    const inner = this.convertInner(container, prefix, 0)
    if (inner !== this.html.slice(container.innerStart, container.innerEnd))
      this.edits.push([container.innerStart, container.innerEnd!, inner])
  }

  /** `container`'s children grouped into the sections they open. */
  private build(container: HtmlNode, parentId: string): Item[] {
    const top: Frame = { level: 0, items: [], id: parentId }
    const stack: Frame[] = [top]
    let pending: HtmlNode[] = []
    for (const child of container.children) {
      if (child.kind === "text" && !child.text().trim()) continue
      if (child.kind === "comment") {
        if (SiteSections.MARKER.test(child.text().trim())) {
          stack.length = 1
          SiteSections.push(top, pending, child)
          pending = []
        } else pending.push(child)
        continue
      }
      const level = SiteSections.headerLevel(child)
      if (level) {
        while (stack.length > 1 && stack.at(-1)!.level >= level) stack.pop()
        stack.push(this.open(stack.at(-1)!, pending, child, level))
      } else if (SiteSections.isHeadedExample(child)) {
        while (stack.length > 1 && stack.at(-1)!.level >= SiteSections.EXAMPLE_LEVEL) stack.pop()
        const frame = this.open(stack.at(-1)!, pending, child, SiteSections.EXAMPLE_LEVEL)
        SiteSections.push(frame, [], child)
        stack.push(frame)
      } else {
        // only header-less examples continue an example's section
        if (stack.at(-1)!.level === SiteSections.EXAMPLE_LEVEL && child.tag !== "ui-docs-example") stack.pop()
        SiteSections.push(stack.at(-1)!, pending, child)
      }
      pending = []
    }
    for (const comment of pending) SiteSections.push(stack.at(-1)!, [], comment)
    return top.items
  }

  /** A new section in `parent` for `opener` (a header, or a headed example), after `comments`. */
  private open(parent: Frame, comments: HtmlNode[], opener: HtmlNode, level: number): Frame {
    const header = SiteSections.headerOf(opener)
    const id = this.idFor(parent.id, header.text)
    this.changes++
    const section: SectionItem = {
      kind: "section",
      comments,
      blankBefore: SiteSections.blankBefore(comments[0] ?? opener),
      id,
      header,
      children: []
    }
    parent.items.push(section)
    return { level, items: section.children, id }
  }

  /** A node (and the comments before it) into `frame`;  an existing section is a section item. */
  private static push(frame: Frame, comments: HtmlNode[], node: HtmlNode): void {
    const blankBefore = SiteSections.blankBefore(comments[0] ?? node)
    frame.items.push({ kind: "node", comments, node, blankBefore, parentId: frame.id })
  }

  /** The id for a section headed `text` under `parentId`:  `<parent>-<slug>` (or the slug), unique in the page. */
  private idFor(parentId: string, text: string): string {
    const base = parentId ? `${parentId}-${TocIndex.slug(text)}` : TocIndex.slug(text)
    let id = base
    for (let n = 2; this.taken.has(id); n++) id = `${base}-${n}`
    this.taken.add(id)
    return id
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** `items` as the inner text of `container` (which closes at its own indent), `extra` spaces further right. */
  private renderItems(items: Item[], container: HtmlNode, extra: number): string {
    const indent = this.childIndent(container)
    let out = ""
    items.forEach((item, index) => {
      out += "\n" + (item.blankBefore && index > 0 ? "\n" : "") + this.renderItem(item, indent + extra)
    })
    const close = container.innerEnd !== undefined ? this.lineIndent(container.innerEnd) : 0
    return out + "\n" + " ".repeat(close + extra)
  }

  /** One item at `column`. */
  private renderItem(item: Item, column: number): string {
    const lines: string[] = []
    for (const comment of item.comments) lines.push(this.reindent(comment, column))
    if (item.kind === "node") {
      if (item.node.tag === "ui-section" && !SiteSections.headerLevel(item.node))
        lines.push(this.renderExisting(item.node, item.parentId, column))
      else if (SiteSections.isHeadedExample(item.node)) lines.push(this.renderExample(item.node, column))
      else lines.push(this.reindent(item.node, column))
      return lines.join("\n")
    }
    const pad = " ".repeat(column)
    lines.push(this.startTag(column, "ui-section", SiteSections.sectionAttributes(item.id, item.header)))
    if (item.header.slot) lines.push(`${pad}  <span slot="header">${item.header.slot}</span>`)
    item.children.forEach((child, index) => {
      if (child.blankBefore && index > 0) lines.push("")
      lines.push(this.renderItem(child, column + 2))
    })
    lines.push(`${pad}</ui-section>`)
    return lines.join("\n")
  }

  /** An existing page section at `column`:  its id fixed for `parentId`, its content converted. */
  private renderExisting(section: HtmlNode, parentId: string, column: number): string {
    const header = SiteSections.headerOf(section)
    const want = this.idFor(parentId, header.text)
    const extra = column - this.lineIndent(section.start)
    let startTag = this.html.slice(section.start, section.startTagEnd)
    if (section.attr("id") !== want) {
      this.changes++
      startTag = section.attr("id")
        ? startTag.replace(/(\sid=")[^"]*(")/, `$1${want}$2`)
        : startTag.replace(/^<ui-section/, `<ui-section id="${want}"`)
    }
    const inner = this.convertInner(section, want, extra)
    const end = this.html.slice(section.innerEnd, section.end)
    return SiteSections.shift(" ".repeat(this.lineIndent(section.start)) + startTag, extra) + inner + end
  }

  /** A headed example at `column`, without its `header` (the section around it shows it). */
  private renderExample(example: HtmlNode, column: number): string {
    const attributes = example.attributes.filter((attribute) => attribute.name !== "header").map((a) => a.raw)
    const extra = column - this.lineIndent(example.start)
    const body = this.html.slice(example.startTagEnd, example.end)
    return this.startTag(column, example.tag!, attributes) + SiteSections.shift(body, extra, true)
  }

  /** A start tag at `column`:  on one line if it fits, else one attribute per line (as oxfmt lays it out). */
  private startTag(column: number, tag: string, attributes: string[]): string {
    const pad = " ".repeat(column)
    const line = `${pad}<${tag}${attributes.map((attribute) => ` ${attribute}`).join("")}>`
    if (line.length <= SiteSections.WIDTH || !attributes.length) return line
    return [`${pad}<${tag}`, ...attributes.map((attribute) => `${pad}  ${attribute}`), `${pad}>`].join("\n")
  }

  /** `node`'s text from its line's indent, moved to start at `column` (a text node:  trimmed). */
  private reindent(node: HtmlNode, column: number): string {
    let { start, end } = node
    if (node.kind === "text") {
      start += node.text().length - node.text().trimStart().length
      end -= node.text().length - node.text().trimEnd().length
    }
    const indent = this.lineIndent(start)
    return SiteSections.shift(" ".repeat(indent) + this.html.slice(start, end), column - indent)
  }

  /** Indent of the line `offset` is on (spaces before the first non-space). */
  private lineIndent(offset: number): number {
    const lineStart = this.html.lastIndexOf("\n", offset - 1) + 1
    const match = /^ */.exec(this.html.slice(lineStart, offset))
    return match ? match[0].length : 0
  }

  /** Indent of `container`'s children:  its first element child's, else its own + 2. */
  private childIndent(container: HtmlNode): number {
    const first = container.children.find((child) => child.kind !== "text")
    return first ? this.lineIndent(first.start) : this.lineIndent(container.start) + 2
  }

  ////////////////
  // ## Helpers
  ////////////////

  /**
   * `text` with every line but blank ones moved `by` spaces (left when negative);  `skipFirst`:  not its first line
   * (the rest of a line that started earlier).
   */
  private static shift(text: string, by: number, skipFirst = false): string {
    if (!by) return text
    return text
      .split("\n")
      .map((line, index) => {
        if (!line.trim() || (skipFirst && index === 0)) return line
        if (by > 0) return " ".repeat(by) + line
        return line.slice(Math.min(-by, /^ */.exec(line)![0].length))
      })
      .join("\n")
  }

  /** A page section's attributes:  `id`, `header` (unless slotted), then the flags. */
  private static sectionAttributes(id: string, header: Header): string[] {
    return [`id="${id}"`, ...(header.slot ? [] : [`header="${header.attribute}"`]), ...SiteSections.FLAGS]
  }

  /** 2 or 3 for a section header (`<ui-header level="2|3">`), else 0. */
  private static headerLevel(node: HtmlNode): number {
    if (node.tag !== "ui-header") return 0
    const level = node.attr("level")
    return level === "2" ? 2 : level === "3" ? 3 : 0
  }

  /** An example with a `header`:  it opens a section. */
  private static isHeadedExample(node: HtmlNode): boolean {
    return node.tag === "ui-docs-example" && !!node.attr("header")?.trim()
  }

  /** A header's text (for the slug), its attribute form, and its markup when it holds any. */
  private static headerOf(node: HtmlNode): Header {
    if (node.tag === "ui-docs-example" || node.tag === "ui-section") {
      const raw = node.rawAttr("header")
      if (raw !== undefined) return { text: HtmlParser.decode(raw), attribute: raw }
      const slot = node.children.find((child) => child.attr("slot") === "header")
      const inner = slot ? slot.innerText() : ""
      return { text: HtmlParser.decode(HtmlParser.stripTags(inner)), attribute: "", slot: inner.trim() }
    }
    const inner = node.innerText().replace(/\s+/g, " ").trim()
    if (/<[a-z]/i.test(inner))
      return { text: HtmlParser.decode(HtmlParser.stripTags(inner)), attribute: "", slot: inner }
    return { text: HtmlParser.decode(inner), attribute: inner.replaceAll('"', "&quot;") }
  }

  /** A blank line before `node` in the original. */
  private static blankBefore(node: HtmlNode): boolean {
    const previous = node.previous()
    return previous?.kind === "text" && (previous.text().match(/\n/g)?.length ?? 0) >= 2
  }
}

/** A converted container's piece:  a node kept as it is (with its comments), or a new section. */
type Item = NodeItem | SectionItem

/** A node kept (an existing section is re-rendered with its id fixed). */
type NodeItem = {
  kind: "node"
  /** comments right before it */
  comments: HtmlNode[]
  node: HtmlNode
  /** a blank line before it (or its first comment) */
  blankBefore: boolean
  /** id of the section it ends up in (`""` at a page root without tabs) */
  parentId: string
}

/** A new section. */
type SectionItem = {
  kind: "section"
  /** comments before its opener:  written before the section */
  comments: HtmlNode[]
  blankBefore: boolean
  id: string
  header: Header
  children: Item[]
}

/** An open section while building:  its level (0 for the container), items and id. */
type Frame = { level: number; items: Item[]; id: string }

/** A section's header. */
type Header = {
  /** plain text, for the slug */
  text: string
  /** as an attribute value (escaped);  `""` when slotted */
  attribute: string
  /** markup for `<span slot="header">`, when the header holds tags */
  slot?: string
}

/****************
 * ### `HtmlNode`
 * One node of `HtmlParser`'s tree:  offsets into the page text, no DOM.
 ****************/
class HtmlNode {
  /** Children, in order. */
  readonly children: HtmlNode[] = []

  /** Parent, `undefined` for the document. */
  parent?: HtmlNode

  /** End offset of the start tag (elements). */
  startTagEnd = 0

  /** Content range (elements with an end tag). */
  innerStart?: number
  innerEnd?: number

  /** End offset of the whole node. */
  end = 0

  /** Attributes, in order (elements). */
  attributes: { name: string; value: string | undefined; raw: string }[] = []

  constructor(
    readonly kind: "document" | "element" | "text" | "comment",
    readonly start: number,
    readonly source: string,
    readonly tag?: string
  ) {}

  /** Decoded-as-written value of attribute `name` (raw text, entities kept), else `undefined`. */
  rawAttr(name: string): string | undefined {
    const attribute = this.attributes.find((a) => a.name === name)
    return attribute ? (attribute.value ?? "") : undefined
  }

  /** Value of attribute `name`, entities decoded. */
  attr(name: string): string | undefined {
    const raw = this.rawAttr(name)
    return raw === undefined ? undefined : HtmlParser.decode(raw)
  }

  /** Has class `name`. */
  hasClass(name: string): boolean {
    return (this.attr("class") ?? "").split(/\s+/).includes(name)
  }

  /** The node's own text (text and comment nodes:  all of it). */
  text(): string {
    return this.source.slice(this.start, this.end)
  }

  /** The source between the start and end tags. */
  innerText(): string {
    return this.innerStart === undefined ? "" : this.source.slice(this.innerStart, this.innerEnd)
  }

  /** The sibling before this one. */
  previous(): HtmlNode | undefined {
    const siblings = this.parent?.children ?? []
    return siblings[siblings.indexOf(this) - 1]
  }

  /** First node under `root` (depth first) matching `test`. */
  static find(root: HtmlNode, test: (node: HtmlNode) => boolean): HtmlNode | undefined {
    for (const child of root.children) {
      if (child.kind !== "element") continue
      if (test(child)) return child
      const found = HtmlNode.find(child, test)
      if (found) return found
    }
    return undefined
  }

  /** Every node under `root` matching `test`, in page order. */
  static findAll(root: HtmlNode, test: (node: HtmlNode) => boolean, into: HtmlNode[] = []): HtmlNode[] {
    for (const child of root.children) {
      if (child.kind !== "element") continue
      if (test(child)) into.push(child)
      HtmlNode.findAll(child, test, into)
    }
    return into
  }
}

/****************
 * ### `HtmlParser`
 * Just enough HTML parsing for hand-written, well-formed pages:  elements with offsets, comments, text, raw-text
 * elements (`script`, `style`, `textarea`, `title`), void elements;  an end tag closes up to its open element.
 ****************/
class HtmlParser {
  /** Elements that never have content. */
  static readonly VOID = new Set([
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

  /** Elements whose content is text up to their end tag. */
  static readonly RAW = new Set(["script", "style", "textarea", "title"])

  /** `html` as a tree. */
  static parse(html: string): HtmlNode {
    const document = new HtmlNode("document", 0, html)
    document.end = html.length
    const stack: HtmlNode[] = [document]
    let at = 0
    while (at < html.length) {
      const parent = stack.at(-1)!
      if (html.startsWith("<!--", at)) {
        const close = html.indexOf("-->", at + 4)
        const end = close < 0 ? html.length : close + 3
        HtmlParser.add(parent, new HtmlNode("comment", at, html), end)
        at = end
        continue
      }
      if (html.startsWith("<!", at) || html.startsWith("<?", at)) {
        at = html.indexOf(">", at) + 1 || html.length
        continue
      }
      const endTag = /^<\/([a-zA-Z][\w-]*)\s*>/.exec(html.slice(at, at + 200))
      if (endTag) {
        const tag = endTag[1]!.toLowerCase()
        const index = stack.findLastIndex((node) => node.tag === tag)
        if (index > 0) {
          for (let i = stack.length - 1; i > index; i--) HtmlParser.close(stack[i]!, at, at)
          HtmlParser.close(stack[index]!, at, at + endTag[0].length)
          stack.length = index
        }
        at += endTag[0].length
        continue
      }
      if (html[at] === "<" && /[a-zA-Z]/.test(html[at + 1] ?? "")) {
        at = HtmlParser.startTag(html, at, stack)
        continue
      }
      const next = html.indexOf("<", at + 1)
      const end = next < 0 ? html.length : next
      HtmlParser.add(parent, new HtmlNode("text", at, html), end)
      at = end
    }
    return document
  }

  /** Parse the start tag at `at`;  push it (or its raw text) onto `stack`;  returns where parsing goes on. */
  private static startTag(html: string, at: number, stack: HtmlNode[]): number {
    const name = /^<([a-zA-Z][\w-]*)/.exec(html.slice(at))![1]!
    const tag = name.toLowerCase()
    const element = new HtmlNode("element", at, html, tag)
    let i = at + 1 + name.length
    const attribute = /\s*([^\s"'>/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/y
    for (;;) {
      attribute.lastIndex = i
      const rest = /^\s*(\/?>)/.exec(html.slice(i, i + 200))
      if (rest) {
        i += rest[0].length
        element.startTagEnd = i
        break
      }
      const match = attribute.exec(html)
      if (!match) throw new Error(`can't parse the tag at ${at}:  ${html.slice(at, at + 80)}`)
      const quoted = match[2]
      const value = quoted?.startsWith('"') || quoted?.startsWith("'") ? quoted.slice(1, -1) : quoted
      element.attributes.push({ name: match[1]!.toLowerCase(), value, raw: match[0].trim() })
      i = attribute.lastIndex
    }
    HtmlParser.add(stack.at(-1)!, element, i)
    const selfClosed = html.slice(at, i).endsWith("/>")
    if (HtmlParser.VOID.has(tag) || selfClosed) return i
    element.innerStart = i
    if (HtmlParser.RAW.has(tag)) {
      const close = html.toLowerCase().indexOf(`</${tag}`, i)
      const closeEnd = html.indexOf(">", close) + 1
      element.innerEnd = close
      element.end = closeEnd
      return closeEnd
    }
    stack.push(element)
    return i
  }

  /** Add `node` (ending at `end`) to `parent`. */
  private static add(parent: HtmlNode, node: HtmlNode, end: number): void {
    node.end = end
    node.parent = parent
    parent.children.push(node)
  }

  /** Close `element`:  its content ends at `innerEnd`, the node at `end`. */
  private static close(element: HtmlNode, innerEnd: number, end: number): void {
    element.innerEnd = innerEnd
    element.end = end
  }

  /** `text` without tags. */
  static stripTags(text: string): string {
    return text.replace(/<[^>]*>/g, "")
  }

  /** `text` with HTML's common entities decoded. */
  static decode(text: string): string {
    return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
      if (body[0] === "#") {
        const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10)
        return String.fromCodePoint(code)
      }
      return HtmlParser.ENTITIES[body.toLowerCase()] ?? entity
    })
  }

  /** Named entities the pages use. */
  static readonly ENTITIES: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    mdash: "—",
    ndash: "–",
    hellip: "…",
    rarr: "→",
    larr: "←",
    times: "×"
  }
}

////////////////
// ## Command line
////////////////

/** Every page of the site:  `site/*.html`, `site/components/*.html`. */
function sitePages(): string[] {
  const pages = (folder: string) =>
    readdirSync(folder)
      .filter((name) => name.endsWith(".html"))
      .map((name) => path.join(folder, name))
  return [...pages(SITE), ...pages(path.join(SITE, "components"))]
}

/** Run as a script (not imported by `site:index` / `site:kitchen` / `site:new`). */
function main(): void {
  const args = process.argv.slice(2)
  const check = args.includes("--check")
  const named = args.filter((arg) => !arg.startsWith("--"))
  const files = named.length ? named.map((file) => path.resolve(file)) : sitePages()
  const stale: string[] = []
  for (const file of files) {
    const before = readFileSync(file, "utf8")
    const after = SiteSections.convert(before)
    if (after === before) continue
    stale.push(path.relative(process.cwd(), file))
    if (!check) writeFileSync(file, after)
  }
  if (check) {
    for (const file of stale) console.error(`stale:  ${file} (run \`yarn site:sections\`)`)
    process.exitCode = stale.length ? 1 : 0
  } else console.log(`site sections:  ${stale.length ? `wrote ${stale.length} page(s)` : "unchanged"}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
