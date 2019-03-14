//
//  # Rules for constants, variables, type names, etc
//
import {
  Match,
  Rule,
  Scope,
  SpellParser,
  Token,

  proto,
  upperFirst,
  singularize,
  pluralize
} from "../all.js";

import identifierBlacklist from "./identifier-blacklist.js";

const parser = new SpellParser({ module: "identifiers" });
export default parser;

const WORD = /^[a-zA-Z][\w\-]*$/;



// A known single-word constant.
parser.defineRule({
  name: "constant",
  alias: ["expression", "single_expression"],
  constructor: class constant extends Rule {
    parse(scope, tokens) {
      const constant = scope.getConstant(tokens[0].value);
      if (!constant) return;
      return new Match({
        rule: this,
        constant,
        isKnown: true,
        matched: [tokens[0]],
        length: 1,
        scope
      });
    }
    compile(scope, match) {
      return match.constant.toString()
    }
  },
  tests: [
    {
      compileAs: "constant",    // TODO: to "expression"
      beforeEach(scope) {
        scope.addConstant("red");
        scope.addConstant({ name: "green", value: "#00FF00" });
      },
      tests: [
        { title: "known constant", input: "red", output: "'red'" },
        { title: "known constant w/specific value", input: "green", output: "#00FF00" },
        { title: "unknown constant", input: "nothing", output: undefined }
      ]
    }
  ]
});


// A possibly-unknown constant.
parser.defineRule({
  name: "unknown_constant",
  pattern: WORD,
  blacklist: identifierBlacklist,     // ????
  constructor: class unknown_constant extends Rule.Pattern {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (!match) return;
      const name = match.getTokens()[0];
      const existing = scope.getConstant(name);
      if (existing) {
        match.constant = existng;
        match.isKnown = true;
      }
      else {
        match.constant = new Scope.Constant({ name });
        match.isKnown = false;
      }
      return match;
    }
    compile(scope, match) {
      return match.constant.toString();
    }
  },
  tests: [
    {
      tests: [
        { title:"normal constant", input: "red", output: "'red'" },
        { title:"blacklisted word", input: "if", output: undefined },
      ]
    }
  ]
});



//
//  Types
//
SpellParser.Rule.Type = class type_ extends Rule.Pattern {  // if name is `type`, `super.parse()` doesn't work
  @proto pattern = WORD;
  @proto datatype = "type";
  @proto blacklist = identifierBlacklist;
  @proto baseTypes = {
    Object: "Object",
    List: "List",
    Number: "number",
    Integer: "number",
    Decimal: "number",
    Text: "text",
    Character: "character",
    Boolean: "boolean"
  };

  // TODO: precedence goes up radically if type is known, is built in, etc.

  parse(scope, tokens) {
    // TODO: ????
    const match = super.parse(scope, tokens);
    if (!match) return;
    // Figure out characteristics of what was matched, which will affect precedence, etc.
    let type = this.getTokens(match)[0];
    match.raw = type;
    match.isIntialCase = type[0] === type[0].toUpperCase();
    match.isPlural = type === pluralize(type);

    // Canonical name is Upperfirst unless specifically overrdden below
    type = upperFirst(singularize(type)).replace(/-/g, "_");
    if (this.baseTypes[type]) {
      match.isBaseType = true;
      match.$type = this.baseTypes[type];
    }
    else {
      // It is a known type if the scope already knows about it.
      match.isKnown = !!scope.getType?.(type);
      match.$type = type;
    }

    return match;
  }

  compile(scope, match) {
    return match.$type;
  }
}

// Normal type identifier.
// TESTME
parser.defineRule({
  name: "type",
  constructor: SpellParser.Rule.Type,

});

// Type identifier which MUST be plural
// TESTME
parser.defineRule({
  name: "plural_type",
  constructor: class plural_type extends SpellParser.Rule.Type {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (match && !match.isPlural) return;
      return match;
    }
  }
});

// Type identifier which MUST be a known type (or a built-in?)
// TODO: is this an "expression"?
// TODO: built-in type?
// TESTME
parser.defineRule({
  name: "known_type",
  constructor: class known_type extends SpellParser.Rule.Type {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (match && (!match.isKnown || match.isBaseType)) return;
      return match;
    }
  }
});



//
//  Variables
//

