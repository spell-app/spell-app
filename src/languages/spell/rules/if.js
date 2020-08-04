//
//  # Rules for if statements.
//

import { BlockScope } from "~/parser"
import { SpellParser, AST } from "~/languages/spell"

// Given a condition expression string, wrap it in parens iff it is not already parenthesized properly.
// TESTME
export function parenthesizeCondition(condition) {
  if (typeof condition === "string" && condition.startsWith("(") && condition.endsWith(")")) return condition
  return `(${condition})`
}

export const _if_ = new SpellParser({
  module: "if",
  rules: [
    {
      name: "_if",
      alias: "statement",
      syntax: "if {condition:expression} (then|:)?",
      testRule: "if",
      constructor: "Statement",
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      getNestedScope(match) {
        return new BlockScope({ name: "if", scope: match.scope })
      },
      getAST(match) {
        const { condition, inlineStatement, nestedBlock } = match.groups
        // Prefer nestedBlock if we get both
        return new AST.IfStatement(match, {
          condition: condition.AST,
          statements: (nestedBlock || inlineStatement)?.AST
        })
      },
      tests: [
        {
          title: "correctly matches single-line if statements",
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add("a")
          },
          tests: [
            ["if a", "if (a) {}"],
            ["if a then", "if (a) {}"],
            ["if a:", "if (a) {}"],
            ["if a then b = 1", "if (a) { let b = 1 }"],
            ["if a: b = 1", "if (a) { let b = 1 }"],
            ["if a : b = 1", "if (a) { let b = 1 }"]
          ]
        },
        {
          title: "correctly matches multi-line if blocks",
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add("a")
          },
          tests: [
            {
              title: "Separate blocks if no indentation on second line.",
              input: ["if a:", "b = 1"],
              output: ["if (a) {}", "export let b = 1"] // NOTE: this is correct!
            },
            {
              title: "Single tabbed statement appears inline",
              input: ["if a:", "\tb = 1"],
              output: "if (a) { let b = 1 }"
            },
            {
              title: "ANY number of spaces should count as indentation",
              input: ["if a:", " b = 1"],
              output: "if (a) { let b = 1 }"
            },
            {
              title: "Indent with tab, output has tabs spaces",
              input: ["if a:", "\tb = 1", "\tc=1"],
              output: ["if (a) {", "\tlet b = 1", "\tlet c = 1", "}"]
            },
            {
              title: "Multiple lines in the nested block",
              input: ["if a:", "\tb = 1", "\tc = 2"],
              output: ["if (a) {", "\tlet b = 1", "\tlet c = 2", "}"]
            },
            {
              title: "Nested ifs work fine",
              input: ["if a", "\tb = 1", "\tif b", "\t\tc = 2", "\t\td = 3"],
              output: ["if (a) {", "\tlet b = 1", "\tif (b) {", "\t\tlet c = 2", "\t\tlet d = 3", "\t}", "}"]
            },
            {
              title: "Show error if nested block AND inline statement. Prefer block.",
              input: ["if a b = 1", "\tc = 2"],
              output: ["if (a) { let c = 2 }", "/* PARSE ERROR: Got both inline statement and nested block */"]
            }
          ]
        }
      ]
    },

    {
      // NOTE: this MUST be before `else` or that will eat `else if` statements... :-(
      name: "else_if",
      alias: "statement",
      syntax: "(else|otherwise) if {condition:expression} (then|:)?",
      testRule: "(else|otherwise)",
      precedence: 1,
      constructor: "Statement",
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      getNestedScope(match) {
        return new BlockScope({ name: "elseif", scope: match.scope })
      },
      getAST(match) {
        const { condition, inlineStatement, nestedBlock } = match.groups
        return new AST.ElseIfStatement(match, {
          condition: condition.AST,
          statements: (nestedBlock || inlineStatement)?.AST
        })
      },
      tests: [
        {
          title: "correctly matches single-line else_if statements",
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add("a")
          },
          tests: [
            ["else if a", "else if (a) {}"],
            ["else if a:", "else if (a) {}"],
            ["else if a then", "else if (a) {}"],
            ["else if a b = 1", "else if (a) { let b = 1 }"],
            ["else if a: b = 1", "else if (a) { let b = 1 }"],
            ["else if a then b = 1", "else if (a) { let b = 1 }"]
          ]
        },
        {
          title: "correctly matches multi-line else_if blocks",
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add("a")
          },
          tests: [
            {
              title: "Separate blocks if no indentation on second line.",
              input: ["else if a:", "b = 1"],
              output: ["else if (a) {}", "export let b = 1"]
            },
            {
              title: "Indent with tab",
              input: ["else if a:", "\tb = 1"],
              output: "else if (a) { let b = 1 }"
            },
            {
              title: "ANY number of spaces should count as indentation",
              input: ["else if a:", " b = 1"],
              output: "else if (a) { let b = 1 }"
            },
            {
              title: "Multiple lines in the nested block",
              input: ["else if a:", "\tb = 1", "\tc = 2"],
              output: ["else if (a) {", "\tlet b = 1", "\tlet c = 2", "}"]
            },
            {
              title: "Nested else ifs work fine",
              input: ["else if a", "\tif a", "\t\tc=2"],
              output: "else if (a) { if (a) { let c = 2 } }"
            },
            {
              title: "Show error if nested block AND inline statement. Prefer block.",
              input: ["else if a b = 1", "\tc = 2"],
              output: ["else if (a) { let c = 2 }", "/* PARSE ERROR: Got both inline statement and nested block */"]
            }
          ]
        }
      ]
    },

    {
      name: "_else",
      alias: "statement",
      syntax: "(else|otherwise) :?",
      testRule: "(else|otherwise)",
      constructor: "Statement",
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      getNestedScope(match) {
        return new BlockScope({ name: "else", scope: match.scope })
      },
      getAST(match) {
        const { inlineStatement, nestedBlock } = match.groups
        return new AST.ElseStatement(match, {
          statements: (nestedBlock || inlineStatement)?.AST
        })
      },
      tests: [
        {
          title: "correctly matches single-line else statements",
          compileAs: "block",
          tests: [
            ["else", "else {}"],
            ["otherwise", "else {}"],
            ["else: b = 1", "else { let b = 1 }"],
            ["otherwise: b = 1", "else { let b = 1 }"],
            ["else b = 1", "else { let b = 1 }"],
            ["otherwise b = 1", "else { let b = 1 }"]
          ]
        },
        {
          title: "correctly matches multi-line else blocks",
          compileAs: "block",
          tests: [
            {
              title: "Separate blocks if no indentation on second line.",
              input: ["else", "b = 1"],
              output: ["else {}", "export let b = 1"]
            },
            {
              title: "Indent with tab",
              input: ["else", "\tb = 1"],
              output: "else { let b = 1 }"
            },
            {
              title: "ANY number of spaces should count as indentation",
              input: ["else", " b = 1"],
              output: "else { let b = 1 }"
            },
            {
              title: "Multiple lines in the nested block",
              input: ["else", "\tb = 1", "\tlet c = 2"],
              output: ["else {", "\tlet b = 1", "\tlet c = 2", "}"]
            },
            {
              title: "Show error if nested block AND inline statement. Prefer block.",
              input: ["else b = 1", "\tc = 2"],
              output: ["else { let c = 2 }", "/* PARSE ERROR: Got both inline statement and nested block */"]
            }
          ]
        }
      ]
    },

    {
      name: "backwards_if",
      alias: "expression_suffix",
      syntax: "if {operator:expression} (else|otherwise) {expression}",
      constructor: "InfixOperatorSuffix",
      compileASTExpression(match, { lhs, operator, rhs }) {
        return new AST.TernaryExpression(match, {
          condition: operator.AST,
          trueValue: lhs,
          falseValue: rhs
        })
      },
      tests: [
        {
          title: "correctly matches single-line backwards_if statements",
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add("bar")
            scope.variables.add("foo")
          },
          tests: [
            { input: "print 1 if bar else 2", output: "spellCore.console.log((bar ? 1 : 2))" },
            {
              input: "get the foo of the bar if bar is defined otherwise the bar of the foo",
              output: "let it = (spellCore.isDefined(bar) ? bar.foo : foo.bar)"
            },
            {
              input: `set color to "red" if 1 + 1 else "black"`,
              output: `export let color = ((1 + 1) ? "red" : "black")`
            }
          ]
        }
      ]
    }
  ]
})
