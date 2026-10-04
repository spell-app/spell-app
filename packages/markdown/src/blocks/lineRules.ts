/**
 * Line kinds, in rulex:  what a line (after its container prefixes) IS -- a thematic break, an ATX heading ...
 * - The block scanner (`MD.BlockScanner`) asks with `lineRules.matchWhole(tokens, "<rule>")`;  it reads the details
 *   it needs (columns, levels, info strings) from the raw text, since those are about characters, not tokens.
 * - Spacing is as written (`packages/docs/rulex/rulex.html`):  `#{1,6}{spaces}` needs a space after the run,
 *   `- {3,}` lets the dashes space.
 * - Leaf rules rulex can't say (`any`, `digits`) are built in code, at the top.
 */
import { P } from "$/parser"
// Import directly to avoid circular import
import { MarkdownParser } from "$/markdown/MarkdownParser"

/** The line-kind rules. */
export const lineRules = new MarkdownParser({ module: "lines" })

////////////////
// ## `any` rule
//    e.g. any one token
////////////////

/** Any one token:  the rest of a line, in `{any}*`. */
class any_token extends P.TokenType {
  static ruleName = "any"
}
lineRules.addRule(any_token, { tokenType: P.Token })

////////////////
// ## `digits` rule
//    e.g. "42"
////////////////

/** 1-9 digits:  an ordered list number. */
class digits extends P.Pattern {}
lineRules.addRule(digits, { pattern: /^[0-9]{1,9}$/ })

////////////////
// ## `thematic_break` rule
//    e.g. "---", "* * *"
////////////////

/** Three or more of one of `-`, `*`, `_`, spaced or not. */
class thematic_break extends P.Sequence {}
lineRules.addRule(thematic_break, { syntax: "(- {3,}|\\* {3,}|_ {3,})" })

////////////////
// ## `atx_heading` rule
//    e.g. "## Title", "#"
////////////////

/** A run of 1-6 `#`, then nothing, or a space and anything. */
class atx_heading extends P.Sequence {}
lineRules.addRule(atx_heading, { syntax: "#{1,6}" })
lineRules.addRule(atx_heading, { syntax: "#{1,6}{spaces}{any}*" })

////////////////
// ## `fence_open` rule
//    e.g. "```ts", "~~~"
////////////////

/** A run of 3+ backticks or tildes, then any info string. */
class fence_open extends P.Sequence {}
lineRules.addRule(fence_open, { syntax: "(`{3,}|~{3,})" })
lineRules.addRule(fence_open, { syntax: "(`{3,}|~{3,}) {any}+" })

////////////////
// ## `setext_underline` rule
//    e.g. "===", "---"
////////////////

/** A run of `=` or of `-`, touching:  the line under a setext heading. */
class setext_underline extends P.Sequence {}
lineRules.addRule(setext_underline, { syntax: "(={1,}|-{1,})" })

////////////////
// ## `bullet_marker` rule
//    e.g. "-"
////////////////

/** A bullet list marker;  the scanner checks the space after it. */
class bullet_marker extends P.Sequence {}
lineRules.addRule(bullet_marker, { syntax: "(-|\\+|\\*)" })

////////////////
// ## `ordered_marker` rule
//    e.g. "1."
////////////////

/** An ordered list marker:  digits touching `.` or `)`. */
class ordered_marker extends P.Sequence {}
lineRules.addRule(ordered_marker, { syntax: "{digits}(.|\\))" })

////////////////
// ## `table_delimiter_row` rule
//    e.g. "| --- | :-: |"
////////////////

/** One delimiter cell:  dashes, with a colon either side for alignment, touching. */
class table_align extends P.Sequence {}
lineRules.addRule(table_align, { syntax: ":?-+:?" })

/** A table's delimiter row:  delimiter cells between pipes, the outer pipes optional. */
class table_delimiter_row extends P.Sequence {}
lineRules.addRule(table_delimiter_row, { syntax: "\\|? [{table_align} \\|]" })
