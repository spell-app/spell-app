import { proto } from "~/util"
import { Token } from "~/parser"
import { TokenType } from "./TokenType"

// Match a single `Token.Word`
export class Word extends TokenType {
  @proto tokenType = Token.Word
}
