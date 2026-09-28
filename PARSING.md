# How parsing works

Compact map of the parse pipeline, so agents don't have to re-derive it.
MUST be kept up to date when `Parser`, `SpellParser`, scopes, or the `Block` / `BlockLine` / `SpellStatement`
machinery changes -- see `AGENTS.md`.  File refs are `path:line` as of 2026-09-27;  trust the code if they drift.

## Text => tokens

- `Parser.parse(input, ruleName, scope)` (`src/parser/Parser.ts`) tokenizes, then `scope.getRuleOrDie(ruleName).parse()`.
- `SpellParser.tokenize()` (`src/languages/spell/SpellParser.ts`) calls `Tokenizer.tokenize()`, and for the `"block"`
  rule then `breakIntoIndentedBlocks()` (`src/parser/tokenizer/Tokenizer.ts`):
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
- `Choice.parse()` (`src/parser/rules/Choice.ts`) calls `parse()` on EVERY alternative, then `getBestMatch()`:
  - highest `precedence`, then longest match, then EARLIEST rule
- `Sequence.parse()` (`src/parser/rules/Sequence.ts`) first runs `Sequence.test()`:
  - fixed words / symbols / patterns are checked where they must fall, subrules are skipped
  - rejects ~92% of attempts before any child parses
  - then each child is parsed at the head of the remaining tokens
- `Subrule` looks its rule up BY NAME through `scope.getRuleOrDie()` at call time, so rules added mid-parse
  are visible to later lines.
- `Literal` / `Literals` / `Pattern` / `TokenType` compare single tokens with `===` / regex -- cheap.
- Cost, warm (`BENCH=1` run of `src/languages/spell/SpellProject.test.ts`, 2026-09-27):
  Card.spell (121 lines) ~14ms, Solitaire.spell (259 lines) ~77ms, whole Solitaire project ~100ms.
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

## File => block => line => statement

- `Block.parse()` (`src/languages/spell/rules/Block.ts`) loops over the root `BlockToken`'s items:
  - a `LineToken` => `parser.parse(items, "line", scope)` -- passes ALL remaining items, so a statement can
    take the indented block after it
  - a nested `BlockToken` nobody claimed => parsed recursively in the SAME scope
  - `items.splice(0, match.length)` -- a header + its nested block is one item of length 2
- `BlockLine.parse()` (`src/languages/spell/rules/BlockLine.ts`), in order:
  1. blank line => `blank_line`
  2. pop a trailing comment
  3. parse the rest as `"statement"`;  leftovers become a `parse_error`
  4. `commitStatement()` -- the ONLY place a parsed statement changes scope, and only for the line's winner:
     - `mutateScope()` on the statement, then on each inline statement inside it, outermost first
     - if the rule takes a nested body and the next item is a `BlockToken` => `parseNestedBlock()`
- `SpellStatement` (`src/languages/spell/rules/Statement.ts`):
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

- All scope collections are `ScopeList`s (`src/parser/scope/ScopeList.ts`):  `get` / `add` / `replace` only, no remove.
  `get()` checks own items, then falls through to the parent list.  Changes are journaled -- see "Incremental parsing".
- `Scope` owns nothing;  `variables` / `types` / `constants` / `rules` / `parser` all forward to `parentScope`.
- `BlockScope` owns `variables` + `methods`.  `FileScope` is a `BlockScope`, so a file owns only variables.
- `RootScope` adds `types`, `constants`, `rules`.  `ProjectScope` is a `RootScope`.
  `SpellParser.rootScope` is ONE static root shared by every project.
- `MethodScope` adds args, plus `this` / `it` alias variables.  `TypeScope` holds instance + class variables.

## Scope:  who changes it, and when

