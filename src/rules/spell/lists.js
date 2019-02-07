//
//	# Rules for dealing with lists
//

// TODO: confirm identifiers are plural in some of the below?
// TODO: `list.clone()` to return new list of same type.

import Parser from "../../Parser";
import Rule from "../../Rule";

import { isPlural, singularize } from "../../utils/string";

// Create "lists" parser context.
const parser = Parser.forName("lists");
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
  // Return the length of the list.
  //TESTME
  {
    name: "list_length",
    alias: "expression",
    syntax: "the? number of {identifier} in {list:expression}",
    constructor: class list_length extends Rule.Sequence {
      toSource(context) {
        let { list, identifier } = this.getMatchedSource(context);
  // TODO: special case 'words', 'lines', etc
        return `${list}.length`;
      }
    }
  },

  // Return the first position of specified item in the list as an array.
  // If item is not found, returns `undefined`.
  // NOTE: this position returned is **1-based**.
  //TESTME
  // TODO: `positions`, `last position`, `after...`
  {
    name: "list_position",
    alias: "expression",
    syntax: "the? position of {thing:expression} in {list:expression}",
    constructor: class list_position extends Rule.Sequence {
      toSource(context) {
        let { thing, list } = this.getMatchedSource(context);
        return `spell.positionOf(${thing}, ${list})`
      }
    }
  },

  //
  //	Ordinal numbers (first, second, last, etc).
  // TODO: sixty-fifth, two hundred forty ninth...
  //
  {
    name: "ordinal",
    syntax: "first",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return 1 }
    }
  },

  {
    name: "ordinal",
    syntax: "second",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return 2 }
    }
  },

  {
    name: "ordinal",
    syntax: "third",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return 3 }
    }
  },

  {
    name: "ordinal",
    syntax: "fourth",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return 4 }
    }
  },

  {
    name: "ordinal",
    syntax: "fifth",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return 5 }
    }
  },

  {
    name: "ordinal",
    syntax: "sixth",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return 6 }
    }
  },

  {
    name: "ordinal",
    syntax: "seventh",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return 7 }
    }
  },

  {
    name: "ordinal",
    syntax: "eighth",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return 8 }
    }
  },

  {
    name: "ordinal",
    syntax: "ninth",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return 9 }
    }
  },

  {
    name: "ordinal",
    syntax: "tenth",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return 10 }
    }
  },

  {
    name: "ordinal",
    syntax: "penultimate",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return -2 }
    }
  },

  {
    name: "ordinal",
    syntax: "final",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return -1 }
    }
  },

  {
    name: "ordinal",
    syntax: "last",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return -1 }
    }
  },



  // treat list as a stack or queue
  //TESTME
  {
    name: "ordinal",
    syntax: "top",
    constructor: class ordinal extends Rule.Keyword{
      toSource() { return 1 }
    }
  },

  {
    name: "ordinal",
    syntax: "bottom",
    constructor: class ordinal extends Rule.Keyword{
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
  //
  // TODO: if `identifier` is "word", output `getWord()` etc
  // TODO: special case 'words', 'lines', etc ?
  {
    name: "position_expression",
    alias: "expression",
    syntax: [
      "{identifier} {position:expression} of (the?) {expression}",
      "the {position:ordinal} {identifier} of (the?) {expression}"
    ],
    constructor: class position_expression extends Rule.Sequence{
      toSource(context) {
        let { identifier, position, expression } = this.getMatchedSource(context);
        // If we got a positive number literal, compensate for JS 0-based arrays now, for nicer output.
        if (typeof position === "number" && position > 0) {
          return `${expression}[${position - 1}]`;
        }
        return `spell.getItem(${expression}, ${position})`;
      }
    }
  },


  // Pick a SINGLE random item from the list.
  // TODO: confirm identifier is plural?
  //TESTME
  {
    name: "random_position_expression",
    alias: "expression",
    syntax: "a random {identifier} (of|from|in) (the)? {list:expression}",
    constructor: class random_position_expression extends Rule.Sequence {
      toSource(context) {
        let { list } = this.getMatchedSource(context);
        return `spell.getRandomItemOf(${list})`;
      }
    }
  },

  // Pick a unique set of random items from the list, returning an array.
  // TODO: `two random items...`
  // TODO: confirm identifier is plural?
  // TODO: `list.clone()` to return new list of same type.
  //TESTME
  {
    name: "random_positions_expression",
    alias: "expression",
    syntax: "{number} random {identifier} (of|from|in) (the)? {list:expression}",
    constructor: class random_positions_expression extends Rule.Sequence {
      toSource(context) {
        let { number, list } = this.getMatchedSource(context);
        return `spell.getRandomItemsOf(${list}, ${number})`;
      }
    }
  },


  // Range expression.
  // Returns a new list.
  // NOTE: `start` is **1-based**.
  // NOTE: `end` is inclusive!
  // TODO: confirm identifier is plural?
  // TODO: `list.clone()` to return new list of same type.
  //TESTME
  {
    name: "range_expression",
    alias: "expression",
    syntax: "{identifier} {start:expression} to {end:expression} of {list:expression}",
    constructor: class range_expression extends Rule.Sequence {
      toSource(context) {
        let { start, end, list } = this.getMatchedSource(context);
        return `spell.getRange(${list}, ${start}, ${end})`;
      }
    }
  },

  // Starting range expression.
  // Returns a new list.
  // e.g.	`first 4 items of list`
  //TESTME
  {
    name: "first_in_range",
    alias: "expression",
    syntax: "first {number:expression} {identifier} (in|of) {list:expression}",
    constructor: class range_expression extends Rule.Sequence {
      toSource(context) {
        let { number, list } = this.getMatchedSource(context);
        return `spell.getRange(${list}, 1, ${number})`;
      }
    }
  },

  // Ending range expression.
  // Returns a new list.
  // e.g.	`last 4 items of list`
  //TESTME
  {
    name: "last_in_range",
    alias: "expression",
    syntax: "last {number:expression} {identifier} (in|of) {list:expression}",
    constructor: class range_expression extends Rule.Sequence {
      toSource(context) {
        let { number, list } = this.getMatchedSource(context);
        return `spell.getEndRange(${list}, 1, ${number})`;
      }
    }
  },


  // Range expression starting at some item in the list.
  // Returns a new list.
  // If item is not found, returns an empty list. (???)
  //TESTME
  {
    name: "range_expression",
    alias: "expression",
    syntax: "{identifier} (in|of) {list:expression} starting with {thing:expression}",
    constructor: class range_expression extends Rule.Sequence {
      toSource(context) {
        let { thing, list } = this.getMatchedSource(context);
        return `spell.getRange(${list}, spell.positionOf(${thing}, ${list}))`;
      }
    }
  },


  // List filter.
  // NOTE: we will singularize `identifier` and use that as the argument to `expression`.
  //TESTME
  {
    name: "list_filter",
    alias: "expression",
    syntax: "{identifier} (in|of) {list:expression} where {condition:expression}",
    constructor: class list_filter extends Rule.Sequence {
      toSource(context) {
        let { identifier, condition, list } = this.getMatchedSource(context);
        // use singular of identifier for method argument
        let argument = singularize(identifier.toSource(context));
        return `spell.filter(${list}, ${argument} => ${condition})`;
      }
    }
  },


  // Set membership (left recursive).
  // NOTE: we will singularize `identifier` and use that as the argument to `expression`.
  //TESTME
  {
    name: "list_membership_test",
    alias: "expression",
    syntax: "{list:expression} (operator:has|has no|doesnt have|does not have) {identifier} where {filter:expression}",
    leftRecursive: true,
    testRule: new Rule.Keyword({ match: "where" }),
    constructor: class list_membership_test extends Rule.Sequence {
      toSource(context) {
        let { identifier, operator, filter, list } = this.getMatchedSource(context);
        let bang = operator === "has" ? "" : "!";
        // use singular of identifier for method argument
        let argument = singularize(identifier.toSource(context));
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
      toSource(context) {
        let { thing, list } = this.getMatchedSource(context);
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
      toSource(context) {
        let { thing, list } = this.getMatchedSource(context);
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
      toSource(context) {
        let { thing, position, list } = this.getMatchedSource(context);
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
      toSource(context) {
        let { thing, item, list } = this.getMatchedSource(context);
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
      toSource(context) {
        let { list } = this.getMatchedSource(context);
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
      toSource(context) {
        let { number, list } = this.getMatchedSource(context);
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
      toSource(context) {
        let { start, end, list } = this.getMatchedSource(context);
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
      toSource(context) {
        let { thing, list } = this.getMatchedSource(context);
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
      toSource(context) {
        let { identifier, condition, list } = this.getMatchedSource(context);
        // use singular of identifier for method argument
        let argument = singularize(identifier.toSource(context));
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
      toSource(context) {
        let { list } = this.getMatchedSource(context);
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
      toSource(context) {
        let { list } = this.getMatchedSource(context);
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
      toSource(context) {
        let { itemVar, positionVar, list, statement, block } = this.getMatchedSource(context);
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
      toSource(context) {
        let { start, end } = this.getMatchedSource(context);
        return `spell.getRange(${start}, ${end})`;
      }
    }
  }
);
