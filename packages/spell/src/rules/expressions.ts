/**
 * Rules for Spell boolean/comparison/type-check expression suffixes -- `and`, `or`, `is`, `is a`,
 * `includes`, `is empty`, string-case conversion, type coercion, etc.
 * - Also defines `InfixOperatorSuffix` / `PostfixOperatorSuffix`, the base classes every operator-suffix
 *   rule here extends, and `compound_expression`, which runs the shunting-yard algorithm combining them.
 */

import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { Priority } from "./rules.types"
import { SpellStatement, type SpellStatementProps } from "./Statement"

/**
 * Rule module for Spell expression-suffix rules (`and`, `is`, `includes`, ...) plus `compound_expression`,
 * which combines them via shunting-yard.
 * - Each rule class below is followed by the `expressions.addRule()` call which defines and registers it.
 */
export const expressions = new SpellParser({ module: "expressions" })

////////////////
// ## Operator precedence
//    e.g. `Precedence.sum` for `+`
////////////////

/**
 * How tightly each operator suffix binds, higher first:  `*` before `+` before `is` before `and`.
 * - Read ONLY by the expression loop, `compound_expression`:  it stops at its `bound`,
 *   and its shunting-yard groups the chain, e.g. `x + y is empty` => `isEmpty(x + y)`.
 * - NOT `priority`, which only says which of several rules matching the SAME words wins a `Choice`.
 * - Every suffix rule MUST say one, e.g. `@proto static precedence = Precedence.comparison`.
 * - A new level is a new name here, with a why.
 */
export const Precedence = {
  /** `X if C otherwise Y`:  loosest, so it takes whole expressions either side. */
  ternary: 4,
  or: 5,
  and: 6,
  /** `is`, `is exactly` */
  equality: 10,
  /** `<`, `is a`, `includes`, `is empty`, quoted aliases ... */
  comparison: 11,
  /** The `bound` of `arithmetic_expression`:  `+ - * /` bind tighter, comparisons don't. */
  takesSum: 12,
  /** `+ -` */
  sum: 13,
  /** `* /` */
  product: 14
}

////////////////
// ## `SpellExpression` base class
//    e.g. base for every expression rule below (`parenthesized_expression`, `compound_expression`, ...)
////////////////

/**
 * Base class for all Spell expressions.
 * - Aliased `expression`, so registered as an `operand` -- see `SpellParser.getNamesForRule()`.
 */
export class SpellExpression<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends SpellStatement<Groups, MatchData> {
  /** Whether `compileAST()` should wrap the output expression in parenthesis. */
  declare parenthesize: boolean
  @proto static parenthesize = false

  /** Every spell expression is registered as an `"expression"` unless a subclass says otherwise. */
  @proto static alias: string | string[] = "expression"

  /** TYPE-ONLY: props `parser.addRule()` accepts for this rule -- see `P.Rule`'s `Props`. */
  declare readonly Props: SpellExpressionProps
}

/** Props bag accepted by `SpellExpression` -- `parenthesize` wraps compiled output in `(...)`. */
export type SpellExpressionProps = Prettify<SpellStatementProps & { parenthesize?: boolean }>

////////////////
// ## `InfixOperatorSuffix` base class
//    e.g. base for suffix rules with an explicit `rhs`, like "thing and other"
////////////////

/**
 * Base class for expression-suffix rules that take an explicit `rhs`, e.g. `is`, `and`, `includes`.
 * - Matched as part of `compound_expression`'s shunting-yard algorithm -- never parsed standalone.
 * - Override `compileASTExpression()` to control output AST, `getOutputOperator()` for the operator
 *   string, `shouldNegateOutput()` to negate the result, e.g. for `is not`.
 * - `getAST()` deliberately throws: compilation always goes through `compileAST()`/`compileASTExpression()`,
 *   called directly by `compound_expression`'s shunting-yard rather than through normal rule dispatch.
 */
export class InfixOperatorSuffix<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends SpellExpression<Groups, MatchData> {
  /** Operator suffixes are found through `expression_suffix`, not `expression` -- see `compound_expression`. */
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
   * - `compound_expression` asks, operator by operator, in the order it applies them.
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
   * Return output operator from `operator` match.
   * - Default just returns the input string of the operator, override for more complex logic.
   * - NOTE: language-dependent!
   */
  getOutputOperator(operator: P.Match): string {
    return String(operator.value)
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
      operator: this.getOutputOperator(operator),
      rhs: rhs!
    })
  }

  /**
   * Compile this operator's AST node, called by `compound_expression`'s shunting-yard for each matched
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
   * NEVER called in practice -- `compound_expression`'s shunting-yard calls `compileAST()` directly on
   * matched `InfixOperatorSuffix`/`PostfixOperatorSuffix` instances instead of normal rule dispatch.
   * - Throws to catch any code path that still tries to call it the normal way.
   */
  getAST(match: P.MatchFor<this>): P.ASTNode {
    throw new TypeError("This should never be called")
  }
}

////////////////
// ## `PostfixOperatorSuffix` base class
//    e.g. base for suffix rules with no `rhs`, like "thing is empty"
////////////////

/**
 * Base class for expression-suffix rules with no `rhs`, e.g. `is empty`, `is defined`, `exists`.
 * - Same shunting-yard machinery as `InfixOperatorSuffix`, just without a right-hand side.
 */
