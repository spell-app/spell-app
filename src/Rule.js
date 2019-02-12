//  # Parser Rules
//  Rules can be as simple as a string `Keyword` or a complex sequence of (nested) rules.
//
//  Parse a rule with `rule.parse(parser, tokens, start, end)`, this will either:
//    - return `undefined` if the rule doesn't match the head of the tokens, or
//    - return a CLONE of the matched rule with at least the following:
//      - `matched`    Results of your parse.
//      - `nextStart`  Place where next match should start (eg: one beyond what you matched).
//
//  The clone returned above can be manipulated with
//    - `rule.compile()`    Return javascript source to interpret the rule.
//    - `rule.toSyntax()`    Return ruleSyntax for the rule (mostly for debugging)
//    -
//
import Parser, { ParseError } from "./Parser.js";
import Tokenizer, { matchLiterals } from "./Tokenizer.js";

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
  //  Parsing methods -- you MUST implement these in your subclasses!
  //

  // Test to see if bits of our rule are found ANYWHERE between `start` and `end` of the `tokens`.
  // This is used by complicated (eg: left recursive) rules to exit quickly
  // if there's no chance of success.
  //
  // Returns:
  //  - `true` if the rule MIGHT be matched.
  //  - `false` if there is NO WAY the rule can be matched.
  //  - `undefined` if not determinstic (eg: no way to tell quickly).
  test(parser, tokens, start, end) {}

  // Attempt to match this rule between `start` and `end` of `tokens`.
  // If successful, returns `{ results, rules, nextStart }` where:
  //  - `results` is logical "results" of what was matched, depends on rule type
  //  - `rules` is array of rules that were matched
  //  - `nextStart` is index of token AFTER last result (e.g. start of next bit to parse)
  //
  // If unsuccessful, returns `undefined`.
  parse(parser, tokens, end, stack) {}

  // Output value for this INSTANTIATED rule as source.
  compile(match) {}
}

// Abstract rule for one or more sequential literal values to match.
// `rule.literals`:
//    the literal string or array of literal strings to match.
// `rule.literalSeparator`
//    the string to put between multiple literals when joining multiple literals together.
//
// After parsing
//  `rule.matched` will be the string which was matched
//  `rule.nextStart` is the index of the next start token
Rule.Literals = class literals extends Rule {
  constructor(...props) {
    // If passed a string, split and use that as our `literals`
    if (props.length === 1 && typeof props[0] === "string") {
      super();
      this.literals = props[0].trim().split(this.literalSeparator);
    }
    // otherwise assume we got an array of property maps
    else {
      super(...props);
    }
    // coerce `literals` to an array
    if (!Array.isArray(this.literals)) this.literals = [this.literals];
  }

  // Does this match appear ANYWHERE in the tokens?
  test(parser, tokens, start = 0, end = tokens.length) {
    let first = this.literals[0];
    for (var index = start; index < end; index++) {
      if (tokens[index] !== first) continue;
      if (matchLiterals(this.literals, tokens, index, end)) return true;
    }
    return false;
  }

  // Attempt to match this rule in the `tokens`.
  // Returns results of the parse or `undefined`.
  parse(parser, tokens, start = 0, end) {
    if (!matchLiterals(this.literals, tokens, start, end)) return undefined;

//     return this.clone({
//       matched: this.literals.join(this.literalSeparator),
//       nextStart: start + this.literals.length
//     });

    return {
      rule: this,
      compile: this.compile.bind(this),
      nextStart: start + this.literals.length
    }
  }

  compile(match) {
    return this.literals.join(this.literalSeparator);
  }

  toSyntax() {
    return `${this.literals.join(this.literalSeparator || "")}${this.optional ? "?" : ""}`;
  }
};
Object.defineProperty(Rule.Literals.prototype, "literalSeparator", { value: "" });

// One or more literal symbols: `<`, `%` etc.
// Symbols join WITHOUT spaces.
Rule.Symbols = class symbols extends Rule.Literals {};

