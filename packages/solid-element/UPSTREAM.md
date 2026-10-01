# Upstream plan

How each fix in `@spell-app/solid-element` could land in `solidjs/solid`, branch `next`, `packages/element`.
**Nothing here has been filed.**  Owen decides what goes upstream and when.

## Baseline

- Checked 2026-09-29:  `next`'s `packages/element/src/index.ts` is identical to the published
  `@solidjs/element@2.0.0-rc.11` (`dist/index.js`, 84 lines).  It depends on `component-register@^0.8.7`
  (0.8.8, last published 2025-09-08), which is the actual custom-element layer:  prop definitions, the element
  class, attributes, reflection, lifecycle.
- `component-register` issues and PRs referenced below were read on GitHub the same day (all still open):
  - issues:  #5 reconnect, #8 numeric strings parsed as numbers, #15 formAssociated, #20 default after an
    attribute is removed, #38 the `id` attribute becomes `"undefined"`, #40 multi-underscore props
  - PRs:  #30 initialize props in the constructor (`"key" in el`), #32 no case / dash transforms, #34 scoped
    registries, #37 readonly assignment in `createElementType`, #39 don't modify the element in the constructor
- Most fixes live in `component-register`.  Two routes:
  1. **Inline** (recommended):  `packages/element` absorbs the ~250 lines of `component-register` it uses (element
     class, props, reflection, HMR), drops the dependency, and each fix below is one PR against that copy.
     PR 0 is the inlining itself, behaviour-identical, with `compat.test.tsx` as its test.
  2. **Patch `component-register`**:  the same PRs against `ryansolid/component-register`, then a version bump
     in `packages/element`.  Its PR queue has been idle for years, so route 1 is likelier to move.
- Test files port from Vitest browser mode (this package) to the upstream `jsdom` setup, except where noted
  (`ElementInternals`, `delegatesFocus` and declarative shadow DOM need a real browser;  those tests would go
  in a browser project, or be marked `skipIf(!("attachInternals" in HTMLElement.prototype))`).

## PR 1 -- `options`:  base class, registry, shadow root, form association (`customElement.ts`, `element.ts`, `shadowRoot.ts`)

- **Problem:**  `customElement(tag, props, Component)` has no options (element `:77-83`).  No base class means no
  `static formAssociated`, no constructor of your own, no `attachInternals()`;  no registry means no scoped
  registries;  `renderRoot` hard-codes `attachShadow({ mode: "open" })` (`component-register.js:169-172`), so no
  `delegatesFocus`.  The workaround is calling `register(tag, props, { BaseElement, customElements })` with a
  fake registry that captures the class, subclassing it, and defining it yourself (the `@spell-app/ui` spike's
  `ElementDefinition.register()`, ~40 lines).
- **Answers:**  issue #15 (formAssociated), PR #34 (scoped registries, via `registry`).
- **Patch outline:**
  - `customElement(tag, props?, Component, options?)`;  `register(tag, props, options)` already takes
    `BaseElement` / `customElements`:  add `registry` (alias), `shadowRootInit` (`ShadowRootInit | false`),
    `formAssociated`, `internals`
  - `createElementType`:  `if (options.formAssociated !== undefined) define static formAssociated`;  the
    `renderRoot` getter uses `options.shadowRootInit` and returns the element for `false`
- **Breaking:**  no.
- **Test:**  `options.test.tsx` -- `BaseElement` in the prototype chain, `formAssociated` static,
  `delegatesFocus` reaching the root, a stub registry receiving `define()`, `shadowRootInit: false`, closed mode.

## PR 2 -- accessors on the prototype + the upgrade step (`upgrade.ts`)