export class PostfixOperatorSuffix<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends InfixOperatorSuffix<Groups, MatchData> {
  /**
   * Must be implemented by subclasses -- no default postfix behavior makes sense to fall back to.
   * - `lhs` is left-hand-side match.
   * - `operator` is raw full input operator string.
   */
  compileASTExpression(match: P.MatchFor<this>, { lhs, operator }: OperatorOperands): P.ASTNode {
    throw new TypeError("Must implement compileASTExpression()")
  }
}

////////////////////////////////////////
// # Negatable words
//   Use `{is}` in a syntax for every form of `is`, including `isn't`;  plain `is` for just the word.
////////////////////////////////////////

////////////////
// ## `Negatable` base class
//    e.g. "is", "isn't" -- as `{operator:is}` in a syntax
////////////////

/**
 * A word and its negated forms, e.g. `(is|(negated:is not|isn't|isnt))` -- registered under the word, e.g. `is`.
 * - Negated forms are the ones in a `negated` group -- see `isNegated()`.  So order doesn't matter, and there
 *   may be several positive forms, e.g. `(has|have|(negated:does not have))`.
 * - Registered once per word, `Negatable.specialize({ ruleName: "is" })`, so a translation adds its own,
 *   e.g. `(es|(negated:no es))` as `es`.
 * - `quoted_type_expression` makes a signature's negatable word `{operator:<word>}` -- see `processSignature()`.
 */
export class Negatable extends P.Choice {
  /**
   * SIDE EFFECT: marks the winning match `data.negated` if it came from our `negated` group.
   * - `Choice` hands back the winning alternative's own match.  Its `name` says which group:  a one-form group
   *   compiles to a rule named `negated`, a several-form one stamps `negated` on its winner's match.
   * - Read it NOW:  a `{operator:is}` around us renames the match `operator` as we return.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    if (match) (match.data as NegatableMatchData).negated = match.name === "negated"
    return match
  }

  /**
   * `true` if `match` came from a `Negatable` and matched a negated form, e.g. `isn't`.
   * - `match` may be missing, e.g. the `operator` of a syntax which has none:  never negated.
   */
  static isNegated(match: P.Match | undefined): boolean {
    return (match?.data as NegatableMatchData | undefined)?.negated === true
  }
}

/** What `Negatable` stashes on the winning alternative's match. */
type NegatableMatchData = {
  /** `true` if a negated form matched, e.g. `isn't`;  `false` for the positive one. */
  negated?: boolean
}

////////////////
// ## `is` rule (class `Negatable`)
//    e.g. "isn't"
////////////////

expressions.addRule(Negatable.specialize({ ruleName: "is" }), { syntax: "(is|(negated:is not|isn't|isnt))" })

////////////////
// ## `can` rule (class `Negatable`)
//    e.g. "can't"
////////////////

expressions.addRule(Negatable.specialize({ ruleName: "can" }), {
  syntax: "(can|(negated:can not|cannot|can't|cant))"
})

////////////////
// ## `will` rule (class `Negatable`)
//    e.g. "won't"
////////////////

expressions.addRule(Negatable.specialize({ ruleName: "will" }), { syntax: "(will|(negated:will not|won't|wont))" })

////////////////
// ## `has` rule (class `Negatable`)
//    e.g. "doesn't have"
////////////////

expressions.addRule(Negatable.specialize({ ruleName: "has" }), {
  syntax: "(has|(negated:does not have|doesn't have|doesnt have))"
})

////////////////////////////////////////
// # Expression rules
////////////////////////////////////////

////////////////
// ## `parenthesized_expression` rule
//    e.g. "(thing)"
////////////////

/**
 * `(expression)` -- parenthesized sub-expression.
 * - `getAST()` relies on `ParenthesizedExpression`'s own constructor to collapse nested parens,
 *   e.g. `((thing))` compiles down to `(thing)`.
 */
class parenthesized_expression extends SpellExpression<"expression"> {
  /** Parens don't change what it is. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.expression.datatype
  }
  getAST(match: P.MatchFor<this>): P.ASTParenthesizedExpression {
    const { expression } = match.groups
    return new P.ASTParenthesizedExpression(match, {
      expression: expression.AST as P.ASTExpression
    })
  }
}
expressions.addRule(parenthesized_expression, {
  syntax: "\\( {expression} \\)",
  tests: [
    {
      title: "correctly matches parenthesized expressions",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
      },
      tests: [
        ["(thing)", "(thing)"],
        ["((thing))", "(thing)"],
        ["(((thing)))", "(thing)"],
        ["(1 and yes)", "(1 && true)"]
      ]
    },
    {
      title: "correctly matches multiple parenthesis",
      compileAs: "expression",
      tests: [
        ["(1) and (yes)", "((1) && (true))"],
        ["((1) and (yes))", "((1) && (true))"],
        ["((1) and ((yes)))", "((1) && (true))"]
      ]
    },
    {
      title: "doesn't match malformed parenthesized expressions",
      tests: [
        ["(foo", undefined],
        ["(foo(bar)baz", undefined]
      ]
    }
  ]
})

////////////////
// ## `expression` rule (class `compound_expression`)
//    e.g. "1 + 2 + 3"
////////////////

/**
 * `expression`:  an operand, then each operator suffix binding TIGHTER than `bound`, e.g. `x + 1 is 3`.
 * - The ONLY rule registered as `expression`:  every other `expression` alias is an `operand`
 *   -- see `SpellParser.getNamesForRule()`.
 * - No suffix => the operand's own match, as is,
 *   so `match.is(known_variable)` still works on `{thing:expression}`.
 * - Suffixes' rhs is an `operand`, so the chain is flat:
 *   `getAST()` groups it by `precedence` (shunting-yard).
 */
class compound_expression extends SpellExpression<"lhs|rhsChain"> {
  static ruleName = "expression"
  @proto static alias: string | string[] = []
  /** Suffixes must bind tighter than this to be ours:  0 takes them all, see `arithmetic_expression`. */
  declare bound: number
  @proto static bound = 0