- Changes happen ONLY in `mutateScope()`, run by `commitStatement()` (step 4 above) -- `getAST()` is pure, see below:
  - variables:  `assignment_statement`, `get` (`src/languages/spell/rules/assignment.ts`) -- into `match.scope`,
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
- What a statement declares, for editors' symbol lists, comes from its rule:  `@proto static declares`, or a
  `getDeclaration()` override (`assignment` only counts NEW variables, `MethodDefinition` reads its signature).
- How editors colour a match's OWN tokens comes from its rule's `highlightAs`, e.g. `property`:  defaults on
  `Keyword(s)` / `Symbol(s)` / `SpellIdentifier` / `SpellType` / `SpellConstant`, else on the rule class.
  `SpellLanguageService` refines it from `match.data`, e.g. an argument's `variable` becomes `parameter`.
  - quoted aliases (`a card "is face up" if ...`):  `quoted_property_formula` adds an `expression_suffix` rule
  - methods (`to turn (a card) over`):  `MethodDefinition` adds a rule (`methods.ts`).  Methods live ONLY as
    parser rules;  `scope.methods` is never filled in production.
- Types, constants and rules ALWAYS go to the project, from any depth.
- `scope.addRule()` (`src/parser/scope/Scope.ts`) => `parser.addRule()` on the PROJECT's parser, plus a record in
  `ProjectScope.rules`.
  - `Parser.addRule()` clears the memoized `rules` map;  next `parser.rules` rebuilds the whole merge.
  - `mergeRule()` is copy-on-write:  existing `Group`s are cloned, never mutated.
  - There is NO `removeRule` -- but `parser.journal` can undo an `addRule()`, see "Incremental parsing".
  - Generated rule classes close over their DEFINING match (`methods.ts`, `classes.ts`).
- Lookups record misses as `NONE` in `match.data`:  `scopeVar` / `scopeType` / `scopeConstant`.
  `known_variable` / `known_type` / `known_constant` reject `NONE`.
- `getAST()` NEVER changes scope or looks it up:  ASTs are built lazily, e.g. at compile, when scope may have
  moved on.  What an AST needs from scope is looked up WHILE PARSING into `match.data`:  `SpellIdentifier` /
  `variable` => `scopeVar`, `SpellConstant` => `scopeConstant`, `its_*` => `itVar`, `SpellType` => `scopeType`.
  A statement which declares something it also uses records it on that match, e.g. `property_value_either`.
- `await` makes its method `async` because the method's body contains it (`ASTMethodDefinition.isAsync`).

## Projects

- `SpellProject` (`src/languages/spell/SpellProject.ts`):  files in `.imports.json` order,
  e.g. Card → Deck → Pile → Solitaire.
- `SpellProject` / `SpellFile` load over HTTP (`$fetch()` on `/api/projects/...`) -- via `LoadableFile.fetch`,
  which a node host swaps for `diskFetch()` (`src/server/disk-fetch.ts`) to answer the same URLs from disk.
- Each project `parse()` / `compile()` builds a FRESH `ProjectScope` with `parser.clone()` (empty own rules,
  imports the base spell parser).  Every file gets a `FileScope` under it and SHARES that parser.
- So one file's types, constants and rules are visible to every later file.
- ALL files parse first, then ALL compile, so lazy compile-time lookups see the whole project.
- Editor (`src/app/editor.ts` `onInputChanged`) => `project.updateText(file, text)` on every keystroke, which calls
  `updatedContentsFor(file)`:  `project.incremental.update()` re-parses what changed right away, and hands changed
  files their new match.  If that couldn't cope, `updateText()` parses from scratch straight away.
  After 2s:  compiles, saves `.output.js` and runs it.
- A crash while parsing (a rule threw, NOT an error in the spell) is left in `project.parseError`.
- `SpellProject`'s parse task list keeps its scope + `incremental` while they're good (`needsFullParse`), else
  starts over:  new project scope, `parseImports()` builds a new `IncrementalProject`.

## Incremental parsing

- `P.IncrementalProject` (`src/parser/IncrementalProject.ts`):  a project's spell files, in order, sharing ONE
  project scope + parser.  `update(path, text)` => the files whose match changed.  Owned by `SpellProject`.
