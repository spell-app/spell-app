# Status

Checklist of every component in [`docs/plan.md`](plan.md), with what's done, in progress, deferred.  Kept up to date
as work lands ([AGENTS.md](../AGENTS.md)).  Last updated 2026-10-05.

## Working on now

- **Resumed 2026-10-01** in the monorepo (`packages/ui`), branch `worktree-ui-component-creation`;  plan doc
  [`epics/ui-component-creation/`](../../../epics/ui-component-creation/ui-component-creation.plan.html):
  icon follow-ups, `agents/SUSPECTED-BUGS.md` sweep, Owen's decisions ("To review (Owen)" below), Phase D chores.
- **`<ui-root>`** (P17-P20, 2026-10-01):  built;  P21 (D48-D50:  table `stack-by`, WebKit fixes) built;  P22 doc review done.
- **`stack-with="container | page"`** (2026-10-03, epic `spell-ui-pages` P10, D40):  grid, cards, steps, form,
  items, statistics stack by their own width (default) or the screen's;  `<ui-root stack-with>` sets the
  inherited `--ui-stack-with` for a page (tables' `stack-by` follows it too);  the docs site uses `page`.
  [`docs/theming.md`](theming.md) "Stacking".
- Every check passes after the move;  `yarn test:hmr` and `yarn site:build` needed a fix each (`agents/PAPERCUTS.md`).
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
- **Docs** = page on the docs site (`ui/components/ui-<name>.html`, shared);  ✅ links to the page.
- **Visual** = screenshot tests of every element example, light + dark ([`docs/visual-testing.md`](visual-testing.md)):
  ✅ = baselines for chromium, firefox and webkit on BOTH `linux` and `local-darwin`;  🚧 local = all three browsers
  on `local-darwin` only, `linux` missing (Docker Desktop crashes at launch on this Mac, 2026-09-30).

NOTE:  links are relative, so they work on GitHub and in VS Code.  In VS Code's Markdown preview, `.html` / source
links open in an editor tab;  `.md` links do too because `.vscode/settings.json` sets
`markdown.preview.openMarkdownLinks` to `inEditor`.

## Components

| Component | Phase | Tags | Status | Tests | Size | Keys | Docs | Visual | Notes |
|---|:-:|---|:-:|--:|--:|:-:|:-:|:-:|---|
| icon | A | `ui-icon`, `ui-icons` | ✅ | 58 | 6.33 | — | [✅](../../../ui/components/ui-icon.html) | 🚧 local | SVG icon packs (FA7 Free default;  brands, Fomantic opt-in);  [`docs/icons.md`](icons.md) |
| button | A | `ui-button`, `ui-buttons`, `ui-or` | ✅ | 99 | 12.17 | native | [✅](../../../ui/components/ui-button.html) | 🚧 local | `<ui-buttons equal>`:  each as wide as the widest (a grid), or with `fluid` an equal share (`width` is its count alias);  a packed `equal` group's `<ui-or>` takes a column of its own;  `icon-position="right"` (a trailing icon), `download` (with `href`), `--ui-button-font-family` / `-font-size`;  `host.click()` presses the inner control (so `<ui-input>`'s Enter submits through it) |
| label | A | `ui-label`, `ui-labels` | ✅ | 67 | 8.45 | — | [✅](../../../ui/components/ui-label.html) | 🚧 local | `tinted` (ours):  the colour's soft fill and text colour |
| content parts | A | `ui-content`, `ui-header`, `ui-description`, `ui-meta`, `ui-extra`, `ui-actions`, `ui-title`, `ui-summary`, `ui-date`, `ui-author`, `ui-avatar`, `ui-detail`, `ui-value` | ✅ | 106 | 15.05 | — | [✅](../../../ui/components/ui-header.html) + a page per other part (`ui-meta.html` ...) | 🚧 local | styled by owner context;  a leveled `sub` header is sized as a sub header;  a sub header reads the public `--ui-header-sub-color` / `-font-size` / `-margin` when no standalone header declares the aliases (a card's lede;  2026-10-04, epic `design-system` I22) |
| divider | A | `ui-divider` | ✅ | 37 | 3.82 | — | [✅](../../../ui/components/ui-divider.html) | 🚧 local | |
| segment | A | `ui-segment`, `ui-segments` | ✅ | 65 | 7.37 | — | [✅](../../../ui/components/ui-segment.html) | 🚧 local | |
| container | A | `ui-container` | ✅ | 32 | 3.24 | — | [✅](../../../ui/components/ui-container.html) | 🚧 local | |
| grid | A | `ui-grid`, `ui-row`, `ui-column` | ✅ | 77 | 7.84 | — | [✅](../../../ui/components/ui-grid.html) | 🚧 local | stackable / doubling / per-device widths / `reversed` by container query, or the screen with `stack-with="page"` (rows and columns follow the grid) |
| image | A | `ui-image`, `ui-images` | ✅ | 57 | 5.57 | — | [✅](../../../ui/components/ui-image.html) | 🚧 local | |
| text | A | `ui-text` | ✅ | 39 | 2.70 | — | [✅](../../../ui/components/ui-text.html) | 🚧 local | |
| flag | A | `ui-flag` | ✅ | 45 | 6.08 | — | [✅](../../../ui/components/ui-flag.html) | 🚧 local | |
| loader | A | `ui-loader` | ✅ | 44 | 4.26 | — | [✅](../../../ui/components/ui-loader.html) | 🚧 local | |
| placeholder | A | `ui-placeholder` (+ `-header`, `-paragraph`, `-line`, `-image`) | ✅ | 47 | 5.90 | — | [✅](../../../ui/components/ui-placeholder.html) | 🚧 local | |
| input | A | `ui-input`, `ui-textarea` | ✅ | 70 | 10.38 | ✅ | [✅](../../../ui/components/ui-input.html) + [textarea](../../../ui/components/ui-textarea.html) | 🚧 local | form-associated;  numbers (`type="number"`, `inputmode` decimal / numeric) right-aligned in tabular figures (`--ui-input-numeric-align`) |
| checkbox | A | `ui-checkbox`, `ui-radio` | ✅ | 60 | 9.29 | ✅ | [✅](../../../ui/components/ui-checkbox.html) + [radio](../../../ui/components/ui-radio.html) | 🚧 local | standard / radio / slider / toggle;  `checked` aliases `selected` |
| form | A | `ui-form`, `ui-field`, `ui-fields` | ✅ | 61 | 10.59 | ✅ | [✅](../../../ui/components/ui-form.html) | 🚧 local | Fomantic's validation rules;  rows stack by the form's width, or the screen's with `stack-with="page"`;  `<ui-fields equal>` ~== `widths="equal"` (`equal width fields`) |
| message | A | `ui-message` | ✅ | 60 | 5.68 | — | [✅](../../../ui/components/ui-message.html) | 🚧 local | `--ui-message-icon-align` (an icon message's icon:  `center`, `start` ...;  2026-10-04, epic `design-system` I30) |
| item | A | `ui-item` | ✅ | 31 | 4.88 | — | [✅](../../../ui/components/ui-item.html) | — (owners' examples) | ONE generic item for dropdown / list / menu (and the Items view);  `active` aliases `selected`;  the host's `aria-expanded` goes to a `<button>` box (a disclosure item);  the `icon` shorthand's glyph sized again (it was 0 x 0:  `> svg` missed the slot fallback, 2026-10-03) |
| list | A | `ui-list` | ✅ | 90 | 7.05 | ✅ | [✅](../../../ui/components/ui-list.html) | 🚧 local | 2026-10-04, epic `design-system` I28 / I31:  the root reads `--ui-list-font-size`;  `--ui-list-margin`;  `link` / `selection` / `bulleted` set their defaults THROUGH the public tokens;  `--ui-list-marker-size`, `--ui-list-marker-active-color` (a selected item's bullet) |
| table | A | `ui-table` | ✅ | 83 | 13.59 | ✅ | [✅](../../../ui/components/ui-table.html) | 🚧 local | native `<table>` in light DOM;  data mode (`rows`, `columnDefs`), sorting |
| menu | A | `ui-menu` | ✅ | 104 | 10.06 | ✅ | [✅](../../../ui/components/ui-menu.html) | 🚧 local | `<nav>` by default, `interactive` menubar;  nested `ui-menu` = sub-menu;  `appearance` (one look word;  `segmented` is ours, the booleans its aliases), `alignment` (`fluid` / `left` / `center` / `right`), `equal` (no count;  `items` its count alias);  VARIATION TOKENS `--ui-menu-<variation>-*` for `vertical` / `secondary` / `text` / `segmented` (what each swaps;  generic tokens stay the base menu's:  epic `design-system` P8);  bar tokens `--ui-menu-margin` / `-min-height` / `-gap` / `-font-family`, item `-min-height` / `-transform` / `-letter-spacing`, `--ui-menu-active-shadow`;  a `link` item fills a vertical menu;  `segmented` moves `selected` itself (cancelable `ui-select`) and draws a pill track + raised thumb from its tokens (`spell-brand`) |
| breadcrumb | A | `ui-breadcrumb`, `ui-breadcrumb-section` | ✅ | 43 | 5.05 | native | [✅](../../../ui/components/ui-breadcrumb.html) | 🚧 local | |
| card | B | `ui-card`, `ui-cards` | ✅ | 65 | 8.19 | native | [✅](../../../ui/components/ui-card.html) | 🚧 local | `<article>`, a link card is one `<a>`;  shorthands render static parts;  a group hands its cards its variations;  `columns`, doubling / stackable by container query, or the screen with `stack-with="page"`;  `dashed` (ours:  a placeholder);  a shadow token's `none` keeps the border (style query);  the hover ring reads `--ui-card-hover-border-color` |
| items (view) | B | `ui-items` + the generic `ui-item` | ✅ | 52 | 4.06 | native | [✅](../../../ui/components/ui-items.html) | 🚧 local | no second item tag (decided 2026-09-29);  the item owns its parts here only (`ConditionalOwner`);  stacks by container query, or the screen with `stack-with="page"` |
| feed | B | `ui-feed`, `ui-event` | ✅ | 49 | 5.73 | — | [✅](../../../ui/components/ui-feed.html) | 🚧 local | a list of `listitem` events;  the feed owns the parts (an event is transparent);  image / icon / text labels, ordered by CSS counters, connected |
| comment | B | `ui-comment`, `ui-comments` | ✅ | 47 | 4.44 | — | [✅](../../../ui/components/ui-comment.html) | 🚧 local | `<article>` comments owning their parts;  a list inside a comment is its thread;  threaded, minimal (actions show on hover or focus), collapsed, `reply` slot |
| statistic | B | `ui-statistic`, `ui-statistics` | ✅ | 56 | 4.80 | — | [✅](../../../ui/components/ui-statistic.html) | 🚧 local | value / label are the generic parts (`<ui-value>`, `<ui-label>`) or shorthands;  group `stackable` by container query, or the screen with `stack-with="page"`;  `equal`:  one row, an equal share each (`widths` its count alias) |
| step | B | `ui-step`, `ui-steps` | ✅ | 64 | 8.78 | native | [✅](../../../ui/components/ui-step.html) | 🚧 local | `<ol>` + `listitem` steps, `aria-current="step"`;  stacks below 768px of the GROUP (container query), or of the screen with `stack-with="page"`;  circular steps too;  `active` aliases `selected`;  a step's own `color` adds `ui-<color>` (the remap needs it, no `ui`);  `equal` (as wide as the widest, or `fluid` shares;  `widths` its count alias) |
| rail | B | `ui-rail` | ✅ | 28 | 2.87 | — | [✅](../../../ui/components/ui-rail.html) | 🚧 local | `position="left\|right"` for the side |
| reveal | B | `ui-reveal` | ✅ | 33 | 4.07 | ✅ | [✅](../../../ui/components/ui-reveal.html) | 🚧 local | `visible` / `hidden` slots;  reveals on hover, `active` AND focus (a tab stop unless the content is focusable);  instant under reduced motion |
| ad | B | `ui-ad` | ✅ | 45 | 3.42 | — | [✅](../../../ui/components/ui-ad.html) | 🚧 local | IAB units as `unit="medium rectangle"` |
| emoji | B | `ui-emoji` | ✅ | 32 | 4.05 | — | [✅](../../../ui/components/ui-emoji.html) | 🚧 local | NATIVE Unicode emoji, two name sets switched like icon packs (`cldr` default, 3,979;  `fomantic`, 3,808;  `<ui-root emoji>` / `EmojiData.use()`), lazy data chunks per set (`scripts/gen-emoji.ts`), no sprites / CDN |
| dropdown | C | `ui-dropdown` (+ `ui-item`) | ✅ | 67 | 16.48 | ✅ | [✅](../../../ui/components/ui-dropdown.html) | 🚧 local | built early, as the benchmark component |
| popup | C | `ui-popup`, `[data-tooltip]` | ✅ | 93 | 8.41 | ✅ | [✅](../../../ui/components/ui-popup.html) | 🚧 local | popover host, CSS anchor positioning only (Fomantic's 8 positions + 4 of ours, flips);  `on` hover / focus / click / manual;  tooltip or non-modal dialog ARIA;  CSS-only tooltip in `native.css`;  a `flowing` popup drops a slotted grid's size containment |
| modal | C | `ui-modal`, `UI.modals.*` | ✅ | 68 | 8.74 | ✅ | [✅](../../../ui/components/ui-modal.html) | 🚧 local | native `<dialog>` + `showModal()`, `::backdrop` dimmer;  `closedby`, approve / deny, `--show` invoker command;  `UI.modals.confirm/alert/prompt` |
| transition | C | `ui-transition` | ✅ | 32 | 4.90 | ✅ | [✅](../../../ui/components/ui-transition.html) | 🚧 local | the `animations.css` catalogue through `UI.transitions`;  `visible`, host `show()` / `hide()` / `toggle()` / `transition(name)`, invoker commands;  Fomantic's queue;  reduced motion |
| dimmer | C | `ui-dimmer` | ✅ | 42 | 6.22 | ✅ | [✅](../../../ui/components/ui-dimmer.html) | 🚧 local | element dimmer over its parent;  `page` = a MODAL `<dialog>`;  `on` hover / click (hover reachable by Tab);  `blurring` by `backdrop-filter`;  `--ui-dimmer-*` tokens shared with the modal's `::backdrop` |
| select | C | `ui-select` | ✅ | 48 | 8.10 | native | [✅](../../../ui/components/ui-select.html) | 🚧 local | a native `<select>`:  the customizable select (`appearance: base-select`) where supported, else the plain picker in the same closed look;  groups, `multiple`, form-associated;  [`docs/grammar.md`](grammar.md) "Selects" (vs `ui-dropdown`) |
| search | C | `ui-search` | ✅ | 54 | 12.85 | ✅ | [✅](../../../ui/components/ui-search.html) | 🚧 local | APG combobox + listbox popover (CSS anchored);  local `source` (`SearchMatcher`, Fomantic's matching) or remote `url` through `UI.api` (debounce, abort, cache);  `category`;  form-associated (the input's text) |
| flyout | C | `ui-flyout` | ✅ | 42 | 5.12 | ✅ | [✅](../../../ui/components/ui-flyout.html) | 🚧 local | side modal on `<dialog>` + `showModal()`;  shares `<ui-modal>`'s controller (`DialogElement`, modal family);  four sides, word and column widths |
| sidebar | C | `ui-sidebar`, `ui-pushable`, `ui-pusher` | ✅ | 44 | 7.83 | ✅ | [✅](../../../ui/components/ui-sidebar.html) | 🚧 local | Fomantic's six transitions, four sides, widths;  modal drawer (`<dialog>` + `show()`, trap, `inert` dimmed pusher) or `persistent` `<aside>`;  pusher moved by tokens |
| accordion | C | `ui-accordion` (+ `ui-title` / `ui-content` pairs) | ✅ | 62 | 7.05 | ✅ | [✅](../../../ui/components/ui-accordion.html) | 🚧 local | native `<details name>` per pair (manual slot assignment);  `open` = panel indexes;  cancelable `ui-open` / `ui-close`;  nested takes its parent's look;  `interpolate-size` animation;  `source` (2026-10-05, epic `claude-design` P2):  the first panel's content from a file, fetched the first time it opens (`SourceBody`), into its `<ui-content>` (made when missing) |
| tab | C | `ui-tabs`, `ui-tab` (the pane) | ✅ | 76 | 8.56 | ✅ | [✅](../../../ui/components/ui-tab.html) | 🚧 local | APG tablist drawn from the panes' labels, styled by `ui-menu.css`;  `activation`, `history` (URL hash), `lazy`, `appearance` (the menu's, `segmented` included:  the docs site's page tabs are `appearance="segmented" alignment="fluid" equal`), `alignment`, `equal`, `compact`, View Transitions;  no `ui-tab-pane`:  Fomantic's `.ui.tab` IS the pane;  the tab list has no menu block margins (`--ui-tabs-menu-margin`, `0`:  was a `2em` gap, design-system I29) |
| progress | C | `ui-progress` | ✅ | 50 | 7.41 | — | [✅](../../../ui/components/ui-progress.html) | 🚧 local | the host is the `progressbar` (internals);  several bars, `indicating`, indeterminate filling / sliding / swinging, auto `success` at 100% |
| rating | C | `ui-rating` | ✅ | 48 | 6.23 | ✅ | [✅](../../../ui/components/ui-rating.html) | 🚧 local | form-associated;  native radios in a `<fieldset role=radiogroup>`;  any icon name;  partial (display) values;  `clearable` |
| slider | C | `ui-slider` | ✅ | 57 | 9.10 | ✅ | [✅](../../../ui/components/ui-slider.html) | 🚧 local | form-associated;  APG slider thumbs, `range` (two form entries), labeled / ticked, vertical, reversed;  positions by CSS ratio;  `ticked` alone (ours):  plain ticks under the track;  `tick-step`:  labels / ticks apart from `step` |
| calendar | C | `ui-calendar` | ✅ | 64 | 15.44 | ✅ | [✅](../../../ui/components/ui-calendar.html) | 🚧 local | form-associated;  field + popover dialog (CSS anchored) or `inline`;  APG date-picker grid over Fomantic's year / month / day / hour / minute views;  `Temporal` (native, else `temporal-polyfill` from a lazy chunk) + `Intl` names, formats, 12 / 24 h;  typed text in the locale's order;  `min` / `max`, disabled dates / weekdays, ranges;  [`docs/grammar.md`](grammar.md) "Calendars" |
| toast | C | `ui-toast`, `UI.toast()` | ✅ | 81 | 11.03 | ✅ | [✅](../../../ui/components/ui-toast.html) | 🚧 local | in-place box, or `UI.toast()` in a popover container per position;  types / colours / inverted, icon, close icon, progress bar, countdown paused on hover / focus, actions (inline, basic, vertical, attached), `role=status` / `alert`, never takes focus;  `UI.toast({ class })` keeps every word on the host (theme one toast);  `--ui-toast-font-size` |
| sticky | C | `ui-sticky` | ✅ | 30 | 3.67 | — | [✅](../../../ui/components/ui-sticky.html) | 🚧 local | CSS `position: sticky`;  `:state(stuck)` / `:state(bound)`, `ui-stick` / `ui-unstick` from an `IntersectionObserver` on sentinels;  `offset`, `bottom-offset`, `pushing`;  while stuck, reserves its room as the scroll container's `scroll-padding-top` / `-bottom` (Page Down skips what it covers;  not columns) |
| embed | C | `ui-embed` | ✅ | 39 | 6.31 | ✅ | [✅](../../../ui/components/ui-embed.html) | 🚧 local | play `<button>` placeholder, frame only on activation (no third-party request before);  YouTube (nocookie) / Vimeo / any http(s) `url`;  ratios, `autoplay`, focus into the frame |
| shape | C | `ui-shape`, `ui-side` | ✅ | 36 | 6.07 | — | [✅](../../../ui/components/ui-shape.html) | 🚧 local | Fomantic's flip geometry;  `active-index`, `direction`, host `flip()` / `next()` / `previous()`, invoker commands (`--next`, `--previous`, `--flip-<direction>`);  reduced motion swaps |
| nag | C | `ui-nag` | ✅ | 42 | 6.01 | ✅ | [✅](../../../ui/components/ui-nag.html) | 🚧 local | top / bottom, fixed / overlay;  opt-in `key` remembers the dismissal in local / session storage or a cookie, with expiry;  blocked storage tolerated;  invoker commands `--show` / `--close` / `--toggle` |
| visibility | C | `ui-visibility`, `UI.observeVisibility()` | ✅ | 19 (+8 runtime) | 3.58 | — | [✅](../../../ui/components/ui-visibility.html) | 🚧 local | runtime service `UI.visibility` on `IntersectionObserver`:  Fomantic's callbacks, `once` / `continuous`, `offset`;  lazy images (`type="image"`, `lazyImage()`) |
| root | C | `ui-root` | ✅ | 28 | 7.05 | — | [✅](../../../ui/components/ui-root.html) | 🚧 local | loads the families its content uses on demand (`ui-root.catalog.ts`, `yarn gen:root`), hides it until ready (`display`, `loading` message via `<ui-loader>`, `timeout`, `ui-ready` / `ui-error`), `theme` / `size` / `width` / `height` / `fixed` / `stack-with` (the inherited `--ui-stack-with`);  per-root `icons` / `emoji` / `assets` (`RootSettings`);  skeletons:  `<ui-placeholder>`s from each tag's `skeleton` (37 tags, the rest `null`);  the docs site runs on it |
| section | C | `ui-section`, `ui-sections` | ✅ | 102 | 🚧 | ✅ | [✅](../../../ui/components/ui-section.html) | 🚧 local | ours, not Fomantic's (2026-10-02):  a `<section>` with a real `<h1>`...`<h6>` title (`level`, default the enclosing section's + 1, else 2), icon / badge / actions;  `collapsible` + controlled `collapsed` (a `<button aria-expanded>` inside the heading, cancelable `ui-open` / `ui-close`, `hidden=until-found` so find-in-page unfolds);  `sticky` titles stack when nested;  segment / header / styled-accordion looks.  `<ui-sections>` (2026-10-04):  a group spaced as one section;  `collapsing` makes every section under it fold by default, sub-sections included (nearest group wins;  `collapsible="false"` opts out), and stacks folded ones with no space between (an open one:  flush above, its usual space below;  boxes overlap their border).  2026-10-04, epic `design-system` I8 / I15:  `fold-icon="end"` (the chevron at the far end of the title bar, after the badge and actions;  a click on it folds;  `defaultFoldIcon` lets a subclass move the default:  `<ui-panel>`'s is `end`);  `info` / `slot="info"`, a tip under the title bar on hover / keyboard focus, describing the title (`--ui-section-tip-background`, `-color`, `-width`;  `spell-brand` sets the brand's aubergine bubble);  `content` example + baselines.  `source` (2026-10-05, epic `claude-design` P2):  the content from a file, fetched the first time the section unfolds (`SourceBody`:  `UI.sources`, light DOM, placeholder replaced, `select`, `load()` / `reload()`, `ui-load` / `ui-error`, held closed up to 300 ms so it unfolds onto the body);  in the class, so subclasses get it.  Visual:  `groups` example baselines `local-darwin` only |
| panel | C | `ui-panel` | ✅ | 15 | 🚧 | ✅ | [✅](../site/components/ui-panel.html) | 🚧 local | ours (2026-10-05, epic `design-system`:  moved from the brand's `<ui-brand-panel>`):  an inspector panel, a `<ui-section>` subclass under its own tag and vocabulary (built on the section's:  every section attribute, slot, part, event, `source` too once epic `claude-design` adds it);  a tinted box under a full-width header band, a panel inside a panel a sub-head band (small capitals), every band folds, the chevron at the far end (`fold-icon="end"` by default);  `color` paints the box and bands from any hue, a theme's too (`spell-brand`'s `accent`), none:  `primary`;  plain `--ui-*` fallbacks, no brand theme needed;  tokens `--ui-panel-*` (background, border colour, header / subhead background and colour, radius, padding, gap, band space, shadow);  `PanelFallback` (the section's, in the panel's class grammar);  `types` example + baselines.  Keys:  the section's (a fold button per band) |
| include | C | `ui-include` | ✅ | 30 | 4.34 | — | [✅](../../../ui/components/ui-include.html) | 🚧 local | ours (2026-10-02, plan doc `epics/ui-import`):  another page of the site shown here, from a same-origin `source` (`UI.sources`);  shadow root, or light DOM with `page-styles`;  `select`;  `load="eager\|visible\|idle"` (islands);  `ui-*` families inside load on demand (`RootLoader`);  relative URLs rewritten;  scripts don't run;  cycle guard;  `content` / `save()` (a `select`ed part by its `id`) |
| code | C | `ui-code` | ✅ | 31 | 6.94 | — | [✅](../../../ui/components/ui-code.html) | 🚧 local | ours (2026-10-02):  a code block from inline text (`<script type="text/plain">` keeps `<` / `&`) or `source`;  highlight.js in a LAZY chunk (`CodeEngine`:  core + a detect set of 9 languages, 21 more by name), `language` absent => guessed (`detectedLanguage`), `text` => plain;  `UI.code.register()` adds languages (a grammar, our own span highlighter, or `load()`);  `language="spell"` (`spell/<lang>`) colours with spell's own parser, pre-compiled (`src/languages/spell.en.js`, `yarn gen:spell`, 138 kB gz, lazy);  `line-numbers` (`start`) and `wrap` as CSS;  `copy`;  Atom One colours, AA in light mode, `--ui-code-*` tokens |
| markdown | C | `ui-markdown` | ✅ | 34 | 5.05 | — | [✅](../../../ui/components/ui-markdown.html) | 🚧 local | ours (2026-10-02):  GitHub-flavoured markdown (tables, task lists, strikethrough, autolinks) from inline text (`<script type="text/markdown">`) or `source`;  marked in a LAZY chunk (`MarkdownEngine`);  raw HTML kept unless `sanitized` (2026-10-04, markdown epic I6), which sanitizes with DOMPurify in a lazy chunk of its own (`MarkdownSanitizer`);  headings get GitHub's ids (`headings`, `ui-render`), `heading-offset`;  code blocks become `<ui-code copy>`;  relative links resolve beside `source`;  `#id` links scroll inside the shadow root;  task checkboxes labelled;  `size`;  `editable` (2026-10-04, markdown epic P8):  Write / Preview tabs, the preview drawn with `ui-*` elements by spell's engine (`@spell-app/markdown`'s pre-compiled bundle, `MDEngine`, its own lazy chunk), patched block by block;  2026-10-04, epic `design-system` I26 / I27:  heading / `hr` / bold / inline-code tokens (`--ui-markdown-heading-font-family`, `-weight`, `-line-height`, `-margin`, `-rule`, `-rule-gap`, `-scroll-margin`, `-h1-size` ... `-h3-size`, `-hr-height`, `-strong-color`, `-code-color`;  `spell-brand` sets them);  `skip-title`;  `reveal(id)`;  the address's `#id` honoured after the first render and on `hashchange` |
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
| styles, tokens, utilities, themes | ✅ | OKLCH, `light-dark()`, contrast-picked foregrounds;  Fomantic themes in `styles/themes/` applied by `ThemeSheets.apply()` (page + every shadow root, `UI.styles` `shadow: true`);  our own `spell` theme (the Spell brand, `ThemeSheets.OWN`, installed-Palatino serif headers, no font files), the default on every doc site |
| native fallbacks | ✅ | every family;  [`docs/fallback.md`](fallback.md) |
| hot reload | ✅ | `yarn test:hmr` |
| framework hosts (vanilla, React, Vue, Solid 2) | ✅ | `yarn smoke`, 8 pages |
| SSR / declarative shadow DOM | ✅ | render only, no hydration |
| `@spell-app/util` (`$/util`) | ✅ | `@proto`, `class`, `string` (case, `numberToWord`, `suggest`), `dom`, `Constructor` / `Prettify`:  moved from `src/util/` to [`packages/util`](../../util/README.md) (2026-09-30), shared with `spell`;  `$/ui/util` re-exports it, bundles unchanged (`core` 14.48 kB, 54.63 kB with one button) |
| published type declarations | ✅ | fixed 2026-09-30:  `dist/index.d.ts`, `dist/core.d.ts`, `dist/components/ui-<name>/index.d.ts` ... exist as `exports` says, util's inlined in `dist/_util/`;  `yarn smoke` runs `tools/DeclarationCheck.ts`;  per-file, not rolled up (see `declarations()` in `vite.config.ts`) |

## Phase D -- site, hardening, release

| Item | Status | Notes |
|---|:-:|---|
| docs pages | ✅ | 73 pages, in the shared `ui/` since 2026-10-05 (epic `claude-design` P6;  their bundle and data stay in `site/`):  every built family, plus 14 sub-tags with a page of their own (`ui-radio`, `ui-textarea` and the 12 content parts but `ui-header`;  epic `ui-docs-rework` P7), plus the button page's `state` section (`active-text` / `inactive-text`).  Pages:  [accordion](../../../ui/components/ui-accordion.html), [ad](../../../ui/components/ui-ad.html), [breadcrumb](../../../ui/components/ui-breadcrumb.html), [button](../../../ui/components/ui-button.html), [calendar](../../../ui/components/ui-calendar.html), [card](../../../ui/components/ui-card.html), [checkbox](../../../ui/components/ui-checkbox.html), [code](../../../ui/components/ui-code.html), [comment](../../../ui/components/ui-comment.html), [container](../../../ui/components/ui-container.html), [dimmer](../../../ui/components/ui-dimmer.html), [divider](../../../ui/components/ui-divider.html), [dropdown](../../../ui/components/ui-dropdown.html), [embed](../../../ui/components/ui-embed.html), [emoji](../../../ui/components/ui-emoji.html), [feed](../../../ui/components/ui-feed.html), [flag](../../../ui/components/ui-flag.html), [flyout](../../../ui/components/ui-flyout.html), [form](../../../ui/components/ui-form.html), [grid](../../../ui/components/ui-grid.html), [icon](../../../ui/components/ui-icon.html), [image](../../../ui/components/ui-image.html), [include](../../../ui/components/ui-include.html), [input](../../../ui/components/ui-input.html), [item](../../../ui/components/ui-item.html), [items](../../../ui/components/ui-items.html), [label](../../../ui/components/ui-label.html), [list](../../../ui/components/ui-list.html), [loader](../../../ui/components/ui-loader.html), [markdown](../../../ui/components/ui-markdown.html), [menu](../../../ui/components/ui-menu.html), [message](../../../ui/components/ui-message.html), [modal](../../../ui/components/ui-modal.html), [nag](../../../ui/components/ui-nag.html), [panel](../../../ui/components/ui-panel.html), [parts](../../../ui/components/ui-header.html), [placeholder](../../../ui/components/ui-placeholder.html), [popup](../../../ui/components/ui-popup.html), [progress](../../../ui/components/ui-progress.html), [rail](../../../ui/components/ui-rail.html), [root](../../../ui/components/ui-root.html), [rating](../../../ui/components/ui-rating.html), [reveal](../../../ui/components/ui-reveal.html), [search](../../../ui/components/ui-search.html), [section](../../../ui/components/ui-section.html), [segment](../../../ui/components/ui-segment.html), [select](../../../ui/components/ui-select.html), [shape](../../../ui/components/ui-shape.html), [sidebar](../../../ui/components/ui-sidebar.html), [slider](../../../ui/components/ui-slider.html), [statistic](../../../ui/components/ui-statistic.html), [step](../../../ui/components/ui-step.html), [sticky](../../../ui/components/ui-sticky.html), [tab](../../../ui/components/ui-tab.html), [table](../../../ui/components/ui-table.html), [text](../../../ui/components/ui-text.html), [toast](../../../ui/components/ui-toast.html), [transition](../../../ui/components/ui-transition.html), [visibility](../../../ui/components/ui-visibility.html)
| docs-only elements (`src/docs-components/`) | 🚧 | epic `spell-ui-pages` (2026-10-02):  `<ui-docs-*>` families, loaded by `<ui-root>`, not in the component list (`ComponentDefinitions.docs`, topic `documentation`).  ✅ `<ui-docs-example>` (live example + its source, 21 tests + fallback + css);  ✅ `<ui-docs-api>` (a tag's / family's attributes, properties, events, slots, parts, states, texts tables;  27 tests + fallback + css);  ✅ `<ui-docs-tokens>` (a family's or the foundation's (`global`) CSS tokens, live colour swatches, optional `playground`;  35 tests + fallback + css, plus `foundation` in the site data);  ✅ `<ui-docs-themes>` (compact by default:  a sun / moon button showing the page's scheme (the OS's while following it), a click flips it, the icons cross-fade;  a palette button opening a small overlay (`<ui-popup on="click">`) with the theme list (Spell (the default), Plain, Classic, every Fomantic theme;  a `role=menu` of `menuitemradio`s, arrows / Home / End, Escape back to the button) and a "Match system" switch;  `show="theme"`:  the theme dropdown, `for` filters to a family's themes;  stored per viewer through `ThemePreference`, the scheme under ONE key every doc site's header shares (`spell-site:scheme`, old keys moved over once), restored by the site entry;  27 tests + fallback + css, plus `themes` in the site data from `tools/ThemeFamilies.ts`);  ✅ `<ui-docs-nav>` (the site's left sidebar, a docked panel in the Spell brand's look since epic `ui-docs-rework` P3:  a header band (`header` slot, search, A-Z / Topics), folding bands (Get started, Favourites, Components with a lighter band per topic, Foundation) eased open / shut under `prefers-reduced-motion: no-preference`, native `<a>` rows (`.sp-nav`), current page `aria-current` + scrolled into view;  favourites / view / open topics / folded groups stored per viewer;  `--ui-docs-nav-*` tokens on theme tokens;  `ui-navigate` + `focusSearch()` / `revealCurrent()` for a page's flyout;  48 tests, element + fallback + css);  ✅ `<ui-docs-search>` (the site search, in the nav's header band since epic `ui-docs-rework` P8:  the brand's 36px pill with a Cmd / Ctrl+K hint, an ARIA combobox over a results card (top-layer popover, anchored) grouped On this page (the page's sections, live from its DOM) / Components / Pages / Sections (every page's, `site/_data/search.json` from `tools/SiteSearchBuilder.ts`) / Attributes, ranked (`SearchIndex`), matches marked;  ↑ / ↓ / Enter / Escape / Tab, `/` and Cmd / Ctrl+K from anywhere (opening the flyout it's in);  results are links (`ui-navigate`, the router swaps the page);  `ui-input` still filters the nav;  44 tests, element + index + fallback + css, plus the builder's 2);  ✅ `<ui-docs-toc>` (a page's "On this page" rail menu:  level 2 headings as sections, examples / level 3 headings as entries, ids given where missing, follows the scroll and a `<ui-tabs>`' shown pane, shows the pane a hash names;  10 tests + fallback + css).  Site pages (P3):  template `packages/docs/content/templates/spell-ui-docs.html`, `yarn site:new`, `yarn site:check`, pilot `site/components/ui-button.html` |
| site data (`yarn site:data`) | ✅ | `site/_data/components.json` (every tag's vocabulary, families' tokens, topics), from the vocabularies + sheets + `site/_data/pages.json`;  committed;  `search.json` (every page's sections) beside the shared pages, `ui/_data/`;  `tools/SiteDataBuilder.test.ts` fails while stale |
| site bundle (`yarn site:bundle`) | ✅ | `site/_assets/` (committed):  `site.js` + `site.css` (eager ~345 kB, 85 kB gz), every family a lazy chunk;  icon packs linked from `src/icons/icon-packs`;  served at `/ui/` by the page server;  `yarn site:dev` rebuilds it on every edit.  The old Astro site is deleted (epic P7, 2026-10-03) |
| theming guide | ✅ | [`ui/theming.html`](../../../ui/theming.html), [`docs/theming.md`](theming.md) |
| translation contract | ✅ | [`docs/translation.md`](translation.md) (design only) |
| kitchen sink | ✅ | [`ui/kitchen-sink.html`](../../../ui/kitchen-sink.html):  every family's main example, live, generated by `yarn site:kitchen` (2026-10-03;  an Astro page from 2026-10-01) |
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
