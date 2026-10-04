# Status

Checklist of every component in [`docs/plan.md`](plan.md), with what's done, in progress, deferred.  Kept up to date
as work lands ([AGENTS.md](../AGENTS.md)).  Last updated 2026-10-03.

## Working on now

- **Resumed 2026-10-01** in the monorepo (`packages/ui`), branch `worktree-ui-component-creation`;  plan doc
  [`packages/docs/epics/ui-component-creation/`](../../docs/epics/ui-component-creation/ui-component-creation.html):
  icon follow-ups, `SUSPECTED-BUGS.md` sweep, Owen's decisions ("To review (Owen)" below), Phase D chores.
- **`<ui-root>`** (P17-P20, 2026-10-01):  built;  P21 (D48-D50:  table `stack-by`, WebKit fixes) built;  P22 doc review done.
- **`stack-with="container | page"`** (2026-10-03, epic `spell-ui-pages` P10, D40):  grid, cards, steps, form,
  items, statistics stack by their own width (default) or the screen's;  `<ui-root stack-with>` sets the
  inherited `--ui-stack-with` for a page (tables' `stack-by` follows it too);  the docs site uses `page`.
  [`docs/theming.md`](theming.md) "Stacking".
- Every check passes after the move;  `yarn test:hmr` and `yarn site:build` needed a fix each (`PAPERCUTS.md`).
- Visual:  Mac baselines for chromium / firefox / webkit;  Linux baselines wait on a working Docker Desktop.

## Legend

✅ done · 🚧 started, not finished (in a cell:  files for that part exist;  assigned-but-unstarted stays ⬜) · ⬜ not started · 💤 deferred on purpose (see "Deferred") · — not applicable

- **Phase** = the plan's build order:  **A** foundation components, **B** views and remaining static
  components, **C** behaviour components.  Phase D (site, hardening, release) is its own table below.
- **Tests** = passing browser tests in the family folder (elements, CSS, fallback);  every family's element test runs
  axe on each `examples/elements/*.html`.
- **Size** = the family's OWN code, min + gzip kB (classes + CSS + vocabulary + fallback), from `yarn measure`;
  shared `core` (16.2 kB), `forms` (7.5 kB) and the base library are counted once per page, not here.
- **Keys** = keyboard walkthrough tests (the plan's "keyboard per APG");  "native" = the shadow markup is a native
  control (`<button>`, `<a>`) whose keyboard behaviour is the browser's.
- **Docs** = page on the docs site (`site/components/ui-<name>.html`);  ✅ links to the page.
- **Visual** = screenshot tests of every element example, light + dark ([`docs/visual-testing.md`](visual-testing.md)):
  ✅ = baselines for chromium, firefox and webkit on BOTH `linux` and `local-darwin`;  🚧 local = all three browsers
  on `local-darwin` only, `linux` missing (Docker Desktop crashes at launch on this Mac, 2026-09-30).

NOTE:  links are relative, so they work on GitHub and in VS Code.  In VS Code's Markdown preview, `.html` / source
links open in an editor tab;  `.md` links do too because `.vscode/settings.json` sets
`markdown.preview.openMarkdownLinks` to `inEditor`.

## Components

| Component | Phase | Tags | Status | Tests | Size | Keys | Docs | Visual | Notes |
|---|:-:|---|:-:|--:|--:|:-:|:-:|:-:|---|
| icon | A | `ui-icon`, `ui-icons` | ✅ | 58 | 6.33 | — | [✅](../site/components/ui-icon.html) | 🚧 local | SVG icon packs (FA7 Free default;  brands, Fomantic opt-in);  [`docs/icons.md`](icons.md) |
| button | A | `ui-button`, `ui-buttons`, `ui-or` | ✅ | 93 | 12.17 | native | [✅](../site/components/ui-button.html) | 🚧 local | `<ui-buttons equal>`:  each as wide as the widest (a grid), or with `fluid` an equal share (`width` is its count alias);  a packed `equal` group's `<ui-or>` takes a column of its own |
| label | A | `ui-label`, `ui-labels` | ✅ | 66 | 8.45 | — | [✅](../site/components/ui-label.html) | 🚧 local | |
| content parts | A | `ui-content`, `ui-header`, `ui-description`, `ui-meta`, `ui-extra`, `ui-actions`, `ui-title`, `ui-summary`, `ui-date`, `ui-author`, `ui-avatar`, `ui-detail`, `ui-value` | ✅ | 104 | 15.05 | — | [✅](../site/components/ui-header.html) | 🚧 local | styled by owner context;  a leveled `sub` header is sized as a sub header |
| divider | A | `ui-divider` | ✅ | 37 | 3.82 | — | [✅](../site/components/ui-divider.html) | 🚧 local | |
| segment | A | `ui-segment`, `ui-segments` | ✅ | 65 | 7.37 | — | [✅](../site/components/ui-segment.html) | 🚧 local | |
| container | A | `ui-container` | ✅ | 32 | 3.24 | — | [✅](../site/components/ui-container.html) | 🚧 local | |
| grid | A | `ui-grid`, `ui-row`, `ui-column` | ✅ | 77 | 7.84 | — | [✅](../site/components/ui-grid.html) | 🚧 local | stackable / doubling / per-device widths / `reversed` by container query, or the screen with `stack-with="page"` (rows and columns follow the grid) |
| image | A | `ui-image`, `ui-images` | ✅ | 57 | 5.57 | — | [✅](../site/components/ui-image.html) | 🚧 local | |
| text | A | `ui-text` | ✅ | 39 | 2.70 | — | [✅](../site/components/ui-text.html) | 🚧 local | |
| flag | A | `ui-flag` | ✅ | 45 | 6.08 | — | [✅](../site/components/ui-flag.html) | 🚧 local | |
| loader | A | `ui-loader` | ✅ | 44 | 4.26 | — | [✅](../site/components/ui-loader.html) | 🚧 local | |
| placeholder | A | `ui-placeholder` (+ `-header`, `-paragraph`, `-line`, `-image`) | ✅ | 47 | 5.90 | — | [✅](../site/components/ui-placeholder.html) | 🚧 local | |
| input | A | `ui-input`, `ui-textarea` | ✅ | 68 | 10.38 | ✅ | [✅](../site/components/ui-input.html) | 🚧 local | form-associated |
| checkbox | A | `ui-checkbox`, `ui-radio` | ✅ | 60 | 9.29 | ✅ | [✅](../site/components/ui-checkbox.html) | 🚧 local | standard / radio / slider / toggle;  `checked` aliases `selected` |
| form | A | `ui-form`, `ui-field`, `ui-fields` | ✅ | 61 | 10.59 | ✅ | [✅](../site/components/ui-form.html) | 🚧 local | Fomantic's validation rules;  rows stack by the form's width, or the screen's with `stack-with="page"`;  `<ui-fields equal>` ~== `widths="equal"` (`equal width fields`) |
| message | A | `ui-message` | ✅ | 57 | 5.68 | — | [✅](../site/components/ui-message.html) | 🚧 local | |
| item | A | `ui-item` | ✅ | 31 | 4.88 | — | [✅](../site/components/ui-item.html) | — (owners' examples) | ONE generic item for dropdown / list / menu (and the Items view);  `active` aliases `selected`;  the host's `aria-expanded` goes to a `<button>` box (a disclosure item);  the `icon` shorthand's glyph sized again (it was 0 x 0:  `> svg` missed the slot fallback, 2026-10-03) |
| list | A | `ui-list` | ✅ | 83 | 7.05 | ✅ | [✅](../site/components/ui-list.html) | 🚧 local | |
| table | A | `ui-table` | ✅ | 83 | 13.59 | ✅ | [✅](../site/components/ui-table.html) | 🚧 local | native `<table>` in light DOM;  data mode (`rows`, `columnDefs`), sorting |
| menu | A | `ui-menu` | ✅ | 94 | 10.06 | ✅ | [✅](../site/components/ui-menu.html) | 🚧 local | `<nav>` by default, `interactive` menubar;  nested `ui-menu` = sub-menu;  `appearance` (one look word;  `segmented` is ours, the booleans its aliases), `alignment` (`fluid` / `left` / `center` / `right`), `equal` (no count;  `items` its count alias) |
| breadcrumb | A | `ui-breadcrumb`, `ui-breadcrumb-section` | ✅ | 43 | 5.05 | native | [✅](../site/components/ui-breadcrumb.html) | 🚧 local | |
| card | B | `ui-card`, `ui-cards` | ✅ | 62 | 8.19 | native | [✅](../site/components/ui-card.html) | 🚧 local | `<article>`, a link card is one `<a>`;  shorthands render static parts;  a group hands its cards its variations;  `columns`, doubling / stackable by container query, or the screen with `stack-with="page"` |
| items (view) | B | `ui-items` + the generic `ui-item` | ✅ | 52 | 4.06 | native | [✅](../site/components/ui-items.html) | 🚧 local | no second item tag (decided 2026-09-29);  the item owns its parts here only (`ConditionalOwner`);  stacks by container query, or the screen with `stack-with="page"` |
| feed | B | `ui-feed`, `ui-event` | ✅ | 49 | 5.73 | — | [✅](../site/components/ui-feed.html) | 🚧 local | a list of `listitem` events;  the feed owns the parts (an event is transparent);  image / icon / text labels, ordered by CSS counters, connected |
| comment | B | `ui-comment`, `ui-comments` | ✅ | 47 | 4.44 | — | [✅](../site/components/ui-comment.html) | 🚧 local | `<article>` comments owning their parts;  a list inside a comment is its thread;  threaded, minimal (actions show on hover or focus), collapsed, `reply` slot |
| statistic | B | `ui-statistic`, `ui-statistics` | ✅ | 56 | 4.80 | — | [✅](../site/components/ui-statistic.html) | 🚧 local | value / label are the generic parts (`<ui-value>`, `<ui-label>`) or shorthands;  group `stackable` by container query, or the screen with `stack-with="page"`;  `equal`:  one row, an equal share each (`widths` its count alias) |
| step | B | `ui-step`, `ui-steps` | ✅ | 64 | 8.78 | native | [✅](../site/components/ui-step.html) | 🚧 local | `<ol>` + `listitem` steps, `aria-current="step"`;  stacks below 768px of the GROUP (container query), or of the screen with `stack-with="page"`;  circular steps too;  `active` aliases `selected`;  a step's own `color` adds `ui-<color>` (the remap needs it, no `ui`);  `equal` (as wide as the widest, or `fluid` shares;  `widths` its count alias) |
| rail | B | `ui-rail` | ✅ | 28 | 2.87 | — | [✅](../site/components/ui-rail.html) | 🚧 local | `position="left\|right"` for the side |
| reveal | B | `ui-reveal` | ✅ | 33 | 4.07 | ✅ | [✅](../site/components/ui-reveal.html) | 🚧 local | `visible` / `hidden` slots;  reveals on hover, `active` AND focus (a tab stop unless the content is focusable);  instant under reduced motion |
| ad | B | `ui-ad` | ✅ | 45 | 3.42 | — | [✅](../site/components/ui-ad.html) | 🚧 local | IAB units as `unit="medium rectangle"` |
| emoji | B | `ui-emoji` | ✅ | 32 | 4.05 | — | [✅](../site/components/ui-emoji.html) | 🚧 local | NATIVE Unicode emoji, two name sets switched like icon packs (`cldr` default, 3,979;  `fomantic`, 3,808;  `<ui-root emoji>` / `EmojiData.use()`), lazy data chunks per set (`scripts/gen-emoji.ts`), no sprites / CDN |
| dropdown | C | `ui-dropdown` (+ `ui-item`) | ✅ | 67 | 16.48 | ✅ | [✅](../site/components/ui-dropdown.html) | 🚧 local | built early, as the benchmark component |
| popup | C | `ui-popup`, `[data-tooltip]` | ✅ | 93 | 8.41 | ✅ | [✅](../site/components/ui-popup.html) | 🚧 local | popover host, CSS anchor positioning only (Fomantic's 8 positions + 4 of ours, flips);  `on` hover / focus / click / manual;  tooltip or non-modal dialog ARIA;  CSS-only tooltip in `native.css`;  a `flowing` popup drops a slotted grid's size containment |
| modal | C | `ui-modal`, `UI.modals.*` | ✅ | 68 | 8.74 | ✅ | [✅](../site/components/ui-modal.html) | 🚧 local | native `<dialog>` + `showModal()`, `::backdrop` dimmer;  `closedby`, approve / deny, `--show` invoker command;  `UI.modals.confirm/alert/prompt` |
| transition | C | `ui-transition` | ✅ | 32 | 4.90 | ✅ | [✅](../site/components/ui-transition.html) | 🚧 local | the `animations.css` catalogue through `UI.transitions`;  `visible`, host `show()` / `hide()` / `toggle()` / `transition(name)`, invoker commands;  Fomantic's queue;  reduced motion |
| dimmer | C | `ui-dimmer` | ✅ | 42 | 6.22 | ✅ | [✅](../site/components/ui-dimmer.html) | 🚧 local | element dimmer over its parent;  `page` = a MODAL `<dialog>`;  `on` hover / click (hover reachable by Tab);  `blurring` by `backdrop-filter`;  `--ui-dimmer-*` tokens shared with the modal's `::backdrop` |
| select | C | `ui-select` | ✅ | 48 | 8.10 | native | [✅](../site/components/ui-select.html) | 🚧 local | a native `<select>`:  the customizable select (`appearance: base-select`) where supported, else the plain picker in the same closed look;  groups, `multiple`, form-associated;  [`docs/grammar.md`](grammar.md) "Selects" (vs `ui-dropdown`) |
| search | C | `ui-search` | ✅ | 54 | 12.85 | ✅ | [✅](../site/components/ui-search.html) | 🚧 local | APG combobox + listbox popover (CSS anchored);  local `source` (`SearchMatcher`, Fomantic's matching) or remote `url` through `UI.api` (debounce, abort, cache);  `category`;  form-associated (the input's text) |
| flyout | C | `ui-flyout` | ✅ | 42 | 5.12 | ✅ | [✅](../site/components/ui-flyout.html) | 🚧 local | side modal on `<dialog>` + `showModal()`;  shares `<ui-modal>`'s controller (`DialogElement`, modal family);  four sides, word and column widths |
| sidebar | C | `ui-sidebar`, `ui-pushable`, `ui-pusher` | ✅ | 44 | 7.83 | ✅ | [✅](../site/components/ui-sidebar.html) | 🚧 local | Fomantic's six transitions, four sides, widths;  modal drawer (`<dialog>` + `show()`, trap, `inert` dimmed pusher) or `persistent` `<aside>`;  pusher moved by tokens |
| accordion | C | `ui-accordion` (+ `ui-title` / `ui-content` pairs) | ✅ | 58 | 7.05 | ✅ | [✅](../site/components/ui-accordion.html) | 🚧 local | native `<details name>` per pair (manual slot assignment);  `open` = panel indexes;  cancelable `ui-open` / `ui-close`;  nested takes its parent's look;  `interpolate-size` animation |
| tab | C | `ui-tabs`, `ui-tab` (the pane) | ✅ | 74 | 8.56 | ✅ | [✅](../site/components/ui-tab.html) | 🚧 local | APG tablist drawn from the panes' labels, styled by `ui-menu.css`;  `activation`, `history` (URL hash), `lazy`, `appearance` (the menu's, `segmented` included:  the docs site's page tabs are `appearance="segmented" alignment="fluid" equal`), `alignment`, `equal`, `compact`, View Transitions;  no `ui-tab-pane`:  Fomantic's `.ui.tab` IS the pane |
| progress | C | `ui-progress` | ✅ | 50 | 7.41 | — | [✅](../site/components/ui-progress.html) | 🚧 local | the host is the `progressbar` (internals);  several bars, `indicating`, indeterminate filling / sliding / swinging, auto `success` at 100% |
| rating | C | `ui-rating` | ✅ | 48 | 6.23 | ✅ | [✅](../site/components/ui-rating.html) | 🚧 local | form-associated;  native radios in a `<fieldset role=radiogroup>`;  any icon name;  partial (display) values;  `clearable` |
| slider | C | `ui-slider` | ✅ | 54 | 9.10 | ✅ | [✅](../site/components/ui-slider.html) | 🚧 local | form-associated;  APG slider thumbs, `range` (two form entries), labeled / ticked, vertical, reversed;  positions by CSS ratio |
| calendar | C | `ui-calendar` | ✅ | 64 | 15.44 | ✅ | [✅](../site/components/ui-calendar.html) | 🚧 local | form-associated;  field + popover dialog (CSS anchored) or `inline`;  APG date-picker grid over Fomantic's year / month / day / hour / minute views;  `Temporal` (native, else `temporal-polyfill` from a lazy chunk) + `Intl` names, formats, 12 / 24 h;  typed text in the locale's order;  `min` / `max`, disabled dates / weekdays, ranges;  [`docs/grammar.md`](grammar.md) "Calendars" |
| toast | C | `ui-toast`, `UI.toast()` | ✅ | 80 | 11.03 | ✅ | [✅](../site/components/ui-toast.html) | 🚧 local | in-place box, or `UI.toast()` in a popover container per position;  types / colours / inverted, icon, close icon, progress bar, countdown paused on hover / focus, actions (inline, basic, vertical, attached), `role=status` / `alert`, never takes focus |
| sticky | C | `ui-sticky` | ✅ | 30 | 3.67 | — | [✅](../site/components/ui-sticky.html) | 🚧 local | CSS `position: sticky`;  `:state(stuck)` / `:state(bound)`, `ui-stick` / `ui-unstick` from an `IntersectionObserver` on sentinels;  `offset`, `bottom-offset`, `pushing`;  while stuck, reserves its room as the scroll container's `scroll-padding-top` / `-bottom` (Page Down skips what it covers;  not columns) |
| embed | C | `ui-embed` | ✅ | 39 | 6.31 | ✅ | [✅](../site/components/ui-embed.html) | 🚧 local | play `<button>` placeholder, frame only on activation (no third-party request before);  YouTube (nocookie) / Vimeo / any http(s) `url`;  ratios, `autoplay`, focus into the frame |
| shape | C | `ui-shape`, `ui-side` | ✅ | 36 | 6.07 | — | [✅](../site/components/ui-shape.html) | 🚧 local | Fomantic's flip geometry;  `active-index`, `direction`, host `flip()` / `next()` / `previous()`, invoker commands (`--next`, `--previous`, `--flip-<direction>`);  reduced motion swaps |
| nag | C | `ui-nag` | ✅ | 42 | 6.01 | ✅ | [✅](../site/components/ui-nag.html) | 🚧 local | top / bottom, fixed / overlay;  opt-in `key` remembers the dismissal in local / session storage or a cookie, with expiry;  blocked storage tolerated;  invoker commands `--show` / `--close` / `--toggle` |
| visibility | C | `ui-visibility`, `UI.observeVisibility()` | ✅ | 19 (+8 runtime) | 3.58 | — | [✅](../site/components/ui-visibility.html) | 🚧 local | runtime service `UI.visibility` on `IntersectionObserver`:  Fomantic's callbacks, `once` / `continuous`, `offset`;  lazy images (`type="image"`, `lazyImage()`) |
| root | C | `ui-root` | ✅ | 28 | 7.05 | — | [✅](../site/components/ui-root.html) | 🚧 local | loads the families its content uses on demand (`ui-root.catalog.ts`, `yarn gen:root`), hides it until ready (`display`, `loading` message via `<ui-loader>`, `timeout`, `ui-ready` / `ui-error`), `theme` / `size` / `width` / `height` / `fixed` / `stack-with` (the inherited `--ui-stack-with`);  per-root `icons` / `emoji` / `assets` (`RootSettings`);  skeletons:  `<ui-placeholder>`s from each tag's `skeleton` (37 tags, the rest `null`);  the docs site runs on it |
| section | C | `ui-section` | ✅ | 83 | 🚧 | ✅ | [✅](../site/components/ui-section.html) | 🚧 local | ours, not Fomantic's (2026-10-02):  a `<section>` with a real `<h1>`...`<h6>` title (`level`, default the enclosing section's + 1, else 2), icon / badge / actions;  `collapsible` + controlled `collapsed` (a `<button aria-expanded>` inside the heading, cancelable `ui-open` / `ui-close`, `hidden=until-found` so find-in-page unfolds);  `sticky` titles stack when nested;  segment / header / styled-accordion looks |
| include | C | `ui-include` | ✅ | 30 | 4.34 | — | [✅](../site/components/ui-include.html) | 🚧 local | ours (2026-10-02, plan doc `epics/ui-import`):  another page of the site shown here, from a same-origin `source` (`UI.sources`);  shadow root, or light DOM with `page-styles`;  `select`;  `load="eager\|visible\|idle"` (islands);  `ui-*` families inside load on demand (`RootLoader`);  relative URLs rewritten;  scripts don't run;  cycle guard;  `content` / `save()` (a `select`ed part by its `id`) |
| code | C | `ui-code` | ✅ | 31 | 6.94 | — | [✅](../site/components/ui-code.html) | 🚧 local | ours (2026-10-02):  a code block from inline text (`<script type="text/plain">` keeps `<` / `&`) or `source`;  highlight.js in a LAZY chunk (`CodeEngine`:  core + a detect set of 9 languages, 21 more by name), `language` absent => guessed (`detectedLanguage`), `text` => plain;  `UI.code.register()` adds languages (a grammar, our own span highlighter, or `load()`);  `language="spell"` (`spell/<lang>`) colours with spell's own parser, pre-compiled (`src/languages/spell.en.js`, `yarn gen:spell`, 138 kB gz, lazy);  `line-numbers` (`start`) and `wrap` as CSS;  `copy`;  Atom One colours, AA in light mode, `--ui-code-*` tokens |
| markdown | C | `ui-markdown` | ✅ | 19 | 5.05 | — | [✅](../site/components/ui-markdown.html) | 🚧 local | ours (2026-10-02):  GitHub-flavoured markdown (tables, task lists, strikethrough, autolinks) from inline text (`<script type="text/markdown">`) or `source`;  marked + DOMPurify in a LAZY chunk (`MarkdownEngine`), sanitized in every browser unless `trusted`;  headings get GitHub's ids (`headings`, `ui-render`), `heading-offset`;  code blocks become `<ui-code copy>`;  relative links resolve beside `source`;  `#id` links scroll inside the shadow root;  task checkboxes labelled;  `size`;  `editable` (2026-10-04, markdown epic P8):  Write / Preview tabs, the preview drawn with `ui-*` elements by spell's engine (`@spell-app/markdown`'s pre-compiled bundle, `MDEngine`, its own lazy chunk), patched block by block |
| api | C | `UI.api` | ✅ | | | | ⬜ | — | runtime service;  no element |
| state | C | `ui-button` `active-text` / `inactive-text` | ✅ | 2 (in button) | — | native | ⬜ | — (in button) | Fomantic's `state` behaviour as two button attributes, not an element;  a toggle with a state text drops `aria-pressed` (APG);  [`docs/grammar.md`](grammar.md) "State" |

## Foundation

| Piece | Status | Notes |
|---|:-:|---|
| `@spell-app/solid-element` fork | ✅ | 145 tests;  upgrade, forms, lifecycle, error boundary, HMR, event-target and slot-owner fixes |
| upstream PRs for the fork | 💤 | outlined in [`packages/solid-element/UPSTREAM.md`](../packages/solid-element/UPSTREAM.md);  nothing filed without Owen's go-ahead |
| element core (`core`, `forms` entries) | ✅ | 16.2 kB + 7.5 kB |
| `UI` runtime (lazy) | ✅ | 30.9 kB (with `UI.icons`), budget < 50 kB;  [`docs/runtime.md`](runtime.md) |
| icons | ✅ | SVG packs + `UI.icons` (2026-09-30):  default pack index 14.2 kB, loaded on first icon;  `yarn icons:pack`;  [`docs/icons.md`](icons.md) |
| styles, tokens, utilities, themes | ✅ | OKLCH, `light-dark()`, contrast-picked foregrounds;  Fomantic themes in `styles/themes/` applied by `ThemeSheets.apply()` (page + every shadow root, `UI.styles` `shadow: true`) |
| native fallbacks | ✅ | every family;  [`docs/fallback.md`](fallback.md) |
| hot reload | ✅ | `yarn test:hmr` |
| framework hosts (vanilla, React, Vue, Solid 2) | ✅ | `yarn smoke`, 8 pages |
| SSR / declarative shadow DOM | ✅ | render only, no hydration |
| `@spell-app/util` (`$/util`) | ✅ | `@proto`, `class`, `string` (case, `numberToWord`, `suggest`), `dom`, `Constructor` / `Prettify`:  moved from `src/util/` to [`packages/util`](../../util/README.md) (2026-09-30), shared with `spell`;  `$/ui/util` re-exports it, bundles unchanged (`core` 14.48 kB, 54.63 kB with one button) |
| published type declarations | ✅ | fixed 2026-09-30:  `dist/index.d.ts`, `dist/core.d.ts`, `dist/components/ui-<name>/index.d.ts` ... exist as `exports` says, util's inlined in `dist/_util/`;  `yarn smoke` runs `tools/DeclarationCheck.ts`;  per-file, not rolled up (see `declarations()` in `vite.config.ts`) |

## Phase D -- site, hardening, release

| Item | Status | Notes |
|---|:-:|---|
| docs pages | ✅ | 58 pages:  every built family, plus the button page's `state` section (`active-text` / `inactive-text`).  Pages:  [accordion](../site/components/ui-accordion.html), [ad](../site/components/ui-ad.html), [breadcrumb](../site/components/ui-breadcrumb.html), [button](../site/components/ui-button.html), [calendar](../site/components/ui-calendar.html), [card](../site/components/ui-card.html), [checkbox](../site/components/ui-checkbox.html), [code](../site/components/ui-code.html), [comment](../site/components/ui-comment.html), [container](../site/components/ui-container.html), [dimmer](../site/components/ui-dimmer.html), [divider](../site/components/ui-divider.html), [dropdown](../site/components/ui-dropdown.html), [embed](../site/components/ui-embed.html), [emoji](../site/components/ui-emoji.html), [feed](../site/components/ui-feed.html), [flag](../site/components/ui-flag.html), [flyout](../site/components/ui-flyout.html), [form](../site/components/ui-form.html), [grid](../site/components/ui-grid.html), [icon](../site/components/ui-icon.html), [image](../site/components/ui-image.html), [include](../site/components/ui-include.html), [input](../site/components/ui-input.html), [item](../site/components/ui-item.html), [items](../site/components/ui-items.html), [label](../site/components/ui-label.html), [list](../site/components/ui-list.html), [loader](../site/components/ui-loader.html), [markdown](../site/components/ui-markdown.html), [menu](../site/components/ui-menu.html), [message](../site/components/ui-message.html), [modal](../site/components/ui-modal.html), [nag](../site/components/ui-nag.html), [parts](../site/components/ui-header.html), [placeholder](../site/components/ui-placeholder.html), [popup](../site/components/ui-popup.html), [progress](../site/components/ui-progress.html), [rail](../site/components/ui-rail.html), [root](../site/components/ui-root.html), [rating](../site/components/ui-rating.html), [reveal](../site/components/ui-reveal.html), [search](../site/components/ui-search.html), [section](../site/components/ui-section.html), [segment](../site/components/ui-segment.html), [select](../site/components/ui-select.html), [shape](../site/components/ui-shape.html), [sidebar](../site/components/ui-sidebar.html), [slider](../site/components/ui-slider.html), [statistic](../site/components/ui-statistic.html), [step](../site/components/ui-step.html), [sticky](../site/components/ui-sticky.html), [tab](../site/components/ui-tab.html), [table](../site/components/ui-table.html), [text](../site/components/ui-text.html), [toast](../site/components/ui-toast.html), [transition](../site/components/ui-transition.html), [visibility](../site/components/ui-visibility.html)
| docs-only elements (`src/docs-components/`) | 🚧 | epic `spell-ui-pages` (2026-10-02):  `<ui-docs-*>` families, loaded by `<ui-root>`, not in the component list (`ComponentDefinitions.docs`, topic `documentation`).  ✅ `<ui-docs-example>` (live example + its source, 21 tests + fallback + css);  ✅ `<ui-docs-api>` (a tag's / family's attributes, properties, events, slots, parts, states, texts tables;  27 tests + fallback + css);  ✅ `<ui-docs-tokens>` (a family's or the foundation's (`global`) CSS tokens, live colour swatches, optional `playground`;  35 tests + fallback + css, plus `foundation` in the site data);  ✅ `<ui-docs-themes>` (theme dropdown:  Default, Classic, every Fomantic theme, `for` filters to a family's themes;  light / dark / system buttons;  both stored per viewer through `ThemePreference`, restored by the site entry;  17 tests + fallback + css, plus `themes` in the site data from `tools/ThemeFamilies.ts`);  ✅ `<ui-docs-nav>` (the site's left sidebar, a dark `vertical inverted` `<ui-menu>`:  top links, every component A-Z or by topic, search with count, favourites, current page selected + scrolled into view, Foundation;  favourites / view / open topics stored per viewer, same keys as the Astro browser;  `ui-navigate` + `focusSearch()` / `revealCurrent()` for a page's flyout;  40 tests + fallback + css);  ✅ `<ui-docs-toc>` (a page's "On this page" rail menu:  level 2 headings as sections, examples / level 3 headings as entries, ids given where missing, follows the scroll and a `<ui-tabs>`' shown pane, shows the pane a hash names;  10 tests + fallback + css).  Site pages (P3):  template `packages/docs/templates/spell-ui-docs.html`, `yarn site:new`, `yarn site:check`, pilot `site/components/ui-button.html` |
| site data (`yarn site:data`) | ✅ | `site/_data/components.json` (every tag's vocabulary, families' tokens, topics), from the vocabularies + sheets + `site/_data/pages.json`;  committed, `tools/SiteDataBuilder.test.ts` fails while stale |
| site bundle (`yarn site:bundle`) | ✅ | `site/_assets/` (committed):  `site.js` + `site.css` (eager ~345 kB, 85 kB gz), every family a lazy chunk;  icon packs linked from `src/icons/icon-packs`;  served at `/ui/` by the page server;  `yarn site:dev` rebuilds it on every edit.  The old Astro site is deleted (epic P7, 2026-10-03) |
| theming guide | ✅ | [`site/theming.html`](../site/theming.html), [`docs/theming.md`](theming.md) |
| translation contract | ✅ | [`docs/translation.md`](translation.md) (design only) |
| kitchen sink | ✅ | [`site/kitchen-sink.html`](../site/kitchen-sink.html):  every family's main example, live, generated by `yarn site:kitchen` (2026-10-03;  an Astro page from 2026-10-01) |
| visual tests + cross-browser baselines | 🚧 | `yarn test:visual` built (Owen, 2026-09-30);  `local-darwin` baselines for all 3 browsers, every family (1,140 PNGs:  380 per browser);  `linux` baselines wait for a working Docker Desktop ([`docs/visual-testing.md`](visual-testing.md)) |
| cross-browser test runs (firefox, webkit) | ✅ | `yarn test:all` (2026-10-01, P21):  11,756 pass, 0 fail in chromium / firefox / webkit (the WebKit style-query and form-container failures fixed, D49 / D50);  test files run one at a time there (one focus per page) |
| axe audit of every example | ✅ | runs in each family's element test |
| bundle-size report | ✅ | [`docs/report.md`](report.md) (`yarn report`) |
| README | ✅ | [`README.md`](../README.md) |
| CHANGELOG | ✅ | [`CHANGELOG.md`](../CHANGELOG.md), "Unreleased";  published with the package |
| npm publish dry run | ✅ | `yarn npm publish --dry-run` (2026-10-01):  2.5 MB tarball, 2,726 files (`dist/` incl. 2,167 icon SVGs, `CHANGELOG.md`, `README.md`);  all 120 `exports` targets present |

## Deferred

Decided or knowingly left for later;  each should be picked up where noted.

- **Visual tests, `linux` baselines:**  the system is built and `local-darwin` baselines exist;  `yarn test:visual
  --os linux --update` once Docker Desktop runs (4.42.1 crashes at launch on macOS 26:  update it).
- **Custom-elements manifest:**  the plan's API tables were to come from one;  the site builds them from the
  vocabulary files instead (`<ui-docs-api>`, from `site/_data/components.json`).  Revisit in
  Phase D if a manifest is wanted for editors.
- **Upstream PRs** for the fork -- outlined only, filed only on Owen's go-ahead.
- **Translated tag sets** (`<ie-tarjeta>`) -- designed ([`docs/translation.md`](translation.md)), not built.
- **Hydration** of server-rendered elements -- SSR renders; the client re-renders.
- **List / menu:**  other components inside items (labels, buttons, inputs), Fomantic's fixed-menu examples.
- **Table:**  virtualization of large data tables, `rowspan` when counting columns.
- **Dimmer:**  built (`<ui-dimmer>`), but the modal keeps its `<dialog>::backdrop` (themed by the same
  `--ui-dimmer-*` tokens), so stacked modals each dim again -- the one shared page dimmer of Fomantic's
  (`Overlays`' "dimmer coordination" TODO) isn't built;  partial dimmers (`top / center / bottom dimmer`), Fomantic's
  `displayLoader` / `loaderText` (slot a `<ui-loader>`), `legacy`, custom scrollbars.
- **Transition:**  group animations (`interval`, `reverse` over several children), `displayType`, `onBeforeShow` /
  `onBeforeHide` hooks, start events (`onStart` / `onShow` / `onHide`:  only the end events fire).
- **Flyout:**  Fomantic's JS-built flyouts (`$.flyout({ title, content, actions })`, like `UI.modals.*`),
  `autoShow`, `keyboardShortcuts`, `.pusher` / `.fixed` pushing (a flyout always overlays;  that's `<ui-sidebar>`).
- **Sidebar:**  `exclusive` (other sidebars hiding), `returnScroll`, `scrollLock`, `.fixed` children moving with the
  pusher, `body.pushable` (a whole-page pushable is a `<ui-pushable>` of viewport height), the sidebar filling its
  height with a menu (a `<ui-menu>`'s own box can't be stretched from outside:  use `inverted` on the sidebar).
- **Shape:**  Fomantic's stage `width` / `height` settings (`next`, `auto`, px:  always `initial`), `jitter`,
  `set next side` by selector (by index only), `allowRepeats`.
- **Popup:**  Fomantic settings with no element equivalent yet -- `exclusive`, `hideOnScroll`, `offset` /
  `distanceAway`, `lastResort`, `boundary`;  `hoverable: false` (hover popups are always hoverable, WCAG 1.4.13);
  touch-specific triggers;  show / hide METHODS on the host (`open` is the API);  an arrow that follows a flip in
  browsers without anchored container queries.
- **Modal:**  `allowMultiple: false` (modals always stack), `detachable`, `observeChanges`, `blurring` / inverted
  dimmers, `legacy`;  the close icon OUTSIDE the box (the dialog clips it);  `UI.modals.*` with custom buttons
  beyond ok / cancel;  a slotted `<ui-header>` pushing past the close icon (parts don't know about it).
- **Card:**  star / like icon looks and a `.dimmer` inside cards;  a slotted `<ui-button>` / `<ui-image>` spanning
  the card's edge (no host box to widen:  use a plain `<img>` or the `image` shorthand);  spacing of paragraphs
  straight inside a `<ui-content>` (a `<ui-description>`'s are spaced);  naming the `<article>` by its header.
- **Items view:**  favorite / like icon looks;  a slotted `<img>` as a Fomantic `.image` wrapper with its own
  `<img>` inside (a wrapper can't be sized from the item:  slot the `<img>` itself).
- **Feed:**  like icons and their colours;  images inside a summary, a user or an `extra images` block (use
  `<ui-images>`);  a `<ui-label>` inside the label box;  `multiline` text labels.
- **Comment:**  the reply form's textarea height (Fomantic's 12em:  a `<ui-textarea>` sizes itself by `rows`).
- **Statistic:**  a value's `<ui-image>` sized like Fomantic's `3rem` image (only a slotted plain `<img>` gets the
  cap);  "a statistic right after another" is approximated as "not the first statistic among its siblings".
- **Step:**  circular steps' `center aligned` / `bottom aligned` content (the parts have no alignment attributes);
  RTL arrows;  an event of its own for `link` steps (the page listens for `click`).
- **Reveal:**  `ui reveal image` / `circular` couplings (put `<ui-image circular>` in each slot);  a ribbon label
  over the reveal;  detecting focusable CUSTOM elements (`<ui-button>`) in the content, which keeps the reveal's own
  tab stop.
- **Ad:**  a landmark of its own (`<aside>`):  several would share one name (axe `landmark-unique`).
- **Emoji:**  Fomantic's Twemoji SVG sprites (and an opt-in SVG set for platforms without a colour emoji font);
  `em[data-emoji]` markup;  names beyond Fomantic's 3,808 (apps use `EmojiData.register()`).
- **Select:**  the customizable picker for `multiple` (a native list box everywhere);  the dropdown's other types
  on a select (`search`, `inline`, `button`, `labeled`, `pointing`) and menu heights (`short`, `long`);
  `ui-open` / `ui-close` (a native picker has no events for them);  a rows count for `multiple`;  rich slotted
  option content (options are drawn from item DATA:  a select owns its `<option>`s).
- **Search:**  Fomantic's "view all results" `action` link, `clearable` (Escape clears), custom result templates
  (`templates`, `fields` mapping, `preserveHTML`), `onResponse` transforms, `hideDelay`, `cache: false`, the
  `searchButton`;  following a result's `url` in a new tab from the keyboard;  local searches honour no
  `search-delay` (they run per keystroke).
- **Progress:**  the `.ui.segment > .ui.attached.progress` / card coupling (an attached progress sits in the flow);
  opting out of the automatic `success` at 100% (Fomantic's `autoSuccess: false`);  Fomantic's state label texts
  (`text.active` / `success` ...) and `{bar}` names;  `increment()` / `decrement()` methods (set `value`).
- **Rating:**  Fomantic's text-shadow outline on coloured icons (an icon-font trick);  a preview of the focused point
  (the `selected` preview follows the pointer only).
- **Slider:**  `highlightRange` (active labels), thumb tooltips (`showThumbTooltip`), `restrictedLabels`, Fomantic's
  `ui label` labels, `minRange` / `maxRange`, a `label-distance` attribute (fixed at Fomantic's 100px), `ticked`
  without `labeled`;  keyboard control of a hovered but unfocused slider (Fomantic's `activateFocus`).
- **Accordion:**  the accordion menu coupling (`.ui.accordion.menu`), Fomantic's `right` dropdown icon,
  `closeNested`, `animateChildren` (content fading in), `on: "hover"` titles;  `open` / `close` / `toggle` as host
  METHODS (the controller has `toggle()`;  the page sets `open`);  titles given as Fomantic class grammar
  (`<div class="title">`) inside the element.
- **Tab:**  rich tab labels (only `label` text + `icon`:  a label lives on the pane, the tab is drawn elsewhere);
  Fomantic's remote panes (`path`, `apiSettings`, `cache`, `evaluateScripts`:  use `ui-show`'s `first`);  nested
  `history` paths (`#outer/inner`) -- two `history` tab sets on a page share one hash;  `vertical right` tabs;  a
  named View Transition for the pane area (the default crossfade runs);  switching panes in the native fallback.

- **Toast:**  Fomantic's `.ui.message` / `.ui.card` toasts, image toasts (`showImage`), the left close icon,
  `absolute` containers in an element (`context`) and full-width `attached` containers, `opacity`, showing a page's
  `<ui-toast>` in a container (Fomantic's clone), re-showing a closed toast.  KNOWN LIMIT:  while a modal `<dialog>`
  is open, everything outside it -- toast containers too -- is inert (checked in Chromium):  a toast counts down
  but can't be clicked, focused or announced;  fix by moving the container into the top modal while it's open.
- **Nag:**  the `.ui.nags` group;  `a.ui.nag` links;  Fomantic's `detachable` and `context` (the nag stays where it
  is written);  the fade animation option (always `slide-down`).
- **Sticky:**  Fomantic's `context` (stick within ANY element:  CSS sticks within the parent), `scrollContext`
  (auto-detected), a direction-aware `pushing` for content taller than the screen (CSS `top` + `bottom` instead),
  `observeChanges`, `onTop` / `onBottom` / `onReposition` / `onScroll`.
- **Visibility:**  `onPassed` percentages, `type: 'fixed'` (use `<ui-sticky>`), `includeMargin`, `refreshOnLoad`,
  `throttle`;  `continuous` / `onUpdate` fire at crossings, not every scrolled pixel;  the element measures against the
  viewport only (the service takes a `context`).
- **Calendar:**  multi-month (`multiMonth`, `monthOffset`), week numbers (`showWeekNumbers`), event dates
  (`eventDates`) and disabled-date messages as tooltips, `enabledDates`, `disabledHours`, the `isDisabled()` callback,
  `startMode`, `constantHeight: false`, `closable: false`, `on: 'focus'` (a click or ArrowDown opens:  opening on
  focus fights Tab), `centuryBreak` / `currentCentury` settings (fixed at 60 / 2000), `monthFirst` (the locale's
  order instead), custom `formatter` / `parser` functions, `touchReadonly`;  RTL arrow keys;  a range partner in
  ANOTHER tree scope;  the native fallback's `inline`, locale and range behaviour.
- **State:**  Fomantic's hover texts (`activate` / `deactivate` / `hover`:  the accessible name would change
  under the pointer), `flash`, `sync`, the API-request states and the `automatic` input / progress defaults;
  the button's native fallback shows the content instead of a state text.
- **Embed:**  `embed` / `object` children, the player API (`onPause` / `onPlay` / `onStop` were unimplemented in
  Fomantic too), `color` / `hd` player parameters, `onEmbed` rewriting parameters (use `parameters`).

## To review (Owen)

Built, but flagged for Owen's review before it's treated as settled.  Owen settled the 2026-09-30 batch on 2026-10-01
(below, "Settled");  open now:

(none)

### Settled 2026-10-01

- Table:  `stack-by="container"` (an attribute, beats the region token `--ui-table-stack-by`).  WebKit pseudo-element
  style queries:  moved off (breadcrumb divider, feed numbers and line read `var()`s their real elements set).  Form:
  the host is a block and the size container its rows stack by.  (D48-D50, built 2026-10-01;  `yarn test:all`:  no
  WebKit failures left.)
- Modal:  `closedby` stays;  `closable="false"` keeps Fomantic's meaning too (no icon AND dismissal `none`), and an
  explicit `closedby` wins for dismissal.  Also on `<ui-flyout>`.
- Invoker commands:  `<ui-button>` forwards `commandfor` / `command`;  `UI.browser.supports.invokers`;  without
  support, `Invoker.run()` runs the built-in commands and fires `command`.  Modal and flyout answer `--toggle` too;  popup and dropdown answer all three, toast `--close` (2026-10-01).
- Popup:  `hoverable` (default on, WCAG 1.4.13);  `hoverable="false"` is Fomantic's default behaviour.
- Emoji:  two name sets, never merged, switched like icon packs (`<ui-root emoji>`, `EmojiData.use()`):  `cldr`
  (default, from `emojibase-data`, dev-only) and `fomantic` (its own names and meanings:  `dog` = 🐶);  presentation
  from Unicode data.
- Label colour:  matches Fomantic -- only its own or its `<ui-labels>` group's colour paints a `<ui-label>`.
- Sidebar / flyout `width`:  Fomantic's words AND columns / fractions / % on both (`AGENTS.md` exception).
- Container:  public per-breakpoint `--ui-container-scrolling-height-{tablet,computer,widescreen}`.
- List:  first / last item padding tokens stay public.

## Budgets

- **Average component ≤ 8 kB gzip** (raised from the plan's 4 kB by Owen, 2026-10-01):  the 54 families above
  average 7.4 kB own code.  Gzipped separately, an average family is classes 3.1 kB, CSS 2.4 kB (a full port of
  Fomantic's variations), native fallback 1.7 kB, vocabulary 1.4 kB.
- Lazy runtime chunk < 50 kB gzip -- 30.9 kB.  Lazy data (emoji name chunks, both sets) 106.1 kB in all, one ~5 kB
  chunk per first letter loaded only when used;  the Temporal polyfill loads only where `Temporal` is missing.
