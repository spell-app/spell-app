import { proto } from "$/util"
import { P } from "$/parser"
import { identifierBlacklist } from "$/spell/rules/identifier-blacklist"
import { properties } from "./properties.parser"

/** Property name:  single lower-case-initial word, dashes and numbers OK, e.g. `foo`, `foo-bar2`. */
const LOWER_INITIAL_WORD = /^[a-z][\w-]*$/

/**
 * `property` rule:  ONE word naming a property:  initial-lower-case, not in `identifierBlacklist`.
 * - What a LOOSE read takes, e.g. `the is-set-up of the deck` -- see `property_expression`.
 * - Declarations and resolved reads take `member_words`.
 * - `mapValue()` converts dashes to underscores, e.g. `foo-bar` compiles as `foo_bar`.
 */
export class Property extends P.Pattern {
  @proto static pattern = LOWER_INITIAL_WORD
  @proto static blacklist = identifierBlacklist
  @proto static highlightAs: P.HighlightKind = "property"

  /**
   * Convert dashes to underscores.
   * - NOTE: `Rules.Pattern.mapValue` is generic (`<T = string>`) for subclasses that map to non-string
   *   values; this rule always maps to a string, hence the cast.
   */
  mapValue<T = string>(value: string): T {
    return `${value}`.replace(/-/g, "_") as T
  }
  getAST(match: P.MatchFor<this>) {
    return new P.ASTPropertyLiteral(match)
  }
}
properties.addRule(Property)
