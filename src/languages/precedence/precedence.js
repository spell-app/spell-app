//
// # Super simple language for understanding precedence and recursion.
//

import {
  Parser,
  Rule,
  Tokenizer,
  Token
} from "../../parser/all.js";


const parser = new Parser({
  module: "precedence",
  defaultRule: "expression",
});
export default parser;


/////////////////////
//
//  Non-expressiony words
//

parser.defineRule({
  name: "identifier",
  pattern: /^[a-z][\w\-]*$/,
  blacklist: {
    the: 1,
    of: 1,
    and: 1,
    or: 1,
    is: 1,
  }
});


/////////////////////
//
// Normal, productive expression
//

parser.defineRule({
  name: "number",
  alias: ["expression", "non_recursive_expression"],
  tokenType: Token.Number,
});

parser.defineRule({
  name: "identifier_expression",
  alias: ["expression", "non_recursive_expression"],
  syntax: "the? {identifier}",
  compile(match, scope) {
    return match.results.identifier;
  }
})

parser.defineRule({
  name: "property_expression",
  alias: ["expression", "non_recursive_expression"],
  syntax: "the {identifier} of {expression}",
  compile(match, scope) {
    const { identifier, expression } = match.results;
    return `${expression}.${identifier}`;
  }
});

parser.defineRule({
  name: "parenthesized_expression",
  alias: ["expression", "non_recursive_expression"],
  syntax: "\\( {expression} \\)",
  resetRules: true,
  compile(match, scope) {
    let { expression } = match.results;
    // Don't double-up parens
    if (expression.startsWith?.("(") && expression.endsWith(")"))
      return expression;
    return `(${expression})`;
  }
});


/////////////////////
//
// Generic recursive expression
//

parser.defineRule({
  name: "recursive_expression",
  precedence: 1,
  alias: "expression",
  syntax: "{lhs:non_recursive_expression} {rhs:recursive_expression_rhs}",
//  testRule: "…{recursive_expression_test}",
  compile(match, scope) {
    return match.matched[1].rule.applyOperator(match, scope);
  }
});

parser.defineRule({ name: "recursive_expression_test", literal: "and" });
parser.defineRule({ name: "recursive_expression_test", literal: "or" });
parser.defineRule({ name: "recursive_expression_test", literal: "is" });


/////////////////////
//
// Infix operators
//

parser.defineRule({
  name: "and",
  precedence: 2,                                // <== precedence above `and`
  alias: "recursive_expression_rhs",
  syntax: "and {expression}",                   // <== results.rhs = { expression }
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `(${lhs} && ${rhs.expression})`;
  }
});

parser.defineRule({
  name: "or",
  precedence: 3,                                // <== precedence above `and`
  alias: "recursive_expression_rhs",
  syntax: "(operator:or) {expression}",         // <== results.rhs = { operator: "or", expression }
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `(${lhs} || ${rhs.expression})`;
  }
});


parser.defineRule({
  name: "is_expression",
  alias: "recursive_expression_rhs",
  syntax: "(operator:is not?) {expression}",    // <== results.rhs = { operator: "is", expression }
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    const op = rhs.operator === "is not" ? "!=" : "==";
    return `(${lhs} ${op} ${rhs.expression})`;
  }
});

/////////////////////
//
// Postfix operators
//
parser.defineRule({
  name: "is_empty",
  precedence: 1,                                  // <== precedence above `is_expression`
  alias: "recursive_expression_rhs",
  syntax: "is not? empty",                        // <== single Keywords, results.rhs = "is empty"
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    const bang = rhs === "is not empty" ? "!" : "";
    return `${bang}spell.isEmpty(${lhs})`;
  }
});


parser.defineRule({
  name: "is_defined",
  precedence: 1,                                  // <== precedence above `is_expression`
  alias: "recursive_expression_rhs",
  syntax: "is (defined|undefined|not defined)",
  constructor: Rule.LiteralSequence,              // <== LiteralSequence: result.rhs = "is defined"
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    const op = rhs === "is defined" ? "!==" : "===";
    return `(typeof ${lhs} ${op} 'undefined')`;
  }
});

