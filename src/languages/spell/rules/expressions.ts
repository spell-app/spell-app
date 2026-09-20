/**
 * Rules for Spell boolean/comparison/type-check expression suffixes -- `and`, `or`, `is`, `is a`,
 * `includes`, `is empty`, string-case conversion, type coercion, etc.
 * - Also defines `InfixOperatorSuffix` / `PostfixOperatorSuffix`, the base classes every operator-suffix
 *   rule here extends, and `compound_expression`, which runs the shunting-yard algorithm combining them.
 */

import { P, AST } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement } from "./Statement"

/** Base class for all Spell expressions. */
export class SpellExpression extends SpellStatement {
  /** Whether this rule is left-recursive, e.g. `{expression} + {expression}`. */
  declare isLeftRecursive: boolean
  /** Whether `compileAST()` should wrap the output expression in parenthesis. */
  declare parenthesize: boolean

  static {
    Object.defineProperty(this.prototype, "isLeftRecursive", { value: false, writable: true })
    Object.defineProperty(this.prototype, "parenthesize", { value: false, writable: true })
  }
}

/** Operands passed to `compileASTExpression()`/`compileAST()` while running the shunting-yard algorithm. */
type OperatorOperands = {
  /** Operator `Match` -- rule-specific token(s) deciding the concrete operator, e.g. `is not exactly`. */
  operator: P.Match
  /** Left-hand-side AST -- always populated for infix operators; also populated for postfix operators. */
  lhs?: AST.Expression
  /** Right-hand-side AST -- only populated for infix operators. */
  rhs?: AST.Expression
}

/**
 * Base class for expression-suffix rules that take an explicit `rhs`, e.g. `is`, `and`, `includes`.
 * - Matched as part of `compound_expression`'s shunting-yard algorithm -- never parsed standalone.
 * - Override `compileASTExpression()` to control output AST, `getOutputOperator()` for the operator
 *   string, `shouldNegateOutput()` to negate the result, e.g. for `is not`.
 * - `getAST()` deliberately throws: compilation always goes through `compileAST()`/`compileASTExpression()`,
 *   called directly by `compound_expression`'s shunting-yard rather than through normal rule dispatch.
 */
export class InfixOperatorSuffix extends SpellExpression {
  // set `outputDatatype` to specify explicit datatype in standard `getAST()`

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
   * - NOTE: language-dependent!
   */
  shouldNegateOutput(operator: P.Match): boolean {
    return false
  }

