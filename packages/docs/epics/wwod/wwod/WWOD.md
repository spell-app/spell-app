# WWOD -- What Would Owen Do?

House style for this repo (spell).  Audience:  AI coding agents -- follow these over your defaults.
- What's about THIS repo -- package map, dependency direction, aliases, worktrees and windows, changelog, ledgers --
  is in the root `AGENTS.md`;  what's local to one package, in that package's `AGENTS.md`.
- Examples cite real files by repo path;  read them when unsure.  Where an example has no path, it's illustrative.

This hub holds the universal rules (§1-7).  Topic rules live in the spokes beside it, `packages/agents/wwod/`
(§8-20) -- read the spoke(s) matching what you're touching, BEFORE writing code.
Cite rules as `WWOD §N › "rule title"`, e.g. `WWOD §5 › "Sentinel errors as control flow"`.

| Touching                                                       | Also read                         | §     |
| -------------------------------------------------------------- | --------------------------------- | ----- |
| new feature, module layout, file names, barrels, namespaces    | `architecture.md`                 | 8     |
| types, function signatures, helper functions                   | `types.md`                        | 9     |
| server routes and APIs, env vars, configuration                | `server-env.md`                   | 10-11 |
| classes, decorators, state, `Loadable`, value objects, records | `classes-state.md`                | 12-16 |
| Solid components, JSX                                          | `solid.md`                        | 17    |
| CSS / styling                                                  | `css.md`                          | 18    |
| logging, debug output                                          | `logging.md`                      | 19    |
| tests                                                          | `tests.md`                        | 20    |
| ANY Solid 2 code:  signals, stores, effects, `<ui-*>`, JSX     | `packages/docs/solid/solid-2.md`  | --    |
| anything inside a package                                      | `packages/<pkg>/AGENTS.md`        | --    |

- Solid mechanics live in `packages/docs/solid/solid-2.md`, not here:  READ IT IN FULL before any Solid work.
  WWOD §17 is house style on top of it.
- Each package's `AGENTS.md` holds what's local to that package;  a section there that shares a WWOD rule's name
  EXTENDS it ("As WWOD §N, plus:").

## 1. Working process

- **Ship the product, not the spec:**
  - UX affordances and happy-path completeness first, over defensive breadth.
- **Code top-down from design intent:**
  - Start from user-facing feature definition -- what does the user see, work down from that.
  - README / types / API surface next.
  - Temporary inconsistency is fine, then a reconcile-and-fix pass.
  - Source (types + implementation) is the spec;
    tests get rewritten to match unless code is obviously wrong.
- **Drive-by hygiene while in the neighborhood:**
  - import normalization
  - small inconsistency fixes in touched files
  - fix obviously incorrect comments
  - A drive-by fix SHIPS even when the refactor that surfaced it is parked.
- **Grep the whole repo BEFORE renaming or moving anything**, and record what you found:
  - "nothing outside `Run.ts` reads `run.index`" is what makes a rename a contained change
    rather than a hopeful one.
  - Same before promoting a helper:  check the destination -- `$/util`, or the package's own util folder
    (WWOD §8 › "Promotion path") -- for a name collision.
- **Record deviations and known issues;  NEVER fix them silently:**
  - Epic work:  in its plan doc, `packages/docs/epics/<name>/<name>.html`.
    - Each fidelity / refinement round names the deviations it closed, with literal values.
    - An evaluated-and-rejected approach gets a written census of what it would touch.
  - Standing problems go in the ledger they belong to, at the repo root, rather than being left implicit:
    - `CODE-DEBT.md` -- structural debt tolerated on purpose, incl. code that doesn't follow a WWOD rule yet
    - `SUSPECTED-BUGS.md` -- looks like a bug, not sure
    - `PAPERCUTS.md` -- tooling that slowed development down
  - Each ledger keeps its own rules (header of each file), e.g. `SUSPECTED-BUGS.md` deletes an entry once settled.
  - NOT:  a `CORRECTED <date>:` annotation on a claim later found wrong -- each file's own rule says how it's fixed.
