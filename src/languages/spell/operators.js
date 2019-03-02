//
//  # Rules for infix and prefix operators.
//

import {
  Rule,
  SpellParser,
} from "./all.js";

const parser = new SpellParser({ module: "operators" });
export default parser;


parser.defineRule({
  name: "and_expression",
  alias: "expression",
  syntax: "{lhs:expression!and_expression} and {rhs:expression}",
  testRule: "…and",
  precedence: 2,
  // Delegate compilation down to the operator which was actually matched.
  compile(match, scope) {
    const { lhs, rhs } = match.results;
    return `(${lhs} && ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a and b", "(a && b)"],
        ["a and b and c", "(a && (b && c))"],
        ["a is 1 and b is 2", "((a == 1) && (b == 2))"]
      ],
    }
  ]
});

parser.defineRule({
  name: "or_expression",
  alias: "expression",
  syntax: "{lhs:expression!or_expression} or {rhs:expression}",
  testRule: "…or",
  precedence: 3,
  // Delegate compilation down to the operator which was actually matched.
  compile(match, scope) {
    const { lhs, rhs } = match.results;
    return `(${lhs} || ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a or b", "(a || b)"]]
    }
  ]
});

parser.defineRule({
  name: "infix_operator_expression",
  alias: "expression",
  syntax: "{lhs:expression!infix_operator_expression} {operator:infix_operator} {rhs:expression}",
  testRule: "…{infix_operator}",
  precedence: 1,
  constructor: class infix_operator_expression extends Rule.Sequence {
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      results.operatorRule = match.matched[1].rule;
      return results;
    }
    // Delegate compilation down to the operator which was actually matched.
    compile(match, scope) {
      const { operatorRule } = match.results;
      return operatorRule.applyOperator(match, scope);
    }
  },
  // test multiple infix expressions in a row
  tests: [
    {
      title: "complex math expressions",
      compileAs: "expression",
      tests: [
        ["1 + 1 + 1", "(1 + (1 + 1))"],
        ["(1+1) * (2+2)", "((1 + 1) * (2 + 2))"],
        ["((1+1) * (2+2))", "((1 + 1) * (2 + 2))"],
      ]
    },
    {
      title: "complex property/etc expressions",
      compileAs: "expression",
      tests: [
        ["the suit of the card is 'ace'", "(card?.suit == 'ace')"],
      ]
    }
  ]
});


parser.defineRule({
  name: "is",
  alias: "infix_operator",
  precedence: 10,
  syntax: "is",
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `(${lhs} == ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a is b", "(a == b)"]]
    }
  ]
});

parser.defineRule({
  name: "is_not",
  alias: "infix_operator",
  precedence: 10,
  syntax: "is not",
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `(${lhs} != ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a is not b", "(a != b)"]]
    }
  ]
});

parser.defineRule({
  name: "is_exactly",
  alias: "infix_operator",
  precedence: 10,
  syntax: "is exactly",
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `(${lhs} === ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a is exactly b", "(a === b)"]]
    }
  ]
});
parser.defineRule({
  name: "is_not_exactly",
  alias: "infix_operator",
  precedence: 10,
  syntax: "is not exactly",
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `(${lhs} !== ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a is not exactly b", "(a !== b)"]]
    }
  ]
});

parser.defineRule({
  name: "is_a",
  alias: "infix_operator",
  precedence: 11,
  syntax: "is (a|an)",
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `spell.isOfType(${lhs}, '${rhs}')`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a is a B", "spell.isOfType(a, 'B')"], ["a is an A", "spell.isOfType(a, 'A')"]]
    }
  ]
});

parser.defineRule({
  name: "is_not_a",
  alias: "infix_operator",
  precedence: 11,
  syntax: "is not (a|an)",
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `!spell.isOfType(${lhs}, '${rhs}')`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a is not a B", "!spell.isOfType(a, 'B')"],
        ["a is not an A", "!spell.isOfType(a, 'A')"]
      ]
    }
  ]
});

