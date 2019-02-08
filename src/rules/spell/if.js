//
//	# Rules for if statements.
//

import Parser, { ParseError } from "../../Parser";
import Rule from "../../Rule";

// Create "if" parser.
const parser = Parser.forModule("if");
export default parser;

parser.defineRules(
  {
    name: "if",
    alias: "statement",
    syntax: "if {condition:expression} (then|:)? {statement}?",
    constructor: class if_ extends Rule.BlockStatement {
      toSource() {
        let { condition, statements } = this.results;
        return `if (${condition}) ${statements}`;
      }
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
          ["if a : b = 1", "if (a) { b = 1 }"],
        ]
      },
      {
        title: "correctly matches multi-line if blocks",
        compileAs: "statements",
        tests: {
          "Separate blocks if no indentation on second line.":
              ["if a:\nb = 1", "if (a) {}\nb = 1"],
          "Indent with tab":
              ["if a:\n\tb = 1", "if (a) {\n\tb = 1\n}"],
          "ANY number of spaces should count as indentation":
              ["if a:\n b = 1", "if (a) {\n\tb = 1\n}"],
          "Multiple lines in the nested block":
              ["if a:\n\tb = 1\n\tc = 2", "if (a) {\n\tb = 1\n\tc = 2\n}"],
          "Nested ifs work fine":
              ["if a\n\tif b\n\t\tc=2", "if (a) {\n\tif (b) {\n\t\tc = 2\n\t}\n}"],
          "Prefer nested block to inlined statement":
              ["if a b = 1\n\tc = 2", "if (a) {\n\tc = 2\n}"],
        }
      },
//TESTME: test full if/else if/else blocks
    ]
  },

  {
    // NOTE: this MUST be before `else` or that will eat `else if` statements... :-(
    name: "else_if",
    alias: "statement",
    syntax: "(else|otherwise) if {condition:expression} (then|:) {statement}?",
    constructor: class else_if extends Rule.BlockStatement {
      toSource() {
        let { condition, statements } = this.results;
        return `else if (${condition}) ${statements}`
      }
    },
    tests: [
      {
        title: "correctly matches single-line else_if statements",
        compileAs: "statement",
        tests: [
          ["else if a then", "else if (a) {}"],
          ["else if a then b = 1", "else if (a) { b = 1 }"],
          ["else if a: b = 1", "else if (a) { b = 1 }"],
        ]
      },
      {
        title: "correctly matches multi-line else_if blocks",
        compileAs: "statements",
        tests: {
          "Separate blocks if no indentation on second line.":
              ["else if a:\nb = 1", "else if (a) {}\nb = 1"],
          "Indent with tab":
              ["else if a:\n\tb = 1", "else if (a) {\n\tb = 1\n}"],
          "ANY number of spaces should count as indentation":
              ["else if a:\n b = 1", "else if (a) {\n\tb = 1\n}"],
          "Multiple lines in the nested block":
              ["else if a:\n\tb = 1\n\tc = 2", "else if (a) {\n\tb = 1\n\tc = 2\n}"],
//FIXME          "Nested ifs work fine":
//            ["else if a\n\tif b\n\t\tc=2", "else if (a) {\n\tif (b) {\n\t\tc = 2\n\t}\n}"],
//FIXME          "Prefer nested block to inlined statement":
//            ["else if a b = 1\n\tc = 2", "else if (a) {\n\tc = 2\n}"],
        }
      },
    ]
  },

  {
    name: "else",
    alias: "statement",
    syntax: "(else|otherwise) (:)? {statement}?",
    constructor: class else_ extends Rule.BlockStatement {
      toSource() {
        let { statements } = this.results;
        return `else ${statements}`
      }
    },
    tests: [
      {
        title: "correctly matches single-line else statements",
        compileAs: "statement",
        tests: [
          ["else", "else {}"],
          ["otherwise", "else {}"],
          ["else b = 1", "else { b = 1 }"],
          ["otherwise b = 1", "else { b = 1 }"],
        ]
      },
      {
        title: "correctly matches multi-line else blocks",
        compileAs: "statements",
        tests: {
          "Separate blocks if no indentation on second line.":
              ["else\nb = 1", "else {}\nb = 1"],
          "Indent with tab":
              ["else\n\tb = 1", "else {\n\tb = 1\n}"],
          "ANY number of spaces should count as indentation":
              ["else\n b = 1", "else {\n\tb = 1\n}"],
          "Multiple lines in the nested block":
              ["else\n\tb = 1\n\tc = 2", "else {\n\tb = 1\n\tc = 2\n}"],
        }
      },
    ]
  },

  // NOTE: this is NOT a blockStatement!
  {
    name: "backwards_if",
    alias: "statement",
    syntax: "{statement} if {condition:expression} (?:(else|otherwise) {elseStatement:statement})?",
    leftRecursive: true,
    testRule: new Rule.Keywords({ literals: [ "if" ] }),
    constructor: class backwards_if extends Rule.Sequence {
      toSource() {
        let { condition, statement, elseStatement } = this.results;
//TODO: smarter wrapping?
        let output = `if (${condition}) { ${statement} }`;
        if (elseStatement) output += `\nelse { ${elseStatement} }`
        return output;
      }
    },
    tests: [
      {
        title: "correctly matches single-line backwards_if statements",
        compileAs: "statement",
        tests: [
          ["b = 1 if a", "if (a) { b = 1 }"],
          ["b = 1 if a else b = 2", "if (a) { b = 1 }\nelse { b = 2 }"],
          ["b = 1 if a otherwise b = 2", "if (a) { b = 1 }\nelse { b = 2 }"],
        ]
      }
    ]
  },
);
