// Create master parser for the spell language, importing other rule sets.
import Parser from "../../parser/Parser.js";
import Tokenizer from "../../parser/Tokenizer.js";

import { proto } from "../../utils/decorators";

import core from "./core.js";
import _if_ from "./if.js";
import JSX from "./JSX.js";
import lists from "./lists.js";
import operators from "./operators.js";
import statements from "./statements.js";
import types from "./types.js";
import UI from "./UI.js";


class SpellParser extends Parser {
  // Name of our default rule to parse if calling `parser.parse(text)`.
  @proto defaultRule = "statements";

  // Remove "normal" whitespace (leaving newlines and indents) when parsing
  @proto removeWhitespacePolicy = Tokenizer.RemoveWhitespacePolicy.INLINE;
}

// Create parser which combines all of the above...
const parser = new SpellParser({ module: "spell" });
export default parser;

// Import the other rules defined above.
parser.import(core, operators, types, lists, _if_, statements, JSX, UI);
