# Code debt

Long-term structural debt -- things we know are wrong, have decided NOT to fix right now,
and do not want to rediscover from scratch every few months.

This is durable project documentation.  Unlike `SUSPECTED-BUGS.md` (a disposable scratch list
of possible bugs), entries here are verified and stay until the underlying work is actually done.

## What goes here

Add an entry when ALL of these are true:

- it is **structural** -- spans several files, or is a shape/convention problem rather than a
  local mistake
- it is **too big to fix in passing** -- fixing it is its own task, not a detour inside another one
- it is **known and tolerated** -- we understand the cause and have chosen to live with it,
  so the next person needs the reasoning, not a rediscovery

Typical triggers:

- a refactor exposes a fragility we decide not to chase, e.g. the `BROKEN_ENTRIES` circular
  imports under `spell`
- a test or lint rule gets **pinned, skipped or widened** to accommodate a known problem --
  pinning records the damage, this file records the intent to undo it
- a convention in `AGENTS.md` is knowingly violated, and the violation is too wide to fix now

## What does NOT go here

- **local** cleanups -- use an inline `REFACTOR:` marker at the code, where it will be seen
- **suspected bugs** -- `SUSPECTED-BUGS.md`
- **tooling papercuts** -- `PAPERCUTS.md`
- anything you are about to fix anyway

## Entry format

One `###` heading per item, under its package's `##` section, `---` between items, then:

- **Cost** -- what we pay for leaving it
- **Cause** -- the actual mechanism, not a guess
- **Fix** -- the shape of the real solution
- **Pinned at** -- where the problem is currently recorded or worked around

---

## spell

### Circular imports through the `$/parser` barrel

- **Cost**: six sub-paths of `$/parser` cannot be imported before `$/parser` itself without
  silently corrupting the barrel.  Latent rather than live: every consumer outside the barrel
  enters via `$/parser`, which is always safe.  It is a trap for new code and for test authors.
- **Cause**: nearly every leaf under `$/parser` does `import { P } from "$/parser"` -- a VALUE
  import of its own barrel.  Entering at a sub-path starts the
  `index` -> sub-barrel -> leaf -> `index` cycle before the leaf's bindings exist.  Damage takes
  two shapes: a leaf throws outright (`Literal extends Rule` extends `undefined`), or a sub-barrel
  silently truncates and the missing names never come back.
- **Fix**: leaves should not import their own barrel as a value.  Use `import type { P }` where
  only types are needed, and import base classes directly from their defining files.  This is
  already the documented convention in `AGENTS.md` -- it is just not applied consistently.
  NOTE: the obvious partial fixes do not work.  `AST.ts` needs `P.Match` and three `Scope`
  subclasses at runtime, but `Match.ts` and the scope files import the barrel as a value
  themselves, so importing them directly only relocates the cycle.  This is all-or-nothing.
- **Pinned at**: `BROKEN_ENTRIES` in `packages/parser/src/barrel.test.ts` -- `$/parser/rules`,
  `$/parser/rules/Rule`, `$/parser/rules/Literal`, `$/parser/tokenizer`, `$/parser/scope`,
  `$/parser/ast`.

#### Sub-item: `export *` makes the truncation permanent

- **Cost**: flattening a namespaced sub-barrel to `export *` costs a safe entry point.
  `$/parser/ast` moved into `BROKEN_ENTRIES` exactly this way, when its AST classes were
  flattened out of `export * as AST`.  (`$/parser/tokenizer` was already listed, for the
  parent reason above.)
- **Cause**: a named re-export (`export { X } from "./X"`) compiles to a LAZY getter, so the key
  exists on the sub-barrel even while the leaf is mid-body.  `export *` must read the leaf's key
  list EAGERLY, and a mid-body leaf has no keys yet -- so nothing is re-exported, ever.
- **Fix**: falls out of the parent item.  Once leaves stop importing the barrel as a value,
  `export *` is safe everywhere.
- **Pinned at**: same `BROKEN_ENTRIES` list; the mechanism is written up there and in `AGENTS.md`.

---

### Enumerated properties are reachable under inconsistent names

`cards have a suit as one of clubs, diamonds` is meant to make BOTH `the suits of the card` (instance) and
`card suits` / `is in card suits` (class) work.  Checked by compiling each form, 2026-09-27:

| Spell                                                 | Compiles to                  | Works?                                   |
|-------------------------------------------------------|------------------------------|------------------------------------------|
| `card suits`, `x is in card suits`                    | `Card.Suits`                 | yes                                      |
| `the suits of the card`, `its suits`                  | `card.suits`, `this.suits`   | NO -- runtime defines `prototype.Suits`  |
| `bank-account account-types` (dashed names)           | no match                     | NO -- only `bank_account account_types`  |
| `the number of card suits`                            | `Card.Suits.number`          | NO -- `the {property} of` wins           |

- **Cost**:  the instance form is `undefined` at runtime;  types or properties with a dash can't use the class
  form as written;  counting an enumeration silently compiles to a property read.
