// ## Blocks

/** What a block is.  Containers hold blocks;  the rest hold lines of text. */
export type BlockKind =
  | "document"
  | "blockquote"
  | "list"
  | "item"
  | "paragraph"
  | "heading"
  | "thematic_break"
  | "code"
  | "html"
  | "table"

/**
 * One block of a markdown document, as `MD.BlockScanner` builds it -- plain data, the tree P4 / P5 read.
 * - A container (`document`, `blockquote`, `list`, `item`) has `children`;  a leaf has `lines`.
 * - Fields only some kinds use are optional, named for what they mean there.
 */
export type Block = {
  /** What it is. */
  kind: BlockKind
  /** Child blocks:  a container's. */
  children: Block[]
  /** The container it sits in;  none for the document. */
  parent?: Block
  /** Still taking lines? */
  open: boolean
  /** Content lines, without their container prefixes:  a leaf's. */
  lines: string[]
  /** 0-based line the block starts on. */
  startLine: number
  /** Did the last line it took end blank?  Decides whether a list is loose. */
  lastLineBlank?: boolean
  /** `heading`:  1-6. */
  level?: number
  /** `code`:  fenced (with what) or indented. */
  fence?: { char: string; length: number; offset: number }
  /** `code`:  the fence's info string, e.g. `ts`. */
  info?: string
  /** `html`:  which of the spec's 7 start conditions began it (1-7). */
  htmlType?: number
  /** `list` / `item`:  the marker and where the content starts. */
  list?: ListData
  /** `list`:  no blank lines between or inside items. */
  tight?: boolean
  /** `table`:  each column's alignment. */
  align?: TableAlign[]
}

/** A list item's marker, and the columns its content sits at. */
export type ListData = {
  /** `bullet` or `ordered`. */
  type: "bullet" | "ordered"
  /** `-`, `+` or `*`, for a bullet. */
  bulletChar?: string
  /** `.` or `)`, for an ordered one. */
  delimiter?: string
  /** The first number, for an ordered one. */
  start?: number
  /** Columns from the line's indent to the marker. */
  markerOffset: number
  /** Columns from the marker's start to the content. */
  padding: number
}

/** A table column's alignment, from its delimiter cell (`:--`, `:-:`, `--:`). */
export type TableAlign = "left" | "center" | "right" | undefined

/**
 * A table row's cells:  split at `|` (not `\|`), the outer pipes optional, each cell trimmed.
 * - `\|` stays in the cell's text as is:  inline parsing unescapes it.
 */
export function tableCells(row: string): string[] {
  let text = row.trim()
  if (text.startsWith("|")) text = text.slice(1)
  if (text.endsWith("|") && !text.endsWith("\\|")) text = text.slice(0, -1)
  const cells: string[] = []
  let cell = ""
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\\" && text[i + 1] === "|") {
      cell += "\\|"
      i++
    } else if (text[i] === "|") {
      cells.push(cell.trim())
      cell = ""
    } else cell += text[i]
  }
  cells.push(cell.trim())
  return cells
}

/** A new block of `kind` on `startLine`, under `parent`. */
export function newBlock(kind: BlockKind, startLine: number, parent?: Block): Block {
  return { kind, children: [], parent, open: true, lines: [], startLine }
}

// ## HTML blocks

/** Tag name, attribute and tag patterns, from the CommonMark spec (6.6 Raw HTML). */
const TAGNAME = "[A-Za-z][A-Za-z0-9-]*"
const ATTRIBUTENAME = "[a-zA-Z_:][a-zA-Z0-9_.:-]*"
const ATTRIBUTEVALUE = "(?:[^\"'=<>`\\x00-\\x20]+|'[^']*'|\"[^\"]*\")"
const ATTRIBUTE = `(?:\\s+${ATTRIBUTENAME}(?:\\s*=\\s*${ATTRIBUTEVALUE})?)`
/** An open tag:  `<a href="x">`. */
export const OPENTAG = `<${TAGNAME}${ATTRIBUTE}*\\s*/?>`
/** A closing tag:  `</a>`. */
export const CLOSETAG = `</${TAGNAME}\\s*[>]`

/** Block-level tag names that start an HTML block of type 6. */
const BLOCK_TAGS =
  "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|" +
  "fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|" +
  "menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|" +
  "tr|track|ul"

/** How each of the 7 HTML block kinds starts (index = kind;  0 unused). */
export const HTML_BLOCK_OPEN = [
  /./,
  /^<(?:script|pre|style|textarea)(?:\s|>|$)/i,
  /^<!--/,
  /^<[?]/,
  /^<![A-Za-z]/,
  /^<!\[CDATA\[/,
  new RegExp(`^</?(?:${BLOCK_TAGS})(?:\\s|/?>|$)`, "i"),
  new RegExp(`^(?:${OPENTAG}|${CLOSETAG})\\s*$`, "i")
]

/** How kinds 1-5 end (6 and 7 end at a blank line). */
export const HTML_BLOCK_CLOSE = [/./, /<\/(?:script|pre|style|textarea)>/i, /-->/, /\?>/, />/, /\]\]>/]
