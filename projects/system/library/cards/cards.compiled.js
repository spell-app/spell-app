/*! SPELL: PROJECT { version: "1.0.0", spellVersion: "0.8.0", provides: ["Card", "Joker", "Deck", "Pile", "test_card_setup", "test_deck_creation", "test_deck_with_jokers"] } */
import { spellCore, Thing, List, App } from "@spell/core"

/*! SPELL: DECLARES {
  type: "Card", superType: "Thing",
  defined: "/Card.spell:69-86",
} */
/** Definition of a Card with nice english aliases for working with it */
export class Card extends Thing {}

/////////////////////////
// ## properties of cards
/////////////////////////
/*! SPELL: DECLARES {
  property: "rank", classVariable: "Ranks", rule: "enumeration", of: "Card",
  enumeration: ["'ace'", 2, 3, 4, 5, 6, 7, 8, 9, 10, "'jack'", "'queen'", "'king'"],
  defined: "/Card.spell:125-205",
} */
/** card ranks */
spellCore.defineProperty(Card.prototype, {
	property: 'rank',
	enumeration: ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'],
	enumerationProp: 'Ranks'
})

/*! SPELL: DECLARES {
  property: "suit", classVariable: "Suits", rule: "enumeration", of: "Card",
  enumeration: ["'clubs'", "'diamonds'", "'hearts'", "'spades'"],
  defined: "/Card.spell:221-282",
} */
/** card suits */
spellCore.defineProperty(Card.prototype, {
	property: 'suit',
	enumeration: ['clubs', 'diamonds', 'hearts', 'spades'],
	enumerationProp: 'Suits'
})

/*! SPELL: DECLARES {
  property: "color", of: "Card", constants: ["red", "black"],
  defined: "/Card.spell:315-404",
} */
/** color as derivation of suit */
spellCore.define(Card.prototype, 'color', {
	get() {
		if (spellCore.includes(['diamonds', 'hearts'], this.suit)) { return 'red' }
		return 'black'
	}
})

/*! SPELL: DECLARES {
  property: "value", of: "Card",
  defined: "/Card.spell:439-500",
} */
/** value as a derivation of rank */
spellCore.define(Card.prototype, 'value', {
	get() {
		return spellCore.itemOf(Card.Ranks, this.rank)
	}
})

/*! SPELL: DECLARES {
  property: "direction", classVariable: "Directions", rule: "enumeration", of: "Card",
  enumeration: ["'up'", "'down'"],
  defined: "/Card.spell:533-576",
} */
/** card direction:  up or down */
spellCore.defineProperty(Card.prototype, {
	property: 'direction',
	enumeration: ['up', 'down'],
	enumerationProp: 'Directions'
})

