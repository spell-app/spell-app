/**
 * Rules for dealing with lists -- literals, membership, indexing, in-place mutation, iteration.
 * - NOTE: several rules capture a `{arg:singular_identifier}`/`{arg:plural_identifier}` classifier noun
 *   (e.g. `card`, `items`) that's matched for readability only and never read back out of `match.groups`.
 * TODO: sort
 */

import { proto, singularize } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { SpellStatement } from "./Statement"
import { SpellExpression, InfixOperatorSuffix, PostfixOperatorSuffix, Precedence } from "./expressions"

/**
 * Rule module for list rules -- literals, membership, indexing, in-place mutation, iteration.
 * - Each rule class below is followed by the `lists.addRule()` call which defines and registers it.
 */
export const lists = new SpellParser({ module: "lists" })

////////////////
// ## `identifier_list` rule
//    e.g. "up or down"
////////////////

/**
 * List of identifiers and/or numbers, e.g. `clubs or hearts`, `jack, queen, king`.
 * - NOTE: not a generic `expression` -- deliberately narrow to known variables / constants / numbers,
 *   else it'd swallow anything.
 */
class identifier_list extends P.Repeat {
  @proto static datatype = "list"

  getAST(match: P.MatchFor<this>): P.ASTListExpression {
    const { items } = match
    return new P.ASTListExpression(match, { items: items.map((item) => P.matchAST(item)) })
  }
}
lists.addRule(identifier_list, {
  syntax: "[({known_variable}|{constant}|{number})(,|or|and|nor)]",
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
})

////////////////
// ## `bracketed_list` rule
//    e.g. "[1,2,3]"
////////////////

/**
 * Bracketed list (array) literal, e.g. `[1,2 , true,false ]`.
 * TODO: nested lists????
 */
class bracketed_list extends P.Sequence<"list?"> {
  @proto static alias = "expression"
  @proto static datatype = "list"

  /** A `list of` what its items all are, e.g. `list of numbers` for `[1, 2]` -- else just a `list`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    const types = new Set(match.groups.list?.items.map((item) => item.datatype))
    const [itemType] = types
    return types.size === 1 && itemType ? P.listOf(itemType) : this.datatype
  }

  getAST(match: P.MatchFor<this>): P.ASTListExpression {
    const { list } = match.groups
    const items = list ? list.items.map((item) => P.matchAST(item)) : undefined
    return new P.ASTListExpression(match, { items })
  }
}
lists.addRule(bracketed_list, {
  syntax: "\\[ [list:{expression},]? \\]",
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
        [`[yes,no,"a",1]`, `[true, false, "a", 1]`]
      ]
    },
    {
      title: "doesn't match malformed lists ",
      tests: [
        ["", undefined],
        ["[,1]", undefined]
      ]
    }
  ]
})

////////////////
// ## `copy_list` rule
//    e.g. "a copy of the piles"
////////////////

/**
 * Duplicate a list, e.g. `a copy of the piles` => `spellCore.duplicateCollection(piles)`.
 * - QUESTIONABLE SYNTAX: `as (a|an) {type}` clause ??? -- picks constructor for result, e.g.
 *   `a duplicate of list the piles as a list` => `spellCore.duplicateCollection(piles, List)`.
 */
class copy_list extends SpellExpression<"expression|type?"> {
  /** The type it's copied `as`, else what it copies. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    const { expression, type } = match.groups
    return type ? P.typeName(`${type.value}`) : expression.datatype
  }

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { expression, type } = match.groups
    const args = [P.matchAST(expression)]
    if (type) args.push(P.matchAST(type))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "duplicateCollection",
      args
    })
  }
}
lists.addRule(copy_list, {
  syntax: "a (copy|duplicate) of list? {expression:operand} (as (a|an) {type:known_type})?",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("piles")
      },
      tests: [
        ["a copy of the piles", "spellCore.duplicateCollection(piles)"],
        ["a duplicate of list the piles as a list", "spellCore.duplicateCollection(piles, List)"]
      ]
    }
  ]
})

////////////////
// ## `merge_lists` rule
//    e.g. "merge the piles"
////////////////

/**
 * Merge a set of lists together, e.g. `merge the piles` => `spellCore.mergeCollections(piles)`.
 * - QUESTIONABLE SYNTAX: `(as|into) (a|an) new? {type}` clause picks constructor for result, e.g.
 *   `merge the piles as a list` => `spellCore.mergeCollections(piles, List)`.
 */
class merge_lists extends SpellExpression<"expression|type?"> {
  /** The type it's merged `as`, else a `list`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    const { type } = match.groups
    return type ? P.typeName(`${type.value}`) : "list"
  }

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { expression, type } = match.groups
    const args = [P.matchAST(expression)]
    if (type) args.push(P.matchAST(type))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "mergeCollections",
      args
    })
  }
}
lists.addRule(merge_lists, {
  syntax: "merge lists? {expression:operand} ((as|into) (a|an) new? {type:known_type})?",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("piles")
      },
      tests: [
        ["merge the piles", "spellCore.mergeCollections(piles)"],
        ["merge the piles as a list", "spellCore.mergeCollections(piles, List)"]
      ]
    }
  ]
})

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
// TODO:  list which won't take null/undefined

////////////////
// ## `list_length` rule
//    e.g. "number of items in my-list"
////////////////

/**
 * Return length of a list, e.g. `number of items in my-list` => `spellCore.itemCountOf(my_list)`.
 * - `{arg}` (e.g. `items`) captured for readability only, unless there's a `where`.
 * - With `where`, counts the items which pass, as `list_filter` does:
 *   `the number of cards in the deck where its color is red` => `spellCore.itemCountOf(spellCore.filter(deck, ...))`.
 *   Its own syntax, as `cards in the deck where ...` can't be a `list_filter` here:  we've read `cards in` already.
 * - `priority: 3` -- preferred over lower-priority expression rules when tokens are ambiguous.
 */
class list_length extends SpellExpression<"arg|list|body?"> {
  @proto static priority = 3
  @proto static datatype = "number"

