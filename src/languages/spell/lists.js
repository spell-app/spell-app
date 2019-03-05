//
//  # Rules for dealing with lists
//

// TODO: confirm identifiers are plural in some of the below?

import {
  Rule,
  SpellParser,
} from "./all.js";

import { singularize } from "../../utils/all.js";

const parser = new SpellParser({ module: "lists" });
export default parser;

// WORKING FROM OTHER RULES (testme)
//  `the length of <list>`
//  `<thing> is not? in <list>`
//  `<list> is not? empty`
//  `set item 1 of my-list to 'a'`

// TODO:   `create list with <exp>, <exp>, <exp>`
// TODO:  `duplicate list`
// TODO:  `duplicate list with <exp>, <exp>, <exp>` ???
// TODO:  `the size of <list>` => will map to `list.size`...
//        - install `size` as an alias to `length`?
// TODO:  `move <thing> to end of <list>` ???
// TODO:  `Set` for a unique list?
// TODO:  typed list?
// TODO:  list which won't take null/undefined

// Return the length of a list.
parser.defineRule({
  name: "list_length",
  alias: ["expression", "single_expression"],
  syntax: "the? number of {identifier} in {list:expression}",
  testRule: "…(number of)",
  precedence: 3,
  compile(match, scope) {
    const { list } = match.results;
    return `spell.lengthOf(${list})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["number of items in my-list", "spell.lengthOf(my_list)"],
        ["the number of foos in the foo of the bar", "spell.lengthOf(bar?.foo)"],
        ["the number of items in [1,2,3]", "spell.lengthOf([1, 2, 3])"]
      ]
    }
  ]
});

// Return the first position of specified item in the list as an array.
// If item is not found, returns `undefined`.
// NOTE: this position returned is **1-based**.
// TODO: `positions`, `last position`, `after...`
parser.defineRule({
  name: "list_position",
  alias: ["expression", "single_expression"],
  syntax: "the? position of {thing:expression} in {list:expression}",
  testRule: "…(position of)",
  precedence: 3,
  compile(match, scope) {
    const { thing, list } = match.results;
    return `spell.positionOf(${thing}, ${list})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["position of thing in my-list", "spell.positionOf(thing, my_list)"],
        ["the position of thing in the foo of the bar", "spell.positionOf(thing, bar?.foo)"],
        ["the position of 'a' in ['a', 'b', 'c']", "spell.positionOf('a', ['a', 'b', 'c'])"]
      ]
    }
  ]
});

