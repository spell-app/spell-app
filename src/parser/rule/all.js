//
//  ## Import `/parser/rule` files in this order.
//     Other files MUST ONLY import from this file
//     or you risk circular import problems.
//

// Re-export a few things from `/parser` for convenience in this package.
export { Match, proto, TestLocation, Token, Tokenizer, TokenType } from "../all"

// Load the main Rule abstract class.
export { Rule } from "./Rule"

// The following subclasses of rule are ALWAYS accessed as `Rule.XXX`
import "./TokenType"
import "./Word"
import "./Literal" // Also "Keyword" and "Symbol"
import "./Literals" // Also "Keywords" and "Symbols"
import "./Pattern"
import "./Subrule"
import "./Choice" // Also "Choice"
import "./Repeat"
import "./Sequence"
import "./LiteralSequence"
import "./BlankLine"
import "./NestedSplit"
