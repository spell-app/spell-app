import { proto } from "$/util"
import type { P } from "$/parser"
// Import directly to avoid circular import
import { Literals } from "./Literals"

/**
 * Rule to match one or more sequential literal symbols, with no space in-between.
 *
 * - After matching, `match.value` will be the literal string matched.
 * - Printed as rulex spaced as written:  `--` touching, `- -` spaced (`P.rulexSpacing()`).
 */
export class Symbols<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Literals<Groups, MatchData> {
  /** Editors colour us as an operator -- unless a generated method rule holds us, see `SpellLanguageService`. */
  @proto static highlightAs?: P.HighlightKind = "operator"
}
