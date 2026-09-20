# Suspected bugs found during documentation pass

Collected 2026-09-19 while documenting `src/` per `AGENTS.md`.  No code was changed for any of these.
`[V]` = checked against the code by hand.  Everything else is a subagent's reading and unverified.
Delete this file when done -- it is untracked scratch, not project documentation.

## 1. Behavior bugs

- [V] `parser/rules/Rule.ts` `getRulexFlags()` vs `languages/rulex/rulex.ts` `testLocation`: inverted mapping.
  Rulex parses `…` => `ANYWHERE`, `^` => `AT_START`; `getRulexFlags()` stringifies `AT_START` => `…`, `ANYWHERE` => `^`.
  Round trip flips the flag.  Rulex tests back the rulex side, so `getRulexFlags()` is probably the wrong one.
  >> fix `getRulexFlags()`
  
- [V] `languages/spell/SpellFile.ts` `onRemove()`: `SpellFile.registry.clear()` wipes registry of EVERY loaded file.
  `SpellJSFile.onRemove()` correctly does `.delete(this.path)`.
  >> fix

- [V] `languages/spell/SpellCSSFile.ts` `onRemove()`: same, and also `.clear()`s shared `SP.SpellLocation.registry`.
  >> fix

- [V] `languages/spell/rules/expressions.ts` `is_same_type_as`: `is not the same type as` compiles identically to the positive form.
  `getOutputOperator()` computes `!==` but overridden `compileASTExpression()` ignores it.  Rule's own tests encode the wrong output.
  >> fix

- [V] `languages/spell/rules/assignment.ts` `get.getAST`: `variables.replace("it")` unconditionally;
  sibling `assignment.getAST()` guards with `if (originalVar?.isAlias)`.  A real `it` variable loses `kind` / `datatype`.


- [V] `languages/spell/rules/lists.ts` `list_range_iteration`: only iteration rule that doesn't pass `mapItTo` --
  `it` not aliased inside `for each number from 1 to 10:` bodies.


- [V] `spellCore/ui.ts`: `notify` / `alert` / `confirm` / `prompt` statements (`rules/UI.ts`) compile to `spellCore.notify()` etc,
  but no such methods exist anywhere in `spellCore`.


- [V] `spellCore/SpellEvent.ts` instance `trigger`: calls `SpellEvent.trigger(this, event, props)` without `return`; typed `unknown[]`, results dropped.


- [V] `util/extend.ts` `dependenciesMatch()`: `return item1 === item2` inside the loop -- only ever compares element 0.
>> test and fix

- [V] `spellCore/classes/List.tsx` `_getZeroIndex`: `if (oneIndex === 0) return 1 // ???` -- returns second item.

- [V] `server/project-utils.ts` `request_getFile`: `void responseUtils.sendFile(...)`, not wrapped in `respondWithJSON` --
  non-404 rejection => unhandled rejection, client hangs.
>> fix

- [V] `app/ui/CodeMirror.ts`: `import "./CodeMirror-JSHINT"` is commented out, so `global.JSHINT` never set;
  `outputOptions.lint: true` has nothing to call.  Output editor lint gutter silently dead.

- `parser/tokenizer/Tokenizer.ts` `matchJSXChildren`: `nesting` decremented on `endTagName` end tag but never incremented
  for nested same-name elements; mismatches may be swallowed by `while(true)` `break`.
  >> test and fix

- `util/Assertable.ts` `assertArrayType()`: `optional` param accepted but never used; array check hardcodes `OPTIONAL`.
  >> fix

- `util/$fetch.ts` `merge$fetchParms`: object-valued params (e.g. `headers`) replaced, not merged.
  >> merge, add test

- `app/ui/ConsoleViewer.tsx` `getDerivedStateFromProps`: says "Clear `state.error` if ...???" but `return oldState || {}` never clears it,
  unlike `MatchViewer` / `ASTViewer`.

- `app/ui/Notice.tsx` auto-hide: checks `notice === null` but `store.notice` is `string | undefined`.
  >> fix