- **Cause**:
  - `define_property_has` (`classes.ts`) names the enumeration `pluralize(upperFirst(property.value))`, e.g.
    `Suits` / `Account_types`, and passes it as `enumerationProp`.  `spellCore.defineProperty()` (`core.ts`)
    defines THAT name on both `Card.prototype` and `Card` -- but the instance form compiles through the
    `property` rule, which is lower-case (`suits`).
  - Its generated `typename_groupname` rule matches literals `[typeName, typeName.toLowerCase()]` and
    `[groupName, groupName.toLowerCase()]` -- values, with underscores -- so the dashed words a user types
    never match.
  - `the? number of {arg:plural_identifier} (in|of) {list}` (`lists.ts`) needs `number of X in Y`;
    `the number of card suits` falls to `the {property} of {expression}` with property `number`.
  - The enumeration entry sits in the type's `variables` (instance) AND `classVariables`.  That's on purpose:
    `quoted_property_formula` (`a card "is a (suit)" for its suits`) finds the values through
    `types.get(type).variables.get("suits")`, and the language server resolves `its suits` to it the same way.
- **Fix**:  pick ONE naming rule for an enumeration -- instance `suits`, class `Suits`, written `card suits` /
  `bank-account account-types` -- and apply it in `define_property_has`'s generated rule, its `enumerationProp`,
  and `spellCore.defineProperty()`.  Then decide whether `the number of {expression}` should count.
- **Pinned at**:  nowhere yet -- no test covers the instance form or dashed names.

---

### Store proxies stand in for the real objects

`SP` objects (`SpellProject`, `SpellFile`...) keep their state in `react-easy-state` stores.  Read INSIDE a
reaction -- a `view()` render, an `autoEffect()`, an `observe()` -- a store hands back a tracking PROXY of any
nested object, and a cache filled there keeps the proxy.

- **Cost**:
  - identity breaks:  a proxy is not `===` the real object, so `includes()`, `Map` / `WeakMap` keys and `===`
    all miss.  Found when `project.activeImports`, filled during a render, made `file.isActive` false for
    every file, and the app editor's references / rename / cross-file definition came back empty.
  - speed:  anything walked through a proxy inside a reaction registers every read.  Monaco's text model,
    reached through the store inside an `observe()`, never finished.
- **Cause**:  `@nx-js/observer-util` wraps nested objects lazily, only while a reaction is running (see
  `isInsideRender()` in `util/extend.ts`).  `derivedFrom()` caches keep whatever they were computed with.
- **Fix**:  keep non-state objects out of stores, and have caches store raw values -- e.g. `raw()` in
  `derivedFrom()` -- or stop computing caches inside reactions.  Then drop the `raw()` calls below.
- **Pinned at**:
  - `SpellProject.spellFiles` and `SpellFile.isActive` unwrap with `raw()`
  - `SpellModels.modelFor()` unwraps the file it's given;  it and `SpellModels` follow files with `observe()`,
    touching Monaco only in microtasks OUTSIDE the reaction
  - `editor.getInputEditor()`:  the Monaco editor lives outside the store (`packages/app/src/editor.ts`)
  - `SpellModels.#toSave` and `editor.onFileEdited()` compare by `path`


---

### Review:  editor features added by Claude, 2026-09-27 / 28

Everything below went in over two long sessions, tested (vitest, tsc, lint, a headless-Chromium run of the app,
parser speed test) but NOT yet reviewed line by line.  Check each area, then delete its bullet.

- **Cost**:  a lot of new code in the parser's hot path, the language server and the app editor, reviewed only by
  its tests.  Mistakes in expecting mode or the Monaco glue would show up as odd completions, stale markers or a
  hung editor, not as test failures.
