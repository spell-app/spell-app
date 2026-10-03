# Suspected bugs

Things that look like bugs but haven't been confirmed.  Add to the right section, under its package;  when one is confirmed and
fixed, or disproven, delete it (note a disproof in a line at the top if the reasoning is worth keeping).
- Fixed 2026-10-02 (unified-server P6, the app's API off Express):  `:filePath*` kept only the first segment (nested
  project files 404 / EISDIR);  an unknown `DELETE /api/...` missed the API's own 404.
`[V]` = checked against the code by hand.  Everything else is unverified.

Entry format:  `` - `path/to/file.ts` `symbol()`: what looks wrong, why, and how to prove it. ``

## spell

Collected as `parser`'s "Suspected bugs found during documentation pass".

Collected 2026-09-19 while documenting `src/` per `AGENTS.md`.  Everything you annotated `>>` has been
fixed and removed from this file; what's left is unannotated and untouched in the code.
`[V]` = checked against the code by hand.  Everything else is a subagent's reading and unverified.
Delete this file when done -- it is untracked scratch, not project documentation.

Disproven while fixing: `Tokenizer.matchJSXChildren` same-name nesting was NOT a bug -- `matchJSXChild()`
tries `matchJSXEndTag(endTagName)` (literal `</endTagName>` only) before recursing into `matchJSXElement`,
which consumes any nested element whole, so the outer loop never sees an inner open/close tag.  `nesting`
only ever steps 1 -> 0 on the correct tag; its `!== 0` branch catches genuinely unbalanced markup, which is
what the adjacent `TODO: how to surface this error???` is really about.  Code left unchanged.

### 1. Behavior bugs

- Calculator example [V]:  its operator buttons say `onClick={set its operator to "+"}`, which compiles to the
  PROPERTY write `this.operator = "+"`, NOT the action `to set the operator of (a calculator) to (op)` (which also
  clears `input`).  So `7 x 6 + 1 2` shows `7 + 7612 = 7619`.  Same on HEAD before P11:  the language picks the
  property over the action -- or the example means the action.  Found 2026-10-02 (P11 live check).
- Solitaire-import example [V]:  draws only a `K` on the stock and an empty tableau -- no dealt piles -- in the
  editor and in `<spell-app>`.  Same on the commit before P11 (checked side by side), so not cells.  It imports
  `Card` / `Deck` / `Pile` from `@system:examples:Solitaire`, whose compiled module runs its OWN top level (a game,
  a deal) when imported:  probably the two programs' decks / piles collide.  Found 2026-10-02.

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

- `src/rules/UI.ts` `css`: reads `match.data.file` (was ad hoc `match.file`, documented as "set externally by `SpellCSSFile`") but NOTHING sets it -- `SpellCSSFile.parse()` doesn't.  So compiled output is always `spellCore.installStyles(undefined, ...)`.  Likely fix: `match.data.file = this.file` after parsing, but untested so left alone.

- `src/rules/draw.ts` `draw_items`: `draw the cards of the deck` compiles to `spellCore.drawThing(deck.cards)`, test expects `spellCore.drawItems(deck)`.  `draw_thing` wins on `precedence: 100` (see §3).  Never noticed because `draw.ts` had no `draw.test.ts`, so its embedded tests never ran -- file added 2026-09-20, this one case marked `skip`.

- [V] `src/rules/assignment.ts` `get.getAST`: `variables.replace("it")` unconditionally;
  sibling `assignment.getAST()` guards with `if (originalVar?.isAlias)`.  A real `it` variable loses `kind` / `datatype`.

- [V] `src/rules/lists.ts` `list_range_iteration`: only iteration rule that doesn't pass `mapItTo` --
  `it` not aliased inside `for each number from 1 to 10:` bodies.

- [V] `core/src/ui.ts`: `notify` / `alert` / `confirm` / `prompt` statements (`rules/UI.ts`) compile to `spellCore.notify()` etc,
  but no such methods exist anywhere in `spellCore`.

- [V] `core/src/SpellEvent.ts` instance `trigger`: calls `SpellEvent.trigger(this, event, props)` without `return`; typed `unknown[]`, results dropped.

- [V] `core/src/classes/List.tsx` `_getZeroIndex`: `if (oneIndex === 0) return 1 // ???` -- returns second item.

- `app/ui/ConsoleViewer.tsx` `getDerivedStateFromProps`: says "Clear `state.error` if ...???" but `return oldState || {}` never clears it,
  unlike `MatchViewer` / `ASTViewer`.

- `app/ui/modals/modals.types.ts` `ModalComponentProps.id`: `<ModalRoot>` passes `key` (not forwarded), never `id`.

