Non-linear Parsing Strategies
-----------------------------

- Break down into lines / sentences
- Do keyword / preposition / operator matching to break each sentence up into statements / expressions
	- eg: if, repeat, etc
- Find all possible parses of each statement
- If > 1 possible parse:
	- use knowledge of what's in the world to guide recognition
	- if still ambiguous, ask user (need spiffy UI for this)
- Use ES6 return `[ result, parseTree ]` to build translation and compute result at the same time?

- Keep intermediate output of parsing/scoping process as (JSON?) data to aid further parsing


Building our own Parser
-----------------------
- In theory, what Chevrotain is attempting to do is fairly straightforward
- Optimize for single-line-statements with knowledge of INDENT and EOS and `: xxx` => `INDENT xxx`
- REALLY want to take a set of our simplified example strings and compute optimal functions for them
	- SO much faster than writing `$.CONSUME_WORD("as")`...
- We'll have to build our own if we want to be able to do ambiguity
- Would be nice (?) to mix tokens and sub-rules so we don't have to care which they are...
- Use try/catch pattern?  Chev is fast (although no examples for highly reflexive grammar)




Type file parsing strategies
----------------------------
- add imported types to class scope

- break into class definitions
	- add types to class scope

- for each class
	- extract methods & event handlers
		- add function signatures to class scope
		- update imports as necessary

	- extract out property definitions
		- add property signatures to class scope
		- update imports as necessary

- for each class
	- parse property initializers and add to prototype / constructor
	- parse free code and add to constructor

	- parse method definitions
		- create method scope which inherits from class scope
		- add variables to method scope
			- ???  `var` vs `let` vs `const` semantics?
			- NOTE: "it" and "the result" will change type frequently in method scope
			- figure out types
		- break into lines
		- break apart by keywords / prepositions / operators
			- match pieces individually, referring to method scope


What does a scope look like?
----------------------------
	{
		types: { name => { name, supers, source } }
		variables: { name => { name, type, source } },
		methods: { name => { name, types, returns, source } }
	}

- types, variables and methods both inherit from parent, eg
	- global scope is initialized w/ classes from "package file"	(save intermediate)
	- file scope is global scope + everything in the file			(save intermediate)
	- class scope is file scope + everything in the class			(save intermediate)
	- method scope is class scope + variables in the method			(not saved)

- when looking up variable or method
	- look to closest scope
	- if scope vars are untyped, use that
	- if scope vars are typed and type matches local type, use that
	- otherwise go up
	- when in doubt, ask

? We can likely have > 1 item per method.name, store an array instead?





Visualization
-------------
- Need some way to visualize the scope so we can ask questions about it
- Type definition as a box w/slots for variables, methods, etc?



Multiple Programming Language Targets
-------------------------------------
- Core of language (get/set/operators/math/basic list ops) are JS, python, etc specific
	- cover minimal set in "standard" library which is base language specific
	- Math.add(a, b, c)

- Build everything else on top of that in english itself

- If there's a MUCH faster way to do something in a particular language,
	the spell definition (eg of List) can defer to custom code in that language
	```JS ... ```
	```python ...```



Multiple Human Language Bases
-----------------------------
- HC goal of spanish version was never realized
- Use natural language (rather than BNF/code) to express the spell syntax
- You can 'adapt' a file into another language by adding to the base class

	```Cards.english.sp:
		define type Card
			direction as one of ("up", "down")
			to turn Card over...
	```

	```Cards.spanish.sp
		define Tarjeta as alias for Card
			dirección alias for direction as one of ("arriba", "abajo")
			to devolver la Tarjeta alias for to turn Card over
	```
