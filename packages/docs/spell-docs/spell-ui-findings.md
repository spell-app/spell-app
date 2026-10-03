# @spell-app/ui findings from the `.html` docs

Problems in @spell-app/ui (`packages/ui`) met while building the `.html` docs with `ui-*` widgets:
`yarn docs:update` bundles UI into one classic script (`_assets/spell-ui.js`), and the pages open from file://.
Each finding:  component, symptom, repro, the workaround used here, a suggested fix.  Workarounds live in
`_assets/spell-doc.css`, `_assets/spell-doc-runtime.js` and `scripts/bundle-spell-ui.js`.

## Loading and bundling

1. **RESOLVED 2026-09-30.  Icons:  loader only via `import(new URL(..., import.meta.url))`**
   - resolved by UI's icon packs:  `UI.icons.register(name, svg)` + `UI.icons.reset()` are the documented way for
     non-ESM hosts, and `bundle-spell-ui.js` uses them (`spell-ui:icons`).  Kept for the record:
   - symptom:  glyph files load only by dynamic `import()` relative to the module;  from a classic script (IIFE
     bundle) or file:// they never load, and there's no hook to supply them another way
   - repro:  bundle `@spell-app/ui` as an IIFE, open a page with `<ui-input icon="search">` from file://
   - workaround:  the bundler writes a virtual module `spell-ui:glyphs` that registers the glyphs the page uses
     into `Icons` before UI loads (`bundle-spell-ui.js`)
   - suggest:  a public loader hook (`Icons.setLoader(name => ...)`) or `Icons.register(map)` documented as the
     way for non-ESM hosts

