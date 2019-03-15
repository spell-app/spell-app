import {
  Rule,
  Scope,
  SpellParser,
  Token,

  lowerFirst,
  upperFirst,
  pluralize,
  singularize,
  parseMethodKeywords
} from "../all.js";

const parser = new SpellParser({ module: "classes" });
export default parser;

parser.defineRule({
  name: "create_type",
  alias: "statement",
  syntax: "create type {type} (?:as (a|an) {superType:type})?",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, { results }) {
    const { type, superType } = results;
    scope.addType({
      name: type,
      superType: superType
    }, results);
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


// `new` or `create`
// This works as an expression OR a statement.
// NOTE: we assume that all types take an object of properties????
//FIXME: `list`, `text`, etc don't follow these semantics???
parser.defineRule({
  name: "new_thing",
  alias: ["expression", "single_expression", "statement"],
  syntax: "create (a|an) {type} (?:with {props:object_literal_properties})?",
  testRule: "create",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, { results }) {
    const { type, props = "" } = results; // `props` is the object literal text
    scope.addStatement(`new ${type}(${props})`, results);
  },
  tests: [
    {
      title: "creates normal objects properly",
      compileAs: "statement",
      tests: [
        [`create an Object`, `new Object()`],
        [`create an Object with a = 1, b = yes`, `new Object({ "a": 1, "b": true })`],
        [`create a Foo`, `new Foo()`],
        [`create a Foo with a = 1, b = yes`, `new Foo({ "a": 1, "b": true })`]
      ]
    },
    {
      title: "creates special types",
      compileAs: "expression",
      tests: [
        ["create an object", "new Object()"],
        //FIXME: the following don't make sense if they have arguments...
        ["create a List", "new List()"],
        ["create a list", "new List()"]
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
  syntax: "as (either|one of) {enumeration:identifier_list}",
  compile(scope, match) {
    const { enumeration } = match.results;
    return { datatype: "enum", enumeration };
  },
  tests: [
    {
      tests: [
        ["as either red or black", { datatype: "enum", enumeration: ["red", "black"] }],
        ["as one of clubs, diamonds, hearts, spades", { datatype: "enum", enumeration: ["clubs", "diamonds", "hearts", "spades" ] }],
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
  syntax: "(?:(a|an) {type} has|{type:plural_type} have)"
});

parser.defineRule({
  name: "define_property_has",
  alias: "statement",
  syntax: "{?:type_has_prefix} (a|an) {property} {initializer:type_initializer}?",
  testRule: "…(has|have)",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, { results }) {
    const { type, property, initializer = {}} = results;
    const typeScope = scope.getOrStubType(type);
    const Properties = pluralize(upperFirst(property));

    let { datatype, enumeration } = initializer;
    const getter = [ `return this.#${property}` ];
    let setter;

    if (enumeration) {
      // Register the enumeration which will register all sorts of juicy rules and statements.
      typeScope.addEnumeration({ name: Properties, enumeration }, results);
      setter = [ `if ($.isOneOf(${property}, ${results.canonicalRef})) this.#${property} = ${property}` ];
      datatype = results.datatype;
    }
    else if (datatype) {
      setter = [ `if ($.isType(${property}, '${datatype}')) this.#${property} = ${property}` ];
    }
    else {
      setter = [ `this.#${property} = ${property}` ];
      datatype = "undefined";     // :-(
    }

    // Instance getter
    typeScope.addMethod({
      name: property,
      kind: "getter",
      statements: getter,
      returns: datatype,
    }, results);

    // Instance setter
    typeScope.addMethod({
      name: property,
      kind: "setter",
      args: [ { name: property, datatype } ],
      statements: setter,
      returns: "undefined",     // setters don't actually return a value... :-(
    }, results);
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        [ "cards have a direction as either up or down",
          [
            "Card.Directions = ['up','down']",
            "defineProp(Card.prototype, 'Directions', { value: Card.Directions })",
            "defineProp(Card.prototype, 'direction', { get() { return this.#direction } })",
            "defineProp(Card.prototype, 'direction', { set(direction) { if ($.isOneOf(direction, Card.Directions)) this.#direction = direction } })",
          ].join("\n")
        ],
        [ "a player has a name as text",
          [
            "defineProp(Player.prototype, 'name', { get() { return this.#name } })",
            "defineProp(Player.prototype, 'name', { set(name) { if ($.isType(name, 'text')) this.#name = name } })",
          ].join("\n")
        ],
      ]
    }
  ]
});




// TODO: arguments
parser.defineRule({
  name: "to_do_something",
  alias: "statement",
  syntax: "to (keywords:{word}|{type})+ :?",
  constructor: SpellParser.Rule.Statement,
  wantsInlineStatement: true,
  wantsNestedBlock: true,
  getNestedScope(scope, { results }) {
    const { type, method, args, syntax } = parseMethodKeywords(results);
    results.type = type;
    results.method = method;
    results.args = args;
    results.syntax = syntax;
    return results.$method = new Scope.Method({ scope, name: method, args });
  },
  updateScope(scope, { results }) {
    const { type, $method, method, syntax } = results;
    if (type)
      scope.getOrStubType(type).addClassMethod($method, results);
    else
      scope.addMethod($method, results);

    // TODO: need to work module scope in if no type???
    let compile = type
      ? function({ callArgs = "" }) { return `${type}.${method}(${callArgs})` }
      : function({ callArgs = "" }) { return `${method}(${callArgs})` }

    scope.addStatementRule({
      name: method,
      syntax,
      compile,
    }, results);
  },
  tests: [
    {
      compileAs: "block",
      tests: [
        [
          "to start the game",
          "function start_the_game() {}"
        ],
        [
          "to start the game: set the state of the game to 'started'",
          "function start_the_game() { game?.state = 'started' }"
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
            "Card.move_card_to_pile = function(card, pile) {",
            "  spell.remove(card?.pile, card)",
            "  spell.append(pile, card)",
            "  card?.pile = pile",
            "}",
          ].join("\n")
        ],
      ]
    }
  ]
});




parser.defineRule({
  name: "quoted_property_alias",
  alias: "statement",
  //  e.g. `a card "is face up" if ...`
  //  NOTE: the first word in quotes must be "is" !!
  syntax: '(a|an) {type} {alias:text} if {expression}',
  constructor: class quoted_property_name extends SpellParser.Rule.Statement {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      if (!match) return;
      // If first word of `alias` is not `is`, forget it
      const alias = JSON.parse(match.results.alias).split(" ");
      if (alias[0] !== "is") return;

      return match;
    }
    updateScope(scope, { results }) {
      const { type, alias, expression } = results;
      const words = JSON.parse(alias).split(" ");
      const property = words.join("_");
      const expressionSuffix = [words[0], "not?", ...words.slice(1)].join(" ");

      // Create an expression suffix to match the quoted statement, e.g. `is not? face up`
      scope.addExpressionSuffixRule({
        name: property,
        syntax: expressionSuffix,
        applyOperator({ lhs, operator }) {
          const bang = (operator.includes("not") ? "!" : "");
          return `${bang}${lhs}?.${property}`
        }
      });

      // Create an instance getter
      scope.getOrStubType(type)
        .addMethod({
          name: property,
          kind: "getter",
          datatype: "boolean",
          statements: [`return ${expression}`]
        }, results);
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ['a card "is face up" if its direction is \'up\'',
         "defineProp(Card.prototype, 'is_face_up', { get() { return (this.direction == 'up') } })"
        ],
        ['a card "is a face card" if its rank is one of [jack, queen, king]',
         "defineProp(Card.prototype, 'is_a_face_card', { get() { return spell.includes([jack, queen, king], this.rank) } })"
        ],
        ['a card "is a face card" if its rank is one of jack, queen or king',
         "defineProp(Card.prototype, 'is_a_face_card', { get() { return spell.includes([jack, queen, king], this.rank) } })"
        ],
      ]
    }
  ]
});

parser.defineRule({
  name: "the_property_of_a_thing",
  alias: "property_of_a_type",
  syntax: "the {property} of (a|an) {type}",
});
parser.defineRule({
  name: "a_things_property",
  alias: "property_of_a_type",
  syntax: "(a|an) {type:plural_type} {property}",
});

parser.defineRule({
  name: "property_value_either",
  alias: "statement",
  syntax: "{?:property_of_a_type} is {value:identifier} if {condition:expression} (?:otherwise it is {otherValue:identifier})?",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, { results }) {
    let { type, property, value, otherValue, condition } = results;

    scope.getOrStubType(type)
      // Create as an instance getter
      .addMethod({
        name: property,
        kind: "getter",
//TODO:   datatype: "...",
        statements: otherValue
          ? [`return !!${condition} ? ${value} : ${otherValue}`]
          : [`if (${condition}) return ${value}`]
      }, results)
  },
  tests: [
    {
      compileAs: "statement",
      tests: [      // is one of diamonds or hearts => is_one_of_list
        ["the color of a card is red if its suit is either diamonds or hearts",
         "defineProp(Card.prototype, 'color', { get() { if (spell.includes([diamonds, hearts], this.suit)) return red } })",
        ],
        ["a cards color is black if its suit is either clubs or spades otherwise it is red",
         "defineProp(Card.prototype, 'color', { get() { return !!spell.includes([clubs, spades], this.suit) ? black : red } })"
        ],
      ]
    }
  ]
});

parser.defineRule({
  name: "property_value_expression",
  alias: "statement",
  syntax: "{?:property_of_a_type} is {expression}",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, { results }) {
    let { type, property, expression } = results;
    scope
      .getOrStubType(type)
      .addMethod({
        kind: "getter",
        name: property,
        statements: [`return ${expression}`],
      }, results)
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["the value of a card is the position of its rank in its ranks",
         "defineProp(Card.prototype, 'value', { get() { return spell.positionOf(this.rank, this.ranks) } })"
        ],
        ["a cards score is its value",
         "defineProp(Card.prototype, 'score', { get() { return this.value } })"
        ],
      ]
    }
  ]
});



// TODO:
// "card is a queen" or "card is a queen of clubs"
//   a card "is a (rank)" for its ranks
//   a card "is a (rank) of (suits)" for its ranks and its suits
