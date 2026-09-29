/*! SPELL: SCOPES @system:examples:Solitaire-import */
;(globalThis.SPELL_SCOPES ??= {})[document.currentScript.src] = {
  "id": "@system:examples:Solitaire-import",
  "entries": [
    {
      "path": "project:Solitaire",
      "detail": "imported"
    },
    {
      "path": "project:Solitaire/file:Card.spell",
      "uri": "spell:/@system:examples:Solitaire/Card.spell"
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card",
      "super": "type:Thing",
      "line": 2,
      "description": "## definition of a Card with nice english aliases for working with it"
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/property:color",
      "line": 12,
      "description": "color as derivation of suit"
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/property:direction",
      "line": 18,
      "description": "card direction:  up or down",
      "rules": [
        {
          "name": "Card_Directions",
          "syntax": "(Card|card) (Directions|directions)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/property:name",
      "line": 34,
      "description": "name as a derivation of name/suit"
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/property:rank",
      "line": 6,
      "description": "card ranks",
      "rules": [
        {
          "name": "Card_Ranks",
          "syntax": "(Card|card) (Ranks|ranks)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/property:short_direction",
      "line": [48, 50]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/property:short_name",
      "line": 52
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/property:short_rank",
      "line": [43, 46]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/property:short_suit",
      "line": [36, 41]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/property:state",
      "line": 54
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/property:suit",
      "line": 9,
      "description": "card suits",
      "rules": [
        {
          "name": "Card_Suits",
          "syntax": "(Card|card) (Suits|suits)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/property:value",
      "line": 15,
      "description": "value as a derivation of rank"
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:draw (a card)",
      "line": [74, 81],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:is a (rank)",
      "line": 29,
      "description": "\"card is a queen\", \"...is an ace\" etc",
      "rules": [
        {
          "name": "is_a_$rank",
          "syntax": "{operator:is} (a|an) (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:is a (suit)",
      "line": 27,
      "description": "\"card is a spade\", \"...is a club\" etc",
      "rules": [
        {
          "name": "is_a_$suit",
          "syntax": "{operator:is} (a|an) (expression:club|diamond|heart|spade)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:is a face card",
      "line": 25,
      "description": "`card is a face card`",
      "rules": [
        {
          "name": "is_a_face_card",
          "syntax": "{operator:is} a face card"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:is face down",
      "line": 23,
      "rules": [
        {
          "name": "is_face_down",
          "syntax": "{operator:is} face down"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:is face up",
      "line": 22,
      "description": "\"card is face up/down\"",
      "rules": [
        {
          "name": "is_face_up",
          "syntax": "{operator:is} face up"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:is the (rank) of (suits)",
      "line": 31,
      "description": "\"card is the queen of spades\" etc",
      "rules": [
        {
          "name": "is_the_$rank_of_$suits",
          "syntax": "{operator:is} the (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king) of (expression:clubs|diamonds|hearts|spades)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:move (a card) to (a pile)",
      "uri": "spell:/@system:examples:Solitaire/Pile.spell",
      "line": [15, 19],
      "description": "\"move\" a card\nNOTE: use this rather than `add` to make sure card is only in one pile at a time\nif you `wait for: move the card to the pile` the move will be animated",
      "rules": [
        {
          "name": "move_to_$pile",
          "syntax": "move {thisArg:expression} to {callArgs:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:play (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [111, 138],
      "rules": [
        {
          "name": "play",
          "syntax": "play {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:play (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [111, 138],
      "rules": [
        {
          "name": "play",
          "syntax": "play {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:turn (a card) face down",
      "line": [63, 65],
      "rules": [
        {
          "name": "turn_face_down",
          "syntax": "turn {thisArg:expression} face down"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:turn (a card) face up",
      "line": [60, 62],
      "description": "Turn card face up or face down\nNote that this will animate if you `wait for turn the card face up`",
      "rules": [
        {
          "name": "turn_face_up",
          "syntax": "turn {thisArg:expression} face up"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/method:turn (a card) over",
      "line": [69, 72],
      "description": "Flip card to opposite direction\nNote that this will animate if you `wait for turn the card face up`",
      "rules": [
        {
          "name": "turn_over",
          "syntax": "turn {thisArg:expression} over"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/enumeration:Directions",
      "line": 18,
      "rules": [
        {
          "name": "Card_Directions",
          "syntax": "(Card|card) (Directions|directions)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/constant:up",
      "line": 18,
      "rules": [
        {
          "name": "Card_Directions",
          "syntax": "(Card|card) (Directions|directions)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/constant:down",
      "line": 18,
      "rules": [
        {
          "name": "Card_Directions",
          "syntax": "(Card|card) (Directions|directions)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/enumeration:Ranks",
      "line": 6,
      "rules": [
        {
          "name": "Card_Ranks",
          "syntax": "(Card|card) (Ranks|ranks)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/constant:ace",
      "line": 6,
      "rules": [
        {
          "name": "Card_Ranks",
          "syntax": "(Card|card) (Ranks|ranks)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/constant:jack",
      "line": 6,
      "rules": [
        {
          "name": "Card_Ranks",
          "syntax": "(Card|card) (Ranks|ranks)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/constant:queen",
      "line": 6,
      "rules": [
        {
          "name": "Card_Ranks",
          "syntax": "(Card|card) (Ranks|ranks)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/constant:king",
      "line": 6,
      "rules": [
        {
          "name": "Card_Ranks",
          "syntax": "(Card|card) (Ranks|ranks)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/enumeration:Suits",
      "line": 9,
      "rules": [
        {
          "name": "Card_Suits",
          "syntax": "(Card|card) (Suits|suits)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/constant:clubs",
      "line": 9,
      "rules": [
        {
          "name": "Card_Suits",
          "syntax": "(Card|card) (Suits|suits)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/constant:diamonds",
      "line": 9,
      "rules": [
        {
          "name": "Card_Suits",
          "syntax": "(Card|card) (Suits|suits)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/constant:hearts",
      "line": 9,
      "rules": [
        {
          "name": "Card_Suits",
          "syntax": "(Card|card) (Suits|suits)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/constant:spades",
      "line": 9,
      "rules": [
        {
          "name": "Card_Suits",
          "syntax": "(Card|card) (Suits|suits)"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/constant:black",
      "line": 12
    },
    {
      "path": "project:Solitaire/file:Card.spell/type:Card/constant:red",
      "line": 12
    },
    {
      "path": "project:Solitaire/file:Card.spell/function:test card setup",
      "line": [84, 117],
      "description": "## create a card instance with default properties",
      "rules": [
        {
          "name": "test_card_setup",
          "syntax": "test card setup"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Deck.spell",
      "uri": "spell:/@system:examples:Solitaire/Deck.spell"
    },
    {
      "path": "project:Solitaire/file:Deck.spell/type:Deck",
      "super": "type:List",
      "line": 3
    },
    {
      "path": "project:Solitaire/file:Deck.spell/type:Deck/method:display (a deck)",
      "line": [13, 17],
      "rules": [
        {
          "name": "display",
          "syntax": "display {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Deck.spell/type:Deck/method:set up (a deck)",
      "line": [5, 11],
      "rules": [
        {
          "name": "set_up",
          "syntax": "set up {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Deck.spell/function:test deck creation",
      "line": [19, 41],
      "rules": [
        {
          "name": "test_deck_creation",
          "syntax": "test deck creation"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Pile.spell",
      "uri": "spell:/@system:examples:Solitaire/Pile.spell"
    },
    {
      "path": "project:Solitaire/file:Pile.spell/type:Pile",
      "super": "type:List",
      "line": 2,
      "description": "## Pile of playing cards"
    },
    {
      "path": "project:Solitaire/file:Pile.spell/type:Pile/property:color",
      "line": [4, 6]
    },
    {
      "path": "project:Solitaire/file:Pile.spell/type:Pile/property:state",
      "line": [22, 26]
    },
    {
      "path": "project:Solitaire/file:Pile.spell/type:Pile/property:value",
      "line": [8, 10]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell",
      "uri": "spell:/@system:examples:Solitaire/Solitaire.spell"
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Game",
      "super": "type:App",
      "line": 5,
      "description": "## Game bits"
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Game/property:score",
      "detail": "number",
      "line": 6
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Game/property:state",
      "line": [66, 70]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Game/method:draw (a game)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [218, 254],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Game/method:draw (a game)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [218, 254],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/variable:game",
      "line": 7
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/variable:all_piles",
      "line": 11,
      "description": "## set up all piles"
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/variable:foundations",
      "line": 12
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/variable:tableaus",
      "line": 13
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Stock_Pile",
      "super": "project:Solitaire/file:Pile.spell/type:Pile",
      "line": 16,
      "description": "set up stock pile: unplayed cards"
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Stock_Pile/method:can pick up (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": 17,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Stock_Pile/method:can pick up (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": 17,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Stock_Pile/method:draw (a stock-pile)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [207, 211],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Stock_Pile/method:draw (a stock-pile)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [207, 211],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/variable:stock",
      "line": 18
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Discard_Pile",
      "super": "project:Solitaire/file:Pile.spell/type:Pile",
      "line": 22,
      "description": "set up discards: where played cards go when turning over stock"
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Discard_Pile/method:can pick up (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": 23,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Discard_Pile/method:can pick up (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": 23,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Discard_Pile/method:draw (a discard-pile)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [213, 216],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Discard_Pile/method:draw (a discard-pile)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [213, 216],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/variable:discards",
      "line": 24
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Foundation",
      "super": "project:Solitaire/file:Pile.spell/type:Pile",
      "line": 28,
      "description": "set up foundation piles: where we build up from ace => king"
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Foundation/method:can pick up (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": 29,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Foundation/method:can pick up (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": 29,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Foundation/method:can play (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [30, 31],
      "rules": [
        {
          "name": "can_play_$card",
          "syntax": "{operator:can} play {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Foundation/method:can play (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [30, 31],
      "rules": [
        {
          "name": "can_play_$card",
          "syntax": "{operator:can} play {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Foundation/method:draw (a foundation)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [193, 200],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Foundation/method:draw (a foundation)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [193, 200],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/variable:it",
      "line": 38
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Tableau",
      "super": "project:Solitaire/file:Pile.spell/type:Pile",
      "line": 44,
      "description": "set up tableau piles: vertical piles where we arrange from king to ace"
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Tableau/method:can pick up (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": 45,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Tableau/method:can pick up (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": 45,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Tableau/method:can play (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [46, 49],
      "rules": [
        {
          "name": "can_play_$card",
          "syntax": "{operator:can} play {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Tableau/method:can play (a card)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [46, 49],
      "rules": [
        {
          "name": "can_play_$card",
          "syntax": "{operator:can} play {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Tableau/method:draw (a tableau)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [202, 205],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/type:Tableau/method:draw (a tableau)",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell",
      "line": [202, 205],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/variable:deck",
      "line": 57,
      "description": "set up deck of cards"
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/function:debug the game",
      "line": [72, 74],
      "rules": [
        {
          "name": "debug_the_game",
          "syntax": "debug the game"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/function:reset the stock pile",
      "line": [76, 81],
      "rules": [
        {
          "name": "reset_the_stock_pile",
          "syntax": "reset the stock pile"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/function:play from the stock pile",
      "line": [83, 90],
      "rules": [
        {
          "name": "play_from_the_stock_pile",
          "syntax": "play from the stock pile"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/function:deal the cards",
      "line": [92, 109],
      "rules": [
        {
          "name": "deal_the_cards",
          "syntax": "deal the cards"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/function:auto-play",
      "line": [143, 172],
      "rules": [
        {
          "name": "auto_play",
          "syntax": "auto-play"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/function:reset the game",
      "line": [174, 176],
      "rules": [
        {
          "name": "reset_the_game",
          "syntax": "reset the game"
        }
      ]
    },
    {
      "path": "project:Solitaire/file:Solitaire.spell/function:cheat",
      "line": [178, 186],
      "rules": [
        {
          "name": "cheat",
          "syntax": "cheat"
        }
      ]
    },
    {
      "path": "project:Solitaire-import"
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell",
      "uri": "spell:/@system:examples:Solitaire-import/Solitaire.spell"
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Game",
      "super": "type:App",
      "line": 5,
      "description": "## Game bits"
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Game/property:score",
      "detail": "number",
      "line": 6
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Game/property:state",
      "line": [66, 70]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Game/method:draw (a game)",
      "line": [218, 254],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Game/method:draw (a game)",
      "line": [218, 254],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/variable:game",
      "line": 7
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/variable:all_piles",
      "line": 11,
      "description": "## set up all piles"
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/variable:foundations",
      "line": 12
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/variable:tableaus",
      "line": 13
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Stock_Pile",
      "super": "project:Solitaire/file:Pile.spell/type:Pile",
      "line": 16,
      "description": "set up stock pile: unplayed cards"
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Stock_Pile/method:can pick up (a card)",
      "line": 17,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Stock_Pile/method:can pick up (a card)",
      "line": 17,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Stock_Pile/method:draw (a stock-pile)",
      "line": [207, 211],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Stock_Pile/method:draw (a stock-pile)",
      "line": [207, 211],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/variable:stock",
      "line": 18
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Discard_Pile",
      "super": "project:Solitaire/file:Pile.spell/type:Pile",
      "line": 22,
      "description": "set up discards: where played cards go when turning over stock"
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Discard_Pile/method:can pick up (a card)",
      "line": 23,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Discard_Pile/method:can pick up (a card)",
      "line": 23,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Discard_Pile/method:draw (a discard-pile)",
      "line": [213, 216],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Discard_Pile/method:draw (a discard-pile)",
      "line": [213, 216],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/variable:discards",
      "line": 24
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Foundation",
      "super": "project:Solitaire/file:Pile.spell/type:Pile",
      "line": 28,
      "description": "set up foundation piles: where we build up from ace => king"
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Foundation/method:can pick up (a card)",
      "line": 29,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Foundation/method:can pick up (a card)",
      "line": 29,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Foundation/method:can play (a card)",
      "line": [30, 31],
      "rules": [
        {
          "name": "can_play_$card",
          "syntax": "{operator:can} play {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Foundation/method:can play (a card)",
      "line": [30, 31],
      "rules": [
        {
          "name": "can_play_$card",
          "syntax": "{operator:can} play {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Foundation/method:draw (a foundation)",
      "line": [193, 200],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Foundation/method:draw (a foundation)",
      "line": [193, 200],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/variable:it",
      "line": 38
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Tableau",
      "super": "project:Solitaire/file:Pile.spell/type:Pile",
      "line": 44,
      "description": "set up tableau piles: vertical piles where we arrange from king to ace"
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Tableau/method:can pick up (a card)",
      "line": 45,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Tableau/method:can pick up (a card)",
      "line": 45,
      "rules": [
        {
          "name": "can_pick_up_$card",
          "syntax": "{operator:can} pick up {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Tableau/method:can play (a card)",
      "line": [46, 49],
      "rules": [
        {
          "name": "can_play_$card",
          "syntax": "{operator:can} play {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Tableau/method:can play (a card)",
      "line": [46, 49],
      "rules": [
        {
          "name": "can_play_$card",
          "syntax": "{operator:can} play {expression:simple_expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Tableau/method:draw (a tableau)",
      "line": [202, 205],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/type:Tableau/method:draw (a tableau)",
      "line": [202, 205],
      "rules": [
        {
          "name": "draw",
          "syntax": "draw {thisArg:expression}"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/variable:deck",
      "line": 57,
      "description": "set up deck of cards"
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/function:debug the game",
      "line": [72, 74],
      "rules": [
        {
          "name": "debug_the_game",
          "syntax": "debug the game"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/function:reset the stock pile",
      "line": [76, 81],
      "rules": [
        {
          "name": "reset_the_stock_pile",
          "syntax": "reset the stock pile"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/function:play from the stock pile",
      "line": [83, 90],
      "rules": [
        {
          "name": "play_from_the_stock_pile",
          "syntax": "play from the stock pile"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/function:deal the cards",
      "line": [92, 109],
      "rules": [
        {
          "name": "deal_the_cards",
          "syntax": "deal the cards"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/function:auto-play",
      "line": [143, 172],
      "rules": [
        {
          "name": "auto_play",
          "syntax": "auto-play"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/function:reset the game",
      "line": [174, 176],
      "rules": [
        {
          "name": "reset_the_game",
          "syntax": "reset the game"
        }
      ]
    },
    {
      "path": "project:Solitaire-import/file:Solitaire.spell/function:cheat",
      "line": [178, 186],
      "rules": [
        {
          "name": "cheat",
          "syntax": "cheat"
        }
      ]
    }
  ]
}
