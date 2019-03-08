//
//  # Rules for constants, identifiers, type names, etc
//
import {
  Rule,
  SpellParser,
  Token,

  proto,
} from "../all.js";

import identifierBlacklist from "./identifier-blacklist.js";

const parser = new SpellParser({ module: "identifiers" });
export default parser;

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

// SpellParser.Rule.MultiWordConstant = class constant extends Rule.Keywords {
//   @proto name = "constant";
//   @proto datatype = "string";
//   @proto precedence = 1;    // must be above "identifier expression"
//   compile(scope, match) {
//     return `'${super.compile(scope, match)}'`;
//   }
// }

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


parser.defineRule({
  name: "its_property",
  alias: ["expression", "property_accessor", "single_expression"],
  syntax: "its {property:identifier}",
  testRule: "its",
  compile(scope, match) {
    const { property } = match.results;
    return `this.${property}`
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["its foo", "this.foo"],
        ["the foo of its bar", "this.bar?.foo"],
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

