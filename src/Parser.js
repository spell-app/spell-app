// Spell "parser" class.
//
import flatten from "lodash/flatten";

// TODO: dependency-inject tokenizer?
import {
  matchTokenTypeAnywhere,
  matchTokenTypeAtStart,
} from "./matchers.js";
import ParseError from "./ParseError.js";
import Tokenizer from "./Tokenizer.js";
import Rule from "./Rule.js";
import parseRule, { parseSyntax } from "./parseRule.js";
import { cloneClass } from "./utils/class.js";
import "./utils/polyfill.js";

export default class Parser {
  // Set to `true` to output debug info while adding rules
  static DEBUG = false;

  // Should we warn about anomalous conditions?
  static WARN = false;

  // Set to `true` to output timing info.
  static TIME = false;

  // Constructor.
  constructor(properties) {
    Object.assign(this, properties);
  }

  //
  //### Parsing
  //
  // Parse `ruleName` rule at head of `text`.
  // If you pass only one argument, we'll assume that's `text` and you want to match `statements`.
  // Handles optional and repeating rules as well as eating whitespace.
  // Returns result of parse.
  //TESTME
  parse(ruleName, text) {
    // If only one argument, assume that's the text and parse `statements`
    if (arguments.length === 1) {
      text = ruleName;
      ruleName = "statements";
    }

    // Convert to tokens.
    if (Parser.TIME) console.time("tokenize");
    // Get tokens WITHOUT NON-INDENTED WHITESPACE since we ignore them anyway
    let tokens = Tokenizer.tokenizeWithoutWhitespace(text);
    if (Parser.TIME) console.timeEnd("tokenize");

    // Bail if we didn't get any tokens back.
    if (!tokens || tokens.length === 0) return undefined;

    if (Parser.TIME) console.time("parse");
    // If we're not parsing `statements`, eat whitespace at the beginning of the line.
    if (ruleName !== "statements") {
      tokens = Tokenizer.removeLeadingWhitespace(tokens);
    }

    // Parse the rule or throw an exception if rule not found.
    const result = this.parseNamedRule(ruleName, tokens, 0, tokens.length, undefined);
    if (Parser.TIME) console.timeEnd("parse");
    return result;
  }

  // Parse `text` and return the resulting source code.
  //  - if one string argument, compiles as "statements"
  // Throws if not parseable.
  //TESTME
  compile(ruleName, text) {
    // If only one argument, assume that's the text and parse `statements`
    if (arguments.length === 1) {
      text = ruleName;
      ruleName = "statements";
    }
    let match = this.parse(ruleName, text);
    if (!match) {
      throw new ParseError(`parser.parse('${ruleName}', '${text}'): can't parse text`);
    }
    return match.compile();
  }

  // Test whether a rule (which may be specified by name) MIGHT be found in head of stream.
  // Returns:
  //  - `true` if the rule MIGHT be matched.
  //  - `false` if there is NO WAY the rule can be matched.
  //  - `undefined` if not determinstic (eg: no way to tell quickly).
  test(rule, tokens) {
    // DEBUG: tokenize if we were passed a string
    if (typeof tokens === "string") {
      tokens = Tokenizer.tokenizeWithoutWhitespace(tokens);
    }
    if (typeof rule === "string") {
      if (!this.rules[rule]) throw new ParseError(`parser.test('${rule}'): rule not found`);
      rule = this.rules[rule];
    }
    return rule.test(this, tokens);
  }

  // Parse a named rule (defined in this parser or in any of our `imports`), returning the "best" match.
  // Returns `undefined` if no match.
  // Throws if rule is not implemented.
  parseNamedRule(ruleName, tokens, start, end) {
    const rule = this.rules[ruleName];
    if (!rule) throw new ParseError(`parser.parseNamedRule('${ruleName}'): rule not found`);
    return rule.parse(this, tokens, start, end);
  }

  //
  // ###   Imports
  //    Parsers can depend on other parsers for additional `rules`.
  //    Imports are lazy-bound into `parser.rules` as necessary.
  //    We assume the top-level parser for a language will include all necessary imports automatically.
  //

