//
//  # Rules for dealing with lists
//  TODO: sort
//

import { AST, Scope, Spell, singularize } from "../all"

export default new Spell.Parser({
  module: "lists",
  rules: [
    // List of identifiers and/or numbers, e.g. "clubs or hearts", "jack, queen, king"
    // Note that this is not a generic "expression" -- it's too generic.
    {
      name: "identifier_list",
      syntax: "[({known_variable}|{constant}|{number})(,|or|and|nor)]",
      datatype: "array", // TODO: array of what?
      toAST(scope, match) {
        const { items } = match
        return new AST.ListExpression(scope, match, { items: items.map(item => item.AST) })
      },
      tests: [
        {
          tests: [
            ["up or down", "['up', 'down']"],
            ["red and black", "['red', 'black']"],
            ["back nor forth", "['back', 'forth']"],
            ["clubs, diamonds, hearts, spades", "['clubs', 'diamonds', 'hearts', 'spades']"],
            ["ace, 2, 3, 4, jack, queen or king", "['ace', 2, 3, 4, 'jack', 'queen', 'king']"]
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
      toAST(scope, match) {
        const { list } = match.groups
        const items = list ? list.items.map(item => item.AST) : undefined
        return new AST.ListExpression(scope, match, { items })
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
        return `spellCore.itemCountOf(${list})`
      },
      toAST(scope, match) {
        const { list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "itemCountOf",
          arguments: [list.AST]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("bar")
          },
          tests: [
            ["number of items in my-list", "spellCore.itemCountOf(my_list)"],
            ["the number of foos in the foo of the bar", "spellCore.itemCountOf(bar.foo)"],
            ["the number of items in [1,2,3]", "spellCore.itemCountOf([1, 2, 3])"]
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
        return `spellCore.itemOf(${list}, ${thing})`
      },
      toAST(scope, match) {
        const { thing, list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "itemOf",
          arguments: [list.AST, thing.AST]
        })
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
            ["position of thing in my-list", "spellCore.itemOf(my_list, thing)"],
            ["the position of thing in the foo of the bar", "spellCore.itemOf(bar.foo, thing)"],
            ["the position of 'a' in ['a', 'b', 'c']", "spellCore.itemOf(['a', 'b', 'c'], 'a')"]
          ]
        }
      ]
    },

    // Does list start with some value?.
    {
      name: "starts_with",
      alias: "expression_suffix",
      // TODO: `does not start with`?
      syntax: "(operator:starts with) {expression:single_expression}",
      constructor: Spell.Rule.InfixOperatorSuffix,
      compileOperatorExpression({ lhs, rhs }) {
        return `spellCore.startsWith(${lhs}, ${rhs})`
      },
      compileASTExpression(scope, match, { lhs, rhs }) {
        return new AST.CoreMethodInvocation(scope, match, {
          method: "startsWith",
          arguments: [lhs, rhs]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
          },
          tests: [
            ["my-list starts with thing", "spellCore.startsWith(my_list, thing)"],
            ["[1,2,3] starts with 1", "spellCore.startsWith([1, 2, 3], 1)"]
          ]
        }
      ]
    },

    // Does list start with some value?.
    {
      name: "ends_with",
      alias: "expression_suffix",
      // TODO: `does not end with`?
      syntax: "(operator:ends with) {expression:single_expression}",
      constructor: Spell.Rule.InfixOperatorSuffix,
      compileOperatorExpression({ lhs, rhs }) {
        return `spellCore.endsWith(${lhs}, ${rhs})`
      },
      compileASTExpression(scope, match, { lhs, rhs }) {
        return new AST.CoreMethodInvocation(scope, match, {
          method: "endsWith",
          arguments: [lhs, rhs]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
          },
          tests: [
            ["my-list ends with thing", "spellCore.endsWith(my_list, thing)"],
            ["[1,2,3] ends with 1", "spellCore.endsWith([1, 2, 3], 1)"]
          ]
        }
      ]
    },

    //
    // Ordinal numbers (first, second, last, etc).
    // TODO: sixty-fifth, two hundred forty ninth... with custom parser?
    //
    {
      name: "ordinal",
      argument: "ordinal",
      pattern: /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|penultimate|final|last|top|bottom)$/,
      VALUE_MAP: {
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
      toAST(scope, match) {
        const { value, raw } = match
        return new AST.NumericLiteral(scope, match, { value, raw })
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
        return `spellCore.getItem(${expression}, ${position})`
      },
      toAST(scope, match) {
        const { position, expression } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "getItem",
          arguments: [expression.AST, position.AST]
        })
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
            ["item 1 of my-list", "spellCore.getItem(my_list, 1)"],
            ["card 10 of deck", "spellCore.getItem(deck, 10)"],
            ["card n of the cards of the deck", "spellCore.getItem(deck.cards, n)"]
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
        return `spellCore.getItem(${expression}, ${ordinal})`
      },
      toAST(scope, match) {
        const { ordinal, expression } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "getItem",
          arguments: [expression.AST, ordinal.AST]
        })
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
            ["the first item of my-list", "spellCore.getItem(my_list, 1)"],
            ["the tenth card of deck", "spellCore.getItem(deck, 10)"],
            ["the penultimate word in words", "spellCore.getItem(words, -2)"]
          ]
        }
      ]
    },

    // Pick a SINGLE random item from the list.
    {
      name: "random_item_expression",
      alias: ["expression", "single_expression"],
      syntax: "a random {arg:singular_variable} (of|from|in) {list:expression}",
      testRule: "a random",
      compile(scope, match) {
        const { list } = match.results
        return `spellCore.randomItemOf(${list})`
      },
      toAST(scope, match) {
        const { list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "randomItemOf",
          arguments: [list.AST]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("deck")
          },
          tests: [
            ["a random item of my-list", "spellCore.randomItemOf(my_list)"],
            ["a random word in 'some words'", "spellCore.randomItemOf('some words')"],
            ["a random card from the deck", "spellCore.randomItemOf(deck)"]
          ]
        }
      ]
    },

    // Pick a unique set of random items from the list, returning an array.
    // TODO: `two random items...`
    {
      name: "random_items_expression",
      alias: ["expression", "single_expression"],
      syntax: "{number} random {arg:plural_variable} (of|from|in) {list:expression}",
      testRule: "…random",
      compile(scope, match) {
        const { number, list } = match.results
        return `spellCore.randomItemsOf(${list}, ${number})`
      },
      toAST(scope, match) {
        const { number, list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "randomItemsOf",
          arguments: [list.AST, number.AST]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("deck")
          },
          tests: [
            ["2 random items of my-list", "spellCore.randomItemsOf(my_list, 2)"],
            ["2 random words in 'some other words'", "spellCore.randomItemsOf('some other words', 2)"],
            ["3 random cards from deck", "spellCore.randomItemsOf(deck, 3)"]
          ]
        }
      ]
    },

    // Range expression.
    // Returns a new list.
    // NOTE: `start` is **1-based**.
    // NOTE: `end` is inclusive!
    {
      name: "range_between_expression",
      alias: ["expression", "single_expression"],
      syntax: "{arg:variable} {start:expression} to {end:expression} (of|in|from) {list:expression}",
      testRule: "…(of|in|from)",
      compile(scope, match) {
        const { list, start, end } = match.results
        return `spellCore.rangeBetween(${list}, ${start}, ${end})`
      },
      toAST(scope, match) {
        const { list, start, end } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "rangeBetween",
          arguments: [list.AST, start.AST, end.AST]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("deck")
          },
          tests: [
            ["item 1 to 2 of my-list", "spellCore.rangeBetween(my_list, 1, 2)"],
            ["word 2 to 3 in 'some other words'", "spellCore.rangeBetween('some other words', 2, 3)"],
            ["card 1 to 3 from deck", "spellCore.rangeBetween(deck, 1, 3)"]
          ]
        }
      ]
    },

    // Range expression starting at some item in the list, inclusive.
    // Returns a new list.
    // If item is not found, returns an empty list. (???)
    {
      name: "range_starting_with_expression",
      alias: ["expression", "single_expression"],
      syntax: "{arg:plural_variable} (in|of) {list:expression} starting with {thing:expression}",
      testRule: "…(starting with)",
      compile(scope, match) {
        const { thing, list } = match.results
        return `spellCore.rangeStartingAt(${list}, spellCore.itemOf(${list}, ${thing}))`
      },
      toAST(scope, match) {
        const { thing, list } = match.groups
        const itemExpression = new AST.CoreMethodInvocation(scope, match, {
          method: "itemOf",
          arguments: [list.AST, thing.AST]
        })
        return new AST.CoreMethodInvocation(scope, match, {
          method: "rangeStartingAt",
          arguments: [list.AST, itemExpression]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
          },
          tests: [
            [
              "items in my-list starting with thing",
              "spellCore.rangeStartingAt(my_list, spellCore.itemOf(my_list, thing))"
            ],
            [
              "words in 'some words' starting with 'some'",
              "spellCore.rangeStartingAt('some words', spellCore.itemOf('some words', 'some'))"
            ]
          ]
        }
      ]
    },

    // Alternative form of range expression.
    // Returns a new list.
    // TODO: restrict ordinals to `first`, `last`, `final`, `top`, etc
    {
      name: "range_count_expression",
      alias: ["expression", "single_expression"],
      syntax: "{ordinal} {number} {arg:plural_variable} (of|in|from) {list:expression}",
      testRule: "…(of|in|from)",
      compile(scope, match) {
        const { ordinal, number, list } = match.results
        return `spellCore.rangeStartingAt(${list}, ${ordinal}, ${number})`
      },
      toAST(scope, match) {
        const { list, ordinal, number } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "rangeStartingAt",
          arguments: [list.AST, ordinal.AST, number.AST]
        })
      },
      tests: [
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("deck")
          },
          tests: [
            ["top 2 items of my-list", "spellCore.rangeStartingAt(my_list, 1, 2)"],
            ["first 2 words in 'some other words'", "spellCore.rangeStartingAt('some other words', 1, 2)"],
            ["last two cards from deck", "spellCore.rangeStartingAt(deck, -1, 2)"]
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
        return `spellCore.filter(${list}, ${expression})`
      },
      getASTScope(scope, match) {
        const arg = singularize(match.groups.arg.value)
        return new Scope.Method({ scope, args: [arg], asExpression: true })
      },
      toAST(scope, match) {
        const { arg, list, inlineStatement } = match.groups
        const filter = new AST.InlineMethodExpression(scope, inlineStatement, {
          args: [new AST.VariableExpression(scope, arg, { name: singularize(arg.value) })],
          expression: inlineStatement?.AST
        })
        return new AST.CoreMethodInvocation(scope, match, {
          method: "filter",
          arguments: [list.AST, filter]
        })
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
              "spellCore.filter('a word list', (word) => spellCore.startsWith(word, 'a'))"
            ],
            ["the items in my-list where the id of the item > 1", "spellCore.filter(my_list, (item) => (item.id > 1))"]
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
        return `${bang}spellCore.any(${list}, ${filter})`
      },
      getASTScope(scope, match) {
        const arg = singularize(match.groups.arg.value)
        return new Scope.Method({ scope, args: [arg], asExpression: true })
      },
      toAST(scope, match) {
        const { list, operator, arg, inlineStatement } = match.groups
        const filter = new AST.InlineMethodExpression(scope, inlineStatement, {
          args: [new AST.VariableExpression(scope, arg, { name: singularize(arg.value) })],
          expression: inlineStatement.AST
        })
        const expression = new AST.CoreMethodInvocation(scope, match, {
          method: "any",
          arguments: [list.AST, filter],
          datatype: "boolean"
        })
        // Wrap in NotExpression for some operators
        if (operator.value === "has") return expression
        return new AST.NotExpression(scope, match, { expression })
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
            ["my-list has items where item is 1", "spellCore.any(my_list, (item) => (item == 1))"],
            ["my-list has no items where item is 1", "!spellCore.any(my_list, (item) => (item == 1))"],
            ["my-list doesnt have items where item is 1", "!spellCore.any(my_list, (item) => (item == 1))"],
            ["the foo of the bar does not have items where item is 1", "!spellCore.any(bar.foo, (item) => (item == 1))"]
          ]
        }
      ]
    },

    //
    //  Adding to list (in-place)
    //

    // Add to list.
    {
      name: "list_add",
      alias: "statement",
      syntax: "add {thing:expression} to (the (method:start|front|top|end|back|bottom) of)? {list:expression}",
      testRule: "add",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { thing, list, method } = results
        const spellMethod = ["start", "front", "top"].includes(method) ? "prepend" : "append"
        const statement = scope.addStatement(`spellCore.${spellMethod}(${list}, ${thing})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { thing, list, method } = match.groups
        const spellMethod = method && ["start", "front", "top"].includes(method.value) ? "prepend" : "append"
        return new AST.CoreMethodInvocation(scope, match, {
          method: spellMethod,
          arguments: [list.AST, thing.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
          },
          tests: [
            ["add thing to the start of my-list", "spellCore.prepend(my_list, thing)"],
            ["add thing to the front of my-list", "spellCore.prepend(my_list, thing)"],
            ["add thing to the top of my-list", "spellCore.prepend(my_list, thing)"],

            ["add thing to my-list", "spellCore.append(my_list, thing)"],
            ["add thing to the end of my-list", "spellCore.append(my_list, thing)"],
            ["add thing to the back of my-list", "spellCore.append(my_list, thing)"],
            ["add thing to the bottom of my-list", "spellCore.append(my_list, thing)"]
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
        const statement = scope.addStatement(`spellCore.prepend(${list}, ${thing})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { thing, list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "prepend",
          arguments: [list.AST, thing.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
          },
          tests: [["prepend thing to my-list", "spellCore.prepend(my_list, thing)"]]
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
        const statement = scope.addStatement(`spellCore.append(${list}, ${thing})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { thing, list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "append",
          arguments: [list.AST, thing.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("thing")
          },
          tests: [["append thing to my-list", "spellCore.append(my_list, thing)"]]
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
        const position =
          operator === "before" ? `spellCore.itemOf(${list}, ${item})` : `spellCore.itemOf(${list}, ${item}) + 1`
        const statement = scope.addStatement(`spellCore.addAtPosition(${list}, ${position}, ${thing})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { thing, list, operator, item } = match.groups
        let position = new AST.CoreMethodInvocation(scope, match, {
          method: "itemOf",
          arguments: [list.AST, item.AST]
        })
        if (operator.value === "after") {
          position = new AST.InfixExpression(scope, match, {
            lhs: position,
            operator: "+",
            rhs: new AST.NumericLiteral(scope, match, { value: 1 })
          })
        }
        return new AST.CoreMethodInvocation(scope, match, {
          method: "addAtPosition",
          arguments: [list.AST, position, thing.AST]
        })
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
              "spellCore.addAtPosition(my_list, spellCore.itemOf(my_list, other_thing), thing)"
            ],
            [
              "add thing to my-list after other-thing",
              "spellCore.addAtPosition(my_list, spellCore.itemOf(my_list, other_thing) + 1, thing)"
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
        const statement = scope.addStatement(`spellCore.clear(${list})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "clear",
          arguments: [list.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
            scope.variables.add("deck")
          },
          tests: [
            ["empty my-list", "spellCore.clear(my_list)"],
            ["clear the cards of the deck", "spellCore.clear(deck.cards)"]
          ]
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
        const statement = scope.addStatement(`spellCore.removeItem(${list}, ${position})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { position, list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "removeItem",
          arguments: [list.AST, position.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("deck")
          },
          tests: [
            ["remove last card of deck", "spellCore.removeItem(deck, -1)"],
            ["remove the first card of the deck", "spellCore.removeItem(deck, 1)"]
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
        const statement = scope.addStatement(`spellCore.removeItem(${list}, ${number})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { number, list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "removeItem",
          arguments: [list.AST, number.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
          },
          tests: [["remove item 4 of my-list", "spellCore.removeItem(my_list, 4)"]]
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
        const statement = scope.addStatement(`spellCore.removeRangeBetween(${list}, ${start}, ${end})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { start, end, list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "removeRangeBetween",
          arguments: [list.AST, start.AST, end.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("my-list")
          },
          tests: [["remove items 2 to 4 of my-list", "spellCore.removeRangeBetween(my_list, 2, 4)"]]
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
        const statement = scope.addStatement(`spellCore.removeRangeBetween(${list}, ${start}, ${end})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { start, end, list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "removeRangeBetween",
          arguments: [list.AST, start.AST, end.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("deck")
          },
          tests: [["remove first to third cards of the deck", "spellCore.removeRangeBetween(deck, 1, 3)"]]
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
        const statement = scope.addStatement(`spellCore.remove(${list}, ${thing})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { thing, list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "remove",
          arguments: [list.AST, thing.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("thing")
            scope.variables.add("my-list")
          },
          tests: [["remove thing from my-list", "spellCore.remove(my_list, thing)"]]
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
        const statement = scope.addStatement(`spellCore.removeWhere(${list}, ${condition})`)
        results.statements.push(statement)
      },
      getASTScope(scope, match) {
        const arg = singularize(match.groups.arg.value)
        return new Scope.Method({ scope, args: [arg], asExpression: true })
      },
      toAST(scope, match) {
        const { arg, list, inlineStatement } = match.groups
        const filter = new AST.InlineMethodExpression(scope, inlineStatement, {
          args: [new AST.VariableExpression(scope, arg, { name: singularize(arg.value) })],
          expression: inlineStatement.AST
        })
        return new AST.CoreMethodInvocation(scope, match, {
          method: "removeWhere",
          arguments: [list.AST, filter]
        })
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
              "spellCore.removeWhere(my_list, (item) => (item != 'ace'))"
            ],
            [
              "remove cards in deck where the suit of the card is clubs",
              "spellCore.removeWhere(deck, (card) => (card.suit == 'clubs'))"
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
        const statement = scope.addStatement(`spellCore.reverse(${list})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "reverse",
          arguments: [list.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("deck")
            scope.variables.add("my-list")
          },
          tests: [
            ["reverse the cards of the deck", "spellCore.reverse(deck)"],
            ["reverse my-list", "spellCore.reverse(my_list)"]
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
        const statement = scope.addStatement(`spellCore.randomize(${list})`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        const { list } = match.groups
        return new AST.CoreMethodInvocation(scope, match, {
          method: "randomize",
          arguments: [list.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("deck")
            scope.variables.add("my-list")
          },
          tests: [
            ["shuffle cards of deck", "spellCore.randomize(deck)"],
            ["shuffle the cards of the deck", "spellCore.randomize(deck)"],
            ["randomize my-list", "spellCore.randomize(my_list)"]
          ]
        }
      ]
    },

    // Generic iteration
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
        console.warn(results.$scope)
        return results.$scope
      },
      updateScope(scope, { results }) {
        // Add a Method for the `forEach` wrapper with a custom toString()
        const statement = scope.addStatement(
          new Scope.Method({
            name: "for_each",
            toString() {
              return `spellCore.forEach(${results.list}, ${results.$scope.toString()})`
            }
          })
        )
        results.statements.push(statement)
      },
      getASTScope(scope, match) {
        const { item, position } = match.groups
        const args = [{ name: item.value }]
        if (position) args.push({ name: position.value, type: "number" })
        console.info(args)
        return new Scope.Method({ scope, args })
      },
      toAST(scope, match) {
        const { list, item, position, nestedBlock } = match.groups
        const args = [new AST.VariableExpression(scope, item, { name: item.value })]
        if (position) args.push(new AST.VariableExpression(scope, position, { name: position.value }))
        const method = new AST.InlineMethodExpression(scope, match, {
          args,
          statements: nestedBlock?.AST
        })
        return new AST.CoreMethodInvocation(scope, match, {
          method: "forEach",
          arguments: [list.AST, method]
        })
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
            ["for each card in deck:", "spellCore.forEach(deck, (card) => {})"],
            ["for item, index in my-list:", "spellCore.forEach(my_list, (item, index) => {})"],
            [
              "for each card in deck: set the direction of the card to 'down'",
              "spellCore.forEach(deck, (card) => card.direction = 'down')"
            ],
            [
              "for message, index in messages: add message + index to messages",
              "spellCore.forEach(messages, (message, index) => spellCore.append(messages, (message + index)))"
            ],

            [
              "for each card in deck:\n\tset the direction of the card to 'down'",
              "spellCore.forEach(deck, (card) => { card.direction = 'down' })"
            ],
            [
              "for each card in deck:\n\tset the direction of the card to 'down'\n\tset the value of the card to 10",
              "spellCore.forEach(deck, (card) => {\ncard.direction = 'down'\ncard.value = 10\n})"
            ],
            [
              "for message and index in messages:\n\tif index is greater than 2 add message to messages",
              "spellCore.forEach(messages, (message, index) => { if (index > 2) { spellCore.append(messages, message) } })"
            ]
          ]
        }
      ]
    },

    // Number range-specific iteration
    // TODO: this only works if you `from 1 to 10`, a more general solution which also supports `in {list}` is needed.
    // TODO: `down` is not accounted for in the output
    {
      name: "list_range_iteration",
      alias: "statement",
      syntax: "for each? {item:singular_variable} from {start:expression} down? to {end:expression} :?",
      testRule: "for",
      constructor: Spell.Rule.Statement,
      wantsInlineStatement: true,
      wantsNestedBlock: true,
      getNestedScope(scope, match) {
        // Create a method to be used in the `forEach` to add inline and block statements to.
        const args = [{ name: match.groups.item.value }]
        match.$scope = new Scope.Method({
          scope,
          args
        })
        console.warn(match)
        return match.$scope
      },
      updateScope(scope, match) {
        // Add a Method for the `forEach` wrapper with a custom toString()
        const {
          $scope,
          results: { start, end }
        } = match
        const statement = scope.addStatement(
          new Scope.Method({
            name: "for_each",
            toString() {
              return `spellCore.forEach(spellCore.getRange(${start}, ${end}), ${$scope.toString()})`
            }
          })
        )
        match.results.statements.push(statement)
      },
      getASTScope(scope, match) {
        const arg = singularize(match.groups.item.value)
        return new Scope.Method({ scope, args: [arg], asExpression: true })
      },
      toAST(scope, match) {
        const { item, start, end, nestedBlock } = match.groups
        const getRange = new AST.CoreMethodInvocation(scope, match, {
          method: "getRange",
          arguments: [start.AST, end.AST]
        })
        const method = new AST.InlineMethodExpression(scope, match, {
          args: [new AST.VariableExpression(scope, item, { name: item.value })],
          statements: nestedBlock?.AST
        })
        return new AST.CoreMethodInvocation(scope, match, {
          method: "forEach",
          arguments: [getRange, method]
        })
      },
      tests: [
        {
          compileAs: "block",
          tests: [
            ["for each number from 1 to 10:", "spellCore.forEach(spellCore.getRange(1, 10), (number) => {})"],
            [
              "for each number from 1 to 10: print the number",
              "spellCore.forEach(spellCore.getRange(1, 10), (number) => console.log(number))"
            ],
            [
              "for each number from 1 to 10:\n\tget the number",
              "spellCore.forEach(spellCore.getRange(1, 10), (number) => { let it = number })"
            ]
          ]
        }
      ]
    }
  ]
})
