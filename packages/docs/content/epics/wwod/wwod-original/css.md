# WWOD spoke — CSS

House rules for styling.
Read with `.agents/WWOD.md` (the hub).

## 19. CSS

- **Keep CSS DRY.**
  - Compose utilities from utilities — `@apply` inside `@utility`:
    `@utility theme-panel { @apply surface-panel shadow-panel border p-6 rounded-lg; }`.
  - Re-skin by overriding one CSS var, not by adding classes:
    `.AppShell.open { --surface-bg-drawer: var(--surface-bg-drawer-oa); }`.
  - Bridge TS constants to CSS via custom properties, never duplicate values:
    ``style={`--sidebar-item-height: ${CD.SIDEBAR.ITEM_HEIGHT}px`}`` →
    `@apply h-(--sidebar-item-height)`.
  - CSS-var layout algebra over JS measurement: `&:has(> .AppHeader) { --AppHeader-h: ... }`
    then `calc()` (`AppShell-sizes.css`).
  - Theme shared components by additive class + base: `.Table.ProjectsTable { … }`
    (`table/themes/`).
- **Global CSS lives in `src/lib/css/`**, imported by `app.css` in a strict order
  (our styles first or the web component build breaks).
  - One file per axis: `theme-colors.css` (raw palette), `theme.css` (semantic tokens +
    app-shell components), `fonts.css`, `utilities.css`, `text.css`, `buttons.css`,
    `selection.css`, `forms.css`.
  - Sizes and colors split across files by axis, not by component
    (`AppShell-sizes.css` vs `theme.css`).
  - Tailwind v4 CSS-first: no `tailwind.config.*`; `@theme`, `@utility`, `@source` in CSS.
  - Desktop only — no mobile breakpoints needed.
  - Component-adjacent `.css` imported by the component is the exception (`Circuit.css`,
    `Table.css`) — note it won't reach web components unless imported into `app.css`.
- **Colors & themes: two tiers, semantic on top.**
  - Raw brand palette in `theme-colors.css` `@theme`; semantic tokens in `theme.css` built
    with `light-dark()` from the base pair `--theme-fg`/`--theme-bg`.
  - Dark mode = `color-scheme` + `light-dark()` + a `theme-dark` class toggled from TS —
    prefer this over `dark:` variants (legacy).
  - Use intent names (`surface-panel`, `text-lighten-lg`, `--color-error-bg`), never raw
    palette vars directly: `/* NOTE: DON'T USE THESE VARS DIRECTLY, use e.g. surface-2 */`.
- **Additional Tailwind utilities via `@utility`** in `src/lib/css/`.
  - Name them in Tailwind's `property-modifier` grammar so they compose: `bg-darken-lg`,
    `fill-selected-hover`, `glow-md`; scale suffixes are TW's `xs/sm/lg/xl/2xl`.
  - `-ish` suffix = "looks like X but isn't one": `button-ish`, `link-ish`.
  - `@layer components` for named semantic classes (`.field-container`, `.button-primary`);
    `@layer base` for element resets.
- **Prefer `@apply` in Svelte `<style lang="postcss">` over long inline Tailwind strings.**
  - Open the block with `@reference "$lib/app.css"` — NOT `@reference "tailwindcss"`
    (that loses project utilities; both exist in tree, `$lib/app.css` is correct).
  - Group related `@apply` lines with a comment per group (`CircuitListItem.svelte`).
  - Inline strings are fine for short/one-off layout; use the `class={[...]}` array form
    to keep them readable and conditional.
  - `:global()` nested inside a scoped parent to reach child internals
    (`.CircuitItemList.isDragging { :global(.isMoving) { … } }`) — keeps scoping.
- **Naming conventions** (inconsistent in tree — prefer these going forward):
  - Component root class = `PascalCase` filename: `.Markdown`, `.AppDrawer`, `.CircuitItemList`.
  - Sub-parts: `Component-camelCase` (`.AppDrawer-logoContainer`, `--AppDrawer-w`);
    simple lowercase names OK inside a scoped `<style>` (`.operation`, `.title`).
  - State classes: `isPascalCase` (`.isSelected`, `.isDragging`, `.isEditing`) — defined
    globally in `selection.css`.
  - Global semantic classes/utilities: `kebab-case` (`.field-container`, `.button-group`).
  - Known inconsistencies — don't copy them: `.dragging`/`.Dragging` vs `.isDragging`,
    `.selected` vs `.isSelected`, `Circuit-Node` PascalCase sub-parts,
    `Circuit-RailSelector` vs `Circuit-Rail-Selector`, camelCase states (`.showIcon`).