  /**
   * Our operand, then suffixes while they bind tighter than `bound`.
   * - Expecting mode (see `P.Expectations`):  out of tokens, an operator after us only EXTENDS us,
   *   as a `Sequence` would record, nested like its children.
   * - NOTE: `rules` is `[{lhs:operand}, {rhsChain:expression_suffix}*]`, from our syntax.
   *   The `*` matters:  `Sequence.test()` then lets a lone operand through, e.g. `1`.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const expecting = P.Expectations.current
    const [operand, chain] = this.rules as [P.Rule, P.Repeat]
    const lhs = expecting ? expecting.nested(() => operand.parse(scope, tokens)) : operand.parse(scope, tokens)
    if (!lhs) return undefined

    const suffixes: P.Match[] = []
    let rest = tokens.slice(lhs.length)
    while (rest.length) {
      const remaining = rest
      // the FIRST suffix knows what it follows -- see `SuffixLeft`
      const parseSuffix = () =>
        SuffixLeft.while(suffixes.length ? undefined : lhs, () => chain.rule.parse(scope, remaining))
      const suffix = expecting ? expecting.nested(parseSuffix) : parseSuffix()
      if (!suffix || compound_expression.precedenceOf(suffix) <= this.bound) break
      suffixes.push(suffix)
      rest = rest.slice(suffix.length)
    }
    if (expecting && !rest.length) expecting.expect(chain, this, 1, true)

    if (!suffixes.length) {
      lhs.matchGroup = this.name
      return lhs
    }
    // the same shape `Sequence` would make of our syntax:  `lhs`, then a `Repeat` match as `rhsChain`
    const suffixTokens = suffixes.flatMap((it) => it.tokens)
    const rhsChain = new P.Match({ rule: chain, matched: suffixes, items: suffixes, tokens: suffixTokens, scope })
    const value = tokens
      .slice(0, tokens.length - rest.length)
      .join("")
      .trim()
    return new P.Match({ rule: this, matched: [lhs, rhsChain], value, tokens: [...lhs.tokens, ...suffixTokens], scope })
  }

  /**
   * What the whole expression is:  the same shunting-yard as `getAST()`, over datatypes.
   * - Each operator's `getResultDatatype()`, applied in the order `getAST()` applies it.
   * - e.g. `the rank of the card + 1 is 2` => `+` makes `number`, then `is` makes `choice`.
   */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    const { lhs, rhsChain } = match.groups
    const output: Array<P.Datatype | undefined> = [lhs.datatype]
    const opStack: P.Match[] = []
    for (const suffix of rhsChain.matched) {
      if (!(suffix instanceof P.Match)) continue
      reduceWhile(compound_expression.precedenceOf(suffix))
      const rule: InfixOperatorSuffix = suffix.rule as InfixOperatorSuffix
      if (suffix.rule instanceof PostfixOperatorSuffix) {
        output.push(rule.getResultDatatype(suffix, output.pop(), undefined))
      } else {
        opStack.push(suffix)
        output.push((suffix.groups.expression as P.Match | undefined)?.datatype)
      }
    }
    reduceWhile(-Infinity)
    return output[0]

    /** Apply every stacked operator binding at least as tightly as `power` -- as `getAST()`'s namesake. */
    function reduceWhile(power: number) {
      for (let top = opStack.at(-1); top && compound_expression.precedenceOf(top) >= power; top = opStack.at(-1)) {
        const operator = opStack.pop()!
        const rhs = output.pop()
        const lhs = output.pop()
        output.push((operator.rule as InfixOperatorSuffix).getResultDatatype(operator, lhs, rhs))
      }
    }
  }

