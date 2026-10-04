<!-- bedtime: done -->
# Morning plan:  ui-docs-rework

Plan doc:  `packages/docs/content/epics/ui-docs-rework/ui-docs-rework.plan.html`.  Branch `ui-docs-rework`, worktree
`.claude/worktrees/ui-docs-rework`.  Never merged tonight.

## 1. Summary

- 9 of 9 phases done, none WIP, none skipped;  branch `ui-docs-rework`, 11 commits (`git log --oneline main..HEAD`),
  NOT merged
- every check green at the end:  ui `yarn review` (4550 browser tests), server tests, `site:check --all` (80 pages),
  `docs:update` (every docs page)
- durable doc:  `packages/docs/content/spell-ui-site.html`;  changelog entry under "2. In worktrees"
- 51 judgement calls (J1-J51) to review in the plan doc;  9 hand checks (V1-V9) in its "To test"

### P7 · Page Split — `87a14d40`
- own pages for `ui-radio`, `ui-textarea` and the 12 Parts tags besides `ui-header` (80 pages);  `pages.json` has a
  `pages` map;  nav, search, index, kitchen sink follow the new hrefs;  family pages keep the whole API + links
- checks:  ui review passed (4550 browser tests);  `site:check --all` 80 OK
- judgement calls:  J45-J51 (data shape, one-tag API, no Theming tab on parts pages, what moved off checkbox / input)

### P9 · Doc Review — `e727c0f2`
- `packages/docs/content/spell-ui-site.html` (durable doc), changelog entry, PAGES.md (own-page rule), plan doc pruned
- checks:  `docs:update` passed on every docs page

## 2. Phases

### P1 · Spell Theme — `1318641d`
- `spell` theme (`packages/ui/src/styles/themes/spell.css` + brand P052 fonts), default on Spell UI docs AND
  packages/docs (plan docs, goals, docs);  theme menu:  Spell, Plain, Classic, Fomantic's
- favicon on every site:  page server injects it, `<spell-site-header>` adds it on `file://`, the app has it
- checks:  ui `yarn review` passed (4480 browser tests);  server 84 tests;  `docs:update` passed
- judgement calls:  J1-J5 (favicon:  bytes in TS, 74% hat, square apple icon, routes, app static folder), J6-J11
  (theme:  on top of classic, 16px body, solid focus ring, lavender info, Spell first / "Plain", pills + round
  checkboxes)

### P2 · Layout Shell — `60fe7554`
- pages are their `<head>` + one bare `<main>`;  chrome once in `site/_parts/layout.html`
- `SiteShell` mounts it, `SiteRouter` swaps pages through `<ui-include select="main#main">` + pushState
- no FOUC:  `<ui-root display="when-ready">` defined only after layout AND theme are in;  CLS 0.0002, shown ~250ms
- checks:  review passed (one flaky theme test fixed);  Playwright:  swap keeps chrome, back / forward, deep links
- judgement calls:  J12 (new `ui-insert` event on ui-include), J13 (include made on first swap), J14 (absolutize
  links), J15 ("On this page" moved into the layout now), J16 (page waits for theme)

### P3 · Nav Panel — `21e77fa6` (its layout / site.css / router bits land in later commits)
- `<ui-docs-nav>` rebuilt as the brand panel (Color Set Chooser look):  ivory card, header band with the Spell
  lockup + search + A-Z / Topics, folding bands (Get started, Favourites, Components with topics inside, Foundation),
  `.sp-nav` rows, lavender current row (lilac in dark);  same API, folds remembered
- phone:  the same panel in the flyout, with the docked site row;  the router closes the flyout after a swap
- checks:  ui review passed (4502 browser tests);  `site:check ui-divider index` OK
- judgement calls:  J19 (topics as lighter bands inside Components), J20 (A-Z / Topics beside search), J21 (groups
  fold, remembered, start open), J22 (native links, icons on the 8 page rows only), J23 (dark current row lilac),
  J24 (theme tokens;  only the ivory fill is a hex), J25 (264px column, 12px margin, one lockup symbol, no tagline)
- looks dense in Topics view with every topic folded (33 one-line bands)