- **Debug globals through `setDebugGlobal()`, never `console.log`, for object inspection:**
  - `setDebugGlobal({ project })` exposes state in the devtools console.
  - NEVER depend on a debug global in code:  it's for a human at the console, nothing else.
  - `setDebugGlobal()` belongs in `$/util`, and is still to be built (`CODE-DEBT.md`).  Until then:  the hand-written
    form, with a `TODO` naming the helper:

    ```ts
    // TODO: setDebugGlobal({ project })
    Object.assign(globalThis, { project })
    ```

- **Finishing pass for fast-drafted code:**  run `yarn review` in every package you touched (or at the root):
  `yarn ts`, `yarn lint:fix` (oxlint), `yarn format` (oxfmt), `yarn test`.
  - `packages/ui`:  `yarn test:visual` too, when anything visible changed.
  - Then sweep for classic drift bugs:
    - operator precedence in template ternaries (`` `${a}` + b ? … ``)
    - inverted comparisons in guard clauses
    - DOM globals silently captured by `cause` shorthand (`{ cause: { status } }`)
    - `return promise` inside try/catch without `await` (catch never fires)
    - response-shape drift between server return and client type
    - secrets / tokens crossing a boundary in the wrong field
    - copy-paste residue from the file used as a template (labels, messages, event names)
    - missing early-return in prompt flows (`editor.prompt()` cancelled);  silent flows popping UI
- **Report the gates with numbers, and name what was already broken:**
  - test count AND the delta, with the reason -- `1128 passed / 65 files`, was `1130`, net -2
    from a dropped test and two `clamp` tests collapsing into one.
  - pre-existing warnings are called pre-existing (`0 errors / 4 pre-existing warnings`).
- **The `CLAUDE TODO` sweep is its own pass, not a step in the finishing pass:**
  - Find them ALL first (`grep -rn "CLAUDE TODO" <folder>/`), then work the list.
  - Do the ones that are right;  for each one you think we should skip, ask the user what they want to do.
  - The pass is done when the grep comes back empty.

## 2. General style

- **DRY:  extract logic duplicated more than ~3 lines** into a shared utility.
  - Before writing a new one, check `$/util` and the package's own util folder (`$/ui/util` ...),
    e.g. lodash (in `$/util`) for dotted paths, `string.ts` for case conversion.
  - After implementing a feature, check to see if blocks of code are duplicated
    and lift up into `<folder>.types.ts` (constants, small pure helpers -- WWOD §8) or a util file.
  - NEVER hard-code the same string more than once, make it a constant
    or pass sample message into a helper function which can be overridden.
  - Boundary:  extraction NEVER makes a util module import from a feature layer.
    When the only shared home would invert the dependency, a small private copy is CORRECT.
    SEE:  `packages/util/AGENTS.md` "Overview".