// Single word variable name, known or unknown.
// TODO: type based on scope variable type?
// TODO: higher precedence if type is known?
SpellParser.Rule.Variable = class variable extends Rule.Pattern {
  @proto pattern = WORD;
  @proto blacklist = identifierBlacklist;
  valueMap(value) {
    return (""+value).replace(/-/g, "_");
  }
}

// Variable match with no adornments.
parser.defineRule({
  name: "variable",
  constructor: SpellParser.Rule.Variable
});

// Variable which MUST be singular, WITHOUT `the`.
parser.defineRule({
  name: "singular_variable",
  constructor: class singular_variable extends SpellParser.Rule.Variable {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (!match) return;
      const varName = match.compile();
      if (varName && varName === singularize(varName)) return match;
    }
  }
});

// Variable which MUST be plural, WITHOUT `the`.
parser.defineRule({
  name: "plural_variable",
  constructor: class plural_variable extends SpellParser.Rule.Variable {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (!match) return;
      const varName = match.compile();
      if (varName && varName === pluralize(varName)) return match;
    }
  }
});


// Single word variable which is NOT known by our scope.
// NOTE: `match` returned is the `{variable}`, not this sequence.
parser.defineRule({
  name: "unknown_variable",
  syntax: "the? {variable}",
  constructor: class known_variable extends Rule.Sequence {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (!match) return;
      const varMatch = match.matched[match.matched.length - 1];
      const varName = varMatch.compile();
      if (!scope.getLocalVariable(varName)) return varMatch;
    }
  }
});


// Single word variable which is already known by our scope.
// Note that we match this as an "expression".
// NOTE: `match` returned is the `{variable}`, not this sequence.
parser.defineRule({
  name: "known_variable",
  alias: ["expression", "single_expression"],
  syntax: "the? {variable}",
  constructor: class known_variable extends Rule.Sequence {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (!match) return;
      const varMatch = match.matched[match.matched.length - 1];
      const varName = varMatch.compile();
      if (scope.getLocalVariable(varName)) return varMatch;
    }
  }
});








// `identifier` = variables or property name.
// MUST start with a lower-case letter (?)
// NOTE: We blacklist a lot of words as identifiers, see `identifier-blacklist.js`
parser.defineRule({
  name: "identifier",
  pattern: /^[a-z][\w\-]*$/,
  // convert dashes to underscores when compiling
  valueMap(value) {
    return (""+value).replace(/\-/g, "_")
  },
  blacklist: identifierBlacklist,
  tests: [
    {
      title: "correctly matches identifiers",
      tests: [
        ["", undefined],
        ["abc", "abc"],
        ["abc-def", "abc_def"],
        ["abc_def", "abc_def"],
        ["abc01", "abc01"],
        ["abc-def_01", "abc_def_01"]
      ]
    },
    {
      title: "doesn't match things that aren't identifiers",
      tests: [
        ["", undefined],
        ["$asda", undefined],
        ["(asda)", undefined],
        ["Abc", undefined],
      ]
    },
    {
      title: "skips items in its blacklist",
      tests: [
        ["yes", undefined],
        ["the", undefined],
      ],
    }
  ]
});

parser.defineRule({
  name: "identifier_expression",
  alias: ["expression", "single_expression"],
  syntax: "the? {identifier}",
  compile(scope, match) {
    return match.results.identifier;
  },
  tests: [
    {
      title: "correctly matches identifiers with the",
      compileAs: "expression",
      tests: [
        ["the abc", "abc"],
        ["the abc-def", "abc_def"],
        ["the abc_def", "abc_def"],
        ["the abc01", "abc01"],
        ["the abc-def_01", "abc_def_01"]
      ]
    },
    {
      title: "correctly matches identifiers without the",
      compileAs: "expression",
      tests: [
        ["abc", "abc"],
        ["abc-def", "abc_def"],
        ["abc_def", "abc_def"],
        ["abc01", "abc01"],
        ["abc-def_01", "abc_def_01"]
      ]
    },
    {
      title: "doesn't match things that aren't identifiers with or without 'the'",
      compileAs: "expression",
      tests: [
        ["", undefined],
        ["$asda", undefined],
        ["the", undefined],
        ["the $asda", undefined],
        ["the (asda)", undefined],
        ["the Abc", undefined],
      ]
    },
    {
      title: "skips items in identifier blacklist with or without the",
      tests: [
        ["true", undefined],
        ["yes", undefined],
        ["the the", undefined],
        ["the yes", undefined],
      ],
    }
  ]
});

