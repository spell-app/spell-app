/**
 * Rules for dealing with lists -- literals, membership, indexing, in-place mutation, iteration.
 * - NOTE: several rules capture a `{arg:singular_variable}`/`{arg:plural_variable}` classifier noun
 *   (e.g. `card`, `items`) that's matched for readability only and never read back out of `match.groups`.
 * TODO: sort
 */

import { proto, singularize } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement } from "./Statement"
import { SpellExpression, InfixOperatorSuffix } from "./expressions"

/** What `P.ASTMethodDefinition`'s `body` prop accepts. */
type MethodBody = P.ASTStatementBlock | P.ASTStatement | P.ASTExpression

/**
 * Narrow `match.AST` to a concrete `P.ASTNode` subtype.
 * - `Match.AST` (`src/parser/Match.ts`) is always typed as `ASTNode` because `Rule.getAST()`'s return type
 *   isn't parameterized per the specific rule a rulex group refers to -- only the rule's own semantics
 *   (which we know, writing the rule) tell us which concrete node type comes back.
 * - Narrow once here instead of casting inline at every call site.
 */
function astAs<T extends P.ASTNode = P.ASTExpression>(match: P.Match): T
function astAs<T extends P.ASTNode = P.ASTExpression>(match: P.Match | undefined): T | undefined
function astAs<T extends P.ASTNode = P.ASTExpression>(match: P.Match | undefined): T | undefined {
  return match?.AST as T | undefined
}

/**
 * Build a `MethodScope`, typed to accept `parentScope` etc. directly.
 * - TODO: drop this helper and just call `new P.MethodScope(props)` at call sites?  `classes.ts` has an
 *   identical copy.
 */
function newMethodScope(props: P.MethodScopeProps): P.MethodScope {
  return new P.MethodScope(props)
}

/**
 * List of identifiers and/or numbers, e.g. `clubs or hearts`, `jack, queen, king`.
 * - NOTE: not a generic `expression` -- deliberately narrow to known variables / constants / numbers,
 *   else it'd swallow anything.
 */
export class identifier_list extends P.Repeat {
  @proto static syntax = "[({known_variable}|{constant}|{number})(,|or|and|nor)]"
  @proto static datatype = "array" // TODO: array of what?

