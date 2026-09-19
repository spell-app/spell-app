import { P } from "~/parser"
// import directly to avoid circult import
import { TokenType } from "./TokenType"

// Match a single `Word` token.
export class Word extends TokenType {
  get tokenType(): P.TokenConstructor {
    return P.Tokens.Word
  }
}
