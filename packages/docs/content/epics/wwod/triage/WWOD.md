# WWOD — What Would Owen Do?

[ADAPT:  construct-app → this repo (spell)] House style for construct-app. Audience: AI coding agents — follow these over your defaults.
Canonical examples cited as bare file names; read them when unsure.

[ADAPT:  .agents/wwod/ → packages/agents/wwod/ (D1)] This hub holds the universal rules (§1-7). Topic rules live in `.agents/wwod/`
(§8-22) — read the spoke(s) matching what you're touching, BEFORE writing code.
Cite rules as `WWOD §N › "rule title"`, e.g. `WWOD §5 › "Sentinel errors as control flow"`.

| Touching                                             | Also read                | §     |
| ---------------------------------------------------- | ------------------------ | ----- |
| [ADOPT] new feature / module layout                          | `wwod/architecture.md`   | 8     |
| [ADAPT:  SvelteKit routes → SRV.Router;  env → spell/src/node/environment.ts] routes, server APIs, env vars                        | `wwod/server-api.md`     | 9-10  |
| [ADOPT] types, function signatures                           | `wwod/types.md`          | 11    |
| [ADAPT:  Stateful → Cell / Observable;  drop CachedResource (D10)] classes, `Stateful`, `CachedResource`, value objects | `wwod/classes-state.md`  | 12-15 |
| [DROP:  model records, undo, shortcut maps are construct-app (D10)] model records, undo, actions/shortcuts               | `wwod/models-actions.md` | 16-17 |
| [ADAPT:  Svelte → Solid 2 components (D9)] Svelte components                                    | `wwod/svelte.md`         | 18    |
| [ADAPT:  Tailwind → plain .css, ui `--ui-*` tokens, `@layer`] CSS / styling                                        | `wwod/css.md`            | 19    |
| [ADAPT:  drop analytics (D10);  keep logging] analytics events, logging                            | `wwod/events-logging.md` | 20-21 |
| [ADAPT:  vitest `test()` (D6), one style per file] tests                                                | `wwod/tests.md`          | 22    |

## 1. Working process

- [ADAPT:  no analytics here;  UX affordances + happy path first] **Ship the product, not the spec**: granular analytics funnel + UX affordances
  over defensive breadth — happy-path completeness first.
- [ADOPT] **Code top-down from design intent**:
  - Start from user-facing feature definition -- what does the user see, work down from that.
  - README / types / API surface next.
  - Temporary inconsistency is fine, then a reconcile-and-fix pass.
  - Source (types + implementation) is the spec;
    tests get rewritten to match unless code is obviously wrong.
- [ADOPT] **Drive-by hygiene while in the neighborhood**:
  - import normalization,
  - small inconsistency fixes in touched files,
  - fix obviously incorrect comments.
  - A drive-by fix SHIPS even when the refactor that surfaced it is parked.
- [ADOPT] **Grep the whole repo BEFORE renaming or moving anything**, and record what you found:
  - "nothing outside `TourRun.ts` reads `run.index`" is what makes a rename a contained change
    rather than a hopeful one.
  - [ADAPT:  `$lib/util` → `$/util` or package util (D8f)] Same before promoting a helper: check the destination for a name collision
    (`clamp` → `$lib/util/math.ts`).
- [ADAPT:  task file → plan doc (`epics/<name>/`)] **Record deviations and known issues in the task file; NEVER fix them silently:**
  - Each fidelity/refinement round names the deviations it closed, with literal values.
  - Standing problems go under a `### Known issues` heading rather than being left implicit.
  - An evaluated-and-rejected approach gets a written census of what it would touch.
  - [CONFLICT → D8i:  no CORRECTED markers;  files keep own rules] A claim later found wrong gets a **CORRECTED `<date>`:** annotation, not a quiet edit.
- [ADAPT:  no setGlobal / setDebugGlobal here;  helper → CODE-DEBT (D3)] **`setGlobal()` vs `setDebugGlobal()`** (`util/setGlobal.ts`):
  - `setGlobal()` for truly global things (available to other modules) — very sparingly.
  - `setDebugGlobal()` to expose state for debugging (`setDebugGlobal({ circuit: this })`) —
    but NEVER depend on debug globals in code.
  - Both preferred over `console.log` for object inspection.
