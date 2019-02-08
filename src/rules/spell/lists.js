//
//	# Rules for dealing with lists
//

// TODO: confirm identifiers are plural in some of the below?
// TODO: `list.clone()` to return new list of same type.

import Parser from "../../Parser";
import Rule from "../../Rule";

import { isPlural, singularize } from "../../utils/string";

// Create "lists" parser.
const parser = Parser.forModule("lists");
export default parser;


// WORKING FROM OTHER RULES (testme)
//	`the length of <list>`
//	`<thing> is not? in <list>`
//	`<list> is not? empty`
//	`set item 1 of myList to 'a'`


// TODO: 	`create list with <exp>, <exp>, <exp>`
// TODO:	`duplicate list`
// TODO:	`duplicate list with <exp>, <exp>, <exp>` ???
// TODO:	`the size of <list>` => will map to `list.size`...
//				- install `size` as an alias to `length`?
// TODO:	`move <thing> to end of <list>` ???
// TODO:	`Set` for a unique list?
// TODO:	typed list?
// TODO:	list which won't take null/undefined


parser.defineRules(
  // Return the length of a list.
  {
    name: "list_length",
    alias: "expression",
    syntax: "the? number of {identifier} in {list:expression}",
    constructor: class list_length extends Rule.Sequence {
      toSource() {
        let { list, identifier } = this.results;
  // TODO: special case 'words', 'lines', etc
        return `spell.lengthOf(${list})`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [
          ["number of items in myList", "spell.lengthOf(myList)"],
          ["the number of foos in the foo of the bar", "spell.lengthOf(bar.foo)"],
          ["the number of items in [1,2,3]", "spell.lengthOf([1, 2, 3])"],
        ]
      },
    ]

  },

  // Return the first position of specified item in the list as an array.
  // If item is not found, returns `undefined`.
  // NOTE: this position returned is **1-based**.
  // TODO: `positions`, `last position`, `after...`
  {
    name: "list_position",
    alias: "expression",
    syntax: "the? position of {thing:expression} in {list:expression}",
    constructor: class list_position extends Rule.Sequence {
      toSource() {
        let { thing, list } = this.results;
        return `spell.positionOf(${thing}, ${list})`
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [
          ["position of thing in myList", "spell.positionOf(thing, myList)"],
          ["the position of thing in the foo of the bar", "spell.positionOf(thing, bar.foo)"],
          ["the position of 'a' in ['a', 'b', 'c']", "spell.positionOf('a', ['a', 'b', 'c'])"],
        ]
      },
    ]

  },

  //
  //	Ordinal numbers (first, second, last, etc).
  // TODO: sixty-fifth, two hundred forty ninth... with custom parser?
  //
  {
    name: "ordinal",
    constructor: class ordinal extends Rule.Alternatives {},
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
          ["bottom", -1],
        ]
      },
    ]
  },

  {
    name: "ordinal",
    syntax: "first",
    constructor: class ordinal_first extends Rule.Keywords{
      toSource() { return 1 }
    }
  },

  {
    name: "ordinal",
    syntax: "second",
    constructor: class ordinal_second extends Rule.Keywords{
      toSource() { return 2 }
    }
  },

  {
    name: "ordinal",
    syntax: "third",
    constructor: class ordinal_third extends Rule.Keywords{
      toSource() { return 3 }
    }
  },

  {
    name: "ordinal",
    syntax: "fourth",
    constructor: class ordinal_fourth extends Rule.Keywords{
      toSource() { return 4 }
    }
  },

  {
    name: "ordinal",
    syntax: "fifth",
    constructor: class ordinal_fifth extends Rule.Keywords{
      toSource() { return 5 }
    }
  },

  {
    name: "ordinal",
    syntax: "sixth",
    constructor: class ordinal_sixth extends Rule.Keywords{
      toSource() { return 6 }
    }
  },

  {
    name: "ordinal",
    syntax: "seventh",
    constructor: class ordinal_seventh extends Rule.Keywords{
      toSource() { return 7 }
    }
  },

  {
    name: "ordinal",
    syntax: "eighth",
    constructor: class ordinal_eighth extends Rule.Keywords{
      toSource() { return 8 }
    }
  },

  {
    name: "ordinal",
    syntax: "ninth",
    constructor: class ordinal_ninth extends Rule.Keywords{
      toSource() { return 9 }
    }
  },

  {
    name: "ordinal",
    syntax: "tenth",
    constructor: class ordinal_tenth extends Rule.Keywords{
      toSource() { return 10 }
    }
  },

  {
    name: "ordinal",
    syntax: "penultimate",
    constructor: class ordinal_penultimate extends Rule.Keywords{
      toSource() { return -2 }
    }
  },

  {
    name: "ordinal",
    syntax: "final",
    constructor: class ordinal_final extends Rule.Keywords{
      toSource() { return -1 }
    }
  },

  {
    name: "ordinal",
    syntax: "last",
    constructor: class ordinal_last extends Rule.Keywords{
      toSource() { return -1 }
    }
  },



  // treat list as a stack or queue
  //TESTME
  {
    name: "ordinal",
    syntax: "top",
    constructor: class ordinal_top extends Rule.Keywords{
      toSource() { return 1 }
    }
  },

  {
    name: "ordinal",
    syntax: "bottom",
    constructor: class ordinal_bottom extends Rule.Keywords{
      toSource() { return -1 }
    }
  },



  // Index expression: numeric position in some list.
  //	e.g.	`card 1 of the pile`
  //			`card #2 of the pile`
  //			`the first card of the pile`
  //
  // NOTE: Negative numeric positions come from the END of the list.
  //	e.g.	`card -1 of the pile`
  //
  // NOTE: Our positions are **1-based** and Javascript is **0-based**.
  //		 e.g. `item 1 of the array`  = `array[0]`
  {
    name: "position_expression",
    alias: "expression",
    syntax: [
      "{identifier} {position:expression} of {expression}",
      "the {position:ordinal} {identifier} (in|of) {expression}"
    ],
    constructor: class position_expression extends Rule.Sequence{
      toSource() {
        let { identifier, position, ordinal, expression } = this.results;
        return `spell.getItem(${expression}, ${position}, '${identifier}')`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [
          ["item 1 of my-list", "spell.getItem(my_list, 1, 'item')"],
          ["card 10 of deck", "spell.getItem(deck, 10, 'card')"],
          ["foo n of the foos of the bar", "spell.getItem(bar.foos, n, 'foo')"],

          ["the first item of my-list", "spell.getItem(my_list, 1, 'item')"],
          ["the tenth card of deck", "spell.getItem(deck, 10, 'card')"],
          ["the penultimate word in words", "spell.getItem(words, -2, 'word')"],
        ]
      },
    ]

  },


  // Pick a SINGLE random item from the list.
  // TODO: confirm identifier is plural?
  {
    name: "random_position_expression",
    alias: "expression",
    syntax: "a random {identifier} (of|from|in) {list:expression}",
    constructor: class random_position_expression extends Rule.Sequence {
      toSource() {
        let { list, identifier } = this.results;
        return `spell.getRandomItemOf(${list}, '${identifier}')`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [
          ["a random item of my-list", "spell.getRandomItemOf(my_list, 'item')"],
          ["a random word in 'some words'", "spell.getRandomItemOf('some words', 'word')"],
          ["a random card from deck", "spell.getRandomItemOf(deck, 'card')"],
        ]
      },
    ]

  },

  // Pick a unique set of random items from the list, returning an array.
  // TODO: `two random items...`
  // TODO: confirm identifier is plural?
  // TODO: `list.clone()` to return new list of same type.
  //TESTME
  {
    name: "random_positions_expression",
    alias: "expression",
    syntax: "{number} random {identifier} (of|from|in) {list:expression}",
    constructor: class random_positions_expression extends Rule.Sequence {
      toSource() {
        let { number, list, identifier } = this.results;
        return `spell.getRandomItemsOf(${list}, ${number}, '${identifier}')`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [
          ["2 random items of my-list", "spell.getRandomItemsOf(my_list, 2, 'items')"],
          ["2 random words in 'some other words'", "spell.getRandomItemsOf('some other words', 2, 'words')"],
          ["3 random cards from deck", "spell.getRandomItemsOf(deck, 3, 'cards')"],
        ]
      },
    ]
  },


  // Range expression.
  // Returns a new list.
  // NOTE: `start` is **1-based**.
  // NOTE: `end` is inclusive!
  {
    name: "range_expression",
    alias: "expression",
    syntax: "{identifier} {start:expression} to {end:expression} (of|in|from) {list:expression}",
    constructor: class range_expression extends Rule.Sequence {
      toSource() {
        let { list, start, end, identifier } = this.results;
        return `spell.getRange(${list}, ${start}, ${end}, '${identifier}')`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [
          ["item 1 to 2 of my-list", "spell.getRange(my_list, 1, 2, 'item')"],
          ["word 2 to 3 in 'some other words'", "spell.getRange('some other words', 2, 3, 'word')"],
          ["card 1 to 3 from deck", "spell.getRange(deck, 1, 3, 'card')"],
        ]
      },
    ]
  },

  // Alternative form of range expression.
  // Returns a new list.
  {
    name: "ordinal_range_expression",
    alias: "expression",
    syntax: "{ordinal} {number} {identifier} (of|in|from) {list:expression}",
    constructor: class ordinal_range_expression extends Rule.Sequence {
      toSource() {
        let { ordinal, number, list, identifier } = this.results;
        return `spell.slice(${list}, ${ordinal}, ${number}, '${identifier}')`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [
          ["top 2 items of my-list", "spell.slice(my_list, 1, 2, 'items')"],
          ["first 2 words in 'some other words'", "spell.slice('some other words', 1, 2, 'words')"],
          ["last two cards from deck", "spell.slice(deck, -1, 2, 'cards')"],
        ]
      },
    ]
  },

  // Range expression starting at some item in the list.
  // Returns a new list.
  // If item is not found, returns an empty list. (???)
  //TESTME
  {
    name: "range_expression_starting_with",
    alias: "expression",
    syntax: "{identifier} (in|of) {list:expression} starting with {thing:expression}",
    constructor: class range_expression_starting_with extends Rule.Sequence {
      toSource() {
        let { thing, list, identifier } = this.results;
        return `spell.getRange(${list}, spell.positionOf(${thing}, ${list}), undefined, '${identifier}')`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        tests: [
          ["items in my-list starting with it",
           "spell.getRange(my_list, spell.positionOf(it, my_list), undefined, 'items')"],
          ["words in 'some words' starting with 'some'",
           "spell.getRange('some words', spell.positionOf('some', 'some words'), undefined, 'words')"],
        ]
      },
    ]

  },


  // List filter.
  // NOTE: we will singularize `identifier` and use that as the argument to `expression`.
  //TESTME
  {
    name: "list_filter",
    alias: "expression",
    syntax: "{identifier} (in|of) {list:expression} where {condition:expression}",
    constructor: class list_filter extends Rule.Sequence {
      toSource() {
        let { identifier, condition, list } = this.results;
        // use singular of identifier for method argument
        let argument = singularize(identifier);
        return `spell.filter(${list}, ${argument} => ${condition}, '${identifier}')`;
      }
    },
    tests: [
      {
        compileAs: "expression",
        showAll: true,
        tests: [
          ["items in my-list where the id of the item > 1", "spell.filter(my_list, item => item.id > 1, 'items')"],
          ["", ""],
          ["", ""],
          ["", ""],
        ]
      },
    ]

  },


  // Set membership (left recursive).
  // NOTE: we will singularize `identifier` and use that as the argument to `expression`.
  //TESTME
  {
    name: "list_membership_test",
    alias: "expression",
    syntax: "{list:expression} (operator:has|has no|doesnt have|does not have) {identifier} where {filter:expression}",
    leftRecursive: true,
    testRule: new Rule.Keywords({ match: "where" }),
    constructor: class list_membership_test extends Rule.Sequence {
      toSource() {
        let { identifier, operator, filter, list } = this.results;
        let bang = operator === "has" ? "" : "!";
        // use singular of identifier for method argument
        let argument = singularize(identifier.toSource());
        return `${bang}spell.any(${list}, ${argument} => ${filter})`;
      }
    }
  },

  //
  //	Adding to list (in-place)
  //

  // Add to end of list.
  //TESTME
  {
    name: "list_append",
    alias: "statement",
    syntax: [
      "append {thing:expression} to {list:expression}",
      "add {thing:expression} to ((the?) end of)? {list:expression}"
    ],
    constructor: class list_append extends Rule.Sequence {
      toSource() {
        let { thing, list } = this.results;
        return `spell.append(${list}, ${thing})`;
      }
    }
  },

  // Add to beginning of list.
  //TESTME
  {
    name: "list_prepend",
    alias: "statement",
    syntax: [
      "prepend {thing:expression} to {list:expression}",
      "add {thing:expression} to the (start|front|top) of {list:expression}"
    ],
    constructor: class list_prepend extends Rule.Sequence {
      toSource() {
        let { thing, list } = this.results;
        return `spell.prepend(${list}, ${thing})`;
      }
    }
  },

  // Add to middle of list, pushing existing items out of the way.
  //TESTME
  {
    name: "list_add_at",
    alias: "statement",
    syntax: "add {thing:expression} to {list:expression} at position {position:expression}",
    constructor: class list_splice extends Rule.Sequence {
      toSource() {
        let { thing, position, list } = this.results;
        return `spell.splice(${list}, ${position}, ${thing})`;
      }
    }
  },


  // TODO:  	"add {thing:expression} to {list:expression} before {item:expression}",

  // Add to middle of list, pushing existing items out of the way.
  //TESTME
  {
    name: "list_add_after",
    alias: "statement",
    syntax: "add {thing:expression} to {list:expression} after {item:expression}",
    constructor: class list_add_after extends Rule.Sequence {
      toSource() {
        let { thing, item, list } = this.results;
        return `spell.splice(${list}, spell.positionOf(${list}, ${item}), ${thing})`;
      }
    }
  },

  //
  //	Removing from list (in-place)
  //

  // Empty list.
  //TODO: make `empty` and/or `clear` a generic statement???
  //TESTME
  {
    name: "list_empty",
    alias: "statement",
    syntax: "(empty|clear) {list:expression}",
    constructor: class list_empty extends Rule.Sequence {
      toSource() {
        let { list } = this.results;
        return `spell.clear(${list})`;
      }
    }
  },

  // Remove one item from list by position.
  //TESTME
  {
    name: "list_remove_position",
    alias: "statement",
    syntax: "remove {identifier} {number:expression} of {list:expression}",
    constructor: class list_remove_position extends Rule.Sequence {
      toSource() {
        let { number, list } = this.results;
        return `spell.removeItem(${list}, ${number})`;
      }
    }
  },

  // Remove range of things from list.
  // NOTE: `start` is **1-based**.
  // NOTE: `end` is inclusive!
  //TESTME
  {
    name: "list_remove_range",
    alias: "statement",
    syntax: "remove {identifier} {start:expression} to {end:expression} of {list:expression}",
    constructor: class list_remove_position extends Rule.Sequence {
      toSource() {
        let { start, end, list } = this.results;
        return `spell.removeRange(${list}, ${start}, ${end})`;
      }
    }
  },


  // Remove all instances of something from a list.
  //TESTME
  {
    name: "list_remove",
    alias: "statement",
    syntax: "remove {thing:expression} from {list:expression}",
    constructor: class list_remove extends Rule.Sequence {
      toSource() {
        let { thing, list } = this.results;
        return `spell.remove(${list}, ${thing})`;
      }
    }
  },

  // Remove all items from list where condition is true.
  // NOTE: we will singularize `identifier` and use that as the argument to `expression`.
  //TESTME
  {
    name: "list_remove_where",
    alias: "statement",
    syntax: "remove {identifier} (in|of|from) {list:expression} where {condition:expression}",
    constructor: class list_remove_where extends Rule.Sequence {
      toSource() {
        let { identifier, condition, list } = this.results;
        // use singular of identifier for method argument
        let argument = singularize(identifier.toSource());
        return `spell.removeWhere(${list}, ${argument} => ${condition})`;
      }
    }
  },


  //
  //	Random (in-place) list manipulation.
  //

  // Reverse list in-place.
  //TESTME
  {
    name: "list_reverse",
    alias: "statement",
    syntax: "reverse {list:expression}",
    constructor: class list_reverse extends Rule.Sequence {
      toSource() {
        let { list } = this.results;
        return `spell.reverse(${list})`;
      }
    }
  },

  // Shuffle list in-place.
  //TESTME
  {
    name: "list_shuffle",
    alias: "statement",
    syntax: "(randomize|shuffle) {list:expression}",
    constructor: class list_shuffle extends Rule.Sequence {
      toSource() {
        let { list } = this.results;
        return `spell.shuffle(${list})`;
      }
    }
  },


  // Iteration
  //TESTME
  {
    name: "list_iteration",
    alias: "statement",
    syntax: [
      "for (each)? {itemVar:identifier} in {list:expression}:? {statement}?",
      "for (each)? {itemVar:identifier} (and|,) {positionVar:identifier} in {list:expression}:? {statement}?",
    ],
    constructor: class list_iteration extends Rule.BlockStatement {
      toSource() {
        let { itemVar, positionVar, list, statement, block } = this.results;
        let output;
        if (positionVar) {
          output = `for (let ${positionVar} = 1, bar; ${itemVar} = ${list}[${positionVar}-1], ${positionVar} <= ${list}.length; ${positionVar}++) `
        }
        else {
          // NOTE: this is relatively slow...  probably doesn't matter...
          output = `for (let ${itemVar} of ${list}) `;
        }
        output += Rule.Block.encloseStatements(statement, block);
        return output;
      }
    }
  },


  // Range
  //TESTME
  {
    name: "range_expression",
    alias: "expression",
    syntax: "range {start:expression} to {end:expression}",
    constructor: class range_expression extends Rule.Sequence {
      toSource() {
        let { start, end } = this.results;
        return `spell.getRange(${start}, ${end})`;
      }
    }
  }
);
