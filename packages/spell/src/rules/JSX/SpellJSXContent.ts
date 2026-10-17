import { P } from "$/parser"
import type { JSXMatchData } from "./JSX.shared"

/**
 * Base for JSX rules which parse spell out of their token's text:  `jsxAttribute` values and `jsxExpression`s.
 * - What they parse goes in `match.data` (`expression` / `statement` / `error`), NOT `matched` --
 *   see `SpellJSX.parseErrorsIn()`, which finds errors there.
 */
export class SpellJSXContent extends P.TokenType<never, JSXMatchData> {
  /**
   * Move tokens `parsed` from a COPY of `jsxToken`'s `{...}` contents to where that text sits in the FILE,
   * so errors and positions inside JSX line up with the source.
   * - The copy is trimmed, with newlines collapsed to spaces:  same length, so one shift puts every token right.
   * - Copy's char 0 is the file's `{`, plus 1, plus whatever whitespace `trim()` dropped in front.
   * - `line` / `ch` come from `jsxToken`'s own, counting the newlines in its `raw` up to each inner token.
   *   The copy lost them, and we haven't got the file text here.
   * - SIDE EFFECT:  remembers the tokens as `jsxToken.innerTokens`,
   *   so `Tokenizer.forEachToken()` keeps them current after an edit.
   * - Losing candidates parse the same token too, so `innerTokens` may hold tokens of matches nobody kept.
   *   Moving those as well is harmless.
   */
  protected placeInFile(parsed: P.Match | undefined, jsxToken: P.JSXExpressionToken) {
    const { contents, raw, start, line = 0, ch = 0 } = jsxToken
    if (!parsed || typeof contents !== "string" || !raw) return
    const lead = contents.length - contents.trimStart().length
    P.Tokenizer.shiftTokens(parsed.tokens, start + raw.indexOf("{") + 1 + lead)
    P.Tokenizer.forEachToken(parsed.tokens, (token) => {
      const before = raw.slice(0, token.start - start)
      const lastNewline = before.lastIndexOf("\n")
      token.record.line = line + (before.split("\n").length - 1)
      token.record.ch = lastNewline === -1 ? ch + before.length : before.length - lastNewline - 1
    })
    ;(jsxToken.innerTokens ??= []).push(...parsed.tokens)
  }
}