  /**
   * Runs shunting-yard over `rhsChain` to combine `lhs` with each suffix, by `precedence`.
   * - `compile()` normalizes a matched sub-`Match`/array down to plain `ASTNode`(s).
   * - `applyOperatorToRule()` calls the matched suffix rule's own `compileAST()`.
   * - Postfix pops like infix, then applies at once:  `x + y is empty` => `isEmpty(x + y)`.
   */
  getAST(match: P.MatchFor<this>): P.ASTNode {
    function compile(thing: unknown): unknown {
      if (!thing) return undefined
      // TODO: we have one case ("is the queen of spades") where `thing` match is an array... :-(
      if (Array.isArray(thing)) return thing.map(compile)
      if (thing instanceof P.Match && thing.rule.getAST) return thing.AST
      return thing
    }

    function applyOperatorToRule({
      match: ruleMatch,
      operator,
      rhs,
      lhs
    }: {
      match: P.Match
      operator: P.Match
      rhs?: unknown
      lhs?: unknown
    }): P.ASTNode {
      // Every match pushed onto `opStack` (below) came from an item whose `.rule` was already
      // confirmed `instanceof InfixOperatorSuffix`; re-assert that invariant here so `compileAST()`
      // is callable -- the base `Rule` type doesn't know about this language-specific method.
      if (!(ruleMatch.rule instanceof InfixOperatorSuffix)) {
        throw new TypeError("Expected an InfixOperatorSuffix rule in compound_expression's shunting-yard")
      }
      // NOTE: re-typed to plain (default-parameterized) `InfixOperatorSuffix` -- bare `instanceof`
      // against a generic class narrows to `InfixOperatorSuffix<any, any>`, which makes
      // `MatchFor<this>` resolve to an unhelpful distributed type at the `compileAST()` call below.
      const rule: InfixOperatorSuffix = ruleMatch.rule
      const args = {
        operator,
        // `compile()` normalizes matches/arrays down to `ASTNode`s dynamically -- not statically
        // representable as `Expression`, but that's what every operand is in practice here.
        rhs: compile(rhs) as P.ASTExpression | undefined,
        lhs: compile(lhs) as P.ASTExpression | undefined
      }
      const result = rule.compileAST(ruleMatch, args)
      return result
    }

    /** Apply every stacked operator binding at least as tightly as `power`, to the top 2 things on `output`. */
    function reduceWhile(power: number) {
      for (
        let top = opStack.at(-1);
        top && compound_expression.precedenceOf(top.match) >= power;
        top = opStack.at(-1)
      ) {
        const topOp = opStack.pop()!
        const rhs = output.pop() // NOTE: order is vital here!
        output.push(applyOperatorToRule({ ...topOp, rhs, lhs: output.pop() }))
      }
    }

    // Iterate through the rhs expressions, using a variant of the shunting-yard algorithm
    //  to deal with operator precedence.  Note that we assume:
    //  - all infix operators are `left-to-right` associative, and
    //  - all postfix operators are left to right associative.
    // See: https://en.wikipedia.org/wiki/Shunting-yard_algorithm
    // See: https://www.chris-j.co.uk/parsing.php
    const { lhs, rhsChain } = match.groups
    const output: unknown[] = [lhs]
    const opStack: Array<{ match: P.Match; operator: P.Match }> = []
    rhsChain.matched.forEach((rhsItem) => {
      if (!(rhsItem instanceof P.Match)) return
      // `rhsChain` has no delimiter, so every item in `.matched` is a `Match` for one of the
      // `expression_suffix` rules below, whose syntax always names `operator`/`expression` groups
      // (except the no-`rhs` postfix rules, which may omit `expression`).
      const rhs = rhsItem as unknown as P.Match<P.GroupsFor<"operator?|expression?">>
      // Unary postfix operator, e.g. "<lhs> is empty":  first apply what binds at least as tightly
      if (rhs.rule instanceof PostfixOperatorSuffix) {
        reduceWhile(compound_expression.precedenceOf(rhs))
        const args = {
          match: rhs,
          lhs: output.pop(),
          // use explicit operator if there is one, default to entire match
          operator: rhs.groups.operator || rhs
        }
        output.push(applyOperatorToRule(args))
      }
      // Infix binary operator, e.g. "<lhs> is a <rhs>"
      else if (rhs.rule instanceof InfixOperatorSuffix) {
        const { operator, expression } = rhs.groups

        // Apply each stacked operator binding at least as tightly as this one
        reduceWhile(compound_expression.precedenceOf(rhs))

        // Push the current operator and expression.
        // `operator` is always present: every `InfixOperatorSuffix` rule below declares an
        // explicit `(operator:...)` group in its syntax.
        opStack.push({ match: rhs, operator: operator! })
        output.push(expression)
      } else {
        console.warn("Unexpected rule type", rhs.rule.name)
      }
    })

    // At this point, we have only binary operators in the output stack.
    // Run through them and apply the operator to them in pairs.
    reduceWhile(-Infinity)
    if (output.length !== 1) {
      console.warn("Shunting yard ended up with too much output:", output)
    }
    // Dynamic: the shunting-yard reduction above always leaves exactly one `ASTNode`.
    return output[0] as P.ASTNode
  }

  /** A suffix match's `precedence` -- every `expression_suffix` is an `InfixOperatorSuffix`, which must have one. */
  private static precedenceOf(suffix: P.Match): number {
    return (suffix.rule as InfixOperatorSuffix).precedence
  }
}
expressions.addRule(compound_expression, {
  syntax: "{lhs:operand} {rhsChain:expression_suffix}*",
  // test multiple infix expressions in a row
  tests: [
    {
      title: "complex math expressions",
      compileAs: "expression",
      tests: [
        ["1 + 2 + 3", "((1 + 2) + 3)"],
        ["1 + 2 * 3", "(1 + (2 * 3))"],
        ["(1+1) * (2+2)", "((1 + 1) * (2 + 2))"],
        ["((1+1) * (2+2))", "((1 + 1) * (2 + 2))"]
      ]
    },
    {
      title: "complex property/etc expressions",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("card")
      },
      tests: [[`the suit of the card is "ace"`, `(card.suit == "ace")`]]
    },
    {
      title: "postfix binds like a comparison:  after arithmetic, before `and`",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("x")
        scope.variables?.add("y")
      },
      tests: [
        ["x + y is empty", "spellCore.isEmpty(x + y)"],
        ["x is 1 and y is empty", "((x == 1) && spellCore.isEmpty(y))"]
      ]
    }
  ]
})

