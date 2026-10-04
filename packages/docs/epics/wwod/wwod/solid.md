# WWOD spoke -- Solid components

House style for Solid 2 components:  the app's UI (`packages/app/src/solid/`, `runner/`, `spellEditor/`, `pages/`).
Read with `packages/agents/wwod/WWOD.md` (the hub).
From:  original WWOD §18 ("Svelte / UI"), rewritten for Solid 2 (D9).

**Solid mechanics:  READ `packages/docs/solid/solid-2.md` FIRST;  this spoke is house style on top.**
- A rule here that leans on a mechanic cites `solid-2.md`;  it never restates it.
- `@spell-app/ui`'s own elements (controller classes, `render()`):  `packages/ui/AGENTS.md` "Solid authoring".
- Styling:  WWOD §18 (`css.md`).

## 17. Solid components

- **Small one-job components, composed:**
  - one component, one job;  a parent reads as its layout:  `<InputRoot>` is `<InputToolbar>` over
    `<InputEditor>`, whose error path is `<FallbackEditor>` (`packages/app/src/solid/InputEditor.tsx`)
  - pieces several app components share live in `$/app/solid`:  `chrome.tsx`'s `<PanelMenu>` / `<Submenu>` /
    `<DropdownLabel>`;  `<TreeRow>`, shared by `<TypeExplorer>` and `<ThingExplorer>`
  - generic beyond the app (no spell, no `editor`) => a `ui-*` element in `@spell-app/ui`, written as
    `packages/ui/AGENTS.md` says;  when:  WWOD §8 › "Promotion path"
  - hosts stay thin adapters (WWOD §8 › "Hosts are thin adapters"):  the VS Code runner (`VSCodeRunner.tsx`) and
    `<spell-app>` (`SpellAppRunner.tsx`) show the SAME `<TypeExplorer>`, `<ThingExplorer>` and `<RunnerConsole>`;
    each host only feeds them (a runtime copy's objects, messages to the extension)

- **Singletons by import, per-subtree values by context:**
  - app-wide services are module imports, read where used:  `import { editor } from "$/app/editor"`, then
    `editor.file` in JSX or a `tracked()`
  - context only for a value that differs per subtree:  `ConsoleInspectorContext` (`ConsoleLines.tsx`), read with
    `useContext()` in the component body -- it needs an owner (`solid-2.md` "Rules when writing Solid code")
  - take the INSTANCE you're handed;  never reach for a parallel one, and say why in the docstring:
    `<RunnerConsole console>` shows the console it's given, NOT the imported `spellCore`'s -- every `<spell-app>`
    runs on its own runtime copy (`runner/RunnerConsole.tsx`)
  - NOT:  `getAppContext()` at module scope, destructured before props -- `useContext()` throws without an owner,
    and app singletons are imports anyway

- **Imports:**  WWOD §4 (one namespace per package, barrels, order;  the component's own `.css` last).  Plus:
  - bundles that must not pull in the editor (the runners, `<spell-app>`) import the panes' FILES, never the
    `$/app/solid` barrel, with a comment saying why (`packages/app/AGENTS.md` "Overview";  `TypeExplorer.tsx`,
    `RunnerConsole.tsx`)

- **Props:  `type <Name>Props`, read where used:**
  - one `type <Name>Props` per component, directly BELOW it (WWOD §9 › "Props types live with their class"):
    exported with an exported component, private otherwise (`ScopeTreeNodeProps`);  NEVER `interface`
  - every prop docstring'd (WWOD §6), its default stated:  `Default:  \`true\`.`
  - prop types reuse the feature's own types:  `tree?: ScopeNode` (`$/lsp`), `state?: TypeExplorerState`
    (`$/app/ui/ui.types`) -- never a parallel shape
  - a `class` prop is typed as Solid types it, so callers pass any form:
    `class: JSX.HTMLAttributes<HTMLDivElement>["class"]` (`TreeRowProps`)
  - defaults at the read:  `props.x ?? fallback` where it's used, or one accessor when several places read it;
    environment-dependent defaults the same way:  `onSaveDescription={props.readonly ? undefined : ...}`
  - NEVER destructure props:  `solid-2.md` "The model in six bullets"
  - NOT:  destructuring props with defaults (`let { block = ... }: Props = $props()`) -- it freezes each prop at its
    first value

```tsx
export function InputRoot(props: InputRootProps) {
  return (
    <div class="InputRoot">
      <Show when={props.showToolbar ?? true}>
        <InputToolbar />
      </Show>
      <InputEditor showError={editor.showError} />
    </div>
  )
}

/** Props for `<InputRoot>`. */
export type InputRootProps = {
  /** Show `<InputToolbar>` above editor.  Default:  `true`. */
  showToolbar?: boolean
}
```

- **Be deliberate about reactivity:**
  - make a value reactive only when the UI must follow it
  - a prop read ONCE (a starting value, a handle):  `untrack(() => props.x)` in the body, and its docstring says
    "read once, as it mounts";  the caller remounts for a new one (`solid-2.md` "Rules when writing Solid code").
    `createSignal(untrack(() => props.state) ?? loadState())` (`TypeExplorer.tsx`)
  - derived values:  a plain accessor by default (`const isRoot = () => props.node.kind === "root"`);
    `createMemo` only when several readers share it, it's costly, or it must cut off equal values -- with a
    docstring saying which (`currentTree`, `shown` in `TypeExplorer.tsx`).  Same trade-off as
    `derive()`:  WWOD §12 › "Derived reads are plain getters;  `@derived` only when worth it"
  - a one-line accessor (`const isOpen = () => ...`) is a VALUE, not a helper:  fine as an arrow.  Anything with a
    body is a `function` at the bottom (WWOD §9 › "Inner helpers are not inline arrows")
  - spell state:  a plain read in JSX is reactive (the bridge);  `tracked()` shares one read among readers
    (`solid-2.md` "Spell's decisions").  Read NARROW:  one `tracked()` returning just what the component shows
    (`state` in `FileDropdown.tsx`), never `tracked(() => editor)`

- **New values, never in-place changes:**
  - nothing is proxied:  a list or object changed in place notifies nobody (`solid-2.md` "Spell's decisions").
    Build the next value and set it:  `update()` and `toggled()` in `TypeExplorer.tsx`
  - data the UI must NOT follow entry by entry (caches, lookups per object) goes in a plain `Map` / `WeakMap`, with a
    comment saying so, plus ONE counter signal bumped when readers must redraw (`detailsByTree` + `loads`,
    `TypeExplorer.tsx`).  Never Things in a store (`solid-2.md` "Spell's decisions")
  - NOT:  mutating slices of deep state in place to narrow what repaints -- nothing tracks the slice

```tsx
/** Bumped as details come in, so readers of `detailsFor()` redraw -- the cache itself is a plain `Map`. */
const [loads, setLoads] = createSignal(0)
/** Details per tree -- a new tree, a new cache;  late answers for an old one land in its old cache, harmlessly. */
const detailsByTree = new WeakMap<ScopeNode, Map<string, LoadedDetails>>()

/** Change `changed` in our state, and have it remembered. */
function update(changed: TypeExplorerState) {
  const next = { ...state(), ...changed }
  setState(next)
  if (props.onStateChange) props.onStateChange(next)
  else saveState(next)
}
```

- **Events:  `onClick`, or `on()` for `ui-*`:**
  - native events:  `onClick` / `onInput` ...;  `ui-*` events:  `ref={on<Detail>("ui-change", handler)}`, `on()`
    from `$/app/solid` (`on.ts`) -- never a hand-rolled listener ref.  Why:  `solid-2.md` "DOM and
    `@spell-app/ui` elements"
  - a handler that does more than one call is a named `function` at the bottom (`choose()` in `FileDropdown.tsx`)
  - NOT:  `use:` directives (`use:activate`) -- gone in Solid 2;  a ref directive factory (`on()`) instead

- **Visibility through named accessors:**
  - `<Show when>` / `<Match when>` read a prop or a NAMED accessor;  beyond a `&&` of two named values, name it:
    `showing()` / `debugTabs()` in `SpellAppRunner.tsx`, `function`s at the bottom with a docstring each
  - optional parts:  `showX` props, defaulted at the read (`showToolbar`, `showLabel`, `showActions`)

- **Class attributes:**
  - array / object form (`solid-2.md` "DOM and `@spell-app/ui` elements"), in a fixed order:  the component's
    root class, then a caller's `props.class` or variants, then the state object:
    `class={["ScopeTreeNode", props.node.kind, { selected: isSelected() }]}`, `class={["TreeRow", props.class]}`
  - state keys lowercase (WWOD §18)

- **Render pieces as inner functions:**
  - a piece that reads the component's own state is a `function` at the BOTTOM returning JSX, after the `return`
    (WWOD §9 › "Inner helpers are not inline arrows"):  `explorer()`, `things()`, `output()`
    (`SpellAppRunner.tsx`), `memberGroup()`, `childNode()` (`TypeExplorer.tsx`).  The `return` then reads as layout
  - its own props, its own state, or a second user => a component instead
  - a long component groups them under `//// ## Group` banners (WWOD §6)
  - a JSX value made in the body is ONE set of DOM nodes:  place it once;  hide it rather than re-create it when
    what's in it must survive (`appPane` in `SpellAppRunner.tsx`:  "ALWAYS here, just hidden without an app -- so
    its mount point is never redrawn")

- **Load states:  error, then loading, then loaded:**
  - always in that order:  an error beats a spinner, a spinner beats stale content
  - async values (a memo returning a `Promise`, a lazy component):  `<ErrorBoundary>` outside `<Loading>` outside
    the content (`InputEditor.tsx`).  The ladder's mechanics:  `solid-2.md` "Rules when writing Solid code"
  - state kept in signals:  `<Switch>` with the error `<Match>` first;  a `ui-*` control's own `loading`
    attribute when it has one (`<ui-dropdown loading={!state().ready}>`, `FileDropdown.tsx`)
  - a value that arrives later:  `<Show when={loaded()} keyed>`, so the child gets the loaded value
    (`SpellAppRunner.tsx`)

- **`<ErrorBoundary>` around every region that can fail alone:**
  - every viewer of program-driven data (editors, explorers, consoles) gets one.  Why:  `REACTIVITY_HALTED`
    (`solid-2.md` "The model in six bullets")
  - the app's `<ErrorBoundary>` (`$/app/solid`, `ErrorBoundary.tsx`), not a bare `<Errored>`:  it brings the
    default `<ErrorDisplay>`, wraps non-`Error` throws, and runs `onError` outside any owner, so `onError` may write
  - `onError` reports (`editor.showError()`);  `fallback` DEGRADES rather than apologises:  `<FallbackEditor>` keeps
    editing in plain text, without the colouring that may be what threw
  - a value whose throw must show the fallback is read in JSX, not an effect's compute (`solid-2.md` "Rules when
    writing Solid code", Errors)
  - `ui` elements bring their own native fallback:  `packages/ui/AGENTS.md` "Solid authoring"

- **Remount with `<Show when={key()} keyed>`:**
  - a subtree that must start afresh when something changes (a new file's editor, a new node's details) sits under
    `<Show when={key()} keyed>`;  `key` is a memo whose docstring says EXACTLY what remakes it
  - give the memo `equals` to remount on the change that matters only:  `shown` (`TypeExplorer.tsx`) is a new object
    only when the selected PATH changes
  - mechanics (keyed vs. unkeyed, value vs. accessor):  `solid-2.md` "Rules when writing Solid code"

```tsx
function FileInputEditor() {
  const file = tracked(() => editor.file)
  /** Remakes the editor when it changes:  the file's path, or `"loading"` before there's a file. */
  const key = createMemo(() => file()?.path || "loading")
  followInitialSelection()
  return (
    <Loading fallback={<LazyMonaco.Loading />}>
      <Show when={key()} keyed>
        {(_key) => <LazyMonaco.FileEditor file={file()} onMount={didMount} onUnmount={editor.onInputWillUnmount} />}
      </Show>
    </Loading>
  )
}
```

- **Lists keyed by a stable id:**
  - `<For keyed={(child) => child.path}>` whenever items are rebuilt per change (a new tree each run):  by identity,
    every row would remount (`UNSTABLE_LIST_IDENTITY`);  identity only for fixed lists (`ORDERS`,
    `SCOPE_MEMBER_GROUPS`).  Mechanics:  `solid-2.md` "Rules when writing Solid code" (Lists)
  - recursion:  the component renders itself (`<ScopeTreeNode>` through `childNode()`)
  - an anonymous item is `it` (WWOD §9 › "`(it) =>` for an anonymous item param"):
    `{(it) => <ui-icon name={it.icon} label={it.title} ... />}`

- **Cleanup beside setup:**
  - register teardown right after what it undoes:  `window.addEventListener("message", onMessage)`, then
    `onCleanup(...)` (`VSCodeRunner.tsx`);  an effect's apply returns the cleanup for what it started
    (`SpellAppRunner.tsx`'s runtime copy)
  - a late async result checks a `gone` flag that cleanup sets:
    `loadScopes(...).then((it) => gone || setScopes(it))` (`SpellAppRunner.tsx`)
  - which hook when (`onCleanup`, `onSettled`, an effect's apply):  `solid-2.md` "Rules when writing Solid code"

- **Component docs:**
  - a `/**** ### \`<Name>\`` banner above every component (WWOD §6 › "Component banner"):  one line of what it is,
    then bullets of responsibilities
  - it says what the signature can't:  props read ONCE, `SIDE EFFECT`s (`<AppRoot>` sets `editor`'s app root),
    what the CALLER must provide (`<ui-*>` tags defined, a `<Loading>` around it), why an import skips a barrel

- **Dialogs:**
  - a message, a yes / no, or one field:  `UI.modals` through `$/app/solid/modals` (`alert()`, `confirm()`,
    `prompt()` in `dialogs.ts`), behind `editor.alert()` ...
  - per-field logic, or a body of its own:  a real component, opened by a function that mounts it, resolves a
    `Promise` with the answer and disposes it:  `<Chooser>` + `openChooser()` (`modals/Chooser.tsx`)
  - map config objects ONCE, in app code:  `dialogs.ts`'s `modalOptions()` turns the app's props into `UI.modals`'
    options for every dialog;  callers never repeat it
  - `editor` reaches the dialogs through a dynamic `import()`, so `editor.ts` stays free of Solid and `$/ui`

- **Styles:**  WWOD §18 (`css.md`).
