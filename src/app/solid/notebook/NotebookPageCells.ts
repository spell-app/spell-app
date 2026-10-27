import { SX } from "spell-parser/spellx"
import { dedented, indentAt, indented, replaceSpan } from "spell-app/app/solid/NotebookCells"

/**
 * A `.spellx` NOTEBOOK as the cells of its page, and the edits its page makes to its text (epic `elemental-spell` P16).
 * - The cells come from the file's chunk tree (`SX.SpellxView`):  what's inside its `<spell-notebook>`, in order.
 *   - `prose`:  a run of markdown;  a new cell at each `##` heading, which starts a section of the page
 *   - `heading`:  the page's title or a section's start, written as a tag rather than markdown (either works):
 *     - the title:  a top-level `<header level="1">`, its sub header (a `<header>` inside it) the line under it
 *     - a section:  a top-level `<section label="...">`, this cell its opening tag;  what's inside it, cells of their
 *       own, in its section of the page
 *   - `template`:  one of its own templates, `<spell-view "counter">`
 *   - `drawing`:  an element drawn in place, `<example "one counter">`, `<section>`;  the examples in it, in order
 *     - a `<text>` (or `<p>`) holding only text:  its text is the description of an example right after it
 *   - `html`:  an `<html>` block, drawn as written
 *   - `member`:  anything else it declares (`<property>` ...), shown as code
 * - No ids are written into the file:  a cell is found by its place among the others.
 * - Every edit returns the file's NEW TEXT, changing only what it's about:  the rest stays byte for byte.
 *   A cell's code is shown without its indent (`indent`), which an edit puts back on every line.
 * - Plain TypeScript, no Solid:  `<NotebookPage>` draws these, and the tests check them in node.
 */
export class NotebookPageCells {
  /**
   * The notebook in `text`, a `.spellx` file at `path` (its language from its name):  its tag and its cells.
   * - `undefined` when the file holds no notebook.
   * - NEVER throws.
   */
  static of(text: string, path?: string): NotebookPageModel | undefined {
    const file = SX.SpellxView.read(text, { path })
    const notebook = file.templates.find((template) => template.type === "notebook")
    if (!notebook) return undefined
    const cells = notebook.children.flatMap((node) => NotebookPageCells.cellsFor(text, node, "top"))
    const locked = notebook.attributes.some((attribute) => attribute.name === "locked")
    // the file's language's word for `locked`, `bloqueado`
    const words = file.language.words.spellx?.attributes ?? {}
    const lockWord = Object.entries(words).find(([, english]) => english === "locked")?.[0]
    return { name: notebook.name ?? "", locked, lockWord, notebook, cells, language: file.language.lang }
  }

  ////////////////
  // ## Edits
  ////////////////

  /** `text` with `cell`'s code changed to `code`, as its editor shows it:  its indent put back. */
  static withCode(text: string, cell: CodeSpan, code: string): string {
    return replaceSpan(text, cell.span, indented(code, cell.indent))
  }

  /**
   * `text` with cell `index` swapped with the cell before it (`"up"`) or after it (`"down"`).
   * - Only the two cells' texts trade places:  the lines between them stay.
   * - No cell that way:  `text` as it is.
   * - Nor past a section written as a tag, or the section itself:  swapping its opening tag with another cell's text
   *   would leave the tags wrongly nested.
   */
  static moved(text: string, cells: PageCell[], index: number, direction: "up" | "down"): string {
    const cell = cells[index]
    const other = cells[direction === "up" ? index - 1 : index + 1]
    if (!cell || !other || cell.block || other.block) return text
    const [first, second] = other.span.start < cell.span.start ? [other, cell] : [cell, other]
    const firstText = text.slice(first.span.start, first.span.end)
    const secondText = text.slice(second.span.start, second.span.end)
    // the later span first, so the earlier one's offsets still hold
    return replaceSpan(replaceSpan(text, second.span, firstText), first.span, secondText)
  }

