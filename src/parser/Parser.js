// Spell "parser" class.
//
import flatten from "lodash/flatten";

import {
  ParseError,
  parseRule,
  parseSyntax,
  Rule,
  rulex,
  Scope,
  Token,
  Tokenizer,
  WhitespacePolicy
} from "./all.js";

import {
  cloneClass,
  proto
} from "../utils/all.js";

export class Parser {
  // Set to `true` to output debug info while adding rules
  @proto DEBUG = false;

  // Should we warn about anomalous conditions?
  static WARN = false;

  // Set to `true` to output timing info.
  static TIME = false;

  // Name of our default rule to parse if calling `parser.parse(text)`.
  @proto defaultRule = "statements";

  // Default tokenizer.  You may want to create one in your parser subclasses,
  //  e.g. to change the whitespacePolicy.
  @proto tokenizer = new Tokenizer({
    whitespacePolicy: WhitespacePolicy.LEADING
  });

  // Map of all of our rules, including imports.
  rules = {};

  // Constructor.
  constructor(properties) {
    Object.assign(this, properties);
  }

  //
  //### Tokenizing
  //
  tokenize(text) {
    return this.tokenizer.tokenize(text);
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
      ruleName = this.defaultRule;
    }

    // Bail if we didn't get any tokens back.
    const tokens = this.tokenize(text);
    if (!tokens || tokens.length === 0) return undefined;

    if (Parser.TIME) console.time("parse");
    // Parse the rule or throw an exception if rule not found.
    const scope = new Scope(this);
    const rule = scope.getRuleOrDie(ruleName);
    const result = rule.parse(scope, tokens, 0, tokens.length);
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
      ruleName = this.defaultRule;
    }
    let match = this.parse(ruleName, text);
    if (!match) {
      throw new ParseError(`parser.parse('${ruleName}', '${text}'): can't parse text`);
    }
    return match.compile();
  }

  // Add rules from other parsers to this parser.
  import(...imports) {
    imports.forEach(parser => {
      for (const ruleName in parser.rules) {
        this.mergeRule(this.rules, ruleName, parser.rules[ruleName]);
      }
    });
  }

  // Add a `rule` to our list of rules!
  // Converts to `Rule.Group` on re-defining the same rule.
  addRule(rule, ruleName) {
    // If rule is a Rule subclass, instantiate it
    if (rule.prototype instanceof Rule) rule = new rule();

    // If we didn't get a ruleName, try `rule.name`
    if (!ruleName) {
      if (!rule.name) throw new ParseError("addRule(): you must set 'rule.name' or pass an explicit ruleName");
      ruleName = rule.name;
    }

    // If we got an array of `ruleName`s, recursively add under each name with the same `rule`.
    if (Array.isArray(ruleName)) {
      ruleName.forEach(ruleName => this.addRule(rule, ruleName));
    }
    // Add to our list of rules
    else {
      this.mergeRule(this.rules, ruleName, rule);
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
        argument: ruleName,
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
  //  `constructor` (class, required) Class which will be used to instantiate the rule.
  //  `syntax` (string, required) RuleSyntax string for this rule.
  //  `pattern` (RegExp, optional) Regular expression for `Pattern` rules
  //  `precedence` (number, optional) Precedence number for the rule (currently doesn't do anything)
  //  `blacklist` ([string], optional) Array of strings as blacklist for pattern rules.
  //  `testRule` (Rule or string, optional) Rule or keywords string to use as a test rule.
  //    Specifying this can let us jump out quickly if there is no possible match.
  defineRule(ruleProps) {
    // If passed in a Rule instance or rule instance, just call addRule
    if (ruleProps instanceof Rule || ruleProps.prototype instanceof Rule)
      return this.addRule(ruleProps);

    let { skip, constructor, ...props } = ruleProps;
    if (skip) return;

    // if `constructor` was not specified, it will be Object
    // set to null in this case
    if (constructor === Object) constructor = null;

    // throw if name was not provided
    const name = props.name || (constructor && constructor.prototype.name);
    if (!name) {
      throw new ParseError(`parser.define(): You must pass the rule 'name'`);
    }

    // Note the module that the rule was defined in
    if (this.module) props.module = this.module;

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
//        props.testRule = rulex.compile(testRule);
        props.testRule = parseRule(testRule);
        props.testRule.syntax = testRule;
      }
    }

    // Combine aliases with the main name
    const names = [props.name].concat(props.alias || []);

    // Instantiate or parse to create rules to work with
    const rule = props.syntax
      ? parseRule(props.syntax, constructor, props)
      : new constructor(props)
    ;
    if (!rule) throw new ParseError(`defineRule(${props.syntax}): didnt get a rule back`);

    this.addRule(rule, names);

    // if tests were defined, mark as `_testable_`
    if (props.tests) {
      if (!this.rules._testable_) this.addRule(new Rule.Group({ name: "_testable_" }));
      this.addRule(rule, "_testable_");
    }

    return rule;
  }
}
