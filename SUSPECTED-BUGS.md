# Suspected bugs found during documentation pass

Collected 2026-09-19 while documenting `src/` per `AGENTS.md`.  Everything you annotated `>>` has been
fixed and removed from this file; what's left is unannotated and untouched in the code.
`[V]` = checked against the code by hand.  Everything else is a subagent's reading and unverified.
Delete this file when done -- it is untracked scratch, not project documentation.

Disproven while fixing: `Tokenizer.matchJSXChildren` same-name nesting was NOT a bug -- `matchJSXChild()`
tries `matchJSXEndTag(endTagName)` (literal `</endTagName>` only) before recursing into `matchJSXElement`,
which consumes any nested element whole, so the outer loop never sees an inner open/close tag.  `nesting`
only ever steps 1 -> 0 on the correct tag; its `!== 0` branch catches genuinely unbalanced markup, which is
what the adjacent `TODO: how to surface this error???` is really about.  Code left unchanged.

## 1. Behavior bugs

- `test/unitTestModuleRules.ts` `compileMatch()`: a rule unit test NEVER checks that the rule consumed the
  whole input.  `compileMatch()` is `scope.parse(input, ruleName)` then `match.compile()` -- it compiles
  whatever matched and silently drops any tokens left over, so trailing garbage passes.  Two tests prove it:
  `` `pause for 2 seconds"` `` (async.ts `pause`) and `` `end print group"` `` (UI.ts `end_print_group`) each
  carry a stray `"`, and both are green.  (Those quotes are pre-existing -- they are in the file at HEAD --
  but the reason nobody ever noticed is this harness.)
  Real parsing does NOT behave this way:  `BlockLine.parse()` feeds leftover tokens to the `parse_error` rule
  and collects them into `match.data.errors`.  So every rule's unit tests are weaker than the parser they
  cover -- a `syntax` that under-matches its own test input looks correct.
  Likely fix: in `compileMatch()`, after a successful parse, fail unless `match.length` equals the tokenized
  input length.  MEASURED 2026-09-20 by adding exactly that check and running the suite:  only **10 of 1423**
  tests leave input unconsumed, in two clearly different groups --
  - 5 are the stray-`"` typos of §3 plus one more:  `pause` x3 (async.ts), `end_print_group` (UI.ts),
    `do_nothing` (`` `do nothing"` ``, statements.ts).  Fixing the typo fixes the test.
  - 5 are real "rule under-matches its own test input" cases worth a look:  rulex `list` on `` `[]` `` and
    `` `[{sub}]` ``, rulex `subrule` on `` `{}` ``, rulex `symbol` on `` `::` ``, and spell `number` on `` `1.` ``
    (does `1.` legitimately match just `1` and leave the `.`?).
  So the fix is small and tractable, not a 100-test cleanup;  left undone only because the 5 real cases each
  need a judgement call about the grammar.  Found 2026-09-20 during the `addRule()` definition rollout.

