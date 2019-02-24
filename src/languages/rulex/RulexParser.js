import {
  Parser,
  proto,
  Tokenizer,
  TestLocation,
  WhitespacePolicy
} from "./all.js";

export class RulexParser extends Parser {
  @proto module = "rulex";
  @proto defaultRule = "sequence";
  @proto tokenizer = new Tokenizer({
    // Remove "normal" whitespace (leaving newlines and indents) when parsing
    whitespacePolicy: WhitespacePolicy.LEADING
  });
}
