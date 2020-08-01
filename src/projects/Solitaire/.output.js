//## definition of a Card with nice english aliases for working with it
export class Card extends Drawable {}
spellCore.addExport('Card', Card)
export class Pile extends List {}
spellCore.addExport('Pile', Pile)
spellCore.define(Pile.prototype, 'instanceType', { value: Card })

//## properties of cards
// card ranks
/* SPELL: added rule: '(Card|card) (Ranks|ranks)' */
spellCore.defineProperty(Card.prototype, {
	property: 'rank',
	enumeration: ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'],
	enumerationProp: 'Ranks'
})

// card suits
/* SPELL: added rule: '(Card|card) (Suits|suits)' */
spellCore.defineProperty(Card.prototype, {
	property: 'suit',
	enumeration: ['clubs', 'diamonds', 'hearts', 'spades'],
	enumerationProp: 'Suits'
})

// color as derivation of suit
spellCore.define(Card.prototype, 'color', {
	get() {
		if (spellCore.includes(['diamonds', 'hearts'], this.suit)) { return 'red' }
		return 'black'
	}
})

// value as a derivation of rank
spellCore.define(Card.prototype, 'value', {
	get() {
		return spellCore.itemOf(Card.Ranks, this.rank)
	}
})

// card direction:  up or down
/* SPELL: added rule: '(Card|card) (Directions|directions)' */
spellCore.defineProperty(Card.prototype, {
	property: 'direction',
	enumeration: ['up', 'down'],
	enumerationProp: 'Directions'
})

//## aliases
// "card is face up/down"
/* SPELL: added expression `{thing:simple_expression} (operator:is not?|isn't|isnt) face up` */
spellCore.define(Card.prototype, 'is_face_up', {
	get() {
		return (this.direction == 'up')
	}
})
/* SPELL: added expression `{thing:simple_expression} (operator:is not?|isn't|isnt) face down` */
spellCore.define(Card.prototype, 'is_face_down', {
	get() {
		return (this.direction == 'down')
	}
})
// `card is a face card`
/* SPELL: added expression `{thing:simple_expression} (operator:is not?|isn't|isnt) a face card` */
spellCore.define(Card.prototype, 'is_a_face_card', {
	get() {
		return spellCore.includes(['jack', 'queen', 'king'], this.rank)
	}
})
// "card is a spade", "...is a club" etc
/* SPELL: added expression: '(operator:is not?) (a|an) (expression:club|diamond|heart|spade)' */
spellCore.define(Card.prototype, 'is_a_$suit', {
	value(suit) {
		return this.suit === suit
	}
})
// "card is a queen", "...is an ace" etc
/* SPELL: added expression: '(operator:is not?) (a|an) (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king)' */
spellCore.define(Card.prototype, 'is_a_$rank', {
	value(rank) {
		return this.rank === rank
	}
})
// "card is the queen of spades" etc
/* SPELL: added expression: '(operator:is not?) the (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king) of (expression:clubs|diamonds|hearts|spades)' */
spellCore.define(Card.prototype, 'is_the_$rank_of_$suits', {
	value(rank, suit) {
		return this.rank === rank && this.suit === suit
	}
})

// name as a derivation of name/suit
spellCore.define(Card.prototype, 'name', {
	get() {
		return ((this.rank + "-of-") + this.suit)
	}
})

spellCore.define(Card.prototype, 'short_suit', {
	get() {
		if (this.is_a_$suit('clubs')) { return "♣️" }
		if (this.is_a_$suit('diamonds')) { return "♦️" }
		if (this.is_a_$suit('hearts')) { return "♥️" }
		if (this.is_a_$suit('spades')) { return "♠️" }
		return "?"
	}
})

spellCore.define(Card.prototype, 'short_rank', {
	get() {
		if (this.rank == undefined) { return "?" }
		if (spellCore.isOfType(this.rank, 'number')) { return ("" + this.rank) }
		return spellCore.upperCase(spellCore.getItemOf(this.rank, 1))
	}
})

spellCore.define(Card.prototype, 'short_direction', {
	get() {
		if (this.direction == 'up') { return "+" }
		return "—"
		
	}
})
spellCore.define(Card.prototype, 'short_name', {
	get() {
		return (this.short_rank + this.short_suit)
	}
})

