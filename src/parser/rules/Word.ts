import { Tokens } from "~/parser/tokenizer"
import { TokenType, type TokenConstructor } from "./TokenType"

// Match a single `Word` token.
export class Word extends TokenType {
  get tokenType(): TokenConstructor {
    return Tokens.Word
  }
}
