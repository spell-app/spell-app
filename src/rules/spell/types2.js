

export default Parser.forName("types").defineRules(
  {
    name: "is_exactly",
    as: "keyword",
    alias: "infix_operator",
    syntax: "is exactly",
    precedence: 10,
    constructor: class is_exactly extends Rule.Keywords {
      toSource() { return 1 }
    }
  },

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

);
