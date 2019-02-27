import startCase from "lodash/startCase";
import JSON5 from "JSON5";

import {
  Rule,
  SpellParser,
  Token,
} from "./all.js";

import {
  pluralize,
  isPlural,
  singularize,
  isSingular
} from "../../utils/all.js";

const parser = new SpellParser({ module: "classes" });
export default parser;

parser.defineRule({
  name: "define_type",
  alias: ["statement", "mutatesScope"],
  syntax: "create type {type:identifier} (?:as (a|an) {superType:identifier})?",
  compile(match) {
    let { type, superType } = match.results;
    const Type = startCase(type);
    if (superType) {
      const SuperType = startCase(superType);
      return `export class ${Type} extends ${SuperType} {}`;
    }
    return `export class ${Type} {}`;
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

// parser.defineRule({
//   name: "define_type",
//   alias: ["statement", "mutatesScope"],
//   syntax: "(a|an) {type:identifier} is (a|an) {superType:identifier}",
//   compile(match) {
//     let { type, superType } = match.results;
//     return `export class ${startCase(type)} extends ${startCase(superType)} {}`;
//   },
//   tests: [
//     {
//       compileAs: "statement",
//       tests: [
//         ["a card is a thing", "export class Card extends Thing {}"],
//         ["a car is an automobile", "export class Car extends Automobile {}"],
//       ]
//     }
//   ]
// });
//
// parser.defineRule({
//   name: "identifier_list",
//   syntax: "[({word}|{number})(,|or|and)]",
//   tests: [
//     {
//       tests: [
//         ["up or down", ["up", "down"]],
//         ["red and black", ["red", "black"]],
//         ["clubs, diamonds, hearts, spades", ["clubs", "diamonds", "hearts", "spades" ] ],
//         ["ace, 2, 3, 4, jack, queen, king", ["ace", 2, 3, 4, "jack", "queen", "king" ] ],
//       ]
//     }
//   ]
// });


parser.defineRule({
  name: "type_initializer_enum",
  alias: "type_initializer",
  syntax: "as (either|one of) {enum:identifier_list}",
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
  syntax: "(?:a {type:identifier} has|{type:identifier} have) (a|an) {property:identifier} {initializer:type_initializer}",
  update(match, scope) {
    scope.addGlobal("Card.Faces");
    scope.addConstantIdentifier("up");
    scope.addConstantIdentifier("down");
  },
  compile(match) {
//console.warn(match.results);
    let { type, property, initializer } = match.results;
    type = singularize(type).toLowerCase();
    const Type = startCase(type);

    property = singularize(property).toLowerCase();
    const properties = pluralize(property);

    const Property = startCase(property);
    const Properties = startCase(properties);

    if (initializer.enum) {
      return [
        `defineProp(${Type}.prototype, '${Properties}', { value: ${JSON5.stringify(initializer.enum)} })`,
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
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["cards have a direction as either up or down",
          [
            "defineProp(Card.prototype, 'Directions', { value: ['up','down'] })",
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
  name: "getter_if",
  alias: ["statement", "mutatesScope"],
  syntax: "(?:a {type:identifier} is|{type:identifier} are) {property:identifier} if {expression}",
  compile(match) {
//    console.warn(match.results);
    let { type, property, expression } = match.results;
    type = singularize(type).toLowerCase();
    const Type = startCase(type);
    const methodName = `is_${property}`;
    return [
      `defineProp(${Type}.prototype, '${methodName}', {`,
      `  get() { return ${expression} }`,
      `})`
    ].join("\n")
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["a card is face-up if its direction is up",
          [
            "defineProp(Card.prototype, 'is_face_up', {",
            "  get() { return (this.direction == up) }",
            "})"
          ].join("\n")
        ],
      ]
    }
  ]
});



function parseKeywordsToMethod(match) {
  // console.warn(match.results);
  // console.warn(match.matches);
  const { keywords } = match.results;
  const keywordMatches = match.matches.keywords.matched;

  const methodName = [];
  let types = [];
  for (var i = 0; i < keywords.length; i++) {
    let word = keywords[i].toLowerCase();
    let isType = false;
    if ((word === "a" || word === "an") && keywords[i+1]) {
      isType = true;
      word = keywords[++i];   // skip the article
    } else if (keywordMatches[i].rule.name === "type") {
      isType = true;
    }
    if (isType) {
      word = singularize(word);
      types.push(word);
    }
    methodName.push(word);
  }

  const Types = types.map(type => startCase(type));
  return {
    types,
    Types,
    method: methodName.join("_"),
    args: types.join(", "),
    instanceMethod: methodName.filter(word => word != types[0]).join("_"),
    instanceArgs: types.length > 1 ? `, ${types.splice(1).join(", ")}` : ""
  };
}


parser.defineRule({
  name: "to_do_something",
  alias: ["statement", "mutatesScope"],
  syntax: "to (keywords:{word}|{type})+ :? {statement}?",
  constructor: Rule.BlockStatement,
  compile(match) {
    const { statements } = match.results;
    const { types, Types, method, args, instanceMethod, instanceArgs } = parseKeywordsToMethod(match);
    return [
      `defineProp(${Types[0]}.prototype, '${instanceMethod}', {`,
      `  value: function(${instanceArgs})${statements}`,
      `})`
    ].join("\n")
  },
  tests: [
    {
      compileAs: "statements",
      tests: [
        ["to turn a card face up:",
          [
            "defineProp(Card.prototype, 'turn_face_up', {",
            "  value: function(){}",
            "})"
          ].join("\n")
        ],
        [
          [
            "to flip Cards over:",
            "\tif the card is face-up: set its face to down",
            "\totherwise set its face to up"
          ].join("\n"),
          [
            "defineProp(Card.prototype, 'flip_over', {",
            "  value: function(){",
            "\tif (card == face_up) { this.face = down }",      // if (this.is_face_up)..."
            "\telse { this.face = up }",
            "}",
            "})"
          ].join("\n")
        ],
      ]
    }
  ]
});



parser.defineRule({
  name: "type_is_a",
  alias: ["statement", "mutatesScope"],
  syntax: "(article:a|an) {type:word} is (a|an) {property:identifier} if {expression}",
//  constructor: Rule.BlockStatement,
  updateScope(match, scope) {
    // TODO: somehow we have to get ahold of the enum!!!
    for (suit of Card.Suits) {
      addIsIdentifier(`a_${suit}`, `${thing}?.is_a_suit?.(${suit})`);
    }
  },
  compile(match) {
    const { article, type, property, expression } = match.results;
    const Type = startCase(singularize(type));
    return [
      `defineProp(${Type}.prototype, 'is_${article}_${property}', {`,
      `  get(){ return ${expression} }`,
      `})`,
    ].join("\n")
  },
  tests: [
    {
      compileAs: "statements",
      tests: [
        ["a card is a face-card if its rank is one of [jack, queen, king]",
          [
            "defineProp(Card.prototype, 'is_a_face_card', {",
            "  get(){ return spell.includes([jack, queen, king], this.rank) }",
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
//  constructor: Rule.BlockStatement,
  updateScope(match, scope) {
    // TODO: somehow we have to get ahold of the enum!!!
    for (suit of Card.Suits) {
      addIsIdentifier(`a_${suit}`, `${thing}?.is_a_suit?.(${suit})`);
    }
  },
  compile(match) {
    const { article, type, property, expression } = match.results;
    const Type = startCase(singularize(type));
    return [
      `defineProp(${Type}.prototype, 'is_${article}_${property}', {`,
      `  value: function(${property}){ return ${expression} }`,
      `})`,
    ].join("\n")
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
  syntax: "for each {type:word} {property:identifier}: the {type2:identifier} is (article:a|an) \{ {property2:identifier} \} if {expression}",
//  constructor: Rule.BlockStatement,
  updateScope(match, scope) {
    // TODO: somehow we have to get ahold of the enum!!!
    for (suit of Card.Suits) {
      addIsIdentifier(`a_${suit}`, `${thing}?.is_a_suit?.(${suit})`);
    }
  },
  compile(match) {
// console.warn(match.results);
    const { article, type, property, expression } = match.results;
    const Type = startCase(singularize(type));
    return [
      `defineProp(${Type}.prototype, 'is_${article}_${property}', {`,
      `  value: function(${property}){ return ${expression} }`,
      `})`,
    ].join("\n")
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
  compile(match) {
//    console.warn(match.results);
    let { type, property, value, otherValue, expression } = match.results;
    type = singularize(type).toLowerCase();
    const Type = startCase(type);

    const statement = !otherValue
      ? `if (${expression}) return ${value}`
      : `return !!${expression} ? ${value} : ${otherValue}`;

    return [
      `defineProp(${Type}.prototype, '${property}', {`,
      `  get() { ${statement} }`,
      `})`
    ].join("\n")
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
  compile(match) {
//    console.warn(match.results);
    let { type, property, expression } = match.results;
    type = singularize(type).toLowerCase();
    const Type = startCase(type);

    return [
      `defineProp(${Type}.prototype, '${property}', {`,
      `  get() { return ${expression} }`,
      `})`
    ].join("\n")
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

