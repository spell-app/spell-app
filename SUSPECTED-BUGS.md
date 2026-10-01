# Suspected bugs

Things that look like bugs but haven't been confirmed.  Add to the right section, under its package;  when one is confirmed and
fixed, or disproven, delete it (note a disproof in a line at the top if the reasoning is worth keeping).
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

- `rules/classes.ts` `QuotedPropertyRule.compileASTExpression()` (was `_quoted_property_rule`):  a placeholder
  word that isn't in its enumeration outputs `` `'arg.value'` `` -- the literal text `'arg.value'`, not the
  word.  Probably meant `` `'${arg.value}'` ``.  Found 2026-09-28 while extracting the class.

- [V] `projects/system/library/cards/Deck.spell` `test deck creation`:  after two shuffles it expects the first
  card NOT to be the ace of clubs -- which it is, by chance, 1 time in 52.  So the test fails at random, ~2% of
  runs.  Probably wants "the deck isn't in its original order" instead.  Found 2026-09-28.

- `projects/system/examples/Solitaire-import` imports the WHOLE `@system:examples:Solitaire` project compiled,
  so importing it runs Solitaire's top-level code -- its tests, `reset_the_game()`, `game.start()` -- which an
  import probably shouldn't.  Likely fix:  import `@library/cards`, which holds just the cards.
  DECIDED 2026-09-29:  fix the cause -- importing an app project must never run its app.  Planned as the
  `<spell-app>` plan's last phase.
  - FIXED 2026-09-29:  it used to fail outright, `TypeError: Cannot redefine property: play`, as Solitaire's
    `spellCore.define(Card.prototype, 'play', ...)` was non-configurable.  Methods are class methods now --
    writable -- and Solitaire-import's `Card.prototype.play = function ...` replaces Solitaire's.

- A full `vitest run` writes into the FROZEN fixture `projects/test/Solitaire/`:  it rewrites
  `Solitaire.compiled.js` and leaves an untracked `Solitaire.scopes.js`, both stamped mid-run.  Some test compiles
  `@test:fixtures:Solitaire` as a real `SpellProject`, which saves its output -- and the language server writes a
  scope pack after a clean compile.  Harmless while the output matches, but a test shouldn't touch fixtures.
  Found 2026-09-29.

- `for each card in the deck` compiles to `spellCore.map(deck, (card) => {...})`, and `map()` builds a NEW
  collection of the same class for its results (`newThingLike()`, `core.ts`) -- `new Deck()`, which runs the
  user's `create()` again, e.g. dealing cards, on every loop.  The result is thrown away.  Likely fix:  loops
  compile to `forEach` (or `forEachSequential` when async).  From reading the code, not run.  Found 2026-09-29.

- A `to draw` which calls `spellCore.map()` / `filter()` on a List -- or anything else reading then changing
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

- `languages/spell/rules/expressions.ts` `is_a`:  its operand is `{expression:type}`, and `type` accepts ANY word --
  so `print the card is a new card` compiles to `spellCore.isOfType(card, 'New')` and leaves `card` as a parse
  error, where `is_equal` + `a new card` was meant.  Probably wants `known_type`.  Run:
  `docs/precedence/experiments/grammar-today.mts`, probe P7.  Found 2026-09-30.

- `languages/spell/rules/lists.ts` `list_length` (precedence 3) vs `list_filter` (2):  `the number of cards in the
  deck where ...` likely matches `list_length` with `the deck` and leaves `where ...` unparsed, as precedence is
  compared before length.  From reading `Choice.getBestMatch()`, NOT run.  Found 2026-09-30.

- An ad-hoc property is not reactive:  `set the pile of the card to the pile` compiles to a plain `this.pile = pile`
  (`Card.move_to_$pile` in the Solitaire snapshot), never through `setProp()` -- so nothing drawn from
  `the pile of the card` redraws when it changes.  Maybe intended;  `docs/precedence.html` section 9 proposes
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

- `languages/spell/rules/draw.ts` `draw_thing`: `precedence: 100`, everything else uses ~1-20.

- `languages/spell/rules/methods.ts` `type_method_arg`: `method` fragment from `type.raw`, sibling `arg.name` uses `instanceCase(type.value)`.

- `languages/spell/rules/async.ts` `pause` tests: 3 of 4 input strings have a stray trailing `"` (`` `pause for 2 seconds"` ``, `` `pause for 500 msec"` ``, `` `pause for 10 ticks"` ``) that the 4th (`pause for (10 + 10) sec`) doesn't -- looks like a copy-paste typo, not intentional. Left byte-for-byte while converting to `addRule()` per the rollout guide.