  /**
   * `text` without `cell`:  its lines go, and a blank line after it when one's before it too.
   * - A section written as a tag goes whole, with what's inside it (`block`).
   */
  static deleted(text: string, cell: PageCell): string {
    const span = cell.block ?? cell.span
    const start = text.lastIndexOf("\n", span.start - 1) + 1
    let end = text.indexOf("\n", span.end)
    end = end < 0 ? text.length : end + 1
    // one blank line between its neighbours, not two
    const before = text.slice(0, start)
    if (before.endsWith("\n\n") && /^[ \t]*\n/.test(text.slice(end))) end = text.indexOf("\n", end) + 1
    // the last in its block:  no blank line left before its block's closing tag
    else if (before.endsWith("\n\n") && /^[ \t]*<\//.test(text.slice(end))) return before.slice(0, -1) + text.slice(end)
    return text.slice(0, start) + text.slice(end)
  }

  /**
   * `text` with `code` added as a cell of its own after `cell` (none:  at the notebook's end), a blank line before it.
   * - `code` without an indent:  it takes `cell`'s, or one more inside a section's opening tag (its first cell, then);
   *   none, the notebook's body's.
   * - Returns the new text and where the new cell's code starts in it, to find it by.
   */
  static inserted(text: string, model: NotebookPageModel, cell: PageCell | undefined, code: string) {
    const indent = cell ? cell.indent + (cell.block ? "\t" : "") : (model.cells[0]?.indent ?? "\t")
    const after = cell?.span.end ?? NotebookPageCells.bodyEnd(text, model)
    const lineEnd = text.indexOf("\n", after)
    const at = lineEnd < 0 ? text.length : lineEnd
    const added = `\n\n${indent}${indented(code, indent)}`
    return { text: text.slice(0, at) + added + text.slice(at), start: at + 2 + indent.length }
  }

  /** `text` with the notebook locked (`locked`) or not:  its tag's `locked` added or taken off. */
  static withLock(text: string, model: NotebookPageModel, locked: boolean): string {
    const { notebook } = model
    const attribute = notebook.attributes.find((each) => each.name === "locked")
    if (!locked && attribute) {
      const start = text.lastIndexOf(" ", attribute.span.start - 1)
      return replaceSpan(
        text,
        { start: start < notebook.headSpan.start ? attribute.span.start : start, end: attribute.span.end },
        ""
      )
    }
    if (!locked || attribute) return text
    const head = text.slice(notebook.headSpan.start, notebook.headSpan.end)
    const close = head.endsWith("/>") ? head.length - 2 : head.length - 1
    return replaceSpan(
      text,
      { start: notebook.headSpan.start + close, end: notebook.headSpan.start + close },
      ` ${model.lockWord ?? LOCKED}`
    )
  }

  ////////////////
  // ## Making cells
  ////////////////

  /**
   * The cells of `node`, one of the notebook's children (`"top"`) or of a section written as a tag (`"section"`).
   * - A top-level `<header level="1">` is the page's title;  a top-level `<section label>` a section, its children
   *   cells after it.
   */
  private static cellsFor(text: string, node: SX.SpellxNode, place: "top" | "section"): PageCell[] {
    if (node.kind === "prose") return NotebookPageCells.proseCells(text, node.span)
    if (node.kind === "template")
      return [cellOf(text, "template", node.span, { name: node.name ?? "", groups: groupsOf(node) })]
    if (node.kind === "element") {
      const title = place === "top" ? titleOf(node) : undefined
      if (title) return [cellOf(text, "heading", node.span, title)]
      const label = place === "top" ? sectionLabelOf(node) : undefined
      if (label === undefined) return [NotebookPageCells.drawingCell(text, node)]
      const opener = cellOf(text, "heading", node.headSpan, { heading: label, block: node.span })
      return [opener, ...node.children.flatMap((child) => NotebookPageCells.cellsFor(text, child, "section"))]
    }
    // loose text in a section:  markdown, as the notebook's own
    if (node.kind === "text") {
      const lead = node.text.length - node.text.trimStart().length
      const trimmed = node.text.trim()
      if (!trimmed) return []
      const start = node.span.start + lead
      return [NotebookPageCells.proseCell(text, { start, end: start + trimmed.length })]
    }
    if (node.kind === "declaration" && (node.type as string) === "html") return [cellOf(text, "html", node.span)]
    if (node.kind !== "code" || node.lines.length) return [cellOf(text, "member", node.span)]
    return []
  }

  /** The prose cells of the run of markdown at `span`:  a new one at each `##` heading. */
  private static proseCells(text: string, span: SX.SpellxSpan): PageCell[] {
    const cells: PageCell[] = []
    let start = span.start
    let at = span.start
    while (at < span.end) {
      const lineEnd = Math.min(span.end, text.indexOf("\n", at) < 0 ? span.end : text.indexOf("\n", at))
      const line = text.slice(at, lineEnd).trimStart()
      if (at > start && HEADING.test(line)) {
        cells.push(NotebookPageCells.proseCell(text, { start, end: trimmedEnd(text, start, at) }))
        start = at + (text.slice(at, lineEnd).length - line.length)
      }
      at = lineEnd + 1
    }
    cells.push(NotebookPageCells.proseCell(text, { start, end: span.end }))
    return cells
  }

  /** The prose cell at `span`:  its markdown, and its heading if it starts a section. */
  private static proseCell(text: string, span: SX.SpellxSpan): PageCell {
    const cell = cellOf(text, "prose", span)
    const heading = HEADING.exec(cell.code.split("\n")[0] ?? "")
    if (heading) cell.heading = heading[1]!.trim()
    const title = TITLE.exec(cell.code.split("\n")[0] ?? "")
    if (title) {
      cell.title = title[1]!.trim()
      cell.lead = cell.code.split("\n").slice(1).join("\n").trim() || undefined
    }
    return cell
  }

  /** The drawing cell for element `node`:  the examples in it, however deep, in order. */
  private static drawingCell(text: string, node: SX.SpellxElement): PageCell {
    const cell = cellOf(text, "drawing", node.span, { name: nameOf(node), description: descriptionOf(node) })
    const examples: ExampleSpan[] = []
    const visit = (element: SX.SpellxNode) => {
      if (element.kind !== "element") return
      if (EXAMPLE_TAGS.has(element.name)) examples.push(NotebookPageCells.exampleOf(text, element))
      else element.children.forEach(visit)
    }
    visit(node)
    cell.examples = examples
    return cell
  }

  /**
   * Example `node`'s name and body:  what's between its tags, its code without its indent.
   * - A body that's one `<html>` block (J144) is what's INSIDE it, marked `html`:  the block's own tags are how the
   *   file marks web markup, not part of what the example draws (P18).
   */
  private static exampleOf(text: string, node: SX.SpellxElement): ExampleSpan {
    const shown = node.children.filter((child) => child.kind !== "text" || child.text.trim())
    const [first] = shown
    const last = shown.at(-1)
    const span =
      first && last
        ? { start: first.span.start, end: last.span.end }
        : { start: node.headSpan.end, end: node.headSpan.end }
    const block = shown.length === 1 && first?.kind === "element" && first.name === HTML_TAG ? first : undefined
    const inner = block && NotebookPageCells.insideOf(text, block)
    const bodySpan = inner ?? span
    const indent = first ? indentAt(text, bodySpan.start) : ""
    return {
      name: nameOf(node),
      span: node.span,
      body: { span: bodySpan, indent, code: dedented(text.slice(bodySpan.start, bodySpan.end), indent) },
      ...(inner && { html: true })
    }
  }

  /** What's inside element `node`, from its first line's text to its last's:  `undefined` when it's empty. */
  private static insideOf(text: string, node: SX.SpellxElement): SX.SpellxSpan | undefined {
    if (node.selfClosing) return undefined
    const closer = text.lastIndexOf("</", node.span.end)
    if (closer < node.headSpan.end) return undefined
    const inside = text.slice(node.headSpan.end, closer)
    const start = node.headSpan.end + (inside.length - inside.trimStart().length)
    const end = node.headSpan.end + inside.trimEnd().length
    return end > start ? { start, end } : undefined
  }

  /** Where the notebook's body ends:  just before its closer's line, else its end. */
  private static bodyEnd(text: string, model: NotebookPageModel): number {
    const last = model.cells.at(-1)
    return last ? last.span.end : model.notebook.headSpan.end
  }
}

////////////////
// ## Types
////////////////

/** A notebook, read:  its tag and its cells. */
export type NotebookPageModel = {
  /** its name, `counter notebook` */
  name: string
  /** is it locked, `<spell-notebook "..." locked>`? */
  locked: boolean
  /** the language's word for `locked`, when it's another's */
  lockWord?: string
  /** its tag, from the chunk tree */
  notebook: SX.SpellxTemplate
  /** its cells, in order */
  cells: PageCell[]
  /** the file's language, `en` */
  language: string
}

/** A span of code a cell's editor edits:  its text without `indent`, and where it is. */
export type CodeSpan = {
  /** its text, `indent` taken off every line after the first */
  code: string
  /** the indent its first line sits at, put back on an edit */
  indent: string
  /** where it is in the file */
  span: SX.SpellxSpan
}

/** One cell of a notebook's page. */
export type PageCell = CodeSpan & {
  /** what it is:  see `NotebookPageCells` */
  kind: "prose" | "heading" | "template" | "drawing" | "html" | "member"
  /** a template's or an example's name */
  name?: string
  /** a `##` heading, or a `<section label>`'s label:  it starts a section */
  heading?: string
  /** a `#` title, or a `<header level="1">`'s text:  the page's */
  title?: string
  /** the line under the title:  the text after a `#` title, or its `<header>`'s sub header */
  lead?: string
  /** a section written as a tag:  the whole of it, what's inside too (this cell's span is its opening tag) */
  block?: SX.SpellxSpan
  /** a `<text>` holding only text:  that text, the description of an example right after it */
  description?: string
  /** a drawing cell's examples, in order */
  examples?: ExampleSpan[]
  /** a template's groups, each with its members' names:  none when it has none */
  groups?: CellGroup[]
}

/** A group of a template's members, as its cell lists it:  its name, its description and its members' names. */
export type CellGroup = { name: string; description: string | undefined; members: string[] }

/** An example in a drawing cell:  its name, and its body's code. */
export type ExampleSpan = {
  /** its name, `one counter` */
  name: string
  /** where the whole `<example>` is */
  span: SX.SpellxSpan
  /** what's inside it;  a lone `<html>` block's:  what's inside that */
  body: CodeSpan
  /** is its body a lone `<html>` block's markup?  Shown as written, in every view */
  html?: boolean
}

////////////////
// ## Helpers
////////////////

/** A cell of `kind` at `span` in `text`, its code without its indent. */
function cellOf(text: string, kind: PageCell["kind"], span: SX.SpellxSpan, more: Partial<PageCell> = {}): PageCell {
  const indent = indentAt(text, span.start)
  return { kind, span, indent, code: dedented(text.slice(span.start, span.end), indent), ...more }
}

/**
 * Template `node`'s groups (`SX.SpellxFile.groupsOf()`):  each named one, its description, its members' names or
 * phrases.  `undefined` when it has none.
 */
function groupsOf(node: SX.SpellxTemplate): CellGroup[] | undefined {
  const groups = SX.SpellxFile.groupsOf(node).filter((group) => group.name !== undefined)
  if (!groups.length) return undefined
  return groups.map(({ name, group, members }) => ({
    name: name!,
    description: group?.attributes.find((attribute) => attribute.name === "description")?.value,
    members: members.map((member) => {
      if (member.kind === "handler") return `${member.word} ${member.phrase}`
      if (member.kind === "declaration") return member.name ?? member.word
      return member.kind === "note" ? member.word : member.kind
    })
  }))
}

/** Where the text from `start` to `at` ends, less its trailing blank lines. */
function trimmedEnd(text: string, start: number, at: number): number {
  return start + text.slice(start, at).trimEnd().length
}

/** An element's name, `name="..."` or its quoted name. */
function nameOf(node: SX.SpellxElement): string {
  return node.attributes.find((attribute) => attribute.name === "name")?.value ?? ""
}

/**
 * Element `node` as the page's title:  a `<header level="1">`, its text and its sub header's.
 * - `undefined` when it isn't one, or has no text.
 */
function titleOf(node: SX.SpellxElement): Pick<PageCell, "title" | "lead"> | undefined {
  if (!HEADER_TAGS.has(node.name) || attributeOf(node, LEVEL_WORDS) !== "1") return undefined
  const title = textOf(node.children)
  if (!title) return undefined
  const sub = node.children.find((child) => child.kind === "element" && HEADER_TAGS.has(child.name))
  const lead = sub?.kind === "element" ? textOf(sub.children) : undefined
  return { title, lead: lead || undefined }
}

/** Element `node`'s label, when it's a `<section label="...">`;  else `undefined`. */
function sectionLabelOf(node: SX.SpellxElement): string | undefined {
  if (!SECTION_TAGS.has(node.name)) return undefined
  return attributeOf(node, LABEL_WORDS)?.trim() || undefined
}

/** Element `node`'s text, when it's a `<text>` (or `<p>`) holding only text:  an example's description. */
function descriptionOf(node: SX.SpellxElement): string | undefined {
  if (!TEXT_TAGS.has(node.name) || node.children.some((child) => child.kind !== "text")) return undefined
  return textOf(node.children) || undefined
}

/** The text of `nodes`' own text nodes, its line breaks and their indents one space:  not the elements among them. */
function textOf(nodes: SX.SpellxNode[]): string {
  return nodes
    .map((node) => (node.kind === "text" ? node.text : " "))
    .join("")
    .replace(/\s*\n\s*/g, " ")
    .trim()
}

/** The value of element `node`'s attribute named one of `names` (its words in each language). */
function attributeOf(node: SX.SpellxElement, names: ReadonlySet<string>): string | undefined {
  return node.attributes.find((attribute) => names.has(attribute.name))?.value
}

/** A section's heading:  `## Try it`. */
const HEADING = /^##\s+(.*)$/

/** The page's title:  `# A counter`. */
const TITLE = /^#\s+(.*)$/

/** An example's tag, in each language:  `example_block`'s words. */
const EXAMPLE_TAGS = new Set(["example", "ejemplo"])

/** An `<html>` block's tag:  web markup, drawn as written (J144);  the same word in every language. */
const HTML_TAG = "html"

/** `<ui-header>`'s bare name, in each language:  the page's title, at `level="1"`. */
const HEADER_TAGS: ReadonlySet<string> = new Set(["header", "encabezado"])

/** `<ui-section>`'s bare name, in each language:  with a `label`, a section of the page. */
const SECTION_TAGS: ReadonlySet<string> = new Set(["section", "seccion"])

/** `<ui-text>`'s bare name (and a paragraph's), in each language:  holding only text, an example's description. */
const TEXT_TAGS: ReadonlySet<string> = new Set(["text", "p", "texto"])

/** `level`, in each language. */
const LEVEL_WORDS: ReadonlySet<string> = new Set(["level", "nivel"])

/** `label`, in each language. */
const LABEL_WORDS: ReadonlySet<string> = new Set(["label", "etiqueta"])

/** The word that locks a notebook, `locked`;  a Spanish file's own, `bloqueado` (`lockWord`). */
const LOCKED = "locked"
