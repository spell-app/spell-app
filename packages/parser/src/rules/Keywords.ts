import { proto } from "$/util"
import type { P } from "$/parser"
// Import directly to avoid circular import
import { Literals } from "./Literals"

/**
 * Rule to match one or more sequential literal `Keyword`s, with space in-between.
 *
 * - After matching, `match.value` will be the literal string matched.
 * - Printed as rulex spaced as written:  `a b`, or `a{spaces}b` (`P.rulexSpacing()`).
 */
export class Keywords<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Literals<Groups, MatchData> {
  /** Editors colour us as a keyword -- unless a generated method rule holds us, see `SpellLanguageService`. */
  @proto static highlightAs?: P.HighlightKind = "keyword"
}
