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
- [V] `app/ui/CodeMirror.ts`: `import "./CodeMirror-JSHINT"` is commented out, so `global.JSHINT` never set;
  `outputOptions.lint: true` has nothing to call.  Output editor lint gutter silently dead.

- `app/ui/ConsoleViewer.tsx` `getDerivedStateFromProps`: says "Clear `state.error` if ...???" but `return oldState || {}` never clears it,
  unlike `MatchViewer` / `ASTViewer`.

- `app/ui/modals/modals.types.ts` `ModalComponentProps.id`: `<ModalRoot>` passes `key` (not forwarded), never `id`.

- `parser/ast/renderAST.tsx` `InCurlies` / `InSquareBrackets`: no empty-children case, unlike `stringifyAST.ts` twins.
  Latent: `DestructuredAssignment.renderChildren()` calls `render.InCurlies` directly.

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

- `app/pages/ProjectSettings.tsx`: unrouted, hardcoded demo data; `store.showProjectSettings()` is a stub.

- `environment.ts`: `systemFilesRoot` and `userFilesRoot` both `srcDir`; server's owner-based split is a no-op.

## 5. Structure / AGENTS.md conformance (your call)

- `spellCore/index.ts` header claims `assert` is global for compiled spell; only `global.spellCore` assignment found.

- `util/DOM.ts` uses ambient `global`; `abortableFetch.ts` imports `global` polyfill.

## 6. Open questions left as `TODO` in code

- `parser/rules/Subrule.ts` `getGroupSpecContribution()`: assumes anonymous `{foo}` lands in `groups.foo`.  Not true if `foo` resolves to a single rule registered only under ALIAS `foo` -- match keeps that rule's own name.  Does real parsing have the same surprise?

- `rules/if.ts` `else_if`: is `precedence` load-bearing, or does rule order suffice?

- `rules/Sequence.ts` `parse()`: author's `TODOC: WHY?? FOR USE AS A LITERAL STRING??` still unanswered.
