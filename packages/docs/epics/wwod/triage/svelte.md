# WWOD spoke — Svelte / UI

House rules for Svelte components.
Read with `.agents/WWOD.md` (the hub); for styling read `wwod/css.md`.

## 18. Svelte / UI

- [SOLID:  useContext needs an owner;  singletons are module imports] **`getAppContext()` at module scope** right after imports, destructured before props.
- [ADAPT:  $lib/ui/components → $/app/solid, or a ui-* element] **Small one-job components composed**; promote generic ones to `$lib/ui/components/`.
- [HAVE → AGENTS.md "Imports"] **In Svelte components, OK to import as `import { T } from "$lib/feature"**, -- never a named-import list from a leaf module.
  Components are themselves "leaves" and will generally need the full system to work. (hub §4).
- [SOLID:  NEVER destructure props;  read props.x where used] **Props**:
  - inline-typed `$props()` destructure reusing feature types
    (`let { block }: P.SuccessResult = $props()`)
  - [ADAPT:  a type <Name>Props per component, never interface] `interface Props` only for shared `$lib/ui` components
  - [ADAPT:  default at the read:  props.x ?? fallback] defaults derive from context/runtime (`interactive = runtime !== "server"`).
- [DROP:  Svelte store sugar;  spell cells read plainly in JSX] **`$model` for reads; bare `model` for method calls and `use:` actions:**
- [ADAPT:  $derived → createMemo / plain accessor] **Local derived values**:
  - [HAVE → packages/ui/AGENTS.md "Solid authoring"] `$state(untrack(() => ...))` to seed non-reactive initial state
  - `$derived` with a why-comment
  - [DROP:  Svelte-only;  a local const in the callback] `{@const}` inside blocks instead of extra `$derived`s if not complex and used once.
- [ADOPT] **Be deliberate about reactivity:**
  - [ADAPT:  read once:  untrack(() => props.x) in the body, no memo] If a value should be computed once at initialization and NOT re-run, do NOT `$derived` it.
  - Only make things reactive when the UI actually needs to update.
- [SOLID:  in-place changes notify nobody;  set a new value] **Deep `$state`: mutate slices, never reassign wholesale** (controls repaint scope).
  - [ADAPT:  plain Map / WeakMap, never a store (solid-2.md:145)] Data that must not be proxied goes in a module-level `Map` with a comment saying so
    (`CircuitDrag.types.ts`).
- [SOLID:  no use: directives;  onClick, or a ref directive] **All click/keyboard activation through `use:activate={{ onActivate, … }}`**, not `onclick`.
- [ADAPT:  showX flags → accessors, const showX = () => ...] **Environment gating**: a block of `showX` booleans at the end of the script, one comment
  each; markup reads `{#if showX}`.
- [HAVE → packages/docs/solid/solid-2.md:248] **Class attributes in array/object form**:
  `class={["Node", $node.type, { isDragging: !!drag }]}`.
  - [SOLID:  no class:x / classList;  the object form] Bare `class:x` only for a single local boolean.
  - [DROP:  no Tailwind] Tailwind: multi-line class strings, `dark:` variants inline, mixed with semantic project
    classes (`field-container`, `button-group`).
- [ADAPT:  snippets → inner functions / components returning JSX] **Named snippets as UI vocabulary:**
  - One snippet per field/hint; the layout section is pure `{@render X({…})}`.
  - [ADAPT:  HTML banners → AGENTS.md "//// ## Group" banners] Snippet groups separated by long HTML banner comments.
  - Render a page body once into a snippet, `{@render Body()}` from each branch.
- [ADAPT:  <Errored> / <Loading>, or Switch / Match on signals] **Load states**: fixed `loadError → isLoading → isLoaded` ladder.
- [ADAPT:  app's <ErrorBoundary> on <Errored> (solid-2.md:203)] **Wrap every independently failable region in `<ErrorBoundary component="X" …>`:**
- [ADAPT:  <Show when={key()} keyed> (InputEditor.tsx)] **`{#key model.renderKey}` remounts subtrees**; the `renderKey` getter documents exactly
  what invalidates it.
- [HAVE → packages/docs/solid/solid-2.md:208] **`{#each}` always keyed** (composite keys for connectors); components self-import for
  recursion.
- [HAVE → packages/docs/solid/solid-2.md:197-199] **Cleanup**: `onMount` returns the unsubscribe; `$effect` returns listener teardown.
- [ADAPT:  from context or a module import, e.g. spellCore.domRoot()] **Take the shared helper INSTANCE from context; don't construct a parallel one:**
  `new ElementTracker(onChange, tours?.elementRoot)`, so the component measures against the
  same (possibly shadow) root the app resolved against -- with a comment saying why.
- [CONFLICT → D8h:  /**** ### `<Name>` banner above the function] **Component docs**: `<!-- @component -->` block between `</script>` and markup, as
  responsibility bullets. Copyright header inside `<script lang="ts">`.
- [ADOPT] **Styles**: see `wwod/css.md`.
- [DROP:  Circuit (construct-app)] **Circuit: Data-driven SVG**: models return descriptor objects `{ KEY, TYPE, …props }` rendered
  through a `COMPONENT_LOOKUP`.
  - SHOUTED prop names (`KEY`/`TYPE`/`BOUNDARY`) mark framework plumbing.
  - Descriptor types derive from the components themselves
    (`type NodeProps = ComponentProps<typeof Node>`), shared via `<script module>`.
  - Rendered SVG carries semantic `part:` attributes; non-exportable chrome gets
    `data-export="false"`.
- [ADAPT:  UI.modals, or a component like <Chooser> (openChooser())] **Dialogs as real components** passed via `showModal({ component, componentProps })`.
  - [ADAPT:  UI.modals.prompt() only when no per-field logic] Only use `fields: []` if there is no per-field logic.
  - [ADOPT] Build config-object UIs once in app code rather than repeating.
