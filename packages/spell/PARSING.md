# How parsing works

Compact map of the parse pipeline, so agents don't have to re-derive it.
MUST be kept up to date when `Parser`, `SpellParser`, scopes, or the `Block` / `BlockLine` / `SpellStatement`
machinery changes -- see `AGENTS.md`.  File refs are `path:line` as of 2026-09-27;  trust the code if they drift.

## Text => tokens

- `Parser.parse(input, ruleName, scope)` (`packages/parser/src/Parser.ts`) tokenizes, then `scope.getRuleOrDie(ruleName).parse()`.
- `SpellParser.tokenize()` (`packages/spell/src/SpellParser.ts`) calls `Tokenizer.tokenize()`, and for the `"block"`
  rule then `breakIntoIndentedBlocks()` (`packages/parser/src/tokenizer/Tokenizer.ts`):
  - result is ONE root `BlockToken` holding `LineToken`s and nested `BlockToken`s
  - indent ~== count of leading whitespace chars (tab === space === 1);  each extra level pushes a `BlockToken`
  - a blank line takes the indent of the NEXT non-blank line, so it doesn't break a nested block (lookahead)
  - comments are a single `CommentToken` to end of line:  `//`, `--`, or a heading's `#`, `##`, `###` ...
    (a markdown-style level -- see `Block.getDocComments()`)
- Some tokens span lines:  a JSX element (e.g. a whole `return <div>...</div>` body) or a string with `\n`
  is ONE token inside ONE `LineToken`.  JSX `{...}` contents are re-tokenized later from a collapsed copy.
- Every token has an absolute `start`.  `Tokenizer.setPositions()` works out `line` / `ch` FROM it,
  via `getLineStarts()` + `positionForOffset()` (`tokenizer.types.ts`), including tokens nested in JSX.
  - NOTE: `LineToken` / `BlockToken` copy `line` from their first token.
  - JSX `{...}` contents are parsed later from a trimmed, newline-collapsed copy (same length), so the JSX rules
    (`SpellJSXContent.placeInFile()` in `rules/JSX.ts`) shift those tokens to their file positions and hang them on the
    `JSXExpressionToken` as `innerTokens`, where `Tokenizer.forEachToken()` (so `moveTokens()`) reaches them.
- A token's / match's `end` is where its TEXT stops;  `next` is where the next token starts, i.e. `end` plus
  the trailing whitespace (tokens carry the whitespace after them).  Ranges a user sees use `end`;
  "which match is the cursor in" (`matchForOffset()`) uses `next`.

## Rules and matching

- A rule is `test()` (cheap "could this match at `start`?") plus `parse()` (build a `Match` or `undefined`).
- `Choice.parse()` (`packages/parser/src/rules/Choice.ts`) calls `parse()` on EVERY alternative, then `getBestMatch()`:
  - highest `priority`, then longest match, then EARLIEST rule
  - `priority` answers ONLY "several rules match the SAME words:  which wins?" (`Rule.priority`, default 0);  how
    tightly an operator binds is spell's `precedence` (see "Expressions")
- `Sequence.parse()` (`packages/parser/src/rules/Sequence.ts`) first runs `Sequence.test()`:
  - fixed words / symbols / patterns are checked where they must fall, subrules are skipped
  - rejects ~92% of attempts before any child parses
  - then each child is parsed at the head of the remaining tokens
  - GIVE-BACK:  a required word failing right after a required `{slot}` re-parses the slot shorter, cut just before
    each place the word is (last first), and goes on from there -- e.g. `remove the card of the pile` for
    `remove {thisArg:expression} of {callArgs:expression}`.  Only on the way to failing, NEVER in expecting mode.
- `Subrule` looks its rule up BY NAME through `scope.getRuleOrDie()` at call time, so rules added mid-parse
  are visible to later lines.
- `Literal` / `Literals` / `Pattern` / `TokenType` compare single tokens with `===` / regex -- cheap.
- Cost, warm (`BENCH=1` run of `packages/spell/src/SpellProject.test.ts`, 2026-10-04, after P3 of precedence-and-types
  halved it):  Card.spell (121 lines) ~12ms, Solitaire.spell (259 lines) ~32ms, whole Solitaire project ~55ms.
  Compiling is <1ms per file, tokenizing about the same.  Parsing is the whole cost.
  `parser.rules` rebuilds after mid-parse `addRule()`s:  38 per project parse, ~1ms total -- not worth optimizing.
