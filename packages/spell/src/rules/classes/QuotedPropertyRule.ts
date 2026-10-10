import { pluralize, proto, singularize } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
import { InfixOperatorSuffix, Precedence, SuffixLeft, type SpellExpressionProps } from "$/spell/rules/expressions"
import { placeholderData, type QuotedPropertyFormulaBits } from "./classes.shared"

/**
 * `is not? the queen of spades` -- calls a quoted property formula's generated method, e.g.
 * `card.is_the_$rank_of_$suits('queen', 'spades')`.
 * - Never registered as is:  `quoted_property_formula` makes one per formula, with
 *   `QuotedPropertyRule.specialize({ output, ruleData })`.
 * - Reads ONLY its statics, so a project's declarations can rebuild it elsewhere -- see `P.Rule.specialize()`.
 */
export class QuotedPropertyRule extends InfixOperatorSuffix {
  @proto static importableAs = "quoted_property"
  /** A user's alias wins over a built-in suffix matching the same words, e.g. `is the queen of spades`. */
  @proto static priority = Priority.userDeclared
  @proto static precedence = Precedence.comparison

  /** Generated method to call, e.g. `is_the_$rank_of_$suits`. */
  declare methodName: string
  /** One entry per `(var)` placeholder -- see `QuotedPropertyFormulaBits`. */
  declare ruleData: QuotedPropertyFormulaBits["ruleData"]
  /** TYPE-ONLY: what `specialize()` accepts for this rule -- see `P.RuleStatics`. */
  declare readonly Props: QuotedPropertyRuleProps

  /** TYPE-ONLY: what `specialize()` takes -- see `P.SpecializeWith`. */
  declare static readonly SpecializeWith: {
    output: string
    values: Record<string, Array<string | number>>
    kinds?: Record<string, string>
    of?: string
  }
  /** The phrase's owner, e.g. `Card`, if known -- see `parse()`. */
  declare thisType: P.Datatype | undefined
  /**
   * Calls generated method `output`, e.g. `is_a_$suit` -- also our `ruleName`.
   * - `values`:  each `(var)` placeholder's enumerated values, in order, e.g. `{ suit: ["'clubs'", ...] }` --
   *   `ruleData` is worked out from them, see `placeholderData()`.
   * - `kinds`:  a placeholder whose values aren't known yet, by its VALUE kind, e.g. `{ suit: "Suit" }` for a card
   *   above the deck declaring suits (plan doc `outline-spell`, P3):  its `values` are `[]`, and `parse()` checks the
   *   word against the kind's values where the phrase is USED -- see `kindValue()`.
   * - What a project's `SPELL: DECLARES` comment holds for us -- see `SP.SpellDeclarations`.
   */
  static specialize<T extends AbstractClass<P.Rule>>(this: T, declared: P.SpecializeWith<T>): T {
    const { output, values, kinds, of } = declared as (typeof QuotedPropertyRule)["SpecializeWith"]
    const ruleData = Object.entries(values).map(([instanceVar, varValues]) =>
      placeholderData(instanceVar, varValues, kinds?.[instanceVar])
    )
    const statics: P.RuleStatics<QuotedPropertyRule> = { ruleName: output, methodName: output, ruleData, thisType: of }
    return super.specialize(statics, declared) as unknown as T
  }

  /** What we write into our statement's `SPELL: DECLARES` comment -- see `P.Rule.declarationProps()`. */
  static declarationProps(
    { output, values, kinds }: (typeof QuotedPropertyRule)["SpecializeWith"],
    syntax: string | undefined
  ) {
    return kinds ? { syntax, output, values, kinds } : { syntax, output, values }
  }

