import { P } from "$/parser"
import { MD } from "$/markdown"

import "$/parser/rulex"

/**
 * A `P.Parser` for markdown:  `MD.MarkdownTokenizer`, rules written in rulex.
 * - One per rule module (`lineRules` ...), as spell has one `SpellParser` per module.
 * - `matchWhole()`:  a rule that must match a WHOLE token list, e.g. one line -- rules match at the head of their
 *   tokens, so a partial match is no match here.
 */
export class MarkdownParser extends P.Parser {
  /** Markdown's tokenizer:  see `MD.MarkdownTokenizer`. */
  get tokenizer(): P.Tokenizer {
    return this.derived("tokenizer", () => new MD.MarkdownTokenizer())
  }

  /** Tokenize `text` (one line, no newline) for `matchWhole()`. */
  tokenizeLine(text: string): P.Token[] {
    return this.tokenizer.tokenize(text)
  }

  /** `ruleName`'s match if it takes ALL of `tokens`, else `undefined`. */
  matchWhole(tokens: P.Token[], ruleName: string): P.Match | undefined {
    if (!tokens.length) return undefined
    const match = this.parse(tokens, ruleName)
    return match && match.length === tokens.length ? match : undefined
  }
}
