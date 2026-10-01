import { P } from "#parser"

/**
 * Re-lays out source text from its tokens, changing ONLY whitespace:  indentation, gaps between tokens, blank lines.
 * - Language-neutral:  which symbols want a space after them, or none before, comes in `TokenFormatterProps`.
 * - Tokens are copied from the text exactly -- comments, strings and JSX (which may span lines) never change.
 * - Works whatever the tokenizer's `whitespacePolicy`:  gaps are measured in the text, whitespace tokens skipped.
 * - Answers per ORIGINAL line (`formatLines()`), so an editor gets small edits rather than one big one.
 * - Indent LEVELS come from indent widths, NOT from the tokenizer's blocks, which nest one per whitespace
 *   character:  deeper than the line before => one level in, shallower => back out to the level of that width.
 * - NEVER changes meaning:  gives up (`formatLines()` => `undefined`) if the result tokenizes differently,
 *   and keeps every line's own indentation if a dedent lands BETWEEN levels (0, 4, then 2), which the parser
 *   nests in a way levels can't say.
 */
export class TokenFormatter {
  /** Tokenizer of the language being formatted. */
  declare tokenizer: P.Tokenizer
  /** Whitespace for ONE indent level, e.g. `"\t"` or `"  "`. */
  declare indent: string
  /** Most blank lines kept in a row -- a longer run shrinks to this. */
  declare maxBlankLines: number
  /** Drop blank lines at the end of the text? */
  declare trimFinalBlankLines: boolean
  /** Symbols followed by exactly one space, unless at the end of a line, e.g. `,`. */
  declare spaceAfter: string[]
  /** Symbols with no space before them, e.g. `,` or `)`. */
  declare noSpaceBefore: string[]
  /** Symbols with no space after them, e.g. `(`. */
  declare noSpaceAfter: string[]

  constructor({
    tokenizer,
    indent = "\t",
    maxBlankLines = 2,
    trimFinalBlankLines = false,
    spaceAfter = [],
    noSpaceBefore = [],
    noSpaceAfter = []
  }: TokenFormatterProps) {
    Object.assign(this, { tokenizer, indent, maxBlankLines, trimFinalBlankLines, spaceAfter })
    Object.assign(this, { noSpaceBefore, noSpaceAfter })
  }

  /** `text` formatted -- or unchanged, if formatting it safely isn't possible. */
  format(text: string): string {
    const lines = this.formatLines(text)
    return lines ? TokenFormatter.applyLines(text, lines) : text
  }

  /**
   * Each line of `text`, formatted, in order -- `undefined` if formatting would change what `text` tokenizes to.
   * - A line runs from `start` to `end` (before its newline);  the next starts at `next`.
   *   A token spanning lines, e.g. JSX, belongs to the line it starts on.
   * - `text` is `undefined` for a blank line dropped by `maxBlankLines` / `trimFinalBlankLines`:
   *   remove from `start` to `next`, newline and all.
   */
  formatLines(text: string): P.FormattedLine[] | undefined {
    const lines = this.tokenizer.breakIntoLines(this.tokenizer.tokenize(text))
    const contents = lines.map((line) => line.tokens.filter((token) => !(token instanceof P.WhitespaceToken)))
    const levels = this.levelsOf(lines, contents)
    let lastContent = lines.length - 1
    while (lastContent >= 0 && contents[lastContent]!.length === 0) lastContent--
    let blankRun = 0
    const formatted = lines.map((line, index): P.FormattedLine => {
      const start = line.start
      const next = line.newline ? line.newline.start + 1 : text.length
      const end = line.newline ? line.newline.start : text.length
      const tokens = contents[index]!
      if (tokens.length === 0) {
        blankRun++
        const isDropped = blankRun > this.maxBlankLines || (this.trimFinalBlankLines && index > lastContent)
        return { start, end, next, text: isDropped ? undefined : "" }
      }
      blankRun = 0
      const indent = levels ? this.indent.repeat(levels[index]!) : (line.leading ?? "")
      return { start, end, next, text: indent + this.formatTokens(tokens, text) }
    })

    const result = TokenFormatter.applyLines(text, formatted)
    return TokenFormatter.sameTokens(this.tokenizer, text, result) ? formatted : undefined
  }

