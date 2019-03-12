//
//  # Rules for constants, identifiers, type names, etc
//
import {
  Rule,
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
const LOWER_INITIAL_WORD = /^[a-z][\w\-]*$/;
const UPPER_INITIAL_WORD = /^[A-Z][\w\-]*$/;

//
//  Constants:
//  - set up group for constants and an expression which returns constants from that group.
//
SpellParser.Rule.Constant = class constant extends Rule.Keyword {
  @proto name = "constant";
  @proto datatype = "string";
  @proto precedence = 1;    // must be above "identifier expression"
  compile(scope, match) {
    return `'${super.compile(scope, match)}'`;
  }
}

SpellParser.Rule.MultiWordConstant = class constant extends Rule.Keywords {
  @proto name = "constant";
  @proto datatype = "string";
  @proto precedence = 1;    // must be above "identifier expression"
  compile(scope, match) {
    return `'${super.compile(scope, match)}'`;
  }
}

// Make sure that "constants" group is defined.
parser.defineRule({
  name: "constant",
  argument: "constant",
  constructor: Rule.Group,
});

// Identifier to match a constant.
// NOTE: precedence of this doesn't matter...
parser.defineRule({
  name: "constant_expression",
  alias: ["expression", "single_expression"],
  rule: "constant",
  constructor: Rule.Subrule
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
      match.isKnownType = !!scope.getType?.(type);
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
  constructor: SpellParser.Rule.Type
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
// TESTME
parser.defineRule({
  name: "known_type",
  constructor: class known_type extends SpellParser.Rule.Type {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (match && (!match.isKnownType || match.isBaseType)) return;
      return match;
    }
  }
});



//
//  Variables
//

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


/*
// `Type` = type name.
// MUST start with an upper-case letter (?)
parser.defineRule({
  name: "type",
  alias: ["expression", "single_expression"],
  datatype: "string",   // TODO???
  pattern: /^([A-Z][\w\-]*|list|text|number|integer|decimal|character|boolean|object)$/,
  blacklist: {
    I: true
  },
  valueMap: {
    // Alias `List` to `Array`
    "List": "Array",
    // special case to take the following as lowercase
    "list": "Array",
    "text": "String",
    "character": "Character",
    "number": "Number",
    "integer": "Integer",
    "decimal": "Decimal",
    "boolean": "Boolean",
    "object": "Object",
    // otherwise just turn dashes into underscores
    default(type) {
      return type.replace(/\-/g, "_");
    }
  },
  tests: [
    {
      title: "correctly matches types",
      tests: [
        ["Abc", "Abc"],
        ["Abc-def", "Abc_def"],
        ["Abc_Def", "Abc_Def"],
        ["Abc01", "Abc01"],
        ["Abc-def_01", "Abc_def_01"]
      ]
    },
    {
      title: "doesn't match things that aren't types",
      tests: [
        ["", undefined],
        ["$Asda", undefined], // TODO... ???
        ["(Asda)", undefined] // TODO... ???
      ]
    },
    {
      title: "converts special types",
      tests: [
        ["List", "Array"],
        ["list", "Array"],
        ["text", "String"],
        ["character", "Character"],
        ["number", "Number"],
        ["integer", "Integer"],
        ["decimal", "Decimal"],
        ["boolean", "Boolean"],
        ["object", "Object"]
      ]
    },
    {
      title: "skips items in its blacklist",
      tests: [["I", undefined]]
    }
  ]
});

*/