- "What can come NEXT?" -- `parser.expectedAfter(input, ruleName, scope)` parses a half-typed line in
  EXPECTING mode (`P.Expectations`), for editor completion:
  - rules record what they were waiting for where they ran out of tokens:  `Sequence` the child it hadn't got to
    (and any optional ones after it), `Repeat` another item, `Subrule` / `Choice` themselves
  - a `Sequence` failing after a child ran out of tokens INSIDE itself records that child as `within`:  partway
    through it, e.g. an argument being typed -- for signature help;  completion skips these
  - each is a `P.Expectation`:  the rule, the `Sequence` + index it sits at (e.g. for the rest of a method's
    syntax), depth, and `continues` -- it only EXTENDS something complete, e.g. an operator after `x`:
    a `Choice` marks what its other alternatives recorded once one matched every token
  - `Sequence.test()` lets a rule whose words fit but ran short through (`allowRunOut`, a module flag:  the
    test walk is too hot for an argument)
  - `Subrule` parses are memoized for the one call (`Expectations.memoized()`), or it's ~40x slower
  - normal parsing pays ~1%:  one static read per hook

## Expressions

- `expression` is ONE rule, `compound_expression` (`packages/spell/src/rules/expressions.ts`):  `{lhs:operand}
  {rhsChain:expression_suffix}*` -- an `operand`, then each `expression_suffix` binding tighter than its `bound`
  (0:  all).  No suffix => the operand's own match, as is, so `match.is(known_variable)` still works.
- An `operand` is what an operator acts on:  one expression with no operator at its TOP -- `5`, `the deck`,
  `the first card of the deck` (it nests), `(x + 1)`, `the cards in the deck where ...`.  Every rule aliased
  `expression` other than `compound_expression` is registered as `operand` instead -- `SpellParser.getNamesForRule()`.
  - That also throws for an operand whose syntax STARTS with an expression:  it would recurse forever.  Something
    after an expression is an `expression_suffix`, e.g. `list_membership_test`.
- Three slot kinds:
  - `{x:expression}` -- everything:  statements, slots closed by a word (`position of {x} in`), method-call arguments
  - `{x:arithmetic_expression}` -- `+ - * /` only, stops before a comparison:  `absolute value`, `round`
    (bound `Precedence.takesSum`)
  - `{x:operand}` -- a prefix's LAST slot (`the first card of {list:operand}`), and every suffix's right side
- `precedence` -- how tightly an operator binds -- is set on suffix rules ONLY (`InfixOperatorSuffix` /
  `PostfixOperatorSuffix`), from the `Precedence` table:  `*` before `+` before `is` before `and` before `or`.
  - The constructor throws without one:  a silent default is how `ends with` went wrong.
  - Read ONLY by the loop:  it stops at its `bound`, and `getAST()`'s shunting-yard groups the flat chain by it.
    A postfix pops like an infix, so `x + y is empty` => `isEmpty(x + y)`.
  - NOT `priority`, which only breaks a `Choice`'s tie (see "Rules and matching") -- e.g. a user's quoted alias
    (priority 20) beats a built-in suffix matching the same words.
- Give-back (`Sequence`, see "Rules and matching") lets a full `{x:expression}` slot before a word work:
  `remove {thisArg:expression} of {callArgs:expression}` on `remove the card of the pile`.
- Expecting mode:  out of tokens after the operand or a suffix, the loop records `expression_suffix` as only
  CONTINUING it -- what the old `expression` Choice worked out.
- `expressions.test.ts` "priority and precedence" snapshots every built-in rule's non-default `priority` and every
  suffix's `precedence`.

## Adding an expression rule

- An OPERAND stands alone:  a literal, `the X of Y`, `the first card of ...`.  `extends SpellExpression` (alias
  `expression`, registered as `operand`).
  - A slot at its END takes `{name:operand}`:  `the first card of {list:operand}` stops before any operator.
  - Math that should take a sum (`the absolute value of x + 1`):  `{name:arithmetic_expression}`.
  - A slot closed by a required word (`of`, `in`, `to`) stays `{name:expression}`, like a paren.
- An OPERATOR follows an expression:  `extends InfixOperatorSuffix` (`x OP y`) or `PostfixOperatorSuffix`
  (`x is empty`).  Its right side is `{expression:operand}`.  MUST set `@proto static precedence` from `Precedence`
  (the constructor throws without it);  build output in `compileASTExpression()`.
- `priority` only settles a tie between rules matching the SAME words.  Leave it unset unless a probe shows a
  tie going wrong;  then set it, with a one-line why.
- Always NAME a slot, so `match.groups` keeps its key.  Add one mixed-operator line to the probe ledger,
  `src/grammar.probes.test.ts`.

