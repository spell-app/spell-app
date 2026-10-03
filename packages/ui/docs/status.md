# Status

Checklist of every component in [`docs/plan.md`](plan.md), with what's done, in progress, deferred.  Kept up to date
as work lands ([AGENTS.md](../AGENTS.md)).  Last updated 2026-10-02.

## Working on now

- **Resumed 2026-10-01** in the monorepo (`packages/ui`), branch `worktree-ui-component-creation`;  plan doc
  [`packages/docs/epics/ui-component-creation/`](../../docs/epics/ui-component-creation/ui-component-creation.html):
  icon follow-ups, `SUSPECTED-BUGS.md` sweep, Owen's decisions ("To review (Owen)" below), Phase D chores.
- **`<ui-root>`** (P17-P20, 2026-10-01):  built;  P21 (D48-D50:  table `stack-by`, WebKit fixes) built;  P22 doc review done.
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
- **Docs** = page on the Astro site (`site/src/content/components/`);  ✅ links to the page's source.
- **Visual** = screenshot tests of every element example, light + dark ([`docs/visual-testing.md`](visual-testing.md)):
  ✅ = baselines for chromium, firefox and webkit on BOTH `linux` and `local-darwin`;  🚧 local = all three browsers
  on `local-darwin` only, `linux` missing (Docker Desktop crashes at launch on this Mac, 2026-09-30).

NOTE:  links are relative, so they work on GitHub and in VS Code.  In VS Code's Markdown preview, `.mdx` / source
links open in an editor tab;  `.md` links do too because `.vscode/settings.json` sets
`markdown.preview.openMarkdownLinks` to `inEditor`.

## Components

