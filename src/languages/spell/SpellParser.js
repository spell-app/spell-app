import {
  Parser,
  WhitespacePolicy,
  Tokenizer
} from "../../parser/all.js";

import {
  proto
} from "../../utils/all.js";

export class SpellParser extends Parser {
  // Name of our default rule to parse if calling `parser.parse(text)`.
  @proto defaultRule = "statements";

  @proto tokenizer = new Tokenizer({
    // Remove "normal" whitespace (leaving newlines and indents) when parsing
    whitespacePolicy: WhitespacePolicy.LEADING
  });
}