spellCore.define(Card.prototype, 'state', {
	get() {
		return ((this.short_rank + this.short_suit) + this.short_direction)
	}
})

//## actions

// Turn card face up or face down
// Note that this will animate if you `wait for turn the card face up`
/* SPELL: added rule: `turn {thisArg:expression} face up` */
spellCore.define(Card.prototype, 'turn_face_up', {
	async value() {
		this.direction = 'up'
		await spellCore.pauseFor(50, 'msec')
	}
})
/* SPELL: added rule: `turn {thisArg:expression} face down` */
spellCore.define(Card.prototype, 'turn_face_down', {
	async value() {
		this.direction = 'down'
		await spellCore.pauseFor(50, 'msec')
	}
})

// Flip card to opposite direction
// Note that this will animate if you `wait for turn the card face up`
/* SPELL: added rule: `turn {thisArg:expression} over` */
spellCore.define(Card.prototype, 'turn_over', {
	async value() {
		if (this.direction == 'up') { this.turn_face_down() }
		else { this.turn_face_up() }
		await spellCore.pauseFor(50, 'msec')
	}
})

/* SPELL: added rule: `draw {thisArg:expression}` */
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

//## create a card instance with default properties
/* SPELL: added rule: `test card setup` */
function test_card_setup() {
	return spellCore.quietlyTest('test card setup', function test_card_setup() {
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
	})
}
test_card_setup()


// -----------
//## Deck:   US standard card deck (without jokers currently)

export class Deck extends List {}
spellCore.addExport('Deck', Deck)
spellCore.define(Deck.prototype, 'instanceType', { value: Card })

/* SPELL: added rule: `set up {thisArg:expression}` */
spellCore.define(Deck.prototype, 'set_up', {
	value() {
		if (this.is_set_up) { return }
		spellCore.map(Card.Ranks, (rank) => {
			spellCore.map(Card.Suits, (suit) => {
				let it = new Card({ rank: rank, suit: suit })
				spellCore.append(this, it)
			})
		})
		this.is_set_up = true
	}
})

/* SPELL: added rule: `display {thisArg:expression}` */
spellCore.define(Deck.prototype, 'display', {
	value() {
		let output = "deck"
		spellCore.map(this, (card) => {
			output = ((output + ":") + card.short_name)
		})
		return output
	}
})

/* SPELL: added rule: `test deck creation` */
function test_deck_creation() {
	return spellCore.quietlyTest('test deck creation', function test_deck_creation() {
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
	})
}
test_deck_creation()

/* SPELL: added rule: `test deck shuffling` */
function test_deck_shuffling() {
	return spellCore.quietlyTest('test deck shuffling', function test_deck_shuffling() {
		spellCore.echoTestAction(`the deck is a new deck`)
		let deck = new Deck()
		spellCore.echoTestAction(`set up the deck`)
		deck.set_up()
		spellCore.echo(deck.display())
		spellCore.expect((spellCore.getItemOf(deck, 1)).is_the_$rank_of_$suits('ace', 'clubs'), `(the first card of the deck) is the ace of clubs`, true, `yes`)
		spellCore.echoTestAction(`shuffle the deck`)
		spellCore.randomize(deck)
		spellCore.echo(deck.display())
		spellCore.expect((spellCore.getItemOf(deck, 1)).is_the_$rank_of_$suits('ace', 'clubs'), `(the first card of the deck) is the ace of clubs`, false, `no`)
	})
}
test_deck_shuffling()

// -----------
//## Pile of playing cards
spellCore.define(Pile.prototype, 'color', {
	get() {
		if (spellCore.isEmpty(this)) { return "none" }
		return spellCore.getItemOf(this, -1).color
	}
})

spellCore.define(Pile.prototype, 'value', {
	get() {
		if (spellCore.isEmpty(this)) { return 0 }
		return spellCore.getItemOf(this, -1).value
		
	}
})
// "move" a card
// NOTE: use this rather than `add` to make sure card is only in one pile at a time
// if you `wait for: move the card to the pile` the move will be animated
/* SPELL: added rule: `move {thisArg:expression} to {callArgs:expression}` */
spellCore.define(Card.prototype, 'move_to_$pile', {
	async value(pile) {
		if (spellCore.isDefined(this.pile)) { spellCore.remove(this.pile, this) }
		this.pile = pile
		spellCore.append(pile, this)
		await spellCore.pauseFor(50, 'msec')
	}
})