  /**
   * Indent level of each line (blank lines too, ignored), or `undefined` if some dedent lands between levels.
   * - `contents` are each line's tokens other than whitespace.
   * - Level 0 is the SHALLOWEST indent in the text, as the tokenizer's top block is.
   */
  private levelsOf(lines: P.LineToken[], contents: P.Token[][]): number[] | undefined {
    const contentLines = lines.filter((_line, index) => contents[index]!.length > 0)
    if (contentLines.length === 0) return lines.map(() => 0)
    const widths = [Math.min(...contentLines.map((line) => line.indent))]
    const levels: number[] = []
    for (const [index, line] of lines.entries()) {
      if (contents[index]!.length > 0) {
        if (line.indent > widths.at(-1)!) widths.push(line.indent)
        while (line.indent < widths.at(-1)!) widths.pop()
        if (line.indent !== widths.at(-1)) return undefined
      }
      levels.push(widths.length - 1)
    }
    return levels
  }

  /** A line's `tokens`, copied from `text`, with the gaps between them made uniform -- see `gapBetween()`. */
  private formatTokens(tokens: P.Token[], text: string): string {
    let result = ""
    tokens.forEach((token, index) => {
      result += text.slice(token.start, token.end)
      const next = tokens[index + 1]
      if (next) result += this.gapBetween(token, next, text.slice(token.end, next.start))
    })
    return result
  }

  /**
   * Whitespace to put between tokens `before` and `after`, which had `gap` between them.
   * - Before a comment:  `gap` as it was, so comments lined up at the end of lines stay lined up.
   * - Then `noSpaceBefore` / `noSpaceAfter`, then `spaceAfter`.
   * - Otherwise one space if there was any, none if the tokens touched -- NEVER joining or splitting them.
   */
  private gapBetween(before: P.Token, after: P.Token, gap: string): string {
    if (after instanceof P.CommentToken) return gap
    const beforeSymbol = before instanceof P.SymbolToken ? before.raw : undefined
    const afterSymbol = after instanceof P.SymbolToken ? after.raw : undefined
    if (afterSymbol && this.noSpaceBefore.includes(afterSymbol)) return ""
    if (beforeSymbol && this.noSpaceAfter.includes(beforeSymbol)) return ""
    if (beforeSymbol && this.spaceAfter.includes(beforeSymbol)) return " "
    return gap ? " " : ""
  }

  /** `text` with formatted `lines` applied -- see `formatLines()`. */
  static applyLines(text: string, lines: P.FormattedLine[]): string {
    let result = ""
    let at = 0
    for (const { start, end, next, text: formatted } of lines) {
      result += text.slice(at, start) + (formatted === undefined ? "" : formatted + text.slice(end, next))
      at = next
    }
    return result + text.slice(at)
  }

  /** Do `a` and `b` tokenize to the same tokens, whitespace aside? */
  static sameTokens(tokenizer: P.Tokenizer, a: string, b: string): boolean {
    const aTokens = tokensOf(a)
    const bTokens = tokensOf(b)
    return aTokens.length === bTokens.length && aTokens.every((token, index) => token === bTokens[index])

    /** `text`'s tokens other than whitespace, as `Class:text`. */
    function tokensOf(text: string): string[] {
      return tokenizer
        .tokenize(text)
        .filter((token) => !(token instanceof P.WhitespaceToken))
        .map((token) => `${token.constructor.name}:${text.slice(token.start, token.end)}`)
    }
  }
}

/** Constructor props for `TokenFormatter` -- all but `tokenizer` optional. */
export type TokenFormatterProps = {
  /** Tokenizer of the language being formatted. */
  tokenizer: P.Tokenizer
  /** Whitespace for ONE indent level.  Default `"\t"`. */
  indent?: string
  /** Most blank lines kept in a row.  Default `2`. */
  maxBlankLines?: number
  /** Drop blank lines at the end of the text?  Default `false`. */
  trimFinalBlankLines?: boolean
  /** Symbols followed by exactly one space, unless at the end of a line. */
  spaceAfter?: string[]
  /** Symbols with no space before them. */
  noSpaceBefore?: string[]
  /** Symbols with no space after them. */
  noSpaceAfter?: string[]
}