- `languages/spell/rules/UI.ts` `end_print_group` test: input `` `end print group"` `` has the same stray trailing `"`. Same as above.

- `spellCore/collection-other.test.ts` `includes` test "returns false if one thing present, one not" expects
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

### 5. Structure / AGENTS.md conformance (your call)

- `spellCore/index.ts` header claims `assert` is global for compiled spell; only `global.spellCore` assignment found.

- `util/DOM.ts` uses ambient `global`; `abortableFetch.ts` imports `global` polyfill.

### 6. Open questions left as `TODO` in code

- `parser/rules/Subrule.ts` `getGroupSpecContribution()`: assumes anonymous `{foo}` lands in `groups.foo`.  Not true if `foo` resolves to a single rule registered only under ALIAS `foo` -- match keeps that rule's own name.  Does real parsing have the same surprise?

- `rules/if.ts` `else_if`: is `precedence` load-bearing, or does rule order suffice?

- `rules/Sequence.ts` `parse()`: author's `TODOC: WHY?? FOR USE AS A LITERAL STRING??` still unanswered.

## ui

Disproven:  `Icons.get("zoom")` isn't missing -- it is Font Awesome's `zoom` BRAND logo (a documented clash;  Fomantic's magnifier
is `<html ui-icon-names="fomantic">` or `magnifying-glass-plus`), pinned in `Icons.test.ts`.  (2026-09-30:  `Icons` is gone;
with icon packs `zoom` is in `fa7-brands`, and the `fomantic` pack gives the magnifier.)

### 1. Behavior bugs

- `src/components/toast/UIToast.tsx` countdown:  on GitHub's Linux CI (chromium, `ubuntu-latest`) two
  `toast.test.tsx` "life" tests failed on every run -- an 80 ms toast never fired `ui-hide` (10 s timeout), and a
  40 ms toast never fired `ui-close` within 1 s -- so the countdown never ran.  Passes on macOS, at any
  `--maxWorkers` and serially.  Theory, UNPROVEN:  the test pointer rests where toasts appear, so `pointerenter`
  sets `hovered` and the timer never starts;  if so a real user's resting pointer does the same, and a toast that
  appears under it never leaves.  Other suspects:  `focused`, or a race where the timer closes before the entry
  animation ends, which drops `ui-show` (`appear()` emits it only `if (!this.closing)`).  The tests now set
  `pause-on-hover="false"` to get CI green.  Prove:  run them in `mcr.microsoft.com/playwright:v1.63.0-noble`, logging
  `hovered` / `focused` / `timer`.  (2026-09-30)
- `src/elements/UIElement.tsx` `mount()`:  errors thrown in a `createEffect` COMPUTE set up there (e.g.
  `hostStates()`) never reach the fork's error boundary -- logged, but no `:state(errored)` and no fallback.  The
  table family switched its class-mirror effect to `createRenderEffect` to get the fallback (`table.test.tsx`).
- `src/components/checkbox/UIRadio.tsx` `keyDown()` + `RadioGroup.step()`:  neither checks `readonly`, so arrow keys
  probably change a read-only radio group (clicks are cancelled, arrows aren't).  Prove:  a `readonly` group, focus
  the chosen radio, press Arrow Down.  (Docs pass, 2026-09-30.)
- `src/components/search/UISearch.tsx` results rendering:  dev Solid logs `STRICT_READ_UNTRACKED ... read directly in
  <For>` (path `<Show> › div.children › <Show> › <Show> › <Show> › <For>`) when a search renders its results open
  from the start (`open value="a"`, a `category` search too), so some result data may not update reactively.  Prove:
  load `/components/search/` under `yarn site:dev` and watch the console.  (Docs pass, 2026-09-30.)
- `src/components/search/search.vocabulary.en.ts` `parts`:  the root `<div class="ui search">`, which declares every
  `--ui-search-*` token, has no part name, so tokens read at the root can't be themed from the page (the docs use
  `::part(input)` / `::part(results)`, which cover the tokens used there).  (Docs pass, 2026-09-30.)

### 2. Accessibility
- `src/components/breadcrumb/examples/elements/states.html` line 5:  this `<ui-breadcrumb>` has no `aria-label`, so on
  a page with other breadcrumbs two `<nav>` landmarks share the default name.  The docs page adds one.  (Docs pass,
  2026-09-30.)

