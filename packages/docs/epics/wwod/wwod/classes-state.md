# WWOD spoke -- Classes & state

Classes, decorators, spell-cell state, `Loadable`, value objects and records.  Read with
`packages/agents/wwod/WWOD.md` (the hub).
From:  original WWOD §12-16, root `AGENTS.md` "Decorators", `packages/ui/AGENTS.md` "UI rules" (classes rule,
widened).

Solid mechanics of spell cells (bridge, flush, `tracked()`):  `packages/docs/solid/solid-2.md` "Spell's decisions".
This spoke is house style on top.

## 12. Classes

- **A class for anything with IDENTITY, a LIFECYCLE, or that COORDINATES:**
  - "The operations look functional" is no reason to skip the class.  A state machine over a record IS a class:
    its transitions are methods, not free functions that each take the record and return `{ ...record, changed }`.
  - Runtime services are classes (`Keyboard`, `Overlays`, `Styles`), builders are classes (`ClassBuilder`), stateless
    singletons too -- WWOD §8.
  - Free functions only for pure helpers no one class owns, e.g. `extend.ts`'s `getProp()` / `setProp()`, shared by
    `Observable` and compiled spell.  A helper ONE class uses is a private method or `private static` on it.
  - SEE:  `packages/ui/AGENTS.md` "UI rules" (in `ui`, a helper that earns a name becomes a private method or a
    small class).
- **Transitions MUTATE and return `void`;  derived reads are getters:**
  - A transition writes props through their setters (`@prop accessor`, or `setProp()`), e.g. `EditorStore`'s
    `showNotice()` / `hideNotice()` set `editor.notice`;  a read is a getter (`get appType()`), reactive because it
    reads a prop (`packages/app/src/editor.ts`).
  - Immutable-record-plus-spread is the wrong shape here:  it forces every caller to re-assign the result, and a
    caller that forgets silently keeps a stale object.
  - What a prop HOLDS is not made reactive:  replace a held list / plain object, don't change it in place.
    SEE:  `packages/docs/solid/solid-2.md` "Spell's decisions" › "Spell cells".
- **Converting immutable → mutable requires an await-audit:**
  - With an immutable record a lost race harmlessly dropped a stale copy;  once the record IS `this`, a lost race
    CORRUPTS the live object.
  - Walk every `await` that captured it, confirm a fence (epoch counter, generation check, in-flight identity) sits
    between the await and the write, and comment it at the call site.  `Loadable.load()`
    (`packages/util/src/spell/Loadable.ts`):

    ```ts
    const onSuccess = async (contents: ContentType) => {
      // Only update if the same `loader` is active
      if (this.loadState.loader === loader) {
    ```

- **Say what the class does NOT know about, and why that matters:**
  - In its docstring, e.g. `FormFields` (`packages/ui/src/components/ui-form/FormFields.ts`):  "plain DOM, no Solid,
    so it reads light-DOM natives and `ui-*` hosts alike";  `EmojiData`:  "no rendering, so the native fallback uses
    it too".
- **Constructor takes ONE props object, normalized inside, with defaulted deps:**
  - Typed `XProps`, declared below the class (WWOD §9), e.g. `Observable`'s `constructor(props)`,
    `new Logger({ prefix, level })` -- each key falls back to its field default.
  - A shorthand is fine when one key is the common case:  `new LoadableFile("url")` ~== `{ url }`.
- **A collaborator constant for the object's life is a `readonly` field set once, NOT a parameter on every method:**
  - `FormFields` takes its `host` once (`private readonly host`) instead of threading it through every lookup;
    `CalendarDates` keeps the page's `Temporal` as `readonly T`.
  - Document it:  "STATIC for the object's life ... a test that needs a different one builds a different object."
- **The injected escape hatch is what makes it testable:**
  - Name the one seam a test or another environment swaps, e.g. `LoadableFile.fetch`:  "Replace it to answer
    in-process, e.g. from disk under node".
- **TS `private`, never `#private`:**
  - `private` / `protected` for fields and methods alike (WWOD §2).
  - Why:  `#private` throws when reached through a `Proxy` wrapping the instance, and tests can't reach it.
  - NOT:  `#` for private fields, TS `private` for methods -- see above.
- **`static` class constants, declared next to the section that uses them:**
  - e.g. `CalendarDates.MINUTE_STEP = 5`, `CodeLines`' `private static readonly TOKENS` above the code reading them,
    not all gathered at the top.
  - Behaviour switches are the exception and stay at the top ("ALL-CAPS switches" below).
