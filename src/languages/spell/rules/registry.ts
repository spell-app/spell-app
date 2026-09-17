// Type of the `SpellParser.Rules` registry of language-specific rule classes.
// Each rule module registers its own classes (e.g. `SpellParser.Rules.Statement = SpellStatement`);
// code should import the classes directly and use the registry only for debugging.
import type { Block } from "./Block"
import type { BlockLine } from "./BlockLine"
import type { SpellStatement } from "./Statement"
import type { ParseError } from "./ParseError"
import type { InfixOperatorSuffix, PostfixOperatorSuffix } from "./expressions"
import type { SpellConstant } from "./constants"
import type { SpellType } from "./types"
import type { VariableIdentifier } from "./variables"
import type { MethodDefinition, DynamicMethodRule } from "./methods"

export type SpellRuleRegistry = {
  Block: typeof Block
  BlockLine: typeof BlockLine
  Statement: typeof SpellStatement
  ParseError: typeof ParseError
  InfixOperatorSuffix: typeof InfixOperatorSuffix
  PostfixOperatorSuffix: typeof PostfixOperatorSuffix
  Constant: typeof SpellConstant
  Type: typeof SpellType
  VariableIdentifier: typeof VariableIdentifier
  MethodDefinition: typeof MethodDefinition
  DynamicMethodRule: typeof DynamicMethodRule
}