2. **RESOLVED 2026-10-01.  `Icons.get()` rejects, `IconGlyph.load()` is fire-and-forget**
   - the icon packs (2026-09-30) carried the same bug over:  with `BuiltInPacks.base` empty (an IIFE bundle),
     `UI.icons.get()` still rejected with `Invalid URL` unless the page `reset()` the packs first, as our bundle does
   - fixed 2026-10-01:  a pack with no usable URL counts as a failed pack (warned once);  `get()` / `use()` / `ready`
     never reject, and `IconGlyph.load()` catches (tests in `ui`'s `IconPacks.test.ts`).  Kept for the record:
   - symptom:  `Icons.get()` rejects with `Invalid URL` although its docs say it never rejects;  `IconGlyph.load()`
     doesn't catch, so every missing glyph is an unhandled page error
   - repro:  as 1, without pre-registered glyphs:  console shows `Uncaught (in promise) TypeError: Invalid URL`
   - workaround:  pre-registering every glyph used (as 1)
   - suggest:  resolve to `undefined` (or a fallback glyph) on any failure, as documented;  catch in `load()`

3. **Emoji data (~310 KB) and the Temporal polyfill (~58 KB) can't be left out of a single-file build**
   - symptom:  importing `@spell-app/ui` pulls both in, even for pages with no emoji / calendar widgets
   - repro:  bundle `import "@spell-app/ui"`;  inspect the output
   - workaround:  none, the bundle carries them (2 MB, 481 KB gzip)
   - 2026-10-01:  emoji names RESOLVED for this bundle.  UI's data chunks are named `dist/emoji/<set>/<letter>-<hash>.js`
     and `EmojiData.chunkLoader` is swappable, so `bundle-spell-ui.js` leaves them out and writes each as a classic
     script, `_assets/emoji/<set>/<letter>.js`, loaded on first use (both sets lazy).  Bundle:  1.75 MB, 403 KB gzip
     (was 2.36 MB / 533 KB with both sets inlined).  The Temporal polyfill is still inlined.
   - suggest:  keep them behind the families that need them, or a documented per-family entry that a bundler can
     tree-shake

4. **The fork's `packages/solid-element/node_modules` carries its own `solid-js` / `@solidjs/*`**
   - symptom:  bundling UI's dist naively resolves a second Solid from there:  two Solids, `NoOwnerError` everywhere
   - repro:  bundle `dist/index.js` with default resolution
   - workaround:  the bundler forces `solid-js`, `@solidjs/*` to UI's top-level `node_modules`, and checks there's
     exactly one copy
   - suggest:  dedupe the fork's install (peer deps only), or ship `solid-element` with Solid external

5. **UI's `yarn build` doesn't rebuild the fork, and resolves `@spell-app/solid-element` to the fork's `dist`**
   - symptom:  a change in the fork's source never reaches UI's `dist` until the fork is built by hand;  stale dist
   - repro:  edit `packages/solid-element/src`, run UI's `yarn build`, diff
   - workaround:  `bundle-spell-ui.js` builds the fork before UI
   - suggest:  make UI's build build the fork first (workspace `build` dependency), or alias to its source

## Elements

6. **`hidden` ignored on many hosts**
   - component:  `ui-button` (and `ui-dropdown`, `ui-popup`, `ui-modal`, `ui-flyout`, `ui-dimmer`, `ui-shape`,
     `ui-sidebar`, toast container, `ui-transition`)
   - symptom:  a layered `:host { display: ... }` beats the UA's `[hidden] { display: none }`, so `hidden` shows
   - repro:  `<ui-button hidden>x</ui-button>`
   - workaround:  `:is(ui-button, ui-item, ui-title, ui-content, ui-card)[hidden] { display: none }` in page CSS
   - suggest:  `:host([hidden]) { display: none }` in every component, as accordion / menu already have

7. **`ui-accordion` draws a panel for a `hidden` `ui-title`**
   - symptom:  the `<details>` row (arrow and all) renders though its title is hidden
   - repro:  `<ui-accordion><ui-title hidden>A</ui-title><ui-content>a</ui-content></ui-accordion>`
   - workaround:  the CHEATSHEET filter takes the pair out of the accordion (leaving a comment) and remaps
     `open` indexes (`filterContents()` in `spell-doc-runtime.js`)
   - suggest:  skip (or hide) panels whose title is `hidden`, and keep `open` indexes stable

8. **Nested `ui-accordion` inside a `styled` one draws its own bordered box** -- verified, unlike Fomantic
   - symptom:  a nested accordion inherits the outer one's private aliases, box ones included
     (`--_ui-accordion-background` / `-shadow`), so it gets a second card with a shadow;  Fomantic's nested
     `.accordion` (no `ui`) has no box
   - repro:  `<ui-accordion styled open="0"><ui-title>Outer</ui-title><ui-content><ui-accordion open="0">`
     `<ui-title>Nested</ui-title><ui-content>x</ui-content></ui-accordion></ui-content></ui-accordion>`
   - workaround:  none needed here (the docs nest only plain accordions)
   - suggest:  `.accordion:not(.ui) { background: none; box-shadow: none; border-radius: 0 }`

9. **`ui-accordion`:  nested accordions ignore their own public tokens**
   - symptom:  by design a nested root reads the OUTER one's resolved aliases, so `--ui-accordion-title-padding`
     etc. set on a nested host do nothing;  per-level looks (a tree of contents) need `::part()`
   - repro:  set `--ui-accordion-title-padding: 0` on a nested `<ui-accordion>`:  no change
   - workaround:  `ui-accordion.spell-toc ui-accordion::part(title) { padding: 0 }`
   - suggest:  let a nested root re-read the public tokens when they're set on its own host (e.g. `@property`
     with `inherits: false` for the public tokens, or a `nested-*` token set)

10. **`ui-accordion`:  arrow centred on a wrapped title**
    - symptom:  the title is `display: flex; align-items: center`, so on a two-line title the arrow sits between
      the lines;  Fomantic's title is a block with an inline icon, on the FIRST line.  `align-items: baseline`
      doesn't help when the slotted content is an inline-block (its baseline is its last line)
    - repro:  `<ui-accordion style="width: 200px"><ui-title><a href="#">A long title that wraps onto two
      lines</a></ui-title><ui-content>x</ui-content></ui-accordion>`
    - workaround:  `::part(title) { align-items: flex-start }` + `::part(icon) { margin-top: calc(2px + 0.15em) }`
    - suggest:  `align-items: first baseline` with the icon given a real baseline, or a
      `--ui-accordion-icon-align` token

