# WWOD spoke -- CSS

Styling the app's components and pages, on top of `@spell-app/ui`.  Read with `packages/agents/wwod/WWOD.md`
(the hub).
From:  original WWOD §19 ("CSS"), rewritten for plain `.css` and `@spell-app/ui`'s tokens (no Tailwind).

- `@spell-app/ui`'s own sheets (layers, tokens, units, `::part()` names):  `packages/ui/AGENTS.md` "UI rules" and
  `packages/ui/docs/theming.md`.  This spoke never restates them.
- Class attributes in JSX:  WWOD §17 and `packages/docs/content/solid/solid-2.md` "DOM and `@spell-app/ui` elements".

## 18. CSS

- **Modern CSS:**
  - Our floor:  `CSS_TARGETS` in `packages/ui/vite.config.ts` -- Chrome 125, Safari 26, Firefox 147 (anchor
    positioning everywhere).  Lightning CSS compiles FOR it;  never Vite's default targets, which lower
    `light-dark()` and break `.ui-dark` subtrees.
  - Use freely:  nesting, custom properties, `@layer`, `light-dark()`, `oklch()`, `:has()`, container queries (style
    queries too), anchor positioning, popover, `<dialog>`, `:state()`, `@custom-media` (a draft Lightning CSS
    compiles away).
  - Feature-flagged, with a fallback:  Safari's gaps (`closedby`, `popover=hint`, `CloseWatcher`, customizable
    `<select>`) through `UI.browser.supports`, NEVER a user-agent check (`packages/ui/AGENTS.md` "UI rules").
  - Don't use:  `rem` (below), `:host-context`, a bare px media query (below).
  - Adopting a feature:
    - every `CSS_TARGETS` browser supports it:  use it freely
    - one doesn't, but caniuse shows it in 90%+ of global use:  behind a `UI.browser.supports` flag, with a fallback
    - under that:  not yet