spellCore.define(Pile.prototype, 'state', {
	get() {
		let state = ((this.name || "pile") + ":")
		spellCore.map(this, (card) => {
			state = ((state + " ") + card.state)
		})
		return state
	}
})
// -----------
//## Klondike Solitaire Card Game
//-- See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for rules & naming conventions.

//## Game bits
export class Game extends App {}
spellCore.addExport('Game', Game)
spellCore.defineProperty(Game.prototype, { property: 'score', type: 'number' })
let game = new Game()
spellCore.console.log(game)

//## set up all piles
let all_piles = new List({ instanceType: "Pile" })
let foundations = new List({ instanceType: "Pile" })
let tableaus = new List({ instanceType: "Pile" })

// set up stock pile: unplayed cards
export class Stock_Pile extends Pile {}
spellCore.addExport('Stock_Pile', Stock_Pile)
/* SPELL: added expression `{thing:simple_expression} (operator:can not?|cannot|can't|cant) pick up {expression:simple_expression}` */
spellCore.define(Stock_Pile.prototype, 'can_pick_up_$card', {
	value(card) {
		return (card == spellCore.getItemOf(this, -1))
	}
})
let stock = new Stock_Pile({ name: "stock", droppable: false })
spellCore.append(all_piles, stock)

// set up discards: where played cards go when turning over stock
export class Discard_Pile extends Pile {}
spellCore.addExport('Discard_Pile', Discard_Pile)
/* SPELL: added expression `{thing:simple_expression} (operator:can not?|cannot|can't|cant) pick up {expression:simple_expression}` */
spellCore.define(Discard_Pile.prototype, 'can_pick_up_$card', {
	value(card) {
		return (card == spellCore.getItemOf(this, -1))
	}
})
let discards = new Discard_Pile({ name: "discards", droppable: false })
spellCore.append(all_piles, discards)

// set up foundation piles: where we build up from ace => king
export class Foundation extends Pile {}
spellCore.addExport('Foundation', Foundation)
/* SPELL: added expression `{thing:simple_expression} (operator:can not?|cannot|can't|cant) pick up {expression:simple_expression}` */
spellCore.define(Foundation.prototype, 'can_pick_up_$card', {
	value(card) {
		return false
	}
})
/* SPELL: added expression `{thing:simple_expression} (operator:can not?|cannot|can't|cant) play {expression:simple_expression}` */
spellCore.define(Foundation.prototype, 'can_play_$card', {
	value(card) {
		return ((this.name == card.suit) && ((this.value + 1) == card.value))
	}
})
let it = new Foundation({
	name: 'clubs',
	symbol: "♣️",
	droppable: true
})
spellCore.append(foundations, it)
it = new Foundation({
	name: 'diamonds',
	symbol: "♦️",
	droppable: true
})
spellCore.append(foundations, it)
it = new Foundation({
	name: 'hearts',
	symbol: "♥️",
	droppable: true
})
spellCore.append(foundations, it)
it = new Foundation({
	name: 'spades',
	symbol: "♠️",
	droppable: true
})
spellCore.append(foundations, it)
spellCore.map(foundations, (pile) => {
	spellCore.append(all_piles, pile)
})

// set up tableau piles: vertical piles where we arrange from king to ace
export class Tableau extends Pile {}
spellCore.addExport('Tableau', Tableau)
/* SPELL: added expression `{thing:simple_expression} (operator:can not?|cannot|can't|cant) pick up {expression:simple_expression}` */
spellCore.define(Tableau.prototype, 'can_pick_up_$card', {
	value(card) {
		return card.is_face_up
	}
})
/* SPELL: added expression `{thing:simple_expression} (operator:can not?|cannot|can't|cant) play {expression:simple_expression}` */
spellCore.define(Tableau.prototype, 'can_play_$card', {
	value(card) {
		if (spellCore.isEmpty(this)) { return card.is_a_$rank('king') }
		return ((this.color != card.color) && (this.value == (card.value + 1)))
	}
})
spellCore.map(spellCore.getRange(1, 7), (number) => {
	let it = new Tableau({ name: ("T" + number), droppable: true })
	spellCore.append(tableaus, it)
	spellCore.append(all_piles, it)
})


