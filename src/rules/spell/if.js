//
//	# Rules for if statements.
//

import Parser from "../../Parser";
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
        let { condition, statement, block } = this.results;
  //			if (statement && block) throw new SyntaxError("if may only have inline statement OR block");
        let statements = Rule.Block.encloseStatements(statement, block);
        return `if (${condition}) ${statements}`;
      }
    },
    tests: [
      {
        title: "correctly matches single-line if blocks",
        compileAs: "statement",
        tests: [
          ["if a then", "if (a) {}"],
          ["if a then b = 1", "if (a) { b = 1 }"],
          ["if a: b = 1", "if (a) { b = 1 }"],
          ["if a : b = 1", "if (a) { b = 1 }"],
        ]
      },
      {
//TESTME: test nested blocks
        title: "correctly matches multi-line if blocks",
        compileAs: "statements",
        normalize: true,
        tests: [
          // Separate blocks if no indentation on second line.
          ["if a:\nb = 1", "if (a) {}\nb = 1"],
          // ANY number of spaces should count as indentation
          ["if a:\n b = 1", "if (a) {\n\tb = 1\n}"],
          ["", ""],
          ["", ""],
          ["", ""],
        ]
      },
    ]
  },

  // NOTE: this is NOT a block statement... ???
  {
    name: "backwards_if",
    alias: "statement",
    syntax: "{statement} if {condition:expression} (?:(else|otherwise) {elseStatement:statement})?",
    leftRecursive: true,
    testRule: new Rule.Keywords({ literals: [ "if" ] }),
    constructor: class backwards_if extends Rule.Sequence {
      toSource() {
        let { condition, statement, elseStatement } = this.results;
        let output = `if (${condition}) { ${statement} }`;
        if (elseStatement) output += `\nelse { ${elseStatement} }`
        return output;
      }
    },
    tests: [
      {
        title: "correctly matches single-line backwards_if blocks",
        compileAs: "statement",
        tests: [
          ["b = 1 if a", "if (a) { b = 1 }"],
          ["b = 1 if a else b = 2", "if (a) { b = 1 }\nelse { b = 2 }"],
          ["b = 1 if a otherwise b = 2", "if (a) { b = 1 }\nelse { b = 2 }"],
        ]
      }
    ]
  },

  {
    name: "else_if",
    alias: "statement",
    syntax: "(else|otherwise) if {condition:expression} (then|:) {statement}?",
    constructor: class else_if extends Rule.BlockStatement {
      toSource() {
        let { condition, statement, block } = this.results;
  //			if (statement && block) throw new SyntaxError("else if may only have inline statement OR block");
        let statements = Rule.Block.encloseStatements(statement, block);
        return `else if (${condition}) ${statements}`
      }
    },
    tests: [
      {
        title: "correctly matches single-line else_if blocks",
        compileAs: "statement",
        tests: [
          ["else if a then", "else if (a) {}"],
          ["else if a then b = 1", "else if (a) { b = 1 }"],
          ["else if a: b = 1", "else if (a) { b = 1 }"],
        ]
      },
      {
//TESTME: test nested blocks
        title: "correctly matches multi-line else_if blocks",
        compileAs: "statements",
        tests: [
          ["", ""],
          ["", ""],
          ["", ""],
          ["", ""],
        ]
      },
    ]
  },

  {
    name: "else",
    alias: "statement",
    syntax: "(else|otherwise) (:)? {statement}?",
    constructor: class else_ extends Rule.BlockStatement {
      toSource() {
        let { statement, block } = this.results;
  //			if (statement && block) throw new SyntaxError("else if may only have inline statement OR block");
        let statements = Rule.Block.encloseStatements(statement, block);
        return `else ${statements}`
      }
    },
    tests: [
      {
        title: "correctly matches single-line else blocks",
        compileAs: "statement",
        tests: [
          ["else", "else {}"],
          ["otherwise", "else {}"],
          ["else b = 1", "else { b = 1 }"],
        ]
      },
      {
//TESTME: test nested blocks
        title: "correctly matches multi-line else blocks",
        compileAs: "statement",
        tests: [
          ["", ""],
          ["", ""],
          ["", ""],
          ["", ""],
        ]
      },
    ]
  }
);