| Component | Phase | Tags | Status | Tests | Size | Keys | Docs | Visual | Notes |
|---|:-:|---|:-:|--:|--:|:-:|:-:|:-:|---|
| icon | A | `ui-icon`, `ui-icons` | ✅ | 58 | 6.33 | — | [✅](../site/src/content/components/ui-icon.mdx) | 🚧 local | SVG icon packs (FA7 Free default;  brands, Fomantic opt-in);  [`docs/icons.md`](icons.md) |
| button | A | `ui-button`, `ui-buttons`, `ui-or` | ✅ | 90 | 12.17 | native | [✅](../site/src/content/components/ui-button.mdx) | 🚧 local | |
| label | A | `ui-label`, `ui-labels` | ✅ | 66 | 8.45 | — | [✅](../site/src/content/components/ui-label.mdx) | 🚧 local | |
| content parts | A | `ui-content`, `ui-header`, `ui-description`, `ui-meta`, `ui-extra`, `ui-actions`, `ui-title`, `ui-summary`, `ui-date`, `ui-author`, `ui-avatar`, `ui-detail`, `ui-value` | ✅ | 103 | 15.05 | — | [✅](../site/src/content/components/ui-parts.mdx) | 🚧 local | styled by owner context |
| divider | A | `ui-divider` | ✅ | 37 | 3.82 | — | [✅](../site/src/content/components/ui-divider.mdx) | 🚧 local | |
| segment | A | `ui-segment`, `ui-segments` | ✅ | 65 | 7.37 | — | [✅](../site/src/content/components/ui-segment.mdx) | 🚧 local | |
| container | A | `ui-container` | ✅ | 32 | 3.24 | — | [✅](../site/src/content/components/ui-container.mdx) | 🚧 local | |
| grid | A | `ui-grid`, `ui-row`, `ui-column` | ✅ | 77 | 7.84 | — | [✅](../site/src/content/components/ui-grid.mdx) | 🚧 local | stackable / doubling by container query |
| image | A | `ui-image`, `ui-images` | ✅ | 57 | 5.57 | — | [✅](../site/src/content/components/ui-image.mdx) | 🚧 local | |
| text | A | `ui-text` | ✅ | 39 | 2.70 | — | [✅](../site/src/content/components/ui-text.mdx) | 🚧 local | |
| flag | A | `ui-flag` | ✅ | 45 | 6.08 | — | [✅](../site/src/content/components/ui-flag.mdx) | 🚧 local | |
| loader | A | `ui-loader` | ✅ | 44 | 4.26 | — | [✅](../site/src/content/components/ui-loader.mdx) | 🚧 local | |
| placeholder | A | `ui-placeholder` (+ `-header`, `-paragraph`, `-line`, `-image`) | ✅ | 47 | 5.90 | — | [✅](../site/src/content/components/ui-placeholder.mdx) | 🚧 local | |
| input | A | `ui-input`, `ui-textarea` | ✅ | 68 | 10.38 | ✅ | [✅](../site/src/content/components/ui-input.mdx) | 🚧 local | form-associated |
| checkbox | A | `ui-checkbox`, `ui-radio` | ✅ | 60 | 9.29 | ✅ | [✅](../site/src/content/components/ui-checkbox.mdx) | 🚧 local | standard / radio / slider / toggle;  `checked` aliases `selected` |
| form | A | `ui-form`, `ui-field`, `ui-fields` | ✅ | 59 | 10.59 | ✅ | [✅](../site/src/content/components/ui-form.mdx) | 🚧 local | Fomantic's validation rules |
| message | A | `ui-message` | ✅ | 57 | 5.68 | — | [✅](../site/src/content/components/ui-message.mdx) | 🚧 local | |
| item | A | `ui-item` | ✅ | 31 | 4.88 | — | [✅](../site/src/content/components/ui-item.mdx) | — (owners' examples) | ONE generic item for dropdown / list / menu (and the Items view);  `active` aliases `selected` |
| list | A | `ui-list` | ✅ | 83 | 7.05 | ✅ | [✅](../site/src/content/components/ui-list.mdx) | 🚧 local | |
| table | A | `ui-table` | ✅ | 83 | 13.59 | ✅ | [✅](../site/src/content/components/ui-table.mdx) | 🚧 local | native `<table>` in light DOM;  data mode (`rows`, `columnDefs`), sorting |
| menu | A | `ui-menu` | ✅ | 78 | 10.06 | ✅ | [✅](../site/src/content/components/ui-menu.mdx) | 🚧 local | `<nav>` by default, `interactive` menubar;  nested `ui-menu` = sub-menu |
| breadcrumb | A | `ui-breadcrumb`, `ui-breadcrumb-section` | ✅ | 43 | 5.05 | native | [✅](../site/src/content/components/ui-breadcrumb.mdx) | 🚧 local | |
| card | B | `ui-card`, `ui-cards` | ✅ | 62 | 8.19 | native | [✅](../site/src/content/components/ui-card.mdx) | 🚧 local | `<article>`, a link card is one `<a>`;  shorthands render static parts;  a group hands its cards its variations;  `columns`, doubling / stackable by container query |
| items (view) | B | `ui-items` + the generic `ui-item` | ✅ | 52 | 4.06 | native | [✅](../site/src/content/components/ui-items.mdx) | 🚧 local | no second item tag (decided 2026-09-29);  the item owns its parts here only (`ConditionalOwner`);  stacks by container query |
| feed | B | `ui-feed`, `ui-event` | ✅ | 49 | 5.73 | — | [✅](../site/src/content/components/ui-feed.mdx) | 🚧 local | a list of `listitem` events;  the feed owns the parts (an event is transparent);  image / icon / text labels, ordered by CSS counters, connected |
| comment | B | `ui-comment`, `ui-comments` | ✅ | 47 | 4.44 | — | [✅](../site/src/content/components/ui-comment.mdx) | 🚧 local | `<article>` comments owning their parts;  a list inside a comment is its thread;  threaded, minimal (actions show on hover or focus), collapsed, `reply` slot |
| statistic | B | `ui-statistic`, `ui-statistics` | ✅ | 54 | 4.80 | — | [✅](../site/src/content/components/ui-statistic.mdx) | 🚧 local | value / label are the generic parts (`<ui-value>`, `<ui-label>`) or shorthands;  group `stackable` by container query |
| step | B | `ui-step`, `ui-steps` | ✅ | 59 | 8.78 | native | [✅](../site/src/content/components/ui-step.mdx) | 🚧 local | `<ol>` + `listitem` steps, `aria-current="step"`;  stacks below 768px of the GROUP (container query);  circular steps too;  `active` aliases `selected` |
| rail | B | `ui-rail` | ✅ | 28 | 2.87 | — | [✅](../site/src/content/components/ui-rail.mdx) | 🚧 local | `position="left\|right"` for the side |
| reveal | B | `ui-reveal` | ✅ | 33 | 4.07 | ✅ | [✅](../site/src/content/components/ui-reveal.mdx) | 🚧 local | `visible` / `hidden` slots;  reveals on hover, `active` AND focus (a tab stop unless the content is focusable);  instant under reduced motion |
| ad | B | `ui-ad` | ✅ | 45 | 3.42 | — | [✅](../site/src/content/components/ui-ad.mdx) | 🚧 local | IAB units as `unit="medium rectangle"` |
| emoji | B | `ui-emoji` | ✅ | 32 | 4.05 | — | [✅](../site/src/content/components/ui-emoji.mdx) | 🚧 local | NATIVE Unicode emoji, two name sets switched like icon packs (`cldr` default, 3,979;  `fomantic`, 3,808;  `<ui-root emoji>` / `EmojiData.use()`), lazy data chunks per set (`scripts/gen-emoji.ts`), no sprites / CDN |
| dropdown | C | `ui-dropdown` (+ `ui-item`) | ✅ | 67 | 16.48 | ✅ | [✅](../site/src/content/components/ui-dropdown.mdx) | 🚧 local | built early, as the benchmark component |
| popup | C | `ui-popup`, `[data-tooltip]` | ✅ | 78 | 8.41 | ✅ | [✅](../site/src/content/components/ui-popup.mdx) | 🚧 local | popover host, CSS anchor positioning only (Fomantic's 8 positions + 4 of ours, flips);  `on` hover / focus / click / manual;  tooltip or non-modal dialog ARIA;  CSS-only tooltip in `native.css` |
| modal | C | `ui-modal`, `UI.modals.*` | ✅ | 68 | 8.74 | ✅ | [✅](../site/src/content/components/ui-modal.mdx) | 🚧 local | native `<dialog>` + `showModal()`, `::backdrop` dimmer;  `closedby`, approve / deny, `--show` invoker command;  `UI.modals.confirm/alert/prompt` |
| transition | C | `ui-transition` | ✅ | 32 | 4.90 | ✅ | [✅](../site/src/content/components/ui-transition.mdx) | 🚧 local | the `animations.css` catalogue through `UI.transitions`;  `visible`, host `show()` / `hide()` / `toggle()` / `transition(name)`, invoker commands;  Fomantic's queue;  reduced motion |
| dimmer | C | `ui-dimmer` | ✅ | 42 | 6.22 | ✅ | [✅](../site/src/content/components/ui-dimmer.mdx) | 🚧 local | element dimmer over its parent;  `page` = a MODAL `<dialog>`;  `on` hover / click (hover reachable by Tab);  `blurring` by `backdrop-filter`;  `--ui-dimmer-*` tokens shared with the modal's `::backdrop` |
| select | C | `ui-select` | ✅ | 48 | 8.10 | native | [✅](../site/src/content/components/ui-select.mdx) | 🚧 local | a native `<select>`:  the customizable select (`appearance: base-select`) where supported, else the plain picker in the same closed look;  groups, `multiple`, form-associated;  [`docs/grammar.md`](grammar.md) "Selects" (vs `ui-dropdown`) |
| search | C | `ui-search` | ✅ | 54 | 12.85 | ✅ | [✅](../site/src/content/components/ui-search.mdx) | 🚧 local | APG combobox + listbox popover (CSS anchored);  local `source` (`SearchMatcher`, Fomantic's matching) or remote `url` through `UI.api` (debounce, abort, cache);  `category`;  form-associated (the input's text) |
| flyout | C | `ui-flyout` | ✅ | 42 | 5.12 | ✅ | [✅](../site/src/content/components/ui-flyout.mdx) | 🚧 local | side modal on `<dialog>` + `showModal()`;  shares `<ui-modal>`'s controller (`DialogElement`, modal family);  four sides, word and column widths |
| sidebar | C | `ui-sidebar`, `ui-pushable`, `ui-pusher` | ✅ | 44 | 7.83 | ✅ | [✅](../site/src/content/components/ui-sidebar.mdx) | 🚧 local | Fomantic's six transitions, four sides, widths;  modal drawer (`<dialog>` + `show()`, trap, `inert` dimmed pusher) or `persistent` `<aside>`;  pusher moved by tokens |
| accordion | C | `ui-accordion` (+ `ui-title` / `ui-content` pairs) | ✅ | 58 | 7.05 | ✅ | [✅](../site/src/content/components/ui-accordion.mdx) | 🚧 local | native `<details name>` per pair (manual slot assignment);  `open` = panel indexes;  cancelable `ui-open` / `ui-close`;  nested takes its parent's look;  `interpolate-size` animation |
| tab | C | `ui-tabs`, `ui-tab` (the pane) | ✅ | 64 | 8.56 | ✅ | [✅](../site/src/content/components/ui-tab.mdx) | 🚧 local | APG tablist drawn from the panes' labels, styled by `ui-menu.css`;  `activation`, `history` (URL hash), `lazy`, View Transitions;  no `ui-tab-pane`:  Fomantic's `.ui.tab` IS the pane |
| progress | C | `ui-progress` | ✅ | 50 | 7.41 | — | [✅](../site/src/content/components/ui-progress.mdx) | 🚧 local | the host is the `progressbar` (internals);  several bars, `indicating`, indeterminate filling / sliding / swinging, auto `success` at 100% |
| rating | C | `ui-rating` | ✅ | 48 | 6.23 | ✅ | [✅](../site/src/content/components/ui-rating.mdx) | 🚧 local | form-associated;  native radios in a `<fieldset role=radiogroup>`;  any icon name;  partial (display) values;  `clearable` |
| slider | C | `ui-slider` | ✅ | 54 | 9.10 | ✅ | [✅](../site/src/content/components/ui-slider.mdx) | 🚧 local | form-associated;  APG slider thumbs, `range` (two form entries), labeled / ticked, vertical, reversed;  positions by CSS ratio |
| calendar | C | `ui-calendar` | ✅ | 64 | 15.44 | ✅ | [✅](../site/src/content/components/ui-calendar.mdx) | 🚧 local | form-associated;  field + popover dialog (CSS anchored) or `inline`;  APG date-picker grid over Fomantic's year / month / day / hour / minute views;  `Temporal` (native, else `temporal-polyfill` from a lazy chunk) + `Intl` names, formats, 12 / 24 h;  typed text in the locale's order;  `min` / `max`, disabled dates / weekdays, ranges;  [`docs/grammar.md`](grammar.md) "Calendars" |
| toast | C | `ui-toast`, `UI.toast()` | ✅ | 80 | 11.03 | ✅ | [✅](../site/src/content/components/ui-toast.mdx) | 🚧 local | in-place box, or `UI.toast()` in a popover container per position;  types / colours / inverted, icon, close icon, progress bar, countdown paused on hover / focus, actions (inline, basic, vertical, attached), `role=status` / `alert`, never takes focus |
| sticky | C | `ui-sticky` | ✅ | 30 | 3.67 | — | [✅](../site/src/content/components/ui-sticky.mdx) | 🚧 local | CSS `position: sticky`;  `:state(stuck)` / `:state(bound)`, `ui-stick` / `ui-unstick` from an `IntersectionObserver` on sentinels;  `offset`, `bottom-offset`, `pushing`;  while stuck, reserves its room as the scroll container's `scroll-padding-top` / `-bottom` (Page Down skips what it covers;  not columns) |
| embed | C | `ui-embed` | ✅ | 39 | 6.31 | ✅ | [✅](../site/src/content/components/ui-embed.mdx) | 🚧 local | play `<button>` placeholder, frame only on activation (no third-party request before);  YouTube (nocookie) / Vimeo / any http(s) `url`;  ratios, `autoplay`, focus into the frame |
| shape | C | `ui-shape`, `ui-side` | ✅ | 35 | 6.07 | — | [✅](../site/src/content/components/ui-shape.mdx) | 🚧 local | Fomantic's flip geometry;  `active-index`, `direction`, host `flip()` / `next()` / `previous()`, invoker commands;  reduced motion swaps |
| nag | C | `ui-nag` | ✅ | 41 | 6.01 | ✅ | [✅](../site/src/content/components/ui-nag.mdx) | 🚧 local | top / bottom, fixed / overlay;  opt-in `key` remembers the dismissal in local / session storage or a cookie, with expiry;  blocked storage tolerated |
| visibility | C | `ui-visibility`, `UI.observeVisibility()` | ✅ | 19 (+8 runtime) | 3.58 | — | [✅](../site/src/content/components/ui-visibility.mdx) | 🚧 local | runtime service `UI.visibility` on `IntersectionObserver`:  Fomantic's callbacks, `once` / `continuous`, `offset`;  lazy images (`type="image"`, `lazyImage()`) |
| root | C | `ui-root` | ✅ | 28 | 7.05 | — | [✅](../site/src/content/components/ui-root.mdx) | 🚧 local | loads the families its content uses on demand (`ui-root.catalog.ts`, `yarn gen:root`), hides it until ready (`display`, `loading` message via `<ui-loader>`, `timeout`, `ui-ready` / `ui-error`), `theme` / `size` / `width` / `height` / `fixed`;  per-root `icons` / `emoji` / `assets` (`RootSettings`);  skeletons:  `<ui-placeholder>`s from each tag's `skeleton` (37 tags, the rest `null`);  the docs site runs on it |
| section | C | `ui-section` | ✅ | 83 | 🚧 | ✅ | [✅](../site/src/content/components/ui-section.mdx) | 🚧 local | ours, not Fomantic's (2026-10-02):  a `<section>` with a real `<h1>`...`<h6>` title (`level`, default the enclosing section's + 1, else 2), icon / badge / actions;  `collapsible` + controlled `collapsed` (a `<button aria-expanded>` inside the heading, cancelable `ui-open` / `ui-close`, `hidden=until-found` so find-in-page unfolds);  `sticky` titles stack when nested;  segment / header / styled-accordion looks |
| include | C | `ui-include` | ✅ | 30 | 🚧 | — | 🚧 | 🚧 local | ours (2026-10-02, plan doc `epics/ui-import`):  another page of the site shown here, from a same-origin `source` (`UI.sources`);  shadow root, or light DOM with `page-styles`;  `select`;  `load="eager\|visible\|idle"` (islands);  `ui-*` families inside load on demand (`RootLoader`);  relative URLs rewritten;  scripts don't run;  cycle guard;  `content` / `save()` (a `select`ed part by its `id`) |
| code | C | `ui-code` | ✅ | 29 | 🚧 | — | 🚧 | 🚧 local | ours (2026-10-02):  a code block from inline text (`<script type="text/plain">` keeps `<` / `&`) or `source`;  highlight.js in a LAZY chunk (`CodeEngine`:  core + a detect set of 9 languages, 21 more by name), `language` absent => guessed (`detectedLanguage`), `text` => plain;  `UI.code.register()` adds languages (a grammar, our own span highlighter, or `load()`);  `line-numbers` (`start`) and `wrap` as CSS;  `copy`;  Atom One colours, AA in light mode, `--ui-code-*` tokens |
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
| styles, tokens, utilities, themes | ✅ | OKLCH, `light-dark()`, contrast-picked foregrounds |
| native fallbacks | ✅ | every family;  [`docs/fallback.md`](fallback.md) |
| hot reload | ✅ | `yarn test:hmr` |
| framework hosts (vanilla, React, Vue, Solid 2) | ✅ | `yarn smoke`, 8 pages |
| SSR / declarative shadow DOM | ✅ | render only, no hydration |
| `@spell-app/util` (`$/util`) | ✅ | `@proto`, `class`, `string` (case, `numberToWord`, `suggest`), `dom`, `Constructor` / `Prettify`:  moved from `src/util/` to [`packages/util`](../../util/README.md) (2026-09-30), shared with `spell`;  `$/ui/util` re-exports it, bundles unchanged (`core` 14.48 kB, 54.63 kB with one button) |
| published type declarations | ✅ | fixed 2026-09-30:  `dist/index.d.ts`, `dist/core.d.ts`, `dist/components/ui-<name>/index.d.ts` ... exist as `exports` says, util's inlined in `dist/_util/`;  `yarn smoke` runs `tools/DeclarationCheck.ts`;  per-file, not rolled up (see `declarations()` in `vite.config.ts`) |

## Phase D -- site, hardening, release

| Item | Status | Notes |
|---|:-:|---|
| docs pages | ✅ | 55 pages:  every built family, plus the button page's `state` section (`active-text` / `inactive-text`).  Pages:  [accordion](../site/src/content/components/ui-accordion.mdx), [ad](../site/src/content/components/ui-ad.mdx), [breadcrumb](../site/src/content/components/ui-breadcrumb.mdx), [button](../site/src/content/components/ui-button.mdx), [calendar](../site/src/content/components/ui-calendar.mdx), [card](../site/src/content/components/ui-card.mdx), [checkbox](../site/src/content/components/ui-checkbox.mdx), [comment](../site/src/content/components/ui-comment.mdx), [container](../site/src/content/components/ui-container.mdx), [dimmer](../site/src/content/components/ui-dimmer.mdx), [divider](../site/src/content/components/ui-divider.mdx), [dropdown](../site/src/content/components/ui-dropdown.mdx), [embed](../site/src/content/components/ui-embed.mdx), [emoji](../site/src/content/components/ui-emoji.mdx), [feed](../site/src/content/components/ui-feed.mdx), [flag](../site/src/content/components/ui-flag.mdx), [flyout](../site/src/content/components/ui-flyout.mdx), [form](../site/src/content/components/ui-form.mdx), [grid](../site/src/content/components/ui-grid.mdx), [icon](../site/src/content/components/ui-icon.mdx), [image](../site/src/content/components/ui-image.mdx), [input](../site/src/content/components/ui-input.mdx), [item](../site/src/content/components/ui-item.mdx), [items](../site/src/content/components/ui-items.mdx), [label](../site/src/content/components/ui-label.mdx), [list](../site/src/content/components/ui-list.mdx), [loader](../site/src/content/components/ui-loader.mdx), [menu](../site/src/content/components/ui-menu.mdx), [message](../site/src/content/components/ui-message.mdx), [modal](../site/src/content/components/ui-modal.mdx), [nag](../site/src/content/components/ui-nag.mdx), [parts](../site/src/content/components/ui-parts.mdx), [placeholder](../site/src/content/components/ui-placeholder.mdx), [popup](../site/src/content/components/ui-popup.mdx), [progress](../site/src/content/components/ui-progress.mdx), [rail](../site/src/content/components/ui-rail.mdx), [root](../site/src/content/components/ui-root.mdx), [rating](../site/src/content/components/ui-rating.mdx), [reveal](../site/src/content/components/ui-reveal.mdx), [search](../site/src/content/components/ui-search.mdx), [section](../site/src/content/components/ui-section.mdx), [segment](../site/src/content/components/ui-segment.mdx), [select](../site/src/content/components/ui-select.mdx), [shape](../site/src/content/components/ui-shape.mdx), [sidebar](../site/src/content/components/ui-sidebar.mdx), [slider](../site/src/content/components/ui-slider.mdx), [statistic](../site/src/content/components/ui-statistic.mdx), [step](../site/src/content/components/ui-step.mdx), [sticky](../site/src/content/components/ui-sticky.mdx), [tab](../site/src/content/components/ui-tab.mdx), [table](../site/src/content/components/ui-table.mdx), [text](../site/src/content/components/ui-text.mdx), [toast](../site/src/content/components/ui-toast.mdx), [transition](../site/src/content/components/ui-transition.mdx), [visibility](../site/src/content/components/ui-visibility.mdx)
| theming guide | ✅ | [`site/src/pages/theming.mdx`](../site/src/pages/theming.mdx), [`docs/theming.md`](theming.md) |
| translation contract | ✅ | [`docs/translation.md`](translation.md) (design only) |
| kitchen sink | ✅ | [`site/src/pages/kitchen-sink.astro`](../site/src/pages/kitchen-sink.astro):  every family's main example, live (2026-10-01) |
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
  vocabulary files instead ([`VocabularyTable.astro`](../site/src/components/VocabularyTable.astro)).  Revisit in
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