- [ADAPT:  five gates → `yarn review` per package (+ ui `yarn test:visual`)] **Finishing pass for fast-drafted code**: run ALL FIVE gates -- `yarn tsc`,
  `yarn svelte-check`, `yarn lint`, `yarn prettier`, `yarn test:unit` -- then sweep for classic
  drift bugs:
  - operator precedence in template ternaries (`` `${a}` + b ? … ``)
  - inverted comparisons in guard clauses
  - DOM globals silently captured by `cause` shorthand (`{ cause: { status } }`)
  - `return promise` inside try/catch without `await` (catch never fires)
  - response-shape drift between server return and client type
  - secrets/hashes crossing a boundary in the wrong field
  - copy-paste residue from the file used as a template (labels, event types, undoActions)
  - missing early-return in prompt flows; silent flows popping UI
- [ADOPT] **Report the gates with numbers, and name what was already broken:**
  - test count AND the delta, with the reason -- `1128 passed / 65 files`, was `1130`, net -2
    from the dropped reachability test and the clamp tests collapsing from 2 into 1.
  - pre-existing warnings are called pre-existing (`0 errors / 4 pre-existing warnings`).
- [ADOPT] **The `CLAUDE TODO` sweep is its own pass, not a step in the finishing pass:**
  - Find them ALL first (`grep -rn "CLAUDE TODO" <folder>/`), then work the list.
  - Do the ones that are right; for each one you think we should skip, ask the user what they want to do.
  - The pass is done when the grep comes back empty.

## 2. General Coding Style

- [ADOPT] **DRY: extract logic duplicated more than ~3 lines** into a shared utility.
  - [ADAPT:  `$lib/util/` → `$/util` or package util (D8f)] Before writing a new one, check `$lib/util/`
  - e.g. `prop.get` for dotted paths, date helpers
  - [HAVE → AGENTS.md "Types / Exports"] After implementing a feature, check to see if blocks of code are duplicated
    and lift up into `<feature>.types.ts`, `utils/` etc.
  - NEVER hard-code the same string more than once, make it a constant
    or pass sample message into a helper function which can be overridden.
  - [HAVE → packages/util/AGENTS.md "Overview"] **Boundary: extraction NEVER makes a `$lib/util` module import from a feature layer.**
    When the only shared home would invert the dependency, a small private copy is CORRECT.
