import { MD, type Block, type BlockKind, type ListData } from "$/markdown"

import { lineRules } from "./lineRules"

/** Columns of indent that make a line indented code. */
const CODE_INDENT = 4

/** First characters that might start a block:  any other line is text (or a lazy continuation). */
const MAYBE_SPECIAL = /^[#`~*+_=<>0-9|:-]/

/**
 * Markdown text => a tree of `MD.Block`s:  the block structure, CommonMark's first phase (spec 4-5, plus GFM tables).
 * - A port of commonmark.js 0.29's `blocks.js`, which GFM 0.29 follows:  each line walks the OPEN blocks (does it
 *   continue them?), then tries the block starts, then adds its text to the innermost open leaf.
 * - Hand-written on purpose:  what nests in what, lazy continuation lines and tabs counted to 4-column stops are a
 *   line-by-line state machine, not a grammar.  WHAT a line is (a thematic break, a fence ...) is asked of rulex
 *   rules (`lineRules`);  columns and offsets are read from the raw text here.
 * - Leaf text stays raw:  inlines (emphasis, links ...) are the next phase's.
 * - SIDE EFFECT:  one scanner per document -- `parse()` resets it.
 */
export class BlockScanner {
  /** Scan `text` into its block tree. */
  static parse(text: string): Block {
    return new BlockScanner().parse(text)
  }

  /** The document being built. */
  doc = MD.newBlock("document", 0)
  /** Innermost open block:  where text goes. */
  tip = this.doc
  /** `tip` before this line. */
  oldtip = this.doc
  /** Deepest container this line continued. */
  lastMatchedContainer = this.doc
  /** Have the blocks this line didn't continue been closed? */
  allClosed = true

  /** This line, and where we are in it. */
  line = ""
  /** 0-based line number. */
  lineNumber = -1
  /** Character offset into `line`. */
  offset = 0
  /** Column at `offset` (tabs to 4-column stops). */
  column = 0
  /** Offset / column of the next non-space character. */
  nextNonspace = 0
  nextNonspaceColumn = 0
  /** Columns from `column` to `nextNonspaceColumn`. */
  indent = 0
  /** `indent` >= 4:  indented code, or not a block start. */
  indented = false
  /** Nothing but spaces / tabs left on the line? */
  blank = false
  /** Did `advanceOffset()` stop part way through a tab? */
  partiallyConsumedTab = false

  /** Scan `text`:  every line in, then close everything still open. */
  parse(text: string): Block {
    const lines = MD.normalize(text).split("\n")
    lines.pop()
    for (const line of lines) this.incorporateLine(line)
    while (this.tip !== this.doc) this.finalize(this.tip)
    this.finalize(this.doc)
    return this.doc
  }

  ////////////////
  // ## Lines
  ////////////////

  /** Take one line:  continue open blocks, start new ones, add the text. */
  incorporateLine(text: string) {
    let container = this.doc
    this.oldtip = this.tip
    this.offset = 0
    this.column = 0
    this.blank = false
    this.partiallyConsumedTab = false
    this.lineNumber++
    this.line = text.replace(/\0/g, "�")

    // 1. which open blocks does this line continue?
    for (let lastChild: Block | undefined; (lastChild = container.children.at(-1)) && lastChild.open;) {
      container = lastChild
      this.findNextNonspace()
      const result = this.continueBlock(container)
      if (result === 2) return // the line closed a fence:  nothing more to do
      if (result === 1) {
        container = container.parent!
        break
      }
    }
    this.allClosed = container === this.oldtip
    this.lastMatchedContainer = container

    // 2. new blocks starting here?
    let matchedLeaf = container.kind !== "paragraph" && container.kind !== "table" && acceptsLines(container.kind)
    while (!matchedLeaf) {
      this.findNextNonspace()
      if (!this.indented && !MAYBE_SPECIAL.test(this.line.slice(this.nextNonspace))) {
        this.advanceNextNonspace()
        break
      }
      let started = 0
      for (const start of this.blockStarts) {
        started = start.call(this, container)
        if (started) break
      }
      if (!started) {
        this.advanceNextNonspace()
        break
      }
      container = this.tip
      if (started === 2) matchedLeaf = true
    }

    // 3. the text
    if (!this.allClosed && !this.blank && this.tip.kind === "paragraph") {
      this.addLine() // lazy continuation
      return
    }
    this.closeUnmatchedBlocks()
    if (this.blank && container.children.at(-1)) container.children.at(-1)!.lastLineBlank = true
    const kind = container.kind
    // blank lines in quotes, fenced code or a just-opened empty item don't make a list loose
    const lastLineBlank =
      this.blank &&
      !(
        kind === "blockquote" ||
        (kind === "code" && container.fence) ||
        (kind === "item" && !container.children.length && container.startLine === this.lineNumber)
      )
    for (let block: Block | undefined = container; block; block = block.parent) block.lastLineBlank = lastLineBlank

    if (acceptsLines(kind)) {
      this.addLine()
      const close = container.htmlType && container.htmlType <= 5 && MD.HTML_BLOCK_CLOSE[container.htmlType]
      if (close && close.test(this.line.slice(this.offset))) this.finalize(container)
    } else if (this.offset < this.line.length && !this.blank) {
      this.addChild("paragraph")
      this.advanceNextNonspace()
      this.addLine()
    }
  }

  /** Does this line continue `block`?  0:  yes, 1:  no, 2:  yes, and it used the whole line (a closing fence). */
  continueBlock(block: Block): 0 | 1 | 2 {
    switch (block.kind) {
      case "blockquote":
        if (this.indented || this.peek(this.nextNonspace) !== ">") return 1
        this.advanceNextNonspace()
        this.advanceOffset(1, false)
        if (isSpaceOrTab(this.peek(this.offset))) this.advanceOffset(1, true)
        return 0
      case "item": {
        const { markerOffset, padding } = block.list!
        if (this.blank) {
          if (!block.children.length) return 1 // a blank line after an empty item ends it
          this.advanceNextNonspace()
        } else if (this.indent >= markerOffset + padding) {
          this.advanceOffset(markerOffset + padding, true)
        } else return 1
        return 0
      }
      case "heading":
      case "thematic_break":
        return 1
      case "code":
        if (block.fence) {
          const close = this.indent <= 3 && /^(?:`{3,}|~{3,})(?=[ \t]*$)/.exec(this.line.slice(this.nextNonspace))
          if (close && close[0][0] === block.fence.char && close[0].length >= block.fence.length) {
            this.finalize(block)
            return 2
          }
          // skip the fence's own indent
          for (let i = block.fence.offset; i > 0 && isSpaceOrTab(this.peek(this.offset)); i--)
            this.advanceOffset(1, true)
          return 0
        }
        if (this.indent >= CODE_INDENT) this.advanceOffset(CODE_INDENT, true)
        else if (this.blank) this.advanceNextNonspace()
        else return 1
        return 0
      case "html":
        return this.blank && (block.htmlType === 6 || block.htmlType === 7) ? 1 : 0
      case "paragraph":
      case "table":
        return this.blank ? 1 : 0
      default:
        return 0 // document, list
    }
  }

  ////////////////
  // ## Block starts
  ////////////////

  /**
   * Each block start, in the spec's order:  0 = not here, 1 = a container started, 2 = a leaf started.
   * - A table goes before setext headings:  `a | b` over `--- | ---` is a table, `a` over `---` a heading.
   */
  blockStarts = [
    this.startBlockquote,
    this.startAtxHeading,
    this.startFencedCode,
    this.startHtmlBlock,
    this.startTable,
    this.startSetextHeading,
    this.startThematicBreak,
    this.startListItem,
    this.startIndentedCode
  ]

  /** `>`:  a block quote. */
  startBlockquote(): number {
    if (this.indented || this.peek(this.nextNonspace) !== ">") return 0
    this.advanceNextNonspace()
    this.advanceOffset(1, false)
    if (isSpaceOrTab(this.peek(this.offset))) this.advanceOffset(1, true)
    this.closeUnmatchedBlocks()
    this.addChild("blockquote")
    return 1
  }

  /** `## Title`:  rulex `atx_heading`;  the closing `#`s go. */
  startAtxHeading(): number {
    if (this.indented || !this.isLine("atx_heading")) return 0
    this.advanceNextNonspace()
    const level = /^#+/.exec(this.line.slice(this.offset))![0].length
    this.advanceOffset(level, false)
    this.closeUnmatchedBlocks()
    const heading = this.addChild("heading")
    heading.level = level
    heading.lines = [
      this.line
        .slice(this.offset)
        .replace(/^[ \t]*#+[ \t]*$/, "")
        .replace(/[ \t]+#+[ \t]*$/, "")
        .trim()
    ]
    this.advanceOffset(this.line.length - this.offset, false)
    return 2
  }

  /** ` ``` ` / `~~~`:  rulex `fence_open`;  a backtick fence's info string has no backticks. */
  startFencedCode(): number {
    if (this.indented || !this.isLine("fence_open")) return 0
    const fence = /^`{3,}(?!.*`)|^~{3,}/.exec(this.line.slice(this.nextNonspace))
    if (!fence) return 0
    this.closeUnmatchedBlocks()
    const code = this.addChild("code")
    code.fence = { char: fence[0][0]!, length: fence[0].length, offset: this.indent }
    this.advanceNextNonspace()
    this.advanceOffset(fence[0].length, false)
    return 2
  }

  /** `<div>`, `<!-- -->` ...:  the spec's 7 HTML block kinds;  kind 7 can't interrupt a paragraph. */
  startHtmlBlock(container: Block): number {
    if (this.indented || this.peek(this.nextNonspace) !== "<") return 0
    const text = this.line.slice(this.nextNonspace)
    for (let type = 1; type <= 7; type++) {
      if (!MD.HTML_BLOCK_OPEN[type]!.test(text)) continue
      const interrupts =
        container.kind === "paragraph" || (!this.allClosed && !this.blank && this.tip.kind === "paragraph")
      if (type === 7 && interrupts) return 0
      this.closeUnmatchedBlocks()
      this.addChild("html").htmlType = type
      return 2
    }
    return 0
  }

  /**
   * GFM table:  a paragraph whose LAST line is a header row, and this line a delimiter row (rulex
   * `table_delimiter_row`) with as many cells.  The paragraph's other lines stay a paragraph.
   * - A `|` must be in one of them, so `a` over `---` stays a setext heading.
   */
  startTable(container: Block): number {
    if (container.kind !== "paragraph" || this.indented || !this.isLine("table_delimiter_row")) return 0
    const delimiter = this.line.slice(this.nextNonspace).trimEnd()
    const header = container.lines.at(-1)!.trim()
    if (!delimiter.includes("|") && !header.includes("|")) return 0
    const aligns = MD.tableCells(delimiter).map(alignOf)
    if (MD.tableCells(header).length !== aligns.length) return 0

    this.closeUnmatchedBlocks()
    const parent = container.parent!
    container.lines.pop()
    if (!container.lines.length) parent.children.pop()
    else this.finalize(container)
    const table = MD.newBlock("table", this.lineNumber - 1, parent)
    table.align = aligns
    table.lines = [header]
    parent.children.push(table)
    this.tip = table
    // the delimiter row goes in as the table's second line, by `addLine()`
    this.advanceNextNonspace()
    return 2
  }

  /**
   * `===` / `---` under a paragraph:  rulex `setext_underline`;  the paragraph becomes a heading.
   * - Link reference definitions at the paragraph's start aren't heading text:  they stay a paragraph of their own
   *   (for `MD.extractReferences()`), and if that's ALL it was, the underline is just text.
   */
  startSetextHeading(container: Block): number {
    if (this.indented || container.kind !== "paragraph" || !this.isLine("setext_underline")) return 0
    const content = `${container.lines.join("\n")}\n`
    const definitions = referencesLength(content)
    if (definitions && !/\S/.test(content.slice(definitions))) return 0
    this.closeUnmatchedBlocks()
    const heading = MD.newBlock("heading", container.startLine, container.parent)
    heading.level = this.peek(this.nextNonspace) === "=" ? 1 : 2
    const siblings = container.parent!.children
    if (definitions) {
      container.lines = lines(content.slice(0, definitions))
      heading.lines = lines(content.slice(definitions))
      container.open = false
      siblings.splice(siblings.indexOf(container) + 1, 0, heading)
    } else {
      heading.lines = container.lines
      siblings[siblings.indexOf(container)] = heading
    }
    this.tip = heading
    this.advanceOffset(this.line.length - this.offset, false)
    return 2
  }

  /** `---`, `* * *`:  rulex `thematic_break`. */
  startThematicBreak(): number {
    if (this.indented || !this.isLine("thematic_break")) return 0
    this.closeUnmatchedBlocks()
    this.addChild("thematic_break")
    this.advanceOffset(this.line.length - this.offset, false)
    return 2
  }

  /** `- item`, `1. item`:  a list item, and its list if this starts one. */
  startListItem(container: Block): number {
    if (this.indented && container.kind !== "list") return 0
    const data = this.parseListMarker(container)
    if (!data) return 0
    this.closeUnmatchedBlocks()
    if (this.tip.kind !== "list" || !listsMatch(this.tip.list!, data)) this.addChild("list").list = data
    this.addChild("item").list = data
    return 1
  }

  /** Four columns of indent, not in a paragraph:  indented code. */
  startIndentedCode(): number {
    if (!this.indented || this.tip.kind === "paragraph" || this.blank) return 0
    this.advanceOffset(CODE_INDENT, true)
    this.closeUnmatchedBlocks()
    this.addChild("code")
    return 2
  }

  /**
   * A list marker at the next non-space (rulex `bullet_marker` / `ordered_marker`), and where its content starts.
   * - SIDE EFFECT:  on a match, advances past the marker and the spaces after it.
   */
  parseListMarker(container: Block): ListData | undefined {
    if (this.indent >= CODE_INDENT) return undefined
    const rest = this.line.slice(this.nextNonspace)
    // a marker is at most 9 digits + `.`, then a space:  no need to tokenize the whole line
    if (!/^(?:[-+*]|[0-9]{1,9}[.)])/.test(rest)) return undefined
    const tokens = lineRules.tokenizeLine(rest.slice(0, 12))
    let data: ListData
    let markerLength: number
    if (lineRules.parse(tokens, "bullet_marker")?.length === 1) {
      data = { type: "bullet", bulletChar: rest[0], markerOffset: this.indent, padding: 0 }
      markerLength = 1
    } else if (lineRules.parse(tokens, "ordered_marker")?.length === 2) {
      const digits = tokens[0]!.value as string
      // interrupting a paragraph, an ordered list must start at 1
      if (container.kind === "paragraph" && digits !== "1") return undefined
      data = {
        type: "ordered",
        start: Number(digits),
        delimiter: rest[digits.length],
        markerOffset: this.indent,
        padding: 0
      }
      markerLength = digits.length + 1
    } else return undefined

    const after = this.peek(this.nextNonspace + markerLength)
    if (!(after === "" || after === " " || after === "\t")) return undefined
    // interrupting a paragraph, an item can't be empty
    if (container.kind === "paragraph" && !/[^ \t]/.test(rest.slice(markerLength))) return undefined

    this.advanceNextNonspace()
    this.advanceOffset(markerLength, true)
    const spacesStartColumn = this.column
    const spacesStartOffset = this.offset
    do {
      this.advanceOffset(1, true)
    } while (this.column - spacesStartColumn < 5 && isSpaceOrTab(this.peek(this.offset)))
    const blankItem = this.peek(this.offset) === ""
    const spaces = this.column - spacesStartColumn
    if (spaces >= 5 || spaces < 1 || blankItem) {
      // content one space after the marker;  the rest is indented code, or nothing
      data.padding = markerLength + 1
      this.column = spacesStartColumn
      this.offset = spacesStartOffset
      if (isSpaceOrTab(this.peek(this.offset))) this.advanceOffset(1, true)
    } else data.padding = markerLength + spaces
    return data
  }

  ////////////////
  // ## Tree
  ////////////////

  /** Add a `kind` block under the innermost open block that can hold it, closing the ones that can't. */
  addChild(kind: BlockKind): Block {
    while (!canContain(this.tip.kind, kind)) this.finalize(this.tip)
    const child = MD.newBlock(kind, this.lineNumber, this.tip)
    this.tip.children.push(child)
    this.tip = child
    return child
  }

  /** Add the rest of the line (from `offset`) to `tip`;  a part-used tab becomes the spaces it had left. */
  addLine() {
    if (this.partiallyConsumedTab) {
      this.offset++
      const toTab = 4 - (this.column % 4)
      this.tip.lines.push(" ".repeat(toTab) + this.line.slice(this.offset))
    } else this.tip.lines.push(this.line.slice(this.offset))
  }

  /** Close the blocks this line didn't continue. */
  closeUnmatchedBlocks() {
    if (this.allClosed) return
    while (this.oldtip !== this.lastMatchedContainer) {
      const parent = this.oldtip.parent!
      this.finalize(this.oldtip)
      this.oldtip = parent
    }
    this.allClosed = true
  }

  /** Close `block`:  `tip` moves to its parent.  Fenced code splits off its info string;  lists decide tightness. */
  finalize(block: Block) {
    block.open = false
    if (block.kind === "code") {
      if (block.fence) block.info = block.lines.shift()?.trim() ?? ""
      else while (block.lines.length && !/\S/.test(block.lines.at(-1)!)) block.lines.pop()
    } else if (block.kind === "html") {
      while (block.lines.length && !/\S/.test(block.lines.at(-1)!)) block.lines.pop()
    } else if (block.kind === "list") {
      block.tight = isTight(block)
    }
    if (block.parent) this.tip = block.parent
  }

  ////////////////
  // ## Columns
  ////////////////

  /** Find the next non-space from `offset`:  sets `nextNonspace`, `indent`, `indented`, `blank`. */
  findNextNonspace() {
    let i = this.offset
    let columns = this.column
    let char = ""
    while ((char = this.line.charAt(i)) !== "") {
      if (char === " ") {
        i++
        columns++
      } else if (char === "\t") {
        i++
        columns += 4 - (columns % 4)
      } else break
    }
    this.blank = char === ""
    this.nextNonspace = i
    this.nextNonspaceColumn = columns
    this.indent = columns - this.column
    this.indented = this.indent >= CODE_INDENT
  }

  /** Move to the next non-space. */
  advanceNextNonspace() {
    this.offset = this.nextNonspace
    this.column = this.nextNonspaceColumn
    this.partiallyConsumedTab = false
  }

  /**
   * Move `count` characters on -- or `count` COLUMNS, when `columns`:  then a tab may be only part used
   * (`partiallyConsumedTab`), and its rest becomes spaces in `addLine()`.
   */
  advanceOffset(count: number, columns: boolean) {
    for (let char: string; count > 0 && (char = this.line.charAt(this.offset)) !== "";) {
      if (char === "\t") {
        const toTab = 4 - (this.column % 4)
        if (columns) {
          this.partiallyConsumedTab = toTab > count
          const advance = Math.min(count, toTab)
          this.column += advance
          this.offset += this.partiallyConsumedTab ? 0 : 1
          count -= advance
        } else {
          this.partiallyConsumedTab = false
          this.column += toTab
          this.offset++
          count--
        }
      } else {
        this.partiallyConsumedTab = false
        this.offset++
        this.column++
        count--
      }
    }
  }

  /** The character at `offset`, or `""` past the end. */
  peek(offset: number) {
    return this.line.charAt(offset)
  }

  /**
   * Does the rest of the line (from the next non-space) WHOLLY match rulex line rule `ruleName`?
   * - Only asks the rule when `LINE_GUARDS` says the line could be one:  tokenizing and parsing every line for
   *   every rule cost 6x marked's time (`guides/markdown/experiments/profile.mts`).  The rule still decides.
   * - The line's tokens are kept for the next rule asked about the same line.
   */
  isLine(ruleName: string) {
    const rest = this.line.slice(this.nextNonspace)
    if (!LINE_GUARDS[ruleName]!.test(rest)) return false
    if (this.lineTokens?.line !== this.lineNumber || this.lineTokens.offset !== this.nextNonspace) {
      this.lineTokens = { line: this.lineNumber, offset: this.nextNonspace, tokens: lineRules.tokenizeLine(rest) }
    }
    return !!lineRules.matchWhole(this.lineTokens.tokens, ruleName)
  }

  /** `isLine()`'s tokens for the line it last tokenized. */
  lineTokens?: { line: number; offset: number; tokens: ReturnType<typeof lineRules.tokenizeLine> }
}

/**
 * Cheap character checks before each rulex line rule:  a line that fails one can't be that kind, so the rule isn't
 * asked.  NEVER stricter than the rule itself -- a guard only filters out lines the rule would refuse anyway.
 */
const LINE_GUARDS: Record<string, RegExp> = {
  atx_heading: /^#/,
  fence_open: /^(?:```|~~~)/,
  table_delimiter_row: /^[|:-][|:\- \t]*$/,
  setext_underline: /^(?:=+|-+)[ \t]*$/,
  thematic_break: /^[-*_][-*_ \t]*$/
}

////////////////
// ## Helpers
////////////////

/** Leaves that take lines of text. */
function acceptsLines(kind: BlockKind) {
  return kind === "paragraph" || kind === "code" || kind === "html" || kind === "table"
}

/** Can a `parent` block hold a `child`? */
function canContain(parent: BlockKind, child: BlockKind) {
  if (parent === "document" || parent === "blockquote" || parent === "item") return child !== "item"
  if (parent === "list") return child === "item"
  return false
}

/** Does `data` continue the list `list` started with:  same kind, bullet and delimiter? */
function listsMatch(list: ListData, data: ListData) {
  return list.type === data.type && list.delimiter === data.delimiter && list.bulletChar === data.bulletChar
}

/** Space or tab? */
function isSpaceOrTab(char: string) {
  return char === " " || char === "\t"
}

/** A tight list:  no blank line between its items, or between the blocks inside one. */
function isTight(list: Block) {
  const items = list.children
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!
    if (endsWithBlankLine(item) && items[i + 1]) return false
    const children = item.children
    for (let j = 0; j < children.length; j++) {
      if (endsWithBlankLine(children[j]!) && (items[i + 1] || children[j + 1])) return false
    }
  }
  return true
}

/** Did `block`, or its last item / last child down the line, end with a blank line? */
function endsWithBlankLine(block: Block | undefined) {
  for (; block; block = block.kind === "list" || block.kind === "item" ? block.children.at(-1) : undefined) {
    if (block.lastLineBlank) return true
  }
  return false
}

/** How long the link reference definitions at the start of `content` are (0:  none). */
function referencesLength(content: string) {
  const parser = new MD.InlineParser()
  let length = 0
  for (
    let next: number;
    content.slice(length).startsWith("[") && (next = parser.parseReference(content.slice(length), {}));
  ) {
    length += next
  }
  return length
}

/** `text`'s lines, its last line end dropped. */
function lines(text: string) {
  return text.replace(/\n$/, "").split("\n")
}

/** A delimiter cell's alignment:  `:--` left, `:-:` center, `--:` right. */
function alignOf(cell: string) {
  const left = cell.startsWith(":")
  const right = cell.endsWith(":")
  return left && right ? "center" : left ? "left" : right ? "right" : undefined
}
