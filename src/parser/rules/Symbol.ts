import type { P } from "~/parser"
// Import directly to avoid circular import
import { Literal } from "./Literal"

/**
 * Rule which matches a single literal symbol string token.
 */
export class Symbol<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Literal<Groups, MatchData> {}