  /** Nested scope for a `where` body -- singularized `{arg}` variable, also aliased from `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    return getWhereScope(match, match.groups.arg, match.groups.list)
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { arg, list } = match.groups
    const body = this.getBody(match)
    const items = body
      ? new P.ASTCoreMethodInvocation(match, {
          methodName: "filter",
          args: [P.matchAST(list), getWhereMethod(match, arg, body)]
        })
      : P.matchAST(list)
    return new P.ASTCoreMethodInvocation(match, { methodName: "itemCountOf", args: [items] })
  }
}
lists.addRule(list_length, {
  syntax: "the? number of {arg:plural_identifier} (in|of) {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("bar")
      },
      tests: [
        ["number of items in my-list", "spellCore.itemCountOf(my_list)"],
        ["the number of foos in the foo of the bar", "spellCore.itemCountOf(bar.foo)"],
        ["the number of items in [1,2,3]", "spellCore.itemCountOf([1, 2, 3])"]
      ]
    }
  ]
})
lists.addRule(list_length, {
  syntax: "the? number of {arg:plural_identifier} (in|of) {list:operand} where {inline_expression}?",
  tests: [
    {
      compileAs: "expression",
      showAll: true,
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
      },
      tests: [
        [
          "the number of items in my-list where its id > 1",
          [`spellCore.itemCountOf(spellCore.filter(my_list, (item) => {`, `  return (item.id > 1)`, `}))`]
        ]
      ]
    }
  ]
})

////////////////
// ## `list_count` rule
//    e.g. "the number of card suits"
////////////////

/**
 * Length of something KNOWN to be a list, without naming its items, e.g. `the number of card suits` =>
 * `spellCore.itemCountOf(Card.Suits)`.
 * - Rejects the match unless its datatype says it's a list, or a list type, e.g. `Deck` -- else
 *   `the number of x` stays a property read, `x.number`.
 * - `priority: 3`, as `list_length`, which wins when it names the items:  it's longer.
 */
class list_count extends SpellExpression<"list"> {
  @proto static priority = 3
  @proto static datatype = "number"

  /** Only a list -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match || !scope.getType(match.groups.list.datatype)?.isA("list")) return undefined
    return match
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, { methodName: "itemCountOf", args: [P.matchAST(match.groups.list)] })
  }
}
lists.addRule(list_count, {
  syntax: "the? number of {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.compile(["a card is a thing", "a card has a suit as one of clubs, diamonds", "set x to 1"].join("\n"))
      },
      tests: [
        ["the number of card suits", "spellCore.itemCountOf(Card.Suits)"],
        ["the number of [1, 2]", "spellCore.itemCountOf([1, 2])"],
        { title: "not a list:  a property read", input: "the number of x", output: "x.number" }
      ]
    }
  ]
})

////////////////
// ## `list_position` rule
//    e.g. "position of thing in my-list"
////////////////

/**
 * Return position of an item in a list, e.g. `position of thing in my-list` => `spellCore.itemOf(my_list, thing)`.
 * - NOTE: position returned is **1-based**.
 * - Returns `undefined` if item is not found.
 * - `priority: 3` -- preferred over lower-priority expression rules when tokens are ambiguous.
 * TODO: `positions`, `last position`, `after...`
 */
class list_position extends SpellExpression<"thing|list"> {
  @proto static priority = 3
  @proto static datatype = "number"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "itemOf",
      args: [P.matchAST(list), P.matchAST(thing)]
    })
  }
}
lists.addRule(list_position, {
  syntax: "the? position of {thing:expression} in {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
        scope.variables?.add("bar")
      },
      tests: [
        ["position of thing in my-list", "spellCore.itemOf(my_list, thing)"],
        ["the position of thing in the foo of the bar", "spellCore.itemOf(bar.foo, thing)"],
        [`the position of "a" in ["a", "b", "c"]`, `spellCore.itemOf(["a", "b", "c"], "a")`]
      ]
    }
  ]
})

////////////////
// ## `starts_with` rule
//    e.g. "my-list starts with thing"
////////////////

/**
 * Does list start with some value, e.g. `my-list starts with thing` => `spellCore.startsWith(my_list, thing)`.
 * - `Precedence.comparison`, like the other comparisons.
 */
class starts_with extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  /** Negate result for the `does not` / `doesnt` / `doesn't` spellings of `operator`. */
  shouldNegateOutput(operator: P.Match): boolean {
    return operator.value.includes("not") || operator.value.includes("doesn")
  }
  compileASTExpression(
    match: P.Match,
    { lhs, rhs }: { lhs?: P.ASTExpression; rhs?: P.ASTExpression }
  ): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "startsWith",
      args: [lhs!, rhs!]
    })
  }
}
lists.addRule(starts_with, {
  syntax: "(operator:starts with|does not start with|doesnt start with|doesn't start with) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
      },
      tests: [
        ["my-list starts with thing", "spellCore.startsWith(my_list, thing)"],
        ["[1,2,3] starts with 1", "spellCore.startsWith([1, 2, 3], 1)"],
        ["[1,2,3] does not start with 10", "!spellCore.startsWith([1, 2, 3], 10)"],
        ["[1,2,3] doesn't start with 10", "!spellCore.startsWith([1, 2, 3], 10)"],
        ["[1,2,3] doesnt start with 10", "!spellCore.startsWith([1, 2, 3], 10)"]
      ]
    }
  ]
})

////////////////
// ## `ends_with` rule
//    e.g. "my-list ends with thing"
////////////////

/** Does list end with some value, e.g. `my-list ends with thing` => `spellCore.endsWith(my_list, thing)`. */
class ends_with extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.comparison

  /** Negate result for the `does not` / `doesnt` / `doesn't` spellings of `operator`. */
  shouldNegateOutput(operator: P.Match): boolean {
    return operator.value.includes("not") || operator.value.includes("doesn")
  }
  compileASTExpression(
    match: P.Match,
    { lhs, rhs }: { lhs?: P.ASTExpression; rhs?: P.ASTExpression }
  ): P.ASTCoreMethodInvocation {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "endsWith",
      args: [lhs!, rhs!]
    })
  }
}
lists.addRule(ends_with, {
  syntax: "(operator:ends with|does not end with|doesnt end with|doesn't end with) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
      },
      tests: [
        ["my-list ends with thing", "spellCore.endsWith(my_list, thing)"],
        ["[1,2,3] ends with 1", "spellCore.endsWith([1, 2, 3], 1)"],
        ["[1,2,3] does not end with 10", "!spellCore.endsWith([1, 2, 3], 10)"],
        ["[1,2,3] doesnt end with 10", "!spellCore.endsWith([1, 2, 3], 10)"],
        ["[1,2,3] doesn't end with 10", "!spellCore.endsWith([1, 2, 3], 10)"]
      ]
    }
  ]
})

////////////////
// ## `ordinal` rule
//    e.g. "first"
////////////////

/**
 * Ordinal numbers (`first`, `second`, `last`, etc.), mapped to numeric literals via `VALUE_MAP`.
 * TODO: sixty-fifth, two hundred forty ninth... with custom parser?
 */
