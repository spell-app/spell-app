import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix, Precedence, SuffixLeft } from "$/spell/rules/expressions"
import { Priority } from "$/spell/rules/rules.types"
import type { MethodOperatorRuleProps, MethodRuleDeclared, OperatorOperands } from "./methods.shared"

/**
 * `card nerds out with thing`:  calls a quoted method defined as an infix expression:
 * e.g. `card.nerdsOutWithAnother(thing)`.
 * - Never registered as is:
 *   `MethodDefinition.getRule()` makes one per such method, with `MethodInfixRule.specialize({ output })`.
 * - Negates through the base class -- see `Negatable`.
 * - Reads ONLY its statics, so a project's declarations can rebuild it elsewhere -- see `P.Rule.specialize()`.
 */
export class MethodInfixRule extends InfixOperatorSuffix {
  @proto static importableAs = "method_infix"
  /** A user's alias wins over a built-in suffix matching the same words -- see `MethodPostfixRule`. */
  @proto static priority = Priority.userDeclared
  @proto static precedence = Precedence.comparison
  @proto static parenthesize = true

  /** Generated method to call, e.g. `nerds_out_with_$another`. */
  declare methodName: string
  /** Datatype of its one parameter, if the signature says -- see `parse()`. */
  declare paramTypes: Array<P.Datatype | undefined> | undefined
  /** Our method's owner, e.g. `Card`, if known -- see `parse()`. */
  declare thisType: P.Datatype | undefined
  /** TYPE-ONLY: what `specialize()` accepts for this rule -- see `P.RuleStatics`. */
  declare readonly Props: MethodOperatorRuleProps

  /** TYPE-ONLY: what `specialize()` takes -- see `P.SpecializeWith`. */
  declare static readonly SpecializeWith: MethodRuleDeclared
  /**
   * Calls generated method `output` -- also our `ruleName`.
   * - Its `of` / `params` are our `thisType` / `paramTypes`.  See `DynamicMethodRule.specialize()`.
   */
  static specialize<T extends AbstractClass<P.Rule>>(this: T, declared: P.SpecializeWith<T>): T {
    const { output, of, params } = declared as MethodRuleDeclared
    const statics: P.RuleStatics<MethodInfixRule> = {
      ruleName: output,
      methodName: output,
      thisType: of,
      paramTypes: params?.map((param) => param.datatype)
    }
    return super.specialize(statics, declared) as unknown as T
  }

  /**
   * Match, unless a side is KNOWN to be the wrong type -- as `DynamicMethodRule.parse()`.
   * - Our left side, when `CompoundExpression` knows it:  see `SuffixLeft`.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    if (!SuffixLeft.couldBeA(scope, this.thisType)) return undefined
    const match = super.parse(scope, tokens)
    const rhs = (match?.groups as { expression?: P.Match } | undefined)?.expression
    if (match && rhs && !scope.couldBeA(rhs.datatype, this.paramTypes?.[0])) return undefined
    return match
  }

  /** What we write into our statement's `SPELL: DECLARES` comment -- see `P.Rule.declarationProps()`. */
  static declarationProps({ output }: MethodRuleDeclared, syntax: string | undefined) {
    return { syntax, output }
  }

  compileASTExpression(match: P.Match, { lhs, rhs }: OperatorOperands): P.ASTExpression {
    // `lhs`/`rhs` are always populated for an `InfixOperatorSuffix`.
    return new P.ASTScopedMethodInvocation(match, {
      thing: lhs!,
      methodName: this.methodName,
      args: [rhs!]
    })
  }
}
