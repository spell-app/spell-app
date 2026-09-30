### Structures
#### Break statements parse into structures
- comment
- if
- define type
- action
-



### Scopes
- Multiple scopes in play at any given time
	- app
	- type* (including `page` or `section`)
	- method
	- block* (including loop, if, etc)



### App Model
- scope in JS in not flexible enough due to `where function is defined` semantics
- in the middle of library (eg: list), it only has `list` and `core` scope
- in type-code, must have all relevant scopes available


### Types vs Components
- non-best-practice to mix datatype & presentation code
- how to make data & components work seamlessly?
- eg
	- Game:
		- stock as a Pile
		- waste as a Pile
		- foundations as list of FoundationPiles
		- tableaus as list of TableauPiles
		-