- **API layers handle client / server communication and throw:**
  - `$fetch()` (`$/util`) throws a `ResponseError` subclass for every failure (WWOD §5 › "Server → client error
    identity");  callers never check `response.ok` themselves.
- **Models combine property defaulting and business logic:**
  - Complex business logic for manipulating object should be in model class, throw on error,
    e.g. `SpellProjectRoot.createApp()` (`packages/spell/src/SpellProjectRoot.ts`).
- **App controllers use models + API and show feedback to user:**
  - High-level flows for user interaction belong in the app's controller, `editor` (`packages/app/src/editor.ts`),
    which reports success and failure as the flow runs:

  ```ts
  async createApp(projectRoot?: SP.SpellProjectRoot, projectId?: string): Promise<void> {
    projectRoot ??= editor.projectRoot!
    try {
      const project = await projectRoot.createApp(projectId)
      if (project) {
        editor.showEditor(project.path)
        editor.showNotice(`Created ${project.type} ${project.projectName}.`)
      }
    } catch (e) {
      editor.showError(e)
    }
  }
  ```

- **Generalize the domain:**
  - one `createApp()` for every project type, its message naming `project.type` -- not one per type
  - open `extension` lists instead of closed unions
  - parameterized helpers (`blobKey(id, ext)`) instead of one per kind
- **Hoist anything generic out of the feature** to its existing or logical home:
  - Before writing a helper, check if a similar function already exists.
  - Its home:  `$/util` ONLY when 2+ packages use it, else the package's own util folder.  SEE:
    `packages/util/AGENTS.md` "Overview" (what lands in `$/util` lands in `ui`'s bundle).
  - Hoisting an EXISTING feature helper is WWOD §8 › "Promotion path" --
    it gets renamed to drop the feature's vocabulary on the way out.
- **Streamline business logic:**
  - Prefer "smarter" methods which internally throw, show user feedback, etc.
  - Avoid duplicating large chains of business logic, especially in app code,
    components, or route handlers.
  - If two functions do generally the same thing, consider consolidating
    into one function with arguments.
- **Best-effort work:**
  - `catch (ignored) { console.error(...) }`
  - Methods documented `- NEVER throws`
  - Deliberately un-awaited calls say so:  `void editor.compileApp()`, plus a comment when the why isn't obvious.
- **No unnecessary case normalization** (`.toLowerCase()`) for values with a defined format (env var names).
- **Formatting is oxfmt's**, configured once in `.oxfmtrc.json` at the repo root:
  - 120-char width, 2-space indent, no semicolons, double quotes, no trailing commas
  - never hand-format against it;  `yarn format` settles it
- **TypeScript `private`, not `#private`:**
  - `private index = 0` -- private to TypeScript, a plain property at runtime.
  - Strict TypeScript.
  - NOT:  `#` private fields -- a Proxy can't reach them (`Thing` subclasses, SEE:  `packages/docs/solid/solid-2.md`),
    and tests can't peek.
- **Decorators:**  STANDARD (TC39) only -- WWOD §12 › "Decorators".

## 3. Naming

- **Name methods / vars for business logic, for humans:**
  - Humans understanding business logic is the hardest part of programming.
  - Name types, vars, methods, return values so business logic reads close to English.
  - Avoid abbreviations unless used consistently everywhere in a module.
- **`<result>For<input>()` for pure lookups:**
  - `positionForOffset`, `locationForDiskPath`, `serverPathForRoot`, `lastSelectionForFile`.
- **Controller families**, where app code navigates:
  - `<view>Url` (string) → `show<View>()` (navigate) → `isShowing<View>` → `canShow<View>` → `navigatedTo()`
    (UI reports back).
  - e.g. `SpellLocation.editorUrl` → `editor.showEditor()` (`packages/app/src/editor.ts`).
- **Arrow-function class fields for callbacks;  methods for mutations:**
  - Arrows for anything destructured or passed on (`getNode =`, `showDialog =`) -- preserves
    `this` binding.
  - Prototype methods for internal imperative mutations (`deleteNodes()`).
- **Boolean getters prefixed `is` / `has` / `can`:**  `isEditing`, `hasChanges`, `canSave`.
- **Drop the redundant type word once something is a class member** -- the class already said it:
  - In a `Run` class:  `nextRun(run)` → `next()`, `planRun()` → `planSteps()`, `runActionKeys()` → `actionKeys()`.
  - Derived reads become GETTERS, not methods:  `runProgress(run)` → `get progress`,
    `currentStep(run)` → `get currentStep`, `canBack(run)` → `get canBack`.
- **A local-name collision blocks a rename:**
  - `run.index` → `run.step` for the FIELD, but locals meaning "a plan position" stay `index`.
  - `this.step` is unambiguous because it's always prefixed;  a bare local `step` holding a
    number, sitting beside locals meaning "a `Step`", reads as a bug on sight.
- **Names must be HONEST about what the thing is**, and get fixed when they aren't:
  - `Target` → `Selector` when it holds a selector, not a target;  `TargetResolver` → `ElementResolver`.
- **Magic strings become named constants declared above the function:**
  - `const UTM_KEYS = [...]`, `const SEARCH_REFERRERS = /google|bing/i`.
  - Prefer a regex with the `i` flag over `.toLowerCase()` comparisons.
- **Don't rename for no reason:**  a destructured variable with a clear name keeps it
  (`replayEnabled`, not `shouldEnableReplay`).
- **Fluent setters** `return this  // for chaining`.
- **Underscore-prefixed raw params**, normalized into a same-named local:
  - `locationFor(_path?: string | SP.SpellLocation) { const location = new SP.SpellLocation(_path) }`
- **Qualified ids:**  `projectId` not `id` even where context disambiguates;  `projectName` not `name`;
  `hashedWriteKey` not `writeKeyHash`.

## 4. Imports

Examples use `parser`'s alias and namespace (`$/parser`, `P`);  each package's `AGENTS.md` names its own.

- **Package aliases, never `../`:**
  - ALWAYS import starting from a package alias, NEVER start import from `../`.  Every package's alias is `$/name`
    (`$/parser`, `$/core`, `$/ui` ...), `$` meaning `packages/`.  `ui` is no exception:  its test helpers are
    `$/ui/test/...`.  The one table is `tsconfig.base.json`.
    - INSIDE a package, `$/name` is its barrel and `$/name/deep/path` any file in its `src/`, e.g. `$/app/ui`.
    - From ANOTHER package, import the BARREL only (`$/parser`, never `$/parser/rules/Rule`), except the entry
      points named in `tsconfig.base.json`'s header:
      - `$/parser/rulex` (opt-in side-effect import)
      - `$/parser/test` and `$/spell/test` (test helpers)
      - `$/ui/test/...` (`ui`'s test helpers)
      - `$/spell/node/...` (node-only:  environment, files on disk)
      - `$/util/class`, `$/util/decorators` ... (`util`'s GENERIC files, from `ui`'s `src/util/index.ts` only:  the
        barrel also holds spell's heavy utilities)
    - Other aliases and exceptions are in the package's own "Imports".
- **Same-folder peers only:**
  - OK to import from direct peers:  `import { Rule } from "./Rule"`, but not subdirectories -- use `$/parser/...`
    instead.
  - Need to reach a parent folder?  That's a `$/name` import.
- **ONE namespace per sub-system:**
  - Prefer ONE namespace import per sub-system and qualify at use site:
    `import { P } from "$/parser"` => `P.Match`, `new P.Symbol(...)`, `P.ASTExpression`.
    - Applies INSIDE the sub-system as well.
    - Self-import uses full path too, even from same folder as the barrel:
      `import { P } from "$/parser"`, NEVER `import { P } from "."`.
      Only the barrel itself says `"."`:  `export * as P from "."`.
    - NEVER reach into another sub-system's leaf file for something its barrel exports.
    - OK to refer to file's own class unqualified.
    - Tests may mix:  `import { P, Match, Parser } from "$/parser"`.
  - Why:  one name per type everywhere (`P.AnyMatch`), and `import type { P }` erases completely from output,
    so a `.types.ts` file stays value-free.
  - NOT:  a second namespace per feature folder for its types (`import * as T from "./tours.types"`) --
    two names for one type, and breaks "ONE self-namespace" (WWOD §8).
- **Types-only leaf import as `PT`:**
  - When, and ONLY when, a file can't load its package's barrel (circular import), it imports the types module
    as a type-only namespace named `<namespace>T`:  `import type * as PT from "./parser.types"`, then `PT.AnyMatch`.
  - NEVER a bare `T`:  nobody can tell whose types it holds.
- **Circular imports:**
  - Circularity rules for files inside a barrel:
    - `P.X` as a VALUE is fine inside function / method bodies -- resolved at call time.
    - NEVER use `P.X` at module-evaluation time:  `extends` clauses, static initializers,
      top-level `new`.  Circular reentry silently yields `undefined` / broken `instanceof`.
    - Import base classes directly from the defining file, with comment:
      `// Import directly to avoid circular import`
    - Use `import type { P }` when file only needs types, e.g. `*.types.ts`, `Tokens.ts`.
- **Import order:**
  - Import order:
    - node_modules
    - (blank line)
    - `$/util` and other general utilities, general-to-specific
    - other sub-system barrels
    - own barrel
    - direct peer files, base classes first
    - (blank line)
    - side-effect imports (`import "$/parser/rulex"`)
    - css files (`./foo.css` if in same folder, else `$/name/path/to/foo.css`)
  - Frameworks (`solid-js` ...) are node_modules:  no group of their own.
- **One import statement per module:**
  - One import statement per module.  Inline type imports:  `import { P, type AnyMatch } from "$/parser"`.

## 5. Errors

- **Throw typed errors;  NEVER return error unions:**
  - NEVER return `{ ok: false, error }` unions.
  - `TypeError` for bad caller input.
  - General errors come from `$/util`:  `CustomError`, `UIError`, the `ResponseError` family.
  - A folder may declare its own small error classes when callers need to tell them apart -- in its
    `<folder>.types.ts` (WWOD §8), never one file per error class.
  - Error details ride in `cause`, typed (WWOD §5 › "Structured error causes").
- **Error classes:  body usually empty, named AFTER the class:**
  - `SourceError.prototype.name = "SourceError"`, on the line after the class.
  - NEVER `this.name =` in a constructor, NEVER `get name()` from `this.constructor.name` (minifiers mangle it).
- **Structured error causes** get an exported `<Name>Cause` type:
  - `declare cause: <Name>Cause | undefined` on the class
  - read-only convenience getters (`get status() { return this.cause?.status }`)

  ```ts
  // `SourceError` (`packages/ui/src/runtime/runtime.types.ts`), in the shape this rule asks for
  /** Thrown by `UI.sources` (and savers) when a source can't be loaded or saved;  `cause.kind` says why. */
  export class SourceError extends Error {
    declare cause: SourceErrorCause | undefined
    /** HTTP status, when a response said no */
    get status() {
      return this.cause?.status
    }
  }
  SourceError.prototype.name = "SourceError"

  throw new SourceError("Sources.load():  can't load `x` from disk;  serve the page instead", {
    cause: { kind: "file-protocol" }
  })
  ```

- **Server → client error identity:**
  - Server throws `SRV.HttpError(status, message)`;  the listener answers with that status and
    `{ error: message }` (or the error's `body`) -- SEE:  `packages/server/src/listener.ts`.
  - Client:  `$fetch()` turns the status back into a `ResponseError` subclass -- `MissingResourceError` (404),
    `AuthenticationError` (401 / 403), `OfflineError`, `AbortedRequestError` ...
  - Only a genuinely-expected error becomes a value (`instanceof MissingResourceError → undefined`).
- **Sentinel errors as control flow:**
  - A cancel (`AbortedRequestError`, a dismissed `editor.prompt()`) aborts silently:  no error shown, nothing logged.
- **Rethrow with context:**
  - catch => set `error.cause = { method, args }` => rethrow, or
  - the `makeErrorWrapper(className)` decorator, which does it for every method of a class:  still to be built, in
    `$/util` (`CODE-DEBT.md`).  Until then, the hand-written catch, with `// TODO: makeErrorWrapper()`.
  - For a method with several failure points, `getDier(this, "activity", params)` (`$/util`) returns a scoped
    `die(message, error?)` that throws with that context.
- **Caller-supplied callbacks run through `safelyCall()` / `safelyCallAll()`:**
  - `safelyCall(predicate, logger?)` for a predicate, `safelyCallAll(list, logger?)` for a
    disposer / cleanup list.
  - The two differ ON PURPOSE:  a PREDICATE that throws is an authoring bug, so it stays visible
    and falls back to `console.warn` with no logger;  a CLEANUP callback that throws is noise,
    so it's silent without one.
  - NO hand-written `label` param on either:  a REAL throw carries a stack pointing at the exact
    file and line, which beats anything you'd type, so the wrapper logs a generic message and
    the call site keeps a short inline comment instead.
  - Both still to be built, in `$/util` (`CODE-DEBT.md`).  Until then, a hand-written `try` / `catch` around
    each call, with `// TODO: safelyCall()` (or `safelyCallAll()`).
- **User-facing failures go to `editor.showError(error)`**, not thrown exceptions that crash the UI:
  - missing files, API failures the user should know about
  - SEE:  `editor.createApp()` in WWOD §2 › "App controllers use models + API and show feedback to user".
- **Guard-clause throws name the method, the problem, and the fix:**
  - `throw new TypeError("Scope.addRule():  this scope has no parser;  pass one to its constructor")`.
- **Separate success and error state:**
  - `user` + `userError`, never one `state: Result | Error | undefined` field.
  - e.g. `editor.error` (`packages/app/src/editor.ts`) is its own field, beside the state it failed to change.

## 6. Comments & docs

- **Docstrings on every declaration:**
  - Create and maintain markdown docstring comments before:
    - types and each property in a type
    - classes and class methods/fields
    - loose methods
  - Every exported thing gets one, and every option / type member -- even one-liners.
- **Explain _why_:**
  - Explain _why_, don't just restate the code.
- **Note throws, side effects and conventions:**
  - Make sure to note side effects and unexpected conventions.
  - And what it throws, when:  `- throws if ...`, or `- NEVER throws` for best-effort work.
- **Docstring format:**
  - Format:
    - informal style, one line and then `-` bullets
    - DO NOT use jsdoc `@param` etc
    - terse text, e.g. `last server version`, not `the last known server version`
    - two spaces after a period
    - backticked identifiers/types
    - format lists as bullets rather than inline commas
    - `~==` for "equivalent to" and `===` for exactly equals
  - `--` as em-dash.
  - `~==` in an example:  `location.projectUrl ~== "@org:project:main"`.
  - ALL-CAPS invariants:  `NEVER`, `MUST`, `SIDE EFFECT:`,
    `NOTE: throws if you don't authorize() BEFORE calling!`
- **Marker vocabulary** (line above the item):
  - Marker vocabulary / invariants: NOTE, TODO, SIDE EFFECT, HACK, NEVER, MUST, DOCME, RENAME, DEPRECATED
  - plus:
    - `DEBUG:` `CONSIDER:` `TESTME`
    - `HACK:` / `HACKY:` -- state the fragile assumption
    - `SEE:` -- cross-reference or URL
    - `REFACTOR:` -- a local cleanup, proposing the new shape inline (structural debt goes in `CODE-DEBT.md`)
- **OK to ship WIP markers:**
  - `// TODO: selection!`, `// DOCME`, empty group headers for planned code.
  - Terse TODOs, not fully-explained prose.
- **Phrases and bullets:**
  - Wrap comments at English phrase boundaries, not mid-clause.  Avoid single or double widow words,
    wrap `e.g.` clauses if they don't fit on the original line, etc.,
    and drop filler articles (`the`, `a`) that don't earn their place

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

- **Lower inline density;  minimal meta-commentary about the code:**
  - Inline comments are short and operational:
    `// Save files first:  the link still works if the index isn't updated`.
  - Long meta-comments narrating the code or justifying correctness are out (WWOD §7);  one sentence is fine.
- **Comments that explain a utility belong as a docstring on the function**, not floating above a call site.
- **Group headers:**
  - Always place a blank line before a group header like the below.
  - Separate function code groups like so:

  ```

  ////////////////
  // ## Group Name
  ////////////////
  ```

  - Long methods too:  `//////` lines separate their functional groups.
- **Component banner:**
  - Separate components -- React / Solid components, custom element classes -- with a header like so.
    A custom element goes by its tag, e.g. `` ### `<ui-component-name>` ``:

  ```

  /****************
   * ### `<ComponentName>`
   * Description of the component.
   ****************/
  ```

- **A module docstring states its POSITION IN THE IMPORT GRAPH**, and what it must never import:
  - `packages/app/src/runner/element.ts`:  "NEVER imports `$/core`, even indirectly".
  - `packages/app/src/solid/modals/dialogs.ts`:  "`editor` reaches these through a DYNAMIC `import()`, so
    `editor.ts` stays free of Solid and `$/ui`".
  - What a module deliberately does NOT know about, and why that's what makes it testable.
- **Record the REJECTED refactor at the site**, so nobody re-proposes it blind:
  - Same for a deliberate non-obvious shape:  "STATIC and instance-free on purpose", "Free
    rather than a method", "Deliberately does not re-plan".
- **Log / warn strings are prefixed with the emitting method:**
  - `console.warn("editor.choose(): must pass 'message' and 'options', got:", props)`
    (`packages/app/src/editor.ts`).
- **Comments don't drift:**
  - When code is touched, make sure docstrings and other comments match.
  - Write or clarify docstrings and comments where you see marker `DOCME`.
  - Add docstring comments proactively, `CLAUDE DOCME` too.
  - A rename updates prose EVERYWHERE in the same commit, including other folders --
    step comments, other modules' docstrings, every README and `AGENTS.md` mention.
  - The README's files table is part of the code:  it changes in the same commit, and a
    file that LEFT the folder keeps a row pointing at its new home (`*(none -- $/util)*`).
- **`// oxfmt-ignore`** only for aligned ternary ladders with per-branch comments
  and hand-packed const tables.  Trailing `//` to force a line break.
- **The final `else` of an exhaustive ladder documents its condition:**
  - `else /* if (placement === "after") */`.
- **`oxlint-disable` carries a `-- reason`:**
  - `` // oxlint-disable-next-line import/default -- `?worker` is Vite's, typed by `vite/client`, which oxlint
    can't see `` (`packages/app/src/ui/monaco/monaco.ts`).
- **A `README.md` per package**, REQUIRED;  one per folder only where a folder needs it.  Structure:
  - H1 `` `$/name` -- tagline ``
  - a grammar fenced block, for a folder that parses something (URLs, paths ...)
  - "The DRY rule (one of each)", with "If you find yourself writing a second copy of any
    of these, stop and reuse."
  - files table (unaligned `| --- |`), env-var table
  - numbered "Adding a new X" recipe, "Deferred" section
  - in-flight design notes go in a plan doc (`packages/docs/epics/`), not beside the README
- **User-facing strings stay inline**, where they're used;  only `ui` localizes (its `*.vocabulary.en.ts` files).
  - NOT:  a `MSG.ts` object of every user-facing string per package -- one more file to keep in step, for no
    localization.

## 7. Anti-patterns (Claude habits to drop)

- A file per helper function:  a helper FAMILY shares one capability-named file (WWOD §8).
- Terse abbreviations (`ctor`, ...).
- An error class per file, or per call site:  small error classes live in `<folder>.types.ts` (WWOD §5).
- `{ ok: false, error: "..." }` discriminated result unions + error-mapper functions.
- Local copies of generic helpers in route / feature files -- move to the package's util folder, or `$/util` once
  2+ packages use it (WWOD §2 › "Hoist anything generic out of the feature").
- Long named-import lists from leaf modules (WWOD §4).
- Long meta-comments narrating the code or justifying correctness;  one sentence is fine.
- Positional param threading (`update(project, record, existing, svg, slug, baseVersion)`).
- One route module per HTTP verb;  helpers and retry loops defined inside route handlers (WWOD §10).
- Inline modal config with logic inside app classes:  a dialog with logic is a Solid component (`<Chooser>`),
  a text-only one a `UI.modals` call (SEE:  `packages/app/src/solid/modals/dialogs.ts`).
- Immutable-record state machines:  a `type X = {...}` plus `nextX(x)` / `endX(x)` free functions
  returning `{ ...x, changed }` spreads.  That's a mutable class -- see WWOD §12-13.
- Free functions whose first argument is always the same object, or that thread the same
  `context` through every call -- both are a class with fields.
- A distinct input type per method (`getElements(spec)` vs `measureAll(elements)`) instead of
  one input type for the whole class.
- Keeping a field, option or export nothing reads.