// One or more literal keywords.
// Keywords join WITH spaces.
Rule.Keywords = class keywords extends Rule.Literals {};
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
  constructor(...props) {
    super(...props);
    // convert blacklist to a map if necessary
    if (Array.isArray(this.blacklist)) {
      const map = {};
      for (const key of this.blacklist) map[key] = true;
      this.blacklist = map;
    }
  }

  // Test to see if any of our pattern is found ANYWHERE in the tokens.
  test(parser, tokens, start = 0, end = tokens.length) {
    for (let index = start; index < end; index++) {
      const token = tokens[index];
      if (typeof token !== "string") continue;
      if (this.pattern.test(token) && (!this.blacklist || !this.blacklist[token])) return true;
    }
    return false;
  }


  // Attempt to match this pattern at the beginning of the tokens.
  parse(parser, tokens, start = 0) {
    const token = tokens[start];
    if (typeof token !== "string") return undefined;

    const match = token.match(this.pattern);
    if (!match) return undefined;

    // bail if present in blacklist
    const matched = match[0];
    if (this.blacklist && this.blacklist[matched]) return undefined;

    return {
      rule: this,
      matched,
      compile: this.compile.bind(this),
      nextStart: start + 1
    }
  }

  compile(match) {
    return match.matched;
  }

  toSyntax() {
    return this.pattern.source;
  }
};

// Subrule -- name of another rule to be called.
// `rule.subrule` is the name of the rule in `parser.rules`.
//
// After parsing
//  we'll return the actual rule that was matched (rather than a clone of this rule)
Rule.Subrule = class subrule extends Rule {
  parse(parser, tokens, start = 0, end, stack) {
    const match = parser.parseNamedRule(this.subrule, tokens, start, end, stack);
    if (!match) return undefined;
    if (this.argument) match.argument = this.argument;
    return match;
  }

  // Ask the subrule to figure out if a match is possible.
  test(parser, tokens, start = 0, end) {
    return parser.test(this.subrule, tokens, start, end);
  }

  toSyntax() {
    return (
      `{${this.argument ? this.argument + ":" : ""}` + `${this.subrule}}${this.optional ? "?" : ""}`
    );
  }
};

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
  //     and then only if all of our rules are deterministic.
  test(parser, tokens, start = 0, end) {
    for (const rule of this.rules) {
      if (rule.test(parser, tokens, start, end)) return true;
    }
    return false;
  }

  // Find all rules which match and delegate to `getBestMatch()` to pick the best one.
  parse(parser, tokens, start = 0, end, stack) {
    let matches = [];
    for (const rule of this.rules) {
      let match = rule.parse(parser, tokens, start, end, stack);
      if (match) matches.push(match);
    }

    if (!matches.length) return undefined;

    // uncomment the below to print alternatives
    // if (matches.length > 1) {
    //  console.info(this.argument || this.group, matches, matches.map(match => match.matchedText));
    // }

    let bestMatch = matches.length === 1 ? matches[0] : this.getBestMatch(matches);

    // assign special properties to the result
    if (this.argument) bestMatch.argument = this.argument;
    if (this.group) bestMatch.group = this.group;
    if (this.promote) bestMatch.promote = this.promote;

    return bestMatch;
  }

  // Return the "best" match given more than one matches at the head of the tokens.
  // Default is to return the longest match.
  // Implement something else to do, eg, precedence rules.
  getBestMatch(matches) {
    return matches.reduce(function(best, current) {
      if (current.nextStart > best.nextStart) return current;
      return best;
    }, matches[0]);
  }

  addRule(...rule) {
    this.rules.push(...rule);
  }

  toSyntax() {
    const rules = this.rules.map(rule => rule.toSyntax()).join("|");
    const promote = this.promote ? "?:" : "";
    const argument = this.argument ? `${this.argument}:` : "";
    return `(${promote}${argument}${rules})${this.optional ? "?" : ""}`;
  }
};

// Alias for `Rule.Alternatives` used to merge alternatives together
// when implicitly combining multiple rules under the same name.
// This lets us distinguish
//  - actually defining a semantically-meaning "alternatives" and
//  - smooshing rules together because they share the same name
Rule.Group = class group extends Rule.Alternatives {};


