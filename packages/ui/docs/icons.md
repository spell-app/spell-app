# Icons:  packs of SVG files

Icons are plain `.svg` files in **packs**.  A pack is a folder of SVGs plus a generated index, `pack.js`, listing
each icon's file, size and extra names.  The page's packs live in the shared runtime, `UI.icons`
(`src/runtime/IconPacks.ts`);  `<ui-icon>` and every component's `icon` shorthand ask it for a name, and it
decides which file to load.

- `src/icons/` -- the pack FORMAT and the names around it:  `icons.types.ts` (`IconPackIndex` ...), `IconName`
  (normalizing and claiming names), `BuiltInPacks` (where the shipped packs live), and the packs themselves in
  `icon-packs/`
- `src/runtime/IconPack.ts` / `IconPacks.ts` -- loading, resolving and caching (`UI.icons`)
- `tools/IconPackBuilder.ts` -- turns a folder of SVGs into a pack (`yarn icons:pack`)
- `scripts/gen-icons.ts` -- builds the three built-in packs from Font Awesome's npm package

DECISIONS (Owen, 2026-09-30), replacing the one-ES-module-per-glyph layout of 2026-09-29 ("Loading strategies"
below):

- Icons ship as SVG files so another set (Lucide, Font Awesome Pro) is a pack away.
- Font Awesome 7 Free ships in `dist`;  loading it from jsDelivr is opt-in (`base`).
- FA's files keep their licence comment:  FA's IP, the attribution stays.
- Default pack:  FA7 solid + regular, plus a hand-picked list of extras.  Brands and Fomantic's names are opt-in
  packs.
- Opt-in per subtree from HTML (`<ui-root icons>`) and page-wide from JS (`UI.icons.use()`).
- The pack added LAST wins a name;  `prefix:name` picks a pack.
- ONE name per icon, words separated by spaces:  `address book`, `address book outline`, `github`.  No style /
  variant axis, no word-order guessing.
- Aliases live in the pack index, per icon, so a pack can be hand-edited to add or change names.

## Names

An icon's name comes from its file name, dashes -> spaces:  `solid/address-book.svg` is `address book`.  Its
`alias`es are more names.  The folder is never part of a name.

- Input is normalized the same way (`IconName.normalize()`):  lowercase, runs of dashes / underscores / spaces ->
  one space.  So `Address-Book`, `address_book` and `address book` are one name, and names pasted from Font
  Awesome's site work.
- `lucide:bell` asks one pack:  its `id`, or the `prefix` it was added with.  Only the first `:` splits.
- `<ui-icon name="bell" outline>` ~== `name="bell outline"`:  Fomantic's `bell outline icon` spelling.
- **Within one pack** (`IconName.claim()`):
  - an explicit `alias` beats a name derived from a file name
  - otherwise the FIRST entry to claim a name keeps it
  - Why aliases win:  a hand-edit (or the Fomantic pack) must be able to take a word from a file name, e.g. alias
    `shield` on `solid/shield-halved` over the file `solid/shield`.
  - So in `fa7-free`, `bell` is `solid/bell` (solid is listed first) and `regular/bell` is reached by its alias
    `bell outline`.
- **Across packs:**  the last pack added that has the name wins.

## Packs

```
fa7-free/
  pack.js
  solid/address-book.svg      Font Awesome's own files and layout (svgs/<style>/<name>.svg)
  regular/address-book.svg
```

```js
export default {
  "id": "fa7-free",
  "label": "Font Awesome 7 Free",
  "license": "Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com (Icons: CC BY 4.0)",
  "defaults": {"width":512,"height":512},
  "icons": {
    "solid/address-book": {"width":448},
    "solid/gear": {"alias":["cog","setting"]},
    "regular/address-book": {"width":448,"alias":"address book outline"}
  }
}
```

- `icons` keys are SVG paths relative to the pack's **base**, without `.svg`.  The base defaults to the folder
  `pack.js` was loaded from;  `use(…, { base })` re-points it (relative to the page);  for the built-in packs, `<ui-root assets>` does.
- `defaults` apply to every entry that doesn't set its own (`width`, `height`).
- `alias`:  a string or a list.
- One icon per line, so a hand-edit is a one-line diff;  re-running the builder keeps it (see "Building a pack").
- The index is what makes lookups cheap:  the runtime knows synchronously whether a name exists, which file it
  is and its size, so an unknown name costs no request.

