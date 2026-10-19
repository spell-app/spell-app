# How parsing works

A compact map of the parse pipeline, so agents don't have to work it out again.
- MUST be kept up to date when any of these change (see [AGENTS.md](AGENTS.md)):
  - `Parser`, `SpellParser`, scopes
  - how a file becomes blocks, lines and statements:
    - `Block`
    - `BlockLine`
    - `SpellStatement`
- File references (`path:line`) are as of 2026-09-27:  trust the code if they drift.

## Text => tokens

- [`Parser.parse(input, ruleName, scope)`](../parser/src/Parser.ts) tokenizes,
  then calls `scope.getRuleOrDie(ruleName).parse()`.
- [`SpellParser.tokenize()`](src/SpellParser.ts) calls `Tokenizer.tokenize()`.
  - For the `"block"` rule, it then calls [`breakIntoIndentedBlocks()`](../parser/src/tokenizer/Tokenizer.ts).
  - The result is ONE root `BlockToken`:  its lines (`LineToken`s), and nested blocks of the same kind.
  - indent ~== count of leading whitespace chars (tab === space === 1)
  - each extra level pushes a `BlockToken`
  - a blank line takes the indent of the NEXT non-blank line, so it doesn't break a nested block (lookahead)
  - a comment is a single `CommentToken`, to the end of the line:
    - `//` or `--`
    - or a heading's run of `#`s:  a markdown-style level (see `Block.getDocComments()`)
- Some tokens span lines.
  Each is ONE token inside ONE `LineToken`:
  - a JSX element, e.g. a whole `return <div>...</div>` body
  - a string with `\n`
  - JSX `{...}` contents are re-tokenized later, from a collapsed copy.
- Every token has an absolute `start`.
  - From it, `Tokenizer.setPositions()` works out each token's line and character, tokens nested in JSX included.
    - They're its `line` / `ch`.
    - It does so through `getLineStarts()` + `positionForOffset()`,
      in [tokenizer.types.ts](../parser/src/tokenizer/tokenizer.types.ts).
  - NOTE: `LineToken` and `BlockToken` copy their line from their first token.
  - JSX `{...}` contents are parsed later, from a trimmed, newline-collapsed copy of the same length.
    - So the JSX rules shift those tokens to their file positions:
      [`SpellJSXContent.placeInFile()`](src/rules/JSX/SpellJSXContent.ts).
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
- [`Choice.parse()`](../parser/src/rules/Choice.ts) parses EVERY alternative,
  then picks one with `getBestMatch()`:
  - highest `priority`, then longest match, then EARLIEST rule
  - `priority` answers ONLY "several rules match the SAME words:  which wins?" (`Rule.priority`, default 0)
  - how tightly an operator binds is spell's `precedence` (see "Expressions")
- [`Sequence.parse()`](../parser/src/rules/Sequence.ts) first runs `Sequence.test()`:
  - fixed words, symbols and patterns are checked where they must fall;  subrules are skipped
    - except a ZERO-WIDTH rule's (`Rule.zeroWidth`), which takes no tokens:  the test stays where it is,
      if the rule's own `test()` says it could match here at all
    - e.g. spell's `subject_implied`, the subject an outline line leaves out (see "Outline bodies")
    - a subrule naming one knows it as it's made (`Subrule.zeroWidthRule`), from `P.Subrule.zeroWidthRules`:
      so the zero-width rule is registered BEFORE any syntax naming it, or `Parser.addRule()` throws
    - a sequence STARTING with one asks it first (`Sequence.leadingZeroWidth`), and fails at once if it can't match
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
  - Rulex sets it from how the syntax is spaced (see [the Rulex guide](../../../spell-app.epics/guides/rulex/rulex.html)):
    - parts written touching must touch (`isn't`, `\[{x}\]`);  spaced ones may space
    - `{space}` / `{spaces}` set the next part's
    - a symbol touching its flag repeats as a run (`#+`)
