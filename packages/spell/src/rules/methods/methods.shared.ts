/**
 * Types shared by the `methods` module's rule files:
 * - the method-signature data its rules build (`method_signature`, the `method_arg`s) and its definitions read
 * - what its generated call-site rules are declared with, and the operands an operator one compiles
 */
import type { P } from "$/parser"
import type { SpellExpressionProps } from "$/spell/rules/expressions"

/**
 * Data `MethodSignature`'s `parse()` builds into `match.data`, then `MethodDefinition.processSignature()`
 * (and overrides, e.g. `quoted_type_expression`) further mutates.
 */
export type MethodSignatureData = {
  items: MethodArgData[]
  /** `true` if the first item is a keyword. */
  startsWithKeyword: boolean
  /** `true` if we found at least one keyword. Arg-only signatures are invalid! */
  foundKeyword: boolean
  /** Method signature bits. Converted to `methodName` string at end of `parse()`. */
  methodBits: string[]
  /** Rule syntax bits. Converted to a string at end of `parse()`. */
  syntaxBits: string[]
  /** Types we found in the signature. */
  types: MethodTypeInfo[]
  /** Method arguments, as `P.ASTVariableExpression`s. */
  args: P.ASTVariableExpression[]
  /**
   * Each argument's item as written, in order, e.g. `(a card)` or `a card` -- NOT a `(with ...)` clause.
   * - For editors, e.g. signature help's parameter ranges.  The same order as its call rule's `{slots}`.
   */
  argMatches: P.Match[]
  /** Random extra vars we should enable (e.g. aliases for `this`). */
  extraVars: MethodExtraVar[]
  /** `with_props_arg`'s props, if any. */
  props: P.ASTVariableExpression[] | undefined
  /** Full methodName from `methodBits`, set at the end of `parse()`. */
  methodName: string | undefined
  /** Full method syntax, set at the end of `parse()`. */
  syntax: string | undefined
  /** Type to add an instance method to, set by `processSignature()`. */
  instanceType: string | undefined
  /**
   * `true` when the definition compiles to a postfix expression (e.g. `card.isABug`) instead of a callable method.
   * - Set by `MethodDefinition.processSignature()` / `QuotedTypeExpression.processSignature()`.
   */
  asPostfixExpression?: boolean
  /**
   * `true` when it compiles to an infix expression, e.g. `card.nerdsOutWithAnother(thing)`.
   * - Set by `MethodDefinition.processSignature()` / `QuotedTypeExpression.processSignature()`.
   */
  asInfixExpression?: boolean
  /**
   * A phrase on a VALUE kind, e.g. `Rank` for `a rank "is a face card" if ...` (plan doc `outline-spell`, P3).
   * - Its values are plain text, so the method is the kind's STATIC one, given the value:  `Rank.isAFaceCard(r)`.
   * - Set by `QuotedTypeExpression.processSignature()`;  postfix only.
   */
  valueKindOf?: string
}

/**
 * `match.data` shape shared by the `method_arg`/`simple_method_arg` alternatives (`var_method_arg`,
 * `valued_var_method_arg`, `type_method_arg`, `typed_method_arg`, `with_props_arg`) and by `method_keyword`.
 * Each of these rules only ever fills in a subset of these fields.
 * - NOTE: these are all DERIVED values (strings, AST nodes, arrays) the rule computes from its real matched
 *   groups while parsing -- not real `Match`-valued groups themselves, so they live in `match.data`, not
 *   `match.groups` -- see `GROUPS ARE ONLY WHAT THE SYNTAX MATCHED` in the migration guide.
 */
export type MethodArgData = {
  /** Matched bare word, set by `method_keyword`. */
  keyword?: P.Match
  /** Matched `identifier`, set by `var_method_arg` / `valued_var_method_arg` / `typed_method_arg`. */
  variable?: P.Match
  /** Matched type name, set by `type_method_arg` / `typed_method_arg`. */
  type?: P.Match
  /**
   * Bit contributed to the generated `methodName`, e.g. a raw keyword, or `$varName`.
   * - `undefined` for `with_props_arg`, since prop names don't appear in the method name.
   */
  method?: string
  /** Bit contributed to the rule's rulex `syntax`, e.g. a raw keyword or `{callArgs:expression}`. */
  syntax?: string
  /** This arg as a `P.ASTVariableExpression`, used for the generated method's parameter list. */
  arg?: P.ASTVariableExpression
  /** `with_props_arg` only: the individual prop `arg`s pulled out of its comma/`and`-joined item list. */
  props?: P.ASTVariableExpression[]
  /** `with_props_arg` only: raw matched items behind `props`, before mapping to `arg`s. */
  items?: P.Match[]
}

/** Info about a `{type}` capture within a method signature, e.g. the `(a card)` in `to create (a card)`. */
export type MethodTypeInfo = {
  /** Raw matched type name, e.g. `card`. */
  name: string
  /** Arg's own variable name, if the type came from a `typed_method_arg` (e.g. `another` in `(another as a
   *  thing)`) -- `undefined` for a bare `type_method_arg` like `(a card)`. */
  varName: string | undefined
  /** `true` for a built-in/primitive type (`SpellType.isSimpleType()`) -- these are never promoted to an
   *  instance-method receiver by `MethodDefinition.processSignature()`. */
  isSimple: boolean
  /**
   * Index into `MethodSignatureData.args` at the moment this type was found:
   * lets `processSignature()` splice the promoted arg back out.
   */
  argIndex: number
  /** Index into `MethodSignatureData.methodBits` at the moment this type was found -- same splice purpose. */
  methodIndex: number
  /**
   * Index into `MethodSignatureData.syntaxBits` at the moment this type was found:
   * `processSignature()` overwrites this slot with `{thisArg:expression}` when promoting.
   */
  syntaxIndex: number
}

/** Extra random variable to add to a method's nested scope, e.g. an alias for `this`. */
export type MethodExtraVar = string | { name: string; output?: string; type?: string }

/**
 * What a generated method's call-site rule is declared with -- see `DynamicMethodRule.specialize()`.
 * - `output`:  the method's name in compiled JS, e.g. `play_fizzbuzz`
 * - `of` / `params`:  its owner and parameters, as its `P.ScopeMethod` record --
 *   loading passes the whole declaration, which holds the record's too
 */
export type MethodRuleDeclared = { output: string; of?: string; params?: P.ScopeParam[]; staticOf?: string }

/** Props bag accepted by `MethodPostfixRule` / `MethodInfixRule` -- the generated method, and what it takes. */
export type MethodOperatorRuleProps = Prettify<
  SpellExpressionProps & {
    methodName: string
    paramTypes?: Array<P.Datatype | undefined>
    staticOf?: string
    thisType?: P.Datatype
  }
>

/** Operands passed to `compileASTExpression()` -- matches the (unexported) type of the same name in `./expressions`. */
export type OperatorOperands = {
  /** Matched operator token, e.g. `is`/`isn't` -- passed to `shouldNegateOutput()`. */
  operator: P.Match
  /** Left-hand expression -- always populated for `PostfixOperatorSuffix`/`InfixOperatorSuffix`. */
  lhs?: P.ASTExpression
  /** Right-hand expression -- always populated for `InfixOperatorSuffix`, never for a postfix suffix. */
  rhs?: P.ASTExpression
}
