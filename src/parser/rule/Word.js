import { proto, Rule, Token } from "./all.js";

// Match a single `Token.Word`
Rule.Word = class word extends Rule.TokenType {
  @proto name = "word";
  @proto tokenType = Token.Word;
}
