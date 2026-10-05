// Import directly to avoid circular import
import { Tokenizer } from "$/parser/tokenizer/Tokenizer"

/**
 * The tokenizer rulex reads a `syntax` string with:  words, numbers, symbols, whitespace -- nothing else.
 * - Why:  the default `P.Tokenizer` knows spell's comments, quotes and JSX, so in a syntax `--`, `//`, a
 *   line-start `#`, `"..."` and `<b>` became those tokens and never reached rulex.  Here they're plain symbols:
 *   only rulex's own specials (`? * + ( ) [ ] { } | : \`) need escaping.
 * - Numbers are digits only:  `1.1` is `1` `.` `1`, `-1` is `-` `1`.  Rulex needs numbers for counts, not
 *   decimals.
 * - `¬` / `∆` are real characters here (`rewriteFixtureChars`).
 * - What the rules then MATCH is up to the language's own tokenizer, not this one.
 */
export class RulexTokenizer extends Tokenizer {
  rewriteFixtureChars = false

  /** Match a single top-level token at `start` of `text`:  whitespace, word, number, newline or one symbol. */
  matchTopTokens(text: string, start?: number, end?: number) {
    return (
      this.matchWhitespace(text, start, end) ||
      this.matchWord(text, start, end) ||
      this.matchNumber(text, start, end) ||
      this.matchNewline(text, start, end) ||
      this.matchSymbol(text, start, end)
    )
  }

  /** A number starts with a digit:  no sign, no leading `.`. */
  get NUMBER_START() {
    return /[0-9]/
  }

  /** Digits only. */
  get NUMBER() {
    return /^[0-9]+/
  }
}
