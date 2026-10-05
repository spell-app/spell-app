# WWOD spoke — Classes & state

House rules for classes, `Stateful`, `CachedResource`, and value objects.
Read with `.agents/WWOD.md` (the hub).

## 12. Classes & state

- **A class for anything with IDENTITY AND A LIFECYCLE; free functions for stateless flows
  and pure helpers:**
  - "The operations look functional" is not a reason to skip the class. A state machine over
    a record IS a class: `TourRun` replaced `startRun`/`nextRun`/`gotoRun`/`backRun`/`endRun`
    free functions that each took the run and returned `{ ...run, changed }`.
  - **Transitions MUTATE and return `void`** (`next()`, `back()`, `goto(id)`, `end(status)`);
    derived reads are getters (`get currentStep`, `get canBack`, `get progress`).
  - Immutable-record-plus-spread is the wrong shape here: it forces every caller to re-assign
    the result, and a caller that forgets silently keeps a stale object.
  - **Converting immutable → mutable requires an await-audit.** With an immutable record a
    lost race harmlessly dropped a stale copy; once `run IS this.#run`, a lost race CORRUPTS
    the live object. Walk every `await` that captured it, confirm the fence (epoch counter,
    generation check) sits between the await and the mutation, and comment it at the call site
    -- see `ToursApp.#doAdvance()`.
  - Say what the class does NOT know about in its docstring, and why that separability matters
    (`TourRun`: no DOM, no Svelte, so it's testable with no `ToursApp` in the picture).
- **Constructor DI with defaulted deps:**
  - ONE options object, normalized inside: `new TourRun({ tour, step, context })`,
    `new ElementRoot({ webComponentId, errorPrefix, resolve })`.
  - **A collaborator that's constant for the object's life is a `readonly` field set once, NOT
    a parameter on every method.** `next()`/`goto()` dropped their `ctx` param and read
    `this.context`; `ElementRoot` takes the root once instead of threading `webComponentId`
    through every lookup. Document it: "STATIC for the whole run … a test that needs a
    different context builds a different run."
  - The injected escape hatch is what makes the thing testable -- `ElementResolver` is the one
    reason a DOM-driven feature runs in a plain vitest file with no `document`.
- **`#` for private fields, TS `private` for methods.**
- **`static` class constants (`static MAX_ID_ATTEMPTS = 100`), declared next to the section
  that uses them** rather than all at the top of the class -- `ToursApp`'s three timeouts sit
  above "Starting and stopping", where they're read. Behaviour switches are the exception and
  stay at the top (see "ALL-CAPS instance fields" below).
- **Every `static` member's docstring says WHY it's static:**
  - "authored at module scope, long before any `AppContext` exists" (`ToursApp.registry`);
    "holds no `AppContext`, so app code fires with a bare call -- no `?.` discipline"
    (`ToursApp.fireSignal`).
  - A static that CAN'T become an instance method records that too, so the refactor isn't
    re-proposed: `planSteps()` is called before any instance exists, and `resolveNextId()` is
    its walking primitive (§6 "Record the rejected refactor").
- **Class doc banner** above big classes: rule line, `## ClassName (BaseClass)`, rule line.
- **`//////` banner sections INSIDE a long class.** Order them so a reader meets the class
  outside-in: what it owns, then its state, then what callers do to it, then the private
  machinery, with pure statics LAST.
  - `ToursApp`: registry → signal bus → persistence → change notification → run state →
    starting and stopping → transitions → arming and disarming → misc.
  - `TourRun`: transitions → reading the run → step action tables → planning.
  - Static members are class-wide regardless of position, so reordering is free -- confirm with
    a clean `tsc` before touching anything else, then move them.
- **HMR-safe type checks**: `static __isX__ = true` + exported `isX()` guard above the class,
  with `// NOTE: use this rather than instanceof to avoid HMR bugs.`
- **Backing field declared immediately AFTER its getter**: `get record() { … }` then `#record`.
- **Context access is a wall of one-line delegating getters**
  (`get ui() { return this.context.ui }`), not stored fields.
- **ALL-CAPS instance fields as behavior switches** at the top of the class.
  - One-line comment each (`DEBUG_TIMING`, `WRAP_NAVIGATION`).
  - Tuning tables as `as const` objects (`CIRCUIT_SCALE = { min, max, buttonStep, wheelStep }`).
- **Debounced write-backs are `xSoon` class fields**: `notifySoon = debounce(0, …)`,
  `updateLayoutSoon`.
- **Two lazy-derived idioms:**
  - `@memoize get x()` normally.
  - `#field` + null-check when the value must survive `clearMemoized()`.
  - Any non-trivial getter that can run multiple times per render cycle gets `@memoize` —
    unmemoized expensive getters are a performance footgun.
- **`clearMemoized(thing)` BEFORE mutating**, with the why in a comment.
- **Literal getters with `as const`** for icons/typeName: `get icon() { return "Folder" as const }`.
- **Static prefs keys are `static SCREAMING_CASE`** + a paired get/set (`CDApp.CLIPBOARD_PREF`).
- **Config-by-spread over subclassing** for pluggable behavior:
  `{ ...BaseFileSpec, extensions, payloadFormat }` (`FileSpec.ts`).
- **Interning helpers**: `#CACHE` map + `getOrSet(key, getter)` + `reset()` for tests
  (`Registry.ts`, `ResourceCache`).
- **Decorators** (legacy 3-arg form):
  - mutate the descriptor in place
  - throw a self-naming `TypeError` when misapplied
    (`@memoize ${key}: you must call on a getter.`).

## 13. Stateful contract (`util/Stateful.ts`)

- **The instance IS the store**: `store = writable(this)`, `subscribe = this.store.subscribe`,
  all notification through `notifySoon`.
- **State initializes lazily in the `state` getter**, never in the constructor
  (subclass fields aren't set up yet).
- **Protected template hooks with empty bodies**:
  `initializeState` / `rememberState` / `forgetState` / `onStateChanged`.
  - `initializeState()` merges DEFAULTS + persisted prefs.
  - `rememberState()` opens with a lifecycle guard (`if (this.wasClosed) return`) and
    destructures OUT transient keys before persisting.
  - Override `updateState()` to normalize/validate changes before `super.updateState()`.
  - Override `onStateChanged()` to scope invalidation — full relayout only for named props,
    else `clearMemoized(this)` — always ending in `super.onStateChanged(options)`.
- **`notify` is opt-out**, tested `options.notify !== false`.
- **Mutations are dotted-path `UpdateMap`s** applied via `prop.update`.

## 14. CachedResource lifecycle (`files/cache/`)

- **Required subclass surface = `abstract`; optional capability = concrete method that throws**,
  detected by prototype identity:
  `get canBeSaved() { return this.saveResource !== CachedResource.prototype.saveResource }`.
- **Verb triple per operation**: public orchestrator (`load()`) → `protected loadResource()`
  doer → `onLoaded`/`onLoadError` hooks.
  - Docstrings warn "don't call directly" and "call `super.onLoaded()` LAST".
- **All mutable state in one `#cacheState`:**
  - Writes through `setCacheProperty()`: identity short-circuit → persist → notify.
  - Exposed as public getter + `private set` pairs.
- **User-facing strings in a `static MESSAGE_DICTIONARY`** of `(thing, config) => string`
  keyed `${action}_${stage}`; overridable via `getMessageCallback()`.
- **Per-instance debug**: `DEBUG_CACHE = false` + gated `debugCache()` / always-on
  `warnCache()` + an `echo()` console.group dumper.
- **Optimistic list updates**: `addURLToCache`/`removeURLFromCache` + short `cacheDuration`
  to ride out backend sync delay, with the comment saying so.
- **Non-URL resources** get `static KEY_PREFIX` + inverse `urlForX()`/`xForURL()` static pair.

## 15. Value objects (`files/models/AppURL.ts`)

- **Frozen, interned, self-memoizing:**
  - Protected constructor: assign the debug-friendly field first, `Object.assign(this, bits)`,
    `defineMemoCache(this)`, `Object.freeze(this)`.
  - Interning makes `===` the equality operator.
- **Static factory triad**: `orDie(input)` (throws) / `optional(input)` (undefined) /
  `assembleURL(bits)`.
  - Subclasses redeclare them verbatim to narrow the return type.
- **Subclasses add no fields** — they `declare`-retype inherited ones
  (`declare protocol: "repo"`) and ship a sibling `isRepoURL()` guard.
- **Validators**: `static X_PATTERN` regex + `validXOrDie()` + non-throwing `normalizeX()` twin.
- **Declarative filter DSL**: `static #FILTERS` map of `(filter, url) => true | message`,
  driven by `matchesFilter` / `matchesFilterOrDie`.
- **Conversion trio** `toString()` / `toJSON()` / `toQuery()`; `toQuery()` is the duck-typed
  hook `Serializer.stringifyQuery()` looks for.
- **Singleton services with no per-instance state -- two cases:**
  - **No app class owns the domain** → an object literal with an extension registry, not a
    class (`Serializer.addClass({ prefix: "Date", stringify, parse })`).
  - **An app class already owns it** → `static` members on that class, with a docstring saying
    why static (§12). `ToursApp` absorbed a registry module, a signal-bus module and a
    one-line menu module this way; none of them had per-instance state, and every `ToursApp`
    on a page sees the same set.