- `parser/ast/renderAST.ts` `InCurlies` / `InSquareBrackets`: no empty-children case, unlike `stringifyAST.ts` twins.
  Latent: `DestructuredAssignment.renderChildren()` calls `render.InCurlies` directly.

- `[V]` `parser/ast/AST.ts` `ASTPreservedComment.renderChildren()` / `ASTDocComment.renderChildren()`:  draw
  `/* ...` (`render.OPEN_COMMENT`) where `compile()` writes `/*! ...` / `/** ...`, so the editor's "Javascript Output"
  pane shows NOT what runs, e.g. `/* SPELL: DECLARES {` for `/*! SPELL: DECLARES {`.  Prove:  for `a card is a
  thing`, `P.render.toText(ast.markup)` starts `/* SPELL`, `ast.compile()` `/*! SPELL` (`ASTViewer.browser.test.tsx`).

- `[V]` `src/rules/classes.ts` `quoted_property_formula`:  a quoted alias of an UNKNOWN property, e.g.
  `a card "is a (rank)" for its ranksx`, still registers `_quoted_property_rule`, with no enumeration part in its
  syntax -- then compiling any use of it (`the card is a queen`) crashes in `compileASTExpression()`:
  `Cannot read properties of undefined (reading 'value')`, as `rhs` is `undefined`.  Crashes a full parse too.
  Probably wants a parse error instead of registering the rule -- see the `FIXME` in `computeBits()`.

- `core/src/classes/App.tsx` `App.show()`:  calls `createRoot(element)` on the SAME `#REACT_APP_ROOT_ID` element every
  time a compiled app runs, e.g. each compile in the editor -- React warns "You are calling ReactDOMClient.createRoot()
  on a container that has already been passed to createRoot() before".  Probably wants to reuse (or unmount) the
  `REACT_ROOT` it already stashed on the element.

- `rules/classes.ts` `QuotedPropertyRule.compileASTExpression()` (was `_quoted_property_rule`):  a placeholder
  word that isn't in its enumeration outputs `` `'arg.value'` `` -- the literal text `'arg.value'`, not the
  word.  Probably meant `` `'${arg.value}'` ``.  Found 2026-09-28 while extracting the class.

- `projects/system/examples/Solitaire-import` imports the WHOLE `@system:examples:Solitaire` project compiled,
  so importing it runs Solitaire's top-level code -- its tests, `reset_the_game()`, `game.start()` -- which an
  import probably shouldn't.  Likely fix:  import `@library/cards`, which holds just the cards.
  DECIDED 2026-09-29:  fix the cause -- importing an app project must never run its app.  Planned as the
  `<spell-app>` plan's last phase.
  - FIXED 2026-09-29:  it used to fail outright, `TypeError: Cannot redefine property: play`, as Solitaire's
    `spellCore.define(Card.prototype, 'play', ...)` was non-configurable.  Methods are class methods now --
    writable -- and Solitaire-import's `Card.prototype.play = function ...` replaces Solitaire's.
  - 2026-10-01 (cli-additions):  it now loads with no errors, but deals NOTHING -- one king on the stock -- in the
    app's own runner (`/run/examples/Solitaire-import`) and in `<spell-app>` (`spell run`), while
    `@examples/Solitaire`, same `Solitaire.spell`, deals a full game.  NOT just `game.start()`:  serving the
    imported `Solitaire.compiled.js` with that line removed deals nothing either -- so its other top-level code
    (`reset_the_game()`, piles, process flags in the shared `spellCore`) is the next suspect.

- A full `vitest run` writes into the FROZEN fixture `projects/test/Solitaire/`:  it rewrites
  `Solitaire.compiled.js` and leaves an untracked `Solitaire.scopes.js`, both stamped mid-run.  Some test compiles
  `@test:fixtures:Solitaire` as a real `SpellProject`, which saves its output -- and the language server writes a
  scope pack after a clean compile.  Harmless while the output matches, but a test shouldn't touch fixtures.
  Found 2026-09-29.

- `for each card in the deck` compiles to `spellCore.map(deck, (card) => {...})`, and `map()` builds a NEW
  collection of the same class for its results (`newThingLike()`, `core.ts`) -- `new Deck()`, which runs the
  user's `create()` again, e.g. dealing cards, on every loop.  The result is thrown away.  Likely fix:  loops
  compile to `forEach` (or `forEachSequential` when async).  From reading the code, not run.  Found 2026-09-29.