  // Add one or more named imports to this parser.
  // Imports increase in priority the later they are in the list.
  imports = [];
  import(...imports) {
    // clear concatenated list of rules so we'll recaculate in `parser.rules`
    delete this.__rules;
    this.imports = this.imports.concat(imports);
  }

  //
  // ### Rules
  //    List of all known rules for this parser.
  //    You can access named rules as `parser.rules["ruleName"]`
  //

  // Start with an empty map of rules.
  _rules = {};

  // Return map of all known rules by rule name, including rules defined in our imports.
  // NOTE: We memoize this, so make sure to clear `__rules` if you're manipulating rules or imports!
  get rules() {
    if (!this.__rules) {
      const output = (this.__rules = {});
      // Get all imported parsers, with us FIRST
      const imports = [this].concat(this.imports.map(Parser.forModule));
      // For each parser
      imports.forEach(parser => {
        for (const ruleName in parser._rules) {
          this.mergeRule(output, ruleName, parser._rules[ruleName]);
        }
      });
    }
    return this.__rules;
  }

  // Add a `rule` to our list of rules!
  // Converts to `alternatives` on re-defining the same rule.
  addRule(ruleName, rule) {
    // Clear memoized `__rules` so we'll recalculate `parser.rules` as necessary
    delete this.__rules;

    // If we got an array of `ruleName`s, recursively add under each name with the same `rule`.
    if (Array.isArray(ruleName)) {
      ruleName.forEach(ruleName => this.addRule(ruleName, rule));
    }
    // Add to our list of _rules
    else {
      this.mergeRule(this._rules, ruleName, rule);
    }
    return rule;
  }

  // Merge `rule` into `map` of rules by `ruleName`.
  // If we already have a rule with that name, we'll add it as an alternative.
  //TESTME
  mergeRule(map, ruleName, rule) {
    let existing = map[ruleName];
    if (!existing) {
      map[ruleName] = rule;
      return;
    }

    // If merging with anything other than a `Group`,
    //  create a `Group` and add the existing rule to that.
    if (!(existing instanceof Rule.Group)) {
      // use `cloneClass()` to get a uniquely named constructor for debugging
      const Group = cloneClass(Rule.Group, ruleName + "_group");
      map[ruleName] = new Group({
        group: ruleName,
        rules: [existing]
      });
      existing = map[ruleName];
    }

    // If BOTH are groups, we can safely mush them together
    if (rule instanceof Rule.Group) {
      existing.addRule(...rule.rules);
    } else {
      existing.addRule(rule);
    }
  }

  // Define multiple rules at once using ruleSyntax.
  // See `parseRule.js`
  defineRules(...ruleProps) {
    const rules = ruleProps.map(ruleProps => this.defineRule(ruleProps));
    return flatten(rules).filter(Boolean);
  }