- [ADAPT:  app's `$fetch` / api layer throws `ResponseError`s] **API layers handle client/server communication and throw.**
- [ADAPT:  Circuit → our model classes (`SpellProject`, `Thing`)] **Models combine property defaulting/business logic:** (`Circuit:addNodes()`)
  - Complex business logic for manipulating object should be in model class, throw on error.
- [ADAPT:  CDApp → app's editor (`editor.showError()`)] **App controllers/methods use models+API and show feedback to user:** (`CDApp:createCircuit()`)
  - High-level flows for user interaction belong in App controllers, which display feedback
    as process progresses:

  ```
    const id = getId()
    ui.showActivity("Starting process", { id })
    try {
      const params = model.doPotentiallyBreakingStuff()
      const result = api.makeServerCall(params)
      ui.showSuccess("It worked!", { id })
      return result
    } catch (error) {
      ui.showError("It failed", { id }, { error })
    }
  ```

- [ADOPT] **Generalize the domain:**
  - `publishFile` not `publishCircuit`
  - open `extension` lists instead of closed unions
  - parameterized helpers (`blobKey(id, ext)`) instead of one per kind.
- [CONFLICT → D8f:  `$/util` only if 2+ packages use it, else package util] **Hoist anything generic out of the feature** to its existing or logical home:
  - Before writing a helper, check if a similar function already exists, e.g.
    - time helpers → `$lib/util/time`
    - gzip → `$lib/files`
    - generic components → `$lib/ui/components/`.
  - Hoisting an EXISTING feature helper is the "Promotion path" in `wwod/architecture.md` §8 --
    it gets renamed to drop the feature's vocabulary on the way out.
- [ADOPT] **Streamline business logic:**
  - Prefer "smarter" methods which internally throw, show user feedback, etc
  - Avoid duplicating large chains of business logic, especially in app code,
    components, or route handlers.
  - If two functions do generally the same thing, consider consolidating
    into one function with arguments (`publishDocument()`)
- [ADOPT] **Best-effort work:**
  - `catch (ignored) { console.error(...) }`
  - Methods documented `- NEVER throws`
  - Deliberately un-awaited calls get a comment saying so.
- [ADOPT] **No unnecessary case normalization** (`.toLowerCase()`) for values with a defined format
  (env var names).
- [CONFLICT → D8a:  oxfmt, 120 cols (no semis, double quotes, 2 spaces)] **Formatting**: Prettier, 100-char width, 2-space indent, no semicolons, double quotes.
- [CONFLICT → D5, D8b, D8c:  TS `private`;  standard decorators;  no @memoize] **Private class fields use `#` prefix**, not `private`. Strict TypeScript, decorators
  enabled (tsconfig) — safe to rely on class field decorators (`@memoize`, etc).

## 3. Naming

- [ADOPT] **Name methods/vars for business logic, for humans:** (`publishController:publishDocument()`)
  - Humans understanding business logic is the hardest part of programming.
  - Name types, vars, methods, return values so business logic reads close to English.
  - Avoid abbreviations unless used consistently everywhere in a module.
- [ADOPT] **`<result>For<input>()` for pure lookups**: `parentForNodes`, `routeForCircuit`,
  `crumbsForURL`, `titleForName`.
- [ADAPT:  only where app code has route / navigation controllers] **Controller families**: `routeFor*` (string) → `show*` (navigate) → `isShowing*` →
  `canShow*` → `navigatedTo()` (UI reports back).
- [ADOPT] **Arrow-function class fields for callbacks; methods for mutations:**
  - Arrows for anything destructured or passed on (`getNode =`, `showQRE =`) — preserves
    `this` binding.
  - Prototype methods for internal imperative mutations (`deleteNodes()`).
- [ADOPT] **Boolean getters prefixed `is`/`has`/`can`**: `isEditing`, `hasChanges`, `canUndo`.
- [ADOPT] **Drop the redundant type word once something is a class member** -- the class already said it:
  - `nextRun(run)` → `next()`, `planTour()` → `planSteps()`, `resolveTourActions()` →
    `actionsFor()`, `tourActionKeys()` → `actionKeys()` (`TourRun.ts`).
  - Derived reads become GETTERS, not methods: `tourProgress(run)` → `get progress`,
    `currentStep(run)` → `get currentStep`, `canBack(run)` → `get canBack`.
- [ADOPT] **A local-name collision blocks a rename:**
  - `run.index` → `run.step` for the FIELD, but locals meaning "a plan position" stay `index`.
  - `this.step` is unambiguous because it's always prefixed; a bare local `step` holding a
    number, sitting beside locals meaning "a `TourStep`", reads as a bug on sight.
- [ADOPT] **Names must be HONEST about what the thing is**, and get fixed when they aren't:
  `TourTarget` → `TourSelector` (it holds a selector, not a target); `TargetResolver` →
  `ElementResolver`.
- [ADOPT] **Magic strings become named constants declared above the function:**
  - `const UTM_KEYS = [...]`, `const SEARCH_REFERRERS = /google|bing/i`.
  - Prefer a regex with the `i` flag over `.toLowerCase()` comparisons.
- [ADOPT] **Don't rename for no reason**: a destructured variable with a clear name keeps it
  (`replayEnabled`, not `shouldEnableReplay`).
- [ADOPT] **Fluent setters** `return this  // for chaining`.
- [ADOPT] **Underscore-prefixed raw params**, normalized into a same-named local:
  `routeForURL(_url?: F.AppURLInput) { const url = F.AppURL.optional(_url) }`.
- [ADOPT] **Qualified ids**: `publishId` not `id` even where context disambiguates; `slug` not
  `displayName`; `hashedWriteKey` not `writeKeyHash`.

## 4. Imports

- [HAVE → AGENTS.md "Imports"] ALWAYS import from `$lib` rather than `$src/lib` if possible.
- [CONFLICT → D4:  ONE namespace per package;  leaf types only as `PT`] **Consume a types module as a NAMESPACE, never as a named-import list:**
  - `import * as T from "./<feature>.types"`, then `T.TourStep` at every use.
  - `import type * as T` wherever no values are needed -- type-only namespace import erases completely from output code.
  - The barrel exports both forms: `export * from "./tours.types"` plus
    `export * as T from "./tours.types"`.
- [CONFLICT → D4:  barrel only;  types-only leaf as `import type * as PT`] **OK to import the LEAF module, not the barrel**, when importing the barrel crosses domains or if the barrel imports .svelte components.
- [HAVE → AGENTS.md "Imports"] ONLY use relative imports in the same folder (`./`); NEVER use `../` — if you need to reach
  a parent folder, that's a `$lib` import instead.
- [HAVE → AGENTS.md "Imports"] Import order (blank line between groups):
  - [DROP:  Svelte-only;  Solid sits with node_modules] svelte
  - node_modules
  - `$lib/util/*` and other general utilities, general-to-specific
  - imports from other sub-systems
  - local models / helper files, then svelte components, then css (`./` only)

## 5. Errors

- [ADAPT:  `$lib/util/error` → `$/util` `CustomError` (D7)] **Throw typed house errors from `$lib/util/error`:**
  - [CONFLICT → D7:  small error classes OK, in `<folder>.types.ts`] NEVER return `{ ok: false, error }` unions; NEVER invent per-feature Error subclasses.
  - [ADOPT] `TypeError` for bad user input.
  - [CONFLICT → D7:  typed `XCause` in `cause`;  `CustomError` props → debt] Error details ride in `cause`: `{ cause: { baseVersion, existing } }`.
- [ADAPT:  `HttpError` status → util's `ResponseError` subclasses] **Server → client error identity:**
  - Server returns `{ errorType, error, cause }`.
  - Client rehydrates via the name→constructor table (`RETURNED_ERROR_MAP` in `fetchAPI.ts`).
  - Only a genuinely-expected error becomes a value (`instanceof NotFoundError → undefined`).
- [CONFLICT → D7:  error classes live in `<folder>.types.ts`] **Error classes: one per file, body usually empty:**
  - [ADOPT] Name assigned AFTER the class: `CanceledError.prototype.name = "CanceledError"`.
  - [ADOPT] Never `this.name =` in a constructor.
- [ADOPT] **Structured Error causes** get an exported `XxxCause` type
  - `declare cause: XxxCause | undefined` on the class
  - read-only convenience getters (`get status() { return this.cause?.status }`).
- [ADOPT] **Sentinel errors as control flow:**
  - `CanceledError` aborts silently.
  - [DROP:  CachedResource (D10)] `OverwriteError` triggers an interactive retry loop (self-recursive closure mutating
    `config` — `CachedResource.save`).
- [ADAPT:  `getDier(context, activity, params)`;  no `makeErrorWrapper`] **Rethrow with context:**
  - catch => set `error.cause = { method, args }` => rethrow, or
  - use the `makeErrorWrapper(className)` decorator (`wrapError.ts`).
- [ADAPT:  our `die()` RETURNS an Error;  `getDier()`'s `die` throws] **`x ?? die("message")`** for quick required-value checks (`util/die.ts`).
- [ADAPT:  no `$lib/util/hooks` here;  `safelyCall` → CODE-DEBT (D3)] **Caller-supplied callbacks run through `$lib/util/hooks`:**
  - `safelyCall(predicate, logger?)` for a predicate, `safelyCallAll(list, logger?)` for a
    disposer/cleanup list.
  - The two differ ON PURPOSE: a PREDICATE that throws is an authoring bug, so it stays visible
    and falls back to `console.warn` with no logger; a CLEANUP callback that throws is noise,
    so it's silent without one.
  - NO hand-written `label` param on either: a REAL throw carries a stack pointing at the exact
    file and line, which beats anything you'd type, so the wrapper logs a generic message and
    the call site keeps a short inline comment instead. (`runHook()` still takes a `label`,
    because it MANUFACTURES a timeout error where there is no stack to read.)
- [ADAPT:  `ui.showError` → app's `editor.showError()`] **User-facing failures use `ui.showError("message")`**, not thrown exceptions that crash
  the UI — missing templates, API failures the user should know about.
- [ADOPT] **Guard-clause throws name the method, the problem, and the fix**:
  `throw new TypeError("APITransaction.userHasRoleOrDie(): you must call 'authorize()' first.")`.
- [ADAPT:  `#user` → TS `private` (D5) / `Cell` fields] **Separate success and error state** — `#user` + `#userError`, never one
  `state: Result | Error | undefined` variable.

## 6. Comments & docs

- [HAVE → AGENTS.md "Documentation"] **JSDoc docstring on every export:**
  — one-line summary then `- ` bullets.
  - [ADAPT:  HAVE all but `--` as em-dash;  add that] Two spaces after a period; `--` as em-dash; backticked identifiers.
  - ALL-CAPS invariants: `NEVER`, `MUST`, `SIDE EFFECT:`,
    `NOTE: Throws if you don't authorize() BEFORE calling!`
- [HAVE → AGENTS.md "Documentation"] **Per-field docstrings on every option/type member** — even one-liners.
- [ADAPT:  HAVE side effects (AGENTS.md "Documentation");  add throws] **Always note throws and side effects:**
- [ADOPT] **Lower inline density; minimal meta-commentary about the code:**
  - Inline comments are short and operational:
    `// Save blobs first: link will still work if we don't update the Dynamo table`.
  - [HAVE → AGENTS.md "Documentation"] Explain _why_, never restate the code.
- [HAVE → AGENTS.md "Documentation"] Use `//////` blocks to separate functional groups in long methods (`Circuit:updateNodes()`)
- [ADOPT] **Comments that explain a utility belong as JSDoc on the function**, not floating above
  a call site.
- [ADOPT] **A module docstring states its POSITION IN THE IMPORT GRAPH** and what it must never import:
  - `tours.types.ts`: "sits at the BOTTOM of the folder's import graph: no tour module, no DOM,
    no Svelte, no value imports at all."
  - `tourGeometry.ts`: "RULE: no geometry in any `.svelte` file."
  - `TourRun.ts`: what it deliberately does NOT know about, and why that's what makes it
    testable.
- [ADOPT] **Record the REJECTED refactor at the site**, so nobody re-proposes it blind:
  - Same for a deliberate non-obvious shape: "STATIC and instance-free on purpose", "Free
    rather than a method", "Deliberately does not re-plan".
- [ADOPT] **Log/warn strings are prefixed with the emitting method**:
  `debug("getSidebarDropTarget(): missing", {…})`.
- [HAVE → AGENTS.md "Documentation"] **Docstring examples** use `~==` for "equivalent to", `===` for exact:
  `url.projectURL ~== "@org:project:main"`.
- [ADOPT] **OK to ship WIP markers**: `// TODO: update the published version in dynamo!`, `// DOCME`,
  empty banner sections for planned code. Terse TODOs, not fully-explained prose.
- [ADAPT:  merge into AGENTS.md "Documentation" (+DEBUG CONSIDER TESTME SEE)] **Marker vocabulary** (line above the item):
  - `TODO:` `NOTE:` `DEBUG:` `CONSIDER:` `TESTME` `DOCME` `RENAME` `DEPRECATED:`
  - [HAVE → AGENTS.md "Long-term debt"] `REFACTOR:` — propose the new shape inline
  - `HACK:`/`HACKY:` — state the fragile assumption
  - `SEE:` — cross-reference or URL
- [ADOPT] **Ensure comments don't drift:**
  - When code is touched, make sure docstrings and other comments match.
  - [HAVE → AGENTS.md "Documentation"] Add docstring comments proactively, particularly for `DOCME` or `CLAUDE DOCME`.
  - A rename updates prose EVERYWHERE in the same commit, including other folders --
    `waitForTargets()` → `waitForElements()` inside a `cd/tours` step comment, and every
    `tourRegistry.test.ts` mention in the README.
  - The folder README's files table is part of the code: it changes in the same commit, and a
    file that LEFT the folder keeps a row pointing at its new home
    (`*(none -- $lib/util/ElementTracker.ts)*`).
- [HAVE → AGENTS.md "Documentation"] **Comments are easiest read in phrases and bullets:** wrap at phrase boundaries (not
  mid-clause), avoid orphaned widow words, format lists as bullets rather than inline commas,
  and drop filler articles (`the`, `a`) that don't earn their place -- e.g. `last known server
version`, not `the last known server version`.

  BAD:

  ```
  We really should do something about the
  thing, as it might fail in the following cases (see
  `someRoutine()`): first case with a long name, second
  case, third case
  ```

  GOOD:

  ```
  We really should do something about the thing,
  as it might fail in the following cases:
  - first case with a long name
  - second case
  - third case
  - SEE: `someRoutine()`
  ```

- [ADAPT:  Prettier → oxfmt (D8a)] **`// prettier-ignore`** only for aligned ternary ladders with per-branch comments
  and hand-packed const tables. Trailing `//` to force a Prettier line break.
- [ADOPT] **The final `else` of an exhaustive ladder documents its condition**:
  `else /* if (placement === "after") */`.
- [ADAPT:  eslint → `oxlint-disable`, with `-- reason`] **`eslint-disable` carries a `-- reason`:**
- [CONFLICT → D8d:  README per package;  per folder only where needed] **README per folder, named `README.md`:** Structure:
  - [ADAPT:  `$lib/x` → `$/name`] H1 `` `$lib/x` -- tagline ``
  - [ADAPT:  only for a folder that parses URLs] URL-grammar fenced block
  - "The DRY rule (one of each)" with "If you find yourself writing a second copy of any
    of these, stop and reuse."
  - Files table (unaligned `| --- |`), env-var table
  - numbered "Adding a new X" recipe, "Deferred" section.
  - [ADAPT:  in-flight design notes → plan doc (`epics/`)] Sidecar `.txt` for in-flight design notes.
- [ADAPT:  like ui's vocabulary files;  one `MSG.ts` per package] **User-facing strings in a `MSG` object literal `as const`** (`MSG.ts`):
  - keys namespaced by subsystem prefix
  - values strings or `(param) => string` builders.

## 7. Anti-patterns (Claude habits to drop)

- [CONFLICT → D8g:  1 class / file stays;  helper families share a file] Micro-modules (one concept per file) + 1:1 test files.
- [ADOPT] Terse abbreviations (`ctor`, ...).
- [CONFLICT → D7:  small error classes in `<folder>.types.ts`] Bespoke per-feature Error subclasses -- general ones OK in `util/error`.
- [ADOPT] `{ ok: false, error: "..." }` discriminated result unions + error-mapper functions.
- [CONFLICT → D8f:  `$/util` if 2+ packages use it, else package util] Local copies of generic helpers in route/feature files -- move to e.g. `util` file instead.
- [HAVE → AGENTS.md "Imports"] Long named-import lists from leaf modules.
- [ADOPT] Long meta-comments narrating the code or justifying correctness, one sentence is fine.
- [ADOPT] Positional param threading (`update(circuit, record, existing, svg, slug, baseVersion)`).
- [ADAPT:  SvelteKit route files → `SRV.Router` route modules] One route file per HTTP verb; helpers and retry loops defined inside route files.
- [ADAPT:  app classes → a Solid component, not inline modal config] Inline modal `fields:[]`/`actions:[]` config UIs inside app classes -- make component instead.
- [ADAPT:  mutable class with `Cell` fields / `Observable` (§12)] Immutable-record state machines: a `type X = {...}` plus `nextX(x)`/`endX(x)` free functions
  returning `{ ...x, changed }` spreads. That's a mutable class -- see
  `wwod/classes-state.md` §12.
- [ADOPT] Free functions whose first argument is always the same object, or that thread the same
  `context` through every call -- both are a class with fields.
- [ADOPT] A distinct input type per method (`getElements(spec)` vs `measureAll(elements)`) instead of
  one input type for the whole class.
- [ADOPT] Keeping a field, option or export nothing reads.