/////////////
// ## aliases
/////////////
/*! SPELL: DECLARES {
  syntax: "{operator:is} face up", output: "is_face_up", rule: "method_postfix", of: "Card",
  kind: "method", name: '"is face up"',
  defined: "/Card.spell:615-657",
} */
/** "card is face up/down" */
spellCore.define(Card.prototype, 'is_face_up', {
	get() {
		return (this.direction == 'up')
	}
})
/*! SPELL: DECLARES {
  syntax: "{operator:is} face down", output: "is_face_down", rule: "method_postfix", of: "Card",
  kind: "method", name: '"is face down"',
  defined: "/Card.spell:658-704",
} */
spellCore.define(Card.prototype, 'is_face_down', {
	get() {
		return (this.direction == 'down')
	}
})
/*! SPELL: DECLARES {
  syntax: "{operator:is} a face card", output: "is_a_face_card", rule: "method_postfix", of: "Card",
  kind: "method", name: '"is a face card"',
  defined: "/Card.spell:730-795",
} */
/** `card is a face card` */
spellCore.define(Card.prototype, 'is_a_face_card', {
	get() {
		return spellCore.includes(['jack', 'queen', 'king'], this.rank)
	}
})
/*! SPELL: DECLARES {
  syntax: "{operator:is} (a|an) (expression:club|diamond|heart|spade)", output: "is_a_$suit",
  rule: "quoted_property", of: "Card", kind: "method", name: '"is a (suit)"',
  values: { suit: ["'clubs'", "'diamonds'", "'hearts'", "'spades'"] },
  defined: "/Card.spell:837-871",
} */
/** "card is a spade", "...is a club" etc */
spellCore.define(Card.prototype, 'is_a_$suit', {
	value(suit) {
		return this.suit === suit
	}
})
/*! SPELL: DECLARES {
  syntax: "{operator:is} (a|an) (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king)",
  output: "is_a_$rank", rule: "quoted_property", of: "Card", kind: "method", name: '"is a (rank)"',
  values: { rank: ["'ace'", 2, 3, 4, 5, 6, 7, 8, 9, 10, "'jack'", "'queen'", "'king'"] },
  defined: "/Card.spell:913-947",
} */
/** "card is a queen", "...is an ace" etc */
spellCore.define(Card.prototype, 'is_a_$rank', {
	value(rank) {
		return this.rank === rank
	}
})
/*! SPELL: DECLARES {
  syntax: "{operator:is} the (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king) of (expression:clubs|diamonds|hearts|spades)",
  output: "is_the_$rank_of_$suits", rule: "quoted_property", of: "Card", kind: "method",
  name: '"is the (rank) of (suits)"',
  values: { rank: ["'ace'", 2, 3, 4, 5, 6, 7, 8, 9, 10, "'jack'", "'queen'", "'king'"], suits: ["'clubs'", "'diamonds'", "'hearts'", "'spades'"] },
  defined: "/Card.spell:985-1046",
} */
/** "card is the queen of spades" etc */
spellCore.define(Card.prototype, 'is_the_$rank_of_$suits', {
	value(rank, suit) {
		return this.rank === rank && this.suit === suit
	}
})

/*! SPELL: DECLARES {
  property: "name", of: "Card",
  defined: "/Card.spell:1085-1136",
} */
/** name as a derivation of name/suit */
spellCore.define(Card.prototype, 'name', {
	get() {
		return ((this.rank + "-of-") + this.suit)
	}
})

/*! SPELL: DECLARES {
  property: "short_suit", of: "Card",
  defined: "/Card.spell:1138-1299",
} */
spellCore.define(Card.prototype, 'short_suit', {
	get() {
		if (this.is_a_$suit('clubs')) { return "♣️" }
		if (this.is_a_$suit('diamonds')) { return "♦️" }
		if (this.is_a_$suit('hearts')) { return "♥️" }
		if (this.is_a_$suit('spades')) { return "♠️" }
		return "?"
	}
})

/*! SPELL: DECLARES {
  property: "short_rank", of: "Card",
  defined: "/Card.spell:1301-1465",
} */
spellCore.define(Card.prototype, 'short_rank', {
	get() {
		if (this.rank == undefined) { return "?" }
		if (spellCore.isOfType(this.rank, 'number')) { return ("" + this.rank) }
		return spellCore.upperCase(spellCore.getItemOf(this.rank, 1))
	}
})

/*! SPELL: DECLARES {
  property: "short_direction", of: "Card",
  defined: "/Card.spell:1467-1547",
} */
spellCore.define(Card.prototype, 'short_direction', {
	get() {
		if (this.direction == 'up') { return "+" }
		return "—"
		
	}
})
/*! SPELL: DECLARES {
  property: "short_name", of: "Card",
  defined: "/Card.spell:1550-1610",
} */
spellCore.define(Card.prototype, 'short_name', {
	get() {
		return (this.short_rank + this.short_suit)
	}
})

/*! SPELL: DECLARES {
  property: "state", of: "Card",
  defined: "/Card.spell:1612-1689",
} */
spellCore.define(Card.prototype, 'state', {
	get() {
		return ((this.short_rank + this.short_suit) + this.short_direction)
	}
})

//## actions

/*! SPELL: DECLARES {
  syntax: "turn {thisArg:expression} face up", output: "turn_face_up", rule: "method_call",
  of: "Card", alias: ["statement", "expression"], kind: "method", name: "turn (a card) face up",
  defined: "/Card.spell:1808-1878",
} */
/**
 * Turn card face up or face down
 * Note that this will animate if you `wait for turn the card face up`
 */
