//
//	# Rules for defining classes (known as `types`)
//

//TODO: constructor
// TODO: mixins / traits / composed classes / annotations

import Parser from "../../Parser";
import Rule from "../../Rule";

import global from "../../utils/global";
import { pluralize } from "../../utils/string";

export default Parser.forName("types").defineRules(
  {
    name: "define_type",
    alias: "statement",
    mutatesScope: true,
    syntax: "define type {name:type} (?:as (a|an) {superType:type})?",
    constructor: class define_type extends Rule.BlockStatement {
      // Return a logical representation of the data structure
      toStructure(context) {
        let structure = super.toStructure(context);
        structure.type = "class";
        return structure;
      }

      toSource(context) {
        let { name, superType, block } = this.getMatchedSource(context);
        let output = `class ${name}`;
        if (superType) output += ` extends ${superType}`;
        output += " " + Rule.Block.encloseStatements(block);
        return output;
      }
    }
  },

  // `new` or `create`
  // This works as an expression OR a statement.
  // NOTE: we assume that all types take an object of properties????
  {
    name: "new_thing",
    alias: ["expression", "statement"],
    syntax: "(create|new) {type} (?:with {props:object_literal_properties})?",
    constructor: class new_thing extends Rule.Sequence {
      toSource(context) {
        let { type, props = "" } = this.getMatchedSource(context);
        // Special case for object, which we'll create with an object literal.
        if (type === "Object") {
          if (!props) return "{}";
          return props;
        }

        return `new ${type}(${props})`;
      }
    }
  },

  // Declare instance method or normal function.
  {
    name: "declare_method",
    alias: "statement",
    mutatesScope: true,
    syntax: "(operator:to|on) {name:identifier} {args}? (\\:)? {statement}?",
    constructor: class declare_method extends Rule.BlockStatement {
      // Return a logical representation of the data structure
      toStructure(context) {
        let { operator, name, args = []} = this.getMatchedSource(context);
        let subType = (operator === "to" ? "method" : "event");
        return { type: "function", subType, name, args };
      }

      toSource(context) {
        let { name, args = [], statement, block } = this.getMatchedSource(context);
        let output = `${name}(${args.join(", ")}) `;
        output += Rule.Block.encloseStatements(statement, block);
        return output;
      }
    }
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
    alias: "statement",
    mutatesScope: true,
    syntax: "action (keywords:{word}|{type})+ (\\:)? {statement}?",
    constructor: class declare_action extends Rule.BlockStatement {
      // Add `name`, `args` and `types` to matched source
      getMatchedSource(context) {
        let output = super.getMatchedSource(context);

        // if there's only one keyword, it can't be a blacklisted identifier or a type
        let { keywords } = output;
        let keywordMatches = this.results.keywords.matched;
        if (keywords.length === 1) {
          let keyword = keywords[0];
          if (keywordMatches[0] instanceof Rule.Type) {
            console.error(`parse('declare_action'): one-word actions may not be types: ${keyword}`);
          }

  // HACK: `global.parser` is a hack here for convenience in testing...
          let parser = (context && context.parser) || global.parser;
          let blacklist = parser.getBlacklist("identifier");
          if (blacklist[keyword]) {
            console.error(`parse('declare_action'): one-word actions may not be blacklisted identifiers": ${keyword}`);
          }
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

      toSource(context) {
        let { name, args = [], types, statement, block } = this.getMatchedSource(context);

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

      toStructure(context) {
        let { name, args, types } = this.getMatchedSource(context);
        return { type: "function", subType: "action", name, args, types }
      }
    }
  },


  // Getter either with or without arguments.
  // If you specify arguments, yields a normal function which returns a value.
  // TODO: `to get...` ?
  {
    name: "getter",
    alias: "statement",
    mutatesScope: true,
    syntax: "get {name:identifier}\\: {expression}?",
    constructor: class getter extends Rule.BlockStatement {
      toSource(context) {
        let { name, expression, block } = this.getMatchedSource(context);
        // If they specified an inline-expression, prepend return
        if (expression && !expression.startsWith("return ")) expression = `return (${expression})`;
        let output = `get ${name}() `;
        output += Rule.Block.encloseStatements(expression, block);
        return output;
      }

      // Return a logical representation of the data structure
      toStructure(context) {
        let { name } = this.getMatchedSource(context);
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
    alias: "statement",
    mutatesScope: true,
    syntax: "set {name:identifier} {args}? (\\:)? {statement}?",
    constructor: class setter extends Rule.BlockStatement {
      toSource(context) {
        // default args to the setter name
        let { name, args = [name], statement, block } = this.getMatchedSource(context);
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
      toStructure(context) {
        let { name } = this.getMatchedSource(context);
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
    alias: "statement",
    mutatesScope: true,
    syntax: "(scope:property|constant|shared property) {name:identifier} (?:= {value:expression})?",
    constructor: class declare_property extends Rule.Sequence {
      toSource(context) {
        let { scope, name, value = "" } = this.getMatchedSource(context);
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
      toStructure(context) {
        let { scope, name } = this.getMatchedSource(context);
        return { type: "property", name, scope };
      }
    }
  },

  // TODO: scope_modifier???
  // TODO: initial value
  {
    name: "declare_property_of_type",
    alias: "statement",
    mutatesScope: true,
    syntax: "property {name:identifier} as (a|an)? {type}",
    constructor: class declare_property_of_type extends Rule.Sequence {
      toSource(context) {
        let { name, type } = this.getMatchedSource(context);
        return `get ${name}() { return this.__${name} }\n`
           + `set ${name}(value) { if (spell.isA(value, ${type}) this.__${name} = value }`;
      }

      // Return a logical representation of the data structure
      toStructure(context) {
        let { name, type } = this.getMatchedSource(context);
        return { type: "property", subType: "setter", name, dataType: type };
      }
    }
  },


  // TODO: warn on invalid set?  shared?  undefined? something other than the first value as default?
  {
    name: "declare_property_as_one_of",
    alias: "statement",
    mutatesScope: true,
    syntax: "property {name:identifier} as one of {list:literal_list}",
    constructor: class declare_property_as_one_of extends Rule.Sequence {
      getMatchedSource(context) {
        let output = super.getMatchedSource(context);
        output.plural = pluralize(output.name);
        return output;
      }

      toSource(context) {
        let { name, plural, list } = this.getMatchedSource(context);
        return `@proto ${plural} = ${list}\n`
           + `get ${name}() { return this.__${name} === undefined ? this.${plural}[0] : this.__${name} }\n`
           + `set ${name}(value) { if (this.${plural}.includes(value)) this.__${name} = value }`;

  // MORE EFFICIENT BUT UGLIER
  // 			return `static ${plural} = ${list};\n`
  // 				 + `get ${name} { return ("__${name}" in this ? this.__${name} : ${firstValue}) }\n`
  // 				 + `set ${name}(value) { if (this.constructor.${plural}.includes(value)) this.__${name} = value }`;
      }

      // Return a logical representation of the data structure
      toStructure(context) {
        let { name, plural } = this.getMatchedSource(context);
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
      toSource(context) {
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
      toSource(context) {
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
      getMatchedSource(context) {
        let { expression, properties } = this.results;
        return {
          expression: expression.toSource(context),
          properties: properties.matched.map( property => property.results.identifier.toSource(context) )
        };
      }

      toSource(context) {
        let { expression, properties } = this.getMatchedSource(context);
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
      toSource(context) {
        let { identifier } = this.getMatchedSource(context);
        return `this.${identifier}`;
      }
    }
  },


  //
  //	Utility
  //


  // Properties clause: creates an object with one or more property values.
  //	`foo = 1, bar = 2`
  //TODO: would like to use `and` but that will barf on expressions...
  //TODO: how to do properties on multiple lines?
  {
    name: "object_literal_properties",
    syntax: "[({key:identifier}(?:= {value:expression})?) ,]",
    constructor: class object_literal_properties extends Rule.List {
      toSource(context) {
        let props = this.results.matched.map(function (prop) {
            let { key, value } = prop.results;
            key = key.toSource(context);
            value = value && value.toSource(context);
            if (value) return `"${key}": ${value}`
            return key;
          });
        return `{ ${props.join(", ")} }`;
      }
    }
  },


  //MOVE TO `functions`?
  // Arguments clause for methods
  //	`with foo` or `with foo and bar and baz`
  //TODO: {identifier} = {expression}	=> requires `,` instead of `and`
  //TODO: `with foo as Type`
  //TODO:	`with foo...` for splat?
  {
    name: "args",
    syntax: "with [args:{identifier} ,]",
    constructor: class args extends Rule.Sequence {
      // Returns an array of argument values
      toSource(context) {
        return this.results.args.matched.map(arg => arg.matched);
      }
    }
  }
);
