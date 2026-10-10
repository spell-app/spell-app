import { proto } from "$/util"
import { P } from "$/parser"
import { InfixOperatorSuffix } from "./InfixOperatorSuffix"
import { PostfixOperatorSuffix } from "./PostfixOperatorSuffix"
import { SpellExpression } from "./SpellExpression"
import { Precedence, SuffixLeft } from "./expressions.shared"
import { expressions } from "./expressions.parser"

/**
 * `expression` rule:  an operand, then each operator suffix binding TIGHTER than `bound`, e.g. `x + 1 is 3`.
 * - The ONLY rule registered as `expression`:  every other `expression` alias is an `operand`
 *   -- see `SpellParser.getNamesForRule()`.
 * - No suffix => the operand's own match, as is,
 *   so `match.is(KnownVariable)` still works on `{thing:expression}`.
 * - Suffixes' rhs is an `operand`, so the chain is flat:
 *   `getAST()` groups it by `precedence` (shunting-yard).
 */
export class CompoundExpression extends SpellExpression<"lhs|rhsChain"> {
  static ruleName = "expression"
  @proto static alias: string | string[] = []
  /** Suffixes must bind tighter than this to be ours:  0 takes them all, see `ArithmeticExpression`. */
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
      // what the suffix follows, when known -- see `SuffixLeft`
      const left = CompoundExpression.suffixLeft(lhs, suffixes.at(-1))
      const parseSuffix = () => SuffixLeft.while(left, () => chain.rule.parse(scope, remaining))
      const suffix = expecting ? expecting.nested(parseSuffix) : parseSuffix()
      if (!suffix || CompoundExpression.precedenceOf(suffix) <= this.bound) break
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
      reduceWhile(CompoundExpression.precedenceOf(suffix))
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
      for (let top = opStack.at(-1); top && CompoundExpression.precedenceOf(top) >= power; top = opStack.at(-1)) {
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
        throw new TypeError("Expected an InfixOperatorSuffix rule in CompoundExpression's shunting-yard")
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
      for (let top = opStack.at(-1); top && CompoundExpression.precedenceOf(top.match) >= power; top = opStack.at(-1)) {
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
        reduceWhile(CompoundExpression.precedenceOf(rhs))
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
        reduceWhile(CompoundExpression.precedenceOf(rhs))

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

  /**
   * What the next suffix follows, if known -- see `SuffixLeft`.
   * - The first suffix:  our operand, `lhs`.
   * - After `and` / `or`:  the operand after it, e.g. `the game` in `the card is face up and the game is red`.  Every
   *   suffix which asks (a user's phrase) binds tighter than those, so that operand is its whole left side.
   * - After anything else:  unknown, e.g. after `+` the left side is the sum so far.
   */
  private static suffixLeft(lhs: P.Match, previous: P.Match | undefined): P.Match | undefined {
    if (!previous) return lhs
    if (previous.rule instanceof PostfixOperatorSuffix) return undefined
    const precedence = CompoundExpression.precedenceOf(previous)
    if (precedence !== Precedence.and && precedence !== Precedence.or) return undefined
    return previous.groups.expression as P.Match | undefined
  }

  /** A suffix match's `precedence` -- every `expression_suffix` is an `InfixOperatorSuffix`, which must have one. */
  private static precedenceOf(suffix: P.Match): number {
    return (suffix.rule as InfixOperatorSuffix).precedence
  }
}
expressions.addRule(CompoundExpression, {
  syntax: "{lhs:operand} {rhsChain:expression_suffix}*",
  // test multiple infix expressions in a row
  tests: [
    {
      title: "complex math expressions",
      compileAs: "expression",
      tests: [
        ["1 + 2 + 3", "((1 + 2) + 3)", "(1 + 2 + 3)"],
        ["1 + 2 * 3", "(1 + (2 * 3))", "(1 + 2 * 3)"],
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
        ["x is 1 and y is empty", "((x == 1) && spellCore.isEmpty(y))", "(x == 1 && spellCore.isEmpty(y))"]
      ]
    }
  ]
})
