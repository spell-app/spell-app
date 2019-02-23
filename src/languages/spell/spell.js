import Parser from "../../parser/Parser.js";
import Tokenizer from "../../parser/Tokenizer.js";

import { proto } from "../../utils/decorators";

// Load all standard rules files.
import "./core.js";
import "./if.js";
import "./JSX.js";
import "./lists.js";
import "./operators.js";
import "./statements.js";
import "./types.js";
import "./UI.js";


export class SpellParser extends Parser {
  // Name of our default rule to parse if calling `parser.parse(text)`.
  @proto defaultRule = "statements";

  // Remove "normal" whitespace (leaving newlines and indents) when parsing
  @proto removeWhitespacePolicy = Tokenizer.RemoveWhitespacePolicy.INLINE;
}

// Create parser which combines all of the above...
const parser = new SpellParser({ module: "spell" });
// ...which depends on rules loaded above...
parser.import("core", "operators", "types", "lists", "if", "statements", "JSX", "UI");
// ...as the default export
export default parser;
