# "Standard" US/French playing card setup.
- You can set `ace high` and `include jokers` when creating deck.
- If you want to subset the cards, redefine `Deck.ranks` in subset or new instance.


## Deck type
```
define Deck
	### Ranks and suits
	ranks = "ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"
	suits = "clubs", "diamonds", "hearts", "spades"
	ace is high = no
	should include jokers = no

	### Make cards when creating the deck
	cards as list of Cards
	before creation
		if my ace is high then move "ace" to the end of my ranks

		for each suit in my suits
			for each rank in my ranks
				create card with suit and rank and deck = me
				add it to my cards

		if I should include jokers
			create card with suit = "red" and rank = "joker" and deck = me
			add it to my cards

			create card with suit = "black" and rank = "joker" and deck = me
			add it to my cards

	### Syntactic sugar for identifying cards
	- eg:  `card is a club` or `top card of pile is not a face card`
	Card is a club = suit of the card is "clubs"
	Card is a diamond = suit of the card is "diamonds"
	Card is a heart = suit of the card is "hearts"
	Card is a spade = suit of the card is "spades"

	Card is an ace = rank of the card is "ace"
	Card is a jack = rank of the card is "jack"
	Card is a queen = rank of the card is "queen"
	Card is a king = rank of the card is "king"
	Card is a joker = rank of the card is "joker"

	Card is a face card = rank of the card is in ("jack", "queen", "king")
	Card is a number card = card is not a face card

	color of Card
		return "black" if suit of the card is in ("clubs", "spades", "black")
		return "red"

	value of Card
		ranks = ranks of deck of the card
		return position of the rank of the card in ranks

	### global actions to switch card orientation
	to turn Card face up
		set the direction of the card to "up"

	to turn Card face down
		set the direction of the card to "down"

	to turn Card over
		if the card is face up then turn the card face down
		else turn the card face up

	### images
	image directory as file path	// eg: server/cards/images/
	card image with image name: my image directory + image name + ".png"

	styles
		<card>
		<pile> <placeholder>
			overlap
			width: 100
			height: 150



```

## Card type
```
define Card
	### Card identification
	deck as deck
	suit as text
	rank as text

	### name of computed getter, eg: "ace of spades"
	name: my suit + " of " + my rank

	### Card orientation as "up" or "down"
	direction as one of ("down", "up")
	is face up: my direction is "up"
	is face down: my direction is "down"

	to draw
		<card {my name} {my direction}>
			<front image={card image <my name> of my deck}/>
			<back image={card image "back" of my deck}/>
		</card>

	styles
		<card> <front>
			overlap
			full size

		<card> <back>
			overlap
			full size
			upside down in 3d

		<card.direction=down>
			upside down in 3d


```


## Pile
```
define type Pile
	deck as deck
	cards as list of cards
	type as text
	appearance as one of ("stacked", "staggered", "fanned")

	### Pile expressions
	bottom card: the first item of me
	top card of Pile: the last item of me

	can play Card on me
		return no

	### Pile actions
	to add a card to a pile
		if the pile of the card is set
			remove the card from the cards of its pile
		add the card to the cards of the pile

	### Pile appearance
	to draw
		<pile {my type} {my appearance}>
			<placeholder>
			{for each card, position of my cards
				<card {position} />
			}

	styles
		<pile appearance=stacked>
			<card>
				top: 0

		<pile appearance=staggered>
			<card>
				top: {position of card} * 10

		<pile appearance=fanned>
			angle: {size of my cards} * -5
			<card>
				angle: {position of card} * 10




```

