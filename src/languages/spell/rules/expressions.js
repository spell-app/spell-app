//
//  # Rules for expressions.
//

import { AST, Match, Rule, Spell, peek, proto } from "../all"

/** TODOC!!! */
Spell.Rule.InfixOperatorSuffix = class infix_operator extends Rule.Sequence {
  // set `outputDatatype` to specify explicit datatype in standard `toAST()`

  /** If `true`, we'll wrap output expression in parenthesis. */
  @proto parenthesize = false

  /** Return output operator from `operator` match. Override for more complex logic.
   * TODO: this is language-dependent!
   */
  getOutputOperator(operator) {
    // Default to just use input string
    return operator.value
  }

  /** Return `true` if we should "negate" the output expression based on `operator`.
   * TODO: this is language-dependent!
   */
  shouldNegateOutput(operator) {
    return false
  }

  /**
   * - `lhs` is left-hand side AST
   * - `operator` is operator Match
   * - `rhs` is right-hand-side AST
   * By default does an InfixExpression, override to e.g. do a CoreMethodInvocation()
   */
  compileASTExpression(scope, match, { lhs, operator, rhs }) {
    return new AST.InfixExpression(scope, match, {
      lhs,
      operator: this.getOutputOperator(operator),
      rhs
    })
  }

  /**
   * While running the "shunting yard algorithm" in toAST(), we'll match
   * `Infix-` and `PostfixOperatorSuffix` instances with args on left/right side.
   * This routine delegates to rule-specific `compileASTExpression()` to actually output
   * the particular AST for the rule.
   *
   * This routine also handles adding parenthesis and negating the output for you automatically.
   *
   * `lhs` is the left-hand-side Match AST (NOTE: already AST calculated!)
   * `operator` is the operator Match
   * `rhs` (for InfixOperatorSuffixes only) is the right-hand-side Match AST.
   */
  compileAST(scope, match, { operator, rhs, lhs }) {
    let expression = this.compileASTExpression(scope, match, { lhs, operator, rhs })
    if (this.parenthesize && !(expression instanceof AST.ParenthesizedExpression)) {
      expression = new AST.ParenthesizedExpression(scope, match, { expression })
    }
    if (this.shouldNegateOutput(operator)) expression = new AST.NotExpression(scope, match, { expression })
    return expression
  }

  toAST() {
    throw new TypeError("This should never be called")
  }
}

/** TODOC!!! */
Spell.Rule.PostfixOperatorSuffix = class postfix_operator extends Spell.Rule.InfixOperatorSuffix {
  /**
   * - `lhs` is left-hand side match
   * - `operator` is raw full input operator string
   */
  compileASTExpression(scope, match, { lhs, operator }) {
    throw new TypeError("Must implement compileASTExpression()")
  }
}