parser.defineRule({
  name: "is_same_type_as",
  alias: "infix_operator",
  precedence: 11,
  syntax: "is the same type as",
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `(spell.typeOf(${lhs}) === spell.typeOf(${rhs}))`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a is the same type as b", "(spell.typeOf(a) === spell.typeOf(b))"]
      ]
    }
  ]
});

parser.defineRule({
  name: "is_in",
  alias: "infix_operator",
  precedence: 11,
  syntax: "is (in|one of)",
  testRule: "is",
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `spell.includes(${rhs}, ${lhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a is in theList", "spell.includes(theList, a)"],
        ["a is one of theList", "spell.includes(theList, a)"]
      ]
    }
  ]
});

parser.defineRule({
  name: "is_not_in",
  alias: "infix_operator",
  precedence: 11,
  syntax: "is not (in|one of)",
  testRule: "is not",
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `!spell.includes(${rhs}, ${lhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a is not in theList", "!spell.includes(theList, a)"],
        ["a is not one of theList", "!spell.includes(theList, a)"]
      ]
    }
  ]
});

parser.defineRule({
  name: "includes",
  alias: "infix_operator",
  precedence: 11,
  syntax: "(includes|contains)",
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `spell.includes(${lhs}, ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["theList includes a", "spell.includes(theList, a)"],
        ["theList contains a", "spell.includes(theList, a)"]
      ]
    }
  ]
});

parser.defineRule({
  name: "does_not_include",
  alias: "infix_operator",
  precedence: 11,
  syntax: "does not (include|contain)",
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `!spell.includes(${lhs}, ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["theList does not include a", "!spell.includes(theList, a)"],
        ["theList does not contain a", "!spell.includes(theList, a)"]
      ]
    }
  ]
});


//
//## Postifx operators:   `{lhs} <operator>`, e.g. `a is defined`
// NOTE: `operator.applyOperator` MUST return a function which transforms argument (`lhs`) into JS output.

parser.defineRule({
  name: "postfix_operator_expression",
  alias: "expression",
  syntax: "{expression!postfix_operator_expression} {operator:postfix_operator}",
  precedence: 1,
  testRule: "…{postfix_operator}",
  constructor: class postfix_operator_expression extends Rule.Sequence {
    // Special `getResults` to ignore the operator.
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      results.operator = match.matched[1];
      return results;
    }
    // Delegate the compilation to the operator which was matched
    compile(match, scope) {
      const { operator } = match.results;
      return operator.rule.applyOperator(match, scope);
    }
  }
});

parser.defineRule({
  name: "is_defined",
  alias: "postfix_operator",
  syntax: "is (operator:defined|undefined|not defined)",
  testRule: "is",
  applyOperator(match, scope) {
    const { expression } = match.results;
    return `(typeof ${expression} !== 'undefined')`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a is defined", "(typeof a !== 'undefined')"]]
    }
  ]
});

/*
parser.defineRule({
  name: "is_undefined",
  alias: "postfix_operator",
  syntax: "is (undefined|not defined)",
  testRule: "is",
  applyOperator(match, scope) {
    const { expression } = match.results;
    return `(typeof ${expression} === 'undefined')`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        //          ["thing is undefined", "(typeof thing === 'undefined')"],
        ["thing is not defined", "(typeof thing === 'undefined')"]
      ]
    }
  ]
});
*/

parser.defineRule({
  name: "is_empty",
  alias: "postfix_operator",
  syntax: "is empty",
  applyOperator(match, scope) {
    const { expression } = match.results;
    return `spell.isEmpty(${expression})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["thing is empty", "spell.isEmpty(thing)"]]
    }
  ]
});
parser.defineRule({
  name: "is_not_empty",
  alias: "postfix_operator",
  syntax: "is not empty",
  applyOperator(match, scope) {
    const { expression } = match.results;
    return `!spell.isEmpty(${expression})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["thing is not empty", "!spell.isEmpty(thing)"]]
    }
  ]
});