### Built-in packs

In `src/icons/icon-packs/`, copied to `dist/icon-packs/` by `emitIconPacks()` (`vite.config.ts`):

| Pack | Icons | Index gzip | What |
| --- | ---: | ---: | --- |
| `fa7-free` | 1,595 | 14.2 KB | solid + regular (`… outline`) + the extras;  **the default** |
| `fa7-brands` | 572 | 4.1 KB | every Font Awesome 7 Free brand icon |
| `fomantic` | 1,593 entries, 1,938 names | 18.2 KB | Fomantic-UI's names, pointing into the two FA folders |

- The extras (`scripts/icon-extras.ts`, hand-picked, edit freely):  the brands our own examples use (`discord`,
  `github`, `medium`, `twitter`) and the Fomantic names they use (`help`, `mail`, `setting`, `linkify`, as
  aliases).  Everything else:  `<ui-root icons="fa7-brands">` / `<ui-root icons="fomantic">`.
- FA's own aliases (`cog` -> `gear`, `contact book` -> `address book`) are aliases in both FA packs;  on a regular
  icon with ` outline` added (`contact book outline`).
- `fomantic` ships no SVGs:  its keys point at the FA folders beside it (`"../fa7-free/solid/gear"`), so a page
  using it with `fa7-free` fetches each file once (same URL).  It needs those folders DEPLOYED beside it, not their
  packs added.

### Clashes:  whichever pack comes last

27 Fomantic names mean a DIFFERENT icon in Font Awesome (at FA 7.3.1):

| Typed | `fa7-free` (default) | `fomantic` |
| --- | --- | --- |
| `x` | `x` (the letter) | `xmark` (close) |
| `warning` | `triangle-exclamation` | `exclamation` |
| `sign in` / `sign out` | `arrow-right-to-bracket` / `arrow-right-from-bracket` | `right-to-bracket` / `right-from-bracket` |
| `desktop`, `computer` | `desktop`, `computer` | `display` |
| ... | | |

- The default pack gives Font Awesome's meaning.  Adding `fomantic` (after the default, as `<ui-root icons="fomantic">` does)
  gives Fomantic's, because the last pack wins.  This replaces the old `<html ui-icon-names="fomantic">` switch
  and `fomantic-clashes.json`.
- `fa7-free:x` or an unambiguous name (`xmark`) always means one icon.

### How Fomantic's names were matched (`scripts/gen-icons.ts`)

From `reference/Fomantic-UI/src/themes/default/elements/icon.variables`:  `@icon-map`, `@icon-aliases-map`,
`@icon-deprecated-map`, `@icon-outline-map` (+ aliases), `@icon-brand-map` (+ aliases);  first map to define a
name wins, `_` -> space.

- Matched to a Font Awesome icon by UNICODE CODEPOINT:  Fomantic's LESS still points at Font Awesome 5's
  private-use codepoints, which usually still identify the same icon in FA7's `unicode` field, or in
  `aliases.unicodes.primary`, where FA7 keeps the codepoints of icons it merged into another (`user alternate` ->
  `user`).
- 21 by hand (`MANUAL_OVERRIDES`):  20 renames FA6 moved onto the plain ASCII character (`add` -> `plus`,
  `help` -> `question`, `warning` -> `exclamation` ...), each checked against FA's metadata, and one stand-in
  (`vector square` -> `object-group`:  FA7 Free dropped `vector-square`).
