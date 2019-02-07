//
//	# Rules for infix and prefix operators.
//

import Parser from "../../Parser";
import Rule from "../../Rule";

// Create "operators" parser context.
const parser = Parser.forName("operators");
export default parser;

parser.defineRules(
  // TODO:
  // 	// Find best match according to operator precedence as defined below.
  // 	getBestMatch(matches) {
  // 		console.warn("GBM", matches, matches.map(match => match.precedence), matches.map(match => match.matchedText));
  // 		return matches.reduce(function (best, next) {
  // 			// take highest precedence match first
  // 			if (next.precedence > best.precedence) return next;
  // 			// take longest match if same precedence
  // 			if (next.precedence === best.precedence) {
  // 				if (next.endIndex > best.endIndex) return next;
  // 			}
  // 			return best;
  // 		}, matches[0]);
  // 	}


  {
    name: "infix_operator_expression",
    alias: "expression",
    syntax: "{lhs:expression} {operator:infix_operator} {rhs:expression}",
    leftRecursive: true,
    testRule: "infix_operator",
    constructor: class infix_operator_expression extends Rule.Sequence {
      toSource(context) {
        let { lhs, rhs, operator } = this.results;
        return operator.apply(lhs.toSource(context), rhs.toSource(context));
      }
    }
  },

  //## Infix operators:   `{lhs} <operator> {rhs}`, eg: `a is 1`
  // NOTE: `operator.apply` MUST return a function which transforms two arguments (`lhs` and `rhs`) into output.
  // NOTE: `precedence` numbers come from Javascript equivalents
  //		 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
  {
    name: "infix_operator",
    precedence: 6,
    syntax: "and",
    constructor: class and extends Rule.Keywords {
      apply(a,b) { return `(${a} && ${b})` }
    }
  },

  {
    name: "infix_operator",
    precedence: 5,
    syntax: "or",
    constructor: class or extends Rule.Keywords {
      apply(a,b) { return `(${a} || ${b})` }
    }
  },

  {
    name: "infix_operator",
    precedence: 10,
    syntax: "is",
    constructor: class is extends Rule.Keywords {
      apply(a,b) { return `(${a} == ${b})` }
    }
  },

  {
    name: "infix_operator",
    precedence: 10,
    syntax: "is not",
    constructor: class is_not extends Rule.Keywords {
      apply(a,b) { return `(${a} != ${b})` }
    }
  },

  {
    name: "infix_operator",
    precedence: 10,
    syntax: "is exactly",
    constructor: class is_exactly extends Rule.Keywords {
      apply(a,b) { return `(${a} === ${b})` }
    }
  },
  {
    name: "infix_operator",
    precedence: 10,
    syntax: "is not exactly",
    constructor: class is_not_exactly extends Rule.Keywords {
      apply(a,b) { return `(${a} !== ${b})` }
    }
  },

  //TODO: `spell.isOfType(thing, type)`
  //TODO: `is same type as` ?
  {
    name: "infix_operator",
    precedence: 11,
    syntax: [
      "is a",
      "is an"
    ],
    constructor: class is_a extends Rule.Keywords {
      apply(thing, type) { return `spell.isOfType(${thing}, '${type}')` }
    }
  },

  {
    name: "infix_operator",
    precedence: 11,
    syntax: [
      "is not a",
      "is not an"
    ],
    constructor: class is_not_a extends Rule.Keywords {
      apply(thing, type) { return `!spell.isOfType(${thing}, '${type}')` }
    }
  },

  //TODO: `spell.contains(collection, thing)`
  {
    name: "infix_operator",
    precedence: 11,
    syntax: [
      "is in",
      "is one of"
    ],
    constructor: class is_in extends Rule.Keywords {
      apply(thing, list) { return `${list}.includes(${thing})` }
    }
  },

  {
    name: "infix_operator",
    precedence: 11,
    syntax: [
      "is not in",
      "is not one of"
    ],
    constructor: class is_not_in extends Rule.Keywords {
      apply(thing, list) { return `!${list}.includes(${thing})` }
    }
  },



  {
    name: "infix_operator",
    precedence: 11,
    syntax: [
      "includes",
      "contains"
    ],
    constructor: class includes extends Rule.Keywords {
      apply(list, thing) { return `${list}.includes(${thing})` }
    }
  },

  {
    name: "infix_operator",
    precedence: 11,
    syntax: [
      "does not include",
      "does not contain"
    ],
    constructor: class does_not_include extends Rule.Keywords {
      apply(list, thing) { return `!${list}.includes(${thing})` }
    }
  },


  {
    name: "infix_operator",
    precedence: 11,
    syntax: ">",
    constructor: class gt extends Rule.Symbols {
      apply(a,b) { return`(${a} > ${b})` }
    }
  },
  {
    name: "infix_operator",
    precedence: 11,
    syntax: "is greater than",
    constructor: class is_gt extends Rule.Keywords {
      apply(a,b) { return`(${a} > ${b})` }
    }
  },

  {
    name: "infix_operator",
    precedence: 11,
    syntax: ">=",
    constructor: class gte extends Rule.Symbols {
      apply(a,b) { return`(${a} >= ${b})` }
    }
  },
  {
    name: "infix_operator",
    precedence: 11,
    syntax: "is greater than or equal to",
    constructor: class is_gte extends Rule.Keywords {
      apply(a,b) { return`(${a} >= ${b})` }
    }
  },

  {
    name: "infix_operator",
    precedence: 11,
    syntax: "<",
    constructor: class lt extends Rule.Symbols {
      apply(a,b) { return`(${a} < ${b})` }
    }
  },
  {
    name: "infix_operator",
    precedence: 11,
    syntax: "is less than",
    constructor: class is_lt extends Rule.Keywords {
      apply(a,b) { return`(${a} < ${b})` }
    }
  },

  {
    name: "infix_operator",
    precedence: 11,
    syntax: "<=",
    constructor: class lte extends Rule.Symbols {
      apply(a,b) { return`(${a} <= ${b})` }
    }
  },
  {
    name: "infix_operator",
    precedence: 11,
    syntax: "is less than or equal to",
    constructor: class is_lte extends Rule.Keywords {
      apply(a,b) { return`(${a} <= ${b})` }
    }
  },


  {
    name: "infix_operator",
    precedence: 13,
    syntax: "\\+",
    constructor: class plus extends Rule.Symbols {
      apply(a,b) { return`${a} + ${b}` }
    }
  },
  {
    name: "infix_operator",
    precedence: 13,
    syntax: "plus",
    constructor: class plus extends Rule.Keywords {
      apply(a,b) { return`${a} + ${b}` }
    }
  },

  {
    name: "infix_operator",
    precedence: 13,
    syntax: "-",
    constructor: class minus extends Rule.Symbols {
      apply(a,b) { return`${a} - ${b}` }
    }
  },
  {
    name: "infix_operator",
    precedence: 13,
    syntax: "minus",
    constructor: class minus extends Rule.Keywords {
      apply(a,b) { return`${a} - ${b}` }
    }
  },

  {
    name: "infix_operator",
    precedence: 14,
    syntax: "\\*",
    constructor: class times extends Rule.Symbols {
      apply(a,b) { return`${a} * ${b}` }
    }
  },
  {
    name: "infix_operator",
    precedence: 14,
    syntax: "times",
    constructor: class times extends Rule.Keywords {
      apply(a,b) { return`${a} * ${b}` }
    }
  },

  {
    name: "infix_operator",
    precedence: 14,
    syntax: "/",
    constructor: class divided_by extends Rule.Symbols {
      apply(a,b) { return`${a} / ${b}` }
    }
  },
  {
    name: "infix_operator",
    precedence: 14,
    syntax: "divided by",
    constructor: class divided_by extends Rule.Keywords {
      apply(a,b) { return`${a} / ${b}` }
    }
  },

  //TODO:  `+=` etc?  other math functions?


  //
  //
  //## Postifx operators:   `{lhs} <operator>`, e.g. `a is defined`
  // NOTE: `operator.apply` MUST return a function which transforms argument (`lhs`) into JS output.

  {
    name: "postfix_operator_expression",
    alias: "expression",
    syntax: "{expression} {operator:postfix_operator}",
    leftRecursive: true,
    testRule: "postfix_operator",
    constructor: class postfix_operator_expresion extends Rule.Sequence {
      toSource(context) {
        let { expression, operator } = this.results;
        return operator.apply(expression.toSource(context));
      }
    }
  },

  {
    name: "postfix_operator",
    syntax: "is defined",
    constructor: class is_defined extends Rule.Keywords {
      apply(thing) { return `(typeof ${thing} !== 'undefined')` }
    }
  },
  {
    name: "postfix_operator",
    syntax: [
      "is undefined",
      "is not defined"
    ],
    constructor: class is_undefined extends Rule.Keywords {
      apply(thing) { return `(typeof ${thing} === 'undefined')` }
    }
  },

  //TODO: `spell.isEmpty(thing)`
  {
    name: "postfix_operator",
    syntax: "is empty",
    constructor: class is_empty extends Rule.Keywords {
      apply(thing) { return `spell.isEmpty(${thing})` }
    }
  },
  {
    name: "postfix_operator",
    syntax: "is not empty",
    constructor: class is_not_empty extends Rule.Keywords {
      apply(thing) { return `!spell.isEmpty(${thing})` }
    }
  },

);