// Repeating rule.
//  `this.repeat` is the rule that repeats.
//  `this.optional` is true if the prodution is optional.
//  `rule.testRule` is a QUICK rule to test if there's any way the sequence can match.
//
//  Note: Automatically consumes whitespace before rules.
//  Note: Returns `undefined` if we don't match at least once.
//
// After matching:
//  `this.matched` is array of matched rules.
//  `rule.nextStart` is the index of the next start token.
Rule.Repeat = class repeat extends Rule {
  // Check `testRule` if provided.
  test(parser, tokens, start, end) {
    if (this.testRule) return parser.test(this.testRule, tokens, start, end);
  }

  parse(parser, tokens, start = 0, end = tokens.length, stack) {
    // Bail quickly if no chance
    if (this.test(parser, tokens, start, end) === false) return undefined;

    const matched = [];
    let nextStart = start;
    while (nextStart < end) {
      let match = this.repeat.parse(parser, tokens, nextStart, end, stack);
      if (!match) break;
      if (nextStart === match.nextStart) {
        throw new TypeError(`repeat rule ${this.name}: got unproductive match`);
      }
      matched.push(match);
      nextStart = match.nextStart;
    }

    // Forget it if nothing matched at all
    if (matched.length === 0) return undefined;

    return this.clone({
      matched,
      nextStart
    });
  }

  compile(match) {
    if (!match.matched) return undefined;
    return match.matched.map(match => match.compile(match));
  }

  toSyntax() {
    let isCompoundRule =
      this.repeat instanceof Rule.Sequence ||
      (this.repeat instanceof Rule.Literals && this.repeat.literals.length > 1);
    const repeat = this.repeat.toSyntax();
    const rule = isCompoundRule ? `(${repeat})` : `${repeat}`;
    return `${rule}${this.optional ? "*" : "+"}`;
  }
};

