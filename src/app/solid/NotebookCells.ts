import { SX } from "spell-parser/spellx"

/**
 * A `.spellx` file as NOTEBOOK CELLS, and the edits a notebook makes to its text (epic `elemental-spell` P11).
 * - The cells come from `SX.SpellxView`, the file's chunk tree with exact spans:  each template is a cell,
 *   then its own cells in order:  PROSE (markdown) and CHUNKS (a property, alias, action, drawing, event, test,
 *   handler or note), each the text of its span.
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
    for (const node of file.nodes) {
      if (node.kind === "template") {
        cells.push(NotebookCells.chunkFor(text, node, file, undefined, cells.length))
        for (const child of node.children) {
          if (child.kind === "prose") cells.push(NotebookCells.proseFor(child, node, cells.length))
          else if (child.kind === "declaration" || child.kind === "handler" || child.kind === "note")
            cells.push(NotebookCells.chunkFor(text, child, file, node, cells.length))
        }
      } else if (node.kind === "prose") cells.push(NotebookCells.proseFor(node, undefined, cells.length))
    }
    return cells
  }

  /**
   * `text` with `cell`'s code changed to `code`, as the cell's editor shows it (its indent taken off):
   * the indent goes back on every line but the first.
   */
  static withCode(text: string, cell: ChunkCell, code: string): string {
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

  /** The prose cell for `node`, in template `parent` (if any). */
  private static proseFor(node: SX.SpellxProse, parent: SX.SpellxTemplate | undefined, index: number): ProseCell {
    return { kind: "prose", id: `prose-${index}`, text: node.text, span: node.span, parentId: parent && idOf(parent) }
  }

  /** The chunk cell for `node`, in template `parent` (if any). */
  private static chunkFor(
    text: string,
    node: SX.SpellxTemplate | SX.SpellxDeclaration | SX.SpellxHandler | SX.SpellxNote,
    file: SX.SpellxFile,
    parent: SX.SpellxTemplate | undefined,
    index: number
  ): ChunkCell {
    const lineStart = text.lastIndexOf("\n", node.span.start - 1) + 1
    const indent = text.slice(lineStart, node.span.start)
    const code = dedented(text.slice(node.span.start, node.span.end), indent)
    const words = file.language.words.spellx?.attributes ?? {}
    return {
      kind: "chunk",
      id: idOf(node, index),
      type: node.type,
      word: node.word,
      title: titleOf(node),
      code,
      indent,
      span: node.span,
      parentId: parent && idOf(parent),
      property:
        node.kind === "declaration" && node.type === "property"
          ? {
              name: node.name ?? "",
              oneOf: valueOf(node, "one-of") ?? "",
              aliases: node.attributes.filter((each) => each.name === "alias").map((each) => each.value ?? ""),
              attributes: node.attributes,
              selfClosing: node.selfClosing,
              headSpan: node.headSpan,
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
  /** its markdown, its shared indent taken off */
  text: string
  /** where it is in the file */
  span: SX.SpellxSpan
  /** the template it's in, by its id */
  parentId: string | undefined
}

/** A template or one of its members:  a card in the notebook. */
export type ChunkCell = {
  kind: "chunk"
  /** its kind and name, e.g. `property:suit`:  what remembers its fold */
  id: string
  /** what it is, in English:  `view`, `property`, `action`, `on` ... */
  type: string
  /** the tag's word as written, e.g. `propiedad` */
  word: string
  /** its title for people:  its name, or its phrase */
  title: string
  /** its text, its indent taken off every line */
  code: string
  /** the indent its first line sits at, put back on an edit */
  indent: string
  /** where it is in the file */
  span: SX.SpellxSpan
  /** the template it's in, by its id;  none for a template */
  parentId: string | undefined
  /** a property's fields, for its form */
  property: PropertyFields | undefined
}

/** A property chunk's fields, as its form shows them. */
export type PropertyFields = PropertyForm & {
  /** every attribute, as read */
  attributes: SX.SpellxAttribute[]
  /** `<property ... />`:  no body */
  selfClosing: boolean
  /** its head's span, which an edit replaces */
  headSpan: SX.SpellxSpan
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