class ordinal extends P.Pattern {
  @proto static matchGroup = "ordinal"
  @proto static pattern =
    /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|penultimate|final|last|top|bottom)$/
  @proto static VALUE_MAP = {
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
  }

  getAST(match: P.MatchFor<this>): P.ASTNumericLiteral {
    const { value, raw } = match
    return new P.ASTNumericLiteral(match, { value, raw })
  }
}
lists.addRule(ordinal, {
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
})

////////////////
// ## `position_expression` rule
//    e.g. "item 1 of my-list"
////////////////

/**
 * Numeric-position index expression, e.g. `card 1 of the pile`, `card #2 of the pile`.
 * - `{arg}` (e.g. `card`) captured for readability only, unused in output.
 * - NOTE: negative positions come from end of list, e.g. `card -1 of the pile`.
 * - NOTE: positions are **1-based** while Javascript is **0-based**, e.g. `item 1 of the array` => `array[0]`.
 * - Compiles to `spellCore.getItemOf(list, position)`.
 */
class position_expression extends SpellExpression<"arg|position|expression", ListItemData> {
  /** Note the item type of the list, while we can look it up -- see `noteItemType()`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (match) noteItemType(match, match.groups.expression)
    return match
  }
  /** An item of the list. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.data.itemType
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { position, expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "getItemOf",
      args: [P.matchAST(expression), P.matchAST(position)]
    })
  }
}
lists.addRule(position_expression, {
  syntax: "{arg:singular_identifier} {position:expression} of {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
        scope.variables?.add("n")
      },
      tests: [
        ["item 1 of my-list", "spellCore.getItemOf(my_list, 1)"],
        ["card 10 of deck", "spellCore.getItemOf(deck, 10)"],
        ["card n of the cards of the deck", "spellCore.getItemOf(deck.cards, n)"]
      ]
    }
  ]
})

////////////////
// ## `ordinal_position_expression` rule
//    e.g. "the first item of my-list"
////////////////

/**
 * Ordinal-word index expression, e.g. `the first item of my-list`, `the tenth card of deck`.
 * - `{arg}` (e.g. `item`) captured for readability only, unused in output.
 * - Shares same `getItemOf` compile target as `position_expression`, with `{ordinal}` resolved to a number.
 */
class ordinal_position_expression extends SpellExpression<"ordinal|arg|expression", ListItemData> {
  /** Note the item type of the list, while we can look it up -- see `noteItemType()`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (match) noteItemType(match, match.groups.expression)
    return match
  }
  /** An item of the list, e.g. `Card` for `the first card of the deck`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.data.itemType
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { ordinal, expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "getItemOf",
      args: [P.matchAST(expression), P.matchAST(ordinal)]
    })
  }
}
lists.addRule(ordinal_position_expression, {
  syntax: "the {ordinal} {arg:singular_identifier} (in|of) {expression:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
        scope.variables?.add("words")
      },
      tests: [
        ["the first item of my-list", "spellCore.getItemOf(my_list, 1)"],
        ["the tenth card of deck", "spellCore.getItemOf(deck, 10)"],
        ["the penultimate word in words", "spellCore.getItemOf(words, -2)"]
      ]
    }
  ]
})

////////////////
// ## `random_item_expression` rule
//    e.g. "a random item of my-list"
////////////////

/**
 * Pick a single random item from list, e.g. `a random item of my-list`.
 * - `{arg}` (e.g. `item`) captured for readability only, unused in output.
 * - Compiles to `spellCore.randomItemOf(list)`.
 */
class random_item_expression extends SpellExpression<"arg|list", ListItemData> {
  /** Note the item type of the list, while we can look it up -- see `noteItemType()`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (match) noteItemType(match, match.groups.list)
    return match
  }
  /** An item of the list. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.data.itemType
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "randomItemOf",
      args: [P.matchAST(list)]
    })
  }
}
lists.addRule(random_item_expression, {
  syntax: "a random {arg:singular_identifier} (of|from|in) {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
      },
      tests: [
        ["a random item of my-list", "spellCore.randomItemOf(my_list)"],
        [`a random word in "some words"`, `spellCore.randomItemOf("some words")`],
        ["a random card from the deck", "spellCore.randomItemOf(deck)"]
      ]
    }
  ]
})

////////////////
// ## `random_items_expression` rule
//    e.g. "2 random items of my-list"
////////////////

/**
 * Pick a unique set of random items from list, returning an array.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - Compiles to `spellCore.randomItemsOf(list, count)`.
 * TODO: `two random items...`
 */
class random_items_expression extends SpellExpression<"number|arg|list"> {
  /** Some of the list's items:  the list's type. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.list.datatype
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { number, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "randomItemsOf",
      args: [P.matchAST(list), P.matchAST(number)]
    })
  }
}
lists.addRule(random_items_expression, {
  syntax: "{number} random {arg:plural_identifier} (of|from|in) {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
      },
      tests: [
        ["2 random items of my-list", "spellCore.randomItemsOf(my_list, 2)"],
        [`2 random words in "some other words"`, `spellCore.randomItemsOf("some other words", 2)`],
        ["3 random cards from deck", "spellCore.randomItemsOf(deck, 3)"]
      ]
    }
  ]
})

////////////////
// ## `range_between_expression` rule
//    e.g. "item 1 to 2 of my-list"
////////////////

/**
 * Range expression, e.g. `item 1 to 2 of my-list` => `spellCore.rangeBetween(my_list, 1, 2)`.
 * - `{arg}` (e.g. `item`) captured for readability only, unused in output.
 * - Returns a new list.
 * - NOTE: `start` is **1-based**.
 * - NOTE: `end` is inclusive!
 */
class range_between_expression extends SpellExpression<"arg|start|end|list"> {
  /** Some of the list's items:  the list's type. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.list.datatype
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list, start, end } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "rangeBetween",
      args: [P.matchAST(list), P.matchAST(start), P.matchAST(end)]
    })
  }
}
lists.addRule(range_between_expression, {
  syntax: "{arg:variable} {start:expression} to {end:expression} (of|in|from) {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
      },
      tests: [
        ["item 1 to 2 of my-list", "spellCore.rangeBetween(my_list, 1, 2)"],
        [`word 2 to 3 in "some other words"`, `spellCore.rangeBetween("some other words", 2, 3)`],
        ["card 1 to 3 from deck", "spellCore.rangeBetween(deck, 1, 3)"]
      ]
    }
  ]
})

////////////////
// ## `range_starting_with_expression` rule
//    e.g. "items in my-list starting with thing"
////////////////

/**
 * Range expression starting at some item in list, inclusive, e.g. `items in my-list starting with thing`.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - Returns a new list.
 * - Compiles to `spellCore.rangeStartingAt(list, spellCore.itemOf(list, thing))` -- looks up `thing`'s
 *   position first, then takes range from there to end.
 * - If item is not found, returns an empty list. (???)
 */
class range_starting_with_expression extends SpellExpression<"arg|list|thing"> {
  /** Some of the list's items:  the list's type. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.list.datatype
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    const itemExpression = new P.ASTCoreMethodInvocation(match, {
      methodName: "itemOf",
      args: [P.matchAST(list), P.matchAST(thing)]
    })
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "rangeStartingAt",
      args: [P.matchAST(list), itemExpression]
    })
  }
}
lists.addRule(range_starting_with_expression, {
  syntax: "{arg:plural_identifier} (in|of) {list:expression} starting with {thing:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
      },
      tests: [
        [
          "items in my-list starting with thing",
          "spellCore.rangeStartingAt(my_list, spellCore.itemOf(my_list, thing))"
        ],
        [
          `words in "some words" starting with "some"`,
          `spellCore.rangeStartingAt("some words", spellCore.itemOf("some words", "some"))`
        ]
      ]
    }
  ]
})

////////////////
// ## `range_count_expression` rule
//    e.g. "top 2 items of my-list"
////////////////

/**
 * Alternative form of range expression.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - Returns a new list.
 * - e.g. `top 2 items of my-list` => `spellCore.rangeStartingAt(my_list, 1, 2)`.
 * TODO: restrict ordinals to `first`, `last`, `final`, `top`, etc
 */
class range_count_expression extends SpellExpression<"ordinal|number|arg|list"> {
  /** Some of the list's items:  the list's type. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.list.datatype
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list, ordinal, number } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "rangeStartingAt",
      args: [P.matchAST(list), P.matchAST(ordinal), P.matchAST(number)]
    })
  }
}
lists.addRule(range_count_expression, {
  syntax: "{ordinal} {number} {arg:plural_identifier} (of|in|from) {list:operand}",
  tests: [
    {
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
      },
      tests: [
        ["top 2 items of my-list", "spellCore.rangeStartingAt(my_list, 1, 2)"],
        [`first 2 words in "some other words"`, `spellCore.rangeStartingAt("some other words", 1, 2)`],
        ["last two cards from deck", "spellCore.rangeStartingAt(deck, -1, 2)"]
      ]
    }
  ]
})

////////////////
// ## `list_filter` rule
//    e.g. words in "a word list" where
////////////////

/**
 * List filter, e.g. `words in "a word list" where word starts with "a"`.
 * - Trailing `where` expects an inline expression as filter body (`{inline_expression}?`),
 *   parsed in a nested `MethodScope` where singularized `{arg}` (e.g. `word`
 *   for `words`) and `it` both map to current item.
 * - `priority: 2` -- preferred over lower-priority expression rules when tokens are ambiguous.
 * - Compiles to `spellCore.filter(list, (item) => { ... })`.
 */
class list_filter extends SpellExpression<"arg|list|body?"> {
  @proto static priority = 2