// set up deck of cards
let deck = new Deck()
deck.set_up()
// start with cards in the stock pile
spellCore.map(deck, (card) => {
	card.move_to_$pile(stock)
})


//## actions

spellCore.define(Game.prototype, 'state', {
	get() {
		let state = []
		spellCore.map(all_piles, (pile) => {
			spellCore.append(state, pile.state)
		})
		return state
	}
})

/* SPELL: added rule: `debug the game` */
function debug_the_game() {
	spellCore.map(game.state, (line) => {
		spellCore.console.log(line)
	})
}

/* SPELL: added rule: `reset the stock pile` */
function reset_the_stock_pile() {
	let cards = spellCore.duplicateCollection(discards, Pile)
	spellCore.reverse(cards)
	spellCore.map(cards, (card) => {
		card.move_to_$pile(stock)
		card.turn_face_down()
	})
}

/* SPELL: added rule: `play from the stock pile` */
async function play_from_the_stock_pile() {
	if (spellCore.processIsRunning('play_from_the_stock_pile')) { return }
	spellCore.startProcess('play_from_the_stock_pile', 'EXCLUSIVE')
	try {
		if (spellCore.isEmpty(stock)) { await reset_the_stock_pile() }
		
		let it = spellCore.getItemOf(stock, -1)
		it.turn_face_up()
		// pause for 150 msec
		it.move_to_$pile(discards)
	}
	finally {
		spellCore.stopProcess('play_from_the_stock_pile')
	}
}

/* SPELL: added rule: `deal the cards` */
async function deal_the_cards() {
	if (spellCore.processIsRunning('deal_the_cards')) { return }
	spellCore.startProcess('deal_the_cards', 'EXCLUSIVE')
	try {
		// pull all cards into stock with a nice animation
		let cards = (spellCore.mergeCollections(all_piles, Pile))
		spellCore.reverse(cards)
		await spellCore.forEachSequential(cards, async (card) => {
			let start_pile = card.pile
			card.turn_face_down()
			if (start_pile != stock) { await card.move_to_$pile(stock) }
		})
		spellCore.randomize(stock)
		
		// deal cards into tableaus
		await spellCore.forEachSequential(spellCore.getRange(1, 7), async (row) => {
			(spellCore.getItemOf(stock, -1)).turn_face_up()
			await spellCore.forEachSequential(spellCore.getRange(row, 7), async (column) => {
				await spellCore.getItemOf(stock, -1).move_to_$pile(spellCore.getItemOf(tableaus, column))
			})
		})
		
		await play_from_the_stock_pile()
	}
	finally {
		spellCore.stopProcess('deal_the_cards')
	}
}

/* SPELL: added rule: `play {thisArg:expression}` */
spellCore.define(Card.prototype, 'play', {
	async value() {
		let start_pile = this.pile
		if (!(start_pile.can_pick_up_$card(this))) { return false }
		
		if (start_pile == stock) {
			play_from_the_stock_pile()
			return
		}
		
		let droppable_piles = spellCore.filter(all_piles, (pile) => {
			return ((pile.droppable == true) && (pile.can_play_$card(this)))
		})
		let end_pile = spellCore.getItemOf(droppable_piles, 1)
		if (!spellCore.isDefined(end_pile)) { return false }
		
		let cards_to_move = (spellCore.rangeStartingAt(start_pile, spellCore.itemOf(start_pile, this)))
		cards_to_move.name = start_pile.name
		spellCore.console.log(((("moving (" + cards_to_move.state) + ") to (") + end_pile.state) + ")")
		
		spellCore.map(cards_to_move, (card) => {
			card.move_to_$pile(end_pile)
		})
		
		if (spellCore.isOfType(start_pile, 'Tableau') && !spellCore.isEmpty(start_pile)) {
			await spellCore.pauseFor(200, 'msec')
			let it = spellCore.getItemOf(start_pile, -1)
			spellCore.console.log(((("turning over (" + start_pile.name) + ": ") + it.state) + ")")
			it.turn_face_up()
		}
		
		if (spellCore.isOfType(end_pile, 'Foundation')) { game.score = (game.score + 10) }
		else if (start_pile == discards) { game.score = (game.score + 5) }
		return true
	}
})

