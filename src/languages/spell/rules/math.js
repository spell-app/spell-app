//
//  # Rules for math-y bits.
//  NOTE: this must come after "operators"
//

import { AST, SpellParser } from ".."

export default new SpellParser({
  module: "math",
  rules: [
    {
      name: "gt_lt",
      alias: "expression_suffix",
      precedence: 11,
      // NOTE: output of `operator` will NOT have space between `>=`
      syntax: "(operator:(<|>) =?) {expression:single_expression}",
      constructor: SpellParser.Rule.InfixOperatorSuffix,
      parenthesize: true,
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
      constructor: SpellParser.Rule.InfixOperatorSuffix,
      getOutputOperator: ({ value }) => (value.includes("greater") ? ">" : "<") + (value.includes("equal") ? "=" : ""),
      parenthesize: true,
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
      constructor: SpellParser.Rule.InfixOperatorSuffix,
      getOutputOperator: () => "+",
      parenthesize: true,
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
            ["price plus tax", "(price + tax)"]
          ]
        }
      ]
    },
    {
      name: "minus",
      alias: "expression_suffix",
      precedence: 13,
      syntax: "(operator:minus|-) {expression:single_expression}",
      constructor: SpellParser.Rule.InfixOperatorSuffix,
      getOutputOperator: () => "-",
      parenthesize: true,
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
      constructor: SpellParser.Rule.InfixOperatorSuffix,
      getOutputOperator: () => "*",
      parenthesize: true,
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
      constructor: SpellParser.Rule.InfixOperatorSuffix,
      getOutputOperator: () => "/",
      parenthesize: true,
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
      syntax: "(operator:the? absolute value of) {expression}",
      testRule: "…absolute",
      constructor: SpellParser.Rule.InfixOperatorSuffix,
      getAST(match) {
        const { expression } = match.groups
        return new AST.CoreMethodInvocation(match, {
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
          tests: [["the absolute value of the difference", "spellCore.absoluteValue(difference)"]]
        }
      ]
    },

    {
      name: "max",
      alias: ["expression", "single_expression"],
      precedence: 2,
      syntax: "(operator:the? (biggest|largest)) {argument:singular_variable}? (of|in) {expression}",
      testRule: "…(biggest|largest)",
      getAST(match) {
        const { expression } = match.groups
        return new AST.CoreMethodInvocation(match, {
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
      syntax: "(operator:the? smallest) {argument:singular_variable}? (of|in) {expression}",
      testRule: "…smallest",
      getAST(match) {
        const { expression } = match.groups
        return new AST.CoreMethodInvocation(match, {
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
      syntax: "round {expression} (operator:off|up|down)?",
      testRule: "round",
      precedence: 1,
      getAST(match) {
        const { expression, operator } = match.groups
        let method = "round"
        if (operator?.value === "up") method = "roundUp"
        else if (operator?.value === "down") method = "roundDown"
        return new AST.CoreMethodInvocation(match, {
          datatype: "number",
          method, // TODO: implement in spellCore
          arguments: [expression.AST]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("price")
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
  ]
})