  /** Nested scope for filter body -- singularized `{arg}` variable, also aliased from `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    return getWhereScope(match, match.groups.arg, match.groups.list)
  }
  /** The items which pass:  the list's type. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.groups.list.datatype
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { arg, list } = match.groups
    const filter = getWhereMethod(match, arg, this.getBody(match))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "filter",
      args: [P.matchAST(list), filter]
    })
  }
}
lists.addRule(list_filter, {
  syntax: "the? {arg:plural_identifier} (in|of) {list:expression} where {inline_expression}?",
  tests: [
    {
      compileAs: "expression",
      showAll: true,
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
      },
      tests: [
        [`words in "a word list" where`, `spellCore.filter("a word list", (word) => {})`],
        [
          `words in "a word list" where word starts with "a"`,
          [`spellCore.filter("a word list", (word) => {`, `  return spellCore.startsWith(word, "a")`, `})`]
        ],
        [
          "the items in my-list where the id of the item > 1",
          [`spellCore.filter(my_list, (item) => {`, `  return (item.id > 1)`, `})`]
        ],
        [
          "the items in my-list where the id of it > 1",
          ["spellCore.filter(my_list, (item) => {", "  return (item.id > 1)", "})"]
        ],
        [
          "the items in my-list where its id > 1",
          [`spellCore.filter(my_list, (item) => {`, `  return (item.id > 1)`, `})`]
        ]
      ]
    }
  ]
})

////////////////
// ## `list_membership_test` rule
//    e.g. "my-list has items where"
////////////////

/**
 * Set membership test, e.g. `my-list has items where the item is 1`.
 * - A postfix suffix:  the list is the expression before it, e.g. `the foo of the bar has items where ...`.
 * - Trailing `where` expects an inline expression as predicate (`{inline_expression}?`) -- see `getWhereScope()`.
 *   NOTE: so it eats the rest of the line, and is always the last suffix.
 * - Compiles to `spellCore.any(list, (item) => { ... })`, negated (wrapped in `NotExpression`) unless
 *   `operator` is exactly `has`.
 */
class list_membership_test extends PostfixOperatorSuffix<"operator|arg|body?"> {
  @proto static precedence = Precedence.comparison