- **Problem:**
  - accessors are defined per INSTANCE in `connectedCallback` (`component-register.js:41`);  0.8.8's constructor
    also assigns `undefined` to every key (`:122`), apparently so `"key" in el` holds before connect, which
    - drops any property a framework set BEFORE the element was defined (the value is overwritten, then read
      back as `undefined`)
    - makes `document.createElement()` fail when a key is also an attribute-reflecting native (`style`, `id`:
      the constructor adds an attribute, `NotSupportedError`, issue #38:  `id="undefined"`)
    - adds own properties in the constructor (PR #39)
  - a prop named like a native member (`style`, `hidden`, `title`) silently replaces it on every instance
- **Answers:**  PR #30, PR #39, issue #38;  probably PR #37 too (its "assign to readonly property" error is
  what the constructor assignment does to a getter-only native, unverified).
- **Patch outline:**
  - `createElementType`:  after building the class, `Object.defineProperty(Class.prototype, key, { get, set })`
    per prop, reading / writing a per-instance value record created in the constructor
  - constructor:  for each key with `Object.hasOwn(this, key)`, stash the value, `delete this[key]`;  on first
    `connectedCallback`, re-set it through the setter (so it reflects and notifies)
  - definition time:  throw if `key in BaseElement.prototype` (or the element's own API) unless the definition
    sets `property` (rename, or explicit override)
- **Breaking:**  yes, mildly:  a key shadowing a native member now throws.  A softer upstream variant:  warn in
  dev and keep defining the accessor.
- **Test:**  `upgrade.test.tsx` -- property set before `define()` survives;  accessor on the prototype and no own
  property;  `id` prop with `property: "id"` keeps the author's id;  `style` prop throws;  rename via `property`.

## PR 3 -- per-prop definitions:  `type`, `converter`, `property`, the boolean rule (`props.ts`)

- **Problem:**
  - `parse` defaults to `typeof value !== "string"` and means `JSON.parse`, whose wrapper returns `undefined`
    for `""` (`component-register.js:60`):  a bare boolean attribute (`<x primary>`) is FALSE
  - numeric strings become numbers, losing precision (`"210246661446959104"` => `210246661446959100`)
  - with `parse: false`, `true` reflects as `"true"` (`:69-71`)
  - `toAttribute` replaces only the first `_` (`:76`)
- **Answers:**  issue #8, issue #40;  the boolean case has no issue yet.
- **Patch outline:**
  - `PropDefinition` gains `type` (`Boolean | Number | String | Array | Object`, inferred from `value`),
    `converter: { fromAttribute, toAttribute }` (or a function), `property`, `attribute: false`
  - `normalizePropDefs` binds `fromAttribute` / `toAttribute` per prop;  `parse: false` maps to `String`,
    `parse: true` without a typed default keeps the loose JSON parse (minus the `""` bug)
  - boolean:  `text !== null`;  reflection:  `true` => `""`, `false` / nullish => remove
  - JSON only for `Object` / `Array`;  untyped props get the text;  an object value reflects as JSON for every
    type (never `[object Object]`)
  - `converter.fromProperty(value)`:  optional normalization of PROPERTY writes (and of properties captured at
    upgrade), e.g. `"yes"` => `true`, a translated enum value => its canonical one.  Lit has no equivalent (it
    stores property writes as is);  it lets a component read ONE canonical value whichever way it was set,
    instead of a memo per prop re-converting (the `@spell-app/ui` spike's old `ElementDefinition.convert()` layer)
  - `toAttribute`:  `/_/g`
- **Breaking:**  yes:  untyped props stop JSON-parsing;  `flag="false"` becomes `true` (HTML's rule);  `Number`
  uses `Number()`.  Could ship as the default of a new major, with `parse: true` as the escape hatch.
- **Test:**  `props.test.tsx` -- bare boolean, `true` reflection, numeric id, removal => default,
  underscores;  typed conversion;  converter both ways;  `fromProperty` (incl. pre-upgrade);  object values
  reflect as JSON;  the old `{ value, attribute, parse, reflect }` shape.

## PR 4 -- attribute traffic:  removals, change source, synchronous reflection guard (`attributes.ts`)

- **Problem:**
  - `attributeChangedCallback` ignores a removal when the current value is falsy (`:161`), so removing a bare
    attribute whose raw value is `""` never reaches the component
  - the reflection guard `__updating[attr]` is cleared a microtask later (`:70/:73`):  an author's own
    `setAttribute()` of the same attribute in that tick is swallowed
  - change callbacks can't tell an attribute write from a property write, so a caller needing "don't reflect
    what came from the attribute" keeps its own flags
- **Answers:**  issue #20 (together with PR 3's removal => default).
- **Patch outline:**
  - `attributeChangedCallback`:  drop the falsy early return;  convert `null` via `fromAttribute` (=> default)
  - `reflect()`:  set `__reflecting = attr` around `setAttribute()` / `removeAttribute()` and restore it in
    `finally` -- custom-element reactions run before `setAttribute()` returns, so the guard needs no microtask
  - callbacks:  `fn(key, value, old, source)`;  attribute writes don't reflect back
  - process attribute changes before the first connect too (the platform replays them at upgrade)
- **Breaking:**  no (a 4th callback argument).
- **Test:**  `attributes.test.tsx` -- bare removal, callback sources, same-tick `setAttribute()`, no echo,
  array reflection round trip.

## PR 4b -- don't reflect default values (`lifecycle.ts`)

- **Problem:**  `component-register`'s `initializeProps` (run on first connect) calls `prop.reflect &&
  reflect(...)` for EVERY prop, defaults included (`component-register.js:40`).  A bare `<x-icon>` with a
  reflecting `variant` default of `"solid"` becomes `<x-icon variant="solid">`, so the component can no longer
  tell a default from an author's explicit choice, and `outerHTML` / serialized markup changes under the author.
  Native elements and Lit (`useDefault`) never do this.  Confirmed in the original: yes, it reflects defaults.
- **Patch outline:**  drop the reflect-on-connect loop.  Reflection only happens on a property write (writing
  the default back included);  removing the attribute restores the default without reflecting.  A pre-upgrade
  property is re-applied through the setter, so it still reflects.
- **Breaking:**  yes for consumers relying on default attributes (e.g. CSS `[variant]` selectors on defaults).
- **Test:**  `attributes.test.tsx` -- bare element has no attribute, default write reflects, removal restores
  the default with no attribute;  `upgrade.test.tsx` -- pre-upgrade property reflects.

## PR 5 -- `ElementInternals` and form hooks (`internals.ts`)

- **Problem:**  no way to get `ElementInternals` (it can only be attached by the element's own class) or to hear
  `formResetCallback` / `formDisabledCallback` / `formAssociatedCallback` / `formStateRestoreCallback` from a
  function component.
- **Answers:**  issue #15.
- **Patch outline:**
  - constructor:  `if ((formAssociated || internals) && !this.internals) this.internals = this.attachInternals()`
  - the class forwards the four form callbacks (after the base class's own) to hook sets on the element
  - `onFormAssociated` / `onFormDisabled` / `onFormReset` / `onFormStateRestore(fn)`:  register on
    `getCurrentElement()`, remove via `onCleanup`;  the first two replay the last reported state, because
    `formAssociatedCallback` fires on insertion, BEFORE `connectedCallback` renders the component
- **Breaking:**  no.
- **Test:**  `internals.test.tsx` -- submits through internals (browser-only);  states with `internals: true`;
  base-attached internals reused;  every hook forwarded;  base callback first.

## PR 6 -- lifecycle:  `keepAlive`, `onConnect` / `onDisconnect`, `dispose()` (`lifecycle.ts`)

- **Problem:**  every disconnect that outlives a microtask disposes the component, and a reconnect renders from
  scratch (`:146-155`):  moving an element to another container (drag-and-drop, sorted lists, portals) loses all
  component state.  There is no connect / disconnect hook.
- **Answers:**  issue #5.
- **Patch outline:**
  - option `keepAlive`:  `disconnectedCallback` returns early;  `element.dispose()` runs the release callbacks
  - `connectedCallback` / `disconnectedCallback` run `connect` / `disconnect` hook sets;
    `onConnect(fn)` / `onDisconnect(fn)` register like PR 5's hooks
  - default unchanged (dispose after a microtask when not re-attached)
- **Breaking:**  no.
- **Test:**  `lifecycle.test.tsx` -- state across a real detach with `keepAlive` (the original re-renders);
  default behaviour unchanged;  props flow while detached;  `onCleanup` on `dispose()` only;  hook order;
  nested hooks removed with their owner.

## PR 7 -- error boundary per element (`errors.ts`)

- **Problem:**  an error thrown while rendering or updating ANY element escapes to Solid's scheduler, which
  halts for the whole page (`[REACTIVITY_HALTED]`):  every other element, and the host app on the same runtime
  copy, stops updating.  In the `@spell-app/ui` spike one bug made 25 unrelated tests hang.
- **Answers:**  no upstream issue yet.
- **Patch outline:**
  - `withSolid`:  `createErrorBoundary(() => untrack(render), fallback)` around the component (untracked:  the
    boundary's compute tracks)
  - options `errorBoundary` (default `true`), `onError(element, error)` (default one `console.error`),
    `fallback(element, error)` (content), `errorEvent` (a cancelable `CustomEvent` name;  cancelling skips the
    other two);  `:state(errored)` when internals exist
  - `onError` and event listeners run under `runWithOwner(null)`, so they may write signals;  `fallback` runs
    under the boundary so its JSX is disposed with the element
- **Breaking:**  yes, in failure mode only:  errors are logged instead of thrown out of `connectedCallback`.
- **Test:**  `errors.test.tsx` -- a sibling keeps updating after an error (the original halts);  default log;
  `fallback` / `onError` / `:state(errored)`;  setup errors;  cancelable event;  `errorBoundary: false`.

## PR 8 -- owner lookup across shadow roots (`owner.ts`)

- **Problem:**  `lookupContext` walks `parentNode` (element `:19-31`), which ends at a `ShadowRoot`:  an element
  created WITHOUT JSX inside another element's shadow root (template clone, `innerHTML`, lazy content) gets no
  context from the page.
- **Answers:**  no upstream issue yet.
- **Patch outline:**  in the loop, `next = next.parentNode ?? (next.nodeType === 11 ? next.host : null)`.  Keep
  rc.11's foreign-runtime guard (solidjs/solid#3053) unchanged.  Only hop through `ShadowRoot` (`<a>.host` is a
  URL part).
- **Breaking:**  no (more context found, never less).
- **Test:**  `owner.test.tsx` -- a context provided above an element reaches an element added later inside its
  shadow root via `innerHTML`.

## PR 9 -- adopt a declarative shadow root (`shadowRoot.ts`)

- **Problem:**  `renderRoot` returns an existing shadow root as is, and `insert()` APPENDS:  server-rendered
  declarative shadow DOM plus the client render show everything twice.
- **Answers:**  no upstream issue yet.
- **Patch outline:**  when `renderRoot` finds an existing root (`this.shadowRoot`, or `internals.shadowRoot` for
  a closed one), flag it;  `withSolid` empties it right before `insert()`.  Hydration is a separate, larger
  feature.
- **Breaking:**  no.
- **Test:**  `shadowRoot.test.tsx` (browser-only:  `setHTMLUnsafe` + declarative shadow DOM) -- replaced not
  appended;  closed root via internals;  same root node kept.

## PR 10 -- delegated events leak out of shadow roots (`events.ts`)

- **Problem:**  every element's shadow root is a delegation root (`registerDelegatedRoot`, element `:48`), and
  dom-expressions' `eventHandler` (`@solidjs/web` `web.js:1572-1641`) leaves its walk state ON THE EVENT OBJECT:
  - `retarget(oriTarget)` at the end redefines `target` as an own property holding the value read on entry at the
    shadow root:  the INNER node.  Own beats the prototype's retargeting getter, so every later listener outside
    the shadow root sees `<button>` / `<input>`, not the host.
  - `currentTarget` stays an own getter returning wherever the walk stopped (the inner node), for every later
    listener -- also for a plain Solid app with no shadow DOM (a `document` / `window` listener added after the
    app's gets the app's last walked node).
  - the `_$SOLID_EVENT_OWNER` marker stays the shadow root;  every OUTER container bails on
    `!container.contains(prev)` (not shadow-including), so a Solid app's `<my-el onClick>` and any `onClick` above
    a nested element never run for events from inside that element's shadow root.
- **Is it Solid 2 generally?**  Yes:  every `@solidjs/element` element, and any `render()` into a shadow root
  (`@spell-app/solid-element` inherits it unchanged).  Candidate issue for `solidjs/solid` (`next`;  the code is
  dom-expressions' `client.js` `eventHandler`), not filed.  Minimal repro (no library):

  ```tsx
  import { render } from "@solidjs/web"
  customElements.define("x-el", class extends HTMLElement {
    connectedCallback() {
      render(() => <button onClick={() => {}}>b</button>, this.attachShadow({ mode: "open" }))
    }
  })
  const app = document.body.appendChild(document.createElement("div"))
  render(() => <div onClick={() => console.log("never runs")}><x-el /></div>, app)
  const el = app.querySelector("x-el")!
  el.addEventListener("click", (e) => console.log(e.target === el, e.currentTarget === el)) // false false
  el.shadowRoot!.querySelector("button")!.click()
  ```
- **Answers:**  no upstream issue yet.
- **Patch outline (upstream, in `eventHandler`, ~10 lines):**
  - end with `delete e.target;  delete e.currentTarget` (both were defined `configurable`), not
    `retarget(oriTarget)`:  the platform's getters return
  - a `ShadowRoot` container hands off at its host:  run the host's own handler when the enclosing container would
    resume past it, and leave the host as the marker (or make the `contains(prev)` check shadow-including:
    `prev.getRootNode().host` up to the container)
- **This fork (from outside, no `@solidjs/web` change):**  `registerRoot()` wraps Solid's per-type listener on the
  render root (own `addEventListener` on the root instance;  Solid's listener told apart by the container state
  `registerDelegatedContainer()` returns).  After it:  own props deleted, host handler run when a plain Solid
  container walks next, marker moved to the host.  Before it:  when an inner root walked part of the path, a
  one-shot `composedPath()` slice makes Solid resume after that part (slots included).  Reads internals
  (`_$SOLID_EVENT_OWNER`, `_$$<type>`, the state's `handlers` / `roots`):  pinned rc.11.
- **Cost:**  +0.75 kB min + gzip;  ~+0.5-1 us per delegated event per root on its path (chromium, 50k clicks:
  1.9-2.3 us => 2.7-3.0 us single root);  no extra listeners.
- **Breaking:**  handlers above a nested element (and a Solid app's handlers on an element) now RUN where they
  were silently skipped;  page listeners see the retargeted `target`.
- **Test:**  `events.test.tsx` -- page listener `target` / `currentTarget` (original leaks the inner node);  app
  handlers on and above the element;  nested elements;  slotted light content and a nested element slotted into
  another, each handler once;  `stopPropagation()`;  a component's own root listener untouched;  `noShadowDOM()`.
  `@spell-app/ui`'s `test/events.test.tsx`:  `input` / `click` / `keydown` / `focusin` on `<ui-input>`, `<ui-button>`,
  `<ui-dropdown>` with and without a Solid app, and a rich dropdown item's nested element.

## PR 11 -- a slotted element's root dies with its slot's branch (`owner.ts`)

- **Problem:**  `lookupContext` (element `:19-31`) returns the `_$owner` stamped on the element's ASSIGNED SLOT
  (or an ancestor's) before anything else, and `withSolid` runs `createRoot` under it.  In Solid 2 a root
  created under an owner is that owner's CHILD (`createOwner()` links it;  `createRoot`'s own docs:  "disposed
  when the parent is disposed"), unlike Solid 1, where roots were never owned and the slot preference only
  carried context.  So when a component re-creates its `<slot>` (`<Show>` / `<Switch>` / `<Dynamic>` swapping the
  element around it), the branch that rendered the old slot is disposed and takes with it the whole root of every
  element slotted into it:  they stop updating, silently, and keep their last DOM.  The elements are still
  connected (they're light DOM), so no disconnect ever re-renders them.
  - racy too:  only when the host had ALREADY rendered its slot when the child connected (host defined first,
    synchronous render);  a child connecting before its host renders walks past the unassigned slot.
- **Is it Solid 2 generally?**  Yes, every `@solidjs/element` element slotted into a Solid-rendered `<slot>` that
  can be re-created.  Minimal repro (the original's own API):

  ```tsx
  import { customElement } from "@solidjs/element"
  import { flush, Show } from "solid-js"
  customElement("x-child", { label: "before" }, (props) => <span>{props.label}</span>)
  customElement("x-host", { wide: false }, (props) => (
    <Show when={props.wide} fallback={<div><slot /></div>}>
      <section><slot /></section>
    </Show>
  ))
  document.body.innerHTML = "<x-host><x-child></x-child></x-host>"
  const [host, child] = [document.querySelector("x-host"), document.querySelector("x-child")]
  host.wide = true;  flush()
  child.label = "after";  flush()
  console.log(child.shadowRoot.textContent) // "before":  its root was disposed with the fallback branch
  ```
- **Answers:**  no upstream issue yet.
- **Patch outline:**
  - `lookupContext`:  the element's OWN stamp first (its creator), else the nearest stamped ancestor's, crossing
    shadow roots (PR 8);  never read `assignedSlot`.  The creator owns the element's DOM, so its lifetime covers
    the element's;  a slot only displays light DOM that someone else wrote
  - skip a stamp whose owner `isDisposed()` (an element created in a branch, connected after it ended):
    adopting it gives a root nothing ever disposes (`RUN_WITH_DISPOSED_OWNER`)
  - the better upstream fix keeps slot context:  a `@solidjs/signals` primitive for a root that INHERITS an
    owner's context without being its child (e.g. `createRoot(fn, { context: owner })`);  then `withSolid` could
    take context from the slot and lifetime from the creator.  Solid 2 has no public way to do that today
    (`_context` is copied only from the parent at creation, and mangled in prod), so this fork doesn't try.
- **Breaking:**  yes:  context a component provides AROUND its `<slot>` no longer reaches slotted elements
  (upstream's own test "HTML-authored provider and reader custom elements share context through slot markers"
  fails;  `compat.test.tsx` skips it for the fork).  App context is unaffected:  an app-written element carries
  the app's stamp, and an HTML-authored one inside it finds its nearest stamped ancestor.
- **Cost:**  -0.1 kB min, -16 B min + gzip (the walk loses its two slot checks, gains `isDisposed`).
- **Test:**  `owner.test.tsx` -- the swap above (the original freezes, both elements `keepAlive`);  the same with the
  child connected before its host renders;  an app-written element keeps app context and updates across the
  swap;  context around a `<slot>` no longer reaches slotted elements;  a disposed stamp is skipped.  `@spell-app/ui`:
  `item`, `menu`, `list` (their one-moved-slot workaround removed), `label` (statistic / standalone swap),
  `parts` (`<ui-header>` link / plain swap).

## HMR -- redefinition in place, live-instance registry, Vite plugin (`hot.ts`, `vite.ts`)

- **Problem:**
  - `register()` on an existing tag swaps `Component` only (`component-register.js:276`):  new props (a new
    property-only prop, a changed converter or default) and options are silently ignored, and a change the
    platform CAN'T take (a new observed attribute) gives no signal at all
  - `hot(module, tag)` is webpack-shaped (`module.hot`);  with Vite each app writes its own
    `import.meta.hot.accept()` and walk
  - `reloadElement()` calls `connectedCallback()` (`:90-96`), which re-renders a DETACHED element too;  `hot()`
    walks only `document.body` (`:238-256`), missing detached and `keepAlive` instances;  the fork's
    `:state(errored)` would stick after a recovery
  - `@solidjs/element` has no Vite story:  `@solidjs/vite-plugin`'s refresh wraps exported function components,
    not `customElement()` calls, so an element module edit falls through to a full reload
- **Answers:**  no upstream issue yet.
- **Patch outline:**
  - `register()` on an existing tag, while `import.meta.hot` exists:  `redefine()` -- refuse (record the reason)
    when observed attributes, `formAssociated`, base class, internals or shadow root options changed;  else swap
    `Component`, `props` and `options` IN PLACE (the class's closures hold those objects), redefine accessors,
    and migrate each live instance's values (property writes kept, attribute values re-converted, new keys
    defaulted -- needs a dev-only "last write source" per key in `setProp()`)
  - dev-only `WeakRef` registry of instances per class (constructor);  `liveElements()` walks the document and
    open shadow roots when untracked
  - `hotUpdate(hot)`:  re-render every swapped class's instances, or `hot.invalidate(reason)`;
    `reloadElement()`:  dispose, clear `errored`, render only if connected
  - `@solidjs/element/vite` (or an option of `@solidjs/vite-plugin`):  append the accept to modules calling
    `customElement(`;  force a full reload when a changed module reaches several element modules (shared base
    code);  optional style-module hand-off
  - every dev path sits behind `import.meta.hot`, so builds drop it (0 bytes)
- **Breaking:**  no.  In dev a refused redefinition warns and reloads instead of half-applying.
- **Test:**  `hot.test.tsx` (registry, in-place swap with values kept, converter / default migration, each refusal
  reason, shadowing prop throws, error recovery, detached `keepAlive`, `hot()` still works);
  `@spell-app/ui`'s `yarn test:hmr` is the end-to-end proof (a real Vite server, real file edits).

## Smaller changes riding along

- **Element as context** (`current.ts`):  `withSolid` provides the element through a Solid context, so
  `getCurrentElement()` and the hooks work from nested components and after setup.  Needs `untrack` inside the
  provider's `children` getter, or the component re-runs on every prop read in its body.
- **`ownedWrite` on prop signals** (`withSolid.ts`):  `el.value = x` is a DOM API, legal anywhere;  without it,
  setting a property from a Solid component body throws in dev (`solid2.test.tsx` reproduces it against rc.11).
- **HMR:**  re-registering a tag defined by another library throws instead of returning that class (see the HMR
  section for the rest).