////////////////
// ## `arithmetic_expression` rule
//    e.g. "x + 1" in "the absolute value of x + 1 is 3"
////////////////

/**
 * An `expression` taking only arithmetic suffixes, `+ - * /`:  stops before a comparison.
 * - e.g. `x + 1` in `the absolute value of x + 1 is 3` => `absoluteValue(x + 1) == 3`
 * - For math prefixes which take a sum (D3):  `absolute_value`, `round_number`.
 */
class arithmetic_expression extends compound_expression {
  static ruleName = "arithmetic_expression"
  @proto static bound = Precedence.takesSum
}
expressions.addRule(arithmetic_expression, {
  syntax: "{lhs:operand} {rhsChain:expression_suffix}*",
  tests: [
    {
      compileAs: "arithmetic_expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("x")
      },
      tests: [
        ["x + 1 * 2", "(x + (1 * 2))"],
        ["x", "x"]
      ]
    }
  ]
})

////////////////
// ## `and` rule
//    e.g. "thing and other"
////////////////

/** `{lhs} and {rhs}`, e.g. `thing and other` -- `Precedence.and`:  below `is` / `includes` etc, above `or`. */
class and extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.and
  @proto static parenthesize = true

  getOutputOperator(): string {
    return "&&"
  }
}
expressions.addRule(and, {
  syntax: "(operator:and) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("other")
        scope.variables?.add("yet-another")
      },
      tests: [
        ["thing and other", "(thing && other)"],
        ["thing and other and yet-another", "((thing && other) && yet_another)"],
        ["thing is 1 and other is 2", "((thing == 1) && (other == 2))"]
      ]
    }
  ]
})

////////////////
// ## `or` rule
//    e.g. "thing or other"
////////////////

/** `{lhs} or {rhs}`, e.g. `thing or other` -- `Precedence.or`:  lowest of the boolean / comparison suffixes. */
class or extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.or
  @proto static parenthesize = true

  getOutputOperator(): string {
    return "||"
  }
}
expressions.addRule(or, {
  syntax: "(operator:or) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("other")
      },
      tests: [["thing or other", "(thing || other)"]]
    }
  ]
})

////////////////
// ## `is_equal` rule
//    e.g. "thing is other"
////////////////

/** `{lhs} is [not] {rhs}`, e.g. `thing is other` -- compiles to `==`/`!=`. */
class is_equal extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.equality
  @proto static parenthesize = true

  getOutputOperator(operator: P.Match): string {
    return operator.value === "is not" ? "!=" : "=="
  }
}
expressions.addRule(is_equal, {
  syntax: "(operator:is not?) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("other")
      },
      tests: [
        ["thing is other", "(thing == other)"],
        ["thing is not other", "(thing != other)"]
      ]
    }
  ]
})

////////////////
// ## `is_exactly` rule
//    e.g. "thing is exactly other"
////////////////

/** `{lhs} is [not] exactly {rhs}`, e.g. `thing is exactly other` -- compiles to `===`/`!==`. */
class is_exactly extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.equality
  @proto static parenthesize = true

  getOutputOperator(operator: P.Match): string {
    return operator.value === "is not exactly" ? "!==" : "==="
  }
}
expressions.addRule(is_exactly, {
  syntax: "(operator:is not? exactly) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("other")
      },
      tests: [
        ["thing is exactly other", "(thing === other)"],
        ["thing is not exactly other", "(thing !== other)"]
      ]
    }
  ]
})

////////////////
// ## `is_a` rule
//    e.g. "thing is a Bee"
////////////////

/**
 * `{lhs} is [not] a`/`an {type}`, e.g. `thing is a Bee`.
 * - The type MUST be known (`known_type`), so a typo is a parse error, e.g. `is a crad`.  Known:
 *   - built in, e.g. `is a number`
 *   - imported
 *   - declared earlier in the project
 *   - or mentioned earlier -- a `stub`, e.g. by `a joker has a color ...` above `a joker is a card`.
 *     See `P.TypeScope.getOrStub()`.
 * - `shouldNegateOutput()` handles `is not a`.
 * - Compiles to `spellCore.isOfType(lhs, 'TypeName')`, wrapping type name via `QuotedExpression`:
 *   its RUNTIME name, which differs for a type imported renamed.  See `P.ASTTypeExpression.runtimeName`.
 */
class is_a extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(operator: P.Match): boolean {
    return typeof operator.value === "string" && operator.value.includes("not")
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs, rhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    // a type's class, by the name it has when the code runs -- see `P.ASTTypeExpression.runtimeName`
    const type =
      rhs instanceof P.ASTTypeExpression
        ? new P.ASTQuotedExpression(match, rhs.runtimeName)
        : new P.ASTQuotedExpression(match, { expression: rhs! })
    return new P.ASTCoreMethodInvocation(match, { methodName: "isOfType", args: [lhs!, type] })
  }
}
expressions.addRule(is_a, {
  syntax: "(operator:is not? (a|an)) {expression:known_type}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.types?.add("Bee")
        scope.types?.add("Animal")
      },
      tests: [
        ["thing is a Bee", "spellCore.isOfType(thing, 'Bee')"],
        ["thing is an Animal", "spellCore.isOfType(thing, 'Animal')"],
        ["thing is not a Bee", "!spellCore.isOfType(thing, 'Bee')"],
        ["thing is not an Animal", "!spellCore.isOfType(thing, 'Animal')"],
        ["thing is a number", "spellCore.isOfType(thing, 'number')"],
        ["thing is a boolean", "spellCore.isOfType(thing, 'choice')"],
        ["thing is a list", "spellCore.isOfType(thing, 'List')"],
        // an unknown type is no type:  `is a crad` doesn't parse
        ["thing is a crad", "thing"]
      ]
    }
  ]
})