  /**
   * Nested scope for predicate body -- singularized `{arg}` variable, also aliased from `it`.
   * - NOTE: its item type is unknown:  the list is the expression BEFORE us, which a suffix can't see.
   */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    return getWhereScope(match, match.groups.arg, undefined)
  }
  /** Negated unless `operator` is exactly `has`. */
  shouldNegateOutput(operator: P.Match): boolean {
    return operator.value !== "has"
  }
  compileASTExpression(match: P.MatchFor<this>, { lhs }: { lhs?: P.ASTExpression }): P.ASTCoreMethodInvocation {
    const filter = getWhereMethod(match, match.groups.arg, this.getBody(match))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "any",
      args: [lhs!, filter],
      datatype: "choice"
    })
  }
}
lists.addRule(list_membership_test, {
  syntax: "(operator:has|has no|doesnt have|does not have) {arg:plural_identifier} where {inline_expression}?",
  tests: [
    {
      compileAs: "expression",
      showAll: true,
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("bar")
      },
      tests: [
        ["my-list has items where", "spellCore.any(my_list, (item) => {})"],
        ["my-list has items where the item is 1", ["spellCore.any(my_list, (item) => {", "  return (item == 1)", "})"]],
        ["my-list has items where it is 1", ["spellCore.any(my_list, (item) => {", "  return (item == 1)", "})"]],
        [
          "my-list has items where its foo is 1",
          ["spellCore.any(my_list, (item) => {", "  return (item.foo == 1)", "})"]
        ],
        ["my-list has no items where item is 1", ["!spellCore.any(my_list, (item) => {", "  return (item == 1)", "})"]],
        ["my-list has no items where it is 1", ["!spellCore.any(my_list, (item) => {", "  return (item == 1)", "})"]],
        [
          "my-list doesnt have items where item is 1",
          ["!spellCore.any(my_list, (item) => {", "  return (item == 1)", "})"]
        ],
        [
          "the foo of the bar does not have items where item is 1",
          ["!spellCore.any(bar.foo, (item) => {", "  return (item == 1)", "})"]
        ]
      ]
    }
  ]
})

////////////////////////////////////////
// # Adding to list (in-place)
////////////////////////////////////////

////////////////
// ## `list_add` rule
//    e.g. "add thing to the start of my-list"
////////////////

/**
 * Add to list, e.g. `add thing to my-list`, `add thing to the front of my-list`.
 * - Compiles to `spellCore.prepend(list, thing)` when `method` is `start`/`front`/`top`,
 *   else `spellCore.append(list, thing)`.
 */
class list_add extends SpellStatement<"thing|method?|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list, method } = match.groups
    const spellMethod = method && ["start", "front", "top"].includes(method.value) ? "prepend" : "append"
    return new P.ASTCoreMethodInvocation(match, {
      methodName: spellMethod,
      args: [P.matchAST(list), P.matchAST(thing)]
    })
  }
}
lists.addRule(list_add, {
  syntax: "add {thing:expression} to (the (method:start|front|top|end|back|bottom) of)? {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
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
})

////////////////
// ## `list_prepend` rule
//    e.g. "prepend thing to my-list"
////////////////

/** Prepend to list, e.g. `prepend thing to my-list` => `spellCore.prepend(my_list, thing)`. */
class list_prepend extends SpellStatement<"thing|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "prepend",
      args: [P.matchAST(list), P.matchAST(thing)]
    })
  }
}
lists.addRule(list_prepend, {
  syntax: "prepend {thing:expression} to {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
      },
      tests: [["prepend thing to my-list", "spellCore.prepend(my_list, thing)"]]
    }
  ]
})

////////////////
// ## `list_append` rule
//    e.g. "append thing to my-list"
////////////////

/** Append to list, e.g. `append thing to my-list` => `spellCore.append(my_list, thing)`. */
class list_append extends SpellStatement<"thing|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "append",
      args: [P.matchAST(list), P.matchAST(thing)]
    })
  }
}
lists.addRule(list_append, {
  syntax: "append {thing:expression} to {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
      },
      tests: [["append thing to my-list", "spellCore.append(my_list, thing)"]]
    }
  ]
})

////////////////////////////////////////
// # Add to middle of list, pushing existing items out of the way
////////////////////////////////////////

// TODO: Add to middle of list, pushing existing items out of the way.
//       "add {thing:expression} to position {position:expression} of {list:expression}",

////////////////
// ## `list_add_relative` rule
//    e.g. "add thing to my-list before other-thing"
////////////////

/**
 * Add to list before/after some other item, e.g. `add thing to my-list before other-thing`.
 * - Compiles to `spellCore.addAtPosition(list, position, thing)`, where `position` is `other-thing`'s
 *   index (via `itemOf`), `+ 1` for `after`.
 * TODO: `relative_position_expression` rule?
 */
class list_add_relative extends SpellStatement<"thing|list|operator|item"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list, operator, item } = match.groups
    let position: P.ASTExpression = new P.ASTCoreMethodInvocation(match, {
      methodName: "itemOf",
      args: [P.matchAST(list), P.matchAST(item)]
    })
    if (operator.value === "after") {
      position = new P.ASTInfixExpression(match, {
        lhs: position,
        operator: "+",
        rhs: new P.ASTNumericLiteral(match, { value: 1 })
      })
    }
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "addAtPosition",
      args: [P.matchAST(list), position, P.matchAST(thing)]
    })
  }
}
lists.addRule(list_add_relative, {
  syntax: "add {thing:expression} to {list:expression} (operator:before|after) {item:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
        scope.variables?.add("other-thing")
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
})

////////////////////////////////////////
// # Removing from list (in-place)
////////////////////////////////////////

////////////////
// ## `list_empty` rule
//    e.g. "empty my-list"
////////////////

/**
 * Empty a list in-place, e.g. `empty my-list` => `spellCore.clear(my_list)`.
 * TODO: make `empty` and/or `clear` a generic statement???
 */
class list_empty extends SpellStatement<"list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "clear",
      args: [P.matchAST(list)]
    })
  }
}
lists.addRule(list_empty, {
  syntax: "(empty|clear) {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("deck")
      },
      tests: [
        ["empty my-list", "spellCore.clear(my_list)"],
        ["clear the cards of the deck", "spellCore.clear(deck.cards)"]
      ]
    }
  ]
})

////////////////
// ## `list_remove_ordinal` rule
//    e.g. "remove last card of deck"
////////////////

/**
 * Remove one item from list by ordinal position, e.g. `remove last card of deck` =>
 * `spellCore.removeItemOf(deck, -1)`.
 * - `{arg}` (e.g. `card`) captured for readability only, unused in output.
 */
class list_remove_ordinal extends SpellStatement<"position|arg|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { position, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeItemOf",
      args: [P.matchAST(list), P.matchAST(position)]
    })
  }
}
lists.addRule(list_remove_ordinal, {
  syntax: "remove the? {position:ordinal} {arg:singular_identifier} of {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
      },
      tests: [
        ["remove last card of deck", "spellCore.removeItemOf(deck, -1)"],
        ["remove the first card of the deck", "spellCore.removeItemOf(deck, 1)"]
      ]
    }
  ]
})

////////////////
// ## `list_remove_position` rule
//    e.g. "remove item 4 of my-list"
////////////////

/**
 * Remove one item from list by numeric position.
 * - `{arg}` (e.g. `item`) captured for readability only, unused in output.
 * - Compiles to `spellCore.removeItemOf(list, number)`, e.g. `remove item 4 of my-list` =>
 *   `spellCore.removeItemOf(my_list, 4)`.
 */