- **Cause**:  built quickly in phases, each stopped for a quick review, not a detailed one.
- **Fix**:  review each area below;  fix, or record here what's knowingly left.
- **Pinned at** -- by area, with the files each touched:
  - **Language server + VS Code extension** (commits `762b1dd`..`4c27a34`)
    - `packages/lsp/src/`:  `SpellLanguageService.ts` (+ test, `__snapshots__`), `SpellLanguageServer.ts`, `server.ts`,
      `stdioGuard.ts`, `lsp.types.ts`, `index.ts`, `server.test.ts`
    - `packages/vscode/` (whole project), `.vscode/launch.json` + `tasks.json`, root `package.json` `vscode*` scripts
    - parser support:  `Rule.declares` / `getDeclaration()`, `highlightAs` (`packages/parser/src/rules/Rule.ts`,
      `rules.types.ts`, and `@proto static highlightAs` on `Keyword` / `Symbol` / spell base rules),
      `TypeScope.getOrStub()` / `claim()` / `declareProperty()`, `P.TokenFormatter` (`packages/parser/src/tokenizer/`)
    - docstrings:  `Block.getDocComments()`, `ASTDocComment` / `ASTBannerComment` (`packages/parser/src/ast/AST.ts`),
      `Block.ts` + `Block.test.ts`
  - **Scripts** (`eab5832`):  `start:*` renames, `yarn stop` (`package.json`, `Dockerfile.*`, `DOCKER.md`,
    `CODEBASE_INDEX.md`).  NOTE: `yarn stop` also kills the language server VS Code started.
  - **Browser-safe `$/lsp` + editing on `SpellProject`** (in `bdc9610`)
    - `packages/lsp/src/SpellWorkspace.ts` removed => `LSP.FileAddresses` (`lsp.types.ts`) + node-only
      `packages/lsp/src/SpellDiskWorkspace.ts`;  `packages/lsp/src/barrel.test.ts`
    - `SpellProject.spellFiles` / `parseError` / `updateText()`, `SpellFile.isActive`
      (`packages/spell/src/SpellProject.ts`, `SpellFile.ts`, `SpellProject.editing.test.ts`)
  - **CodeMirror => Monaco** (in `bdc9610`)
    - new `packages/app/src/ui/monaco/`:  `monaco.ts`, `SpellMonaco.ts`, `SpellTokensProvider.ts`, `MonacoEditor.tsx` (+ `.less`),
      `SpellModels.ts`, `SpellLanguageFeatures.ts`, `LspToMonaco.ts` (+ test), `AppAddresses.ts`, `index.ts`
    - `packages/app/src/editor.ts` (Monaco outside the store, `onInputCursor`, `onInputEffect`, `onFileEdited`, `showFileAt`),
      `InputEditor.tsx`, `OutputEditor.tsx`, `ui/index.ts`, `ui.types.ts`, `pages/SpellEditor.tsx`, `debug.ts`
    - `src/types/monaco-internals.d.ts`, `src/util/Observable.ts` (`raw()`), `package.json` / `yarn.lock` (deps)
    - removed:  `packages/app/src/ui/CodeMirror*`, `codemirror-classes.txt`, `SpellFile.offsetForPosition` / `positionForOffset`
    - see "Store proxies stand in for the real objects" above for the workarounds this needed
  - **Expecting mode:  what can come next** (in `95cbc54`, plus what's staged after it)
    - new `packages/parser/src/Expectations.ts` (+ test), `P.Expectation` (`parser.types.ts`), `Parser.expectedAfter()`
    - hooks in `packages/parser/src/rules/Sequence.ts` (incl. `allowRunOut`, `within`), `Choice.ts`, `Repeat.ts`, `Subrule.ts`
    - cost:  ~+1% normal parsing per round of hooks (twice);  `Expectations.memoized()` SHARES matches -- only safe
      because expecting-mode matches are thrown away
  - **Completion, signature help, quick fixes** (staged)
    - `SpellLanguageService.ts`:  `expectedNext()`, `expectedItems()`, `methodTail()`, `firstKinds()`, `argNamesOf()`,
      `signatureHelp()`, `codeActions()`, `methodSignatureFor()`, `statementBefore()`, `isUnfinished()`,
      the item builders (`variableItems()`...), `firstWords(followGroups)`
    - `SpellLanguageServer.ts` (signature help + code action capabilities), `server.test.ts`,
      `SpellLanguageFeatures.ts` + `LspToMonaco.ts` (Monaco providers), their tests
    - heuristics to check:  what counts as `continues` (`Choice` with a complete alternative);  the quick fix's
      parameter guessing
    - **quick fix is broad**:  offered for ANY statement with words left over, e.g. `set x to 1 2` => "Define
      `to set (x) to (number) (number)`".  Maybe limit it, e.g. to leftovers after a call to a method or a
      built-in like `shuffle` -- `codeActions()` / `statementBefore()` in `SpellLanguageService.ts`.
  - **Not tried by hand in VS Code** -- only through the service tests and the app's Monaco editor:
    completion (`set y `, `a thingy is a `, `move the card `), signature help (`move `), the quick fix (an unknown
    line), code lens.  Reload the window after `yarn vscode`.
  - **Lazy Monaco + `yarn stop`** (staged)
    - `packages/app/src/ui/LazyMonaco.tsx`, `packages/app/src/ui/monaco/FileEditor.tsx`;  `$/app/ui/monaco` out of the `UI` barrel;
      `editor.ts` (`onInputDidMount(editor, api)`, `inputEditorPath`), `InputEditor.tsx`, `OutputEditor.tsx`,
      `debug.ts` (globals now set by `LazyMonaco`), `MonacoEditor.tsx` (`onMount` gets `monaco`)
    - `scripts/stop.mjs`:  `yarn stop` spares the language server an editor started
  - **Code lens + semantic token deltas** (staged)
    - `SpellLanguageService.ts`:  `codeLens()`, `resolveCodeLens()`, `semanticTokensDelta()`, `tokensBuilderFor()`,
      `pushTokens()`;  `SpellLanguageServer.ts`;  `packages/vscode/src/extension.ts` (`spell.showReferences`);
      `SpellLanguageFeatures.ts` + `LspToMonaco.ts` (`semanticTokens()`);  their tests
    - needs `yarn vscode` to rebuild + reinstall the extension, for the lens command
  - Docs touched throughout:  `PARSING.md` ("Rules and matching", "Language server"), `AGENTS.md` (Overview),
    `readme.md`, `PAPERCUTS.md`, `SUSPECTED-BUGS.md`

---

### VS Code runner can't run a project which imports another

- **Cost**:  "Run Project" in VS Code refuses a project whose `project.json` imports another project's compiled
  JS -- it says to run it in the app instead.  `source: true` imports are fine:  they compile into the project.
- **Cause**:  compiled spell imports another project as `@spell/project/<projectId>`, which the app and
  `<spell-app>` fetch from the server's `/api/projects/compiled/` -- see `runCompiled({ loadImport })`.  The
  runner's webview has no server:  it runs compiled code the extension hands it, and asks for nothing else.
- **Fix**:  `runCompiled()` already links imports, given `loadImport(projectId)` -- `<spell-app>` does it:  each
  imported project's JS onto its own `blob:` URL, deepest first.  The VS Code runner just needs to pass a
  `loadImport` that asks the extension for that project's `<Project>.compiled.js`.
- **Pinned at**:  `runCompiled()` in `packages/app/src/runner/runCompiled.ts` -- its "imports another" message.

---

### Semantic UI popups escape `<spell-app>`'s shadow root

- **Cost**:  in a `<spell-app>`, anything a spell program draws with a Semantic UI PORTAL -- `SUI.Modal`,
  `SUI.Popup`, a `SUI.Dropdown` in some modes -- appears unstyled, outside the app, and page styles apply to it.
  Spell's own `UI` set (`SUIPassThroughs`, the forms) uses none today, so only programs reaching for `SUI.*` see it.
- **Cause**:  portals mount into `document.body`, but the app's styles live only in its shadow root -- see
  `shadowStyles.ts`.
- **Fix**:  the coming web-component widgets, which render inside their host.  Meanwhile, a portal could be given
  `mountNode={spellCore.appRoot}` wherever spell makes one.
- **Pinned at**:  `SpellAppElement` (`packages/app/src/runner/SpellAppElement.tsx`).

---

### `<spell-app src>` needs CORS for another origin's compiled JS

- **Cost**:  a page can run `src="https://elsewhere/App.compiled.js"` only if that host sends CORS headers.  Scope
  packs don't need them.
- **Cause**:  the element fetches compiled JS as TEXT, to point its `@spell/core` and `@spell/project/...` imports
  at the app's own runtime copy -- see `linkModule()`.  A page can't read another origin's text without CORS;
  a module `import()` would need it too.  Scope packs are classic scripts, loaded with a `<script>` tag.
- **Fix**:  compiled output that needs no rewriting -- e.g. its imports as bare names an import map per app could
  resolve, if browsers get scoped import maps -- or a same-origin proxy.
- **Pinned at**:  `runProgram()` in `packages/app/src/runner/SpellAppRunner.tsx`.

---

### The web app's editor doesn't write scope packs

- **Cost**:  a project edited and compiled in the web app keeps a stale `<Project>.scopes.js`, so a `<spell-app>`
  running it shows an out-of-date Type Explorer -- until `yarn scopes`, or a compile in VS Code, rewrites it.
- **Cause**:  packs are written by node code:  `SpellDiskWorkspace.writeScopes()`, from `yarn scopes` and the
  language server.  The app compiles in the browser and POSTs just `<Project>.compiled.js`.
- **Fix**:  the app's in-process language service (see `SpellMonaco`) exports the pack after each compile and
  POSTs it beside the compiled JS -- `ScopeExplorer.exportPack()` is browser-safe.
  `<spell-editor>` does the first half already:  it hands a fresh pack to the apps it feeds (`SpellCompiled.scopes`),
  but writes none either -- so an app NOT linked to it still shows the stale one.
- **Pinned at**:  `SpellDiskWorkspace.writeScopes()`;  `packages/lsp/src/scopes.ts`;  `SpellEditorElement.scopesOf()`.

---

### `<spell-editor>` saves to the server with no say-so

- **Cost**:  anyone with a page holding a `<spell-editor>` open can overwrite that project's files -- each compile
  saves what was edited, and writes `<Project>.compiled.js`.  Fine on the dev server, the only place `/element` is
  served today;  NOT anywhere else.
- **Cause**:  it saves through the same `/api/projects/file` POSTs as the web app's editor, which has no users or
  permissions either.
- **Fix**:  a read-only mode -- edit and run in the page, save nothing -- which `project.compile()` can't do yet, as
  it always saves its output;  and some notion of who may save.
- **Pinned at**:  `SpellEditorElement.save()` / `compileNow()` in `packages/app/src/spellEditor/SpellEditorElement.tsx`.

---

### Mouse moves over a `<spell-editor>` never reach the page's `document`

- **Cost**:  a page's own `mousemove` listener on `document` or `window` hears nothing while the mouse is over the
  text of a `<spell-editor>` -- or any Monaco editor we draw in a shadow root.
- **Cause**:  Monaco watches `mousemove` on `document` to see the mouse leave the editor.  Heard there, a move
  inside a shadow root comes from the HOST, NOT inside the editor, so Monaco thought the mouse left on every move,
  and hid the hover before it showed.  So we stop those moves at the shadow root.
- **Fix**:  Monaco's `MouseHandler` checking `event.composedPath()` instead of `event.target` -- upstream.  Then
  delete the HACK.  NOTE: not reported to Monaco yet.
- **Pinned at**:  `keepMouseMovesInShadowRoot()` in `packages/app/src/ui/monaco/MonacoEditor.tsx`.

---

### `<spell-editor>` and `<spell-app>` together are only checked by hand

- **Cost**:  nothing in the test suite would notice a broken link between them, a hover that stops showing in the
  shadow root, or Monaco's worker failing to load -- each broke once while building them, and passed every test.
- **Cause**:  vitest here has no DOM, and the repo has no browser tests.  `element.build.test.ts` checks only that
  the bundles build, parse, and keep Monaco lazy.  The checks that caught those were Playwright scripts, run by hand
  against the dev server -- Playwright and its Chromium ARE installed, see `PAPERCUTS.md`.
- **Fix**:  a Playwright test against the dev server, after `yarn build:element`, skipped when no server answers:
  link both ways, an edit reaching a linked app, hover in the shadow root, the worker loading.  On a scratch copy
  of a project -- the editor SAVES.
- **Pinned at**:  `element.build.test.ts` (what IS checked);  `PAPERCUTS.md`, 2026-09-30.

---

### `<spell-editor>`'s first compile hands apps no scope pack

- **Cost**:  until the SECOND compile, a linked app's Type Explorer shows the server's `<Project>.scopes.js` --
  stale if the project was edited in the web app, and missing (a 404) for a project that never had one.
- **Cause**:  `scopesOf()` needs a `LSP.SpellLanguageService`, and takes `SpellMonaco`'s -- so it has none until
  Monaco loads, which is AFTER the first compile, on purpose, so apps run straight away.  The service itself needs
  no Monaco:  just an `LSP.FileAddresses`, and ours, `AppAddresses`, lives in `$/app/ui/monaco`, which NOTHING
  outside it may import statically.
- **Fix**:  move `AppAddresses` out of `$/app/ui/monaco` -- it imports no Monaco -- and give the editor its own
  service from the start.
- **Pinned at**:  `SpellEditorElement.scopesOf()` in `packages/app/src/spellEditor/SpellEditorElement.tsx`.

---

### An app `<spell-editor app>` names, added to the page later, waits for the next compile

- **Cost**:  a `<spell-app>` matching an editor's `app` selector, but added to the page after its last compile,
  shows its own project's code -- or "Give <spell-app> a project..." -- until someone edits.
- **Cause**:  the editor hands on each compile once, to the apps its selector finds THEN -- see `pushToApps()`.
  Nothing tells it of an app arriving later.  Linked the other way, `<spell-app editor>`, there's no gap:  the app
  asks for the editor's `compiled` as it joins the page.
- **Fix**:  the app announces itself as it joins -- e.g. an event the editor listens for on its root node -- and a
  matching editor hands it `compiled`.  Or prefer `<spell-app editor>` in the docs.
- **Pinned at**:  the `NOTE` on `SpellEditorElement.pushToApps()`.

---

### Two `<spell-editor>`s of one project share its files

- **Cost**:  typing in one shows in the other, and BOTH compile and hand on each edit -- so an app linked to both
  runs it twice.  There's no way to show two independent copies of one project on a page, e.g. "before" and "after".
- **Cause**:  a `SP.SpellProject` is one per project id (its registry), and so are its `SpellFile`s -- and
  `SpellModels` keeps one Monaco model per file path.  Each editor's `SpellMonaco.onEdit()` listener hears edits to
  ANY file of its project.
- **Fix**:  projects in memory, apart from the registry -- which don't exist yet:  every project loads from, and
  saves to, the server by its id.  Until then, one editor per project.
- **Pinned at**:  `SpellEditorElement`'s docstring;  `SpellEditorElement.loadMonaco()`.

---

### `<spell-editor>` brings its own React

- **Cost**:  a page with both elements loads React twice -- `spell-editor.js` has its own, and `spell-app.js` shares
  one with `spell-runtime.js`.  React and React DOM twice, and two copies that can't share context.
- **Cause**:  it's a separate build, `vite.editor.config.ts`, NOT an entry of `vite.element.config.ts`:  with
  `cssCodeSplit: false` a build writes ONE CSS file, and Monaco's would have landed in `spell-app.css`, which every
  `<spell-app>` adopts.
- **Fix**:  one build with a CSS file per entry -- `cssCodeSplit: true`, naming each entry's CSS -- so React goes in
  `spell-shared.js` for both.  Check first that the runtime's CSS still ends up where `<spell-app>` looks for it.
- **Pinned at**:  the header of `vite.editor.config.ts`.

---

### `yarn scopes --builtins` overwrites the built-in types' hand-written docs

- **Cost**:  running it replaces `packages/core/src/spellCore.scopes.js` -- whose `Thing`, `List` and `App` are
  documented by hand -- with the bare types.  Only a diff before keeping it saves the docs.
- **Cause**:  `scopes.ts` makes its `LSP.ScopeExplorer` WITHOUT the built-ins' pack, so `exportBuiltIns()` has only
  the root scope's bare types to write.  The language server's explorer has the pack, and shows the docs.
- **Fix**:  give `scopes.ts`'s explorer `() => workspace.builtInsPack()`, as the language server does -- then
  `--builtins` writes the pack back, plus any new built-in type, bare.  One line.
- **Pinned at**:  `writeBuiltIns()` and the `NOTE` in the header of `packages/lsp/src/scopes.ts`.

---

### Each `<spell-app>`'s runtime stays in memory for the life of the page

- **Cost**:  adding and removing `<spell-app>`s -- e.g. an app that swaps demos in and out -- keeps every copy of
  `spell-runtime.js` it ever loaded, and whatever that copy still holds.
- **Cause**:  each element imports its own copy from a new `blob:` URL (see `loadRuntime()`), and a page never
  drops a module it's imported.  Restart re-uses the SAME copy, so restarting doesn't add to it.
- **Fix**:  reuse copies -- a pool of released ones -- or run each app in an iframe, which a page CAN drop.
- **Pinned at**:  `loadRuntime()` in `packages/app/src/runner/loadRuntime.ts`.

---

### Expression rules ending in `{expression}` swallow the operator after them

- **Cost**:  `the bottom card of the deck is the black joker` parses as `the bottom card of (the deck is the black
  joker)`, compiling to `getItemOf(deck.is_the_$color_joker('black'), -1)` -- the method runs on the DECK, and
  throws.  It is NOT just position expressions.  Probed 2026-09-28:
  - `the first card of the deck is red` => `getItemOf(deck.is_red, 1)`
  - `the first card of the deck is not empty` => `getItemOf(!isEmpty(deck), 1)`
  - `the number of cards in the deck is 52` => `itemCountOf(deck == 52)`
  - `the suit of the first card of the deck is hearts` => `getItemOf(deck == 'hearts', 1).suit`

  So any comparison or method alias after a list / position / count expression silently compiles to nonsense,
  and authors have to parenthesize, e.g. `(the last card of the deck) is ...`, or split the line with
  `get ...` + `it ...`.
- **Cause**:  a rule whose syntax ENDS in a full `{expression}` operand -- `the {ordinal} {arg:singular_identifier}
  (in|of) {expression}` (`lists.ts`), `the? number of ... (in|of) {list:expression}`, and ~20 more in `lists.ts`,
  `math.ts` and elsewhere -- matches its tail as a whole expression, infix operators included.  The infix
  rules (`is`, `is not`, `==`, method aliases) never get to wrap the prefix expression, because the trailing
  operand consumes them first.  Rule `precedence` only breaks ties between whole matches;  it doesn't limit
  what an operand may contain.
- **Fix**:  make trailing operands precedence-aware -- e.g. a narrower operand rule (a `{term}` / non-infix
  expression:  literals, variables, property / position chains, parenthesized) for the last slot of prefix
  expressions, or real precedence climbing in the parser, where an operand only accepts rules binding tighter
  than its owner.  Either way it touches every rule ending in `{expression}`, and their tests.
- **Pinned at**:  `projects/system/library/cards/Deck.spell` `test deck with jokers`, which parenthesizes:
  `expect (the last card of the deck) is the black joker to be yes`.

---

### Thing Explorer's top-level things only update when something else redraws it

- **Cost**:  a top-level variable set to a different thing mid-run, e.g. `the deck is a new deck` in an event
  handler, keeps showing the OLD thing under "Top level" until the explorer redraws for another reason --
  a thing made or dropped, or a click.
- **Cause**:  `ThingRegistry.setTopLevel()` holds the program's module namespace, whose `export let` bindings
  are live -- but a module namespace isn't observable, so nothing tells a `view()` that one changed.
  `version` is bumped only as things register, are garbage-collected, or the registry's cleared.
- **Fix**:  have compiled top-level assignments say so, e.g. a `spellCore.things.changed()` after each write
  to a top-level variable -- or compile top-level state into an observable store instead of bare `let`s.
  Either is a compiler change touching every top-level assignment, and every fixture snapshot.
- **Pinned at**:  `ThingRegistry.setTopLevel()` docstring, `packages/core/src/things.ts`.

---

### Collection helpers' results are full instances of the list's type -- so the Thing Explorer ignores them

- **Cost**:  a copy the program keeps -- `the spare is a copy of the deck` -- never shows in the Thing Explorer:
  it's made the same way as scratch results, which are deliberately hidden.  And every scratch result is a real
  `new Deck()` / `new Pile()`, running that type's constructor and `create()` -- see `SUSPECTED-BUGS.md`.
- **Cause**:  `spellCore.map()`, `filter()`, `rangeBetween()`, `duplicateCollection()` ... build their result
  with `spellCore.newThingLike(collection)`, i.e. `new collection.constructor()`.  So mapping over a pile makes a
  new `Pile`, e.g. in Solitaire's `pile.state` or `reset the game`.  Each one registered as one of the program's
  things, cluttering "All things" with nameless `Pile`s.  `newThingLike()` now makes them
  `ThingRegistry.quietly()` -- which can't tell a throwaway result from a copy the program means to keep.
- **Fix**:  helpers that make a throwaway -- `map()`, `filter()`, loops -- build a plain `List` or array, NOT the
  collection's own type.  Only "a copy of" (`duplicateCollection()`) makes the same type, and registers.  Then
  `newThingLike()` needn't be quiet.  Touches what every collection helper returns, and their tests.
- **Pinned at**:  `spellCore.newThingLike()` (`core.ts`);  test "NOT a collection helper's result" in
  `packages/core/src/things.test.ts`.

---

### Thing Explorer's "Top level" shows only the main program's top-level things

- **Cost**:  a project the program imports -- e.g. `Solitaire-import` importing `Solitaire` -- keeps its own
  top-level lists, e.g. `all_piles`, and they show nowhere.  Its typed things, e.g. each `Pile`, still show
  under "All things" and their types;  only its PLAIN lists and its variable names are missing.
- **Cause**:  top-level things come from the program module's exports, handed over by `runCompiled()` after
  `import()`ing it:  `spellCore.things.setTopLevel(program)`.  Each imported project is linked and imported by
  the program itself, inside `runCompiled()`'s `link()` -- its module namespace never reaches us.  And a plain
  `List` doesn't register when made, so there's no other way to find it.
- **Fix**:  in `link()`, import each project's module ourselves (same `blob:` URL, so the program shares it) and
  hand its exports over too, under its project id -- `setTopLevel()` taking several, and the explorer showing a
  "Top level" per project.  Mind the order:  a project's module MUST have run before the program's.
- **Pinned at**:  `ThingRegistry.setTopLevel()` (`packages/core/src/things.ts`) and `runCompiled()`
  (`packages/app/src/runner/runCompiled.ts`).

---

### Phase 4 package split:  compromises (2026-09-30)

The split of the old `packages/spell` (`scripts/move-packages.mjs`) moved files as they were.  Four shapes it
knowingly kept:

- **`util/src/spell/` is the old `~/util`, whole.**
  - **Cost**:  `parser` and `core` depend on lodash, `chalk`, `pluralize`, `query-string` and the React-era
    state libraries (`@nx-js/observer-util`, `@risingstack/react-easy-state`) for a handful of helpers each;  a
    published `@spell-app/parser` would drag them in.  They sit in `util`'s `package.json`, beside the generic helpers
    `ui` bundles, and `ui`'s util barrel must import the generic files one by one to keep them out.
  - **Cause**:  `~/util` mixed generic helpers (`string`, `assert`, `paths`) with reactive state (`Observable`,
    `extend`), browser fetch (`$fetch`, `Loadable`) and app prefs (`AppPrefStore`, `prefs`).  The split moved it
    whole into `util`, which was then merged into `util` as the sub-folder `src/spell/`.
  - **Fix**:  generic, dependency-free helpers => beside `util`'s generic files;  reactive state => `core`;
    fetch / loadable / prefs => `app` or `spell/node`;  then `src/spell/` and its dependencies go.  Watch `ui`'s
    bundle size (`yarn measure`).
  - **Pinned at**:  `packages/util/package.json` `dependencies`, and `packages/ui/src/util/index.ts`' file-by-file
    imports.
- **The server's request handlers live in `spell`.**
  - **Cost**:  `packages/spell/src/node/project-utils.ts` holds express `request_*` handlers next to the
    disk functions `disk-fetch`, `lsp` and `cli` need;  `response-utils.ts` is all express helpers.  `spell` needs
    `@types/express`.
  - **Cause**:  `disk-fetch` (needed by `lsp`) imports `project-utils` / `file-utils`, which were the server's
    files;  leaving them in `app` made `spell` <-> `app` a cycle.  express is imported as types only.
  - **Fix**:  split `project-utils.ts` into disk functions (stay in `spell/node`) and `request_*` handlers (back to
    `app/src/server`, with `response-utils.ts`).
  - **Pinned at**:  `packages/spell/src/node/{project-utils,response-utils}.ts`.
- **`spell`'s `environment` holds the app's settings.**
  - **Cost**:  `vitePort`, `expressPort`, `api_server`, `staticDir` (`app`'s) live in
    `packages/spell/src/node/environment.ts`, which `app`'s vite configs import by relative path.
  - **Cause**:  one `environment.ts` served the single package;  splitting it was out of scope for a move.
  - **Fix**:  a `app/src/server/environment.ts` for the app's;  `spell`'s keeps `projectsDir` and the roots.
  - **Pinned at**:  `packages/spell/src/node/environment.ts`.
- **`$/app` points at the app's entry, not a barrel.**
  - **Cost**:  `import "$/app"` would boot the app (`src/index.tsx`).  Nothing does today.
  - **Cause**:  the app never had a barrel;  the codemod mapped `#name` to `src/index.*` for every package.
  - **Fix**:  drop the bare `$/app` entry from `tsconfig.base.json`, or add a real barrel.
  - **Pinned at**:  `tsconfig.base.json`.

## ui

### `ui-popup.anchored.css` skips the CSS pipeline

- **Cost** -- one popup sheet ships unminified and unchecked by Lightning CSS (no `@custom-media`, no `@import`, no
  lowering);  the popup has TWO registered sheets (`popup`, `popup-anchored`), and anything that lists a family's
  sheets (`tools/demo/index.ts`) must name both.
- **Cause** -- Lightning CSS 1.30 fails the whole file on `@container anchored(fallback: flip-block)` (anchored
  container queries, which move the arrow when `position-try-fallbacks` flips a popup), so those rules live in a
  separate file imported `?raw`.
- **Fix** -- fold the rules back into `ui-popup.css` once Lightning CSS parses anchored queries (or passes unknown
  `@container` preludes through).
- **Pinned at** -- `src/components/ui-popup/ui-popup.anchored.css` (header), `UIPopup.styles`, `ui-popup.css.test.ts` ("the
  anchored sheet parses in the browser"), `PAPERCUTS.md` 2026-09-29.

### `<ui-flyout>` builds on the modal family, not on the element core

- **Cost** -- the flyout family imports `$/ui/components/ui-modal` (a cross-family barrel import:  loading a flyout defines
  `<ui-modal>`, the content parts and `<ui-button>`, and the `flyout` lib entry depends on the `modal` one);
  `DialogElement` is generic over its vocabulary but reads its attributes, events, parts and texts through casts
  (`dialogAttrs`, `fire()`), so a subclass vocabulary missing one of them fails at run time, not in `tsc`.
- **Cause** -- the brief (2026-09-30) put the shared modal logic IN the modal family ("a shared base or helper in the
  modal family, NOT a copy");  the plan's home for it is `src/elements/OverlayElement.ts` (via `$/ui/core`).  Typing
  "this vocabulary has at least these names" isn't expressible with the vocabulary types as they are.
- **Fix** -- move `DialogElement` (and `ModalFallback`'s dialog logic) to `src/elements/` as the plan's
  `OverlayElement`, exported through `$/ui/core`, once a third dialog element (a page `<ui-dimmer>` could be one) wants
  it;  give it a `DialogVocabulary` constraint type checked with a conditional type.
- **Pinned at** -- `src/components/ui-modal/DialogElement.tsx` (class docs), `src/components/ui-flyout/UIFlyout.tsx`,
  `ui-flyout.fallback.ts` (the `vocabulary` cast), `docs/grammar.md` "Flyouts".

## docs

### The page runtime and plan-doc.js drive two section markups

- **Cost** -- every page but the goals pages is `<ui-section>` markup (2026-10-02), yet the runtime, the CSS and the
  scripts still carry the OLD `section.s2|s3` > `ui-sticky.spell-h2|h3` > `h2|h3` markup alongside:  a second
  outline reader, chevron folding (`section.spell-folded`, `data-fold`), `ui-label.spell-count` counts, per-h2 / h3
  sticky offsets and `--spell-h2-h` / `--spell-h3-h` anchors in `spell-doc-runtime.js`;  the `section.s2` rules in
  `spell-doc.css` / `plan-doc.css`;  the either-markup helpers in `plan-doc.js` (`sectionOf()`, `PHASE_SECTIONS`
  ...) and `index.js`;  both branches of `check-spell.js`.  Each runtime change must be checked against both.
- **Cause** -- the goals pages (`templates/goals/`, the repo root's `goals/`) are generated and edited by the goals
  tooling (`yarn goals`, the `/goals*` skills, `goals-live.js`), which reads and writes the old markup;  migrating
  them is its own task.  `epics/cli-additions` is another session's live plan, deliberately left old until that
  session runs `yarn plan-doc migrate cli-additions`.
- **Fix** -- move the goals templates and tooling to `<ui-section>` (`scripts/to-ui-section.js` `convertSections()`
  does the markup), migrate `cli-additions`, then delete the HEADINGS branch of `spell-doc-runtime.js`
  (`readHeadings()`, `wireHeadingFolds()`, `headingSection()` ...), the old-markup CSS, and the old-markup paths in
  `plan-doc.js` / `index.js` / `check-spell.js` (and the old-layout fixture's tests, or migrate them).
- **Pinned at** -- `packages/docs/_assets/spell-doc-runtime.js` (header:  SECTIONS / HEADINGS), `_assets/spell-doc.css`
  ("The goals pages' markup"), `scripts/plan-doc.js` ("Sections, either markup"), `scripts/fixtures/plan-2026-09-30.html`,
  `AGENTS.md` "Writing a page" / "Templates".

---

## app

### React and Solid side by side

- **Cost**: two JSX runtimes and two renderers in `app` (and what it compiles from `core`):  every `.tsx`
  must say which it is, both plugins run in every `vite*.config.ts`, and React still ships beside Solid.
  A React file missing its marker compiles as Solid:  `tsc` usually catches it, else it fails at runtime.
- **Cause**: the Solid migration (`packages/docs/epics/solid-migration/`) moves the app's own UI one phase at a time,
  and `core` keeps rendering compiled spell with React (its "Core + JSX Emit" phase was split off, D9 there).
  Solid is the DEFAULT JSX (`tsconfig.json` `jsxImportSource: "@solidjs/web"`, so `@spell-app/ui`'s source
  type-checks as-is);  React files carry `/** @jsxImportSource react */` on their first line, which both
  TypeScript and `reactFiles()` (`packages/app/vite.shared.ts`) read.
- **Fix**: move each React file to Solid and drop its marker (`app`'s own UI:  the migration's P6-P8).  React then
  stays only where `core` renders compiled spell, until that moves too;  then delete `@vitejs/plugin-react`,
  `reactFiles()` and the React deps.
- **Pinned at**: `packages/app/vite.shared.ts` (`REACT_DIRS`, `REACT_MARKER`);  the marker in each React `.tsx` of
  `packages/app/src`, `packages/core/src`;  `packages/app/src/solid.test.tsx`.  (`packages/parser/src` has none since
  P8:  its AST views draw framework-free `P.Markup`.)
