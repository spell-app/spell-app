define type Card
	property suit as one of ["clubs", "diamonds", "hearts", "spades"]
	get color:
		if my suit is one of ["diamonds", "hearts"] then return "red"
		else return "black"

	property rank as a number
	shared property ranks = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"]
	get rank_name: item (my rank) of my ranks

	property face as one of ["up", "down"]

	action turn Card face up: set the face of the card to "up"
	action turn Card face down: set the face of the card to "down"
	action turn Card over:
		if (the face of the card) is "up" then set the face of the card to "down"
		else set the face of the card to "up"


define type Pile as list of Cards
	get can_play with Card:
		return no

define type Foundation as a Pile
	property suit as text
	get can_play with card:
		return no if the suit of card is not my suit
		return no if (the rank of card) is not ((the rank of (the last card of me)) + 1)
		return yes

define type Tableau as a Pile
	get can_play with card:
		if my size is 0 then return (the rank of card) is "king"
		put the last card of me into top_card
		return no if (the color of card) is (the color of top_card)
		return no if (the rank of card) is not (the rank of top_card) + 1
		return yes


	action can play Card on Pile:
		put the last card of pile into top_card
		if pile is a Foundation:
			return no if (the suite of card) is not (the suit of pile)
			return no if (top_card is empty) and ((the rank of card) is not "ace")
			return no if (the number of card) is not (the number of top_card) + 1
			return yes

		else if pile is a Tableau:
			if top_card is empty:
				return yes if ((the suit of card) is "king")
				else return no
			return no if (the color of card) is (the color of top_card)
			return no if (the number of card) is not (the number of top_card) + 1
			return yes


define type Klondike as a Game
	shared property suits = ["clubs", "diamonds", "hearts", "spades"]
	shared property ranks = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"]

	property cards = []
	property foundations = []
	property tableaus = []
	property stock = new Pile with name = "stock"
	property waste = new Pile with name = "waste"

	on creation:
		create cards
		create piles
		start game

	action start game
		for each card in my cards
			set the face of card to "down"
			move card to my stock
		deal cards

	action deal cards:
		shuffle my cards
		for row in range 1 to 7
			set the face of last card of my stock to "up"
			for column in range row to 7
				move last card of my stock to pile column of my tableaus

	action create cards:
		put my stock into pile
		for each suit in my suits
			for each rank, number in my ranks
				add (new Card with suit, rank, number, pile) to my cards

	action create piles:
		for each suit in my suits
			add (new Foundation with suit, name = suit + "s") to my foundations
		for each number in range 1 to 7
			add (new Tableau with name = ("tableau" + number) ) to my tableaus

	action move Card to Pile
		if (the pile of card) is not empty
			remove card from (the pile of card)
		add card to pile
		set the pile of card to pile