class list_remove_position extends SpellStatement<"arg|number|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { number, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeItemOf",
      args: [P.matchAST(list), P.matchAST(number)]
    })
  }
}
lists.addRule(list_remove_position, {
  syntax: "remove {arg:singular_identifier} {number:expression} of {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
      },
      tests: [["remove item 4 of my-list", "spellCore.removeItemOf(my_list, 4)"]]
    }
  ]
})

////////////////
// ## `list_remove_range` rule
//    e.g. "remove items 2 to 4 of my-list"
////////////////

/**
 * Remove range of items from list, e.g. `remove items 2 to 4 of my-list`.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - NOTE: `start` is **1-based**.
 * - NOTE: `end` is inclusive!
 */
class list_remove_range extends SpellStatement<"arg|start|end|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { start, end, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeRangeBetween",
      args: [P.matchAST(list), P.matchAST(start), P.matchAST(end)]
    })
  }
}
lists.addRule(list_remove_range, {
  syntax: "remove {arg:plural_identifier} {start:expression} to {end:expression} of {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
      },
      tests: [["remove items 2 to 4 of my-list", "spellCore.removeRangeBetween(my_list, 2, 4)"]]
    }
  ]
})

////////////////
// ## `list_remove_range_ordinal` rule
//    e.g. "remove first to third cards of the deck"
////////////////

/**
 * Remove range of items from list using ordinal words for both ends, e.g.
 * `remove first to third cards of the deck` => `spellCore.removeRangeBetween(deck, 1, 3)`.
 * - `{arg}` (e.g. `cards`) captured for readability only, unused in output.
 */
class list_remove_range_ordinal extends SpellStatement<"start|end|arg|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { start, end, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeRangeBetween",
      args: [P.matchAST(list), P.matchAST(start), P.matchAST(end)]
    })
  }
}
lists.addRule(list_remove_range_ordinal, {
  syntax: "remove {start:ordinal} to {end:ordinal} {arg:plural_identifier} of {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
      },
      tests: [["remove first to third cards of the deck", "spellCore.removeRangeBetween(deck, 1, 3)"]]
    }
  ]
})

// TODO: `remove last card from the deck`
// TODO: `remove last two cards from the deck`

////////////////
// ## `list_remove` rule
//    e.g. "remove thing from my-list"
////////////////

/**
 * Remove all instances of something from a list.
 * - Compiles to `spellCore.remove(list, thing)`, e.g. `remove thing from my-list` =>
 *   `spellCore.remove(my_list, thing)`.
 */
class list_remove extends SpellStatement<"thing|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "remove",
      args: [P.matchAST(list), P.matchAST(thing)]
    })
  }
}
lists.addRule(list_remove, {
  syntax: "remove {thing:expression} from {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("my-list")
      },
      tests: [["remove thing from my-list", "spellCore.remove(my_list, thing)"]]
    }
  ]
})

////////////////
// ## `list_remove_where` rule
//    e.g. "remove items from my-list where"
////////////////

/**
 * Remove all items from list where condition is true, e.g. `remove items from my-list where item is not "ace"`.
 * - Trailing `where` expects an inline expression as predicate (`{inline_expression}?`) -- see `getWhereScope()`.
 * - Compiles to `spellCore.removeWhere(list, (item) => { ... })`.
 */
class list_remove_where extends SpellStatement<"arg|list|body?"> {
  @proto static alias = "statement"

  /** Nested scope for predicate body -- singularized `{arg}` variable, also aliased from `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    return getWhereScope(match, match.groups.arg, match.groups.list)
  }

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { arg, list } = match.groups
    const filter = getWhereMethod(match, arg, this.getBody(match))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeWhere",
      args: [P.matchAST(list), filter]
    })
  }
}
lists.addRule(list_remove_where, {
  syntax: "remove {arg:plural_identifier} (in|of|from) {list:expression} where {inline_expression}?",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
        scope.variables?.add("my-list")
        scope.constants?.add("clubs")
      },
      tests: [
        ["remove items from my-list where", "spellCore.removeWhere(my_list, (item) => {})"],
        [
          `remove items from my-list where item is not "ace"`,
          [`spellCore.removeWhere(my_list, (item) => {`, `  return (item != "ace")`, `})`]
        ],
        [
          "remove cards in deck where the suit of the card is clubs",
          ["spellCore.removeWhere(deck, (card) => {", "  return (card.suit == 'clubs')", "})"]
        ],
        [
          "remove cards in deck where the suit of it is clubs",
          ["spellCore.removeWhere(deck, (card) => {", "  return (card.suit == 'clubs')", "})"]
        ],
        [
          "remove cards in deck where its suit is clubs",
          ["spellCore.removeWhere(deck, (card) => {", "  return (card.suit == 'clubs')", "})"]
        ]
      ]
    }
  ]
})

////////////////////////////////////////
// # Random (in-place) list manipulation
////////////////////////////////////////

////////////////
// ## `list_reverse` rule
//    e.g. "reverse the cards of the deck"
////////////////

/** Reverse list in-place, e.g. `reverse my-list` => `spellCore.reverse(my_list)`. */
class list_reverse extends SpellStatement<"arg?|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "reverse",
      args: [P.matchAST(list)]
    })
  }
}
lists.addRule(list_reverse, {
  syntax: "reverse ((the? {arg:plural_identifier}) (in|of))? {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
        scope.variables?.add("my-list")
      },
      tests: [
        ["reverse the cards of the deck", "spellCore.reverse(deck)"],
        ["reverse my-list", "spellCore.reverse(my_list)"]
      ]
    }
  ]
})

////////////////
// ## `list_shuffle` rule
//    e.g. "shuffle cards of deck"
////////////////

/** Shuffle (randomize) list in-place, e.g. `shuffle my-list` => `spellCore.randomize(my_list)`. */
class list_shuffle extends SpellStatement<"arg?|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "randomize",
      args: [P.matchAST(list)]
    })
  }
}
lists.addRule(list_shuffle, {
  syntax: "(randomize|shuffle) ((the? {arg:plural_identifier}) (in|of))? {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
        scope.variables?.add("my-list")
      },
      tests: [
        ["shuffle cards of deck", "spellCore.randomize(deck)"],
        ["shuffle the cards of the deck", "spellCore.randomize(deck)"],
        ["randomize my-list", "spellCore.randomize(my_list)"]
      ]
    }
  ]
})

////////////////
// ## `repeat_n_times` rule
//    e.g. "repeat 1 time:"
////////////////

