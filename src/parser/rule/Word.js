import Rule from "./Rule"
import { Token, proto } from "../all"

// Match a single `Token.Word`
Rule.Word = class word extends Rule.TokenType {
  @proto name = "word"

  @proto tokenType = Token.Word
}
