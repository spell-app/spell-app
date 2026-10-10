import { P } from "$/parser"
import { SP } from "$/spell"
import { LSP } from "$/lsp"

import { monaco } from "./monaco"

/**
 * Instant colouring for spell, line by line, from its TOKENS:  words, symbols, numbers, comments, text.
 * - Needs no parse, so it's there from the first keystroke;  colouring from the parse (semantic tokens) goes on top.
 * - Each spell line tokenizes on its own.
 * - A type's `<css>` block is coloured as CSS, by Monaco's own CSS colouring -- see `LSP.SpellCSS`:
 *   - the only state carried between lines is whether we're in one (`SPELL_LINE` / `CSS_LINE`)
 *   - each CSS line is coloured on its own too, so a CSS comment over several lines colours its first line only
 * - NEVER throws:  a line the tokenizer chokes on just goes uncoloured.
 */
export class SpellTokensProvider implements monaco.languages.TokensProvider {
  /** State after a line of spell. */
  static SPELL_LINE = SpellTokensProvider.lineState()
  /** State after a `<css>` line, or a line of CSS in its block. */
  static CSS_LINE = SpellTokensProvider.lineState()

  getInitialState(): monaco.languages.IState {
    return SpellTokensProvider.SPELL_LINE
  }

  /**
   * Tokens of `line`, by where each starts, and the state the next line starts in.
   * - `<css>` alone on a line starts a CSS block, `</css>` ends it.
   */
  tokenize(line: string, state: monaco.languages.IState): monaco.languages.ILineTokens {
    const { SPELL_LINE, CSS_LINE } = SpellTokensProvider
    if (state === CSS_LINE) {
      if (LSP.SpellCSS.CLOSE_LINE.test(line)) return { tokens: this.tagTokens(line), endState: SPELL_LINE }
      return { tokens: this.cssTokens(line), endState: CSS_LINE }
    }
    if (LSP.SpellCSS.OPEN_LINE.test(line)) return { tokens: this.tagTokens(line), endState: CSS_LINE }
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

  /** Tokens of a line of CSS, from Monaco's CSS colouring:  its token types (`attribute.name.css` ...) as scopes. */
  private cssTokens(line: string): monaco.languages.IToken[] {
    try {
      return (monaco.editor.tokenize(line, "css")[0] ?? []).map(({ offset, type }) => ({
        startIndex: offset,
        scopes: type
      }))
    } catch (error) {
      console.warn("SpellTokensProvider.tokenize():  couldn't tokenize CSS", { line, error })
      return []
    }
  }

  /** Tokens of a `<css>` or `</css>` line, coloured as a tag. */
  private tagTokens(line: string): monaco.languages.IToken[] {
    const open = line.indexOf("<")
    const close = line.indexOf(">")
    const name = line.indexOf("css", open)
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
