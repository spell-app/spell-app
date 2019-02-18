

- Structures
	- "type" structure
		- name
		- collection name (plural)
		- properties:
			- { key : value | function }
		- methods:
			- { name:  signature, contents }

	- "scope" structure
		- types:
			- { name: type }
		- globals: map
		- locals: map
		- rules - local rules for this scope ???

- Structure parsing
	- "structure" rules:
		- global
		- (define) type X
		- to / on / action / get / set
		- property definition
		- assume all must start a line (ignoring indent)

	- when parsing a file:
		- parse structure rules
		- add structure to file-specific "rules"
			- "define type" adds new type
			- "global" defines new global variable
			- "to x" adds new "statement" to local rules
		- then parse structure interiors

	- a file can augment an existing type
		- add properties
		- add methods / actions


	- Rule / parser changes:
		- "context" (parser?) has several sets of rules, one for each file
			- note: can use where rule is defined for precedence
		-

	- within a class/function
		- pick up assignments and other variable definitions for use when parsing the function

	- have separate structure rules, eg:
		- if.pattern	= "if {expression} (then|:) {statement}?"
		- if.structure	= "if {anything} (then|:) {statement}?"

	- scan statements for structure
		- leading whitespace (changes)
		- if, loops, etc
		- and/or inside expressions?
		- define type
		- to/action/get/set
		- what else??

	- break up parsing into small sub-tasks
		- intuit structure
		- add structure to context.scope
		- parse bits

	- parse() takes `context` including:
		- parser
		- scope
			- app / type / method / block
			- any loose code (eg: in type def) gets added to constructor



- refactor
	- include whitespace in JSX parsing
		- change eg matchAttributes etc to use `matchWhitespace`
		- include whitespace in `attributes`, have getter which ignores this...

	- tokenizer to similar `rule` pattern as parser?

	- how to go back to source for annotation w/stream/skip whitespace
		- assume whitespace in the token stream
		- rule.start, rule.nextStart allow you to map back into token stream
		- add characters...


# Scope/etc
- global "actions"
	- to turn a card over	<= global action with param `card` (ref as `the card` inside fn)
	- to start a game		<= global action with param `game`
	? to deal cards?		<= internal action, only available w/in `Game` class?

- Non-controller objects as simple as possible
	- eg: card knows it has a suit, but not what all "suits" are
	- eg: `the color of a card` is deck mechanics

- Default "game logic" to controller rather than spreading into subclasses
	- eg: game: `can play a card on a pile` as switch rather than method for each pile
	- easier for layperson to follow logic in one place
	- if necessary, give "pile" properties like "alternating" and "ascending" etc

- where actions are defined will help place scope
	- type Game
		property deck = new Card Deck
		- to start game
			- shuffle the deck	=> `the deck` is magic "look up in local scope" indicator

- event handlers
	- type Card Deck
		- to shuffle a deck					<= global typed action
			gather the cards into a pile	<= `the cards` = magic scope `the cards of the deck`
											<= `a pile` = create new pile, which will show at center of screen?
			randomize the cards				<= shuffle command
			turn the cards face down		<= implies `turn a card` takes an array of cards as
			play sound "shuffle deck"		<= autofind sound, returns a promise
			wait until the sound is done	<= `the sound` here is local variable from `play sound`


- component definition
	to draw
		<card rank suit direction>		<= properties of cards, === `rank={my.rank}`, etc
			<image name="front" url={card image of my deck with my rank and my suit}/>
			<image name="back" url={card back image of my deck}/>
		</card>

	styles
		// Make card "front" and "back" images overlap
		<card> <image>
			overlap				<- (eg: position absolute)

		// Flip "front" face of card over from back face
		<card> <image name="front">
			3D-angle = 180°		<- somehow express "flip in 3D"

		// Change card orientation when direction is up.  Automatically animates.
		<card direction="up">
			3D-angle = 180°		<- somehow express "flip in 3D"



- MobX
	- cleverly use mobX to cache lines, structures, etc?

-> push context:  { parser, stack, supers, method } into parsing
	- output doesn't require context...
	- "local class" wins
		- each class gets its own parser (or just rules?)
		- match {expression} in each super parser
		- level of parser in stack = specificity if 2 matches?
		- how does length of result jibe with this?

- parsing feedback
	- give an optional HTML element
	- break parsing up into steps
		- structure analysis
		- line by line
	- as process moves along, provide feedback into html element as react classes
		- "unknown" (grey) => <if> <keyword> etc (blue, etc)


- `if can play card on pile`	=> want to translate to:
		- `can_play_card_on_pile(card, pile)
- `(a,b)` to create array rather than []
- `is one of "diamonds", "hearts" or "spades"`
- property X as a list of Cards
- property names can be multi-word!!!!
	> get top card: return the last card of me
		=> get top_card()

	> get the top card of the pile
		=> it = pile.top_card



BIG TICKETS
- define Pile:
	- can play a card on me
		=> "if can play (the) card on (the) pile"

`this` vs `my`
	- my requires "is" => "am" inversion
	- `I` ?
	- "the object is talking out loud to itself..."


- `preference X (as Y) with default Z`
	- persistent preference, must cross over to cloud
	- `local preference` for this machine only?


- draw sentence diagram of match
	- primary UI for parser testing
	- run tests in-browser (just checking output)
	- click on a test, see the output in sentence diagram form
	- drag to reorder nodes in the output diagram to rearrange the source text!

