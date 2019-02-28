//
//  # Rules for defining classes (known as `types`)
//

// TODO: constructor
// TODO: mixins / traits / composed classes / annotations

import {
  Rule,
  SpellParser,
  Token,
} from "./all.js";

import { pluralize } from "../../utils/all.js";

const parser = new SpellParser({ module: "types" });
export default parser;

//
//  Self-reference
//

// TODO: confusing???
parser.defineRule({
  name: "me",
  alias: "expression",
  syntax: "me",
  compile(match) {
    return "this";
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["me", "this"]]
    }
  ]
});

// TODO: this really makes me want to make `I am empty` etc work...
parser.defineRule({
  name: "I",
  alias: "expression",
  syntax: "I",
  compile(match) {
    return "this";
  },
  tests: [
    {
      compileAs: "expression",
      tests: [["I", "this"]]
    }
  ]
});

//
//  Property access
//

parser.defineRule({
  // TODO: multiple identifiers would be cool...
  name: "property_expression",
  alias: "expression",
  syntax: "{property_accessor} {expression}",
  testRule: "{property_accessor}",    // ???
  compile(match) {
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
  name: "property_accessor",
  syntax: "the {identifier} of",
  testRule: "the",
  compile(match) {
    return match.results.identifier;
  },
});

parser.defineRule({
  name: "my_property_accessor",
  alias: ["expression", "property_accessor"],
  syntax: "my {identifier}",
  testRule: "my",
  compile(match) {
    let { identifier } = match.results;
    return `this.${identifier}`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["my foo", "this.foo"],
        ["the foo of my bar", "this.bar?.foo"],
        ["the foo of my bar is 'fooo'", "(this.bar?.foo == 'fooo')"],
      ]
    }
  ]
});