### P5 · Theme Overlay — `5c118ff1`
- `<ui-docs-themes>`:  a sun / moon flip button (shows the current scheme, animated swap) + a palette button opening
  a small overlay:  theme list (Spell, Plain, Classic, Fomantic's), "Match system" switch
- ONE scheme key for every site (`spell-site:scheme`, old keys migrated):  flipping on Spell UI carries to the docs,
  plan docs, goals, and back;  the docs header's own button is the same 2-state flip
- checks:  ui review passed;  server 84 tests;  flip checked both ways in a browser
- judgement calls:  J26 (one key, class AND color-scheme), J27 (2-state header flip), J28 (ui-popup panel stays open
  after a pick), J29 (one documented `!important` for the icon swap)
- the light-mode sun icon reads a bit like a cog at 14px

### P4 · Right Sidebar — `585f69d1`
- right column (1200px+):  header = `<spell-site-header docked>` (new attribute:  compact row, no fixed bar) + look
  controls, then "On this page";  stays on the API tab (no width jump)
- below 1200px:  one slim top bar of the page's colours (menu button + brand below 992px);  the dark Spell UI menu
  is gone;  below 768px the site row moves to the nav flyout
- site header re-draws after a page swap (`spell-site:page`)
- checks:  server 84 tests;  screenshots 1440 / 1100 / 800 / 390
- judgement calls:  J17 (docked attribute, two copies), J18 (slim top bar replaces the dark menu)

### P6 · Sections & Ids — `588eba88`
- 1,749 nested `<ui-section sticky collapsible dividing>`s on 65 pages, ids `<tab>-<section>-<example>` written by
  `yarn site:sections` (idempotent;  `site:new` / `site:index` / `site:kitchen` run it)
- tabs bar sticks, section titles stick under it;  folds remembered per page, all start open
- a hash picks its tab, unfolds, lands below the stuck titles;  old hashes (`#types`) forward;  toc nests sections
- checks:  ui review passed (4505 browser tests);  `site:check --all` 66 OK (new section + deep-link checks)
- judgement calls:  J30-J37;  caveats C11 (stuck stack ~1/5 of a phone screen), C12 (cold deep link may jump
  twice), C13 (demo stickies on the sticky / rail pages slide under stuck titles)
- 169 old header ids that weren't their header's slug no longer resolve (site not deployed;  in-site links fixed)

### P8 · Search — `735dbae2`
- `<ui-docs-search>` in the nav panel's header:  On this page, Components (96 tags), Pages, Sections (every page,
  `_data/search.json` from `site:data`), Attributes;  `/` and ⌘K;  a search button in the phone top bar
- checks:  ui review passed (4549 browser tests);  `site:check ui-divider index` OK
- judgement calls:  J38-J44 (own combobox, ranking, staged Escape, generated index, attribute hits land on the tag's
  API header, one field that also filters, the A-Z / Topics switch moved under the field)

### Also
- `639fc2db`:  every page's head script reads the shared scheme key (T4)

## 3. Problems

- I1:  FIXED in the morning (`6ec1ccc4`):  the docs bundle writes the fonts to `_assets/fonts/` (3.11 MB → 2.53 MB);
  T7:  the UI library's own `dist/spell-*.js` still inlines them;  I3:  esbuild may drop `ui-docs-nav`'s import of
  `ui-docs-search` (hashed docs chunks aren't in `sideEffects`;  the Spell UI site is unaffected)
- C7 / T7:  gone with the fonts (`92a374a7`):  no P052 ships anywhere;  `Spell Serif` = installed Palatino family,
  else `serif` (D12)
- `docs:update` was already failing on main (dead Astro links in the `ui-component-creation` epic);  fixed, in PAPERCUTS
- suspected bugs logged (`agents/SUSPECTED-BUGS.md`):  API tab tables stacking after a tab switch (couldn't reproduce);
  item avatar drawn at the image's size (C15)
- T6:  after a page swap the nav doesn't open the new page's topic band
- the docs-site screenshots show the sun icon looking like a cog at small sizes
- the main checkout's page server (4747) runs main's code:  favicon and the new site header show only after merge

## 4. Decisions

- Phases tonight:  all, P1-P9 (P9 without merge)
- Q1 B real URLs, layout injected · Q2 A ui-root when-ready · Q3 D hybrid · Q4 B docked in right sidebar
- Wide:  left panel = lockup + search;  right header = docked site row + scheme + theme (D5)
- Own pages:  `ui-radio`, `ui-textarea` + 12 Parts tags (D3)
- Spell theme on ALL doc sites (D6);  brand fonts as is, no `.woff2` (D7);  up to 8 agents

## 5. Todos for Owen

- the 9 hand checks (plan doc "To test", V1-V9)
- review the judgement calls J1-J51 (plan doc section 4);  close the ones you accept
- merge:  `/isolate done` from this worktree (then move the changelog entry to "Merged into main")
- `yarn vscode` after merge (the extension bundles `WebServer`:  favicon routes)