### 3. Styling / CSS

- `src/components/calendar/calendar.css` field width (visual tests, 2026-09-30):  a `<ui-calendar>` field has no
  width of its own, so it takes the browser's default `<input>` width -- 235px in chromium, 258px in webkit, 278px in
  firefox.  The date-time field then cuts its value ("September 30, 2026 at 2:3" in chromium), and in webkit the
  "Year" field wraps to a second row.  Screenshots:  `test/visual/baselines/local-darwin/{chromium,webkit,firefox}/
  calendar/types-light.png`.
- `src/components/dropdown/dropdown.css` multiple selection, open (visual tests, 2026-09-30):  the open menu of a
  `fluid multiple selection` dropdown with two values chosen ends ~10px ABOVE the field's own border, which shows
  as an empty bordered strip under the last item.  Screenshots:  `test/visual/baselines/local-darwin/*/dropdown/
  types.open-multiple-light.png` (and `-dark`).
- `src/components/dropdown/dropdown.css` anchored menu (visual tests, 2026-09-30):  the example's "Open selection"
  dropdown (open from the start, below the 768px viewport) opens its menu UPWARDS in webkit and downwards in
  chromium / firefox, although the page has room below.  Maybe webkit's position-try measures against the viewport
  while the anchor is scrolled out of it.  Screenshots:  `test/visual/baselines/local-darwin/webkit/dropdown/
  types-light.png` vs `.../chromium/dropdown/types-light.png`.
- `src/components/image/image.css` class grammar on the page (visual tests `--parity`, 2026-09-30):  the static
  `<div class="ui mini centered circular images">` of `image/examples/groups.html` renders its `<img>`s at full width
  (circles ~700px across);  the element markup (`<ui-images size="mini" centered circular>`) gets 35px avatars.
  The `mini` size seems not to reach page-level images in a group.  Prove:  `yarn test:visual --os local --browsers
  chrome --grep image/groups --parity`, then `tools/results/visual/local-darwin/parity/chromium/image-groups.png`.
- `src/components/card/card.css` links in a card (visual tests, 2026-09-30):  a card's `href` header and the extra
  content's link are underlined, including the space between the icon and "22 Friends";  Fomantic's card links are
  not underlined (colour and hover only).  Maybe deliberate (links distinguishable without colour, WCAG 1.4.1):
  decide, then fix or note.  Screenshot:  `test/visual/baselines/local-darwin/chromium/card/types-dark.png`.

