//
//  # Rules for infix and prefix operators.
//

import {
  Rule,
  SpellParser,
  peek
} from "../all.js";

const parser = new SpellParser({ module: "operators" });
export default parser;


// Parenthesized expression
parser.defineRule({
  name: "parenthesized_expression",
  alias: ["expression", "single_expression"],
  syntax: "\\( {expression} \\)",
  testRule: "\\(",
  compile(scope, match) {
    let { expression } = match.results;
    // don't double parens if not necessary
    if (
      typeof expression === "string" &&
      expression.startsWith("(") &&
      expression.endsWith(")")
    )
      return expression;
    return "(" + expression + ")";
  },
  tests: [
    {
      title: "correctly matches parenthesized expressions",
      tests: [
        ["(someVar)", "(someVar)"],
        ["((someVar))", "(someVar)"],
        ["(1 and yes)", "(1 && true)"]
      ]
    },
    {
      title: "correctly matches multiple parenthesis",
      compileAs: "expression",
      tests: [
        ["(1) and (yes)", "((1) && (true))"],
        ["((1) and (yes))", "((1) && (true))"],
        ["((1) and ((yes)))", "((1) && (true))"]
      ]
    },
    {
      title: "doesn't match malformed parenthesized expressions",
      tests: [["(foo", undefined], ["(foo(bar)baz", undefined]]
    }
  ]
});


parser.defineRule({
  name: "compound_expression",
  alias: "expression",
  precedence: 12,
  syntax: "{lhs:single_expression} {?:rhs:expression_suffix}+",
//  testRule: "…{recursive_expression_test}",
  compile(scope, match) {
    const { results, matched } = match;
//    scope.debug("compiling recursive expression: ", results);

    // Iterate through the rhs expressions, using a variant of the shunting-yard algorithm
    //  to deal with operator precedence.  Note that we assume:
    //  - all infix operators are `left-to-right` associative, and
    //  - all postfix operators are postfix operators.
    // See: https://en.wikipedia.org/wiki/Shunting-yard_algorithm
    // See: https://www.chris-j.co.uk/parsing.php
    const output = [ results.lhs ];
    const opStack = [];
    const rhsExpressions = matched[1].matched;
    rhsExpressions.forEach(rhsMatch => {
      const rhs = rhsMatch.compile();
      const rule = rhsMatch.rule;
//      scope.group("processing rhs: ", rhs, "for rule: ", rule.name);

      // For a unary postfix operator, `rhs` will be the operator text that was matched
      if (typeof rhs === "string") {
        const args = {
          operator: rhs,
          lhs: output.pop()
        }
        const result = this.applyOperatorToRule(rule, args, scope);
        output.push(result);
      }
      // If it's a binary operator, `rhs` will be an object: `{ operator?, expression }`
      else {
        const { operator, expression } = rhs;
        // While top operator on stack is higher precedence than this one
        while (peek(opStack)?.rule.precedence >= rule.precedence) {
          // pop the top operator and compile it with top 2 things on the output stack
          const { operator, rule: topRule } = opStack.pop();
          const args = {
            operator,
            rhs: output.pop(),
            lhs: output.pop()
          }
          const result = this.applyOperatorToRule(topRule, args, scope);
          // push the result into the output stream
          output.push(result);
        }

        // Push the current operator and expression
        opStack.push({ rule, operator });
        output.push(expression);

//        scope.debug("output: ", [...output], "opStack: ", [...opStack]);
//        scope.groupEnd();
      }
    });

    // At this point, we have only binary operators in the stack.
    // Run through them
    let topOp;
    while ((topOp = opStack.pop())) {
      const args = {
        operator: topOp.operator,
        rhs: output.pop(),
        lhs: output.pop(),
      }
      const result = this.applyOperatorToRule(topOp.rule, args, scope);
      output.push(result);
    }
//     if (output.length > 1) {
//       scope.warn(`compound_expression() ended up with more than one output:`, output);
//     }
    return output[0];
  },

  applyOperatorToRule(rule, args, scope) {
    const result = rule.applyOperator(args);
//    scope.debug("compiled ", args, "got result ", result);
    return result;
  },
  // test multiple infix expressions in a row
  tests: [
    {
      title: "complex math expressions",
      compileAs: "expression",
      tests: [
        ["1 + 2 + 3", "((1 + 2) + 3)"],
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
  name: "and",
  alias: "expression_suffix",
  syntax: "(operator:and) {expression:single_expression}",
  precedence: 6,
  applyOperator: ({ lhs, rhs }) => `(${lhs} && ${rhs})`,
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a and b", "(a && b)"],
        ["a and b and c", "((a && b) && c)"],
        ["a is 1 and b is 2", "((a == 1) && (b == 2))"]
      ],
    }
  ]
});

parser.defineRule({
  name: "or",
  alias: "expression_suffix",
  syntax: "(operator:or) {expression:single_expression}",
  precedence: 5,
  applyOperator: ({ lhs, rhs }) => `(${lhs} || ${rhs})`,
  tests: [
    {
      compileAs: "expression",
      tests: [["a or b", "(a || b)"]]
    }
  ]
});


