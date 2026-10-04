# WWOD spoke — Svelte / UI

House rules for Svelte components.
Read with `.agents/WWOD.md` (the hub); for styling read `wwod/css.md`.

## 18. Svelte / UI

- **`getAppContext()` at module scope** right after imports, destructured before props.
- **Small one-job components composed**; promote generic ones to `$lib/ui/components/`.
- **In Svelte components, OK to import as `import { T } from "$lib/feature"**, -- never a named-import list from a leaf module.
  Components are themselves "leaves" and will generally need the full system to work. (hub §4).
- **Props**:
  - inline-typed `$props()` destructure reusing feature types
    (`let { block }: P.SuccessResult = $props()`)
  - `interface Props` only for shared `$lib/ui` components
  - defaults derive from context/runtime (`interactive = runtime !== "server"`).
- **`$model` for reads; bare `model` for method calls and `use:` actions:**
- **Local derived values**:
  - `$state(untrack(() => ...))` to seed non-reactive initial state
  - `$derived` with a why-comment
  - `{@const}` inside blocks instead of extra `$derived`s if not complex and used once.
- **Be deliberate about reactivity:**
  - If a value should be computed once at initialization and NOT re-run, do NOT `$derived` it.
  - Only make things reactive when the UI actually needs to update.
- **Deep `$state`: mutate slices, never reassign wholesale** (controls repaint scope).
  - Data that must not be proxied goes in a module-level `Map` with a comment saying so
    (`CircuitDrag.types.ts`).
- **All click/keyboard activation through `use:activate={{ onActivate, … }}`**, not `onclick`.
- **Environment gating**: a block of `showX` booleans at the end of the script, one comment
  each; markup reads `{#if showX}`.
- **Class attributes in array/object form**:
  `class={["Node", $node.type, { isDragging: !!drag }]}`.
  - Bare `class:x` only for a single local boolean.
  - Tailwind: multi-line class strings, `dark:` variants inline, mixed with semantic project
    classes (`field-container`, `button-group`).
- **Named snippets as UI vocabulary:**
  - One snippet per field/hint; the layout section is pure `{@render X({…})}`.
  - Snippet groups separated by long HTML banner comments.
  - Render a page body once into a snippet, `{@render Body()}` from each branch.
- **Load states**: fixed `loadError → isLoading → isLoaded` ladder.
- **Wrap every independently failable region in `<ErrorBoundary component="X" …>`:**
- **`{#key model.renderKey}` remounts subtrees**; the `renderKey` getter documents exactly
  what invalidates it.
- **`{#each}` always keyed** (composite keys for connectors); components self-import for
  recursion.
- **Cleanup**: `onMount` returns the unsubscribe; `$effect` returns listener teardown.
- **Take the shared helper INSTANCE from context; don't construct a parallel one:**
  `new ElementTracker(onChange, tours?.elementRoot)`, so the component measures against the
  same (possibly shadow) root the app resolved against -- with a comment saying why.
- **Component docs**: `<!-- @component -->` block between `</script>` and markup, as
  responsibility bullets. Copyright header inside `<script lang="ts">`.
- **Styles**: see `wwod/css.md`.
- **Circuit: Data-driven SVG**: models return descriptor objects `{ KEY, TYPE, …props }` rendered
  through a `COMPONENT_LOOKUP`.
  - SHOUTED prop names (`KEY`/`TYPE`/`BOUNDARY`) mark framework plumbing.
  - Descriptor types derive from the components themselves
    (`type NodeProps = ComponentProps<typeof Node>`), shared via `<script module>`.
  - Rendered SVG carries semantic `part:` attributes; non-exportable chrome gets
    `data-export="false"`.
- **Dialogs as real components** passed via `showModal({ component, componentProps })`.
  - Only use `fields: []` if there is no per-field logic.
  - Build config-object UIs once in app code rather than repeating.
