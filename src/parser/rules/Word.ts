import { P } from "~/parser"
// Import directly to avoid circular import
import { TokenType } from "./TokenType"

/** Match a single `Word` token. */
export class Word extends TokenType {
  /** Fixed to `P.Tokens.Word` -- unlike base `TokenType`, this isn't settable. */
  get tokenType(): P.TokenConstructor {
    return P.Tokens.Word
  }
}
