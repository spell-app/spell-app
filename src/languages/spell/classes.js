import JSON5 from "JSON5";

import {
  Rule,
  SpellParser,
  Token,
  lowerFirst,
  upperFirst,
  pluralize,
  singularize,
  inflectResults,
  inflectResultsArray,
  parseMethodKeywords
} from "./all.js";

const parser = new SpellParser({ module: "classes" });
export default parser;

parser.defineRule({
  name: "create_type",
  alias: ["statement", "updatesScope"],
  syntax: "create type {type:identifier} (?:as (a|an) {superType:identifier})?",
  constructor: class create_type extends Rule.Sequence {
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      return inflectResults(results, "type", "superType");
    }
    compile(match, scope) {
      let { Type, SuperType } = match.results;
      if (!SuperType)
        return `export class ${Type} {}`;
      return `export class ${Type} extends ${SuperType} {}`;
    }
    updateScope(match, scope) {
      const { type, superType } = match.results;
      scope.addType({ type, superType })
      if (superType) scope.addType({ type: superType });
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["create type card", "export class Card {}"],
        ["create type car as a vehicle", "export class Car extends Vehicle {}"],
      ]
    }
  ]
});

parser.defineRule({
  name: "identifier_list",
  syntax: "[({word}|{number})(,|or|and)]",
  tests: [
    {
      tests: [
        ["up or down", ["up", "down"]],
        ["red and black", ["red", "black"]],
        ["clubs, diamonds, hearts, spades", ["clubs", "diamonds", "hearts", "spades" ] ],
        ["ace, 2, 3, 4, jack, queen, king", ["ace", 2, 3, 4, "jack", "queen", "king" ] ],
      ]
    }
  ]
});