## File => block => line => statement

- `Block.parse()` (`packages/spell/src/rules/Block.ts`) loops over the root `BlockToken`'s items:
  - a `LineToken` => `parser.parse(items, "line", scope)` -- passes ALL remaining items, so a statement can
    take the indented block after it
  - a nested `BlockToken` nobody claimed => parsed recursively in the SAME scope
  - `items.splice(0, match.length)` -- a header + its nested block is one item of length 2
- `BlockLine.parse()` (`packages/spell/src/rules/BlockLine.ts`), in order:
  1. blank line => `blank_line`
  2. pop a trailing comment
  3. parse the rest as `"statement"`;  leftovers become a `parse_error`
  4. `commitStatement()` -- the ONLY place a parsed statement changes scope, and only for the line's winner:
     - `mutateScope()` on the statement, then on each inline statement inside it, outermost first
     - if the rule takes a nested body and the next item is a `BlockToken` => `parseNestedBlock()`
- `SpellStatement` (`packages/spell/src/rules/Statement.ts`):
  - A body keyword ending `syntax` -- `{statement_body}`, `{expression_body}`, etc, see `BODY_KEYWORDS` -- or a choice of them,
    is taken OUT of `rules` into `rule.bodySpec` at construction.
    A body is parsed in `match.nestedScope`, which needs the statement's match to exist first.
  - Inline body => after its sequence matches, `parse()` parses the rest of the line in `nestedScope`.
    Does NOT change scope -- this runs for every candidate, winners AND losers.
  - The inline statement OR nested block is recorded as `match.data.body`:  read it with `rule.getBody(match)`,
    NEVER by group name.
  - Anything that parses a `"statement"` on its own and keeps it MUST commit it:  `commitStatement()`
    (`Statement.ts`), e.g. JSX `on...` handlers, or generically `parser.commit(match)`, e.g. rule unit tests
    (`unitTestModuleRules`, `Parser.testRules()`).
  - `parseNestedBlock()` parses a `{nested_statements}` as `"block"` in `statement.nestedScope` and sets
    `data.enclose`;  a `{nested_expression}` (e.g. `return`) accepts a single-line block only
  - `nestedScope` comes from `rule.getNestedScopeForMatch()`:  default is the same scope;
    `if`/`else` => new `BlockScope`;  methods, events, property getters, list loops => new `MethodScope`
- Errors are never thrown.  `parse_error` matches roll up into `match.data.errors` on `line` / `block`
  matches (`Block.getParseErrors()`), and compile to `/* PARSE ERROR: ... */`.
  - errors inside JSX `{...}` live in the JSX rules' `match.data`, not `matched`;  `BlockLine` gathers them from
    anywhere in its statement (`SpellJSX.parseErrorsIn()`) into `data.errors` too -- reported, but compiled in place

## Scope:  what's stored where

- All scope collections are `ScopeList`s (`packages/parser/src/scope/ScopeList.ts`):  `get` / `add` / `replace` only, no remove.
  `get()` checks own items, then falls through to the parent list.  Changes are journaled -- see "Incremental parsing".
- `Scope` owns nothing;  `variables` / `types` / `constants` / `rules` / `parser` all forward to `parentScope`.
- `BlockScope` owns `variables` + `methods`.  `FileScope` is a `BlockScope`, so a file owns only variables.
- `RootScope` adds `types`, `constants`, `rules`.  `ProjectScope` is a `RootScope`.
  `SpellParser.rootScope` is ONE static root shared by every project.
- `MethodScope` adds args, plus `this` / `it` alias variables.  `TypeScope` holds instance + class variables.

## Scope:  who changes it, and when

- Changes happen ONLY in `mutateScope()`, run by `commitStatement()` (step 4 above) -- `getAST()` is pure, see below:
  - variables:  `assignment_statement`, `get` (`packages/spell/src/rules/assignment.ts`) -- into `match.scope`,
    so inside a body they stay local
  - `get` / `set it to` ALWAYS declare a new `it` (`declareIt()`):  plain `it`, then `it_2`, `it_3`... numbered
    from the visible `it`'s `output`, skipping names in use -- so callbacks keep the `it` they captured
  - types:  `create_type`, `create_list_type` (`classes.ts`);  a type mentioned before its own line is a
    `stub`, which its real declaration later claims (`TypeScope.claim()`, journaled)
  - properties:  every property statement records the property in its type's `variables`, with `declaredBy`
    (`TypeScope.declareProperty()`) -- for editors only, nothing parsed later reads them, so a getter is
    `changesScope: "internal"`.  An enumerated one (`define_property_has`) also adds constants for each value,
    a plural `classVariables` entry (e.g. `Suits`), AND a rule
