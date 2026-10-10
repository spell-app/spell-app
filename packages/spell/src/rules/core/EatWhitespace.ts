import { proto } from "$/util"
import { P } from "$/parser"
import { core } from "./core.parser"

/**
 * `eat_whitespace` rule:  eats all whitespace at start of tokens
 * -- used to skip leading indent/newlines before a real rule.
 * - e.g. `  `, eats leading whitespace tokens greedily
 * - Base class is `P.Repeat`, not `P.Subrule` -- syntax `{whitespace}*` compiles to a `Repeat` (of a
 *   `whitespace` `Subrule`), matching zero-or-more times.  See report: the old bag form got away with
 *   `constructor: class ... extends P.Subrule` only because it's dead code, never referenced elsewhere.
 */
export class EatWhitespace extends P.Repeat {
  @proto static datatype = "text"
}
core.addRule(EatWhitespace, {
  syntax: "{whitespace}*"
})
