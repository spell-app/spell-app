import type { Block } from "./Block"
import type { BlockLine } from "./BlockLine"
import type { SpellStatement } from "./Statement"
import type { ParseError } from "./ParseError"
import type { InfixOperatorSuffix, PostfixOperatorSuffix } from "./expressions"
import type { SpellConstant } from "./constants"
import type { SpellType } from "./types"
import type { VariableIdentifier } from "./variables"
import type { MethodDefinition, DynamicMethodRule } from "./methods"

/**
 * Type of `SpellParser.Rules`, the registry of language-specific rule classes.
 * - Each rule module registers its own classes onto `SpellParser.Rules` as a side effect, e.g.
 *   `SpellParser.Rules.Statement = SpellStatement`.
 * - Code should import the classes directly (e.g. `import { SpellStatement } from "./Statement"`) and use
 *   this registry only for debugging / inspection -- it exists so you can poke at `SpellParser.Rules` from
 *   a debugger without knowing which file defines a given rule class.
 */
export type SpellRuleRegistry = {
  /** `Block` rule class -- see `./Block`. */
  Block: typeof Block
  /** `BlockLine` rule class -- see `./BlockLine`. */
  BlockLine: typeof BlockLine
  /** Base class for all spell statement rules -- see `./Statement`. */
  Statement: typeof SpellStatement
  /** Fallback "couldn't parse this" rule class -- see `./ParseError`. */
  ParseError: typeof ParseError
  /** Infix operator suffix rule class (e.g. `+ {expression}`) -- see `./expressions`. */
  InfixOperatorSuffix: typeof InfixOperatorSuffix
  /** Postfix operator suffix rule class -- see `./expressions`. */
  PostfixOperatorSuffix: typeof PostfixOperatorSuffix
  /** `constant` rule class -- see `./constants`. */
  Constant: typeof SpellConstant
  /** `type` rule class -- see `./types`. */
  Type: typeof SpellType
  /** Variable identifier rule class -- see `./variables`. */
  VariableIdentifier: typeof VariableIdentifier
  /** Method-signature-defining rule class -- see `./methods`. */
  MethodDefinition: typeof MethodDefinition
  /** Rule class for dynamically-added, per-scope methods -- see `./methods`. */
  DynamicMethodRule: typeof DynamicMethodRule
}
