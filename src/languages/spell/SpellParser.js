import {
  Module,
  Parser,
  Tokenizer,
  WhitespacePolicy,

  proto
} from "./all.js";

export class SpellParser extends Parser {
  // Name of our default rule to parse if calling `parser.parse(text)`.
  @proto defaultRule = "block";

  @proto tokenizer = new Tokenizer({
    // Remove "normal" whitespace (leaving newlines and indents) when parsing
    whitespacePolicy: WhitespacePolicy.LEADING_ONLY
  });

  // Return a scope with a new parser which depends on this parser.
  // This lets us update rules/etc as desired without affecting the original parser.
  getScope(module = "ad_hoc") {
    const parser = this.clone({ module });
    return new Module({ name: module, parser });
  }

  // If we're tokenizing "block", parse them into blocks.
  tokenize(text, ruleName) {
    const tokens = super.tokenize(text);
    if (ruleName === "block") return this.tokenizer.breakIntoBlocks(tokens);
    return tokens;
  }

//   parse(...args) {
//     const result = super.parse(...args);
//     return result;
//   }
}
