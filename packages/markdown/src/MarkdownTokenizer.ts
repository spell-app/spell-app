import { P } from "$/parser"

/**
 * Markdown's tokenizer:  words, one symbol per other character, newlines and indents -- nothing else.
 * - Words are letters / digits only (any script):  `_`, `-`, `*` are always symbols, so emphasis and list markers
 *   reach the rules one character each.
 * - `LEADING_ONLY`:  inline whitespace rides on the token before it (`token.whitespace`), which is what rulex's
 *   spacing reads (`#{1,6}{spaces}{text}`);  indents and newlines stay tokens.
 * - No comments, quotes, JSX or numbers:  `#`, `--`, `"`, `<b>`, `1.` are just symbols and words.
 * - `¬` / `∆` are real characters (`rewriteFixtureChars`).
 * - NOTE: an astral character (emoji) is two UTF-16 halves, each its own symbol:  fine for the rules, which only
 *   need its position;  rendering reads the source text.
 * - `\r\n` is normalised by `MD.normalize()` before tokenizing, not here.
 */
export class MarkdownTokenizer extends P.Tokenizer {
  rewriteFixtureChars = false

  /** Build one, `LEADING_ONLY` unless `props` say otherwise. */
  constructor(props: ConstructorParameters<typeof P.Tokenizer>[0] = {}) {
    super({ whitespacePolicy: P.WhitespacePolicy.LEADING_ONLY, ...props })
  }

  /** Match a single top-level token at `start` of `text`:  whitespace, word, newline or one symbol. */
  matchTopTokens(text: string, start?: number, end?: number) {
    return (
      this.matchWhitespace(text, start, end) ||
      this.matchWord(text, start, end) ||
      this.matchNewline(text, start, end) ||
      this.matchSymbol(text, start, end)
    )
  }

  /** A word starts with a letter or digit, any script. */
  get WORD_START() {
    return /[\p{L}\p{N}]/u
  }

  /** ... and goes on with letters and digits only. */
  get WORD_CHAR() {
    return /^[\p{L}\p{N}]/u
  }
}
