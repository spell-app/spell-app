# WWOD spoke — CSS

House rules for styling.
Read with `.agents/WWOD.md` (the hub).

## 19. CSS

- [ADOPT] **Keep CSS DRY.**
  - [DROP:  Tailwind @apply / @utility] Compose utilities from utilities — `@apply` inside `@utility`:
    `@utility theme-panel { @apply surface-panel shadow-panel border p-6 rounded-lg; }`.
  - [HAVE → packages/ui/AGENTS.md "UI rules"] Re-skin by overriding one CSS var, not by adding classes:
    `.AppShell.open { --surface-bg-drawer: var(--surface-bg-drawer-oa); }`.
  - [ADAPT:  style={{ "--x": ... }} + var(--x);  no @apply] Bridge TS constants to CSS via custom properties, never duplicate values:
    ``style={`--sidebar-item-height: ${CD.SIDEBAR.ITEM_HEIGHT}px`}`` →
    `@apply h-(--sidebar-item-height)`.
  - CSS-var layout algebra over JS measurement: `&:has(> .AppHeader) { --AppHeader-h: ... }`
    then `calc()` (`AppShell-sizes.css`).
  - [ADAPT:  ui-* elements:  tokens / ::part() (FileDropdown.css)] Theme shared components by additive class + base: `.Table.ProjectsTable { … }`
    (`table/themes/`).
- [ADAPT:  ui:  src/styles/ in @layer order;  app:  plain .css] **Global CSS lives in `src/lib/css/`**, imported by `app.css` in a strict order
  (our styles first or the web component build breaks).
  - [HAVE → packages/ui/AGENTS.md "Overview" (src/styles/)] One file per axis: `theme-colors.css` (raw palette), `theme.css` (semantic tokens +
    app-shell components), `fonts.css`, `utilities.css`, `text.css`, `buttons.css`,
    `selection.css`, `forms.css`.
  - [HAVE → packages/ui/AGENTS.md "Overview" (src/styles/)] Sizes and colors split across files by axis, not by component
    (`AppShell-sizes.css` vs `theme.css`).
  - [DROP:  no Tailwind] Tailwind v4 CSS-first: no `tailwind.config.*`; `@theme`, `@utility`, `@source` in CSS.
  - [CONFLICT → D8j:  phone-width checks stay] Desktop only — no mobile breakpoints needed.
  - [ADAPT:  the norm here:  <Name>.css beside <Name>.tsx] Component-adjacent `.css` imported by the component is the exception (`Circuit.css`,
    `Table.css`) — note it won't reach web components unless imported into `app.css`.
- [HAVE → packages/ui/docs/theming.md "Tokens"] **Colors & themes: two tiers, semantic on top.**
  - Raw brand palette in `theme-colors.css` `@theme`; semantic tokens in `theme.css` built
    with `light-dark()` from the base pair `--theme-fg`/`--theme-bg`.
  - [ADAPT:  theme-dark → .ui-dark / <ui-root theme="dark">] Dark mode = `color-scheme` + `light-dark()` + a `theme-dark` class toggled from TS —
    prefer this over `dark:` variants (legacy).
  - [ADAPT:  intent tokens (--ui-text-muted, --ui-surface ...)] Use intent names (`surface-panel`, `text-lighten-lg`, `--color-error-bg`), never raw
    palette vars directly: `/* NOTE: DON'T USE THESE VARS DIRECTLY, use e.g. surface-2 */`.
- [DROP:  no Tailwind] **Additional Tailwind utilities via `@utility`** in `src/lib/css/`.
  - [ADAPT:  ui-* names, theming.md "Utilities" grammar] Name them in Tailwind's `property-modifier` grammar so they compose: `bg-darken-lg`,
    `fill-selected-hover`, `glow-md`; scale suffixes are TW's `xs/sm/lg/xl/2xl`.
  - [ADOPT] `-ish` suffix = "looks like X but isn't one": `button-ish`, `link-ish`.
  - [HAVE → packages/ui/AGENTS.md "UI rules" (ui.* layers)] `@layer components` for named semantic classes (`.field-container`, `.button-primary`);
    `@layer base` for element resets.
- [DROP:  Svelte <style> + Tailwind @apply] **Prefer `@apply` in Svelte `<style lang="postcss">` over long inline Tailwind strings.**
  - Open the block with `@reference "$lib/app.css"` — NOT `@reference "tailwindcss"`
    (that loses project utilities; both exist in tree, `$lib/app.css` is correct).
  - Group related `@apply` lines with a comment per group (`CircuitListItem.svelte`).
  - [HAVE → packages/docs/solid/solid-2.md:248] Inline strings are fine for short/one-off layout; use the `class={[...]}` array form
    to keep them readable and conditional.
  - [ADAPT:  nest under the root class;  ::part() into ui-*] `:global()` nested inside a scoped parent to reach child internals
    (`.CircuitItemList.isDragging { :global(.isMoving) { … } }`) — keeps scoping.
- [ADOPT] **Naming conventions** (inconsistent in tree — prefer these going forward):
  - Component root class = `PascalCase` filename: `.Markdown`, `.AppDrawer`, `.CircuitItemList`.
  - [ADAPT:  parts nested under the root class (.TypeExplorer .PaneHeader)] Sub-parts: `Component-camelCase` (`.AppDrawer-logoContainer`, `--AppDrawer-w`);
    simple lowercase names OK inside a scoped `<style>` (`.operation`, `.title`).
  - [CONFLICT → D8e:  lowercase state classes (.Row.selected)] State classes: `isPascalCase` (`.isSelected`, `.isDragging`, `.isEditing`) — defined
    globally in `selection.css`.
  - [HAVE → packages/ui/docs/theming.md "Utilities"] Global semantic classes/utilities: `kebab-case` (`.field-container`, `.button-group`).
  - [DROP:  construct-app's tree] Known inconsistencies — don't copy them: `.dragging`/`.Dragging` vs `.isDragging`,
    `.selected` vs `.isSelected`, `Circuit-Node` PascalCase sub-parts,
    `Circuit-RailSelector` vs `Circuit-Rail-Selector`, camelCase states (`.showIcon`).
