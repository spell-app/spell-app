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
  syntax: "(a|an) {type:identifier} is (a|an) {superType:identifier}",
  compile(match) {
    let { type, superType } = match.results;
    return `export class ${startCase(type)} extends ${startCase(superType)} {}`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["a card is a thing", "export class Card extends Thing {}"],
        ["a car is an automobile", "export class Car extends Automobile {}"],
      ]
    }
  ]
});

parser.defineRule({
  name: "identifier_list",
  syntax: "[{word}(,|or|and)]",
  tests: [
    {
      tests: [
        ["up or down", ["up", "down"]],
        ["red and black", ["red", "black"]],
        ["clubs, diamonds, hearts, spades", ["clubs", "diamonds", "hearts", "spades" ] ],
      ]
    }
  ]
});


parser.defineRule({
  name: "type_initializer_enum",
  alias: "type_initializer",
  syntax: "as (either|one of) {enums:identifier_list}",
  compile(match) {
    const { enums } = match.results;
    const map = {};
    enums.forEach(value => map[value] = value);
    return { enum: map };
  },
  tests: [
    {
      tests: [
        ["as either red or black", { enum: { red: "red", black: "black"} }],
        ["as one of clubs, diamonds, hearts, spades", { enum: { clubs: "clubs", diamonds: "diamonds", hearts: "hearts", spades: "spades" } }],
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
        `  set(${property}) {`,
        `    if ($.isOneOf(${property}, this.${Properties})) this.${property} = ${property}`,
        `  }`,
        `})`
      ].join("\n");
    }
    else if (initializer.datatype) {
      const datatype = initializer.datatype;
      return [
        `defineProp(${Type}.prototype, '${property}', {`,
        `  get() { return this.${property} }`,
        `  set(${property}) {`,
        `    if ($.isType(${property}, '${datatype}')) this.${property} = ${property}`,
        `  }`,
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
            "defineProp(Card.prototype, 'Directions', { value: {up:'up',down:'down'} })",
            "defineProp(Card.prototype, 'direction', {",
            "  get() { return this.direction }",
            "  set(direction) {",
            "    if ($.isOneOf(direction, this.Directions)) this.direction = direction",
            "  }",
            "})"
          ].join("\n")
        ],
        ["a player has a name as text",
          [
            "defineProp(Player.prototype, 'name', {",
            "  get() { return this.name }",
            "  set(name) {",
            "    if ($.isType(name, 'text')) this.name = name",
            "  }",
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
  syntax: "(article:a|an) {type:word} is (a|an) \{{property:identifier}\} if {expression}",
//  constructor: Rule.BlockStatement,
  compile(match) {
    const { article, type, property, expression } = match.results;
    const Type = startCase(singularize(type));
    return [
      `defineProp(${Type}.prototype, 'is_${article}_${property}', {`,
      `  value: function(${property}){ return ${expression} }`,
      `})`,
      `defineProp(${Type}.prototype, 'is_not_${article}_${property}', {`,
      `  value: function(${property}){ return !this.is_${article}_${property} }`,
      `})`
    ].join("\n")
  },
  tests: [
    {
      compileAs: "statements",
      tests: [
        ["a card is a {suit} if its suit is suit",
          [
            "defineProp(Card.prototype, 'is_a_suit', {",
            "  value: function(suit){ return (this.suit == suit) }",
            "})",
            "defineProp(Card.prototype, 'is_not_a_suit', {",
            "  value: function(suit){ return !this.is_a_suit }",
            "})"
          ].join("\n")
        ],
      ]
    }
  ]
});

