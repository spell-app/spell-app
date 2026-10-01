import { proto } from "#spell-util"
import type { P } from "#parser"
// Import directly to avoid circular import
import { Literals } from "./Literals"

/**
 * Rule to match one or more sequential literal symbols, with no space in-between.
 *
 * - After matching, `match.value` will be the literal string matched.
 * - Symbols output WITHOUT spaces in-between.
 */
export class Symbols<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Literals<Groups, MatchData> {
  /** Editors colour us as an operator -- unless a generated method rule holds us, see `SpellLanguageService`. */
  @proto static highlightAs?: P.HighlightKind = "operator"

  static {
    /** Join symbols with no space in-between. */
    Object.defineProperty(this.prototype, "literalSeparator", {
      value: "",
      writable: true
    })
  }
}
