Purpose
-------
Creating an algorithmic parser for experiments in converting "natural language" code (called "spell," a subset of the english language) into machine-readable code (currently Javascript).  Programs are expressed in syntactially correct English and are then translated into equivalent Javascript code.

At the root of this is a "Rule Syntax" which resembles regular expressions on steroids -- allowing the language developer to express **any** language rules (not just "spell") in a way that feels natural to anyone familiar with regular expressions.  The parser itself is dead simple (src/Parser.js), and it's the formulation of the rules (src/rules/) which provides the power.  In contrast to other rule-based parsers, it's easy for the language developer to add additional rules to the system by simply importing them dynamically, even at runtime.  The parser core could easily be re-written in other languages (e.g. python) and other "compilation targets" are easily possible.

To get started (including auto-compiling code changes)
----------------
- Clone this repo
- `cd <repo location>`
- `yarn install`
- `yarn start`
- Open `http://localhost:5000` in your web browser.


To test
----------------
- `cd <repo location>`
- `yarn test`

for test coverage:

- `yarn coverage`



Parser operation
----------------

To parse English text

- `spellParser.parse("a = 1")`
	- returns the syntax tree, easiest for now to inspect it in the console
	- parses as a "statement"

or

- `spellParser.parse("expression", "a = 1")`
	- parse "text" as a specific rule type


To "compile" text into javascript:

- `spellParser.compile("a = 1")`


Rules
-----
- `Rule`s match specific characters/logical structures the provided text.
- Simple rules are composed into larger rules, for example:
	- `the` is a simple rule satisified with simple text match
	- `{expression}` matches the "expression" sub-rule
	- `{identifier} = {expression}` is a `statement` rule which uses the above as subrules.
- Rules come in various flavors:
	- `Keyword`s match a literal word-like string or non-word-like single characters.
	- `Pattern`s match a regular expression.
	- `Subrule`s match another rule, specified by subrule name.
	- `Sequence`s match a sequence of named rules and/or keywords.
	- `Alternatives` match one or more of a set of alternative rules.
	- `List`s match a delmited list of zero or more items.
- You'll generally specify rules using our `RuleSyntax`, which is a human-friendly way
	of specifying a sequence of rules as a string, e.g.
	- `{identifier} = {literal-value}` automatically creates a `sequence` of
		1. `identifier` subrule
		2. `=` keyword
		3. `literal-value` subrule

RuleSyntax
----------
- **All rules are stored in the `src/rules` directory**.
- Test files live next to the rule files they cover.
- To include a rule file in the browser
	- add it as an `import()` in `src/rules`

| Syntax		| Description |
|---------------|-------------|
| {...}		| Curly braces indicate that we should match a named subrule here. |
| {rule:localName}		| A `:` inside a rule specifier allows you to specify a local name for that rule in the parse tree. |
| (...)		| Parenthesis indicate a parenthesized expression, often a set of `Alternatives` or used to make a rule optional (see below). |
| [...]		| Indicates a `List` expresion. |
| (...&#124;...)	| A vertical pipe, generally found inside parenthesis, indicates a set of `Alternatives`, any one of which will work.
| ...?		| A question mark indicates that the preceding rule is optional. |
| ...*		| An asterisk indicates that the preceding rule is optional, and may repeat one or more times. |
| ...+		| A plus indicates that the preceding rule is required, and MAY be repeated one or more times. |
| whitespace	| Whitespace is used for nesting blocks and separating pattern/keyword rules, and is automatically consumed. **NOTE: Use `tab` and `return` characters for nesting.** |
| anything else	| Pretty much anything else indicates a keyword, which may be punctuation, e.g. `=`, or english words `is`, `not`, `play`, etc. |

Examples:
---------
- `if {condition:expression} (then|:)? {statement}?`
- `{statement} if {condition:expression} (?:(else|otherwise) {elseStatement:statement})?`
- `a random {identifier} (of|from|in) (the)? {list:expression}`

License
-------
[MIT License](https://opensource.org/licenses/MIT)

Copyright &copy; 2017-2019 Matthew Owen Williams
