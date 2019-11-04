# Spell Environment ToDo

## Questions

## Goals
- Driving toward an interactive "editor" for Spell/Oak


## Pieces
- spell parser
- spell runtime environment
	- oak app/section/page environment
	- data model? server side?
	- users/etc?
- spell text editor / debugger
- spell app shell
- deploy / monitoring tools



## Short Term Tasks
- Add code examples app to spell parser
	√ Save examples in localstorage initially
	- Save to disk soon
		- express module we can plug in to OakJS server environment
	- Use as test runner
		- code => expected result
		- 'bless' button
	- Evolve w/ [Atom | Ace | CodeMirror | etc] into full editor / debugger

- visualize parse match
	- peer of `compiled JS` tab
	- shows english => match
	- this will expose needless complexities in parse result nesting

- What does a Spell program look like?
	- MD-based similar to eve?
	- Inline component definitions
	- Data model?  Eve?  Custom scoping rules?

- Component Definition
	- Parse XML => spellCore.createComponent()
	- Props vs State?
	- "preferences" = state

- Parser Enhancements / Bugs
	- Multi-part expressions (a = b and c = d)
	- Context for output
	- Multi-pass so we can add new types / complex syntax automatically
	- Include
	- Combine keyword alternates into one regex
	- Combine determinable sequences into one regex
	- Debugging?
	- Partial matches?

- Base Objects
	- Person / "User"
	- Preferences
	- Datasource
	- Record (types, fields, field mapping, load, save)


- Animation model
	- `animatable` components are postion-absolute to some container
	- container dynamically applies location to children
	- e.g.
		- cards are position absolute for `game`
		- piles supply x/y coordiante for each of their cards

## Data Model
#### Requirements
- "works" with "anything"
- match datasources to logical JS "records"
	- JSON (via Rest)
	- XML
	- GraphQL (Apollo)
- `read` functionality is guaranteed
- opt-in additional functionality
	- edit / save
	- new
	- delete
	- typed records
	- field translation
	- relational mapping

