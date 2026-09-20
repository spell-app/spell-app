import { P } from "~/parser"
// Import directly to avoid circular import
import { TokenType } from "./TokenType"

/** Match a single `WordToken`. */
export class Word extends TokenType {
  /** Fixed to `P.WordToken` -- unlike base `TokenType`, this isn't settable. */
  get tokenType(): P.TokenConstructor {
    return P.WordToken
  }
}