// Does list start with some value?.
parser.defineRule({
  name: "starts_with",
  alias: "expression_suffix",
  syntax: "(operator:(starts|ends) with) {expression:single_expression}",
  applyOperator({ lhs, operator, rhs }) {
    const method = (operator === "starts with" ? "startsWith" : "endsWith");
    return `spell.${method}(${lhs}, ${rhs})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["my-list starts with thing", "spell.startsWith(my_list, thing)"],
        ["[1,2,3] starts with 1", "spell.startsWith([1, 2, 3], 1)"],
        ["my-list ends with thing", "spell.endsWith(my_list, thing)"],
        ["[1,2,3] ends with 1", "spell.endsWith([1, 2, 3], 1)"]
      ]
    }
  ]
});


//
//  Ordinal numbers (first, second, last, etc).
// TODO: sixty-fifth, two hundred forty ninth... with custom parser?
//
parser.defineRule({
  name: "ordinal",
  argument: "ordinal",
  pattern: /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|penultimate|final|last|top|bottom)$/,
  valueMap: {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    penultimate: -2,
    final: -1,
    last: -1,
    top: 1,
    bottom: -1
  },
  tests: [
    {
      tests: [
        ["first", 1],
        ["second", 2],
        ["third", 3],
        ["fourth", 4],
        ["fifth", 5],
        ["sixth", 6],
        ["seventh", 7],
        ["eighth", 8],
        ["ninth", 9],
        ["tenth", 10],

        ["penultimate", -2],
        ["final", -1],
        ["last", -1],

        ["top", 1],
        ["bottom", -1]
      ]
    }
  ]
});

// Index expression: numeric position in some list.
//  e.g.  `card 1 of the pile`
//      `card #2 of the pile`
//      `the first card of the pile`
//
// NOTE: Negative numeric positions come from the END of the list.
//  e.g.  `card -1 of the pile`
//
// NOTE: Our positions are **1-based** and Javascript is **0-based**.
//     e.g. `item 1 of the array`  = `array[0]`
parser.defineRule({
  name: "position_expression",
  alias: ["expression", "single_expression"],
  syntax: "{identifier} {position:expression} of {expression}",
  testRule: "…of",
  compile(match, scope) {
    const { identifier, position, expression } = match.results;
    return `spell.getItem(${expression}, ${position})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["item 1 of my-list", "spell.getItem(my_list, 1)"],
        ["card 10 of deck", "spell.getItem(deck, 10)"],
        ["card n of the cards of the deck", "spell.getItem(deck?.cards, n)"],
      ]
    }
  ]
});

parser.defineRule({
  name: "ordinal_position_expression",
  alias: ["expression", "single_expression"],
  syntax: "the {ordinal} {identifier} (in|of) {expression}",
  testRule: "…(in|of)",
  compile(match, scope) {
    const { identifier, ordinal, expression } = match.results;
    return `spell.getItem(${expression}, ${ordinal})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["the first item of my-list", "spell.getItem(my_list, 1)"],
        ["the tenth card of deck", "spell.getItem(deck, 10)"],
        ["the penultimate word in words", "spell.getItem(words, -2)"]
      ]
    }
  ]
});

// Pick a SINGLE random item from the list.
// TODO: confirm identifier is plural?
parser.defineRule({
  name: "random_position_expression",
  alias: ["expression", "single_expression"],
  syntax: "a random {identifier} (of|from|in) {list:expression}",
  testRule: "a random",
  compile(match, scope) {
    const { list, identifier } = match.results;
    return `spell.getRandomItemOf(${list})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["a random item of my-list", "spell.getRandomItemOf(my_list)"],
        ["a random word in 'some words'", "spell.getRandomItemOf('some words')"],
        ["a random card from deck", "spell.getRandomItemOf(deck)"]
      ]
    }
  ]
});

// Pick a unique set of random items from the list, returning an array.
// TODO: `two random items...`
// TODO: confirm identifier is plural?
parser.defineRule({
  name: "random_positions_expression",
  alias: ["expression", "single_expression"],
  syntax: "{number} random {identifier} (of|from|in) {list:expression}",
  testRule: "…random",
  compile(match, scope) {
    const { number, list, identifier } = match.results;
    return `spell.getRandomItemsOf(${list}, ${number})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["2 random items of my-list", "spell.getRandomItemsOf(my_list, 2)"],
        [
          "2 random words in 'some other words'",
          "spell.getRandomItemsOf('some other words', 2)"
        ],
        ["3 random cards from deck", "spell.getRandomItemsOf(deck, 3)"]
      ]
    }
  ]
});