// `new` or `create`
// This works as an expression OR a statement.
// NOTE: we assume that all types take an object of properties????
//FIXME: `list`, `text`, etc don't follow these semantics???
parser.defineRule({
  name: "new_thing",
  alias: ["expression", "non_recursive_expression", "statement"],
  syntax: "create (a|an) {type} (?:with {props:object_literal_properties})?",
  testRule: "create",
  compile(match, scope) {
    let { type, props = "" } = match.results; // `props` is the object literal text
    // Special case for object, which we'll create with an object literal.
    if (type === "Object") {
      if (!props) return "{}";
      return props;
    }

    return `new ${type}(${props})`;
  },
  tests: [
    {
      title: "creates normal objects properly",
      compileAs: "statement",
      tests: [
        [`create an Object`, `{}`],
        [`create an Object with a = 1, b = yes`, `{ "a": 1, "b": true }`],
        [`create a Foo`, `new Foo()`],
        [`create a Foo with a = 1, b = yes`, `new Foo({ "a": 1, "b": true })`]
      ]
    },
    {
      title: "creates special types",
      compileAs: "expression",
      tests: [
        ["create an object", "{}"],
        //FIXME: the following don't make sense if they have arguments...
        ["create a List", "new Array()"],
        ["create a list", "new Array()"]
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
});


parser.defineRule({
  name: "type_initializer_enum",
  alias: "type_initializer",
  syntax: "as (either|one of) {enum:identifier_list}",
  // Return the enum for someone else to consume
  compile(match, scope) {
    return { datatype: "enum", enum: match.results.enum };
  },
  tests: [
    {
      tests: [
        ["as either red or black", { datatype: "enum", enum: ["red", "black"] }],
        ["as one of clubs, diamonds, hearts, spades", { datatype: "enum", enum: ["clubs", "diamonds", "hearts", "spades" ] }],
      ]
    }
  ]
});

parser.defineRule({
  name: "type_initializer_datatype",
  alias: "type_initializer",
  syntax: "as (a|an)? {datatype:word}",
  tests: [
    {
      tests: [
        ["as a number", { datatype: "number" }],
        ["as an automobile", { datatype: "automobile" }],
      ]
    }
  ]
});

parser.defineRule({
  name: "type_has_prefix",
  syntax: "(?:(a|an) {type:identifier} has|{type:identifier} have)"
});

parser.defineRule({
  name: "define_property_has",
  alias: ["statement", "updatesScope"],
  syntax: "{?:type_has_prefix} (a|an) {property:identifier} {initializer:type_initializer}?",
  testRule: "…(has|have)",
  constructor: class define_type extends Rule.Sequence {
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      return inflectResults(results, "type", "property");
    }
    compile(match, scope) {
      const { Type, Properties, property, initializer } = match.results;
      if (initializer?.enum) {
        return [
          `defineProp(${Type}, '${Properties}', { value: ${JSON5.stringify(initializer.enum)} })`,
          `defineProp(${Type}.prototype, '${Properties}', { value: ${Type}.${Properties} })`,
          `defineProp(${Type}.prototype, '${property}', {`,
          `  get() { return this.#${property} }`,
          `  set(${property}) { if ($.isOneOf(${property}, ${Type}.${Properties})) this.#${property} = ${property} }`,
          `})`
        ].join("\n");
      }
      else {
        const datatype = initializer?.datatype;
        if (datatype) {
          return [
            `defineProp(${Type}.prototype, '${property}', {`,
            `  get() { return this.#${property} }`,
            `  set(${property}) { if ($.isType(${property}, '${datatype}')) this.#${property} = ${property} }`,
            `})`
          ].join("\n");
        }
      }
    }
    updateScope(match, scope) {
      const { Type, type, property, properties, Properties, initializer } = match.results;

      if (initializer?.enum) {
        const enumProps = {
          type,
          ...initializer,
          compile: () => `${Type}.${Properties}`
        };
        // Add normal instance property, e.g. javascript `card.suit`
        scope.addInstanceProperty({ key: property }, enumProps);

        // Add enum as a property to the class and instance, e.g javascript `Card.suits` and `card.suits`
        scope.addProperty({ key: properties }, enumProps);
        scope.addInstanceProperty({ key: properties}, enumProps);

        // Add identifier which points back to the class enum, e.g. spell `Card suits` or `card suits`
        scope.addIdentifier({
          key: [ [Type,type], properties ],
          compile: enumProps.compile
        });

        // Add any string enums as constants
        initializer.enum.forEach(value => {
          if (typeof value === "string") scope.addConstant({ key: value, value });
        });
      }
      else {
        // Add normal instance property with datatype if provided, e.g. javascript `player.name`
        scope.addInstanceProperty({ type, key: property, ...initializer });
      }
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        [ "cards have a direction as either up or down",
          [
            "defineProp(Card, 'Directions', { value: ['up','down'] })",
            "defineProp(Card.prototype, 'Directions', { value: Card.Directions })",
            "defineProp(Card.prototype, 'direction', {",
            "  get() { return this.#direction }",
            "  set(direction) { if ($.isOneOf(direction, Card.Directions)) this.#direction = direction }",
            "})"
          ].join("\n")
        ],
        [ "a player has a name as text",
          [
            "defineProp(Player.prototype, 'name', {",
            "  get() { return this.#name }",
            "  set(name) { if ($.isType(name, 'text')) this.#name = name }",
            "})"
          ].join("\n")
        ],
      ]
    }
  ]
});




// TODO: arguments
parser.defineRule({
  name: "to_do_something",
  alias: ["statement", "updatesScope"],
  syntax: "to (keywords:{word}|{type})+ :? {statement}?",
  constructor: class define_type extends SpellParser.BlockStatement {
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      return parseMethodKeywords(results);
    }
    compile(match, scope) {
      const { Types, method, args, instanceMethod, instanceArgs, statements } = match.results;
      // If this is associated with a type, add it to the type
      if (Types.length) {
        const Type = Types[0];
        return [
          // class method calls the instance method
          `defineProp(${Type}, '${method}', {`,
          `  value: function(${args.join(", ")}) ${statements}`,
          `})`
        ].join("\n")
         .replace(/\bit\b/g, args[0]);    // HACK: replace "it" with the first argument... :-(
      }
      else {
        // otherwise add it as a global method
        return [
  //TODO: want to add to scope ???
          `export function ${method}(${args.join(", ")}) ${statements}`,
        ].join("\n")
      }
    }
    updateScope(match, scope) {
      const { types, Types, method, args, instanceMethod, instanceArgs, statements, rules } = match.results;
      if (types.length) {
        const type = types[0];
        scope.addInstanceMethod({ type, key:instanceMethod, args: instanceArgs });
        scope.addMethod({ type, key:method, args });
        scope.addStatementRule({
          name: method,
          syntax: rules,
          compile({ results: { callArgs } }) {
            return `${Types[0]}.${method}(${callArgs})`;
          }
        });
      }
      else {
        scope.addMethod({ key: method, args });
        // add a rule to match the new syntax, e.g. spell `add {callArgs:card} to {callArgs:pile}`
        scope.addStatementRule({
          name: method,
          syntax: rules,
          compile(match, scope) {
            const { callArgs } = match.results;
            return `${method}(${callArgs.join(", ")})`;
          }
        });
      }
    }
  },
  tests: [
    {
      compileAs: "statements",
      tests: [
        [
          "to start the game",
          "export function start_the_game() {}"
        ],
        [
          [ // TODO: this rule is recursive!!!
            // although it might work here since we're defining the rule AFTER parsing the contents... ???
            "to move a card to a pile:",
            "\tremove the card from the pile of the card",      // TODO: `its pile`
            "\tadd the card to the pile",
            "\tset the pile of the card to the pile"
          ].join("\n"),
          [
            "defineProp(Card, 'move_card_to_pile', {",
            "  value: function(card, pile) {",
            "\tspell.remove(card?.pile, card)",
            "\tspell.append(pile, card)",
            "\tcard?.pile = pile",
            "}",
            "})",
          ].join("\n")
        ],
      ]
    }
  ]
});