- Every record a `mutateScope()` adds -- `ScopeVariable`, `ScopeConstant`, `TypeScope`, `ScopeRule` -- carries
  `declaredBy`, the match which declared it (for go-to-definition etc.), and a `ScopeRule` its built
  `instances`, so a call-site `match.rule` maps back to its definition.  `MethodScope` stamps its
  `declaredBy` on the argument / alias variables it makes.
  - `ScopeList.add()` also notes each such record on its declaring match, as `match.data.declared`
    (`ScopeList.noteDeclared()`;  `TypeScope.claim()` too) -- so COMPILING a statement can say what it declared,
    without looking up scope.  See `SP.SpellDeclarations.commentFor()`.
  - A re-parsed statement takes back a record an earlier parse of itself left -- same rule, line and file
    (`TypeScope.sameStatement()`):  journal replay can resurrect one, declared by a match that's gone.
- What a statement declares, for editors' symbol lists, comes from its rule:  `@proto static declares`, or a
  `getDeclaration()` override (`assignment` only counts NEW variables, `MethodDefinition` reads its signature).
- How editors colour a match's OWN tokens comes from its rule's `highlightAs`, e.g. `property`:  defaults on
  `Keyword(s)` / `Symbol(s)` / `SpellIdentifier` / `SpellType` / `SpellConstant`, else on the rule class.
  `SpellLanguageService` refines it from `match.data`, e.g. an argument's `variable` becomes `parameter`.
  - quoted aliases (`a card "is face up" if ...`):  `quoted_type_expression` (`methods.ts`) adds an
    `expression_suffix` rule, a `MethodPostfixRule` / `MethodInfixRule`;  a quoted formula (`a card "is the (rank)
    of (suits)" for its ranks and its suits`):  `quoted_property_formula` (`classes.ts`), a `QuotedPropertyRule`
  - methods (`to turn (a card) over`):  `MethodDefinition` adds a rule (`methods.ts`).  Methods live ONLY as
    parser rules;  `scope.methods` is never filled in production.
- Types, constants and rules ALWAYS go to the project, from any depth.
- `scope.addRule()` (`packages/parser/src/scope/Scope.ts`) => `parser.addRule()` on the PROJECT's parser, plus a record in
  `ProjectScope.rules`.
  - `Parser.addRule()` clears the memoized `rules` map;  next `parser.rules` rebuilds the whole merge.
  - `mergeRule()` is copy-on-write:  existing `Group`s are cloned, never mutated.
  - There is NO `removeRule` -- but `parser.journal` can undo an `addRule()`, see "Incremental parsing".
  - Generated rules are NAMED classes `specialize()`d with plain-data statics (`EnumerationRule`,
    `QuotedPropertyRule` in `classes.ts`;  `DynamicMethodRule`, `MethodPostfixRule`, `MethodInfixRule` in
    `methods.ts`), never closures -- so `SP.SpellDeclarations` can write a project's rules out as data, and
    another project can rebuild them:  each base class says `@proto static importableAs = "<id>"`, which registers
    it for `P.Rule.importableRule(name)` (`Rule.protoDefined()`).
  - Each overrides `specialize()` to take a MINIMAL set, e.g. `{ output: "play_fizzbuzz", alias }`, working out
    `ruleName`, `methodName` etc. itself.  That set is what `specializedWith` remembers;  its
    `static declarationProps(declared, syntax)` says what of it -- plus `syntax` -- gets written out.
  - A quoted method's negatable word becomes its `Negatable` rule, e.g. `is` => `{operator:is}`, matching
    `is not` / `isn't` too;  `InfixOperatorSuffix.shouldNegateOutput()` asks `Negatable.isNegated(operator)`.
- Lookups record misses as `NONE` in `match.data`:  `scopeVar` / `scopeType` / `scopeConstant`.
  `known_variable` / `known_type` / `known_constant` reject `NONE`.
- `getAST()` NEVER changes scope or looks it up:  ASTs are built lazily, e.g. at compile, when scope may have
  moved on.  What an AST needs from scope is looked up WHILE PARSING into `match.data`:  `SpellIdentifier` /
  `variable` => `scopeVar`, `SpellConstant` => `scopeConstant`, `its_*` => `itVar`, `SpellType` => `scopeType`.
  A statement which declares something it also uses records it on that match, e.g. `property_value_either`.
- `await` makes its method `async` because the method's body contains it (`ASTMethodDefinition.isAsync`).

## Projects

