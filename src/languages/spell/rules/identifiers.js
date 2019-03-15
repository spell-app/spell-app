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
  snakeCase,
  typeCase,
  singularize,
  pluralize
} from "../all.js";

import identifierBlacklist from "./identifier-blacklist.js";

const parser = new SpellParser({ module: "identifiers" });
export default parser;

// Alpha-numeric word, including dashes or underscores.
const WORD = /^[a-zA-Z][\w\-]*$/;

SpellParser.Rule.Constant = class unknown_constant extends Rule.Pattern {
  @proto pattern = WORD;
  @proto blacklist = identifierBlacklist;
  parse(scope, tokens) {
    const match = super.parse(scope, tokens);
    if (!match) return;
    // Pick up existing constant if defined.
    match.constant = scope.getConstant(match.raw);
    return match;
  }
  compile(scope, match) {
    const constant = match.constant || new Scope.Constant(match.raw);
    return constant.toString();
  }
}

// A possibly-unknown constant.
// `match.constant` will be the existing Scope.Constant if one already exists.
parser.defineRule({
  name: "constant",
  constructor: SpellParser.Rule.Constant,
  tests: [
    {
      tests: [
        { title:"single word", input: "red", output: "'red'" },
        { title:"multi-word", input: "orangish-red", output: "'orangish-red'" },
        { title:"blacklisted word", input: "if", output: undefined },
      ]
    }
  ]
});


// A known single-word constant.
// Note that this is defined as an "expression".
parser.defineRule({
  name: "known_constant",
  alias: ["expression", "single_expression"],
  constructor: class known_constant extends SpellParser.Rule.Constant {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (match && match.constant) return match;
    }
  },
  tests: [
    {
      compileAs: "known_constant",    // TODO: to "expression"
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





//
//  Types
//
SpellParser.Rule.Type = class type extends Rule.Pattern {
  @proto pattern = WORD;
  @proto datatype = "type";
  @proto blacklist = identifierBlacklist;
  @proto valueMap = {
    object: "Object",
    Object: "Object",
    list: "List",
    List: "List",
    number: "number",
    Number: "number",
    integer: "number",
    Integer: "number",
    decimal: "number",
    Decimal: "number",
    text: "text",
    Text: "text",
    character: "character",
    Character: "character",
    boolean: "boolean",
    Boolean: "boolean",
    default: typeCase
  };
  parse(scope, tokens) {
    const match = super.parse(scope, tokens);
    if (!match) return;
    // Pick up existing type if defined.
    match.type = scope.getType(match.compile());
    return match;
  }
}

// A possibly-unknown type identifier, singular or plural.
// `match.type` will be the existing `Scope.Type` if one already exists.
parser.defineRule({
  name: "type",
  constructor: SpellParser.Rule.Type,
  tests: [
    {
      tests: [
        { title:"lower case", input: "thing", output: "Thing" },
        { title:"upper case", input: "Thing", output: "Thing" },
        { title:"multi-word, lower case", input: "bank-account", output: "Bank_Account" },
        { title:"multi-word, mixed case", input: "Bank-account", output: "Bank_Account" },
        { title:"multi-word, upper case", input: "Bank-Account", output: "Bank_Account" },
        { title:"blacklisted word", input: "if", output: undefined },
      ]
    }
  ]
});


// Possibly unknown type which MUST be singular.
parser.defineRule({
  name: "singular_type",
  constructor: class singular_type extends SpellParser.Rule.Type {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (match && match.raw === singularize(match.raw)) return match;
    }
  },
  tests: [
    {
      tests: [
        { title:"singular, lower case", input: "thing", output: "Thing" },
        { title:"singular, upper case", input: "Thing", output: "Thing" },
        { title:"singular, multi-word, lower case", input: "bank-account", output: "Bank_Account" },
        { title:"singular, multi-word, mixed case", input: "Bank-account", output: "Bank_Account" },

        { title:"plural, lower case", input: "things", output: undefined },
        { title:"plural, upper case", input: "Things", output: undefined },
        { title:"plural, multi-word, lower case", input: "bank-accounts", output: undefined },
        { title:"plural, multi-word, mixed case", input: "Bank-accounts", output: undefined },
      ]
    }
  ]
});

// Possibly unknown type which MUST be plural.
// NOTE: the output type name will be SINGULAR!
parser.defineRule({
  name: "plural_type",
  constructor: class plural_type extends SpellParser.Rule.Type {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (match && match.raw === pluralize(match.raw)) return match;
    }
  },
  tests: [
    {
      tests: [
        { title:"plural, lower case", input: "things", output: "Thing" },
        { title:"plural, upper case", input: "Things", output: "Thing" },
        { title:"plural, multi-word, lower case", input: "bank-accounts", output: "Bank_Account" },
        { title:"plural, multi-word, mixed case", input: "Bank-accounts", output: "Bank_Account" },

        { title:"singular, lower case", input: "thing", output: undefined },
        { title:"singular, upper case", input: "Thing", output: undefined },
        { title:"singular, multi-word, lower case", input: "bank-account", output: undefined },
        { title:"singular, multi-word, mixed case", input: "Bank-account", output: undefined },
      ]
    }
  ]
});


// A known type identifier, NOT including built-in types like 'Object'.
parser.defineRule({
  name: "known_type",
  alias: ["expression", "single_expression"],
  constructor: class known_type extends SpellParser.Rule.Type {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (match && match.type) return match;
    }
  },
  tests: [
    {
      beforeEach(scope) {
        scope.addType({ name: "Thing" });
        scope.addType({ name: "Bank-Account" });
      },
      tests: [
        { title:"known type, lower case", input: "thing", output: "Thing" },
        { title:"known type, upper case", input: "Thing", output: "Thing" },
        { title:"known, multi-word, lower case", input: "bank-account", output: "Bank_Account" },
        { title:"known, multi-word, mixed case", input: "Bank-account", output: "Bank_Account" },
        { title:"known, multi-word, upper case", input: "Bank-Account", output: "Bank_Account" },
        { title:"unknown", input: "nothing", output: undefined },
        { title:"unknown. multi-word", input: "other-thing", output: undefined },
      ]
    }
  ]
});