parser.defineRule({
  name: "its_property_accessor",
  alias: ["expression", "property_accessor"],
  syntax: "its {identifier}",
  testRule: "its",
  compile(match) {
    const { identifier } = match.results;
    return `this.${identifier}`
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["its foo", "this.foo"],
      ]
    }
  ]
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
  constructor: SpellParser.BlockStatement,
  // Returns an array of argument values
  compile(match) {
    const { args } = match.results;
    return args.join(", ");
  },
  tests: [
    {
      tests: [["with a", "a"], ["with a, b, c", "a, b, c"], ["with a, b, c,", "a, b, c"]]
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
  compile(match) {
    let props = match.matched.map(function(prop) {
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


/*
//
//  declare properties
//

parser.defineRule({
  //TODO: another name for `constant` ?
  name: "declare_property",
  alias: ["statement", "mutatesScope"],
  syntax: "(scope:property|constant|shared property) {name:identifier} (?:= {value:expression})?",
  testRule: "(property|constant|shared)",
  compile(match) {
    let { scope, name, value = "" } = match.results;
    if (value) value = ` = ${value}`;

    let declaration = `${name}${value}`;
    switch (scope) {
      case "constant":
        if (!value)
          console.warn(
            "parse('declare_property'): constant properties must declare a value:  ",
            this.matchedText
          );
        return `const ${declaration}`;

      case "shared property":
        return `@proto ${declaration}`;

      case "property":
      default:
        return declaration;
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["property foo", "foo"],
        //FIXME          ["constant foo", "const foo"],
        ["shared property foo", "@proto foo"],

        ["property foo = the foo of the bar", "foo = bar?.foo"],
        ["constant foo = 'some text'", "const foo = 'some text'"],
        ["shared property foo = create an object with a = 1", '@proto foo = { "a": 1 }']
      ]
    }
  ]
});

// TODO: merge with `declare_property`?
// TODO: in class/object scope only?
// TODO: `@typed` decorator to make substitution cleaner
parser.defineRule({
  name: "declare_property_of_type",
  alias: ["statement", "mutatesScope"],
  syntax: "property {name:identifier} as (a|an)? {type} (?:= {value:expression})?",
  testRule: "property",
  compile(match) {
    let { name, type, value = "undefined" } = match.results;
    return `@typed(${type}) ${name} = ${value}`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["property foo as a Foo", "@typed(Foo) foo = undefined"],
        ["property foo as text = 'default value'", "@typed(String) foo = 'default value'"],
        ["property foo as a list = []", "@typed(Array) foo = []"]
      ]
    }
  ]
});

parser.defineRule({
  name: "inline_list",
  syntax: "[{items:expression},]"
});

// TODO: `@typed` decorator which takes array to make logic cleaner
// TODO: assign to first value if no default?
// TODO: allow list to be an expression?
parser.defineRule({
  name: "declare_property_as_one_of",
  alias: ["statement", "mutatesScope"],
  syntax:
    "property {name:identifier} as one of {list:inline_list} (?:with value {value:expression})?",
  testRule: "property",
  compile(match) {
    let { name, list, value = "undefined" } = match.results;
    return `@typed(${list.join(", ")}) ${name} = ${value}`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["property foo as one of my-list", "@typed(my_list) foo = undefined"],
        ["property foo as one of [1, 2, 3]", "@typed([1, 2, 3]) foo = undefined"],
        [
          "property foo as one of yes, no, undefined",
          "@typed(true, false, undefined) foo = undefined"
        ],

        ["property foo as one of my-list with value 'a'", "@typed(my_list) foo = 'a'"],
        ["property foo as one of [1, 2, 3] with value 1", "@typed([1, 2, 3]) foo = 1"],
        [
          "property foo as one of yes, no, undefined with value yes",
          "@typed(true, false, undefined) foo = true"
        ]
      ]
    }
  ]
});

// Getter.
// TODO: `to get x` ?
// TODO: make the `:` optional in a way that doesn't conflict with `get x`
// TODO: implicit return in block form
parser.defineRule({
  name: "getter",
  alias: ["statement", "mutatesScope"],
  syntax: "get {name:identifier} \\: return? {expression}?",
  testRule: "get",
  constructor: SpellParser.BlockStatement,
  compile(match) {
    // NOTE: we need to parse `expression` and `block` manually (unlike other BlockStatements)
    let { name, expression, statements } = match.results;

    if (expression) {
      const returnPrefix = expression.startsWith("return ") ? "" : "return ";
      statements = `{ ${returnPrefix}${expression} }`;
    } else if (!statements) {
      statements = "{}";
    }
    return `get ${name}() ${statements}`;
  },
  tests: [
    {
      compileAs: "statements",
      tests: [
        ["get foo:", "get foo() {}"],
        ["get foo: a", "get foo() { return a }"],
        ["get foo: return a", "get foo() { return a }"],
        ["get foo:\n\treturn a", "get foo() {\n\treturn a\n}"],
        [
          "get foo:\n\tside-effect = yes\n\treturn a",
          "get foo() {\n\tside_effect = true\n\treturn a\n}"
        ]
      ]
    }
  ]
});

// Setter.
// Complains if you specify more than one argument.
// If you don't pass an explicit argument, we'll assume it's the same as the identifier.
// eg;  `set color: set the color of my text to color`
//
// TODO: internal getter/setter semantics ala objective C
//      `set color: if color is in ["red", "blue"] then set my color to color`
//     => `my color` within setter should automatically translate to `this._color` ???
// TODO: `to set...` ?
parser.defineRule({
  name: "setter",
  alias: ["statement", "mutatesScope"],
  syntax: "set {name:identifier} {args}? (\\:)? {statement}?",
  testRule: "set",
  constructor: SpellParser.BlockStatement,
  compile(match) {
    // default args to the setter name
    let { name, args = name, statements } = match.results;
    // Complain if more than one argument
    if (args && args.includes(",")) {
      console.warn("parse('setter'): only one argument allowed in setter:  ", args);
      args = args.trim().split(",")[0];
    }
    return `set ${name}(${args}) ${statements}`;
  },
  tests: [
    {
      compileAs: "statements",
      tests: [
        // no body
        ["set color", "set color(color) {}"],
        ["set color:", "set color(color) {}"],
        ["set color with culr", "set color(culr) {}"],
        ["set color with culr:", "set color(culr) {}"],
        // inline form
        [
          "set color set the color of my text to color",
          "set color(color) { this.text.color = color }"
        ],
        [
          "set color: set the color of my text to color",
          "set color(color) { this.text.color = color }"
        ],
        [
          "set color with culr set the color of my text to culr",
          "set color(culr) { this.text.color = culr }"
        ],
        [
          "set color with culr: set the color of my text to culr",
          "set color(culr) { this.text.color = culr }"
        ],
        // nested block form
        [
          "set color\n\tset the color of my text to color",
          "set color(color) {\n\tthis.text.color = color\n}"
        ],
        [
          "set color:\n\tset the color of my text to color",
          "set color(color) {\n\tthis.text.color = color\n}"
        ],
        [
          "set color with culr\n\tset the color of my text to culr",
          "set color(culr) {\n\tthis.text.color = culr\n}"
        ],
        [
          "set color with culr:\n\tset the color of my text to culr",
          "set color(culr) {\n\tthis.text.color = culr\n}"
        ]
      ]
    }
  ]
});

// Declare instance method or normal function.
// TODO: static/etc
// parser.defineRule({
//   name: "declare_method",
//   alias: ["statement", "mutatesScope"],
//   syntax: "(operator:to|on) {name:identifier} {args}? (\\:)? {statement}?",
//   testRule: "(to|on)",
//   constructor: SpellParser.BlockStatement,
//   compile(match) {
//     let { name, args = "", statements } = match.results;
//     return `${name}(${args}) ${statements}`;
//   },
//   tests: [
//     {
//       compileAs: "statements",
//       tests: [
//         ["on foo", "foo() {}"],
//         ["to foo", "foo() {}"],
//         ["to foo:", "foo() {}"],
//         ["to foo with a", "foo(a) {}"],
//         ["to foo with a, b", "foo(a, b) {}"],
//         ["to foo with a,b,c", "foo(a, b, c) {}"],
//         ["to foo a = yes", "foo() { a = true }"],
//         ["to foo: a = yes", "foo() { a = true }"],
//         ["to foo with a: a = yes", "foo(a) { a = true }"],
//         ["to foo\n\ta = yes", "foo() {\n\ta = true\n}"],
//         ["to foo with a, b\n\ta = yes\n\tb = no", "foo(a, b) {\n\ta = true\n\tb = false\n}"]
//       ]
//     }
//   ]
// });

// Declare "action", which can be called globally and affects the parser.
// TODO: `turn a card over`
// TODO: {keyword:{identifier} (keywords:({word}|{type})?)
// TODO: `with` clause (will conflict with `word`)
// TODO: install the action as a special in the parser somehow
// TODO: create instance function?  or maybe we don't need it:
//      `action turn Card over` for an instance is just `turn me over`
//      `action add card to deck` => `add me to deck`
//TESTME
parser.defineRule({
  name: "declare_action",
  alias: ["statement", "mutatesScope"],
  syntax: "action (keywords:{word}|{type})+ (\\:)? {statement}?",
  testRule: "action",
  constructor: SpellParser.BlockStatement,
  compile(match) {
    const { results } = match;

    // if there's only one keyword, it can't be a type or a blacklisted identifier
    const { keywords, statements } = results;
    const _keywords = match.matched[1].matched;
    if (_keywords.length === 1) {
      const keyword = keywords[0];
      if (_keywords[0].rule.name === "type") {
        console.error(`parse('declare_action'): one-word actions may not be types: ${keyword}`);
      }
      // TODO...
      //   let parser = (context && context.parser) || global.parser;
      //   let blacklist = parser.getBlacklist("identifier");
      //   if (blacklist[keyword]) {
      //     console.error(`parse('declare_action'): one-word actions may not be blacklisted identifiers": ${keyword}`);
      //   }
    }

    // figure out arguments and/or types
    let args = [];
    let types = {};

    // if any of the words are types (capital letter) make that an argument of the same name.
    _keywords.map((item, index) => {
      if (item.rule.name === "type") {
        let Type = keywords[index];
        let type = Type.toLowerCase();

        types[type] = Type;
        args.push(type);

        // replace with lowercase in method name
        keywords[index] = type;
      }
    });
    // get static method name and arguments for results
    const name = keywords.join("_");
    return `static ${name}(${args.join(", ")}) ${statements}`;
  },
  tests: [
    {
      compileAs: "statements",
      showAll: true,
      tests: [
        ["action turn Card over:", "static turn_card_over(card) {}"],
        ["action add Card to Pile:", "static add_card_to_pile(card, pile) {}"],

        [
          "action turn Card over: set the direction of the card to 'up'",
          "static turn_card_over(card) { card.direction = 'up' }"
        ],
        [
          "action turn Card over:\n\tset the direction of the card to 'up'",
          "static turn_card_over(card) {\n\tcard.direction = 'up'\n}"
        ]
      ]
    }
  ]
});
*/
