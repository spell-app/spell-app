/*! SPELL: SCOPES @system:examples:Solitaire */
;(globalThis.SPELL_SCOPES ??= {})[document.currentScript.src] = {
  id: "@system:examples:Solitaire",
  entries: [
    { path: "project:Solitaire" },
    {
      path: "project:Solitaire/file:Card.spell",
      uri: "spell:/@system:examples:Solitaire/Card.spell"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card", line: 2,
      super: "type:Thing",
      section: "definition of a Card with nice english aliases for working with it",
      description: "## definition of a Card with nice english aliases for working with it"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/property:rank", line: 6,
      section: "properties of cards",
      description: "card ranks"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/enumeration:Ranks", line: 6,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/constant:ace", line: 6,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/constant:jack", line: 6,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/constant:queen", line: 6,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/constant:king", line: 6,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/property:suit", line: 9,
      section: "properties of cards",
      description: "card suits"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/enumeration:Suits", line: 9,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/constant:clubs", line: 9,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/constant:diamonds", line: 9,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/constant:hearts", line: 9,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/constant:spades", line: 9,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/property:color", line: 12,
      section: "properties of cards",
      description: "color as derivation of suit"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/constant:black", line: 12,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/constant:red", line: 12,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/property:value", line: 15,
      detail: "number",
      section: "properties of cards",
      description: "value as a derivation of rank"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/property:direction", line: 18,
      section: "properties of cards",
      description: "card direction:  up or down"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/enumeration:Directions", line: 18,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/constant:up", line: 18,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/constant:down", line: 18,
      section: "properties of cards"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/method:is face up", line: 22,
      section: "aliases",
      description: "\"card is face up/down\"",
      rules: [
        { name: "is_face_up", syntax: "{operator:is} face up" }
      ]
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/method:is face down", line: 23,
      section: "aliases",
      rules: [
        { name: "is_face_down", syntax: "{operator:is} face down" }
      ]
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/method:is a face card", line: 25,
      section: "aliases",
      description: "`card is a face card`",
      rules: [
        { name: "is_a_face_card", syntax: "{operator:is} a face card" }
      ]
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/method:is a (suit)", line: 27,
      section: "aliases",
      description: "\"card is a spade\", \"...is a club\" etc",
      rules: [
        { name: "is_a_$suit", syntax: "{operator:is} (a|an) (expression:club|diamond|heart|spade)" }
      ]
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/method:is a (rank)", line: 29,
      section: "aliases",
      description: "\"card is a queen\", \"...is an ace\" etc",
      rules: [
        { name: "is_a_$rank", syntax: "{operator:is} (a|an) (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king)" }
      ]
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/method:is the (rank) of (suits)", line: 31,
      section: "aliases",
      description: "\"card is the queen of spades\" etc",
      rules: [
        { name: "is_the_$rank_of_$suits", syntax: "{operator:is} the (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king) of (expression:clubs|diamonds|hearts|spades)" }
      ]
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/property:name", line: 34,
      detail: "text",
      section: "aliases",
      description: "name as a derivation of name/suit"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/property:short_suit", line: [36, 41],
      name: "short suit",
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/property:short_rank", line: [43, 46],
      name: "short rank",
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/property:short_direction", line: [48, 50],
      name: "short direction",
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/property:short_name", line: 52,
      name: "short name",
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/property:state", line: 54,
      detail: "text",
      section: "aliases"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/method:turn a card face up", line: [60, 62],
      section: "actions",
      description: "Turn card face up or face down\nNote that this will animate if you `wait for turn the card face up`",
      rules: [
        { name: "turn_face_up", syntax: "turn {thisArg:expression} face up" }
      ]
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/method:turn a card face down", line: [63, 65],
      section: "actions",
      rules: [
        { name: "turn_face_down", syntax: "turn {thisArg:expression} face down" }
      ]
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/method:turn a card over", line: [69, 72],
      section: "actions",
      description: "Flip card to opposite direction\nNote that this will animate if you `wait for turn the card face up`",
      rules: [
        { name: "turn_over", syntax: "turn {thisArg:expression} over" }
      ]
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/method:draw a card", line: [74, 81],
      section: "actions",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/property:pile", line: 4,
      detail: "Pile",
      section: "Pile of playing cards",
      uri: "spell:/@system:examples:Solitaire/Pile.spell",
      description: "a card is in one pile at a time:  putting it on another pile takes it off this one"
    },
    {
      path: "project:Solitaire/file:Card.spell/type:Card/method:play a card", line: [115, 141],
      section: "actions",
      uri: "spell:/@system:examples:Solitaire/Solitaire.spell",
      rules: [
        { name: "play", syntax: "play {thisArg:expression}" }
      ]
    },
    {
      path: "project:Solitaire/file:Card.spell/function:test card setup", line: [84, 117],
      section: "create a card instance with default properties",
      description: "## create a card instance with default properties",
      rules: [
        { name: "test_card_setup", syntax: "test card setup" }
      ]
    },
    {
      path: "project:Solitaire/file:Deck.spell",
      uri: "spell:/@system:examples:Solitaire/Deck.spell"
    },
    {
      path: "project:Solitaire/file:Deck.spell/type:Deck", line: 3,
      super: "type:List",
      section: "Deck:   US standard card deck (without jokers currently)"
    },
    {
      path: "project:Solitaire/file:Deck.spell/type:Deck/method:set up a deck", line: [5, 11],
      section: "Deck:   US standard card deck (without jokers currently)",
      rules: [
        { name: "set_up", syntax: "set up {thisArg:expression}" }
      ]
    },
    {
      path: "project:Solitaire/file:Deck.spell/type:Deck/property:is_set_up", line: 11,
      name: "is-set-up",
      detail: "choice",
      section: "Deck:   US standard card deck (without jokers currently)"
    },
    {
      path: "project:Solitaire/file:Deck.spell/type:Deck/method:display a deck", line: [13, 17],
      section: "Deck:   US standard card deck (without jokers currently)",
      rules: [
        { name: "display", syntax: "display {thisArg:expression}" }
      ]
    },
    {
      path: "project:Solitaire/file:Deck.spell/function:test deck creation", line: [19, 32],
      section: "Deck:   US standard card deck (without jokers currently)",
      rules: [
        { name: "test_deck_creation", syntax: "test deck creation" }
      ]
    },
    {
      path: "project:Solitaire/file:Pile.spell",
      uri: "spell:/@system:examples:Solitaire/Pile.spell"
    },
    {
      path: "project:Solitaire/file:Pile.spell/type:Pile", line: 2,
      super: "type:List",
      section: "Pile of playing cards",
      description: "## Pile of playing cards"
    },
    {
      path: "project:Solitaire/file:Pile.spell/type:Pile/property:color", line: [6, 8],
      section: "Pile of playing cards"
    },
    {
      path: "project:Solitaire/file:Pile.spell/type:Pile/property:value", line: [10, 12],
      detail: "number",
      section: "Pile of playing cards"
    },
    {
      path: "project:Solitaire/file:Pile.spell/type:Pile/property:state", line: [14, 18],
      detail: "text",
      section: "Pile of playing cards"
    },
    {
      path: "project:Solitaire/file:Pile.spell/type:Pile/property:name", line: 127,
      section: "actions",
      uri: "spell:/@system:examples:Solitaire/Solitaire.spell"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell",
      uri: "spell:/@system:examples:Solitaire/Solitaire.spell"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/type:Game", line: 5,
      super: "type:App",
      section: "Game bits",
      description: "## Game bits"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/type:Game/property:score", line: 6,
      detail: "number",
      section: "Game bits"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/type:Game/property:state", line: [68, 72],
      detail: "list",
      section: "actions"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/type:Game/method:draw a game", line: [221, 257],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/variable:game", line: 7,
      detail: "Game",
      section: "Game bits"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/variable:all_piles", line: 11,
      detail: "list of piles",
      section: "set up all piles",
      description: "## set up all piles"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/variable:foundations", line: 12,
      detail: "list of piles",
      section: "set up all piles"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/variable:tableaus", line: 13,
      detail: "list of piles",
      section: "set up all piles"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/type:Stock_Pile", line: 16,
      super: "project:Solitaire/file:Pile.spell/type:Pile",
      section: "set up all piles",
      description: "set up stock pile: unplayed cards"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/type:Stock_Pile/method:draw a stock-pile", line: [210, 214],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/variable:stock", line: 18,
      detail: "Stock_Pile",
      section: "set up all piles"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/type:Discard_Pile", line: 22,
      super: "project:Solitaire/file:Pile.spell/type:Pile",
      section: "set up all piles",
      description: "set up discards: where played cards go when turning over stock"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/type:Discard_Pile/method:draw a discard-pile", line: [216, 219],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/variable:discards", line: 24,
      detail: "Discard_Pile",
      section: "set up all piles"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/type:Foundation", line: 28,
      super: "project:Solitaire/file:Pile.spell/type:Pile",
      section: "set up all piles",
      description: "set up foundation piles: where we build up from ace => king"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/type:Foundation/method:draw a foundation", line: [196, 203],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/variable:it", line: 40,
      detail: "Foundation",
      section: "set up all piles"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/type:Tableau", line: 46,
      super: "project:Solitaire/file:Pile.spell/type:Pile",
      section: "set up all piles",
      description: "set up tableau piles: vertical piles where we arrange from king to ace"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/type:Tableau/method:draw a tableau", line: [205, 208],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/variable:deck", line: 59,
      detail: "Deck",
      section: "set up all piles",
      description: "set up deck of cards"
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/function:debug the game", line: [74, 76],
      section: "actions",
      rules: [
        { name: "debug_the_game", syntax: "debug the game" }
      ]
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/function:reset the stock pile", line: [78, 83],
      section: "actions",
      rules: [
        { name: "reset_the_stock_pile", syntax: "reset the stock pile" }
      ]
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/function:play from the stock pile", line: [85, 92],
      section: "actions",
      rules: [
        { name: "play_from_the_stock_pile", syntax: "play from the stock pile" }
      ]
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/function:deal the cards", line: [94, 113],
      section: "actions",
      rules: [
        { name: "deal_the_cards", syntax: "deal the cards" }
      ]
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/function:auto-play", line: [146, 175],
      section: "actions",
      rules: [
        { name: "auto_play", syntax: "auto-play" }
      ]
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/function:reset the game", line: [177, 179],
      section: "actions",
      rules: [
        { name: "reset_the_game", syntax: "reset the game" }
      ]
    },
    {
      path: "project:Solitaire/file:Solitaire.spell/function:cheat", line: [181, 189],
      section: "actions",
      rules: [
        { name: "cheat", syntax: "cheat" }
      ]
    }
  ]
}
