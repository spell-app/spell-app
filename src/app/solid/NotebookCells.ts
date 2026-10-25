import { SX } from "spell-parser/spellx"

/**
 * A `.spellx` file as NOTEBOOK CELLS, and the edits a notebook makes to its text (epic `elemental-spell` P11).
 * - The cells come from `SX.SpellxView`, the file's chunk tree with exact spans:  each template is a cell,
 *   then its own cells in order:  PROSE (markdown) and CHUNKS (a property, alias, action, drawing, event, test,
 *   handler or note), each the text of its span.
 * - A template's cell is only its head (`<spell-view "card">`):  its members are cells of their own,
 *   which the notebook draws inside it (`parentId`).
 * - Every edit returns the file's NEW TEXT, changing only the span it's about:  the rest of the file stays byte for
 *   byte.  The notebook hands it to the editor as typed text (`editor.onInputChanged()`), so the parse, the running
 *   program and the Text view follow.
 * - Plain TypeScript, no Solid:  `<SpellxNotebook>` draws these, and the tests check them in node.
 */
export class NotebookCells {
  /**
   * The cells of `text`, a `.spellx` file at `path` (its language from its name, `Carta.es.spellx`).
   * - NEVER throws:  a file the view can't make sense of is one prose-less list of whatever it found.
   */
  static of(text: string, path?: string): NotebookCell[] {
    const file = SX.SpellxView.read(text, { path })
    const cells: NotebookCell[] = []
    const headings = new HeadingLevels()
    for (const node of file.nodes) {
      if (node.kind === "template") {
        const template = NotebookCells.chunkFor(text, node, file, undefined, cells.length)
        cells.push(template)
        for (const child of node.children) {
          if (child.kind === "prose") cells.push(NotebookCells.proseFor(child, template.id, cells.length, headings))
          else if (child.kind === "declaration" || child.kind === "handler" || child.kind === "note")
            cells.push(NotebookCells.chunkFor(text, child, file, template.id, cells.length))
        }
      } else if (node.kind === "prose") cells.push(NotebookCells.proseFor(node, undefined, cells.length, headings))
    }
    return cells
  }

  /** The cells inside template `templateId`, in order;  `undefined`:  the cells outside every template. */
  static membersOf(cells: NotebookCell[], templateId: string | undefined): NotebookCell[] {
    return cells.filter((each) => each.parentId === templateId)
  }

  /**
   * `text` with `cell`'s code changed to `code`, as the cell's editor shows it (its indent taken off):
   * the indent goes back on every line but the first.
   * - `cell`:  a chunk, or a property's body (`cell.property.body`).
   */
  static withCode(text: string, cell: CodeSpan, code: string): string {
    return replaceSpan(text, cell.span, indented(code, cell.indent))
  }

  /**
   * `text` with chunk `cell` swapped with the chunk before it (`"up"`) or after it (`"down"`) in the same template.
   * - Prose stays where it is:  only the two chunks' texts trade places.
   * - No chunk that way:  `text` as it is.
   */
  static moved(text: string, cells: NotebookCell[], cell: ChunkCell, direction: "up" | "down"): string {
    const siblings = cells.filter(
      (each): each is ChunkCell =>
        each.kind === "chunk" && each.parentId === cell.parentId && each.parentId !== undefined
    )
    const at = siblings.findIndex((each) => each.id === cell.id)
    const other = siblings[direction === "up" ? at - 1 : at + 1]
    if (at < 0 || !other) return text
    const [first, second] = other.span.start < cell.span.start ? [other, cell] : [cell, other]
    const firstText = text.slice(first.span.start, first.span.end)
    const secondText = text.slice(second.span.start, second.span.end)
    // the later span first, so the earlier one's offsets still hold
    return replaceSpan(replaceSpan(text, second.span, firstText), first.span, secondText)
  }

  /**
   * `text` with property `cell`'s head rewritten from `form`:  its name, one-of values and aliases.
   * - The head is written on one line, its other attributes kept as they were written;  its body is untouched.
   * - The attribute words are the file's language's (`uno-de`, `frase` in Spanish).
   */
  static withProperty(text: string, cell: ChunkCell, form: PropertyForm): string {
    const { property } = cell
    if (!property) return text
    const keep = property.attributes.filter((each) => !["name", "one-of", "alias"].includes(each.name))
    const parts = [`<${cell.word}`, quoted(form.name)]
    if (form.oneOf.trim()) parts.push(`${property.words.oneOf}=${quoted(form.oneOf.trim())}`)
    for (const attribute of keep) parts.push(text.slice(attribute.span.start, attribute.span.end))
    for (const alias of form.aliases.map((each) => each.trim()).filter(Boolean))
      parts.push(`${property.words.alias}=${quoted(alias)}`)
    const head = parts.join(" ") + (property.selfClosing ? " />" : ">")
    return replaceSpan(text, property.headSpan, head)
  }