////////////////
// ## `is_same_type_as` rule
//    e.g. "thing is the same type as other"
////////////////

/**
 * `{lhs} is [not] the same type as {rhs}`, e.g. `thing is the same type as other`.
 * - `shouldNegateOutput()` handles `is not the same type as`.
 * - Compiles to `spellCore.matchesType(lhs, rhs)`.
 */
class is_same_type_as extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(operator: P.Match): boolean {
    return typeof operator.value === "string" && operator.value.includes("not")
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs, rhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "matchesType",
      args: [lhs!, rhs!]
    })
  }
}
expressions.addRule(is_same_type_as, {
  syntax: "(operator:is not? the same type as) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("other")
      },
      tests: [
        ["thing is the same type as other", "spellCore.matchesType(thing, other)"],
        ["thing is not the same type as other", "!spellCore.matchesType(thing, other)"]
      ]
    }
  ]
})

////////////////
// ## `is_in` rule
//    e.g. "thing is in theList"
////////////////

/**
 * `{lhs} is [not] in`/`one of`/`either`/`neither ... nor {list}`, e.g. `thing is in theList`,
 * `thing is neither red nor green`.
 * - `expression` group accepts either an `operand` (a list variable) or an inline
 *   `identifier_list`, e.g. `either red or green`.
 * - `shouldNegateOutput()` negates for any variant containing `not` or `neither`.
 * - Compiles to `spellCore.includes(list, lhs)` -- NOTE argument order is reversed from `lhs`/`rhs`.
 */
class is_in extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(operator: P.Match): boolean {
    const { value } = operator
    return typeof value === "string" && (value.includes("not") || value.includes("neither"))
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs, rhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "includes",
      args: [rhs!, lhs!]
    })
  }
}
expressions.addRule(is_in, {
  syntax: "(operator:is (not? in|not? one of|either|not either of?|neither)) (expression:{operand}|{identifier_list})",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("red")
        scope.constants?.add("green")
        scope.variables?.add("theList")
      },
      tests: [
        ["thing is in theList", "spellCore.includes(theList, thing)"],
        ["thing is one of theList", "spellCore.includes(theList, thing)"],
        ["thing is not in theList", "!spellCore.includes(theList, thing)"],
        ["thing is not one of theList", "!spellCore.includes(theList, thing)"],
        ["thing is either red or green", "spellCore.includes([red, 'green'], thing)"],
        ["thing is not either red or green", "!spellCore.includes([red, 'green'], thing)"],
        ["thing is not either of red or green", "!spellCore.includes([red, 'green'], thing)"],
        ["thing is neither red nor green", "!spellCore.includes([red, 'green'], thing)"]
      ]
    }
  ]
})
// `thing is green or blue`, the values known -- see `value_choices`
expressions.addRule(is_in, {
  syntax: "(operator:is not?) (expression:{value_choices})",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.constants?.add("green")
        scope.constants?.add("blue")
      },
      tests: [
        ["thing is green or blue", "spellCore.includes(['green', 'blue'], thing)"],
        ["thing is not green or blue", "!spellCore.includes(['green', 'blue'], thing)"],
        ["thing is green or thing is blue", "((thing == 'green') || (thing == 'blue'))"]
      ]
    }
  ]
})

////////////////
// ## `includes` rule
//    e.g. "theList includes thing"
////////////////

/**
 * `{lhs} includes`/`contains {rhs}`, e.g. `theList includes thing`.
 * - Compiles to `spellCore.includes(lhs, rhs)`.
 */
class includes extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  compileASTExpression(match: P.MatchFor<this>, { lhs, rhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "includes",
      args: [lhs!, rhs!]
    })
  }
}
expressions.addRule(includes, {
  syntax: "(operator:includes|contains) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("theList")
        scope.variables?.add("thing")
      },
      tests: [
        ["theList includes thing", "spellCore.includes(theList, thing)"],
        ["theList contains thing", "spellCore.includes(theList, thing)"]
      ]
    }
  ]
})

////////////////
// ## `does_not_include` rule
//    e.g. "theList does not include thing"
////////////////

/**
 * `{lhs} does not include`/`contain {rhs}`, e.g. `theList does not include thing`.
 * - Always negates via `shouldNegateOutput()`, then delegates to same `spellCore.includes()` as `includes`.
 */
class does_not_include extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(): boolean {
    return true
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs, rhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "includes",
      args: [lhs!, rhs!]
    })
  }
}
expressions.addRule(does_not_include, {
  syntax: "(operator:does not (include|contain)) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("theList")
        scope.variables?.add("thing")
      },
      tests: [
        ["theList does not include thing", "!spellCore.includes(theList, thing)"],
        ["theList does not contain thing", "!spellCore.includes(theList, thing)"]
      ]
    }
  ]
})