  getAST(match: P.MatchFor<this>): P.ASTListExpression {
    const { items } = match
    return new P.ASTListExpression(match, { items: items.map((item) => astAs(item)) })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Bracketed list (array) literal, e.g. `[1,2 , true,false ]`.
 * TODO: nested lists????
 */
export class bracketed_list extends P.Sequence<"list?"> {
  @proto static alias = "expression"
  @proto static datatype = "array" // TODO: array of what?
  @proto static syntax = "\\[ [list:{expression},]? \\]"
  @proto static testRule = "\\["

  getAST(match: P.MatchFor<this>): P.ASTListExpression {
    const { list } = match.groups
    const items = list ? list.items.map((item) => astAs(item)) : undefined
    return new P.ASTListExpression(match, { items })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Duplicate a list, e.g. `a copy of the piles` => `spellCore.duplicateCollection(piles)`.
 * - QUESTIONABLE SYNTAX: `as (a|an) {type}` clause ??? -- picks constructor for result, e.g.
 *   `a duplicate of list the piles as a list` => `spellCore.duplicateCollection(piles, List)`.
 */
export class copy_list extends SpellExpression<"expression|type?"> {
  @proto static alias = "expression"
  @proto static syntax = "a (copy|duplicate) of list? {expression} (as (a|an) {type:known_type})?"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { expression, type } = match.groups
    const args = [astAs(expression)]
    if (type) args.push(astAs(type))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "duplicateCollection",
      args
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Merge a set of lists together, e.g. `merge the piles` => `spellCore.mergeCollections(piles)`.
 * - QUESTIONABLE SYNTAX: `(as|into) (a|an) new? {type}` clause picks constructor for result, e.g.
 *   `merge the piles as a list` => `spellCore.mergeCollections(piles, List)`.
 */
export class merge_lists extends SpellExpression<"expression|type?"> {
  @proto static alias = "expression"
  @proto static syntax = "merge lists? {expression} ((as|into) (a|an) new? {type:known_type})?"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { expression, type } = match.groups
    const args = [astAs(expression)]
    if (type) args.push(astAs(type))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "mergeCollections",
      args
    })
  }

  static tests: P.RuleTests = [
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
}

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

/**
 * Return length of a list, e.g. `number of items in my-list` => `spellCore.itemCountOf(my_list)`.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - `precedence: 3` -- preferred over lower-precedence expression rules when tokens are ambiguous.
 */
export class list_length extends SpellExpression<"arg|list"> {
  @proto static alias = "expression"
  @proto static syntax = "the? number of {arg:plural_variable} (in|of) {list:expression}"
  @proto static testRule = "…(number of)"
  @proto static precedence = 3

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "itemCountOf",
      args: [astAs(list)]
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Return position of an item in a list, e.g. `position of thing in my-list` => `spellCore.itemOf(my_list, thing)`.
 * - NOTE: position returned is **1-based**.
 * - Returns `undefined` if item is not found.
 * - `precedence: 3` -- preferred over lower-precedence expression rules when tokens are ambiguous.
 * TODO: `positions`, `last position`, `after...`
 */
export class list_position extends SpellExpression<"thing|list"> {
  @proto static alias = "expression"
  @proto static syntax = "the? position of {thing:expression} in {list:expression}"
  @proto static testRule = "…(position of)"
  @proto static precedence = 3

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "itemOf",
      args: [astAs(list), astAs(thing)]
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Does list start with some value, e.g. `my-list starts with thing` => `spellCore.startsWith(my_list, thing)`.
 * - `precedence: 11` -- high, so this infix suffix binds before lower-precedence operators.
 */
export class starts_with extends InfixOperatorSuffix<"operator|expression"> {
  @proto static alias = "expression_suffix"
  @proto static precedence = 11
  @proto static syntax =
    "(operator:starts with|does not start with|doesnt start with|doesn't start with) {expression:simple_expression}"

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

  static tests: P.RuleTests = [
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
}

/**
 * Does list end with some value, e.g. `my-list ends with thing` => `spellCore.endsWith(my_list, thing)`.
 */
export class ends_with extends InfixOperatorSuffix<"operator|expression"> {
  @proto static alias = "expression_suffix"
  @proto static syntax =
    "(operator:ends with|does not end with|doesnt end with|doesn't end with) {expression:simple_expression}"

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

  static tests: P.RuleTests = [
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
}

/**
 * Ordinal numbers (`first`, `second`, `last`, etc.), mapped to numeric literals via `VALUE_MAP`.
 * TODO: sixty-fifth, two hundred forty ninth... with custom parser?
 */
export class ordinal extends P.Pattern {
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

  static tests: P.RuleTests = [
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
}

/**
 * Numeric-position index expression, e.g. `card 1 of the pile`, `card #2 of the pile`.
 * - `{arg}` (e.g. `card`) captured for readability only, unused in output.
 * - NOTE: negative positions come from end of list, e.g. `card -1 of the pile`.
 * - NOTE: positions are **1-based** while Javascript is **0-based**, e.g. `item 1 of the array` => `array[0]`.
 * - Compiles to `spellCore.getItemOf(list, position)`.
 */
export class position_expression extends SpellExpression<"arg|position|expression"> {
  @proto static alias = "expression"
  @proto static syntax = "{arg:singular_variable} {position:expression} of {expression}"
  @proto static testRule = "…of"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { position, expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "getItemOf",
      args: [astAs(expression), astAs(position)]
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Ordinal-word index expression, e.g. `the first item of my-list`, `the tenth card of deck`.
 * - `{arg}` (e.g. `item`) captured for readability only, unused in output.
 * - Shares same `getItemOf` compile target as `position_expression`, with `{ordinal}` resolved to a number.
 */
export class ordinal_position_expression extends SpellExpression<"ordinal|arg|expression"> {
  @proto static alias = "expression"
  @proto static syntax = "the {ordinal} {arg:singular_variable} (in|of) {expression}"
  @proto static testRule = "…(in|of)"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { ordinal, expression } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "getItemOf",
      args: [astAs(expression), astAs(ordinal)]
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Pick a single random item from list, e.g. `a random item of my-list`.
 * - `{arg}` (e.g. `item`) captured for readability only, unused in output.
 * - Compiles to `spellCore.randomItemOf(list)`.
 */
export class random_item_expression extends SpellExpression<"arg|list"> {
  @proto static alias = "expression"
  @proto static syntax = "a random {arg:singular_variable} (of|from|in) {list:expression}"
  @proto static testRule = "a random"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "randomItemOf",
      args: [astAs(list)]
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Pick a unique set of random items from list, returning an array.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - Compiles to `spellCore.randomItemsOf(list, count)`.
 * TODO: `two random items...`
 */
export class random_items_expression extends SpellExpression<"number|arg|list"> {
  @proto static alias = "expression"
  @proto static syntax = "{number} random {arg:plural_variable} (of|from|in) {list:expression}"
  @proto static testRule = "…random"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { number, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "randomItemsOf",
      args: [astAs(list), astAs(number)]
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Range expression, e.g. `item 1 to 2 of my-list` => `spellCore.rangeBetween(my_list, 1, 2)`.
 * - `{arg}` (e.g. `item`) captured for readability only, unused in output.
 * - Returns a new list.
 * - NOTE: `start` is **1-based**.
 * - NOTE: `end` is inclusive!
 */
export class range_between_expression extends SpellExpression<"arg|start|end|list"> {
  @proto static alias = "expression"
  @proto static syntax = "{arg:variable} {start:expression} to {end:expression} (of|in|from) {list:expression}"
  @proto static testRule = "…(of|in|from)"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list, start, end } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "rangeBetween",
      args: [astAs(list), astAs(start), astAs(end)]
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Range expression starting at some item in list, inclusive, e.g. `items in my-list starting with thing`.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - Returns a new list.
 * - Compiles to `spellCore.rangeStartingAt(list, spellCore.itemOf(list, thing))` -- looks up `thing`'s
 *   position first, then takes range from there to end.
 * - If item is not found, returns an empty list. (???)
 */
export class range_starting_with_expression extends SpellExpression<"arg|list|thing"> {
  @proto static alias = "expression"
  @proto static syntax = "{arg:plural_variable} (in|of) {list:expression} starting with {thing:expression}"
  @proto static testRule = "…(starting with)"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    const itemExpression = new P.ASTCoreMethodInvocation(match, {
      methodName: "itemOf",
      args: [astAs(list), astAs(thing)]
    })
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "rangeStartingAt",
      args: [astAs(list), itemExpression]
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Alternative form of range expression.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - Returns a new list.
 * - e.g. `top 2 items of my-list` => `spellCore.rangeStartingAt(my_list, 1, 2)`.
 * TODO: restrict ordinals to `first`, `last`, `final`, `top`, etc
 */
export class range_count_expression extends SpellExpression<"ordinal|number|arg|list"> {
  @proto static alias = "expression"
  @proto static syntax = "{ordinal} {number} {arg:plural_variable} (of|in|from) {list:expression}"
  @proto static testRule = "…(of|in|from)"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list, ordinal, number } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "rangeStartingAt",
      args: [astAs(list), astAs(ordinal), astAs(number)]
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * List filter, e.g. `words in "a word list" where word starts with "a"`.
 * - Trailing `where` expects an inline `{expression}` statement or nested block as filter body
 *   (`wantsInlineStatement`), parsed in a nested `MethodScope` where singularized `{arg}` (e.g. `word`
 *   for `words`) and `it` both map to current item.
 * - `precedence: 2` -- preferred over lower-precedence expression rules when tokens are ambiguous.
 * - Compiles to `spellCore.filter(list, (item) => { ... })`.
 */
export class list_filter extends SpellExpression<"arg|list|inlineStatement?"> {
  @proto static alias = "expression"
  @proto static syntax = "the? {arg:plural_variable} (in|of) {list:expression} where"
  @proto static testRule = "…where"
  @proto static precedence = 2
  @proto static wantsInlineStatement = true
  @proto static parseInlineStatementAs = "expression"

  /** Nested scope for filter body -- singularized `{arg}` variable, also aliased from `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const arg = singularize(match.groups.arg.value)
    return newMethodScope({
      parentScope: match.scope,
      args: [new P.ScopeVariable(arg)],
      mapItTo: arg
    })
  }
  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { arg, list, inlineStatement } = match.groups
    const filter = new P.ASTMethodDefinition(inlineStatement || match, {
      inline: true,
      args: [new P.ASTVariableExpression(arg, { name: singularize(arg.value) })],
      body: astAs(inlineStatement)
    })
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "filter",
      args: [astAs(list), filter]
    })
  }

  static tests: P.RuleTests = [
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
          [`spellCore.filter("a word list", (word) => {`, `\treturn spellCore.startsWith(word, "a")`, `})`]
        ],
        [
          "the items in my-list where the id of the item > 1",
          [`spellCore.filter(my_list, (item) => {`, `\treturn (item.id > 1)`, `})`]
        ],
        [
          "the items in my-list where the id of it > 1",
          ["spellCore.filter(my_list, (item) => {", "\treturn (item.id > 1)", "})"]
        ],
        [
          "the items in my-list where its id > 1",
          [`spellCore.filter(my_list, (item) => {`, `\treturn (item.id > 1)`, `})`]
        ]
      ]
    }
  ]
}

/**
 * Set membership test, e.g. `my-list has items where the item is 1`.
 * - `isLeftRecursive` -- `{list}` on left, so chains after another expression (e.g. `bar.foo has items where`).
 * - Trailing `where` expects an inline `{expression}` statement or nested block as predicate.
 * - `precedence: 2` -- preferred over lower-precedence expression rules when tokens are ambiguous.
 * - Compiles to `spellCore.any(list, (item) => { ... })`, negated (wrapped in `NotExpression`) unless
 *   `operator` is exactly `has`.
 * TODO: this is a postfix_operator expression
 */
export class list_membership_test extends SpellExpression<"list|operator|arg|inlineStatement?"> {
  @proto static alias = "expression"
  @proto static syntax =
    "{list:simple_expression} (operator:has|has no|doesnt have|does not have) {arg:plural_variable} where"
  @proto static testRule = "…(has|have)"
  @proto static precedence = 2

  @proto static isLeftRecursive = true
  @proto static wantsInlineStatement = true
  @proto static parseInlineStatementAs = "expression"

  /** Nested scope for predicate body -- singularized `{arg}` variable, also aliased from `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const arg = singularize(match.groups.arg.value)
    return newMethodScope({
      parentScope: match.scope,
      args: [new P.ScopeVariable(arg)],
      mapItTo: arg
    })
  }
  getAST(match: P.MatchFor<this>): P.ASTExpression {
    const { list, operator, arg, inlineStatement } = match.groups
    const filter = new P.ASTMethodDefinition(inlineStatement || match, {
      inline: true,
      args: [new P.ASTVariableExpression(arg, { name: singularize(arg.value) })],
      body: astAs(inlineStatement)
    })
    const expression = new P.ASTCoreMethodInvocation(match, {
      methodName: "any",
      args: [astAs(list), filter],
      datatype: "boolean"
    })
    // Wrap in NotExpression for some operators
    if (operator.value === "has") return expression
    return new P.ASTNotExpression(match, { expression })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      showAll: true,
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("bar")
      },
      tests: [
        ["my-list has items where", "spellCore.any(my_list, (item) => {})"],
        ["my-list has items where the item is 1", ["spellCore.any(my_list, (item) => {", "\treturn (item == 1)", "})"]],
        ["my-list has items where it is 1", ["spellCore.any(my_list, (item) => {", "\treturn (item == 1)", "})"]],
        [
          "my-list has items where its foo is 1",
          ["spellCore.any(my_list, (item) => {", "\treturn (item.foo == 1)", "})"]
        ],
        ["my-list has no items where item is 1", ["!spellCore.any(my_list, (item) => {", "\treturn (item == 1)", "})"]],
        ["my-list has no items where it is 1", ["!spellCore.any(my_list, (item) => {", "\treturn (item == 1)", "})"]],
        [
          "my-list doesnt have items where item is 1",
          ["!spellCore.any(my_list, (item) => {", "\treturn (item == 1)", "})"]
        ],
        [
          "the foo of the bar does not have items where item is 1",
          ["!spellCore.any(bar.foo, (item) => {", "\treturn (item == 1)", "})"]
        ]
      ]
    }
  ]
}

////////////////
// ## Adding to list (in-place)
////////////////

/**
 * Add to list, e.g. `add thing to my-list`, `add thing to the front of my-list`.
 * - Compiles to `spellCore.prepend(list, thing)` when `method` is `start`/`front`/`top`,
 *   else `spellCore.append(list, thing)`.
 */
export class list_add extends SpellStatement<"thing|method?|list"> {
  @proto static alias = "statement"
  @proto static syntax =
    "add {thing:expression} to (the (method:start|front|top|end|back|bottom) of)? {list:expression}"
  @proto static testRule = "add"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list, method } = match.groups
    const spellMethod = method && ["start", "front", "top"].includes(method.value) ? "prepend" : "append"
    return new P.ASTCoreMethodInvocation(match, {
      methodName: spellMethod,
      args: [astAs(list), astAs(thing)]
    })
  }

  static tests: P.RuleTests = [
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
}

/** Prepend to list, e.g. `prepend thing to my-list` => `spellCore.prepend(my_list, thing)`. */
export class list_prepend extends SpellStatement<"thing|list"> {
  @proto static alias = "statement"
  @proto static syntax = "prepend {thing:expression} to {list:expression}"
  @proto static testRule = "prepend"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "prepend",
      args: [astAs(list), astAs(thing)]
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
      },
      tests: [["prepend thing to my-list", "spellCore.prepend(my_list, thing)"]]
    }
  ]
}

/** Append to list, e.g. `append thing to my-list` => `spellCore.append(my_list, thing)`. */
export class list_append extends SpellStatement<"thing|list"> {
  @proto static alias = "statement"
  @proto static syntax = "append {thing:expression} to {list:expression}"
  @proto static testRule = "append"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "append",
      args: [astAs(list), astAs(thing)]
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
      },
      tests: [["append thing to my-list", "spellCore.append(my_list, thing)"]]
    }
  ]
}

////////////////
// ## Add to middle of list, pushing existing items out of the way
////////////////

// TODO: Add to middle of list, pushing existing items out of the way.
//       "add {thing:expression} to position {position:expression} of {list:expression}",

/**
 * Add to list before/after some other item, e.g. `add thing to my-list before other-thing`.
 * - Compiles to `spellCore.addAtPosition(list, position, thing)`, where `position` is `other-thing`'s
 *   index (via `itemOf`), `+ 1` for `after`.
 * TODO: `relative_position_expression` rule?
 */
export class list_add_relative extends SpellStatement<"thing|list|operator|item"> {
  @proto static alias = "statement"
  @proto static syntax = "add {thing:expression} to {list:expression} (operator:before|after) {item:expression}"
  @proto static testRule = "add"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list, operator, item } = match.groups
    let position: P.ASTExpression = new P.ASTCoreMethodInvocation(match, {
      methodName: "itemOf",
      args: [astAs(list), astAs(item)]
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
      args: [astAs(list), position, astAs(thing)]
    })
  }

  static tests: P.RuleTests = [
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
}

////////////////
// ## Removing from list (in-place)
////////////////

/**
 * Empty a list in-place, e.g. `empty my-list` => `spellCore.clear(my_list)`.
 * TODO: make `empty` and/or `clear` a generic statement???
 */
export class list_empty extends SpellStatement<"list"> {
  @proto static alias = "statement"
  @proto static syntax = "(empty|clear) {list:expression}"
  @proto static testRule = "(empty|clear)"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "clear",
      args: [astAs(list)]
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Remove one item from list by ordinal position, e.g. `remove last card of deck` =>
 * `spellCore.removeItemOf(deck, -1)`.
 * - `{arg}` (e.g. `card`) captured for readability only, unused in output.
 */
export class list_remove_ordinal extends SpellStatement<"position|arg|list"> {
  @proto static alias = "statement"
  @proto static syntax = "remove the? {position:ordinal} {arg:singular_variable} of {list:expression}"
  @proto static testRule = "remove"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { position, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeItemOf",
      args: [astAs(list), astAs(position)]
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Remove one item from list by numeric position.
 * - `{arg}` (e.g. `item`) captured for readability only, unused in output.
 * - Compiles to `spellCore.removeItemOf(list, number)`, e.g. `remove item 4 of my-list` =>
 *   `spellCore.removeItemOf(my_list, 4)`.
 */
export class list_remove_position extends SpellStatement<"arg|number|list"> {
  @proto static alias = "statement"
  @proto static syntax = "remove {arg:singular_variable} {number:expression} of {list:expression}"
  @proto static testRule = "remove"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { number, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeItemOf",
      args: [astAs(list), astAs(number)]
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
      },
      tests: [["remove item 4 of my-list", "spellCore.removeItemOf(my_list, 4)"]]
    }
  ]
}

/**
 * Remove range of items from list, e.g. `remove items 2 to 4 of my-list`.
 * - `{arg}` (e.g. `items`) captured for readability only, unused in output.
 * - NOTE: `start` is **1-based**.
 * - NOTE: `end` is inclusive!
 */
export class list_remove_range extends SpellStatement<"arg|start|end|list"> {
  @proto static alias = "statement"
  @proto static syntax = "remove {arg:plural_variable} {start:expression} to {end:expression} of {list:expression}"
  @proto static testRule = "remove"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { start, end, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeRangeBetween",
      args: [astAs(list), astAs(start), astAs(end)]
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
      },
      tests: [["remove items 2 to 4 of my-list", "spellCore.removeRangeBetween(my_list, 2, 4)"]]
    }
  ]
}

/**
 * Remove range of items from list using ordinal words for both ends, e.g.
 * `remove first to third cards of the deck` => `spellCore.removeRangeBetween(deck, 1, 3)`.
 * - `{arg}` (e.g. `cards`) captured for readability only, unused in output.
 */
export class list_remove_range_ordinal extends SpellStatement<"start|end|arg|list"> {
  @proto static alias = "statement"
  @proto static syntax = "remove {start:ordinal} to {end:ordinal} {arg:plural_variable} of {list:expression}"
  @proto static testRule = "remove"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { start, end, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeRangeBetween",
      args: [astAs(list), astAs(start), astAs(end)]
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("deck")
      },
      tests: [["remove first to third cards of the deck", "spellCore.removeRangeBetween(deck, 1, 3)"]]
    }
  ]
}

// TODO: `remove last card from the deck`
// TODO: `remove last two cards from the deck`

/**
 * Remove all instances of something from a list.
 * - Compiles to `spellCore.remove(list, thing)`, e.g. `remove thing from my-list` =>
 *   `spellCore.remove(my_list, thing)`.
 */
export class list_remove extends SpellStatement<"thing|list"> {
  @proto static alias = "statement"
  @proto static syntax = "remove {thing:expression} from {list:expression}"
  @proto static testRule = "remove"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "remove",
      args: [astAs(list), astAs(thing)]
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("thing")
        scope.variables?.add("my-list")
      },
      tests: [["remove thing from my-list", "spellCore.remove(my_list, thing)"]]
    }
  ]
}

/**
 * Remove all items from list where condition is true, e.g. `remove items from my-list where item is not "ace"`.
 * - Trailing `where` expects an inline `{expression}` statement or nested block as predicate.
 * - Compiles to `spellCore.removeWhere(list, (item) => { ... })`.
 */
export class list_remove_where extends SpellStatement<"arg|list|inlineStatement?"> {
  @proto static alias = "statement"
  @proto static syntax = "remove {arg:plural_variable} (in|of|from) {list:expression} where"
  @proto static testRule = "remove"

  @proto static wantsInlineStatement = true
  @proto static parseInlineStatementAs = "expression"
  /** Nested scope for predicate body -- singularized `{arg}` variable, also aliased from `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const arg = singularize(match.groups.arg.value)
    return newMethodScope({
      parentScope: match.scope,
      args: [new P.ScopeVariable(arg)],
      mapItTo: arg
    })
  }

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { arg, list, inlineStatement } = match.groups
    const filter = new P.ASTMethodDefinition(inlineStatement || match, {
      inline: true,
      args: [new P.ASTVariableExpression(arg, { name: singularize(arg.value) })],
      body: astAs(inlineStatement)
    })
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "removeWhere",
      args: [astAs(list), filter]
    })
  }

  static tests: P.RuleTests = [
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
          [`spellCore.removeWhere(my_list, (item) => {`, `\treturn (item != "ace")`, `})`]
        ],
        [
          "remove cards in deck where the suit of the card is clubs",
          ["spellCore.removeWhere(deck, (card) => {", "\treturn (card.suit == 'clubs')", "})"]
        ],
        [
          "remove cards in deck where the suit of it is clubs",
          ["spellCore.removeWhere(deck, (card) => {", "\treturn (card.suit == 'clubs')", "})"]
        ],
        [
          "remove cards in deck where its suit is clubs",
          ["spellCore.removeWhere(deck, (card) => {", "\treturn (card.suit == 'clubs')", "})"]
        ]
      ]
    }
  ]
}

////////////////
// ## Random (in-place) list manipulation
////////////////

/** Reverse list in-place, e.g. `reverse my-list` => `spellCore.reverse(my_list)`. */
export class list_reverse extends SpellStatement<"arg?|list"> {
  @proto static alias = "statement"
  @proto static syntax = "reverse ((the? {arg:plural_variable}) (in|of))? {list:expression}"
  @proto static testRule = "reverse"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "reverse",
      args: [astAs(list)]
    })
  }

  static tests: P.RuleTests = [
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
}

/** Shuffle (randomize) list in-place, e.g. `shuffle my-list` => `spellCore.randomize(my_list)`. */
export class list_shuffle extends SpellStatement<"arg?|list"> {
  @proto static alias = "statement"
  @proto static syntax = "(randomize|shuffle) ((the? {arg:plural_variable}) (in|of))? {list:expression}"
  @proto static testRule = "(randomize|shuffle)"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "randomize",
      args: [astAs(list)]
    })
  }

  static tests: P.RuleTests = [
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
}