// Range expression.
// Returns a new list.
// NOTE: `start` is **1-based**.
// NOTE: `end` is inclusive!
parser.defineRule({
  name: "range_expression",
  alias: ["expression", "single_expression"],
  syntax: "{identifier} {start:expression} to {end:expression} (of|in|from) {list:expression}",
  testRule: "…(of|in|from)",
  compile(match, scope) {
    const { list, start, end, identifier } = match.results;
    return `spell.getRange(${list}, ${start}, ${end})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["item 1 to 2 of my-list", "spell.getRange(my_list, 1, 2)"],
        ["word 2 to 3 in 'some other words'", "spell.getRange('some other words', 2, 3)"],
        ["card 1 to 3 from deck", "spell.getRange(deck, 1, 3)"]
      ]
    }
  ]
});

// Alternative form of range expression.
// Returns a new list.
parser.defineRule({
  name: "ordinal_range_expression",
  alias: ["expression", "single_expression"],
  syntax: "{ordinal} {number} {identifier} (of|in|from) {list:expression}",
  testRule: "…(of|in|from)",
  compile(match, scope) {
    const { ordinal, number, list, identifier } = match.results;
    return `spell.slice(${list}, ${ordinal}, ${number})`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        ["top 2 items of my-list", "spell.slice(my_list, 1, 2)"],
        ["first 2 words in 'some other words'", "spell.slice('some other words', 1, 2)"],
        ["last two cards from deck", "spell.slice(deck, -1, 2)"]
      ]
    }
  ]
});

// Range expression starting at some item in the list.
// Returns a new list.
// If item is not found, returns an empty list. (???)
parser.defineRule({
  name: "range_expression_starting_with",
  alias: ["expression", "single_expression"],
  syntax: "{identifier} (in|of) {list:expression} starting with {thing:expression}",
  testRule: "…(starting with)",
  compile(match, scope) {
    const { thing, list, identifier } = match.results;
    return `spell.getRange(${list}, spell.positionOf(${thing}, ${list}))`;
  },
  tests: [
    {
      compileAs: "expression",
      tests: [
        [
          "items in my-list starting with it",
          "spell.getRange(my_list, spell.positionOf(it, my_list))"
        ],
        [
          "words in 'some words' starting with 'some'",
          "spell.getRange('some words', spell.positionOf('some', 'some words'))"
        ]
      ]
    }
  ]
});

// List filter.
// NOTE: we will singularize `identifier` and use that as the argument to `expression`.
parser.defineRule({
  name: "list_filter",
  alias: ["expression", "single_expression"],
  syntax: "{identifier} (in|of) {list:expression} where {condition:expression}",
  testRule: "…where",
  precedence: 2,
  compile(match, scope) {
    const { identifier, condition, list } = match.results;
    // use singular of identifier for method argument
    const argument = singularize(identifier);
    return `spell.filter(${list}, ${argument} => ${condition})`;
  },
  tests: [
    {
      compileAs: "expression",
      showAll: true,
      tests: [
        [
          "words in 'a word list' where word starts with 'a'",
          "spell.filter('a word list', word => spell.startsWith(word, 'a'))"
        ],
        [
          "items in my-list where the id of the item > 1",
          "spell.filter(my_list, item => (item?.id > 1))"
        ]
      ]
    }
  ]
});

// Set membership (left recursive).
// NOTE: we will singularize `identifier` and use that as the argument to `expression`.
// TODO: this is a postfix_operator expression
parser.defineRule({
  name: "list_membership_test",
  alias: ["expression"],
  syntax:
    "{list:single_expression} (operator:has|has no|doesnt have|does not have) {identifier} where {filter:expression}",
  testRule: "…(has|have)",
  precedence: 2,
  compile(match, scope) {
    const { identifier, operator, filter, list } = match.results;
    const bang = operator === "has" ? "" : "!";
    // use singular of identifier for method argument
    const argument = singularize(identifier);
    return `${bang}spell.any(${list}, ${argument} => ${filter})`;
  },
  tests: [
    {
      compileAs: "expression",
      showAll: true,
      tests: [
        [
          "my-list has items where item is 1",
          "spell.any(my_list, item => (item == 1))"
        ],
        [
          "my-list has no items where item is 1",
          "!spell.any(my_list, item => (item == 1))"
        ],
        [
          "my-list doesnt have items where item is 1",
          "!spell.any(my_list, item => (item == 1))"
        ],
        [
          "the foo of the bar does not have items where item is 1",
          "!spell.any(bar?.foo, item => (item == 1))"
        ]
      ]
    }
  ]
});

//
//  Adding to list (in-place)
//

// Aliases for front/back/etc
parser.defineRule({
  name: "list_front_or_back",
  syntax: "the (start|front|top|end|back|bottom) of",
  compile(match, scope) {
    const where = match.matched[1].value;
    if (where === "start" || where == "front" || where === "top") return "prepend";
    return "append";
  }
});

// Add to list.
parser.defineRule({
  name: "list_add",
  alias: "statement",
  syntax: "add {thing:expression} to {method:list_front_or_back}? {list:expression}",
  testRule: "add",
  compile(match, scope) {
    const { thing, list, method = "append"} = match.results;
    return `spell.${method}(${list}, ${thing})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["add thing to the start of my-list", "spell.prepend(my_list, thing)"],
        ["add thing to the front of my-list", "spell.prepend(my_list, thing)"],
        ["add thing to the top of my-list", "spell.prepend(my_list, thing)"],

        ["add thing to the end of my-list", "spell.append(my_list, thing)"],
        ["add thing to the back of my-list", "spell.append(my_list, thing)"],
        ["add thing to the bottom of my-list", "spell.append(my_list, thing)"]
      ]
    }
  ]
});

