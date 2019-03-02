// Spell "parser" class.
//
import { isNode } from "browser-or-node";
import isEqual from "lodash/isEqual";
import flatten from "lodash/flatten";

import {
  ParseError,
  Rule,
  rulex,
  Scope,
  Token,
  Tokenizer,
  WhitespacePolicy,

  addDebugMethods,
  DebugLevel,
  cloneClass,
  proto,
  memoize,
  clearMemoized,
  nonEnumerable
} from "./all.js";


// In the web browser, by default, we'll use `cloneClass()` to make debugging easier
// by creating named subclasses which you can see in the browser console
// when inspecting rules, matches, etc.
//
// This is a bit slower (4-5% for the object allocation, not sure about inheritance chain),
// see:   https://jsperf.com/create-named-class-with-function

const CLONE_CLASSES = !isNode;

export class Parser {
  // Set to `true` to output timing info for this parser.
  @proto TIME = false;

  // Name of our default rule to parse if calling `parser.parse(text)`.
  @proto defaultRule = "statements";

  // Constructor.
  constructor(properties) {
    Object.assign(this, properties);

    // If we have a module specified, add debug methods under that module name
    if (this.module) addDebugMethods(this, this.module);
  }

  //
  //### Tokenizing
  //

  // Default tokenizer.  You may want to create one in your parser subclasses,
  //  e.g. to change the whitespacePolicy.
  @proto tokenizer = new Tokenizer({
    whitespacePolicy: WhitespacePolicy.LEADING_ONLY
  });

  // Tokenize input `text`.
  // `ruleName` is there in case you want to tokenize differently for different top-level rules.
  tokenize(text, ruleName) {
    return this.tokenizer.tokenize(text);
  }

  //
  //### Parsing
  //

  // Return a scope object we'll use for parsing.
  getParsingScope() {
    return new Scope(this);
  }

  // Parse `ruleName` rule at head of `text`.
  // If you pass only one argument, we'll assume that's `text` and you want to match `statements`.
  // Handles optional and repeating rules as well as eating whitespace.
  // Returns result of parse.
  parse(text, ruleName = this.defaultRule, scope = this.getParsingScope()) {
    // Bail if we didn't get any tokens back.
    const tokens = this.tokenize(text, ruleName);
    if (!tokens || tokens.length === 0) return undefined;

    if (Parser.TIME) console.time("parse");
    // Parse the rule or throw an exception if rule not found.
    const rule = scope.getRuleOrDie(ruleName);
    const result = rule.parse(scope, tokens);
    if (Parser.TIME) console.timeEnd("parse");
    return result;
  }

  // Parse `text` and return the resulting source code.
  //  - if one string argument, compiles as "statements"
  // Throws if not parseable.
  compile(text, ruleName = this.defaultRule, scope = this.getParsingScope()) {
    let match = this.parse(text, ruleName, scope);
    if (!match) {
      throw new ParseError(`parser.parse('${ruleName}', '${text}'): can't parse text`);
    }
    return match.compile();
  }

  //
  //  Rules
  //

  // Private map of all of our rules, NOT including rules from imports.
  // NOTE: optimally this would be `#rules` to mark it private,
  //  but private fields and decorators don't work together in babel 7.
  //
  // Use `parser.rules` to get ALL rules, including those from imports.
  @nonEnumerable
  _rules = {};

  @memoize
  get rules() {
    if (!this.imports) return {...this._rules};
    return this.mergeRuleSets(this._rules, ...this.imports.map(parser => parser.rules));
  }

  // Add a `rule` to our list of rules!
  // Converts to `Rule.Group` on re-defining the same rule.
  @clearMemoized("rules")
  addRule(rule, ruleName) {
    // If rule is a Rule subclass, instantiate it
    if (rule.prototype instanceof Rule) rule = new rule();

    // If we didn't get a ruleName, try `rule.name`
    if (!ruleName) {
      if (!rule.name) throw new ParseError("addRule(): you must set 'rule.name' or pass an explicit ruleName");
      ruleName = rule.name;
    }

    if (!(rule instanceof Rule)) {
      this.error("addRule() called with a non-rule.  Did you mean to call defineRule()?\n", rule);
      return;
    }

    // If we got an array of `ruleName`s, recursively add under each name with the same `rule`.
    if (Array.isArray(ruleName)) {
      ruleName.forEach(ruleName => this.addRule(rule, ruleName));
    }
    // Add to our list of rules
    else {
      this.mergeRule(this._rules, ruleName, rule);
    }

    return rule;
  }