/**
 * Repeat an action `N` times, e.g. `repeat 3 times: print the number`.
 * - Both a `statement` and an `expression` -- usable inline or as a block.
 * - Body runs as a nested block or inline statement (`{statement_body}?`);
 *   current iteration number, from 1, is available as `number` (also aliased from `it`).
 * - Compiles to `spellCore.map(spellCore.countTo(number), (number) => { ... })`, or
 *   `await spellCore.forEachSequential(...)` if body contains an `await` (`method.isAsync`).
 */
class repeat_n_times extends SpellStatement<"number|body?"> {
  @proto static alias = ["statement", "expression"]

  /** Nested scope for body -- `number` variable (current iteration index), also aliased from `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    return new P.MethodScope({
      parentScope: match.scope,
      args: [new P.ScopeVariable({ name: "number", datatype: "number" })],
      mapItTo: "number",
      itDatatype: "number",
      declaredBy: match
    })
  }

  /**
   * Build `map`/`forEachSequential` call over `countTo(number)` -- runs `number` times, NOT one more.
   * - SIDE EFFECT: switches to `forEachSequential` + wraps result in `AwaitExpression` when body's
   *   `method.isAsync` -- set by an `await` expression somewhere in body.
   */
  getAST(match: P.MatchFor<this>): P.ASTExpression {
    const { number } = match.groups
    const method = new P.ASTMethodDefinition(match, {
      inline: true,
      args: [new P.ASTVariableExpression(match, { name: "number" })],
      body: P.matchAST<MethodBody>(this.getBody(match))
    })
    const countTo = new P.ASTCoreMethodInvocation(match, { methodName: "countTo", args: [P.matchAST(number)] })
    const expression = new P.ASTCoreMethodInvocation(match, {
      methodName: method.isAsync ? "forEachSequential" : "map",
      args: [countTo, method]
    })
    if (method.isAsync) return new P.ASTAwaitExpression(match, { expression })
    return expression
  }
}
lists.addRule(repeat_n_times, {
  syntax: "repeat {number:expression} (time|times) :? {statement_body}?",
  tests: [
    {
      compileAs: "block",
      tests: [
        {
          title: "No statements",
          input: "repeat 1 time:",
          output: "spellCore.map(spellCore.countTo(1), (number) => {})"
        },
        {
          title: "Inline statement",
          input: "repeat 3 times: print the number",
          output: ["spellCore.map(spellCore.countTo(3), (number) => {", "  return spellCore.console.log(number)", "})"]
        },
        {
          title: "Nested block statement",
          input: ["repeat 3 times:", "\tprint it"],
          output: ["spellCore.map(spellCore.countTo(3), (number) => {", "  spellCore.console.log(number)", "})"]
        },
        {
          title: "Error if nested block and inline statement",
          input: ["repeat 3 times: print 1", "\tprint it"],
          output: [
            "spellCore.map(spellCore.countTo(3), (number) => {",
            "  spellCore.console.log(number)",
            "})",
            "/* PARSE ERROR: Got both inline statement and nested block */"
          ]
        }
      ]
    }
  ]
})

////////////////
// ## `list_iteration` rule
//    e.g. "for each card in deck:"
////////////////

/**
 * Generic `for each` list iteration, e.g. `for each card in deck:`, `for item, index in my-list:`.
 * - Optional `{position}` (`for item, index in ...`) adds a numeric index arg alongside `{item}`.
 * - Both a `statement` and an `expression` -- usable inline or as a block.
 * - Body runs as nested block or inline statement; `{item}`'s value is also aliased from `it`.
 * - Compiles to `spellCore.map(list, (item, position?) => { ... })`, or `await
 *   spellCore.forEachSequential(...)` if body contains an `await`.
 * TODO: can work for object enumeration as well (maybe with 'of'?)
 * TODO: return values e.g. array.map() ???
 */
class list_iteration extends SpellStatement<"item|position?|list|body?"> {
  @proto static alias = ["statement", "expression"]

  /**
   * Nested scope for body -- `{item}` (and optional numeric `{position}`) vars, `it` aliased to `{item}`.
   * - `{item}` and `it` are what the list holds, e.g. `Card` for `for each card in the deck` -- looked up now,
   *   while parsing:  a body parses in this scope.
   */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const { item, position, list } = match.groups
    const datatype = match.scope.getItemType(list.datatype)
    const args: P.ScopeVariable[] = [new P.ScopeVariable({ name: item.value, datatype, declaredBy: item })]
    if (position) args.push(new P.ScopeVariable({ name: position.value, datatype: "number", declaredBy: position }))
    return new P.MethodScope({
      parentScope: match.scope,
      args,
      mapItTo: item.value,
      itDatatype: datatype,
      declaredBy: match
    })
  }
  /**
   * Build `map`/`forEachSequential` call over `{list}`.
   * - SIDE EFFECT: switches to `forEachSequential` + wraps result in `AwaitExpression` when body's
   *   `method.isAsync` -- set by an `await` expression somewhere in body.
   */
  getAST(match: P.MatchFor<this>): P.ASTExpression {
    const { list, item, position } = match.groups
    const args = [new P.ASTVariableExpression(item, { name: item.value })]
    if (position) args.push(new P.ASTVariableExpression(position))
    const method = new P.ASTMethodDefinition(match, {
      inline: true,
      args,
      body: P.matchAST<MethodBody>(this.getBody(match))
    })

    if (method.isAsync) {
      // console.warn(match.inputText)
      return new P.ASTAwaitExpression(match, {
        expression: new P.ASTCoreMethodInvocation(match, {
          methodName: "forEachSequential",
          args: [P.matchAST(list), method]
        })
      })
    }

    return new P.ASTCoreMethodInvocation(match, {
      methodName: "map", // TODO...
      args: [P.matchAST(list), method]
    })
  }
}
lists.addRule(list_iteration, {
  syntax:
    "for each? {item:singular_identifier} ((and|,) {position:singular_identifier})? (in|of) {list:expression} :? {statement_body}?",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
        scope.variables?.add("my-list")
        scope.variables?.add("messages")
      },
      tests: [
        ["for each card in deck:", "spellCore.map(deck, (card) => {})"],
        ["for item, index in my-list:", "spellCore.map(my_list, (item, index) => {})"],
        [
          `for each card in deck: set the direction of the card to "down"`,
          [`spellCore.map(deck, (card) => {`, `  card.direction = "down"`, `})`]
        ],
        [
          `for each card in deck: set the direction of it to "down"`,
          [`spellCore.map(deck, (card) => {`, `  card.direction = "down"`, `})`]
        ],
        [
          "for message, index in messages: add message + index to messages",
          [
            `spellCore.map(messages, (message, index) => {`,
            `  return spellCore.append(messages, message + index)`,
            `})`
          ]
        ],
        [
          "for message, index in messages: add it + index to messages",
          [
            `spellCore.map(messages, (message, index) => {`,
            `  return spellCore.append(messages, message + index)`,
            `})`
          ]
        ],
        [
          "for message, index in messages: set its list to messages",
          [`spellCore.map(messages, (message, index) => {`, `  message.list = messages`, `})`]
        ],

        [
          `for each card in deck:\n\tset the direction of the card to "down"`,
          [`spellCore.map(deck, (card) => {`, `  card.direction = "down"`, `})`]
        ],
        [
          [`for each card in deck:`, `\tset the direction of it to "down"`],
          [`spellCore.map(deck, (card) => {`, `  card.direction = "down"`, `})`]
        ],
        [
          [`for each card in deck:`, `\tset the direction of the card to "down"`, `\tset the value of the card to 10`],
          [`spellCore.map(deck, (card) => {`, `  card.direction = "down"`, `  card.value = 10`, `})`]
        ],
        [
          ["for message and index in messages:", "\tif index is greater than 2 add message to messages"],
          [
            `spellCore.map(messages, (message, index) => {`,
            `  if (index > 2) { spellCore.append(messages, message) }`,
            `})`
          ]
        ]
      ]
    }
  ]
})