// Prepend.
parser.defineRule({
  name: "list_prepend",
  alias: "statement",
  syntax: "prepend {thing:expression} to {list:expression}",
  testRule: "prepend",
  compile(match, scope) {
    const { thing, list } = match.results;
    return `spell.prepend(${list}, ${thing})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["prepend thing to my-list", "spell.prepend(my_list, thing)"],
      ]
    }
  ]
});

// Append.
parser.defineRule({
  name: "list_append",
  alias: "statement",
  syntax: "append {thing:expression} to {list:expression}",
  testRule: "append",
  compile(match, scope) {
    const { thing, list } = match.results;
    return `spell.append(${list}, ${thing})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["append thing to my-list", "spell.append(my_list, thing)"],
      ]
    }
  ]
});

//
// Add to middle of list, pushing existing items out of the way.
//

// TODO: Add to middle of list, pushing existing items out of the way.
//       "add {thing:expression} to position {position:expression} of {list:expression}",

// Add to list before/after something else
// TODO: `relative_position_expression` rule?
parser.defineRule({
  name: "list_add_relative",
  alias: "statement",
  syntax: "add {thing:expression} to {list:expression} (operator:before|after) {item:expression}",
  testRule: "add",
  compile(match, scope) {
    const { thing, item, list, operator } = match.results;
    const position =
      operator === "before"
        ? `spell.positionOf(${list}, ${item})`
        : `spell.positionOf(${list}, ${item}) + 1`;
    return `spell.splice(${list}, ${position}, ${thing})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        [
          "add thing to my-list before other-thing",
          "spell.splice(my_list, spell.positionOf(my_list, other_thing), thing)"
        ],
        [
          "add thing to my-list after other-thing",
          "spell.splice(my_list, spell.positionOf(my_list, other_thing) + 1, thing)"
        ]
      ]
    }
  ]
});

//
//  Removing from list (in-place)
//

// Empty list.
//TODO: make `empty` and/or `clear` a generic statement???
parser.defineRule({
  name: "list_empty",
  alias: "statement",
  syntax: "(empty|clear) {list:expression}",
  testRule: "(empty|clear)",
  compile(match, scope) {
    const { list } = match.results;
    return `spell.clear(${list})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["empty my-list", "spell.clear(my_list)"],
        ["clear the cards of deck", "spell.clear(deck?.cards)"]
      ]
    }
  ]
});

// Remove one item from list by position specified as an ordinal
parser.defineRule({
  name: "list_remove_ordinal",
  alias: "statement",
  syntax: "remove {ordinal} {identifier} of {list:expression}",
  testRule: "remove",
  compile(match, scope) {
    const { ordinal, list } = match.results;
    return `spell.removeItem(${list}, ${ordinal})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["remove second card of deck", "spell.removeItem(deck, 2)"],
      ]
    }
  ]
});

// Remove one item from list by position.
parser.defineRule({
  name: "list_remove_position",
  alias: "statement",
  syntax: "remove {identifier} {number:expression} of {list:expression}",
  testRule: "remove",
  compile(match, scope) {
    const { number, list, identifier } = match.results;
    return `spell.removeItem(${list}, ${number})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["remove item 4 of my-list", "spell.removeItem(my_list, 4)"]
      ]
    }
  ]
});



// Remove range of things from list.
// NOTE: `start` is **1-based**.
// NOTE: `end` is inclusive!
parser.defineRule({
  name: "list_remove_range",
  alias: "statement",
  syntax: "remove {identifier} {start:expression} to {end:expression} of {list:expression}",
  testRule: "remove",
  compile(match, scope) {
    const { start, end, list, identifier } = match.results;
    return `spell.removeRange(${list}, ${start}, ${end})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["remove items 2 to 4 of my-list", "spell.removeRange(my_list, 2, 4)"]
      ]
    }
  ]
});

parser.defineRule({
  name: "list_remove_range_ordinal",
  alias: "statement",
  syntax: "remove {start:ordinal} to {end:ordinal} {identifier} of {list:expression}",
  testRule: "remove",
  compile(match, scope) {
    const { start, end, list, identifier } = match.results;
    return `spell.removeRange(${list}, ${start}, ${end})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["remove first to third cards of deck", "spell.removeRange(deck, 1, 3)"],
      ]
    }
  ]
});