  // Add rules from other parsers to this parser.
  @clearMemoized("rules")
  import(...imports) {
    this.imports = [].concat(this.imports || [], imports);
  }

  // Merge all rule `sources` together into a new rules map.
  mergeRuleSets(...sources) {
    const rules = { ...sources[0] };
    for (var i = 1, source; source = sources[i]; i++) {
      for (const ruleName in source) {
        this.mergeRule(rules, ruleName, source[ruleName]);
      }
    }
    return rules;
  }

  // Merge a single `rule` into map of `rules` by `ruleName`.
  // If `rules` already has a rule with that name:
  //  - if `rules[ruleName]` is a Rule.Group, we'll just add the new rule to the group,
  //  - or we'll convert `rules[ruleName]` to a group with the original + new rules.
  mergeRule(map, ruleName, rule) {
    let existing = map[ruleName];
    if (!existing) {
      // Always clone groups when adding.
      if (rule instanceof Rule.Group) rule = rule.clone();
      map[ruleName] = rule;
      return;
    }

    // Merge existing rule and rule passed in as a new Group
    if (existing instanceof Rule.Group)
      map[ruleName] = existing.clone();
    else
      map[ruleName] = new Rule.Group({ rules: [existing], argument: ruleName });

    if (rule instanceof Rule.Group)
      map[ruleName].addRule(...rule.rules)
    else
      map[ruleName].addRule(rule);
  }


  //
  //  Defining rules using the "rulex" syntax
  //

  // Define multiple rules at once.
  // NOTE: it's better to do this using individual `defineRule()` calls
  //       as error stack traces will get you to the right line if there's a problem.
  defineRules(...ruleProps) {
    const rules = ruleProps.map(ruleProps => this.defineRule(ruleProps));
    return flatten(rules).filter(Boolean);
  }

  // Define a rule using (rule)`syntax` or `patterns` to create the rule instances.
  //  `skip` (boolean, optional) Set to true to skip this rule if it's not working.
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
    try {
      // If passed in a Rule instance or rule instance, just call addRule
      if (ruleProps instanceof Rule || ruleProps.prototype instanceof Rule)
        return this.addRule(ruleProps);

      let { skip, constructor, ...props } = ruleProps;
      if (skip) return;

      // if `constructor` was not specified, it will be Object,
      // we're expecting it to be a Rule, so clear it.
      if (constructor === Object) constructor = null;

      // throw if name was not provided
      const name = props.name || (constructor && constructor.prototype.name);
      if (!name)
        throw new ParseError("You must pass the rule 'name'");

      // Try to infer the constructor if we didn't get one
      if (!constructor) {
        if (props.tokenType)
          constructor = Rule.TokenType;
        else if (props.pattern)
          constructor = Rule.Pattern;
        else if (!ruleProps.syntax)
          throw new ParseError("You must pass 'constructor' or 'syntax'");
      }

      // Note the module that the rule was defined in
      if (this.module) props.module = this.module;

      // Convert `testRule` to proper thing if necessary
      const { testRule } = props;
      if (testRule) {
        // Convert string using rule syntax
        if (typeof testRule === "string") {
          props.testRule = rulex.compile(testRule);
          props.testRule.syntax = testRule;
        }
      }

      // Instantiate or parse to create rules to work with
      let rule;
      if (props.syntax) {
        // Use the `rulex` compiler to generate a rule
        rule = rulex.compile(props.syntax);
        if (!rule) throw new ParseError(`Didn't get a rule from rulex.compile('${props.syntax}')`);

        // We want to use a named constructor below, so copy properties from the rule
        props = {...rule, ...props};
        if (CLONE_CLASSES && !constructor) constructor = rule.constructor;
      }

      // use `cloneClass()` to make a new constructor with the rule `name` for ease in debugging
      if (constructor && CLONE_CLASSES && constructor.name !== name)
        constructor = cloneClass(constructor, name);

      if (constructor)
        rule = new constructor(props);
      else if (rule)
        Object.assign(rule, props);
      else
        throw new ParseError("no rule... ???");


      // Combine aliases with the main name and add rule under all the names
      const names = [props.name].concat(props.alias || []);
      if (props.tests) names.push("_testable_");
      this.addRule(rule, names);

      return rule;
    }
    catch (error) {
      if (!isNode) this.warn("Error in defineRule():", error, "\nprops:", ruleProps);
    }
  }
}

// Add debug methods to all parser instances.
addDebugMethods(Parser.prototype, "parser", DebugLevel.WARN);