- PROBABLY GONE (P11, 2026-10-02):  `view()` is on spell cells now, and a `Reaction` never re-runs for a change
  made while it runs.  Not tried with a real `to draw`.  Was:
  A `to draw` which calls `spellCore.map()` / `filter()` on a List -- or anything else reading then changing
  an observable it just made -- does it INSIDE `Thing.Component`'s `view()` render.  `map()` makes a new list,
  reads its `items`, then writes them:  the render's own reaction is set off mid-render.  That's what took the
  Thing Explorer down with React error #301 [V] (reading Solitaire's `pile.state`), so a program drawing that way
  probably re-renders every time, or warns.  NOT tried with a real `to draw`.  Related, fixed 2026-09-30:  making
  a List or Thing mid-render built its store with `react-easy-state`'s `store()`, which is a `useMemo()` hook
  in a `view()` function component and THROWS in a `view()` class component -- now `newStore()` in `extend.ts`.
  Found 2026-09-30.

- Negative positions only work on a `List`:  on a plain array `getItemOf(arr, -1)` reads `arr[-2]`, so
  `undefined`, and `removeItemOf(arr, -1)` does `splice(-2, 1)`, removing the SECOND-to-last
  (`collection-core.ts`).  So `the last word in words`, `remove last item of my-list` are wrong for arrays.
  Found 2026-09-29.

- `map()` / `filter()` on a string, e.g. `words in "a word list" where ...` (a `list_filter` test), start from
  `newThingLike("...")` -- `new String("")` -- and appending to it throws `TypeError: Cannot assign to read only
  property 'length'`.  The test only checks the compiled code.  Found 2026-09-29.

- `spellCore.equals()` is lodash `isEqual`, and a `List`'s items live in a `WeakMap` (`extend.ts`), not on the
  instance -- so two Lists of the same class probably compare EQUAL whatever they hold.  Inferred from the code,
  NOT confirmed with real Lists.  Found 2026-09-29.

- `lsp/SpellDiskWorkspace.ts` `diskChanged(uri, "created")` for a `.spell` file the project ALREADY has:  it goes
  through `refresh()` -- `project.reload()` + a fresh parse -- which re-reads the file LIST but apparently keeps the
  text each already-loaded `SpellFile` holds.  Seen 2026-09-29 from `spell watch`, which (wrongly, now fixed) reported
  a macOS save -- an `fs.watch` `rename` -- as `created`:  the rebuild compiled the OLD text.  Matters to the
  language server if an editor ever reports a replaced file (e.g. delete + create, as some `git` operations do) as
  `created`.  Likely fix:  `refresh()` also reloads each file's contents from disk.

- `src/rules/expressions.ts` `is_a`:  its operand is `{expression:type}`, and `type` accepts ANY word --
  so `print the card is a new card` compiles to `spellCore.isOfType(card, 'New')` and leaves `card` as a parse
  error, where `is_equal` + `a new card` was meant.  Probably wants `known_type`.  Run:
  `docs/precedence/experiments/grammar-today.mts`, probe P7.  Found 2026-09-30.

- `src/rules/lists.ts` `list_length` (precedence 3) vs `list_filter` (2):  `the number of cards in the
  deck where ...` likely matches `list_length` with `the deck` and leaves `where ...` unparsed, as precedence is
  compared before length.  From reading `Choice.getBestMatch()`, NOT run.  Found 2026-09-30.

- An ad-hoc property is not reactive:  `set the pile of the card to the pile` compiles to a plain `this.pile = pile`
  (`Card.move_to_$pile` in the Solitaire snapshot), never through `setProp()` -- so nothing drawn from
  `the pile of the card` redraws when it changes.  Maybe intended;  `packages/docs/precedence/precedence.html` section 9 proposes
  declaring such properties from their first assignment.  Found 2026-09-30.

### 2. Server robustness / security

- [V] `server/lock-utils.ts`: whole module has zero callers, while `saveFile()` / `saveProjectFile()` / `getIndex()`
  do unguarded read-modify-write on `project.json`.  Wiring dropped, or dead code.

- `server/project-utils.ts` `request_createFile`: silently overwrites existing file; exists-check is client-side only.

- `server/project-utils.ts` `request_deleteFile`: "can't delete last file" guard is client-side only.

- `server/project-utils.ts` `request_renameApp` / `request_duplicateApp`: `fse.move()` / `fse.copy()` without `overwrite` --  existing target => raw 500 instead of "already exists".

- `server/response-utils.ts` `sendError`: always sends `error.stack` to client.

- Path handling (no bypass found): only client-path => disk-path conversion is monkey-patched `SpellLocation.prototype.serverPath`,
  relying wholly on `SpellLocation` constructor's `isValidPathSegment`.  Worth a dedicated review.

### 3. Wrong strings / types (cheap fixes)

- `util/LoadableFile.ts`: generic param `JSONFileType` on `JSONFile` / `JSON5File` shadows exported `JSONFileType` type.