spellCore.define(Card.prototype, 'turn_face_up', {
	async value() {
		this.direction = 'up'
		await spellCore.pauseFor(50, 'msec')
	}
})
/*! SPELL: DECLARES {
  syntax: "turn {thisArg:expression} face down", output: "turn_face_down", rule: "method_call",
  of: "Card", alias: ["statement", "expression"], kind: "method", name: "turn (a card) face down",
  defined: "/Card.spell:1879-1953",
} */
spellCore.define(Card.prototype, 'turn_face_down', {
	async value() {
		this.direction = 'down'
		await spellCore.pauseFor(50, 'msec')
	}
})

/*! SPELL: DECLARES {
  syntax: "turn {thisArg:expression} over", output: "turn_over", rule: "method_call", of: "Card",
  alias: ["statement", "expression"], kind: "method", name: "turn (a card) over",
  defined: "/Card.spell:2061-2173",
} */
/**
 * Flip card to opposite direction
 * Note that this will animate if you `wait for turn the card face up`
 */
spellCore.define(Card.prototype, 'turn_over', {
	async value() {
		if (this.direction == 'up') { this.turn_face_down() }
		else { this.turn_face_up() }
		await spellCore.pauseFor(50, 'msec')
	}
})

/*! SPELL: DECLARES {
  syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Card",
  alias: ["statement", "expression"], kind: "method", name: "draw (a card)",
  defined: "/Card.spell:2175-2651",
} */
spellCore.define(Card.prototype, 'draw', {
	value() {
		let className = (((((("Card face-" + this.direction) + " ") + this.rank) + " ") + this.suit) + " ui button compact fluid ")
		if (this.is_face_down) { return spellCore.element({
			tag: "div",
			props: {
				onClick: (event) => {
					return spellCore.RUNTIME.trigger('card-click', { card: this })
				},
				className: className
			},
			children: [
				spellCore.element({ tag: "i", props: { className: "fitted bicycle icon" } })
			]
		}) }
		return spellCore.element({
			tag: "div",
			props: {
				onClick: (event) => {
					return spellCore.RUNTIME.trigger('card-click', { card: this })
				},
				className: (className + this.color)
			},
			children: [
				(this.short_rank + " "),
				spellCore.element({ tag: "span", props: { className: "suit" }, children: [
					this.short_suit
				] })
			]
		})
	}
})

/*! SPELL: DECLARES {
  type: "Joker", superType: "Card",
  defined: "/Card.spell:2735-2752",
} */
/** A joker: a wild card with no rank or suit -- there's a red one and a black one */
export class Joker extends Card {}

/*! SPELL: DECLARES {
  property: "color", classVariable: "Colors", rule: "enumeration", of: "Joker",
  enumeration: ["'red'", "'black'"],
  defined: "/Card.spell:2845-2887",
} */
/** joker color:  red or black -- set when it's made, as it has no suit to work it out from */
spellCore.defineProperty(Joker.prototype, {
	property: 'color',
	enumeration: ['red', 'black'],
	enumerationProp: 'Colors'
})

/*! SPELL: DECLARES {
  property: "name", of: "Joker",
  defined: "/Card.spell:2928-2972",
} */
/** name as its color, e.g. "red joker" */
spellCore.define(Joker.prototype, 'name', {
	get() {
		return (this.color + "-joker")
	}
})

/*! SPELL: DECLARES {
  property: "short_name", of: "Joker",
  defined: "/Card.spell:2974-3008",
} */
spellCore.define(Joker.prototype, 'short_name', {
	get() {
		return "🃏"
	}
})

/*! SPELL: DECLARES {
  syntax: "{operator:is} the {expression:simple_expression} joker", output: "is_the_$color_joker",
  rule: "method_infix", of: "Card", kind: "method", name: '"is the (color) joker"',
  defined: "/Card.spell:3120-3189",
} */
/** "card is the red joker", "...is the black joker" -- asked of ANY card, which only a joker of that color is */
spellCore.define(Card.prototype, 'is_the_$color_joker', {
	value(color) {
		return (spellCore.isOfType(this, 'Joker') && (this.color == color))
	}
})

