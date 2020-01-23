//
//  # Rules for math-y bits.
//  NOTE: this must come after "operators"
//

import { Spell } from "../all"
import * as AST from "../AST"

export default new Spell.Parser({
  module: "math",
  rules: [
    {
      name: "gt_lt",
      alias: "expression_suffix",
      precedence: 11,
      // NOTE: output of `operator` will NOT have space between `>=`
      syntax: "(operator:(<|>) =?) {expression:single_expression}",
      applyOperator: ({ lhs, operator, rhs }) => `(${lhs} ${operator} ${rhs})`,
      toAST(scope, match) {
        return new AST.InfixExpression(scope, match, {
          datatype: "number",
          lhs: match.lhs.AST,
          operator: match.operator,
          rhs: match.rhs.AST
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("salary")
            scope.variables.add("expenses")
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
    },

    {
      name: "is_gt_lt",
      alias: "expression_suffix",
      precedence: 11,
      // TODO: is *not* greater than???
      syntax: "(operator:is (greater|less) than (or equal to)?) {expression:single_expression}",
      compile(scope, match) {
        return {
          ...match.results,
          operator: match.matched[0].tokens.join(" ")
        }
      },
      applyOperator({ lhs, operator, rhs }) {
        const op = (operator.includes("greater") ? ">" : "<") + (operator.includes("equal") ? "=" : "")
        return `(${lhs} ${op} ${rhs})`
      },
      toAST(scope, match) {
        const baseOperator = match.operator.includes("greater") ? ">" : "<"
        const equalOpereator = match.operator.includes("equal") ? "=" : ""
        return new AST.InfixExpression(scope, match, {
          datatype: "number",
          lhs: match.lhs.AST,
          operator: `${baseOperator}${equalOpereator}`,
          rhs: match.rhs.AST
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("salary")
            scope.variables.add("expenses")
          },
          tests: [
            ["salary is greater than expenses", "(salary > expenses)"],
            ["salary is greater than or equal to expenses", "(salary >= expenses)"],
            ["salary is less than expenses", "(salary < expenses)"],
            ["salary is less than or equal to expenses", "(salary <= expenses)"]
          ]
        }
      ]
    },

    {
      name: "plus",
      alias: "expression_suffix",
      precedence: 13,
      syntax: "(operator:plus|+) {expression:single_expression}",
      applyOperator({ lhs, operator, rhs }) {
        return `(${lhs} + ${rhs})`
      },
      toAST(scope, match) {
        return new AST.InfixExpression(scope, match, {
          datatype: "number", // TODO: handle string case, or mis-matched types???
          lhs: match.lhs.AST,
          operator: "+",
          rhs: match.rhs.AST
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("price")
            scope.variables.add("tax")
          },
          tests: [["price + tax", "(price + tax)"], ["price+tax", "(price + tax)"], ["price plus tax", "(price + tax)"]]
        }
      ]
    },
    {
      name: "minus",
      alias: "expression_suffix",
      precedence: 13,
      syntax: "(operator:minus|-) {expression:single_expression}",
      applyOperator({ lhs, operator, rhs }) {
        return `(${lhs} - ${rhs})`
      },
      toAST(scope, match) {
        return new AST.InfixExpression(scope, match, {
          datatype: "number", // TODO: handle string case, or mis-matched types???
          lhs: match.lhs.AST,
          operator: "-",
          rhs: match.rhs.AST
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("price")
            scope.variables.add("tax")
          },
          tests: [
            //        ["price-tax", "(price - tax)"],     // NOTE: `-` requires spaces...
            ["price - tax", "(price - tax)"],
            ["price minus tax", "(price - tax)"]
          ]
        }
      ]
    },

    {
      name: "times",
      alias: "expression_suffix",
      precedence: 14,
      syntax: "(operator:*|times) {expression:single_expression}",
      applyOperator({ lhs, operator, rhs }) {
        return `(${lhs} * ${rhs})`
      },
      toAST(scope, match) {
        return new AST.InfixExpression(scope, match, {
          datatype: "number",
          lhs: match.lhs.AST,
          operator: "*",
          rhs: match.rhs.AST
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("price")
            scope.variables.add("taxRate")
          },
          tests: [
            ["price*taxRate", "(price * taxRate)"],
            ["price * taxRate", "(price * taxRate)"],
            ["price times taxRate", "(price * taxRate)"]
          ]
        }
      ]
    },
    {
      name: "divided_by",
      alias: "expression_suffix",
      precedence: 14,
      syntax: "(operator:/|divided by) {expression:single_expression}",
      applyOperator({ lhs, operator, rhs }) {
        return `(${lhs} / ${rhs})`
      },
      toAST(scope, match) {
        return new AST.InfixExpression(scope, match, {
          datatype: "number",
          lhs: match.lhs.AST,
          operator: "/",
          rhs: match.rhs.AST
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("price")
            scope.variables.add("taxRate")
          },
          tests: [
            ["price/taxRate", "(price / taxRate)"],
            ["price / taxRate", "(price / taxRate)"],
            ["price divided by taxRate", "(price / taxRate)"]
          ]
        }
      ]
    },
    //
    //  Random math functions
    //

    {
      name: "absolute_value",
      alias: ["expression", "single_expression"],
      syntax: "the? absolute value of {expression}",
      testRule: "…absolute",
      compile(scope, match) {
        const { expression } = match.results
        return `Math.abs(${expression})`
      },
      toAST(scope, match) {
        const { expression } = match.groups
        return new AST.CoreMethodExpression(scope, match, {
          datatype: "number",
          method: "absoluteValue", // TODO: implement in spellCore
          arguments: [expression.AST]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("difference")
          },
          tests: [["the absolute value of the difference", "Math.abs(difference)"]]
        }
      ]
    },

    {
      name: "max",
      alias: ["expression", "single_expression"],
      precedence: 2,
      syntax: "the? (biggest|largest) {argument:singular_variable}? (of|in) {expression}",
      testRule: "…(biggest|largest)",
      compile(scope, match) {
        const { expression } = match.results
        return `spellCore.largestOf(${expression})`
      },
      toAST(scope, match) {
        const { expression } = match.groups
        return new AST.CoreMethodExpression(scope, match, {
          datatype: "number",
          method: "largestOf",
          arguments: [expression.AST]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("prices")
            scope.variables.add("price")
          },
          tests: [
            ["largest of the prices", "spellCore.largestOf(prices)"],
            ["biggest in prices", "spellCore.largestOf(prices)"],
            ["biggest number in prices", "spellCore.largestOf(prices)"]
          ]
        }
      ]
    },

    {
      name: "min",
      alias: ["expression", "single_expression"],
      precedence: 2,
      syntax: "the? smallest {argument:singular_variable}? (of|in) {expression}",
      testRule: "…smallest",
      compile(scope, match) {
        const { expression } = match.results
        return `spellCore.smallestOf(${expression})`
      },
      toAST(scope, match) {
        const { expression } = match.groups
        return new AST.CoreMethodExpression(scope, match, {
          datatype: "number",
          method: "smallestOf",
          arguments: [expression.AST]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("prices")
          },
          tests: [
            ["smallest of prices", "spellCore.smallestOf(prices)"],
            ["smallest value in prices", "spellCore.smallestOf(prices)"]
          ]
        }
      ]
    },

    {
      // TODO: precision:  to the nearest tenth ?
      name: "round_number",
      alias: ["expression", "single_expression"],
      syntax: "round {thing:expression} (direction:off|up|down)?",
      testRule: "round",
      precedence: 1,
      compile(scope, match) {
        const { thing, direction } = match.results
        if (direction === "up") return `Math.ceil(${thing})`
        if (direction === "down") return `Math.floor(${thing})`
        return `Math.round(${thing})`
      },
      toAST(scope, match) {
        const { direction } = match.results
        const { thing } = match.groups
        let method = "round"
        if (direction === "up") method = "roundUp"
        else if (direction === "down") method = "roundDown"
        return new AST.CoreMethodExpression(scope, match, {
          datatype: "number",
          method, // TODO: implement in spellCore
          arguments: [thing.AST]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("price")
          },
          tests: [
            ["round price", "Math.round(price)"],
            ["round price off", "Math.round(price)"],
            ["round price up", "Math.ceil(price)"],
            ["round price down", "Math.floor(price)"]
          ]
        }
      ]
    }
  ]
})