- On disk:  `<repo>/projects/system/<domain>/<Project>/` for `@system:*` roots, `projects/user/<Project>/` for
  `@user:projects`, `projects/test/<Project>/` for `@test:fixtures` -- `serverPathForRoot()`
  (`packages/spell/src/node/project-utils.ts`), from `environment.systemFilesRoot` / `userFilesRoot` / `testFilesRoot` and each
  root's `folder` (default its `domain`).  A root with `devOnly` is listed in the app's UI in dev only.
- A root may have an `alias`, a short way to write its paths:  `@library/cards` ~== `@system:library:cards`,
  `@test/FizzBuzz/FizzBuzz.spell` ~== `@test:fixtures:FizzBuzz/FizzBuzz.spell`,
  `@examples/Solitaire` ~== `@system:examples:Solitaire`, `@guides/<Guide>` ~== `@system:guides:<Guide>`.
  `SpellLocation` expands it first (`SpellSetup.expandAlias()`), so ids are always stored in full.
- A project's `<Project>.compiled.js` and a fixture's `<Project>.snapshot.js` are never its own files:  the
  server leaves them out of its index (`isManifestFile()`), which would otherwise add them to `project.json`.
- `SpellProject` (`packages/spell/src/SpellProject.ts`):  files in `project.json` order,
  e.g. Card → Deck → Pile → Solitaire.
- `SpellProject` / `SpellFile` load over HTTP (`$fetch()` on `/api/projects/...`) -- via `LoadableFile.fetch`,
  which a node host swaps for `diskFetch()` (`packages/spell/src/node/disk-fetch.ts`) to answer the same URLs from disk.
- Each project `parse()` / `compile()` builds a FRESH `ProjectScope` with `parser.clone()` (empty own rules,
  imports the base spell parser).  Every file gets a `FileScope` under it and SHARES that parser.
- So one file's types, constants and rules are visible to every later file.
- Another project can come in WITHOUT its sources, as its declarations (`SP.SpellDeclarations`), INLINE in its
  compiled JS:
  - `Block.getAST()` puts a `/*! SPELL: DECLARES {...} */` comment right on each declaring statement's code,
    below any docstring -- indented in its class's body for a class member (`commentFor()`):  ONE flat JS object
    literal, 3-7 lines, merging the scope records it added (`declarationFor()`), e.g.
    `{ property: "suit", classVariable: "Suits", rule: "enumeration", of: "Card", enumeration: [...] }`.
    - `rule` is the `importableAs` of the class its rule was `specialize()`d from;  what that took sits beside it,
      e.g. `output` -- loading passes the whole object to `specialize()`, which picks out its own.
    - Leaves out what loading works out, e.g. an enumeration's constants, or a rule's owner (`of`, else `output`).
    - `defined: "/Card.spell:222-283"` -- where the statement is:  its character offsets, project-relative.
    - NO line numbers:  a page with no sources matches the code to a scope pack's entry by what it declares,
      e.g. `property: "suit", of: "Card"` for `.../type:Card/property:suit` -- see `ScopesSource` in `packages/app/src/runner/`.
    - `kind` + `name` -- what its rule's `getDeclaration()` says, for editors, e.g. `name: "draw (a card)"` --
      unless a key already says, e.g. `type`.
  - `SpellProject` puts a one-line `/*! SPELL: PROJECT {...} */` header at the top (`header()`):  versions +
    `provides`
  - `read(compiled)` collects them back from the TEXT (`JSON5.parse()`), never running it
  - `importScope(root, imports)` => a `P.ImportScope` holding them -- the project's scope goes UNDER it, with a
    clone of its parser, so imports are a base layer the `journal` never records
    - its records have no `declaredBy`.  Editors read `declaredAt` instead (`P.DeclaredAt`:  full file path +
      offsets, from `defined`) on its types, variables and constants, and `declared` on its rules:  owner,
      what `getDeclaration()` said, and `declaredAt`
  - `project.json` `imports` entries naming a project (`@library/cards` ~== `@system:library:cards`) are
    `SpellProject.projectImports`.  Its "Loading" task reads each one's declarations out of its
    `<Project>.compiled.js` (`SpellDeclarations.read()`), and builds the `ImportScope` our scope goes under.
    `source: true` instead parses that project's `.spell` files ahead of ours (`sourceImportFiles`).
  - `import: ["Card:Playingcard", "*"]` loads `Card` as `Playingcard` (`SpellDeclarations.picked()` / `renamed()`):
    every loaded record naming it says `Playingcard` -- `type`, `superType`, `of`, `datatype` -- and rules built
    from them follow, e.g. `playingcard suits`.  Compiled JS imports `Card as Playingcard`.  Its `TypeScope` keeps
    `runtimeName: "Card"`, and runtime type checks compile to that (`ASTTypeExpression.runtimeName`):  the class
    is still `Card` when the code runs.  Types only, and compiled imports only.
  - After parsing, a type the project declares AND imports is a `parseError` (`checkImportClashes()`) --
    `create_type` declares an imported type again, just so it's seen.  Rule names may repeat:  they merge.