- `P.ParseJournal` (`parser.journal`):  every change parsing makes to shared state, undoable + redoable.
  - recorded by `ScopeList.add()` / `.replace()` (swap in a NEW items array) and `Parser.addRule()` (`#ownRules`)
  - `mark()` a point, `rewindTo(mark)` undoes everything after it, `replay()` puts it back -- marks included
  - only state existing AT the mark needs recording:  anything newer is re-parsed, or replayed back the same
- `P.IncrementalParse` (`src/parser/IncrementalParse.ts`), one per file:
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
- `src/parser/IncrementalProject.test.ts` edits lines of every Solitaire file (every line with `INCREMENTAL_FULL=1`),
  on ONE project, and after each edit -- and after undoing it -- checks output, errors and token positions against
  a full parse.  `src/parser/ParseJournal.test.ts` checks a whole project's rewind / replay.

## Compile

- `Match.compile()` => `match.AST?.compile()`.  `Match.AST` is memoized;  `ASTNode.compile()` is not.
- A block compiles as its statements joined with `\n`;  nesting indents by re-joining with `\n\t`,
  so a statement's output doesn't depend on its depth.
- A DECLARATION's docstring -- comment-only lines directly above it, else the comment on its own line --
  compiles as one `/** ... */` in place of those `//` lines (`getDocComments()`, `Block.ts`), right on its code:
  after any `/* SPELL: added rule ... */` notes the statement makes.  A `##` heading
  is part of it only if DIRECTLY above;  one followed by a regular comment compiles as a `// ## heading` banner.  Worked out from
  the block's lines when asked, never stored while parsing:  an edited comment line re-parses on its own.
  The language server shows the same docstring on hover and in completion.

## Language server

- `src/lsp/` (`LSP`), run as `yarn start:lsp` -- or by the VS Code extension in `vscode-extension/`, which spawns the
  repo's own `tsx` on `src/lsp/server.ts`.  `stdioGuard.ts` sends `console.*` to stderr first:  stdout is the protocol.
- Hosts the SAME `SpellProject` / `SpellFile` the app uses, and takes everything from them:  `project.spellFiles`,
  `file.isActive`, `project.parseError`, and edits through `project.updateText()`, exactly as the app's editor does.
  All `SpellLanguageService` adds is `LSP.FileAddresses`:  the editor's URI for each file.
- Used twice:  by VS Code over stdio, and IN-PROCESS by the app's Monaco editor (`src/app/ui/monaco/`), whose
  `SpellModels` keep one Monaco model per file in step with `file.contents` (edits go through `updateText()`),
  and whose `SpellLanguageFeatures` call the service and convert its answers with `LspToMonaco`.
- `SpellDiskWorkspace` is the stdio server's:  loads from disk via `LoadableFile.fetch` (above), maps a `.spell`
  file to its project (nearest `.imports.json`), parses the project on first sight, and reacts to disk changes.
  Node-only, so it's NOT in the `~/lsp` barrel, which MUST stay browser-safe (`src/lsp/barrel.test.ts`).
- `SpellLanguageService` answers from each file's current `match`, never re-parsing:
  - positions from match / token OFFSETS, never `token.line` / `ch`
  - symbols from `rule.getDeclaration()`, colours from `rule.highlightAs`
  - definition / references from the scope record a word resolved to while parsing (`data.scopeVar` etc.)
    and that record's `declaredBy`;  method calls from `ScopeRule.instances`;  properties from their type's
    `variables` (`TypeScope.declareProperty()`), else by name
- Formatting is `P.TokenFormatter` (`src/parser/tokenizer/`), indenting with TABS always:  whitespace only, from the tokens -- no
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
- `src/languages/spell/SpellProject.test.ts` snapshots Solitaire's compiled output + errors, and benchmarks with `BENCH=1`.
