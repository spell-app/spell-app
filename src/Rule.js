//	# Parser Rules
//	Rules can be as simple as a string `Keyword` or a complex sequence of (nested) rules.
//
//	Parse a rule with `rule.parse(parser, tokens, start, end)`, this will either:
//		- return `undefined` if the rule doesn't match the head of the tokens, or
//		- return a CLONE of the matched rule with at least the following:
//			- `matched`		Results of your parse.
//			- `nextStart`	Place where next match should start (eg: one beyond what you matched).
//
//	The clone returned above can be manipulated with
//		- `rule.results`			Return matched arguments in a format suitable to do:
//		- `rule.toSource()`	Return javascript source to interpret the rule.
//
import Parser from "./Parser.js";
import Tokenizer from "./Tokenizer.js";

import global from "./utils/global";
import { isWhitespace } from "./utils/string";


// Abstract Rule class.
// TODOC
export default class Rule {
	constructor(...props) {
		Object.assign(this, ...props);
	}

	// Clone this rule and add any `props` passed in.
	clone(props) {
		return new this.constructor(this, props);
	}

//
//	Parsing primitives -- you MUST implement these in your subclasses!
//

	// Attempt to match this rule between `start` and `end` of `tokens`.
	// Returns results of the parse or `undefined`.
	parse(parser, tokens, start = 0, end, stack) {
		return undefined;
	}

	// Test to see if bits of our rule are found ANYWHERE between `start` and `end` in the `tokens`.
	// This is used by complicated (eg: left recursive) rules to exit quickly if there's no chance.
	// Returns:
	//	- `true` if the rule MIGHT be matched.
	//	- `false` if there is NO WAY the rule can be matched.
	//	- `undefined` if not determinstic (eg: no way to tell quickly).
	test(parser, tokens, start = 0, end) {
		return undefined;
	}

//
// ## output as source
//

	// Output value for this INSTANTIATED rule as source.
	toSource() {
		return this.matched;
	}


//
// ## output as structure:
//
	toStructure() {
		return undefined;
	}
}


// Abstract rule for one or more sequential literal values to match.
// `rule.literals` is the literal string or array of literal strings to match.
// `rule.literalSeparator` is the string to put between multiple literals when joining.
//
// After parsing
//  `rule.matched` will be the string which was matched
//  `rule.nextStart` is the index of the next start token
Rule.Literals = class literals extends Rule {
	constructor(...props) {
		super(...props);
		// coerce to an array (a bit slower but cleaner).
		if (!Array.isArray(this.literals)) this.literals = [this.literals];
	}

	// Attempt to match this rule in the `tokens`.
	// Returns results of the parse or `undefined`.
	parse(parser, tokens, start = 0, end, stack) {
		if (!this.matchesStartingAt(tokens, start, end)) return undefined;
		return this.clone({
			matched: this.literals.join(this.literalSeparator),
			nextStart: start + this.literals.length
		});
	}

	// Does this match appear ANYWHERE in the tokens?
	test(parser, tokens, start = 0, end = tokens.length) {
	  let first = this.literals[0];
	  for (var index = start; index < end; index++) {
	    if (tokens[index] !== first) continue;
	    if (this.matchesStartingAt(tokens, index, end)) return true;
	  }
	  return false;
	}

	// Match our `literals` between `start` and `end` of tokens.
	matchesStartingAt(tokens, start = 0, end = tokens.length) {
	  if (this.literals.length === 1) return tokens[start] === this.literals[0];
    return this.literals.every((literal, i) => (start + i < end) && (literal === tokens[start + i]));
	}

  toSource() {
    return this.matched;
  }

	toSyntax() {
		return `${this.literals.join(this.literalSeparator || "")}${this.optional ? '?' : ''}`;
	}
}

// One or more literal symbols: `<`, `%` etc.
// Symbols join WITHOUT spaces.
Rule.Symbols = class symbols extends Rule.Literals {}


// One or more literal keywords.
// Keywords join WITH spaces.
Rule.Keywords = class keywords extends Rule.Literals {}
Object.defineProperty(Rule.Keywords.prototype, "literalSeparator", { value: " " });



