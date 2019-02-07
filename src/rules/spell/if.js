//
//	# Rules for if statements.
//

import Parser from "../../Parser";
import Rule from "../../Rule";

// Create "if" parser context.
const parser = Parser.forName("if");
export default parser;

parser.defineRules(
  {
    name: "if",
    alias: "statement",
    syntax: "if {condition:expression} (then|:)? {statement}?",
    constructor: class if_ extends Rule.BlockStatement {
      toSource(context) {
        let { condition, statement, block } = this.getMatchedSource(context);
  //			if (statement && block) throw new SyntaxError("if may only have inline statement OR block");
        let statements = Rule.Block.encloseStatements(statement, block);
        return `if (${condition}) ${statements}`;
      }
    }
  },

  // NOTE: this is NOT a block statement... ???
  {
    name: "backwards_if",
    alias: "statement",
    syntax: "{statement} if {condition:expression} (?:(else|otherwise) {elseStatement:statement})?",
    leftRecursive: true,
    testRule: new Rule.Keywords({ match: "if" }),
    constructor: class backwards_if extends Rule.Sequence {
      toSource(context) {
        let { condition, statement, elseStatement } = this.getMatchedSource(context);
        let output = `if (${condition}) { ${statement} }`;
        if (elseStatement) output += `\nelse { ${elseStatement} }`
        return output;
      }
    }
  },

  {
    name: "else_if",
    alias: "statement",
    syntax: "(else|otherwise) if {condition:expression} (then|:) {statement}?",
    constructor: class else_if extends Rule.BlockStatement {
      toSource(context) {
        let { condition, statement, block } = this.getMatchedSource(context);
  //			if (statement && block) throw new SyntaxError("else if may only have inline statement OR block");
        let statements = Rule.Block.encloseStatements(statement, block);
        return `else if (${condition}) ${statements}`
      }
    }
  },

  {
    name: "else",
    alias: "statement",
    syntax: "(else|otherwise) (:)? {statement}?",
    constructor: class else_ extends Rule.BlockStatement {
      toSource(context) {
        let { statement, block } = this.getMatchedSource(context);
  //			if (statement && block) throw new SyntaxError("else if may only have inline statement OR block");
        let statements = Rule.Block.encloseStatements(statement, block);
        return `else ${statements}`
      }
    }
  }
);