////////////////
// ## `list_range_iteration` rule
//    e.g. "for each number from 1 to 10:"
////////////////

/**
 * Number range-specific iteration, e.g. `for each number from 1 to 10:`.
 * - Compiles to `spellCore.map(spellCore.getRange(start, end), (item) => { ... })`, or `await
 *   spellCore.forEachSequential(...)` if body contains an `await`.
 * TODO: this only works if you `from 1 to 10`, a more general solution which also supports `in {list}` is needed.
 * TODO: `down` is not accounted for in the output
 */
class list_range_iteration extends SpellStatement<"item|start|end|body?"> {
  @proto static alias = "statement"

  /**
   * Nested scope for body -- singularized `{item}` variable.
   * - NOTE: unlike sibling iteration rules (`repeat_n_times`, `list_iteration`), doesn't pass
   *   `mapItTo` -- `it` is NOT aliased to `{item}` here, possibly a missed feature.
   */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const { item } = match.groups
    return new P.MethodScope({
      parentScope: match.scope,
      args: [new P.ScopeVariable({ name: singularize(item.value), declaredBy: item })],
      declaredBy: match
    })
  }
  getAST(match: P.MatchFor<this>): P.ASTExpression {
    const { item, start, end } = match.groups
    const getRange = new P.ASTCoreMethodInvocation(match, {
      methodName: "getRange",
      args: [P.matchAST(start), P.matchAST(end)]
    })
    const method = new P.ASTMethodDefinition(match, {
      inline: true,
      args: [new P.ASTVariableExpression(item)],
      body: P.matchAST<MethodBody>(this.getBody(match))
    })
    const expression = new P.ASTCoreMethodInvocation(match, {
      methodName: method.isAsync ? "forEachSequential" : "map",
      args: [getRange, method]
    })
    if (method.isAsync) return new P.ASTAwaitExpression(match, { expression })
    return expression
  }
}
lists.addRule(list_range_iteration, {
  syntax: "for each? {item:singular_identifier} from {start:expression} down? to {end:expression} :? {statement_body}?",
  tests: [
    {
      compileAs: "block",
      tests: [
        ["for each number from 1 to 10:", "spellCore.map(spellCore.getRange(1, 10), (number) => {})"],
        [
          "for each number from 1 to 10: print the number",
          ["spellCore.map(spellCore.getRange(1, 10), (number) => {", "  return spellCore.console.log(number)", "})"]
        ],
        [
          "for each number from 1 to 10:\n\tprint the number",
          ["spellCore.map(spellCore.getRange(1, 10), (number) => {", "  spellCore.console.log(number)", "})"]
        ]
      ]
    }
  ]
})

////////////////
// ## Shared types
////////////////

/** What `P.ASTMethodDefinition`'s `body` prop accepts. */
type MethodBody = P.ASTStatementBlock | P.ASTStatement | P.ASTExpression

////////////////
// ## `where` clause helpers
//    shared by `list_filter`, `list_membership_test` and `list_remove_where`
////////////////

/**
 * Nested scope for `match`'s `where` clause's predicate:  singularized `arg` is the current item, also aliased
 * from `it`, e.g. `word` for `words in my-list where word starts with "a"`.
 * - Both are what `list` holds, if we can tell, e.g. `Card` for `the cards in the deck where ...` -- looked up
 *   now, while parsing:  the predicate parses in this scope.
 */
function getWhereScope(match: P.Match, arg: P.Match, list: P.Match | undefined): P.MethodScope {
  const name = singularize(arg.value)
  const datatype = list && match.scope.getItemType(list.datatype)
  return new P.MethodScope({
    parentScope: match.scope,
    args: [new P.ScopeVariable({ name, datatype, declaredBy: arg })],
    mapItTo: name,
    itDatatype: datatype,
    declaredBy: arg
  })
}

/** Inline method for a `where` clause's predicate `body`, e.g. `(word) => word.startsWith("a")`. */
function getWhereMethod(match: P.Match, arg: P.Match, body: P.Match | undefined): P.ASTMethodDefinition {
  return new P.ASTMethodDefinition(body || match, {
    inline: true,
    args: [new P.ASTVariableExpression(arg, { name: singularize(arg.value) })],
    body: P.matchAST(body)
  })
}

////////////////
// ## Item types
//    shared by the rules which pick an item out of a list, e.g. `ordinal_position_expression`
////////////////

/** What a rule picking an item out of a list stashes on its match. */
type ListItemData = {
  /** What the list holds, e.g. `Card` -- looked up while parsing, see `noteItemType()`.  `undefined` if unknown. */
  itemType?: P.Datatype
}

/**
 * Note on `match`, WHILE PARSING, what `list` holds -- its `data.itemType`, e.g. `Card` for `the deck`.
 * - Why now:  it's a scope lookup -- a `Deck`'s item type is on its `TypeScope` -- and `getDatatype()` mustn't look.
 */
function noteItemType(match: P.Match<P.AnyGroups, ListItemData>, list: P.Match): void {
  match.data.itemType = match.scope.getItemType(list.datatype)
}