spellCore.RUNTIME.on('card-click', (event) => {
	let { card } = event
	card.play()
})

/* SPELL: added rule: `auto-play` */
async function auto_play() {
	let anything_changed = false
	if (!spellCore.isEmpty(discards)) {
		let test_card = spellCore.getItemOf(discards, -1)
		if (await test_card.play()) {
			anything_changed = true
			await spellCore.pauseFor(500, 'msec')
		}
	}
	
	// attempt to move bottom card of tableaus to foundations
	await spellCore.forEachSequential(tableaus, async (pile) => {
		if (spellCore.isEmpty(pile)) { return }
		let test_card = spellCore.getItemOf(pile, -1)
		let foundation = spellCore.getItemOf(spellCore.filter(foundations, (pile) => {
			return (pile.name == test_card.suit)
		}), 1)
		if (foundation.can_play_$card(test_card)) {
			anything_changed = true
			await test_card.play()
			await spellCore.pauseFor(100, 'msec')
		}
	})
	
	// attempt to move the entire pile of face-up cards
	await spellCore.forEachSequential(tableaus, async (pile) => {
		let face_up_cards = spellCore.filter(pile, (card) => {
			return card.is_face_up
		})
		if (spellCore.isEmpty(face_up_cards)) { return }
		let test_card = spellCore.getItemOf(face_up_cards, 1)
		if ((test_card.is_a_$rank('king')) && (test_card == spellCore.getItemOf(pile, 1))) { return }
		if (await test_card.play()) {
			anything_changed = true
			await spellCore.pauseFor(500, 'msec')
		}
	})
	
	// call auto-play again if anything actually changed
	if (anything_changed) { await auto_play() }
}

/* SPELL: added rule: `reset the game` */
function reset_the_game() {
	game.score = 0
	deal_the_cards()
}

/* SPELL: added rule: `cheat` */
async function cheat() {
	let remaining_piles = spellCore.filter(tableaus, (pile) => {
		return (!spellCore.isEmpty(pile) && spellCore.getItemOf(pile, 1).is_face_down)
	})
	if (spellCore.isEmpty(remaining_piles)) { return }
	let pile = spellCore.randomItemOf(remaining_piles)
	let unplaid_cards = spellCore.filter(pile, (card) => {
		return card.is_face_down
	})
	let card = spellCore.randomItemOf(unplaid_cards)
	card.turn_face_up()
	await spellCore.pauseFor(30, 'ticks')
	card.move_to_$pile(discards)
}

//##############
//## rendering the bits

// note: tableaus just draw as a (vertical) list of cards

/* SPELL: added rule: `draw {thisArg:expression}` */
spellCore.define(Foundation.prototype, 'draw', {
	value() {
		let color = (((this.name == 'diamonds') || (this.name == 'hearts')) ? "red" : "black")
		return spellCore.element({ tag: "div", props: { className: "Pile Foundation stacked" }, children: [
			spellCore.element({ tag: "div", props: { className: ((("Placeholder ui button basic compact fluid " + color) + " ") + this.name) }, children: [
				spellCore.element({ tag: "div", props: { className: ("suit " + this.name) }, children: [
					this.symbol
				] })
			] }),
			spellCore.drawThing(spellCore.getItemOf(this, -1))
		] })
	}
})

/* SPELL: added rule: `draw {thisArg:expression}` */
spellCore.define(Tableau.prototype, 'draw', {
	value() {
		return spellCore.element({ tag: "div", props: { className: "Pile Tableau staggered" }, children: [
			spellCore.drawItems(this)
		] })
	}
})

/* SPELL: added rule: `draw {thisArg:expression}` */
spellCore.define(Stock_Pile.prototype, 'draw', {
	value() {
		return spellCore.element({ tag: "div", props: { className: "Pile Stock stacked" }, children: [
			spellCore.element({
				tag: "div",
				props: {
					className: "Placeholder ui button basic compact fluid",
					onClick: (event) => {
						return play_from_the_stock_pile()
					}
				}
			}),
			spellCore.drawThing(spellCore.getItemOf(this, -1))
		] })
	}
})

