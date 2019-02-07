import { defineMemoized } from "./memoize.js";
import Parser from "./Parser.js";
import Rule from "./Rule.js";
import global from "./utils/global";

// Clone a class, re-using the original name.
// TODO: move to utility?
function cloneClass(constructor, name = constructor.name) {
  // Clone the constructor, keeping the same name
  global.__cloneClass__ = constructor;
  const clone = new Function("name", `return class ${name} extends __cloneClass__ {}`)();
  delete global.__cloneClass__;
  return clone;
}


//
//	# Parsing `ruleSyntax` to create rules automatically.
//
// TODO:	Better name for `ruleSyntax`
// TODO:	Use keywords in syntax to make a quick regex-based `test` function for the entire rule

//
// ## group: parsing syntax
//

//TODOC
export default function parseRule(syntax, constructor) {
  // If we got an array of possible syntaxes...
  if (Array.isArray(syntax)) {
    // recursively parse each syntax, using a CLONE of the constructor
    const rules = syntax.map(syntax => parseRule(syntax, cloneClass(constructor)) );
    // return an alternatives with the correct name
    const altClass = cloneClass(Rule.Alternatives, constructor.name);
    Object.defineProperty(altClass.prototype, "rules", { value: rules });
    return new altClass();
  };

  let rules = parseSyntax(syntax, []);
  if (rules.length === 0) {
    throw new SyntaxError(`parser.defineRule(${names[0]}, ${syntax}): no rule produced`);
  }

  // Make an instance of the rule and add relevant properties to its prototype non-enumerably
  if (constructor.prototype instanceof Rule.Keyword
   || constructor.prototype instanceof Rule.Symbol
   || constructor.prototype instanceof Rule.List
   || constructor.prototype instanceof Rule.Alternatives
  ) {
    for (let property in rules[0]) {
      Object.defineProperty(constructor.prototype, property, { value: rules[0][property] });
    }
  }
  else {
    Object.defineProperty(constructor.prototype, "rules", { value: rules });
  }

  return new constructor();
}

function tokeniseRuleSyntax(syntax) {
  const SYNTAX_EXPRESSION = /(?:[\w\-]+|\\[\[\(\{\)\}\]]|[^\s\w]|\|)/g;
  let syntaxStream = syntax.match(SYNTAX_EXPRESSION);
  if (!syntaxStream) throw new SyntaxError(`Can't tokenize parse rule syntax >>${syntax}<<`);
  return syntaxStream;
}

export function parseSyntax(syntax, rules = [], start = 0) {
  if (syntax == null) throw new TypeError("parseSyntax(): `syntax` is required");
  const syntaxStream = typeof syntax === "string"
    ? tokeniseRuleSyntax(syntax)
    : syntax;

  let lastIndex = syntaxStream.length;
  while (start < lastIndex) {
    let [ rule, end ] = parseToken(syntaxStream, rules, start);
    if (rule) {
      let last = rules[rules.length-1];
      // If this is a `Symbol` and last was a `Symbol`, merge together
      if (last && last instanceof Rule.Symbol && rule instanceof Rule.Symbol) {
        // remove the last rule
        rules.pop();
        // and replace with a rule that merges the keywords
        rule.match = last.match.concat(rule.match);
      }
      rules.push(rule);
    }
    start = end + 1;
  }
  return rules;
}

const KEYWORD_PATTERN = /[A-Za-z][\w_-]*/;
function parseToken(syntaxStream, rules = [], start = 0) {
  let syntaxToken = syntaxStream[start];

  // if we got a "\\" (which also has to go into the source string as "\\")
  // treat the next token as a literal string rather than as a special character.
  if (syntaxToken === "\\") {
    return parseSymbol(syntaxStream, rules, start + 1);
  }

  switch (syntaxToken) {
    case "{":	return parseSubrule(syntaxStream, rules, start);
    case "(":	return parseAlternatives(syntaxStream, rules, start);
    case "[":	return parseList(syntaxStream, rules, start);
    case "*":
    case "+":
    case "?":	return parseRepeat(syntaxStream, rules, start);

    // the following should ALWAYS be consumed by the above
    case "}":
    case ")":
    case "]":
    case "|":
      throw new SyntaxError(`Unexpected ${syntaxToken} found as item ${start} of ${syntaxStream}`);

    default:
      if (syntaxToken.match(KEYWORD_PATTERN)) {
        return parseKeyword(syntaxStream, rules, start);
      }
      else {
        return parseSymbol(syntaxStream, rules, start);
      }
  }
}


// Match `keyword` in syntax rules.
// If more than one keyword appears in a row, combines them into a single `Keyword` object.
// This is pretty safe, unless you have an optional keyword like
//		`the {identifier} of the? {expression}`
// in which case you can put the optional keyword in parens
//		`the {identifier} of (the?) {expression}`
//
// Returns `[ rule, end ]`
// Throws if invalid.
function parseKeyword(syntaxStream, rules = [], start = 0, constructor) {
  let match = [], end;
  // eat keywords while they last
  for (var i = start; i < syntaxStream.length; i++) {
    let next = syntaxStream[i];
    if (typeof next === "string" && next.match(KEYWORD_PATTERN)) {
      match.push(next);
      end = i;
    }
    else break;
  }

  if (!constructor) constructor = Rule.Keyword;
  let rule = new constructor({ match });

  return [ rule, end ];
}