- **Every `static` member's docstring says WHY it's static:**
  - e.g. class-wide by nature ("How EVERY `LoadableFile` reaches its `url`"), or page-wide state ("so each chunk is
    requested once at a time", `EmojiData.loads`).
  - A static that CAN'T become an instance method records that too (called before any instance exists ...), so the
    refactor isn't re-proposed:  WWOD §6 › "Record the rejected refactor".
- **Class banner:**  big classes and every component get the `/**** ### \`<Name>\`` banner -- WWOD §6.
- **`////////////////` sections INSIDE a long class, ordered outside-in:**
  - What it owns, then its state, then what callers do to it, then the private machinery, pure statics LAST.
  - e.g. `Loadable`:  load state → loading → saving → `## Internal`.
  - Static members are class-wide regardless of position, so reordering is free -- confirm with a clean `yarn ts`
    before touching anything else, then move them.
- **Brand checks only where `instanceof` can't work:**
  - `instanceof` fails across bundles (each `<spell-app>`'s `spell-runtime.js` is its own copy) and across HMR
    reloads.  There, and only there:  `static __isX__ = true` + an exported `isX()` guard above the class, with
    `// NOTE: use this rather than instanceof -- <which bundles / HMR>.`
  - Or duck-type the shape, as cells do:  "a source is `{ subs, version, refresh? }`, never checked with
    `instanceof`" (`packages/util/src/spell/cells.ts`).
- **Backing field declared immediately AFTER its getter:**  `get record() { ... }` then `private _record`.
- **Reach the owner's collaborators through one-line delegating getters, not stored copies:**
  - `get ui() { return this.owner.ui }`:  a copied field goes stale when the owner swaps its collaborator.
- **ALL-CAPS switches at the top of the class:**
  - Behaviour switches, one-line comment each, e.g. `Match.DEBUG_MATCH_INITIALIZATION`:  "Set `false` to skip
    constructor `assertType` / `assertArrayType` checks".
  - Tuning tables as `as const` objects, e.g. `ThemeSheets.SLOTS = { base: "classic", theme: "theme" } as const`.
- **Debounced write-backs are `xSoon` members:**
  - e.g. `compileAppSoon()`:  the name says it's deferred and coalesced.
  - Through `debounce()` from `$/util`;  until it's built, a hand-written timer with `// TODO: debounce()`, e.g.
    `EditorStore.compileAppSoon()` + `compileAppSoonTimer`.
- **Derived reads are plain getters;  `@derived` only when worth it:**
  - `@derived get y()` / `this.derive(name, fn)` (`Observable`) ONLY for a pure getter doing real work (loops, list
    aggregates):  memoizing a cheap getter is ~2x SLOWER.
  - SEE:  `packages/docs/solid/solid-2.md` "Spell's decisions" (derived properties, equality cutoff).
  - NOT:  `@memoize` every non-trivial getter that can run several times per render -- the ~2x cost above, and cells
    already re-run only readers whose value REALLY changed.
- **A lazily made collaborator keeps its identity:  `this.derived(name, getter)`:**
  - `Derivative.derived()`:  made on first read, the SAME object after (not reactive), `clearDerived(name)` resets;
    e.g. `SpellFile.project`.  NOTE:  `derived()` (compute once) is not `derive()` (reactive memo).
  - A lazy value that is STATE (must be reactive, survive re-derivation) is `getState(name, init)` instead -- §13.
- **Literal getters say `as const`:**  a getter returning a fixed literal (a type name, an icon) narrows its type, so
  subclasses' literals stay distinct.
- **Pref keys are `static SCREAMING_CASE`, with a paired getter / setter:**
  - Over `getPref()` / `setPref()` (`$/util` `prefs.ts`;  `setPrefKey()` once per app, e.g. `editor.ts`'s
    `setPrefKey("spellEditor:")`).
  - In `ui` (no `$/util` prefs):  one key table and static read / write pairs, every access wrapped, e.g.
    `NavPreferences` (`packages/ui/src/docs-components/ui-docs-nav/NavPreferences.ts`).
- **Subclass for behaviour, spread for plain config:**
  - Behaviour that varies is a subclass overriding methods, its class-level defaults `@proto static`, e.g.
    `Keyword`'s `@proto static highlightAs = "keyword"`;  `TextFile` / `JSONFile` extend `LoadableFile`.
  - A plain config / spec record (data, no methods) spreads over its defaults:
    `{ ...defaults, ...user, ...overrides }` (`packages/ui/src/elements/Shorthand.ts`).
  - NOT:  config-by-spread over subclassing for pluggable BEHAVIOUR (`{ ...BaseSpec, parse, stringify }`) -- a
    function in a spread record has no `super`, no `instanceof`, no docstring home.
- **Interning:  a `private static readonly` map, plus a `static reset()` for tests:**
  - e.g. `EmojiData`'s `private static readonly sets` + `reset()` ("For tests and hot reload");  `RootLoader.loads`
    ("Folder => its import, started once").

### Decorators

- **Standard decorators only:**
  - Use STANDARD (TC39 2023-11) decorators, NEVER `experimentalDecorators`.  General-purpose ones live in
    `packages/util/src/decorators.ts` (`@proto`:  import from `$/util`;  `ui` has `$/ui/util`, which re-exports the
    generic ones).
  - Spell's own (`@prop`, `@derived`, `@thing`) live in `packages/util/src/spell/spellDecorators.ts`, for
    HAND-WRITTEN `Observable`s only.  SEE:  `packages/docs/solid/solid-2.md` "Spell's decisions" › "Decorators for
    HAND-WRITTEN classes".
  - NOT:  legacy 3-arg decorators that mutate the property descriptor -- `experimentalDecorators` is banned above.
- **Lowered by esbuild:**
  - Lowered by esbuild via the repo root's `vite.decorators.ts` -- vite 8's own transformer (oxc) doesn't do it yet.
    Which configs use it:  the package's own "Decorators".
- **A decorator starts its line:**
  - A decorator MUST be the first thing on its line (`@proto static inlineInitialType = false` is fine,
    and preferred) or that plugin won't notice the file.
- **A misapplied decorator throws a self-naming `TypeError`:**
  - Name the decorator, the member and the fix (WWOD §5), e.g. `packages/util/src/decorators.ts`:

    ```ts
    if (!context.static) {
      throw new TypeError(`@proto ${String(context.name)}: only works on 'static' fields.`)
    }
    ```

  - Misuse that still works warns instead, e.g. `@prop` with an initializer:  "has an initializer, which runs after
    create() -- use @prop({ default })".

## 13. State

- **The instance IS the store:**
  - A class with reactive state extends `Observable` (`packages/util/src/spell/Observable.ts`):  its props and state
    are spell cells.  No separate store object:  Solid 2 has no mutable store.
  - Readers (Solid computations through the host's bridge, React through `view()`, `observe()`) re-run when a value
    they read REALLY changes.  Reads are synchronous:  a read right after a write sees it.
  - e.g. `EditorStore` (`packages/app/src/editor.ts`):  `editor.x = y` anywhere, and Solid code reading `editor.x`
    re-runs.
  - SEE:  `packages/docs/solid/solid-2.md` "Spell's decisions" › "Spell cells".
- **Props are public, state is transient:**
  - Props:  listed by `keys()` and `toJSON()`, persisted.  Declared `@prop(info) accessor x!: T` in hand-written
    classes, `getProp()` / `setProp()` accessor pairs in compiled spell -- the same runtime shape.
  - State:  internal, never persisted, e.g. a `Task`'s `status`:  a getter over `getState("status")`, written with
    `setState()`, cleared with `resetState()`.
  - A plain field (`foo = 1`) is NOT spell state:  not reactive, not one of `keys()`.  Use one only for what no reader
    needs, and say so (`EditorStore`:  "a plain field (`compileAppSoonTimer` ...) is NOT reactive").
- **State initializes LAZILY, in its getter, never in the constructor:**
  - Subclass fields aren't set up yet while a base constructor runs.  Read through `getState(name, init)` /
    `getProp(name, init)`, whose initializer runs on first read:

    ```ts
    protected get loadState(): LoadState<ContentType, SaveResult> {
      return this.getState("loadState", () => ({ isLoaded: false }))
    }
    ```

  - A prop's default is in its declaration, NEVER an initializer:  `@prop({ default: 1 })`, or
    `{ init: () => [] }` for an object made once per instance.  SEE:  `spellDecorators.ts` `@prop`.
- **Template hooks with empty bodies:**
  - The base class defines the hook empty, subclasses override, e.g. `Observable.onRemove()`,
    `Loadable.onContentsUpdated()`.  Add hooks as a class needs them, not up front.
  - The docstring says when it's called, what's already done by then, and whether `super` goes first or last.
  - Defaults come from the schema (`@prop({ default })`);  a persisted preference is the initializer:
    `getProp(name, () => getPref(KEY, fallback))`.
  - A hook that persists opens with a lifecycle guard (`if (this.wasRemoved) return`), and persists `toJSON()`
    (props) only:  state is transient.
  - Normalize or validate a change in the prop's setter, before `setProp()` (a hand-written getter / setter pair).
    Type warnings:  override `checkPropType()`, as `Thing` / `List` do.
- **Change nested state by dotted path:**
  - `setState("loadState.isLoaded", true)` writes inside the `loadState` object and tells its readers;  `undefined`
    deletes the key.  e.g. `Loadable.updateLoadState()`, one `setState()` per key.

## 14. `Loadable`

`Loadable` (`packages/util/src/spell/Loadable.ts`) is the base for anything loaded and maybe saved:  `LoadableFile`,
`TextFile`, `JSONFile` ...

- **Required subclass surface is `abstract`;  an optional capability is a concrete method that throws:**
  - Required:  `abstract getLoader(loadParams)`.
  - Optional (saving):  the base's `getSaver()` throws "can't save";  callers ask a getter that compares prototypes:

    ```ts
    get canBeSaved() {
      return this.getSaver !== Loadable.prototype.getSaver
    }
    ```

- **Verb triple per operation:  public orchestrator → protected doer → hook:**
  - `load()` / `save()` orchestrate (cache, in-flight reuse, fences):  "NOTE: don't override this, override
    `getLoader()` instead!"
  - `getLoader()` / `getSaver()` do the work:  "Don't call this directly, it'll be called from `load()`."
  - `onContentsUpdated()` reacts;  its docstring says whether to call `super` first or last.
- **All mutable load state in ONE state object:**
  - `loadState` (`LoadState`), made lazily by `getState()` -- §13.
  - Written only through `updateLoadState(props)`:  a `===` write is a no-op, a change tells the readers.
  - Exposed as public getters (`isLoaded`, `isLoading`, `isSaving`);  a setter only where callers may write
    (`isDirty`).
- **Per-instance debug is a `Logger` field:**
  - `logger = new Logger({ prefix: "Foo", level: Logger.WARN })` (`$/util`), e.g. `Tokenizer`'s.
  - `logger.debug()` is gated by `level`;  `logger.warn()` / `logger.error()` always show;  `logger.group()` dumps
    state in a console group.  Turn one instance up with `obj.logger.level = Logger.DEBUG`.
  - SEE:  WWOD §19.

## 15. Value objects

- **Immutable and interned, so `===` is equality:**
  - `readonly` fields set in the constructor, or `Object.freeze(this)` -- e.g. `SpellLocation`'s `readonly path`,
    `projectId` ...;  `Rule.freeze()` ("Rules are shared by every parse, so per-parse state MUST go in `match.data`").
  - Interned in a `private static readonly` registry:  the same input always gives the same object, e.g.
    `SpellLocation.registry`.
  - Constructor `protected`, reached through the static factories below.  Assign the debug-friendly field (`path`)
    FIRST, so a half-built object still prints, then the rest, then freeze.
- **Static factory pair:  `xOrDie(input)` throws, `optional(input)` returns `undefined`:**
  - The throwing one raises a house error naming the input and the problem (WWOD §5), e.g.
    `new SpellLocation('<path>'):: Invalid path`.
  - Subclasses redeclare them verbatim, to narrow the return type.
- **Subclasses add no fields:**  they `declare`-retype inherited ones and ship a sibling `isX()` guard.
- **Validators:  `static X_PATTERN` + throwing `validXOrDie()` + non-throwing twin:**
  - The twin answers without throwing (`isValidX()`) or repairs (`normalizeX()`), e.g. `SpellLocation.isValidPath()`
    / `isValidPathSegment()`.
  - The pattern is a `static`, not a local `const` in the validator, so callers and tests share it.
- **Declarative filter DSL:**  a `private static FILTERS` map of `(filter, value) => true | message`, driven by
  `matchesFilter()` / `matchesFilterOrDie()`.
- **Conversion pair:  `toString()` / `toJSON()`:**
  - `toString()` for debugging (`SpellLocation: @user:projects:myProject`);  `toJSON()` for the wire.

## 16. Records

- **Unset with `undefined`, not a sentinel:**
  - `setProp(name, undefined)` / `setState(path, undefined)` delete the key:  it leaves `keys()` and `toJSON()`.
    `deleteProp(name)` says the same.
  - `delete this.prop` is NOT trapped -- never use it on an `Observable`.
  - A `===` write changes nothing and tells nobody, so no `if (somethingChanged)` bookkeeping.
- **`toJSON()` is props only, in `keys()` order:**
  - `Observable.toJSON()` gives exactly that, never state.
  - An override deep-clones, serializes children through their own `toJSON()`, and prunes empty keys.
- **Bracket access for known-untyped JSON keys only:**  `record["gate_type"]` marks a key that no type declares;
  typed keys use `.`.
- **Compact domain encodings:**  module-private single-char consts + a `typeof` union + a name map, not an `enum`.
