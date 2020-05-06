//
//  ## Import `/parser/rule` files in this order.
//     Other files MUST ONLY import from this file
//     or you risk circular import problems.
//

import { Rule } from "./Rule"

// The following subclasses of rule are ALWAYS accessed as `Rule.XXX`
import { BlankLine } from "./BlankLine"
import { Choice, Group } from "./Choice"
import { Literal, Keyword, Symbol } from "./Literal"
import { Literals, Keywords, Symbols } from "./Literals"
import { NestedSplit } from "./NestedSplit"
import { Pattern } from "./Pattern"
import { Repeat } from "./Repeat"
import { Sequence } from "./Sequence"
import { Subrule } from "./Subrule"
import { TokenType } from "./TokenType"
import { Word } from "./Word"

// Don't export directly, place on `Rule` instead.
Object.assign(Rule, {
  BlankLine,
  Choice,
  Group,
  Literal,
  Keyword,
  Symbol,
  Literals,
  Keywords,
  Symbols,
  NestedSplit,
  Pattern,
  Repeat,
  Sequence,
  Subrule,
  TokenType,
  Word
})

// Export `Rule` as module root.
export { Rule }
