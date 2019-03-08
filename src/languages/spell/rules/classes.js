import {
  Rule,
  Scope,
  SpellParser,
  Token,

  gatherResults,
  lowerFirst,
  upperFirst,
  pluralize,
  singularize,
  inflectResults,
  inflectResultsArray,
  parseMethodKeywords
} from "../all.js";

const parser = new SpellParser({ module: "classes" });
export default parser;

parser.defineRule({
  name: "create_type",
  alias: "statement",
  syntax: "create type {type:word} (?:as (a|an) {superType:identifier})?",
  constructor: SpellParser.Rule.Statement,
  gatherResults(scope, match) {
    const results = gatherResults(scope, match);
    return inflectResults(results, "type", "superType");
  },
  updateScope(scope, results) {
    const { Type, SuperType } = results;
    scope.addType({
      name: Type,
      superType: SuperType
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
  syntax: "create (a|an) {type:word} (?:with {props:object_literal_properties})?",
  testRule: "create",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, results) {
    const { type, props = "" } = results; // `props` is the object literal text
    const Type = upperFirst(type);
    scope.addStatement(`new ${Type}(${props})`, results);
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
  gatherResults(scope, match) {
    const results = gatherResults(scope, match);
    return { datatype: "enum", enumeration: results.enumeration };
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
  syntax: "(?:(a|an) {type:identifier} has|{type:identifier} have)"
});

parser.defineRule({
  name: "define_property_has",
  alias: "statement",
  syntax: "{?:type_has_prefix} (a|an) {property:identifier} {initializer:type_initializer}?",
  testRule: "…(has|have)",
  constructor: SpellParser.Rule.Statement,
  gatherResults(scope, match) {
    const results = gatherResults(scope, match);
    return inflectResults(results, "type", "property");
  },
  updateScope(scope, results) {
    const { Type, type, Properties, property, initializer = {}} = results;
    const typeScope = scope.getOrAddType(Type);
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
      datatype = "undefined";
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
  gatherResults(scope, match) {
    const results = gatherResults(scope, match);
    return parseMethodKeywords(results);
  },
  getNestedScope(scope, results) {
    const { method, args } = results;
    return results.$method = new Scope.Method({ scope, name: method, args });
  },
  updateScope(scope, results) {
    const { Type, $method, method, syntax } = results;
    if (Type)
      scope.getOrAddType(Type).addClassMethod($method, results);
    else
      scope.addMethod($method, results);

    // TODO: need to work module scope in if no type???
    let compile = results.Type
      ? function({ callArgs = "" }) { return `${Type}.${method}(${callArgs})` }
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
  syntax: '(a|an) {type:identifier} {alias:text} if {expression}',
  constructor: class quoted_property_name extends SpellParser.Rule.Statement {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      // Check the results -- if first word of `text` is not `is`,
      // results will be undefined, meaning no match.
      if (match && !match.results) return undefined;
      return match;
    }
    gatherResults(scope, match) {
      const results = gatherResults(scope, match);
      // split the text string up into words
      const alias = (""+JSON.parse(results.alias)).split(" ");
      // if the first word is not "is" then forget it
      if (alias[0] !== "is") return;
      results.property = alias.join("_");
      results.expressionSuffix = [alias[0], "not?", ...alias.slice(1)].join(" ");
      return inflectResults(results, "type");
    }
    updateScope(scope, results) {
      const { TypeName, typeName, property, expression, expressionSuffix } = results;

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
      scope.getOrAddType(TypeName)
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
  syntax: "the {property:identifier} of (a|an) {type:identifier}",
});
parser.defineRule({
  name: "a_things_property",
  alias: "property_of_a_type",
  syntax: "(a|an) {type:identifier} {property:identifier}",
});

parser.defineRule({
  name: "property_value_either",
  alias: "statement",
  syntax: "{?:property_of_a_type} is {value:identifier} if {condition:expression} (?:otherwise it is {otherValue:identifier})?",
  constructor: SpellParser.Rule.Statement,
  gatherResults(scope, match) {
    const results = gatherResults(scope, match);
    return inflectResults(results, "type");
  },
  updateScope(scope, results) {
    let { TypeName, typeName, property, value, otherValue, condition } = results;

    scope.getOrAddType(TypeName)
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
  gatherResults(scope, match) {
    const results = gatherResults(scope, match);
    return inflectResults(results, "type");
  },
  updateScope(scope, results) {
    let { Type, property, expression } = results;
    scope
      .getOrAddType(Type)
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