parser.defineRule({
  name: "quoted_property_name",
  alias: ["statement", "updatesScope"],
  //  e.g. `a card "is face up" if ...`
  //  NOTE: the first word in quotes must be "is" !!
  syntax: '(a|an) {type:identifier} {text} if {expression}',
  constructor: class quoted_property_name extends Rule.Sequence {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      // forget it if first word is not "is"
      if (match && match.results.words[0] !== "is") return undefined;
      return match;
    }
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      results.words = (""+JSON.parse(results.text)).split(" ");
      results.getter = results.words.join("_");
      return inflectResults(results, "type");
    }
    compile(match, scope) {
      let { type, Type, getter, property, expression } = match.results;
      return [
        `defineProp(${Type}.prototype, '${getter}', {`,
        `  get() { return ${expression} }`,
        `})`
      ].join("\n")
    }
    updateScope(match, scope) {
      const { type, words, getter } = match.results;
      // Note the new instance property, e.g. javascript `card.is_a_face_card`
      scope.addInstanceProperty({ type, key:getter, datatype: "boolean" });

      // Add is expression for spell, e.g. `card is a face card` or `card is not a face card`
      scope.addIsExpressionRule({
        key: words,
        compile(value) { return `${value}?.${getter}` }
      });
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ['a card "is face up" if its direction is up',
          [
            "defineProp(Card.prototype, 'is_face_up', {",
            "  get() { return (this.direction == up) }",
            "})"
          ].join("\n")
        ],
        ['a card "is a face card" if its rank is one of [jack, queen, king]',
          [
            "defineProp(Card.prototype, 'is_a_face_card', {",
            "  get() { return spell.includes([jack, queen, king], this.rank) }",
            "})",
          ].join("\n")
        ],
      ]
    }
  ]
});

parser.defineRule({
  name: "property_of_a_type",
  syntax: "the {property:identifier} of (a|an) {type:identifier}",
});
parser.defineRule({
  name: "property_of_a_type",
  syntax: "(a|an) {type:identifier} {property:identifier}",
});