////////////////
// ## `is_defined` rule
//    e.g. "thing is defined"
////////////////

/**
 * `{lhs} is defined`/`undefined`/`not defined` postfix, e.g. `thing is defined`.
 * - Negates for anything other than exactly `is defined`.
 * - Compiles to `spellCore.isDefined(lhs)`, negated as needed.
 */
class is_defined extends PostfixOperatorSuffix {
  /** Beats `is_equal` + `undefined`, which matches `is undefined` in as many words. */
  @proto static priority = Priority.preferred
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(operator: P.Match): boolean {
    return operator.value !== "is defined"
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "isDefined",
      args: [lhs!]
    })
  }
}
expressions.addRule(is_defined, {
  syntax: "is (defined|undefined|not defined)",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
      },
      tests: [
        ["thing is defined", "spellCore.isDefined(thing)"],
        ["thing is undefined", "!spellCore.isDefined(thing)"],
        ["thing is not defined", "!spellCore.isDefined(thing)"]
      ]
    }
  ]
})

////////////////
// ## `exists` rule
//    e.g. "thing exists"
////////////////

/**
 * `{lhs} exists`/`does not exist` postfix, e.g. `thing exists`.
 * - Same underlying `spellCore.isDefined()` as `is_defined`, just different surface syntax.
 */
class exists extends PostfixOperatorSuffix {
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(operator: P.Match): boolean {
    return operator.value !== "exists"
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "isDefined",
      args: [lhs!]
    })
  }
}
expressions.addRule(exists, {
  syntax: "(exists|does not exist)",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
      },
      tests: [
        ["thing exists", "spellCore.isDefined(thing)"],
        ["thing does not exist", "!spellCore.isDefined(thing)"]
      ]
    }
  ]
})

////////////////
// ## `there_is_a` rule
//    e.g. "there is a thing"
////////////////

/**
 * `there is [not] a`/`an {operand}` or `there is no such {operand}`, e.g. `there is a thing`.
 * - Unlike other rules here this is a plain `expression`, not an `expression_suffix` -- it has no
 *   `lhs` to attach to, it stands on its own at the front of an expression.
 * - Takes an `operand`, like a test,
 *   e.g. `there is a winner and the game is over` => `isDefined(winner) && ...`
 * - Negates when `operator` contains `no`, covering both `is not a` and `is no such`.
 * - Compiles to `spellCore.isDefined(expression)`, negated as needed.
 */
class there_is_a extends SpellExpression<"operator|expression"> {
  @proto static datatype = "choice"

  getAST(match: P.MatchFor<this>): P.ASTNode {
    const { operator } = match.groups
    const expression = new P.ASTCoreMethodInvocation(match, {
      methodName: "isDefined",
      args: [match.groups.expression.AST as P.ASTExpression]
    })
    if (operator && typeof operator.value === "string" && operator.value.includes("no")) {
      return new P.ASTNotExpression(match, { expression })
    }
    return expression
  }
}
expressions.addRule(there_is_a, {
  syntax: "there (operator:is not? (a|an)|is no such) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("animal")
      },
      tests: [
        { input: "there is a thing", output: "spellCore.isDefined(thing)" },
        { input: "there is an animal", output: "spellCore.isDefined(animal)" },
        { input: "there is not a thing", output: "!spellCore.isDefined(thing)" },
        { input: "there is no such animal", output: "!spellCore.isDefined(animal)" },
        // an operand:  `and` is the expression's, not the thing's (D23)
        { input: "there is a thing and animal", output: "(spellCore.isDefined(thing) && animal)" }
      ]
    }
  ]
})

////////////////
// ## `is_empty` rule
//    e.g. "thing is empty"
////////////////

/**
 * `{lhs} is [not] empty` postfix, e.g. `thing is empty`.
 * - Compiles to `spellCore.isEmpty(lhs)`, negated for `is not empty`.
 */
class is_empty extends PostfixOperatorSuffix<"operator"> {
  @proto static precedence = Precedence.comparison

  shouldNegateOutput(operator: P.Match): boolean {
    return typeof operator.value === "string" && operator.value.includes("not")
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "isEmpty",
      args: [lhs!]
    })
  }
}
expressions.addRule(is_empty, {
  syntax: "(operator:is not? empty)",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
      },
      tests: [
        ["thing is empty", "spellCore.isEmpty(thing)"],
        ["thing is not empty", "!spellCore.isEmpty(thing)"]
      ]
    }
  ]
})

////////////////////////////////////////
// # String utilities
////////////////////////////////////////

////////////////
// ## `as_uppercase` rule
//    e.g. "foo" as upper case
////////////////

/** `as upper case`/`uppercase` postfix, e.g. `"foo" as upper case` -- compiles to `spellCore.upperCase(lhs)`. */
class as_uppercase extends PostfixOperatorSuffix {
  @proto static precedence = Precedence.comparison
  @proto static datatype = "text"

  compileASTExpression(match: P.MatchFor<this>, { lhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "upperCase",
      args: [lhs!]
    })
  }
}
expressions.addRule(as_uppercase, {
  syntax: "as (upper case|uppercase)",
  tests: [
    {
      compileAs: "expression",
      tests: [
        [`"foo" as upper case`, `spellCore.upperCase("foo")`],
        [`1 as uppercase`, `spellCore.upperCase(1)`]
      ]
    }
  ]
})

