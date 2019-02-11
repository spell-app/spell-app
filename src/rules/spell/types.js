//
//  # Rules for defining classes (known as `types`)
//

// TODO: constructor
// TODO: mixins / traits / composed classes / annotations

import flattenDeep from "lodash/flattenDeep.js";

import Parser from "../../Parser";
import Rule from "../../Rule";

import { pluralize } from "../../utils/string";

const parser = Parser.forModule("types");
export default parser;

parser.defineRules(
  //
  //  Self-reference
  //

  // TODO: confusing???
  {
    name: "me",
    alias: "expression",
    syntax: "me",
    constructor: class me extends Rule.Keywords {
      toSource() {
        return "this";
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["me", "this"]]
      }
    ]
  },

  // TODO: this really makes me want to make `I am empty` etc work...
  {
    name: "I",
    alias: "expression",
    syntax: "I",
    constructor: class I extends Rule.Keywords {
      toSource() {
        return "this";
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["I", "this"]]
      }
    ]
  },

  //
  //  Property access
  //

  {
    // TODO: really low precedence on this so more-specific rules with similar pattern will work
    // TODO: multiple identifiers would be cool...
    name: "property_expression",
    alias: "expression",
    syntax: "(properties:the {identifier} of)+ the? {expression}",
    constructor: class property_expression extends Rule.Sequence {
      get results() {
        const results = super.results;
        results._properties = results._properties.matched;
        results.properties = results._properties.map(property => property.results.identifier);
        return results;
      }

      toSource() {
        let { expression, properties } = this.results;
        properties = properties.reverse().join(".");
        return `${expression}.${properties}`;
        // NOTE: the following is safer, but ugly for demo purposes
        //      return `spell.get(${expression}, ['${properties}'])`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [
          ["the foo of bar", "bar.foo"],
          ["the foo of the bar", "bar.foo"],
          ["the foo of the bar of the baz", "baz.bar.foo"],
          ["the foo-bar of the baz", "baz.foo_bar"]
        ]
      }
    ]
  },

  {
    name: "my_property_expression",
    alias: "expression",
    syntax: "(my|this) {identifier}",
    constructor: class my_property_expression extends Rule.Sequence {
      toSource() {
        let { identifier } = this.results;
        return `this.${identifier}`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [["my foo", "this.foo"], ["this bank-account", "this.bank_account"]]
      }
    ]
  },

  //MOVE TO `functions`?
  // Arguments clause for methods
  //  `with foo` or `with foo and bar and baz`
  //TODO: {identifier} = {expression}  => requires `,` instead of `and`
  //TODO: `with foo as Type`
  //TODO:  `with foo...` for splat?
  {
    name: "args",
    syntax: "with [args:{identifier},]",
    constructor: class args extends Rule.Sequence {
      // Returns an array of argument values
      toSource() {
        const { args } = this.results;
        return args.join(", ");
      }
    },
    tests: [
      {
        tests: [["with a", "a"], ["with a, b, c", "a, b, c"], ["with a, b, c,", "a, b, c"]]
      }
    ]
  },

  // Properties clause: creates an object with one or more property values.
  //  `foo = 1, bar = 2`
  //TODO: would like to use `and` but that conflicts with "and" operator
  //TODO: don't quote if we don't have to? (ASCII and blacklist only)
  //TOOD: multiple lines if > 2 props?
  {
    name: "object_literal_properties",
    syntax: "[({key:identifier}(?:= {value:expression})?) ,]",
    constructor: class object_literal_properties extends Rule.List {
      toSource() {
        let props = this.matched.map(function(prop) {
          let { key, value } = prop.results;
          if (value) return `"${key}": ${value}`;
          return key;
        });
        return `{ ${props.join(", ")} }`;
      }
    },
    tests: [
      {
        tests: [
          [``, undefined],
          [`a = 1`, `{ "a": 1 }`],
          [`a = 1,`, `{ "a": 1 }`],
          [`a = 1, b = yes, c = "quoted"`, `{ "a": 1, "b": true, "c": "quoted" }`],
          [`a = 1, b = the foo of the bar`, `{ "a": 1, "b": bar.foo }`]
        ]
      }
    ]
  },

  {
    name: "define_type",
    alias: ["statement", "mutatesScope"],
    syntax: "define type {name:type} (?:as (a|an) {superType:type})?",
    constructor: class define_type extends Rule.BlockStatement {
      // Return a logical representation of the data structure
      toStructure() {
        let structure = super.toStructure();
        structure.type = "class";
        return structure;
      }

      toSource() {
        let { name, superType, statements } = this.results;
        let output = `class ${name}`;
        if (superType) output += ` extends ${superType}`;
        output += " " + statements;
        return output;
      }
    },
    tests: [
      {
        compileAs: "statements",
        tests: [
          ["define type Foo", "class Foo {}"],
          ["define type Foo as a Bar", "class Foo extends Bar {}"],
          ["define type Foo\n\ta = yes", "class Foo {\n\ta = true\n}"],
          ["define type Foo\n\ta = yes\n\tb = no", "class Foo {\n\ta = true\n\tb = false\n}"]
          //TESTME: more involved tests...
        ]
      }
    ]
  },

  // `new` or `create`
  // This works as an expression OR a statement.
  // NOTE: we assume that all types take an object of properties????
  //FIXME: `list`, `text`, etc don't follow these semantics and should be disallowed... ???
  {
    name: "new_thing",
    alias: ["expression", "statement"],
    syntax: "(create|new) {type} (?:with {props:object_literal_properties})?",
    constructor: class new_thing extends Rule.Sequence {
      toSource() {
        let { type, props = "" } = this.results;
        // Special case for object, which we'll create with an object literal.
        if (type === "Object") {
          if (!props) return "{}";
          return props;
        }

        return `new ${type}(${props})`;
      }
    },
    tests: [
      {
        title: "creates normal objects properly",
        compileAs: "statement",
        tests: [
          [`create Object`, `{}`],
          [`new Object`, `{}`],
          [`new Object with a = 1, b = yes`, `{ "a": 1, "b": true }`],
          [`new Foo`, `new Foo()`],
          [`new Foo with a = 1, b = yes`, `new Foo({ "a": 1, "b": true })`]
        ]
      },
      {
        title: "creates special types",
        compileAs: "expression",
        tests: [
          ["create object", "{}"],
          //FIXME: the following don't make sense if they have arguments...
          ["create List", "new Array()"],
          ["create list", "new Array()"]
          //FIXME: the following don't make sense in JS but are legal parse-wise

          //           ["create text", "new String()"],
          //           ["create character", "new Character()"],
          //           ["create number", "new Number()"],
          //           ["create integer", "new Integer()"],
          //           ["create decimal", "new Decimal()"],
          //           ["create boolean", "new Boolean()"],
        ]
      }
    ]
  },

  //
  //  declare properties
  //

  {
    //TODO: another name for `constant` ?
    name: "declare_property",
    alias: ["statement", "mutatesScope"],
    syntax: "(scope:property|constant|shared property) {name:identifier} (?:= {value:expression})?",
    constructor: class declare_property extends Rule.Sequence {
      toSource() {
        let { scope, name, value = "" } = this.results;
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
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { scope, name } = this.results;
        return { type: "property", name, scope };
      }
    },
    tests: [
      {
        compileAs: "statement",
        tests: [
          ["property foo", "foo"],
          //FIXME          ["constant foo", "const foo"],
          ["shared property foo", "@proto foo"],

          ["property foo = the foo of the bar", "foo = bar.foo"],
          ["constant foo = 'some text'", "const foo = 'some text'"],
          ["shared property foo = new object with a = 1", '@proto foo = { "a": 1 }']
        ]
      }
    ]
  },

  // TODO: merge with `declare_property`?
  // TODO: in class/object scope only?
  // TODO: `@typed` decorator to make substitution cleaner
  {
    name: "declare_property_of_type",
    alias: ["statement", "mutatesScope"],
    syntax: "property {name:identifier} as (a|an)? {type} (?:= {value:expression})?",
    constructor: class declare_property_of_type extends Rule.Sequence {
      toSource() {
        let { name, type, value = "undefined" } = this.results;
        return `@typed(${type}) ${name} = ${value}`;
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { name, type } = this.results;
        return { type: "property", subType: "setter", name, dataType: type };
      }
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
  },

  // TODO: `@typed` decorator which takes array to make logic cleaner
  // TODO: assign to first value if no default?
  // TODO: allow list to be an expression?
  {
    name: "declare_property_as_one_of",
    alias: ["statement", "mutatesScope"],
    syntax:
      "property {name:identifier} as one of (?:list:[{expression},]+|{literal_list}) (?:= {value:expression})?",
    constructor: class declare_property_as_one_of extends Rule.Sequence {
      get results() {
        let results = super.results;
        results.plural = pluralize(results.name);
        return results;
      }

      toSource() {
        let { name, list, value = "undefined" } = this.results;

        // TODO: this is ugly...
        list = flattenDeep(list);
        list = list.length === 1 && typeof list[0] === "string" ? list[0] : list.join(", ");
        if (list[0] !== "[") list = `[${list}]`;
        return `@typed(${list}) ${name} = ${value}`;
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { name, plural } = this.results;
        return [{ type: "property", name }, { type: "property", subType: "shared", name: plural }];
      }
    },
    tests: [
      {
        compileAs: "statement",
        tests: [
          ["property foo as one of [1, 2, 3]", "@typed([1, 2, 3]) foo = undefined"],
          [
            "property foo as one of yes, no, undefined",
            "@typed([true, false, undefined]) foo = undefined"
          ],

          ["property foo as one of [1, 2, 3] = 1", "@typed([1, 2, 3]) foo = 1"],
          [
            "property foo as one of yes, no, undefined = yes",
            "@typed([true, false, undefined]) foo = true"
          ]
        ]
      }
    ]
  },

  // Getter.
  // TODO: `to get x` ?
  // TODO: make the `:` optional in a way that doesn't conflict with `get x`
  // TODO: implicit return in block form
  {
    name: "getter",
    alias: ["statement", "mutatesScope"],
    syntax: "get {name:identifier}\\: return? {expression}?",
    constructor: class getter extends Rule.BlockStatement {
      toSource() {
        // NOTE: we need to parse `expression` and `block` manually (unlike other BlockStatements)
        const { name, expression, block } = this.results;
        let statements;
        if (block) {
          statements = block;
        } else if (expression) {
          const returnPrefix = expression.startsWith("return ") ? "" : "return ";
          statements = `{ ${returnPrefix}${expression} }`;
        } else {
          statements = "{}";
        }
        return `get ${name}() ${statements}`;
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { name } = this.results;
        return { type: "property", subType: "getter", name };
      }
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
  },

  // Setter.
  // Complains if you specify more than one argument.
  // If you don't pass an explicit argument, we'll assume it's the same as the identifier.
  // eg;  `set color: set the color of my text to color`
  //
  // TODO: internal getter/setter semantics ala objective C
  //      `set color: if color is in ["red", "blue"] then set my color to color`
  //     => `my color` within setter should automatically translate to `this._color` ???
  // TODO: `to set...` ?
  {
    name: "setter",
    alias: ["statement", "mutatesScope"],
    syntax: "set {name:identifier} {args}? (\\:)? {statement}?",
    constructor: class setter extends Rule.BlockStatement {
      toSource() {
        // default args to the setter name
        let { name, args = name, statements } = this.results;
        // Complain if more than one argument
        if (args && args.includes(",")) {
          console.warn("parse('setter'): only one argument allowed in setter:  ", args);
          args = args.trim().split(",")[0];
        }
        return `set ${name}(${args}) ${statements}`;
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { name } = this.results;
        return { type: "property", subType: "setter", name };
      }
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
  },

  // Declare instance method or normal function.
  // TODO: static/etc
  {
    name: "declare_method",
    alias: ["statement", "mutatesScope"],
    syntax: "(operator:to|on) {name:identifier} {args}? (\\:)? {statement}?",
    constructor: class declare_method extends Rule.BlockStatement {
      // Return a logical representation of the data structure
      toStructure() {
        let { operator, name, args = [] } = this.results;
        let subType = operator === "to" ? "method" : "event";
        return { type: "function", subType, name, args };
      }

      toSource() {
        let { name, args = "", statements } = this.results;
        return `${name}(${args}) ${statements}`;
      }
    },
    tests: [
      {
        compileAs: "statements",
        tests: [
          ["on foo", "foo() {}"],
          ["to foo", "foo() {}"],
          ["to foo:", "foo() {}"],
          ["to foo with a", "foo(a) {}"],
          ["to foo with a, b", "foo(a, b) {}"],
          ["to foo with a,b,c", "foo(a, b, c) {}"],
          ["to foo a = yes", "foo() { a = true }"],
          ["to foo: a = yes", "foo() { a = true }"],
          ["to foo with a: a = yes", "foo(a) { a = true }"],
          ["to foo\n\ta = yes", "foo() {\n\ta = true\n}"],
          ["to foo with a, b\n\ta = yes\n\tb = no", "foo(a, b) {\n\ta = true\n\tb = false\n}"]
        ]
      }
    ]
  },

  // Declare "action", which can be called globally and affects the parser.
  // TODO: `turn a card over`
  // TODO: {keyword:{identifier} (keywords:({word}|{type})?)
  // TODO: `with` clause (will conflict with `word`)
  // TODO: install the action as a special in the parser somehow
  // TODO: create instance function?  or maybe we don't need it:
  //      `action turn Card over` for an instance is just `turn me over`
  //      `action add card to deck` => `add me to deck`
  //TESTME
  {
    name: "declare_action",
    alias: ["statement", "mutatesScope"],
    syntax: "action (keywords:{word}|{type})+ \\: {statement}?",
    constructor: class declare_action extends Rule.BlockStatement {
      // Add `name`, `args` and `types` to matched source
      get results() {
        const results = super.results;

        // if there's only one keyword, it can't be a type or a blacklisted identifier
        const { keywords } = results;
        const _keywords = results._keywords.matched;
        if (_keywords.length === 1) {
          const keyword = keywords[0];
          if (_keywords[0] instanceof Rule.Type) {
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
        results.args = [];
        results.types = {};

        // if any of the words are types (capital letter) make that an argument of the same name.
        _keywords.map((item, index) => {
          if (item instanceof Rule.Type) {
            let Type = keywords[index];
            let type = Type.toLowerCase();

            results.types[type] = Type;
            results.args.push(type);

            // replace with lowercase in method name
            keywords[index] = type;
          }
        });
        // get static method name and arguments for results
        results.name = keywords.join("_");
        return results;
      }

      toSource() {
        let { name, args = [], statements /*, types*/ } = this.results;
        // figure out if there are any conditions due to known argument types
        //         let conditions = [];
        //         for (let arg in types) {
        //           conditions.push(`\tif (!spell.isA(${arg}, ${types[arg]})) return undefined`);
        //         }
        // Create as a STATIC function
        return `static ${name}(${args.join(", ")}) ${statements}`;
      }

      toStructure() {
        let { name, args, types } = this.results;
        return { type: "function", subType: "action", name, args, types };
      }
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
  }
);