parser.defineRule({
  name: "property_value_either",
  alias: ["statement", "updatesScope"],
  syntax: "{?:property_of_a_type} is {value:identifier} if {expression} (?:otherwise it is {otherValue:identifier})?",
  constructor: class type_is_a_enum extends Rule.Sequence {
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      return inflectResults(results, "type");
    }
    compile(match, scope) {
      let { Type, property, value, otherValue, expression } = match.results;
      const statement = !otherValue
        ? `if (${expression}) return ${value}`
        : `return !!${expression} ? ${value} : ${otherValue}`;

      return [
        `defineProp(${Type}.prototype, '${property}', {`,
        `  get() { ${statement} }`,
        `})`
      ].join("\n")
    }
    updateScope(match, scope) {
      const { type, property, } = match.results;
      scope.addInstanceProperty({ type, key: property, datatype: "boolean" });
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [      // is one of diamonds or hearts => is_one_of_list
        ["the color of a card is red if its suit is one of [diamonds, hearts]",
          [
            "defineProp(Card.prototype, 'color', {",
            "  get() { if (spell.includes([diamonds, hearts], this.suit)) return red }",
            "})"
          ].join("\n")
        ],
        ["a cards color is black if its suit is one of [clubs, spades] otherwise it is red",
          [
            "defineProp(Card.prototype, 'color', {",
            "  get() { return !!spell.includes([clubs, spades], this.suit) ? black : red }",
            "})"
          ].join("\n")
        ],
      ]
    }
  ]
});

parser.defineRule({
  name: "property_value_expression",
  alias: ["statement", "updatesScope"],
  syntax: "{?:property_of_a_type} is {expression}",
  constructor: class type_is_a_enum extends Rule.Sequence {
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      return inflectResults(results, "type");
    }
    compile(match, scope) {
      let { Type, property, expression } = match.results;
      return [
        `defineProp(${Type}.prototype, '${property}', {`,
        `  get() { return ${expression} }`,
        `})`
      ].join("\n")
    }
    updateScope(match, scope) {
      const { type, property } = match.results;
      scope.addInstanceProperty({ type, key: property });
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["the value of a card is the position of its rank in its ranks",
          [
            "defineProp(Card.prototype, 'value', {",
            "  get() { return spell.positionOf(this.rank, this.ranks) }",
            "})"
          ].join("\n")
        ],
        ["a cards score is its value",
          [
            "defineProp(Card.prototype, 'score', {",
            "  get() { return this.value }",
            "})"
          ].join("\n")
        ],
      ]
    }
  ]
});




/*

// "card is a queen" or "card is a queen of clubs"
// Possibilities:
//   a card "is a (rank)" for its ranks
//   a card "is a (rank) of (suits)" for its ranks and its suits

parser.defineRule({
  name: "type_is_a_enum",
  alias: ["statement", "updatesScope"],
  syntax: "(article:a|an) {type:word} is (a|an) \\( {property:identifier} \\) if {expression}",
  constructor: class type_is_a_enum extends Rule.Sequence {
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      return inflectResults(results, "type");
    }
    compile(match, scope) {
      const { article, Type, property, expression } = match.results;
      return [
        `defineProp(${Type}.prototype, 'is_${article}_${property}', {`,
        `  value: function(${property}){ return ${expression} }`,
        `})`,
      ].join("\n")
    }
    updateScope(match, scope) {

    }
  },
  tests: [
    {
      compileAs: "statements",
      tests: [
        ["a card is a {suit} if its suit is the suit",
          [
            "defineProp(Card.prototype, 'is_a_suit', {",
            "  value: function(suit){ return (this.suit == suit) }",
            "})",
          ].join("\n")
        ],
      ]
    }
  ]
});

parser.defineRule({
  name: "type_is_a_enum_for",
  alias: ["statement", "updatesScope"],
  syntax: "for each {type:word} {property:identifier} : the {type2:identifier} is (article:a|an) \{ {property2:identifier} \} if {expression}",
  updateScope(match, scope) {
    // TODO: somehow we have to get ahold of the enum!!!
    for (suit of Card.Suits) {
      addIsIdentifier(`a_${suit}`, `${thing}?.is_a_suit?.(${suit})`);
    }
  },
  constructor: class type_is_a_enum extends Rule.Sequence {
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      return inflectResults(results, "type");
    }
    compile(match, scope) {
      const { article, Type, property, expression } = match.results;
      return [
        `defineProp(${Type}.prototype, 'is_${article}_${property}', {`,
        `  value: function(${property}){ return ${expression} }`,
        `})`,
      ].join("\n")
    }
  },
  tests: [
    {
      compileAs: "statements",
      tests: [
        ["for each card suit: the card is a {suit} if its suit is the suit",
          [
            "defineProp(Card.prototype, 'is_a_suit', {",
            "  value: function(suit){ return (this.suit == suit) }",
            "})",
          ].join("\n")
        ],
      ]
    }
  ]
});
*/
