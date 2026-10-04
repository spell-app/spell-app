# Plan: Fomantic UI reborn as modern CSS + web components (`@spell-app/ui`)

## Context

- Fomantic UI has the best vocabulary of any widget set: noun-first class grammar (`ui small primary basic icon button`), the Types / Content / States / Variations taxonomy, one variables file per component, ~50 coherent components.
- But it is LESS + jQuery, predates CSS nesting, `@layer`, anchor positioning, `<dialog>`/popover, container queries, `:has()`, form-associated custom elements and ElementInternals ARIA, and its accessibility is thin.
- Semantic UI React covers the functional side for React only, is unmaintained, and misses Calendar, Slider, Toast, Flyout, Nag, Shape, Emoji, Text, form validation, API. Owen's `spell/parser` uses "Fomantic CSS + SUI React" today and it hurts.
- Goal: one self-contained package of `ui-*` custom elements on a modern CSS foundation, usable from any framework or plain HTML, accessibility built in, unit / integration / visual tests, a Fomantic-style showcase site. Design (don't build) for translated tag / attribute / value names later (`<ie-tarjeta>` for `<ui-card>`).
- `/Users/owen/www/spell/ui` is empty (only `.vscode/settings.json`), not a git repo.

## Decisions (Owen, 2026-09-28)

| Decision | Choice |
|---|---|
| Base library | **Solid 2** (decided 2026-09-30 after the Milestone 0 spike, `docs/spike-lit-vs-solid.md`):  `solid-js` / `@solidjs/web` 2.0 RC pinned exactly, through our fork `@spell-app/solid-element` (`packages/solid-element/`);  Solid, `@solidjs/web` and the fork are peer dependencies.  Promoted into `src/` 2026-09-29 (`docs/plan-promote-solid.md`, `docs/report.md`). |
| DOM strategy | **Shadow DOM everywhere** (Web Awesome style) with **semantic shadow markup** (`<button>`, `<dialog>`, `<input>`, `<nav>`, `<table>`…, never a `<div>` where an element exists). |
| Global runtime | A **shared `UI` runtime**, loaded dynamically by the first component that connects, coordinates keyboard shortcuts, overlays/modals, browser sniffing and feature flags, styles, i18n, vocabulary, and utilities. |
| Overrides | A **utility class layer** (`ui-bold`, `ui-stack`, …, modelled on Web Awesome) plus components **adopt the page's app stylesheet**: one sheet, `id="ui-app-stylesheet"`, convention over configuration, it `@import`s anything else. |
| Look | **Modernized**: keep the vocabulary, refresh the appearance (system font stack, OKLCH palette, 16px-based scale, softer radii/shadows, built-in dark mode). Visual tests use self-referential baselines. |
| Units | **Never `rem`** (the page stylesheet can redefine it). All sizes derive from a px-valued `--ui-font-size` token (default 16px) and `em` inside components. |
| Sizes | Ratios of 16, tailwind-like. `medium` is a real size that means "default" (a no-op). |
| Colours | Defined in **OKLCH**; the list is **extensible** (more hues will be added later) and translatable. |
| Booleans | Presence / `""` / `"true"` / `"yes"` = true; `"false"` / `"no"` = false. |
| Widths | Attribute is `width`, not `wide`; accepts columns (`4` of 16), fractions (`1/4`), percentages (`25%`). |
| Content parts | Generic part elements (`<ui-content>`, `<ui-header>`, `<ui-meta>`, `<ui-description>`, `<ui-extra>`, `<ui-actions>`…) style themselves by **context**, so `<ui-header>` works inside a card, an item, a modal, a message. No `ui-card-header`. |
| Chosen state | `selected` is the canonical word for "chosen" (checkbox, radio, toggle, items, tabs, options); `checked` is accepted as an alias on checkbox/radio for native muscle memory. |
| Platform | Assume anchor positioning (no JS fallback), style container queries (widely supported features only), Temporal via polyfill, customizable `<select>` with clean fallback (it only reached Safari in 27.0). |
| Libraries | `lodash-es` is fine (tree-shakes). |
| Icons | **SVG files in packs** (2026-09-30):  a pack is a folder of SVGs + a `pack.js` index;  the page's packs live in the runtime (`UI.icons`), added per subtree with `<ui-root icons>` / page-wide with `UI.icons.use()`;  the last pack added wins a name, `prefix:name` picks one.  Default pack:  **Font Awesome 7 Free** solid + regular (`bell outline`) + a few extras, shipped in `dist`;  `fa7-brands` and `fomantic` (Fomantic's names, which give Fomantic's meaning to the 27 clashes like `x`, `warning`) are opt-in packs.  One name per icon, spaces ~== dashes;  no word-order guessing.  Any folder of SVGs becomes a pack with `yarn icons:pack`.  See `docs/icons.md`. |
| Vocabulary | Per component, own file: `ui-<name>.vocabulary.en.ts` (translations become `ui-<name>.vocabulary.<lang>.ts`). Attribute **values** (colours, sizes, positions) are translatable too. |
| Docs | Base every component page on Fomantic's docs for presentation, style and content. |
| Conventions | Carry over `spell/parser`'s agentic files and coding conventions, with `$` as the import alias (see "Conventions"). |

## Research summary

### Fomantic structure (from `fomantic/Fomantic-UI` develop, 2.9.4)
- Every definition is sectioned Types → Content → States → Variations (+ Groups).
- `ui` marks a component; parts are plain classes reached only through context (`.ui.card > .content > .header`). The part names (`content`, `header`, `description`, `meta`, `extra`, `actions`, `title`, `image`, `label`) are shared vocabulary across card / item / feed / comment / modal / message / list.
- Multi-word phrases use substring selectors (`[class*="four wide"]`), so word order matters → enumerated attributes.
- `variation.variables` is the authoritative inventory of variations:
  - sizes: mini, tiny, small, medium, large, big, huge, massive
  - colours: primary, secondary, red, orange, yellow, olive, green, teal, blue, violet, purple, pink, brown, grey, black
  - states: error, info, success, warning; consequences: positive, negative
- Theming cascade: `site.variables` → `<component>.variables` → `.overrides`; default → packaged theme → site.
- Sizes are ratios of 14px; breakpoints 320 / 768 / 992 / 1200 / 1920; no global z-index scale.
- LESS features to replace:
  - 1553 `@{}` interpolations, 1406 guards, 538 `!important`
  - 233 `darken` / 148 `saturate` → relative color syntax / `color-mix()`
  - 81 `each()` loops over colours/sizes → token remap + one generic rule set
- Fomantic-only components: calendar, slider, toast, flyout, emoji, text; plus many Fomantic-only variations.
- JS that modern CSS replaces: popup/dropdown placement → anchor positioning + popover; modal/flyout/dimmer → `<dialog>` + `::backdrop`; sticky → `position: sticky`; visibility → IntersectionObserver; transition → keyframes + `@starting-style` + `allow-discrete`; accordion → `<details name>` + `::details-content`.
- A11y gaps to fix: no combobox/listbox/option roles, no tab roles, no `aria-expanded` on accordion, no `role=slider`, no `role=progressbar`, no grid on calendar, no `role=tooltip`, icons not `aria-hidden`.

### Semantic UI React (v3.0.0-beta.2, from `spell/parser/node_modules/semantic-ui-react/src`)
- Copy:
  - class builders `useKeyOnly`, `useValueAndKey`, `useKeyOrValueAndKey`, `useMultipleProp`, `useWidthProp` + `numberToWord`; fixed order `ui`, value-only props, keyOnly, keyOrValue, noun, className
  - shorthand factories: `defaultProps < user < overrideProps`; primitive→prop mapping (Icon→name, Image→src, Input→type, Button→content); children win over shorthand
  - auto-controlled values: prop if defined, else internal state; always fire the event and set
  - `getMenuOptions` (pure filter / additions logic)
  - event-stack named pools (only the top overlay handles Escape / outside click); `doesNodeContainClick` mousedown-origin check; reference-counted body classes
- Avoid: `as` prop, `(e, allProps)` handler signature, Popper + portal + z-index syncing, per-frame layout loops in Modal, build-time `handledProps`, the 1500-line Dropdown class.

### Platform (web-features 3.40.0, Sep 2026)
- Widely available: nesting, `@layer`, container size queries, `:has()`, `<dialog>`, `::backdrop`, `color-mix`, oklch, `::part`, `inert`, subgrid, Declarative Shadow DOM, form-associated custom elements, ElementInternals ARIA reflection, `adoptedStyleSheets`, `checkVisibility`, `AbortSignal.any`.
- Newly available (assume present): `@scope`, style container queries, popover + `showPopover` / `toggle` events, `@starting-style`, `allow-discrete`, `requestClose()`, relative color syntax, `light-dark()`, `@property`, `field-sizing`, `:state()`, `text-wrap: balance`, view transitions, `content-visibility`, `sibling-index()`, Invoker Commands, `scrollend`, `Intl.Segmenter`, anchor positioning (Chrome 125 / Firefox 147 / Safari 26).
- Progressive enhancement only: `popover=hint`, `closedby`, `CloseWatcher`, `hidden=until-found`, `moveBefore` (Safari); `interpolate-size`, `if()`, `@function`, scroll-state queries (Chromium only); scroll-driven animations (no Firefox stable); customizable `<select>` (Chrome 135+, Safari 27.0+, Firefox Nightly only; every `<option>` must keep real text or unsupported browsers show blanks).
- Temporal: Stage 4 (ES2026), Safari TP only → `temporal-polyfill`.
- Base libraries: Lit 3.3.3 (6 KB gzip; standard decorators need `accessor`; `@lit/react`, `@lit-labs/ssr`, `@lit-labs/virtualizer`, `@lit-labs/signals`); `@solidjs/element` 2.0.0-rc.11 on Solid 2 RC (no SSR/DSD, no formAssociated helper, empty README, duplicate-runtime context bug); TC39 Signals still Stage 1.
- Tooling: Vite 8.3, TypeScript 7.0, Vitest 5 browser mode (`@vitest/browser-playwright`, `toMatchScreenshot`), axe-core 4.13, `@custom-elements-manifest/analyzer` 0.11, Astro 7.3 (the docs site until 2026-10:  now plain HTML pages, see `site/README.md`).
- Prior art: Jack Lukic's pre-1.0 "Semantic UI Next" (signals web components + layers, stalled a year); Web Awesome 3.14 (Lit; `--wa-*` tokens, `::part`, `:state()`, utilities, native styles).

### Framework consumption contract (verified per framework)
- The contract "rich data as JS properties, primitives as reflected attributes, events as composed lowercase `ui-*` CustomEvents" holds in React 19, Vue 3.5, Svelte 5, Solid 1.9, Angular 20, Preact 10, given:
  - every rich-data key is a real accessor on the class (React, Vue, Preact use `key in el`)
  - elements are defined before the framework renders them; backstop: the "upgrade property" pattern in `connectedCallback` (delete a shadowing own property, re-set through the setter)
  - SSR drops object props (React, Preact, Solid), so first paint must not need them
- Per-framework one-liners:
  - React 19: `<ui-dropdown options={arr} value="x" open onui-change={fn} />`
  - Vue: `isCustomElement: tag => tag.startsWith("ui-")`, then `<ui-dropdown .options="arr" value="x" open @ui-change="fn">`
  - Svelte 5: `<ui-dropdown options={arr} value="x" open onui-change={fn}>`
  - Solid 2: `<ui-dropdown prop:options={arr} prop:value={v()} prop:open={o()} ref={(el) => el.addEventListener("ui-change", fn)}>`
    (Solid 2 has no `on:` / `bool:` namespaces;  see `tools/frameworks/solid/app.tsx`.  Updated 2026-10-01.)
  - Angular: `[options]="arr" (ui-change)="fn($event)"` + `CUSTOM_ELEMENTS_SCHEMA`
- Vue may send `open="false"` when the property isn't found → the boolean converter treats `"false"`/`"no"` as false.

## Conventions (carried over from `spell/parser`)

- Files to copy/adapt in Phase 0:
  - `AGENTS.md`: keep Documentation, Functions, Decorators, Types / Exports, Imports, Long-term debt verbatim (alias `$` instead of `~`); replace Overview / Parser rules with a UI overview (component anatomy, vocabulary files, runtime services, CSS layers, test layout, the rules below).
  - `CLAUDE.md` (`@AGENTS.md` include, `agents/PAPERCUTS.md`, `agents/SUSPECTED-BUGS.md`, narration rule), `.claude/settings.json`, `.claudeignore`, `.oxlintrc.json` (drop React rules), `.oxfmtrc.json`, `tsconfig.json` shape (`$/*` paths, `useDefineForClassFields: true`, strict), `vite.decorators.ts`, `src/util/decorators.ts` (`@proto`), `src/util/class.ts`.
  - Stubs: `agents/PAPERCUTS.md`, `agents/SUSPECTED-BUGS.md`, `agents/CODE-DEBT.md`.
- Rules that shape this codebase:
  - Standard TC39 decorators only, lowered by `vite.decorators.ts` (esbuild) in Vite and Vitest configs, before the Solid compiler; never `experimentalDecorators`.
  - `@proto static` installs class defaults on the prototype (non-enumerable, inherited, `protoDefined` hook) → used for vocabulary, default settings, part names, so instances carry no per-instance copies.
  - Prefer classes for coordination over loose functions: runtime services are classes (`Keyboard`, `Overlays`, `Styles`…), builders are classes (`ClassBuilder`), not bags of functions. No loose helper methods at the bottom of files; a helper that earns a name becomes a private method or a small class.
  - `type` not `interface`; one exported class per file; `<folder>.types.ts` per folder where it makes sense (`runtime.types.ts`, `elements.types.ts`, `components.types.ts`), runtime-light.
  - Barrels per folder; namespaces: `UI` = the runtime singleton (from `$/ui/runtime`), `E` = element bases (`$/ui/elements`), components barrel exports classes (`UIButton`, `UIDropdown`).
  - `$/` imports only; import order node_modules → utils → barrels → peers → side-effects → css.
  - Docstrings on types/classes/methods explaining why; `// ## Group` headers; markers NOTE / TODO / SIDE EFFECT / HACK / NEVER / MUST / DOCME.
  - oxfmt: no semicolons, double quotes, 120 cols, no trailing commas. `yarn review` = tsc + lint:fix + format + test.

## Architecture

### Repository layout
- Root: `package.json` (`@spell-app/ui`, yarn, `"type": "module"`), `vite.config.ts` (library mode, per-component entries, `css.transformer: "lightningcss"`), `vitest.config.ts` (browser mode), `tsconfig.json`, `vite.decorators.ts`, lint/format configs, agentic files.
- `src/index.ts`: registers every component (side-effect entry) + re-exports.
- `src/util/`: `decorators.ts` (`@proto`), `class.ts`, `dom.ts`, `string.ts`, `util.types.ts`.
- `src/runtime/` — the shared `UI` runtime (one instance per page: `globalThis.UI ??= new UIRuntime()`; components call `UI.load()` which dynamic-imports this chunk once):
  - `UIRuntime.ts`: singleton, `load()`, `ready` promise, service registry
  - `Browser.ts`: browser sniffing + feature flags (`supports.anchor`, `supports.baseSelect`, `supports.closedby`, `supports.popoverHint`, `isSafari`, `reducedMotion`, `touch`)
  - `Keyboard.ts`: global shortcut registry with scopes (page, overlay stack, component), `Mod+K` style parsing, conflict detection
  - `Overlays.ts`: top-layer stack with named pools (only the top overlay handles Escape / outside click), nested modals / `allowMultiple`, scroll lock, focus restore, dimmer coordination
  - `Focus.ts`: roving tabindex, focus trap helpers (for non-dialog cases), `restoreFocus`
  - `Styles.ts`: stylesheet registry (tokens, utilities, native, animations, per-component), page injection via `document.adoptedStyleSheets`, `#ui-app-stylesheet` adoption, `adoptInto(shadowRoot)`
  - `Vocabulary.ts`: registry of canonical tag / attribute / value / event / slot / part names; `defineComponents({ prefix, dictionary })`
  - `I18n.ts`: text strings with locale packs, `Intl` date/number formatting, Temporal (polyfilled)
  - `Transitions.ts`: `animate(el, name, "in" | "out")` on the keyframe catalogue, `@starting-style`, reduced motion
  - `Ids.ts`, `Toasts.ts` (`UI.toast({...})`), `Modals.ts` (`UI.modal.confirm/alert/prompt()`), `Api.ts` (fetch with URL templates, throttling, loading/error states)
  - `runtime.types.ts`, `index.ts` (`export const UI`)
- `src/elements/` — base classes:
  - `UIElement.ts`: shadow root (`delegatesFocus` per component), `attachInternals()`, sheet adoption, `emit()`, controlled properties, `:state()`s, vocabulary lookup, boolean/enum converters, upgrade-property backstop
  - `ClassBuilder.ts`: attribute kinds → canonical classes (keyOnly / valueAndKey / keyOrValueAndKey / width / multiple / textAlign / verticalAlign / size / color), `numberToWord`, fixed order
  - `ContentPart.ts`: base for generic part elements; detects its owning component on connect and exposes `:state(in-card)` etc.
  - `FormControl.ts`: `formAssociated` base (setFormValue / setValidity / reset / disabled callbacks, validation rules)
  - `OverlayElement.ts`: base for dialog- and popover-backed components
  - `elements.types.ts`, `index.ts` (`export * as E`)
- `src/styles/`: `layers.css`, `tokens.css`, `colors.css`, `sizes.css`, `reset.css`, `typography.css`, `animations.css`, `utilities.css`, `native.css`, `themes/classic.css`, `themes/dark.css`.
- `src/components/ui-<name>/`: `<name>.ts`, `ui-<name>.css`, `ui-<name>.vocabulary.en.ts`, `<name>.test.ts`, `<name>.visual.test.ts`, `ui-<name>.a11y.test.ts`, `examples/*.html`.
- `src/icons/`: FA7 Free path data as JSON chunks (+ a short Fomantic alias list).
- `site/`: the docs site (plain HTML pages on `ui-*` widgets since 2026-10;  Astro before). `docs/`: `spike-lit-vs-solid.md`, `grammar.md`, `theming.md`, `translation.md`. `test/`: shared test utils.

### CSS system
- Layers:
  - `@layer ui.reset, ui.tokens, ui.base, ui.components, ui.utilities, ui.theme, ui.app;`
  - inside `ui.components` each component declares sublayers `types, content, variations, states`, so states beat variations without `!important`.
- Units and scale:
  - `:root { --ui-font-size: 16px }` (px, never rem); every host sets `font-size` from tokens; internals use `em`
  - size tokens as ratios of 16: mini .625, tiny .75, small .875, medium 1, large 1.125, big 1.25, huge 1.5, massive 2 (tunable); `medium` emits no class
  - spacing ladder named like Web Awesome: `--ui-space-{3xs,2xs,xs,s,m,l,xl,2xl,3xl}`
- Tokens (`--ui-*`):
  - global: font stack, spacing, radii, borders, shadows, durations, breakpoints, z-index scale
  - colours in OKLCH: `--ui-red: oklch(60% 0.2 25)` …; each hue derives `-hover / -focus / -down / -active / -text / -background / -border` via relative color syntax; registered with `@property` so they animate; the hue list is data (`colors.vocabulary.en.ts`) so adding a hue means one token block + one vocabulary entry
  - dark mode via `light-dark()` under `color-scheme: light dark`; `ui-dark` / `ui-light` / `ui-invert` classes force it
  - per-component tokens (`--ui-button-padding`, …) from global tokens, one-to-one with the `.variables` files;  public and settable from outside (page, ancestor, host, `::part`):  the component root declares only a private alias (`--_ui-button-padding: var(--ui-button-padding, <default>)`) and reads that (decided 2026-09-30, `docs/theming.md` "Component tokens")
- Colour/size remap instead of loops:
  - `.ui.red.button { --ui-color: var(--ui-red); … }` once per hue, then one generic rule set consuming `--ui-color`; same for sizes via `--ui-scale`
- Class grammar kept inside shadow roots on semantic elements:
  - `<button class="ui small primary button">`, `<dialog class="ui modal">`, `<input class="…">`, `<nav class="ui breadcrumb">`, `<ul class="ui list">`
  - why: mechanical port of `.less`; override language for the app stylesheet and `::part` is the known vocabulary; translated names never touch CSS
- Context for generic parts:
  - `ContentPart` sets `:state(in-<owner>)`; each part's own CSS has `:host(:state(in-card))`, `:host(:state(in-item))`… blocks ported from Fomantic's `.ui.card > .content > .header` rules
  - owners also publish inherited tokens (`ui-segment[inverted] { --ui-inverted: 1; color-scheme: dark }`) and style container queries (`@container style(--ui-inverted: 1)`) for boolean switches
  - never `:host-context`
- `native.css` (what it is): the light-side sheet the runtime injects into the document. It styles native markup that users slot into components (`ui-table > table td`, native inputs inside `ui-form`, `ui-list > ul`), CSS-only tooltips (`[data-tooltip]`), and Web Awesome-style native element styling opt-ins. Nothing for the user to include.
- Utilities (`utilities.css`, injected globally and adopted into every shadow root; modelled on Web Awesome, token driven, size names `3xs…3xl`):
  - layout: `ui-stack`, `ui-cluster`, `ui-split` (+ `:row` / `:column`), `ui-flank` (+ `:start` / `:end`), `ui-frame` (+ `:square` / `:landscape` / `:portrait`), `ui-grid` (`--min-column-size`), `ui-span-grid`, `ui-gap-{size}`, `ui-align-items-{v}`, `ui-align-self-{v}`, `ui-justify-content-{v}`, `ui-flex-wrap` / `-nowrap`
  - sizing: `ui-w-{1/2,1/3,2/3,1/4,3/4,full,auto,fit}`, `ui-w-{size}`, `ui-h-*`, `ui-m-{size}`, `ui-p-{size}` (+ logical `-bs/-be/-is/-ie`)
  - text: `ui-body[-size]`, `ui-heading[-size]`, `ui-caption[-size]`, `ui-font-size-{size}`, `ui-font-weight-{light,normal,semibold,bold}`, `ui-bold`, `ui-italic`, `ui-muted`, `ui-text-{start,center,end,justify}`, `ui-text-{nowrap,balance,pretty,truncate}`, `ui-text-{uppercase,lowercase,capitalize}`, `ui-link`, `ui-link-plain`, `ui-list-plain`
  - colour: `ui-{hue}` (re-points generic tokens, works on wrappers), `ui-text-{hue}`, `ui-bg-{hue}`, `ui-border-{hue}`; theme: `ui-light`, `ui-dark`, `ui-invert`
  - shape: `ui-rounded-{s,m,l,pill,circle,square}`
  - misc: `ui-prose` / `ui-not-prose`, `ui-visually-hidden` (+ `-force`), `ui-cloak` (FOUCE), `ui-hidden`, `ui-block`, `ui-flex`, responsive `ui-hidden-{mobile,tablet,computer}`
- App stylesheet adoption (`#ui-app-stylesheet`):
  - `Styles` finds the single `<link>` or `<style>` with `id="ui-app-stylesheet"`, turns it into one shared constructable sheet (same-origin: copy `cssRules`; cross-origin: fetch text) and appends it to every component's `adoptedStyleSheets` last
  - `@import` inside it pulls in more; late insertion, `load` and text edits are picked up (MutationObserver + link `load`)
  - order inside a shadow root: tokens → component → utilities → app stylesheet
- Responsive: container queries inside components (grid `stackable` / `doubling`, cards, forms, tables); `@custom-media` breakpoints (Lightning CSS) for page-level ones.
- Build outputs: ESM per component with its CSS inlined as a constructable sheet; `ui.css` (tokens + utilities + native + animations) for no-runtime pages; `themes/*.css`. Budget: lazy runtime chunk < 50 KB gzip (raised from 20 KB by Owen, 2026-09-29); average component ≤ 8 KB gzip (raised from 4 KB by Owen, 2026-10-01).

### Component runtime
- `UIElement` base:
  - `connectedCallback` → `UI.load()` (first caller triggers the dynamic import; all await `UI.ready`), then adopt sheets, apply vocabulary
  - `@proto static vocabulary`, `@proto static parts`, `@proto static defaults` install per-class data on the prototype
  - attribute kinds via `ClassBuilder`: `keyOnly` (`basic`), `valueAndKey` (`floated="left"` → `left floated`), `keyOrValueAndKey` (`pointing` / `pointing="left"`), `width` (`width="4"` / `"1/4"` / `"25%"`), `multiple` (`only="mobile tablet"`), `textAlign`, `verticalAlign`, `size`, `color`
  - class order: `ui`, size, color, keyOnly (alphabetical), keyOrValue, noun; `medium` emits nothing
  - converters: booleans (`yes`/`no` accepted), enums validated against the vocabulary with a dev-time "did you mean" (Levenshtein, as in SUI React)
  - `:state()` custom states: `open`, `active`, `loading`, `disabled`, `invalid`, `selected`, `in-<owner>`
- Generic content parts (`ContentPart`): `ui-content`, `ui-header`, `ui-description`, `ui-meta`, `ui-extra`, `ui-actions`, `ui-title`, `ui-summary`, `ui-date`, `ui-author`, `ui-avatar`, `ui-detail`, `ui-value`, `ui-image`; Fomantic's `<div class="content"><div class="header">` maps 1:1 to `<ui-content><ui-header>`. Shorthand attributes on owners (`<ui-card header="…" meta="…">`, `<ui-modal header="…">`) render the same parts; slotted parts win over shorthand.
- Events: `CustomEvent`s, `bubbles: true, composed: true`, lowercase kebab names (`ui-change`, `ui-input`, `ui-open`, `ui-close` (cancelable), `ui-select`, `ui-add`, `ui-remove`, `ui-search`, `ui-approve`, `ui-deny`, `ui-show`, `ui-hide`, `ui-visible`, `ui-hidden`); `detail` carries computed state (`{ value }`, `{ selected }`, `{ open }`, `{ activeIndex }`) plus `originalEvent`. `@spell-app/ui/react` ships a typed `@lit/react` wrapper if Lit wins.
- State: `value`, `open`, `selected`, `activeIndex`, `rating`, `activePage` are auto-controlled (host-set property/attribute is authoritative, else internal); every transition dispatches its event first; cancelable ones can veto.
- Forms (`FormControl`):
  - `formAssociated`: `ui-input`, `ui-textarea`, `ui-checkbox` / `ui-radio` (standard, radio, slider, toggle), `ui-dropdown` / `ui-select`, `ui-slider`, `ui-calendar`, `ui-rating`, `ui-search`
  - `setFormValue` (multi-value via `FormData`), `setValidity` from Fomantic's rules (`notEmpty checked email url regExp minValue maxValue integer range decimal number is isExactly not notExactly contains containsExactly doesntContain doesntContainExactly minLength exactLength maxLength size match different creditCard minCount exactCount maxCount`), `:user-invalid` + `:state(invalid)`
  - `ui-form`: `rules`, `on="submit | blur | change"`, inline prompts, `errorFocus`, `preventLeaving`, events `ui-valid` / `ui-invalid` / `ui-success` / `ui-failure`; `ui-button type="submit"` calls `form.requestSubmit()`
  - `ui-select`: customizable `<select>` (`appearance: base-select`, `::picker(select)`, `<selectedcontent>`) under `@supports`, every option keeps real text so unsupported browsers degrade to the native picker
- Accessibility (roles via ElementInternals, WAI-ARIA APG patterns, semantic shadow elements do most of the work):
  - button / toggle (`aria-pressed`); combobox + listbox/option (dropdown, search)
  - dialog (`<dialog>.showModal()`: focus trap, `inert`, Escape, `::backdrop`) for modal / flyout / page dimmer
  - tabs (`tablist / tab / tabpanel`, roving tabindex); accordion (`<details name>`, `aria-expanded`)
  - menu (`<nav>` by default, `role=menubar` opt-in); slider (`role=slider`, `aria-value*`, arrows / PageUp / Home / End)
  - progress (`<progress>` / `role=progressbar`); rating (radiogroup); calendar (`role=grid`, `Intl` names)
  - tooltip / popup (`role=tooltip`, `aria-describedby`, `popover=hint` when available); toast (`role=status` / `alert`, `aria-live`)
  - breadcrumb (`<nav>` + `aria-current`); table (slotted native `<table>`; `sortable` headers get `aria-sort` + button)
  - icon `aria-hidden` unless `label`; reduced motion honoured; `UI.keyboard` scopes shortcuts to the top overlay
- Overlays (`OverlayElement` + `UI.overlays`):
  - `<dialog>` for `ui-modal`, `ui-flyout`, page `ui-dimmer`; `closedby` when supported else own handling; `requestClose()`
  - popover attribute + anchor positioning (`position-anchor`, `position-area`, `position-try-fallbacks: flip-block, flip-inline`) for `ui-popup`/tooltip, `ui-dropdown` menu, `ui-search` results, `ui-toast` container; Fomantic's 8 positions (+ 4 beside-and-aligned ones of ours) map to `position-area`; no JS positioning fallback
  - anchor and positioned element share a tree scope: dropdown/search keep both in their shadow; `ui-popup for="id"` positions its host (host carries `popover` + `position-anchor`; target gets an `anchor-name`)
- Transitions: `animations.css` ports the catalogue (fade, scale, fly, slide, swing, flip, browse, drop, zoom; flash, shake, bounce, tada, pulse, jiggle, glow); `UI.transitions` runs in/out with `@starting-style` / `allow-discrete`; `ui-transition` element for user content; View Transitions for tab/accordion swaps.
- Data-heavy components: `ui-dropdown` / `ui-select` / `ui-search` / `ui-table` accept `options` / `rows` properties; keyed rendering; virtualize above ~200 rows.
- Translation readiness (design now, build later):
  - `ui-<name>.vocabulary.en.ts` declares tag, attributes (kind + allowed values), attribute values (hues, sizes, positions, alignments), events, slots, parts, states, text strings; templates and `ClassBuilder` read names through it, never literals
  - `UI.vocabulary.defineComponents({ prefix: "ui" })` registers canonical names; a future `defineComponents({ prefix: "ie", dictionary: es })` creates subclasses with translated `attribute:` names, value maps (`rojo` → `red`), slot/event names, all mapping to the same canonical internal classes; `docs/translation.md` records the contract

## Milestone 0: base-library code spike (decides Lit vs Solid)

- Build the same two components twice on the shared foundation (tokens, `ui-button.css`, `ui-dropdown.css`, `ClassBuilder`, vocabulary files, `UI.overlays`, anchor CSS):
  - `ui-button`: types primary/secondary/basic/tertiary/icon/labeled icon/animated; states active/disabled/loading; toggle with `aria-pressed`; `type=submit`; `ui-buttons` group; semantic inner `<button>`
  - `ui-dropdown`: selection, search, multiple with labels, `options` property + slotted `ui-item`s, combobox keyboard pattern, anchor-positioned popover menu with flip, `formAssociated`, `clearable`, `allowAdditions`, 1000-option filtering
- Implementations: `spike/lit/` (lit 3.3.3, standard decorators + `accessor`) and `spike/solid/` (`@solidjs/element@next`, `solid-js@next`, `@solidjs/web@next`, pinned exact RCs).
- Measure and write `docs/spike-lit-vs-solid.md`:

| Criterion | How measured |
|---|---|
| Bundle | gzip of runtime + both components, `vite build` |
| Ergonomics | LOC; attribute typing / reflection / booleans / arrays; template readability; fit with standard decorators and `@proto` |
| Reactivity | time to filter and re-render 1000 options per keystroke; memory |
| Framework consumption | smoke pages in React 19, Vue 3, Svelte 5, Solid 1.9, vanilla using the one-liners above |
| Forms & a11y | `formAssociated`, ElementInternals, `delegatesFocus` friction |
| SSR / DSD | can we emit Declarative Shadow DOM |
| Testing | vitest browser + axe for both |
| Translation hook | register the same class under `ie-boton` with a translated attribute name and value map |
| Risk | dependency status; duplicate-runtime behaviour when the host app is Solid/React |

- Exit: recommendation with numbers; Owen picks (or accepts the recommendation). Losing spike deleted; winner's components move to `src/components/`.

## Component inventory and build order

All under `src/components/`, no Elements/Collections/Views/Modules split. Each row is one unit of work (CSS port + element(s) + a11y + tests + docs page).

- **Phase A – foundation**:
  - `icon` (SVG, FA7 names, sizes, flipped/rotated, circular/bordered, `ui-icons` group with corner)
  - `button` (+ `ui-buttons`, `ui-or`)
  - `label` (+ `ui-labels`; image/tag/corner/ribbon/pointing/floating/attached/circular/basic/detail/remove)
  - content parts (`ui-content`, `ui-header`, `ui-description`, `ui-meta`, `ui-extra`, `ui-actions`, `ui-title`, …)
  - `divider`, `segment` (+ `ui-segments`), `container`
  - `grid` (+ `ui-row`, `ui-column`; 16 columns, `width`, equal width, stackable/doubling via container queries, reversed, `only`)
  - `image` (+ `ui-images`), `text`, `flag`, `loader`, `placeholder`
  - `input` (icon/labeled/action/file/transparent/states), `checkbox` (standard/radio/slider/toggle; indeterminate; read-only; `selected`)
  - `form` (+ `ui-field`, `ui-fields`; validation engine), `message`
  - `list` (+ `ui-item`), `table`, `menu` (+ `ui-item`;  a nested `ui-menu` is the sub-menu), `breadcrumb`
- **Phase B – views & remaining static components**:
  - `card` (+ `ui-cards`), `items` view (`<ui-items>` owning the SAME generic `<ui-item>` as list / menu / dropdown -- no second item tag;  decided 2026-09-29, see `docs/grammar.md` "Items"), `feed`, `comment` (+ `ui-comments`), `statistic` (+ `ui-statistics`), `step` (+ `ui-steps`), `rail`, `reveal`, `ad`, `emoji`
- **Phase C – behaviour components**:
  - `transition`, `dimmer`
  - `popup` (CSS-only tooltip via `data-tooltip` in `native.css`; `ui-popup` with `for`, hover/click/focus/manual, 11 positions, wide/flowing/inverted/basic/colours)
  - `dropdown` (+ items/header/divider/menu; selection/search/multiple/inline/pointing/floating/button/labeled/compact/fluid/scrolling/clearable/columnar), `select` (customizable `<select>` with fallback)
  - `search` (standard/category; local `source`; remote via `UI.api`)
  - `modal` (basic/fullscreen/overlay/sizes/scrolling/close icon; approve/deny; `UI.modal.*`), `flyout`
  - `sidebar` (+ `ui-pushable` / `ui-pusher`; overlay/push/scale down/uncover/slide along/slide out; widths; four sides)
  - `accordion` (styled/fluid/inverted/tree/exclusive), `tab` (+ `ui-tabs`, `ui-tab-pane`; optional URL-hash history)
  - `progress` (indicating/active/states/attached/multiple bars/indeterminate), `rating` (partial)
  - `slider` (single/range, labeled/ticked/vertical/reversed, keyboard, `formAssociated`)
  - `calendar` (date/time/datetime/month/year; popup or inline; min/max/disabled dates; ranges; `Intl` + Temporal polyfill)
  - `toast` (positions, types, progress, actions, `UI.toast()`, `aria-live`)
  - `sticky` (`position: sticky` + `stuck` state via IntersectionObserver sentinel)
  - `embed`, `shape`, `nag`
  - `visibility` (`ui-visibility` + `UI.observeVisibility()`), `state` (behaviour util), `api` (`UI.api`)
  - `section` (ours, not Fomantic's;  added 2026-10-02):  a titled `<section>` with a real heading (`level`),
    `collapsible` (cancelable, find-in-page unfolds), `sticky` titles that stack when nested
  - source elements (ours, not Fomantic's;  added 2026-10-02, plan doc `packages/docs/content/epics/ui-import/`):  content from
    inline text or a same-origin `source` (`UI.sources`), loading / error looks, a `save()` hook (`SourceElement`):
    - `include`:  another page of the site shown here (shadow root, or light DOM with `page-styles`), `select`,
      `load="visible|idle"` (islands)
    - `code`:  highlighted code (highlight.js, lazy;  auto-detect;  `UI.code.register()` for more, spell's own),
      `line-numbers`, `wrap`, `copy`
    - `markdown`:  GitHub markdown (marked + DOMPurify, lazy), headings with GitHub ids, code blocks as `<ui-code>`
- **Phase D – site, hardening, release**: docs pages for every component (Fomantic's presentation, style and content as the model), theming guide, translation contract, kitchen sink, visual tests + cross-browser baselines for EVERY family (deferred here from each component's definition of done, Owen 2026-09-29), axe audit of every example, bundle-size report, README, CHANGELOG, npm publish dry run.

## Definition of done for a component

1. `ui-<name>.css`: complete port of the `.less` definition and `.variables` (every type/content/state/variation in `variation.variables`, Fomantic-only ones included); per-component tokens; no `!important` unless documented; colours/sizes via remap; no `rem`.
2. `ui-<name>.vocabulary.en.ts` + `<name>.ts`: element(s) with typed attributes/properties, events, slots, parts, `:state()`s, shorthand, semantic shadow markup, docstrings for the manifest.
3. Accessibility: role/ARIA via internals, keyboard per APG, focus management, reduced motion.
4. Tests: unit (class output from attributes, pure logic), integration (interaction, keyboard, events, form participation), a11y (axe on each example + keyboard walkthrough).  Visual (`toMatchScreenshot` per example, light and dark) is DEFERRED to Phase D for all families.
5. Docs page modelled on Fomantic's: Types / Content / States / Variations / Behaviour (API, events, slots, parts, tokens) / Accessibility; live examples with code panes; API tables generated from the custom-elements manifest.

## Tooling

- yarn, Node 22, TypeScript 7, Vite 8 (library mode, multiple entries, `css.transformer: "lightningcss"` with `drafts.customMedia`), `vite-plugin-dts`, `vite.decorators.ts`, `lodash-es`, `temporal-polyfill`.
- oxlint + oxfmt with Owen's config; `yarn review` = tsc + lint:fix + format + test.
- Vitest 5 browser mode + `@vitest/browser-playwright` (chromium default; webkit/firefox in `test:all`); axe-core via `test/a11y.ts`; `toMatchScreenshot` for visual.
- `@custom-elements-manifest/analyzer` → `custom-elements.json` → VS Code custom data, JetBrains web-types, JSX types (`@wc-toolkit/jsx-types`), docs API tables.
- (Superseded 2026-10 by plain HTML pages in Fomantic's docs style, epic `spell-ui-pages`.)  Astro 7 + MDX in `site/`; components loaded client-side from the built package; Fomantic-like layout (left nav by component, sticky section index, example/code toggles, theme switcher, editable playground); framework smoke pages under `site/playground`.
- `git init` at start; conventional commits; GitHub Actions later.

## Execution strategy (after approval)

1. Phase 0 scaffold – one Opus agent: package, configs, agentic files (`AGENTS.md`, `CLAUDE.md`, …), git init, `util/`, `runtime/` and `elements/` skeletons, `styles/` foundation (layers, tokens, colours, sizes, reset, animations, utilities, native, app-stylesheet adoption), test harness, Astro skeleton.
2. Milestone 0 spike – two Opus agents in parallel (Lit, Solid) on the same CSS/runtime, then one agent to measure and write the comparison. Decision checkpoint with Owen.
3. Phases A–C – dependency-ordered batches of 3–4 parallel agents (Opus for behaviour components and runtime services, Sonnet for mechanical CSS ports and docs pages), each following the definition of done; `/code-review` pass per batch.
4. Phase D – site polish, cross-browser runs, hardening.

## Verification

- `yarn review` passes (tsc, oxlint, oxfmt, vitest unit/integration/a11y in chromium).
- `yarn test:visual` passes on chromium; `yarn test:all` runs chromium + webkit + firefox.
- `yarn build` produces per-component ESM + `ui.css` within the bundle budget (size script).
- the page server serves the docs at `/ui/` (`yarn site:dev` rebuilds their bundle live); `yarn site:audit` (Playwright crawl) reports zero axe violations on every component page.
- Framework smoke pages (React 19, Vue 3, Svelte 5, Solid 1.9, vanilla) render and round-trip properties and `ui-*` events.
- Manual: keyboard-only walkthrough of dropdown, modal, tabs, calendar, slider; dark mode toggle; a `#ui-app-stylesheet` rule restyles a button inside a shadow root; utility classes apply on light and shadow elements; `<ui-header>` renders correctly standalone, in a card, in a modal; `html { font-size: 62.5% }` on the page changes nothing inside components.

## Risks and mitigations

- Anchor positioning is new in Firefox/Safari and there is no fallback by decision → document minimum browser versions (Chrome 125, Firefox 147, Safari 26).
- Safari lacks `closedby`, `popover=hint`, `CloseWatcher` → `UI.browser.supports` flags, own Escape/outside-click handling stays.
- Customizable `<select>` is Safari 27+ only → `@supports (appearance: base-select)` and real text in every option.
- Context detection for generic parts must survive moves and slotting → re-evaluate on `connectedCallback` and `slotchange`; tests for card-in-modal nesting.
- Standard decorators need the esbuild pre-pass in every config (Vite, Vitest) → one shared plugin file, smoke-tested.
- `@solidjs/element` churn during the spike → pin exact RC versions.
- Scope (~50 components) → dependency-ordered batches, strict definition of done, vocabulary files keep components uniform.
- Token budget → mechanical ports on Sonnet; reports summarized, not pasted.
