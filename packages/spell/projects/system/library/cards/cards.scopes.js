/*! SPELL: SCOPES @system:library:cards */
;(globalThis.SPELL_SCOPES ??= {})[document.currentScript.src] = {
  id: "@system:library:cards",
  entries: [
    { path: "project:cards" },
    {
      path: "project:cards/file:Card.spell",
      uri: "spell:/@system:library:cards/Card.spell",
      description: "# Definition of a Card with nice english aliases for working with it"
    },
    {
      path: "project:cards/file:Card.spell/type:Card", line: 2,
      super: "type:Thing",
      description: "# Definition of a Card with nice english aliases for working with it"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/property:rank", line: 6,
      section: "properties of cards",
      description: "card ranks"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/enumeration:Ranks", line: 6,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/constant:ace", line: 6,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/constant:jack", line: 6,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/constant:queen", line: 6,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/constant:king", line: 6,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/property:suit", line: 9,
      section: "properties of cards",
      description: "card suits"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/enumeration:Suits", line: 9,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/constant:clubs", line: 9,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/constant:diamonds", line: 9,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/constant:hearts", line: 9,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/constant:spades", line: 9,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/property:color", line: 12,
      section: "properties of cards",
      description: "color as derivation of suit"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/constant:black", line: 12,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/constant:red", line: 12,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/property:value", line: 15,
      detail: "number",
      section: "properties of cards",
      description: "value as a derivation of rank"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/property:direction", line: 18,
      section: "properties of cards",
      description: "card direction:  up or down"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/enumeration:Directions", line: 18,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/constant:up", line: 18,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/constant:down", line: 18,
      section: "properties of cards"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/method:is face up", line: 22,
      section: "aliases",
      description: "\"card is face up/down\"",
      rules: [
        { name: "is_face_up", syntax: "{operator:is} face up" }
      ]
    },
    {
      path: "project:cards/file:Card.spell/type:Card/method:is face down", line: 23,
      section: "aliases",
      rules: [
        { name: "is_face_down", syntax: "{operator:is} face down" }
      ]
    },
    {
      path: "project:cards/file:Card.spell/type:Card/method:is a face card", line: 25,
      section: "aliases",
      description: "`card is a face card`",
      rules: [
        { name: "is_a_face_card", syntax: "{operator:is} a face card" }
      ]
    },
    {
      path: "project:cards/file:Card.spell/type:Card/method:is a (suit)", line: 27,
      section: "aliases",
      description: "\"card is a spade\", \"...is a club\" etc",
      rules: [
        { name: "is_a_$suit", syntax: "{operator:is} (a|an) (expression:club|diamond|heart|spade)" }
      ]
    },
    {
      path: "project:cards/file:Card.spell/type:Card/method:is a (rank)", line: 29,
      section: "aliases",
      description: "\"card is a queen\", \"...is an ace\" etc",
      rules: [
        { name: "is_a_$rank", syntax: "{operator:is} (a|an) (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king)" }
      ]
    },
    {
      path: "project:cards/file:Card.spell/type:Card/method:is the (rank) of (suits)", line: 31,
      section: "aliases",
      description: "\"card is the queen of spades\" etc",
      rules: [
        { name: "is_the_$rank_of_$suits", syntax: "{operator:is} the (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king) of (expression:clubs|diamonds|hearts|spades)" }
      ]
    },
    {
      path: "project:cards/file:Card.spell/type:Card/property:name", line: 34,
      detail: "text",
      section: "aliases",
      description: "name as a derivation of name/suit"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/property:short_suit", line: [36, 41],
      name: "short suit",
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/property:short_rank", line: [43, 46],
      name: "short rank",
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/property:short_direction", line: [48, 50],
      name: "short direction",
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/property:short_name", line: 52,
      name: "short name",
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/property:state", line: 54,
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:cards/file:Card.spell/type:Card/method:turn a card face up", line: [60, 62],
      section: "actions",
      description: "Turn card face up or face down\nNote that this will animate if you `wait for turn the card face up`",
      rules: [
        { name: "turn_face_up", syntax: "turn {thisArg:expression} face up" }
      ]
    },
    {
      path: "project:cards/file:Card.spell/type:Card/method:turn a card face down", line: [63, 65],
      section: "actions",
      rules: [
        { name: "turn_face_down", syntax: "turn {thisArg:expression} face down" }
      ]
    },
    {
      path: "project:cards/file:Card.spell/type:Card/method:turn a card over", line: [69, 72],
      section: "actions",
      description: "Flip card to opposite direction\nNote that this will animate if you `wait for turn the card face up`",
      rules: [
        { name: "turn_over", syntax: "turn {thisArg:expression} over" }
      ]
    },
    {
      path: "project:cards/file:Card.spell/type:Card/method:draw a card", line: [74, 81],
      section: "actions",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:cards/file:Card.spell/type:Card/method:is the (color) joker", line: 95,
      section: "A joker: a wild card with no rank or suit -- there's a red one and a black one",
      description: "\"card is the red joker\", \"...is the black joker\" -- asked of ANY card, which only a joker of that color is",
      rules: [
        { name: "is_the_$color_joker", syntax: "{operator:is} the {expression:operand} joker" }
      ]
    },
    {
      path: "project:cards/file:Card.spell/type:Card/property:pile", line: 6,
      detail: "Pile",
      section: "Pile of playing cards",
      uri: "spell:/@system:library:cards/Pile.spell",
      description: "a card is in one pile at a time:  putting it on another pile takes it off this one"
    },
    {
      path: "project:cards/file:Card.spell/type:Joker", line: 84,
      super: "project:cards/file:Card.spell/type:Card",
      section: "A joker: a wild card with no rank or suit -- there's a red one and a black one",
      description: "## A joker: a wild card with no rank or suit -- there's a red one and a black one"
    },
    {
      path: "project:cards/file:Card.spell/type:Joker/property:color", line: 87,
      section: "A joker: a wild card with no rank or suit -- there's a red one and a black one",
      description: "joker color:  red or black -- set when it's made, as it has no suit to work it out from"
    },
    {
      path: "project:cards/file:Card.spell/type:Joker/enumeration:Colors", line: 87,
      section: "A joker: a wild card with no rank or suit -- there's a red one and a black one"
    },
    {
      path: "project:cards/file:Card.spell/type:Joker/constant:red", line: 87,
      section: "A joker: a wild card with no rank or suit -- there's a red one and a black one"
    },
    {
      path: "project:cards/file:Card.spell/type:Joker/constant:black", line: 87,
      section: "A joker: a wild card with no rank or suit -- there's a red one and a black one"
    },
    {
      path: "project:cards/file:Card.spell/type:Joker/property:name", line: 90,
      detail: "text",
      section: "A joker: a wild card with no rank or suit -- there's a red one and a black one",
      description: "name as its color, e.g. \"red joker\""
    },
    {
      path: "project:cards/file:Card.spell/type:Joker/property:short_name", line: 92,
      name: "short name",
      detail: "text",
      section: "A joker: a wild card with no rank or suit -- there's a red one and a black one"
    },
    {
      path: "project:cards/file:Card.spell/function:test card setup", line: [98, 150],
      section: "create a card instance with default properties",
      description: "## create a card instance with default properties",
      rules: [
        { name: "test_card_setup", syntax: "test card setup" }
      ]
    },
    {
      path: "project:cards/file:Deck.spell",
      uri: "spell:/@system:library:cards/Deck.spell"
    },
    {
      path: "project:cards/file:Deck.spell/type:Deck", line: 3,
      super: "type:List",
      section: "Deck:   US standard card deck -- with its two jokers too, if its with jokers is yes"
    },
    {
      path: "project:cards/file:Deck.spell/type:Deck/property:with_jokers", line: 6,
      name: "with jokers",
      detail: "choice",
      section: "Deck:   US standard card deck -- with its two jokers too, if its with jokers is yes",
      description: "with jokers:  yes to add the red and the black joker when it's set up, after the 52 cards"
    },
    {
      path: "project:cards/file:Deck.spell/type:Deck/method:set up a deck", line: [8, 19],
      section: "Deck:   US standard card deck -- with its two jokers too, if its with jokers is yes",
      rules: [
        { name: "set_up", syntax: "set up {thisArg:expression}" }
      ]
    },
    {
      path: "project:cards/file:Deck.spell/type:Deck/property:is_set_up", line: 19,
      name: "is-set-up",
      detail: "choice",
      section: "Deck:   US standard card deck -- with its two jokers too, if its with jokers is yes"
    },
    {
      path: "project:cards/file:Deck.spell/type:Deck/method:display a deck", line: [21, 25],
      section: "Deck:   US standard card deck -- with its two jokers too, if its with jokers is yes",
      rules: [
        { name: "display", syntax: "display {thisArg:expression}" }
      ]
    },
    {
      path: "project:cards/file:Deck.spell/function:test deck creation", line: [27, 46],
      section: "Deck:   US standard card deck -- with its two jokers too, if its with jokers is yes",
      rules: [
        { name: "test_deck_creation", syntax: "test deck creation" }
      ]
    },
    {
      path: "project:cards/file:Deck.spell/function:test deck with jokers", line: [49, 56],
      section: "Deck:   US standard card deck -- with its two jokers too, if its with jokers is yes",
      rules: [
        { name: "test_deck_with_jokers", syntax: "test deck with jokers" }
      ]
    },
    {
      path: "project:cards/file:Pile.spell",
      uri: "spell:/@system:library:cards/Pile.spell"
    },
    {
      path: "project:cards/file:Pile.spell/type:Pile", line: 2,
      super: "type:List",
      section: "Pile of playing cards",
      description: "## Pile of playing cards"
    },
    {
      path: "project:cards/file:Pile.spell/type:Pile/property:name", line: 4,
      detail: "text",
      section: "Pile of playing cards",
      description: "what a program calls it, e.g. \"stock\":  the program importing these cards names its piles"
    },
    {
      path: "project:cards/file:Pile.spell/type:Pile/property:color", line: [8, 10],
      section: "Pile of playing cards"
    },
    {
      path: "project:cards/file:Pile.spell/type:Pile/property:value", line: [12, 14],
      detail: "number",
      section: "Pile of playing cards"
    },
    {
      path: "project:cards/file:Pile.spell/type:Pile/property:state", line: [16, 20],
      detail: "text",
      section: "Pile of playing cards"
    }
  ]
}