/**
 * Repeat an action `N` times, e.g. `repeat 3 times: print the number`.
 * - Both a `statement` and an `expression` -- usable inline or as a block.
 * - Body runs as a nested block or inline statement (`wantsInlineStatement` / `wantsNestedBlock`);
 *   current iteration number is available as `number` (also aliased from `it`).
 * - Compiles to `spellCore.map(spellCore.getRange(0, number), (number) => { ... })`, or
 *   `await spellCore.forEachSequential(...)` if body contains an `await` (`method.isAsync`).
 */
export class repeat_n_times extends SpellStatement<"number|inlineStatement?|nestedBlock?"> {
  @proto static alias = ["statement", "expression"]
  @proto static syntax = "repeat {number:expression} (time|times) :?"
  @proto static testRule = "repeat"
  @proto static wantsInlineStatement = true
  @proto static wantsNestedBlock = true

  /** Nested scope for body -- `number` variable (current iteration index), also aliased from `it`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    return newMethodScope({
      parentScope: match.scope,
      args: [new P.ScopeVariable("number")],
      mapItTo: "number"
    })
  }

  /**
   * Build `map`/`forEachSequential` call over `getRange(0, number)`.
   * - SIDE EFFECT: switches to `forEachSequential` + wraps result in `AwaitExpression` when body's
   *   `method.isAsync` -- set by an `await` expression somewhere in body.
   */
  getAST(match: P.MatchFor<this>): P.ASTExpression {
    const { number, inlineStatement, nestedBlock } = match.groups
    const method = new P.ASTMethodDefinition(match, {
      inline: true,
      args: [new P.ASTVariableExpression(match, { name: "number" })],
      body: astAs<MethodBody>(nestedBlock || inlineStatement)
    })
    const getRange = new P.ASTCoreMethodInvocation(match, {
      methodName: "getRange",
      args: [new P.ASTNumericLiteral(match, 0), astAs(number)]
    })
    const expression = new P.ASTCoreMethodInvocation(match, {
      methodName: method.isAsync ? "forEachSequential" : "map",
      args: [getRange, method]
    })
    if (method.isAsync) return new P.ASTAwaitExpression(match, { expression })
    return expression
  }

