import { P } from "$/parser"
import { SP } from "$/spell"
import { LSP } from "$/lsp"

import { monaco } from "./monaco"

/**
 * Instant colouring for spell, line by line, from its TOKENS:  words, symbols, numbers, comments, text.
 * - Needs no parse, so it's there from the first keystroke;  colouring from the parse (semantic tokens) goes on top.
 * - Each spell line tokenizes on its own.
 * - Blocks of another language are coloured as that language, by Monaco's own colouring (`EMBEDDED_BLOCKS`):
 *   - a type's `<css>` block as CSS -- see `LSP.SpellCSS`
 *   - a `<markdown>` block as markdown, in a drawing or a type's outline -- see spell's `markdown_block`
 * - The only state carried between lines is which block we're in, if any (`SPELL_LINE`, `CSS_LINE` ...).
 * - A block's lines are each coloured on their own too,
 *   so a CSS comment or a fenced code block over several lines colours its first line only.
 * - NEVER throws:  a line the tokenizer chokes on just goes uncoloured.
 */
export class SpellTokensProvider implements monaco.languages.TokensProvider {
  /** State after a line of spell. */
  static SPELL_LINE = SpellTokensProvider.lineState()
  /** State after a `<css>` line, or a line of CSS in its block. */
  static CSS_LINE = SpellTokensProvider.lineState()
  /** State after a `<markdown>` line, or a line of markdown in its block. */
  static MARKDOWN_LINE = SpellTokensProvider.lineState()

  /**
   * The blocks of another language spell holds, each alone on its lines:  `<css>` ... `</css>`.
   * - `tag`:  its tag
   * - `language`:  Monaco's language that colours it
   * - `state`:  the state inside it
   * - `open` / `close`:  its first and last lines
   */
  static EMBEDDED_BLOCKS: EmbeddedBlock[] = [
    {
      tag: "css",
      language: "css",
      state: SpellTokensProvider.CSS_LINE,
      open: LSP.SpellCSS.OPEN_LINE,
      close: LSP.SpellCSS.CLOSE_LINE
    },
    {
      tag: "markdown",
      language: "markdown",
      state: SpellTokensProvider.MARKDOWN_LINE,
      open: /^\s*<markdown>\s*$/,
      close: /^\s*<\/markdown>\s*$/
    }
  ]

  getInitialState(): monaco.languages.IState {
    return SpellTokensProvider.SPELL_LINE
  }

  /**
   * Tokens of `line`, by where each starts, and the state the next line starts in.
   * - `<css>` alone on a line starts a CSS block, `</css>` ends it;  likewise `<markdown>`.
   */
  tokenize(line: string, state: monaco.languages.IState): monaco.languages.ILineTokens {
    const { SPELL_LINE, EMBEDDED_BLOCKS } = SpellTokensProvider
    const inside = EMBEDDED_BLOCKS.find((block) => block.state === state)
    if (inside) {
      if (inside.close.test(line)) return { tokens: this.tagTokens(line, inside.tag), endState: SPELL_LINE }
      return { tokens: this.embeddedTokens(line, inside.language), endState: inside.state }
    }
    const opened = EMBEDDED_BLOCKS.find((block) => block.open.test(line))
    if (opened) return { tokens: this.tagTokens(line, opened.tag), endState: opened.state }
    return { tokens: this.spellTokens(line), endState: SPELL_LINE }
  }

  /**
   * Tokens of a line of spell.
   * - `""` rule name:  tokenize the line as-is, NOT as a `"block"`, which would break it into indented blocks.
   */
  private spellTokens(line: string): monaco.languages.IToken[] {
    const tokens: monaco.languages.IToken[] = []
    try {
      let end = 0
      for (const token of SP.spellParser.tokenize(line, "") ?? []) {
        // whitespace between tokens is uncoloured
        if (token.start > end) tokens.push({ startIndex: end, scopes: "" })
        tokens.push({ startIndex: token.start, scopes: this.scopesFor(token) ?? "" })
        end = token.end
      }
    } catch (error) {
      console.warn("SpellTokensProvider.tokenize():  couldn't tokenize", { line, error })
    }
    return tokens
  }

  /**
   * Tokens of a line of an embedded block, from Monaco's colouring of `language`:
   * its token types (`attribute.name.css` ...) as scopes.
   * - Markdown's line is coloured without its indent:  a `#` heading or a `>` quote counts only at the start.
   */
  private embeddedTokens(line: string, language: string): monaco.languages.IToken[] {
    const indent = language === "markdown" ? line.length - line.trimStart().length : 0
    try {
      const tokens = (monaco.editor.tokenize(line.slice(indent), language)[0] ?? []).map(({ offset, type }) => ({
        startIndex: offset + indent,
        scopes: type
      }))
      return indent ? [{ startIndex: 0, scopes: "" }, ...tokens] : tokens
    } catch (error) {
      console.warn(`SpellTokensProvider.tokenize():  couldn't tokenize ${language}`, { line, error })
      return []
    }
  }

  /** Tokens of a block's opening or closing line, e.g. `<css>` or `</css>`, coloured as a tag. */
  private tagTokens(line: string, tag: string): monaco.languages.IToken[] {
    const open = line.indexOf("<")
    const close = line.indexOf(">")
    const name = line.indexOf(tag, open)
    return [
      { startIndex: 0, scopes: "" },
      { startIndex: open, scopes: "delimiter" },
      { startIndex: name, scopes: "tag" },
      { startIndex: close, scopes: "delimiter" },
      { startIndex: close + 1, scopes: "" }
    ]
  }

  /** Theme scope to colour `token` with, or `undefined` for none. */
  private scopesFor(token: P.Token): string | undefined {
    if (token instanceof P.CommentToken) return token.commentSymbol.startsWith("#") ? "comment.header" : "comment"
    if (token instanceof P.TextToken) return "string"
    if (token instanceof P.NumberToken) return "number"
    if (token instanceof P.SymbolToken) return "operator"
    if (token instanceof P.WordToken) return "identifier"
    return undefined
  }

  /** A state that's equal only to itself:  lines carry nothing else between them. */
  private static lineState(): monaco.languages.IState {
    const state: monaco.languages.IState = { clone: () => state, equals: (other) => other === state }
    return state
  }
}

/** A block of another language in spell, coloured as that language -- see `SpellTokensProvider.EMBEDDED_BLOCKS`. */
type EmbeddedBlock = {
  /** Its tag, e.g. `css`. */
  tag: string
  /** Monaco's language which colours it, e.g. `css`. */
  language: string
  /** The state inside it. */
  state: monaco.languages.IState
  /** Its first line:  its tag alone, e.g. `<css>`. */
  open: RegExp
  /** Its last line, e.g. `</css>`. */
  close: RegExp
}