/*! SPELL: DECLARES {
  syntax: "test card setup", output: "test_card_setup", rule: "method_call", alias: "statement",
  kind: "function", name: "card setup",
  defined: "/Card.spell:3241-5021",
} */
/** create a card instance with default properties */
export function test_card_setup() {
	return spellCore.test('test card setup', function test_card_setup() {
		spellCore.echoTestAction(`the card is a new card whose rank is queen, suit is spades and direction is up`)
		let card = new Card({
			rank: 'queen',
			suit: 'spades',
			direction: 'up'
		})
		spellCore.echo(card)
		spellCore.expect(card.rank, `the rank of the card`, 'queen', `queen`)
		spellCore.expect(card.suit, `the suit of the card`, 'spades', `spades`)
		spellCore.expect(card.name, `the name of the card`, "queen-of-spades", `"queen-of-spades"`)
		spellCore.expect(card.color, `the color of the card`, 'black', `black`)
		spellCore.expect(card.value, `the value of the card`, 12, `12`)
		spellCore.expect(card.short_suit, `the short-suit of the card`, "♠️", `"♠️"`)
		spellCore.expect(card.short_rank, `the short-rank of the card`, "Q", `"Q"`)
		spellCore.expect(card.short_name, `the short-name of the card`, "Q♠️", `"Q♠️"`)
		
		spellCore.expect(card.is_face_up, `the card is face up`, true, `yes`)
		spellCore.expect(card.is_face_down, `the card is face down`, false, `no`)
		
		spellCore.expect(card.is_a_face_card, `the card is a face card`, true, `yes`)
		spellCore.expect(!card.is_a_face_card, `the card is not a face card`, false, `false`)
		
		spellCore.expect(card.is_a_$suit('spades'), `the card is a spade`, true, `true`)
		spellCore.expect(card.is_a_$suit('clubs'), `the card is a club`, false, `false`)
		
		spellCore.expect(card.is_a_$rank('queen'), `the card is a queen`, true, `true`)
		spellCore.expect(card.is_a_$rank('ace'), `the card is an ace`, false, `false`)
		spellCore.expect(card.is_a_$rank(2), `the card is a 2`, false, `false`)
		
		spellCore.expect(card.is_the_$rank_of_$suits('queen', 'spades'), `the card is the queen of spades`, true, `true`)
		spellCore.expect(card.is_the_$rank_of_$suits('queen', 'clubs'), `the card is the queen of clubs`, false, `false`)
		spellCore.expect(!card.is_the_$rank_of_$suits(2, 'diamonds'), `the card is not the 2 of diamonds`, true, `true`)
		
		spellCore.echoTestAction(`turn the card face down`)
		card.turn_face_down()
		spellCore.expect(card.direction, `the direction of the card`, 'down', `down`)
		
		spellCore.echoTestAction(`turn the card over`)
		card.turn_over()
		spellCore.expect(card.is_face_up, `the card is face up`, true, `true`)
		
		spellCore.echoTestAction(`the joker is a new joker whose color is red and direction is up`)
		let joker = new Joker({ color: 'red', direction: 'up' })
		spellCore.echo(joker)
		spellCore.expect(spellCore.isOfType(joker, 'Joker'), `the joker is a joker`, true, `yes`)
		spellCore.expect(spellCore.isOfType(joker, 'Card'), `the joker is a card`, true, `yes`)
		spellCore.expect(spellCore.isOfType(card, 'Joker'), `the card is a joker`, false, `no`)
		spellCore.expect(!spellCore.isOfType(card, 'Joker'), `the card is not a joker`, true, `yes`)
		
		spellCore.expect(joker.color, `the color of the joker`, 'red', `red`)
		spellCore.expect(joker.name, `the name of the joker`, "red-joker", `"red-joker"`)
		spellCore.expect(joker.short_name, `the short-name of the joker`, "🃏", `"🃏"`)
		spellCore.expect(joker.is_face_up, `the joker is face up`, true, `yes`)
		spellCore.echoTestAction(`turn the joker over`)
		joker.turn_over()
		spellCore.expect(joker.is_face_down, `the joker is face down`, true, `yes`)
		
		spellCore.expect(joker.is_the_$color_joker('red'), `the joker is the red joker`, true, `yes`)
		spellCore.expect(joker.is_the_$color_joker('black'), `the joker is the black joker`, false, `no`)
		spellCore.expect(!(joker.is_the_$color_joker('black')), `the joker is not the black joker`, true, `yes`)
		spellCore.expect(card.is_the_$color_joker('red'), `the card is the red joker`, false, `no`)
	})
}
test_card_setup()


