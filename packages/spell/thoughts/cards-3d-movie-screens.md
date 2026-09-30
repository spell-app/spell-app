1a 	"make a new board game..."
	- creates a green blank field in slightly isometric perspective
	- new type dialog appears with "board game" filled in
	===Type===
	is a: Board Game


1b	"... called 'Solitaire'"
	- "called" brings up a data entry field with "Untitled Game"
	===Type===
	name: "Untitled Game"
	is a: Board Game

1c
	- fill in with "Solitaire"
	===Type===
	name: "Solitaire"
	is a: Board Game

1d "ok"

----------------------
2a	"a card is..."
	- "new type 'Card'" dialog appears on the screen
	===Type===
	name: "Card"

2b	"...a two-sided rectangular object..."
	===Type===
	name: "Card"
	is a: rectangle		=> 	rectangle floting on screen
	sides: 2

2c	- link from new type dialog to new object, floating above the board

2d	- reach in with fingers, sizing it to the right dimensions

2e	"...with rounded corners."
	- reach in an adjust rounding on corners

2f	"ok"

----------------------
3a	"a deck is..."
	- new type 'Deck' dialog
	===Type===
	name: "Deck"

3b	"...a set of cards..."
	===Type===
	name: "Deck"		=>    hazy pile of cards

3c "...with suits 'clubs', 'diamonds', 'hearts', 'spades'..."
	- add 'suits' slot to deck info dialog
	===Type===
	name: "Deck"		=>    hazy pile of cards
		- when first suit is announced
			- add a breakout table of suits
		- as each suit is announced:
			- add <suit> to breakout table
			- add a new hazy pile of cards with link back to suit in breakout table
	- "...and ranks 'ace', '2', ...., 'jack', 'queen', 'king'"
		- add 'ranks' slot & breakout table
		- as each '<rank>' is announced
			- add entry to breakout table
			- add new cards in a grid (going down)
			- link from breakout table entry to row (underneath all cards in the row)
	- "ok"
