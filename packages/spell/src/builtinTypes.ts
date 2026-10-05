/**
 * Spell's built-in types, as DATA:  each one's docs and members -- `the length of the name`, `shuffle (a list)`.
 * - The parser reads it:  `SpellParser.rootScope` loads it into each built-in type's `P.TypeScope`
 *   (see `loadBuiltInTypes()`), so a member read resolves through the type of what it reads:
 *   - `the length of the name` => `name.length`
 *   - `the length of the deck` => `spellCore.itemCountOf(deck)`
 * - Editors read it:  hover and completion show its members' docs, and the Type Explorer lists its types.
 *   - `LSP.ScopeExplorer`'s `yarn scopes --builtins` GENERATES `core`'s `src/spellCore.scopes.js` from it.
 * - Why data (plan doc D25):  no `.spell` file to parse at startup, and no statics on runtime classes --
 *   the parser never imports `spellCore`'s code.
 * - Adding a member:  one entry here, and the `spellCore` method or javascript property its `readAs` names.
 *   `builtinTypes.test.ts` pins each one.  See "Built-in types" in `PARSING.md`.
 * - NOTE:  a type's NAME and super-type are `P.BUILT_IN_TYPES`' (the parser's vocabulary):
 *   `superType` here MUST agree, which the test checks.
 *   - A built-in type with no entry here, e.g. `number`, has no members yet.
 */

import { snakeCase } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"

/**
 * Spell's built-in types, in the order the Type Explorer lists them -- see `SP.BuiltInType`.
 * - TODO:  members still to add:
 *   - `number`'s `absolute value` and `round`:  their rules (`math.ts`) compile to `spellCore` methods
 *     which don't exist yet
 *   - a `date`'s `month` (javascript counts months from 0)
 *   - a text's `words`
 */
