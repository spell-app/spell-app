//
//	# Rules for defining classes (known as `types`)
//

//TODO: constructor
// TODO: mixins / traits / composed classes / annotations

import Parser from "../../Parser";
import Rule from "../../Rule";

import global from "../../utils/global";
import { pluralize } from "../../utils/string";

const parser = Parser.forModule("types");
export default parser;

parser.defineRules(

  //MOVE TO `functions`?
  // Arguments clause for methods
  //	`with foo` or `with foo and bar and baz`
  //TODO: {identifier} = {expression}	=> requires `,` instead of `and`
  //TODO: `with foo as Type`
  //TODO:	`with foo...` for splat?
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
        // showAll: true,
        tests: [
          ["with a", "a"],
          ["with a, b, c", "a, b, c"],
          ["with a, b, c,", "a, b, c"],
        ]
      },
    ]
  },


  // Properties clause: creates an object with one or more property values.
  //	`foo = 1, bar = 2`
  //TODO: would like to use `and` but that will barf on expressions...
  //TODO: how to do properties on multiple lines?
  {
    name: "object_literal_properties",
    syntax: "[({key:identifier}(?:= {value:expression})?) ,]",
    constructor: class object_literal_properties extends Rule.List {
      toSource() {
        let props = this.matched.map(function (prop) {
            let { key, value } = prop.results;
//TODO: don't quote if we don't have to?
//TOOD: multiple lines if > 2 props?
            if (value) return `"${key}": ${value}`
            return key;
          });
        return `{ ${props.join(", ")} }`;
      }
    },
    tests: [
      {
        title: "",
        // showAll: true,
        tests: [
          [`a = 1`, `{ "a": 1 }`],
          [`a = 1,`, `{ "a": 1 }`],
          [`a = 1, b = yes, c = "quoted"`, `{ "a": 1, "b": true, "c": "quoted" }`],
        ]
      },
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
          ["define type Foo\n\ta = true", "class Foo {\n\ta = true\n}"],
//TESTME: more involved tests...
        ]
      },
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
        // showAll: true,
        tests: [
         [`create Object`, `{}`],
         [`new Object`, `{}`],
         [`new Object with a = 1, b = yes`, `{ "a": 1, "b": true }`],
         [`new Foo`, `new Foo()`],
         [`new Foo with a = 1, b = yes`, `new Foo({ "a": 1, "b": true })`],
        ]
      },
      {
        title: "creates special types",
        compileAs: "expression",
        // showAll: true,
        tests: [
          ["create object", "{}"],
//FIXME: the following don't make sense if they have arguments...
          ["create List", "new Array()"],
          ["create list", "new Array()"],
//FIXME: the following don't make sense in JS but are legal parse-wise

//           ["create text", "new String()"],
//           ["create character", "new Character()"],
//           ["create number", "new Number()"],
//           ["create integer", "new Integer()"],
//           ["create decimal", "new Decimal()"],
//           ["create boolean", "new Boolean()"],
        ]
      },
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
        let { operator, name, args = []} = this.results;
        let subType = (operator === "to" ? "method" : "event");
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
        showAll: true,
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
          ["to foo with a, b\n\ta = yes\n\tb = no", "foo(a, b) {\n\ta = true\n\tb = false\n}"],
          ["", ""],
        ]
      },
    ]

  },

  // Declare "action", which can be called globally and affects the parser.
  // TODO: `with` clause (will conflict with `word`)
  // TODO: install in parser somehow
  // TODO: create instance function?  or maybe we don't need it:
  //			`action turn Card over` for an instance is just `turn me over`
  //			`action add card to deck` => `add me to deck`
  //TESTME
  {
    name: "declare_action",
    alias: ["statement", "mutatesScope"],
    syntax: "action (keywords:{word}|{type})+ (\\:)? {statement}?",
    constructor: class declare_action extends Rule.BlockStatement {
      // Add `name`, `args` and `types` to matched source
      get results() {
        let output = super.results;

        // if there's only one keyword, it can't be a blacklisted identifier or a type
        let { keywords } = output;
        let keywordMatches = this.results.keywords.matched;
        if (keywords.length === 1) {
          let keyword = keywords[0];
          if (keywordMatches[0] instanceof Rule.Type) {
            console.error(`parse('declare_action'): one-word actions may not be types: ${keyword}`);
          }

  // HACK: `global.parser` is a hack here for convenience in testing...
//           let parser = (context && context.parser) || global.parser;
//           let blacklist = parser.getBlacklist("identifier");
//           if (blacklist[keyword]) {
//             console.error(`parse('declare_action'): one-word actions may not be blacklisted identifiers": ${keyword}`);
//           }
        }

        // figure out arguments and/or types
        output.args = [];
        output.types = {};

        // if any of the words are types (capital letter) make that an argument of the same name.
        keywordMatches.map( (item, index) => {
          if (item instanceof Rule.Type) {
            let Type = keywords[index];
            let type = Type.toLowerCase();

            output.types[type] = Type;
            output.args.push(type);

            // replace with lowercase in method name
            keywords[index] = type;
          }
        });
        // get static method name and arguments for output
        output.name = keywords.join("_");
        return output;
      }

      toSource() {
        let { name, args = [], types, statement, block } = this.results;

        // figure out if there are any conditions due to known argument types
        let conditions = [];
        for (let arg in types) {
          conditions.push(`\tif (!spell.isA(${arg}, ${types[arg]})) return undefined`);
        }

        let statements = Rule.Block.encloseStatements(conditions, statement, block);

        // Create as a STATIC function
    //TODO: create as an instance function we can call on ourself!
        return `static ${name}(${args.join(", ")}) ${statements}`;
      }

      toStructure() {
        let { name, args, types } = this.results;
        return { type: "function", subType: "action", name, args, types }
      }
    }
  },


  // Getter either with or without arguments.
  // If you specify arguments, yields a normal function which returns a value.
  // TODO: `to get...` ?
  {
    name: "getter",
    alias: ["statement", "mutatesScope"],
    syntax: "get {name:identifier}\\: {expression}?",
    constructor: class getter extends Rule.BlockStatement {
      toSource() {
        let { name, expression, block } = this.results;
        // If they specified an inline-expression, prepend return
        if (expression && !expression.startsWith("return ")) expression = `return (${expression})`;
        let output = `get ${name}() `;
        output += Rule.Block.encloseStatements(expression, block);
        return output;
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { name } = this.results;
        return { type: "property", subType: "getter", name }
      }
    }
  },

  // Setter.
  // Complains if you specify more than one argument.
  // If you don't pass an explicit argument, we'll assume it's the same as the identifier.
  // eg;	`set color: set the color of my text to color`
  //
  // TODO: internal getter/setter semantics ala objective C
  //			`set color: if color is in ["red", "blue"] then set my color to color`
  //		 => `my color` within setter should automatically translate to `this._color` ???
  // TODO: `to set...` ?
  {
    name: "setter",
    alias: ["statement", "mutatesScope"],
    syntax: "set {name:identifier} {args}? (\\:)? {statement}?",
    constructor: class setter extends Rule.BlockStatement {
      toSource() {
        // default args to the setter name
        let { name, args = [name], statement, block } = this.results;
        // Complain if more than one argument
        if (args && args.length > 1) {
          console.warn("parse('setter'): only one argument allowed in setter:  ", this.matchedText);
          args = [ args[0] ];
        }
        let output = `set ${name}(${args}) `;
        output += Rule.Block.encloseStatements(statement, block);
        return output;
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { name } = this.results;
        return { type: "property", subType: "setter", name }
      }
    }
  },


  //
  //	declare properties
  //

  //TODO: another name for `constant` ?
  {
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
//            if (!value) console.warn("parse('declare_property'): constant properties must declare a value:  ", this.matchedText);
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
    }
  },

  // TODO: scope_modifier???
  // TODO: initial value
  {
    name: "declare_property_of_type",
    alias: ["statement", "mutatesScope"],
    syntax: "property {name:identifier} as (a|an)? {type}",
    constructor: class declare_property_of_type extends Rule.Sequence {
      toSource() {
        let { name, type } = this.results;
        return `get ${name}() { return this.__${name} }\n`
           + `set ${name}(value) { if (spell.isA(value, ${type}) this.__${name} = value }`;
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { name, type } = this.results;
        return { type: "property", subType: "setter", name, dataType: type };
      }
    }
  },


  // TODO: warn on invalid set?  shared?  undefined? something other than the first value as default?
  {
    name: "declare_property_as_one_of",
    alias: ["statement", "mutatesScope"],
    syntax: "property {name:identifier} as one of {list:literal_list}",
    constructor: class declare_property_as_one_of extends Rule.Sequence {
      get results() {
        let results = super.results;
        results.plural = pluralize(results.name);
        return results;
      }

      toSource() {
        let { name, plural, list } = this.results;
        return `@proto ${plural} = ${list}\n`
           + `get ${name}() { return this.__${name} === undefined ? this.${plural}[0] : this.__${name} }\n`
           + `set ${name}(value) { if (this.${plural}.includes(value)) this.__${name} = value }`;

  // MORE EFFICIENT BUT UGLIER
  // 			return `static ${plural} = ${list};\n`
  // 				 + `get ${name} { return ("__${name}" in this ? this.__${name} : ${firstValue}) }\n`
  // 				 + `set ${name}(value) { if (this.constructor.${plural}.includes(value)) this.__${name} = value }`;
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { name, plural } = this.results;
        return [
          { type: "property", name },
          { type: "property", subType: "shared", name: plural }
        ];
      }
    }
  },


  //
  //	Self-reference
  //
  {
    name: "me",
    alias: "expression",
    syntax: "me",
    constructor: class me extends Rule.Keywords {
      toSource() {
        return "this";
      }
    }
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
    }
  },


  //
  //	Property access
  //

  {
    name: "property_expression",
    alias: "expression",
    syntax: "(properties:the {identifier} of)+ the? {expression}",
    constructor: class property_expression extends Rule.Sequence {
      get results() {
        let { expression, properties_, } = this.results;
        return {
          properties: _properties.matched.map( property => property.results.identifier )
        };
      }

      toSource() {
        let { expression, properties } = this.results;
        properties = properties.reverse().join(".");
        return `${expression}.${properties}`;
  // NOTE: the following is safer, but ugly for demo purposes
  //			return `spell.get(${expression}, ['${properties}'])`;
      }
    }
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
    }
  },
);