/* SPELL: added rule: `draw {thisArg:expression}` */
spellCore.define(Discard_Pile.prototype, 'draw', {
	value() {
		return spellCore.element({ tag: "div", props: { className: "Pile Discards stacked" }, children: [
			spellCore.drawThing(spellCore.getItemOf(this, -1))
		] })
	}
})

/* SPELL: added rule: `draw {thisArg:expression}` */
spellCore.define(Game.prototype, 'draw', {
	value() {
		return spellCore.element({ tag: "div", children: [
			spellCore.element({ tag: "div", props: { className: "board" }, children: [
				spellCore.element({ tag: "table", props: { className: "ui table fixed" }, children: [
					spellCore.element({ tag: "thead", children: [
						spellCore.element({ tag: "tr", children: [
							spellCore.element({ tag: "th", props: { colSpan: "2", className: "left aligned" }, children: [
								"Klondike Solitaire"
							] }),
							spellCore.element({ tag: "th", props: { className: "right aligned" }, children: [
								("Score: " + this.score)
							] }),
							spellCore.element({ tag: "th", children: [
								spellCore.element({
									tag: "div",
									props: {
										className: "tiny fluid ui button compact",
										onClick: (event) => {
											return auto_play()
										}
									},
									children: [
										"AutoPlay"
									]
								})
							] }),
							spellCore.element({ tag: "th", children: [
								spellCore.element({
									tag: "div",
									props: {
										className: "tiny fluid ui button compact",
										onClick: (event) => {
											return cheat()
										}
									},
									children: [
										"Cheat"
									]
								})
							] }),
							spellCore.element({ tag: "th", children: [
								spellCore.element({
									tag: "div",
									props: {
										className: "tiny fluid ui button compact",
										onClick: (event) => {
											return debug_the_game()
										}
									},
									children: [
										"Debug"
									]
								})
							] }),
							spellCore.element({ tag: "th", children: [
								spellCore.element({
									tag: "div",
									props: {
										className: "tiny fluid ui button compact",
										onClick: (event) => {
											return reset_the_game()
										}
									},
									children: [
										"Restart"
									]
								})
							] })
						] })
					] }),
					spellCore.element({ tag: "tbody", children: [
						spellCore.element({ tag: "tr", children: [
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(stock)
							] }),
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(discards)
							] }),
							spellCore.element({ tag: "td" }),
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(spellCore.getItemOf(foundations, 1))
							] }),
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(spellCore.getItemOf(foundations, 2))
							] }),
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(spellCore.getItemOf(foundations, 3))
							] }),
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(spellCore.getItemOf(foundations, 4))
							] })
						] }),
						spellCore.element({ tag: "tr", children: [
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(spellCore.getItemOf(tableaus, 1))
							] }),
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(spellCore.getItemOf(tableaus, 2))
							] }),
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(spellCore.getItemOf(tableaus, 3))
							] }),
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(spellCore.getItemOf(tableaus, 4))
							] }),
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(spellCore.getItemOf(tableaus, 5))
							] }),
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(spellCore.getItemOf(tableaus, 6))
							] }),
							spellCore.element({ tag: "td", children: [
								spellCore.drawThing(spellCore.getItemOf(tableaus, 7))
							] })
						] })
					] })
				] })
			] })
		] })
		
	}
})
reset_the_game()
game.start()

// -----------
spellCore.installStyles(undefined, `/* File styles.css */¬.Card {¬	position: relative;¬	height: 30px;¬}¬¬.Card .suit {¬	position: relative;¬	font-size: 1.5rem;¬	padding-left: 1px;¬	vertical-align: top;¬	top: -0.15rem;¬}¬¬.Pile {¬	position: relative;¬	min-height: 30px;¬}¬¬.Pile.Tableau {¬	min-height: 500px;¬}¬¬.Pile.stacked .Card {¬	position: absolute;¬	left: 0;¬	top: 0;¬}¬¬.Pile.staggered .Card {¬	margin-bottom: 8px !important;¬}¬¬.Pile > .Placeholder {¬	position: relative;¬	height: 30px;¬}¬¬.Pile > .Placeholder .suit {¬	position: relative;¬	font-size: 1.6rem;¬}¬¬.Pile > .Placeholder .suit.diamonds,¬.Pile > .Placeholder .suit.spades {¬	font-size: 1.75rem;¬	top: -0.1rem;¬}`)