- `parser/tokenizer/Tokens.ts`: `JSXExpressionTokenProps.contents` is `string | Token`; `JSXAttribute` value still `any`.

- `src/rules/draw.ts` `draw_thing`: `precedence: 100`, everything else uses ~1-20.

- `src/rules/methods.ts` `type_method_arg`: `method` fragment from `type.raw`, sibling `arg.name` uses `instanceCase(type.value)`.

- `src/rules/async.ts` `pause` tests: 3 of 4 input strings have a stray trailing `"` (`` `pause for 2 seconds"` ``, `` `pause for 500 msec"` ``, `` `pause for 10 ticks"` ``) that the 4th (`pause for (10 + 10) sec`) doesn't -- looks like a copy-paste typo, not intentional. Left byte-for-byte while converting to `addRule()` per the rollout guide.

- `src/rules/UI.ts` `end_print_group` test: input `` `end print group"` `` has the same stray trailing `"`. Same as above.

- `core/src/collection-other.test.ts` `includes` test "returns false if one thing present, one not" expects
  `true` -- both values are in `{ a: 1, b: 3 }`.  Probably meant to check `1, 2`.

- `lsp/ScopeExplorer.ts` property names:  a type's property members come out as their JS names -- `short_suit`,
  `short_direction` -- while `ScopeMember.name`'s docstring (`lsp.types.ts`) says "name as written, e.g.
  `short-suit`".  Seen 2026-09-29 through `spell describe` on the Solitaire fixture (`Card.spell`), and still so
  2026-09-30.  Either `propertiesOf()` records hold the output name and the node should use the written one, or
  the docstring is stale.  Unverified which.

### 4. Dead / redundant code

- `parser/rules/Choice.ts` constructor: used to assign copied `rules` onto caller's `props` -- with `clone()` passing the rule itself, that re-wrote the ORIGINAL group's `rules` on every clone.  Harmless (equal copy) but fixed in passing.

- `rules/methods.ts` `typed_method_arg`: post-construction `arg.datatype = type.value` workaround; `VariableExpressionProps` declares `datatype`.

- `rules/math.ts` `gt_lt.getAST` / `is_gt_lt.getAST`: unreachable (output comes via `compileASTExpression()`).

- `parser/rules/Pattern.ts` constructor: `instanceof RegExp` branch unreachable per types; only caller passes object.

- `parser/parser.types.ts` `RuleTestBlock.showAll`: set at several call sites, never read.

- `src/rules/assignment.ts` `get.mutateScope`: sets `match.data.itVar` (the original local
  `it` `ScopeVariable`, if any), but `get.getAST` never reads it -- only `match.data.isNewVariable`.
  Looks like dead state, found while converting the file to a rule class (2026-09-20).

- `src/rules/core.ts` `eat_whitespace`: never referenced anywhere in `src` (grepped) -- dead.
  Its old bag form (`constructor: class eat_whitespace extends P.Subrule {}`, `syntax: "{whitespace}*"`)
  was actually broken: `{whitespace}*` compiles to a `Repeat`, not a `Subrule`, so the deprecated
  `Parser.defineRule()` bag path's `props = { ...rule, ...props }` merge silently copied the compiled
  `Repeat`'s own `.rule` (a `Subrule` instance) onto our instance's `.rule`, which `Subrule.parse()` expects
  to be a rule-name STRING, not a nested `Rule` object -- would have thrown at parse time if ever exercised.
  Converting to a class (`Rule.instantiate()` / `initFromSyntax()`) correctly rejects this mismatch instead
  of silently mis-assembling it, so the class now extends `P.Repeat` (what the syntax actually compiles to)
  to match its likely original intent.  No behavior change since nothing calls the rule either way
  (found 2026-09-20 converting `core.ts` to rule classes).

- `core/src/core.ts`: `repeat()` has no compiling rule; `get()` / `set()` are stubs with no callers.

- `core/src/string.ts` `doubleQuote()`: no callers.

- `server/response-utils.ts`: `sendText`, `sendJavascript`, `sendTextFile`, `sendJSFile`, `sendJSONFile`, `convertNumericId`, `getIdParams` -- no callers.

