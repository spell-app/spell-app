Language basics
---------------

- TODO: how to denote things which must start at the "beginning" of a line?
- TODO: how to elegantly define return type
- TODO: optional return type ala swift?

- `{list-expression}`
	`{left-paren}{value}(, {value})+{right-paren}`
	`{expression}`

- `{scope-modifiers}`
	`constant`
	`shared`

- `{variable-definition}`
	`({scope-modifiers}) {variable}`
	`({scope-modifiers}) {variable} as {Type}`
	`({scope-modifiers}) {variable} = {literal}`
	`({scope-modifiers}) {variable} = {expression}`
	`({scope-modifiers}) {variable} as one of \({value}(, {value})+\)`

- `{method-signature}`
	`({word} | {parameters})+`

- `{parameter}`
	`{variable}`					<= untyped
	`{variable} as {type}`			<= explicitly typed
	`{variable} as {Type}`			<= explicitly typed
	`{Type}`						<= implicitly typed, method argument = `type`

- `{parameters}`
	`{parameter}`
	`{parameter} ({preposition} {parameter})+`
	`{parameter} (and {parameter})+`

- `{action-definition}`
	`(to | on | before | after) {method-signature}(: | INDENT){statements}`
	eg	`to start game`
	eg	`to move Card to Pile`
	eg	`to drop Pile on otherPile as Pile`
	eg	`to ask question as text with ok-button-name as text and cancel-button-name as text`

	- actions return `yes` or `no` for success/failure
	- `on` is preferred for `events`
	- `before` is used to override BEFORE super method is called
	- `after` is used to override AFTER super method is called
	? "command" ?

- {expression-definition}
	`expression {method-signature}(: | INDENT){statements}`

	- expressions return a value and should have no side effects (other than caching)
	- "is X" expressions return boolean and automatically define "is not X"
	- "can X" expressions return boolean and automatically define "can not X"
	- "has X" expressions return boolean and automatically define "does not have X"
	- is, has and can also automatically define multiple expressions:

	eg	`Card is a spade`
		=>	`Card is not a spade`
		=>	`Cards are spades`
		=>	`Cards are not spades`

	eg	`can play Card on Pile`
		=>	`can not play Card on Pile`
		=>	`can play Cards on Pile`
		=>	`can not play Cards on Pile`



- `{type-definition}`
	`define type {Type} (as {Supertype} (and {SuperType})*)?`
		- {variable-definition}
		- {method-definition}
		- {statements}				<= (added to constructor)

	- If not specified, implicit subclass of `Thing`
	- You can `define` the same type later (eg in another file) to add/override methods
	- Look to markdown headers with `group: <identifier> above definitions to add to documentation groups
		eg	`define type Card
				## group: direction
				direction as one of ("up", "down")
				expression Card is face up...
				to turn Card over...
			`
