# Changelog

All notable changes to `@spell-app/ui`.  Format:  [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);  versions
follow [Semantic Versioning](https://semver.org/) once 1.0 ships (before that, a minor version may break).

## Unreleased

First public version:  Fomantic UI 2.9.4's vocabulary as `ui-*` custom elements on modern CSS, built on Solid 2.

### Added

- **`<ui-root>`**:  the top of a page or app.  Loads the families its subtree uses on demand, sets `icons`, `emoji`,
  `assets`, theme and size for what's inside, and hides it until every component is ready.
- **54 component families**, each with its vocabulary, a full CSS port of Fomantic's `.less` / `.variables`, a native
  (no-Solid) fallback, class-grammar and element examples, and a docs page:
  - elements:  button, container, divider, emoji, flag, icon, image, input, label, list, loader, parts (header,
    content, meta, description, extra ...), placeholder, rail, reveal, section, segment, step, text
  - collections:  breadcrumb, form, grid, menu, message, table
  - views:  ad, card, comment, feed, item / items, statistic
  - modules:  accordion, calendar, checkbox / radio / toggle, dimmer, dropdown, embed, flyout, modal, nag, popup,
    progress, rating, search, select, shape, sidebar, slider, sticky, tab, toast, transition, visibility
- **Source elements** (ours):  `<ui-include>` shows another page of the site, `<ui-code>` highlighted code
  (highlight.js, loaded lazily;  `UI.code.register()` adds languages;  spell's own colours), `<ui-markdown>` GitHub
  markdown (marked + DOMPurify, loaded lazily);  each takes inline text or a
  same-origin `source` through `UI.sources`, shows loading / error states, and has `content` / `save()` for editors
  (a page registers `UI.sources.saver`).
- **Shared runtime** `UI` (one per page, loaded lazily):  keyboard, overlays, focus, styles, vocabulary, i18n,
  transitions, ids, toasts, modals, `UI.api`, `UI.icons`, and `UI.browser.supports` feature flags.
- **Icon packs**:  icons are SVG files in packs (Font Awesome 7 Free by default;  FA7 Brands and Fomantic's names
  opt-in) loaded by `UI.icons`;  `<ui-root icons>` adds packs per subtree, `UI.icons.use()` page-wide;
  `yarn icons:pack` builds and verifies your own pack.
- **Theming**:  OKLCH tokens, `@layer`s, light / dark, and public `--ui-<component>-*` tokens that reach the box from
  the page, an ancestor, the host or `::part()`.
- **Translation**:  every attribute, value, event, slot, part and text string comes from a vocabulary file, so tag
  sets can be translated (design:  `docs/translation.md`).
- **Fallbacks**:  an element whose render throws shows a native fallback, gets `:state(errored)` and dispatches a
  cancelable `ui-error`;  siblings keep working.
- **Invoker commands**:  `<ui-button commandfor command>` forwards to its inner `<button>`, with a JS fallback for
  browsers without invokers (`UI.browser.supports.invokers`);  modal, flyout, sidebar, dimmer, popup and dropdown
  answer `--show`, `--close` and `--toggle`;  toast answers `--close`.
- Modal `closedby="any | closerequest | none"`;  `closable="false"` keeps Fomantic's meaning (no icon, no dismissal).
- Popup `hoverable` (on by default, WCAG 1.4.13);  `hoverable="false"` is Fomantic's default behaviour.
- Emoji names are CLDR shortcodes (words joined any way:  `thumbs up`, `thumbsUp`);  a page opts in to Fomantic's names
  with `<ui-root emoji="fomantic">` or `EmojiData.use("fomantic")`.
- Sidebar and flyout `width` take Fomantic's words (`very thin` ... `very wide`) and columns / fractions / %.
- `<ui-section>` (ours, not Fomantic's):  a titled section with a real heading (`level`, default one below the
  enclosing section's), icon, badge and actions;  `collapsible` (controlled `collapsed`, cancelable `ui-open` /
  `ui-close`, find-in-page unfolds it) and `sticky` titles that stack when nested;  Fomantic's segment, header and
  styled-accordion looks (`dividing`, `block`, `bordered`, `styled` ...).
- `<ui-sticky>` reserves its room while stuck:  the scroll container's `scroll-padding-top` / `-bottom`, so Page Down,
  Space, focus and `scrollIntoView()` keep content out from under it (not for sticky columns, e.g. a rail's).
- Container scrolling height per breakpoint:  `--ui-container-scrolling-height-{tablet,computer,widescreen}`.
- Works from any framework or plain HTML;  checked with vanilla, React 19, Vue 3, Solid 2 and Solid 1.9 hosts
  (`yarn smoke`), server-rendered to Declarative Shadow DOM, and hot-reloaded in Vite.

### Known limits

- Visual baselines exist for macOS only (chromium, firefox, webkit);  Linux baselines wait on a working Docker.
- Average family size is 7.3 kB gzip own code (budget 8 kB);  the lazy runtime is 31 kB.
- Open items:  `SUSPECTED-BUGS.md` (`## ui`) and `docs/status.md` ("Deferred", "To review").
