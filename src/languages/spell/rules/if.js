//
//  # Rules for if statements.
//

import { Scope, Spell } from "../all"

// Given a condition expression string, wrap it in parens iff it is not already parenthesized properly.
// TESTME
export function parenthesizeCondition(condition) {
  if (condition.startsWith("(") && condition.endsWith(")")) return condition
  return `(${condition})`
}

export default new Spell.Parser({
  module: "if",
  rules: [
    {
      name: "_if",
      alias: "statement",
      syntax: "if {condition:expression} (then|:)?",
      testRule: "if",
      constructor: Spell.Rule.Statement,
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      getNestedScope(scope, { results }) {
        const condition = parenthesizeCondition(results.condition)
        results.$scope = new Scope.Method({
          name: "if",
          scope,
          toString() {
            return `if ${condition} ${this.compileStatements()}`
          }
        })
        return results.$scope
      },
      updateScope(scope, { results }) {
        const statement = scope.addStatement(results.$scope)
        results.statements.push(statement)
      },
      tests: [
        {
          title: "correctly matches single-line if statements",
          compileAs: "statement",
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
              input: "if a:\nb = 1",
              output: "if (a) {}\nlet b = 1" // NOTE: this is correct!
            },
            {
              title: "Single tabbed statement appears inline",
              input: "if a:\n\tb = 1",
              output: "if (a) { let b = 1 }"
            },
            {
              title: "ANY number of spaces should count as indentation",
              input: "if a:\n b = 1",
              output: "if (a) { let b = 1 }"
            },
            {
              title: "Indent with tab, output has 2 spaces",
              input: "if a:\n\tb = 1\n\tc=1",
              output: "if (a) {\n  let b = 1\n  let c = 1\n}"
            },
            {
              title: "Multiple lines in the nested block",
              input: "if a:\n\tb = 1\n\tc = 2",
              output: "if (a) {\n  let b = 1\n  let c = 2\n}"
            },
            //         {
            //           title: "Blank lines in the nested block are carried over",
            //           input: "if a:\n\tb = 1\n\n\n\tc = 2",
            //           output: "if (a) {\n  let b = 1\n  \n  \n  let c = 2\n}"
            //         },
            {
              title: "Nested ifs work fine",
              input: "if a\n\tb = 1\n\tif b\n\t\tc = 2",
              output: "if (a) {\n  let b = 1\n  if (b) { let c = 2 }\n}"
            },
            {
              title: "Both nested block and inline statements are used",
              input: "if a b = 1\n\tc = 2",
              output: "if (a) {\n  let b = 1\n  let c = 2\n}"
            }
          ]
        }
        // TESTME: test full if/else if/else blocks
      ]
    },

    {
      // NOTE: this MUST be before `else` or that will eat `else if` statements... :-(
      name: "else_if",
      alias: "statement",
      syntax: "(else|otherwise) if {condition:expression} (then|:)?",
      testRule: "(else|otherwise)",
      precedence: 1,
      constructor: Spell.Rule.Statement,
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      getNestedScope(scope, { results }) {
        const condition = parenthesizeCondition(results.condition)
        results.$scope = new Scope.Method({
          name: "else_if",
          scope,
          toString() {
            return `else if ${condition} ${this.compileStatements()}`
          }
        })
        return results.$scope
      },
      updateScope(scope, { results }) {
        const statement = scope.addStatement(results.$scope)
        results.statements.push(statement)
      },
      tests: [
        {
          title: "correctly matches single-line else_if statements",
          compileAs: "statement",
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
              input: "else if a:\nb = 1",
              output: "else if (a) {}\nlet b = 1"
            },
            {
              title: "Indent with tab",
              input: "else if a:\n\tb = 1",
              output: "else if (a) { let b = 1 }"
            },
            {
              title: "ANY number of spaces should count as indentation",
              input: "else if a:\n b = 1",
              output: "else if (a) { let b = 1 }"
            },
            {
              title: "Multiple lines in the nested block",
              input: "else if a:\n\tb = 1\n\tc = 2",
              output: "else if (a) {\n  let b = 1\n  let c = 2\n}"
            },
            {
              title: "Nested else ifs work fine",
              input: "else if a\n\tif a\n\t\tc=2",
              output: "else if (a) { if (a) { let c = 2 } }"
            },
            {
              title: "Both inline statement and nested block are used",
              input: "else if a b = 1\n\tb = 2\n\tc = 2",
              output: "else if (a) {\n  let b = 1\n  b = 2\n  let c = 2\n}"
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
      constructor: Spell.Rule.Statement,
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      getNestedScope(scope, { results }) {
        results.$scope = new Scope.Method({
          scope,
          toString() {
            return `else ${this.compileStatements()}`
          }
        })
        return results.$scope
      },
      updateScope(scope, { results }) {
        const statement = scope.addStatement(results.$scope)
        results.statements.push(statement)
      },
      tests: [
        {
          title: "correctly matches single-line else statements",
          compileAs: "statement",
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
              input: "else\nb = 1",
              output: "else {}\nlet b = 1"
            },
            {
              title: "Indent with tab",
              input: "else\n\tb = 1",
              output: "else { let b = 1 }"
            },
            {
              title: "ANY number of spaces should count as indentation",
              input: "else\n b = 1",
              output: "else { let b = 1 }"
            },
            {
              title: "Multiple lines in the nested block",
              input: "else\n\tb = 1\n\tlet c = 2",
              output: "else {\n  let b = 1\n  let c = 2\n}"
            }
          ]
        }
      ]
    },

    {
      name: "backwards_if",
      alias: "expression_suffix",
      syntax: "if {condition:expression} (else|otherwise) {expression:expression}",
      constructor: Spell.Rule.InfixOperatorSuffix,
      compile(scope, match) {
        return { expression: match.results }
      },
      applyOperator({ lhs, rhs }) {
        return `(${rhs.condition} ? ${lhs} : ${rhs.expression})`
      },
      tests: [
        {
          title: "correctly matches single-line backwards_if statements",
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("bar")
            scope.variables.add("foo")
          },
          tests: [
            ["get 1 if bar else 2", "let it = (bar ? 1 : 2)"],
            [
              "get the foo of the bar if bar is defined otherwise the bar of the foo",
              "let it = (spellCore.isDefined(bar) ? bar.foo : foo.bar)"
            ]
          ]
        }
      ]
    }
  ]
})