- `parser/rules/Choice.ts` `getBestMatch()`: two comments claimed it prefers LATER-defined rules on a tie ("takes
  LATEST one", "we run this BACKWARDS to put later-defined rules first").  It has always done the OPPOSITE -- the
  precedence loop runs forwards, and the length loop scans backwards with `>=`, so an equally-long EARLIER match
  replaces a later one.  Verified 2026-09-20 with a two-rule `Group`: the first-registered rule wins.  Comments now
  describe the real behaviour and `Rule.test.ts` pins it, but if the author's stated INTENT was right then the code
  is wrong and rule-ordering across every module would flip -- someone who knows the grammar should decide.

- `languages/spell/rules/UI.ts` `css`: reads `match.data.file` (was ad hoc `match.file`, documented as "set externally by `SpellCSSFile`") but NOTHING sets it -- `SpellCSSFile.parse()` doesn't.  So compiled output is always `spellCore.installStyles(undefined, ...)`.  Likely fix: `match.data.file = this.file` after parsing, but untested so left alone.

- `languages/spell/rules/draw.ts` `draw_items`: `draw the cards of the deck` compiles to `spellCore.drawThing(deck.cards)`, test expects `spellCore.drawItems(deck)`.  `draw_thing` wins on `precedence: 100` (see §3).  Never noticed because `draw.ts` had no `draw.test.ts`, so its embedded tests never ran -- file added 2026-09-20, this one case marked `skip`.

- [V] `languages/spell/rules/assignment.ts` `get.getAST`: `variables.replace("it")` unconditionally;
  sibling `assignment.getAST()` guards with `if (originalVar?.isAlias)`.  A real `it` variable loses `kind` / `datatype`.

- [V] `languages/spell/rules/lists.ts` `list_range_iteration`: only iteration rule that doesn't pass `mapItTo` --
  `it` not aliased inside `for each number from 1 to 10:` bodies.

- [V] `spellCore/ui.ts`: `notify` / `alert` / `confirm` / `prompt` statements (`rules/UI.ts`) compile to `spellCore.notify()` etc,
  but no such methods exist anywhere in `spellCore`.

- [V] `spellCore/SpellEvent.ts` instance `trigger`: calls `SpellEvent.trigger(this, event, props)` without `return`; typed `unknown[]`, results dropped.

- [V] `spellCore/classes/List.tsx` `_getZeroIndex`: `if (oneIndex === 0) return 1 // ???` -- returns second item.

- `app/ui/ConsoleViewer.tsx` `getDerivedStateFromProps`: says "Clear `state.error` if ...???" but `return oldState || {}` never clears it,
  unlike `MatchViewer` / `ASTViewer`.

- `app/ui/modals/modals.types.ts` `ModalComponentProps.id`: `<ModalRoot>` passes `key` (not forwarded), never `id`.

- `parser/ast/renderAST.tsx` `InCurlies` / `InSquareBrackets`: no empty-children case, unlike `stringifyAST.ts` twins.
  Latent: `DestructuredAssignment.renderChildren()` calls `render.InCurlies` directly.

- `[V]` `languages/spell/rules/classes.ts` `quoted_property_formula`:  a quoted alias of an UNKNOWN property, e.g.
  `a card "is a (rank)" for its ranksx`, still registers `_quoted_property_rule`, with no enumeration part in its
  syntax -- then compiling any use of it (`the card is a queen`) crashes in `compileASTExpression()`:
  `Cannot read properties of undefined (reading 'value')`, as `rhs` is `undefined`.  Crashes a full parse too.
  Probably wants a parse error instead of registering the rule -- see the `FIXME` in `computeBits()`.

- `spellCore/classes/App.tsx` `App.show()`:  calls `createRoot(element)` on the SAME `#REACT_APP_ROOT_ID` element every
  time a compiled app runs, e.g. each compile in the editor -- React warns "You are calling ReactDOMClient.createRoot()
  on a container that has already been passed to createRoot() before".  Probably wants to reuse (or unmount) the
  `REACT_ROOT` it already stashed on the element.

- `rules/methods.ts` `MethodDefinition.getRule()`, `_dynamicMethodRuleInfix.compileASTExpression()`:  builds
  `new P.ASTScopedMethodInvocation(match, ...)` with the OUTER `match` -- the method DEFINITION -- not the
  call-site `_match` it's given.  Its postfix sibling just above uses `_match`.  So every infix call's AST
  node claims the definition's source position, e.g. for source maps / editor ranges.  Found 2026-09-27
  while mapping dynamic rules' closures for precompiled packages.

## 2. Server robustness / security

- [V] `server/lock-utils.ts`: whole module has zero callers, while `saveFile()` / `saveImports()` / `getIndex()`
  do unguarded read-modify-write on `.imports.json`.  Wiring dropped, or dead code.

- `server/project-utils.ts` `request_createFile`: silently overwrites existing file; exists-check is client-side only.

- `server/project-utils.ts` `request_deleteFile`: "can't delete last file" guard is client-side only.

- `server/project-utils.ts` `request_renameApp` / `request_duplicateApp`: `fse.move()` / `fse.copy()` without `overwrite` --  existing target => raw 500 instead of "already exists".

- `server/response-utils.ts` `sendError`: always sends `error.stack` to client.

- Path handling (no bypass found): only client-path => disk-path conversion is monkey-patched `SpellLocation.prototype.serverPath`,
  relying wholly on `SpellLocation` constructor's `isValidPathSegment`.  Worth a dedicated review.

## 3. Wrong strings / types (cheap fixes)

- `util/LoadableFile.ts`: generic param `JSONFileType` on `JSONFile` / `JSON5File` shadows exported `JSONFileType` type.

- `parser/tokenizer/Tokens.ts`: `JSXExpressionTokenProps.contents` is `string | Token`; `JSXAttribute` value still `any`.

- `languages/spell/rules/draw.ts` `draw_thing`: `precedence: 100`, everything else uses ~1-20.

- `languages/spell/rules/methods.ts` `type_method_arg`: `method` fragment from `type.raw`, sibling `arg.name` uses `instanceCase(type.value)`.

- `languages/spell/rules/async.ts` `pause` tests: 3 of 4 input strings have a stray trailing `"` (`` `pause for 2 seconds"` ``, `` `pause for 500 msec"` ``, `` `pause for 10 ticks"` ``) that the 4th (`pause for (10 + 10) sec`) doesn't -- looks like a copy-paste typo, not intentional. Left byte-for-byte while converting to `addRule()` per the rollout guide.

- `languages/spell/rules/UI.ts` `end_print_group` test: input `` `end print group"` `` has the same stray trailing `"`. Same as above.

## 4. Dead / redundant code

- `parser/rules/Choice.ts` constructor: used to assign copied `rules` onto caller's `props` -- with `clone()` passing the rule itself, that re-wrote the ORIGINAL group's `rules` on every clone.  Harmless (equal copy) but fixed in passing.

- `rules/methods.ts` `typed_method_arg`: post-construction `arg.datatype = type.value` workaround; `VariableExpressionProps` declares `datatype`.

- `rules/math.ts` `gt_lt.getAST` / `is_gt_lt.getAST`: unreachable (output comes via `compileASTExpression()`).

- `parser/ast/AST.tsx` `MethodDefinition.renderError()`: never called.

- `parser/rules/Pattern.ts` constructor: `instanceof RegExp` branch unreachable per types; only caller passes object.

- `parser/parser.types.ts` `RuleTestBlock.showAll`: set at several call sites, never read.

- `languages/spell/rules/assignment.ts` `get.mutateScope`: sets `match.data.itVar` (the original local
  `it` `ScopeVariable`, if any), but `get.getAST` never reads it -- only `match.data.isNewVariable`.
  Looks like dead state, found while converting the file to a rule class (2026-09-20).

- `languages/spell/rules/core.ts` `eat_whitespace`: never referenced anywhere in `src` (grepped) -- dead.
  Its old bag form (`constructor: class eat_whitespace extends P.Subrule {}`, `syntax: "{whitespace}*"`)
  was actually broken: `{whitespace}*` compiles to a `Repeat`, not a `Subrule`, so the deprecated
  `Parser.defineRule()` bag path's `props = { ...rule, ...props }` merge silently copied the compiled
  `Repeat`'s own `.rule` (a `Subrule` instance) onto our instance's `.rule`, which `Subrule.parse()` expects
  to be a rule-name STRING, not a nested `Rule` object -- would have thrown at parse time if ever exercised.
  Converting to a class (`Rule.instantiate()` / `initFromSyntax()`) correctly rejects this mismatch instead
  of silently mis-assembling it, so the class now extends `P.Repeat` (what the syntax actually compiles to)
  to match its likely original intent.  No behavior change since nothing calls the rule either way
  (found 2026-09-20 converting `core.ts` to rule classes).

- `spellCore/core.ts`: `repeat()` has no compiling rule; `get()` / `set()` are stubs with no callers.

- `spellCore/string.ts` `doubleQuote()`: no callers.

- `server/response-utils.ts`: `sendText`, `sendJavascript`, `sendTextFile`, `sendJSFile`, `sendJSONFile`, `convertNumericId`, `getIdParams` -- no callers.

- `util/ResponseErrors.ts`: `SaveError` never thrown.  `util/AppPrefStore.ts`: no callers (`prefs.ts` is what's used).

- `app/pages/ProjectChooser.tsx` `ProjectRootDisplay`: no call sites.

- `app/pages/ProjectSettings.tsx`: unrouted, hardcoded demo data; `editor.showProjectSettings()` is a stub.

- `environment.ts`: `systemFilesRoot` and `userFilesRoot` both `srcDir`; server's owner-based split is a no-op.

## 5. Structure / AGENTS.md conformance (your call)

- `spellCore/index.ts` header claims `assert` is global for compiled spell; only `global.spellCore` assignment found.

- `util/DOM.ts` uses ambient `global`; `abortableFetch.ts` imports `global` polyfill.

## 6. Open questions left as `TODO` in code

- `parser/rules/Subrule.ts` `getGroupSpecContribution()`: assumes anonymous `{foo}` lands in `groups.foo`.  Not true if `foo` resolves to a single rule registered only under ALIAS `foo` -- match keeps that rule's own name.  Does real parsing have the same surprise?

- `rules/if.ts` `else_if`: is `precedence` load-bearing, or does rule order suffice?

- `rules/Sequence.ts` `parse()`: author's `TODOC: WHY?? FOR USE AS A LITERAL STRING??` still unanswered.
