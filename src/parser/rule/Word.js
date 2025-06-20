import { Tokens } from "~/parser"
import { TokenType } from "./TokenType"

// Match a single `Word` token.
export class Word extends TokenType {
  get tokenType() {
    return Tokens.Word
  }
}
