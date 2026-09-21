import type { P } from "~/parser"
// Import directly to avoid circular import
import { Literal } from "./Literal"

/**
 * ## Keyword (Rule)
 * Rule which matches a single literal keyword string token.
 */
export class Keyword<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Literal<Groups, MatchData> {}