// Match `keyword` in syntax rules.
// Returns `[ rule, end ]`
// Throws if invalid.
function parseSymbol(syntaxStream, rules = [], start = 0, constructor = Rule.Symbol) {
  let string = syntaxStream[start];
  if (!constructor) constructor = Rule.Symbol;

  // If string starts with `\\`, it's an escaped literal (eg: `\[` needs to input as `\\[`).
  let isEscaped = string.startsWith("\\");
  let match = isEscaped ? string.substr(1) : string;

  let rule = new constructor({ match });

  if (isEscaped) {
    rule.toString = function() {
      return `\\${match}${this.optional ? '?' : ''}`;
    }
  }

  return [ rule, start ];
}


// Match grouping expression `(...|...)` in syntax rules.
// Returns `[ rule, end ]`
// You can specify an explicit `rule.argument` with:  `(somearg:...)`
// You can specify that the results should be `promoted` to enclosing context with: `(?:...)`
//
// NOTE: nested parens may not have alternatives... :-(   `(a|(b|c))` won't work???
function parseAlternatives(syntaxStream, rules = [], start = 0) {
  let { end, slice } = Parser.findNestedTokens(syntaxStream, "(", ")", start);

  // pull out explicit "promote" flag: `?:`
  let promote = (slice[0] === "?" && slice[1] === ":");
  if (promote) slice = slice.slice(2);

  // pull out explicit argument name
  let argument;
  if (slice.length > 2 && slice[1] === ":") {
    argument = slice[0];
    slice = slice.slice(2);
  }

  // split into groups, including nested parens
  let alternatives =
    groupAlternatives(slice)
    .map(function(group) {
      let results = parseSyntax(group, []);
      if (results.length === 1) {
        return results[0];
      }
      else {
        return new Rule.Sequence({ rules: results });
      }
    });

  let rule = alternatives.length === 1 ? alternatives[0] : new Rule.Alternatives({ rules: alternatives });
  if (argument) rule.argument = argument;
  if (promote) rule.promote = true;
  return [ rule, end ];

  function groupAlternatives(tokens) {
    let alternatives = [];
    let current = [];
    for (let i = 0, token; token = tokens[i]; i++) {
      // handle alternate marker
      if (token === "|") {
        alternatives.push(current);
        current = [];
      }
      // handle nested parens
      else if (token === "(") {
        let { end } = Parser.findNestedTokens(tokens, "(", ")", i);
        current = current.concat(tokens.slice(i, end + 1));
        i = end;
      }
      else {
        current.push(token);
      }
    }
    if (current.length) alternatives.push(current);
    return alternatives;
  }
}

// Match repeat indicator `?`, `+` or `*` by attaching it to the previous rule.
function parseRepeat(syntaxStream, rules = [], start = 0) {
  let symbol = syntaxStream[start];
  let rule = rules[rules.length - 1];
  if (!rule) throw new SyntaxError(`Can't attach repeat symbol ${symbol} to empty rule!`);

  // Transform last rule into a repeat for `*` and `+`.
  if (symbol === "*" || symbol === "+") {
    let argument = rule.argument;
    rule = new Rule.Repeat({ rule });
    if (argument) rule.argument = argument;
    // push into rule stack in place of old rule
    rules[rules.length - 1] = rule;
  }

  // Rule is optional for `?` and `*`.
  if (symbol === "?" || symbol === "*") {
    rule.optional = true;
  }

  return [ undefined, start ]
}

// Match `{<ruleName>}` in syntax rules.
// Returns `[ rule, end ]`
// Throws if invalid.
function parseSubrule(syntaxStream, rules = [], start = 0) {
  let match = Parser.findNestedTokens(syntaxStream, "{", "}", start);
  let argument;
  if (match.slice.length === 3 && match.slice[1] === ":") {
    argument = match.slice[0];
    match.slice = match.slice.slice(2);
  }
  if (match.slice.length > 1) throw new SyntaxError(`Can't process rules with more than one rule name: {${match.slice.join("")}}`);

  let params = { rule: match.slice[0] };

  // see if there's a `not` rule in there
  let bangPosition = params.rule.indexOf("!");
  if (bangPosition !== -1) {
    params.not = params.rule.substr(bangPosition + 1); //[ params.rule.substr(bangPosition + 1) ];
    params.rule = params.rule.substr(0, bangPosition);
  }

  let rule = new Rule.Subrule(params);
  if (argument) rule.argument = argument;
  return [ rule, match.end ];
}

// Match list expression `[<item><delimiter>]` or `[<argument>:<item><delimiter>]` in syntax rules.
// Returns `[ rule, end ]`
// Throws if invalid.
function parseList(syntaxStream, rules = [], start = 0, constructor = Rule.List) {
  let { end, slice } = Parser.findNestedTokens(syntaxStream, "[", "]", start);

  // get argument if supplied
  let argument;
  if (slice.length > 2 && slice[1] === ":") {
    argument = slice[0];
    slice = slice.slice(2);
  }

  let results = parseSyntax(slice, []);
  if (results.length !== 2) {
    throw new SyntaxError(`Unexpected stuff at end of list: [${slice.join(" ")}]`);
  }
  let [ item, delimiter ] = results;

  let rule = new constructor({ item, delimiter });
  if (argument) rule.argument = argument;
  return [ rule, end ];
}
