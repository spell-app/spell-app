# How parsing works

A compact map of the parse pipeline, so agents don't have to work it out again.
- MUST be kept up to date when any of these change (see [AGENTS.md](AGENTS.md)):
  - `Parser`, `SpellParser`, scopes
  - the `Block` / `BlockLine` / `SpellStatement` machinery
- File references (`path:line`) are as of 2026-09-27:  trust the code if they drift.

## Text => tokens

- [`Parser.parse(input, ruleName, scope)`](../parser/src/Parser.ts) tokenizes,
  then calls `scope.getRuleOrDie(ruleName).parse()`.
- [`SpellParser.tokenize()`](src/SpellParser.ts) calls `Tokenizer.tokenize()`.
  - For the `"block"` rule, it then calls [`breakIntoIndentedBlocks()`](../parser/src/tokenizer/Tokenizer.ts).
  - The result is ONE root `BlockToken`, holding `LineToken`s and nested `BlockToken`s.
  - indent ~== count of leading whitespace chars (tab === space === 1)
  - each extra level pushes a `BlockToken`
  - a blank line takes the indent of the NEXT non-blank line, so it doesn't break a nested block (lookahead)
  - a comment is a single `CommentToken`, to the end of the line:
    - `//` or `--`
    - or a heading's `#`, `##`, `###` ...:  a markdown-style level (see `Block.getDocComments()`)
- Some tokens span lines.
  Each is ONE token inside ONE `LineToken`:
  - a JSX element, e.g. a whole `return <div>...</div>` body
  - a string with `\n`
  - JSX `{...}` contents are re-tokenized later, from a collapsed copy.
- Every token has an absolute `start`.
  - `Tokenizer.setPositions()` works out `line` / `ch` FROM it, tokens nested in JSX included.
  - It does so through `getLineStarts()` + `positionForOffset()`, in `tokenizer.types.ts`.
  - NOTE: `LineToken` / `BlockToken` copy `line` from their first token.
  - JSX `{...}` contents are parsed later, from a trimmed, newline-collapsed copy of the same length.
    - So the JSX rules shift those tokens to their file positions:
      `SpellJSXContent.placeInFile()`, in [JSX.ts](src/rules/JSX.ts).
    - They hang them on the `JSXExpressionToken`, as `innerTokens`.
    - There `Tokenizer.forEachToken()` reaches them, and so does `moveTokens()`.
- A token's or match's two ends:
  - `end`:  where its TEXT stops
  - `next`:  where the next token starts, i.e. `end` plus the trailing whitespace
    (tokens carry the whitespace after them)
  - Ranges a user sees use `end`.
  - "Which match is the cursor in" (`matchForOffset()`) uses `next`.

## Rules and matching

- A rule is two methods:
  - `test()`:  a cheap "could this match at `start`?"
  - `parse()`:  builds a `Match`, or returns `undefined`
- [`Choice.parse()`](../parser/src/rules/Choice.ts) calls `parse()` on EVERY alternative,
  then picks one with `getBestMatch()`:
  - highest `priority`, then longest match, then EARLIEST rule
  - `priority` answers ONLY "several rules match the SAME words:  which wins?" (`Rule.priority`, default 0)
  - how tightly an operator binds is spell's `precedence` (see "Expressions")
- [`Sequence.parse()`](../parser/src/rules/Sequence.ts) first runs `Sequence.test()`:
  - fixed words, symbols and patterns are checked where they must fall;  subrules are skipped
  - it rejects ~92% of attempts before any child parses
  - then each child is parsed at the head of the remaining tokens
  - GIVE-BACK:  a required word failing right after a required `{slot}` re-parses the slot shorter.
    - It cuts the slot just before each place the word is (last first), and goes on from there.
    - e.g. `remove the card of the pile`, for `remove {thisArg:expression} of {callArgs:expression}`
    - only on the way to failing, NEVER in expecting mode
- `Subrule` looks its rule up BY NAME, through `scope.getRuleOrDie()`, at call time.
  - So rules added mid-parse are visible to later lines.
- The single-token rules are cheap:  they compare one token, with `===` or a regex.
  - `Literal`, `Literals`, `Pattern`, `TokenType`
