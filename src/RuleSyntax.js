import { defineMemoized } from "./memoize.js";
import Parser from "./Parser.js";
import Rule from "./Rule.js";
import global from "./utils/global";

// re-export Rule for testing
export default Rule;

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
// TODO:	Pull `parseRuleSyntax` stuff out into separate module?
// TODO:	Better name for `ruleSyntax`
// TODO:	Use keywords in syntax to make a quick regex-based `test` function for the entire rule
Object.assign(Rule, {

//
// ## group: parsing syntax
//

  //TODOC
  parseRule(syntax, constructor) {
    // If we got an array of possible syntaxes...
    if (Array.isArray(syntax)) {
      // recursively parse each syntax, using a CLONE of the constructor
      const rules = syntax.map(syntax => {
        return Rule.parseRule(syntax, cloneClass(constructor));
      });
      // return an alternatives with the correct name
      const altClass = cloneClass(Rule.Alternatives, constructor.name);
      Object.defineProperty(altClass.prototype, "rules", { value: rules });
      return new altClass();
    };

    let syntaxStream = Rule.tokeniseRuleSyntax(syntax);
    let rules = Rule.parseRuleSyntax_tokens(syntaxStream, []);
    if (rules.length === 0) {
      throw new SyntaxError(`parser.defineRule(${names[0]}, ${syntax}): no rule produced`);
    }

    // Make an instance of the rule and add relevant properties to its prototype non-enumerably
    if (constructor.prototype instanceof Rule.Keyword
     || constructor.prototype instanceof Rule.Symbol
     || constructor.prototype instanceof Rule.List
    ) {
      for (let property in rules[0]) {
        Object.defineProperty(constructor.prototype, property, { value: rules[0][property] });
      }
    }
    else {
      Object.defineProperty(constructor.prototype, "rules", { value: rules });
    }

    return new constructor();
  },


//DEPRECATED
	parseRuleSyntax(syntax, SequenceConstructor = Rule.Sequence) {
		let syntaxStream = Rule.tokeniseRuleSyntax(syntax);
		let rules = Rule.parseRuleSyntax_tokens(syntaxStream, []);

		let rule;
		// If we only got one thing, return that as the result
		if (rules.length === 1) {
			rule = rules[0];
		}
		else {
			rule = new SequenceConstructor({ rules });
		}

		return rule;
	},

	tokeniseRuleSyntax(syntax) {
		const SYNTAX_EXPRESSION = /(?:[\w\-]+|\\[\[\(\{\)\}\]]|[^\s\w]|\|)/g;
		let syntaxStream = syntax.match(SYNTAX_EXPRESSION);
		if (!syntaxStream) throw new SyntaxError(`Can't tokenize parse rule syntax >>${syntax}<<`);
		return syntaxStream;
	},

//RENAME to parseRuleSyntax
	parseRuleSyntax_tokens(syntaxStream, rules = [], start = 0) {
		let lastIndex = syntaxStream.length;
		while (start < lastIndex) {
			let [ rule, end ] = Rule.parseRuleSyntax_token(syntaxStream, rules, start);
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
	},

	parseRuleSyntax_token(syntaxStream, rules = [], start = 0) {
		let syntaxToken = syntaxStream[start];

		// if we got a "\\" (which also has to go into the source string as "\\")
		// treat the next token as a literal string rather than as a special character.
		if (syntaxToken === "\\") {
			return Rule.parseRuleSyntax_symbol(syntaxStream, rules, start + 1);
		}

		switch (syntaxToken) {
			case "{":	return Rule.parseRuleSyntax_subrule(syntaxStream, rules, start);
			case "(":	return Rule.parseRuleSyntax_alternatives(syntaxStream, rules, start);
			case "[":	return Rule.parseRuleSyntax_list(syntaxStream, rules, start);
			case "*":
			case "+":
			case "?":	return Rule.parseRuleSyntax_repeat(syntaxStream, rules, start);

			// the following should ALWAYS be consumed by the above
			case "}":
			case ")":
			case "]":
			case "|":
				throw new SyntaxError(`Unexpected ${syntaxToken} found as item ${start} of ${this.syntax}`);

			default:
				if (syntaxToken.match(Rule.KEYWORD_PATTERN)) {
					return Rule.parseRuleSyntax_keyword(syntaxStream, rules, start);
				}
				else {
					return Rule.parseRuleSyntax_symbol(syntaxStream, rules, start);
				}
		}
	},

	KEYWORD_PATTERN : /[A-Za-z][\w_-]*/,

	// Match `keyword` in syntax rules.
	// If more than one keyword appears in a row, combines them into a single `Keyword` object.
	// This is pretty safe, unless you have an optional keyword like
	//		`the {identifier} of the? {expression}`
	// in which case you can put the optional keyword in parens
	//		`the {identifier} of (the?) {expression}`
	//
	// Returns `[ rule, end ]`
	// Throws if invalid.
	parseRuleSyntax_keyword(syntaxStream, rules = [], start = 0, constructor) {
		let match = [], end;
 		// eat keywords while they last
		for (var i = start; i < syntaxStream.length; i++) {
			let next = syntaxStream[i];
			if (typeof next === "string" && next.match(Rule.KEYWORD_PATTERN)) {
				match.push(next);
				end = i;
			}
			else break;
		}

		if (!constructor) constructor = Rule.Keyword;
		let rule = new constructor({ match });

		return [ rule, end ];
	},

	// Match `keyword` in syntax rules.
	// Returns `[ rule, end ]`
	// Throws if invalid.
	parseRuleSyntax_symbol(syntaxStream, rules = [], start = 0, constructor = Rule.Symbol) {
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
	},


	// Match grouping expression `(...|...)` in syntax rules.
	// Returns `[ rule, end ]`
	// You can specify an explicit `rule.argument` with:  `(somearg:...)`
	// You can specify that the results should be `promoted` to enclosing context with: `(?:...)`
	//
	// NOTE: nested parens may not have alternatives... :-(   `(a|(b|c))` won't work???
	parseRuleSyntax_alternatives(syntaxStream, rules = [], start = 0) {
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
				let results = Rule.parseRuleSyntax_tokens(group, []);
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
	},

	// Match repeat indicator `?`, `+` or `*` by attaching it to the previous rule.
	parseRuleSyntax_repeat(syntaxStream, rules = [], start = 0) {
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
	},

	// Match `{<ruleName>}` in syntax rules.
	// Returns `[ rule, end ]`
	// Throws if invalid.
	parseRuleSyntax_subrule(syntaxStream, rules = [], start = 0) {
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
	},

	// Match list expression `[<item><delimiter>]` or `[<argument>:<item><delimiter>]` in syntax rules.
	// Returns `[ rule, end ]`
	// Throws if invalid.
	parseRuleSyntax_list(syntaxStream, rules = [], start = 0, constructor = Rule.List) {
		let { end, slice } = Parser.findNestedTokens(syntaxStream, "[", "]", start);

    // get argument if supplied
		let argument;
		if (slice.length > 2 && slice[1] === ":") {
			argument = slice[0];
			slice = slice.slice(2);
		}

		let results = Rule.parseRuleSyntax_tokens(slice, []);
		if (results.length !== 2) {
			throw new SyntaxError(`Unexpected stuff at end of list: [${slice.join(" ")}]`);
		}
		let [ item, delimiter ] = results;

		let rule = new constructor({ item, delimiter });
		if (argument) rule.argument = argument;
		return [ rule, end ];
	},

});



// ##  Add methods to Parser to define rules using the above syntax.
Object.defineProperties(Parser.prototype, {

	// Parse a `ruleSyntax` rule and add it to our list of rules.
	// Returns the new rule.
	// Logs parsing errors but allows things to continue.
	addSequence: { value: function(name, ruleSyntax, constructor = Rule.Sequence) {
		// Add a bunch of syntaxes at once if we got an array of syntaxes
		if (Array.isArray(ruleSyntax))
			return ruleSyntax.map(syntax => this.addSequence(name, syntax, constructor))[0];
		try {
			let rule = Rule.parseRuleSyntax(ruleSyntax, constructor);
			// Reflect the rule back out to make sure it looks (more or less) the same
			if (Parser.DEBUG) console.log(`Added rule '${name}':\n  INPUT: ${ruleSyntax} \n OUTPUT: ${rule}`);

			return this.addRule(name, rule);
		} catch (e) {
			console.group(`Error parsing syntax for rule '${name}':`);
			console.log(`syntax: ${ruleSyntax}`);
			console.error(e);
		}
	}},

	addStatement: { value: function(name, ruleSyntax, constructor = Rule.Statement) {
		// Add a bunch of syntaxes at once if we got an array of syntaxes
		if (Array.isArray(ruleSyntax))
			return ruleSyntax.map(syntax => this.addStatement(name, syntax, constructor))[0];

		let rule = this.addSequence(name, ruleSyntax, constructor);
		if (rule) return this.addRule("statement", rule);
	}},

	addExpression: { value: function(name, ruleSyntax, constructor = Rule.Expression) {
		// Add a bunch of syntaxes at once if we got an array of syntaxes
		if (Array.isArray(ruleSyntax))
			return ruleSyntax.map(syntax => this.addExpression(name, syntax, constructor))[0];

		let rule = this.addSequence(name, ruleSyntax, constructor);
		if (rule) return this.addRule("expression", rule);
	}},

	addList: { value: function(name, ruleSyntax, constructor = Rule.List) {
		// Add a bunch of syntaxes at once if we got an array of syntaxes
		if (Array.isArray(ruleSyntax))
			return ruleSyntax.map(syntax => this.addList(name, syntax, constructor))[0];

		let stream = Rule.tokeniseRuleSyntax(ruleSyntax);
		let rule = (Rule.parseRuleSyntax_list(stream, [], 0, constructor) || [])[0];
		if (!rule) throw new SyntaxError(`Rule.addList(${name}, ${ruleSyntax}): no rule produced`);
		return this.addRule(name, rule);
	}},

	addKeyword: { value: function(name, ruleSyntax, constructor = Rule.Keyword) {
		// Add a bunch of syntaxes at once if we got an array of syntaxes
		if (Array.isArray(ruleSyntax))
			return ruleSyntax.map(syntax => this.addKeyword(name, syntax, constructor))[0];

		let stream = Rule.tokeniseRuleSyntax(ruleSyntax);
		let rule = (Rule.parseRuleSyntax_keyword(stream, [], 0, constructor) || [])[0];
		if (!rule) throw new SyntaxError(`Rule.addKeyword(${name}, ${ruleSyntax}): no rule produced`);
		return this.addRule(name, rule);
	}},

	addSymbol: { value: function(name, ruleSyntax, constructor = Rule.Symbol) {
		// Add a bunch of syntaxes at once if we got an array of syntaxes
		if (Array.isArray(ruleSyntax))
			return ruleSyntax.map(syntax => this.addSymbol(name, syntax, constructor))[0];

		// Parse as `tokens`, which will merge Symbols for us.
		let stream = Rule.tokeniseRuleSyntax(ruleSyntax);
		let rules = (Rule.parseRuleSyntax_tokens(stream, [], 0, constructor) || []);

		if (rules.length === 0) {
			throw new SyntaxError(`Rule.addSymbol(${name}, ${ruleSyntax}): no rule produced`);
		}

		if (rules.length > 1 || !(rules[0] instanceof Rule.Symbol)) {
			throw new SyntaxError(`Rule.addSymbol(${name}, ${ruleSyntax}): generated something `+
				` other than a single Symbol.  Use Rule.addSyntax() instead.`);
		}

		let rule = rules[0];
		// Convert to proper type if necessary
		if (constructor !== Rule.Symbol) rule = new constructor(rule);
		return this.addRule(name, rule);
	}},

});