// List match rule:   `[<item><delimiter>]`. eg" `[{number},]` to match `1,2,3`
//  `rule.item` is the rule for each item,
//  `rule.delimiter` is the delimiter between each item, which is optional at the end.
//
// After matching:
//  `this.matched` is array of matched item rules (delmiter is ignored).
//  `rule.nextStart` is the index of the next start token.
//
// NOTE: we assume that a List rule itself will NOT repeat (????)
Rule.List = class list extends Rule {
  // Check `testRule` if provided.
  test(parser, tokens, start, end) {
    if (this.testRule) return parser.test(this.testRule, tokens, start, end);
  }

  parse(parser, tokens, start = 0, end = tokens.length, stack) {
    // Bail quickly if no chance
    if (this.test(parser, tokens, start, end) === false) return undefined;

    // ensure item and delimiter are optional so we don't barf in `parseRule`
    //TODO: ???
    this.item.optional = true;
    this.delimiter.optional = true;

    let matched = [];
    let nextStart = start;
    while (nextStart < end) {
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

    return {
      rule: this,
      matched,
      compile: this.compile.bind(this),
      nextStart
    }

//     return this.clone({
//       matched,
//       nextStart
//     });
  }

  // Returns JS Array of matched items as source.
  //TODO: `JSDelimiter` to return as a single string?
  compile(match) {
    if (!match.matched) return [];
    return match.matched.map(match => match.compile(match));
  }

  toSyntax() {
    const item = this.item.toSyntax();
    const delimiter = this.delimiter.toSyntax();
    return (
      `[${this.argument ? this.argument + ":" : ""}${item} ${delimiter}]` +
      `${this.optional ? "?" : ""}`
    );
  }
};


// Sequence of rules to match.
//  `rule.rules` is the array of rules to match.
//  `rule.testRule` is a QUICK rule to test if there's any way the sequence can match.
//  `rule.leftRecursive` should be `true` if the first non-optional rule in our `rules`
//    may end up calling us again.  In this case, you should provide `rule.testRule`.
//
// After parsing
//  `rule.matched` will be the array of rules which were matched.
//  `rule.nextStart` is the index of the next start token.
Rule.Sequence = class sequence extends Rule {
  test(parser, tokens, start, end) {
    if (this.testRule) return parser.test(this.testRule, tokens, start, end);
  }

  parse(parser, tokens, start = 0, end = tokens.length, stack) {
    // Bail quickly if no chance
    if (this.test(parser, tokens, start, end) === false) return undefined;

    // If we're a leftRecursive sequence...
    if (this.leftRecursive) {
      // If the stack already contains this rule, forget it.
      if (stack && stack.includes(this)) return undefined;

      // Clone stack and add this rule for recursion...
      stack = stack ? stack.concat() : [];
      stack.push(this);

      // TODO: We could distinguish between productive and unproductive rules
      //     by checking only rules which occur at the same `start`...
      //     This would probably allow more interesting things, but it's much much slower.
    }

    let matched = [];
    let nextStart = start;
    for (const rule of this.rules) {
      let match = rule.parse(parser, tokens, nextStart, end, stack);
      if (!match && !rule.optional) return undefined;
      if (match) {
        matched.push(match);
        nextStart = match.nextStart;
      }
    }

    // if we get here, we matched all the rules!
    return {
      rule: this,
      matched,
      results: this.getResults(matched),
      compile: this.compile.bind(this),
      nextStart
    }
//     return this.clone({
//       matched,
//       nextStart
//     });
  }

  //TODOC
  // "gather" arguments in preparation to call `compile(match)`
  // Only callable after parse is completed.
  // Returns an object with properties from the `matched` array indexed by one of the following:
  //    - `match.argument`:    argument set when rule was declared, eg: `{value:literal}` => `value`
  //    - `match.group`:      name of group rule was added to
  //    - `match.name`:       name of the rule if set up by parseRule
  getResults(matched) {
    if (!matched) return undefined;
    let results = addResults({}, matched);
//    if (matched.comment) results.comment = matched.comment;
    return results;

    function addResults(results, matched) {
      for (const match of matched) {
        const rule = match instanceof Rule ? match : match.rule;
        if (rule.promote) {
          addResults(results, match.matched);
        } else {
          const sourceName = match.argument || match.group || rule.argument || rule.group || rule.name;
          if (sourceName == null) continue;

          const matchName = "_" + sourceName;
          const source = match.compile(match);
          // If arg already exists, convert to an array
          if (matchName in results) {
            if (!Array.isArray(results[matchName])) {
              results[matchName] = [results[matchName]];
              results[sourceName] = [results[sourceName]];
            }
            results[matchName].push(rule);
            results[sourceName].push(source);
          } else {
            results[matchName] = rule;
            results[sourceName] = source;
          }
        }
      }
      return results;
    }
  }

  // Echo this rule back out.
  toSyntax() {
    const rules = this.rules.map(rule => rule.toSyntax());
    return `${rules.join(" ")}${this.optional ? "?" : ""}`;
  }
};

// A block is used to parse a nested block of statements.
// Abstract class.
Rule.Block = class block extends Rule.Sequence {
  // Parse the entire `block`, returning results.
  parseBlock(parser, block, indent = 0) {
    let matched = [];
    //console.warn("block:", block);
    block.contents.forEach(item => {
      if (item.length === 0) {
        matched.push(new Rule.BlankLine());
      } else if (item instanceof Tokenizer.Block) {
        // if the last matched item wants to eat a block, give it the block
        let last = matched[matched.length - 1];
        if (last.rule.parseBlock) {
          const block = last.rule.parseBlock(parser, item, indent + 1);
          if (block) {
            last.results._block = block;
            last.results.statements = block.compile(block);
          }
        }
        // otherwise add the block to the stream
        else {
          let block = this.parseBlock(parser, item, indent + 1);
          if (block !== undefined) matched.push(block);
        }
      } else {
        matched = matched.concat(this.parseStatement(parser, item));
      }
    });

    // FIXME: This is now the only place where we return a Rule instance.
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
    let start = 0,
      end = tokens.length;
    let statement, comment;

    // check for an indent at the start of the line
    if (tokens[start] instanceof Tokenizer.Whitespace) start++;

    // check for a comment at the end of the tokens
    if (tokens[end - 1] instanceof Tokenizer.Comment) {
      comment = parser.parseNamedRule("comment", tokens, end - 1, end, undefined);
      // add comment FIRST if found
      results.push(comment);
      end--;
    }

    // parse the rest as a "statement"
    statement = parser.parseNamedRule("statement", tokens, start, end, undefined);
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
        parsed: tokens.slice(start, statement.nextStart).join(" "),
        unparsed: tokens.slice(statement.nextStart, end).join(" ")
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
    let results = [],
      statement;

    for (var i = 0; i < block.length; i++) {
      let match = block[i];
      //console.info(i, match);
      try {
        statement = match.compile(match) || "";
      } catch (e) {
        console.error(e);
        console.warn("Error converting block: ", block, "statement:", match);
      }
      //console.info(i, statement);
      if (isWhitespace(statement)) {
        results.push("");
      } else if (Array.isArray(statement)) {
        results = results.concat(statement);
      } else if (typeof statement === "string") {
        statement = statement.split("\n");
        results = results.concat(statement);
      } else {
        console.warn(
          "blockToSource(): DON'T KNOW HOW TO WORK WITH\n\t",
          statement,
          "\n\tfrom match",
          match
        );
      }
    }
    if (this.indent !== 0) {
      return "\t" + results.join("\n\t");
    }
    return results.join("\n");
  }

  compile(match) {
    return "{\n" + match.blockToSource() + "\n" + "}";
  }

  // Enclose a single statement.
  static encloseStatement(statement, forceWrap) {
    if (!statement) return "{}";
    if (!forceWrap && !statement.includes("\n") && statement.length < 40) {
      return `{ ${statement.trim()} }`;
    }
    if (statement[0] !== "\t") statement = `\t${statement}`;
    return `{\n${statement}\n}`;
  }
};

// `Statements` are a special case for a block of `Statement` rules
//  that understand nesting and comments.
//
// This is a top-level construct, e.g. used to parse an entire file.
Rule.Statements = class statements extends Rule.Block {
  // Split statements up into blocks and parse 'em.
  parse(parser, tokens, start = 0, end = tokens.length) {
    var block = Tokenizer.breakIntoBlocks(tokens, start, end);

    let matched = this.parseBlock(parser, block);
    if (!matched) return undefined;

    return {
      rule: this,
      matched,
      compile: this.compile.bind(this),
      nextStart: end  // TODO???
    }
  }

  // Output statements WITHOUT curly braces around them.
  compile(match) {
    return match.matched.blockToSource();
  }
};

// A `BlockStatement` (e.g. an `if` or `repeat`):
//  - is assumed to have an initial partial `statement`
//  - MAY have an inline `statement` (on the same line, possibly after a `:`)
//  - MAY have contents as an embedded `block`
// Note that it's considered an error to have BOTH an inline statement AND a nested block.
//
//  e.g. a `BlockStatement` with syntax `if {expression} then {statement}?` will attemt to:
//  - match the optional `statement` as an inline-statement (as `results.statement`)
//  - match an INDENTED block starting on the next line (as `result.block`)
//
//  For your convenience in `compile()`, you can just look at `results.statements`
//  which will be one of the following (whichever comes first):
//    - the block and its statements, enclosed in curly braces and indented, or
//    - the formatted `statement`, enclosed in curly brackets,
//    - `{}` if neither statement or block was matched.
Rule.BlockStatement = class block_statement extends Rule.Block {
  // Parse a nested block which appears directly after our "main" rule.
  // Adds to our `matched` list as necessary.
  parseBlock() {
    const block = super.parseBlock(...arguments);
    if (!block) return;

    block.argument = "block";
    return block;
  }

  // Add `statements` to the results.
  getResults(matched) {
    const results = super.getResults(matched);
    if (!results) return results;

    // If we got a block, use that for our `statements`
    if (results.block) {
      results._statements = results._block;
      results.statements = results.block;
    }
    // otherwise use the `statement`, if it's empty this will return the empty string.
    else {
      results._statements = results._statement;
      results.statements = Rule.Block.encloseStatement(results.statement);
    }
    return results;
  }
};

// Blank line representation in parser output.
Rule.BlankLine = class blank_line extends Rule {
  compile(match) {
    return "\n";
  }
};

// Comment rule -- matches tokens of type `Tokenizer.Comment`.
Rule.Comment = class comment extends Rule {
  // Comments are special nodes in our token stream.
  parse(parser, tokens, start = 0) {
    let token = tokens[start];
    if (!(token instanceof Tokenizer.Comment)) return undefined;
    return this.clone({
      matched: token,
      nextStart: start + 1
    });
  }

  compile(match) {
    return "//" + `${match.matched.whitespace}${match.matched.comment}`;
  }
};

// Parser error representation in parser output.
Rule.StatementParseError = class parse_error extends Rule {
  constructor(...props) {
    super(...props);
    if (Parser.WARN) console.warn(this.message);
  }

  get message() {
    if (this.parsed) {
      return (
        "CANT PARSE ENTIRE STATEMENT\n" +
        "PARSED      : `" +
        this.parsed +
        "`\n" +
        "CAN'T PARSE : `" +
        this.unparsed +
        "`"
      );
    }
    return "CAN'T PARSE STATEMENT: `" + this.unparsed + "`";
  }

  compile(match) {
    return "// " + match.message.split("\n").join("\n// ");
  }
};