- `util/ResponseErrors.ts`: `SaveError` never thrown.  `util/AppPrefStore.ts`: no callers (`prefs.ts` is what's used).

- `app/pages/ProjectChooser.tsx` `ProjectRootDisplay`: no call sites.

- `app/pages/ProjectSettings.tsx`: unrouted, hardcoded demo data; `editor.showProjectSettings()` is a stub.

### 5. Structure / AGENTS.md conformance (your call)

- `core/src/index.ts` header claims `assert` is global for compiled spell; only `global.spellCore` assignment found.

- `util/DOM.ts` uses ambient `global`; `abortableFetch.ts` imports `global` polyfill.

### 6. Open questions left as `TODO` in code

- `parser/rules/Subrule.ts` `getGroupSpecContribution()`: assumes anonymous `{foo}` lands in `groups.foo`.  Not true if `foo` resolves to a single rule registered only under ALIAS `foo` -- match keeps that rule's own name.  Does real parsing have the same surprise?

- `rules/if.ts` `else_if`: is `precedence` load-bearing, or does rule order suffice?

- `rules/Sequence.ts` `parse()`: author's `TODOC: WHY?? FOR USE AS A LITERAL STRING??` still unanswered.

## ui

Disproven:  `Icons.get("zoom")` isn't missing -- it is Font Awesome's `zoom` BRAND logo;  with icon packs `zoom` is in
`fa7-brands`, and the `fomantic` pack gives the magnifier.
Disproven (2026-10-01):  the "empty strip" under an open multiple-selection dropdown is the NEXT example's field, which
the open menu floats over.  The "mini images at full width" were the static `ui avatar images` group, hit by a bare
`.avatar img { width: 100% }` in `ui-parts.css` (fixed).  `--ui-form-equal-width` / `-unstackable` were already private.
Parts inside a lone `<ui-event>` / `<ui-comment>` read the owner switches only in style queries, so unset is fine.
Swept 2026-10-01 (branch `worktree-ui-component-creation`, plan doc `packages/docs/epics/ui-component-creation/`):
every entry below that date was fixed or disproven;  what's left:

### 1. Behavior bugs

- `src/components/ui-toast/ui-toast.test.tsx` "life" tests:  still set `pause-on-hover="false"` for Linux CI.  The toast now
  pauses only after a real pointer MOVE (a toast appearing under a resting pointer closes), which should be the CI
  cause, but nobody ran the Linux image.  Prove:  drop the attribute and push;  CI green => remove it.  (2026-10-01)
- `src/components/ui-accordion/UIAccordion.tsx` ~line 82:  `this.loaded() && UI.browser.supports.interpolateSize` in a
  memo.  `loaded()` is TRUE on the server, and `UI.browser` throws before the runtime loads, so an SSR render of an
  accordion probably throws (`<ui-button>` hit exactly this, fixed with an `isServer` guard).  Prove:  add an
  accordion case to `test/ssr.ssr.test.tsx`.  (2026-10-01)
- `src/runtime/Styles.ts` shared adopted sheets, WebKit:  a viewport resize while NO element using a sheet is on the
  page leaves that sheet's `@media` results stale, so a transient component added later (toast, modal) renders at the
  old breakpoint.  Reproduced only through Playwright's viewport resize;  the toast / popup tests now render before
  resizing.  Possible fix:  one hidden persistent adopter per sheet.  Prove on a real device rotation.  (2026-10-01)
- `src/elements/MenuOptions.test.ts` "filters 5000 cold options in under 50 ms":  failed once in a full
  `yarn test:all` in webkit, passes 3 / 3 alone.  A wall-clock budget under 3-browser load;  maybe skip budgets under
  `UI_TEST_ALL`, as CI skips the dropdown's 16 ms one.  (2026-10-01)
- `src/components/ui-popup/ui-popup.test.tsx` "flips to the other side":  failed once in a full firefox run (arrow
  `::before` top 44px, expected < 0), then passed every time.  Maybe the arrow's `getAnimations` wait.  (2026-10-01)
- `src/components/ui-section/UISection.tsx` the toggle:  the `header` slot sits INSIDE the fold `<button>`, so a link
  in a rich title (`<span slot="header">4. Ideas for <a href=...>`, `packages/docs/solid/solid-2.html` `#ui`) is
  interactive content in a button.  The click half is FIXED (2026-10-02:  `fromControl()` leaves a click on a link /
  control in the title alone, as ui-accordion does;  test "leaves a click on a link inside a rich title").  Left:
  screen readers may not reach a link nested in a button.  Prove with VoiceOver on `#ui`;  a fix would render a
  rich title's controls outside the button.  (2026-10-02)
- `src/components/ui-root/UIRoot.tsx`:  every `<ui-root>` -- bare, `icons`, `display`, from JSX or plain HTML -- logs
  Solid's dev warning `[STRICT_READ_UNTRACKED] Reactive value read directly in an effect callback will not update`
  once as it connects (seen in `app`'s `src/runner/runner.browser.test.tsx`, P7 of `solid-migration`).  Something in
  its setup reads a signal in an effect's APPLY (or `onSettled`):  that read won't re-run it.  Harmless if the value
  never changes after;  a missed update if it does.  Prove:  dev build, break on the warning, read the stack.
  (2026-10-02)
- `src/docs-components/ui-docs-example/UIDocsExample.tsx` ~line 81:  the code button is a `<ui-button>` given
  `aria-expanded` / `aria-controls` on its HOST, but `<ui-button>` forwards only `aria-label` to its inner `<button>`,
  so assistive tech probably never hears the pane open / closed (and `aria-controls` can't cross the shadow root
  anyway).  `<ui-item>` got the same forwarding for `aria-expanded` on 2026-10-03 (`<ui-docs-nav>`).  Prove:  read the
  inner button's attributes in the docs example test;  fix by forwarding `aria-expanded` in `UIButton`.  (2026-10-03)

### 3. Styling / CSS

- `src/components/ui-grid/ui-grid.css`, `ui-card.css`:  as `items` was (fixed 2026-10-01), a size-container group host keeps
  its root's top margin from collapsing with the heading above:  element markup shows a bigger gap than class grammar
  (grid/types +16px under the celled grid, grid/variations several sections, card/content and card/types one each).
  Fix per owner, as `ui-items.css` did (`:host(:state(items))` carries the outer margin).  (2026-10-01)
- `src/components/ui-items/ui-items.css`:  the outer margin now sits on the host, in the host's UNSCALED font size, so a
  sized group's `1.5em` margin uses 16px.  Unmeasured.  (2026-10-01)
- `src/components/ui-list/ui-list.css`:  a raw slotted `<img>` followed by `<ui-content>` still puts the content below:  a
  replaced element can't be a table cell.  `<ui-image>` and the `image` shorthand work;  document, or wrap.  (2026-10-01)
- `src/components/ui-label/ui-label.css`:  a plain CLASS-GRAMMAR `.ui.label` inside a coloured ancestor still takes the
  ancestor's colour (Fomantic doesn't);  `<ui-label>` elements are fixed (host reset).  (2026-10-01)

- `src/components/ui-menu/ui-menu.css` / `ui-item.css`:  `<ui-item icon="lightbulb">` with no text, inside
  `<ui-menu vertical text>` (with or without `icon`), draws its `<svg>` 0 x 0:  the `.icon` box and the svg both
  compute `width` / `height` `0px`, though the svg's rule says `height: 1em`.  Seen in the docs rail
  (`packages/docs/_assets/spell-doc-runtime.js` `buildRail()`, which now slots a `<ui-icon>` instead).  Prove:  that
  markup in a menu example, measure the svg.  (2026-10-01)
  - Wider than that (2026-10-02, solid-migration P6):  EVERY menu item's `icon` shorthand, text or not, horizontal
    too -- `<ui-menu><ui-item link icon="pencil">Plain</ui-item></ui-menu>`:  the `.icon` span computes `display: flex`,
    span and svg `0 x 0`.  `ui`'s own baseline shows it:  `test/visual/baselines/local-darwin/chromium/ui-menu/
    content-light.png`, "Icons and a dropdown item":  "Inbox" (`icon="inbox"`) has no icon, "Mail" (a slotted
    `<ui-icon>`) has one.  The app's `<Action>` slots a `<ui-icon>` too (`packages/app/src/solid/Actions.tsx`, HACK).
- `src/components/ui-menu/ui-menu.css`:  `<ui-menu inverted color="violet">` items draw DARK text on the violet fill;
  Fomantic's inverted coloured menu has white text.  Plain `<ui-menu inverted>` is right (light on dark).  Prove:  that
  markup, `getComputedStyle()` of `::part(item)`'s `color`.  (2026-10-02, solid-migration P6)
- `src/components/ui-menu/` `<ui-menu vertical>` of `<ui-item link>`:  each item's `::part(item)` is a `<button>` at
  `display: block`, which still shrinks to its text, so items are as wide as their labels and their dividers stop
  short (seen in the app's chooser, `ProjectMenu`:  137 / 128 / 191px items in a 193px `fluid` menu).  Probably wants
  `width: 100%` (and `text-align: start`) on a vertical menu's button items.  The app's `ProjectDropdown.css` does it
  (HACK).  Prove:  the "Link items demo" in `examples/elements/content.html`.  (2026-10-02, solid-migration P8)
- `src/components/ui-menu/ui-menu.css` `secondary`:  `secondary` is ALSO a colour alias, so the generic remap
  (`colors.css`, `.ui.secondary { --ui-color: var(--ui-secondary) ... }`) runs on every `.ui.secondary.menu` root and
  its items inherit it:  an uncoloured secondary menu's active item reads `--ui-color-text` (black's text) and a
  secondary pointing underline `--ui-color` (black), whatever `--ui-menu-active-color` / `-border-color` say.  Hidden
  in our default look (black ~== the selected text colour);  shows when a theme recolours them (`themes/chubby.css`
  undoes the remap, HACK).  Same suspicion for `secondary` segments / buttons groups etc.  Prove:
  `<ui-menu secondary pointing><ui-item active>A</ui-item></ui-menu>` with `--ui-menu-active-color: red` on `:root`:
  the item stays black.  (2026-10-02, spell-ui-pages P6, T2)
- `src/components/ui-dropdown/UIDropdown.tsx` `label()`:  a host `aria-label` never reaches the combobox (only
  `placeholder` / `text` / `name` do), so an icon-only dropdown (no text, an `icon` slot) has no accessible name.  The app's
  `<MoreMenu>` ("...") is one.  (2026-10-02, solid-migration P6)
- `src/styles/utilities.css` ~line 439:  `.ui-prose :where(ul, ol)` comes after `.ui-list-plain` with the same
  specificity, so a plain list inside prose keeps its 1.5em indent.  The docs' `/components/` index works around it
  with `ui-not-prose`.  (2026-10-01)
- docs site `/components/ui-popup/` scrolls sideways at 375px:  a popup example and a code block are wider than the
  screen (menu closed too).  (2026-10-01)

### 4. Types / API surface

- `src/components/ui-dropdown/ui-dropdown.vocabulary.en.ts` `parts`:  the root `div.ui.dropdown` has no part name, so tokens
  read at its root can't be themed via `::part()` (search got `::part(search)` on 2026-10-01).  (2026-10-01)

## app

### 1. Behavior bugs

- `packages/spell/src/node/response-utils.ts` `sendJSFile` / `request_getCompiled` / `request_getScopes` [V]: the content-type is set
  to `text/javascript` BEFORE the existence check, so a not-found 404 carries a JSON `{errors}` body labelled `text/javascript`.
- `packages/app/src/ui/ConsoleLines.tsx` (and its Solid twin `src/solid/ConsoleLines.tsx`) `<ConsoleObject>`:  a logged `true`,
  `false` or `undefined` shows as an EMPTY value -- it's handed to JSX as is, which draws no text for them (React and
  Solid alike).  Probably wants `String(thing)`;  kept as is in the Solid port (P6b) to keep behaviour.
- `packages/app/src/editor.ts` `showingMatchRuleNames` [V]:  named backwards.  `<MatchRoot>` passes it as `compact`, and
  `MatchViewer.css`'s `.compact .name { display: none }` HIDES the names, so `true` (the default) means names hidden;
  `Actions.toggleMatchRuleNames` agrees with the CSS ("Show Rule Names" while it's `true`), not with the docstring.
  Kept as is in the Solid port (P6c, `src/solid/MatchViewer.tsx`;  pinned by its browser test).  Fix:  rename to
  `compactMatchView` / invert, together with the action's labels.
- `packages/app/src/ui/modals/Prompt.tsx` `promptForNumber()`:  resolved a NUMBER once the user had typed (the forms'
  `getEventValue()` does `parseFloat` for `type="number"`), though `editor.promptForNumber()` says
  `Promise<string | undefined>`.  The Solid port (P6f, `src/solid/modals/dialogs.ts`) resolves the string, as typed.
  Callers (only `ConsoleViewer`'s demo) don't care;  decide whether it should be `number | undefined`.
- `packages/app/src/solid/modals/modals.browser.test.tsx`:  ONE cold run (fresh vite optimize) printed
  `STRICT_READ_UNTRACKED` for `constructor.isLoaded` / `createProps.get` while the first `<Chooser>` rendered
  `<ui-radio>`s inside Solid's `render()`;  three warm runs printed nothing.  Probably `solid-element` reading signals
  while an element upgrades inside an owner.  Prove:  clear `node_modules/.vite` / vitest's cache, rerun once.
  - P8 (2026-10-02):  the dev server prints them on EVERY page load, with stacks:  `constructor.isLoaded` /
    `createProps.get` from `packages/ui/src/components/ui-button/UIButton.tsx` `invokers()` / `resolveInvoker()`
    (~lines 379-396, read in an effect's APPLY), and an unnamed one from `packages/ui/src/elements/RootSettings.ts`
    `set()` via `UIRoot.applySettings()` (`UIRoot.tsx` ~242-275).  So `ui`'s, not the app's:  those reads belong in
    the effects' compute (or `untrack()`).
- `packages/app/src/solid/ProjectDropdown.tsx` `<ProjectDropdown>`:  the dev server warns `[WIDE_SCOPE_DEPS] memo
  "computed" is subscribed to 30 sources` -- `createProps.get` x ~29 -- at `<ProjectDropdown> › children › computed ›
  computed`, i.e. the `<For>` drawing its `<ui-item>`s.  Our code reads no props there;  probably each `<ui-item>`
  upgrading synchronously as the `<For>` makes it, and the fork's `createProps` reads landing in OUR computation
  (`packages/solid-element`).  `<FileDropdown>` does the same with fewer items, under the warning's threshold.  Prove:
  a `<For>` of 30 `<ui-item>`s in a browser test, then Solid's `attribution` / the memo's sources.
- `packages/util/src/spell/DOM.ts` `getPadding()` (`CSS_TLBR_VALUES`):  reads `NaN` for every side in `app`'s BROWSER
  test project (vitest + chromium), while `getComputedStyle(el)["padding-left"]` there is `"0px"`;  on the dev server
  it reads `0`.  Probably the `#top` ... private fields as the vitest transform lowers them (declared, no
  initializer).  `src/solid/SplitPanel.tsx` reads padding itself now.  Prove:  `getPadding(document.body).left` in any
  `*.browser.test.ts`.
