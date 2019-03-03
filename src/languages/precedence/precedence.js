//
// # Super simple language for understanding precedence and recursion with expressions.
//
//  Secret seems to be:
//  - Any recursive expression is ONLY looking for a non-recursive expression,
//      e.g. `the {identifier} of {non_recursive_expression}`
//
//  - UNLESS it is deliberately "resetting the rules",
//      e.g. `\\( {expression} \\)`
//
//  - Only have ONE recursive_expression (for efficiency) as:
//      e.g.  `{rhs:non_recursive_expression} {lhs:recursive_expression_rhs}+`
//
//  - Infix operators: `<expression> is <expression>`
//    or Postfix ops:  `<expression> is empty`
//    are `recursive_expression_rhs` entities
//    and will get a `applyOperator({ lhs, operator?, rhs})` call to combine the bits.
//
//    Note that they should be structured like:
//        `(operator:and) {expression:non_recursive_expression}`    (infix operators)
//    or
//        `is not? empty`  (postfix operators)
//    or, for literal sequences of varying length, use
//        `syntax: `is (undefined|not defined)`, constructor Rule,LiteralSequence`
//

// TODO: shunting-yard algorithm.  May be cleaner to do `infix_operator` vs `and_expression`?
// TODO: is it really `non_operator_expression` ???
// TODO: test repeating lists, `\\[ [{expression},] \\]`
// TODO: test `the number of {identifer} in {non_recursive_expression}

import sortBy from "lodash/sortBy";

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
  precedence: 11,
  syntax: "the {identifier} of {expression:non_recursive_expression}",
  compile(match, scope) {
    const { identifier, expression } = match.results;
    return `${expression}.${identifier}`;
  }
});


/////////////////////
//
// Generic recursive expression
//

parser.defineRule({
  name: "recursive_expression",
  alias: "expression",
  precedence: 12,
  syntax: "{lhs:non_recursive_expression} {rhs:recursive_expression_rhs}+",
//  testRule: "…{recursive_expression_test}",
  compile(match, scope) {
    const { results, matched } = match;
    // iterate through the rhs expressions, mucking with the `results` above as we go
    const rhs_expressions = matched[1].matched;
    // TODO: use railyard algorithm to do precedence
    rhs_expressions.forEach(rhsMatch => {
      results.rhs = rhsMatch.compile();
      results.lhs = rhsMatch.rule.applyOperator(match, scope);
    });
    return results.lhs;
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
  name: "and_rhs",
  alias: "recursive_expression_rhs",
  precedence: 2,                                // <== precedence above `and`
  syntax: "and {expression:non_recursive_expression}",                   // <== results.rhs = { expression }
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `(${lhs} && ${rhs.expression})`;
  }
});

parser.defineRule({
  name: "or_rhs",
  alias: "recursive_expression_rhs",
  precedence: 3,                                // <== precedence above `and`
  syntax: "(operator:or) {expression:non_recursive_expression}",         // <== results.rhs = { operator: "or", expression }
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `(${lhs} || ${rhs.expression})`;
  }
});

parser.defineRule({
  name: "is_expression",
  alias: "recursive_expression_rhs",
  syntax: "(operator:is not?) {expression:non_recursive_expression}",    // <== results.rhs = { operator: "is", expression }
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

