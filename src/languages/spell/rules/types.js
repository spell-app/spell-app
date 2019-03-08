//
//  # Rules for defining classes (known as `types`)
//

// TODO: constructor
// TODO: mixins / traits / composed classes / annotations

import {
  Rule,
  SpellParser,
  Token,

  pluralize
} from "../all.js";

const parser = new SpellParser({ module: "types" });
export default parser;

//
//  Self-reference
//


//
//  Property access
//

parser.defineRule({
  // TODO: multiple identifiers would be cool...
  name: "property_expression",
  alias: ["expression", "single_expression"],
  syntax: "{property_accessor} {expression:single_expression}",
  testRule: "{property_accessor}",    // ???
  compile(scope, match) {
    let { expression, property_accessor } = match.results;
    // TODO: `[xxx]` for non-identifiers
    return `${expression}?.${property_accessor}`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["the foo of bar", "bar?.foo"],
        ["the foo of the bar", "bar?.foo"],
        ["the foo of the bar of the baz", "baz?.bar?.foo"],
        ["the foo-bar of the baz", "baz?.foo_bar"]
      ]
    }
  ]
});

parser.defineRule({
  name: "the_property_of",
  alias: "property_accessor",
  syntax: "the {property:identifier} of",
  testRule: "the",
  compile(scope, match) {
    return match.results.property;
  },
});

//MOVE TO `functions`?
// Arguments clause for methods
//  `with foo` or `with foo and bar and baz`
//TODO: {identifier} = {expression}  => requires `,` instead of `and`
//TODO: `with foo as Type`
//TODO:  `with foo...` for splat?
parser.defineRule({
  name: "args",
  syntax: "with [args:{identifier},]",
  // Returns an array of argument values
  compile(scope, match) {
    const { args } = match.results;
    return args.join(", ");
  },
  tests: [
    {
      tests: [
        ["with a", "a"],
        ["with a, b, c", "a, b, c"],
        ["with a, b, c,", "a, b, c"]
      ]
    }
  ]
});

// Properties clause: creates an object with one or more property values.
//  `foo = 1, bar = 2`
//TODO: would like to use `and` but that conflicts with "and" operator
//TODO: don't quote if we don't have to? (ASCII and blacklist only)
//TOOD: multiple lines if > 2 props?
parser.defineRule({
  name: "object_literal_properties",
  syntax: "[({key:identifier} (?:= {value:expression})?),]",
  compile(scope, match) {
    let props = match.items.map(function(prop) {
      let { key, value } = prop.results;
      if (value) return `"${key}": ${value}`;
      return key;
    });
    return `{ ${props.join(", ")} }`;
  },
  tests: [
    {
      tests: [
        [``, undefined],
        [`a = 1`, `{ "a": 1 }`],
        [`a = 1,`, `{ "a": 1 }`],
        [`a = 1, b = yes, c = "quoted"`, `{ "a": 1, "b": true, "c": "quoted" }`],
        [`a = 1, b = the foo of the bar`, `{ "a": 1, "b": bar?.foo }`]
      ]
    }
  ]
});
