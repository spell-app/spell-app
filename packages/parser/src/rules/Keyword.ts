import { proto } from "#spell-util"
import type { P } from "#parser"
// Import directly to avoid circular import
import { Literal } from "./Literal"

/**
 * ## Keyword (Rule)
 * Rule which matches a single literal keyword string token.
 */
export class Keyword<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Literal<Groups, MatchData> {
  /** Editors colour us as a keyword -- unless a generated method rule holds us, see `SpellLanguageService`. */
  @proto static highlightAs?: P.HighlightKind = "keyword"
}
