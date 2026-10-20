import { proto } from "$/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"

/**
 * `pattern_text` rule:  a PATTERN in quotes, a regular expression, read exactly as typed (epic `property-editor` P9).
 * - e.g. `"^\d+\.\d+\.\d+$"`, `"^[a-z]+$"`, after `must match` (`must_rule`)
 * - NOT `text`:  there, `[name]` fills in a value and `\d` is an escape.  In a pattern, `[a-z]` is a set of letters and
 *   `\d` a digit.
 * - Compiles to the pattern as text, backslashes kept:  `"^\\d+$"`.
 */
export class PatternText extends P.TokenType {
  @proto static highlightAs: P.HighlightKind = "string"
  @proto static datatype = "text"
  @proto static tokenType = P.TextToken

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    return new P.ASTStringLiteral(match, { value: (match.matched[0] as P.TextToken).innerText, quote: '"' })
  }
}
classes.addRule(PatternText, {
  tests: [
    {
      tests: [
        ['"^\\d+$"', '"^\\\\d+$"'],
        ['"^[a-z]+$"', '"^[a-z]+$"']
      ]
    }
  ]
})