export const BUILT_IN_TYPE_TABLE: SP.BuiltInType[] = [
  {
    name: "thing",
    detail: "base type",
    docstring: md(
      "What your own types are made from -- `a card is a thing` makes a card.",
      "- Give it properties with `has`, e.g. `a card has a suit as one of clubs, diamonds, hearts, spades`.",
      "- Make one with `a new card` or `create a card`, optionally `with suit = hearts`.",
      "- Reactive:  change a property and whatever was drawn from it redraws.",
      "- Setting a property to the wrong sort of value warns in the console -- but it's set anyway.",
      "",
      "```spell",
      "a task is a thing",
      "a task has a name as text",
      "to draw (a task)",
      "  return <div>{its name}</div>",
      "",
      'it = a new task with name = "Test Drawing"',
      "draw it",
      "```"
    ),
    rules: ["create_type", "new_thing", "create_thing"],
    members: [
      {
        words: "(a thing) belongs to one (list)",
        kind: "method",
        rules: ["belongs_to_one", "can_belong_to_many"],
        docstring: md(
          "In ONE list of a kind at a time, e.g. `a card belongs to one pile`:",
          "- putting the card on one pile takes it off the other, tableaus and other piles included",
          "- `the pile of the card` is the pile it's in, or nothing",
          "- a list of another kind, e.g. a deck, doesn't count:  a card can be in the deck AND one pile",
          "- say it after both types, e.g. after `a pile is a list of cards`",
          "- `a card can belong to many piles`:  the opposite, which lists do anyway"
        )
      },
      {
        words: "draw (a thing)",
        kind: "method",
        rules: ["draw_thing"],
        docstring: md(
          "Draw it on the page -- write how with your own `to draw (a card)`.",
          "- `draw the card` draws it wherever that's used, e.g. inside another thing's `to draw`.",
          "- Redraws by itself when a property it shows changes.",
          "- A thing with no `to draw` of its own can't be drawn:  drawing it is an error."
        )
      }
    ]
  },
  {
    name: "list",
    detail: "counts from 1",
    docstring: md(
      "Things in order -- `a deck is a list of cards` makes a deck.",
      "- Counts from 1:  `card 1 of the deck` is the first.  Negative counts from the end, so",
      "  `card -1 of the deck` is the last -- as is `the last card of the deck`.",
      "- Reactive, like a thing:  add or remove an item and whatever drew the list redraws.",
      "- The word for its items is just for reading:  `number of cards in the deck`",
      "  ~== `number of items in the deck`.",
      "- Its actions also work on a plain list, e.g. `number of items in [1, 2, 3]`.",
      "",
      "```spell",
      "a deck is a list of cards",
      "set the deck to a new deck",
      "add a new card to the deck",
      "shuffle the deck",
      "for each card in the deck",
      '  set the direction of the card to "down"',
      "```"
    ),
    rules: ["create_list_type", "new_list"],
    members: [
      {
        words: "length",
        kind: "property",
        datatype: "number",
        readAs: "spellCore.itemCountOf({it})",
        docstring: md(
          "How many items it has, e.g. `the length of the deck`.",
          "- ~== `the size of the deck`, `the number of cards in the deck`."
        )
      },
      {
        words: "size",
        kind: "property",
        datatype: "number",
        readAs: "spellCore.itemCountOf({it})",
        docstring: md("How many items it has, e.g. `the size of the deck` -- its `length`.")
      },
      {
        words: "(a list) can give up (a thing)",
        kind: "method",
        rules: ["can_give_up", "list_guard"],
        docstring: md(
          "Would it let go of a thing moving elsewhere, e.g. `if the stock can give up the card`?",
          "- Yes, unless its type says otherwise:  `a stock-pile can give up a card if: the card is its last card`,",
          "  or `a foundation can never let go of a card`.",
          "- `release`, `remove` and `let go of` mean the same.",
          "- Only `move` asks.  `remove` and `empty` never do."
        )
      },
      {
        words: "(a list) can take (a thing)",
        kind: "method",
        rules: ["can_take", "list_guard"],
        docstring: md(
          "Would it take a thing moving to it, e.g. `if the tableau can take the card`?",
          "- Yes, unless its type says otherwise:  `a tableau can take a card if: ...`, answering yes or no.",
          "- `add` means the same.",
          "- Only `move` asks.  `add` never does."
        )
      },
      {
        words: "(a list) has items where",
        kind: "method",
        rules: ["list_membership_test"],
        docstring: md(
          "Does ANY item pass a test?  e.g. `the deck has cards where the card is an ace`.",
          "- `has no ...` for none of them."
        )
      },
      {
        words: "(a list) starts with (a thing)",
        kind: "method",
        rules: ["starts_with", "ends_with"],
        docstring: md(
          "Is `thing` its first item, e.g. `the pile starts with the king`?",
          "- `ends with` for its last.",
          "- `does not start with` etc for the opposite."
        )
      },
      {
        words: "a copy of (a list)",
        kind: "method",
        rules: ["copy_list"],
        docstring: md(
          "A new list with the same items, e.g. `a copy of the deck` -- change one, the other stays the same.",
          "- The items themselves are NOT copied:  both lists hold the same cards.",
          "- Same type as the original, unless you say `as a list`."
        )
      },
      {
        words: "a random item of (a list)",
        kind: "method",
        rules: ["random_item_expression", "random_items_expression"],
        docstring: md(
          "An item picked at random, e.g. `a random card from the deck`.",
          "- Or several, as a new list:  `3 random cards from the deck`."
        )
      },
      {
        words: "add (a thing) to (a list)",
        kind: "method",
        rules: ["list_add", "list_prepend", "list_append", "list_add_relative"],
        docstring: md(
          "Add `thing` to the end -- or wherever you say:",
          "- `add the card to the deck`, or `... to the end of the deck`",
          "- `add the card to the start of the deck`, or `prepend the card to the deck`",
          "- `add the card to the deck before the ace`"
        )
      },
      {
        words: "draw (a list)",
        kind: "method",
        rules: ["draw_thing", "draw_items"],
        docstring: md(
          "Draw each item, one after the other -- unless you write your own `to draw (a deck)`,",
          "e.g. to wrap them in a `<div>`.",
          "- `draw each card in the deck` draws just the items, even when the list has its own `to draw`.",
          "- Its items MUST be things which can draw themselves."
        )
      },
      {
        words: "empty (a list)",
        kind: "method",
        rules: ["list_empty"],
        docstring: md("Remove everything from it, e.g. `empty the deck` or `clear the deck`.")
      },
      {
        words: "for each (item) in (a list)",
        kind: "method",
        rules: ["list_iteration"],
        docstring: md(
          "Do something with each item in turn, e.g. `for each card in the deck`.",
          "- Its position too, counting from 1:  `for card and index in the deck`."
        )
      },
      {
        words: "item (n) of (a list)",
        kind: "method",
        rules: ["position_expression", "ordinal_position_expression"],
        docstring: md(
          "Item at a position, e.g. `card 3 of the deck`, `the last card of the deck`.",
          "- Ordinals:  `first` to `tenth`, `penultimate`, `last` or `final`, `top` (first) and `bottom` (last).",
          "- Nothing if there's no item there."
        )
      },
      {
        words: "items (start) to (end) of (a list)",
        kind: "method",
        rules: ["range_between_expression", "range_count_expression", "range_starting_with_expression"],
        docstring: md(
          "Several items in a row, as a new list of the same type -- the list itself doesn't change.",
          "- `card 1 to 3 of the deck`",
          "- `top 2 cards of the deck`, `last two cards of the deck`",
          "- `cards in the deck starting with the ace`"
        )
      },
      {
        words: "items in (a list) where",
        kind: "method",
        rules: ["list_filter"],
        docstring: md(
          "Items which pass a test, as a new list -- the list itself doesn't change.",
          "- e.g. `cards in the deck where the suit of the card is clubs`",
          "- `it` or the item's own word -- `the card` -- is each item in turn."
        )
      },
      {
        words: "merge (lists)",
        kind: "method",
        rules: ["merge_lists"],
        docstring: md(
          "One new list with the items of each list in a list of lists, in order, e.g. `merge the piles`.",
          "- Same type as the first, unless you say `as a list`."
        )
      },
      {
        words: "move (a thing) to (a list)",
        kind: "method",
        rules: ["list_move"],
        docstring: md(
          "Move it, if both lists agree, e.g. `move the card to the tableau`:",
          "- the list it belongs to must give it up -- see `a card belongs to one pile`",
          "- and the new list must take it -- see `can take`",
          "- `if move the card to the tableau ...`:  whether it moved.  Refused, nothing changes.",
          "- `add` and `remove` never ask:  for dealing, or gathering every card back."
        )
      },
      {
        words: "number of (items) in (a list)",
        kind: "method",
        rules: ["list_length", "list_count"],
        docstring: md("How many items it has, e.g. `number of cards in the deck`.")
      },
      {
        words: "position of (a thing) in (a list)",
        kind: "method",
        rules: ["list_position"],
        docstring: md(
          "Where `thing` first is in it, counting from 1, e.g. `position of the ace in the deck`.",
          "- Nothing if it isn't there."
        )
      },
      {
        words: "remove (a thing) from (a list)",
        kind: "method",
        rules: [
          "list_remove",
          "list_remove_position",
          "list_remove_ordinal",
          "list_remove_range",
          "list_remove_range_ordinal",
          "list_remove_where"
        ],
        docstring: md(
          "Take items out -- later items move up to fill the gap:",
          "- `remove the card from the deck`",
          "- `remove card 4 of the deck`, `remove the last card of the deck`",
          "- `remove cards 2 to 4 of the deck`, `remove first to third cards of the deck`",
          "- `remove cards from the deck where the suit of the card is clubs`"
        )
      },
      {
        words: "reverse (a list)",
        kind: "method",
        rules: ["list_reverse"],
        docstring: md("Turn it back to front, in place, e.g. `reverse the cards of the deck`.")
      },
      {
        words: "shuffle (a list)",
        kind: "method",
        rules: ["list_shuffle"],
        docstring: md("Put it in random order, in place, e.g. `shuffle the deck` or `randomize the deck`.")
      }
    ]
  },
  {
    name: "app",
    superType: "thing",
    docstring: md(
      "A thing which is a whole program -- `a game is an app` makes a game.",
      "- Everything a thing has, plus `start`.",
      "- Write its `to draw (a game)` to lay out the page, then `start the game` to show it.",
      "",
      "```spell",
      "a game is an app",
      "to draw (a game)",
      "  return <div>Hello</div>",
      "",
      "set the game to a new game",
      "start the game",
      "```"
    ),
    rules: ["create_type"],
    members: [
      {
        words: "start (an app)",
        kind: "method",
        rules: ["start_app"],
        docstring: md(
          "Show it on the page, drawn by its `to draw`, e.g. `start the game`.",
          "- Start it ONCE:  it redraws itself when things change.",
          "- In the editor, VS Code or `<spell-app>`, it shows in the app's own area;  anywhere else in",
          "  `#spell-app-root`, which is added to the end of the page if there isn't one."
        )
      }
    ]
  },
  {
    name: "text",
    itemType: "character",
    docstring: md(
      'Words, letters -- anything in quotes, e.g. `"hello"`.',
      "- Counts from 1, as a list does:  `the first character of the name` is its first letter.",
      '- `+` joins two:  `"total: " + x`.',
      "",
      "```spell",
      'set the name to "Ada"',
      "print the length of the name",
      "print the last character of the name",
      "```"
    ),
    members: [
      {
        words: "length",
        kind: "property",
        datatype: "number",
        readAs: "{it}.length",
        docstring: md(
          "How many characters it has, e.g. `the length of the name`.",
          "- ~== `the number of characters in the name`."
        )
      },
      {
        words: "characters",
        kind: "property",
        datatype: "list of characters",
        readAs: "spellCore.valuesOf({it})",
        docstring: md("Its characters, one by one, as a new list, e.g. `the characters of the name`.")
      },
      {
        words: "character (n) of (a text)",
        kind: "method",
        datatype: "character",
        rules: ["position_expression", "ordinal_position_expression"],
        docstring: md(
          "The character at a position, counting from 1, e.g. `character 2 of the name`.",
          "- Ordinals too:  `the first character of the name`, `the last character of the name`.",
          "- Nothing if there's no character there."
        )
      },
      {
        words: "number of characters in (a text)",
        kind: "method",
        datatype: "number",
        rules: ["list_length"],
        docstring: md("How many characters it has, e.g. `the number of characters in the name` -- its `length`.")
      },
      {
        words: "a random character of (a text)",
        kind: "method",
        datatype: "character",
        rules: ["random_item_expression"],
        docstring: md("A character picked at random, e.g. `a random character of the name`.")
      },
      {
        words: "(a text) as upper case",
        kind: "method",
        datatype: "text",
        rules: ["as_uppercase", "as_lowercase"],
        docstring: md(
          "The same text in CAPITALS, e.g. `the name as upper case` -- or `as uppercase`.",
          "- `as lower case` for small letters."
        )
      }
    ]
  },
  {
    name: "date",
    docstring: md(
      "A day and a time of day, e.g. a property declared `as date`:  `a todo has a due date as date`.",
      "- Its parts are numbers:  `the year of the due date of the todo`."
    ),
    members: [
      {
        words: "year",
        kind: "property",
        datatype: "number",
        readAs: "{it}.getFullYear()",
        docstring: md("Its year, e.g. `2026`.")
      },
      {
        words: "day",
        kind: "property",
        datatype: "number",
        readAs: "{it}.getDate()",
        docstring: md("Its day of the month, from 1 to 31.")
      }
    ]
  }
]

