/**
 * Rules for math-y bits -- comparison operators (`<`, `is greater than`), arithmetic operators
 * (`plus`, `times`, ...), and standalone math functions (`absolute value`, `max`/`min`, `round`).
 * - NOTE: this must come after "operators".
 */

import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { SpellExpression, InfixOperatorSuffix, Precedence } from "./expressions"

/**
 * Rule module for math rules (comparison/arithmetic operators, standalone math functions).
 * - Each rule class below is followed by the `math.addRule()` call which defines and registers it.
 */
export const math = new SpellParser({ module: "math" })

////////////////
// ## `gt_lt` rule
//    e.g. "salary > expenses"
////////////////

/**
 * `<`, `>`, `<=`, `>=` comparison, e.g. `salary > expenses`.
 * - NOTE: output of `operator` will NOT have space between `>=`.
 * - `getAST()` below looks unreachable in practice: `InfixOperatorSuffix.getAST()` deliberately
 *   throws, and `compound_expression`'s shunting-yard calls `compileAST()`/`compileASTExpression()`
 *   directly on matched suffix rules, never `getAST()`.
 *   TODO: confirm this is genuinely dead code, and if so remove it.
 */
class gt_lt extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison
  @proto static parenthesize = true

  getAST(match: P.MatchFor<this>) {
    const { operator, expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: operator.value,
      args: [P.asAST<P.ASTExpression>(expression.AST)]
    })
  }
}
math.addRule(gt_lt, {
  syntax: "(operator:(<|>) =?) {expression:operand}",
  tests: [
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
})

////////////////
// ## `is_gt_lt` rule
//    e.g. "salary is greater than expenses"
////////////////

/**
 * `is greater than`, `is less than`, optionally `... or equal to`, e.g. `salary is greater than expenses`.
 * - TODO: is *not* greater than???
 * - `getOutputOperator()` maps `greater`/`less` + optional `equal` to `>`/`<`/`>=`/`<=`.
 * - `getAST()` below looks unreachable in practice, same as `gt_lt` above -- see `TODO` there.
 */
class is_gt_lt extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison
  @proto static parenthesize = true

  getOutputOperator({ value }: P.Match) {
    return (value.includes("greater") ? ">" : "<") + (value.includes("equal") ? "=" : "")
  }
  getAST(match: P.MatchFor<this>) {
    const { operator, expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: operator.value,
      args: [P.asAST<P.ASTExpression>(expression.AST)]
    })
  }
}
math.addRule(is_gt_lt, {
  syntax: "(operator:is (greater|less) than (or equal to)?) {expression:operand}",
  tests: [
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
})

////////////////
// ## `plus` rule
//    e.g. "price + tax"
////////////////

/** `plus` / `+`, e.g. `price + tax` -- `Precedence.sum`:  tighter than comparisons, looser than `*` `/`. */
class plus extends InfixOperatorSuffix {
  @proto static precedence = Precedence.sum
  @proto static parenthesize = true

  /**
   * `text` if either side is text -- javascript joins them -- `number` if both are numbers, else unknown:
   *   `x + y` might be either.
   */
  getResultDatatype(
    match: P.MatchFor<this>,
    lhs: P.Datatype | undefined,
    rhs: P.Datatype | undefined
  ): P.Datatype | undefined {
    if (isTextual(lhs) || isTextual(rhs)) return "text"
    if (isNumeric(lhs) && isNumeric(rhs)) return "number"
    return undefined
  }

  getOutputOperator() {
    return "+"
  }
}
math.addRule(plus, {
  syntax: "(operator:plus|+) {expression:operand}",
  tests: [
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
})

////////////////
// ## `minus` rule
//    e.g. "price - tax"
////////////////

/**
 * `minus` / `-`, e.g. `price - tax`.
 * - NOTE: bare `-` requires surrounding spaces -- otherwise it'd clash with negative-number literals,
 *   see commented-out test below.
 */
class minus extends InfixOperatorSuffix {
  @proto static precedence = Precedence.sum
  @proto static parenthesize = true
  @proto static datatype = "number"

  getOutputOperator() {
    return "-"
  }
}
math.addRule(minus, {
  syntax: "(operator:minus|-) {expression:operand}",
  tests: [
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
})

////////////////
// ## `times` rule
//    e.g. "price*taxRate"
////////////////

/** `*` / `times`, e.g. `price * taxRate` -- `Precedence.product`, tightest, alongside `/`. */
class times extends InfixOperatorSuffix {
  @proto static precedence = Precedence.product
  @proto static parenthesize = true
  @proto static datatype = "number"

  getOutputOperator() {
    return "*"
  }
}
math.addRule(times, {
  syntax: "(operator:*|times) {expression:operand}",
  tests: [
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
})

////////////////
// ## `divided_by` rule
//    e.g. "price/taxRate"
////////////////

/** `/` / `divided by`, e.g. `price / taxRate` -- `Precedence.product`, same as `*`. */
class divided_by extends InfixOperatorSuffix {
  @proto static precedence = Precedence.product
  @proto static parenthesize = true
  @proto static datatype = "number"

  getOutputOperator() {
    return "/"
  }
}
math.addRule(divided_by, {
  syntax: "(operator:/|divided by) {expression:operand}",
  tests: [
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
})

////////////////
// ## Random math functions
////////////////

////////////////////////////////////////
// # Random math functions
////////////////////////////////////////

////////////////
// ## `absolute_value` rule
//    e.g. "the absolute value of the difference"
////////////////

/**
 * `the absolute value of {expression}`.
 * - Takes a sum, like `|x + 1|`, but stops before a comparison (`arithmetic_expression`):
 *   `the absolute value of x + 1 is 3` => `absoluteValue(x + 1) == 3`.
 */
class absolute_value extends SpellExpression<"operator|expression"> {
  @proto static datatype = "number"

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      datatype: "number",
      methodName: "absoluteValue", // TODO: implement in spellCore
      args: [P.asAST<P.ASTExpression>(expression.AST)]
    })
  }
}
math.addRule(absolute_value, {
  syntax: "(operator:the? absolute value of) {expression:arithmetic_expression}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("difference")
      },
      tests: [["the absolute value of the difference", "spellCore.absoluteValue(difference)"]]
    }
  ]
})

