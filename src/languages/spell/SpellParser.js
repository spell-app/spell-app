import {
  Parser,
  Tokenizer,
  WhitespacePolicy,

  proto
} from "../../parser/all.js";

export class SpellParser extends Parser {
  // Name of our default rule to parse if calling `parser.parse(text)`.
  @proto defaultRule = "statements";

  @proto tokenizer = new Tokenizer({
    // Remove "normal" whitespace (leaving newlines and indents) when parsing
    whitespacePolicy: WhitespacePolicy.LEADING_ONLY
  });

  @proto outputScope = false;

  // If we're tokenizing "statements", parse them into blocks.
  tokenize(text, ruleName) {
    const tokens = super.tokenize(text);
    if (ruleName === "statements") return this.tokenizer.breakIntoBlocks(tokens);
    return tokens;
  }

  parse(...args) {
    const result = super.parse(...args);
//    if (result && this.outputScope) this.info(result.scope);
    return result;
  }
}