////////////////
// ## Type words
////////////////

/**
 * Every way a user may WRITE a built-in type in spell, lowercased and singular => its datatype.
 * - Plurals are singularized before lookup, e.g. `numbers` => `number`.
 * - Spell's vocabulary, not the parser's:  a translation brings its own, with its own `typeName()`.
 */
export const TYPE_WORDS: P.TypeWords = {
  text: "text",
  string: "text",
  number: "number",
  fraction: "number",
  decimal: "number",
  integer: "integer",
  character: "character",
  char: "character",
  choice: "choice",
  boolean: "choice",
  "yes or no": "choice",
  "true or false": "choice",
  date: "date",
  list: "list",
  array: "list",
  thing: "thing",
  app: "app",
  nothing: "nothing",
  undefined: "nothing",
  null: "nothing"
}

/**
 * Datatype for a type name as a user WROTE it in spell -- `P.typeName()` with spell's `TYPE_WORDS`.
 * - Built-ins lowercase, however written:
 *   - `string` / `Text` => `text`
 *   - `boolean` / `yes or no` => `choice`
 *   - `array` / `List` => `list`
 *   - `fraction` => `number`
 *   - `char` => `character`
 * - A list of something:  `list of cards` / `array of Card` => `list of cards`.
 * - Anything else is a user's type, Type_Case and singular:  `cards` => `Card`.
 */
