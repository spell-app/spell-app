//
//  # Rules for if statements.
//

import {
  Rule,
  Scope,
  SpellParser,
} from "../all.js";

const parser = new SpellParser({ module: "if" });
export default parser;

// Given a condition expression string, wrap it in parens iff it is not already parenthesized properly.
// TESTME
export function parenthesizeCondition(condition) {
  if (condition.startsWith("(") && condition.endsWith(")")) return condition;
  return `(${condition})`;
}


parser.defineRule({
  name: "_if",
  alias: "statement",
  syntax: "if {condition:expression} (then|:)?",
  testRule: "if",
  constructor: SpellParser.Rule.Statement,
  wantsInlineStatement: true,
  wantsNestedBlock: true,
  getNestedScope(scope, results) {
    const condition = parenthesizeCondition(results.condition);
    return results.$scope = new Scope.Method({
      name: "if",
      scope,
      toString() {
        return `if ${condition} ${this.compileStatements()}`;
      }
    });
  },
  updateScope(scope, results) {
    scope.addStatement(results.$scope, results);
  },
  tests: [
    {
      title: "correctly matches single-line if statements",
      compileAs: "statement",
      tests: [
        ["if a", "if (a) {}"],
        ["if a then", "if (a) {}"],
        ["if a:", "if (a) {}"],
        ["if a then b = 1", "if (a) { b = 1 }"],
        ["if a: b = 1", "if (a) { b = 1 }"],
        ["if a : b = 1", "if (a) { b = 1 }"]
      ]
    },
    {
      title: "correctly matches multi-line if blocks",
      compileAs: "block",
      tests: [
        {
          title: "Separate blocks if no indentation on second line.",
          input: "if a:\nb = 1",
          output: "if (a) {}\nb = 1"    // NOTE: this is correct!
        },
        {
          title: "Single tabbed statement appears inline",
          input: "if a:\n\tb = 1",
          output: "if (a) { b = 1 }"
        },
        {
          title: "ANY number of spaces should count as indentation",
          input: "if a:\n b = 1",
          output: "if (a) { b = 1 }"
        },
        {
          title: "Indent with tab, output has 2 spaces",
          input: "if a:\n\tb = 1\n\tc=1",
          output: "if (a) {\n  b = 1\n  c = 1\n}"
        },
        {
          title: "Multiple lines in the nested block",
          input: "if a:\n\tb = 1\n\tc = 2",
          output: "if (a) {\n  b = 1\n  c = 2\n}"
        },
//         {
//           title: "Blank lines in the nested block are carried over",
//           input: "if a:\n\tb = 1\n\n\n\tc = 2",
//           output: "if (a) {\n  b = 1\n  \n  \n  c = 2\n}"
//         },
        {
          title: "Nested ifs work fine",
          input: "if a\n\tif b\n\t\tc=2",
          output: "if (a) { if (b) { c = 2 } }"
        },
        {
          title: "Both nested block and inline statements are used",
          input: "if a b = 1\n\tc = 2",
          output: "if (a) {\n  b = 1\n  c = 2\n}"
        }
      ]
    }
    //TESTME: test full if/else if/else blocks
  ]
});