- Compiled spell uses NO globals -- it `import`s what it didn't declare (`SpellProject.importHeader()`):
  - `import { spellCore, Thing, List, App } from "@spell/core"` (`SC.SPELL_CORE_MODULE`)
  - `import { Card, Deck } from "@spell/project/<projectId>"` for each compiled import (`ImportScope.modules`)
  - types compile to `export class`, top-level functions to `export function`, top-level vars to `export let`
  - see "Classes" under Compile for what goes in a class's body
  - NO import map:  every runner -- the app, VS Code's, `<spell-app>` -- runs compiled code from a `blob:` URL,
    with its specifiers rewritten (`runCompiled()` / `linkModule()` in `packages/app/src/runner/`):  `@spell/core` => the
    runtime it runs on (`spellRuntime.ts`), `@spell/project/<projectId>` => that project's compiled JS, fetched
    and linked the same way, afresh each run.  The app, parser and forms NEVER load `spellCore` themselves.
- ALL files parse first, then ALL compile, so lazy compile-time lookups see the whole project.
- Editor (`packages/app/src/editor.ts` `onInputChanged`) => `project.updateText(file, text)` on every keystroke, which calls
  `updatedContentsFor(file)`:  `project.incremental.update()` re-parses what changed right away, and hands changed
  files their new match.  If that couldn't cope, `updateText()` parses from scratch straight away.
  After 2s:  compiles, saves `<Project>.compiled.js` and runs it.
- A crash while parsing (a rule threw, NOT an error in the spell) is left in `project.parseError`.
- `SpellProject`'s parse task list keeps its scope + `incremental` while they're good (`needsFullParse`), else
  starts over:  new project scope, `parseImports()` builds a new `IncrementalProject`.

## Incremental parsing

- `P.IncrementalProject` (`packages/parser/src/IncrementalProject.ts`):  a project's spell files, in order, sharing ONE
  project scope + parser.  `update(path, text)` => the files whose match changed.  Owned by `SpellProject`.
- `P.ParseJournal` (`parser.journal`):  every change parsing makes to shared state, undoable + redoable.
  - recorded by `ScopeList.add()` / `.replace()` (swap in a NEW items array) and `Parser.addRule()` (`#ownRules`)
  - `mark()` a point, `rewindTo(mark)` undoes everything after it, `replay()` puts it back -- marks included
  - only state existing AT the mark needs recording:  anything newer is re-parsed, or replayed back the same
- `P.IncrementalParse` (`packages/parser/src/IncrementalParse.ts`), one per file:
  - parses TOP-LEVEL items one by one (`parser.parseItem()`), with a journal mark before each.  An item match covers
    a line, or a header line + its indented body (`line` match `tokens` === `[LineToken, BlockToken]`).
  - `update(text)` diffs old vs new top-level items (source text + indent), then:
    - ONE item's indented body changed => `"body"`:  rewind to `parser.getBodyMark()` (taken by `commitStatement()`
      just before the body parsed), `SpellParser.reparseBody()` => `BlockLine.reparseBody()`, then replay every
      later entry -- later items + files are kept.  Kept tokens after it are moved (`Tokenizer.moveTokens()`).
      Only if nothing in old or new body `changesGlobalScope()`, and the body's nested scope isn't the header's.
    - anything else:  rewind to the item holding the first change -- or the one BEFORE it, if the change starts
      with an indented block that item may now take -- and re-parse from there.  Once back in step with the
      unchanged items at the end, `canKeepFrom()`:
      - no `"global"` changes in the old or new region, AND same file-variable names after it (each item records
        them) => `"region"`:  replay everything after -- later files too -- and move its tokens
      - else => `"rewound"`:  re-parse the rest of the file.  That took back every LATER file too:
        `IncrementalProject` re-parses them with `parseAll()`.
  - `keepLastGood` (opt-in, `SpellProject` turns it on):  each item that ISN'T broken (`parser.isBrokenItem()`:
    didn't parse, or has parse errors) records its journal entries as `lastGood`.  Editing one item into a BROKEN
    state (same number of root tokens) undoes what it changed and replays its `lastGood` instead, so later lines
    still see e.g. the method it declared.  Its broken match stays, so its error shows.  `canKeepFrom()` then
    keeps everything after it:  same `lastGood` => same changes.  Deliberately NOT what a full parse gives.
    NOTE: a header broken so badly it no longer takes its indented body changes size => not kept.
  - file match rebuilt with `parser.assembleFile()` => `Block.assembleBlock()`.
