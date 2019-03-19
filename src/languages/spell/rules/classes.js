import {
  Rule,
  Scope,
  Spell,
  Token,

  lowerFirst,
  upperFirst,
  pluralize,
  singularize,
} from "../all.js";

import { parseMethodKeywords } from "./inflection.js";

export default new Spell.Parser({
  module: "classes",
  rules: [
    {
      name: "create_type",
      alias: "statement",
      syntax: [
        "create type {type} (?:as (a|an) {superType:type})?",
        "a {type} is (a|an) {superType:type}"
      ],
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { type, superType } = results;
        const statement = scope.types.add({
          name: type,
          superType: superType
        });
        results.statements.push(statement);
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            ["create type card", "export class Card {}"],
            ["create type car as a vehicle", "export class Car extends Vehicle {}"],
            ["a card is a thing", "export class Card extends Thing {}"],
          ]
        }
      ]
    },


    // `new` or `create`
    // This works as an expression OR a statement.
    // NOTE: we assume that all types take an object of properties????
    //FIXME: `list`, `text`, etc don't follow these semantics???
    {
      name: "new_thing",
      alias: ["expression", "single_expression", "statement"],
      syntax: "create (a|an) {type} (?:with {props:object_literal_properties})?",
      testRule: "create",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { type, props = "" } = results; // `props` is the object literal text
        const statement = scope.addStatement(`new ${type}(${props})`);
        results.statements.push(statement);
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
    },


    {
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
    },

    {
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
    },

    {
      name: "type_has_prefix",
      syntax: "(?:(a|an) {type} has|{type:plural_type} have)"
    },

    {
      name: "define_property_has",
      alias: "statement",
      syntax: "{?:type_has_prefix} (a|an) {property} {initializer:type_initializer}?",
      testRule: "…(has|have)",
      constructor: Spell.Rule.Statement,
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
        let statement = typeScope.methods.add({
          name: property,
          kind: "getter",
          statements: getter,
          returns: datatype,
        });
        results.statements.push(statement);

        // Instance setter
        statement = typeScope.methods.add({
          name: property,
          kind: "setter",
          args: [ { name: property, datatype } ],
          statements: setter,
          returns: "undefined",     // setters don't actually return a value... :-(
        });
        results.statements.push(statement);
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
    },




    // TODO: arguments
    {
      name: "to_do_something",
      alias: "statement",
      syntax: "to (keywords:{word}|{type})+ :?",
      constructor: Spell.Rule.Statement,
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
        let statement;
        if (type)
          statement = scope.getOrStubType(type).classMethods.add($method);
        else
          statement = scope.methods.add($method);

        results.statements.push(statement);
        // TODO: need to work module scope in if no type???
        let compile = type
          ? function({ callArgs = "" }) { return `${type}.${method}(${callArgs})` }
          : function({ callArgs = "" }) { return `${method}(${callArgs})` }

        scope.addStatementRule({
          name: method,
          syntax,
          compile,
        });
      },
      tests: [
        {
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add("deck");
          },
          tests: [
            [
              "to start the game",
              "function start_the_game() {}"
            ],
            [
              "to start the game: shuffle the deck",
              "function start_the_game() { spell.shuffle(deck) }"
            ],
            [
              [ "to move a card to a pile:",
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
    },




    {
      name: "quoted_property_alias",
      alias: "statement",
      //  e.g. `a card "is face up" if ...`
      //  NOTE: the first word in quotes must be "is" !!
      syntax: '(a|an) {type} {alias:text} if {expression}',
      constructor: class quoted_property_name extends Spell.Rule.Statement {
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
          const statement = scope.getOrStubType(type)
            .methods.add({
              name: property,
              kind: "getter",
              datatype: "boolean",
              statements: [`return ${expression}`]
            });
          results.statements.push(statement);
        }
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.types.add("card");
            scope.constants.add("up", "jack", "queen", "king");
          },
          tests: [
            ['a card "is face up" if its direction is up',
             "defineProp(Card.prototype, 'is_face_up', { get() { return (this.direction == 'up') } })"
            ],
            ['a card "is a face card" if its rank is one of [jack, queen, king]',
             "defineProp(Card.prototype, 'is_a_face_card', { get() { return spell.includes(['jack', 'queen', 'king'], this.rank) } })"
            ],
            ['a card "is a face card" if its rank is one of jack, queen or king',
             "defineProp(Card.prototype, 'is_a_face_card', { get() { return spell.includes([jack, queen, king], this.rank) } })"
            ],
          ]
        }
      ]
    },

    {
      name: "the_property_of_a_thing",
      alias: "property_of_a_type",
      syntax: "the {property} of (a|an) {type}",
    },
    {
      name: "a_things_property",
      alias: "property_of_a_type",
      syntax: "(a|an) {type:plural_type} {property}",
    },

    {
      name: "property_value_either",
      alias: "statement",
      syntax: "{?:property_of_a_type} is (value:{constant}|{expression}) if {condition:expression} (?:otherwise it is (otherValue:{constant}|{expression}))?",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results, matches }) {
        const { value: valueMatch, otherValue: otherValueMatch } = matches;
        if (valueMatch.rule instanceof Spell.Rule.Constant) {
          const constant = valueMatch.constant || scope.constants(valueMatch.raw);
          if (!constant) scope.constants.add(valueMatch.raw);
        }
        if (otherValueMatch?.rule instanceof Spell.Rule.Constant) {
          const constant = otherValueMatch.constant || scope.constants(otherValueMatch.raw);
          if (!constant) scope.constants.add(otherValueMatch.raw);
        }

        const { type, value, otherValue, property, condition } = results;
        const statement = scope.getOrStubType(type)
          // Create as an instance getter
          .methods.add({
            name: property,
            kind: "getter",
    //TODO:   datatype: "...",
            statements: otherValue
              ? [`return !!${condition} ? ${value} : ${otherValue}`]
              : [`if (${condition}) return ${value}`]
          });
        results.statements.push(statement);
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.types.add("card");
            scope.constants.add("diamonds", "hearts", "clubs", "spades");
          },
          tests: [      // is one of diamonds or hearts => is_one_of_list
            ["the color of a card is red if its suit is either diamonds or hearts",
             "defineProp(Card.prototype, 'color', { get() { if (spell.includes([diamonds, hearts], this.suit)) return 'red' } })",
            ],
            ["a cards color is black if its suit is either clubs or spades otherwise it is red",
             "defineProp(Card.prototype, 'color', { get() { return !!spell.includes([clubs, spades], this.suit) ? 'black' : 'red' } })"
            ],
          ]
        }
      ]
    },

    {
      name: "property_value_expression",
      alias: "statement",
      syntax: "{?:property_of_a_type} is {expression}",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        let { type, property, expression } = results;
        const statement = scope
          .getOrStubType(type)
          .methods.add({
            kind: "getter",
            name: property,
            statements: [`return ${expression}`],
          })
        results.statements.push(statement);
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.types.add("card");
          },
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
    },



    // TODO:
    // "card is a queen" or "card is a queen of clubs"
    //   a card "is a (rank)" for its ranks
    //   a card "is a (rank) of (suits)" for its ranks and its suits
  ]
});