// -----------
//## Deck:   US standard card deck -- with its two jokers too, if its with-jokers is yes

/*! SPELL: DECLARES {
  type: "Deck", superType: "List",
  defined: "/Deck.spell:88-113",
} */
export class Deck extends List {}
spellCore.define(Deck.prototype, 'instanceType', { value: Card })

/*! SPELL: DECLARES {
  property: "with_jokers", of: "Deck", datatype: "choice",
  defined: "/Deck.spell:208-245",
} */
/** with-jokers:  yes to add the red and the black joker when it's set up, after the 52 cards */
spellCore.defineProperty(Deck.prototype, { property: 'with_jokers', type: 'choice' })

/*! SPELL: DECLARES {
  syntax: "set up {thisArg:expression}", output: "set_up", rule: "method_call", of: "Deck",
  alias: ["statement", "expression"], kind: "method", name: "set up (a deck)",
  defined: "/Deck.spell:247-618",
} */
spellCore.define(Deck.prototype, 'set_up', {
	value() {
		if (this.is_set_up) { return }
		spellCore.map(Card.Ranks, (rank) => {
			spellCore.map(Card.Suits, (suit) => {
				let it = new Card({ rank: rank, suit: suit })
				spellCore.append(this, it)
			})
		})
		if (this.with_jokers) {
			let it = new Joker({ color: 'red' })
			spellCore.append(this, it)
			let it_2 = new Joker({ color: 'black' })
			spellCore.append(this, it_2)
		}
		this.is_set_up = true
	}
})

/*! SPELL: DECLARES {
  syntax: "display {thisArg:expression}", output: "display", rule: "method_call", of: "Deck",
  alias: ["statement", "expression"], kind: "method", name: "display (a deck)",
  defined: "/Deck.spell:620-771",
} */
spellCore.define(Deck.prototype, 'display', {
	value() {
		let card_names = new List()
		spellCore.map(this, (card) => {
			spellCore.append(card_names, card.short_name)
		})
		spellCore.echo("deck: " + card_names)
	}
})

/*! SPELL: DECLARES {
  syntax: "test deck creation", output: "test_deck_creation", rule: "method_call",
  alias: "statement", kind: "function", name: "deck creation",
  defined: "/Deck.spell:773-1431",
} */
export function test_deck_creation() {
	return spellCore.test('test deck creation', function test_deck_creation() {
		spellCore.echoTestAction(`the deck is a new deck`)
		let deck = new Deck()
		spellCore.echoTestAction(`set up the deck`)
		deck.set_up()
		spellCore.expect(spellCore.itemCountOf(deck), `the number of cards in the deck`, 52, `52`)
		spellCore.echoTestAction(`set up the deck`)
		deck.set_up()
		spellCore.expect(spellCore.itemCountOf(deck), `the number of cards in the deck`, 52, `52`)
		spellCore.echoTestAction(`set the queens to the cards in the deck where the rank of the card is "queen"`)
		let queens = spellCore.filter(deck, (card) => {
			return (card.rank == "queen")
		})
		spellCore.expect(spellCore.itemCountOf(queens), `the number of cards in the queens`, 4, `4`)
		spellCore.expect(spellCore.getItemOf(deck, -1).name, `the name of the bottom card of the deck`, "king-of-spades", `"king-of-spades"`)
		spellCore.expect(spellCore.getItemOf(deck, 1).short_name, `the short-name of the top card of the deck`, "A♣️", `"A♣️"`)
		
		spellCore.echo("the deck before shuffling:")
		spellCore.echoTestAction(`display the deck`)
		deck.display()
		spellCore.echoTestAction(`get the first card of the deck`)
		let it = spellCore.getItemOf(deck, 1)
		spellCore.expect(it.is_the_$rank_of_$suits('ace', 'clubs'), `it is the ace of clubs`, true, `yes`)
		
		spellCore.echoTestAction(`shuffle the deck`)
		spellCore.randomize(deck)
		spellCore.echoTestAction(`shuffle the deck`)
		spellCore.randomize(deck)
		
		spellCore.echo("the deck after shuffling:")
		spellCore.echoTestAction(`display the deck`)
		deck.display()
	})
}
test_deck_creation()