// Regex pattern to match a SINGLE token.
// `rule.pattern` is the regular expression to match.
//    Note that you MUST start your pattern with `^` and end with `$` to make sure it matches the entire token.
//    Note that this can only match a single token!
// `rule.blacklist` is a map of `{ key: true }` for strings which will NOT be accepted.
//
// After parsing
//  `rule.matched` will be the string which was matched.
//  `rule.nextStart` is the index of the next start token.
Rule.Pattern = class pattern extends Rule {
	// Attempt to match this pattern at the beginning of the tokens.
	parse(parser, tokens, start = 0, end, stack) {
		let token = tokens[start];
		if (typeof token !== "string") return undefined;

		let match = token.match(this.pattern);
		if (!match) return undefined;

		// bail if present in blacklist
		let matched = match[0];
		if (this.blacklist && this.blacklist[matched]) return undefined;

		return this.clone({
			matched,
			nextStart: start + 1
		});
	}

	// Test to see if any of our pattern is found ANYWHERE in the tokens.
	test(parser, tokens, start = 0, end) {
		return tokens.slice(start, end).some(token => typeof token === "string" && pattern.test(token));
	}

	toSyntax() {
		return this.pattern.source;
	}
}


// Subrule -- name of another rule to be called.
// `rule.subrule` is the name of the rule in `parser.rules`.
//
// After parsing
//  we'll return the actual rule that was matched (rather than a clone of this rule)
Rule.Subrule = class subrule extends Rule {
	parse(parser, tokens, start = 0, end, stack) {
		let matchedRule = parser.parseNamedRule(this.subrule, tokens, start, end, stack, `parse subrule '${this.rule}'`);
		if (!matchedRule) return undefined;
		if (this.argument) matchedRule.argument = this.argument;
		return matchedRule;
	}

	// Ask the subrule to figure out if a match is possible.
	test(parser, tokens, start = 0, end) {
		return parser.test(this.subrule, tokens, start, end);
	}

	toSyntax() {
		return `{${this.argument ? this.argument+":" : ""}${this.subrule}}${this.optional ? '?' : ''}`;
	}
}


// Sequence of rules to match.
//  `rule.rules` is the array of rules to match.
//  `rule.leftRecursive` should be `true` if the first non-optional rule in our `rules`
//    may end up calling us again.  In this case, you should provide `rule.testRule`.
//
// After parsing
//  `rule.matched` will be the array of rules which were matched.
//  `rule.nextStart` is the index of the next start token.
Rule.Sequence = class sequence extends Rule {
	parse(parser, tokens, start = 0, end, stack) {
		// If we have a `testRule` defined
		if (this.testRule) {
			// Forget it if there is NO WAY the rule could be matched.
			if (parser.test(this.testRule, tokens, start) === false) return undefined;
		}

		// If we're a leftRecursive sequence...
		if (this.leftRecursive) {
			// If the stack already contains this rule, forget it.
			if (stack && stack.includes(this)) return undefined;

			// Clone stack and add this rule for recursion...
			stack = stack ? stack.concat() : [];
			stack.push(this);

			// TODO: We could distinguish between productive and unproductive rules
			//		 by checking only rules which occur at the same `start`...
			//		 This would probably allow more interesting things, but it's much much slower.
		}

		let matched = [];
		let nextStart = start;
		let index = 0, rule = undefined;
		while (rule = this.rules[index++]) {
			let match = rule.parse(parser, tokens, nextStart, end, stack);
			if (!match && !rule.optional) return undefined;
			if (match) {
				matched.push(match);
				nextStart = match.nextStart;
			}
		}
		// if we get here, we matched all the rules!
		return this.clone({
			matched,
			nextStart
		});
	}


//TODOC
	// "gather" arguments in preparation to call `toSource()`
	// Only callable after parse is completed.
	// Returns an object with properties from the `matched` array indexed by
	//		- `match.argument`:		argument set when rule was declared, eg: `{value:literal}` => `value`
	//		- `match.ruleName`:		name of rule when defined
	//		- `rule type`:			name of the rule type
	// NOTE: memoizes the results.
	get results() {
		if (!this.matched) return undefined;
		let results = this._addResults({}, this.matched);
		if (this.comment) results.comment = this.comment;
		return results;
	}

	_addResults(results, matched) {
		let index = 0, match = undefined;
		while (match = matched[index++]) {
			if (match.promote) {
				this._addResults(results, match.matched);
			}
			else {
				let resultName = match.argument || match.group || match.constructor.name;
				// If arg already exists, convert to an array
				if (resultName in results) {
					if (!Array.isArray(results[resultName])) {
					  results[resultName] = [results[resultName]];
//					  results[sourceName] = [results[sourceName]];
					}
					results[resultName].push(match);
//					results[sourceName].push(source);
				}
				else {
					results[resultName] = match;
//					results[sourceName] = source;
				}
			}
		}
		return results;
	}

	// Return `toSource()` for our `results` as a map.
	// If you pass `keys`, we'll restrict to just those keys.
	getMatchedSource() {
		let results = this.results;
		let output = {};
		Object.keys(results).forEach(key => {
			let value = results[key];
			if (value.toSource) output[key] = value.toSource();
			else output[key] = value;
		});
		return output;
	}

	// Echo this rule back out.
	toSyntax() {
	  const rules = this.rules.map(rule => rule.toSyntax());
		return `${this.rules.join(" ")}${this.optional ? '?' : ''}`;
	}

}