- `app/ui/modals/modals.types.ts` `ModalComponentProps.id`: `<ModalRoot>` passes `key` (not forwarded), never `id`.


- `parser/ast/renderAST.tsx` `InCurlies` / `InSquareBrackets`: no empty-children case, unlike `stringifyAST.ts` twins.
  Latent: `DestructuredAssignment.renderChildren()` calls `render.InCurlies` directly.

## 2. Server robustness / security


- [V] `server/lock-utils.ts`: whole module has zero callers, while `saveFile()` / `saveImports()` / `getIndex()`
  do unguarded read-modify-write on `.imports.json`.  Wiring dropped, or dead code.

- `server/project-utils.ts` `request_createFile`: silently overwrites existing file; exists-check is client-side only.

- `server/project-utils.ts` `request_deleteFile`: "can't delete last file" guard is client-side only.

- `server/project-utils.ts` `request_renameApp` / `request_duplicateApp`: `fse.move()` / `fse.copy()` without `overwrite` --  existing target => raw 500 instead of "already exists".

- `server/api.ts`: catch-all `get("*")` / `post("*")` return 500 for unknown route; should be 404.
  >> fix

- `server/response-utils.ts` `sendError`: always sends `error.stack` to client.

- Path handling (no bypass found): only client-path => disk-path conversion is monkey-patched `SpellLocation.prototype.serverPath`,
  relying wholly on `SpellLocation` constructor's `isValidPathSegment`.  Worth a dedicated review.

## 3. Wrong strings / types (cheap fixes)


- `util/LoadableFile.ts` `getSaver()`: error message says `getLoader()`.
  >> fix

- `spellCore/collection-other.ts` assert messages name wrong function:
  - `removeRangeBetween` says `rangeStartingAt`
  - `forEachSequential` says `map`
  - `filter` says `all`
  >> fix

- `languages/spell/SpellProject.ts` `getFileLocation`: return type `SP.SP.SpellLocation`.
  >> fix

- `parser/scope/TypeScope.ts` constructor: `this.name = this.name = typeCase(this.name)`.
  >> fix

- `spellCore/runtime.ts` `startProcess(name, exclusively?: boolean)`: compiled spell passes string `'EXCLUSIVE'`.
  >> pass "EXCLUSIVE"

- `languages/spell/rules/math.ts` `absolute_value`: inline class is `class divided_by extends InfixOperatorSuffix` (copy/paste;  siblings extend `SpellExpression`).
  >> test and fix

- `util/LoadableFile.ts`: generic param `JSONFileType` on `JSONFile` / `JSON5File` shadows exported `JSONFileType` type.

- `util/CustomError.ts`: `CustomErrorProps.message` doc says "string or array of strings", type is `string`.
  >> fix foc

- `parser/tokenizer/Tokens.ts`: `JSXExpressionTokenProps.contents` is `string | Token`; `JSXAttribute` value still `any`.

- `languages/spell/SpellProjectRoot.ts` `/*@writeOnce*/` pragma lists `label`, `singular` (no such fields), omits `title`, `Type`, `icon`.
  >> fix

- `languages/spell/rules/draw.ts` `draw_thing`: `precedence: 100`, everything else uses ~1-20.

- `languages/spell/rules/methods.ts` `type_method_arg`: `method` fragment from `type.raw`, sibling `arg.name` uses `instanceCase(type.value)`.

## 4. Dead / redundant code


- `languages/spell/SpellProject.ts` `files` getter: leftover `console.info("getFiles", ...)` on every recompute.
  >> ditch

- Stale `MethodScopeProps` workarounds (type now extends `ScopeProps` and accepts strings); casts look removable:
  - `rules/events.ts` `on.getNestedScopeForMatch`
  - `rules/JSX.ts` `jsxAttribute.parse` (`on*` branch)
  - `rules/classes.ts` + `rules/lists.ts` `newMethodScope()` -- identical helper duplicated, `& P.ScopeProps` redundant
  >> test and fix