  /**
   * Build output AST for this operator from `lhs`/`operator`/`rhs`.
   * - By default builds an `InfixExpression`; override to output something else, e.g. `CoreMethodInvocation`.
   * - `lhs` is left-hand-side AST.
   * - `operator` is operator `Match`.
   * - `rhs` is right-hand-side AST.
   */
  compileASTExpression(match: P.Match, { lhs, operator, rhs }: OperatorOperands): AST.ASTNode {
    return new AST.InfixExpression(match, {
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
  compileAST(match: P.Match, { operator, rhs, lhs }: OperatorOperands): AST.ASTNode {
    let expression = this.compileASTExpression(match, { lhs, operator, rhs })
    if (this.parenthesize && !(expression instanceof AST.ParenthesizedExpression)) {
      expression = new AST.ParenthesizedExpression(match, { expression: expression as AST.Expression })
    }
    if (this.shouldNegateOutput(operator)) {
      expression = new AST.NotExpression(match, { expression: expression as AST.Expression })
    }
    return expression
  }

  /**
   * NEVER called in practice -- `compound_expression`'s shunting-yard calls `compileAST()` directly on
   * matched `InfixOperatorSuffix`/`PostfixOperatorSuffix` instances instead of normal rule dispatch.
   * - Throws to catch any code path that still tries to call it the normal way.
   */
  getAST(match: P.Match): AST.ASTNode {
    throw new TypeError("This should never be called")
  }
}
SpellParser.Rules.InfixOperatorSuffix = InfixOperatorSuffix

/**
 * Base class for expression-suffix rules with no `rhs`, e.g. `is empty`, `is defined`, `exists`.
 * - Same shunting-yard machinery as `InfixOperatorSuffix`, just without a right-hand side.
 */
export class PostfixOperatorSuffix extends InfixOperatorSuffix {
  /**
   * Must be implemented by subclasses -- no default postfix behavior makes sense to fall back to.
   * - `lhs` is left-hand-side match.
   * - `operator` is raw full input operator string.
   */
  compileASTExpression(match: P.Match, { lhs, operator }: OperatorOperands): AST.ASTNode {
    throw new TypeError("Must implement compileASTExpression()")
  }
}
SpellParser.Rules.PostfixOperatorSuffix = PostfixOperatorSuffix

////////////////
// ## Expression rules
////////////////

export const expressions = new SpellParser({
  module: "expressions",
  rules: [
    /**
     * `(expression)` -- parenthesized sub-expression.
     * - `testRule: "\\("` lets shunting-yard skip the full grammar when there's no leading `(`.
     * - `getAST()` relies on `ParenthesizedExpression`'s own constructor to collapse nested parens,
     *   e.g. `((thing))` compiles down to `(thing)`.
     */
    {
      name: "parenthesized_expression",
      alias: "expression",
      syntax: "\\( {expression} \\)",
      testRule: "\\(",
      constructor: class parenthesized_expression extends SpellExpression {
        getAST(match: P.Match<P.RulexGroups<"expression">>): AST.ParenthesizedExpression {
          const { expression } = match.groups
          return new AST.ParenthesizedExpression(match, {
            // `expression` is guaranteed present: it's the only (non-optional) group in this rule's syntax.
            expression: expression!.AST as AST.Expression
          })
        }
      },
      tests: [
        {
          title: "correctly matches parenthesized expressions",
          beforeEach(scope) {
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
    },

    /**
     * `{lhs:simple_expression} {rhsChain:expression_suffix}+` -- combines a leading simple expression
     * with one or more operator suffixes (`and`, `is`, `+`, `is empty`, ...), applying a shunting-yard
     * algorithm so mixed-precedence chains like `1 + 2 * 3` group correctly.
     * - `isLeftRecursive: true` since `simple_expression` can itself expand back into `expression`.
     * - `precedence: 12` disambiguates this rule against other `expression` alternatives (`there_is_a`,
     *   `max`, `min`, ...) -- unrelated to each suffix rule's own `precedence`, which the shunting-yard
     *   below compares directly.
     * - `getAST()` runs the shunting-yard: pushes `lhs` onto `output`, then for each suffix match either
     *   applies it immediately (postfix) or pushes it onto `opStack` and pops/applies higher-or-equal
     *   precedence operators first (infix), finally draining `opStack` left to right.
     */
    {
      name: "compound_expression",
      alias: "expression",
      precedence: 12,
      syntax: "{lhs:simple_expression} {rhsChain:expression_suffix}+",
      constructor: class compound_expression extends SpellExpression {
        static {
          Object.defineProperty(this.prototype, "isLeftRecursive", { value: true, writable: true })
        }

        /**
         * Runs shunting-yard over `rhsChain` to combine `lhs` with each suffix in precedence order.
         * - `compile()` normalizes a matched sub-`Match`/array down to plain `ASTNode`(s).
         * - `applyOperatorToRule()` calls the matched suffix rule's own `compileAST()`.
         */
        getAST(match: P.Match<P.RulexGroups<"lhs"> & { rhsChain?: P.Match }>): AST.ASTNode {
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
          }): AST.ASTNode {
            // Every match pushed onto `opStack` (below) came from an item whose `.rule` was already
            // confirmed `instanceof InfixOperatorSuffix`; re-assert that invariant here so `compileAST()`
            // is callable -- the base `Rule` type doesn't know about this language-specific method.
            if (!(ruleMatch.rule instanceof InfixOperatorSuffix)) {
              throw new TypeError("Expected an InfixOperatorSuffix rule in compound_expression's shunting-yard")
            }
            const args = {
              operator,
              // `compile()` normalizes matches/arrays down to `ASTNode`s dynamically -- not statically
              // representable as `Expression`, but that's what every operand is in practice here.
              rhs: compile(rhs) as AST.Expression | undefined,
              lhs: compile(lhs) as AST.Expression | undefined
            }
            const result = ruleMatch.rule.compileAST(ruleMatch, args)
            return result
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
          rhsChain?.matched.forEach((rhsItem) => {
            if (!(rhsItem instanceof P.Match)) return
            // `rhsChain` has no delimiter, so every item in `.matched` is a `Match` for one of the
            // `expression_suffix` rules below, whose syntax always names `operator`/`expression` groups.
            const rhs = rhsItem as unknown as P.Match<P.RulexGroups<"operator:expression">>
            // Unary postfix operator, e.g. "<lhs> is empty"
            if (rhs.rule instanceof PostfixOperatorSuffix) {
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

              // While top operator on stack is higher precedence than this one
              let top = opStack[opStack.length - 1]
              while (top && top.match.rule.precedence >= rhs.rule.precedence) {
                // pop the top operator and compile it with top 2 things on the output stack
                const topOp = opStack.pop()!
                const args = {
                  ...topOp,
                  rhs: output.pop(), // NOTE: order is vital here!
                  lhs: output.pop()
                }
                output.push(applyOperatorToRule(args))
                top = opStack[opStack.length - 1]
              }

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
          let topOp
          while ((topOp = opStack.pop())) {
            const args = {
              ...topOp,
              rhs: output.pop(), // NOTE: order is vital here!
              lhs: output.pop()
            }
            output.push(applyOperatorToRule(args))
          }
          if (output.length !== 1) {
            console.warn("Shunting yard ended up with too much output:", output)
          }
          // Dynamic: the shunting-yard reduction above always leaves exactly one `ASTNode`.
          return output[0] as AST.ASTNode
        }
      },
      // test multiple infix expressions in a row
      tests: [
        {
          title: "complex math expressions",
          compileAs: "expression",
          tests: [
            ["1 + 2 + 3", "((1 + 2) + 3)"],
            ["(1+1) * (2+2)", "((1 + 1) * (2 + 2))"],
            ["((1+1) * (2+2))", "((1 + 1) * (2 + 2))"]
          ]
        },
        {
          title: "complex property/etc expressions",
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("card")
          },
          tests: [[`the suit of the card is "ace"`, `(card.suit == "ace")`]]
        }
      ]
    },

    /** `{lhs} and {rhs}`, e.g. `thing and other` -- precedence 6, below `is`/`includes` etc, above `or`. */
    {
      name: "and",
      alias: "expression_suffix",
      syntax: "(operator:and) {expression:simple_expression}",
      precedence: 6,
      parenthesize: true,
      constructor: class and extends InfixOperatorSuffix {
        getOutputOperator(): string {
          return "&&"
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
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
    },

    /** `{lhs} or {rhs}`, e.g. `thing or other` -- precedence 5, lowest of the boolean/comparison suffixes. */
    {
      name: "or",
      alias: "expression_suffix",
      syntax: "(operator:or) {expression:simple_expression}",
      precedence: 5,
      parenthesize: true,
      constructor: class or extends InfixOperatorSuffix {
        getOutputOperator(): string {
          return "||"
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("thing")
            scope.variables?.add("other")
          },
          tests: [["thing or other", "(thing || other)"]]
        }
      ]
    },

    /** `{lhs} is [not] {rhs}`, e.g. `thing is other` -- compiles to `==`/`!=`. */
    {
      name: "is",
      alias: "expression_suffix",
      precedence: 10,
      syntax: "(operator:is not?) {expression:simple_expression}",
      parenthesize: true,
      constructor: class is extends InfixOperatorSuffix {
        getOutputOperator(operator: P.Match): string {
          return operator.value === "is not" ? "!=" : "=="
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("thing")
            scope.variables?.add("other")
          },
          tests: [
            ["thing is other", "(thing == other)"],
            ["thing is not other", "(thing != other)"]
          ]
        }
      ]
    },

    /** `{lhs} is [not] exactly {rhs}`, e.g. `thing is exactly other` -- compiles to `===`/`!==`. */
    {
      name: "is_exactly",
      alias: "expression_suffix",
      precedence: 10,
      syntax: "(operator:is not? exactly) {expression:simple_expression}",
      parenthesize: true,
      constructor: class is_exactly extends InfixOperatorSuffix {
        getOutputOperator(operator: P.Match): string {
          return operator.value === "is not exactly" ? "!==" : "==="
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("thing")
            scope.variables?.add("other")
          },
          tests: [
            ["thing is exactly other", "(thing === other)"],
            ["thing is not exactly other", "(thing !== other)"]
          ]
        }
      ]
    },

    /**
     * `{lhs} is [not] a`/`an {type}`, e.g. `thing is a Bee`.
     * - `shouldNegateOutput()` handles `is not a`.
     * - Compiles to `spellCore.isOfType(lhs, 'TypeName')`, wrapping type name via `QuotedExpression`.
     */
    {
      name: "is_a",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:is not? (a|an)) {expression:type}",
      constructor: class is_a extends InfixOperatorSuffix {
        shouldNegateOutput(operator: P.Match): boolean {
          return typeof operator.value === "string" && operator.value.includes("not")
        }
        compileASTExpression(match: P.Match, { lhs, rhs }: OperatorOperands): AST.CoreMethodInvocation {
          // TODO: QuotedExpression feels wrong here...
          return new AST.CoreMethodInvocation(match, {
            methodName: "isOfType",
            args: [lhs!, new AST.QuotedExpression(match, { expression: rhs! })]
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("thing")
          },
          tests: [
            ["thing is a Bee", "spellCore.isOfType(thing, 'Bee')"],
            ["thing is an Animal", "spellCore.isOfType(thing, 'Animal')"],
            ["thing is not a Bee", "!spellCore.isOfType(thing, 'Bee')"],
            ["thing is not an Animal", "!spellCore.isOfType(thing, 'Animal')"]
          ]
        }
      ]
    },

    /**
     * `{lhs} is [not] the same type as {rhs}`, e.g. `thing is the same type as other`.
     * - Compiles to `spellCore.matchesType(lhs, rhs)`.
     * - NOTE: `getOutputOperator()` computes `===`/`!==` but `compileASTExpression()` overrides the
     *   default and never uses it or negates the output -- `is not the same type as` currently compiles
     *   identically to the positive form (see test below).
     *   TODO: is that intentional, or should `is not` negate the result?
     */
    {
      name: "is_same_type_as",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:is not? the same type as) {expression:simple_expression}",
      constructor: class is_same_type_as extends InfixOperatorSuffix {
        getOutputOperator(operator: P.Match): string {
          return typeof operator.value === "string" && operator.value.includes("not") ? "!==" : "==="
        }
        compileASTExpression(match: P.Match, { lhs, rhs }: OperatorOperands): AST.CoreMethodInvocation {
          return new AST.CoreMethodInvocation(match, {
            methodName: "matchesType",
            args: [lhs!, rhs!]
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("thing")
            scope.variables?.add("other")
          },
          tests: [
            ["thing is the same type as other", "spellCore.matchesType(thing, other)"],
            ["thing is not the same type as other", "spellCore.matchesType(thing, other)"]
          ]
        }
      ]
    },

    /**
     * `{lhs} is [not] in`/`one of`/`either`/`neither ... nor {list}`, e.g. `thing is in theList`,
     * `thing is neither red nor green`.
     * - `expression` group accepts either a single `simple_expression` (a list variable) or an inline
     *   `identifier_list`, e.g. `either red or green`.
     * - `shouldNegateOutput()` negates for any variant containing `not` or `neither`.
     * - Compiles to `spellCore.includes(list, lhs)` -- NOTE argument order is reversed from `lhs`/`rhs`.
     */
    {
      name: "is_in",
      alias: "expression_suffix",
      precedence: 11,
      syntax:
        "(operator:is (not? in|not? one of|either|not either of?|neither)) (expression:{simple_expression}|{identifier_list})",
      constructor: class is_in extends InfixOperatorSuffix {
        shouldNegateOutput(operator: P.Match): boolean {
          const { value } = operator
          return typeof value === "string" && (value.includes("not") || value.includes("neither"))
        }
        compileASTExpression(match: P.Match, { lhs, rhs }: OperatorOperands): AST.CoreMethodInvocation {
          return new AST.CoreMethodInvocation(match, {
            methodName: "includes",
            args: [rhs!, lhs!]
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
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
    },

    /**
     * `{lhs} includes`/`contains {rhs}`, e.g. `theList includes thing`.
     * - Compiles to `spellCore.includes(lhs, rhs)`.
     */
    {
      name: "includes",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:includes|contains) {expression:simple_expression}",
      constructor: class includes extends InfixOperatorSuffix {
        compileASTExpression(match: P.Match, { lhs, rhs }: OperatorOperands): AST.CoreMethodInvocation {
          return new AST.CoreMethodInvocation(match, {
            methodName: "includes",
            args: [lhs!, rhs!]
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("theList")
            scope.variables?.add("thing")
          },
          tests: [
            ["theList includes thing", "spellCore.includes(theList, thing)"],
            ["theList contains thing", "spellCore.includes(theList, thing)"]
          ]
        }
      ]
    },

    /**
     * `{lhs} does not include`/`contain {rhs}`, e.g. `theList does not include thing`.
     * - Always negates via `shouldNegateOutput()`, then delegates to same `spellCore.includes()` as `includes`.
     */
    {
      name: "does_not_include",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:does not (include|contain)) {expression:simple_expression}",
      constructor: class does_not_include extends InfixOperatorSuffix {
        shouldNegateOutput(): boolean {
          return true
        }
        compileASTExpression(match: P.Match, { lhs, rhs }: OperatorOperands): AST.CoreMethodInvocation {
          return new AST.CoreMethodInvocation(match, {
            methodName: "includes",
            args: [lhs!, rhs!]
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("theList")
            scope.variables?.add("thing")
          },
          tests: [
            ["theList does not include thing", "!spellCore.includes(theList, thing)"],
            ["theList does not contain thing", "!spellCore.includes(theList, thing)"]
          ]
        }
      ]
    },

    /**
     * `{lhs} is defined`/`undefined`/`not defined` postfix, e.g. `thing is defined`.
     * - Negates for anything other than exactly `is defined`.
     * - Compiles to `spellCore.isDefined(lhs)`, negated as needed.
     */
    {
      name: "is_defined",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "is (defined|undefined|not defined)",
      constructor: class is_defined extends PostfixOperatorSuffix {
        shouldNegateOutput(operator: P.Match): boolean {
          return operator.value !== "is defined"
        }
        compileASTExpression(match: P.Match, { lhs }: OperatorOperands): AST.CoreMethodInvocation {
          return new AST.CoreMethodInvocation(match, {
            methodName: "isDefined",
            args: [lhs!]
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("thing")
          },
          tests: [
            ["thing is defined", "spellCore.isDefined(thing)"],
            ["thing is undefined", "!spellCore.isDefined(thing)"],
            ["thing is not defined", "!spellCore.isDefined(thing)"]
          ]
        }
      ]
    },

    /**
     * `{lhs} exists`/`does not exist` postfix, e.g. `thing exists`.
     * - Same underlying `spellCore.isDefined()` as `is_defined`, just different surface syntax.
     */
    {
      name: "exists",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(exists|does not exist)",
      constructor: class exists extends PostfixOperatorSuffix {
        shouldNegateOutput(operator: P.Match): boolean {
          return operator.value !== "exists"
        }
        compileASTExpression(match: P.Match, { lhs }: OperatorOperands): AST.CoreMethodInvocation {
          return new AST.CoreMethodInvocation(match, {
            methodName: "isDefined",
            args: [lhs!]
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("thing")
          },
          tests: [
            ["thing exists", "spellCore.isDefined(thing)"],
            ["thing does not exist", "!spellCore.isDefined(thing)"]
          ]
        }
      ]
    },

    /**
     * `there is [not] a`/`an {expression}` or `there is no such {expression}`, e.g. `there is a thing`.
     * - Unlike other rules here this is a plain `expression`, not an `expression_suffix` -- it has no
     *   `lhs` to attach to, it stands on its own at the front of an expression.
     * - Negates when `operator` contains `no`, covering both `is not a` and `is no such`.
     * - Compiles to `spellCore.isDefined(expression)`, negated as needed.
     */
    {
      name: "there_is_a",
      alias: "expression",
      precedence: 11,
      syntax: "there (operator:is not? (a|an)|is no such) {expression}",
      constructor: class there_is_a extends SpellExpression {
        getAST(match: P.Match<P.RulexGroups<"operator:expression">>): AST.ASTNode {
          const { operator } = match.groups
          const expression = new AST.CoreMethodInvocation(match, {
            methodName: "isDefined",
            // `expression` is guaranteed present: it's a required (non-optional) group in this rule's syntax.
            args: [match.groups.expression!.AST as AST.Expression]
          })
          if (operator && typeof operator.value === "string" && operator.value.includes("no")) {
            return new AST.NotExpression(match, { expression })
          }
          return expression
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("thing")
            scope.variables?.add("animal")
          },
          tests: [
            { input: "there is a thing", output: "spellCore.isDefined(thing)" },
            { input: "there is an animal", output: "spellCore.isDefined(animal)" },
            { input: "there is not a thing", output: "!spellCore.isDefined(thing)" },
            { input: "there is no such animal", output: "!spellCore.isDefined(animal)" }
          ]
        }
      ]
    },

    /**
     * `{lhs} is [not] empty` postfix, e.g. `thing is empty`.
     * - Compiles to `spellCore.isEmpty(lhs)`, negated for `is not empty`.
     */
    {
      name: "is_empty",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:is not? empty)",
      constructor: class is_empty extends PostfixOperatorSuffix {
        shouldNegateOutput(operator: P.Match): boolean {
          return typeof operator.value === "string" && operator.value.includes("not")
        }
        compileASTExpression(match: P.Match, { lhs }: OperatorOperands): AST.CoreMethodInvocation {
          return new AST.CoreMethodInvocation(match, {
            methodName: "isEmpty",
            args: [lhs!]
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("thing")
          },
          tests: [
            ["thing is empty", "spellCore.isEmpty(thing)"],
            ["thing is not empty", "!spellCore.isEmpty(thing)"]
          ]
        }
      ]
    },

    ////////////////
    // ## String utilities
    ////////////////

    /** `as upper case`/`uppercase` postfix, e.g. `"foo" as upper case` -- compiles to `spellCore.upperCase(lhs)`. */
    {
      name: "as_uppercase",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "as (upper case|uppercase)",
      constructor: class as_uppercase extends PostfixOperatorSuffix {
        compileASTExpression(match: P.Match, { lhs }: OperatorOperands): AST.CoreMethodInvocation {
          return new AST.CoreMethodInvocation(match, {
            methodName: "upperCase",
            args: [lhs!]
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          tests: [
            [`"foo" as upper case`, `spellCore.upperCase("foo")`],
            [`1 as uppercase`, `spellCore.upperCase(1)`]
          ]
        }
      ]
    },
    /** `as lower case`/`lowercase` postfix, e.g. `"foo" as lower case` -- compiles to `spellCore.lowerCase(lhs)`. */
    {
      name: "as_lowercase",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "as (lower case|lowercase)",
      constructor: class as_lowercase extends PostfixOperatorSuffix {
        compileASTExpression(match: P.Match, { lhs }: OperatorOperands): AST.CoreMethodInvocation {
          return new AST.CoreMethodInvocation(match, {
            methodName: "lowerCase",
            args: [lhs!]
          })
        }
      },
      tests: [
        {
          compileAs: "expression",
          tests: [
            [`"foo" as lower case`, `spellCore.lowerCase("foo")`],
            [`1 as lowercase`, `spellCore.lowerCase(1)`]
          ]
        }
      ]
    },

    /**
     * `as a`/`an {type}`, e.g. `1 as a string`, `1.4 as an integer` -- casts value to `string`/`number`/
     * `fraction`/`integer`/`text`.
     * - `string`/`text` wrap output in a template-literal `${...}` via `BackTickExpression`.
     * - `number`/`fraction` compile to `parseFloat()`, `integer` to `parseInt()`.
     */
    {
      name: "as_a_type",
      alias: "expression_suffix",
      precedence: 11,
      syntax: ["as (a|an) (type:string|number|fraction|integer)", "as (type:text)"],
      // es: "como (un|una) (type:cadena|numero|fracción|entero)"
      description: "Convert a value to a specific type, e.g. an integer.",
      constructor: class as_a_type extends PostfixOperatorSuffix {
        compileASTExpression(
          match: P.Match<P.RulexGroups<"type">>,
          { lhs }: OperatorOperands
        ): AST.BackTickExpression | AST.MethodInvocation {
          // `type` is guaranteed present: it's a required (non-optional) group in this rule's syntax.
          const type = match.groups.type!.value
          if (type === "string" || type === "text") {
            // Wrap the expression in backticks to convert it to a string.
            // Output is something like: "`${EXPRESSION_VALUE}`"
            return new AST.BackTickExpression(match, {
              expression: new AST.BacktickSubstitution(match, { expression: lhs! })
            })
          } else {
            // Output will be e.g. `parseFloat(EXPRESSION_VALUE)`
            const methodName = type === "integer" ? "parseInt" : "parseFloat"
            return new AST.MethodInvocation(match, {
              methodName,
              args: [lhs!]
            })
          }
        }
      },
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
    }
  ]
})
