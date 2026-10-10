import { proto } from "$/util"
import { P } from "$/parser"
import { Negatable } from "./Negatable"
import { SpellExpression, type SpellExpressionProps } from "./SpellExpression"
import { type OperatorOperands } from "./expressions.shared"

/**
 * Base class for expression-suffix rules that take an explicit `rhs`, e.g. `is`, `and`, `includes`.
 * - Matched as part of `CompoundExpression`'s shunting-yard algorithm -- never parsed standalone.
 * - Override `compileASTExpression()` to control output AST, `getOperator()` for what the operator MEANS
 *   (`equals`, `and` ...), `shouldNegateOutput()` to negate the result, e.g. for `is not`.
 * - `getAST()` deliberately throws: compilation always goes through `compileAST()`/`compileASTExpression()`,
 *   called directly by `CompoundExpression`'s shunting-yard rather than through normal rule dispatch.
 */
export class InfixOperatorSuffix<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends SpellExpression<Groups, MatchData> {
  /** Operator suffixes are found through `expression_suffix`, not `expression` -- see `CompoundExpression`. */
  @proto static alias: string | string[] = "expression_suffix"
  /**
   * Most suffixes are tests, e.g. `is`, `includes`, `and`, a user's quoted alias:  `choice`.
   * - Others say otherwise, e.g. `+`, `as upper case` -- see `getResultDatatype()`.
   */
  @proto static datatype: P.Datatype | undefined = "choice"

  /**
   * How tightly we bind, from `Precedence` -- see there.
   * - NOT `priority`, which breaks a `Choice` tie.
   * - MUST be set:  the constructor throws without it, as a silent default is how `ends with` went wrong.
   */
  declare precedence: number
  @proto static precedence?: number = undefined

  /** Throws if we have no `precedence`. */
  constructor(props: SpellExpressionProps) {
    super(props)
    if (typeof this.precedence !== "number") {
      throw new P.ParserError({
        message: `Operator suffix '${this.name}' needs a 'precedence' -- see 'Precedence'.`,
        context: this,
        activity: "constructor"
      })
    }
  }

  /**
   * Datatype of `<lhs> <us> <rhs>`, given what `lhs` and `rhs` are.
   * - `CompoundExpression` asks, operator by operator, in the order it applies them.
   * - Default:  our `datatype`, whatever the operands, e.g. `choice` for a comparison.
   * - Override where it depends on them, e.g. `+` of text is text.
   * - Reads only its arguments and `match`, like `getDatatype()`.
   */
  getResultDatatype(
    match: P.MatchFor<this>,
    lhs: P.Datatype | undefined,
    rhs: P.Datatype | undefined
  ): P.Datatype | undefined {
    return this.getDatatype(match)
  }

  /**
   * What `operator` MEANS, as a `P.ASTOperator`, e.g. `equals` for `is`:  each target's writer spells it.
   * - Override in each rule using the default `compileASTExpression()`, which builds an `ASTInfixExpression`.
   * - throws by default:  the words a rule matched aren't a meaning any writer knows
   */
  getOperator(operator: P.Match): P.ASTOperator {
    throw new TypeError(
      `${this.constructor.name}.getOperator():  override it to say what \`${operator.value}\` means, e.g. "equals"`
    )
  }

  /**
   * Return `true` if we should "negate" the output expression based on `operator`.
   * - Default:  `operator` came from a negatable word rule, e.g. `{operator:is}`, and matched a negated form,
   *   e.g. `isn't` -- see `Negatable`.  So a translation brings its own words.
   */
  shouldNegateOutput(operator: P.Match): boolean {
    return Negatable.isNegated(operator)
  }

  /**
   * Build output AST for this operator from `lhs`/`operator`/`rhs`.
   * - By default builds an `InfixExpression`; override to output something else, e.g. `CoreMethodInvocation`.
   * - `lhs` is left-hand-side AST.
   * - `operator` is operator `Match`.
   * - `rhs` is right-hand-side AST.
   */
  compileASTExpression(match: P.MatchFor<this>, { lhs, operator, rhs }: OperatorOperands): P.ASTNode {
    return new P.ASTInfixExpression(match, {
      // `lhs`/`rhs` are always populated here: this base implementation is only reached for
      // `InfixOperatorSuffix` rules, which the shunting-yard algorithm always calls with both sides.
      lhs: lhs!,
      operator: this.getOperator(operator),
      rhs: rhs!
    })
  }

  /**
   * Compile this operator's AST node, called by `CompoundExpression`'s shunting-yard for each matched
   * `InfixOperatorSuffix` / `PostfixOperatorSuffix` instance with args from left/right side.
   * - Delegates to rule-specific `compileASTExpression()` to build particular AST for rule.
   * - Also wraps result in a `ParenthesizedExpression` when `parenthesize` is set, and negates via
   *   `NotExpression` when `shouldNegateOutput()` returns `true` -- so subclasses don't need to.
   * - `lhs` is left-hand-side AST -- NOTE: already AST-compiled, not a raw `Match`.
   * - `operator` is operator `Match`.
   * - `rhs` (for `InfixOperatorSuffix` only) is right-hand-side AST.
   */
  compileAST(match: P.MatchFor<this>, { operator, rhs, lhs }: OperatorOperands): P.ASTNode {
    let expression = this.compileASTExpression(match, { lhs, operator, rhs })
    if (this.parenthesize && !(expression instanceof P.ASTParenthesizedExpression)) {
      expression = new P.ASTParenthesizedExpression(match, { expression: expression as P.ASTExpression })
    }
    if (this.shouldNegateOutput(operator)) {
      expression = new P.ASTNotExpression(match, { expression: expression as P.ASTExpression })
    }
    return expression
  }

  /**
   * NEVER called in practice -- `CompoundExpression`'s shunting-yard calls `compileAST()` directly on
   * matched `InfixOperatorSuffix`/`PostfixOperatorSuffix` instances instead of normal rule dispatch.
   * - Throws to catch any code path that still tries to call it the normal way.
   */
  getAST(match: P.MatchFor<this>): P.ASTNode {
    throw new TypeError("This should never be called")
  }
}
