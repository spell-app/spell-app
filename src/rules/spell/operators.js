//
//  # Rules for infix and prefix operators.
//

import Parser from "../../Parser";
import Rule from "../../Rule";

// Create "operators" parser.
const parser = Parser.forModule("operators");
export default parser;

parser.defineRules(
  // TODO:
  //   // Find best match according to operator precedence as defined below.
  //   getBestMatch(matches) {
  //     console.warn("GBM", matches, matches.map(match => match.precedence), matches.map(match => match.matchedText));
  //     return matches.reduce(function (best, next) {
  //       // take highest precedence match first
  //       if (next.precedence > best.precedence) return next;
  //       // take longest match if same precedence
  //       if (next.precedence === best.precedence) {
  //         if (next.endIndex > best.endIndex) return next;
  //       }
  //       return best;
  //     }, matches[0]);
  //   }

  {
    name: "infix_operator_expression",
    alias: "expression",
    syntax: "{lhs:expression} {operator:infix_operator} {rhs:expression}",
    leftRecursive: true,
    testRule: "infix_operator",
    constructor: class infix_operator_expression extends Rule.Sequence {
      toSource() {
        let { lhs, rhs, _operator } = this.results;
        return _operator.applyOperator(lhs, rhs);
      }

      get precedence() {
        if (!this.matched)
          throw new SyntaxError(
            "infix_operator_expression: trying to look up precedence when not parsed!"
          );
        const { _operator } = this.results;
        return _operator.precedence;
      }
    }
  },

  //## Infix operators:   `{lhs} <operator> {rhs}`, eg: `a is 1`
  // NOTE: `operator.applyOperator` MUST return a function which transforms two arguments (`lhs` and `rhs`) into output.
  // NOTE: `precedence` numbers come from Javascript equivalents
  //     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
  {
    name: "and",
    alias: ["infix_operator"],
    precedence: 6,
    syntax: "and",
    constructor: class and extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} && ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a and b", "(a && b)"]]
      }
    ]
  },

  {
    name: "or",
    alias: ["infix_operator"],
    precedence: 5,
    syntax: "or",
    constructor: class or extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} || ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a or b", "(a || b)"]]
      }
    ]
  },

  {
    name: "is",
    alias: ["infix_operator"],
    precedence: 10,
    syntax: "is",
    constructor: class is extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} == ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a is b", "(a == b)"]]
      }
    ]
  },

  {
    name: "is_not",
    alias: ["infix_operator"],
    precedence: 10,
    syntax: "is not",
    constructor: class is_not extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} != ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a is not b", "(a != b)"]]
      }
    ]
  },

  {
    name: "is_exactly",
    alias: ["infix_operator"],
    precedence: 10,
    syntax: "is exactly",
    constructor: class is_exactly extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} === ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a is exactly b", "(a === b)"]]
      }
    ]
  },
  {
    name: "is_not_exactly",
    alias: ["infix_operator"],
    precedence: 10,
    syntax: "is not exactly",
    constructor: class is_not_exactly extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} !== ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a is not exactly b", "(a !== b)"]]
      }
    ]
  },

  //FIXME: no validation that `type` is a legal JS type
  //TODO: `is same type as` ?
  {
    name: "is_a",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: ["is a", "is an"],
    constructor: class is_a extends Rule.Keywords {
      applyOperator(thing, type) {
        return `spell.isOfType(${thing}, '${type}')`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a is a B", "spell.isOfType(a, 'B')"], ["a is an A", "spell.isOfType(a, 'A')"]]
      }
    ]
  },

  {
    name: "is_not_a",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: ["is not a", "is not an"],
    constructor: class is_not_a extends Rule.Keywords {
      applyOperator(thing, type) {
        return `!spell.isOfType(${thing}, '${type}')`;
      }
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
  },

  //TODO: `spell.contains(collection, thing)`
  {
    name: "is_in",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: ["is in", "is one of"],
    constructor: class is_in extends Rule.Keywords {
      applyOperator(thing, list) {
        return `spell.includes(${list}, ${thing})`;
      }
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
  },

  {
    name: "is_not_in",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: ["is not in", "is not one of"],
    constructor: class is_not_in extends Rule.Keywords {
      applyOperator(thing, list) {
        return `!spell.includes(${list}, ${thing})`;
      }
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
  },

  {
    name: "includes",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: ["includes", "contains"],
    constructor: class includes extends Rule.Keywords {
      applyOperator(list, thing) {
        return `spell.includes(${list}, ${thing})`;
      }
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
  },

  {
    name: "does_not_include",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: ["does not include", "does not contain"],
    constructor: class does_not_include extends Rule.Keywords {
      applyOperator(list, thing) {
        return `!spell.includes(${list}, ${thing})`;
      }
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
  },

  {
    name: "gt",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: ">",
    constructor: class gt extends Rule.Symbols {
      applyOperator(a, b) {
        return `(${a} > ${b})`;
      }
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
  },
  {
    name: "is_gt",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: "is greater than",
    constructor: class is_gt extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} > ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a is greater than b", "(a > b)"]]
      }
    ]
  },

  {
    name: "gte",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: ">=",
    constructor: class gte extends Rule.Symbols {
      applyOperator(a, b) {
        return `(${a} >= ${b})`;
      }
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
  },
  {
    name: "is_gte",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: "is greater than or equal to",
    constructor: class is_gte extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} >= ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a is greater than or equal to b", "(a >= b)"]]
      }
    ]
  },

  {
    name: "lt",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: "<",
    constructor: class lt extends Rule.Symbols {
      applyOperator(a, b) {
        return `(${a} < ${b})`;
      }
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
  },
  {
    name: "is_lt",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: "is less than",
    constructor: class is_lt extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} < ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a is less than b", "(a < b)"]]
      }
    ]
  },

  {
    name: "lte",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: "<=",
    constructor: class lte extends Rule.Symbols {
      applyOperator(a, b) {
        return `(${a} <= ${b})`;
      }
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
  },

  {
    name: "is_lte",
    alias: ["infix_operator"],
    precedence: 11,
    syntax: "is less than or equal to",
    constructor: class is_lte extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} <= ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a is less than or equal to b", "(a <= b)"]]
      }
    ]
  },

  {
    name: "plus_symbol",
    alias: ["infix_operator"],
    precedence: 13,
    syntax: "\\+",
    constructor: class plus_symbol extends Rule.Symbols {
      applyOperator(a, b) {
        return `(${a} + ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a+b", "(a + b)"], ["a + b", "(a + b)"]]
      }
    ]
  },
  {
    name: "plus",
    alias: ["infix_operator"],
    precedence: 13,
    syntax: "plus",
    constructor: class plus extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} + ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a plus b", "(a + b)"]]
      }
    ]
  },

  {
    name: "minus_symbol",
    alias: ["infix_operator"],
    precedence: 13,
    syntax: "-",
    constructor: class minus_symbol extends Rule.Symbols {
      applyOperator(a, b) {
        return `(${a} - ${b})`;
      }
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
  },
  {
    name: "minus",
    alias: ["infix_operator"],
    precedence: 13,
    syntax: "minus",
    constructor: class minus extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} - ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a minus b", "(a - b)"]]
      }
    ]
  },

  {
    name: "times_sumbol",
    alias: ["infix_operator"],
    precedence: 14,
    syntax: "\\*",
    constructor: class times extends Rule.Symbols {
      applyOperator(a, b) {
        return `(${a} * ${b})`;
      }
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
  },
  {
    name: "times",
    alias: ["infix_operator"],
    precedence: 14,
    syntax: "times",
    constructor: class times extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} * ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a times b", "(a * b)"]]
      }
    ]
  },

  {
    name: "division_symbol",
    alias: ["infix_operator"],
    precedence: 14,
    syntax: "/",
    constructor: class divided_by extends Rule.Symbols {
      applyOperator(a, b) {
        return `(${a} / ${b})`;
      }
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
  },
  {
    name: "divided_by",
    alias: ["infix_operator"],
    precedence: 14,
    syntax: "divided by",
    constructor: class divided_by extends Rule.Keywords {
      applyOperator(a, b) {
        return `(${a} / ${b})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a divided by b", "(a / b)"]]
      }
    ]
  },

  //
  //## Postifx operators:   `{lhs} <operator>`, e.g. `a is defined`
  // NOTE: `operator.applyOperator` MUST return a function which transforms argument (`lhs`) into JS output.

  {
    name: "postfix_operator_expression",
    alias: "expression",
    syntax: "{expression} {operator:postfix_operator}",
    leftRecursive: true,
    testRule: "postfix_operator",
    constructor: class postfix_operator_expresion extends Rule.Sequence {
      toSource() {
        let { expression, _operator } = this.results;
        return _operator.applyOperator(expression);
      }
    }
  },

  {
    name: "is_defined",
    alias: ["postfix_operator"],
    syntax: "is defined",
    constructor: class is_defined extends Rule.Keywords {
      applyOperator(thing) {
        return `(typeof ${thing} !== 'undefined')`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["a is defined", "(typeof a !== 'undefined')"]]
      }
    ]
  },
  {
    name: "is_undefined",
    alias: ["postfix_operator"],
    syntax: [
      //FIXME      "is undefined",   // conflicts with `undefined` as expression from core
      "is not defined"
    ],
    constructor: class is_undefined extends Rule.Keywords {
      applyOperator(thing) {
        return `(typeof ${thing} === 'undefined')`;
      }
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
  },

  {
    name: "is_empty",
    alias: ["postfix_operator"],
    syntax: "is empty",
    constructor: class is_empty extends Rule.Keywords {
      applyOperator(thing) {
        return `spell.isEmpty(${thing})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["thing is empty", "spell.isEmpty(thing)"]]
      }
    ]
  },
  {
    name: "is_not_empty",
    alias: ["postfix_operator"],
    syntax: "is not empty",
    constructor: class is_not_empty extends Rule.Keywords {
      applyOperator(thing) {
        return `!spell.isEmpty(${thing})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["thing is not empty", "!spell.isEmpty(thing)"]]
      }
    ]
  },

  //
  //## Prefix operators:   `<operator> {lhs}`, e.g. `round theList`
  // NOTE: `operator.applyOperator` MUST return a function which transforms argument (`lhs`) into JS output.

  {
    name: "absolute_value",
    alias: "expression",
    //FIXME: make `the` optional
    syntax: "the absolute value of {expression}",
    constructor: class absolute_value extends Rule.Sequence {
      toSource() {
        const { expression } = this.results;
        return `Math.abs(${expression})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["the absolute value of thing", "Math.abs(thing)"]]
      }
    ]
  },

  {
    name: "max",
    alias: "expression",
    //FIXME: "the?"
    syntax: "(max|maximum|largest|biggest) {identifier}? (of|in) {expression}",
    constructor: class max extends Rule.Sequence {
      toSource() {
        const { expression } = this.results;
        // TODO: Math.max() doesn't work when passed an array... :-(
        return `spell.max(${expression})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [
          ["max of thing", "spell.max(thing)"],
          ["max in thing", "spell.max(thing)"],
          ["maximum of thing", "spell.max(thing)"],
          ["largest of thing", "spell.max(thing)"],
          ["biggest in thing", "spell.max(thing)"],
          ["biggest item in thing", "spell.max(thing)"]
        ]
      }
    ]
  },

  {
    name: "min",
    alias: "expression",
    //FIXME: "the?"
    syntax: "(min|minimum|smallest|least) {identifier}? (of|in) {expression}",
    constructor: class min extends Rule.Sequence {
      toSource() {
        const { expression } = this.results;
        // TODO: Math.min() doesn't work when passed an array... :-(
        return `spell.min(${expression})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [
          ["min of thing", "spell.min(thing)"],
          ["min in thing", "spell.min(thing)"],
          ["minimum of thing", "spell.min(thing)"],
          ["smallest of thing", "spell.min(thing)"],
          ["least of thing", "spell.min(thing)"],
          ["smallest item in thing", "spell.min(thing)"]
        ]
      }
    ]
  },

  //
  //## "surrounding" operator expressions:   `round thing down`
  //

  {
    name: "round_up_or_down",
    alias: "expression",
    syntax: "round {thing:expression} (direction:off|up|down)?",
    constructor: class round_up_or_down extends Rule.Sequence {
      toSource() {
        const { thing, direction } = this.results;
        if (direction === "up") return `Math.ceil(${thing})`;
        else if (direction === "down") return `Math.floor(${thing})`;
        else return `Math.round(${thing})`;
      }
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
  }
);
