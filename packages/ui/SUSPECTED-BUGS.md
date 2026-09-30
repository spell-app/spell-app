# Suspected bugs

Things that look like bugs but haven't been confirmed.  Add to the right section;  when one is confirmed and
fixed, or disproven, delete it (note a disproof in a line at the top if the reasoning is worth keeping).
`[V]` = checked against the code by hand.  Everything else is unverified.

Disproven:  `Icons.get("zoom")` isn't missing -- it is Font Awesome's `zoom` BRAND logo (a documented clash;  Fomantic's magnifier
is `<html ui-icon-names="fomantic">` or `magnifying-glass-plus`), pinned in `Icons.test.ts`.  (2026-09-30:  `Icons` is gone;
with icon packs `zoom` is in `fa7-brands`, and the `fomantic` pack gives the magnifier.)

Entry format:  `` - `path/to/file.ts` `symbol()`: what looks wrong, why, and how to prove it. ``

## 1. Behavior bugs

- `src/elements/UIElement.tsx` `mount()`:  errors thrown in a `createEffect` COMPUTE set up there (e.g.
  `hostStates()`) never reach the fork's error boundary -- logged, but no `:state(errored)` and no fallback.  The
  table family switched its class-mirror effect to `createRenderEffect` to get the fallback (`table.test.tsx`).
- `src/components/checkbox/UIRadio.tsx` `keyDown()` + `RadioGroup.step()`:  neither checks `readonly`, so arrow keys
  probably change a read-only radio group (clicks are cancelled, arrows aren't).  Prove:  a `readonly` group, focus
  the chosen radio, press Arrow Down.  (Docs pass, 2026-09-30.)
- `src/components/search/UISearch.tsx` results rendering:  dev Solid logs `STRICT_READ_UNTRACKED ... read directly in
  <For>` (path `<Show> › div.children › <Show> › <Show> › <Show> › <For>`) when a search renders its results open
  from the start (`open value="a"`, a `category` search too), so some result data may not update reactively.  Prove:
  load `/components/search/` under `yarn site:dev` and watch the console.  (Docs pass, 2026-09-30.)
- `src/components/search/search.vocabulary.en.ts` `parts`:  the root `<div class="ui search">`, which declares every
  `--ui-search-*` token, has no part name, so tokens read at the root can't be themed from the page (the docs use
  `::part(input)` / `::part(results)`, which cover the tokens used there).  (Docs pass, 2026-09-30.)

## 2. Accessibility
- `src/components/breadcrumb/examples/elements/states.html` line 5:  this `<ui-breadcrumb>` has no `aria-label`, so on
  a page with other breadcrumbs two `<nav>` landmarks share the default name.  The docs page adds one.  (Docs pass,
  2026-09-30.)

## 3. Styling / CSS

- `src/components/calendar/calendar.css` field width (visual tests, 2026-09-30):  a `<ui-calendar>` field has no
  width of its own, so it takes the browser's default `<input>` width -- 235px in chromium, 258px in webkit, 278px in
  firefox.  The date-time field then cuts its value ("September 30, 2026 at 2:3" in chromium), and in webkit the
  "Year" field wraps to a second row.  Screenshots:  `test/visual/baselines/local-darwin/{chromium,webkit,firefox}/
  calendar/types-light.png`.
- `src/components/dropdown/dropdown.css` multiple selection, open (visual tests, 2026-09-30):  the open menu of a
  `fluid multiple selection` dropdown with two values chosen ends ~10px ABOVE the field's own border, which shows
  as an empty bordered strip under the last item.  Screenshots:  `test/visual/baselines/local-darwin/*/dropdown/
  types.open-multiple-light.png` (and `-dark`).
