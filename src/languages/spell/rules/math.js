//
//  # Rules for math-y bits.
//  NOTE: this must come after "operators"
//

import { Spell } from "../all"

export default new Spell.Parser({
  module: "math",
  rules: [
    {
      name: "gt_lt",
      alias: "expression_suffix",
      precedence: 11,
      syntax: "(operator:(<|>) =?) {expression:single_expression}",
      applyOperator: ({ lhs, operator, rhs }) => `(${lhs} ${operator} ${rhs})`,
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
      name: "plus_minus",
      alias: "expression_suffix",
      precedence: 13,
      syntax: "(operator:plus|minus|+|-) {expression:single_expression}",
      applyOperator({ lhs, operator, rhs }) {
        const op = operator.includes("plus") || operator.includes("+") ? "+" : "-"
        return `(${lhs} ${op} ${rhs})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("price")
            scope.variables.add("tax")
          },
          tests: [
            ["price + tax", "(price + tax)"],
            ["price+tax", "(price + tax)"],
            //        ["price-tax", "(price - tax)"],     // NOTE: `-` requires spaces...
            ["price - tax", "(price - tax)"],
            ["price plus tax", "(price + tax)"],
            ["price minus tax", "(price - tax)"]
          ]
        }
      ]
    },

    {
      name: "times_divided_by",
      alias: "expression_suffix",
      precedence: 14,
      syntax: "(operator:*|/|times|divided by) {expression:single_expression}",
      applyOperator({ lhs, operator, rhs }) {
        const op = operator.includes("times") || operator.includes("*") ? "*" : "/"
        return `(${lhs} ${op} ${rhs})`
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
            ["price/taxRate", "(price / taxRate)"],
            ["price / taxRate", "(price / taxRate)"],
            ["price times taxRate", "(price * taxRate)"],
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
        return `spell.largestOf(${expression})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("prices")
            scope.variables.add("price")
          },
          tests: [
            ["largest of the prices", "spell.largestOf(prices)"],
            ["biggest in prices", "spell.largestOf(prices)"],
            ["biggest number in prices", "spell.largestOf(prices)"]
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
        return `spell.smallestOf(${expression})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("prices")
          },
          tests: [
            ["smallest of prices", "spell.smallestOf(prices)"],
            ["smallest value in prices", "spell.smallestOf(prices)"]
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
        else if (direction === "down") return `Math.floor(${thing})`
        else return `Math.round(${thing})`
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