- `SP.SpellProjectRoot.guides.load()` (the chooser's "Open Guide" list):  the API answers 500, `ENOENT ... scandir
  .../projects/system/guides`:  the folder isn't in git (no guides yet), so EVERY load of the chooser logs a failed
  request.  React's `ProjectMenu` left the rejection unhandled;  the Solid one (P8) says "Couldn't load Guides".
  Fix:  the API answers an empty list for a root whose folder doesn't exist (or commit `projects/system/guides/`).
- GONE (P11, 2026-10-02:  `tracked()` is a Solid memo on spell cells, whose `Reaction` ignores its own writes;
  pinned by `tracked.browser.test.ts`).  Was:  `packages/app/src/solid/tracked.ts` `tracked()` [V]:  THROWS `Cannot access 'observer' before initialization` when
  `read()`, on its FIRST run, changes an `easy-state` value it has just read.  easy-state's `autoEffect()` is
  `const observer = observe(fn, { scheduler: () => scheduler.add(observer) })`, and `observe()` runs `fn` at once:  the
  self-trigger calls the scheduler while `observer` is still in its TDZ.  Hit by spell programs' computed properties,
  e.g. Solitaire's `state` (`spellCore.map()` makes a new `Pile` and fills it).  Seen (P6d) as the Thing Explorer's
  `state` cell showing that error;  `src/solid/ThingExplorer.tsx` works around it with its own `trackedProgram()`
  (observer-util `observe()` + a scheduler that takes the reaction as its ARGUMENT).  Fix:  the same in `tracked()`.
  Prove:  `tracked(() => { const list = store.list;  list.push(1);  return list.length })`.
- `packages/app/src/solid/loadUI.ts` `uiReady`:  its docstring says under node (the `node` test project) it "defines
  the tags only", but importing it there throws `customElements is not defined` (from `$/ui`'s families'
  `define()`).  So a Solid component a `node` test renders can't import `./loadUI` or the `$/app/solid` barrel
  (P6d's explorers don't, and say so).  Prove:  import `./loadUI` in any `src/**/*.test.tsx`.

## cli

### 1. Behavior bugs

- (none yet:  the CLI's spell-side suspicions -- `SpellDiskWorkspace.diskChanged(uri, "created")`, `ScopeExplorer`
  property names -- are under `spell`.)

## docs

### 1. Behavior bugs

- `scripts/plan-doc.js` `add-phase`:  `--goal` / `--files` / `--verify` go into the page as raw HTML, so
  `<Project>.scopes.js` or `--against <ref>` become bogus `<project>` / `<ref>` elements (oxfmt then indents them as
  tags).  Escape them as text -- or document that they're HTML, as `--details` is.  Prove:
  `yarn plan-doc add-phase x "A" --goal "write <Project>.js"`, then look at the `#p1` body.

## server

### 1. Behavior bugs


- `[V]` `src/page/cli.ts` `url`:  a RELATIVE `<file>` resolves against `packages/server`, not the folder `yarn
  server` ran in -- the root's `yarn server` runs `yarn workspace ... server`, whose nested yarn resets `INIT_CWD`.
  Prove:  `yarn server url packages/docs/index.html` at the repo root prints
  `.../packages/server/packages/docs/index.html`.  An absolute path works.

## vscode

### 1. Behavior bugs

- `src/WindowBridge.ts` `close-window`:  didn't close the worktree's window in Owen's test (2026-10-02), though
  `scripts/window.mjs close doc-template` reported "closed" and the window's registry entry disappeared.  Maybe
  `workbench.action.closeWindow` from a `setTimeout` after the reply runs too late or is refused;  or the window
  that opened wasn't the one registered.  Prove:  `node scripts/window.mjs open <name> --pkg docs`, wait for its
  `~/.spell/windows/*.json`, then `close <name>`, and watch the window.