- Spacing (`rule.spacing`, `P.Spacing`):  what may sit between the previous token and a rule's first.
  - `none`:  touching
  - `one`:  one space
  - `some`:  spaces or tabs
  - unset:  anything
  - It's read from the previous token's trailing `whitespace`.
    So it works only with a policy that drops inline whitespace onto tokens (`LEADING_ONLY`, spell's).
  - It's checked by the HOLDER, which can see the previous token:
    - `Sequence`, before each part:  a miss is no match (an optional part is skipped)
    - `Literals`, per literal (`LiteralMatcher.spacing`)
    - `Repeat`, between copies (`itemSpacing`) and before its delimiter
  - Rulex sets it from how the syntax is spaced (see [the Rulex guide](../../guides/rulex/rulex.html)):
    - parts written touching must touch (`isn't`, `\[{x}\]`);  spaced ones may space
    - `{space}` / `{spaces}` set the next part's
    - a symbol touching its flag repeats as a run (`#+`)
- Cost, warm:
  - Measured by a `BENCH=1` run of [the project tests](src/SpellProject.test.ts), 2026-10-04,
    after P3 of precedence-and-types halved it.
  - Card.spell (121 lines) ~12ms;  Solitaire.spell (259 lines) ~32ms;  the whole Solitaire project ~55ms
  - the whole project, after later phases:
    - ~60ms after P5 (typed calls, return types)
    - ~59ms after P6 (members)
    - 57.4ms after P8 (exclusive lists:  no change)
    - 65.9ms after P10 (membership, guards), against 68.5ms just before it
  - Compiling is <1ms per file, and tokenizing about the same:  parsing is the whole cost.
  - `parser.rules` rebuilds after mid-parse `addRule()`s:
    - 35 per project parse (38 before P6:  no rule per enumeration)
    - ~1ms in all:  not worth optimizing
- "What can come NEXT?", for editor completion:  `parser.expectedAfter(input, ruleName, scope)`.
  - It parses a half-typed line in EXPECTING mode (`P.Expectations`).
  - Where rules ran out of tokens, they record what they were waiting for:
    - `Sequence`:  the child it hadn't got to, and any optional ones after it
    - `Repeat`:  another item
    - `Subrule` / `Choice`:  themselves
  - A `Sequence` failing after a child ran out of tokens INSIDE itself records that child as `within`.
    - That's partway through it, e.g. an argument being typed:  for signature help.
    - Completion skips these.
  - Each is a `P.Expectation`:
    - the rule
    - the `Sequence` and index it sits at, e.g. for the rest of a method's syntax
    - depth
    - `continues`:  it only EXTENDS something complete, e.g. an operator after `x`.
      A `Choice` marks what its other alternatives recorded, once one matched every token.
  - `Sequence.test()` lets a rule through whose words fit but ran short.
    - That's `allowRunOut`, a module flag:  the test walk is too hot for an argument.
  - `Subrule` parses are memoized for the one call (`Expectations.memoized()`), or it's ~40x slower.
  - Normal parsing pays ~1%:  one static read per hook.

## Rule modules and rule names

- Spell's rules are in modules:  `events`, `lists`, `methods` ...
  - A module's parser (`new SpellParser({ module })`) holds its rules;  [rules/index.ts](src/rules/index.ts)
    combines them all into `spellParser`.
  - How a module's files are laid out:  "Parser rules" in [AGENTS.md](AGENTS.md).
- A module is a FOLDER, one rule class per file (epic `output-targets` P18), e.g. [events/](src/rules/events/).
  - A rule registers itself as its file loads:  `events.addRule(Trigger, { syntax, tests })`.
  - So the order of the folder's `index.ts` is the order rules are registered:  the TIE-BREAK order.
    - When a `Choice` ties on `priority` and length, the EARLIEST registered rule wins (`getBestMatch()`).
  - Modules not yet split are still one file each:  `lists.ts`, `methods.ts` ...
- A rule's NAME is what `syntax` (`{list_add_relative}`), `parser.rules`, declarations and errors call it:  snake_case.
  - Worked out from its PascalCase class:  `ListAddRelative` => `list_add_relative`, `If` => `if`
    (`P.Rule.ruleNameFor()`, called by `Rule.instantiate()`).
  - A class whose name doesn't give its rule name sets `static ruleName`, e.g. `BlockLine` => `line`.
  - [ruleNames.test.ts](src/rules/ruleNames.test.ts) pins every rule's name, module and order.
- A rule's tests, `{ input, js, ts }`, parse the input once and write it with BOTH writers:
  - `js`:  `P.JSWriter`;  `ts`:  `P.TSWriter`, left out where it's the same.
  - Run by [`unitTestModuleRules()`](../parser/src/test/unitTestModuleRules.ts);
    `yarn test:rules:bless` writes each `ts` into the source.
  - `Parser.testRules()`, which the speed test times, checks `js` only.

## Expressions

- `expression` is ONE rule, [`compound_expression`](src/rules/expressions.ts):
  `{lhs:operand} {rhsChain:expression_suffix}*`
  - an `operand`, then each `expression_suffix` binding tighter than its `bound` (0:  all)
  - no suffix:  the operand's own match, as is, so `match.is(known_variable)` still works
- An `operand` is what an operator acts on:  one expression with no operator at its TOP.
  - e.g. `5`, `the deck`, `(x + 1)`
  - e.g. `the first card of the deck` (it nests), `the cards in the deck where ...`
  - Every rule aliased `expression`, other than `compound_expression`, is registered as `operand` instead:
    `SpellParser.getNamesForRule()`.
  - That also throws for an operand whose syntax STARTS with an expression:  it would recurse forever.
  - Something after an expression is an `expression_suffix`, e.g. `list_membership_test`.
- Three slot kinds:
  - `{x:expression}`:  everything
    - statements, and slots closed by a word (`position of {x} in`)
    - method-call arguments (but see "a statement and an operand" below)
  - `{x:arithmetic_expression}`:  `+ - * /` only, stopping before a comparison
    - e.g. `absolute value`, `round`
    - bound `Precedence.takesSum`
  - `{x:operand}`:
    - a prefix's LAST slot (`the first card of {list:operand}`)
    - every suffix's right side
- `precedence` (how tightly an operator binds) is set on suffix rules ONLY:
  `InfixOperatorSuffix` / `PostfixOperatorSuffix`.
  - It comes from the `Precedence` table:  `*` before `+` before `is` before `and` before `or`.
  - The constructor throws without one:  a silent default is how `ends with` went wrong.
  - It's read ONLY by the loop:
    - the loop stops at its `bound`
    - `getAST()`'s shunting-yard groups the flat chain by it
    - a postfix pops like an infix, so `x + y is empty` => `isEmpty(x + y)`
  - It's NOT `priority`, which only breaks a `Choice`'s tie (see "Rules and matching").
    - e.g. a user's quoted alias (`Priority.userDeclared`) beats a built-in suffix matching the same words
- A statement and an operand:
  a rule aliased both `statement` and `expression`, which says `@proto static operandInExpressions = true`
  (`SpellStatement`).
  - `SpellParser.addRule()` registers it TWICE (`addStatementAndOperand()`):
    - as the statement, its syntax as is
    - as an `operand`:  a twin whose LAST `{x:expression}` slot is `{x:operand}`,
      its `statementRule` pointing back
  - Method calls and `wait for` do:
    - statement `notify x + y` => `notify(x + y)`;  `if double x is 4` => `double(x) == 4`
    - statement `wait for x is 1` => `await (x == 1)`;  `if wait for x is 1` => `await x == 1`
  - `scope.addRule()` records only the statement rule, so a project's declarations write ONE rule.
    Loading it registers both again.
  - Editors map a twin back with `SpellStatement.statementRuleOf()`.
- Give-back (`Sequence`, see "Rules and matching") lets a full `{x:expression}` slot before a word work:
  - `remove {thisArg:expression} of {callArgs:expression}`, on `remove the card of the pile`
- Expecting mode:  out of tokens after the operand or a suffix,
  the loop records `expression_suffix` as only CONTINUING it.
  - That's what the old `expression` Choice worked out.
- `expressions.test.ts`, "priority and precedence", snapshots:
  - every built-in rule's non-default `priority`
  - every suffix's `precedence`

## Datatypes:  what an expression IS

- `match.datatype` says what an expression is, in spell's words.
  - its type:  `P.Datatype`, in [parser.types.ts](../parser/src/parser.types.ts)
  - `text`, `number`, `integer`, `character`, `choice`, `date`
  - `list`, `thing`, `app`, `nothing`, `list of cards`
  - and a user's type, by its `TypeScope` name:  `Card`
  - `undefined` ~== unknown, compatible with everything:  nothing stops parsing for it
- ONE normaliser, `SP.typeName()`, turns what a user WRITES into those words.
  - e.g. `string`, `boolean`, `yes or no`, `array`, `fraction`, `char`, plurals
  - `SpellType.mapValue()` uses it too, keeping classes Type_Case for compiled code (`List`).
  - The vocabulary is spell's:  `SP.TYPE_WORDS` (`builtinTypes.ts`), handed to the parser's `P.typeName()`.
    - The parser knows only each datatype's own name, so a translation brings its own words.
- `match.datatype` memoizes `rule.getDatatype(match)`.
  - Its default is the rule's `@proto static datatype`.
- About a dozen rules override it, reading ONLY `match.data` and child matches' datatypes:
  - `variable` / `SpellIdentifier`:  its `scopeVar`'s `datatype`
  - a member read (`the X of Y`, `its X`, see "Members"):  the member it read (`data.member`)
    - a built-in's comes from its table entry, e.g. `the length of the name` is a `number`
    - an enumeration's values:  `list`
  - `DynamicMethodRule`:  its method record's `returns` (`data.method`), which the parser infers
    (see "Return types" below)
  - `new_thing` / `create_thing` / `new_list`:  the type made
  - list rules:  the item type (`data.itemType`), the list's type, or `number`
  - `compound_expression`:  `getAST()`'s shunting-yard again, over datatypes
    - each suffix's `getResultDatatype(match, lhs, rhs)`, by default its `datatype`:
    - `choice` for every suffix but the ones below
    - `+ - * /`:  `number`;  `+` of text is `text`
    - `as upper case`:  `text`
    - `as a <type>`, `X if C otherwise Y`
  - `parenthesized_expression`:  what's inside
- A rule needing a LOOKUP for it does it in `parse()`, into `match.data`:
  - what it looks up:  a member of a type, a list type's item type, a method's record
  - how:  `scope.getType(datatype)`, `scope.getItemType(datatype)`, `TypeScope.getMember(words)`
  - never in `getDatatype()`, which may run later
- Sinks:  where a datatype is kept, so later lines know it.
  - a new variable from `set`, `X is Y` or `get` (and its `it`):  the value's datatype, on its `ScopeVariable`
  - method arguments:  `(a card)` / `(x as text)`
  - `this` / `it` in a method or getter:  its owner type (`MethodScope.itDatatype`)
  - a loop's item and `it`, and a `where`'s:  the list's item type
  - `on ... with a card`'s `card`
  - `a deck is a list of cards`:  `Card`, as the `Deck` `TypeScope`'s `itemType`
- First datatype wins:  a record's datatype is set when it's declared, never widened.
  - The one exception:  a getter's property, and a method's `returns`, are set once the BODY has parsed.
    See "Return types".
- Return types are set once a statement's body has parsed, inline or nested.
  - `commitStatement()` then runs `rule.mutateScopeFromBody()`.
  - `MethodDefinition` sets its record's `returns`.
  - `property_value_getter` sets its property's `datatype`, if it declared it and nothing gave it one.
  - Each is journaled (`P.ParseJournal.assign()`), from `SpellStatement.getReturnedDatatype()`:
    - an inline EXPRESSION body (`the value of a card is its rank`):  that expression's datatype
    - else every `return` in the body (`getReturnValue()`, `return_statement`'s), inside `if`s too
      - but NOT in a body with a `MethodScope` of its own, e.g. a loop's:  that compiles to a callback
      - all the same:  that;  none, or a mix:  unknown
      - a bare `return` is `nothing`
  - A call's datatype reads it lazily:  `data.method.returns`.
    - A recursive call, parsed before its body ends, is unknown.
- Typed calls:  a call rule (`DynamicMethodRule`, `MethodInfixRule`) is `specialize()`d with its method's types.
  - They're its record's owner `of` and `params`, as statics `thisType` / `paramTypes`.
  - Its `parse()` rejects a match whose argument's datatype is KNOWN and can't be the parameter's.
    - That's `scope.couldBeA()`:  neither is the other or a sub-type of it, no stubs.
    - Unknown always fits.
    - `put the chip on the pot` finds Chip's `put`.
    - `add the card to the deck` falls past a user's `to add a card to a pile`,
      to the built-in `spellCore.append(deck, card)`.
  - `MethodInfixRule` checks only its right side:  a suffix can't see its left while parsing.
  - A `MethodPostfixRule` checks nothing.
  - Declarations need nothing new:  `of` / `params` are the method record's, in the same comment.
    Loading hands `specialize()` the whole of it.
- Probe ledger ([grammar.probes.test.ts](src/grammar.probes.test.ts)), "datatypes":
  what a set of expressions and sinks are.

## Adding an expression rule

- An OPERAND stands alone:  a literal, `the X of Y`, `the first card of ...`.
  - It `extends SpellExpression`:  alias `expression`, registered as `operand`.
  - A slot at its END takes `{name:operand}`:  `the first card of {list:operand}` stops before any operator.
  - Math that should take a sum (`the absolute value of x + 1`):  `{name:arithmetic_expression}`.
  - A slot closed by a required word (`of`, `in`, `to`) stays `{name:expression}`, like a paren.
- An OPERATOR follows an expression:
  `extends InfixOperatorSuffix` (`x OP y`) or `PostfixOperatorSuffix` (`x is empty`).
  - Its right side is `{expression:operand}`.
  - It MUST set `@proto static precedence` from `Precedence`:  the constructor throws without it.
  - Build its output in `compileASTExpression()`.
  - Not a test?  Set its `datatype` (default `choice`), or override `getResultDatatype()`.
- `priority` only settles a tie between rules matching the SAME words.
  - Leave it unset unless a probe shows a tie going wrong.
  - Then set it from the `Priority` table ([rules.types.ts](src/rules/rules.types.ts)), with a one-line why.
- Always NAME a slot, so `match.groups` keeps its key.
- Add one mixed-operator line to the probe ledger, [grammar.probes.test.ts](src/grammar.probes.test.ts).

## Members:  `the short rank of the card`

- A member's NAME is `member_words` (`properties.ts`):  1..N words, up to the first structural one.
  - `MEMBER_STOP_WORDS`:
    `of the a an is has have in to and or if where as with whose for from then else otherwise not ...`
  - It's NOT the identifier blacklist, so `short` is fine.
  - Its two spellings:
    - `value`:  its compiled name, `short_rank`
    - `raw`:  its words, `short rank`
  - Either spelling, or `short-rank`, finds the same record:  scope lists normalize keys (`snakeCase`).
- Declarations take `{property:member_words}`, keeping the group name:
  - `the short rank of a card is:`
  - `a card has short rank as text` (article optional)
  - `a cards color is`
  - `its {property}` in a quoted formula
  - object literals
  - each records the property with `TypeScope.declareProperty(name, declaredBy, { words, datatype, auto })`
- Reads come two ways (plan doc D5), worked out in `parse()`:
  - RESOLVED:  the words name a PROPERTY that the type of what's read declares
    (`getMember()`, up its super-types).
    - An enumeration's instance twin compiles to its class variable:  `the suits of the card` => `Card.Suits`.
  - LOOSE:  ONE word, which nothing need declare, blacklisted words out:  `the is-set-up of it`.
    - Several undeclared words are NOT a property read, so `the first card of the deck` stays the ordinal rule's.
  - `the X of Y` is ONE rule doing both, `property_expression`:  two would parse every operand twice.
    - its syntax:  `the {property:member_words} of {expression:operand}`
    - `Priority.preferred`:  a declared `last card` beats the ordinal `the last card of`
    - but NOT `the position of` / `the number of` (`Priority.mostSpecific`)
  - `its X` is two rules:
    - `its_known_property` (resolved, `Priority.preferred`) takes the LONGEST run that `it`'s type declares
      - it re-parses with fewer tokens to find it (`declaredPrefix()`, in `rules.types.ts`)
      - e.g. `its short rank + its short suit`
    - `its_property`, the loose word, at `Priority.normal`, so `its last card` stays `its_ordinal`'s
- A type's class members:  ONE static rule, `class_member` (`classes.ts`).
  - its syntax:  `{type:known_type} {member:member_words}`
  - it takes the longest run that's a class variable of the type, e.g. `card suits includes x` => `Card.Suits`
  - it was a rule per enumeration (`EnumerationRule`)
  - `the number of card suits` counts:  `list_count` takes any operand whose datatype is a list

## Built-in types:  `the length of the name`

- `SP.BUILT_IN_TYPE_TABLE` ([builtinTypes.ts](src/builtinTypes.ts)) is DATA:
  one entry per built-in type with anything to say.
  - the types:  `thing`, `list`, `app`, `text`, `date`
  - each entry:  its docs, `itemType` (`text` holds `character`s), and `members` (`SP.BuiltInMember`)
  - not a `.spell` file, not statics on runtime classes (plan doc D25)
  - A type's NAME and super-type stay those of `P.BUILT_IN_TYPES`:  the parser's vocabulary.
    The entry's `superType` must agree (a test checks).
- `SpellParser.rootScope` loads it (`loadBuiltInTypes()`) into the root's `TypeScope`s:
  - each `itemType`
  - each member with a `readAs` template, as a `P.ScopeVariable` holding it (`readAs`, `docstring`)
  - So member reads resolve it like any declared property (see "Members"), up the super-type chain:
    a `Deck` finds `List`'s `length`.
- `readAs` is how a read compiles;  `{it}` in it is what it's read from.
  - It's ONE of three forms (`parseReadAsTemplate()`):
    - `{it}.length`
    - `{it}.getFullYear()`
    - `spellCore.itemCountOf({it})`
  - `MemberReadExpression.getMemberAST()` builds it.
  - So the same words compile per type:
    - `the length of the name` => `name.length`
    - `the length of the deck` => `spellCore.itemCountOf(deck)`
  - Its datatype is the member's.
  - An unknown type still reads loose:  `x.length`.
- A member with only `rules` (no `readAs`) is DOCS, for what built-in rules already spell.
  - e.g. `shuffle (a list)` => `list_shuffle`
  - Their rules compile it, and it's NOT loaded into scope:
    a `ScopeMethod` record there would change which method a call finds (P5's typed calls).
- A project's own declaration wins:  its type is first in the chain, e.g. `the size of a pile is: 52`.
- Spell's own types refuse changes, with a parse error saying why (see "Refused statements" below).
  - Why:  the root scope is shared by every project, and no journal records it.
  - refused:  declaring a property on a built-in type (`the length of a text is:`, `things have a tag`)
  - refused:  setting a built-in member (`set the length of the deck to 3`)
  - fine:  a METHOD of a built-in type.  Its record goes in the project's `methods`.
- Editors:
  - hover shows a member's `docstring`, and a built-in rule's member (`builtInMembersOfRule()`)
  - completion offers them with their docs
  - the Type Explorer lists the table's types and members, and its rules' syntax from the live grammar
  - `core`'s [`spellCore.scopes.js`](../core/src/spellCore.scopes.js) is the same, for pages with no parser.
    - It's GENERATED from the table:  `yarn scopes --builtins` in `packages/lsp`.
    - A test fails until you do.
- Adding a member:  ONE table entry, plus the `spellCore` method or javascript property its `readAs` names.
  - [builtinTypes.test.ts](src/builtinTypes.test.ts) reads each one off a sample value, so it must be real.
  - Then `yarn scopes --builtins`.
- Adding a TYPE:  its name in `P.BUILT_IN_TYPES` first, then its entry.

## Membership:  `a card belongs to one pile`

- `belongs_to_one` (`classes.ts`):  `a card belongs to one pile`.
  - A card is in at most ONE list of the pile FAMILY at a time.
  - The family:  `Pile` and its sub-types (`a tableau is a pile`).
  - `a deck is a list of cards` is outside it (plan doc D7):  a card can be in the deck AND one pile.
  - The list types stay plain:  `a pile is a list of cards`.
  - `can_belong_to_many`, `a card can belong to many piles`, is the opposite.
    That's what lists do anyway, so it does nothing.
- Both types MUST be declared ABOVE it:  it compiles to code which needs both classes.
  - `parse()` refuses a stub, saying what to write.
  - So the live examples say it in `Pile.spell`, just under `a pile is a list of cards`.
  - Refused too:  a list type of spell's own (`one list`), or a type that isn't a list.
- Scope:  the item type gains a read-only member naming the list type (`TypeScope.declareOwnerMember()`).
  - e.g. `pile` on `Card`:  `datatype` `Pile`, `exclusive: true`, `declaredBy` the membership line
  - So `the pile of the card` / `its pile` resolve as any member does (see "Members"),
    and go-to-definition lands on that line.
  - It REPLACES a `pile` another statement declared, e.g. auto-declared by an earlier `set`.
  - NOT for a built-in item type (`a thing belongs to one bag`):  the root scope is shared.
  - Nothing goes on the list type's `TypeScope`:  the member is the whole record.
- `set the pile of the card to ...` is refused (`assignment_statement.parse()`):  move the card instead.
- It compiles to two patches, where the line is:  after both classes, NEVER hoisted into them.

  ```js
  Pile.exclusive = true
  Object.defineProperty(Card.prototype, 'pile', { get() { return Pile.ownerOf(this) }, configurable: true })
  ```

  - They're `P.ASTPatchedMember`s:  the member must win over any accessor an earlier statement gave it.
- Declarations:  the member itself, `{ property: "pile", of: "Card", datatype: "Pile", exclusive: true }`.
  - Loading adds it as written (`SpellDeclarations.loadVariables()`):  no other record needed.
  - Picking `Card` brings `Pile`, as any property's datatype does.
- Runtime:  `core`'s `List` keeps the owners.
  See [core's AGENTS.md](../core/AGENTS.md), "Membership and guards".

## Guards:  `a tableau can take a card if: ...`

- `list_guard` (`classes.ts`):  what a list type takes, or gives up, when something MOVES (plan doc Q23 - Q25).
  - `a tableau can (add|take) a card if: ...`
  - `a stock-pile can (release|remove|give up|let go of) a card if: ...`
  - `a foundation can never (release|remove|give up|let go of) a card`:  always no
  - Its body answers yes or no, inline or indented.
  - In the body, `the card` is the card;  `it`, `its` and `the tableau` are the list.
- It compiles to a method of the list's class, overriding `List`'s yes:
  `canTake(card) {...}` / `canGiveUp(card) {...}`.
  - It's hoisted into the class like any member.
  - A sub-type inherits it.
  - No scope record and no declaration:  it's the class's own method, which an importer gets with it.
- `list_move` (`lists.ts`):  `move the card to the tableau` => `spellCore.move(card, tableau)`.
  - It's a statement, or a yes / no (`operandInExpressions`):  `if move the card to the tableau then ...`.
  - It asks the list of the card's family holding it to give it up, then the target to take it.
  - Refused:  nothing changes.
  - A card that belongs to no family:  only the target is asked.
  - `Priority.overridable`:  a project's own `to move (a card) to (a pile)` wins, e.g. the frozen Solitaire's.
- Only `move` asks.
  `add`, `remove` and `empty` never do:  they're for dealing, gathering cards back, shuffling.
- Asking without moving:  `can_take` / `can_give_up`, `Negatable` suffixes.
  - `the tableau can take the card` => `spellCore.canTake(tableau, card)`
  - `cannot give up` negates
- Probe ledger, `X1` ... `X9`:  `probeMembership()`.
  - It uses the frozen `Card` / `Deck`, and a `Pile.spell` of the probe's own.
  - Compiled and RUN:  [membership.test.ts](src/parserTests/membership.test.ts).

## File => block => line => statement

- [`Block.parse()`](src/rules/Block.ts) loops over the root `BlockToken`'s items:
  - a `LineToken` => `parser.parse(items, "line", scope)`
    - it passes ALL remaining items, so a statement can take the indented block after it
  - a nested `BlockToken` nobody claimed => parsed recursively, in the SAME scope
  - `items.splice(0, match.length)`:  a header + its nested block is one item of length 2
- [`BlockLine.parse()`](src/rules/BlockLine.ts), in order:
  1. a blank line => `blank_line`
  2. pop a trailing comment
  3. parse the rest as `"statement"`;  leftovers become a `parse_error`
     - a statement its rule REFUSED is a `parse_error` already, saying why (`SpellStatement.refuse()`):
       the line's error, never committed
  4. `commitStatement()`:  the ONLY place a parsed statement changes scope, and only for the line's winner
     - `mutateScope()` on the statement, then on each inline statement inside it, outermost first
     - if the rule takes a nested body and the next item is a `BlockToken` => `parseNestedBlock()`
     - `mutateScopeFromBody()` on the statement, e.g. a method records what it returns:
       its result is kept as the line's `data.fromBody`
- [`SpellStatement`](src/rules/Statement.ts):
  - A body keyword ending `syntax`, or a choice of them, is taken OUT of `rules` at construction,
    into `rule.bodySpec`.
    - the keywords:  `{statement_body}`, `{expression_body}`, etc (see `BODY_KEYWORDS`)
    - A body is parsed in `match.nestedScope`, which needs the statement's match to exist first.
  - A `leadIn` keyword, `{with_nested_statements}`, is ALSO a registered rule, matching words on the line (`where:`).
    - It stays in `rules`.
    - The statement takes a nested body only when it matched (`takesNestedBody()`).
  - Inline body:  after its sequence matches, `parse()` parses the rest of the line in `nestedScope`.
    - It does NOT change scope:  this runs for every candidate, winners AND losers.
  - The inline statement OR nested block is recorded as `match.data.body`.
    - Read it with `rule.getBody(match)`, NEVER by group name.
  - Anything that parses a `"statement"` on its own, and keeps it, MUST commit it:
    - `commitStatement()` (`Statement.ts`), e.g. JSX `on...` handlers
    - or generically `parser.commit(match)`, e.g. rule unit tests (`unitTestModuleRules`, `Parser.testRules()`)
  - `parseNestedBlock()` parses a `{nested_statements}` as `"block"`, in `statement.nestedScope`.
    - It sets `data.enclose`.
    - A `{nested_expression}` (e.g. `return`) accepts a single-line block only.
  - `nestedScope` comes from `rule.getNestedScopeForMatch()`:
    - default:  the same scope
    - `if` / `else` => a new `BlockScope`
    - methods, events, property getters, list loops => a new `MethodScope`
- Errors are never thrown.
  - `parse_error` matches roll up into `match.data.errors`, on `line` / `block` matches (`Block.getParseErrors()`).
  - They compile to `/* PARSE ERROR: ... */`.
- Refused statements:  a `parse()` which understood a statement, but mustn't take it.
  - It returns `SpellStatement.refuse(match, message)`.
  - NOT `undefined`, which would say only "Don't understand ...".
  - It's a `parse_error` match over its tokens, with `message`:  `BlockLine` reports it.
  - It competes with the REFUSING rule's priority (`P.Match.priority`),
    so a plainer rule matching the same words can't take the line instead.
    - Refuse only what the rule matched to the line's end, or it beats a longer match.
  - Used by the property declarations (`SpellStatement.refuseBuiltInType()`) and `assignment_statement`:
    see "Built-in types".
  - Errors inside JSX `{...}` live in the JSX rules' `match.data`, not `matched`.
    - `BlockLine` gathers them from anywhere in its statement (`SpellJSX.parseErrorsIn()`) into `data.errors` too.
    - They're reported, but compiled in place.
- Warnings:  what a program should say, but which doesn't stop it, e.g. a type (epic `output-targets`, Q24).
  - `a calculator has an input` => `Say what "input" is, e.g. "a calculator has an input as text"`
  - A rule notes one on its OWN match while parsing:  `SP.SpellWarnings.note(match, message, at?)`.
    - In `parse()`, or in `mutateScope()` for what only it knows
      (`assignment`:  a new variable's `[]`;  a property a `set` declared).
  - They're NOT rolled up like errors.
    - `SP.SpellWarnings.in(file.match)` walks the file's matches as they are now:  `matched`, and matches in `data`.
    - So an incremental parse needs nothing of its own.
    - Only those about the file's own tokens:
      a match parsed from a string (`quoted_method_signature`) sits at the string's offsets,
      so its rule notes them again, about its quoted text.
  - What a LATER line or file may settle:  `SP.SpellWarnings.noteIf(match, message, stillHolds, at?)`.
    - `in()` reports it only while `stillHolds()`.
    - It's asked then, with what the whole project declares by then.
  - So far:
    - a property with no type, or a list of nothing said (`define_property_has`)
    - a parameter with no type (`var_method_arg`)
    - a new variable set to a list of nothing said (`set state to []`),
      or a property a `set` declares from a value that doesn't say (`assignment`)
    - a LOOSE member read its type never declares (`property_expression`, `its_property`, Q45):
      `the name of the pile` => `A pile never says it has a name:  declare it, e.g. "a pile has a name as text"`
      - Only on a type the project declares, all of whose super-types are its own or spell's:
        an imported type's importer may give it anything (`MemberReadExpression.warnIfUndeclared()`, `noteIf()`).
  - Editors show them as `DiagnosticSeverity.Warning` (`SpellLanguageService.diagnostics()`).
  - `spell compile` lists them after its errors, never counting them:  see "Language server".

## Outline bodies:  `a card is a thing where:`

- The OUTLINE style (epic `outline-spell`):  a type's heading, then indented lines all about that type,
  `it` / `its` meaning it, e.g.

  ```spell
  a card is a thing where:
  	- it has a name as text
  	- its "suit" is one of clubs, diamonds, hearts or spades
  	- it "is a (suit)" for its suits
  	- its "color" is red if its suit is either diamonds or hearts otherwise it is black
  	- it belongs to a pile
  ```

  - It compiles EXACTLY as the same lines in the sentence style do (`a card has a name as text` ...).
  - [outline.test.ts](src/parserTests/outline.test.ts) pins it.
- `create_type` / `create_list_type` share `TypeDeclaration` (`classes.ts`).
  - A syntax ending `{with_nested_statements}?` (`where:`, `with:` or `:`) takes the body.
  - Without it, the same syntax declares the type alone.
  - The body's scope is a [`P.SubjectScope`](../parser/src/scope/SubjectScope.ts):
    - it owns nothing, so what its lines declare lands where the same lines at the top level would
    - `subject` names the type
  - `flatBody` (`SpellStatement`):  the body is NOT `enclose`d.
    - `Block.getAST()` splices its statements in after the type's.
    - So `SP.hoistClassMembers()` moves its members into the class as usual.
- `subject_it` / `subject_its` (`types.ts`, `SubjectRule`):  `it` / `its` as a line's SUBJECT.
  - Each is a `SpellType` match for the type:  `value` its name, `raw` its instance name, `data.scopeType`.
  - Only directly in a `SubjectScope`.
    Inside a getter or method in the body, `it` is the instance, as anywhere.
  - Each member rule gets a second syntax, with `{type:subject_it}` where it says `(a|an) {type}`:
    - `define_property_has`, `property_value_getter`, `belongs_to_one`
    - `quoted_type_expression`, `quoted_property_formula`
    - `its_quoted_property` (a `type_property` for `property_value_either`)
- Quoted names:  "quotes teach a new word".
  - `quoted_type`:  `a "card" is a thing`, in any type declaration
  - `quoted_member`:  `its "short rank" is ...`, in a body
  - `its "x" is` takes an `outline_specifier`:
    a `type_specifier` without its `as` (`one of ...`, `a number`, `yes or no`).
  - A declaration names them without quotes:  `Rule.declaredText()`.
    - `SubjectRule` also overrides it:  `card`, not `it`.
- Bullets:  a line starting `- ` (`BlockLine.isBullet()`) drops the `-` before the statement is read, on ANY line.
  - The `-` stays a token of the line's match, so editors see it.
- Editors:  hovering an outline line shows **Reads as**, the sentence style's words for it.
  - That's each rule's `SpellStatement.getLongForm()`.
  - default:  the subject spelled out, `it has a deck` => `a card has a deck`
  - `define_property_has`, `belongs_to_one`, `quoted_property_formula` and `draw_side` say their own
  - Compiling the long forms gives the same javascript as the outline (`outline.test.ts`).
- `it` / `its` starting a line OUTSIDE a type's body says so (`BlockLine.isOutlineLineOutsideBody()`).
- A property's quotes are optional:  `- its rank is a number` (plan doc Q4).
  - Quoted names work in the sentence style too:  `a card has a "suit" as ...` (J3, option C).
  - `- it "rank" is ...` is refused, saying to write `its` (`quoted_type_expression.isPropertySlip()`).
- A phrase and nothing more is refused, saying to add a body (`quoted_type_expression.isBodiless()`, plan doc I6).
  - e.g. `- it "can move"` or `a card "can fly"`:  no `if`, `is` or `:`
  - Why:  it'd compile to an empty method.
  - A dangling `if` is fine:  its body may be the indented lines below.
  - A phrase true for every one of the type says so:  `- it "can move" always`.
    - `always` / `never` are constants, read as its body.

## Value kinds:  `"suits" as one of clubs, diamonds, hearts or spades`

- In a type's outline body, `value_kind` (`classes.ts`) makes a list of values a KIND of thing, `Suit`.
  - The body's type keeps its list:  the class variable `Deck.Suits`, and its instance twin.
  - Each value is a constant.
  - The kind gets a `P.TypeScope` with `valueKind`:  `{ values, listOn, listName }`.
  - The name must be quoted.
  - It compiles to `Deck.Suits = [...]` + `export class Suit {}`, where the line is.
  - Values stay plain text and numbers when the code runs (plan doc Q10).
- `its "suit" is a suit` (or `a suit of its deck`):  `define_property_has` notes the kind (`data.valueList`).
  - Its setter checks `{ oneOf: () => Deck.Suits }`:  a FUNCTION (`core`'s `checkProp()`).
  - Why a function:  the deck's class names the card's (`static instanceType = Card`),
    so one of them is defined second.
- A kind's property, `the "color" of a suit is:` + an indented body:
  `property_value_getter`, with `data.valueKind`.
  - It compiles a STATIC method, `static color(suit) {...}` (`P.ASTStaticMethod`).
  - `it` / `the suit` is its argument.
  - It records the property's `readAs` as `Suit.color({it})`.
  - So `the color of its suit` compiles to `Suit.color(this.suit)`:
    `MemberReadExpression`, the `static` form of `SP.parseReadAsTemplate()`.
- A value-per-line body (`if.ts`, at `Priority.overridable`):
  - `value_if`:  `red if it is diamonds or hearts` => `if (...) { return 'red' }`
  - `value_otherwise`:  `black otherwise` => `return 'black'`
- `it is diamonds or hearts` / `is jack, queen or king`:  `is_in` with `value_choices` (`lists.ts`).
  - two or more KNOWN constants or numbers joined by `or` => `spellCore.includes([...], it)`
  - It was `(it == 'diamonds') || 'hearts'`.
- Ranges in a list of values:  `2 ... 10` (`number_range`, spread by `identifier_list`).
- A value kind may be used ABOVE its declaration, e.g. the card above the deck (issue I3):
  - `SpellParser.declaredTypes()` finds `"suits" as one of ...` lines too (`VALUE_KIND_DECLARATION`).
    So `Suit` is a stub before the project parses.
  - What depends on it reads the kind's RECORD when compiling, as a call reads `data.method.returns`:
    - `define_property_has`'s `data.valueType.valueKind` (its `oneOf`)
    - a member read's `data.ownerType.valueKind`:
      `the color of its suit` => `Suit.color(...)`, though `color` wasn't declared yet when it parsed
- A list type whose item type is declared BELOW it (a stub when it parses) reads it when used:
  `static get instanceType() { return Card }` (`create_list_type`).
- A property, alias or phrase on a type nobody declares is refused (`SpellStatement.refuseUnknownType()`).

## Inferred phrases:  `- it "is a (suit)"`

- `quoted_property_formula` with no `for its ...`:  `parse()` INFERS what each blank reads (`inferPlaceholders()`).
  - The rule's syntax here:  an outline body's `{type:subject_it} {alias:text}`, the whole line.
  - A blank is a word in parens.
    - It names, by its singular, a property of the type with a list of values.
    - The list is its own (`as one of`), or a value kind's.
    - e.g. `is the (rank) of (suits)`:  sources `rank`, `suit`
  - A bare word is always just a word (plan doc J9).
  - More after the phrase:  not ours, so `it "is face up" if ...` stays a `quoted_type_expression`.
  - REFUSED, saying why:
    - no parens:  `it "is a suit"`
    - a blank naming no such property:  `it "is a (color)"`
  - A refused match competes with its rule's priority (`P.Match.priority`, read by `Choice.getBestMatch()`).
    So `quoted_type_expression` can't take the line as an empty method instead.
- A value kind declared FURTHER DOWN (a stub here, e.g. the card above the deck):
  - its placeholder's syntax is `(expression:{constant}|{number})`
  - `QuotedPropertyRule` is specialized with `kinds: { suit: "Suit" }`
  - its `parse()` checks the word against the kind's values WHERE THE PHRASE IS USED
    (`kindValue()`, into `data.kindArgs`)
- A phrase ON a value kind:  `a rank "is a face card" if ...`.
  - `quoted_type_expression.processSignature()` sets `signature.valueKindOf`.
  - It compiles to the kind's static method:  `static is_a_face_card(rank)`.
  - Its `MethodPostfixRule` (`staticOf`) compiles to `Rank.is_a_face_card(card.rank)`.
  - Postfix phrases only.
- A user's phrase checks WHOSE it is.
  - `compound_expression` tells the first suffix after an operand what that operand is.
    - That's `SuffixLeft` (`expressions.ts`):  a side channel, set while that suffix parses, restored after.
  - These refuse an operand KNOWN not to be their owner (`scope.couldBeA()`):
    - `MethodPostfixRule`, `MethodInfixRule` and `QuotedPropertyRule`
    - each `specialize()`d with its owner `of`, as `thisType`
    - e.g. a deck's `a rank "is a face card"` on `the card is a face card`, where the card has its own
  - Unknown:  anything fits.
  - A suffix after `and` / `or` is told the operand after it:
    `the game` in `... and the game is red` (plan doc I7).
  - After anything else, it isn't:  what it follows is the chain so far, e.g. a sum.
- `draw_side` (`classes.ts`):  `- to "draw its front":` + one line of markup => `get front() {...}`.
  - Front AND back also give the type `draw()`, by its direction (plan doc Q14).
- A one-line indented body (`{nested_expression}`, e.g. `return` + markup, `draw_side`'s)
  parses in the statement's `nestedScope`.
  - As an inline body does (`SpellStatement.parseNestedBlock()`).

## Fill-ins:  `"images/[rank]-of-[suit].png"`

- `[x]` inside text ALWAYS fills in (plan doc Q2).
  - `parseFillIns()` (`core.ts`) splits the text into plain pieces and fill-ins.
  - Each fill-in is parsed as an expression, where the text is.
  - It reads `its x` when `x` is a property of `it`'s type:  so `[rank]` in a card's getter is the card's.
  - A real bracket:  `[[` or `\[`, and `]]` (Q15).
- Three places use it:
  - the `text` rule
  - a markup attribute's text value (`SpellJSXAttribute`)
  - markup text (`SpellJSXText`, as one `{...}` child)
  - Each keeps the parts in `data.fillIns`.
  - Each compiles them to a javascript template string, `P.ASTTemplateString`:
    `` `images/${this.rank}-of-${this.suit}.png` ``.
- A fill-in that doesn't parse:  the text doesn't match ("Don't understand"), or the attribute is a parse error.
- Each fill-in parses on its own, so its tokens don't map back onto the file:
  no hover or go-to inside one yet.

## Scope:  what's stored where

- All scope collections are [`ScopeList`s](../parser/src/scope/ScopeList.ts):
  - only `get`, `add` and `replace`:  no remove
  - `get()` checks its own items, then falls through to the parent list
  - Changes are journaled:  see "Incremental parsing".
- `Scope` owns nothing:  `variables`, `types`, `constants`, `rules` and `parser` all forward to `parentScope`.
  - It resolves a datatype to its type:
    `getType()`, `getItemType()` (`list of cards`, or a `Deck`'s `itemType`).
- `BlockScope` owns `variables` + `methods`.
  - Methods are `P.ScopeMethod` records:  words, `params` with datatypes, `returns`, `of`.
  - `FileScope` is a `BlockScope`, so a file owns only variables.
- `RootScope` adds `types`, `constants`, `rules`.
  - `ProjectScope` is a `RootScope`, and holds the records of the project's free functions.
  - `SpellParser.rootScope` is ONE static root, shared by every project (see "Built-in types"):
    - spell's classes:  `Thing`, `List`, `App`, `Object`
    - every built-in type's NAME, with super-types (`P.BUILT_IN_TYPES`:  `text`, `number` ...)
      - e.g. `integer` is a `number`
    - their members, from `SP.BUILT_IN_TYPE_TABLE`
- `MethodScope` adds args, plus `this` / `it` alias variables, of type `itDatatype`.
- `SubjectScope` owns nothing, and names the type its lines are about:  see "Outline bodies".
- `TypeScope` holds:
  - instance + class variables
  - instance methods' records
  - a list type's `itemType`
  - member lookup up its super-type chain:  `chain()`, `isA()`, and `getMember(words)` (a property, else a method)

## Scope:  who changes it, and when

- Changes happen ONLY in `mutateScope()`, run by `commitStatement()` (step 4 above).
  `getAST()` is pure:  see below.
  - variables:  `assignment_statement`, `get` ([assignment.ts](src/rules/assignment.ts))
    - into `match.scope`, so inside a body they stay local
  - `get` / `set it to` ALWAYS declare a new `it` (`declareIt()`):
    - plain `it`, then `it_2`, `it_3`...
    - numbered from the visible `it`'s `output`, skipping names in use
    - so callbacks keep the `it` they captured
  - each new variable holds its value's `datatype`:  see "Datatypes"
  - types:  `create_type`, `create_list_type` (`classes.ts`)
    - `create_list_type` sets `itemType` too
    - `belongs_to_one` gives the item type its owner member:  see "Membership"
    - a type mentioned before its own line is a `stub`,
      which its real declaration later claims (`TypeScope.claim()`, journaled)
  - BEFORE a project's files parse, every type they declare is stubbed (`parser.stubDeclaredTypes()`).
    - So a line can name a type declared further down, or in a later file.
    - The types come from `SpellParser.declaredTypes()`:
      a scan for lines starting `a card is`, `create a type called hand`.
    - `P.IncrementalProject` and `parseSpellProject()` both do it.
    - An edit which changes WHICH types a file declares re-parses the whole project.
  - `is a <type>` (`is_a`) names a KNOWN type:  built in, imported, declared or stubbed earlier.
    - Else it's a parse error, e.g. `is a crad`.
    - A type first mentioned in an `is a` above its own declaration is one too.
  - properties:  every property statement records the property in its type's `variables`,
    with `declaredBy` and its datatype (`TypeScope.declareProperty()`)
    - read by `the X of Y` / `its X` (`getMember()`) for their datatype, and by editors
    - a getter's datatype is what it returns, set once its body has parsed (see "Datatypes", "Return types")
      - so a getter changes scope as any declaration does:  editing its line re-parses what follows
    - an enumerated one (`define_property_has`) also adds:
      - constants for each value
      - a plural `classVariables` entry (e.g. `Suits`), with an instance twin in `variables`
      - ONE static rule, `class_member`, reads that for any type:  no rule per enumeration (see "Members")
  - auto-declared properties:  `set the X of Y to V` declares `X` on `Y`'s type.
    - That's `assignment_statement.declareProperty()`.
    - It's `autoDeclared`, holding `V`'s datatype, so it's reactive.
    - Only where `Y`'s type is one the PROJECT declares (not a stub, an import or a built-in),
      and `X` isn't on it.
    - `data.autoDeclared` makes that `set` `"global"`:  see `getScopeChanges(match)` under "Incremental parsing".
    - Its FILE compiles the declaration:  see "Compile".
- Every record a `mutateScope()` adds carries `declaredBy`:  the match which declared it, for go-to-definition etc.
  - The records:  `ScopeVariable`, `ScopeConstant`, `TypeScope`, `ScopeMethod`, `ScopeRule`.
  - A `ScopeRule` also carries its built `instances`, so a call-site `match.rule` maps back to its definition.
  - `MethodScope` stamps its `declaredBy` on the argument and alias variables it makes.
  - `ScopeList.add()` also notes each such record on its declaring match, as `match.data.declared`.
    - That's `ScopeList.noteDeclared()`;  `TypeScope.claim()` does it too.
    - So COMPILING a statement can say what it declared, without looking up scope.
      See `SP.SpellDeclarations.commentFor()`.
  - A re-parsed statement takes back a record an earlier parse of itself left:
    same rule, line and file (`TypeScope.sameStatement()`).
    - Why:  journal replay can resurrect one, declared by a match that's gone.
- What a statement declares, for editors' symbol lists, comes from its rule:
  - `@proto static declares`
  - or a `getDeclaration()` override:  `assignment` counts only NEW variables;  `MethodDefinition` reads its signature
- How editors colour a match's OWN tokens comes from its rule's `highlightAs`, e.g. `property`.
  - Defaults are on `Keyword(s)`, `Symbol(s)`, `SpellIdentifier`, `SpellType` and `SpellConstant`;
    else on the rule class.
  - `SpellLanguageService` refines it from `match.data`, e.g. an argument's `variable` becomes `parameter`.
  - quoted aliases (`a card "is face up" if ...`):
    `quoted_type_expression` (`methods.ts`) adds an `expression_suffix` rule, a `MethodPostfixRule` / `MethodInfixRule`
  - a quoted formula (`a card "is the (rank) of (suits)" for its ranks and its suits`):
    `quoted_property_formula` (`classes.ts`), a `QuotedPropertyRule`
  - methods (`to turn a card over` ~== `to turn (a card) over`):
    - a signature's `a|an <KNOWN type>` is a typed parameter (`bare_type_arg`), as `(a card)` is
    - a word that isn't a type, or anything after `the`, stays words (`to make a mess`, `to reset the stock pile`)
    - its compiled NAME drops the receiver's type (`turn_over`), unless that leaves a little word dangling (Q44)
      - then it keeps the type's name:  `to update the total of (a calculator)` => `update_the_total_of_calculator`
      - `MethodDefinition.processSignature()`, `DANGLING_WORDS`
    - `MethodDefinition` adds a rule (`methods.ts`) for its call site, AND a `P.ScopeMethod` record (`addMethod()`)
      - the record goes in its type's `methods`, if this project declares the type
      - else in the project's, with `of`:  a free function, or a method of a built-in or imported type,
        whose lists every project shares
    - a call (`DynamicMethodRule`) finds its record while parsing (`MethodDefinition.findMethod()`)
- Types, constants and rules ALWAYS go to the project, from any depth.
- [`scope.addRule()`](../parser/src/scope/Scope.ts) => `parser.addRule()` on the PROJECT's parser,
  plus a record in `ProjectScope.rules`.
  - `Parser.addRule()` clears the memoized `rules` map;  the next `parser.rules` rebuilds the whole merge.
  - `mergeRule()` is copy-on-write:  existing `Group`s are cloned, never mutated.
  - There is NO `removeRule`, but `parser.journal` can undo an `addRule()`:  see "Incremental parsing".
  - Generated rules are NAMED classes, `specialize()`d with plain-data statics, never closures.
    - The classes:  `QuotedPropertyRule` in `classes.ts`;
      `DynamicMethodRule`, `MethodPostfixRule` and `MethodInfixRule` in `methods.ts`.
    - Why:  so `SP.SpellDeclarations` can write a project's rules out as data, and another project can rebuild them.
    - Each base class says `@proto static importableAs = "<id>"`.
      That registers it for `P.Rule.importableRule(name)` (`Rule.protoDefined()`).
  - Each overrides `specialize()` to take a MINIMAL set, e.g. `{ output: "play_fizzbuzz", alias }`.
    - It works out `ruleName`, `methodName` etc itself.
    - That set is what `specializedWith` remembers.
    - Its `static declarationProps(declared, syntax)` says what of it, plus `syntax`, gets written out.
  - A quoted method's negatable word becomes its `Negatable` rule.
    - e.g. `is` => `{operator:is}`, matching `is not` / `isn't` too
    - `InfixOperatorSuffix.shouldNegateOutput()` asks `Negatable.isNegated(operator)`.
- Lookups record misses as `NONE` in `match.data`:  `scopeVar` / `scopeType` / `scopeConstant`.
  - `known_variable`, `known_type` and `known_constant` reject `NONE`.
- `getAST()` NEVER changes scope or looks it up.
  - ASTs are built lazily, e.g. at compile, when scope may have moved on.
  - What an AST needs from scope is looked up WHILE PARSING, into `match.data`:
    - `SpellIdentifier` / `variable` => `scopeVar`
    - `SpellConstant` => `scopeConstant`
    - `its_*` => `itVar`
    - `SpellType` => `scopeType`
  - A statement which declares something it also uses records it on that match, e.g. `property_value_either`.
- `await` makes its method `async`, because the method's body contains it (`ASTMethodDefinition.isAsync`).

## Projects

- On disk, by root (`serverPathForRoot()`, in [project-utils.ts](src/node/project-utils.ts)):
  - `<repo>/projects/system/<domain>/<Project>/`, for `@system:*` roots
  - `projects/user/<Project>/`, for `@user:projects`
  - `projects/test/<Project>/`, for `@test:fixtures`
  - from `environment.systemFilesRoot` / `userFilesRoot` / `testFilesRoot`,
    and each root's `folder` (default its `domain`)
  - A root with `devOnly` is listed in the app's UI in dev only.
- A root may have an `alias`, a short way to write its paths:
  - `@library/cards` ~== `@system:library:cards`
  - `@test/FizzBuzz/FizzBuzz.spell` ~== `@test:fixtures:FizzBuzz/FizzBuzz.spell`
  - `@examples/Solitaire` ~== `@system:examples:Solitaire`
  - `@guides/<Guide>` ~== `@system:guides:<Guide>`
  - `SpellLocation` expands it first (`SpellSetup.expandAlias()`), so ids are always stored in full.
- Two outputs are never a project's own files:
  - a project's `<Project>.compiled.js`, and a fixture's `<Project>.snapshot.js`
  - The server leaves them out of its index (`isManifestFile()`), which would otherwise add them to `project.json`.
- [`SpellProject`](src/SpellProject.ts):  files in `project.json` order, e.g. Card → Deck → Pile → Solitaire.
- `SpellProject` / `SpellFile` load over HTTP:  `$fetch()` on `/api/projects/...`.
  - They go through `LoadableFile.fetch`,
    which a node host swaps for [`diskFetch()`](src/node/disk-fetch.ts) to answer the same URLs from disk.
- Each project `parse()` / `compile()` builds a FRESH `ProjectScope`, with `parser.clone()`.
  - The clone has empty own rules, and imports the base spell parser.
  - Every file gets a `FileScope` under it, and SHARES that parser.
- So one file's types, constants and rules are visible to every later file.
- Another project can come in WITHOUT its sources, as its declarations (`SP.SpellDeclarations`).
  - They're in `<Project>.declarations.json`, beside its compiled output (epic `output-targets` P5).
  - Before that they were inline in the compiled JS, and `fromComments()` still reads those.
  - While compiling, `Block.getAST()` puts a `/*! SPELL: DECLARES {...} */` MARKER right on each declaring statement's code.
    - It goes below any docstring.
    - For a class member, it's indented in its class's body (`commentFor()`).
    - It's ONE flat JS object literal, 3-7 lines, merging the scope records it added (`declarationFor()`), e.g.
      `{ property: "suit", classVariable: "Suits", of: "Card", enumeration: [...] }`.
  - `SpellProject`'s "Combining output" `split()`s the markers back OUT.
    - The compiled JS is just code.
    - Each marker's object goes in the declarations, with `codeLines`:  the line (from 0) its statement's code starts on.
    - A file's own `compiled`, and the language server's, strip them (`stripComments()`).
    - `rule` is the `importableAs` of the class its rule was `specialize()`d from.
      - What that took sits beside it, e.g. `output`.
      - Loading passes the whole object to `specialize()`, which picks out its own.
      - Loading SKIPS `rule: "enumeration"`, which a compiler from before P6 of precedence-and-types
        wrote for each enumeration (`LEGACY_ENUMERATION_RULE`):  no version bump (plan doc D37).
    - An auto-declared property's marker (`auto: true`) sits on its declaration at its file's top, NOT on its `set`.
      See "Compile".
    - It leaves out what loading works out, e.g. an enumeration's constants, or a rule's owner (`of`, else `output`).
    - `defined: "/Card.spell:222-283"`:  where the statement is, as its character offsets, project-relative.
    - NO source line numbers.
      - A page with no sources matches the code to a scope pack's entry by what it declares,
        e.g. `property: "suit", of: "Card"` for `.../type:Card/property:suit`.
      - It finds the code by `codeLines`:  see `ScopesSource`, in [lsp's source](../lsp/src/).
    - `kind` + `name`:  what its rule's `getDeclaration()` says, for editors, e.g. `name: "draw (a card)"`.
      - Unless a key already says, e.g. `type`.
    - only what's known:
      - a method's `params` (`[{ name: "pile", datatype: "Pile" }]`) and `returns`
      - a list type's `itemType`
      - an owner member's `exclusive`
      - Loading rebuilds the `P.ScopeMethod` record.
        A key an older compiler didn't write loads as unknown.
    - a DERIVED property's `getter: true` (`the short rank of a card is: ...`)
      - It loads as `P.ScopeVariable.isGetter`, so the TypeScript writer reads an import's getter by TypeScript's name (J20).
      - An `exclusive` member is one too, unsaid.
  - The declarations also hold the project's versions, and what it `provides`.
  - `read(json)` reads them back, never running anything.
  - `importScope(root, imports)` => a `P.ImportScope` holding them.
    - The project's scope goes UNDER it, with a clone of its parser.
    - So imports are a base layer the `journal` never records.
    - Its records have no `declaredBy`.
      Editors read these instead:
      - `declaredAt` on its types, variables and constants (`P.DeclaredAt`:  full file path + offsets, from `defined`)
      - `declared` on its rules:  owner, what `getDeclaration()` said, and `declaredAt`
  - `imports` entries in `project.json` that name a project are `SpellProject.projectImports`.
    - e.g. `@library/cards` ~== `@system:library:cards`
    - Its "Loading" task reads each one's `<Project>.declarations.json` (`SpellProject.declarationsOf()`),
      and builds the `ImportScope` our scope goes under.
    - `source: true` instead parses that project's `.spell` files ahead of ours (`sourceImportFiles`).
  - `import: ["Card:Playingcard", "*"]` loads `Card` as `Playingcard` (`SpellDeclarations.picked()` / `renamed()`).
    - Every loaded record naming it says `Playingcard`:  `type`, `superType`, `of`, `datatype`.
    - Rules built from them follow, e.g. `playingcard suits`.
    - Compiled JS imports `Card as Playingcard`.
    - Its `TypeScope` keeps `runtimeName: "Card"`, and runtime type checks compile to that
      (`ASTTypeExpression.runtimeName`):  the class is still `Card` when the code runs.
    - Types only, and compiled imports only.
  - After parsing, a type the project declares AND imports is a `parseError` (`checkImportClashes()`).
    - `create_type` declares an imported type again, just so it's seen.
    - Rule names may repeat:  they merge.
- Compiled spell uses NO globals:  it `import`s what it didn't declare (`SpellProject.importHeader()`).
  - `import { spellCore, Thing, List, App } from "@spell/core"` (`SC.SPELL_CORE_MODULE`)
  - `import { Card, Deck } from "@spell/project/<projectId>"`, for each compiled import (`ImportScope.modules`)
  - types compile to `export class`, top-level functions to `export function`, top-level vars to `export let`
  - see "Classes" under Compile, for what goes in a class's body
  - NO import map:  every runner (the app, VS Code's, `<spell-app>`) runs compiled code from a `blob:` URL.
    - Its specifiers are rewritten (`runCompiled()` / `linkModule()`, in [the app's runner](../app/src/runner/)):
      - `@spell/core` => the runtime it runs on (`spellRuntime.ts`)
      - `@spell/project/<projectId>` => that project's compiled JS, fetched and linked the same way, afresh each run
    - The app, parser and forms NEVER load `spellCore` themselves.
- ALL files parse first, then ALL compile, so lazy compile-time lookups see the whole project.
- The editor calls `project.updateText(file, text)` on every keystroke
  (`onInputChanged`, in [the app's editor](../app/src/editor.ts)).
  - That calls `updatedContentsFor(file)`.
  - `project.incremental.update()` re-parses what changed right away, and hands changed files their new match.
  - If that couldn't cope, `updateText()` parses from scratch straight away.
  - After 2s:  it compiles, saves `<Project>.compiled.js` and runs it.
- A crash while parsing (a rule threw, NOT an error in the spell) is left in `project.parseError`.
- `SpellProject`'s parse task list keeps its scope + `incremental` while they're good (`needsFullParse`).
  - Else it starts over:  a new project scope, and `parseImports()` builds a new `IncrementalProject`.

## Incremental parsing

- [`P.IncrementalProject`](../parser/src/IncrementalProject.ts):  a project's spell files, in order,
  sharing ONE project scope + parser.
  - `update(path, text)` => the files whose match changed.
  - `SpellProject` owns it.
- `P.ParseJournal` (`parser.journal`):  every change parsing makes to shared state, undoable + redoable.
  - recorded by `ScopeList.add()` / `.replace()` (swap in a NEW items array) and `Parser.addRule()` (`#ownRules`)
  - `mark()` a point, `rewindTo(mark)` undoes everything after it, and `replay()` puts it back, marks included
  - only state existing AT the mark needs recording:  anything newer is re-parsed, or replayed back the same
- [`P.IncrementalParse`](../parser/src/IncrementalParse.ts), one per file:
  - It parses TOP-LEVEL items one by one (`parser.parseItem()`), with a journal mark before each.
    - An item match covers a line, or a header line + its indented body:
      a `line` match's `tokens` === `[LineToken, BlockToken]`.
  - `update(text)` diffs old vs new top-level items (source text + indent), then:
    - ONE item's indented body changed => `"body"`:
      - rewind to `parser.getBodyMark()`, which `commitStatement()` took just before the body parsed
      - `SpellParser.reparseBody()` => `BlockLine.reparseBody()`
      - then replay every later entry:  later items + files are kept
      - Kept tokens after it are moved (`Tokenizer.moveTokens()`).
      - Only if:
        - nothing in the old or new body `changesGlobalScope()`
        - the body's nested scope isn't the header's
        - its statement's `mutateScopeFromBody()` records the same as before (`data.fromBody`),
          e.g. the method still returns a `number`:  later lines may read it
    - anything else:  rewind to the item holding the first change, and re-parse from there.
      - Or to the one BEFORE it, if the change starts with an indented block that item may now take.
      - Once back in step with the unchanged items at the end, `canKeepFrom()`:
        - no `"global"` changes in the old or new region, AND the same file-variable names after it
          (each item records them) => `"region"`
          - replay everything after, later files too, and move its tokens
        - else => `"rewound"`:  re-parse the rest of the file
          - That took back every LATER file too:  `IncrementalProject` re-parses them with `parseAll()`.
  - `keepLastGood`:  opt-in, and `SpellProject` turns it on.
    - Each item that ISN'T broken records its journal entries as `lastGood`.
      - Broken (`parser.isBrokenItem()`):  didn't parse, or has parse errors.
    - Editing one item into a BROKEN state (same number of root tokens) undoes what it changed,
      and replays its `lastGood` instead.
      - So later lines still see e.g. the method it declared.
      - Its broken match stays, so its error shows.
    - `canKeepFrom()` then keeps everything after it:  same `lastGood` => same changes.
    - Deliberately NOT what a full parse gives.
    - NOTE: a header broken so badly it no longer takes its indented body changes size => not kept.
  - The file match is rebuilt with `parser.assembleFile()` => `Block.assembleBlock()`.
- `rule.getScopeChanges(match)`:  `changesScope`, if set (`@proto static`).
  - Else `undefined` (no `mutateScope()`), or `"global"` (has one:  assume the worst).
  - `get` says `"internal"`:  its `it` goes in its own `match.scope`.
  - A rule may say PER MATCH, reading only `match.data`.
    - `assignment` is `"internal"` (a variable),
      unless it auto-declared a property (`data.autoDeclared`):  then `"global"`.
    - So a plain `set x to 1` stays cheap.
- If an `update()` throws (a rule crashed committing a line), `IncrementalProject.isBroken`:
  the next update re-parses every file from scratch.
- Cost, Solitaire, against a full parse of ~110ms:
  - body edit:  ~10ms
  - comment, blank line or top-level statement, anywhere:  ~1-2ms
  - declaration edit near the END:  ~1ms
  - declaration edit near the START of the first file:  ~110ms (~= a full parse)
- [IncrementalProject.test.ts](../parser/src/IncrementalProject.test.ts) edits lines of every Solitaire file,
  on ONE project.
  - every line, with `INCREMENTAL_FULL=1`
  - After each edit, and after undoing it, it checks output, errors and token positions against a full parse.
- [ParseJournal.test.ts](../parser/src/ParseJournal.test.ts) checks a whole project's rewind / replay.

## Compile

- `Match.compile()` => `match.AST?.compile()`.
  - `Match.AST` is memoized;  `ASTNode.compile()` is not.
- The AST classes hold what was parsed;  a WRITER writes them out ([the writers](../parser/src/writers/)).
  - `ASTNode.compile()` is `P.JSWriter.instance.write(node)`.
  - `JSWriter` has one method per AST class, named for it:  `ASTIfStatement(node)`.
  - NEVER write output in an AST class.
- A block compiles as its statements joined with `\n`.
  - Nesting indents by re-joining with `\n` + 2 spaces (`P.jsText.INDENT`, NEVER a tab).
  - So a statement's output doesn't depend on its depth.
- A DECLARATION's docstring compiles as one `/** ... */`, in place of its `//` lines (`getDocComments()`, `Block.ts`).
  - The docstring:  the comment-only lines directly above it, else the comment on its own line.
  - It goes above the `SPELL: DECLARES` comment:  after any `/* SPELL: added rule ... */` notes the statement makes.
  - A `##` heading is part of it only if DIRECTLY above.
    One followed by a regular comment compiles as a `// ## heading` banner.
  - It's worked out from the block's lines when asked, never stored while parsing:
    an edited comment line re-parses on its own.
  - The language server shows the same docstring on hover and in completion.
- A heading at a FILE's top level also compiles to `spellCore.heading("set up all piles")`, just above its own lines.
  - It's a `P.ASTHeadingInvocation`.
  - Why:  as the program runs, the Thing Explorer knows which heading's code made each thing.
  - NOT in a plain block, e.g. a rule test's.
  - NOT for a heading with no text, e.g. `##########`.
- Classes compile as a hand-written class would:  each MEMBER in its class's body, wherever it was declared.
  - A member is a `P.ASTClassMember`.
    It knows its class (`typeName`), and compiles two ways:
    - in its class's body (`compileAsMember()`), e.g. `get title() {...}`, `draw() {...}`, `static Suits = [...]`
    - patched on from outside (`compile()`), e.g. `Card.prototype.play = function () {...}`
      - when its class isn't compiled with it:  it's from another project, or a rule test compiles the statement alone
  - A property is a getter / setter pair over the instance's reactive props (spell cells, `P.ASTReactiveProperty`).
    - `this.getProp('title')` / `this.setProp('title', value)`
    - NEVER a class field:  that would shadow the accessor, and nothing would redraw.
    - What it's checked against, and its default, go in the class's SCHEMA, declared once:
      - in the class:  `static { this.declareProp('title', { type: 'text' }) }`
      - from outside:  `Todo.declareProp(...)`
      - a default made per instance:  `{ init: () => new List() }`
      - The same runtime shape as a hand-written class's `@prop({ type: 'text' }) accessor title`.
      - Older output's `setProp(name, value, check)` still runs.
  - `Block.getAST()` makes each declaring line ONE `P.ASTStatementGroup`:
    docstring, `SPELL: DECLARES` comment, code.
    - Then `SP.hoistClassMembers()` moves each member into its class's body, if that's in the block.
    - Comments directly above a member go with it, e.g. a `## properties` banner.
      - They go past a heading's `spellCore.heading()` call, which stays put.
    - Everything else stays put too.
  - A project then does the same across ALL its files (`SpellProject.combineCompiled()`).
    - So `Card.move_to_$pile` from `Pile.spell` ends up in `Card.spell`'s class.
    - So does `compiledFixture()`.
    - It NEVER mutates an AST:  a class which gets members is a NEW `P.ASTClassDeclaration` (`withMembers()`).
  - An AUTO-declared property (see "Scope:  who changes it") compiles ONCE, in the file of the `set` that declared it:
    `Card.declareProp('pile', { type: 'Pile' })` + `Object.defineProperty(Card.prototype, ...)`.
    - at its top, or just after its type's declaration if that's in the same file
      (a class isn't defined above its own line)
    - under that `set`'s `SPELL: DECLARES` comment (`Block.autoDeclarations()`, `autoDeclarationAST()`)
    - a `P.ASTPatchedMember`, NOT a class member, so hoisting never moves it:  it can't change another file's output
    - Why not on the `set` line:  that may be in a method's body, whose AST is memoized.
      - An edit above it which only moves it would leave its `defined` offsets stale.
      - A file's AST is built afresh.

## Language server

- [lsp's source](../lsp/src/) (`LSP`) runs as `yarn start:lsp`, or from the VS Code extension in `packages/vscode/`.
  - The extension spawns the repo's own `tsx` on [the server's entry](../lsp/src/server.ts).
  - `stdioGuard.ts` sends `console.*` to stderr first:  stdout is the protocol.
- It hosts the SAME `SpellProject` / `SpellFile` the app uses, and takes everything from them:
  - `project.spellFiles`, `file.isActive`, `project.parseError`
  - edits go through `project.updateText()`, exactly as the app's editor does
  - All `SpellLanguageService` adds is `LSP.FileAddresses`:  the editor's URI for each file.
- It's used twice:
  - by VS Code, over stdio
  - IN-PROCESS, by the app's Monaco editor ([the app's Monaco folder](../app/src/ui/monaco/))
    - its `SpellModels` keep one Monaco model per file in step with `file.contents`
      (edits go through `updateText()`)
    - its `SpellLanguageFeatures` call the service, and convert its answers with `LspToMonaco`
  - The app shows one project at a time.
    `<spell-editor>`s on a page show one each, all in one Monaco:
    each `SpellModels.use()`s its project, so another's models don't replace them.
- `SpellDiskWorkspace` is the stdio server's:
  - it loads from disk, via `LoadableFile.fetch` (above)
  - it maps a `.spell` file to its project (the nearest `project.json`)
  - it parses the project on first sight, and reacts to disk changes
  - It's node-only, so it's NOT in the `$/lsp` barrel, which MUST stay browser-safe
    ([barrel.test.ts](../lsp/src/barrel.test.ts)).
- `SpellLanguageService` answers from each file's current `match`, never re-parsing:
  - diagnostics:  its parse errors, then its warnings (`SP.SpellWarnings.in()`) as `DiagnosticSeverity.Warning`
  - positions from match / token OFFSETS, never `token.line` / `ch`
  - symbols from `rule.getDeclaration()`, colours from `rule.highlightAs`
  - definition / references from the scope record a word resolved to while parsing (`data.scopeVar` etc),
    and that record's `declaredBy`
    - method calls from `ScopeRule.instances`
    - properties from their type's `variables` (`TypeScope.getMember()`), else by name
  - hover says what a variable holds, its `datatype`, e.g. `variable **card**: Card · argument`
    - a member by its words as written (`ScopeVariable.asWritten`), e.g. `property **short rank** of Card`
  - completion offers properties where a member's words can come, e.g. after `the `:  every visible type's, as written
    - the Type Explorer lists them so too:
      `ScopeEntry.name`, when it differs from the path's name (as compiled)
  - a built-in type's member:  its docs from `SP.BUILT_IN_TYPE_TABLE` (its record's `docstring`),
    in hover and completion (see "Built-in types")
    - hovering a built-in rule shows the member it spells
    - the Type Explorer's built-in types come from the table too (`ScopeExplorer.addBuiltIns()`)
- Formatting is `P.TokenFormatter` ([the tokenizer folder](../parser/src/tokenizer/)):
  whitespace only, from the tokens, indenting with TABS always.
  - No pretty-printer:  the AST is a javascript tree.
  - Indent LEVELS come from indent widths, not the tokenizer's blocks (which nest one per whitespace character).
  - It re-tokenizes its result, and gives up if anything but whitespace changed.
  - NOTE: a blank line takes the indent of the line AFTER it, unless it has its own.
    So dropping the tab on a blank line can move that blank line in the compiled javascript, never the code.
- Completion mid-statement is `expectedNext()`:
  the line up to the cursor, through `parser.expectedAfter()` (see "Rules and matching").
  - Each expectation offers:
    - the rest of a method call, as a snippet
    - the names that fit it:  by the `highlightAs` of the rules it can start with (`firstKinds()`), never rule names
    - its words
  - What only `continues` something complete, e.g. operators:  only when the word being typed starts it.
- A method's parameters come from its `P.ScopeMethod` record,
  never from parens in its name, which a paren-free signature hasn't got.
  - `SpellLanguageService.slotNames()`:  the receiver by its type, the rest by `params`
  - signature help's parameter ranges are where its `method_signature` found each argument (`data.argMatches`)
- Signature help is `signatureHelp()`, from the same parse.
  - It shows the INNERMOST call to one of the project's methods that anything was waiting in (next, or `within`).
  - Its arguments are its call rule's `{subrules}`.
  - The active one is counted from where it was waiting.
- Quick fix (`codeActions()`):  words that didn't parse get "Define `to <phrase>`".
  - The phrase:  a whole line, or a statement that parsed (an inline body's too) PLUS the words left over after it:
    `shuffle the deck 3 times`.
  - Its words become a signature:
    - each longest run that parses as an expression is a parameter
    - a type's name, paren-free:  `to shuffle a deck (number) times`
  - It's inserted above its top-level statement, as a method is only visible AFTER it.
  - Once defined, the longest match wins, so the line parses as the new method.
  - NOT for a phrase that's just unfinished (`expectedAfter()` again):  `set x to`.
- Code lens (`codeLens()`):  "N references" above each type and method.
  - Counted only when an editor resolves it (`resolveCodeLens()`):  counting walks the project.
  - Clicking runs `SHOW_REFERENCES`, which each EDITOR defines:
    - the VS Code extension:  `spell.showReferences`
    - the app:  Monaco's own `editor.action.showReferences`
- Semantic tokens come as DELTAS too (`semanticTokensDelta()`), from one kept `SemanticTokensBuilder` per file.
  - NOTE: a builder keeps what was pushed until `previousResult()` starts afresh.  `build()` doesn't.

## Testing a whole project

- [`parseSpellProject()`](src/test/parseSpellProject.ts), `loadExampleProject()` and `summarize()`
  parse + compile a project headlessly, exactly as `SpellProject` does.
  - `summarize()` is the "same as a full parse" reference.
- [SpellProject.test.ts](src/SpellProject.test.ts) snapshots Solitaire's compiled output + errors,
  and benchmarks with `BENCH=1`.