- `rules/methods.ts` `typed_method_arg`: post-construction `arg.datatype = type.value` workaround; `VariableExpressionProps` declares `datatype`.

- `rules/math.ts` `gt_lt.getAST` / `is_gt_lt.getAST`: unreachable (output comes via `compileASTExpression()`).

- `parser/ast/AST.tsx` `MethodDefinition.renderError()`: never called.

- `parser/rules/Pattern.ts` constructor: `instanceof RegExp` branch unreachable per types; only caller passes object.

- `parser/parser.types.ts` `RuleTestBlock.showAll`: set at several call sites, never read.

- `parser/Parser.ts` `get rules()`: `// REFACTOR: derived() instead?` on getter already using `this.derived()`.
  >> ditch

- `languages/spell/SpellParser.ts` static block re-sets `defaultRule` to `"block"`, same as `P.Parser`.
  >> ignore

- `spellCore/core.ts`: `repeat()` has no compiling rule; `get()` / `set()` are stubs with no callers.

- `spellCore/string.ts` `doubleQuote()`: no callers.

- `server/response-utils.ts`: `sendText`, `sendJavascript`, `sendTextFile`, `sendJSFile`, `sendJSONFile`, `convertNumericId`, `getIdParams` -- no callers.

- `server/project-utils.ts` `request_compileFile`: `await request.body` is a no-op.
  >> ditch await if safe

- `util/Task.ts` `TaskListState`: unused.  `util/IndexedList.ts`: `_identity` import unused.
  >> ditch

- `util/ResponseErrors.ts`: `SaveError` never thrown.  `util/AppPrefStore.ts`: no callers (`prefs.ts` is what's used).

- `app/pages/ProjectChooser.tsx` `ProjectRootDisplay`: no call sites.

- `app/pages/ProjectSettings.tsx`: unrouted, hardcoded demo data; `store.showProjectSettings()` is a stub.

- `environment.ts`: `systemFilesRoot` and `userFilesRoot` both `srcDir`; server's owner-based split is a no-op.

## 5. Structure / AGENTS.md conformance (your call)


- `languages/spell/spell.types.ts`: value-level `import "~/languages/rulex"` in a `*.types.ts` file.  Documented as deliberate.
  >> move the import into `SpellParser.ts`

- `languages/spell/rules/match-fields.{A,B,C,E}.ts`: lettered split is leftover of phased TS conversion; no `D`;
  nothing imports `C` (type-checks only via `tsconfig` `include`).  Candidate for consolidation.

- `spellCore/`: no `spellCore.types.ts`.
  >> rename `SpellCore.ts` to `spellCore.types.ts` ???

- `spellCore/index.ts` header claims `assert` is global for compiled spell; only `global.spellCore` assignment found.

- `util/DOM.ts` uses ambient `global`; `abortableFetch.ts` imports `global` polyfill.

- RENAME candidates: `SpellSetup.projectSpectForRootPath` (typo); `SpellProjectRoot.createProject` vs `duplicateApp` / `renameApp` / `deleteApp`.
  >> rename to `createApp`

## 6. Open questions left as `TODO` in code


- `rules/if.ts` `else_if`: is `precedence` load-bearing, or does rule order suffice?

- `rules/Sequence.ts` `parse()`: author's `TODOC: WHY?? FOR USE AS A LITERAL STRING??` still unanswered.

- Author sentences left dangling verbatim: `NestedSplit.prefix` ("right after the."), `SpellProjectRoot` class doc (`SpellInstall`, no such class),
  `SpellLocation.pathForUrl()` `TESTME` (garbled backticks), `Choice.getBestMatch` ("preceedence").
  >> fix

## 7. Stale docs that contradicted code (already fixed in this pass -- listed so you can sanity-check direction)

- Still stale inside `tests:` blocks (left alone by design): `rules/assignment.ts` ~line 71 `Scope.variables` comment.
  >> fix?