- **Plain `.css` beside its component:**
  - `<Name>.css` next to `<Name>.tsx`, imported by it (last import, WWOD §4):  `import "./InputEditor.css"`
  - native nesting and custom properties;  minimal use of preprocessor features (Lightning CSS)
    (`packages/app/AGENTS.md` "Overview")
  - it opens with a comment naming what it styles and anything surprising:  `/* Look of <FileDropdown>
    (FileDropdown.tsx) ... Hosts are display: contents:  rules reach the boxes through ::part(). */`
  - `ui`'s global sheets:  `src/styles/`, one file per axis (tokens, colours, sizes, typography, utilities), in
    `@layer` order, `layers.css` FIRST (`packages/ui/AGENTS.md` "Overview";  `layers.css`'s header)
  - TODO:  CSS in the component's own file, e.g. a `postcss`-tagged template, if VS Code still gives IntelliSense
    for it.

- **How CSS reaches a web component:**
  - A shadow root sees ONLY its own styles:  a rule a page imports never gets in.
  - `<spell-app>` / `<spell-editor>`:  importing a sheet from its component is enough.  The element build gathers
    every imported sheet into `spell-app.css`, which the element adopts into its shadow root
    (`vite.element.config.ts`, `runner/shadowStyles.ts`).
  - A `ui-*` element:  its sheet is imported `?inline` and adopted by the element itself (`./ui-button.css?inline`,
    `packages/ui/AGENTS.md` "Solid authoring").
  - From outside, a page reaches inside only through `::part()` and inherited custom properties (below).

- **Keep CSS DRY:**
  - re-skin by overriding ONE custom property, not by adding classes:  `ui`'s token remaps (`--ui-color`,
    `--ui-scale`;  `packages/ui/docs/theming.md` "Overriding colours")
  - bridge a TS constant to CSS through a custom property, never the value in both:
    ``style={{ "--TypeExplorer-indent": `${INDENT_WIDTH}px` }}``, then `var(--TypeExplorer-indent)` in the sheet
  - layout algebra in CSS (`calc()` on custom properties) over measuring in JS
  - shared spacing is one set of tokens, used everywhere:  `--spell-tight-padding` / `-normal-` / `-loose-`
    (`packages/app/src/solid/spell.css`), read by `SplitPanel.css` for padding AND the gap between panes
  - static look in the sheet;  inline `style` only for values computed per instance (a row's indent)

- **Colours and themes through `ui`'s tokens:**
  - intent tokens (`--ui-text-muted`, `--ui-surface`, `--ui-border-color`, `--ui-link`), never the raw per-scheme
    bases (`--ui-red-on-light`) and never a literal colour:  `packages/ui/docs/theming.md` "Tokens"
  - dark mode is a colour SCHEME:  `light-dark()` tokens, switched by `color-scheme`, `.ui-dark` or
    `<ui-root theme="dark">` -- never a second set of rules per scheme (`theming.md` "Overriding colours")

- **Reach into `ui-*` elements through `::part()` and tokens:**
  - many hosts are `display: contents`:  style the box through its part, `ui-dropdown.FileDropdown::part(trigger)`
    (`FileDropdown.css`), `ui-icon.order::part(icon)` (`TypeExplorer.css`), `ui-menu.PanelMenu::part(menu)`
    (`chrome.css`)
  - a page's `::part()` rule beats the element's own sheet (outer tree wins), layers or not
  - an override of `ui`'s class grammar goes in the app stylesheet, `@layer ui.app` (`theming.md` "The app
    stylesheet")
  - NEVER `:host-context`, NEVER `!important` without a comment saying why (`packages/ui/AGENTS.md` "UI rules")

- **Utilities before one-off rules:**
  - `ui`'s `ui-*` utilities (`ui-stack`, `ui-cluster`, `ui-muted`, `ui-hidden` ...) before a rule of your own:
    `packages/ui/docs/theming.md` "Utilities"
  - a new utility joins `ui`'s `utilities.css`, named in its grammar:  `ui-<property>-<modifier>`
    (`ui-text-truncate`, `ui-gap-m`), `:` for variants (`ui-split:column`)
  - `-ish` suffix ~== "looks like X but isn't one":  `ui-button-ish`, `ui-link-ish`

- **Naming:**
  - component root class = the component's name, PascalCase, on its root element:  `.TypeExplorer`, `.InputEditor`
  - sub-parts NESTED under the root class, UNPREFIXED:  `.TypeExplorer { .PaneHeader {...} .TreeRow {...} }`.
    Nesting scopes them already
  - state classes lowercase, compound on the element they describe:  `.TreeRow.selected`, `.TypeExplorer.empty`;
    in JSX, the state object (`{ selected: isSelected() }`, `{ hidden: !hasApp() }`)
  - a part is a DESCENDANT (`.TreeRow .opener`), a state a COMPOUND (`.TreeRow.selected`):  that's how a reader
    tells lowercase parts from lowercase states
  - a component's own custom properties:  `--Root-x`, declared on the root (`--TypeExplorer-indent`);  tokens the
    whole app shares carry the package prefix (`--spell-*`;  `ui`'s `--ui-*`, private `--_ui-*`)
  - global semantic classes and modifiers:  kebab-case (`.dropdown-label`, `.no-border` in `chrome.css`;  `ui`'s
    `ui-*`)
  - NOT:  `isPascalCase` state classes (`.isSelected`, `.isDragging`) -- lowercase matches `ui`'s grammar
    (`.active`, `:state(open)`) and the JSX state object
  - NOT:  `Root-part` prefixed sub-parts (`.AppDrawer-logoContainer`) -- nesting under the root already scopes them

```css
.TypeExplorer {
  display: flex;

  &.empty {
    padding: 12px;
  }

  .PaneHeader {
    display: flex;
    font-weight: bold;
  }

  .TreeRow {
    display: flex;

    .opener {
      flex: 0 0 auto;
    }

    &.selected {
      background: var(--ui-highlight);
    }
  }
}
```

- **No `rem`:**
  - lengths in `em` (local font size) or `px`, as in `ui` (`packages/ui/AGENTS.md` "UI rules", Units):  the app's
    sheets ship inside `<spell-app>` / `<spell-editor>` on other people's pages, whose root font size isn't ours

- **Check at phone width:**
  - pages, the docs and anything embeddable work at phone width (390px):  no horizontal scroll, nothing squeezed
  - breakpoints are `ui`'s `@custom-media` (`--ui-mobile`, `--ui-tablet` ...;  `packages/ui/src/styles/media.css`),
    never a bare px media query
  - the checks fail on phone-width overflow:  `packages/docs/tools/check-spell.js` (docs pages), `yarn site:check`
    (Spell UI's site)
  - NOT:  "desktop only, no mobile breakpoints" -- the docs, the Spell UI site and `<spell-app>` are read on phones
