/*! SPELL: WORDS Solitaire en */
export const words = {
  lang: "en",
  types: {
    Card: {
      rank: "rank",
      value: "value",
      isARank: "is a (rank)",
      isAFaceCard: "is a face card",
      isANumberCard: "is a number card",
      suit: "suit",
      isASuit: "is a (suit)",
      color: "color",
      name: "name",
      isTheRankOfSuit: "is the (rank) of (suit)",
      direction: "direction",
      isFaceDirection: "is face (direction)",
      turnFaceUp: "turn it face up",
      turnFaceDown: "turn it face down",
      turnOver: "turn it over",
      picture: "picture",
      draw: "draw it",
      symbol: "symbol",
      state: "state",
      play: "play a card",
      putOnPile: "put a card on a pile",
      countThePointsForCardOnPile: "count the points for a card on a pile",
      pile: "pile"
    },
    Joker: {
      color: "color",
      isTheColorJoker: "is the (color) joker",
      value: "value",
      picture: "picture",
      name: "name",
      state: "state"
    },
    Deck: {
      jokers: "jokers",
      create: "create it",
      state: "state"
    },
    Pile: {
      name: "name",
      layout: "layout",
      color: "color",
      value: "value",
      state: "state"
    },
    StockPile: {
      layout: "layout"
    },
    DiscardPile: {
      layout: "layout"
    },
    Foundation: {
      layout: "layout",
      suit: "suit"
    },
    Tableau: {
      layout: "layout"
    },
    Solitaire: {
      score: "score",
      hint: "hint",
      deck: "deck",
      stock: "stock",
      discards: "discards",
      clubs: "clubs",
      diamonds: "diamonds",
      hearts: "hearts",
      spades: "spades",
      T1: "T1",
      T2: "T2",
      T3: "T3",
      T4: "T4",
      T5: "T5",
      T6: "T6",
      T7: "T7",
      create: "create it",
      debug: "debug it",
      resetTheStock: "reset the stock",
      playFromTheStock: "play from the stock",
      dealTheCards: "deal the cards",
      startANewGame: "start a new game",
      cheat: "cheat",
      autoPlay: "auto play",
      draw: "draw it"
    }
  }
}
