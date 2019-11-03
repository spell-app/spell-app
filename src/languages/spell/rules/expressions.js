//
//  # Rules for expressions.
//

import { Rule, Spell, peek } from "../all.js"

export default new Spell.Parser({
  module: "expressions",
  rules: [
    // Parenthesized expression
    {
      name: "parenthesized_expression",
      alias: ["expression", "single_expression"],
      syntax: "\\( {expression} \\)",
      testRule: "\\(",
      compile(scope, match) {
        let { expression } = match.results
        // don't double parens if not necessary
        if (typeof expression === "string" && expression.startsWith("(") && expression.endsWith(")")) return expression
        return "(" + expression + ")"
      },
      tests: [
        {
          title: "correctly matches parenthesized expressions",
          beforeEach(scope) {
            scope.variables.add("thing")
          },
          tests: [["(thing)", "(thing)"], ["((thing))", "(thing)"], ["(1 and yes)", "(1 && true)"]]
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
      syntax: "{lhs:single_expression} {rhs:expression_suffix}+",
      //  testRule: "…{recursive_expression_test}",
      compile(scope, match) {
        const { results, matched } = match
        // Iterate through the rhs expressions, using a variant of the shunting-yard algorithm
        //  to deal with operator precedence.  Note that we assume:
        //  - all infix operators are `left-to-right` associative, and
        //  - all postfix operators are left to right associative.
        // See: https://en.wikipedia.org/wiki/Shunting-yard_algorithm
        // See: https://www.chris-j.co.uk/parsing.php
        const output = [results.lhs]
        const opStack = []
        const rhsExpressions = matched[1].matched
        rhsExpressions.forEach(rhsMatch => {
          const rhs = rhsMatch.compile()
          const rule = rhsMatch.rule
          // For a unary postfix operator, `rhs` will be the operator text that was matched
          if (typeof rhs === "string") {
            const args = {
              operator: rhs,
              lhs: output.pop()
            }
            const result = this.applyOperatorToRule(rule, args, scope)
            output.push(result)
          }
          // If it's a binary operator, `rhs` will be an object: `{ operator?, expression }`
          else {
            const { operator, expression } = rhs
            // While top operator on stack is higher precedence than this one
            while (peek(opStack)?.rule.precedence >= rule.precedence) {
              // pop the top operator and compile it with top 2 things on the output stack
              const { operator, rule: topRule } = opStack.pop()
              const args = {
                operator,
                rhs: output.pop(),
                lhs: output.pop()
              }
              const result = this.applyOperatorToRule(topRule, args, scope)
              // push the result into the output stream
              output.push(result)
            }

            // Push the current operator and expression
            opStack.push({ rule, operator })
            output.push(expression)
          }
        })

        // At this point, we have only binary operators in the stack.
        // Run through them
        let topOp
        while ((topOp = opStack.pop())) {
          const args = {
            operator: topOp.operator,
            rhs: output.pop(),
            lhs: output.pop()
          }
          const result = this.applyOperatorToRule(topOp.rule, args, scope)
          output.push(result)
        }
        return output[0]
      },

      applyOperatorToRule(rule, args, scope) {
        const result = rule.applyOperator(args)
        return result
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
      applyOperator: ({ lhs, rhs }) => `(${lhs} && ${rhs})`,
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
      applyOperator: ({ lhs, rhs }) => `(${lhs} || ${rhs})`,
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
      applyOperator({ lhs, operator, rhs }) {
        const op = operator === "is not" ? "!=" : "=="
        return `(${lhs} ${op} ${rhs})`
      },
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
      applyOperator({ lhs, operator, rhs }) {
        const op = operator === "is not exactly" ? "!==" : "==="
        return `(${lhs} ${op} ${rhs})`
      },
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
      applyOperator({ lhs, operator, rhs }) {
        const bang = operator.includes("not") ? "!" : ""
        return `${bang}spell.isOfType(${lhs}, '${rhs}')`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
          },
          tests: [
            ["thing is a Bee", "spell.isOfType(thing, 'Bee')"],
            ["thing is an Animal", "spell.isOfType(thing, 'Animal')"],
            ["thing is not a Bee", "!spell.isOfType(thing, 'Bee')"],
            ["thing is not an Animal", "!spell.isOfType(thing, 'Animal')"]
          ]
        }
      ]
    },

    {
      name: "is_same_type_as",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:is not? the same type as) {expression:single_expression}",
      applyOperator({ lhs, operator, rhs }) {
        const op = operator.includes("not") ? "!==" : "==="
        return `(spell.typeOf(${lhs}) ${op} spell.typeOf(${rhs}))`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
            scope.variables.add("other")
          },
          tests: [
            ["thing is the same type as other", "(spell.typeOf(thing) === spell.typeOf(other))"],
            ["thing is not the same type as other", "(spell.typeOf(thing) !== spell.typeOf(other))"]
          ]
        }
      ]
    },

    {
      name: "is_in_operator",
      syntax: "is (not? in|not? one of|either|not either of?|neither)",
      constructor: Rule.LiteralSequence
    },

    {
      name: "is_in",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "{operator:is_in_operator} (expression:{single_expression}|{identifier_list})",
      applyOperator({ lhs, operator, rhs }) {
        if (Array.isArray(rhs)) rhs = `[${rhs.join(", ")}]`
        const bang = operator.includes("not") || operator.includes("neither") ? "!" : ""
        return `${bang}spell.includes(${rhs}, ${lhs})`
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
            ["thing is in theList", "spell.includes(theList, thing)"],
            ["thing is one of theList", "spell.includes(theList, thing)"],
            ["thing is not in theList", "!spell.includes(theList, thing)"],
            ["thing is not one of theList", "!spell.includes(theList, thing)"],
            ["thing is either red or green", "spell.includes([red, 'green'], thing)"],
            ["thing is not either red or green", "!spell.includes([red, 'green'], thing)"],
            ["thing is not either of red or green", "!spell.includes([red, 'green'], thing)"],
            ["thing is neither red nor green", "!spell.includes([red, 'green'], thing)"]
          ]
        }
      ]
    },

    {
      name: "includes",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:includes|contains) {expression:single_expression}",
      applyOperator({ lhs, rhs }) {
        if (Array.isArray(lhs)) lhs = `[${lhs.join(", ")}]`
        return `spell.includes(${lhs}, ${rhs})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("theList")
            scope.variables.add("thing")
          },
          tests: [
            ["theList includes thing", "spell.includes(theList, thing)"],
            ["theList contains thing", "spell.includes(theList, thing)"]
          ]
        }
      ]
    },

    {
      name: "does_not_include",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:does not (include|contain)) {expression:single_expression}",
      applyOperator({ lhs, rhs }) {
        if (Array.isArray(lhs)) lhs = `[${lhs.join(", ")}]`
        return `!spell.includes(${lhs}, ${rhs})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("theList")
            scope.variables.add("thing")
          },
          tests: [
            ["theList does not include thing", "!spell.includes(theList, thing)"],
            ["theList does not contain thing", "!spell.includes(theList, thing)"]
          ]
        }
      ]
    },

    {
      name: "is_defined",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "is (defined|undefined|not defined)",
      constructor: Rule.LiteralSequence,
      applyOperator({ lhs, operator }) {
        const op = operator === "is defined" ? "!==" : "==="
        return `(typeof ${lhs} ${op} 'undefined')`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
          },
          tests: [
            ["thing is defined", "(typeof thing !== 'undefined')"],
            ["thing is undefined", "(typeof thing === 'undefined')"],
            ["thing is not defined", "(typeof thing === 'undefined')"]
          ]
        }
      ]
    },

    {
      name: "is_empty",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "is not? empty",
      applyOperator({ lhs, operator }) {
        const bang = operator.includes("not") ? "!" : ""
        return `${bang}spell.isEmpty(${lhs})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("thing")
          },
          tests: [["thing is empty", "spell.isEmpty(thing)"], ["thing is not empty", "!spell.isEmpty(thing)"]]
        }
      ]
    }
  ]
})
