//
//  ## Import `/parser/rule` files in this order.
//     Other files MUST ONLY import from this file
//     or you risk circular import problems.
//

// Re-export a few things from `/parser` for convenience in this package.
export {
  Match,
  proto,
  TestLocation,
  Token,
  Tokenizer,
  TokenType,
} from "../all.js";

// Load the main Rule abstract class.
export { Rule } from "./Rule.js";

// The following subclasses of rule are ALWAYS accessed as `Rule.XXX`
import "./TokenType.js";
import "./Word.js";
import "./Literal.js";    // Also "Keyword" and "Symbol"
import "./Literals.js";   // Also "Keywords" and "Symbols"
import "./Pattern.js";
import "./Subrule.js";
import "./Choice.js";     // Also "Choice"
import "./Repeat.js";
import "./Sequence.js";
import "./LiteralSequence.js";
import "./BlankLine.js";
import "./NestedSplit.js";
