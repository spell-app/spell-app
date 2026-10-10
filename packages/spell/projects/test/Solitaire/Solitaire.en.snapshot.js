/*! SPELL: WORDS Solitaire en */
export const words = {
  lang: "en",
  types: {
    Card: {
      rank: "rank",
      suit: "suit",
      color: "color",
      value: "value",
      direction: "direction",
      isFaceUp: "is face up",
      isFaceDown: "is face down",
      isAFaceCard: "is a face card",
      isASuit: "is a (suit)",
      isARank: "is a (rank)",
      isTheRankOfSuits: "is the (rank) of (suits)",
      name: "name",
      shortSuit: "short-suit",
      shortRank: "short-rank",
      shortDirection: "short-direction",
      shortName: "short-name",
      state: "state",
      turnFaceUp: "turn (a card) face up",
      turnFaceDown: "turn (a card) face down",
      turnOver: "turn (a card) over",
      draw: "draw (a card)",
      moveToPile: "move (a card) to (a pile)",
      play: "play (a card)",
      pile: "pile"
    },
    Deck: {
      setUp: "set up (a deck)",
      display: "display (a deck)",
      isSetUp: "is-set-up"
    },
    Pile: {
      color: "color",
      value: "value",
      state: "state",
      name: "name"
    },
    Game: {
      score: "score",
      state: "state",
      draw: "draw (a game)"
    },
    Stock_Pile: {
      canPickUpCard: "can pick up (a card)",
      draw: "draw (a stock-pile)"
    },
    Discard_Pile: {
      canPickUpCard: "can pick up (a card)",
      draw: "draw (a discard-pile)"
    },
    Foundation: {
      canPickUpCard: "can pick up (a card)",
      canPlayCard: "can play (a card)",
      draw: "draw (a foundation)"
    },
    Tableau: {
      canPickUpCard: "can pick up (a card)",
      canPlayCard: "can play (a card)",
      draw: "draw (a tableau)"
    }
  }
}