  // Define a rule using (rule)`syntax` or `patterns` to create the rule instances.
  //  `skip` (boolean, optional) Set to true to skip this rule.
  //  `name` (identifier, required)  Base name of the rule.
  //  `alias` (string or [string], optinal) Other names to define rule under.
  //  `canonical` (string, optional) Canonical name for the rule, available on `Rule` for debugging.
  //  `constructor` (class, required) Class which will be used to instantiate the rule.
  //  `syntax` (string, required) RuleSyntax string for this rule.
  //  `pattern` (RegExp, optional) Regular expression for `Pattern` rules
  //  `precedence` (number, optional) Precedence number for the rule (currently doesn't do anything)
  //  `blacklist` ([string], optional) Array of strings as blacklist for pattern rules.
  //  `leftRecursive' (string, optional) Set to the name of the "main" left-recursive rule if necessary,
  //    i.e. it calls itself as a subrule before matching any literal tokens
  //  `testRule` (Rule or string, optional) Rule or keywords string to use as a test rule.
  //    Specifying this can let us jump out quickly if there is no possible match.
  //
  // Note that we munge the `constructor` passed in for efficiency while parsing.
  defineRule(ruleProps) {
    // If passed in a `rule` instance, just add it
    if (ruleProps instanceof Rule) {
      if (!ruleProps.name) {
        const message = `parser.defineRule(): you must set rule.name when passing a rule object`;
//        console.error(message, ruleProps);
        throw new ParseError(message);
      }
      return this.addRule(ruleProps.name, ruleProps);
    }

    const { skip, constructor, ...props } = ruleProps;
    if (skip) return;

    // throw if required params not provided
    if (!constructor || !props.name) {
      throw new ParseError(`parser.define(): You must pass 'constructor' and 'name'`);
    }

    // Note the module that the rule was defined in
    if (this.module) props.module = this.module;

    // If we're a "canonical" rule, set on Rule.
    // Use this if you want to check the type of a rule in a test or something.
    if (props.canonical) Rule[props.canonical] = constructor;

    // Convert blacklist from list of strings to a map
    if (props.blacklist && Array.isArray(props.blacklist)) {
      props.blacklist = props.blacklist.reduce((map, key) => {
        map[key] = true;
        return map;
      }, {});
    }

    // Convert `testRule` to proper thing if necessary
    const { testRule } = props;
    if (testRule) {
      // Convert string using rule syntax
      if (typeof testRule === "string") {
        props.testRule = parseSyntax(testRule)[0];
      }
      // For token, convert to function which matches that token type.
      else if (testRule instanceof Tokenizer.Token) {
        delete props.testRule;
        props.test = function test(parser, tokens, start = 0, end = tokens.length, testAtStart = this.testAtStart, rules = parser.rules) {
          if (testAtStart) return matchTokenTypeAtStart(testRule, tokens, start, end);
          return matchTokenTypeAnywhere(testRule, tokens, start, end);
        }
      }
    }

    // Combine aliases with the main name
    const names = [props.name].concat(props.alias || []);

    // Instantiate or parse to create rules to work with
    const rules = props.syntax ? parseRule(props.syntax, constructor) : [new constructor()];
    if (!rules || rules.length === 0)
      throw new ParseError(`defineRule(${props.syntax}): didnt get rules back`);

    // if we got an expression or a statement, make sure we have a testRule
//     if (rules[0] instanceof Rule.Sequence && (names.includes("expression") || names.includes("statement")) && !props.testRule) {
//       console.warn(`defineRule('${props.name}'): you should define a testRule`);
//     }

    rules.forEach(rule => {
      // Add props to the rule non-enumerably and non-writably
      //  so we'll get an error if something tries to overwrite them.
      Object.keys(props)
        .forEach(key => Object.defineProperty(rule, key, { value: props[key] }));

      // add the rule!
      this.addRule(names, rule)
    });

    // if tests were defined, mark as `_testable_`
    if (props.tests) {
      // only use the first rule if we got more than one
      // so we don't run the same tests more than once.
      this.addRule("_testable_", rules[0]);
    }

    // if we are `leftRecursive`, define a group which excludes us.
    if (props.leftRecursive) {
      const group = props.leftRecursive;
      const ruleName = `${group}!${props.name}`;
      const nonRecursiveRule = new Rule.RestrictedGroup({ group, excludes: props.name });
// TODO: make sure first rule has this syntax?
      this.addRule(ruleName, nonRecursiveRule);

      // debug
      const debugRuleName = `__leftRecursive_${group}__`;
      if (!this.rules[debugRuleName]) this.addRule(debugRuleName, new Rule.Group({ group: debugRuleName }));
      this.addRule(debugRuleName, rules[0]);
    }

    return rules;
  }

  //
  // ### Parser registry.
  //
  static REGISTRY = {};

  // Get a parser for a given `contextName`.
  // Will re-use existing parser, or create a new one if not already defined.
  static forModule(module) {
    if (!Parser.REGISTRY[module]) {
      Parser.REGISTRY[module] = new Parser({ module });
    }
    return Parser.REGISTRY[module];
  }
}
