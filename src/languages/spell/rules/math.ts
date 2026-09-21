/**
 * Rules for math-y bits -- comparison operators (`<`, `is greater than`), arithmetic operators
 * (`plus`, `times`, ...), and standalone math functions (`absolute value`, `max`/`min`, `round`).
 * - NOTE: this must come after "operators".
 */

import { proto } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellExpression, InfixOperatorSuffix } from "./expressions"

/**
 * Narrow `node` to concrete AST subclass `T`.
 * - `Match.AST` is typed generically as `ASTNode | undefined`; this asserts the referenced sub-rule's
 *   `getAST()` is known (by inspection) to always produce `T`, since that's not statically checkable here.
 */
function ast<T extends P.ASTNode>(node: P.ASTNode | undefined): T {
  return node as T
}

/**
 * `<`, `>`, `<=`, `>=` comparison, e.g. `salary > expenses`.
 * - NOTE: output of `operator` will NOT have space between `>=`.
 * - `getAST()` below looks unreachable in practice: `InfixOperatorSuffix.getAST()` deliberately
 *   throws, and `compound_expression`'s shunting-yard calls `compileAST()`/`compileASTExpression()`
 *   directly on matched suffix rules, never `getAST()`.
 *   TODO: confirm this is genuinely dead code, and if so remove it.
 */
export class gt_lt extends InfixOperatorSuffix<"operator|expression"> {
  @proto static alias = "expression_suffix"
  @proto static precedence = 11
  @proto static syntax = "(operator:(<|>) =?) {expression:simple_expression}"
  @proto static parenthesize = true

  getAST(match: P.MatchFor<this>) {
    const { operator, expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: operator.value,
      args: [ast<P.ASTExpression>(expression.AST)]
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("salary")
        scope.variables?.add("expenses")
      },
      tests: [
        { title: "> with spaces", input: "salary > expenses", output: "(salary > expenses)" },
        { title: "> without spaces", input: "salary>expenses", output: "(salary > expenses)" },

        { title: "< with spaces", input: "salary < expenses", output: "(salary < expenses)" },
        { title: "< without spaces", input: "salary<expenses", output: "(salary < expenses)" },

        { title: ">= with spaces", input: "salary >= expenses", output: "(salary >= expenses)" },
        { title: ">= without spaces", input: "salary>=expenses", output: "(salary >= expenses)" },

        { title: "<= with spaces", input: "salary <= expenses", output: "(salary <= expenses)" },
        { title: "<= without spaces", input: "salary<=expenses", output: "(salary <= expenses)" }
      ]
    }
  ]
}

/**
 * `is greater than`, `is less than`, optionally `... or equal to`, e.g. `salary is greater than expenses`.
 * - TODO: is *not* greater than???
 * - `getOutputOperator()` maps `greater`/`less` + optional `equal` to `>`/`<`/`>=`/`<=`.
 * - `getAST()` below looks unreachable in practice, same as `gt_lt` above -- see `TODO` there.
 */
export class is_gt_lt extends InfixOperatorSuffix<"operator|expression"> {
  @proto static alias = "expression_suffix"
  @proto static precedence = 11
  @proto static syntax = "(operator:is (greater|less) than (or equal to)?) {expression:simple_expression}"
  @proto static parenthesize = true

  getOutputOperator({ value }: P.Match) {
    return (value.includes("greater") ? ">" : "<") + (value.includes("equal") ? "=" : "")
  }
  getAST(match: P.MatchFor<this>) {
    const { operator, expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: operator.value,
      args: [ast<P.ASTExpression>(expression.AST)]
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("salary")
        scope.variables?.add("expenses")
      },
      tests: [
        ["salary is greater than expenses", "(salary > expenses)"],
        ["salary is greater than or equal to expenses", "(salary >= expenses)"],
        ["salary is less than expenses", "(salary < expenses)"],
        ["salary is less than or equal to expenses", "(salary <= expenses)"]
      ]
    }
  ]
}

/** `plus` / `+`, e.g. `price + tax` -- precedence 13, above comparison operators, below `*`/`/`. */
export class plus extends InfixOperatorSuffix {
  @proto static alias = "expression_suffix"
  @proto static precedence = 13
  @proto static syntax = "(operator:plus|+) {expression:simple_expression}"
  @proto static parenthesize = true

  getOutputOperator() {
    return "+"
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("price")
        scope.variables?.add("tax")
      },
      tests: [
        ["price + tax", "(price + tax)"],
        ["price+tax", "(price + tax)"],
        ["price plus tax", "(price + tax)"]
      ]
    }
  ]
}

/**
 * `minus` / `-`, e.g. `price - tax`.
 * - NOTE: bare `-` requires surrounding spaces -- otherwise it'd clash with negative-number literals,
 *   see commented-out test below.
 */
export class minus extends InfixOperatorSuffix {
  @proto static alias = "expression_suffix"
  @proto static precedence = 13
  @proto static syntax = "(operator:minus|-) {expression:simple_expression}"
  @proto static parenthesize = true

  getOutputOperator() {
    return "-"
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("price")
        scope.variables?.add("tax")
      },
      tests: [
        //        ["price-tax", "(price - tax)"],     // NOTE: `-` requires spaces...
        ["price - tax", "(price - tax)"],
        ["price minus tax", "(price - tax)"]
      ]
    }
  ]
}