11. **`ui-accordion`:  `styled` hard-codes `width: 37.5em`, so `--ui-accordion-width` loses**
    - symptom:  the variation writes the private alias, beating the public token set on the host
    - repro:  `<ui-accordion styled style="--ui-accordion-width: 100%">`:  still 37.5em
    - workaround:  `ui-accordion.spell-code::part(accordion) { width: 100% }`
    - suggest:  variations should default the public token (`var(--ui-accordion-width, 37.5em)`) instead of
      overriding it;  same pattern for the other variation-swapped tokens

12. **`ui-input`:  the `ui-input` event fires before `el.value` updates**
    - symptom:  reading `event.target.value` in a `ui-input` handler gives the previous value
    - repro:  `el.addEventListener("ui-input", () => console.log(el.value))`, type `a`:  logs `""`
    - workaround:  read `event.detail.value`
    - suggest:  update the property before emitting, as native `input` does

13. **`vertical text` `ui-menu`:  a gap under one-item menus;  padding / active background not themeable**
    - symptom:  Fomantic's `min-height: calc(0.92857em * 2 + 1em)` makes a one-item menu taller than its item;
      the `text` variation swaps the item padding / margin and the menu margin, and `active` (`selected`) draws
      its own background, so the public tokens can't reach them
    - repro:  `<ui-menu vertical text><ui-item>One</ui-item></ui-menu>`
    - workaround:  `ui-menu::part(menu) { margin: 0; min-height: 0 }`, `ui-item::part(item) { padding; margin }`,
      `ui-item[selected]::part(item) { background }`
    - suggest:  drop the min-height for `vertical`, and read public tokens in the `text` variation

14. **`ui-sticky`:  every sticky shares `--ui-z-sticky`**
    - symptom:  nested sticky headers (h2 above h3) need per-level z-index;  `--ui-sticky-z-index` works but isn't
      documented as the way
    - repro:  two nested sections, each heading in a `ui-sticky`:  the h3 slides OVER the h2 at the hand-off
    - workaround:  `ui-sticky.spell-h2 { --ui-sticky-z-index: 4 }`, `.spell-h3 { ... 3 }`
    - suggest:  document `--ui-sticky-z-index` for stacked stickies (docs gap)

15. **`ui-message`:  a `state` message tints ALL its text, and `--ui-message-color` can't change it**
    - symptom:  the root's `color: var(--ui-color-text, var(--_ui-message-color))` -- the state remap sets
      `--ui-color-text`, so the public `--ui-message-color` never wins;  long prose / lists in a warning read in
      brown, a negative one in red
    - repro:  `<ui-message state="warning" style="--ui-message-color: blue"><p>body</p></ui-message>`:  brown
    - workaround:  `ui-message::part(message) { color: ... }` (the header keeps its tint:  it reads
      `--ui-color-header`)
    - suggest:  let `--ui-message-color` win over the remap (`var(--ui-message-color, var(--ui-color-text, ...))`),
      or a `--ui-message-body-color` token

16. **`ui-cards`:  no responsive grid;  `ui-card` hosts are `display: contents`**
    - symptom:  a group is Fomantic's flex row with fixed card widths / margins;  "as many as fit, min N px" (CSS
      grid `auto-fill`) has no variation or token, and a grid style on a `<ui-card>` host does nothing
    - repro:  `<ui-cards>` of five cards in an 880px column:  fixed widths, ragged row
    - workaround:  `ui-cards::part(group) { display: grid; grid-template-columns: repeat(auto-fill, minmax(...)) }`
      and `ui-card::part(card) { width: auto; margin: 0 }`;  spanning cards via `data-spell-wide` +
      `::part(card) { grid-column: 1 / -1 }`
    - suggest:  a `grid` / `auto` variation reading `--ui-cards-min-width` and `--ui-cards-gap`

