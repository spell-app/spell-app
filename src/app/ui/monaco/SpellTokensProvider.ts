import { P } from "~/parser"
import { SP } from "~/languages/spell"

import type { monaco } from "./monaco"

/**
 * Instant colouring for spell, line by line, from its TOKENS:  words, symbols, numbers, comments, text.
 * - Needs no parse, so it's there from the first keystroke;  colouring from the parse (semantic tokens) goes on top.
 * - Each line tokenizes on its own, so nothing carries between lines -- `state` is always `LINE_STATE`.
 * - NEVER throws:  a line the tokenizer chokes on just goes uncoloured.
 */
export class SpellTokensProvider implements monaco.languages.TokensProvider {
  /** The only state there is:  lines don't depend on each other. */
  static LINE_STATE: monaco.languages.IState = {
    clone: () => SpellTokensProvider.LINE_STATE,
    equals: (other) => other === SpellTokensProvider.LINE_STATE
  }

  getInitialState(): monaco.languages.IState {
    return SpellTokensProvider.LINE_STATE
  }

  /**
   * Tokens of `line`, by where each starts.
   * - `""` rule name:  tokenize the line as-is, NOT as a `"block"`, which would break it into indented blocks.
   */
  tokenize(line: string, state: monaco.languages.IState): monaco.languages.ILineTokens {
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
    return { tokens, endState: state }
  }

  /** Theme scope to colour `token` with, or `undefined` for none. */
  private scopesFor(token: P.Token): string | undefined {
    if (token instanceof P.CommentToken) return token.commentSymbol === "##" ? "comment.header" : "comment"
    if (token instanceof P.TextToken) return "string"
    if (token instanceof P.NumberToken) return "number"
    if (token instanceof P.SymbolToken) return "operator"
    if (token instanceof P.WordToken) return "identifier"
    return undefined
  }
}
