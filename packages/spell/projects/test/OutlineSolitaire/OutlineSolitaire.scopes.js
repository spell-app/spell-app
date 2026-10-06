/*! SPELL: SCOPES @test:fixtures:OutlineSolitaire */
;(globalThis.SPELL_SCOPES ??= {})[document.currentScript.src] = {
  id: "@test:fixtures:OutlineSolitaire",
  entries: [
    { path: "project:OutlineSolitaire" },
    {
      path: "project:OutlineSolitaire/file:Deck.spell",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Deck.spell"
    },
    {
      path: "project:OutlineSolitaire/file:Deck.spell/type:Deck", line: [4, 10],
      super: "type:List",
      section: "Deck:  US standard card deck (without jokers) -- in the outline style",
      description: "First in the project:  a card says `its \"suit\" is a suit of its deck`, so the deck's kinds come before it.\nWhat a deck DOES uses the card's names, so it's in `Dealing.spell`, after `Card.spell`."
    },
    {
      path: "project:OutlineSolitaire/file:Deck.spell/type:Deck/enumeration:Suits", line: 5,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style"
    },
    {
      path: "project:OutlineSolitaire/file:Deck.spell/type:Deck/enumeration:Ranks", line: 9,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style"
    },
    {
      path: "project:OutlineSolitaire/file:Deck.spell/type:Deck/method:set up a deck", line: [3, 9],
      section: ", as it reads a card's names",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Dealing.spell",
      rules: [
        { name: "set_up", syntax: "set up {thisArg:expression}" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Deck.spell/type:Deck/property:is_set_up", line: 9,
      name: "is-set-up",
      detail: "choice",
      section: ", as it reads a card's names",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Dealing.spell"
    },
    {
      path: "project:OutlineSolitaire/file:Deck.spell/type:Deck/method:display a deck", line: [11, 15],
      section: ", as it reads a card's names",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Dealing.spell",
      rules: [
        { name: "display", syntax: "display {thisArg:expression}" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Deck.spell/type:Suit", line: 5,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style"
    },
    {
      path: "project:OutlineSolitaire/file:Deck.spell/type:Suit/property:color", line: [6, 8],
      section: "Deck:  US standard card deck (without jokers) -- in the outline style"
    },
    {
      path: "project:OutlineSolitaire/file:Deck.spell/type:Rank", line: 9,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style"
    },
    {
      path: "project:OutlineSolitaire/file:Deck.spell/type:Rank/method:is a face card", line: 10,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style",
      rules: [
        { name: "is_a_face_card", syntax: "{operator:is} a face card" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Card.spell"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card", line: [2, 44],
      super: "type:Thing",
      section: "Definition of a card -- in the outline style:  a heading, then what's true of it",
      description: "## Definition of a card -- in the outline style:  a heading, then what's true of it"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:suit", line: 5,
      detail: "Suit",
      section: "suit and rank",
      description: "## suit and rank"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:color", line: 6,
      section: "suit and rank"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/method:is a (suit)", line: 7,
      section: "suit and rank",
      description: "e.g. \"the card is a spade\"",
      rules: [
        { name: "is_a_$suit", syntax: "{operator:is} (a|an) (expression:club|diamond|heart|spade)" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:rank", line: 8,
      detail: "Rank",
      section: "suit and rank"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/method:is a (rank)", line: 9,
      section: "suit and rank",
      description: "e.g. \"the card is a queen\"",
      rules: [
        { name: "is_a_$rank", syntax: "{operator:is} (a|an) (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king)" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/method:is the (rank) of (suits)", line: 10,
      section: "suit and rank",
      description: "e.g. \"the card is the queen of spades\"",
      rules: [
        { name: "is_the_$rank_of_$suits", syntax: "{operator:is} the (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king) of (expression:clubs|diamonds|hearts|spades)" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/method:is a face card", line: 11,
      section: "suit and rank",
      rules: [
        { name: "is_a_face_card", syntax: "{operator:is} a face card" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:value", line: 12,
      detail: "number",
      section: "suit and rank"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:direction", line: 15,
      section: "direction",
      description: "## direction"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/enumeration:Directions", line: 15,
      section: "direction"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/constant:up", line: 15,
      section: "direction"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/constant:down", line: 15,
      section: "direction"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/method:is face up", line: 16,
      section: "direction",
      rules: [
        { name: "is_face_up", syntax: "{operator:is} face up" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/method:is face down", line: 17,
      section: "direction",
      rules: [
        { name: "is_face_down", syntax: "{operator:is} face down" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:name", line: 20,
      detail: "text",
      section: "names",
      description: "## names"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:short_suit", line: [21, 26],
      name: "short suit",
      detail: "text",
      section: "names"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:short_rank", line: [27, 30],
      name: "short rank",
      detail: "text",
      section: "names"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:short_direction", line: [31, 33],
      name: "short direction",
      detail: "text",
      section: "names"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:short_name", line: 34,
      name: "short name",
      detail: "text",
      section: "names"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:state", line: 35,
      detail: "text",
      section: "names"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:front", line: [38, 42],
      section: "drawing"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:back", line: [43, 44],
      section: "drawing"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/method:turn a card face up", line: [50, 52],
      section: "actions -- the sentence style, beside the outline",
      description: "Turn card face up or face down\nNote that this will animate if you `wait for turn the card face up`",
      rules: [
        { name: "turn_face_up", syntax: "turn {thisArg:expression} face up" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/method:turn a card face down", line: [53, 55],
      section: "actions -- the sentence style, beside the outline",
      rules: [
        { name: "turn_face_down", syntax: "turn {thisArg:expression} face down" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/method:turn a card over", line: [59, 62],
      section: "actions -- the sentence style, beside the outline",
      description: "Flip card to opposite direction\nNote that this will animate if you `wait for turn the card face up`",
      rules: [
        { name: "turn_over", syntax: "turn {thisArg:expression} over" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/property:pile", line: 4,
      detail: "Pile",
      section: "Pile of playing cards",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Pile.spell",
      description: "a card is in one pile at a time:  putting it on another pile takes it off this one"
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/type:Card/method:play a card", line: [115, 141],
      section: "actions",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Solitaire.spell",
      rules: [
        { name: "play", syntax: "play {thisArg:expression}" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Card.spell/function:test card setup", line: [65, 98],
      section: "create a card instance with default properties",
      description: "## create a card instance with default properties",
      rules: [
        { name: "test_card_setup", syntax: "test card setup" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Dealing.spell",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Dealing.spell"
    },
    {
      path: "project:OutlineSolitaire/file:Dealing.spell/function:test deck creation", line: [17, 30],
      section: ", as it reads a card's names",
      rules: [
        { name: "test_deck_creation", syntax: "test deck creation" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Pile.spell",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Pile.spell"
    },
    {
      path: "project:OutlineSolitaire/file:Pile.spell/type:Pile", line: 2,
      super: "type:List",
      section: "Pile of playing cards",
      description: "## Pile of playing cards"
    },
    {
      path: "project:OutlineSolitaire/file:Pile.spell/type:Pile/property:color", line: [6, 8],
      section: "Pile of playing cards"
    },
    {
      path: "project:OutlineSolitaire/file:Pile.spell/type:Pile/property:value", line: [10, 12],
      detail: "number",
      section: "Pile of playing cards"
    },
    {
      path: "project:OutlineSolitaire/file:Pile.spell/type:Pile/property:state", line: [14, 18],
      detail: "text",
      section: "Pile of playing cards"
    },
    {
      path: "project:OutlineSolitaire/file:Pile.spell/type:Pile/property:name", line: 127,
      section: "actions",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Solitaire.spell"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Solitaire.spell"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/type:Game", line: 5,
      super: "type:App",
      section: "Game bits",
      description: "## Game bits"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/type:Game/property:score", line: 6,
      detail: "number",
      section: "Game bits"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/type:Game/property:state", line: [68, 72],
      detail: "list",
      section: "actions"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/type:Game/method:draw a game", line: [221, 257],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/variable:game", line: 7,
      detail: "Game",
      section: "Game bits"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/variable:all_piles", line: 11,
      detail: "list of piles",
      section: "set up all piles",
      description: "## set up all piles"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/variable:foundations", line: 12,
      detail: "list of piles",
      section: "set up all piles"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/variable:tableaus", line: 13,
      detail: "list of piles",
      section: "set up all piles"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/type:Stock_Pile", line: 16,
      super: "project:OutlineSolitaire/file:Pile.spell/type:Pile",
      section: "set up all piles",
      description: "set up stock pile: unplayed cards"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/type:Stock_Pile/method:draw a stock-pile", line: [210, 214],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/variable:stock", line: 18,
      detail: "Stock_Pile",
      section: "set up all piles"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/type:Discard_Pile", line: 22,
      super: "project:OutlineSolitaire/file:Pile.spell/type:Pile",
      section: "set up all piles",
      description: "set up discards: where played cards go when turning over stock"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/type:Discard_Pile/method:draw a discard-pile", line: [216, 219],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/variable:discards", line: 24,
      detail: "Discard_Pile",
      section: "set up all piles"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/type:Foundation", line: 28,
      super: "project:OutlineSolitaire/file:Pile.spell/type:Pile",
      section: "set up all piles",
      description: "set up foundation piles: where we build up from ace => king"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/type:Foundation/method:draw a foundation", line: [196, 203],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/variable:it", line: 40,
      detail: "Foundation",
      section: "set up all piles"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/type:Tableau", line: 46,
      super: "project:OutlineSolitaire/file:Pile.spell/type:Pile",
      section: "set up all piles",
      description: "set up tableau piles: vertical piles where we arrange from king to ace"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/type:Tableau/method:draw a tableau", line: [205, 208],
      section: "rendering the bits",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/variable:deck", line: 59,
      detail: "Deck",
      section: "set up all piles",
      description: "set up deck of cards"
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/function:debug the game", line: [74, 76],
      section: "actions",
      rules: [
        { name: "debug_the_game", syntax: "debug the game" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/function:reset the stock pile", line: [78, 83],
      section: "actions",
      rules: [
        { name: "reset_the_stock_pile", syntax: "reset the stock pile" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/function:play from the stock pile", line: [85, 92],
      section: "actions",
      rules: [
        { name: "play_from_the_stock_pile", syntax: "play from the stock pile" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/function:deal the cards", line: [94, 113],
      section: "actions",
      rules: [
        { name: "deal_the_cards", syntax: "deal the cards" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/function:auto-play", line: [146, 175],
      section: "actions",
      rules: [
        { name: "auto_play", syntax: "auto-play" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/function:reset the game", line: [177, 179],
      section: "actions",
      rules: [
        { name: "reset_the_game", syntax: "reset the game" }
      ]
    },
    {
      path: "project:OutlineSolitaire/file:Solitaire.spell/function:cheat", line: [181, 189],
      section: "actions",
      rules: [
        { name: "cheat", syntax: "cheat" }
      ]
    },
    {
      path: "project:OutlineSolitaire/constant:clubs", line: 5,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Deck.spell"
    },
    {
      path: "project:OutlineSolitaire/constant:diamonds", line: 5,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Deck.spell"
    },
    {
      path: "project:OutlineSolitaire/constant:hearts", line: 5,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Deck.spell"
    },
    {
      path: "project:OutlineSolitaire/constant:spades", line: 5,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Deck.spell"
    },
    {
      path: "project:OutlineSolitaire/constant:red", line: 7,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Deck.spell"
    },
    {
      path: "project:OutlineSolitaire/constant:black", line: 8,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Deck.spell"
    },
    {
      path: "project:OutlineSolitaire/constant:ace", line: 9,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Deck.spell"
    },
    {
      path: "project:OutlineSolitaire/constant:jack", line: 9,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Deck.spell"
    },
    {
      path: "project:OutlineSolitaire/constant:queen", line: 9,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Deck.spell"
    },
    {
      path: "project:OutlineSolitaire/constant:king", line: 9,
      section: "Deck:  US standard card deck (without jokers) -- in the outline style",
      uri: "spell:/@test:fixtures:OutlineSolitaire/Deck.spell"
    }
  ]
}