- Cost, warm:
  - Measured by a `BENCH=1` run of [the project tests](../../tests/spell/src/SpellProject.test.ts), 2026-10-04,
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
  - A module's parser (`new SpellParser({ module })`) holds its rules.
  - [The rules' index](src/rules/index.ts) combines them all into `spellParser`.
  - How a module's files are laid out:  "Parser rules" in [AGENTS.md](AGENTS.md).
- A module is a FOLDER, one rule class per file (epic `output-targets` P18), e.g. [events/](src/rules/events/).
  - A rule registers itself as its file loads:  `events.addRule(Trigger, { syntax, tests })`.
  - So the order of the folder's `index.ts` is the order rules are registered:  the TIE-BREAK order.
    - When a `Choice` ties on `priority` and length, the EARLIEST registered rule wins.
      See `getBestMatch()`.
- A rule's NAME is snake_case, and it's what everything else calls it:
  - `syntax`:  `{list_add_relative}`
  - `parser.rules`, declarations and errors
  - It's worked out from its PascalCase class, by `P.Rule.ruleNameFor()` (called by `Rule.instantiate()`):
    - `ListAddRelative` => `list_add_relative`
    - `If` => `if`
  - A class whose name doesn't give its rule name sets `static ruleName`.
    - e.g. `BlockLine` => `line`
  - [ruleNames.test.ts](../../tests/spell/src/rules/ruleNames.test.ts) pins every rule's name, module and order.
- A rule's tests, `{ input, js, ts }`, parse the input once and write it with the javascript and TypeScript writers:
  - `js`:  what `P.JSWriter` writes
  - `ts`:  what `P.TSWriter` writes, left out where it's the same
  - The Python writers are tested by their own tests, and by the fixtures' snapshots ("Testing a whole project").
  - [`unitTestModuleRules()`](../parser/src/test/unitTestModuleRules.ts) runs them.
  - `yarn test:rules:bless` writes each test's `js` and `ts` into the source.
  - `Parser.testRules()`, which the speed test times, checks `js` only.

## Expressions

- `expression` is ONE rule, [`CompoundExpression`](src/rules/expressions/CompoundExpression.ts).
  - Its syntax:  `{lhs:operand} {rhsChain:expression_suffix}*`
  - It reads an `operand`, then each suffix binding tighter than its `bound` (0:  all).
  - no suffix:  the operand's own match, as is, so `match.is(KnownVariable)` still works
- An `operand` is what an operator acts on:  one expression with no operator at its TOP.
  - e.g. `5`, `the deck`, `(x + 1)`
  - e.g. `the first card of the deck` (it nests), `the cards in the deck where ...`
  - Every rule aliased `expression`, but `CompoundExpression`, is registered as an operand instead.
    That's `SpellParser.getNamesForRule()`.
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
- `precedence` (how tightly an operator binds) is set on suffix rules ONLY.
  - They're `InfixOperatorSuffix` and `PostfixOperatorSuffix`.
  - It comes from the `Precedence` table:  `*` before `+` before `is` before `and` before `or`.
  - The constructor throws without one:  a silent default is how `ends with` went wrong.
  - It's read ONLY by the loop:
    - the loop stops at its `bound`
    - `getAST()`'s shunting-yard groups the flat chain by it
    - a postfix pops like an infix, so `x + y is empty` => `isEmpty(x + y)`
  - It's NOT `priority`, which only breaks a `Choice`'s tie (see "Rules and matching").
    - e.g. a user's quoted alias (`Priority.userDeclared`) beats a built-in suffix matching the same words
- A statement and an operand:  a rule aliased both `statement` and `expression`.
  - It says `@proto static operandInExpressions = true` (on `SpellStatement`).
  - `SpellParser.addRule()` registers it TWICE (`addStatementAndOperand()`):
    - as the statement, its syntax as is
    - as an `operand`:  a twin whose LAST expression slot is `{x:operand}` instead
      - Its `statementRule` points back.
  - Method calls and `wait for` do:
    - the statement `notify x + y` => `notify(x + y)`
    - `if double x is 4` => `double(x) == 4`
    - the statement `wait for x is 1` => `await (x == 1)`
    - `if wait for x is 1` => `await x == 1`
  - `scope.addRule()` records only the statement rule, so a project's declarations write ONE rule.
    Loading it registers both again.
  - Editors map a twin back with `SpellStatement.statementRuleOf()`.
- Give-back (`Sequence`, see "Rules and matching") lets a full `{x:expression}` slot before a word work:
  - `remove {thisArg:expression} of {callArgs:expression}`, on `remove the card of the pile`
- Expecting mode:  out of tokens after the operand or a suffix,
  the loop records `expression_suffix` as only CONTINUING it.
  - `expression` used to be a Choice, which worked this out.
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
  - The vocabulary is spell's, [`SP.TYPE_WORDS`](src/builtinTypes.ts), handed to the parser's `P.typeName()`.
    - The parser knows only each datatype's own name, so a translation brings its own words.
- `match.datatype` memoizes `rule.getDatatype(match)`.
  - Its default is the rule's `@proto static datatype`.
- About a dozen rules override it, reading ONLY `match.data` and child matches' datatypes:
  - a variable, `SpellIdentifier`:  the datatype of its `scopeVar`
  - a member read (see "Members"):  the member it read (`data.member`)
    - e.g. `the X of Y`, `its X`
    - a built-in's comes from its table entry, e.g. `the length of the name` is a `number`
    - an enumeration's values:  `list`
  - `DynamicMethodRule`:  what its method returns, as the parser infers it (see "Return types" below)
    - read from its record:  `data.method.returns`
  - `new_thing` / `create_thing` / `new_list`:  the type made
  - list rules:  the item type (`data.itemType`), the list's type, or `number`
  - `CompoundExpression`:  `getAST()`'s shunting-yard again, over datatypes
    - each suffix's `getResultDatatype(match, lhs, rhs)`, by default its `datatype`:
    - `choice` for every suffix but the ones below
    - `+ - * /`:  `number`
    - `+` of text:  `text`
    - `as upper case`:  `text`
    - `as a <type>`, `X if C otherwise Y`
  - `parenthesized_expression`:  what's inside
- A rule needing a LOOKUP for it does it in `parse()`, into `match.data`:
  - what it looks up:  a member of a type, a list type's item type, a method's record
  - how:  `scope.getType(datatype)`, `scope.getItemType(datatype)`, `TypeScope.getMember(words)`
  - never in `getDatatype()`, which may run later
- Sinks:  where a datatype is kept, so later lines know it.
  - a new variable:  the value's datatype, on its `ScopeVariable`
    - from `set`, `X is Y` or `get` (and its `it`)
  - method arguments:  `(a card)` / `(x as text)`
  - `this` / `it` in a method or getter:  its owner type (`MethodScope.itDatatype`)
  - a loop's item and `it`, and a `where`'s:  the list's item type
  - `on ... with a card`'s `card`
  - `a deck is a list of cards`:  `Card`
    - kept as the deck type's `itemType`, on its `TypeScope`
- First datatype wins:  a record's datatype is set when it's declared, never widened.
  - The one exception:  a getter's property, and a method's `returns`, are set once the BODY has parsed.
    See "Return types".
- Return types are set once a statement's body has parsed, inline or nested.
  - `commitStatement()` then runs `rule.mutateScopeFromBody()`.
  - `MethodDefinition` sets its record's `returns`.
  - `property_value_getter` sets its property's `datatype`, if it declared it and nothing gave it one.
  - Each is journaled (`P.ParseJournal.assign()`), from `SpellStatement.getReturnedDatatype()`:
    - an inline EXPRESSION body (`the value of a card is its rank`):  that expression's datatype
    - else every `return` in the body, inside `if`s too
      - each `ReturnStatement`'s `getReturnValue()`
      - but NOT in a body with a `MethodScope` of its own, e.g. a loop's:  that compiles to a callback
      - all the same:  that;  none, or a mix:  unknown
      - a bare `return` is `nothing`
  - A call's datatype reads it lazily:  `data.method.returns`.
    - A recursive call, parsed before its body ends, is unknown.
- Typed calls:  a call rule is `specialize()`d with its method's types.
  - `DynamicMethodRule`, `MethodInfixRule`
  - The types are its record's owner (`of`) and `params`.
  - It keeps them as statics:  `thisType`, `paramTypes`.
  - Its `parse()` rejects a match whose argument's datatype is KNOWN and can't be the parameter's.
    - That's `scope.couldBeA()`:  neither is the other or a sub-type of it, no stubs.
    - Unknown always fits.
    - `put the chip on the pot` finds Chip's `put`.
    - `add the card to the deck` falls past a user's `to add a card to a pile`,
      to the built-in `core.append(deck, card)`.
  - `MethodInfixRule` checks only its right side:  a suffix can't see its left while parsing.
  - A `MethodPostfixRule` checks nothing.
  - Declarations need nothing new:  `of` / `params` are the method record's, in the same comment.
    Loading hands `specialize()` the whole of it.
- Probe ledger ([grammar.probes.test.ts](../../tests/spell/src/grammar.probes.test.ts)), "datatypes":
  what a set of expressions and sinks are.

## Adding an expression rule

- An OPERAND stands alone:  a literal, `the X of Y`, `the first card of ...`.
  - It `extends SpellExpression`:  aliased `expression`, so it's registered as an operand.
  - A slot at its END takes `{name:operand}`:  `the first card of {list:operand}` stops before any operator.
  - Math that should take a sum (`the absolute value of x + 1`):  `{name:arithmetic_expression}`.
  - A slot closed by a required word (`of`, `in`, `to`) stays `{name:expression}`, like a paren.
- An OPERATOR follows an expression.
  - `x OP y`:  it `extends InfixOperatorSuffix`
  - `x is empty`:  it `extends PostfixOperatorSuffix`
  - Its right side is `{expression:operand}`.
  - It MUST set `@proto static precedence` from `Precedence`:  the constructor throws without it.
  - Build its output in `compileASTExpression()`.
  - Not a test?  Set its `datatype`, or override `getResultDatatype()`.
    - The default is `choice`.
- `priority` only settles a tie between rules matching the SAME words.
  - Leave it unset unless a probe shows a tie going wrong.
  - Then set it from the `Priority` table ([rules.types.ts](src/rules/rules.types.ts)), with a one-line why.
- Always NAME a slot, so `match.groups` keeps its key.
- Add one mixed-operator line to the probe ledger, [grammar.probes.test.ts](../../tests/spell/src/grammar.probes.test.ts).

## Type names:  `a bank account aka account is a thing`

- A type's name may be one word or several, and it may have a short name.
  - one word:  `card`, `bank-account`
  - several:  `bank account`
  - `a bank account aka account is a thing`:  ONE type, compiled `Bank_Account`, as `bank-account` would be.
  - Afterwards `bank account(s)` and `account(s)` both name it.
- A DECLARATION's name is [`type_words`](src/rules/types/TypeWords.ts):  every word up to a blacklisted one or `aka`.
  - Its rules:  `create_type` and `create_list_type`.
    Their syntax:  `(a|an) {type:type_words} (aka {aka:singular_type})? is ...`
  - Both declare through `TypeDeclaration.declareType()`.
  - Both refuse a name another type already goes by (`refuseTakenNames()`).
    - e.g. `an account is a thing`, after the line above
- A MENTION is any [`SpellType`](src/rules/types/SpellType.ts) rule, and it takes:
  - first the LONGEST run of 2 to `MAX_NAME_WORDS` words that names a type in scope, joined with dashes to look up
  - else one word, as ever
  - So only DECLARED names take several words:  `a big card` stays a card, unless someone declared a `big card`.
  - A type has to be declared before a mention of several words can find it:  no stubs for those.
  - Those rules:  `type`, `known_type`, `singular_type` ...
- Spell's own two-word types are built in (epic `drawable-thing`, P2):
  - `drawable thing`
  - `drawable list`
  - Their datatypes are `drawable` and `drawable list`.
    `SP.TYPE_WORDS` maps the ways to write them.
  - Their classes are ONE word each, not Type_Case:  `Drawable` and `DrawableList`.
    - They're listed in `P.BUILT_IN_CLASS_NAMES`.
    - `P.classCase()` names every class, and keys `scope.types`.
  - `a pile is a drawable list of cards` is `create_drawable_list_type`.
    It's `create_list_type`, extending `DrawableList`.
- The short name is `TypeScope.aka`.
  - `scope.types` finds a type by it too (the list's `aliasProp`), after every type's own name in that scope.
  - A mention by the short name compiles as the type's own name:  `account` => `Bank_Account`.
  - Project declarations carry it (`aka`), so an importing project knows the short name too.

## Members:  `the short rank of the card`

- A member's NAME is [`member_words`](src/rules/properties/MemberWords.ts):  1..N words, up to the first structural one.
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
- Reads come two ways (epic page D5), worked out in `parse()`:
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
    - `its_property`:  the loose word, at `Priority.normal`
      - so `its last card` stays `its_ordinal`'s
- A type's class members:  ONE static rule, [`class_member`](src/rules/classes/ClassMember.ts).
  - its syntax:  `{type:known_type} {member:member_words}`
  - it takes the longest run that's a class variable of the type, e.g. `card suits includes x` => `Card.Suits`
  - it was a rule per enumeration (`EnumerationRule`)
  - `the number of card suits` counts:  `list_count` takes any operand whose datatype is a list

## Built-in types:  `the length of the name`

- `SP.BUILT_IN_TYPE_TABLE` ([builtinTypes.ts](src/builtinTypes.ts)) is DATA:
  one entry per built-in type with anything to say.
  - the types:  `thing`, `list`, `app`, `text`, `date`
  - each entry:
    - its docs
    - `itemType`, e.g. `text` holds `character`s
    - `members`, each a `SP.BuiltInMember`
  - not a `.spell` file, not statics on runtime classes (epic page D25)
  - A type's NAME and super-type stay those of `P.BUILT_IN_TYPES`:  the parser's vocabulary.
    The entry's `superType` must agree (a test checks).
- `SpellParser.rootScope` loads it into the root's type scopes (`loadBuiltInTypes()`):
  - each `itemType`
  - each member with a `readAs` template, as a `P.ScopeVariable`
    - It holds `readAs` and `docstring`.
  - So member reads resolve it like any declared property (see "Members"), up the super-type chain:
    a `Deck` finds `List`'s `length`.
- `readAs` is how a read compiles;  `{it}` in it is what it's read from.
  - It's ONE of three forms (`parseReadAsTemplate()`):
    - `{it}.length`
    - `{it}.getFullYear()`
    - `core.itemCountOf({it})`
  - `MemberReadExpression.getMemberAST()` builds it.
  - So the same words compile per type:
    - `the length of the name` => `name.length`
    - `the length of the deck` => `core.itemCountOf(deck)`
  - Its datatype is the member's.
  - An unknown type still reads loose:  `x.length`.
- A `stored` member is a property the runtime class KEEPS, e.g. `id`, on `thing` and `list`.
  - Loaded into scope with no template, so it reads and sets like a declared property:
    - `the id of the person` => `person.id`
    - a set is allowed, unlike a `readAs` member's:  `set the id of the person to "owen"` => `person.id = "owen"`
  - No type may declare its own, e.g. `a person has an id as text` is refused.
    - That's `SpellStatement.refuseBuiltInType()`, through `SP.isBuiltInStoredMember()`.
  - See "Ids and saving" below.
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
  - `core`'s [`core.scopes.js`](../core/src/core.scopes.js) is the same, for pages with no parser.
    - It's GENERATED from the table:  `yarn scopes --builtins` in `packages/lsp`.
    - A test fails until you do.
- Adding a member:  ONE table entry, plus the `core` method or javascript property its `readAs` names.
  - [builtinTypes.test.ts](../../tests/spell/src/builtinTypes.test.ts) reads each one off a sample value, so it must be real.
  - Then `yarn scopes --builtins`.
- Adding a TYPE:  its name in `P.BUILT_IN_TYPES` first, then its entry.

## Membership:  `a card belongs to one pile`

- [`belongs_to_one`](src/rules/classes/BelongsToOne.ts):  `a card belongs to one pile`.
  - A card is in at most ONE list of the pile FAMILY at a time.
  - The family:  `Pile` and its sub-types (`a tableau is a pile`).
  - `a deck is a list of cards` is outside it (epic page D7):  a card can be in the deck AND one pile.
  - The list types stay plain:  `a pile is a list of cards`.
  - `can_belong_to_many`, `a card can belong to many piles`, is the opposite.
    That's what lists do anyway, so it does nothing.
- Both types MUST be declared ABOVE it:  it compiles to code which needs both classes.
  - `parse()` refuses a stub, saying what to write.
  - So the live examples say it in `Pile.spell`, just under `a pile is a list of cards`.
  - Refused too:  a list type of spell's own (`one list`), or a type that isn't a list.
- Scope:  the item type gains a read-only member naming the list type (`TypeScope.declareOwnerMember()`).
  - e.g. `pile` on `Card`:
    - its `datatype`:  `Pile`
    - `exclusive: true`
    - its `declaredBy`:  the membership line
  - So `the pile of the card` / `its pile` resolve as any member does (see "Members"),
    and go-to-definition lands on that line.
  - It REPLACES a `pile` another statement declared, e.g. auto-declared by an earlier `set`.
  - NOT for a built-in item type (`a thing belongs to one bag`):  the root scope is shared.
  - Nothing goes on the list type's `TypeScope`:  the member is the whole record.
- `set the pile of the card to ...` is refused (`AssignmentStatement.parse()`):  move the card instead.
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

## Ids and saving:  `a person is saved in its own file`

Every thing and list has an `id`, built in, and is saved INSIDE what holds it (epic `people-and-orgs`, decision Q42):
written whole the first time, a reference after.
A kind that says so is saved in a file of its own.
- The `id` is a `stored` built-in member (see "Built-in types"):
  - nobody declares it, and declaring one is refused
  - the runtime makes one up on first read, e.g. `person-k3x9q2mf`, unless it was set first
- A list says what it holds, so saving knows before it holds anything:
  - `a person has dates as a new list of dated-events`
  - or in its outline body, `- its "dates" is a list of dated-events` ([`outline_specifier_list`](src/rules/classes/OutlineSpecifierList.ts))
  - both compile to `this.declareProp("dates", { itemType: "DatedEvent", init: () => new List(...) })`
- [`saved_in_file`](src/rules/classes/SavedInFile.ts):  a person gets a file (an entry) of their own.
  - e.g. `a person is saved in its own file`, or `- it is saved in its own file` in its outline body
  - What holds one saves a reference to it.
  - It compiles to `Person.savedInFile = true`, after the class:  `Thing` says `false`.
  - Refused for a built-in type.
- [`saved_inline`](src/rules/classes/SavedInline.ts):  says the default, e.g. `a dated-event is saved inline`.
  - It compiles to `DatedEvent.savedInline = true`, which changes nothing.
- Versions (P6):  the core reads them as it loads an older file ([core's AGENTS.md](../core/AGENTS.md)).
  - [`version_step`](src/rules/classes/VersionStep.ts):  a rename or a drop
    - e.g. `a person version 2 renames name to names`
    - e.g. `a person version 3 drops nickname`
  - [`upgrade_method`](src/rules/classes/UpgradeMethod.ts):  anything else, e.g. `to upgrade (a person) to version 4: ...`
- Nothing goes in scope:  the class says it when the code runs.

## One thing by name or place:  `tableau T1`, `the first tableau`

- Two expression rules name ONE of the program's things (epic `drawable-thing` P19), in [classes/](src/rules/classes/):
  - [`named_thing`](src/rules/classes/NamedThing.ts), by its name:
    - e.g. `tableau T1`, `foundation "clubs"`
    - compiles to `core.thingNamed(Tableau, "T1")`
    - the name:  one word starting with a capital (`thing_name`), or text in quotes
    - a sub-type's thing too:  `pile T1` finds a tableau
  - [`thing_at_place`](src/rules/classes/ThingAtPlace.ts), by its place, in the order the program made them:
    - e.g. `the first tableau`, `the last tableau`
    - compiles to `core.thingAtPlace(Tableau, 1)`
  - Both are core's thing references, `Tableau#T1` and `Tableau#1`:  [references.ts](../core/src/references.ts).
  - The writers read off either with `?.`:  the program may not have made it (`ProgramWriter.ITEM_READS`).
- `named_thing` has its own quick `test()`:  a name near its start.
  - Near:  within `SpellType.MAX_NAME_WORDS` words.
  - Without it, `{type}` is a subrule, so the plain test would pass any line with text in quotes on it.
- It warns when two things are given the name it reads, in so many words:
  `set a to a new tableau with name = "T1"` twice.
  - `assignment` and `get` count each such name, as they change scope.
    - The code:  `NewThing.noteNameGiven()`, called from their `mutateScope()`.
    - Kept per type and each super-type the project declares, journaled.
    - A name worked out as the program runs, `"T" + the number`, isn't counted.
  - The warning is noted with `SpellWarnings.noteIf()`:  asked again once the whole project has parsed,
    so a reference written above the things it names warns too.

## Guards:  `a tableau can take a card if: ...`

- [`list_guard`](src/rules/classes/ListGuard.ts):
  what a list type takes, or gives up, when something MOVES (epic page Q23 - Q25).
  - `a tableau can (add|take) a card if: ...`
  - `a stock-pile can (release|remove|give up|let go of) a card if: ...`
  - `a foundation can never (release|remove|give up|let go of) a card`:  always no
  - Its body answers yes or no, inline or indented.
  - In the body:
    - `the card` is the card
    - `it`, `its` and `the tableau` are the list
- It compiles to a method of the list's class, overriding `List`'s yes.
  - `canTake(card) {...}` or `canGiveUp(card) {...}`
  - It's hoisted into the class like any member.
  - A sub-type inherits it.
  - No scope record and no declaration:  it's the class's own method, which an importer gets with it.
- [`list_move`](src/rules/lists/ListMove.ts):  moves a thing from one list to another.
  - e.g. `move the card to the tableau` => `core.move(card, tableau)`
  - It's a statement, or a yes / no (`operandInExpressions`):  `if move the card to the tableau then ...`.
  - It asks the list of the card's family holding it to give it up, then the target to take it.
  - Refused:  nothing changes.
  - A card that belongs to no family:  only the target is asked.
  - `Priority.overridable`:  a project's own `to move (a card) to (a pile)` wins, e.g. the frozen Solitaire's.
- Only `move` asks.
  - The other list statements never do:  they're for dealing, gathering cards back, shuffling.
  - They're `add`, `remove` and `empty`.
- Asking without moving:  two `Negatable` suffixes, `can_take` and `can_give_up`.
  - `the tableau can take the card` => `core.canTake(tableau, card)`
  - `cannot give up` negates
- Probe ledger:  `probeMembership()`, probes `X1` ... `X9`.
  - It uses the frozen `Card` and `Deck`.
    Its `Pile.spell` is the probe's own.
  - Compiled and RUN:  [membership.test.ts](../../tests/spell/src/parserTests/membership.test.ts).

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
  - A body keyword ending a rule's syntax, or a choice of them, is taken OUT of `rules` at construction.
    It goes into `rule.bodySpec`.
    - the keywords:  `{statement_body}`, `{expression_body}`, etc (see `BODY_KEYWORDS`)
    - A body is parsed in `match.nestedScope`, which needs the statement's match to exist first.
  - A `leadIn` keyword, `{with_nested_statements}`, is ALSO a registered rule.
    It matches words on the line, e.g. `where:`.
    - It stays in `rules`.
    - The statement takes a nested body only when it matched (`takesNestedBody()`).
  - Inline body:  after its sequence matches, `parse()` parses the rest of the line in `nestedScope`.
    - It does NOT change scope:  this runs for every candidate, winners AND losers.
  - The inline statement OR nested block is recorded as `match.data.body`.
    - Read it with `rule.getBody(match)`, NEVER by group name.
  - Anything that parses a `"statement"` on its own, and keeps it, MUST commit it:
    - with [`commitStatement()`](src/rules/Statement.ts), e.g. JSX's `on...` handlers
    - or generically with `parser.commit(match)`, e.g. rule unit tests
      - `unitTestModuleRules`, `Parser.testRules()`
  - `parseNestedBlock()` parses a `{nested_statements}` as a block.
    - in `statement.nestedScope`
    - It sets `data.enclose`.
    - A `{nested_expression}` (e.g. `return`) accepts a single-line block only.
  - `nestedScope` comes from `rule.getNestedScopeForMatch()`:
    - default:  the same scope
    - `if` / `else` => a new `BlockScope`
    - methods, events, property getters, list loops => a new `MethodScope`
- Errors are never thrown.
  - `parse_error` matches roll up into `match.data.errors`, on line and block matches.
    See `Block.getParseErrors()`.
  - They compile to `/* PARSE ERROR: ... */`.
- Refused statements:  a `parse()` which understood a statement, but mustn't take it.
  - It returns `SpellStatement.refuse(match, message)`.
  - NOT `undefined`, which would say only "Don't understand ...".
  - It's a `parse_error` match over its tokens, with `message`.
    `BlockLine` reports it.
  - It competes with the REFUSING rule's priority (`P.Match.priority`),
    so a plainer rule matching the same words can't take the line instead.
    - Refuse only what the rule matched to the line's end, or it beats a longer match.
  - Used by the property declarations (`SpellStatement.refuseBuiltInType()`) and `AssignmentStatement`:
    see "Built-in types".
  - Errors inside JSX `{...}` live in the JSX rules' `match.data`, not `matched`.
    - `BlockLine` gathers them from anywhere in its statement into `data.errors` too.
      That's `SpellJSX.parseErrorsIn()`.
    - They're reported, but compiled in place.
- Warnings:  what a program should say, but which doesn't stop it, e.g. a type (epic `output-targets`, Q24).
  - `a calculator has an input` => `Say what "input" is, e.g. "a calculator has an input as text"`
  - A rule notes one on its OWN match while parsing:  `SP.SpellWarnings.note(match, message, at?)`.
    - In `parse()`, or in `mutateScope()` for what only it knows.
      - e.g. `assignment`'s:  a new variable's `[]`, or a property a set declared
  - They're NOT rolled up like errors.
    - `SP.SpellWarnings.in(file.match)` walks the file's matches as they are now.
      - `matched`, and matches in `data`
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
      or a property a set declares from a value that doesn't say (`assignment`)
    - a LOOSE member read its type never declares (Q45)
      - its rules:  `property_expression`, `its_property`
      - e.g. `the name of the pile` => `A pile never says it has a name:  declare it, e.g. "a pile has a name as text"`
      - Only on a type the project declares, all of whose super-types are its own or spell's:
        an imported type's importer may give it anything (`MemberReadExpression.warnIfUndeclared()`, `noteIf()`).
  - Editors show them as `DiagnosticSeverity.Warning` (`SpellLanguageService.diagnostics()`).
  - `spell compile` lists them after its errors, never counting them:  see "Language server".

## Outline bodies:  `a card is a thing where:`

- The OUTLINE style (epic `outline-spell`):  a type's heading, then indented lines all about that type.
  In them, `it` / `its` mean that type, e.g.

  ```spell
  a card is a thing where:
  	- it has a name as text
  	- its "suit" is one of clubs, diamonds, hearts or spades
  	- it "is a (suit)" for its suits
  	- its "color" is red if its suit is either diamonds or hearts otherwise it is black
  	- it belongs to a pile
  ```

  - It compiles EXACTLY as the same lines in the sentence style do (`a card has a name as text` ...).
  - [outline.test.ts](../../tests/spell/src/parserTests/outline.test.ts) pins it.
- `create_type` / `create_list_type` share [`TypeDeclaration`](src/rules/classes/TypeDeclaration.ts).
  - A syntax ending `{with_nested_statements}?` takes the body.
    - That's `where:`, `with:`, `:`, or `where` alone.
    - Or nothing at all (P10):  the indented block under a type's heading is its body anyway
      (`TypeDeclaration.takesNestedBody()`), e.g. `a stock-pile is a pile`, then `- can give up a card if: ...`.
  - With nothing indented under it, the same syntax declares the type alone.
- Re-opening a type (P11):  [`reopen_type`](src/rules/classes/ReopenType.ts), `a game:` + a body, adds to a type
  declared elsewhere, in the same file or a later one.
  - A `TypeDeclaration` with no class of its own:  its body's lines compile beside it, as the sentence style's would.
  - The colon stays required (`where:`, `with:`, `:`, or `where`);  a type nobody declares is refused, saying how.
  - A type declared a SECOND time is refused, naming the first and saying to write `a game:` (issue I13):
    `TypeDeclaration.refuseTakenNames()`.
  - The body's scope is a [`P.SubjectScope`](../parser/src/scope/SubjectScope.ts):
    - it owns nothing, so what its lines declare lands where the same lines at the top level would
    - `subject` names the type
  - `flatBody` (`SpellStatement`):  the body is NOT `enclose`d.
    - `Block.getAST()` splices its statements in after the type's.
    - So `SP.hoistClassMembers()` moves its members into the class as usual.
- `subject_it` / `subject_its`:  `it` / `its` as a line's SUBJECT.
  - Their class:  `SubjectRule`, in `types/`.
  - Each is a `SpellType` match for the type:
    - `value`:  its name
    - `raw`:  its instance name
    - `data.scopeType`
  - Only directly in a `SubjectScope`.
    Inside a getter or method in the body, `it` is the instance, as anywhere.
  - Each member rule gets a second syntax, with `{type:subject_it}` where it says `(a|an) {type}`:
    - `define_property_has`, `property_value_getter`, `belongs_to_one`
    - `quoted_type_expression`, `quoted_property_formula`
    - `its_quoted_property` (a `type_property` for `property_value_either`)
    - `saved_inline`, `saved_in_file`, and `list_guard`'s three (`- it can take a card if: ...`)
- `subject_implied`:  the subject LEFT OUT (P8), e.g. `- has a name as text`, `- "suit" is a suit`.
  - A `SubjectRule` taking NO tokens:  `zeroWidth` (see "Rules and matching").
    Its match is the same as `it`'s, so the rule using it can't tell the difference.
  - Each `{type:subject_it}` / `{type:subject_its}` syntax above has a twin with `{type:subject_implied}`:
    - where the line then starts with a quoted name, or a verb (`has`, `belongs`, `is saved`, `can`)
    - or a BARE name (P9):  `- rank is a number`, `- short name is: ...`, `- color is red if ...`
      - its rule:  [`body_member_words`](src/rules/properties/BodyMemberWords.ts), `member_words` minus
        `it` / `its` and any word a statement starts with (`return`, `print`, `set` ...), so `- return x is 1` stays a `return`
      - those words come from the `statement` rules themselves:  each one's first fixed word
      - a property named so keeps its quotes:  `- "type" is ...`
    - `is` or `are`:  `- piles are a list of piles`
  - A subject-less getter is a declaration (`Priority.declaration`), once its body parsed:
    so `- score is 0` is the card's getter, not a variable (it warns:  "score is always 0 ...").
    Inside a getter or method there, `total is 0` still sets a local.
  - `- "x" is ...` is a property, as `its "x" is ...` is:  the phrase's twin has no `is`.
    - `QuotedTypeExpression.isPropertyWithoutSubject()` steps aside for it:
      the phrase's higher priority would otherwise take the quoted name alone.
  - Outside a type's body, nothing changes:  `"rank" is a number` at the top level is an error.
- Quoted names:  "quotes teach a new word".
  - `quoted_type`:  `a "card" is a thing`, in any type declaration
  - `quoted_member`:  `its "short rank" is ...`, in a body
  - After `its "x" is` comes an `outline_specifier`.
    It's a type specifier without the `as` word.
    - e.g. `one of ...`, `a number`, `yes or no`, `a list of people`
  - A declaration names them without quotes:  `Rule.declaredText()`.
    - `SubjectRule` also overrides it:  `card`, not `it`.
- Bullets:  on ANY line, a starting `- ` is dropped before the statement is read.
  - That's `BlockLine.isBullet()`.
  - The `-` stays a token of the line's match, so editors see it.
- Editors:  hovering an outline line shows **Reads as**, the sentence style's words for it.
  - That's each rule's `SpellStatement.getLongForm()`.
  - default:  the subject spelled out, `it has a deck` => `a card has a deck`
  - `define_property_has`, `belongs_to_one`, `quoted_property_formula` and `draw_side` say their own
  - Compiling the long forms gives the same javascript as the outline (`outline.test.ts`).
- A line starting `it` / `its` OUTSIDE a type's body says so.
  See `BlockLine.isOutlineLineOutsideBody()`.
- A property's quotes are optional:  `- its rank is a number` (epic page Q4).
  - Quoted names work in the sentence style too:  `a card has a "suit" as ...` (J3, option C).
  - `- it "rank" is ...` is refused, saying to write `its`.
    See `QuotedTypeExpression.isPropertySlip()`.
- A phrase and nothing more is refused, saying to add a body (`QuotedTypeExpression.isBodiless()`, epic page I6).
  - e.g. `- it "can move"` or `a card "can fly"`
  - It has no `if`, `is` or `:`.
  - Why:  it'd compile to an empty method.
  - A dangling `if` is fine:  its body may be the indented lines below.
  - A phrase true for every one of the type says so:  `- it "can move" always`.
    - `always` / `never` are constants, read as its body.

## Value kinds:  `"suits" as one of clubs, diamonds, hearts or spades`

- In a type's outline body, [`value_kind`](src/rules/classes/ValueKind.ts)
  makes a list of values a KIND of thing, `Suit`.
  - The body's type keeps its list:  the class variable `Deck.Suits`, and its instance twin.
  - Each value is a constant.
  - The kind gets a `P.TypeScope` with a `valueKind`.
    It holds `{ values, listOn, listName }`.
  - The name must be quoted.
  - It compiles to `Deck.Suits = [...]` + `export class Suit {}`, where the line is.
  - Values stay plain text and numbers when the code runs (epic page Q10).
- A property of a kind:  `its "suit" is a suit`, or `a suit of its deck`.
  - `define_property_has` notes the kind, in `data.valueList`.
  - Its setter checks `{ oneOf: () => Deck.Suits }`, a FUNCTION.
    `core`'s `checkProp()` does the check.
  - Why a function:  the deck's class names the card's (`static instanceType = Card`),
    so one of them is defined second.
- A kind's property, `the "color" of a suit is:` + an indented body.
  - Its rule:  `property_value_getter`, with `data.valueKind`.
  - It compiles a STATIC method, `static color(suit) {...}` (`P.ASTStaticMethod`).
  - `it` / `the suit` is its argument.
  - It records the property's `readAs` as `Suit.color({it})`.
  - So `the color of its suit` compiles to `Suit.color(this.suit)`.
    `MemberReadExpression` does it, with `SP.parseReadAsTemplate()`'s static form.
- A value-per-line body ([ValueIf.ts](src/rules/if/ValueIf.ts), at `Priority.overridable`):
  - `value_if`:  `red if it is diamonds or hearts` => `if (...) { return 'red' }`
    - it may name the other value too:  `... otherwise it is black` => then `return 'black'`
  - `value_otherwise`:  `black otherwise` => `return 'black'`
  - Only in a getter's or method's body:  anywhere else, an error saying where it belongs (epic page I9).
    Outside a function, its `return` would make a program that won't load.
  - `property_value_either` is a getter whose inline body is ONE `value_if` line (T6):
    `the color of a card is red if ... otherwise it is black`.
    - Its body keyword:  `{inline_value_if}` (`BODY_KEYWORDS`).
    - Its own quick `test()` looks for the `if`:  `Sequence.test()` can't, as the body is parsed apart.
- A choice of values is `is_in` with [`value_choices`](src/rules/lists/ValueChoices.ts).
  - e.g. `it is diamonds or hearts`, `is jack, queen or king`
  - two or more KNOWN constants or numbers joined by `or` => `core.includes([...], it)`
  - It was `(it == 'diamonds') || 'hearts'`.
- Ranges in a list of values:  `2 ... 10`.
  - Its rule:  `number_range`, spread by `identifier_list`.
- A value kind may be used ABOVE its declaration, e.g. the card above the deck (issue I3):
  - `SpellParser.declaredTypes()` finds `"suits" as one of ...` lines too.
    - Its pattern for them:  `VALUE_KIND_DECLARATION`
    - So `Suit` is a stub before the project parses.
  - What depends on it reads the kind's RECORD when compiling, as a call reads `data.method.returns`:
    - `define_property_has`'s `data.valueType.valueKind` (its `oneOf`)
    - a member read's `data.ownerType.valueKind`
      - e.g. `the color of its suit` => `Suit.color(...)`.
        That works though `color` wasn't declared yet when it parsed.
- A list type whose item type is declared BELOW it (a stub when it parses) reads it when used:
  `static get instanceType() { return Card }` (`create_list_type`).
- A property, alias or phrase on a type nobody declares is refused (`SpellStatement.refuseUnknownType()`).

## Inferred phrases:  `- it "is a (suit)"`

- A `quoted_property_formula` with no `for its ...` INFERS what each blank reads.
  - In its `parse()`:  `inferPlaceholders()`.
  - The rule's syntax here:  an outline body's `{type:subject_it} {alias:text}`, the whole line.
  - A blank is a word in parens.
    - It names, by its singular, a property of the type with a list of values.
    - The list is its own (`as one of`), or a value kind's.
    - e.g. `is the (rank) of (suits)`:  sources `rank`, `suit`
  - A bare word is always just a word (epic page J9).
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
    - That's `kindValue()`, into `data.kindArgs`.
- A phrase ON a value kind:  `a rank "is a face card" if ...`.
  - `QuotedTypeExpression.processSignature()` sets `signature.valueKindOf`.
  - It compiles to the kind's static method:  `static is_a_face_card(rank)`.
  - Its `MethodPostfixRule` compiles to `Rank.is_a_face_card(card.rank)`.
    See its `staticOf`.
  - Postfix phrases only.
- A user's phrase checks WHOSE it is.
  - `CompoundExpression` tells the first suffix after an operand what that operand is.
    - That's [`SuffixLeft`](src/rules/expressions/expressions.shared.ts):
      a side channel, set while that suffix parses, restored after.
  - These refuse an operand KNOWN not to be their owner (`scope.couldBeA()`):
    - `MethodPostfixRule`, `MethodInfixRule` and `QuotedPropertyRule`
    - each specialized with its owner (`of`), as `thisType`
    - e.g. a deck's `a rank "is a face card"` on `the card is a face card`, where the card has its own
  - Unknown:  anything fits.
  - A suffix after `and` / `or` is told the operand after it (epic page I7).
    - e.g. `the game`, in `... and the game is red`
  - After anything else, it isn't:  what it follows is the chain so far, e.g. a sum.
- [`draw_side`](src/rules/classes/DrawSide.ts):  `- to "draw its front":` + one line of markup => `get front() {...}`.
  - Front AND back also give the type `draw()`, by its direction (epic page Q14).
- A one-line indented body (a `{nested_expression}`) parses in the statement's `nestedScope`.
  - e.g. `return` + markup, or `draw_side`'s
  - As an inline body does (`SpellStatement.parseNestedBlock()`).

## Fill-ins:  `"images/[rank]-of-[suit].png"`

- `[x]` inside text ALWAYS fills in (epic page Q2).
  - [`parseFillIns()`](src/rules/core/TextLiteral.ts) splits the text into plain pieces and fill-ins.
  - Each fill-in is parsed as an expression, where the text is.
  - It reads `its x` when `x` is a property of `it`'s type.
    So `[rank]` in a card's getter is the card's.
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
- `Scope` owns nothing:  it forwards these to its `parentScope`.
  - `variables`, `types`, `constants`, `rules` and `parser`
  - It resolves a datatype to its type:
    - `getType()`
    - `getItemType()`:  of a `list of cards`, or a `Deck`'s `itemType`
- `BlockScope` owns `variables` + `methods`.
  - Methods are `P.ScopeMethod` records, holding:
    - words
    - `params`, with datatypes
    - `returns`
    - `of`
  - `FileScope` is a `BlockScope`, so a file owns only variables.
- `RootScope` adds `types`, `constants`, `rules`.
  - `ProjectScope` is a `RootScope`, and holds the records of the project's free functions.
  - `SpellParser.rootScope` is ONE static root, shared by every project (see "Built-in types"):
    - spell's classes:  `Thing`, `List`, `App`, `Object`
    - every built-in type's NAME, with super-types (`P.BUILT_IN_TYPES`)
      - e.g. `text`, `number` ...
      - e.g. `integer` is a `number`
    - their members, from `SP.BUILT_IN_TYPE_TABLE`
- `MethodScope` adds args, plus `this` / `it` alias variables, of type `itDatatype`.
- `SubjectScope` owns nothing, and names the type its lines are about:  see "Outline bodies".
- `TypeScope` holds:
  - instance + class variables
  - instance methods' records
  - a list type's `itemType`
  - member lookup, up its super-type chain:
    - `chain()`, `isA()`
    - `getMember(words)`:  a property, else a method

## Scope:  who changes it, and when

- Changes happen ONLY in `mutateScope()`, run by `commitStatement()` (step 4 above).
  `getAST()` is pure:  see below.
  - variables:  `AssignmentStatement`, `get` ([assignment/](src/rules/assignment/))
    - into `match.scope`, so inside a body they stay local
  - `get` / `set it to` ALWAYS declare a new `it` (`declareIt()`):
    - plain `it`, then `it_2`, `it_3`...
    - numbered from the visible `it`'s `output`, skipping names in use
    - so callbacks keep the `it` they captured
  - each new variable holds its value's `datatype`:  see "Datatypes"
  - both also count a name a new thing is given in so many words, `set t1 to a new tableau with name = "T1"`:
    see "One thing by name or place"
  - types:
    - [`create_type`](src/rules/classes/CreateType.ts)
    - [`create_list_type`](src/rules/classes/CreateListType.ts), which sets `itemType` too
    - `belongs_to_one` gives the item type its owner member:  see "Membership"
    - a type mentioned before its own line is a `stub`,
      which its real declaration later claims (`TypeScope.claim()`, journaled)
  - BEFORE a project's files parse, every type they declare is stubbed (`parser.stubDeclaredTypes()`).
    - So a line can name a type declared further down, or in a later file.
    - The types come from `SpellParser.declaredTypes()`.
      It scans for lines starting `a card is`, `create a type called hand`.
    - `P.IncrementalProject` and `parseSpellProject()` both do it.
    - An edit which changes WHICH types a file declares re-parses the whole project.
  - `is a <type>` (`is_a`) names a KNOWN type:  built in, imported, declared or stubbed earlier.
    - Else it's a parse error, e.g. `is a crad`.
    - A type first mentioned in an `is a` above its own declaration is one too.
  - properties:  every property statement records the property in its type's `variables`
    - with `declaredBy` and its datatype (`TypeScope.declareProperty()`)
    - read by `the X of Y` / `its X` for their datatype, and by editors
      - through `getMember()`
    - a getter's datatype is what it returns, set once its body has parsed (see "Datatypes", "Return types")
      - so a getter changes scope as any declaration does:  editing its line re-parses what follows
    - an enumerated one (`define_property_has`) also adds:
      - constants for each value
      - a plural `classVariables` entry, e.g. `Suits`
        - with an instance twin in `variables`
      - ONE static rule, `class_member`, reads that for any type:  no rule per enumeration (see "Members")
  - auto-declared properties:  `set the X of Y to V` declares `X` on `Y`'s type.
    - That's `AssignmentStatement.declareProperty()`.
    - It's `autoDeclared`, holding `V`'s datatype, so it's reactive.
    - Only where `Y`'s type is one the PROJECT declares (not a stub, an import or a built-in),
      and `X` isn't on it.
    - `data.autoDeclared` makes that set `"global"`.
      See `getScopeChanges(match)` under "Incremental parsing".
    - Its FILE compiles the declaration:  see "Compile".
- Every record a `mutateScope()` adds carries `declaredBy`:  the match which declared it, for go-to-definition etc.
  - The records:  `ScopeVariable`, `ScopeConstant`, `TypeScope`, `ScopeMethod`, `ScopeRule`.
  - A `ScopeRule` also carries its built `instances`.
    So a call site's `match.rule` maps back to its definition.
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
  - or a `getDeclaration()` override, e.g.:
    - `assignment` counts only NEW variables
    - `MethodDefinition` reads its signature
- How editors colour a match's OWN tokens comes from its rule's `highlightAs`, e.g. `property`.
  - Defaults are on `Keyword(s)`, `Symbol(s)`, `SpellIdentifier`, `SpellType` and `SpellConstant`;
    else on the rule class.
  - `SpellLanguageService` refines it from `match.data`.
    - e.g. an argument's `variable` becomes `parameter`
- Rules a statement adds while parsing:
  - a quoted alias, e.g. `a card "is face up" if ...`
    - [`quoted_type_expression`](src/rules/methods/QuotedTypeExpression.ts) adds an `expression_suffix` rule.
      It's a `MethodPostfixRule` or a `MethodInfixRule`.
  - a quoted formula, e.g. `a card "is the (rank) of (suits)" for its ranks and its suits`
    - [`quoted_property_formula`](src/rules/classes/QuotedPropertyFormula.ts) adds a `QuotedPropertyRule`.
  - methods (`to turn a card over` ~== `to turn (a card) over`):
    - a signature's `a|an <KNOWN type>` is a typed parameter, as `(a card)` is
      - its rule:  `bare_type_arg`
    - a word that isn't a type, or anything after `the`, stays words
      - e.g. `to make a mess`, `to reset the stock pile`
    - its compiled NAME drops the receiver's type (`turn_over`), unless that leaves a little word dangling (Q44)
      - then it keeps the type's name:  `to update the total of (a calculator)` => `update_the_total_of_calculator`
      - `MethodDefinition.processSignature()`, `DANGLING_WORDS`
    - [`MethodDefinition`](src/rules/methods/MethodDefinition.ts) adds a rule for its call site,
      AND a `P.ScopeMethod` record
      - by `addMethod()`
      - the record goes in its type's `methods`, if this project declares the type
      - else in the project's, with `of`:  a free function, or a method of a built-in or imported type,
        whose lists every project shares
    - a call (`DynamicMethodRule`) finds its record while parsing (`MethodDefinition.findMethod()`)
- Types, constants and rules ALWAYS go to the project, from any depth.
- [`scope.addRule()`](../parser/src/scope/Scope.ts) => `parser.addRule()` on the PROJECT's parser.
  It adds a record in `ProjectScope.rules` too.
  - `Parser.addRule()` clears the memoized `rules` map.
    The next `parser.rules` rebuilds the whole merge.
  - `mergeRule()` is copy-on-write:  existing `Group`s are cloned, never mutated.
  - There is NO `removeRule`.
    But `parser.journal` can undo an `addRule()`:  see "Incremental parsing".
  - Generated rules are NAMED classes, `specialize()`d with plain-data statics, never closures.
    - The classes:
      - [`QuotedPropertyRule`](src/rules/classes/QuotedPropertyRule.ts)
      - [`DynamicMethodRule`](src/rules/methods/DynamicMethodRule.ts)
      - [`MethodPostfixRule`](src/rules/methods/MethodPostfixRule.ts)
      - [`MethodInfixRule`](src/rules/methods/MethodInfixRule.ts)
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
- Lookups record misses as `NONE` in `match.data`.
  - in `scopeVar`, `scopeType` or `scopeConstant`
  - `known_variable`, `known_type` and `known_constant` reject `NONE`.
- `getAST()` NEVER changes scope or looks it up.
  - ASTs are built lazily, e.g. at compile, when scope may have moved on.
  - What an AST needs from scope is looked up WHILE PARSING, into `match.data`:
    - `SpellIdentifier` / `variable` => `scopeVar`
    - `SpellConstant` => `scopeConstant`
    - `its_*` => `itVar`
    - `SpellType` => `scopeType`
  - A statement which declares something it also uses records it on that match, e.g. `property_value_either`.
- `await` makes its method `async`, because the method's body contains it.
  See `ASTMethodDefinition.isAsync`.

## Projects

- Projects come in GROUPS (project roots), and the groups are spaces', not spell's:
  `SPACES.PROJECT_GROUPS`, in [projectGroups.ts](../spaces/src/models/projectGroups.ts).
  - Spell's registry, `SpellSetup`, starts empty:  loading spaces' groups registers them there.
  - So every program that reads a spell path loads them first, through one of:
    - `$/spaces`
    - spaces' disk reader
    - `$/spaces/models/projectGroups` alone, as `<spell-app>` does
  - Spell never imports spaces.
- Everything is named by its ADDRESS (epic `people-and-orgs` P4, [SpellLocation](src/SpellLocation.ts)):
  - a group, e.g. `@spell/examples`
    - spell's own:  `@spell/examples`, `@spell/library`, `@spell/guides`, `@spell/test`
    - `owen@spell`, Owen's own space (`SPACES.LOCAL_PERSON`)
  - a project:  its group's, a slash, its name, ONE part, lower-kebab (decision Q39)
    - e.g. `@spell/examples/solitaire`, `owen@spell/errors`
  - a file in it:  a slash, then the file, whose name has a dot (decision Q41)
    - e.g. `@spell/examples/solitaire/Card.spell`
    - a folder ends in a slash, `@spell/examples/drawable-solitaire/assets/`
  - a page of a running app:  more after the project, no dot in its last part
    - e.g. `owen@spell/solitaire/rules`
    - the app's `/run/` URLs;  apps have no pages yet
  - A `@local/<folder>` group is added at runtime for a folder an editor opened.
  - No other form is read:  not `@system:examples:Solitaire`, not `@examples/Solitaire` (decision Q30).
- On disk, by address ([SpellUrls](src/SpellUrls.ts)'s `folderFor()`, then `serverPathForRoot()` in spaces'
  [project-utils.ts](../spaces/src/server/node/projects/project-utils.ts)):
  - spaces' built-ins, committed:
    - `@spell/examples/...`, `@spell/library/...`
    - in `packages/spaces/@spell/<group>/<Project>/`
  - the test projects, committed and frozen:
    - `@spell/test/...`
    - in `tests/spaces/@spell/test/<Project>/`
  - Owen's own, in spell-spaces, outside git:
    - `owen@spell/...`
    - in `<main checkout>/../spell-spaces/@spell/owen@/<project>/`
    - One folder for main and every worktree;  `SPELL_SPACES_DIR` sets it.
    - A person's space is inside their org's, so `@` says what each folder is.
  - A `@local/<folder>` group says where itself, with its `serverPath`.
  - The folders are spaces' `environment` ([environment.ts](../spaces/src/server/node/environment.ts)), its `spaceFolders`:
    - `builtins`, `tests` and `spaces`
    - Tests point them at temporary folders, with environment variables:

      ```sh
      SPELL_BUILTINS_DIR  SPELL_TESTS_DIR  SPELL_SPACES_DIR
      ```

  - A project's folder is its name, e.g. `packages/spaces/@spell/examples/drawable-solitaire/` (decision Q39).
    The editor shows its title, `Drawable Solitaire` (`SpellProject.title`).
  - A group with `devOnly` is listed in the app's UI in dev only.
- A group's projects are its folder's sub-folders, less spaces' own `__` names.
  - Spaces' list:  `SPACES.SPACE_NAMES` (`isSpaceName()`).
    - e.g. `__members/`, `__project.json5` ...
  - Known by that list, never by the `__` alone:  `__init__.py` and `__snapshots__/` are a project's files.
- A project's file, `__project.json5` (`SP.PROJECT_FILE`;  an old `project.json` is read too), imports:
  - another project by its address, `{ "path": "@spell/library/cards" }`
  - its own files by their paths in it, `{ "path": "/Card.spell" }`
  - `SpellLocation.isAddress()` tells them apart:  only an address has an `@` in its first part.
- Compiled output is never one of a project's own files.
  - The server's index lists only spell, CSS and javascript files:  see `isManifestFile()`.
    - `.spell`, `.css`, `.js` and `.jsx`
    - So no other target's output, e.g. `<Project>.spell.py`, is ever listed.
  - Of those, it leaves out:
    - a project's `<Project>.spell.js`, and a fixture's `<Project>.snapshot.js`
    - its scope pack, `<Project>.scopes.js`
    - its words, `<Project>.en.js`
    - a Python program's page file, `<Project>.elements.spell.js`
    - the same files by their names before epic `people-and-orgs` P11, e.g. `<Project>.compiled.js`:
      an old copy left in a checkout
  - Else the index would add them to the project file.
  - The list:  `GENERATED_SUFFIXES`, beside `isManifestFile()`.
- What spell BUILDS for a project goes in its build folder, not beside its source (epic `people-and-orgs` P11).
  - That's `build/` at the repo root, never committed, each checkout its own.
    It mirrors the project's path:
    - under `packages/`:  `packages/spaces/@spell/examples/solitaire` => `build/spaces/@spell/examples/solitaire`
    - under `tests/`:  `tests/spaces/@spell/test/fizzbuzz` => `build/spaces/@spell/test/fizzbuzz`
    - in spell-spaces:  `@spell/owen@/errors` => `build/spell-spaces/@spell/owen@/errors`
  - The files:  its compiled code and its scope pack.

    ```text
    <Project>.spell.js  .spell.tsx  .spell.py  .elements.spell.js  .scopes.js
    ```

  - Committed beside the source:  everything else.

    ```text
    <Project>.declarations.json5  .en.js  .py.en.json5  .lib.ts  .app.py
    ```

  - Every reader asks for a file by project and name, as for any file.
    - ONE mapping decides where it is on disk:  the server's `serverPath`.
    - It's `isBuiltFile()` and `buildFolderFor()`, in spaces' [project-utils.ts](../spaces/src/server/node/projects/project-utils.ts).
  - A project anywhere else keeps them beside its source:
    a temp `@local/<folder>` group, a VS Code workspace elsewhere.
  - Built when needed, so a fresh checkout or worktree needs nothing run by hand:
    - the page server, as it starts:  the built-in projects that are out of date, in the background
      - `@spell/examples` and `@spell/library`
      - `spell compile --stale --all @spell/examples @spell/library`
    - spaces' routes:  a request for a built file that isn't there compiles its project first, then serves it
      - e.g. `/spaces/<project>/<project>.spell.js`, `.scopes.js` ...
      - one compile per project at a time, a request waits at most a minute
    - Both are `ProjectBuild`, in the editor's server ([ProjectBuild.ts](../spaces/src/server/node/routes/ProjectBuild.ts)),
      running the checkout's own `spell compile` as a child.
    - By hand:  `spell compile --all <root>`.
    - Add `--stale` for only what's out of date (`CLI.staleBecause()`).
      Out of date means something is newer than its build, or a built file is missing:
      - one of the project's files, or its project file
      - an import's declarations
      - spell's compiler
  - Renaming a project deletes its build folder, and duplicating one doesn't copy it:
    its files are named for the old project, so the next compile writes the new one's (`renameApp()`, `duplicateApp()`).
    Deleting a project deletes it too.
  - A Python program's web app names its program's folder inside the checkout's `build/` (epic `people-and-orgs` J33).
    - The app:  `<Project>.app.py`
    - The folder:  the project index's `buildFolder`, e.g. `spaces/@spell/examples/solitaire`
      - It's what `PY.QuartAppSpec.outputs` holds.
    - `spell_quart.built_folder()` finds that checkout's.
- [`SpellProject`](src/SpellProject.ts):  files in its project file's order, e.g. Card → Deck → Pile → Solitaire.
- `SpellProject` and each `SpellFile` load over HTTP, with `$fetch()`.
  Their URLs come from ONE function, [SpellUrls](src/SpellUrls.ts) (`SP.SpellUrls`):
  - a file is READ at `/spaces/<project>/<file>`, e.g. `/spaces/@spell/examples/solitaire/Card.spell`
  - and SAVED by `POST /api/projects/file/<project>/<file>`
  - a project's index:  `/api/projects/index/<project>`
  - a group's projects:  `/api/projects/list/<group>`, e.g. `/api/projects/list/owen@spell`
  - What spell builds is read as a file too:  the server finds a built one in the build folder.
    - e.g. `/spaces/@spell/examples/solitaire/solitaire.spell.js`
    - and its `.scopes.js`, `.declarations.json5`, `.en.js`
  - Where the project ends:  its group's address, then ONE part (`SpellUrls.split()`).
    The file follows, its name with a dot (decision Q41).
    - each part is encoded and decoded on its own, never the whole address
    - every URL starts `/spaces/` or `/api/`, and is written whole, never relative
  - They go through `LoadableFile.fetch`.
    A node host swaps that for spaces' disk reader, to answer the same URLs from disk:
    [`diskFetch()`](../spaces/src/server/node/projects/disk-fetch.ts), by `installDiskFetch()`.
- A project's FILE create, copy, rename and delete are spaces', not `SpellProject`'s (decision Q20):
  `SPACES.ProjectFiles`, which the editor calls.
  - `SpellProject` reads, compiles and saves.
  - A group's list, and its projects' create, copy, rename and delete:  `SPACES.SpellProjectRoot`.
- Each project parse or compile builds a FRESH `ProjectScope`, with `parser.clone()`.
  - The clone has empty own rules, and imports the base spell parser.
  - Every file gets a `FileScope` under it, and SHARES that parser.
- So one file's types, constants and rules are visible to every later file.
- Another project can come in WITHOUT its sources, as its declarations (`SP.SpellDeclarations`).
  - They're in `<Project>.declarations.json5`, committed beside its source (epic `output-targets` P5).
  - Before that they were inline in the compiled JS, and `fromComments()` still reads those.
  - While compiling, `Block.getAST()` puts a MARKER right on each declaring statement's code.
    - It's a `/*! SPELL: DECLARES {...} */` comment.
    - It goes below any docstring.
    - For a class member, it's indented in its class's body (`commentFor()`).
    - It's ONE flat JS object literal, 3-7 lines, merging the scope records it added (`declarationFor()`):
      e.g. `{ property: "suit", classVariable: "Suits", of: "Card", enumeration: [...] }`.
  - `SpellProject`'s "Combining output" `split()`s the markers back OUT.
    - The compiled JS is just code.
    - Each marker's object goes in the declarations, with `codeLines`:
      the line (from 0) its statement's code starts on.
    - A file's own `compiled`, and the language server's, strip them (`stripComments()`).
    - `rule` is the `importableAs` of the class its rule was `specialize()`d from.
      - What that took sits beside it, e.g. `output`.
      - Loading passes the whole object to `specialize()`, which picks out its own.
      - Loading SKIPS `rule: "enumeration"`, which a compiler from before P6 of precedence-and-types
        wrote for each enumeration (`LEGACY_ENUMERATION_RULE`):  no version bump (epic page D37).
    - An auto-declared property's marker (`auto: true`) sits on its declaration at its file's top, NOT on its `set`.
      See "Compile".
    - It leaves out what loading works out, e.g. an enumeration's constants, or a rule's owner (`of`, else `output`).
    - `defined: "/Card.spell:222-283"`:  where the statement is, as its character offsets, project-relative.
    - NO source line numbers.
      - A page with no sources matches the code to a scope pack's entry by what it declares,
        e.g. `property: "suit", of: "Card"` for `.../type:Card/property:suit`.
      - It finds the code by `codeLines`:  see `ScopesSource`, in [lsp's source](../lsp/src/).
    - `kind` + `name`:  what its rule's `getDeclaration()` says, for editors.
      - e.g. `name: "draw (a card)"`
      - Unless a key already says, e.g. `type`.
    - only what's known:
      - a method's `params` and `returns`
        - e.g. `params: [{ name: "pile", datatype: "Pile" }]`
      - a list type's `itemType`
      - an owner member's `exclusive`
      - Loading rebuilds the `P.ScopeMethod` record.
        A key an older compiler didn't write loads as unknown.
    - NOT whether a property is DERIVED (`the short rank of a card is: ...`) or stored:
      each writer names every member the same way, so an importer needn't know (Q56).
      - javascript and TypeScript:  camelCase
      - Python:  snake_case
  - The declarations also hold the project's versions, and what it `provides`.
  - `read(json)` reads them back, never running anything.
  - `importScope(root, imports)` => a `P.ImportScope` holding them.
    - The project's scope goes UNDER it, with a clone of its parser.
    - So imports are a base layer the `journal` never records.
    - Its records have no `declaredBy`.
      Editors read these instead:
      - `declaredAt` on its types, variables and constants:  a `P.DeclaredAt`
        - full file path + offsets, from `defined`
      - `declared` on its rules:
        - owner, what `getDeclaration()` said, and `declaredAt`
  - `SpellProject.projectImports`:  the entries of `imports` that name a project.
    They're in its project file.
    - e.g. `@spell/library/cards` ~== `@spell/library/cards`
    - Its "Loading" task reads each one's `<Project>.declarations.json5`.
      - That's `SpellProject.declarationsOf()`.
      - It then builds the `ImportScope` our scope goes under.
    - `source: true` instead parses that project's `.spell` files ahead of ours.
      See `sourceImportFiles`.
  - `import: ["Card:Playingcard", "*"]` loads `Card` as `Playingcard`.
    - That's `SpellDeclarations.picked()` / `renamed()`.
    - Every loaded record naming it says `Playingcard`.
      - in `type`, `superType`, `of`, `datatype`
    - Rules built from them follow, e.g. `playingcard suits`.
    - Compiled JS imports `Card as Playingcard`.
    - Its `TypeScope` keeps `runtimeName: "Card"`.
      - Runtime type checks compile to that (`ASTTypeExpression.runtimeName`):
        the class is still `Card` when the code runs.
    - Types only, and compiled imports only.
  - After parsing, a type the project declares AND imports is a `parseError` (`checkImportClashes()`).
    - `create_type` declares an imported type again, just so it's seen.
    - Rule names may repeat:  they merge.
- Compiled spell uses NO globals:  it `import`s what it didn't declare (`SpellProject.importHeader()`).
  - `import { core, Thing, List, App } from "@spell/core"` (`SC.SPELL_CORE_MODULE`)
  - `import { Card, Deck } from "@spell/project/<projectId>"`, for each compiled import (`ImportScope.modules`)
  - and it exports what it declares:
    - types:  `export class`
    - top-level functions:  `export function`
    - top-level vars:  `export let`
  - see "Classes" under Compile, for what goes in a class's body
  - NO import map:  every runner (the app, VS Code's, `<spell-app>`) runs compiled code from a `blob:` URL.
    - Its specifiers are rewritten (`runCompiled()` / `linkModule()`, in [the app's runner](../app/src/runner/)):
      - `@spell/core` => the runtime it runs on (`spellRuntime.ts`)
      - `@spell/project/<projectId>` => that project's compiled JS, fetched and linked the same way, afresh each run
    - The app, parser and forms NEVER load `core` themselves.
- ALL files parse first, then ALL compile, so lazy compile-time lookups see the whole project.
- The editor calls `project.updateText(file, text)` on every keystroke
  (`onInputChanged`, in [the app's editor](../app/src/editor.ts)).
  - That calls `updatedContentsFor(file)`.
  - `project.incremental.update()` re-parses what changed right away, and hands changed files their new match.
  - If that couldn't cope, `updateText()` parses from scratch straight away.
  - After 2s:  it compiles, saves `<Project>.spell.js` and runs it.
- A crash while parsing (a rule threw, NOT an error in the spell) is left in `project.parseError`.
- `SpellProject`'s parse task list keeps its scope + `incremental` while they're good.
  See `needsFullParse`.
  - Else it starts over:  a new project scope, and `parseImports()` builds a new `IncrementalProject`.

## Incremental parsing

- [`P.IncrementalProject`](../parser/src/IncrementalProject.ts):  a project's spell files, in order,
  sharing ONE project scope + parser.
  - `update(path, text)` => the files whose match changed.
  - `SpellProject` owns it.
- `P.ParseJournal` (`parser.journal`):  every change parsing makes to shared state, undoable + redoable.
  - recorded by:
    - `ScopeList.add()` / `.replace()`, which swap in a NEW items array
    - `Parser.addRule()`, for `#ownRules`
  - `mark()` a point
  - `rewindTo(mark)` undoes everything after it
  - `replay()` puts it back, marks included
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
        - its statement's `mutateScopeFromBody()` records the same as before, in `data.fromBody`
          - e.g. the method still returns a `number`:  later lines may read it
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
- `rule.getScopeChanges(match)`:  the rule's `@proto static changesScope`, if set.
  - Else, with no `mutateScope()`:  `undefined`.
  - Else `"global"`:  it has one, so assume the worst.
  - `get` says `"internal"`.
    Its `it` goes in its own `match.scope`.
  - A rule may say PER MATCH, reading only `match.data`.
    - `assignment` is `"internal"` (a variable), unless it auto-declared a property.
      Then it's `"global"` (`data.autoDeclared`).
    - So a plain `set x to 1` stays cheap.
- If an `update()` throws (a rule crashed committing a line), `IncrementalProject.isBroken`:
  the next update re-parses every file from scratch.
- Cost, Solitaire, against a full parse of ~110ms:
  - body edit:  ~10ms
  - comment, blank line or top-level statement, anywhere:  ~1-2ms
  - declaration edit near the END:  ~1ms
  - declaration edit near the START of the first file:  ~110ms (~= a full parse)
- [IncrementalProject.test.ts](../../tests/spell/src/parserTests/IncrementalProject.test.ts) edits lines of every Solitaire file,
  on ONE project.
  - every line, with `INCREMENTAL_FULL=1`
  - After each edit, and after undoing it, it checks output, errors and token positions against a full parse.
- [ParseJournal.test.ts](../../tests/spell/src/parserTests/ParseJournal.test.ts) checks a whole project's rewind / replay.

## Compile

- `Match.compile()` => `match.AST?.compile()`.
  - `Match.AST` is memoized;  `ASTNode.compile()` is not.
- The AST classes hold what was parsed;  a WRITER writes them out ([the writers](../parser/src/writers/)).
  - Each TARGET a project compiles to has its own writer ([targets.ts](src/targets.ts), `SP.TARGETS`):
    - `js/solid`, by `P.JSWriter`:  ALWAYS compiled, as it's what runs
    - `ts/solid`, by `P.TSWriter`:  checked by `tsc`
    - `py`, by `PY.PyWriter`:  Python on asyncio, checked by pyright
      - with a words file of its own, by Python's names:  `<Project>.py.en.json5`
    - `ts/lib`, by `P.LibraryWriter` (epic `people-and-orgs` P3):
      a LIBRARY, the project's classes alone, for other code to import
      - one TypeScript file, `<Project>.lib.ts`, its own types, checked by `tsc`
      - no drawing, none of its top-level steps, the core with no Solid (`@spell-app/core/model`)
  - Each writes a file of its own, e.g. `Solitaire.spell.py`:  see each target's `suffix`.
  - A project lists the others it wants in its project file, e.g. `"targets": ["ts/solid", "py"]`.
  - What every program's writer shares is `P.ProgramWriter`, which the javascript and Python writers extend.
    - `forProject()` reads the whole project first, so it knows what each value is.
  - `ASTNode.compile()` is `P.JSWriter.instance.write(node)`.
  - Each writer has one method per AST class, named for it:  `ASTIfStatement(node)`.
  - NEVER write output in an AST class.
- A block compiles as its statements joined with `\n`.
  - Nesting indents by re-joining with `\n` + 2 spaces (`P.jsText.INDENT`, NEVER a tab).
    Python's is 4 spaces (`P.pyText.INDENT`).
  - So a statement's output doesn't depend on its depth.
- A DECLARATION's docstring compiles as one `/** ... */`, in place of its `//` lines.
  - See `getDocComments()`, in [Block.ts](src/rules/Block.ts).
  - The docstring:  the comment-only lines directly above it, else the comment on its own line.
  - It goes above the `SPELL: DECLARES` comment:  after any `/* SPELL: added rule ... */` notes the statement makes.
  - A `##` heading is part of it only if DIRECTLY above.
    One followed by a regular comment compiles as a `// ## heading` banner.
  - It's worked out from the block's lines when asked, never stored while parsing:
    an edited comment line re-parses on its own.
  - The language server shows the same docstring on hover and in completion.
- A heading at a FILE's top level also compiles to `core.heading("set up all piles")`, just above its own lines.
  - It's a `P.ASTHeadingInvocation`.
  - Why:  as the program runs, the Thing Explorer knows which heading's code made each thing.
  - NOT in a plain block, e.g. a rule test's.
  - NOT for a heading with no text, e.g. `##########`.
- A line of the program's START, at a FILE's top level, runs only when the program starts afresh
  (epic `drawable-thing` P17):  `if (!core.isCarryingOver) game.start()`.
  - Its lines:
    - calling one of its tests:  `test card setup`
    - starting its app:  `start the game`
    - Each rule says so:  `SpellStatement.startsTheProgram()`.
  - [`Block`](src/rules/Block.ts) wraps the line's code in a `P.ASTProgramStart`:  an if statement.
  - Why:  when an edit keeps the last run's things, the runner loads the program with its start skipped,
    so its tests don't print again, and the game in progress isn't started again.
  - NOT in a method, nor in a plain block, e.g. a rule test's.
- Classes compile as a hand-written class would:  each MEMBER in its class's body, wherever it was declared.
  - A member is a `P.ASTClassMember`.
    It knows its class (`typeName`), and compiles two ways:
    - in its class's body (`compileAsMember()`)
      - e.g. `get title() {...}`, `draw() {...}`, `static Suits = [...]`
    - patched on from outside (`compile()`), e.g. `Card.prototype.play = function () {...}`
      - when its class isn't compiled with it:  it's from another project, or a rule test compiles the statement alone
  - A property is a getter / setter pair over the instance's reactive props (spell cells, `P.ASTReactiveProperty`).
    - `this.getProp("title")` / `this.setProp("title", value)`
    - NEVER a class field:  that would shadow the accessor, and nothing would redraw.
    - What it's checked against, and its default, go in the class's SCHEMA, declared once:
      - in the class:  `static { this.declareProp("title", { type: "text" }) }`
      - from outside:  `Todo.declareProp(...)`
      - a default made per instance:  `{ init: () => new List() }`
      - The same runtime shape as a hand-written class's `@prop({ type: 'text' }) accessor title`.
      - Older output's `setProp(name, value, check)` still runs.
  - `Block.getAST()` makes each declaring line ONE `P.ASTStatementGroup`.
    It holds the docstring, the `SPELL: DECLARES` comment and the code.
    - Then `SP.hoistClassMembers()` moves each member into its class's body, if that's in the block.
    - Comments directly above a member go with it, e.g. a `## properties` banner.
      - They go past a heading's `core.heading()` call, which stays put.
    - Everything else stays put too.
  - A project then does the same across ALL its files (`SpellProject.combineCompiled()`).
    - So `Card.move_to_$pile` from `Pile.spell` ends up in `Card.spell`'s class.
    - So does `compiledFixture()`.
    - It NEVER mutates an AST:  a class which gets members is a NEW `P.ASTClassDeclaration` (`withMembers()`).
  - An AUTO-declared property (see "Scope:  who changes it") compiles ONCE,
    in the file of the `set` that declared it.
    - It's `Card.declareProp("pile", { type: "Pile" })`, then `Object.defineProperty(Card.prototype, ...)`.
    - at its top, or just after its type's declaration if that's in the same file
      (a class isn't defined above its own line)
    - under that `set`'s `SPELL: DECLARES` comment
      - See `Block.autoDeclarations()`, `autoDeclarationAST()`.
    - a `P.ASTPatchedMember`, NOT a class member, so hoisting never moves it:  it can't change another file's output
    - Why not on the `set` line:  that may be in a method's body, whose AST is memoized.
      - An edit above it which only moves it would leave its `defined` offsets stale.
      - A file's AST is built afresh.

## Language server

- [lsp's source](../lsp/src/) (`LSP`) runs as `yarn start:lsp`.
  - Or from the VS Code extension, in `packages/vscode/`.
  - The extension spawns the repo's own `tsx` on [the server's entry](../lsp/src/server.ts).
  - `stdioGuard.ts` sends `console.*` to stderr first:  stdout is the protocol.
- It hosts the SAME `SpellProject` / `SpellFile` the app uses, and takes everything from them:
  - `project.spellFiles`, `file.isActive`, `project.parseError`
  - edits go through `project.updateText()`, exactly as the app's editor does
  - All `SpellLanguageService` adds is `LSP.FileAddresses`:  the editor's URI for each file.
- It's used twice:
  - by VS Code, over stdio
  - IN-PROCESS, by the app's Monaco editor ([the app's Monaco folder](../app/src/ui/monaco/))
    - its `SpellModels` keep one Monaco model per file in step with `file.contents`.
      Edits go through `updateText()`.
    - its `SpellLanguageFeatures` call the service, and convert its answers with `LspToMonaco`
  - The app shows one project at a time.
    `<spell-editor>`s on a page show one each, all in one Monaco:
    each `SpellModels.use()`s its project, so another's models don't replace them.
- `SpellDiskWorkspace` is the stdio server's:
  - it loads from disk, via `LoadableFile.fetch` (above)
  - it maps a `.spell` file to its project (the nearest `project.json`)
  - it parses the project on first sight, and reacts to disk changes
  - It's node-only, so it's NOT in the `$/lsp` barrel, which MUST stay browser-safe
    ([barrel.test.ts](../../tests/lsp/src/barrel.test.ts)).
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
- A type's `<css>` blocks are CSS, not spell ([SpellCSS.ts](../lsp/src/SpellCSS.ts)):
  - found in the text, line by line:  `<css>` alone on a line opens one, `</css>` closes it
  - completion, hover and errors inside one come from VS Code's own CSS service, `vscode-css-languageservice`
    - each block is checked as a CSS document of the whole file, everything else blanked to spaces,
      so lines and characters match
  - spell's rule for it is `css_block`, in [CSSBlock.ts](src/rules/classes/CSSBlock.ts)
    - only in a drawable type's outline
    - compiled to the class's `static css`
    - The tokenizer reads a `<css>` element's contents as raw text (`P.Tokenizer.rawTextTags`),
      so the CSS is never read as spell.
  - spell's own colouring skips the block
  - editors colour it as CSS themselves:
    VS Code through the grammar's embedded CSS, the app's Monaco through its own (`SpellTokensProvider`)
- A `<markdown>` block is markdown, not spell:  read as raw text too (`rawTextTags`), its common indent taken off.
  - in a drawing:  [`markdown_block`](src/rules/JSX/MarkdownBlock.ts)
    - drawn by Spell UI's `<ui-markdown>`, the markdown as its text
    - a `{hole}` is a spell expression, live
    - code in the markdown keeps its braces, and `\{` is a brace
    - a hole that doesn't read is a parse error, reported as JSX's are (`SpellJSX.parseErrorsIn()`)
  - in a type's outline:  [`markdown_description`](src/rules/classes/MarkdownDescription.ts), the type's description
    - compiled to the class's `static description`
    - hover and the Type Explorer show it when the type has no comment docstring (`SpellLanguageService.docsOf()`)
  - in a `<spell-app>` layout:  the app's `LayoutSpell`
    - it splits holes as `markdown_block` does
  - no diagnostics inside
  - editors colour it as markdown themselves:
    VS Code through the grammar's embedded markdown, the app's Monaco through its own (`SpellTokensProvider`)
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
- No code lenses (Owen, 2026-10-13:  "turn off codelens entirely"):  the "N references" line above each type and
  method is gone, from VS Code and the app alike;  Find All References and Peek References still work.
- Semantic tokens come as DELTAS too (`semanticTokensDelta()`), from one kept `SemanticTokensBuilder` per file.
  - NOTE: a builder keeps what was pushed until `previousResult()` starts afresh.  `build()` doesn't.

## Testing a whole project

- Three helpers parse + compile a project headlessly, exactly as `SpellProject` does:
  - [`parseSpellProject()`](src/test/parseSpellProject.ts)
  - `loadFixtureProject()`
  - `summarize()`:  the "same as a full parse" reference
- [SpellProject.test.ts](../../tests/spell/src/SpellProject.test.ts) snapshots Solitaire's compiled output + errors,
  and benchmarks with `BENCH=1`.
- Every fixture project compiles to every target it can, against the snapshots beside it:
  the "Projects live in spaces" bullet in [AGENTS.md](AGENTS.md) lists them, and how to refresh them.