17. **`ui-accordion`:  no way to show a title with nothing to open**
    - symptom:  every `ui-title` gets an expand arrow, even when its `ui-content` is empty;  a contents sidebar's h2
      with no sub-headings (the docs index's "Plans") offers to open into nothing
    - repro:  `<ui-accordion><ui-title>Leaf</ui-title><ui-content></ui-content></ui-accordion>`:  arrow, opens empty
    - workaround:  none yet (cosmetic);  the old static sidebars had the same arrow
    - suggest:  hide the icon and skip toggling when the content is empty, or a `leaf` attribute on `ui-title`

18. **`ui-segment`:  a top-`attached` `ui-label` takes no room, so it covers the segment's first line**
    - symptom:  Fomantic pads the element after a `.ui.attached.label:first-child`;  as elements the label and the
      next child are both slotted light DOM, and `::slotted()` takes only a compound selector, so nothing makes room
    - repro:  `<ui-segment><ui-label attached="top">For</ui-label><ul><li>covered</li></ul></ui-segment>`
    - workaround:  `ui-grid.spell-pros-cons ul { margin-top: 2.2em }` (durable template, "Trade-offs")
    - suggest:  the segment pads its top while it has a top-attached label (`:has()` on the host, or a state the
      label sets), as Fomantic does

19. **`ui-tabs`:  a dark rule above the pane, even `basic`**
    - symptom:  `pointing secondary` tabs draw a dark line across the top of the active pane, under the tab bar's own
      rule, so the bar looks underlined twice;  `basic` drops the pane's box but not that line
    - repro:  `<ui-tabs pointing secondary basic><ui-tab label="A">a</ui-tab><ui-tab label="B">b</ui-tab></ui-tabs>`
    - workaround:  none (cosmetic);  the templates use it as is
    - suggest:  a `secondary` / `basic` tab set's panes have no top border (Fomantic's `.ui.tab.segment` under a
      `secondary pointing menu` is usually `basic`)

20. **`ui-select`:  its own empty placeholder option, plus an item with `value=""`, shows two blank-ish options**
    - symptom:  the select always adds an empty first option while nothing is chosen;  an "any" item with
      `value=""` is then a second empty choice, and the closed select shows the blank one
    - repro:  `<ui-select value=""><ui-item value="">any</ui-item><ui-item value="a">a</ui-item></ui-select>`
    - workaround:  `placeholder="any badge"`, and no `value=""` item (cheatsheet badge filter)
    - suggest:  document `placeholder` as the "no choice" option, or treat a `value=""` item as the placeholder