// Remove all instances of something from a list.
parser.defineRule({
  name: "list_remove",
  alias: "statement",
  syntax: "remove {thing:expression} from {list:expression}",
  testRule: "remove",
  compile(match, scope) {
    const { thing, list } = match.results;
    return `spell.remove(${list}, ${thing})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [["remove thing from my-list", "spell.remove(my_list, thing)"]]
    }
  ]
});

// Remove all items from list where condition is true.
// NOTE: we will singularize `identifier` and use that as the argument to `expression`.
parser.defineRule({
  name: "list_remove_where",
  alias: "statement",
  syntax: "remove {identifier} (in|of|from) {list:expression} where {condition:expression}",
  testRule: "remove",
  compile(match, scope) {
    const { identifier, condition, list } = match.results;
    // use singular of identifier for method argument
    const argument = singularize(identifier);
    return `spell.removeWhere(${list}, ${argument} => ${condition})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        [
          "remove items from list where item is not 'ace'",
          "spell.removeWhere(list, item => (item != 'ace'))"
        ],
        [
          "remove cards in deck where the suit of the card is ace",
          "spell.removeWhere(deck, card => (card?.suit == ace))"
        ]
      ]
    }
  ]
});

//
//  Random (in-place) list manipulation.
//

// Reverse list in-place.
parser.defineRule({
  name: "list_reverse",
  alias: "statement",
  syntax: "reverse {list:expression}",
  testRule: "reverse",
  compile(match, scope) {
    const { list } = match.results;
    return `spell.reverse(${list})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [["reverse my-list", "spell.reverse(my_list)"]]
    }
  ]
});

// Shuffle list in-place.
parser.defineRule({
  name: "list_shuffle",
  alias: "statement",
  syntax: "(randomize|shuffle) ({identifier} (in|of))? {list:expression}",
  testRule: "(randomize|shuffle)",
  compile(match, scope) {
    const { list } = match.results;
    return `spell.shuffle(${list})`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["randomize my-list", "spell.shuffle(my_list)"],
        ["shuffle cards of deck", "spell.shuffle(deck)"]
      ]
    }
  ]
});

// Iteration
// TODO: can work for object enumeration as well (maybe with 'of'?)
// TODO: return values e.g. array.map() ???
parser.defineRule({
  name: "list_iteration",
  alias: "statement",
  syntax: "for each? {item:identifier} (?:(and|,) {position:identifier})? in {list:expression} :? {statement}?",
  testRule: "for",
  constructor: SpellParser.BlockStatement,
  compile(match, scope) {
    const { item, position, list, statements } = match.results;
    const itemVar = singularize(item);
    if (!position) {
      return `for (const ${itemVar} of ${list}) ${statements}`;
    }
    const positionVar = singularize(position);
    // NOTE: `spell.entries()` must return **1-based** indexes ???
    return `for (const [${positionVar}, ${itemVar}] of spell.entries(${list}) ${statements}`;
  },
  tests: [
    {
      compileAs: "statements",
      tests: [
        ["for each card in deck:", "for (const card of deck) {}"],
        ["for item, index in my-list:", "for (const [index, item] of spell.entries(my_list) {}"],

        [
          "for each card in deck: set the direction of the card to 'down'",
          "for (const card of deck) { card?.direction = 'down' }"
        ],
        [
          "for message, index in messages: add message + index to messages",
          "for (const [index, message] of spell.entries(messages) {\n\tspell.append(messages, (message + index))\n}"
        ],

        [
          "for each card in deck:\n\tset the direction of the card to 'down'",
          "for (const card of deck) {\n\tcard?.direction = 'down'\n}"
        ],
        [
          "for message and index in messages:\n\tif index is greater than 2 add message to messages",
          "for (const [index, message] of spell.entries(messages) {\n\tif (index > 2) { spell.append(messages, message) }\n}"
        ]
      ]
    }
  ]
});