  ////////////////
  // ## Making cells
  ////////////////

  /** The prose cell for `node`, in template `parentId` (if any). */
  private static proseFor(
    node: SX.SpellxProse,
    parentId: string | undefined,
    index: number,
    headings: HeadingLevels
  ): ProseCell {
    return { kind: "prose", id: `prose-${index}`, text: proseMarkdown(node.text, headings), span: node.span, parentId }
  }

  /**
   * The chunk cell for `node`, in template `parentId` (if any).
   * - A template's span is its head alone:  its members are cells of their own.
   */
  private static chunkFor(
    text: string,
    node: SX.SpellxTemplate | SX.SpellxDeclaration | SX.SpellxHandler | SX.SpellxNote,
    file: SX.SpellxFile,
    parentId: string | undefined,
    index: number
  ): ChunkCell {
    const span = node.kind === "template" ? node.headSpan : node.span
    const indent = indentAt(text, span.start)
    const code = dedented(text.slice(span.start, span.end), indent)
    const words = file.language.words.spellx?.attributes ?? {}
    const ownId = idOf(node, index)
    return {
      kind: "chunk",
      // a member's id names its template:  two templates may both have a `color`
      id: parentId ? `${parentId}/${ownId}` : ownId,
      type: node.type,
      word: node.word,
      title: titleOf(node),
      code,
      indent,
      span,
      parentId,
      property:
        node.kind === "declaration" && node.type === "property"
          ? {
              name: node.name ?? "",
              oneOf: valueOf(node, "one-of") ?? "",
              aliases: node.attributes.filter((each) => each.name === "alias").map((each) => each.value ?? ""),
              attributes: node.attributes,
              selfClosing: node.selfClosing,
              headSpan: node.headSpan,
              body: bodyOf(text, node),
              words: { oneOf: wordFor(words, "one-of"), alias: wordFor(words, "alias") }
            }
          : undefined
    }
  }
}

////////////////
// ## Types
////////////////

/** A notebook cell:  prose, or a chunk of code. */
export type NotebookCell = ProseCell | ChunkCell

/** A run of markdown between tags. */
export type ProseCell = {
  kind: "prose"
  /** stable for the file's life while its place doesn't change, e.g. `prose-3` */
  id: string
  /**
   * its markdown, as the notebook draws it:
   * - its shared indent taken off
   * - its `//` comment lines as plain lines, each kept on its own
   * - its headings one level under the file's first heading (`proseMarkdown()`)
   */
  text: string
  /** where it is in the file */
  span: SX.SpellxSpan
  /** the template it's in, by its id */
  parentId: string | undefined
}

/** A template or one of its members:  a card in the notebook. */
export type ChunkCell = CodeSpan & {
  kind: "chunk"
  /** its kind and name, after its template's, e.g. `view:card/property:suit`:  what remembers its fold */
  id: string
  /** what it is, in English:  `view`, `property`, `action`, `on` ... */
  type: string
  /** the tag's word as written, e.g. `propiedad` */
  word: string
  /** its title for people:  its name, or its phrase */
  title: string
  /** the template it's in, by its id;  none for a template */
  parentId: string | undefined
  /** a property's fields, for its form */
  property: PropertyFields | undefined
}

/**
 * A span of code a card's editor edits:  a chunk (a template's head), or a property's body.
 * - The editor shows `code`;  `NotebookCells.withCode()` writes it back into `span`.
 */
export type CodeSpan = {
  /** its text, `indent` taken off every line after the first */
  code: string
  /** the indent its first line sits at, put back on an edit */
  indent: string
  /** where it is in the file:  a template's, its head alone */
  span: SX.SpellxSpan
}

/** A property chunk's fields, as its form shows them. */
export type PropertyFields = PropertyForm & {
  /** every attribute, as read */
  attributes: SX.SpellxAttribute[]
  /** `<property ... />`:  no body */
  selfClosing: boolean
  /** its head's span, which an edit replaces */
  headSpan: SX.SpellxSpan
  /** its body (`red if ...`), which the form shows below it as code;  none:  `/>`, or nothing inside */
  body: CodeSpan | undefined
  /** the file's language's words for the two attributes the form writes */
  words: { oneOf: string; alias: string }
}

