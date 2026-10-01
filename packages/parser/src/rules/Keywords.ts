import { proto } from "#spell-util"
import type { P } from "#parser"
// Import directly to avoid circular import
import { Literals } from "./Literals"

/**
 * Rule to match one or more sequential literal `Keyword`s, with space in-between.
 *
 * - After matching, `match.value` will be the literal string matched.
 * - Keywords output WITH a single space in-between.
 */
export class Keywords<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Literals<Groups, MatchData> {
  /** Editors colour us as a keyword -- unless a generated method rule holds us, see `SpellLanguageService`. */
  @proto static highlightAs?: P.HighlightKind = "keyword"

  static {
    /** Join symbols with a single space in-between. */
    Object.defineProperty(this.prototype, "literalSeparator", {
      value: " ",
      writable: true
    })
  }
}