- Style from the map the name came from:  outline maps -> regular only;  brand maps -> brands, else solid;  other
  maps -> solid, else brands (Fomantic's deprecated map holds brand icons too, e.g. `linkedin in`).
- 2 left out:  `acquisitions incorporated` and `penny arcade`, which Font Awesome Free no longer ships.

## Using packs on a page

Per subtree, with `<ui-root>`:

```html
<ui-root icons="fa7-brands">...</ui-root>                                   <!-- a built-in pack -->
<ui-root icons="fa7-free, fomantic, /icons/lucide/pack.js">...</ui-root>   <!-- several, later wins -->
<ui-root icons="fomantic" assets="/assets/ui/">...</ui-root>              <!-- built-ins load from /assets/ui/icon-packs/ -->
```

- `icons`:  a COMMA-separated list (spaces around the commas ignored) of built-in ids (`fa7-free`, `fa7-brands`,
  `fomantic`) or `pack.js` URLs (relative to the page).  The last pack in the list wins a name.
- A root's packs are a CHILD set over the outer root's (or the page's):  they win, the outer ones answer what they
  don't, so nested roots inherit and add.
- `assets`:  the folder the BUILT-IN packs load from (`<assets>icon-packs/<id>/pack.js`), relative to the page;
  default:  beside the library.  It replaces the old `base` for built-ins (checked 2026-09-30 for jsDelivr:  our FA
  folders mirror FA's npm layout, so `UI.icons.use("fa7-free", { base })` pointed at
  `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.3.1/svgs/` works:  CORS, immutable caching,
  byte-identical files).
- A pack's `prefix:name` comes from its own `pack.js` id (`fa7-brands:github`);  the old `prefix` and `only`
  attributes have no root equivalent (use JS for them).
- Icons inside a root redraw when the root's `icons` or `assets` change.  The SVG cache is one per page, shared by
  every root.

Page-wide, from JS (pages without a root):

```js
await UI.load()
UI.icons.use("fa7-brands")
UI.icons.use("/icons/lucide/pack.js", { prefix: "lucide" })
UI.icons.use("/icons/fa-pro/pack.js", { only: true })    // replace everything before it
UI.icons.use("fa7-free", { base: "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.3.1/svgs/", only: true })
```

- `use(source, { prefix, base, only })`:  `source` is a pack URL or a built-in id.
  - `prefix`:  an extra name for `prefix:name` (the pack's id always works).
  - `base`:  where its SVGs load from instead of its own folder.
  - `only`:  drop every pack added before it, including the default.  `only="false"` ~== absent.
- `UI.icons.remove("fa7-free")`.
- `UI.icons.reset()` drops every pack (the default, `use()`d ones, and any still loading) and returns `UI.icons`, so
  `UI.icons.reset().use("/icons/lucide/pack.js")`.  `use(…, { only: true })` ~== that.
  - Before first use, the default is never loaded.
  - Keeps `register()`ed icons and fetched SVGs.

Order and timing (`IconPacks`):

- Starts on first use (a lookup or `use()`), not on construction, so a page with no icons loads no index.  Then:
  the default pack (unless an `only` replaces it:  it's never fetched), then `use()` calls in call order.  A root's
  `icons` list loads for its subtree, over its parent's set.
- The runtime reads the root's attributes itself, so a page that never imports the icon family (`<ui-button icon>`
  only) can still add packs.
- NOTE:  on the PAGE set, a pack added or removed later affects later lookups only:  icons already drawn keep their
  SVG.  A root's change redraws its icons.

Other API (`UI.icons`):

- `resolve(name)`:  where a name leads, synchronously (`{ pack, name, key, url, width, height }`).
- `get(name)`:  the `<svg>` template, fetched once per URL per page;  `peek(name)` if already loaded.  A shared
  template:  clone it (`IconGlyph.draw()`), never insert it.
- `get()`, `use()` and `ready` NEVER reject:  a pack whose URL can't be worked out (a malformed `src`, or a built-in
  pack in a bundle with no `import.meta.url`, e.g. an IIFE) or whose index won't load is warned once and counts as
  a failed pack;  its icons draw nothing.  `<ui-icon>` likewise draws nothing if the runtime chunk won't load.
- `register(name, svg)`:  one icon from SVG text, ahead of every pack -- how an app bundles a few known icons
  instead of deploying a pack.

### Drawing

- Each SVG is fetched once per page (the runtime is page-wide, so two bundles share it) and parsed into a
  page-owned template.  A failed load is remembered as a miss;  offline (`navigator.onLine === false`) it is
  forgotten, so a later lookup retries.
- One normalization, on the in-memory copy:  a root with no `fill` (Font Awesome) gets `fill="currentColor"`;  a
  root WITH one (Lucide's `fill="none"`) gets it copied into its inline style.  Why:  component sheets set
  `fill: currentColor` on icon `<svg>`s (slotted SVGs rely on it), and CSS beats a presentation attribute but not
  an inline style.  So stroke sets draw stroked.
- No sanitizing at runtime:  the builder verified the files, and adding a pack runs its `pack.js`, so the page
  trusts it like any script it adds.  The template keeps the file's licence comment.

## Building a pack

```sh
yarn icons:pack path/to/folder --id my-icons [--label "My icons"] [--license "…"] [--sanitize]
  [--skip-unsafe | --allow-unsafe] [--force]
```

`IconPackBuilder` (`tools/`;  a class, so the `spell` CLI can drive it:  `import { IconPackBuilder } from
"$/ui/tools/IconPackBuilder"` from any package, node only) does TWO things only, and by default NEVER modifies an SVG:

1. **Index:**  every `**/*.svg` (files at the top first, then each sub-folder, alphabetically), sized from its
   `viewBox`;  the most common width / height become `defaults`.  Reports names nobody can reach (a file name
   another entry took, and no alias).
2. **Verify:**  refuses the whole pack, listing file + reason, and writes no index, if any SVG has:
   - `<script>`, `<foreignObject>`, `<iframe>`, `<embed>`, `<object>`, or an `<!ENTITY>`
   - an `on*` attribute
   - an `href` / `xlink:href` that isn't a same-file `#fragment`
   - CSS (`<style>`, `style=""`) with `@import` or a non-fragment `url()`
   - no `<svg>` root, or no usable `viewBox`

`--sanitize` (opt-in) first STRIPS the unsafe attributes -- `on*`, a non-fragment `href` / `xlink:href`, a `style=""`
that loads something -- and rewrites those files;  everything else in them stays byte for byte, licence comments
included, and each removal is reported.  Unsafe ELEMENTS stay:  removing a `<script>` or `<foreignObject>` could
change what the icon draws, so that stays a person's call.  A refused pack rewrites nothing.

A file that still fails verification (after `--sanitize`, if given):

| Option | Unsafe file | Broken file (no `<svg>` root / `viewBox`) |
| --- | --- | --- |
| (default) | refuses the whole pack | refuses the whole pack |
| `--skip-unsafe` | left out of the index, reported | left out of the index, reported |
| `--allow-unsafe` | indexed anyway, reported as UNSAFE | refuses the whole pack:  it can't be sized |

- The two are exclusive.  A skipped file is never rewritten by `--sanitize`.
- `--allow-unsafe` means the page trusts those files as they are:  the runtime doesn't sanitize (see "Drawing").

Re-running on a folder whose `pack.js` has the same `id` keeps the hand edits:  entries are matched by key and keep
their order, `alias` and any other field;  only sizes are refreshed.  New files are appended, gone ones dropped
(both reported).  A different `id` is refused unless `--force`.

## Regenerating the built-in packs

```sh
yarn gen:icons
```

- Downloads the pinned Font Awesome Free package (`FA_VERSION`, 7.3.1) from npm into the OS temp dir (override:
  `FA_PACKAGE_DIR`), and reads names, aliases, codepoints and search terms from its `metadata/icon-families.json`,
  so names and files come from the SAME release.
- Copies FA's `svgs/<style>/<name>.svg` byte for byte (licence comment included), for canonical names only (the
  package's alias copies are skipped:  aliases are in the index).
- Runs the builder on each pack, and writes `src/icons/data/search.json` (solid search terms, first 5 per icon,
  under a 100 KB budget) for the docs icon browser.
- **MUST run in a worktree** while tests run elsewhere:  it deletes and rewrites `src/icons/icon-packs/`.
- Generated files are COMMITTED:  installs and CI need no network, and a diff shows what an FA upgrade changed.
  `.oxfmtrc.json` / `.oxlintrc.json` ignore `src/icons/icon-packs/**`.

## Shipping icons

The built-in packs must be served NEXT TO THE MODULE that contains `BuiltInPacks` (`import.meta.url`):

- **Library build:**  `BuiltInPacks` is in `dist/core.js`, so `dist/icon-packs/<id>/`.  Package export:
  `@spell-app/ui/icons/*` -> `dist/icon-packs/*`.
- **Docs site:**  `site/_assets/icon-packs`, a symlink to `src/icons/icon-packs/` beside the site bundle's chunks
  (`scripts/site-bundle.ts`);  a static deploy copies through it (`cp -RL`).
- **An app that bundles `@spell-app/ui`:**  the bundler moves `BuiltInPacks` away from `node_modules`.  Copy
  `dist/icon-packs/` next to the app's chunks, OR add the packs by URL from wherever they're served
  (`<ui-root icons="/assets/packs/fa7-free/pack.js">`), OR set `BuiltInPacks.base`.
- **A few known icons:**  `UI.icons.register(name, svgText)` for each (e.g. imported with `?raw`).  Registered
  names are answered before any pack is asked, so they draw with no pack deployed.  NOTE:  the default pack's
  index is still requested on first use (and warns once if it isn't there).
- Cross-origin packs need CORS (`pack.js` is imported as a module;  SVGs are fetched).

## License attribution

See `src/icons/LICENSE.md`.  In short:  the SVGs are [Font Awesome 7 Free](https://fontawesome.com) (CC BY 4.0),
shipped as FA publishes them, each with its licence comment;  the Fomantic pack's NAMES are derived from
[Fomantic-UI](https://github.com/fomantic/Fomantic-UI) (MIT).

## Loading strategies

**SUPERSEDED (2026-09-30):**  icons are now SVG files in packs (above).  This section is the record of the
2026-09-29 decision to ship one ES module per glyph (candidate 2), kept for its measurements.  What changed:
swapping in another icon set (Lucide, FA Pro) became a goal, and the `[width, height, path]` format can only hold
single-path filled icons.  Candidate 3b (SVG fetch + inline) is close to what shipped;  its two drawbacks here are
handled differently:  the SVG cache is page-wide (the runtime), so two bundles fetch a file once, and apps that
want a few bundled icons use `UI.icons.register()`.

Historical record of WHY the 2026-09-29 layout was chosen.  "Today" / candidate 1 below is the chunked-JSON layout
before it;  candidate 2 is the one-module-per-glyph layout that replaced it.

Experiment behind this section:  `spike/icons/`, removed from the tree;  restore it with
`git checkout archive/spikes -- spike/icons` (`yarn build`, `yarn measure`, `yarn test` there;  raw numbers in
`spike/icons/results.json`).  Measured 2026-09-29 with Font Awesome Free
**7.3.1** (`@fortawesome/fontawesome-free@7.3.1`, which DOES ship `svgs/{solid,regular,brands}/*.svg`), Chromium
153 headless via Playwright 1.63, a local static server with gzip on.

### Candidates

1. **Today**:  `Icons.get()` from `$/ui/icons`, 23 chunked JS files Vite emits from the JSON.
2. **One ES module per icon**:  `icons/<style>/<name>.js` = `export default [w, h, "path"]`, generated from the same
   metadata `scripts/gen-icons.ts` uses;  the loader computes the URL from the canonical name.
3. **One SVG file per icon**, the npm package's files untouched:
   - **3a**:  `mask-image: url(...)` + `background: currentColor` on an inner `<span class="glyph">`, no JS but
     setting `--x-icon`.
   - **3b**:  `fetch()` + inline `<svg>` with an in-memory cache.

Each is a small `x-icon-<variant>` element with an open shadow root and the `ui-icon` markup contract
(`<span class="ui icon" part="icon">`, accessible name on the host via `ElementInternals`).  The page draws the
first N of a fixed list of 50 distinct icons (2 brands and 2 regular among the first 10), as markup.

### Method

- **Cold**:  fresh browser context, CDP cache disabled, server sends `no-store`.  **Warm**:  same context loads the
  page once, then again with immutable caching (so "warm" ~== an in-session revisit, partly served by Chromium's
  memory cache).
- Median of 5 loads per cell.  Bytes = sum of CDP `encodedDataLength` (headers + gzip body);  requests = what the
  browser sent, incl. the page itself, the element bundle and its shared chunk (the `0 icons` rows are that
  baseline, 3 requests).
- Time in ms from navigation start.  "First / all icons" = two frames after the first / last icon was ready.
  NOTE: the mask variant has no load event, so its "ready" is the Resource Timing `responseEnd` of the file
  (an approximation).
- Network profiles:  `h2 + 40 ms RTT, 20 Mbit/s` (below, the realistic one), `h1 + 40 ms` (6 connections per
  host), and unthrottled loopback for both (in `results.json`;  everything paints in ~40 ms there, so it only
  confirms the request and byte counts).

### Bytes, requests and time (HTTP/2, 40 ms, 20 Mbit/s)

| Candidate | Icons | Requests | KB (gzip, wire) | First icon ms | All icons ms | Warm: all icons ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1. today (chunked JS) | 0 (page only) | 3 | 3.6 | - | - | - |
|  | 1 | 5 | 26.4 | 294 | 294 | 92 |
|  | 10 | 12 | 357.8 | 263 | 382 | 88 |
|  | 50 | 21 | 485.2 | 257 | 441 | 91 |
| 2. ES module per icon | 0 (page only) | 3 | 1.9 | - | - | - |
|  | 1 | 4 | 2.2 | 228 | 228 | 88 |
|  | 10 | 13 | 5.0 | 234 | 236 | 91 |
|  | 50 | 53 | 15.4 | 237 | 263 | 93 |
| 3a. SVG as CSS mask | 0 (page only) | 3 | 2.2 | - | - | - |
|  | 1 | 4 | 2.6 | 205 | 205 | 89 |
|  | 10 | 13 | 7.2 | 221 | 221 | 88 |
|  | 50 | 53 | 24.9 | 213 | 254 | 95 |
| 3b. SVG fetch + inline | 0 (page only) | 3 | 2.0 | - | - | - |
|  | 1 | 4 | 2.5 | 220 | 220 | 87 |
|  | 10 | 13 | 7.0 | 239 | 239 | 91 |
|  | 50 | 53 | 24.8 | 220 | 254 | 91 |

### Same, HTTP/1.1 (40 ms):  time until all icons are painted

| Candidate | 10 icons: all ms | 50 icons: all ms | 50 icons: KB |
| --- | ---: | ---: | ---: |
| 1. today (chunked JS) | 371 | 447 | 489.1 |
| 2. ES module per icon | 267 | 603 | 25.8 |
| 3a. SVG as CSS mask | 257 | 621 | 34.5 |
| 3b. SVG fetch + inline | 269 | 622 | 34.3 |

Warm runs cost one request (the page) for every candidate:  all four are equally fast once cached.

### On disk

| Asset set | Files | Raw KB | Sum of per-file gzip KB | Allocated on disk KB | Loader code (gzip B) |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1. today (`data` chunks) | 23 | 1556.5 | 512.6 | 1620.0 | 2048 |
| 2. ES modules | 2163 | 1418.2 | 713.2 | 8712.0 | 285 |
| 3. SVG files as shipped (incl. alias copies) | 2883 | 2591.4 | 1452.0 | 11600.0 | 564 |
| 3. SVG files, canonical names only | 2163 | 2016.0 | 1121.4 | 8720.0 | 403 |

- The npm package ships **alias copies** (`ad.svg`, `add.svg`, ... 720 extra files):  FA aliases already resolve by
  file name for candidate 3;  Fomantic's aliases still need `Icons.resolve()`.
- "Allocated" counts whole 4 KB blocks:  ~2,000 tiny files take 4-6x their payload on disk (matters for
  `node_modules`, Docker layers, not for transfer).

### Two bundles on one page

Two separately built apps (`/a/`, `/b/`), each drawing the same 10 icons, cold, HTTP/2:

| Candidate | Requests: 1 bundle | Requests: 2 bundles | KB: 1 bundle | KB: 2 bundles | Same URL fetched twice? |
| --- | ---: | ---: | ---: | ---: | --- |
| 1. today (chunked JS) | 12 | 23 | 357.8 | 715.1 | no |
| 2. ES module per icon | 13 | 15 | 5.0 | 6.4 | no |
| 3a. SVG as CSS mask | 13 | 15 | 7.2 | 8.9 | no |
| 3b. SVG fetch + inline | 13 | 25 | 7.0 | 13.5 | yes, 10 icons |

- `today`:  each bundle has its own chunk URLs, so the ~350 KB is fetched twice.
- Candidates 2 and 3a share by URL (module map, image cache) as long as both use the SAME base URL for the icon
  files;  a bundler that copies icons next to each app breaks that.
- 3b's in-memory cache is per bundle;  only a warm HTTP cache dedupes it.

### Qualitative checks

| | 1. today | 2. ES module | 3a. mask | 3b. fetch + inline |
| --- | --- | --- | --- | --- |
| Shadow root, light + dark `color-scheme`, glyph = `currentColor` (`yarn test`, 50 icons) | pass | pass | pass | pass |
| `ui-icon` markup contract | `<svg>` | `<svg>` | needs an inner element (the mask would also clip the root's `circular` / `bordered` / `inverted` background);  `> svg` rules retargeted | `<svg>` (the file's own `<!--! -->` comment comes along) |
| Bundler includes only the icons an app names | no:  all 23 chunks are emitted | yes:  static `import user from ".../user.js"` tree-shakes to the named paths (3 icons = ~1.2 KB of JS) | yes, via `?url` (3 icons = 3 files, or `data:` URIs under 4 KB) | same as 3a |
| Runtime names (`name="..."`) in a bundled app | all chunks bundled | URL is invisible to the bundler:  copy the whole set, or import named icons statically | same | same |
| Works with JS off / in SSR output | no | no | yes (plain CSS + image request) | no |
| Cross-origin hosting | n/a (same bundle) | needs CORS (module scripts) | needs CORS for `mask-image` | needs CORS for `fetch` |
| Needs a `variant` / name index | solid index (37.5 KB raw) to guess solid vs brands | needs the style;  a bare `github` needs a small names list or a 404 retry | same | same |

- Not tested here:  `forced-colors` (Windows high contrast) turns `background` into a system colour, so the mask
  glyph would very likely render as a box or vanish;  an `<svg>` with `fill: currentColor` keeps working.

### Licence

- Font Awesome Free icons are **CC BY 4.0**, which requires attribution.  Every one of the 2,883 shipped SVGs
  carries a comment:  `<!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License -
  https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026
  Fonticons, Inc. -->` (211 bytes each, ~0.6 MB in total;  25% of the per-file-gzipped SVG set:  1,452 KB with,
  1,083 KB without).
- The package's `LICENSE.txt` says the embedded comments are sufficient attribution and that they "ask that you do
  not actively work to remove them from files".  That is a request, not a licence condition:  CC BY needs
  attribution reasonable to the medium (a notice in the package / an about page), which `src/icons/LICENSE.md`
  already is for the JSON data.  Not legal advice.
- Candidate 3 keeps the comments (we would ship the files as they are).  Candidates 1 and 2 have no per-file
  comment (generated from metadata):  attribution rests on `LICENSE.md`, same as today.

### Recommendation

**Status:  adopted 2026-09-29, superseded 2026-09-30 by icon packs** (see the top of this section).  Below is the
recommendation as written.

**Adopt candidate 2, one ES module per icon**, behind the existing `Icons` API (`get`, `peek`, `resolve`, `svg`,
`svgString` unchanged;  the lazy alias maps stay).

- Transfer:  10 icons incl. a brand logo cost 5 KB instead of 358 KB, and a page with one icon is 2.2 KB instead of 26.4 KB
  (today needs the 37 KB solid index, THEN the chunk:  two sequential round trips before the first icon).  The
  price is one request per icon (53 vs 21 for 50 icons):  free on HTTP/2 (263 ms vs 441 ms for 50), but
  1.35x slower than today on HTTP/1.1 (603 vs 447 ms) when a page draws 50 distinct icons at once.
- Only candidate that lets an app bundle exactly the icons it names (static imports tree-shake), shares by URL
  across two bundles, and keeps the `<svg>` contract and the `currentColor` behaviour unchanged.
- Candidate 3a is the pick only if icons MUST show without JS (SSR / static HTML):  zero-JS and simplest, but
  1.6x the bytes of 2, an inner-element contract change, and the `forced-colors` risk.  3b has no advantage over 2.
- Migration effort for `src/icons/` (about a day, no component changes):
  - `scripts/gen-icons.ts`:  replace chunk packing (`MAX_CHUNK_BYTES`, `solid.json`, `CHUNK_LOADERS` index) with
    one `<style>/<name>.js` per icon, plus a names list (docs icon browser, solid-vs-brands guess);  ~60 lines.
  - `Icons.ts`:  `#loadChunk` / `#loadSolidIndex` / `#lookup` become a per-name `import()` cache (`peek()` keeps
    reading a plain `Map`);  ~80 lines.
  - Decide the delivery form:  a template `import(`./icons/${style}/${name}.js`)` (Vite emits one lazy chunk per
    icon, 2,163 small files in `dist/`, like today's chunks it is all-or-nothing for app bundlers), or a URL
    computed against a configurable base like this experiment (files copied by the app, shared across bundles).
  - `Icons.test.ts` and this document.
