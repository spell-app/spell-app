/*! SPELL: SCOPES @spell/core */
;(globalThis.SPELL_SCOPES ??= {})[document.currentScript.src] = {
  id: "@spell/core",
  entries: [
    {
      path: "type:Thing",
      detail: "base type",
      description: "What your own types are made from -- `a card is a thing` makes a card.\n- Give it properties with `has`, e.g. `a card has a suit as one of clubs, diamonds, hearts, spades`.\n- Make one with `a new card` or `create a card`, optionally `with suit = hearts`.\n- Reactive:  change a property and whatever was drawn from it redraws.\n- Setting a property to the wrong sort of value warns in the console -- but it's set anyway.\n\n```spell\na task is a thing\na task has a name as text\nto draw (a task)\n  return <div>{its name}</div>\n\nit = a new task with name = \"Test Drawing\"\ndraw it\n```",
      rules: [
        { name: "create_type", syntax: "(a|an) {type} is (a|an) {superType:type}" },
        { name: "create_type", syntax: "(a|an) {type} is (a|an) {superType:type} (where|with)? : {nested_statements}?" },
        { name: "create_type", syntax: "(a|an) {type:quoted_type} is (a|an) {superType:type}" },
        { name: "create_type", syntax: "(a|an) {type:quoted_type} is (a|an) {superType:type} (where|with)? : {nested_statements}?" },
        { name: "new_thing", syntax: "a new {type:known_type} ((with|where|whose) {props:object_literal_properties})?" },
        { name: "create_thing", syntax: "create (a|an) {type:known_type} ((with|where|whose) {props:object_literal_properties})?" }
      ]
    },
    {
      path: "type:Thing/method:(a thing) belongs to one (list)",
      description: "In ONE list of a kind at a time, e.g. `a card belongs to one pile`:\n- putting the card on one pile takes it off the other, tableaus and other piles included\n- `the pile of the card` is the pile it's in, or nothing\n- a list of another kind, e.g. a deck, doesn't count:  a card can be in the deck AND one pile\n- say it after both types, e.g. after `a pile is a list of cards`\n- `a card can belong to many piles`:  the opposite, which lists do anyway",
      rules: [
        { name: "belongs_to_one", syntax: "(a|an) {type} belongs to one {list:type}" },
        { name: "belongs_to_one", syntax: "{type:subject_it} belongs to (one|a|an) {list:type}" },
        { name: "can_belong_to_many", syntax: "(a|an) {type:known_type} can belong to many {list:known_type}" }
      ]
    },
    {
      path: "type:Thing/method:draw (a thing)",
      description: "Draw it on the page -- write how with your own `to draw (a card)`.\n- `draw the card` draws it wherever that's used, e.g. inside another thing's `to draw`.\n- Redraws by itself when a property it shows changes.\n- A thing with no `to draw` of its own can't be drawn:  drawing it is an error.",
      rules: [
        { name: "draw_thing", syntax: "draw {expression}" }
      ]
    },
    {
      path: "type:List",
      detail: "counts from 1",
      description: "Things in order -- `a deck is a list of cards` makes a deck.\n- Counts from 1:  `card 1 of the deck` is the first.  Negative counts from the end, so\n  `card -1 of the deck` is the last -- as is `the last card of the deck`.\n- Reactive, like a thing:  add or remove an item and whatever drew the list redraws.\n- The word for its items is just for reading:  `number of cards in the deck`\n  ~== `number of items in the deck`.\n- Its actions also work on a plain list, e.g. `number of items in [1, 2, 3]`.\n\n```spell\na deck is a list of cards\nset the deck to a new deck\nadd a new card to the deck\nshuffle the deck\nfor each card in the deck\n  set the direction of the card to \"down\"\n```",
      rules: [
        { name: "create_list_type", syntax: "create a type (named|called) {type} as (a|an) list of {instanceType:type}" },
        { name: "create_list_type", syntax: "(a|an) {type} is (a|an) list of {instanceType:type}" },
        { name: "create_list_type", syntax: "(a|an) {type} is (a|an) list of {instanceType:type} (where|with)? : {nested_statements}?" },
        { name: "create_list_type", syntax: "(a|an) {type:quoted_type} is (a|an) list of {instanceType:type}" },
        { name: "create_list_type", syntax: "(a|an) {type:quoted_type} is (a|an) list of {instanceType:type} (where|with)? : {nested_statements}?" },
        { name: "new_list", syntax: "a new (list|List) of {instanceType:type}?" }
      ]
    },
    {
      path: "type:List/property:length",
      detail: "number",
      description: "How many items it has, e.g. `the length of the deck`.\n- ~== `the size of the deck`, `the number of cards in the deck`."
    },
    {
      path: "type:List/property:size",
      detail: "number",
      description: "How many items it has, e.g. `the size of the deck` -- its `length`."
    },
    {
      path: "type:List/method:(a list) can give up (a thing)",
      description: "Would it let go of a thing moving elsewhere, e.g. `if the stock can give up the card`?\n- Yes, unless its type says otherwise:  `a stock-pile can give up a card if: the card is its last card`,\n  or `a foundation can never let go of a card`.\n- `release`, `remove` and `let go of` mean the same.\n- Only `move` asks.  `remove` and `empty` never do.",
      rules: [
        { name: "can_give_up", syntax: "{operator:can} (release|remove|give up|let go of) {expression:operand}" },
        { name: "list_guard", syntax: "(a|an) {type:known_type} can (verb:add|take) (a|an) {item:type} if :? {expression_body}?" },
        { name: "list_guard", syntax: "(a|an) {type:known_type} can (verb:release|remove|give up|let go of) (a|an) {item:type} if :? {expression_body}?" },
        { name: "list_guard", syntax: "(a|an) {type:known_type} can (never:never) (verb:release|remove|give up|let go of) (a|an) {item:type}" }
      ]
    },
    {
      path: "type:List/method:(a list) can take (a thing)",
      description: "Would it take a thing moving to it, e.g. `if the tableau can take the card`?\n- Yes, unless its type says otherwise:  `a tableau can take a card if: ...`, answering yes or no.\n- `add` means the same.\n- Only `move` asks.  `add` never does.",
      rules: [
        { name: "can_take", syntax: "{operator:can} (add|take) {expression:operand}" },
        { name: "list_guard", syntax: "(a|an) {type:known_type} can (verb:add|take) (a|an) {item:type} if :? {expression_body}?" },
        { name: "list_guard", syntax: "(a|an) {type:known_type} can (verb:release|remove|give up|let go of) (a|an) {item:type} if :? {expression_body}?" },
        { name: "list_guard", syntax: "(a|an) {type:known_type} can (never:never) (verb:release|remove|give up|let go of) (a|an) {item:type}" }
      ]
    },
    {
      path: "type:List/method:(a list) has items where",
      description: "Does ANY item pass a test?  e.g. `the deck has cards where the card is an ace`.\n- `has no ...` for none of them.",
      rules: [
        { name: "list_membership_test", syntax: "(operator:has|has no|doesnt have|does not have) {arg:plural_identifier} where {inline_expression}?" }
      ]
    },
    {
      path: "type:List/method:(a list) starts with (a thing)",
      description: "Is `thing` its first item, e.g. `the pile starts with the king`?\n- `ends with` for its last.\n- `does not start with` etc for the opposite.",
      rules: [
        { name: "starts_with", syntax: "(operator:starts with|does not start with|doesnt start with|doesn't start with) {expression:operand}" },
        { name: "ends_with", syntax: "(operator:ends with|does not end with|doesnt end with|doesn't end with) {expression:operand}" }
      ]
    },
    {
      path: "type:List/method:a copy of (a list)",
      description: "A new list with the same items, e.g. `a copy of the deck` -- change one, the other stays the same.\n- The items themselves are NOT copied:  both lists hold the same cards.\n- Same type as the original, unless you say `as a list`.",
      rules: [
        { name: "copy_list", syntax: "a (copy|duplicate) of list? {expression:operand} (as (a|an) {type:known_type})?" }
      ]
    },
    {
      path: "type:List/method:a random item of (a list)",
      description: "An item picked at random, e.g. `a random card from the deck`.\n- Or several, as a new list:  `3 random cards from the deck`.",
      rules: [
        { name: "random_item_expression", syntax: "a random {arg:singular_identifier} (of|from|in) {list:operand}" },
        { name: "random_items_expression", syntax: "{number} random {arg:plural_identifier} (of|from|in) {list:operand}" }
      ]
    },
    {
      path: "type:List/method:add (a thing) to (a list)",
      description: "Add `thing` to the end -- or wherever you say:\n- `add the card to the deck`, or `... to the end of the deck`\n- `add the card to the start of the deck`, or `prepend the card to the deck`\n- `add the card to the deck before the ace`",
      rules: [
        { name: "list_add", syntax: "add {thing:expression} to (the (method:start|front|top|end|back|bottom) of)? {list:expression}" },
        { name: "list_prepend", syntax: "prepend {thing:expression} to {list:expression}" },
        { name: "list_append", syntax: "append {thing:expression} to {list:expression}" },
        { name: "list_add_relative", syntax: "add {thing:expression} to {list:expression} (operator:before|after) {item:expression}" }
      ]
    },
    {
      path: "type:List/method:draw (a list)",
      description: "Draw each item, one after the other -- unless you write your own `to draw (a deck)`,\ne.g. to wrap them in a `<div>`.\n- `draw each card in the deck` draws just the items, even when the list has its own `to draw`.\n- Its items MUST be things which can draw themselves.",
      rules: [
        { name: "draw_thing", syntax: "draw {expression}" },
        { name: "draw_items", syntax: "draw (each {variable}|(the|all)? {plural_identifier}) (of|in) {expression}" }
      ]
    },
    {
      path: "type:List/method:empty (a list)",
      description: "Remove everything from it, e.g. `empty the deck` or `clear the deck`.",
      rules: [
        { name: "list_empty", syntax: "(empty|clear) {list:expression}" }
      ]
    },
    {
      path: "type:List/method:for each (item) in (a list)",
      description: "Do something with each item in turn, e.g. `for each card in the deck`.\n- Its position too, counting from 1:  `for card and index in the deck`.",
      rules: [
        { name: "list_iteration", syntax: "for each? {item:singular_identifier} ((and|,) {position:singular_identifier})? (in|of) {list:expression} :? {statement_body}?" }
      ]
    },
    {
      path: "type:List/method:item (n) of (a list)",
      description: "Item at a position, e.g. `card 3 of the deck`, `the last card of the deck`.\n- Ordinals:  `first` to `tenth`, `penultimate`, `last` or `final`, `top` (first) and `bottom` (last).\n- Nothing if there's no item there.",
      rules: [
        { name: "position_expression", syntax: "{arg:singular_identifier} {position:expression} of {expression:operand}" },
        { name: "ordinal_position_expression", syntax: "the {ordinal} {arg:singular_identifier} (in|of) {expression:operand}" }
      ]
    },
    {
      path: "type:List/method:items (start) to (end) of (a list)",
      description: "Several items in a row, as a new list of the same type -- the list itself doesn't change.\n- `card 1 to 3 of the deck`\n- `top 2 cards of the deck`, `last two cards of the deck`\n- `cards in the deck starting with the ace`",
      rules: [
        { name: "range_between_expression", syntax: "{arg:variable} {start:expression} to {end:expression} (of|in|from) {list:operand}" },
        { name: "range_count_expression", syntax: "{ordinal} {number} {arg:plural_identifier} (of|in|from) {list:operand}" },
        { name: "range_starting_with_expression", syntax: "{arg:plural_identifier} (in|of) {list:expression} starting with {thing:operand}" }
      ]
    },
    {
      path: "type:List/method:items in (a list) where",
      description: "Items which pass a test, as a new list -- the list itself doesn't change.\n- e.g. `cards in the deck where the suit of the card is clubs`\n- `it` or the item's own word -- `the card` -- is each item in turn.",
      rules: [
        { name: "list_filter", syntax: "the? {arg:plural_identifier} (in|of) {list:expression} where {inline_expression}?" }
      ]
    },
    {
      path: "type:List/method:merge (lists)",
      description: "One new list with the items of each list in a list of lists, in order, e.g. `merge the piles`.\n- Same type as the first, unless you say `as a list`.",
      rules: [
        { name: "merge_lists", syntax: "merge lists? {expression:operand} ((as|into) (a|an) new? {type:known_type})?" }
      ]
    },
    {
      path: "type:List/method:move (a thing) to (a list)",
      description: "Move it, if both lists agree, e.g. `move the card to the tableau`:\n- the list it belongs to must give it up -- see `a card belongs to one pile`\n- and the new list must take it -- see `can take`\n- `if move the card to the tableau ...`:  whether it moved.  Refused, nothing changes.\n- `add` and `remove` never ask:  for dealing, or gathering every card back.",
      rules: [
        { name: "list_move", syntax: "move {thing:expression} to {list:expression}" }
      ]
    },
    {
      path: "type:List/method:number of (items) in (a list)",
      description: "How many items it has, e.g. `number of cards in the deck`.",
      rules: [
        { name: "list_length", syntax: "the? number of {arg:plural_identifier} (in|of) {list:operand}" },
        { name: "list_length", syntax: "the? number of {arg:plural_identifier} (in|of) {list:operand} where {inline_expression}?" },
        { name: "list_count", syntax: "the? number of {list:operand}" }
      ]
    },
    {
      path: "type:List/method:position of (a thing) in (a list)",
      description: "Where `thing` first is in it, counting from 1, e.g. `position of the ace in the deck`.\n- Nothing if it isn't there.",
      rules: [
        { name: "list_position", syntax: "the? position of {thing:expression} in {list:operand}" }
      ]
    },
    {
      path: "type:List/method:remove (a thing) from (a list)",
      description: "Take items out -- later items move up to fill the gap:\n- `remove the card from the deck`\n- `remove card 4 of the deck`, `remove the last card of the deck`\n- `remove cards 2 to 4 of the deck`, `remove first to third cards of the deck`\n- `remove cards from the deck where the suit of the card is clubs`",
      rules: [
        { name: "list_remove", syntax: "remove {thing:expression} from {list:expression}" },
        { name: "list_remove_position", syntax: "remove {arg:singular_identifier} {number:expression} of {list:expression}" },
        { name: "list_remove_ordinal", syntax: "remove the? {position:ordinal} {arg:singular_identifier} of {list:expression}" },
        { name: "list_remove_range", syntax: "remove {arg:plural_identifier} {start:expression} to {end:expression} of {list:expression}" },
        { name: "list_remove_range_ordinal", syntax: "remove {start:ordinal} to {end:ordinal} {arg:plural_identifier} of {list:expression}" },
        { name: "list_remove_where", syntax: "remove {arg:plural_identifier} (in|of|from) {list:expression} where {inline_expression}?" }
      ]
    },
    {
      path: "type:List/method:reverse (a list)",
      description: "Turn it back to front, in place, e.g. `reverse the cards of the deck`.",
      rules: [
        { name: "list_reverse", syntax: "reverse (the? {arg:plural_identifier} (in|of))? {list:expression}" }
      ]
    },
    {
      path: "type:List/method:shuffle (a list)",
      description: "Put it in random order, in place, e.g. `shuffle the deck` or `randomize the deck`.",
      rules: [
        { name: "list_shuffle", syntax: "(randomize|shuffle) (the? {arg:plural_identifier} (in|of))? {list:expression}" }
      ]
    },
    {
      path: "type:App",
      super: "type:Thing",
      description: "A thing which is a whole program -- `a game is an app` makes a game.\n- Everything a thing has, plus `start`.\n- Write its `to draw (a game)` to lay out the page, then `start the game` to show it.\n\n```spell\na game is an app\nto draw (a game)\n  return <div>Hello</div>\n\nset the game to a new game\nstart the game\n```",
      rules: [
        { name: "create_type", syntax: "(a|an) {type} is (a|an) {superType:type}" },
        { name: "create_type", syntax: "(a|an) {type} is (a|an) {superType:type} (where|with)? : {nested_statements}?" },
        { name: "create_type", syntax: "(a|an) {type:quoted_type} is (a|an) {superType:type}" },
        { name: "create_type", syntax: "(a|an) {type:quoted_type} is (a|an) {superType:type} (where|with)? : {nested_statements}?" }
      ]
    },
    {
      path: "type:App/method:start (an app)",
      description: "Show it on the page, drawn by its `to draw`, e.g. `start the game`.\n- Start it ONCE:  it redraws itself when things change.\n- In the editor, VS Code or `<spell-app>`, it shows in the app's own area;  anywhere else in\n  `#spell-app-root`, which is added to the end of the page if there isn't one.",
      rules: [
        { name: "start_app", syntax: "start {app:expression}" }
      ]
    },
    {
      path: "type:Text",
      description: "Words, letters -- anything in quotes, e.g. `\"hello\"`.\n- Counts from 1, as a list does:  `the first character of the name` is its first letter.\n- `+` joins two:  `\"total: \" + x`.\n\n```spell\nset the name to \"Ada\"\nprint the length of the name\nprint the last character of the name\n```"
    },
    {
      path: "type:Text/property:length",
      detail: "number",
      description: "How many characters it has, e.g. `the length of the name`.\n- ~== `the number of characters in the name`."
    },
    {
      path: "type:Text/property:characters",
      detail: "list of characters",
      description: "Its characters, one by one, as a new list, e.g. `the characters of the name`."
    },
    {
      path: "type:Text/method:character (n) of (a text)",
      description: "The character at a position, counting from 1, e.g. `character 2 of the name`.\n- Ordinals too:  `the first character of the name`, `the last character of the name`.\n- Nothing if there's no character there.",
      rules: [
        { name: "position_expression", syntax: "{arg:singular_identifier} {position:expression} of {expression:operand}" },
        { name: "ordinal_position_expression", syntax: "the {ordinal} {arg:singular_identifier} (in|of) {expression:operand}" }
      ]
    },
    {
      path: "type:Text/method:number of characters in (a text)",
      description: "How many characters it has, e.g. `the number of characters in the name` -- its `length`.",
      rules: [
        { name: "list_length", syntax: "the? number of {arg:plural_identifier} (in|of) {list:operand}" },
        { name: "list_length", syntax: "the? number of {arg:plural_identifier} (in|of) {list:operand} where {inline_expression}?" }
      ]
    },
    {
      path: "type:Text/method:a random character of (a text)",
      description: "A character picked at random, e.g. `a random character of the name`.",
      rules: [
        { name: "random_item_expression", syntax: "a random {arg:singular_identifier} (of|from|in) {list:operand}" }
      ]
    },
    {
      path: "type:Text/method:(a text) as upper case",
      description: "The same text in CAPITALS, e.g. `the name as upper case` -- or `as uppercase`.\n- `as lower case` for small letters.",
      rules: [
        { name: "as_uppercase", syntax: "as (upper case|uppercase)" },
        { name: "as_lowercase", syntax: "as (lower case|lowercase)" }
      ]
    },
    {
      path: "type:Date",
      description: "A day and a time of day, e.g. a property declared `as date`:  `a todo has a due date as date`.\n- Its parts are numbers:  `the year of the due date of the todo`."
    },
    {
      path: "type:Date/property:year",
      detail: "number",
      description: "Its year, e.g. `2026`."
    },
    {
      path: "type:Date/property:day",
      detail: "number",
      description: "Its day of the month, from 1 to 31."
    }
  ]
}