// Alternative syntax, matching one of a number of different rules.
// The result of a parse is the longest rule that actually matched.
// NOTE: Currently takes the longest valid match.
// TODO: match all valid alternatives
//
// After parsing
//  we'll return the rule which is the "best match" (rather than cloning this rule).
Rule.Alternatives = class alternatives extends Rule {
	constructor(...props) {
		super(...props);
		if (!this.rules) this.rules = [];
	}

	// Test to see if any of our alternatives are found ANYWHERE in the tokens.
	// NOTE: this should only be called if we're specified as a `testRule`
	//		 and then only if all of our rules are deterministic.
	test(parser, tokens, start = 0, end) {
		let index = 0, rule = undefined;
		while (rule = this.rules[index++]) {
			if (rule.test(parser, tokens, start, end)) return true;
		}
		return false;
	}

	// Find all rules which match and delegate to `getBestMatch()` to pick the best one.
	parse(parser, tokens, start = 0, end, stack) {
		let matches = [];
		let index = 0, rule = undefined;
		while (rule = this.rules[index++]) {
			let match = rule.parse(parser, tokens, start, end, stack);
			if (match) matches.push(match);
		}

		if (!matches.length) return undefined;

		// uncomment the below to print alternatives
		// if (matches.length > 1) {
		//	console.info(this.argument || this.ruleName, matches, matches.map(match => match.matchedText));
		// }

		let bestMatch = (matches.length === 1 ? matches[0] : this.getBestMatch(matches));

		// assign `argName` or `group` for `results`
		if (this.argument) bestMatch.argument = this.argument;
		else if (this.group) bestMatch.group = this.group;
//TODO: other things to copy here???

		return bestMatch;
	}

	// Return the "best" match given more than one matches at the head of the tokens.
	// Default is to return the longest match.
	// Implement something else to do, eg, precedence rules.
	getBestMatch(matches) {
		return matches.reduce(function (best, current) {
			if (current.nextStart > best.nextStart) return current;
			return best;
		}, matches[0]);
	}

	addRule(...rule) {
		this.rules.push(...rule);
	}

	toSyntax() {
	  const rules = this.rules.map(rule => rule.toSyntax()).join("|");
		return `(${this.argument ? this.argument+":" : ""}${rules})${this.optional ? '?' : ''}`;
	}
};


// Repeating rule.
//	`this.repeat` is the rule that repeats.
//  `this.optional` is true if the prodution is optional.
//	Note: Automatically consumes whitespace before rules.
//	Note: Returns `undefined` if we don't match at least once.
//
// After matching:
//	`this.matched` is array of matched rules.
//  `rule.nextStart` is the index of the next start token.
Rule.Repeat = class repeat extends Rule {
	parse(parser, tokens, start = 0, end, stack) {
		let matched = [];
		let nextStart = start;
		while (true) {
			let match = this.repeat.parse(parser, tokens, nextStart, end, stack);
			if (!match) break;

			matched.push(match);
			nextStart = match.nextStart;
		}

		if (matched.length === 0) return undefined;

		return this.clone({
			matched,
			nextStart
		});
	}

	toSource() {
		if (!this.matched) return undefined;
		return this.matched.map(match => match.toSource());
	}

	toSyntax() {
		let isCompoundRule = (this.repeat instanceof Rule.Sequence)
      || (this.repeat instanceof Rule.Literals && this.repeat.literals.length > 1);
    const repeat = this.repeat.toSyntax();
		const rule = isCompoundRule ? `(${repeat})` : `${repeat}`;
		return `${rule}${this.optional ? '*' : '+'}`;
	}
}


