//
//  ## Import `/parser/rule` files in this order.
//     Other files MUST ONLY import from this file
//     or you risk circular import problems.
//

import { Rule } from "./Rule"

// The following subclasses of rule are ALWAYS accessed as `Rule.XXX`
import "./Pattern"
import "./Subrule"
import "./TokenType"
import "./Word"
import "./BlankLine"
import "./Literal" // Also "Keyword" and "Symbol"
import "./Literals" // Also "Keywords" and "Symbols"
import "./Sequence"
import "./Choice" // Also "Group"
import "./Repeat"
import "./NestedSplit"

// Export `Rule` as module root.
export { Rule }
