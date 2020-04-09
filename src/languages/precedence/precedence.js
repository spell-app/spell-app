//
// # Super simple language for understanding precedence and recursion with expressions.
//
//  Secret seems to be:
//  - Any recursive expression is ONLY looking for a non-recursive expression,
//      e.g. `the {identifier} of {single_expression}`
//
//  - UNLESS it is deliberately "resetting the rules",
//      e.g. `\\( {expression} \\)`
//
//  - Only have ONE compound_expression (for efficiency) as:
//      e.g.  `{rhs:single_expression} {lhs:expression_suffix}+`
//
//  - Infix operators: `<expression> is <expression>`
//    or Postfix ops:  `<expression> is empty`
//    are `expression_suffix` entities
//    and will get a `compileOperator({ lhs, operator?, rhs})` call to combine the bits.
//
//    Note that they should be structured like:
//        `(operator:and) {expression:single_expression}`    (infix operators)
//    or
//        `is not? empty`  (postfix operators)
//

// TODO: shunting-yard algorithm.  May be cleaner to do `infix_operator` vs `and_expression`?
// TODO: is it really `non_operator_expression` ???
// TODO: test repeating lists, `\\[ [{expression},] \\]`
// TODO: test `the number of {identifer} in {single_expression}

import { Parser, Rule, Tokenizer, Token, WhitespacePolicy, peek } from "../../parser/all"

const parser = new Parser({
  module: "precedence",
  defaultRule: "expression",
  tokenizer: new Tokenizer({
    whitespacePolicy: WhitespacePolicy.LEADING_ONLY
  }),
  rules: [
    //----------------------------
    //  Non-expressiony words
    {
      name: "identifier",
      pattern: /^[a-z][\w\-]*$/,
      blacklist: {
        the: 1,
        of: 1,
        and: 1,
        or: 1,
        is: 1,
        up: 1, // NOTE: defined as a `constant` below
        down: 1 // NOTE: defined as a `constant` below
      }
    },

    //----------------------------
    // Normal, productive expressions
    {
      name: "parenthesized_expression",
      alias: ["expression", "single_expression"],
      syntax: "\\( {expression} \\)",
      compile(match) {
        const { expression } = match.results
        // Don't double-up parens
        if (expression.startsWith?.("(") && expression.endsWith(")")) return expression
        return `(${expression})`
      }
    },

    {
      name: "number",
      alias: ["expression", "single_expression"],
      tokenType: Token.Number
    },

    {
      name: "identifier_expression",
      alias: ["expression", "single_expression"],
      syntax: "the? {identifier}",
      compile(match) {
        return match.results.identifier
      }
    },

    {
      name: "property_expression",
      alias: ["expression", "single_expression"],
      precedence: 11,
      syntax: "the {identifier} of {expression:single_expression}",
      compile(match) {
        const { identifier, expression } = match.results
        return `${expression}.${identifier}`
      }
    },

    //----------------------------
    // Generic compound expression
    // Note that it's "lhs" (left-hand side) is a `single_expression`
    {
      name: "compound_expression",
      alias: "expression",
      precedence: 12,
      syntax: "{lhs:single_expression} {rhs:expression_suffix}+",
      compile(match) {
        const { results, matched } = match
        // Iterate through the rhs expressions, using a variant of the shunting-yard algorithm
        //  to deal with operator precedence.  Note that we assume:
        //  - all infix operators are `left-to-right` associative, and
        //  - all postfix operators are postfix operators.
        // See: https://en.wikipedia.org/wiki/Shunting-yard_algorithm
        // See: https://www.chris-j.co.uk/parsing.php
        const output = [results.lhs]
        const opStack = []
        const rhsExpressions = matched[1].matched
        rhsExpressions.forEach(rhsMatch => {
          const rhs = rhsMatch.compile()
          const { rule } = rhsMatch

          // For a unary postfix operator, `rhs` will be the operator text that was matched
          if (typeof rhs === "string") {
            const args = {
              operator: rhs,
              lhs: output.pop()
            }
            const result = this.compileOperator(rule, args)
            output.push(result)
          }
          // If it's a binary operator, `rhs` will be an object: `{ operator?, expression }`
          else {
            const { operator, expression } = rhs
            // While top operator on stack is higher precedence than this one
            while (peek(opStack)?.rule.precedence >= rule.precedence) {
              // pop the top operator and compile it with top 2 things on the output stack
              const { operator: topOperator, rule: topRule } = opStack.pop()
              const args = {
                operator: topOperator,
                rhs: output.pop(),
                lhs: output.pop()
              }
              const result = this.compileOperator(topRule, args)
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
          const result = this.compileOperator(topOp.rule, args)
          output.push(result)
        }
        return output[0]
      },

      compileOperator(rule, args) {
        return rule.compileOperator(args)
      }
    },

    //----------------------------
    // Infix operators
    {
      name: "and_rhs",
      alias: "expression_suffix",
      precedence: 6,
      syntax: "and {expression:single_expression}", // <== results.rhs = { expression }
      compileOperator: ({ lhs, rhs }) => `(${lhs} && ${rhs})`
    },

    {
      name: "or_rhs",
      alias: "expression_suffix",
      precedence: 5,
      syntax: "(operator:or) {expression:single_expression}", // <== results.rhs = { operator: "or", expression }
      compileOperator: ({ lhs, rhs }) => `(${lhs} || ${rhs})`
    },

    {
      name: "is_expression",
      alias: "expression_suffix",
      precedence: 3, // ????
      syntax: "(operator:is not?) {expression:single_expression}", // <== results.rhs = { operator: "is", expression }
      compileOperator({ lhs, operator, rhs }) {
        const op = operator === "is not" ? "!=" : "=="
        return `(${lhs} ${op} ${rhs})`
      }
    },

    //----------------------------
    // Postfix operators
    {
      name: "is_empty",
      precedence: 4, // <== precedence above `is_expression`
      alias: "expression_suffix",
      syntax: "is not? empty", // <== single Keywords, results.rhs = "is empty"
      compileOperator({ lhs, operator }) {
        const bang = operator === "is not empty" ? "!" : ""
        return `${bang}spellCore.isEmpty(${lhs})`
      }
    },

    {
      name: "is_defined",
      precedence: 4, // <== precedence above `is_expression`
      alias: "expression_suffix",
      syntax: "is (defined|undefined|not defined)",
      compileOperator({ lhs, operator }) {
        const op = operator === "is defined" ? "!==" : "==="
        return `(typeof ${lhs} ${op} 'undefined')`
      }
    },

    //----------------------------
    // Constants
    // Add a rule to match constants as expressions.
    {
      name: "constant_identifier",
      alias: ["expression", "single_expression"],
      rule: "constant",
      constructor: Rule.Subrule
    },

    // Add some actual constants
    {
      name: "constant",
      literal: "up",
      compile: () => "'up'"
    },
    {
      name: "constant",
      literal: "down",
      compile: () => "'down'"
    }
  ]
})
export default parser
