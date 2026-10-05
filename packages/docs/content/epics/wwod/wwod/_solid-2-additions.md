# Additions for `packages/docs/content/solid/solid-2.md`

Solid MECHANICS found while writing WWOD §17 (`solid.md`):  they belong in `solid-2.md`, not in house style.
P3 merges each under the section named (bullets in `solid-2.md`'s own style);  `solid.md` already cites them there.
Each says what backs it:  Solid's source (`node_modules/solid-js/dist/solid.dev.js`), its diagnostics guide
(`node_modules/solid-js/skills/reactivity-diagnostics/SKILL.md`), or code in this repo that depends on it.

## Under "Rules when writing Solid code"

### `Reads:` -- add a bullet

- a value read ONCE in a component body (a starting value, a handle):  `untrack(() => props.x)`.  It says the
  snapshot is meant, and dev's `STRICT_READ_UNTRACKED` stays quiet;  a plain `props.x` there warns.  The caller
  remounts for a new value (see `<Show keyed>` below)
  - backed by:  `SKILL.md` "STRICT_READ_UNTRACKED";  `app`'s `TypeExplorer.tsx`
    (`createSignal(untrack(() => props.state) ?? loadState())`), `SpellAppRunner.tsx`

### `Effects:` -- add after the `onSettled` bullet

- `onCleanup(fn)` runs `fn` when its OWNER is disposed:  in a component body, when the component goes.  Which one:
  - setup done in the body (a window listener, a registration):  `onCleanup` right after it
  - setup that needs the mounted DOM:  `onSettled(() => { ...; return cleanup })`.  NEVER `onCleanup` inside
    `onSettled` or `createTrackedEffect`:  return the cleanup instead (`CLEANUP_IN_FORBIDDEN_SCOPE`)
  - per-change resources:  the effect apply's return (above)
  - with no owner (module scope, a ref callback, an event handler) it NEVER runs (`NO_OWNER_CLEANUP`)
  - in a `ui` element (`keepAlive`), it runs on `dispose()`, NOT on disconnect:  page-wide teardown follows
    `connected()` (`packages/ui/AGENTS.md` "Solid authoring";  `solid-element`'s `lifecycle.ts`)
  - backed by:  `SKILL.md` "NO_OWNER_CLEANUP", "CLEANUP_IN_FORBIDDEN_SCOPE";  `app`'s `VSCodeRunner.tsx`,
    `AppRoot.tsx`, `SplitPanel.tsx`, `pages/routes.tsx`;  `ui`'s `UIRadio.tsx`

```tsx
window.addEventListener("message", onMessage)
onCleanup(() => window.removeEventListener("message", onMessage))
```

### `Errors:` -- add a sub-bullet:  the load-state ladder

- error, then loading, then loaded:  nest `<Errored>` OUTSIDE `<Loading>`, the content innermost, so an error
  replaces the whole region, spinner included
  - `<Loading>` shows its fallback on the FIRST load only;  afterwards a refresh keeps the old content -- show it's
    on the way with `isPending()` (the model, above)
  - state kept in signals (no async memo):  `<Switch>` with the error `<Match>` first, then loading, then content
  - backed by:  `app`'s `InputEditor.tsx` (`<ErrorBoundary>` > `<Loading>` > `<Show keyed>`), `LazyMonaco.tsx`
    ("Each MUST go inside a `<Loading>`")

### New bullet after `Lists:` -- `<Show keyed>`

- `<Show when>` unkeyed:  its children stay mounted while `when` stays truthy (equality is `!a === !b`);  a child
  callback gets an ACCESSOR:  `{(tree) => <Pane tree={tree()} />}`
- `<Show when keyed>`:  its children are REMADE whenever `when` changes value (`!==`), and a child callback gets the
  VALUE:  `{(copy) => <Console console={copy.console} />}`.  So it's how to remount a subtree:  `when` is a memo
  naming exactly what remakes it;  give the memo `equals` to remount only on the change that matters
- backed by:  `solid.dev.js` `Show()` (`keyed ? conditionValue : createMemo(conditionValue, { equals: (a, b) =>
  !a === !b })`);  `app`'s `InputEditor.tsx` (`key`), `TypeExplorer.tsx` (`shown`, `equals` on the path),
  `RunnerConsole.tsx` ("`console` is read ONCE:  remount for another")

```tsx
/** `{ path }` of the selected node:  a new object only when the PATH changes, so the details remount just then. */
const shown = createMemo(() => ({ path: selected()?.path }), { equals: (a, b) => a.path === b.path })

const details = (
  <Show when={shown()} keyed>
    {(current) => <ScopeDetailsPane node={nodeAt(current.path)} />}
  </Show>
)
```

### `Context:` -- add

- `useContext()` needs an OWNER:  call it in a component body (or under another owner).  At module scope it throws
  `NoOwnerError`, default or not.  App-wide singletons are module imports, not context
  - backed by:  `@solidjs/signals`' `getContext()` (`if (!owner) throw new NoOwnerError()`);  `app`'s
    `ConsoleLines.tsx` (`ConsoleInspectorContext`)

## Under "DOM and `@spell-app/ui` elements"

### First bullet (`class`) -- add the one exception

- the ONE built class string:  `@spell-app/ui`'s shadow markup, whose Fomantic class grammar needs a fixed word
  order (`[class*="four wide"]`).  `ClassBuilder` builds it from the vocabulary (`class={this.classes()}`) --
  never by hand, never in app code
  - backed by:  `packages/ui/src/elements/ClassBuilder.ts` (header), `UIButton.tsx`;  `packages/ui/AGENTS.md`
    "UI rules" (class grammar inside shadow roots)