  static tests: P.RuleTests = [
    {
      compileAs: "block",
      tests: [
        {
          title: "No statements",
          input: "repeat 1 time:",
          output: "spellCore.map(spellCore.getRange(0, 1), (number) => {})"
        },
        {
          title: "Inline statement",
          input: "repeat 3 times: print the number",
          output: [
            "spellCore.map(spellCore.getRange(0, 3), (number) => {",
            "\treturn spellCore.console.log(number)",
            "})"
          ]
        },
        {
          title: "Nested block statement",
          input: ["repeat 3 times:", "\tprint it"],
          output: ["spellCore.map(spellCore.getRange(0, 3), (number) => {", "\tspellCore.console.log(number)", "})"]
        },
        {
          title: "Error if nested block and inline statement",
          input: ["repeat 3 times: print 1", "\tprint it"],
          output: [
            "spellCore.map(spellCore.getRange(0, 3), (number) => {",
            "\tspellCore.console.log(number)",
            "})",
            "/* PARSE ERROR: Got both inline statement and nested block */"
          ]
        }
      ]
    }
  ]
}

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
export class list_iteration extends SpellStatement<"item|position?|list|inlineStatement?|nestedBlock?"> {
  @proto static alias = ["statement", "expression"]
  @proto static syntax =
    "for each? {item:singular_variable} ((and|,) {position:singular_variable})? (in|of) {list:expression} :?"
  @proto static testRule = "for"
  @proto static wantsInlineStatement = true
  @proto static wantsNestedBlock = true