// List match rule:   `[<item><delimiter>]`. eg" `[{number},]` to match `1,2,3`
//	`rule.item` is the rule for each item,
//	`rule.delimiter` is the delimiter between each item, which is optional at the end.
//
// After matching:
//	`this.matched` is array of matched rules.
//  `rule.nextStart` is the index of the next start token.
//
// NOTE: we assume that a List rule itself will NOT repeat (????)
Rule.List = class list extends Rule {
	parse(parser, tokens, start = 0, end, stack) {
		// ensure item and delimiter are optional so we don't barf in `parseRule`
//TODO: ???
		this.item.optional = true;
		this.delimiter.optional = true;

		let matched = [];
		let nextStart = start;
		while (true) {
			// get next item, exiting if not found
			let item = this.item.parse(parser, tokens, nextStart, end, stack);
			if (!item) break;

			matched.push(item);
			nextStart = item.nextStart;

			// get delimiter, exiting if not found
			let delimiter = this.delimiter.parse(parser, tokens, nextStart, end, stack);
			if (!delimiter) break;
			nextStart = delimiter.nextStart;
		}

		// If we didn't get any matches, forget it.
		if (matched.length === 0) return undefined;

		return this.clone({
			matched,
			nextStart
		});
	}

	// Returns list of values as source.
	toSource() {
		if (!this.matched) return [];
		return this.matched.map( match => match.toSource() );
	}

	toSyntax() {
	  const item = this.item.toSyntax();
	  const delimiter = this.delimiter.toSyntax();
		return `[${this.argument ? this.argument+":" : ""}${item} ${delimiter}]${this.optional ? '?' : ''}`;
	}
};



// A block is used to parse a nested block of statements.
// Abstract class.
Rule.Block = class block extends Rule.Sequence {

	// Parse the entire `block`, returning results.
	parseBlock(parser, block, indent = 0) {
		let matched = [];
//console.warn("block:", block);
		block.contents.forEach((item, index) => {
			let result;
			if (item.length === 0) {
				matched.push(new Rule.BlankLine());
			}
			else if (item instanceof Tokenizer.Block) {
				let last = matched[matched.length - 1];
				if (last.parseBlock) {
					last.parseBlock(parser, item, indent + 1);
				}
				else {
					let block = this.parseBlock(parser, item, indent + 1);
					if (block !== undefined) matched.push(block);
				}
			}
			else {
				matched = matched.concat(this.parseStatement(parser, item));
			}
		});

		return new Rule.Block({
			indent,
			matched
		});
	}

	// Parse a single statement (a line's worth of `tokens`).
	// Skips whitespace at the beginning of the line.
	// Auto-matches comment in the middle of the line.
	// Returns array of results.
	parseStatement(parser, tokens) {
		let results = [];
		let start = 0, end = tokens.length;
		let statement, comment;

		// check for an indent at the start of the line
		if (tokens[start] instanceof Tokenizer.Whitespace) start++;

		// check for a comment at the end of the tokens
		if (tokens[end-1] instanceof Tokenizer.Comment) {
			comment = parser.parseNamedRule("comment", tokens, end-1, end, undefined, "parseStatement");
			// add comment FIRST if found
			results.push(comment);
			end--;
		}

		// parse the rest as a "statement"
		statement = parser.parseNamedRule("statement", tokens, start, end, undefined, "parseStatement");
		// complain if no statement and no comment
		if (!statement && !comment) {
			let error = new Rule.StatementParseError({
				unparsed: tokens.slice(start, end).join(" ")
			});
			results.push(error);
		}

		// complain if we can't parse the entire line!
		else if (statement && statement.nextStart !== end) {
			let error = new Rule.StatementParseError({
				parsed : tokens.slice(start, statement.nextStart).join(" "),
				unparsed : tokens.slice(statement.nextStart, end).join(" ")
			});
			results.push(error);
		}

		// Otherwise add the statement
		else if (statement) {
			results.push(statement);
		}

		return results;
	}

	// Return source for this block as an array of indented lines WITHOUT `{` OR `}`.
	blockToSource(block = this.matched) {
		let results = [], statement;

		for (var i = 0; i < block.length; i++) {
			let match = block[i];
      //console.info(i, match);
      try {
            statement = match.toSource() || "";
      } catch (e) {
        console.error(e);
        console.warn("Error converting block: ", block, "statement:", match);
      }
      //console.info(i, statement);
			if (isWhitespace(statement)) {
				results.push("");
			}
			else if (Array.isArray(statement)) {
				results = results.concat(statement);
			}
			else if (typeof statement === "string") {
				statement = statement.split("\n");
				results = results.concat(statement);
			}
			else {
				console.warn("blockToSource(): DON'T KNOW HOW TO WORK WITH\n\t", statement, "\n\tfrom match", match);
			}
		}
		if (this.indent !== 0) {
			return "\t" + results.join("\n\t");
		}
		return results.join("\n");
	}

	toSource() {
		return " {\n" + this.blockToSource() + "\n" + "}";
	}

	// Convert to logical representation of structure by converting individual statements and grouping
	// NOTE: you should override this and include "type"
	toStructure() {
		let { name, superType } = this.getMatchedSource();
		let block = (this.block && this.block.matched) || [];

		let named = {};
		let properties = [];
		let methods = [];
		let other = [];
		block.map(statement => statement.toStructure())
			 .filter(Boolean)
			 .forEach(addStructure);

		return {
			type: "unknown",
			name,
			superType,
			named,
			properties,
			methods,
			other
		}

		function addStructure(structure) {
			// add arrays as individual items
			if (Array.isArray(structure)) return structure.forEach(addStructure);

			// add under `named` for quick hit of all significant bits...
			if (structure.name) named[structure.name] = structure;

			// add under 'methods', 'properties' or 'other'
			if (structure.type === "function") methods.push(structure);
			else if (structure.type === "property") properties.push(structure);
			else other.push(structure);
		}
	}

	// Format array of `statements` as a JS output block:
	//	- if `statements` is empty, returns `{}`
	//	- if `statements is a single line, returns `{ statement }`
	//	- else returns multiple lines
	static encloseStatements(...args) {
		var statements = [];
		for (var i = 0; i < args.length; i++) {
			let arg = args[i];
			if (Array.isArray(arg)) {
				statements = statements.concat(arg);
			}
			else if (typeof arg === "string") {
				statements.push(arg);
			}
		}
		statements = statements.join("\n");

		if (!statements) return "{}";
		if (!statements.includes("\n") && statements.length < 40) {
			return `{ ${statements.trim()} }`;
		}
		if (statements[0] !== "\t") statements = `\t${statements}`;
		return `{\n${statements}\n}`;
	}

}