/*! SPELL: DECLARES {
  syntax: "test deck with jokers", output: "test_deck_with_jokers", rule: "method_call",
  alias: "statement", kind: "function", name: "deck with jokers",
  defined: "/Deck.spell:1452-1846",
} */
export function test_deck_with_jokers() {
	return spellCore.test('test deck with jokers', function test_deck_with_jokers() {
		spellCore.echoTestAction(`the deck is a new deck whose with-jokers is yes`)
		let deck = new Deck({ with_jokers: true })
		spellCore.echoTestAction(`set up the deck`)
		deck.set_up()
		spellCore.expect(spellCore.itemCountOf(deck), `the number of cards in the deck`, 54, `54`)
		spellCore.echoTestAction(`set the jokers to the cards in the deck where the card is a joker`)
		let jokers = spellCore.filter(deck, (card) => {
			return spellCore.isOfType(card, 'Joker')
		})
		spellCore.expect(spellCore.itemCountOf(jokers), `the number of cards in the jokers`, 2, `2`)
		spellCore.expect((spellCore.getItemOf(deck, -1)).is_the_$color_joker('black'), `(the last card of the deck) is the black joker`, true, `yes`)
		spellCore.echoTestAction(`get the first card of the deck`)
		let it = spellCore.getItemOf(deck, 1)
		spellCore.expect(it.is_the_$rank_of_$suits('ace', 'clubs'), `it is the ace of clubs`, true, `yes`)
	})
}
test_deck_with_jokers()
// -----------
/*! SPELL: DECLARES {
  type: "Pile", superType: "List",
  defined: "/Pile.spell:25-50",
} */
/** Pile of playing cards */
export class Pile extends List {}
spellCore.define(Pile.prototype, 'instanceType', { value: Card })

/*! SPELL: DECLARES {
  property: "color", of: "Pile",
  defined: "/Pile.spell:52-140",
} */
spellCore.define(Pile.prototype, 'color', {
	get() {
		if (spellCore.isEmpty(this)) { return "none" }
		return spellCore.getItemOf(this, -1).color
	}
})

/*! SPELL: DECLARES {
  property: "value", of: "Pile",
  defined: "/Pile.spell:142-225",
} */
spellCore.define(Pile.prototype, 'value', {
	get() {
		if (spellCore.isEmpty(this)) { return 0 }
		return spellCore.getItemOf(this, -1).value
		
	}
})
/*! SPELL: DECLARES {
  syntax: "move {thisArg:expression} to {callArgs:expression}", output: "move_to_$pile",
  rule: "method_call", of: "Card", alias: ["statement", "expression"], kind: "method",
  name: "move (a card) to (a pile)",
  defined: "/Pile.spell:403-581",
} */
/**
 * "move" a card
 * NOTE: use this rather than `add` to make sure card is only in one pile at a time
 * if you `wait for: move the card to the pile` the move will be animated
 */
spellCore.define(Card.prototype, 'move_to_$pile', {
	async value(pile) {
		if (spellCore.isDefined(this.pile)) { spellCore.remove(this.pile, this) }
		this.pile = pile
		spellCore.append(pile, this)
		await spellCore.pauseFor(50, 'msec')
	}
})


/*! SPELL: DECLARES {
  property: "state", of: "Pile",
  defined: "/Pile.spell:584-748",
} */
spellCore.define(Pile.prototype, 'state', {
	get() {
		let state = ((this.name || "pile") + ":")
		spellCore.map(this, (card) => {
			state = ((state + " ") + card.state)
		})
		return state
	}
})