- `src/components/dropdown/dropdown.css` anchored menu (visual tests, 2026-09-30):  the example's "Open selection"
  dropdown (open from the start, below the 768px viewport) opens its menu UPWARDS in webkit and downwards in
  chromium / firefox, although the page has room below.  Maybe webkit's position-try measures against the viewport
  while the anchor is scrolled out of it.  Screenshots:  `test/visual/baselines/local-darwin/webkit/dropdown/
  types-light.png` vs `.../chromium/dropdown/types-light.png`.
- `src/components/image/image.css` class grammar on the page (visual tests `--parity`, 2026-09-30):  the static
  `<div class="ui mini centered circular images">` of `image/examples/groups.html` renders its `<img>`s at full width
  (circles ~700px across);  the element markup (`<ui-images size="mini" centered circular>`) gets 35px avatars.
  The `mini` size seems not to reach page-level images in a group.  Prove:  `yarn test:visual --os local --browsers
  chrome --grep image/groups --parity`, then `tools/results/visual/local-darwin/parity/chromium/image-groups.png`.
- `src/components/card/card.css` links in a card (visual tests, 2026-09-30):  a card's `href` header and the extra
  content's link are underlined, including the space between the icon and "22 Friends";  Fomantic's card links are
  not underlined (colour and hover only).  Maybe deliberate (links distinguishable without colour, WCAG 1.4.1):
  decide, then fix or note.  Screenshot:  `test/visual/baselines/local-darwin/chromium/card/types-dark.png`.

