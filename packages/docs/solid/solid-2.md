# Solid 2 -- rules for agents

Distilled from `solid-2.html` (the why) and `cheatsheet.html` (the API) in this folder.  Read this BEFORE writing
or reviewing Solid code, JSX, `spellCore` rendering, `~/util` reactivity, or anything touching `@spell-app/ui`.

## Status

- We are moving from React 18 + semantic-ui-react + easy-state to Solid 2 on `@spell-app/ui` web components.
  - Plan:  `packages/docs/epics/solid-migration/`.  React and Solid JSX COEXIST in `app`:  Solid is the default;  a
    React `.tsx` starts with `/** @jsxImportSource react */`, which `tsc` and `app`'s `vite.shared.ts` both read.
    Moving a file to Solid = dropping that line.  `core` keeps rendering compiled spell with React (for now).
  - Items marked (planned) below are decided but may not exist in code yet -- check before relying on them.
- Target `solid-js` / `@solidjs/web` / `@solidjs/h` `2.0.0-rc.13` (current, 2026-09-30), pinned EXACTLY.
  - Every package is on rc.13 (2026-10-02):  ONE copy at the repo root, pinned in the root `resolutions`;  upgrade
    them all together (one Solid per page).
  - Re-verified on rc.13:  every experiment behaves as on rc.11 (`solid-2.html`, "rc.11 vs rc.13").  rc.13's
    `CHEATSHEET.md` is identical to rc.11's -- trust it first;  v2.solidjs.com tracks rc.13.
  - rc.13 moved `createErrorBoundary`, `createLoadingBoundary`, `createRevealOrder`, `sharedConfig` and `$DEVCOMP`
    out of `solid-js` into `solid-js/internal`.  NEVER import from `solid-js/internal`:  use `<Errored>` /
    `<Loading>` / `<Reveal>` (callable as functions, `children` as a getter -- see `solid-element`'s `errors.ts`).
  - RC bumps:  run `solid/experiments/*` on old and new (`SOLID_NODE_MODULES=<dir>` picks the Solid) and diff.
- NEVER model Solid 2 on React OR on Solid 1:  both priors produce wrong code here.

## The model in six bullets

- Components run ONCE.  No re-render, no diff.  Each dynamic JSX expression is its own tracking scope.
- Props are lazy getters:  pass VALUES, read `props.x` where used, NEVER destructure props.
- Writes are STAGED:  a read right after a write returns the OLD value until the microtask or `flush()`.  No `batch()`.
- Async is a value:  a memo may return a Promise;  `<Loading>` covers the first load only.
- A write feeding pending async is HELD, with every other write in the same batch.  That replaces transitions.
  - `isPending(fn)` = "is a change on the way?"  `latest(fn)` = "what is it?"
- An uncaught error in any computation HALTS the scheduler for the whole page (`REACTIVITY_HALTED`).

```tsx
;<Counter value={count()} /> // pass the value, not the accessor

function Counter(props: { value: number }) {
  return <div>{props.value}</div> // read where used;  `({ value })` would freeze it
}

setCount(1)
count() // still the old value
flush()
count() // 1
```

## Spell's decisions

- Spell state is NOT Solid signals:  spell needs read-after-write, Solid 2 can't give it (measured, `solid-2.html` §2).
- **Spell cells** (planned, Phase 1, `~/util`) -- prototypes:  `solid/experiments/` (`spell-cells.core.ts`,
  `spell-cells.ts`, `decorators.ts`):
  - each instance keeps its values in a `Map` record, the ONLY truth, read and written synchronously
  - a small synchronous core tracks deps and memoizes derived values
  - one `enableExternalSource` bridge makes Solid computations re-run when cells change
  - compiled output keeps its `getProp` / `setProp` accessor pairs;  derived getters may call `derive()`
- **Updates only on differences**, at three levels:
  - `setProp` ignores `===` writes:  nobody is notified
  - a memoized derived value bumps its version only when its value really changes (clean / check / dirty push-pull),
    so readers of an unchanged derived value don't re-run
  - Solid's DOM bindings skip equal text / attribute writes (input `value` / `checked` are always re-applied)
- Derived properties:  plain getter by default;  `this.derive(name, fn)` ONLY when the parser proves it pure AND
  worth it (loops, list aggregates).  Memoizing a cheap getter is ~2x SLOWER.
- **Keys in creation order:**  `keys()` lists own props in first-set order.
  - an overwrite keeps the position;  a delete (or setting `undefined`) removes the key;  re-setting appends it
  - the record MUST be a `Map`:  a plain object hoists integer-like keys (`"2"`, `"10"`) to the front
  - `keys()` tracks a per-instance `keys` cell, changed only when the key SET changes
- **Property types** live in a per-class schema:
  - declared by the parser (explicit specifier, or the default literal's type) -- declared types win
  - undeclared props:  observed per class, WIDENED on mismatch (`number | text`) with a dev warning, never thrown
  - `nothing` never counts;  Thing-typed props compare with `instanceof`, not by class name
- **Accessors for Things, a `Proxy` only for class-less data** (nested plain objects, JSON a program holds):
  - a Proxy that takes EVERY prop and wraps FIRST (P2) fixes the hazards:  `create()` and registration see the proxy,
    field initializers become defaults, `#private` is simply banned in Thing subclasses
  - what's left is cost, on every access:  ~2.5x reads and method calls, ~3.5x derived reads, ~6x construction
  - its wins (`Object.keys` / JSON see the record, plain `thing.foo = x` for ad-hoc props) are cheap with accessors:
    `keys()`, `toJSON()`, a DevTools formatter, `setProp`
  - revisit only if arbitrary ad-hoc props on Things become first-class spell syntax
- **Decorators for HAND-WRITTEN classes** (spellCore `Thing` / `List` / `App`, `SP.*`, the editor) -- compiled spell
  can't use them (`blob:` URL, no transpile), so both spellings MUST build the same runtime shape:
  - `@prop({ type, default }) accessor x!: T` -- schema from decorator ARGS via `Symbol.metadata` (polyfilled in
    `~/util`);  NEVER an initializer (it runs after `create()`);  object defaults as `{ init: () => [] }`
  - `@derived get y()` -- memoized with the equality cutoff;  only for pure, worth-it getters
  - `@thing` on the class -- runs `create()` after the most-derived class's field initializers.  BUILT:
    `packages/util/src/spell/spellDecorators.ts` (`import { thing } from "$/util"`);  `Thing` / `List` skip their own
    `create()` call when a `@thing` class is in the chain (`runsCreate()`), so it runs exactly once, also for compiled
    classes extending a `@thing` class.  Pinned:  `packages/core/src/classes/construction.test.ts`
  - plain fields are NOT spell state:  not reactive, not keys, and clobbered by a base-constructor `create()` without
    `@thing`
  - decorated classes read / call / write as fast as hand-lowered accessors;  construction is ~6x slower (fine for
    few-instance classes;  don't decorate fields on a base every spell Thing inherits)
  - a decorator MUST start its line, or `vite.decorators.ts` never sees the file
- The editor store becomes a decorated class:  `editor.x = y` call sites don't change.  Solid 2 has NO mutable store.
- `spellCore.flush()` (planned) = run pending derived checks, then Solid's `flush()`.  Tests and imperative code call
  it, NEVER Solid's `flush()` directly.
- Compiled spell imports ONLY `@spell/core`, never Solid.  `spellCore.element()` is the adapter (planned, Phase 2):
  - builds on `@solidjs/h`
  - the parser emits THUNKS for every non-literal prop / child
  - routes non-primitive values on `ui-*` tags to `prop:`
  - maps spell's custom-event spelling to the exact `ui-*` event name
  - wraps each thunk in `try/catch`, so a buggy program can't halt the page
- One Solid per page, shared with `@spell-app/ui` (whose `UI` runtime is already one per page, on `globalThis`):
  - within a bundle:  Solid + `@spell-app/ui` live in the shared chunk, NEVER `spell-runtime.js`.  Each `<spell-app>`
    keeps its OWN `spellCore`, all share ONE Solid.  Register `enableExternalSource` once, shared.
  - across our bundles:  element / runner / editor builds import ONE `spell-solid.js` (and `ui` from `spell-ui.js`),
    not a Solid each -- `app`'s `vite.solid.config.ts` + `sharedSolid()`, pinned by `element.build.test.ts`
  - on host pages with their own Solid / `@spell-app/ui`:  an import-map variant of `<spell-app>` (bare specifiers)
  - two copies on one page FAIL SILENTLY:  the fork's `register()` swaps `existing.Component` across copies
- NEVER put Things (class instances) in a Solid store:  stores wrap them in proxies, `===` breaks.

```ts
// hand-written:  decorators;  compiled spell emits the lowered equivalent
@thing
class Card extends Thing {
  @prop({ type: "text", default: "hearts" }) accessor suit!: string
  @prop({ init: () => [] }) accessor notes!: string[]

  @derived get isRed() {
    return this.suit === "hearts" || this.suit === "diamonds"
  }
}

class Todos extends Thing {
  // memoized:  pure (reads only cells) AND worth it (iterates a list)
  get incomplete() {
    return this.derive("incomplete", function () {
      let count = 0
      for (const task of this.tasks) if (!task.done) count++
      return count
    })
  }
}

card.keys() // ["suit", "rank", "nickname"]
card.suit = "diamonds" // overwrite:  same position;  readers of keys() don't re-run
card.deleteProp("rank") // ["suit", "nickname"]
card.setProp("score", "high") // after numbers:  observed type widens to "number | text", dev warning

// compiled JSX:  a function for everything that can change
spellCore.element({
  tag: "div",
  props: { class: () => "card " + this.color, onClick: (event) => this.play() },
  children: [() => this.short_rank + " "]
})
```

## Rules when writing Solid code

- Writes:
  - NEVER write a signal / store in a component body, memo, effect compute or `createRoot` body -- dev throws
    `REACTIVE_WRITE_IN_OWNED_SCOPE`.  `untrack` does NOT exempt it.
  - write from event handlers, `onSettled`, effect APPLY functions, or `action`s
  - `{ ownedWrite: true }` only for a signal that is internal state by design
- Reads:
  - read reactive values in JSX, a memo or an effect compute -- a component body or `<For>` / `<Show>` callback body
    is an owner, NOT a tracking scope (`STRICT_READ_UNTRACKED`)
  - need the value now in imperative code or a test?  `flush()` first (`spellCore.flush()` for spell state).  NEVER
    `flush()` inside an `action`, an effect apply or `onSettled`.
- Effects:
  - `createEffect(compute, apply)` -- two functions, always
  - the apply's RETURN VALUE IS ITS CLEANUP:  use braces, NEVER an expression body that returns a value (halts the page)
  - many React `useEffect`s should be a memo or an event handler instead
  - component setup + teardown:  `onSettled(() => { ...; return cleanup })`, not `onMount`
- Memos:  eager by default;  create them inside a component / owner, NEVER at module scope (unowned memos recompute
  forever).  `lazy: true` autodisposes when unobserved.
- Stores:  draft setters only.  A direct `store.x = 1` is SILENTLY IGNORED.
- Errors:  wrap app roots in `<Errored>`;  it heals itself when the data recovers.
  - NOTE: an error thrown by a `createEffect` COMPUTE is NOT caught by an enclosing `<Errored>`:  it goes to the
    console, and the fallback never shows (measured, P6:  `app`'s `ASTViewer` / `MatchViewer`).  Read the value in
    JSX (a render expression) where a throw must show the fallback, or give the effect an `{ effect, error }`
    bundle.
- Lists:  `<For each>` keys by identity (item = value, index = accessor);  `keyed={false}` by position (item =
  accessor);  `keyed={(t) => t.id}` by key.  `<Repeat count>` for windowing.  No `.map()` in JSX.
- Context:  the context IS the provider.  No default => a missing provider throws.
- Dynamic components:  `dynamic(() => source())`, created once outside JSX.

```tsx
createEffect(
  () => count(),
  (value) => {
    list.push(value) // braces:  `(value) => list.push(value)` would return a number as the "cleanup"
  }
)

onSettled(() => {
  const id = setInterval(tick, 1000)
  return () => clearInterval(id)
})

setStore((draft) => {
  draft.user.name = "B"
})

const rows = (
  <For each={items()} keyed={(item) => item.id}>
    {(item) => <Row item={item()} />}
  </For>
)

const app = (
  // the context IS the provider
  <Todos value={createTodos()}>
    <TodoList />
  </Todos>
)

const Active = dynamic(() => (editing() ? Editor : Viewer))
```

## DOM and `@spell-app/ui` elements

- `class`, not `className`;  array / object form, NEVER built class strings.  No `classList`.
- Attributes are HTML:  lowercase built-in names, boolean = presence.  `attr:` / `bool:` / `on:` / `use:` are gone.
- On a tag with a dash, a plain prop is a STRING ATTRIBUTE:  rich data MUST be `prop:options={...}`.
- Events:
  - `onClick` etc. are camelCase, delegated per render root.  The binding is NOT reactive:  put the choice inside
    the handler.
  - `onChange` is the native change event -- use `onInput` per keystroke
  - `onUiChange` listens for `uichange`, NOT `ui-change`:  hyphenated custom events need a ref directive
  - native options (capture, passive):  a ref directive too
- Refs are callbacks or directive factories, composable as arrays.  No `.current`, no `forwardRef`.  Ref callbacks
  are unowned -- create effects in the factory, not the callback.
- `render(() => <App />, el)` returns `dispose`.  A ShadowRoot works as the container.
- `<Portal>` defaults to `document.body`:  inside a shadow root ALWAYS pass `mount`.
- JSX types for `<ui-*>`:  augment `"@solidjs/web/types/jsx.js"`, NOT `"@solidjs/web"`.
- `@spell-app/ui` specifics (see `../ui/AGENTS.md`):
  - events are `ui-*` `CustomEvent`s with `detail`
  - never write a bare string attribute in JSX (`<ui-toast icon>` requests `true.js`):  write `icon=""`
  - glyphs must be emitted by the build
  - many hosts are `display: contents`

```tsx
const on = (type: string, handler: (event: Event) => void, options?: AddEventListenerOptions) => (el: Element) =>
  el.addEventListener(type, handler, options)

const row = <li class={["todo", props.class, { done: done(), error: !!error() }]} />

const picker = (
  <ui-dropdown
    value={selected()}
    prop:options={projects()}
    ref={on("ui-change", (event) => setSelected((event as CustomEvent<{ value: string }>).detail.value))}
  />
)

const modal = (
  <Portal mount={shadowRoot}>
    <Modal />
  </Portal>
)
```

## Hyperscript (`@solidjs/h`, what `spellCore.element()` uses)

- Nothing is reactive unless it's a FUNCTION.
- `h()` returns a thunk:  `render(() => h(App), el)`.  Fragments are arrays.
- ARITY TRAP:  on a COMPONENT, a zero-arg function prop becomes a getter.  Handlers MUST take a parameter:
  `onPick: e => go()`, never `onPick: () => go()`.  Element `on*` props and `ref` are exempt.
- It imports `@solidjs/web` by bare specifier:  keep it inside bundled code, never in blob-loaded compiled spell.

```ts
h("div", { id: () => props.id, class: "row" }, () => first() + " " + last(), h(Child, { name: () => name() }))

h(Picker, { onPick: (event: Event) => go() }) // callback:  takes a parameter
h(Picker, { onPick: () => go() }) // WRONG:  becomes a getter, passes go()'s result
```

## Testing

- `flush()` after any write or event, before asserting (`spellCore.flush()` for spell state).
  `await resolve(() => x())` for async.
- Under Node, `@solidjs/web` resolves to the SERVER build (no DOM `render`):  component tests need the
  `browser` + `development` conditions plus jsdom or vitest browser mode.  An SSR test project needs its own `solid()`.
- `@solidjs/testing-library@next` (1.0.0-beta.3):  `render(() => <X />)`.
- Reactive semantics this repo depends on are pinned by `solid/experiments/*` (planned:  vitest in `src/util/`).

```tsx
fireEvent.click(button)
flush()
expect(button.textContent).toBe("Clicks: 1")
```

## Renames and removals (1.x -> 2.0)

- `Suspense` -> `Loading`;  `ErrorBoundary` -> `Errored`;  `SuspenseList` -> `Reveal`;  `Index` -> `<For keyed={false}>`
- `mergeProps` / `splitProps` -> `merge` / `omit`;  `unwrap` -> `snapshot`;  `getListener` -> `getObserver`
- `onMount` -> `onSettled`;  `createSelector` -> `createProjection`;  `<Dynamic>` -> `dynamic()`
- `createResource` -> async `createMemo` + `<Loading>`;  `startTransition` -> automatic holds + `isPending`
- `batch`, `createComputed`, `on()`, `produce`, `createMutable`, `from` / `observable` -> gone
- Imports:  `solid-js/web` -> `@solidjs/web`;  `solid-js/store` -> `solid-js`;  `solid-js/h` -> `@solidjs/h`;
  `vite-plugin-solid` -> `@solidjs/vite-plugin`;  router = `@solidjs/router@next`, `createRouter({ routes })`

## When something breaks

- A dev diagnostic code:  read `node_modules/solid-js/skills/reactivity-diagnostics/SKILL.md` (Solid's own repair
  guide;  hoisted to the repo root's `node_modules`).  Codes are also in `cheatsheet.html`.
- Nothing updates after an error:  the scheduler halted -- find the first thrown error, not the last symptom.
- A value reads stale right after a write:  that's staging -- use a cell, or `flush()` in tests.
- A write is invisible even after `flush()`:  it's entangled with a held async write in the same batch.
- A reader of a derived value didn't update in a test:  derived checks run on a microtask -- `spellCore.flush()`.