// `Statements` are a special case for a block of `Statement` rules
//	that understand nesting and comments.
//
// This is a top-level construct, e.g. used to parse an entire file.
Rule.Statements = class statements extends Rule.Block {

	// Split statements up into blocks and parse 'em.
	parse(parser, tokens, start = 0, end = tokens.length, stack) {
		var block = Tokenizer.breakIntoBlocks(tokens, start, end);

		let matched = this.parseBlock(parser, block);
		if (!matched) return undefined;

		return this.clone({
			matched,
			nextStart: end
		});
	}

	// Output statements WITHOUT curly braces around them.
	toSource() {
		return this.matched.blockToSource();
	}
}


// A `BlockStatement` (e.g. an `if` or `repeat`):
//	- is assumed to have an initial partial `statement`
//	- MAY have an inline `statement` (on the same line, possibly after a `:`)
//	- MAY have contents as an embedded `block`
//
//	In your `getMatchedSource()`, `block` will be the resulting block output, if there is one.
//	It's up to your rule to do something with it...
Rule.BlockStatement = class block_statement extends Rule.Block {

	// Parse a block and add it to `this.block`
	parseBlock(parser, block, indent = 0) {
		this.block = super.parseBlock(...arguments);
	}

	// Return `toSource()` for our `results` as a map.
	// If you pass `keys`, we'll restrict to just those keys.
	getMatchedSource() {
		let output = super.getMatchedSource();
		// add `block` to output if defined.
		if (this.block) {
			output.block = this.block.blockToSource();
		}
		return output;
	}
}


// Blank line representation in parser output.
Rule.BlankLine = class blank_line extends Rule {
	toSource() {
		return "\n";
	}
}

// Comment rule -- matches tokens of type `Tokenizer.Comment`.
Rule.Comment = class comment extends Rule {
	// Comments are special nodes in our token stream.
	parse(parser, tokens, start = 0, end, stack) {
		let token = tokens[start];
		if (!(token instanceof Tokenizer.Comment)) return undefined;
		return this.clone({
			matched: token,
			nextStart: start + 1
		});
	}

	toSource() {
		return `//${this.matched.whitespace}${this.matched.comment}`;
	}
}

// Parser error representation in parser output.
Rule.StatementParseError = class parse_error extends Rule {
	constructor(...props) {
		super(...props);
		if (Parser.WARN) console.warn(this.message);
	}

	get message() {
		if (this.parsed) {
			return "CANT PARSE ENTIRE STATEMENT\n"
				 + "PARSED      : `"+ this.parsed + "`\n"
				 + "CAN'T PARSE : `"+ this.unparsed + "`";
		}
		return "CAN'T PARSE STATEMENT: `" + this.unparsed + "`";
	}

	toSource() {
		return "// " + this.message.split("\n").join("\n// ");
	}
}