/** `*` / `times`, e.g. `price * taxRate` -- precedence 14, highest, alongside `/`. */
export class times extends InfixOperatorSuffix {
  @proto static alias = "expression_suffix"
  @proto static precedence = 14
  @proto static syntax = "(operator:*|times) {expression:simple_expression}"
  @proto static parenthesize = true

  getOutputOperator() {
    return "*"
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("price")
        scope.variables?.add("taxRate")
      },
      tests: [
        ["price*taxRate", "(price * taxRate)"],
        ["price * taxRate", "(price * taxRate)"],
        ["price times taxRate", "(price * taxRate)"]
      ]
    }
  ]
}

/** `/` / `divided by`, e.g. `price / taxRate` -- precedence 14, same as `*`. */
export class divided_by extends InfixOperatorSuffix {
  @proto static alias = "expression_suffix"
  @proto static precedence = 14
  @proto static syntax = "(operator:/|divided by) {expression:simple_expression}"
  @proto static parenthesize = true

  getOutputOperator() {
    return "/"
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("price")
        scope.variables?.add("taxRate")
      },
      tests: [
        ["price/taxRate", "(price / taxRate)"],
        ["price / taxRate", "(price / taxRate)"],
        ["price divided by taxRate", "(price / taxRate)"]
      ]
    }
  ]
}

////////////////
// ## Random math functions
////////////////

/**
 * `the absolute value of {expression}`.
 * - `testRule: "…absolute"` lets shunting-yard test for `absolute` occurring anywhere, not just at start.
 */
export class absolute_value extends SpellExpression<"operator|expression"> {
  @proto static alias = "expression"
  @proto static syntax = "(operator:the? absolute value of) {expression}"
  @proto static testRule = "…absolute"

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      datatype: "number",
      methodName: "absoluteValue", // TODO: implement in spellCore
      args: [ast<P.ASTExpression>(expression.AST)]
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("difference")
      },
      tests: [["the absolute value of the difference", "spellCore.absoluteValue(difference)"]]
    }
  ]
}

/**
 * `the biggest`/`largest` [thing] `of`/`in` {expression}, e.g. `largest of the prices`.
 * - `precedence: 2` is low, so this only wins over other `expression` alternatives when nothing more
 *   specific already claimed the tokens.
 */
export class max extends SpellExpression<"operator|argument?|expression"> {
  @proto static alias = "expression"
  @proto static precedence = 2
  @proto static syntax = "(operator:the? (biggest|largest)) {argument:singular_variable}? (of|in) {expression}"
  @proto static testRule = "…(biggest|largest)"

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      datatype: "number",
      methodName: "largestOf",
      args: [ast<P.ASTExpression>(expression.AST)]
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("prices")
        scope.variables?.add("price")
      },
      tests: [
        ["largest of the prices", "spellCore.largestOf(prices)"],
        ["biggest in prices", "spellCore.largestOf(prices)"],
        ["the biggest number in prices", "spellCore.largestOf(prices)"]
      ]
    }
  ]
}

/**
 * `the smallest` [thing] `of`/`in` {expression}, e.g. `smallest of prices`.
 * - `precedence: 2`, same reasoning as `max` above.
 */
export class min extends SpellExpression<"operator|argument?|expression"> {
  @proto static alias = "expression"
  @proto static precedence = 2
  @proto static syntax = "(operator:the? smallest) {argument:singular_variable}? (of|in) {expression}"
  @proto static testRule = "…smallest"

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      datatype: "number",
      methodName: "smallestOf",
      args: [ast<P.ASTExpression>(expression.AST)]
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("prices")
      },
      tests: [
        ["smallest of prices", "spellCore.smallestOf(prices)"],
        ["smallest value in prices", "spellCore.smallestOf(prices)"]
      ]
    }
  ]
}

/**
 * `round {expression}`, optionally `off`/`up`/`down`, e.g. `round price up`.
 * - TODO: precision:  to the nearest tenth ?
 * - `precedence: 1`, lowest of the `expression` alternatives here.
 */
export class round_number extends SpellExpression<"expression|operator?"> {
  @proto static alias = "expression"
  @proto static syntax = "round {expression} (operator:off|up|down)?"
  @proto static testRule = "round"
  @proto static precedence = 1

  /** Maps `off`/`up`/`down` suffix to `round`/`roundUp`/`roundDown` spellCore method. */
  getAST(match: P.MatchFor<this>) {
    const { expression, operator } = match.groups
    let methodName = "round"
    if (operator?.value === "up") methodName = "roundUp"
    else if (operator?.value === "down") methodName = "roundDown"
    return new P.ASTCoreMethodInvocation(match, {
      datatype: "number",
      methodName, // TODO: implement in spellCore
      args: [ast<P.ASTExpression>(expression.AST)]
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("price")
      },
      tests: [
        ["round price", "spellCore.round(price)"],
        ["round price off", "spellCore.round(price)"],
        ["round price up", "spellCore.roundUp(price)"],
        ["round price down", "spellCore.roundDown(price)"]
      ]
    }
  ]
}

export const math = new SpellParser({
  module: "math",
  rules: [gt_lt, is_gt_lt, plus, minus, times, divided_by, absolute_value, max, min, round_number]
})