  /** Nested scope for body -- `{item}` (and optional numeric `{position}`) vars, `it` aliased to `{item}`. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const { item, position } = match.groups
    const args: P.ScopeVariable[] = [new P.ScopeVariable({ name: item.value })]
    if (position) args.push(new P.ScopeVariable({ name: position.value, datatype: "number" }))
    return newMethodScope({
      parentScope: match.scope,
      args,
      mapItTo: item.value
    })
  }
  /**
   * Build `map`/`forEachSequential` call over `{list}`.
   * - SIDE EFFECT: switches to `forEachSequential` + wraps result in `AwaitExpression` when body's
   *   `method.isAsync` -- set by an `await` expression somewhere in body.
   */
  getAST(match: P.MatchFor<this>): P.ASTExpression {
    const { list, item, position, inlineStatement, nestedBlock } = match.groups
    const args = [new P.ASTVariableExpression(item, { name: item.value })]
    if (position) args.push(new P.ASTVariableExpression(position))
    const method = new P.ASTMethodDefinition(match, {
      inline: true,
      args,
      body: astAs<MethodBody>(nestedBlock || inlineStatement)
    })

    if (method.isAsync) {
      // console.warn(match.inputText)
      return new P.ASTAwaitExpression(match, {
        expression: new P.ASTCoreMethodInvocation(match, {
          methodName: "forEachSequential",
          args: [astAs(list), method]
        })
      })
    }

    return new P.ASTCoreMethodInvocation(match, {
      methodName: "map", // TODO...
      args: [astAs(list), method]
    })
  }

