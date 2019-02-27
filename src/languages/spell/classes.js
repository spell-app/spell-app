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
        `${Type}.${Properties} = ${JSON5.stringify(initializer.enum)}`,
        `${Type}.get_${property} = function(${type}) { return ${type}?.${property} }`,
        `${Type}.set_${property} = function(${type}, ${property}) {`,
        `  if ($.isType(${property}, ${Type}.${Properties})) ${type}?.${property} = ${property}`,
        `}`,
        `defineProp(${Type}.prototype, '${property}', {`,
        `  get() { return ${Type}.get_${property}(this) }`,
        `  set(${property}) { return ${Type}.set_${property}(this, ${property}) }`,
        `})`
      ].join("\n");
    }
    else if (initializer.datatype) {
      const datatype = initializer.datatype;
      return [
        `${Type}.get_${property} = function(${type}) { return ${type}?.${property} }`,
        `${Type}.set_${property} = function(${type}, ${property}) {`,
        `  if ($.isType(${property}, '${datatype}')) ${type}?.${property} = ${property}`,
        `}`,
        `defineProp(${Type}.prototype, '${property}', {`,
        `  get() { return ${Type}.get_${property}(this) }`,
        `  set(${property}) { return ${Type}.set_${property}(this, ${property}) }`,
        `})`
      ].join("\n");
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["cards have a face as either up or down",
          [
            "Card.Faces = {up:'up',down:'down'}",
            "Card.get_face = function(card) { return card?.face }",
            "Card.set_face = function(card, face) {",
            "  if ($.isType(face, Card.Faces)) card?.face = face",
            "}",
            "defineProp(Card.prototype, 'face', {",
            "  get() { return Card.get_face(this) }",
            "  set(face) { return Card.set_face(this, face) }",
            "})"
          ].join("\n")
        ],
        ["a player has a name as text",
          [
            "Player.get_name = function(player) { return player?.name }",
            "Player.set_name = function(player, name) {",
            "  if ($.isType(name, 'text')) player?.name = name",
            "}",
            "defineProp(Player.prototype, 'name', {",
            "  get() { return Player.get_name(this) }",
            "  set(name) { return Player.set_name(this, name) }",
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
      `${Type}.get_${methodName} = function(${type}) { return ${expression} }`,
      `defineProp(${Type}.prototype, '${methodName}', {`,
      `  get() { return ${Type}.get_${methodName}(this) }`,
      `})`
    ].join("\n")
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["a card is face-up if the face of the card is up",     // todo:  shouldn't need "face-up"...
          [
            "Card.get_is_face_up = function(card) { return (card?.face == up) }",
            "defineProp(Card.prototype, 'is_face_up', {",
            "  get() { return Card.get_is_face_up(this) }",
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
      `${Types[0]}.${method} = function(${args}) ${statements}`,
      `defineProp(${Types[0]}.prototype, '${instanceMethod}', {`,
      `  value: function(${instanceArgs}){ return ${Types[0]}.${method}(this${instanceArgs}) }`,
      `})`
    ].join("\n")
  },
  tests: [
    {
      compileAs: "statements",
      tests: [
        ["to turn a card face up:",
          [
            "Card.turn_card_face_up = function(card) {}",
            "defineProp(Card.prototype, 'turn_face_up', {",
            "  value: function(){ return Card.turn_card_face_up(this) }",
            "})"
          ].join("\n")
        ],
        [
          [
            "to flip Cards over:",
            "\tif the card is face-up: set the face of the card to down",  // "set its face to down"
            "\totherwise set the face of the card to up"                  // "set its face to up"
          ].join("\n"),
          [
            "Card.flip_card_over = function(card) {",
            "\tif (card == face_up) { card?.face = down }",      // if (Card.is_face_up(card))..."
            "\telse { card?.face = up }",
            "}",
            "defineProp(Card.prototype, 'flip_over', {",
            "  value: function(){ return Card.flip_card_over(this) }",
            "})"
          ].join("\n")
        ],
      ]
    }
  ]
});