////////////////
// ## `max` rule
//    e.g. "largest of the prices"
////////////////

/**
 * `the biggest`/`largest` [thing] `of`/`in` {expression}, e.g. `largest of the prices`.
 * - `priority: 2` beats `the biggest of x` read as a property (`property_expression`).
 */
class max extends SpellExpression<"operator|argument?|expression"> {
  @proto static priority = 2
  @proto static datatype = "number"

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      datatype: "number",
      methodName: "largestOf",
      args: [P.asAST<P.ASTExpression>(expression.AST)]
    })
  }
}
math.addRule(max, {
  syntax: "(operator:the? (biggest|largest)) {argument:singular_identifier}? (of|in) {expression:operand}",
  tests: [
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
})

////////////////
// ## `min` rule
//    e.g. "smallest of prices"
////////////////

/**
 * `the smallest` [thing] `of`/`in` {expression}, e.g. `smallest of prices`.
 * - `priority: 2`, same reasoning as `max` above.
 */
class min extends SpellExpression<"operator|argument?|expression"> {
  @proto static priority = 2
  @proto static datatype = "number"

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      datatype: "number",
      methodName: "smallestOf",
      args: [P.asAST<P.ASTExpression>(expression.AST)]
    })
  }
}
math.addRule(min, {
  syntax: "(operator:the? smallest) {argument:singular_identifier}? (of|in) {expression:operand}",
  tests: [
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
})

////////////////
// ## `round_number` rule
//    e.g. "round price"
////////////////

/**
 * `round {expression}`, optionally `off`/`up`/`down`, e.g. `round price up`.
 * - TODO: precision:  to the nearest tenth ?
 * - `priority: 1`, lowest of the `expression` alternatives here.
 */
class round_number extends SpellExpression<"expression|operator?"> {
  @proto static priority = 1
  @proto static datatype = "number"

  /** Maps `off`/`up`/`down` suffix to `round`/`roundUp`/`roundDown` spellCore method. */
  getAST(match: P.MatchFor<this>) {
    const { expression, operator } = match.groups
    let methodName = "round"
    if (operator?.value === "up") methodName = "roundUp"
    else if (operator?.value === "down") methodName = "roundDown"
    return new P.ASTCoreMethodInvocation(match, {
      datatype: "number",
      methodName, // TODO: implement in spellCore
      args: [P.asAST<P.ASTExpression>(expression.AST)]
    })
  }
}
math.addRule(round_number, {
  syntax: "round {expression:arithmetic_expression} (operator:off|up|down)?",
  tests: [
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
})

////////////////
// ## Shared helpers
////////////////

/** Is `datatype` text, or one character of it? */
function isTextual(datatype: P.Datatype | undefined): boolean {
  return datatype === "text" || datatype === "character"
}

/** Is `datatype` a number, or an integer? */
function isNumeric(datatype: P.Datatype | undefined): boolean {
  return datatype === "number" || datatype === "integer"
}
