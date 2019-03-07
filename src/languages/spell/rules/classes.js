import {
  BlockStatement,
  Rule,
  Scope,
  SpellParser,
  Token,

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
  alias: ["statement"],
  syntax: "create type {type:identifier} (?:as (a|an) {superType:identifier})?",
  constructor: class create_type extends Rule.Sequence {
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      return inflectResults(results, "type", "superType");
    }
    compile(match, scope) {
      const { results: { Type, SuperType } } = match;
      return scope
        .addType({
          name: Type,
          superType: SuperType
        })
        .compile();
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


// `new` or `create`
// This works as an expression OR a statement.
// NOTE: we assume that all types take an object of properties????
//FIXME: `list`, `text`, etc don't follow these semantics???
parser.defineRule({
  name: "new_thing",
  alias: ["expression", "single_expression", "statement"],
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
  syntax: "as (either|one of) {enumeration:identifier_list}",
  // Return the enumeration for someone else to consume
  compile(match, scope) {
    return { datatype: "enum", enumeration: match.results.enumeration };
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
  alias: ["statement"],
  syntax: "{?:type_has_prefix} (a|an) {property:identifier} {initializer:type_initializer}?",
  testRule: "…(has|have)",
  constructor: class define_property_has extends Rule.Sequence {
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      return inflectResults(results, "type", "property");
    }
    compile(match, scope) {
      const { Type, type, Properties, property, initializer = {}} = match.results;
      const typeScope = scope.getOrAddType(Type);
      let { datatype, enumeration } = initializer;
      const getter = [ `return this.#${property}` ];
      let setter;

      const results = {
        type: typeScope,
        statements: [],
        rules: []
      };
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

      results.statements.push(
        // Instance getter
        typeScope.addMethod({
          name: property,
          kind: "getter",
          statements: getter,
          returns: datatype,
        }),
        // Instance setter
        typeScope.addMethod({
          name: property,
          kind: "setter",
          args: [
            new Scope.Variable({ name: property, datatype })
          ],
          statements: setter,
          returns: "undefined",     // setters don't actually return a value... :-(
        })
      );
scope.info("define_property_has: ", results);
      return results.statements.join("\n");
    }
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
  alias: ["statement"],
  syntax: "to (keywords:{word}|{type})+ :? {statement}?",
  constructor: class define_type extends BlockStatement {
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
          `  value(${args.join(", ")}) ${statements}`,
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
    XupdateScope(match, scope) {
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
      compileAs: "block",
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
            "  value(card, pile) {",
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
  alias: ["statement"],
  //  e.g. `a card "is face up" if ...`
  //  NOTE: the first word in quotes must be "is" !!
  syntax: '(a|an) {type:identifier} {text} if {expression}',
  constructor: class quoted_property_name extends Rule.Sequence {
    parse(scope, tokens) {
      const match = super.parse(scope, tokens);
      // Check the results -- if first word of `text` is not `is`, results will be undefined
      // Meaning no match.
      if (match && !match.results) return undefined;
      return match;
    }
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      // split the text string up into words
      const words = (""+JSON.parse(results.text)).split(" ");
      // if the first word is not "is" then forget it
      if (words[0] !== "is") return;
      results.property = words.join("_");
      results.expressionSuffix = [words[0], "not?", ...words.slice(1)].join(" ");
      return inflectResults(results, "type");
    }
    compile(match, scope) {
      const { TypeName, typeName, property, expression, expressionSuffix } = match.results;

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
      return scope
        .getOrAddType(TypeName)
        .addMethod({
          name: property,
          kind: "getter",
          datatype: "boolean",
          statements: [`return ${expression}`]
        })
        .compile();
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
  alias: ["statement"],
  syntax: "{?:property_of_a_type} is {value:identifier} if {condition:expression} (?:otherwise it is {otherValue:identifier})?",
  constructor: class type_is_a_enum extends Rule.Sequence {
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      return inflectResults(results, "type");
    }
    compile(match, scope) {
      let { TypeName, typeName, property, value, otherValue, condition } = match.results;

      // Create as an instance getter
      return scope
        .getOrAddType(TypeName)
        .addMethod({
          name: property,
          kind: "getter",
//TODO:   datatype: "...",
          statements: otherValue
            ? [`return !!${condition} ? ${value} : ${otherValue}`]
            : [`if (${condition}) return ${value}`]
        })
        .compile();
    }
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
  alias: ["statement"],
  syntax: "{?:property_of_a_type} is {expression}",
  constructor: class type_is_a_enum extends Rule.Sequence {
    getResults(match, scope) {
      const results = super.getResults(match, scope);
      return inflectResults(results, "type");
    }
    compile(match, scope) {
      let { Type, property, expression } = match.results;
      return scope
        .getOrAddType(Type)
        .addMethod({
          kind: "getter",
          name: property,
          statements: [`return ${expression}`],
        })
        .compile();
    }
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




/*

// "card is a queen" or "card is a queen of clubs"
// Possibilities:
//   a card "is a (rank)" for its ranks
//   a card "is a (rank) of (suits)" for its ranks and its suits

parser.defineRule({
  name: "type_is_a_enum",
  alias: ["statement"],
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
        `  value(${property}){ return ${expression} }`,
        `})`,
      ].join("\n")
    }
    XupdateScope(match, scope) {

    }
  },
  tests: [
    {
      compileAs: "block",
      tests: [
        ["a card is a {suit} if its suit is the suit",
          [
            "defineProp(Card.prototype, 'is_a_suit', {",
            "  value(suit){ return (this.suit == suit) }",
            "})",
          ].join("\n")
        ],
      ]
    }
  ]
});

parser.defineRule({
  name: "type_is_a_enum_for",
  alias: ["statement"],
  syntax: "for each {type:word} {property:identifier} : the {type2:identifier} is (article:a|an) \{ {property2:identifier} \} if {expression}",
  XupdateScope(match, scope) {
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
        `  value(${property}){ return ${expression} }`,
        `})`,
      ].join("\n")
    }
  },
  tests: [
    {
      compileAs: "block",
      tests: [
        ["for each card suit: the card is a {suit} if its suit is the suit",
          [
            "defineProp(Card.prototype, 'is_a_suit', {",
            "  value(suit){ return (this.suit == suit) }",
            "})",
          ].join("\n")
        ],
      ]
    }
  ]
});
*/