- `rule.getScopeChanges()`:  `changesScope` if set (`@proto static`), else `undefined` (no
  `mutateScope()`) or `"global"` (has one -- assume the worst).  `assignment` / `get` say `"internal"`:  their
  variables go in their own `match.scope`.
- If an `update()` throws (a rule crashed committing a line), `IncrementalProject.isBroken`:  next update re-parses
  every file from scratch.
- Cost, Solitaire, vs full parse ~110ms:  body edit ~10ms;  comment / blank line / top-level statement anywhere
  ~1-2ms;  declaration edit near the END ~1ms, near the START of the first file ~110ms (~= full parse).
- `packages/parser/src/IncrementalProject.test.ts` edits lines of every Solitaire file (every line with `INCREMENTAL_FULL=1`),
  on ONE project, and after each edit -- and after undoing it -- checks output, errors and token positions against
  a full parse.  `packages/parser/src/ParseJournal.test.ts` checks a whole project's rewind / replay.

## Compile

- `Match.compile()` => `match.AST?.compile()`.  `Match.AST` is memoized;  `ASTNode.compile()` is not.
- A block compiles as its statements joined with `\n`;  nesting indents by re-joining with `\n` + 2 spaces
  (`stringify.INDENT` -- NEVER a tab), so a statement's output doesn't depend on its depth.
- A DECLARATION's docstring -- comment-only lines directly above it, else the comment on its own line --
  compiles as one `/** ... */` in place of those `//` lines (`getDocComments()`, `Block.ts`), above its
  `SPELL: DECLARES` comment:  after any `/* SPELL: added rule ... */` notes the statement makes.  A `##` heading
  is part of it only if DIRECTLY above;  one followed by a regular comment compiles as a `// ## heading` banner.  Worked out from
  the block's lines when asked, never stored while parsing:  an edited comment line re-parses on its own.
  The language server shows the same docstring on hover and in completion.
- A heading at a FILE's top level also compiles to `spellCore.heading("set up all piles")`, just above its own
  lines (`P.ASTHeadingInvocation`) -- so as the program runs, the Thing Explorer knows which heading's code made
  each thing.  NOT in a plain block, e.g. a rule test's, nor for a heading with no text, e.g. `##########`.
- Classes compile as a hand-written class would:  each MEMBER in its class's body, wherever it was declared.
  - A member is a `P.ASTClassMember`, which knows its class (`typeName`) and compiles two ways:
    - in its class's body (`compileAsMember()`), e.g. `get title() {...}`, `draw() {...}`, `static Suits = [...]`
    - patched on from outside (`compile()`), e.g. `Card.prototype.play = function () {...}` -- when its class
      isn't compiled with it:  it's from another project, or a rule test compiles the statement alone
  - A property is a getter / setter pair over the instance's reactive props (spell cells, `P.ASTReactiveProperty`):
    `this.getProp('title')` / `this.setProp('title', value)`.  NEVER a class field:  that would shadow the accessor,
    and nothing would redraw.
    - What it's checked against and its default go in the class's SCHEMA, declared once:
      `static { this.declareProp('title', { type: 'text' }) }` in the class (`Todo.declareProp(...)` from outside),
      `{ init: () => new List() }` for a default made per instance.  The same runtime shape as a hand-written
      class's `@prop({ type: 'text' }) accessor title`.  Older output's `setProp(name, value, check)` still runs.
  - `Block.getAST()` makes each declaring line ONE `P.ASTStatementGroup` -- docstring, `SPELL: DECLARES`
    comment, code -- then `SP.hoistClassMembers()` moves each member into its class's body, if that's in the block.
    Comments directly above a member go with it, e.g. a `## properties` banner -- past a heading's
    `spellCore.heading()` call, which stays put.  Everything else stays put too.
  - A project then does the same across ALL its files (`SpellProject.combineCompiled()`), so `Card.move_to_$pile`
    from `Pile.spell` ends up in `Card.spell`'s class.  So does `compiledFixture()`.  NEVER mutates an AST:  a class
    which gets members is a NEW `P.ASTClassDeclaration` (`withMembers()`).

## Language server

