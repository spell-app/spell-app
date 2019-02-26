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
  constructor: class and_expression extends Rule.Sequence {},
  // Delegate compilation down to the operator which was actually matched.
  compile(match) {
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
  constructor: class and_expression extends Rule.Sequence {},
  // Delegate compilation down to the operator which was actually matched.
  compile(match) {
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
  syntax: "{lhs:expression!infix_operator_expression} {infix_operator} {rhs:expression}",
  testRule: "…{infix_operator}",
  precedence: 1,
  constructor: class infix_operator_expression extends Rule.Sequence {},
  // Special `getResults` to ignore the operator.
  getResults(match) {
    return {
      lhs: match.matched[0].compile(),
      rhs: match.matched[2].compile()
    }
  },
  // Delegate compilation down to the operator which was actually matched.
  compile(match) {
    const operatorRule = match.matched[1].rule;
    return operatorRule.compile(match);
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
        ["the suit of the card is 'ace'", "(card.suit == 'ace')"],
      ]
    }
  ]
});


parser.defineRule({
  name: "is",
  alias: "infix_operator",
  precedence: 10,
  literal: "is",
  constructor: class is extends Rule.Literal {},
  compile(match) {
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
  constructor: class is_not extends Rule.Keywords {},
  compile(match) {
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
  constructor: class is_exactly extends Rule.Keywords {},
  compile(match) {
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
  constructor: class is_not_exactly extends Rule.Keywords {},
  compile(match) {
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
  constructor: class is_a extends Rule.Keywords {},
  compile(match) {
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
  constructor: class is_not_a extends Rule.Keywords {},
  compile(match) {
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
  syntax: "is same type as",
  constructor: class is_same_type_as extends Rule.Keywords {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(spell.typeOf(${lhs}) === spell.typeOf(${rhs}))`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a is same type as b", "(spell.typeOf(a) === spell.typeOf(b))"]
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
  constructor: class is_in extends Rule.Sequence {},
  compile(match) {
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
  constructor: class is_not_in extends Rule.Sequence {},
  compile(match) {
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
  constructor: class includes extends Rule.Keyword {},
  compile(match) {
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
  constructor: class does_not_include extends Rule.Keywords {},
  compile(match) {
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

parser.defineRule({
  name: "gt",
  alias: "infix_operator",
  precedence: 11,
  literal: ">",
  constructor: class gt extends Rule.Literal {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} > ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        { title: "with spaces", input: "a > b", output: "(a > b)" },
        { title: "without spaces", input: "a>b", output: "(a > b)" }
      ]
    }
  ]
});
parser.defineRule({
  name: "is_gt",
  alias: "infix_operator",
  precedence: 11,
  syntax: "is greater than",
  constructor: class is_gt extends Rule.Keywords {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} > ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a is greater than b", "(a > b)"]]
    }
  ]
});

parser.defineRule({
  name: "gte",
  alias: "infix_operator",
  precedence: 11,
  syntax: ">=",
  constructor: class gte extends Rule.Symbols {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} >= ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        { title: "with spaces", input: "a >= b", output: "(a >= b)" },
        { title: "without spaces", input: "a>=b", output: "(a >= b)" }
      ]
    }
  ]
});
parser.defineRule({
  name: "is_gte",
  alias: "infix_operator",
  precedence: 11,
  syntax: "is greater than or equal to",
  constructor: class is_gte extends Rule.Keywords {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} >= ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a is greater than or equal to b", "(a >= b)"]]
    }
  ]
});

parser.defineRule({
  name: "lt",
  alias: "infix_operator",
  precedence: 11,
  literal: "<",
  constructor: class lt extends Rule.Literal {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} < ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        { title: "with spaces", input: "a > b", output: "(a > b)" },
        { title: "without spaces", input: "a>b", output: "(a > b)" }
      ]
    }
  ]
});
parser.defineRule({
  name: "is_lt",
  alias: "infix_operator",
  precedence: 11,
  syntax: "is less than",
  constructor: class is_lt extends Rule.Keywords {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} < ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a is less than b", "(a < b)"]]
    }
  ]
});

parser.defineRule({
  name: "lte",
  alias: "infix_operator",
  precedence: 11,
  syntax: "<=",
  constructor: class lte extends Rule.Symbols {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} <= ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        { title: "with spaces", input: "a <= b", output: "(a <= b)" },
        { title: "without spaces", input: "a<=b", output: "(a <= b)" }
      ]
    }
  ]
});

parser.defineRule({
  name: "is_lte",
  alias: "infix_operator",
  precedence: 11,
  syntax: "is less than or equal to",
  constructor: class is_lte extends Rule.Keywords {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} <= ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a is less than or equal to b", "(a <= b)"]]
    }
  ]
});

parser.defineRule({
  name: "plus_symbol",
  alias: "infix_operator",
  precedence: 13,
  literal: "+",
  constructor: class plus_symbol extends Rule.Literal {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} + ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a+b", "(a + b)"], ["a + b", "(a + b)"]]
    }
  ]
});
parser.defineRule({
  name: "plus",
  alias: "infix_operator",
  precedence: 13,
  literal: "plus",
  constructor: class plus extends Rule.Literal {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} + ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a plus b", "(a + b)"]]
    }
  ]
});

parser.defineRule({
  name: "minus_symbol",
  alias: "infix_operator",
  precedence: 13,
  literal: "-",
  constructor: class minus_symbol extends Rule.Literal {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} - ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        {
          skip: "minus requires space",
          title: "without spaces",
          input: "a-b",
          output: "(a - b)"
        },
        { title: "with spaces", input: "a - b", output: "(a - b)" }
      ]
    }
  ]
});
parser.defineRule({
  name: "minus",
  alias: "infix_operator",
  precedence: 13,
  literal: "minus",
  constructor: class minus extends Rule.Literal {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} - ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a minus b", "(a - b)"]]
    }
  ]
});

parser.defineRule({
  name: "times_sumbol",
  alias: "infix_operator",
  precedence: 14,
  literal: "*",
  constructor: class times extends Rule.Literal {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} * ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        { title: "without spaces", input: "a*b", output: "(a * b)" },
        { title: "with spaces", input: "a * b", output: "(a * b)" }
      ]
    }
  ]
});
parser.defineRule({
  name: "times",
  alias: "infix_operator",
  precedence: 14,
  literal: "times",
  constructor: class times extends Rule.Literal {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} * ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a times b", "(a * b)"]]
    }
  ]
});

parser.defineRule({
  name: "division_symbol",
  alias: "infix_operator",
  precedence: 14,
  literal: "/",
  constructor: class divided_by extends Rule.Literal {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} / ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        { title: "without spaces", input: "a/b", output: "(a / b)" },
        { title: "with spaces", input: "a / b", output: "(a / b)" }
      ]
    }
  ]
});
parser.defineRule({
  name: "divided_by",
  alias: "infix_operator",
  precedence: 14,
  syntax: "divided by",
  constructor: class divided_by extends Rule.Keywords {},
  compile(match) {
    const { lhs, rhs } = match.results;
    return `(${lhs} / ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["a divided by b", "(a / b)"]]
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
  constructor: class postfix_operator_expresion extends Rule.Sequence {},
  // Special `getResults` to ignore the operator.
  getResults(match) {
    return {
      expression: match.matched[0].compile()
    }
  },
  // Delegate the compilation to the operator which was matched
  compile(match) {
    const operatorRule = match.matched[1].rule;
    return operatorRule.compile(match);
  }
});

parser.defineRule({
  name: "is_defined",
  alias: "postfix_operator",
  syntax: "is defined",
  constructor: class is_defined extends Rule.Keywords {},
  compile(match) {
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
parser.defineRule({
  name: "is_undefined",
  alias: "postfix_operator",
  syntax: "is (undefined|not defined)",
  testRule: "is",
  constructor: class is_undefined extends Rule.Sequence {},
  compile(match) {
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

parser.defineRule({
  name: "is_empty",
  alias: "postfix_operator",
  syntax: "is empty",
  constructor: class is_empty extends Rule.Keywords {},
  compile(match) {
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
  constructor: class is_not_empty extends Rule.Keywords {},
  compile(match) {
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

//
//## Prefix operators:   `<operator> {lhs}`, e.g. `round theList`
// NOTE: `operator.applyOperator` MUST return a function which transforms argument (`lhs`) into JS output.

parser.defineRule({
  name: "absolute_value",
  alias: "expression",
  syntax: "the? absolute value of {expression}",
  testRule: "…absolute",
  constructor: class absolute_value extends Rule.Sequence {},
  compile(match) {
    const { expression } = match.results;
    return `Math.abs(${expression})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["the absolute value of thing", "Math.abs(thing)"]]
    }
  ]
});

parser.defineRule({
  name: "max",
  alias: "expression",
  precedence: 2,
  syntax: "the? (biggest|largest) {identifier}? (of|in) {expression}",
  testRule: "…(biggest|largest)",
  constructor: class max extends Rule.Sequence {},
  compile(match) {
    const { expression } = match.results;
    return `spell.max(${expression})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["largest of the numbers", "spell.max(numbers)"],
        ["biggest in my-list", "spell.max(my_list)"],
        ["biggest item in thing", "spell.max(thing)"]
      ]
    }
  ]
});

parser.defineRule({
  name: "min",
  alias: "expression",
  precedence: 2,
  syntax: "the? smallest {identifier}? (of|in) {expression}",
  testRule: "…smallest",
  constructor: class min extends Rule.Sequence {},
  compile(match) {
    const { expression } = match.results;
    return `spell.min(${expression})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["smallest of thing", "spell.min(thing)"],
        ["smallest item in thing", "spell.min(thing)"]
      ]
    }
  ]
});

parser.defineRule({
//TODO: precision:  to the nearest tenth ?
  name: "round_number",
  alias: "expression",
  syntax: "round {thing:expression} (direction:off|up|down)?",
  testRule: "round",
  precedence: 1,
  constructor: class round_number extends Rule.Sequence {},
  compile(match) {
    const { thing, direction } = match.results;
    if (direction === "up") return `Math.ceil(${thing})`;
    else if (direction === "down") return `Math.floor(${thing})`;
    else return `Math.round(${thing})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["round thing", "Math.round(thing)"],
        ["round thing off", "Math.round(thing)"],
        ["round thing up", "Math.ceil(thing)"],
        ["round thing down", "Math.floor(thing)"]
      ]
    }
  ]
});