export function typeName(written: string): P.Datatype {
  return P.typeName(written, TYPE_WORDS)
}

////////////////
// ## Loading
////////////////

/**
 * Load `BUILT_IN_TYPE_TABLE` into `scope`, the root scope -- which MUST already have each type's `P.TypeScope`.
 * - Each type's `itemType`, e.g. `character` for `text`, so `the first character of the name` is a `character`.
 * - Each member with a `readAs` template, as a `P.ScopeVariable` holding it:
 *   `TypeScope.getMember()` finds it, for `the X of Y` / `its X`, and editors list it.
 *   - A member only built-in RULES spell is docs alone.
 * - Throws for a type the scope doesn't have, or a template `parseReadAsTemplate()` can't read.
 * - SIDE EFFECT:  changes the shared root's types, once -- `SpellParser.rootScope` calls it as it builds.
 */
export function loadBuiltInTypes(scope: P.RootScope): void {
  for (const entry of BUILT_IN_TYPE_TABLE) {
    const type = scope.types.get(entry.name, "LOCAL_ONLY")
    if (!type) throw new TypeError(`Built-in type '${entry.name}' isn't in the root scope:  see P.BUILT_IN_TYPES`)
    if (entry.itemType) type.itemType = entry.itemType
    for (const member of entry.members) {
      if (!member.readAs) continue
      if (!parseReadAsTemplate(member.readAs)) {
        throw new TypeError(`Built-in ${entry.name}'s '${member.words}':  can't read template '${member.readAs}'`)
      }
      const { words, datatype, readAs, docstring } = member
      const name = builtInMemberName(words)
      type.variables.add({ name, ...(words !== name ? { asWritten: words } : {}), datatype, readAs, docstring })
    }
  }
}