/** What a property's form edits. */
export type PropertyForm = {
  /** its name, e.g. `suit` */
  name: string
  /** its values, as written, e.g. `clubs, diamonds, hearts, spades`;  empty:  none */
  oneOf: string
  /** the phrases it answers to, e.g. `is a (suit)` */
  aliases: string[]
}

////////////////
// ## Helpers
////////////////

/** `text` with `span` replaced by `replacement`. */
function replaceSpan(text: string, span: SX.SpellxSpan, replacement: string): string {
  return text.slice(0, span.start) + replacement + text.slice(span.end)
}

/** The whitespace `offset`'s line starts with, up to `offset`. */
function indentAt(text: string, offset: number): string {
  const lineStart = text.lastIndexOf("\n", offset - 1) + 1
  return /^[ \t]*/.exec(text.slice(lineStart, offset))![0]
}

/** Declaration `node`'s body, from its first child to its last;  none when it has none. */
function bodyOf(text: string, node: SX.SpellxDeclaration): CodeSpan | undefined {
  const first = node.children[0]
  const last = node.children.at(-1)
  if (!first || !last) return undefined
  const span = { start: first.span.start, end: last.span.end }
  const indent = indentAt(text, span.start)
  return { code: dedented(text.slice(span.start, span.end), indent), indent, span }
}

/**
 * Prose `text` as the notebook draws it.
 * - A `//` comment line loses its `//` and stays a line of its own (markdown would run it into the one above);
 *   a `- ` line after it stays in its list.
 * - Headings move under the file's first heading (`HeadingLevels`).
 */
function proseMarkdown(text: string, headings: HeadingLevels): string {
  const lines = text.split("\n").map((line) => {
    const heading = /^(#{1,6})(\s.*)$/.exec(line)
    if (heading) return "#".repeat(headings.levelFor(heading[1]!.length)) + heading[2]
    return line
  })
  let out = ""
  for (const [i, line] of lines.entries()) {
    const comment = /^\/\/\s?(.*)$/.exec(line)
    const shown = comment ? comment[1]! : line
    if (i === 0) out = shown
    // a comment line is a paragraph of its own;  a list item stays with the one before it
    else out += comment && !/^[-*] /.test(shown) ? "\n\n" + shown : "\n" + shown
  }
  return out
}

/**
 * The heading levels a notebook draws:  the file's first heading at the top level, every other one under it.
 * - So a template's `# card rank` doesn't outrank the file's own `## A playing card` title.
 */
class HeadingLevels {
  /** the level the file's first heading was written at;  none seen yet */
  private first: number | undefined

  /** The level to draw a heading written at `level`. */
  levelFor(level: number): number {
    if (this.first === undefined) {
      this.first = level
      return 1
    }
    return Math.min(6, Math.max(2, level - this.first + 2))
  }
}

/** `code` with `indent` taken off every line after the first that starts with it. */
function dedented(code: string, indent: string): string {
  if (!indent) return code
  return code
    .split("\n")
    .map((line, i) => (i > 0 && line.startsWith(indent) ? line.slice(indent.length) : line))
    .join("\n")
}

/** `code` with `indent` put on every non-empty line after the first. */
function indented(code: string, indent: string): string {
  if (!indent) return code
  return code
    .split("\n")
    .map((line, i) => (i > 0 && line ? indent + line : line))
    .join("\n")
}

/** `value` in double quotes, a `"` in it written `&quot;`. */
function quoted(value: string): string {
  return `"${value.replaceAll('"', "&quot;")}"`
}

/** The value of `node`'s attribute named (in English) `name`. */
function valueOf(node: SX.SpellxDeclaration, name: string): string | undefined {
  return node.attributes.find((each) => each.name === name)?.value
}

/** The language's first word for English attribute `name` (`words` maps a word to its English name). */
function wordFor(words: Record<string, string>, name: string): string {
  return Object.entries(words).find(([, english]) => english === name)?.[0] ?? name
}

/** A cell's id:  its type and name, else its place. */
function idOf(
  node: SX.SpellxTemplate | SX.SpellxDeclaration | SX.SpellxHandler | SX.SpellxNote,
  index?: number
): string {
  if ((node.kind === "template" || node.kind === "declaration") && node.name) return `${node.type}:${node.name}`
  if (node.kind === "handler") return `${node.type}:${node.phrase}`
  return `${node.type}:${index ?? 0}`
}

/** A cell's title:  its name, its phrase, or its word. */
function titleOf(node: SX.SpellxTemplate | SX.SpellxDeclaration | SX.SpellxHandler | SX.SpellxNote): string {
  if (node.kind === "handler") return `${node.word} ${node.phrase}`
  if ((node.kind === "template" || node.kind === "declaration") && node.name) return node.name
  return node.word
}