  static tests: P.RuleTests = [
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
          [`spellCore.map(deck, (card) => {`, `\tcard.direction = "down"`, `})`]
        ],
        [
          `for each card in deck: set the direction of it to "down"`,
          [`spellCore.map(deck, (card) => {`, `\tcard.direction = "down"`, `})`]
        ],
        [
          "for message, index in messages: add message + index to messages",
          [
            `spellCore.map(messages, (message, index) => {`,
            `\treturn spellCore.append(messages, message + index)`,
            `})`
          ]
        ],
        [
          "for message, index in messages: add it + index to messages",
          [
            `spellCore.map(messages, (message, index) => {`,
            `\treturn spellCore.append(messages, message + index)`,
            `})`
          ]
        ],
        [
          "for message, index in messages: set its list to messages",
          [`spellCore.map(messages, (message, index) => {`, `\tmessage.list = messages`, `})`]
        ],

        [
          `for each card in deck:\n\tset the direction of the card to "down"`,
          [`spellCore.map(deck, (card) => {`, `\tcard.direction = "down"`, `})`]
        ],
        [
          [`for each card in deck:`, `\tset the direction of it to "down"`],
          [`spellCore.map(deck, (card) => {`, `\tcard.direction = "down"`, `})`]
        ],
        [
          [`for each card in deck:`, `\tset the direction of the card to "down"`, `\tset the value of the card to 10`],
          [`spellCore.map(deck, (card) => {`, `\tcard.direction = "down"`, `\tcard.value = 10`, `})`]
        ],
        [
          ["for message and index in messages:", "\tif index is greater than 2 add message to messages"],
          [
            `spellCore.map(messages, (message, index) => {`,
            `\tif (index > 2) { spellCore.append(messages, message) }`,
            `})`
          ]
        ]
      ]
    }
  ]
}

