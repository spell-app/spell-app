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
  alias: ["statement", "mutatesScope"],
  syntax: "create type {type:identifier} (?:as (a|an) {superType:identifier})?",
  constructor: class create_type extends Rule.Sequence {
    getResults(match) {
      const results = super.getResults(match);
      return inflectResults(results, "type", "superType");
    }
    compile(match) {
      let { Type, SuperType } = match.results;
      if (!SuperType)
        return `export class ${Type} {}`;
      return `export class ${Type} extends ${SuperType} {}`;
    }
    updateScope(match, scope) {
      const { type, superType } = match.results;
      scope.addType({ type, superType })
      if (superType) scope.addType({ type: superType });
      return scope;
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
  alias: ["expression", "statement"],
  syntax: "create (a|an) {type} (?:with {props:object_literal_properties})?",
  testRule: "create",
  compile(match) {
    let { type, props = "" } = match.results;
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
  compile(match) {
    return { enum: match.results.enum };
  },
  tests: [
    {
      tests: [
        ["as either red or black", { enum: ["red", "black"] }],
        ["as one of clubs, diamonds, hearts, spades", { enum: ["clubs", "diamonds", "hearts", "spades" ] }],
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
  name: "define_property_has",
  alias: ["statement", "mutatesScope"],
  syntax: "(?:(a|an) {type:identifier} has|{type:identifier} have) (a|an) {property:identifier} {initializer:type_initializer}",
  testRule: "…(has|have)",
  constructor: class define_type extends Rule.Sequence {
    getResults(match) {
      const results = super.getResults(match);
      return inflectResults(results, "type", "property");
    }
    compile(match) {
      const { Type, Properties, property, initializer } = match.results;
      if (initializer.enum) {
        return [
          `defineProp(${Type}, '${Properties}', { value: ${JSON5.stringify(initializer.enum)} })`,
          `defineProp(${Type}.prototype, '${Properties}', { value: ${Type}.${Properties} })`,
          `defineProp(${Type}.prototype, '${property}', {`,
          `  get() { return this.${property} }`,
          `  set(${property}) { if ($.isOneOf(${property}, this.${Properties})) this.${property} = ${property} }`,
          `})`
        ].join("\n");
      }
      else if (initializer.datatype) {
        const datatype = initializer.datatype;
        return [
          `defineProp(${Type}.prototype, '${property}', {`,
          `  get() { return this.${property} }`,
          `  set(${property}) { if ($.isType(${property}, '${datatype}')) this.${property} = ${property} }`,
          `})`
        ].join("\n");
      }
    }
    updateScope(match, scope) {
      const { type, property, properties, Properties, initializer } = match.results;
      const datatype = initializer.datatype || initializer.enum;
      // Add normal instance property
      scope.addInstanceProperty({ type, property, datatype });
      if (initializer.enum) {
        // Add enum as a property to the class
        scope.addProperty({ type, property: Properties, datatype: "enum", value: initializer.enum });
        // Add enum to the instance as well.
        scope.addInstanceProperty({ type, property: Properties, datatype: "enum", value: initializer.enum });
        // Add `<type> <properties>` as an identifier which points back to the class property.
        scope = scope.addIdentifier({ identifier: [ type, properties ], value: `${Type}.${Propeties}` });
        // Add any string enums as constants
        initialzer.enum.forEach(value => {
          if (typeof value === "string") scope.addConstant({ name: value, value });
        });
      }
      return scope;
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["cards have a direction as either up or down",
          [
            "defineProp(Card, 'Directions', { value: ['up','down'] })",
            "defineProp(Card.prototype, 'Directions', { value: Card.Directions })",
            "defineProp(Card.prototype, 'direction', {",
            "  get() { return this.direction }",
            "  set(direction) { if ($.isOneOf(direction, this.Directions)) this.direction = direction }",
            "})"
          ].join("\n")
        ],
        ["a player has a name as text",
          [
            "defineProp(Player.prototype, 'name', {",
            "  get() { return this.name }",
            "  set(name) { if ($.isType(name, 'text')) this.name = name }",
            "})"
          ].join("\n")
        ],
      ]
    }
  ]
});




parser.defineRule({
  name: "to_do_something",
  alias: ["statement", "mutatesScope"],
  // TODO: arguments
  syntax: "to (keywords:{word}|{type})+ :? {statement}?",
  constructor: class define_type extends Rule.BlockStatement {
    getResults(match) {
      const results = super.getResults(match);
      return parseMethodKeywords(results);
    }
    compile(match) {
      const { Types, method, args, instanceMethod, instanceArgs, statements } = match.results;
      return [
//TODO: want to add to scope ???
        `export function ${method}(${args.join(", ")}) ${statements}`,
      ].join("\n")
    }
    updateScope(match, scope) {
      const { method, rules } = match.results;
      scope.addMethod({ method });
      // add a rule to match the new syntax!
      scope.addStatementRule({
        rulex: rules.join(" "),
        compile(match) {
          const { args } = match.results;
          return `${method}(${args.join(", ")})`;
        }
      })
      return scope;
    }
  },
  tests: [
    {
      compileAs: "statements",
      tests: [
        ["to turn a card face up:", "export function turn_card_face_up(card) {}" ],
        [
          [
            "to add a card to a pile:",
            "\tremove the card from the pile of the card",      // its pile
            "\tadd the card to the pile"
          ].join("\n"),
          [
            "export function add_card_to_pile(card, pile) {",
            "\tspell.remove(card?.pile, card)",
            "\tspell.append(pile, card)",
            "}",
          ].join("\n")
        ],
      ]
    }
  ]
});




parser.defineRule({
  name: "quoted_property_name",
  alias: ["statement", "mutatesScope"],
  //  e.g. `a card "is face up" if ...`
  //  NOTE: the first word in quotes must be "is" !!
  syntax: '(a|an) {type:identifier} {text} if {expression}',
  constructor: class quoted_property_name extends Rule.Sequence {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (match && match.results.words[0] !== "is") return undefined;
      return match;
    }
    getResults(match) {
      const results = super.getResults(match);
      results.words = (""+JSON.parse(results.text)).split(" ");
      results.getter = results.words.join("_");
      return inflectResults(results, "type");
    }
    compile(match) {
      let { type, Type, getter, property, expression } = match.results;
      return [
        `defineProp(${Type}.prototype, '${getter}', {`,
        `  get() { return ${expression} }`,
        `})`
      ].join("\n")
    }
    updateScope(match, scope) {
      const { type, words, getter } = match.results;
      // Note the new instance property
      scope.addInstanceProperty({ type, getter, datatype: "boolean" });
      // Add is expression so we can say `thing is foo` or `thing is not foo bar`
      scope.addIsExpression({
        properties: words.slice(1),   // remove "is"
        compile(value) { return `${value}?.${getter}` }
      });
      return scope;
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
  name: "type_is_a_enum",
  alias: ["statement", "mutatesScope"],
  syntax: "(article:a|an) {type:word} is (a|an) \{ {property:identifier} \} if {expression}",
  updateScope(match, scope) {
    // TODO: somehow we have to get ahold of the enum!!!
    for (suit of Card.Suits) {
      addIsIdentifier(`a_${suit}`, `${thing}?.is_a_suit?.(${suit})`);
    }
  },
//  constructor: Rule.BlockStatement ??
  constructor: class type_is_a_enum extends Rule.Sequence {
    getResults(match) {
      const results = super.getResults(match);
      return inflectResults(results, "type");
    }
    compile(match) {
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
  alias: ["statement", "mutatesScope"],
  syntax: "for each {type:word} {property:identifier} : the {type2:identifier} is (article:a|an) \{ {property2:identifier} \} if {expression}",
  updateScope(match, scope) {
    // TODO: somehow we have to get ahold of the enum!!!
    for (suit of Card.Suits) {
      addIsIdentifier(`a_${suit}`, `${thing}?.is_a_suit?.(${suit})`);
    }
  },
  constructor: class type_is_a_enum extends Rule.Sequence {
    getResults(match) {
      const results = super.getResults(match);
      return inflectResults(results, "type");
    }
    compile(match) {
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
  alias: ["statement", "mutatesScope"],
  syntax: "{?:property_of_a_type} is {value:identifier} if {expression} (?:otherwise it is {otherValue:identifier})?",
  constructor: class type_is_a_enum extends Rule.Sequence {
    getResults(match) {
      const results = super.getResults(match);
      return inflectResults(results, "type");
    }
    compile(match) {
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
  alias: ["statement", "mutatesScope"],
  syntax: "{?:property_of_a_type} is {expression}",
  constructor: class type_is_a_enum extends Rule.Sequence {
    getResults(match) {
      const results = super.getResults(match);
      return inflectResults(results, "type");
    }
    compile(match) {
      let { Type, property, expression } = match.results;
      return [
        `defineProp(${Type}.prototype, '${property}', {`,
        `  get() { return ${expression} }`,
        `})`
      ].join("\n")
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
      ]
    }
  ]
});