/** Name a member with `words` compiles to, and scope keys it by, e.g. `first_character` -- as `member_words` says. */
export function builtInMemberName(words: string): string {
  return snakeCase(words)
}

/**
 * `template`, a member's `readAs`, taken apart.
 * - `undefined` if it's none of the forms `SP.BuiltInMember.readAs` allows.
 */
export function parseReadAsTemplate(template: string): SP.ReadAsTemplate | undefined {
  const match = READ_AS_TEMPLATE.exec(template)
  if (!match) return undefined
  const [, property, method, helper] = match
  if (property) return { form: "property", name: property }
  if (method) return { form: "method", name: method }
  return { form: "spellCore", name: helper! }
}

/** What `parseReadAsTemplate()` reads:  `{it}.name`, `{it}.name()`, `spellCore.name({it})`. */
const READ_AS_TEMPLATE = /^(?:\{it\}\.(\w+)|\{it\}\.(\w+)\(\)|spellCore\.(\w+)\(\{it\}\))$/

////////////////
// ## Lookups
////////////////

/** Table entry of built-in type `name`, however written, e.g. `List` or `list` -- `undefined` if it has none. */
export function builtInTypeEntry(name: string): SP.BuiltInType | undefined {
  const datatype = typeName(name)
  return BUILT_IN_TYPE_TABLE.find((entry) => entry.name === datatype)
}

/**
 * Members spelled by built-in rule `ruleName`, e.g. `list_shuffle` => `shuffle (a list)` -- each with its type.
 * - For hover:  a built-in rule's docs are its member's.
 */
export function builtInMembersOfRule(ruleName: string): Array<{ type: SP.BuiltInType; member: SP.BuiltInMember }> {
  return BUILT_IN_TYPE_TABLE.flatMap((type) =>
    type.members.filter((member) => member.rules?.includes(ruleName)).map((member) => ({ type, member }))
  )
}

/**
 * Is `type` one of spell's built-in types -- the shared root scope's own, which no project declares?
 * - Why:  a project mustn't declare a member on one, as every project shares it.
 * - See `SpellStatement.refuseBuiltInType()`.
 */
export function isBuiltInTypeScope(type: P.TypeScope | undefined): boolean {
  return !!type && SP.SpellParser.rootScope.types.get(type.name, "LOCAL_ONLY") === type
}

////////////////
// ## Helpers
////////////////

/** Markdown `lines` as one string -- so a long doc reads as lines here. */
function md(...lines: string[]): string {
  return lines.join("\n")
}