parser.defineRule({
  name: "is",
  alias: "expression_suffix",
  precedence: 10,
  syntax: "(operator:is not?) {expression:single_expression}",
  applyOperator({ lhs, operator, rhs }) {
    const op = (operator === "is not" ? "!=" : "==");
    return `(${lhs} ${op} ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a is b", "(a == b)"],
        ["a is not b", "(a != b)"]
      ]
    }
  ]
});


parser.defineRule({
  name: "is_exactly",
  alias: "expression_suffix",
  precedence: 10,
  syntax: "(operator:is not? exactly) {expression:single_expression}",
  applyOperator({ lhs, operator, rhs }) {
    const op = (operator === "is not exactly" ? "!==" : "===");
    return `(${lhs} ${op} ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a is exactly b", "(a === b)"],
        ["a is not exactly b", "(a !== b)"]
      ]
    }
  ]
});


parser.defineRule({
  name: "is_a",
  alias: "expression_suffix",
  precedence: 11,
  syntax: "(operator:is not? (a|an)) {expression:single_expression}",
  applyOperator({ lhs, operator, rhs }) {
    const bang = (operator.includes("not") ? "!" : "");
    return `${bang}spell.isOfType(${lhs}, '${rhs}')`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a is a B", "spell.isOfType(a, 'B')"],
        ["a is an A", "spell.isOfType(a, 'A')"],
        ["a is not a B", "!spell.isOfType(a, 'B')"],
        ["a is not an A", "!spell.isOfType(a, 'A')"]
      ]
    }
  ]
});

parser.defineRule({
  name: "is_same_type_as",
  alias: "expression_suffix",
  precedence: 11,
  syntax: "(operator:is not? the same type as) {expression:single_expression}",
  applyOperator({ lhs, operator, rhs }) {
    const op = (operator.includes("not") ? "!==" : "===");
    return `(spell.typeOf(${lhs}) ${op} spell.typeOf(${rhs}))`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a is the same type as b", "(spell.typeOf(a) === spell.typeOf(b))"],
        ["a is not the same type as b", "(spell.typeOf(a) !== spell.typeOf(b))"]
      ]
    }
  ]
});

parser.defineRule({
  name: "is_in_operator",
  syntax: "is (not? in|not? one of|either|not either of?|neither)",
  constructor: Rule.LiteralSequence
});

parser.defineRule({
  name: "is_in",
  alias: "expression_suffix",
  precedence: 11,
  syntax: "{operator:is_in_operator} (expression:{single_expression}|{identifier_list})",
  applyOperator({ lhs, operator, rhs }) {
    if (Array.isArray(rhs)) rhs = `[${rhs.join(", ")}]`;
    const bang = (operator.includes("not") || operator.includes("neither") ? "!" : "");
    return `${bang}spell.includes(${rhs}, ${lhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a is in theList", "spell.includes(theList, a)"],
        ["a is one of theList", "spell.includes(theList, a)"],
        ["a is not in theList", "!spell.includes(theList, a)"],
        ["a is not one of theList", "!spell.includes(theList, a)"],
        ["a is either a or b", "spell.includes([a, b], a)"],
        ["a is not either a or b", "!spell.includes([a, b], a)"],
        ["a is not either of a or b", "!spell.includes([a, b], a)"],
        ["a is neither a nor b", "!spell.includes([a, b], a)"],
      ]
    }
  ]
});

parser.defineRule({
  name: "includes",
  alias: "expression_suffix",
  precedence: 11,
  syntax: "(operator:includes|contains) {expression:single_expression}",
  applyOperator({ lhs, rhs }) {
    if (Array.isArray(lhs)) lhs = `[${lhs.join(", ")}]`;
    return `spell.includes(${lhs}, ${rhs})`
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
  alias: "expression_suffix",
  precedence: 11,
  syntax: "(operator:does not (include|contain)) {expression:single_expression}",
  applyOperator({ lhs, rhs }) {
    if (Array.isArray(lhs)) lhs = `[${lhs.join(", ")}]`;
    return `!spell.includes(${lhs}, ${rhs})`
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
  name: "is_defined",
  alias: "expression_suffix",
  precedence: 11,
  syntax: "is (defined|undefined|not defined)",
  constructor: Rule.LiteralSequence,
  applyOperator({ lhs, operator }) {
    const op = (operator === "is defined" ? "!==" : "===");
    return `(typeof ${lhs} ${op} 'undefined')`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a is defined", "(typeof a !== 'undefined')"],
        ["a is undefined", "(typeof a === 'undefined')"],
        ["a is not defined", "(typeof a === 'undefined')"]
      ]
    }
  ]
});


parser.defineRule({
  name: "is_empty",
  alias: "expression_suffix",
  precedence: 11,
  syntax: "is not? empty",
  applyOperator({ lhs, operator }) {
    const bang = (operator.includes("not") ? "!" : "");
    return `${bang}spell.isEmpty(${lhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["thing is empty", "spell.isEmpty(thing)"],
        ["thing is not empty", "!spell.isEmpty(thing)"]
      ]
    }
  ]
});
