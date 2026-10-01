import { proto } from "#spell-util"
import type { P } from "~/parser"
// Import directly to avoid circular import
import { Literal } from "./Literal"

/**
 * Rule which matches a single literal symbol string token.
 */
export class Symbol<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Literal<Groups, MatchData> {
  /** Editors colour us as an operator -- unless a generated method rule holds us, see `SpellLanguageService`. */
  @proto static highlightAs?: P.HighlightKind = "operator"
}