  /**
   * Match -- and for a placeholder of a value kind (see `specialize()`), only a word which is one of the kind's
   * values, e.g. `spade` for `(suit)`, noted as `data.kindArgs` for `compileASTExpression()`.
   * - A lookup WHERE THE PHRASE IS USED, e.g. `if the card is a spade`:  by then the kind's list is known.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    // not on a thing KNOWN to be another type's, e.g. `the game is red` with a card's `is (color)` -- see `SuffixLeft`
    if (!SuffixLeft.couldBeA(scope, this.thisType)) return undefined
    const match = super.parse(scope, tokens)
    if (!match || !this.ruleData.some((data) => data.kind)) return match
    const found = (match.groups as { expression?: P.Match | P.Match[] }).expression
    const args = Array.isArray(found) ? found : found ? [found] : []
    const kindArgs = this.ruleData.map((data, index) =>
      data.kind ? QuotedPropertyRule.kindValue(scope, data, args[index]) : undefined
    )
    if (this.ruleData.some((data, index) => data.kind && kindArgs[index] === undefined)) return undefined
    ;(match.data as QuotedPropertyRuleData).kindArgs = kindArgs
    return match
  }

  /**
   * The value of placeholder `data`'s kind that `arg` says, as compiled, e.g. `'spades'` for `spade` --
   * `undefined` if it's none of them, or the kind isn't known.
   */
  private static kindValue(
    scope: P.Scope,
    data: QuotedPropertyFormulaBits["ruleData"][number],
    arg: P.Match | undefined
  ): string | number | undefined {
    const values = scope.types?.get(data.kind!)?.valueKind?.values
    if (!values || !arg) return undefined
    const inflector = data.isSingular ? singularize : pluralize
    return values.find((value) =>
      typeof value === "number" ? value === arg.value : inflector(value.replace(/^'(.*)'$/, "$1")) === arg.value
    )
  }

  /** Map each matched placeholder word/number to its compiled enumeration value or literal. */
  compileASTExpression(
    match: P.Match,
    { lhs, rhs }: { lhs?: P.ASTExpression; rhs?: unknown }
  ): P.ASTScopedMethodInvocation {
    // This dynamically-generated rule's syntax repeats the `expression` group name (once per
    // `$var` in the quoted alias), and each of those groups matches a plain keyword literal with
    // no `getAST()` -- so the shunting-yard algorithm's `compile()` helper (`CompoundExpression`
    // in expressions.ts) leaves `rhs` as the raw `P.Match[]` rather than resolving it to an
    // `Expression`. Neither shape is representable in `OperatorOperands`, which assumes a single
    // already-resolved `Expression`.
    const rhsMatches = (Array.isArray(rhs) ? rhs : [rhs]) as P.Match[]
    const { kindArgs } = match.data as QuotedPropertyRuleData
    const args = rhsMatches
      .map((arg, index) => {
        // a value kind's placeholder:  its value, found by `parse()`
        const kindArg = kindArgs?.[index]
        if (typeof kindArg === "number") return new P.ASTNumericLiteral(arg, { value: kindArg })
        if (kindArg !== undefined) return new P.ASTConstantExpression(arg, { name: `${arg.value}`, output: kindArg })
        if (typeof arg.value === "string") {
          // Handle singular input values mapping to plural internal values
          // `enumeration` will be: "club", "spade", etc
          // `values` will be: `"clubs"`, `"spades"`, etc
          const { enumeration, values } = this.ruleData[index]!
          const valueIndex = enumeration.indexOf(arg.value)
          return new P.ASTConstantExpression(arg, {
            name: arg.value,
            output: valueIndex !== -1 ? String(values[valueIndex]) : `'arg.value'`
          })
        }
        if (typeof arg.value === "number") {
          return new P.ASTNumericLiteral(arg, {
            value: arg.value
          })
        }
        console.warn("quoted_property_formula: don't understand arg", arg)
        return undefined
      })
      .filter((arg): arg is P.ASTConstantExpression | P.ASTNumericLiteral => Boolean(arg))
    return new P.ASTScopedMethodInvocation(match, {
      thing: lhs!,
      methodName: this.methodName,
      args
    })
  }
}

/** What `QuotedPropertyRule` stashes on its match:  each value-kind placeholder's value, by placeholder. */
type QuotedPropertyRuleData = { kindArgs?: Array<string | number | undefined> }

/** Props bag accepted by `QuotedPropertyRule` -- the generated method, and how to map each placeholder. */
type QuotedPropertyRuleProps = Prettify<
  SpellExpressionProps & { methodName: string; ruleData: QuotedPropertyFormulaBits["ruleData"]; thisType?: P.Datatype }
>