- `src/components/items/items.css` / `card.css` / `grid.css`:  a group host that is a size container
  (`container-type: inline-size`) seems to keep its root's top margin from collapsing with the heading above it, so
  element markup shows a bigger gap than the static class grammar (seen in the Items examples' screenshots).
  Prove:  compare `<h4>` bottom to the first item's top in both columns of `yarn dev`.
- `src/components/items/items.css` mobile stacking:  Fomantic's `.ui.items > .item > .image { width: auto }` also
  sizes a static `ui tiny image` to its NATURAL width (ported faithfully);  a `<ui-image size="tiny">` element keeps
  80px.  Static and element markup differ below 768px.

- `src/components/list/list.css` + `parts.css`:  a slotted `<img>` / `<ui-image>` followed by `<ui-content>` in a
  list item puts the content BELOW the image:  `parts.css` makes content after a first child a table cell, but
  the image is an inline block.  The `image` shorthand works (`--ui-item-media: image`);  a clean fix needs an
  image owner-display token in `image.css`.
- `test/sheets.ts` `Sheets.classPhrases()`:  probes `"equal"` for EVERY `width` attribute, so a width without
  `canEqual` logs a `ClassBuilder` dev warning in css tests.  Harmless noise.
- [V] `src/components/table/table.css` ~line 977:  every `<ui-table>` narrower than 768px of its OWN width stacks unless
  `unstackable` (Fomantic's default is by viewport).  The docs site's example column is ~655px at every window
  width, so every table example on `/components/table/` shows the stacked mobile layout (a `site-note` on the page
  says so).  Maybe only `stackable` tables should follow the host's width, or the default should stay viewport-based.
- `src/components/grid/examples/elements/responsive.html` (Doubling, Reversed, "Width per device") and
  `src/components/image/examples/elements/variations.html` (Size):  fixed 850 / 1000 / 1200px wrappers overflow a
  normal page column;  the docs pages clamp them (`max-width` + `resize`) or trim sizes.
- `src/styles/native.css` ~lines 182-221:  `data-variation="visible"` shows the CSS-only tooltip but the full-size
  transform only applies on `:hover` / `:focus-visible`, so a `visible` tooltip stays at 80% scale.  Unverified.
- `src/components/popup/examples/elements/types.html`:  `data-tooltip` on a `<ui-button>` (a focus-delegating host)
  may never match `:focus-visible` on the host, so the CSS tooltip may not show on keyboard focus.  Unverified.

- [V] `src/components/segment/segment.css` + `UISegment.tsx`:  `<ui-segments inverted>` doesn't invert its members:  a
  member `<ui-segment>` stays light and white (static `.ui.inverted.segments > .ui.segment` too:  the member root keeps
  the light scheme, so `--ui-segment-inverted-background` resolves white).  A fix needs the group to hand a private
  token down AND `UISegment`'s inline `--ui-inverted: 0` on its root (which beats the sheet) to follow it.  Checked
  in a browser probe, 2026-09-30.
- [V] `src/components/label/label.css`:  an un-coloured `<ui-label>` inside a `ui-red` wrapper (or any ancestor setting
  `--ui-color`) paints red:  nothing resets the colour tokens, by design for `<ui-labels color>`.  Statistic, menu and
  segment reset them (host / slot);  label probably wants the statistic's pattern (host reset + a private group
  token).  Checked in a browser probe, 2026-09-30.
- `src/components/dimmer/examples/elements/types.html` / `variations.html`:  `style="min-height: ..."` on
  `<ui-segment>` does nothing (the host is `display: contents`, see `PAPERCUTS.md`), so the "Content dimmer" box is
  too short for its header and button.  The docs page puts the height on an inner `<p>`.
- `src/components/menu/menu.css`:  `--_ui-menu-only-radius` (was `--ui-menu-only-radius`) has no base value on the
  menu root -- only `vertical` and `fixed` set it -- so a menu nested inside a vertical menu (a sub-menu, or a new
  top-level menu in an item) inherits the outer vertical radius for an only-child item, instead of falling back to
  its own first-item corners.  Pre-existing;  kept as is by the token conversion (look unchanged).  (2026-09-30)
- `src/components/popup/popup.css` `.ui.popup` transition:  it reads `--_ui-popup-duration`, declared only on
  `:host`, so static class-grammar popups (no host) get an invalid `transition` (none at all).  Pre-existing (it read
  the public name, also only declared on `:host`);  kept by the token conversion (look unchanged).  Prove:
  `getComputedStyle(staticPopup).transitionDuration`.  (2026-09-30)
- `src/components/feed/feed.css`, `comment.css`:  the tokens live on the LIST root (`.ui.feed`, `.ui.comments`) and
  events / comments only read them, so a lone `<ui-event>` / `<ui-comment>` outside a list resolves every
  `var(--_ui-feed-*)` to nothing (no event padding, label width ...).  Pre-existing;  kept by the token conversion.
  Prove:  render `<ui-event image="...">` alone and read its label box width.  (2026-09-30)

## 4. Types / API surface

- `src/components/emoji/emoji.vocabulary.en.ts:38`:  says "`Thumbs Up` works too", but that becomes `thumbs_up`,
  which isn't in the data (`thumbsup` is), so it draws nothing.  `emoji.test.tsx:30` only tests the spelling
  conversion.  Fix the doc or add an alias.
- `src/components/emoji/emoji.css:59` `--ui-emoji-size-medium: 3`:  never used by the element (`medium` emits no
  class), only by hand-written class grammar;  listed as a token anyway.

- `src/components/form/form.css` lines 93-94:  `--ui-form-equal-width` and `--ui-form-unstackable` are internal 0/1
  switches but carry the public `--ui-form-` prefix, so the docs' generated token table lists them as public.
- `src/components/input/input.vocabulary.en.ts` ~line 95:  `label` is described as "Label text", but with
  `labeled="corner"` / `"left corner"` it's read as an ICON name (`UIInput.cornerGlyph`).
- `src/components/message/examples/elements/content.html` line 15:  the "List" example says "Only the header, no
  content block" but has no header.
- `site/src/content/components/button.mdx` / `dropdown.mdx` "Framework usage":  the Solid 2 snippets use
  `on:ui-toggle` / `on:ui-change`;  AGENTS.md says Solid 2 has no `on:` namespace (a `ref` + `addEventListener`,
  as `tools/frameworks/solid/app.tsx`).  The new pages use the `ref` pattern.