//
//  Variables
//

// Single word variable name, known or unknown.
// TODO: type based on scope variable type?
// TODO: higher precedence if variable is known?
SpellParser.Rule.Variable = class variable extends Rule.Pattern {
  @proto pattern = WORD;
  @proto blacklist = identifierBlacklist;
  valueMap(value) {
    return (""+value).replace(/-/g, "_");
  }
}

// Variable identifier with no adornments.
// You won't generally use this, use `variable` or `unknown_variable` instead.
parser.defineRule({
  name: "variable_identifier",
  constructor: SpellParser.Rule.Variable
});


// Single word variable which may or may not be known by our scope, with optional `the` prefix.
// `match.localVariable` is LOCAL variable with the specified name.
// `match.variable` is any scoped variable with the specified name.
// NOTE: `match` returned is the `{variable}`, not this sequence.
class the_variable extends Rule.Sequence {
  parse(scope, tokens) {
    const match = super.parse(scope, tokens);
    if (!match) return;
    // Return just the `variable_identifier` bit, adjusting `length` to account for `the` as necessary.
    const varMatch = match.matched[match.matched.length - 1];
    varMatch.length = match.length;

    // figure out if we have an existing variable in scope already
    const varName = varMatch.compile();
    varMatch.localVariable = scope.getLocalVariable(varName);
    varMatch.variable = match.localVariable || scope.getVariable(varName);
    return varMatch;
  }
}

// Variable which may or may not be known, with optional `the` prefix.
parser.defineRule({
  name: "variable",
  syntax: "the? {variable_identifier}",
  constructor: the_variable,
  tests: [
    {
      tests: [
        { title:"single word", input: "thing", output: "thing" },
        { title:"multi-word", input: "bank-account", output: "bank_account" },
        { title:"blacklisted word", input: "if", output: undefined },
      ]
    }
  ]
});


// Single word variable which is already known by our scope, with optional `the` prefix
// Note that we match this as an "expression".
// NOTE: `match` returned is the `{variable}`, not this sequence.
parser.defineRule({
  name: "known_variable",
  alias: ["expression", "single_expression"],
  syntax: "the? {variable_identifier}",
  constructor: class known_variable extends the_variable {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (match?.variable) return match;
    }
  },
  tests: [
    {
      compileAs: "known_variable",    // TODO: "expression"
      beforeEach(scope) {
        scope.addVariable("thing");
        scope.addVariable("bank-account");
      },
      tests: [
        { title:"single word", input: "thing", output: "thing" },
        { title:"multi-word", input: "bank-account", output: "bank_account" },
        { title:"not defined", input: "nothing", output: undefined },
      ]
    }
  ]
});

// Possibly unknown variable identifier which MUST be singular, WITHOUT `the`.
parser.defineRule({
  name: "singular_variable",
  constructor: class singular_variable extends SpellParser.Rule.Variable {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (!match) return;
      const varName = match.compile();
      if (varName && varName === singularize(varName)) return match;
    }
  },
  tests: [
    {
      tests: [
        { title:"singular, single word", input: "thing", output: "thing" },
        { title:"singular, multi-word", input: "bank-account", output: "bank_account" },
        { title:"plural, single word", input: "things", output: undefined },
        { title:"plural, multi-word", input: "bank-accounts", output: undefined },
      ]
    }
  ]
});

// Possibly unknown variable identifier which MUST be plural, WITHOUT `the`.
parser.defineRule({
  name: "plural_variable",
  constructor: class plural_variable extends SpellParser.Rule.Variable {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (!match) return;
      const varName = match.compile();
      if (varName && varName === pluralize(varName)) return match;
    }
  },
  tests: [
    {
      tests: [
        { title:"plural, single word", input: "things", output: "things" },
        { title:"plural, multi-word", input: "bank-accounts", output: "bank_accounts" },
        { title:"singular, single word", input: "thing", output: undefined },
        { title:"singular, multi-word", input: "bank-account", output: undefined },
      ]
    }
  ]
});








// `identifier` = variables or property name.
// MUST start with a lower-case letter (?)
// NOTE: We blacklist a lot of words as identifiers, see `identifier-blacklist.js`
parser.defineRule({
  name: "identifier",
  pattern: /^[a-z][\w\-]*$/,
  precedence: -1,
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
  precedence: -1,
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