- `src/components/items/items.css` / `card.css` / `grid.css`:  a group host that is a size container
  (`container-type: inline-size`) seems to keep its root's top margin from collapsing with the heading above it, so
  element markup shows a bigger gap than the static class grammar (seen in the Items examples' screenshots).
  Prove:  compare `<h4>` bottom to the first item's top in both columns of `yarn dev`.
- `src/components/items/items.css` mobile stacking:  Fomantic's `.ui.items > .item > .image { width: auto }` also
  sizes a static `ui tiny image` to its NATURAL width (ported faithfully);  a `<ui-image size="tiny">` element keeps
  80px.  Static and element markup differ below 768px.

- `src/components/list/list.css` + `parts.css`:  a slotted `<img>` / `<ui-image>` followed by `<ui-content>` in a
  list item puts the content BELOW the image:  `parts.css` makes content after a first child a table cell, but
  the image is an inline block.  The `image` shorthand works (`--ui-item-media: image`);  a clean fix needs an
  image owner-display token in `image.css`.
- `test/sheets.ts` `Sheets.classPhrases()`:  probes `"equal"` for EVERY `width` attribute, so a width without
  `canEqual` logs a `ClassBuilder` dev warning in css tests.  Harmless noise.
- [V] `src/components/table/table.css` ~line 977:  every `<ui-table>` narrower than 768px of its OWN width stacks unless
  `unstackable` (Fomantic's default is by viewport).  The docs site's example column is ~655px at every window
  width, so every table example on `/components/table/` shows the stacked mobile layout (a `site-note` on the page
  says so).  Maybe only `stackable` tables should follow the host's width, or the default should stay viewport-based.
- `src/components/grid/examples/elements/responsive.html` (Doubling, Reversed, "Width per device") and
  `src/components/image/examples/elements/variations.html` (Size):  fixed 850 / 1000 / 1200px wrappers overflow a
  normal page column;  the docs pages clamp them (`max-width` + `resize`) or trim sizes.
- `src/styles/native.css` ~lines 182-221:  `data-variation="visible"` shows the CSS-only tooltip but the full-size
  transform only applies on `:hover` / `:focus-visible`, so a `visible` tooltip stays at 80% scale.  Unverified.
- `src/components/popup/examples/elements/types.html`:  `data-tooltip` on a `<ui-button>` (a focus-delegating host)
  may never match `:focus-visible` on the host, so the CSS tooltip may not show on keyboard focus.  Unverified.

- [V] `src/components/segment/segment.css` + `UISegment.tsx`:  `<ui-segments inverted>` doesn't invert its members:  a
  member `<ui-segment>` stays light and white (static `.ui.inverted.segments > .ui.segment` too:  the member root keeps
  the light scheme, so `--ui-segment-inverted-background` resolves white).  A fix needs the group to hand a private
  token down AND `UISegment`'s inline `--ui-inverted: 0` on its root (which beats the sheet) to follow it.  Checked
  in a browser probe, 2026-09-30.
- [V] `src/components/label/label.css`:  an un-coloured `<ui-label>` inside a `ui-red` wrapper (or any ancestor setting
  `--ui-color`) paints red:  nothing resets the colour tokens, by design for `<ui-labels color>`.  Statistic, menu and
  segment reset them (host / slot);  label probably wants the statistic's pattern (host reset + a private group
  token).  Checked in a browser probe, 2026-09-30.
- `src/components/dimmer/examples/elements/types.html` / `variations.html`:  `style="min-height: ..."` on
  `<ui-segment>` does nothing (the host is `display: contents`, see `PAPERCUTS.md`), so the "Content dimmer" box is
  too short for its header and button.  The docs page puts the height on an inner `<p>`.
- `src/components/menu/menu.css`:  `--_ui-menu-only-radius` (was `--ui-menu-only-radius`) has no base value on the
  menu root -- only `vertical` and `fixed` set it -- so a menu nested inside a vertical menu (a sub-menu, or a new
  top-level menu in an item) inherits the outer vertical radius for an only-child item, instead of falling back to
  its own first-item corners.  Pre-existing;  kept as is by the token conversion (look unchanged).  (2026-09-30)
- `src/components/popup/popup.css` `.ui.popup` transition:  it reads `--_ui-popup-duration`, declared only on
  `:host`, so static class-grammar popups (no host) get an invalid `transition` (none at all).  Pre-existing (it read
  the public name, also only declared on `:host`);  kept by the token conversion (look unchanged).  Prove:
  `getComputedStyle(staticPopup).transitionDuration`.  (2026-09-30)
- `src/components/feed/feed.css`, `comment.css`:  the tokens live on the LIST root (`.ui.feed`, `.ui.comments`) and
  events / comments only read them, so a lone `<ui-event>` / `<ui-comment>` outside a list resolves every
  `var(--_ui-feed-*)` to nothing (no event padding, label width ...).  Pre-existing;  kept by the token conversion.
  Prove:  render `<ui-event image="...">` alone and read its label box width.  (2026-09-30)

### 4. Types / API surface

- `src/components/emoji/emoji.vocabulary.en.ts:38`:  says "`Thumbs Up` works too", but that becomes `thumbs_up`,
  which isn't in the data (`thumbsup` is), so it draws nothing.  `emoji.test.tsx:30` only tests the spelling
  conversion.  Fix the doc or add an alias.
- `src/components/emoji/emoji.css:59` `--ui-emoji-size-medium: 3`:  never used by the element (`medium` emits no
  class), only by hand-written class grammar;  listed as a token anyway.

- `src/components/form/form.css` lines 93-94:  `--ui-form-equal-width` and `--ui-form-unstackable` are internal 0/1
  switches but carry the public `--ui-form-` prefix, so the docs' generated token table lists them as public.
- `src/components/input/input.vocabulary.en.ts` ~line 95:  `label` is described as "Label text", but with
  `labeled="corner"` / `"left corner"` it's read as an ICON name (`UIInput.cornerGlyph`).
- `src/components/message/examples/elements/content.html` line 15:  the "List" example says "Only the header, no
  content block" but has no header.
- `site/src/content/components/button.mdx` / `dropdown.mdx` "Framework usage":  the Solid 2 snippets use
  `on:ui-toggle` / `on:ui-change`;  AGENTS.md says Solid 2 has no `on:` namespace (a `ref` + `addEventListener`,
  as `tools/frameworks/solid/app.tsx`).  The new pages use the `ref` pattern.
