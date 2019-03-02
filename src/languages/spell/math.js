//
//  # Rules for math-y bits.
//  NOTE: this must come after "operators"
//

import {
  Rule,
  SpellParser,
} from "./all.js";

const parser = new SpellParser({ module: "math" });
export default parser;


parser.defineRule({
  name: "gt_lt",
  alias: "infix_operator",
//  precedence: 11,
  syntax: "(<|>) =?",
  applyOperator(match, scope) {
    const { lhs, operator, rhs } = match.results;
    return `(${lhs} ${operator} ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        { title: "> with spaces", input: "a > b", output: "(a > b)" },
        { title: "> without spaces", input: "a>b", output: "(a > b)" },

        { title: "< with spaces", input: "a < b", output: "(a < b)" },
        { title: "< without spaces", input: "a<b", output: "(a < b)" },

        { title: ">= with spaces", input: "a >= b", output: "(a >= b)" },
        { title: ">= without spaces", input: "a>=b", output: "(a >= b)" },

        { title: "<= with spaces", input: "a <= b", output: "(a <= b)" },
        { title: "<= without spaces", input: "a<=b", output: "(a <= b)" }
      ]
    }
  ]
});


parser.defineRule({
  name: "is_gt_lt",
  alias: "infix_operator",
  precedence: 11,
  syntax: "(direction:is (greater|less) than) (equal_to:or equal to)?",
  testRule: "is (greater|less)",
  applyOperator(match, scope) {
    const { lhs, operator, rhs } = match.results;
    let symbol = (operator.direction.includes("greater") ? ">" : "<");
    if (operator.equal_to) symbol += "=";
    return `(${lhs} ${symbol} ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a is greater than b", "(a > b)"],
        ["a is greater than or equal to b", "(a >= b)"],
        ["a is less than b", "(a < b)"],
        ["a is less than or equal to b", "(a <= b)"],
      ]
    }
  ]
});


parser.defineRule({
  name: "arithmetic_symbols",
  alias: "infix_operator",
  precedence: 13,
  pattern: /^(\+|-|\*|\/)$/,
  applyOperator(match, scope) {
    const { lhs, operator, rhs } = match.results;
    return `(${lhs} ${operator} ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a+b", "(a + b)"],
        ["a + b", "(a + b)"],

//        ["a-b", "(a - b)"],     // NOTE: `-` requires spaces...
        ["a - b", "(a - b)"],

        ["a*b", "(a * b)"],
        ["a * b", "(a * b)"],

        ["a/b", "(a / b)"],
        ["a / b", "(a / b)"],
      ]
    }
  ]
});

parser.defineRule({
  name: "arithmetic_names",
  alias: "infix_operator",
  precedence: 13,
  syntax: "(plus|minus|times)",
  valueMap: {
    plus: "+",
    minus: "-",
    times: "*",
    "divided by": "/"
  },
  applyOperator(match, scope) {
    const { lhs, operator, rhs } = match.results;
    return `(${lhs} ${this.valueMap[operator]} ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a plus b", "(a + b)"],
        ["a minus b", "(a - b)"],
        ["a times b", "(a * b)"],
      ]
    }
  ]
});

parser.defineRule({
  name: "arithmetic_names",
  alias: "infix_operator",
  precedence: 13,
  syntax: "divided by",
  applyOperator(match, scope) {
    const { lhs, rhs } = match.results;
    return `(${lhs} / ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a divided by b", "(a / b)"],
      ]
    }
  ]
});


//
//  Random math functions
//


parser.defineRule({
  name: "absolute_value",
  alias: "expression",
  syntax: "the? absolute value of {expression}",
  testRule: "…absolute",
  compile(match, scope) {
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
  compile(match, scope) {
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
  compile(match, scope) {
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
  compile(match, scope) {
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
