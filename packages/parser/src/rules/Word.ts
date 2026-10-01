import { P } from "$/parser"
// Import directly to avoid circular import
import { TokenType } from "./TokenType"

/** Match a single `WordToken`. */
export class Word<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends TokenType<Groups, MatchData> {
  /** Fixed to `P.WordToken` -- unlike base `TokenType`, this isn't settable. */
  get tokenType(): P.TokenConstructor {
    return P.WordToken
  }
}
