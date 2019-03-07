//
//  # Rules for if statements.
//

import {
  BlockStatement,
  Rule,
  SpellParser,
} from "./all.js";

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
  syntax: "if {condition:expression} (then|:)? {statement}?",
  testRule: "if",
  constructor: BlockStatement,
  compile(match, scope) {
    const { condition, statements } = match.results;
    return `if ${parenthesizeCondition(condition)} ${statements}`;
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
          output: "if (a) {}\nb = 1"
        },
        {
          title: "Indent with tab",
          input: "if a:\n\tb = 1",
          output: "if (a) {\n\tb = 1\n}"
        },
        {
          title: "ANY number of spaces should count as indentation",
          input: "if a:\n b = 1",
          output: "if (a) {\n\tb = 1\n}"
        },
        {
          title: "Multiple lines in the nested block",
          input: "if a:\n\tb = 1\n\tc = 2",
          output: "if (a) {\n\tb = 1\n\tc = 2\n}"
        },
        {
          title: "Nested ifs work fine",
          input: "if a\n\tif b\n\t\tc=2",
          output: "if (a) {\n\tif (b) {\n\t\tc = 2\n\t}\n}"
        },
        {
          title: "Prefer nested block to inlined statement",
          input: "if a b = 1\n\tc = 2",
          output: "if (a) {\n\tc = 2\n}"
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
  syntax: "(else|otherwise) if {condition:expression} (then|:)? {statement}?",
  testRule: "(else|otherwise)",
  precedence: 1,
  constructor: BlockStatement,
  compile(match, scope) {
    const { condition, statements } = match.results;
    return `else if ${parenthesizeCondition(condition)} ${statements}`;
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
          output: "else if (a) {\n\tb = 1\n}"
        },
        {
          title: "ANY number of spaces should count as indentation",
          input: "else if a:\n b = 1",
          output: "else if (a) {\n\tb = 1\n}"
        },
        {
          title: "Multiple lines in the nested block",
          input: "else if a:\n\tb = 1\n\tc = 2",
          output: "else if (a) {\n\tb = 1\n\tc = 2\n}"
        },
        {
          title: "Nested ifs work fine",
          input: "else if a\n\tif b\n\t\tc=2",
          output: "else if (a) {\n\tif (b) {\n\t\tc = 2\n\t}\n}"
        },
        {
          title: "Prefer nested block to inlined statement",
          input: "else if a b = 1\n\tc = 2",
          output: "else if (a) {\n\tc = 2\n}"
        }
      ]
    }
  ]
});

parser.defineRule({
  name: "_else",
  alias: "statement",
  syntax: "(else|otherwise) :? {statement}?",
  testRule: "(else|otherwise)",
  constructor: BlockStatement,
  compile(match, scope) {
    const { statements } = match.results;
    return `else ${statements}`;
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
          output: "else {\n\tb = 1\n}"
        },
        {
          title: "ANY number of spaces should count as indentation",
          input: "else\n b = 1",
          output: "else {\n\tb = 1\n}"
        },
        {
          title: "Multiple lines in the nested block",
          input: "else\n\tb = 1\n\tc = 2",
          output: "else {\n\tb = 1\n\tc = 2\n}"
        }
      ]
    }
  ]
});

parser.defineRule({
  name: "backwards_if",
  alias: "expression_suffix",
  syntax: "if (?:{condition:expression} (else|otherwise) {expression:expression})",
  compile(match, scope) {
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