////////////////
// ## `as_lowercase` rule
//    e.g. "foo" as lower case
////////////////

/** `as lower case`/`lowercase` postfix, e.g. `"foo" as lower case` -- compiles to `spellCore.lowerCase(lhs)`. */
class as_lowercase extends PostfixOperatorSuffix {
  @proto static precedence = Precedence.comparison
  @proto static datatype = "text"

  compileASTExpression(match: P.MatchFor<this>, { lhs }: OperatorOperands): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "lowerCase",
      args: [lhs!]
    })
  }
}
expressions.addRule(as_lowercase, {
  syntax: "as (lower case|lowercase)",
  tests: [
    {
      compileAs: "expression",
      tests: [
        [`"foo" as lower case`, `spellCore.lowerCase("foo")`],
        [`1 as lowercase`, `spellCore.lowerCase(1)`]
      ]
    }
  ]
})

////////////////
// ## `as_a_type` rule
//    e.g. "1 as a string"
////////////////

/**
 * `as a`/`an {type}`, e.g. `1 as a string`, `1.4 as an integer` -- casts value to `string`/`number`/
 * `fraction`/`integer`/`text`.
 * - `string`/`text` wrap output in a template-literal `${...}` via `BackTickExpression`.
 * - `number`/`fraction` compile to `parseFloat()`, `integer` to `parseInt()`.
 */
class as_a_type extends PostfixOperatorSuffix<"type"> {
  @proto static precedence = Precedence.comparison
  @proto static description = "Convert a value to a specific type, e.g. an integer."

  /** The type it converts to, in spell's words, e.g. `text` for `as a string`. */
  getResultDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return SP.typeName(`${match.groups.type.value}`)
  }

  compileASTExpression(
    match: P.MatchFor<this>,
    { lhs }: OperatorOperands
  ): P.ASTBackTickExpression | P.ASTMethodInvocation {
    const type = match.groups.type.value
    if (type === "string" || type === "text") {
      // Wrap the expression in backticks to convert it to a string.
      // Output is something like: "`${EXPRESSION_VALUE}`"
      return new P.ASTBackTickExpression(match, {
        expression: new P.ASTBacktickSubstitution(match, { expression: lhs! })
      })
    } else {
      // Output will be e.g. `parseFloat(EXPRESSION_VALUE)`
      const methodName = type === "integer" ? "parseInt" : "parseFloat"
      return new P.ASTMethodInvocation(match, {
        methodName,
        args: [lhs!]
      })
    }
  }
}
expressions.addRule(as_a_type, {
  syntax: "as (a|an) (type:string|number|fraction|integer)",
  // es: "como (un|una) (type:cadena|numero|fracción|entero)"
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["1 as a string", "`${1}`"],
        [`"hello" as a string`, '`${"hello"}`'],
        ["1 as a number", "parseFloat(1)"],
        ["1.3 as a fraction", "parseFloat(1.3)"],
        ["1.4 as an integer", "parseInt(1.4)"],
        [`"foo" as a number`, `parseFloat("foo")`]
      ]
    }
  ]
})
expressions.addRule(as_a_type, {
  syntax: "as (type:text)",
  tests: [
    {
      compileAs: "expression",
      tests: [["1 as text", "`${1}`"]]
    }
  ]
})

////////////////
// ## Shared types
////////////////

/** Operands passed to `compileASTExpression()`/`compileAST()` while running the shunting-yard algorithm. */
type OperatorOperands = {
  /** Operator `Match` -- rule-specific token(s) deciding the concrete operator, e.g. `is not exactly`. */
  operator: P.Match
  /** Left-hand-side AST -- always populated for infix operators; also populated for postfix operators. */
  lhs?: P.ASTExpression
  /** Right-hand-side AST -- only populated for infix operators. */
  rhs?: P.ASTExpression
}

/**
 * What the suffix being parsed FOLLOWS, when `compound_expression` knows:  its operand, for the first suffix after it
 * -- so a user's phrase can refuse a thing that isn't its own, e.g. a deck's `a rank "is a face card"` on
 * `the card is a face card`, where the card has its own (plan doc `outline-spell`, J8 / J11).
 * - A suffix can't see its left side through `parse()`'s arguments:  this is the side channel, set while
 *   `compound_expression` parses that one suffix, and restored after, so nested expressions keep their own.
 * - `undefined`:  not known, e.g. a later suffix (what it follows is the chain so far):  anything fits.
 */
export const SuffixLeft = {
  /** The operand the suffix being parsed follows, if known. */
  current: undefined as P.Match | undefined,

  /** `parse()` with `left` as `current`, restoring what was there after. */
  while<T>(left: P.Match | undefined, parse: () => T): T {
    const outer = SuffixLeft.current
    SuffixLeft.current = left
    try {
      return parse()
    } finally {
      SuffixLeft.current = outer
    }
  },

  /**
   * Could what the suffix follows be a `type`, e.g. the owner of a user's phrase?  `true` unless both are KNOWN and
   * neither is the other -- as `scope.couldBeA()`.
   */
  couldBeA(scope: P.Scope, type: P.Datatype | undefined): boolean {
    return !SuffixLeft.current || scope.couldBeA(SuffixLeft.current.datatype, type)
  }
}