export default new Spell.Parser({
  module: "expressions",
  rules: [
    {
      name: "parenthesized_expression",
      alias: ["expression", "single_expression"],
      syntax: "\\( {expression} \\)",
      testRule: "\\(",
      toAST(scope, match) {
        const { expression } = match.groups
        return new AST.ParenthesizedExpression(scope, match, {
          expression: expression.AST
        })
      },
      tests: [
        {
          title: "correctly matches parenthesized expressions",
          beforeEach(scope) {
            scope.variables.add("thing")
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
          tests: [["(foo", undefined], ["(foo(bar)baz", undefined]]
        }
      ]
    },

    {
      name: "compound_expression",
      alias: "expression",
      precedence: 12,
      syntax: "{lhs:single_expression} {rhsChain:expression_suffix}+",
      toAST(scope, match) {
        function applyOperatorToRule({ match: ruleMatch, operator, rhs, lhs }) {
          function compile(thing) {
            if (!thing) return undefined
            // TODO: we have one case ("is the queen of spades") where `thing` match is an array... :-(
            if (Array.isArray(thing)) return thing.map(compile)
            if (thing instanceof Match && thing.rule.toAST) return thing.AST
            return thing
          }

          const args = {
            operator,
            rhs: compile(rhs),
            lhs: compile(lhs)
          }
          const result = ruleMatch.rule.compileAST(ruleMatch.scope, ruleMatch, args)
          return result
        }

        // Iterate through the rhs expressions, using a variant of the shunting-yard algorithm
        //  to deal with operator precedence.  Note that we assume:
        //  - all infix operators are `left-to-right` associative, and
        //  - all postfix operators are left to right associative.
        // See: https://en.wikipedia.org/wiki/Shunting-yard_algorithm
        // See: https://www.chris-j.co.uk/parsing.php
        const { lhs, rhsChain } = match.groups
        const output = [lhs]
        const opStack = []
        rhsChain.matched.forEach(rhs => {
          // Unary postfix operator, e.g. "<lhs> is empty"
          if (rhs.rule instanceof Spell.Rule.PostfixOperatorSuffix) {
            const args = {
              match: rhs,
              lhs: output.pop(),
              // use explicit operator if there is one, default to entire match
              operator: rhs.groups.operator || rhs
            }
            output.push(applyOperatorToRule(args))
          }
          // Infix binary operator, e.g. "<lhs> is a <rhs>"
          else if (rhs.rule instanceof Spell.Rule.InfixOperatorSuffix) {
            const { operator, expression } = rhs.groups

            // While top operator on stack is higher precedence than this one
            while (peek(opStack)?.match.rule.precedence >= rhs.rule.precedence) {
              // pop the top operator and compile it with top 2 things on the output stack
              const topOp = opStack.pop()
              const args = {
                ...topOp,
                rhs: output.pop(), // NOTE: order is vital here!
                lhs: output.pop()
              }
              output.push(applyOperatorToRule(args))
            }

            // Push the current operator and expression
            opStack.push({ match: rhs, operator })
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
        return output[0]
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
            scope.variables.add("card")
          },
          tests: [["the suit of the card is 'ace'", "(card.suit == 'ace')"]]
        }
      ]
    },

    {
      name: "and",
      alias: "expression_suffix",
      syntax: "(operator:and) {expression:single_expression}",
      precedence: 6,
      constructor: Spell.Rule.InfixOperatorSuffix,
      getOutputOperator: () => "&&",
      parenthesize: true,
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
            scope.variables.add("other")
            scope.variables.add("yet-another")
          },
          tests: [
            ["thing and other", "(thing && other)"],
            ["thing and other and yet-another", "((thing && other) && yet_another)"],
            ["thing is 1 and other is 2", "((thing == 1) && (other == 2))"]
          ]
        }
      ]
    },

    {
      name: "or",
      alias: "expression_suffix",
      syntax: "(operator:or) {expression:single_expression}",
      precedence: 5,
      constructor: Spell.Rule.InfixOperatorSuffix,
      getOutputOperator: () => "||",
      parenthesize: true,
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
            scope.variables.add("other")
          },
          tests: [["thing or other", "(thing || other)"]]
        }
      ]
    },

    {
      name: "is",
      alias: "expression_suffix",
      precedence: 10,
      syntax: "(operator:is not?) {expression:single_expression}",
      constructor: Spell.Rule.InfixOperatorSuffix,
      parenthesize: true,
      getOutputOperator: operator => (operator.value === "is not" ? "!=" : "=="),
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
            scope.variables.add("other")
          },
          tests: [["thing is other", "(thing == other)"], ["thing is not other", "(thing != other)"]]
        }
      ]
    },

    {
      name: "is_exactly",
      alias: "expression_suffix",
      precedence: 10,
      syntax: "(operator:is not? exactly) {expression:single_expression}",
      constructor: Spell.Rule.InfixOperatorSuffix,
      parenthesize: true,
      getOutputOperator: operator => (operator.value === "is not exactly" ? "!==" : "==="),
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
            scope.variables.add("other")
          },
          tests: [["thing is exactly other", "(thing === other)"], ["thing is not exactly other", "(thing !== other)"]]
        }
      ]
    },

    {
      name: "is_a",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:is not? (a|an)) {expression:type}",
      constructor: Spell.Rule.InfixOperatorSuffix,
      shouldNegateOutput: operator => operator.value.includes("not"),
      compileASTExpression(scope, match, { lhs, rhs }) {
        // TODO: QuotedExpression feels wrong here...
        return new AST.CoreMethodInvocation(scope, match, {
          method: "isOfType",
          arguments: [lhs, new AST.QuotedExpression(scope, match, { expression: rhs })]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
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

    {
      name: "is_same_type_as",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:is not? the same type as) {expression:single_expression}",
      constructor: Spell.Rule.InfixOperatorSuffix,
      getOutputOperator: operator => (operator.value.includes("not") ? "!==" : "==="),
      compileASTExpression(scope, match, { lhs, rhs }) {
        return new AST.CoreMethodInvocation(scope, match, {
          method: "matchesType",
          arguments: [lhs, rhs]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
            scope.variables.add("other")
          },
          tests: [
            ["thing is the same type as other", "spellCore.matchesType(thing, other)"],
            ["thing is not the same type as other", "spellCore.matchesType(thing, other)"]
          ]
        }
      ]
    },

    {
      name: "is_in",
      alias: "expression_suffix",
      precedence: 11,
      syntax:
        "(operator:is (not? in|not? one of|either|not either of?|neither)) (expression:{single_expression}|{identifier_list})",
      constructor: Spell.Rule.InfixOperatorSuffix,
      shouldNegateOutput: ({ value }) => value.includes("not") || value.includes("neither"),
      compileASTExpression(scope, match, { lhs, rhs }) {
        return new AST.CoreMethodInvocation(scope, match, {
          method: "includes",
          arguments: [rhs, lhs]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
            scope.variables.add("red")
            scope.constants.add("green")
            scope.variables.add("theList")
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

    {
      name: "includes",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:includes|contains) {expression:single_expression}",
      constructor: Spell.Rule.InfixOperatorSuffix,
      compileASTExpression(scope, match, { lhs, rhs }) {
        return new AST.CoreMethodInvocation(scope, match, {
          method: "includes",
          arguments: [lhs, rhs]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("theList")
            scope.variables.add("thing")
          },
          tests: [
            ["theList includes thing", "spellCore.includes(theList, thing)"],
            ["theList contains thing", "spellCore.includes(theList, thing)"]
          ]
        }
      ]
    },

    {
      name: "does_not_include",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:does not (include|contain)) {expression:single_expression}",
      constructor: Spell.Rule.InfixOperatorSuffix,
      shouldNegateOutput: () => true,
      compileASTExpression(scope, match, { lhs, rhs }) {
        return new AST.CoreMethodInvocation(scope, match, {
          method: "includes",
          arguments: [lhs, rhs]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("theList")
            scope.variables.add("thing")
          },
          tests: [
            ["theList does not include thing", "!spellCore.includes(theList, thing)"],
            ["theList does not contain thing", "!spellCore.includes(theList, thing)"]
          ]
        }
      ]
    },

    {
      name: "is_defined",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "is (defined|undefined|not defined)",
      constructor: Spell.Rule.PostfixOperatorSuffix,
      shouldNegateOutput: operator => operator.value !== "is defined",
      compileASTExpression(scope, match, { lhs, operator }) {
        return new AST.CoreMethodInvocation(scope, match, {
          method: "isDefined",
          arguments: [lhs]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
          },
          tests: [
            ["thing is defined", "spellCore.isDefined(thing)"],
            ["thing is undefined", "!spellCore.isDefined(thing)"],
            ["thing is not defined", "!spellCore.isDefined(thing)"]
          ]
        }
      ]
    },

    /** Collection is empty */
    {
      name: "is_empty",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:is not? empty)",
      constructor: Spell.Rule.PostfixOperatorSuffix,
      shouldNegateOutput: operator => operator.value.includes("not"),
      compileASTExpression(scope, match, { lhs }) {
        return new AST.CoreMethodInvocation(scope, match, {
          method: "isEmpty",
          arguments: [lhs]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
          },
          tests: [["thing is empty", "spellCore.isEmpty(thing)"], ["thing is not empty", "!spellCore.isEmpty(thing)"]]
        }
      ]
    }
  ]
})
