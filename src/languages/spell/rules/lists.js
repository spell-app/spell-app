//
//  # Rules for dealing with lists
//  TODO: sort
//

import { Scope, Spell, singularize } from "../all"

export default new Spell.Parser({
  module: "lists",
  rules: [
    // List of identifiers and/or numbers, e.g. "clubs or hearts", "jack, queen, king"
    // Note that this is not a generic "expression" -- it's too generic.
    {
      name: "identifier_list",
      syntax: "[({known_variable}|{constant}|{number})(,|or|and|nor)]",
      datatype: "array", // TODO: array of what?
      tests: [
        {
          tests: [
            ["up or down", ["'up'", "'down'"]],
            ["red and black", ["'red'", "'black'"]],
            ["back nor forth", ["'back'", "'forth'"]],
            ["clubs, diamonds, hearts, spades", ["'clubs'", "'diamonds'", "'hearts'", "'spades'"]],
            ["ace, 2, 3, 4, jack, queen or king", ["'ace'", 2, 3, 4, "'jack'", "'queen'", "'king'"]]
          ]
        }
      ]
    },

    // Bracketed list (array), eg:  `[1,2 , true,false ]`
    {
      name: "bracketed_list",
      alias: ["expression", "single_expression"],
      datatype: "array", // TODO: array of what?
      syntax: "\\[ [list:{expression},]? \\]",
      testRule: "\\[",
      compile(scope, match) {
        const { list } = match.results
        return `[${list ? list.join(", ") : ""}]`
      },
      tests: [
        {
          title: "correctly matches literal lists",
          tests: [
            ["[]", "[]"],
            ["[1]", "[1]"],
            ["[1,]", "[1]"],
            ["[1,2,3]", "[1, 2, 3]"],
            ["[1, 2, 3]", "[1, 2, 3]"],
            ["[1,2,3,]", "[1, 2, 3]"],
            ["[yes,no,'a',1]", "[true, false, 'a', 1]"]
          ]
        },
        {
          title: "doesn't match malformed lists ",
          tests: [["", undefined], ["[,1]", undefined]]
        }
      ]
    },

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
    {
      name: "list_length",
      alias: ["expression", "single_expression"],
      syntax: "the? number of {arg:plural_variable} in {list:expression}",
      testRule: "…(number of)",
      precedence: 3,
      compile(scope, match) {
        const { list } = match.results
        return `spell.itemCountOf(${list})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("bar")
          },
          tests: [
            ["number of items in my-list", "spell.itemCountOf(my_list)"],
            ["the number of foos in the foo of the bar", "spell.itemCountOf(bar.foo)"],
            ["the number of items in [1,2,3]", "spell.itemCountOf([1, 2, 3])"]
          ]
        }
      ]
    },

    // Return the first position of specified item in the list as an array.
    // If item is not found, returns `undefined`.
    // NOTE: this position returned is **1-based**.
    // TODO: `positions`, `last position`, `after...`
    {
      name: "list_position",
      alias: ["expression", "single_expression"],
      syntax: "the? position of {thing:expression} in {list:expression}",
      testRule: "…(position of)",
      precedence: 3,
      compile(scope, match) {
        const { thing, list } = match.results
        return `spell.itemOf(${list}, ${thing})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
            scope.variables.add("bar")
          },
          tests: [
            ["position of thing in my-list", "spell.itemOf(my_list, thing)"],
            ["the position of thing in the foo of the bar", "spell.itemOf(bar.foo, thing)"],
            ["the position of 'a' in ['a', 'b', 'c']", "spell.itemOf(['a', 'b', 'c'], 'a')"]
          ]
        }
      ]
    },

    // Does list start with some value?.
    {
      name: "starts_with",
      alias: "expression_suffix",
      syntax: "(operator:(starts|ends) with) {expression:single_expression}",
      applyOperator({ lhs, operator, rhs }) {
        const method = operator === "starts with" ? "startsWith" : "endsWith"
        return `spell.${method}(${lhs}, ${rhs})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
          },
          tests: [
            ["my-list starts with thing", "spell.startsWith(my_list, thing)"],
            ["[1,2,3] starts with 1", "spell.startsWith([1, 2, 3], 1)"],
            ["my-list ends with thing", "spell.endsWith(my_list, thing)"],
            ["[1,2,3] ends with 1", "spell.endsWith([1, 2, 3], 1)"]
          ]
        }
      ]
    },

    //
    //  Ordinal numbers (first, second, last, etc).
    // TODO: sixty-fifth, two hundred forty ninth... with custom parser?
    //
    {
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
    },

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
    {
      name: "position_expression",
      alias: ["expression", "single_expression"],
      syntax: "{arg:singular_variable} {position:expression} of {expression}",
      testRule: "…of",
      compile(scope, match) {
        const { position, expression } = match.results
        return `spell.getItem(${expression}, ${position})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("deck")
            scope.variables.add("n")
          },
          tests: [
            ["item 1 of my-list", "spell.getItem(my_list, 1)"],
            ["card 10 of deck", "spell.getItem(deck, 10)"],
            ["card n of the cards of the deck", "spell.getItem(deck.cards, n)"]
          ]
        }
      ]
    },

    {
      name: "ordinal_position_expression",
      alias: ["expression", "single_expression"],
      syntax: "the {ordinal} {arg:singular_variable} (in|of) {expression}",
      testRule: "…(in|of)",
      compile(scope, match) {
        const { ordinal, expression } = match.results
        return `spell.getItem(${expression}, ${ordinal})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("deck")
            scope.variables.add("words")
          },
          tests: [
            ["the first item of my-list", "spell.getItem(my_list, 1)"],
            ["the tenth card of deck", "spell.getItem(deck, 10)"],
            ["the penultimate word in words", "spell.getItem(words, -2)"]
          ]
        }
      ]
    },

    // Pick a SINGLE random item from the list.
    {
      name: "random_position_expression",
      alias: ["expression", "single_expression"],
      syntax: "a random {arg:singular_variable} (of|from|in) {list:expression}",
      testRule: "a random",
      compile(scope, match) {
        const { list } = match.results
        return `spell.randomItemOf(${list})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("deck")
          },
          tests: [
            ["a random item of my-list", "spell.randomItemOf(my_list)"],
            ["a random word in 'some words'", "spell.randomItemOf('some words')"],
            ["a random card from the deck", "spell.randomItemOf(deck)"]
          ]
        }
      ]
    },

    // Pick a unique set of random items from the list, returning an array.
    // TODO: `two random items...`
    {
      name: "random_positions_expression",
      alias: ["expression", "single_expression"],
      syntax: "{number} random {arg:plural_variable} (of|from|in) {list:expression}",
      testRule: "…random",
      compile(scope, match) {
        const { number, list } = match.results
        return `spell.randomItemsOf(${list}, ${number})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("deck")
          },
          tests: [
            ["2 random items of my-list", "spell.randomItemsOf(my_list, 2)"],
            ["2 random words in 'some other words'", "spell.randomItemsOf('some other words', 2)"],
            ["3 random cards from deck", "spell.randomItemsOf(deck, 3)"]
          ]
        }
      ]
    },

    // Range expression.
    // Returns a new list.
    // NOTE: `start` is **1-based**.
    // NOTE: `end` is inclusive!
    {
      name: "range_from_expression",
      alias: ["expression", "single_expression"],
      syntax: "{arg:variable} {start:expression} to {end:expression} (of|in|from) {list:expression}",
      testRule: "…(of|in|from)",
      compile(scope, match) {
        const { list, start, end } = match.results
        return `spell.rangeBetween(${list}, ${start}, ${end})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("deck")
          },
          tests: [
            ["item 1 to 2 of my-list", "spell.rangeBetween(my_list, 1, 2)"],
            ["word 2 to 3 in 'some other words'", "spell.rangeBetween('some other words', 2, 3)"],
            ["card 1 to 3 from deck", "spell.rangeBetween(deck, 1, 3)"]
          ]
        }
      ]
    },

    // Range expression starting at some item in the list, inclusive.
    // Returns a new list.
    // If item is not found, returns an empty list. (???)
    {
      name: "range_from_expression_starting_with",
      alias: ["expression", "single_expression"],
      syntax: "{arg:plural_variable} (in|of) {list:expression} starting with {thing:expression}",
      testRule: "…(starting with)",
      compile(scope, match) {
        const { thing, list } = match.results
        return `spell.rangeBetween(${list}, spell.itemOf(${thing}, ${list}))`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
          },
          tests: [
            ["items in my-list starting with thing", "spell.rangeBetween(my_list, spell.itemOf(thing, my_list))"],
            [
              "words in 'some words' starting with 'some'",
              "spell.rangeBetween('some words', spell.itemOf('some', 'some words'))"
            ]
          ]
        }
      ]
    },

    // Alternative form of range expression.
    // Returns a new list.
    {
      name: "range_count_expression",
      alias: ["expression", "single_expression"],
      syntax: "{ordinal} {number} {arg:plural_variable} (of|in|from) {list:expression}",
      testRule: "…(of|in|from)",
      compile(scope, match) {
        const { ordinal, number, list } = match.results
        return `spell.rangeStartingAt(${list}, ${ordinal}, ${number})`
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("deck")
          },
          tests: [
            ["top 2 items of my-list", "spell.rangeStartingAt(my_list, 1, 2)"],
            ["first 2 words in 'some other words'", "spell.rangeStartingAt('some other words', 1, 2)"],
            ["last two cards from deck", "spell.rangeStartingAt(deck, -1, 2)"]
          ]
        }
      ]
    },

    // List filter.
    {
      name: "list_filter",
      alias: ["expression", "single_expression"],
      syntax: "the? {arg:plural_variable} (in|of) {list:expression} where",
      testRule: "…where",
      precedence: 2,
      constructor: Spell.Rule.Statement,
      wantsInlineStatement: true,
      parseInlineStatementAs: "expression",
      getNestedScope(scope, match) {
        const { arg } = match.results
        match.results.expression = new Scope.Method({ scope, args: [singularize(arg)], asExpression: true })
        return match.results.expression
      },
      compile(scope, match) {
        const { list, expression } = match.results
        return `spell.filter(${list}, ${expression})`
      },
      tests: [
        {
          compileAs: "expression",
          showAll: true,
          beforeEach(scope) {
            scope.variables.add("my-list")
          },
          tests: [
            [
              "words in 'a word list' where word starts with 'a'",
              "spell.filter('a word list', (word) => spell.startsWith(word, 'a'))"
            ],
            ["the items in my-list where the id of the item > 1", "spell.filter(my_list, (item) => (item.id > 1))"]
          ]
        }
      ]
    },

    // Set membership (left recursive).
    // TODO: this is a postfix_operator expression
    {
      name: "list_membership_test",
      alias: ["expression"],
      syntax: "{list:single_expression} (operator:has|has no|doesnt have|does not have) {arg:plural_variable} where",
      testRule: "…(has|have)",
      precedence: 2,
      constructor: Spell.Rule.Statement,
      wantsInlineStatement: true,
      parseInlineStatementAs: "expression",
      getNestedScope(scope, match) {
        const { arg } = match.results
        match.results.filter = new Scope.Method({ scope, args: [singularize(arg)], asExpression: true })
        return match.results.filter
      },
      compile(scope, match) {
        const { operator, filter, list } = match.results
        const bang = operator === "has" ? "" : "!"
        // singularize method argument
        return `${bang}spell.any(${list}, ${filter})`
      },
      tests: [
        {
          compileAs: "expression",
          showAll: true,
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("bar")
          },
          tests: [
            ["my-list has items where item is 1", "spell.any(my_list, (item) => (item == 1))"],
            ["my-list has no items where item is 1", "!spell.any(my_list, (item) => (item == 1))"],
            ["my-list doesnt have items where item is 1", "!spell.any(my_list, (item) => (item == 1))"],
            ["the foo of the bar does not have items where item is 1", "!spell.any(bar.foo, (item) => (item == 1))"]
          ]
        }
      ]
    },

    //
    //  Adding to list (in-place)
    //

    // Aliases for front/back/etc
    {
      name: "list_front_or_back",
      syntax: "the (start|front|top|end|back|bottom) of",
      compile(scope, match) {
        const where = match.matched[1].value
        if (where === "start" || where === "front" || where === "top") return "prepend"
        return "append"
      }
    },

    // Add to list.
    {
      name: "list_add",
      alias: "statement",
      syntax: "add {thing:expression} to {method:list_front_or_back}? {list:expression}",
      testRule: "add",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { thing, list, method = "append" } = results
        const statement = scope.addStatement(`spell.${method}(${list}, ${thing})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
          },
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
    },

    // Prepend.
    {
      name: "list_prepend",
      alias: "statement",
      syntax: "prepend {thing:expression} to {list:expression}",
      testRule: "prepend",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { thing, list } = results
        const statement = scope.addStatement(`spell.prepend(${list}, ${thing})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
          },
          tests: [["prepend thing to my-list", "spell.prepend(my_list, thing)"]]
        }
      ]
    },

    // Append.
    {
      name: "list_append",
      alias: "statement",
      syntax: "append {thing:expression} to {list:expression}",
      testRule: "append",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { thing, list } = results
        const statement = scope.addStatement(`spell.append(${list}, ${thing})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
          },
          tests: [["append thing to my-list", "spell.append(my_list, thing)"]]
        }
      ]
    },

    //
    // Add to middle of list, pushing existing items out of the way.
    //

    // TODO: Add to middle of list, pushing existing items out of the way.
    //       "add {thing:expression} to position {position:expression} of {list:expression}",

    // Add to list before/after something else
    // TODO: `relative_position_expression` rule?
    {
      name: "list_add_relative",
      alias: "statement",
      syntax: "add {thing:expression} to {list:expression} (operator:before|after) {item:expression}",
      testRule: "add",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { thing, item, list, operator } = results
        const position = operator === "before" ? `spell.itemOf(${list}, ${item})` : `spell.itemOf(${list}, ${item}) + 1`
        const statement = scope.addStatement(`spell.addAtPosition(${list}, ${position}, ${thing})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
            scope.variables.add("other-thing")
          },
          tests: [
            [
              "add thing to my-list before other-thing",
              "spell.addAtPosition(my_list, spell.itemOf(my_list, other_thing), thing)"
            ],
            [
              "add thing to my-list after other-thing",
              "spell.addAtPosition(my_list, spell.itemOf(my_list, other_thing) + 1, thing)"
            ]
          ]
        }
      ]
    },

    //
    //  Removing from list (in-place)
    //

    // Empty list.
    // TODO: make `empty` and/or `clear` a generic statement???
    {
      name: "list_empty",
      alias: "statement",
      syntax: "(empty|clear) {list:expression}",
      testRule: "(empty|clear)",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { list } = results
        const statement = scope.addStatement(`spell.clear(${list})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("deck")
          },
          tests: [["empty my-list", "spell.clear(my_list)"], ["clear the cards of the deck", "spell.clear(deck.cards)"]]
        }
      ]
    },

    // Remove one item from list by position specified as an ordinal
    {
      name: "list_remove_ordinal",
      alias: "statement",
      syntax: "remove the? {position:ordinal} {arg:singular_variable} of {list:expression}",
      testRule: "remove",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { position, list } = results
        const statement = scope.addStatement(`spell.removeItem(${list}, ${position})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("deck")
          },
          tests: [
            ["remove last card of deck", "spell.removeItem(deck, -1)"],
            ["remove the first card of the deck", "spell.removeItem(deck, 1)"]
          ]
        }
      ]
    },

    // Remove one item from list by position.
    {
      name: "list_remove_position",
      alias: "statement",
      syntax: "remove {arg:singular_variable} {number:expression} of {list:expression}",
      testRule: "remove",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { number, list } = results
        const statement = scope.addStatement(`spell.removeItem(${list}, ${number})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
          },
          tests: [["remove item 4 of my-list", "spell.removeItem(my_list, 4)"]]
        }
      ]
    },

    // Remove range of things from list.
    // NOTE: `start` is **1-based**.
    // NOTE: `end` is inclusive!
    {
      name: "list_remove_range",
      alias: "statement",
      syntax: "remove {arg:plural_variable} {start:expression} to {end:expression} of {list:expression}",
      testRule: "remove",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { start, end, list } = results
        const statement = scope.addStatement(`spell.removeRangeBetween(${list}, ${start}, ${end})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
          },
          tests: [["remove items 2 to 4 of my-list", "spell.removeRangeBetween(my_list, 2, 4)"]]
        }
      ]
    },

    {
      name: "list_remove_range_ordinal",
      alias: "statement",
      syntax: "remove {start:ordinal} to {end:ordinal} {arg:plural_variable} of {list:expression}",
      testRule: "remove",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { start, end, list } = results
        const statement = scope.addStatement(`spell.removeRangeBetween(${list}, ${start}, ${end})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("deck")
          },
          tests: [["remove first to third cards of the deck", "spell.removeRangeBetween(deck, 1, 3)"]]
        }
      ]
    },

    // TODO: `remove last card from the deck`
    // TODO: `remove last two cards from the deck`

    // Remove all instances of something from a list.
    {
      name: "list_remove",
      alias: "statement",
      syntax: "remove {thing:expression} from {list:expression}",
      testRule: "remove",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { thing, list } = results
        const statement = scope.addStatement(`spell.remove(${list}, ${thing})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("thing")
            scope.variables.add("my-list")
          },
          tests: [["remove thing from my-list", "spell.remove(my_list, thing)"]]
        }
      ]
    },

    // Remove all items from list where condition is true.
    {
      name: "list_remove_where",
      alias: "statement",
      syntax: "remove {arg:plural_variable} (in|of|from) {list:expression} where",
      testRule: "remove",
      constructor: Spell.Rule.Statement,
      wantsInlineStatement: true,
      parseInlineStatementAs: "expression",
      getNestedScope(scope, match) {
        const { arg } = match.results
        match.results.condition = new Scope.Method({ scope, args: [singularize(arg)], asExpression: true })
        return match.results.condition
      },
      updateScope(scope, { results }) {
        const { condition, list } = results
        // singularize method argument
        const statement = scope.addStatement(`spell.removeWhere(${list}, ${condition})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("deck")
            scope.variables.add("my-list")
            scope.constants.add("clubs")
          },
          tests: [
            [
              "remove items from my-list where item is not 'ace'",
              "spell.removeWhere(my_list, (item) => (item != 'ace'))"
            ],
            [
              "remove cards in deck where the suit of the card is clubs",
              "spell.removeWhere(deck, (card) => (card.suit == 'clubs'))"
            ]
          ]
        }
      ]
    },

    //
    //  Random (in-place) list manipulation.
    //

    // Reverse list in-place.
    {
      name: "list_reverse",
      alias: "statement",
      syntax: "reverse ((the? {arg:plural_variable}) (in|of))? {list:expression}",
      testRule: "reverse",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { list } = results
        const statement = scope.addStatement(`spell.reverse(${list})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("deck")
            scope.variables.add("my-list")
          },
          tests: [
            ["reverse the cards of the deck", "spell.reverse(deck)"],
            ["reverse my-list", "spell.reverse(my_list)"]
          ]
        }
      ]
    },

    // Shuffle list in-place.
    {
      name: "list_shuffle",
      alias: "statement",
      syntax: "(randomize|shuffle) ((the? {arg:plural_variable}) (in|of))? {list:expression}",
      testRule: "(randomize|shuffle)",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { list } = results
        const statement = scope.addStatement(`spell.randomize(${list})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("deck")
            scope.variables.add("my-list")
          },
          tests: [
            ["shuffle cards of deck", "spell.randomize(deck)"],
            ["shuffle the cards of the deck", "spell.randomize(deck)"],
            ["randomize my-list", "spell.randomize(my_list)"]
          ]
        }
      ]
    },

    // Iteration
    // TODO: can work for object enumeration as well (maybe with 'of'?)
    // TODO: return values e.g. array.map() ???
    {
      name: "list_iteration",
      alias: "statement",
      syntax: "for each? {item:singular_variable} ((and|,) {position:singular_variable})? in {list:expression} :?",
      testRule: "for",
      constructor: Spell.Rule.Statement,
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      getNestedScope(scope, { results }) {
        const { item, position } = results
        // Create a method to be used in the `forEach` to add inline and block statements to.
        const args = [{ name: item }]
        if (position) args.push({ name: position, type: "number" })
        results.$scope = new Scope.Method({
          scope,
          args
        })
        return results.$scope
      },
      updateScope(scope, { results }) {
        // Add a Method for the `forEach` wrapper with a custom toString()
        const statement = scope.addStatement(
          new Scope.Method({
            name: "for_each",
            toString() {
              return `spell.forEach(${results.list}, ${results.$scope.toString()})`
            }
          })
        )
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add("deck")
            scope.variables.add("my-list")
            scope.variables.add("messages")
          },
          tests: [
            ["for each card in deck:", "spell.forEach(deck, function(card) {})"],
            ["for item, index in my-list:", "spell.forEach(my_list, function(item, index) {})"],
            [
              "for each card in deck: set the direction of the card to 'down'",
              "spell.forEach(deck, function(card) { card.direction = 'down' })"
            ],
            [
              "for message, index in messages: add message + index to messages",
              "spell.forEach(messages, function(message, index) { spell.append(messages, (message + index)) })"
            ],

            [
              "for each card in deck:\n\tset the direction of the card to 'down'",
              "spell.forEach(deck, function(card) { card.direction = 'down' })"
            ],
            [
              "for message and index in messages:\n\tif index is greater than 2 add message to messages",
              "spell.forEach(messages, function(message, index) { if (index > 2) { spell.append(messages, message) } })"
            ]
          ]
        }
      ]
    }
  ]
})
