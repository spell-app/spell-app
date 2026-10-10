import { proto } from "$/util"
import { P } from "$/parser"
import { PostfixOperatorSuffix, Precedence, SuffixLeft } from "$/spell/rules/expressions"
import { Priority } from "$/spell/rules/rules.types"
import type { MethodOperatorRuleProps, MethodRuleDeclared, OperatorOperands } from "./methods.shared"

/**
 * `card is face up` -- reads a quoted method defined as a postfix expression, e.g. `card.is_face_up`.
 * - Never registered as is:  `MethodDefinition.getRule()` makes one per such method, with
 *   `MethodPostfixRule.specialize({ output })`.
 * - `isn't face up` negates through the base class -- see `Negatable`.
 * - Reads ONLY its statics, so a project's declarations can rebuild it elsewhere -- see `P.Rule.specialize()`.
 */
export class MethodPostfixRule extends PostfixOperatorSuffix {
  @proto static importableAs = "method_postfix"
  /** A user's alias wins over a built-in suffix matching the same words, e.g. `is face up` over `is {x}`. */
  @proto static priority = Priority.userDeclared
  @proto static precedence = Precedence.comparison

  /** Generated method to read, e.g. `is_face_up`. */
  declare methodName: string
  /** A value kind's phrase:  the kind whose static method it calls, e.g. `Rank` -- see `MethodRuleDeclared`. */
  declare staticOf: string | undefined
  /** Our method's owner, e.g. `Card`, if known -- see `parse()`. */
  declare thisType: P.Datatype | undefined
  /** TYPE-ONLY: what `specialize()` accepts for this rule -- see `P.RuleStatics`. */
  declare readonly Props: MethodOperatorRuleProps

  /** TYPE-ONLY: what `specialize()` takes -- see `P.SpecializeWith`. */
  declare static readonly SpecializeWith: MethodRuleDeclared
  /** Reads generated method `output`, e.g. `is_face_up` -- also our `ruleName`.  See `DynamicMethodRule.specialize()`. */
  static specialize<T extends AbstractClass<P.Rule>>(this: T, declared: P.SpecializeWith<T>): T {
    const { output, staticOf, of } = declared as MethodRuleDeclared
    const statics: P.RuleStatics<MethodPostfixRule> = { ruleName: output, methodName: output, staticOf, thisType: of }
    return super.specialize(statics, declared) as unknown as T
  }

  /**
   * Match, unless what we follow is KNOWN, and can't be our method's owner (`thisType`), e.g. a deck's
   * `a rank "is a face card"` on `the card is a face card` -- see `SuffixLeft`.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    if (!SuffixLeft.couldBeA(scope, this.thisType)) return undefined
    return super.parse(scope, tokens)
  }

  /** What we write into our statement's `SPELL: DECLARES` comment -- see `P.Rule.declarationProps()`. */
  static declarationProps({ output, staticOf }: MethodRuleDeclared, syntax: string | undefined) {
    return staticOf ? { syntax, output, staticOf } : { syntax, output }
  }

  compileASTExpression(match: P.Match, { lhs }: OperatorOperands): P.ASTExpression {
    // a value kind's phrase:  `Rank.is_a_face_card(card.rank)`
    if (this.staticOf) {
      const thing = new P.ASTTypeExpression(match, { name: this.staticOf })
      return new P.ASTScopedMethodInvocation(match, { thing, methodName: this.methodName, args: [lhs!] })
    }
    return new P.ASTPropertyExpression(match, {
      object: lhs!,
      property: new P.ASTPropertyLiteral(match, this.methodName)
    })
  }
}
