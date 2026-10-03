# @spell-app/solid-element

Custom elements for Solid 2.  A fork of [`@solidjs/element`](https://github.com/solidjs/solid/tree/next/packages/element)
(2.0.0-rc.11;  its code is unchanged in rc.13) and [`component-register`](https://github.com/ryansolid/component-register) (0.8.8), both MIT,
(c) Ryan Carniato, merged into one TypeScript package and fixed.  The API is a SUPERSET of `@solidjs/element`:
existing code keeps working, and every addition is opt-in through a 4th `options` argument or a richer prop
definition.  Each fix lives in its own module with its own test file, so each can become one upstream PR --
see [`UPSTREAM.md`](./UPSTREAM.md).

- Peer dependencies:  `solid-js` and `@solidjs/web`, `2.0.0-rc.13` (pinned:  the RCs still churn).
- Size:  4.73 kB min + gzip 9 with every export, vs 2.13 kB for `@solidjs/element` + `component-register`
  (`yarn measure`).  The HMR helpers are ~0.3 kB of that, and only when imported;  the dev-only code behind
  `import.meta.hot` is 0 bytes in a build.

```tsx
import { customElement, onFormReset } from "@spell-app/solid-element"

customElement(
  "my-select",
  {
    options: { type: Array, value: [] as string[], attribute: false },
    value: { type: String, value: "", reflect: true },
    disabled: { type: Boolean, reflect: true }
  },
  (props, { element }) => {
    onFormReset(() => (element.value = ""))
    return <button disabled={props.disabled}>{props.value || "choose"}</button>
  },
  { formAssociated: true, shadowRootInit: { mode: "open", delegatesFocus: true }, keepAlive: true }
)
```

## API

| Export | What |
|---|---|
| `customElement(tag, props?, Component, options?)` | Define `tag` rendering the Solid `Component`;  returns the class.  Re-defining a tag this package owns swaps the component (hot reload;  in Vite dev also props and options, see [HMR](#hot-module-replacement)). |
| `register(tag, props?, options?)(Component)` | `component-register`'s HOC:  defines the element;  `Component` gets `(values, { element })` on first connect. |
| `withSolid(Component)` | The mixin that renders Solid into `element.renderRoot`.  Also runs on `component-register`'s elements. |
| `compose(...mixins)` | Right-to-left composition:  `compose(register(tag, props), withSolid)(Component)`. |
| `noShadowDOM()` | In the component:  render into the element itself. |
| `getCurrentElement()` | The element being set up;  also works later, anywhere under its component (it's provided as context). |
| `onConnect(fn)` / `onDisconnect(fn)` | Every connect (the first included, right after setup) / every disconnect, synchronously. |
| `onFormAssociated(fn)` / `onFormDisabled(fn)` / `onFormReset(fn)` / `onFormStateRestore(fn)` | The platform's form callbacks.  `formAssociated` / `formDisabled` replay the last reported state to late registrations. |
| `hotUpdate(import.meta.hot)` | Vite HMR:  re-render the live instances of every class re-defined since the last call, or invalidate (full reload) when a re-definition was refused.  `@spell-app/solid-element/vite` calls it for you. |
| `reloadElement(el)` / `reloadElements(ClassOrTag)` / `liveElements(ClassOrTag)` | Re-render one / every live instance with the class's current component, keeping host attributes and properties;  list them. |
| `hot(module, tag)` | `component-register`'s HMR (webpack / Parcel style). |
| `toAttribute(name)` | `someProp` => `some-prop`, `a_b_c` => `a-b-c`. |
| `createProps(values)` | The reactive props object `withSolid` builds (one signal per key). |

Hooks register like `onCleanup`:  call them in the component (or any child component);  they are removed when
the registering owner is disposed.  Outside a component they throw.

### The element

Every element gets, besides one accessor per prop ON THE PROTOTYPE:

- `renderRoot` -- the shadow root (adopted if declarative), or the element with `noShadowDOM()` / `shadowRootInit: false`
- `internals` -- `ElementInternals`, with `formAssociated` or `internals: true` (or whatever the base class attached)
- `dispose()` -- end the component now;  the only way to end a `keepAlive` element's root
- `addPropertyChangedCallback(fn)` -- `fn(key, value, old, source)` on every write, `source` = `"attribute" | "property"`
- `addReleaseCallback(fn)`, `lookupProp(name)` -- `component-register`'s instance API

## Options

| Option | Default | What |
|---|---|---|
| `BaseElement` | `HTMLElement` | Class to extend;  its constructor and form callbacks run first. |
| `registry` | `customElements` | Where to define (scoped registries).  `customElements` is accepted as the old name. |
| `shadowRootInit` | `{ mode: "open" }` | Passed to `attachShadow()` (`delegatesFocus`, `slotAssignment`, closed mode).  `false` renders into the element. |
| `formAssociated` | -- | `static formAssociated = true`;  implies `internals`. |
| `internals` | `false` | Attach `element.internals` (custom states, ARIA). |
| `keepAlive` | `false` | Keep the reactive root across disconnect / reconnect;  props keep flowing while detached. |
| `errorBoundary` | `true` | Wrap the render in an `<Errored>` boundary. |
| `onError(element, error)` | one `console.error` | An error escaped the component.  Runs outside any owner:  may write signals. |
| `fallback(element, error)` | nothing | Replacement content (nodes, text or JSX) rendered into the render root. |
| `errorEvent` | -- | Also dispatch a cancelable `CustomEvent` of this name, `detail: { error }` (e.g. `"ui-error"`);  cancelling skips `onError` and `fallback`. |

After an error the element keeps its place in the DOM, stops rendering, and gets `:state(errored)` when it has
internals.  Every other element keeps working:  without the boundary, one uncaught error halts Solid's scheduler
for the whole page.

## Prop definitions

Each key of the props object is the name the COMPONENT reads (`props.key`).  An entry is a bare default or a
definition:

```ts
{
  value?: T                      // default;  objects / arrays cloned per element
  attribute?: string | false     // default: the key in kebab case;  false => property only
  property?: string              // element property name;  default: the key
  type?: Boolean | Number | String | Array | Object
  converter?:
    | ((text, prop) => T)
    | { fromAttribute?(text, prop): T, toAttribute?(value, prop): string | null, fromProperty?(value, prop): T }
  reflect?: boolean              // write property changes back to the attribute, synchronously
  parse?: boolean                // DEPRECATED (component-register):  false ~== type String
}
```

- `type` is inferred from `value` (`false` => `Boolean`, `0` => `Number`, `[]` => `Array`, `{}` => `Object`),
  else `String`.
- Attribute => value:
  - `Boolean`:  present (any text, `""` included) ~== `true`, removed ~== `false` -- HTML's rule, so
    `flag="false"` is `true`;  use a `converter` for yes / no semantics
  - `Number`:  `Number(text)`;  `String`:  the text
  - `Object` / `Array`:  `JSON.parse`, the default when it isn't JSON.  The ONLY types that parse JSON.
  - removed:  the default (`false` for booleans)
- Value => attribute:  `true` => `""`, `false` / `null` / `undefined` => removed, objects / arrays => JSON (an
  object written to a `String` prop too:  never `[object Object]`).
- A converter wins over `type`.  `fromAttribute` also gets `null` when the attribute is removed.
- Property writes are stored AS IS (not converted), as in Lit, unless the converter has `fromProperty`:  then
  `el.flag = "yes"` can store `true`, a translated enum value its canonical one.  It also runs for properties
  captured at upgrade.
- Attribute writes never reflect back (`primary="yes"` stays `"yes"`).
- Defaults are never reflected:  a bare `<x-icon>` has no attributes, as with native elements (Lit's
  `useDefault` has the same rule).  Only a property write reflects, and writing the default value back still
  does.  Removing the attribute restores the default and leaves it removed.  A property set before upgrade is
  an explicit write, so it reflects.  (`component-register` reflected defaults on connect, so components could
  not tell a default from an author's choice.)
- A key that would shadow a member of the element (`style`, `hidden`, `id`, `title`, or this package's own
  `dispose`, `internals` ...) throws at definition.  Rename the property (`{ hidden: { type: Boolean, property:
  "isHidden" } }` keeps attribute `hidden` and `props.hidden`), or set `property` to the same name to override
  on purpose (`{ id: { value: "", property: "id" } }`).
- Properties set on an element BEFORE it was defined (a framework handing over rich data early) are captured
  by the constructor and re-applied through the setters on first connect;  they win over attributes.

## Lifecycle

- Default, as `@solidjs/element`:  a disconnect not followed by a reconnect within a microtask disposes the
  component;  connecting again renders from scratch.  A same-tick move (remove + append) keeps it.
- `keepAlive: true`:  nothing is disposed on disconnect.  Moving, sorting or re-parenting keeps all component
  state.  `element.dispose()` ends it;  a later connect renders afresh.
- `onCleanup` works in both modes:  it runs when the root is disposed.

## Declarative shadow DOM

A server-rendered `<template shadowrootmode>` root (open, or closed with `internals: true`) is adopted and
emptied right before the first render.  No hydration yet:  the client render replaces the server markup
(`@solidjs/element` appended to it, showing everything twice).

## Migrating from `@solidjs/element`

- Change the import;  `customElement`, `withSolid`, `noShadowDOM`, `getCurrentElement`, `hot` are the same.
- `component-register`'s `register` / `compose` are exported here;  its context helpers (`createContext`,
  `provide`, `consume`) are not -- Solid's own context crosses elements.
- Behaviour changes (all bug fixes, but check):
  - a bare boolean attribute is `true` (was `undefined`);  `flag="false"` is `true` (was `false`) -- add a
    converter if you relied on it
  - props without a typed default no longer JSON-parse attributes:  `{ items: undefined }` gets the text;
    declare `{ items: { type: Array } }` (or keep `parse: true` for the old loose parsing)
  - `Number` props use `Number(text)`:  `"abc"` is `NaN` (was the string)
  - a removed attribute restores the default (was `null`, or ignored when the value was falsy)
  - multi-underscore keys map every `_` to `-`
  - a key shadowing an `HTMLElement` member throws at definition (was a silent per-instance override)
  - accessors are on the prototype, and exist before connect;  the constructor adds no own properties
  - the component runs inside an error boundary:  errors are logged, not thrown out of `connectedCallback`
    (`errorBoundary: false` restores that)
  - change callbacks get a 4th argument, `source`
  - outside listeners see `event.target` === the element (was the inner node);  handlers above an element now
    run for events from inside its shadow root (were skipped)
  - an element's root is owned by whoever CREATED it (its own `_$owner`, else the nearest stamped ancestor,
    across shadow roots), never by the `<slot>` it's assigned to:  a host re-creating its slot no longer
    disposes the elements slotted into it.  Context a component provides AROUND its `<slot>` no longer reaches
    slotted elements;  provide it above the light DOM instead (the app)
- If you called `register()` with a capturing registry to get a base class, form association or shadow
  options:  pass `options` instead.

## Solid 2 rules

What a fork can hide, it does:

- The component body runs UNTRACKED:  reading `props.x` there never re-runs the component.
- Props arrive already converted, one signal each:  no per-prop memo layer is needed.
- Element property writes are always legal:  the prop signals allow writes from owned scopes, because
  `el.value = x` is a DOM API anyone may call from anywhere (a Solid app's component body, a memo).
- `onError` and error-event listeners run outside any owner, so they may write signals.
- Delegated events (`onClick`, `onInput` ...) don't leak out of the shadow root:  listeners outside see the
  platform's `target` (the host) and `currentTarget`, and handlers ABOVE the element (a Solid app's
  `<my-el onClick>`, an enclosing element's) run for events from inside it (`events.ts`;  plain
  `@solidjs/element` leaves the inner node on the event and drops those handlers).

What it can't (Solid 2 itself), with the patterns that work:

- **No signal writes inside an owned scope** (component body, memo, effect COMPUTE):  dev throws
  `REACTIVE_WRITE_IN_OWNED_SCOPE`.  Write from event handlers, `onSettled`, promise callbacks, or this package's
  hooks (`onConnect`, `onFormReset` ...).  Compute starting state into the signal's initial value instead of
  writing it during setup.  `untrack` does NOT exempt a write.
- **Memos compute EAGERLY** on creation:  a memo reading something not yet assigned (a class field declared
  later, a subclass field from a base constructor) sees `undefined`.  Declare signals before the memos that read
  them, or pass `{ lazy: true }`.
- **Writes land on a microtask:**  a read right after a write in the same tick sees the OLD value;  tests call
  `flush()`.  Keep the new value in a local.
- **Effects take two functions:**  `createEffect(compute, apply)`;  the compute tracks, the apply does side
  effects (and may write).
- **Hooks writing signals** (`onConnect` / `onDisconnect`) run inside `connectedCallback`, which may itself run
  inside a Solid render (an app inserting the element);  defer writes with `queueMicrotask` if that matters.

## Hot module replacement

Edit a component in Vite dev and every live instance re-renders with the new code, in place:  same element
objects, same attributes and property values (rich data included), no page reload.

```ts
// vite.config.ts
import solid from "@solidjs/vite-plugin"
import { solidElementHot } from "@spell-app/solid-element/vite"

export default { plugins: [solid(), solidElementHot()] }
```

- The plugin (`apply: "serve"`, builds untouched) appends `import.meta.hot.accept(() => hotUpdate(import.meta.hot))`
  to every module that calls `customElement(` (`detect`).  Vite re-runs the module;  `customElement()` for a tag
  this package defined swaps the class's component, props (accessors, converters) and options IN PLACE;
  `hotUpdate()` then re-renders each live instance (`reloadElement()`).
- What survives:  the element, its attributes, its property values (a value last written as a property is kept;
  one written by its attribute is converted again with the new converter;  a new prop gets its default), its
  shadow root and adopted sheets.  What doesn't:  state inside the component (signals, a search query).
- Refused, with a full reload (`<tag>: observed attributes changed (+size), full reload`):  anything the platform
  reads once -- observed attributes, `formAssociated`, the base class, `internals`, shadow root options.
- A render that throws shows the `fallback` and `:state(errored)`;  the next good edit clears both.
- Shared code (a changed module reaching more than one element module) reloads the page:  re-running every
  element module against a fresh copy of a base class their live instances don't extend can't work.
- `styles: { include, handler, call }`:  style modules (e.g. `?inline` CSS) self-accept and hand their new text to
  your handler instead of re-rendering anything.  `setup`:  a module every element module imports first, for a
  framework whose own `define()` needs an HMR hook (`@spell-app/ui`'s `HotDefinitions`).
- Live instances are tracked (`WeakRef`s per class) only while `import.meta.hot` exists;  without it (a build,
  a prebundled copy) `liveElements()` walks `document` and open shadow roots.
- `@solidjs/vite-plugin`'s refresh transform only wraps exported function components;  both can coexist.

## Development

`yarn tsc`, `yarn test` (Vitest browser mode, chromium), `yarn build` (`dist/index.js`, peers external;  then
`dist/vite.js`, the plugin, from `vite.node.config.ts`), `yarn lint`, `yarn format:check`, `yarn measure` (writes
`measure-results.json`).

Each fix's test file reproduces the original bug against `@solidjs/element` rc.11 + `component-register` 0.8.8
(dev dependencies, pinned) with `reproduce()`:  one observation, the original must produce the exact BUGGY
value, the fork the fixed one.  `compat.test.tsx` runs `@solidjs/element`'s own test suite and README examples
against both.

## Consuming it from `@spell-app/ui` (link)

- `"@spell-app/solid-element": "workspace:*"` in `@spell-app/ui`;  `exports` points `types` and the
  `development` condition at `src/index.ts`, so Vite dev / Vitest use the TypeScript source and no build is
  needed.  A workspace of the monorepo (`yarn fork <script>` from `packages/ui`).
- The consumer SHOULD keep `resolve.dedupe: ["solid-js", "@solidjs/web"]` (belt and braces):  inside the monorepo
  yarn hoists ONE Solid to the root (root `resolutions` pin the family), so the linked package can't pick up its own;
  outside it, the linked package would resolve its own `node_modules`, and two Solid copies can't share owners.
- For a library build, mark `@spell-app/solid-element` external alongside `solid-js` / `@solidjs/*`, or bundle it
  (it's 4 kB).
- `@spell-app/solid-element/vite` resolves to `dist/vite.js`:  Vite loads a `vite.config.ts` with every bare import
  external, so Node imports the plugin itself (and Node 22.17 can't load `.ts`).  `@spell-app/ui` sidesteps that by
  importing `./packages/solid-element/src/vite.ts` RELATIVELY (bundled into its config);  a consumer using the
  bare specifier runs `yarn build` here first.
- `@spell-app/ui`'s `yarn vendor` / `yarn measure` bundle `dist/index.js` (production condition):  its
  `tools/ForkBuild.ts` runs `yarn build` here when `dist/` is missing or stale.