/**
 * Number range-specific iteration, e.g. `for each number from 1 to 10:`.
 * - Compiles to `spellCore.map(spellCore.getRange(start, end), (item) => { ... })`, or `await
 *   spellCore.forEachSequential(...)` if body contains an `await`.
 * TODO: this only works if you `from 1 to 10`, a more general solution which also supports `in {list}` is needed.
 * TODO: `down` is not accounted for in the output
 */
export class list_range_iteration extends SpellStatement<"item|start|end|inlineStatement?|nestedBlock?"> {
  @proto static alias = "statement"
  @proto static syntax = "for each? {item:singular_variable} from {start:expression} down? to {end:expression} :?"
  @proto static testRule = "for"
  @proto static wantsInlineStatement = true
  @proto static wantsNestedBlock = true

  /**
   * Nested scope for body -- singularized `{item}` variable.
   * - NOTE: unlike sibling iteration rules (`repeat_n_times`, `list_iteration`), doesn't pass
   *   `mapItTo` -- `it` is NOT aliased to `{item}` here, possibly a missed feature.
   */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const arg = singularize(match.groups.item.value)
    return newMethodScope({
      parentScope: match.scope,
      args: [new P.ScopeVariable(arg)]
    })
  }
  getAST(match: P.MatchFor<this>): P.ASTExpression {
    const { item, start, end, inlineStatement, nestedBlock } = match.groups
    const getRange = new P.ASTCoreMethodInvocation(match, {
      methodName: "getRange",
      args: [astAs(start), astAs(end)]
    })
    const method = new P.ASTMethodDefinition(match, {
      inline: true,
      args: [new P.ASTVariableExpression(item)],
      body: astAs<MethodBody>(nestedBlock || inlineStatement)
    })
    const expression = new P.ASTCoreMethodInvocation(match, {
      methodName: method.isAsync ? "forEachSequential" : "map",
      args: [getRange, method]
    })
    if (method.isAsync) return new P.ASTAwaitExpression(match, { expression })
    return expression
  }

  static tests: P.RuleTests = [
    {
      compileAs: "block",
      tests: [
        ["for each number from 1 to 10:", "spellCore.map(spellCore.getRange(1, 10), (number) => {})"],
        [
          "for each number from 1 to 10: print the number",
          ["spellCore.map(spellCore.getRange(1, 10), (number) => {", "\treturn spellCore.console.log(number)", "})"]
        ],
        [
          "for each number from 1 to 10:\n\tprint the number",
          ["spellCore.map(spellCore.getRange(1, 10), (number) => {", "\tspellCore.console.log(number)", "})"]
        ]
      ]
    }
  ]
}

/** Rule module for list rules -- literals, membership, indexing, in-place mutation, iteration. */
export const lists = new SpellParser({
  module: "lists",
  rules: [
    identifier_list,
    bracketed_list,
    copy_list,
    merge_lists,
    list_length,
    list_position,
    starts_with,
    ends_with,
    ordinal,
    position_expression,
    ordinal_position_expression,
    random_item_expression,
    random_items_expression,
    range_between_expression,
    range_starting_with_expression,
    range_count_expression,
    list_filter,
    list_membership_test,
    list_add,
    list_prepend,
    list_append,
    list_add_relative,
    list_empty,
    list_remove_ordinal,
    list_remove_position,
    list_remove_range,
    list_remove_range_ordinal,
    list_remove,
    list_remove_where,
    list_reverse,
    list_shuffle,
    repeat_n_times,
    list_iteration,
    list_range_iteration
  ]
})