21. **`ui-item`'s `icon` shorthand draws nothing in a `vertical text` `ui-menu`**
    - symptom:  an icon-only item (`icon`, no text) renders its `<svg>`, but the `.icon` box and the svg compute
      `0px` x `0px`
    - repro:  `<ui-menu vertical text><ui-item href="#a" icon="lightbulb"></ui-item></ui-menu>` (with or without the
      menu's `icon` variation)
    - workaround:  the rail slots a `<ui-icon name>` into the item instead (`buildRail()` in `spell-doc-runtime.js`)
    - suggest:  `SUSPECTED-BUGS.md`, `## ui`;  measure the shorthand's svg in a menu example

22. **`ui-sticky` covered what Page Down scrolled to** -- fixed in `packages/ui` (2026-10-01)
    - symptom:  Page Down / Space scrolled a full viewport, so the lines that ended under the stuck headers were
      never seen
    - fix:  a stuck `<ui-sticky>` sets its scroll container's `scroll-padding-top` (`-bottom` at the bottom edge) to
      the lowest stuck edge;  a column-shaped sticky (the contents) reserves nothing.  Chromium and Firefox page by
      it;  Safari still pages the full viewport

23. **`ui-section`:  no token for space ABOVE only, nor for the content's line height**
    - symptom:  `--ui-section-margin` sets both edges, so a page whose sections space themselves from above (as
      the `section.s2` pages did) gets a bottom margin too, which comes between the content and the host's
      `::after` (plan docs' "none yet");  `.ui.section` sets `line-height: var(--ui-line-height)` (1.43), so
      slotted prose loses the page's 1.6
    - repro:  `<ui-section header="A"><p>...</p></ui-section>` in a page with `body { line-height: 1.6 }`, and
      `ui-section::after { content: "x" }` on a section that isn't its parent's last child
    - workaround:  `ui-section::part(section) { margin-bottom: 0; line-height: inherit }` (`spell-doc.css`)
    - suggest:  `--ui-section-margin-top` / `-bottom` (defaulting to `--ui-section-margin`);  let the content
      inherit its line height, or a `--ui-section-line-height` token

24. **`ui-section`:  a `#hash` load opens a folded section itself, animated, before a page script can land**
    - not a bug:  Chrome reveals `hidden="until-found"` content for fragment navigation (`beforematch`), so the
      section unfolds with its height transition and announces a non-cancelable `ui-open`, as for find-in-page
    - what it means for a page:  the target moves a few pixels while the fold grows;  and a page that saves folds
      from `ui-open` would save the browser's reveal as the reader's
    - workaround:  the runtime ignores non-cancelable `ui-open`s when saving folds, unfolds for links with
      `--ui-section-duration: 0s`, and lands again after the transition's time unless the reader scrolled
    - suggest:  document it in `site/components/ui-section.html`'s Usage tab;  maybe put `originalEvent` (the `beforematch`) in the
      detail, so a listener can tell the browser's reveal from the reader's click

25. **`ui-section`:  a slotted `<ui-icon slot="icon">` sits further from the title than the `icon` shorthand**
    - cosmetic:  the shorthand's `<svg>` is sized by the section (`height: 1em`), a slotted `<ui-icon>` keeps its own
      box and margins, so a page mixing both has two icon gaps
    - repro:  `<ui-section header="A" icon="bug">` above `<ui-section header="B"><ui-icon slot="icon" name="bug">`
    - workaround:  none:  pages use the slotted form (the test page shows both)
    - suggest:  `::slotted(ui-icon)` in the icon box:  no margin, `1em` box

26. **`ui-section`:  the content clips the bottom edge of a card or styled accordion that ends it**
    - symptom:  the last row of a `ui-cards` grid at the end of a section loses its bottom border (found 2026-10-02,
      when the docs index moved to `<ui-section>`)
    - cause:  for the fold animation the content part is `overflow-y: clip` (`:host(:state(animated))`);  a card's
      border and shadow are box-shadows drawn outside its box, and the last child's bottom margin collapses out
      of the content, so the clip edge is the card's own bottom edge.  `overflow-clip-margin` would fix it, but
      Chromium applies it only when BOTH axes clip
    - repro:  `<ui-section header="A"><ui-cards><ui-card>...</ui-card></ui-cards></ui-section>`:  no bottom border
    - workaround:  `ui-section::part(content) { overflow: clip; overflow-clip-margin: 6px }` (`spell-doc.css`)
    - suggest:  the same in `ui-section.css` (clip both axes with a small clip margin, or a
      `--ui-section-clip-margin` token)

## Verified working (no action)

- find-in-page / text fragments open a folded `ui-accordion` panel (native `<details>`), and the accordion
  adopts it:  `open` becomes `"0"`
- `ui-input type="search"`:  the native clear button and Escape clear it, and `ui-input` fires
- keyboard:  Tab reaches each accordion title's `<summary>`, Enter / Space toggle it and announce `ui-open` /
  `ui-close`, as a native `<details>`