- `packages/lsp/src/` (`LSP`), run as `yarn start:lsp` -- or by the VS Code extension in `packages/vscode/`, which spawns the
  repo's own `tsx` on `packages/lsp/src/server.ts`.  `stdioGuard.ts` sends `console.*` to stderr first:  stdout is the protocol.
- Hosts the SAME `SpellProject` / `SpellFile` the app uses, and takes everything from them:  `project.spellFiles`,
  `file.isActive`, `project.parseError`, and edits through `project.updateText()`, exactly as the app's editor does.
  All `SpellLanguageService` adds is `LSP.FileAddresses`:  the editor's URI for each file.
- Used twice:  by VS Code over stdio, and IN-PROCESS by the app's Monaco editor (`packages/app/src/ui/monaco/`), whose
  `SpellModels` keep one Monaco model per file in step with `file.contents` (edits go through `updateText()`),
  and whose `SpellLanguageFeatures` call the service and convert its answers with `LspToMonaco`.
  - The app shows one project at a time;  `<spell-editor>`s on a page show one each, all in one Monaco -- each
    `SpellModels.use()`s its project, so another's models don't replace them.
- `SpellDiskWorkspace` is the stdio server's:  loads from disk via `LoadableFile.fetch` (above), maps a `.spell`
  file to its project (nearest `project.json`), parses the project on first sight, and reacts to disk changes.
  Node-only, so it's NOT in the `$/lsp` barrel, which MUST stay browser-safe (`packages/lsp/src/barrel.test.ts`).
- `SpellLanguageService` answers from each file's current `match`, never re-parsing:
  - positions from match / token OFFSETS, never `token.line` / `ch`
  - symbols from `rule.getDeclaration()`, colours from `rule.highlightAs`
  - definition / references from the scope record a word resolved to while parsing (`data.scopeVar` etc.)
    and that record's `declaredBy`;  method calls from `ScopeRule.instances`;  properties from their type's
    `variables` (`TypeScope.declareProperty()`), else by name
- Formatting is `P.TokenFormatter` (`packages/parser/src/tokenizer/`), indenting with TABS always:  whitespace only, from the tokens -- no
  pretty-printer, the AST is a javascript tree.  Indent LEVELS come from indent widths, not the tokenizer's blocks
  (which nest one per whitespace character).  It re-tokenizes its result and gives up if anything but whitespace
  changed.  NOTE: a blank line takes the indent of the line AFTER it, unless it has its own -- so dropping the tab
  on a blank line can move that blank line in the compiled javascript, never the code.
- Completion mid-statement is `expectedNext()`:  the line up to the cursor through `parser.expectedAfter()`
  (see Rules and matching).  Each expectation offers the rest of a method call as a snippet, the names that fit
  it -- by the `highlightAs` of the rules it can start with (`firstKinds()`), never rule names -- and its words.
  What only `continues` something complete, e.g. operators, only when the word being typed starts it.
- Signature help is `signatureHelp()`, from the same parse:  the INNERMOST call to one of the project's methods
  anything was waiting in (next, or `within`), its arguments its call rule's `{subrules}`, the active one counted
  from where it was waiting.
- Quick fix (`codeActions()`):  words that didn't parse get "Define `to <phrase>`" -- the phrase a whole line, or
  a statement that parsed (an inline body's too) PLUS the words left over after it:  `shuffle the deck 3 times`.
  Its words become a signature, each longest run that parses as an expression a parameter, inserted above its
  top-level statement, as a method is only visible AFTER it.  Once defined, the longest match wins, so the line
  parses as the new method.  NOT for a phrase that's just unfinished (`expectedAfter()` again):  `set x to`.
- Code lens (`codeLens()`):  "N references" above each type and method, counted only when an editor resolves it
  (`resolveCodeLens()`) -- counting walks the project.  Clicking runs `SHOW_REFERENCES`, which each EDITOR defines:
  the VS Code extension's `spell.showReferences`;  in the app, Monaco's own `editor.action.showReferences`.
- Semantic tokens come as DELTAS too (`semanticTokensDelta()`), from one kept `SemanticTokensBuilder` per file.
  NOTE: a builder keeps what was pushed until `previousResult()` starts afresh -- `build()` doesn't.

## Testing a whole project

- `parseSpellProject()` / `loadExampleProject()` / `summarize()` (`src/test/parseSpellProject.ts`) parse + compile
  a project headlessly, exactly as `SpellProject` does.  `summarize()` is the "same as a full parse" reference.
- `packages/spell/src/SpellProject.test.ts` snapshots Solitaire's compiled output + errors, and benchmarks with `BENCH=1`.
