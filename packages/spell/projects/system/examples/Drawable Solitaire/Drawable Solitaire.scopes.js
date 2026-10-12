/*! SPELL: SCOPES @system:examples:Drawable Solitaire */
;(globalThis.SPELL_SCOPES ??= {})[document.currentScript.src] = {
  id: "@system:examples:Drawable Solitaire",
  entries: [
    { path: "project:Drawable Solitaire" },
    {
      path: "project:Drawable Solitaire/file:Card.spell",
      uri: "spell:/@system:examples:Drawable%20Solitaire/Card.spell"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card", line: [3, 36],
      super: "type:Drawable",
      section: "definition of a Card with nice english aliases for working with it",
      description: "a drawable thing:  each card draws in its own element, <solitaire-card>, with its own styles"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/property:rank", line: 40,
      section: "properties of cards",
      description: "card ranks"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/enumeration:Ranks", line: 40,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/constant:ace", line: 40,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/constant:jack", line: 40,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/constant:queen", line: 40,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/constant:king", line: 40,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/property:suit", line: 43,
      section: "properties of cards",
      description: "card suits"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/enumeration:Suits", line: 43,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/constant:clubs", line: 43,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/constant:diamonds", line: 43,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/constant:hearts", line: 43,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/constant:spades", line: 43,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/property:color", line: 46,
      section: "properties of cards",
      description: "color as derivation of suit"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/constant:black", line: 46,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/constant:red", line: 46,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/property:value", line: 49,
      detail: "number",
      section: "properties of cards",
      description: "value as a derivation of rank"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/property:direction", line: 52,
      section: "properties of cards",
      description: "card direction:  up or down"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/enumeration:Directions", line: 52,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/constant:up", line: 52,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/constant:down", line: 52,
      section: "properties of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/method:is face up", line: 56,
      section: "aliases",
      description: "\"card is face up/down\"",
      rules: [
        { name: "is_face_up", syntax: "{operator:is} face up" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/method:is face down", line: 57,
      section: "aliases",
      rules: [
        { name: "is_face_down", syntax: "{operator:is} face down" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/method:is a face card", line: 59,
      section: "aliases",
      description: "`card is a face card`",
      rules: [
        { name: "is_a_face_card", syntax: "{operator:is} a face card" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/method:is a (suit)", line: 61,
      section: "aliases",
      description: "\"card is a spade\", \"...is a club\" etc",
      rules: [
        { name: "is_a_$suit", syntax: "{operator:is} (a|an) (expression:club|diamond|heart|spade)" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/method:is a (rank)", line: 63,
      section: "aliases",
      description: "\"card is a queen\", \"...is an ace\" etc",
      rules: [
        { name: "is_a_$rank", syntax: "{operator:is} (a|an) (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king)" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/method:is the (rank) of (suits)", line: 65,
      section: "aliases",
      description: "\"card is the queen of spades\" etc",
      rules: [
        { name: "is_the_$rank_of_$suits", syntax: "{operator:is} the (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king) of (expression:clubs|diamonds|hearts|spades)" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/property:name", line: 68,
      detail: "text",
      section: "aliases",
      description: "name as a derivation of name/suit"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/property:short_suit", line: [70, 75],
      name: "short suit",
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/property:short_rank", line: [77, 80],
      name: "short rank",
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/property:short_direction", line: [82, 84],
      name: "short direction",
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/property:short_name", line: 86,
      name: "short name",
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/property:state", line: 88,
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/method:turn a card face up", line: [94, 96],
      section: "actions",
      description: "Turn card face up or face down\nNote that this will animate if you `wait for turn the card face up`",
      rules: [
        { name: "turn_face_up", syntax: "turn {thisArg:expression} face up" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/method:turn a card face down", line: [97, 99],
      section: "actions",
      rules: [
        { name: "turn_face_down", syntax: "turn {thisArg:expression} face down" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/method:turn a card over", line: [103, 106],
      section: "actions",
      description: "Flip card to opposite direction\nNote that this will animate if you `wait for turn the card face up`",
      rules: [
        { name: "turn_over", syntax: "turn {thisArg:expression} over" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/method:draw a card", line: [108, 115],
      section: "actions",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/property:pile", line: 38,
      detail: "Pile",
      section: "Pile of playing cards",
      uri: "spell:/@system:examples:Drawable%20Solitaire/Pile.spell",
      description: "a card is in one pile at a time:  putting it on another pile takes it off this one"
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/type:Card/method:play a card", line: [125, 151],
      section: "actions",
      uri: "spell:/@system:examples:Drawable%20Solitaire/Solitaire.spell",
      rules: [
        { name: "play", syntax: "play {thisArg:expression}" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Card.spell/function:test card setup", line: [118, 151],
      section: "create a card instance with default properties",
      description: "## create a card instance with default properties",
      rules: [
        { name: "test_card_setup", syntax: "test card setup" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Deck.spell",
      uri: "spell:/@system:examples:Drawable%20Solitaire/Deck.spell"
    },
    {
      path: "project:Drawable Solitaire/file:Deck.spell/type:Deck", line: 3,
      super: "type:List",
      section: "Deck:   US standard card deck (without jokers currently)"
    },
    {
      path: "project:Drawable Solitaire/file:Deck.spell/type:Deck/method:set up a deck", line: [5, 11],
      section: "Deck:   US standard card deck (without jokers currently)",
      rules: [
        { name: "set_up", syntax: "set up {thisArg:expression}" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Deck.spell/type:Deck/property:is_set_up", line: 11,
      name: "is-set-up",
      detail: "choice",
      section: "Deck:   US standard card deck (without jokers currently)"
    },
    {
      path: "project:Drawable Solitaire/file:Deck.spell/type:Deck/method:display a deck", line: [13, 17],
      section: "Deck:   US standard card deck (without jokers currently)",
      rules: [
        { name: "display", syntax: "display {thisArg:expression}" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Deck.spell/function:test deck creation", line: [19, 32],
      section: "Deck:   US standard card deck (without jokers currently)",
      rules: [
        { name: "test_deck_creation", syntax: "test deck creation" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Pile.spell",
      uri: "spell:/@system:examples:Drawable%20Solitaire/Pile.spell"
    },
    {
      path: "project:Drawable Solitaire/file:Pile.spell/type:Pile", line: [3, 36],
      super: "type:DrawableList",
      section: "Pile of playing cards",
      description: "a drawable list:  each pile is its own element, <solitaire-pile>, holding its cards' elements"
    },
    {
      path: "project:Drawable Solitaire/file:Pile.spell/type:Pile/property:name", line: 39,
      detail: "text",
      section: "Pile of playing cards"
    },
    {
      path: "project:Drawable Solitaire/file:Pile.spell/type:Pile/property:color", line: [41, 43],
      section: "Pile of playing cards"
    },
    {
      path: "project:Drawable Solitaire/file:Pile.spell/type:Pile/property:value", line: [45, 47],
      detail: "number",
      section: "Pile of playing cards"
    },
    {
      path: "project:Drawable Solitaire/file:Pile.spell/type:Pile/property:state", line: [49, 53],
      detail: "text",
      section: "Pile of playing cards"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell",
      uri: "spell:/@system:examples:Drawable%20Solitaire/Solitaire.spell"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/type:Game", line: 5,
      super: "type:App",
      section: "Game bits",
      description: "## Game bits"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/type:Game/property:score", line: 6,
      detail: "number",
      section: "Game bits"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/type:Game/property:state", line: [78, 82],
      detail: "list of texts",
      section: "actions"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/type:Game/method:draw a game", line: [231, 267],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/variable:game", line: 7,
      detail: "Game",
      section: "Game bits"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/variable:all_piles", line: 11,
      detail: "list of piles",
      section: "set up all piles",
      description: "## set up all piles"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/variable:foundations", line: 12,
      detail: "list of piles",
      section: "set up all piles"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/variable:tableaus", line: 13,
      detail: "list of piles",
      section: "set up all piles"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/type:StockPile", line: 16,
      super: "project:Drawable Solitaire/file:Pile.spell/type:Pile",
      section: "set up all piles"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/type:StockPile/method:draw a stock-pile", line: [220, 224],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/variable:stock", line: 18,
      detail: "StockPile",
      section: "set up all piles"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/type:DiscardPile", line: 22,
      super: "project:Drawable Solitaire/file:Pile.spell/type:Pile",
      section: "set up all piles"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/type:DiscardPile/method:draw a discard-pile", line: [226, 229],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/variable:discards", line: 24,
      detail: "DiscardPile",
      section: "set up all piles"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/type:Foundation", line: 28,
      super: "project:Drawable Solitaire/file:Pile.spell/type:Pile",
      section: "set up all piles",
      description: "set up foundation piles: where we build up from ace => king"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/type:Foundation/method:draw a foundation", line: [206, 213],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/variable:it", line: 40,
      detail: "Foundation",
      section: "set up all piles"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/type:Tableau", line: [46, 56],
      super: "project:Drawable Solitaire/file:Pile.spell/type:Pile",
      section: "set up all piles",
      description: "set up tableau piles: vertical piles where we arrange from king to ace"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/type:Tableau/method:draw a tableau", line: [215, 218],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/variable:deck", line: 69,
      detail: "Deck",
      section: "set up all piles",
      description: "set up deck of cards"
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/function:debug the game", line: [84, 86],
      section: "actions",
      rules: [
        { name: "debug_the_game", syntax: "debug the game" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/function:reset the stock pile", line: [88, 93],
      section: "actions",
      rules: [
        { name: "reset_the_stock_pile", syntax: "reset the stock pile" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/function:play from the stock pile", line: [95, 102],
      section: "actions",
      rules: [
        { name: "play_from_the_stock_pile", syntax: "play from the stock pile" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/function:deal the cards", line: [104, 123],
      section: "actions",
      rules: [
        { name: "deal_the_cards", syntax: "deal the cards" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/function:auto-play", line: [156, 185],
      section: "actions",
      rules: [
        { name: "auto_play", syntax: "auto-play" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/function:reset the game", line: [187, 189],
      section: "actions",
      rules: [
        { name: "reset_the_game", syntax: "reset the game" }
      ]
    },
    {
      path: "project:Drawable Solitaire/file:Solitaire.spell/function:cheat", line: [191, 199],
      section: "actions",
      rules: [
        { name: "cheat", syntax: "cheat" }
      ]
    }
  ]
}