parser.defineRule({
  // NOTE: this MUST be before `else` or that will eat `else if` statements... :-(
  name: "else_if",
  alias: "statement",
  syntax: "(else|otherwise) if {condition:expression} (then|:)?",
  testRule: "(else|otherwise)",
  precedence: 1,
  constructor: SpellParser.Rule.Statement,
  wantsInlineStatement: true,
  wantsNestedBlock: true,
  getNestedScope(scope, results) {
    const condition = parenthesizeCondition(results.condition);
    return results.$scope = new Scope.Method({
      name: "else_if",
      scope,
      toString() {
        return `else if ${condition} ${this.compileStatements()}`;
      }
    });
  },
  updateScope(scope, results) {
    scope.addStatement(results.$scope, results);
  },
  tests: [
    {
      title: "correctly matches single-line else_if statements",
      compileAs: "statement",
      tests: [
        ["else if a", "else if (a) {}"],
        ["else if a:", "else if (a) {}"],
        ["else if a then", "else if (a) {}"],
        ["else if a b = 1", "else if (a) { b = 1 }"],
        ["else if a: b = 1", "else if (a) { b = 1 }"],
        ["else if a then b = 1", "else if (a) { b = 1 }"],
      ]
    },
    {
      title: "correctly matches multi-line else_if blocks",
      compileAs: "block",
      tests: [
        {
          title: "Separate blocks if no indentation on second line.",
          input: "else if a:\nb = 1",
          output: "else if (a) {}\nb = 1"
        },
        {
          title: "Indent with tab",
          input: "else if a:\n\tb = 1",
          output: "else if (a) { b = 1 }"
        },
        {
          title: "ANY number of spaces should count as indentation",
          input: "else if a:\n b = 1",
          output: "else if (a) { b = 1 }"
        },
        {
          title: "Multiple lines in the nested block",
          input: "else if a:\n\tb = 1\n\tc = 2",
          output: "else if (a) {\n  b = 1\n  c = 2\n}"
        },
        {
          title: "Nested ifs work fine",
          input: "else if a\n\tif b\n\t\tc=2",
          output: "else if (a) { if (b) { c = 2 } }"
        },
        {
          title: "Both inline statement and nested block are used",
          input: "else if a b = 1\n\tc = 2",
          output: "else if (a) {\n  b = 1\n  c = 2\n}"
        }
      ]
    }
  ]
});

parser.defineRule({
  name: "_else",
  alias: "statement",
  syntax: "(else|otherwise) :?",
  testRule: "(else|otherwise)",
  constructor: SpellParser.Rule.Statement,
  wantsInlineStatement: true,
  wantsNestedBlock: true,
  getNestedScope(scope, results) {
    return results.$scope = new Scope.Method({
      name: "else",
      scope,
      toString() {
        return `else ${this.compileStatements()}`;
      }
    });
  },
  updateScope(scope, results) {
    scope.addStatement(results.$scope, results);
  },
  tests: [
    {
      title: "correctly matches single-line else statements",
      compileAs: "statement",
      tests: [
        ["else", "else {}"],
        ["otherwise", "else {}"],
        ["else: b = 1", "else { b = 1 }"],
        ["otherwise: b = 1", "else { b = 1 }"],
        ["else b = 1", "else { b = 1 }"],
        ["otherwise b = 1", "else { b = 1 }"]
      ]
    },
    {
      title: "correctly matches multi-line else blocks",
      compileAs: "block",
      tests: [
        {
          title: "Separate blocks if no indentation on second line.",
          input: "else\nb = 1",
          output: "else {}\nb = 1"
        },
        {
          title: "Indent with tab",
          input: "else\n\tb = 1",
          output: "else { b = 1 }"
        },
        {
          title: "ANY number of spaces should count as indentation",
          input: "else\n b = 1",
          output: "else { b = 1 }"
        },
        {
          title: "Multiple lines in the nested block",
          input: "else\n\tb = 1\n\tc = 2",
          output: "else {\n  b = 1\n  c = 2\n}"
        }
      ]
    }
  ]
});

parser.defineRule({
  name: "backwards_if",
  alias: "expression_suffix",
  syntax: "if (?:{condition:expression} (else|otherwise) {expression:expression})",
  compile(scope, match) {
    return { expression: match.results };
  },
  applyOperator({ lhs, rhs }) {
    const { condition, expression } = rhs;
    return `(${rhs.condition} ? ${lhs} : ${rhs.expression})`;
  },
  tests: [
    {
      title: "correctly matches single-line backwards_if statements",
      compileAs: "statement",
      tests: [
        ["b = 1 if a else 2", "b = (a ? 1 : 2)"],
        ["b = the foo of the bar if a is 1 otherwise the bar of the foo",
         "b = ((a == 1) ? bar?.foo : foo?.bar)"]
      ]
    }
  ]
});
