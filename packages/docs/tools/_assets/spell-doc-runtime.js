/*
 * Page behaviour for the `.html` docs.
 * Bundled into `spell-ui.js` (a classic IIFE, beside @spell-app/ui) by `scripts/bundle-spell-ui.js`;
 * side effects only.  The page's markup is hand-authored;  this only DRIVES it.
 * - Two page markups, read into ONE outline (`outlineOf()`) that everything below works from:
 *   - SECTIONS (every page but the goals pages):
 *     `<ui-section id header sticky collapsible dividing>` in `main`, nested for sub-sections,
 *     `collapsed` to start folded.
 *     - the element draws the title, the fold button, the rule and the stack of stuck titles
 *     - this runtime sets the top-level `offset`s, remembers folds, writes counts
 *     - a PLAN DOC is `<epic-page>` markup (the `epics` pack, `packages/epics`):
 *       its folding blocks (`<epic-overview>`, `<epic-section>`, `<epic-phase>`, `EPIC_FOLDS`) are its sections.
 *       They draw and stick themselves, count their items, filter them,
 *       and draw the page header, the review line, the commits and every review control;
 *       this runtime only lists them (each host's `contentsEntry`, with label, icon and count),
 *       remembers their folds, and lands links inside them
 *   - HEADINGS (the goals pages):  `section.s2|s3` > `<ui-sticky class="spell-h2|spell-h3">` > `<h2|h3 id>`;
 *     this runtime adds the fold chevrons and every sticky's `offset`
 * - the TOOLBAR, the page's one navigation (epic `airplane` P8;  the floating right-edge rail before):  a row of the
 *   top-level sections' buttons, the last row of the sticky page header (`buildPageToolbar()`):  mark and title,
 *   the titles shrinking, then gone on a narrow window.  No contents list:  Owen, 2026-10-08
 *   - a PLAN DOC's (`buildToolbar()`):  its blocks' icons only, with badges of the items waiting on Owen, in
 *     `<epic-page>`'s header;  and Cmd / Ctrl + K asks for an item to jump to (`wireJumpKey()`)
 * - sticky headers:  the page header (`ui-sticky.spell-h1`) sticks at the top, each top-level title below it,
 *   nested ones below their parents' (re-measured on resize);
 *   CSS variables on the sections let anchors land below them all
 * - everything that sticks or lands at the top starts BELOW the fixed site header (`<spell-site-header>`,
 *   `siteHeaderHeight()`):  the page header and its toolbar, the titles
 * - folding:  every section folds from a chevron on its title;  folds are remembered per page, and `collapsed`
 *   (`data-fold="closed"` on HEADINGS pages) starts one folded
 * - counts:  a top-level section holding `[data-status]` items (the Epics index's epic cards, the goals pages' items)
 *   shows open / all on its title;
 *   the toolbar shows, with a red badge, how many NEED OWEN (none:  no badge;  `countItems()`);
 *   an epic card section also gets state chips with counts, filtering its items (`wireItemFilters()`)
 * - scroll-follow:  the toolbar's button of the section being read is highlighted, and the address follows it
 * - links to any id in `main` (a section, a heading, a plan item) land below the stuck titles, unfolding what
 *   hides it
 * - the CHEATSHEET card filters
 * - highlight.js, when the page loaded it
 * - COMMENTS (`wireComments()`):  served by the page server, a bullhorn beside every major block (and in the page
 *   header), and ⌘ I or a floating bullhorn on selected text, which open a comment box under the block;  the
 *   comments wait in an inbox file (a docs page's own, a plan doc's review inbox), drawn under their blocks.
 *   PAGE NOTES (`wireNotes()`), written into docs pages before them:  each `<spell-note>` a folded card
 * - FAVORITE EPICS (`wireFavorites()`):  on the Epics page, a card's star moves it into Favorites and back, at once
 * LANDING -- where a jump puts its target, ONE model for every kind of jump:
 * - the line:  just below the lowest title that will be stuck over the target:  site header + `--spell-top` (page
 *   header, filter bar) + the stack of the target's sections' titles
 * - CSS `scroll-margin-top` holds that line MINUS the site header (`spell-doc.css`);  the site header is added by
 *   whoever does the scrolling, once:
 *   - our jumps (link clicks, a `#hash` load, `hashchange` / `popstate`, so also `location.hash = id`):
 *     `scrollTo()` with a computed top, which `scroll-padding` never touches:  `offsetFor()` adds the site header
 *   - the browser's own (a `#hash` before this runs, `scrollIntoView()`, focus):
 *     `:root`'s `scroll-padding-top`, the site header's height (`<spell-site-header>` installs it)
 *   - paging (Page Down / Up, Space):  ours (`wirePaging()`), measured at the destination:
 *     the old bottom lands just below the titles stuck THERE
 *   - the browser's own paging (where ours stands aside) goes by `scroll-padding-top`:
 *     while titles are stuck, `<ui-section>` / `<ui-sticky>` (`StickyWatch`) write the lowest stuck edge
 *     as an INLINE `scroll-padding-top` on `<html>`, overriding `:root`'s;  removed once none is stuck
 *     - it includes the site header:  titles stick below it
 *     - that's where it STARTS, so a title that sticks on the way can cover the old bottom
 * - NOTE: a browser jump made WHILE titles are stuck adds that inline padding to the margin, landing one stack lower:
 *   every such jump that changes the hash (`hashchange`) lands again through ours;
 *   `scrollIntoView()` from code doesn't --
 *   call `jump`'s path (a click on a `#id` link, or set `location.hash`) instead
 * NOTE: panels open and close through the accordion's `open` PROPERTY (panel indexes as text):
 * that's `<ui-accordion>`'s controlled state, and writing it announces nothing (`ui-open` / `ui-close` mean the user).
 */

import {
  PAGE_ANCHOR,
  anchorOf,
  blockAround,
  blocksIn,
  excerptOf,
  findBlock,
  kindOf,
  offsetIn,
  pageHeadIn,
  quoteIn,
  sectionOf,
  sectionTitle
} from "../BlockAnchors.js"

/** Custom elements this runtime drives:  wait for their definitions before wiring. */
const TAGS = [
  "ui-accordion",
  "ui-title",
  "ui-content",
  "ui-menu",
  "ui-item",
  "ui-sticky",
  "ui-button",
  "ui-input",
  "ui-select",
  "ui-icon",
  "ui-section",
  // installs `--spell-site-header-height`, which every sticky line starts from
  "spell-site-header"
]

/**
 * Frames a `<ui-section>` takes to draw what `collapsed = false` revealed:  the write lands on a microtask, the
 * render on the next frame.  A jump lands only then:  before, the target is laid out in a box of no height.
 */
const UNFOLD_FRAMES = 2

/**
 * When a jump on a `<ui-section>` page lands once more, unless the reader scrolled since:
 * a fold the BROWSER opened (a `#hash` load reveals `hidden="until-found"` content itself) grows with its transition
 * (`--ui-section-duration`, 300ms) and moves the target a few pixels after the first landing.
 */
const SETTLE_MS = 450

/** How long a closing fold's header is held in place (`holdWhileFolding()`):  its transition (300ms) and a margin. */
const FOLD_HOLD_MS = 600

/**
 * A plan doc's folding blocks (`packages/epics`):  its sections, in the outline, the folds and the landing.
 * Each host has `open` (page state) and `contentsEntry` (`EpicFoldHost`).
 */
const EPIC_FOLDS = "epic-overview, epic-section, epic-phase"

/** What a link into a plan doc opens on its way:  the folding blocks, and the items (which fold too). */
const EPIC_OPENERS = `${EPIC_FOLDS}, epic-item`

/** Every element the outline takes for a section:  `<ui-section>`s and a plan doc's folding blocks. */
const SECTIONS = `ui-section, ${EPIC_FOLDS}`

/**
 * How long `start()` waits for a plan doc's elements (the `epics` pack, loaded by `<ui-root>`) to define and draw,
 * before listing the page without them:  a pack that never loads must not hold up the rest.
 */
const EPIC_WAIT_MS = 5000

/** Space between the stuck titles and an element a link lands on inside a plan doc, px (`EpicFold`'s `LAND_GAP`). */
const EPIC_LAND_GAP = 8

/**
 * `localStorage` key prefix of a page's card filter, unless its input names a key (`data-spell-filter="..."`).
 * - per page:  every `file://` page shares one origin, so one key would leak a filter between cheat sheets
 */
const FILTER_KEY_PREFIX = "spell-filter:"

/** `localStorage` key prefix of a page's folds (`{ [section or heading id]: folded }`), per page like the filter's. */
const FOLD_KEY_PREFIX = "spell-folds:"

/**
 * `localStorage` key prefix of a page's item filters (`{ [section id]: "all" | state }`), per page.
 * - NOTE: not `spell-item-filter:`, Open | All's before P3 of `review-review`:  its saved "open" meant "not done"
 */
const ITEM_FILTER_KEY_PREFIX = "spell-item-state:"

/** The listeners of the last `wireFolds()` call:  aborted by the next, so a rebuilt page doesn't double them. */
let foldWiring = null

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true })
else void start()

////////////////
// ## Start
////////////////

/** Highlight at once (plain DOM);  wire the widgets once their elements are defined. */
async function start() {
  nameTab()
  const main = document.querySelector("main.spell-doc-main") ?? document.querySelector("main")
  if (!main) return
  // where to land, read before anything scrolls:  scroll-follow rewrites the address as the page moves
  const landing = { hash: hashId(), scroll: window.SPELL_SERVER?.takeScroll?.() }
  // listening at once:  an edit that comes in while this is still wiring waits for `live.ready()`
  const live = wireLiveUpdate(main)
  highlight()
  // a plan doc:  its saved folds before its blocks first draw (so nothing animates), then the blocks, which the
  // outline reads (their labels, icons and counts)
  if (main.querySelector("epic-page")) {
    restoreEpicFolds(main)
    await epicsDrawn(main)
  }
  const outline = outlineOf(main)
  const counts = countItems(outline)
  // the goals pages (HEADINGS) get no filter, but their id chips are coloured by state too
  if (outline.sections) wireItemFilters(main)
  else markItemStates(main)
  const rail = buildNavigation(main, outline, counts)
  // before the sections first draw, so a saved fold doesn't animate shut
  const folds = wireFolds(main, outline)
  const used = TAGS.filter((tag) => document.querySelector(tag))
  await Promise.all(used.map((tag) => customElements.whenDefined(tag)))
  const sticky = trackStickyHeights(main, outline)
  const follow = followScroll(main, outline, rail)
  const { jump, go, canGo } = wireAnchors(main, outline, sticky, follow, folds)
  wirePaging(main)
  if (document.body.classList.contains("plan-doc")) wireJumpKey(go, canGo)
  wireFilter(main)
  // UI renders its shadow content a little after the definitions:  land once it has
  await nextFrames(2)
  sticky.measure()
  land(landing, jump, follow)
  live.ready({ main, rail, sticky, follow, entries: railKey(outline, counts) })
  wireNotes(main)
  void wireComments(main)
  wireNewEpic(main)
  wireFavorites(main)
  // the docs index rewrites this page after a new epic:  its header comes back without the pill, a starred card
  // maybe in its old place too
  addEventListener("spell-doc:updated", () => {
    wireNewEpic(main)
    wireFavorites(main)
  })
}

/**
 * Land where the page should open, once its sections have drawn and folded:
 * - a live reload's saved scroll position (`SPELL_SERVER.takeScroll()`):  exactly there, and again after a fold's
 *   transition (`SETTLE_MS`) unless the reader scrolled meanwhile
 * - else the URL's `#hash`:
 *   - a section or heading WITHOUT unfolding the target itself:  the address follows the section being read
 *     (`followScroll()`), so a reload (or VS Code restarting) lands on it, folded or not, as the reader left it
 *   - a plan item (`<epic-item>`) OPENS:  the address never follows items, so an item's `#q16` is a link someone
 *     followed (`spell dev docs link --hash q16 --show`), and a folded item shows nothing of what it pointed at
 * - else nowhere:  the top
 * - then the address starts following the scroll;  after a `#hash`, only once the jump has landed:
 *   a target in a body not loaded yet (a split plan doc's part) lands a moment later, and following before that saw
 *   the top of the page, and wrote the hash away (I3 of `windows-and-review`)
 */
function land({ hash, scroll }, jump, follow) {
  if (scroll !== undefined) {
    scrollTo({ top: scroll, behavior: "instant" })
    const landed = scrollY
    setTimeout(() => {
      if (Math.abs(scrollY - landed) < 2) scrollTo({ top: scroll, behavior: "instant" })
    }, SETTLE_MS)
    follow?.update()
  } else if (hash) {
    const landed = jump(hash, { unfoldTarget: document.getElementById(hash)?.localName === "epic-item" })
    // the browser's own jump to the `#hash` can come AFTER ours and land the target under the stuck titles (an
    // item has no box of its own:  `display: contents`), so land once more when the page has settled, unless the
    // reader has moved meanwhile
    let moved = false
    for (const type of ["wheel", "touchstart", "keydown", "pointerdown"])
      addEventListener(type, () => (moved = true), { once: true, passive: true })
    setTimeout(() => !moved && jump(hash, { unfoldTarget: false }), SETTLE_MS * 2)
    void landed.then(() => follow?.followAddress())
    return
  } else follow?.update()
  follow?.followAddress()
}

/**
 * Resolves once a plan doc's elements are defined and have drawn (their hosts' `ready`), so their
 * `contentsEntry` can be read;  after `EPIC_WAIT_MS` at most (a pack that won't load:  the page goes on without).
 */
async function epicsDrawn(main) {
  const tags = ["epic-page", ...EPIC_FOLDS.split(", ")]
  const drawn = Promise.all(tags.map((tag) => customElements.whenDefined(tag))).then(() =>
    Promise.all(Array.from(main.querySelectorAll(EPIC_FOLDS), (host) => host.ready))
  )
  await Promise.race([drawn, new Promise((done) => setTimeout(done, EPIC_WAIT_MS))])
}

/**
 * A plan doc (`epics/<name>/<name>.plan.html`;  before 2026-10-04 `<name>.html`) names its tab `<name>`:
 * every link to it has `target="<name>"` (`doc-links.js`),
 * so they reuse this tab, as `spell dev plan-doc open <name>` does.
 */
function nameTab() {
  const plan = /\/epics\/([^/]+)\/\1(?:\.plan)?\.html$/.exec(decodeURIComponent(location.pathname))
  if (plan) window.name = plan[1]
}

/** highlight.js colors every `pre code`;  without it (offline) the code stays plain monospace. */
function highlight() {
  try {
    globalThis.hljs?.highlightAll()
  } catch {
    // plain monospace is fine
  }
}

////////////////
// ## Live update
////////////////

/**
 * Elements the runtime adds INSIDE `main`, so not in the page's source:  the patch steps around them.
 * - NOTE: anything else the runtime (or a page script) adds in `main` should carry `data-spell-added`;
 *   an unknown extra is stepped around too when its tag doesn't collide with its source siblings' (`liveKids()`)
 */
const ADDED = ".spell-item-filter, .spell-hidden-note, [data-spell-added]"

/**
 * The page state of an `<epic-*>` element (epic `epic-components`, P10):  folded or open (items, sections, phases,
 * the Overview), and the page being reviewed (`<epic-page reviewing>`);  never in the file, so a patch keeps them
 * (`KEPT_ATTRIBUTES`), and a replaced subtree carries them over (`carryEpicState()`).
 * - NOTE: their review controls and note boxes are in their shadow roots (P9):  a patch never sees them
 */
const EPIC_PAGE_STATE = ["open", "reviewing"]

/**
 * Attributes the reader's state lives in (folds, counts, the item filter, `EPIC_PAGE_STATE`):
 * a patch keeps them (`planAttributes()`).
 */
const KEPT_ATTRIBUTES = new Set(["collapsed", "badge", "data-show", ...EPIC_PAGE_STATE])

/**
 * Elements that manage their children (panels and tabs by index, options):  a change inside replaces the whole
 * element, its open panels carried over (`carryState()`).
 */
const MANAGERS = "ui-accordion, ui-tabs, ui-select, ui-dropdown"

/**
 * A tag of the `epics` pack's elements (`<epic-page>`, `<epic-item>` ...):  NEVER replaced by a patch while its tag
 * stays (`planMorph()`):  each keeps its fold, its loaded part and what's typed in it.
 */
const EPIC_TAG = /^epic-/

/** `squash()`ed `outerHTML` of source nodes, computed once per patch. */
const squashed = new WeakMap()

/**
 * An edit to this page's file updates it IN PLACE, instead of reloading it (plan doc `review-review`, D10).
 * - `liveClient()` (`$/server`, `packages/server/src/liveClient.ts`) fetches the new version when the file changes,
 *   and fires a cancelable `spell-server:change` on `window`, `detail` `{ path, html, etag, reload() }`:
 *   taking it (`preventDefault()`) stops its reload
 * - the patch compares the page's source as it LOADED (fetched once, `SPELL_SERVER.readPage()`, trusted only when
 *   its `ETag` is the one served) with the new source, and changes only what differs in the live page
 *   (`patchPage()`):  everything else keeps its scroll, folds, open panels, focus and typed text
 * - then re-wires what the runtime built from the markup (`rewire()`) and fires `spell-doc:updated` on `window`,
 *   `detail.changed`:  the elements added, replaced or re-attributed
 * - a full reload instead (`reload()`, which keeps the scroll) when the page can't be patched safely:
 *   - not `<ui-section>` markup (the goals pages), a CHEATSHEET's filter, or a script besides the bundle and
 *     highlight.js (it may have built from the markup):  never taken.  An INERT script (a data block,
 *     `<script type="text/plain">`:  a plan doc's "Plan hung?" prompt) never runs, so it doesn't count
 *   - stylesheets, scripts or anything outside `main` changed (but `<body>`'s attributes:  patched too, e.g. a plan
 *     doc's `data-recent-since`, which every edit may move;  not its `class`), more than half of `main` changed,
 *     the source as loaded couldn't be read, or the patch threw
 * - BODIES from files (`<ui-section source>`, `<ui-accordion source>`:  a split plan doc's parts) live their own
 *   life (`wireSourceBodies()`):  the patch leaves what a host loaded alone (`planHost()`), a changed body file
 *   re-fetches its open host in place, and each body that loads re-wires the page (`refresh()`)
 * - a plan doc in `<epic-*>` markup (epic `epic-components`):  its elements are patched, never replaced
 *   (`planMorph()`), their page state kept (`EPIC_PAGE_STATE`);
 *   their parts (`<epic-item source>` ...) live the bodies' life above
 * - returns `{ ready(page), refresh(changed) }`:  `start()` hands over what it wired;  a change waits for it.
 *   `refresh()` re-wires after `changed` elements changed under the runtime (a body loaded), in turn with updates
 */
function wireLiveUpdate(main) {
  const server = window.SPELL_SERVER
  let ready = () => {}
  const started = new Promise((resolve) => (ready = resolve))
  // one update at a time, in order:  patches, re-fetched bodies, re-wiring
  let queue = Promise.resolve()
  const live = { ready, refresh }
  wireSourceBodies(main, live, enqueue)
  if (!server?.readPage || !canPatch(main)) return live
  // the source as loaded:  null when it can't be trusted (the file changed before it was read)
  let base = server.readPage().then(
    ({ html, etag }) => (etag && etag === server.etag ? html : null),
    () => null
  )
  addEventListener("spell-server:change", (event) => {
    const { html, reload } = event.detail ?? {}
    if (typeof html !== "string" || typeof reload !== "function") return
    event.preventDefault()
    queue = queue.then(() => update(html, reload)).catch(() => reload())
  })
  return live

  /** Patch the page to `html`, then re-wire it;  reload when it can't be patched. */
  async function update(html, reload) {
    const [before, page] = await Promise.all([base, started])
    const patched = before === null ? null : patchPage(page.main, parse(before), parse(html))
    if (!patched) return reload()
    base = Promise.resolve(html)
    await rewire(page, patched.changed)
  }

  /** Re-wire the page once it's started, after `changed` (elements) changed:  queued behind the updates. */
  function refresh(changed) {
    enqueue(async () => rewire(await started, changed))
  }

  /** Run `job` (async) after every update queued before it;  a failure doesn't stop the queue. */
  function enqueue(job) {
    queue = queue.then(job).catch(() => undefined)
  }
}

/**
 * Can this page be patched in place?
 * - `<ui-section>` markup (or a plan doc in `<epic-*>` markup:  its `<epic-page>`)
 * - no CHEATSHEET filter
 * - no script but the bundle, highlight.js, what the page server injects,
 *   component packs (`<ui-components source="x.pack.js">`'s script, which only defines elements)
 *   and inert data blocks (`isInert()`)
 */
function canPatch(main) {
  if (!main.querySelector(":scope > :is(ui-section, epic-page)")) return false
  if (document.querySelector("[data-spell-filter], [data-spell-filter-badge]")) return false
  return Array.from(document.scripts).every((script) => {
    const src = script.getAttribute("src")
    if (!src) return isInert(script) || script.textContent.includes("SPELL_SERVER")
    return /^\/_server\//.test(src) || /(^|\/)(spell-ui|highlight(\.min)?|[\w-]+\.pack)\.js$/.test(src)
  })
}

/**
 * Is `script` INERT:  a data block the browser never runs (`type="text/plain"`, JSON ...), not JavaScript or a
 * module?  Plan docs' "Plan hung?" notice keeps its prompt in one.
 */
function isInert(script) {
  const type = (script.getAttribute("type") ?? "").trim().toLowerCase()
  return type !== "" && type !== "module" && !/^(text|application)\/(x-)?(java|ecma)script$/.test(type)
}

////////////////
// ## Bodies from files
////////////////

/**
 * Hosts whose body comes from a file, in step with the files and the page:
 * `<ui-section source>`, `<ui-accordion source>`, and a plan doc's parts
 * (`epics/<name>/parts/<id>.html`, epic `claude-design` P3, on its `<epic-*>` blocks and items).
 * - a body loads (`ui-load`, the first open or a re-fetch):  the page is re-wired around it (`live.refresh()`):
 *   the outline (headings inside), contents, counts, item filters, code colors
 * - a body's FILE changed (the page server's `spell-server:file`, `liveClient.ts`):  a host that has loaded it
 *   re-fetches it in place (`reload()`), the reading position kept (`readingAnchor()`);  one that hasn't drops the
 *   cached copy, so its first open fetches the new one
 * - `enqueue`:  the live update's queue (`wireLiveUpdate()`):  a re-fetch waits for a patch in flight
 */
function wireSourceBodies(main, live, enqueue) {
  main.addEventListener("ui-load", (event) => {
    const host = event.target
    if (host instanceof Element && host.hasAttribute("source") && main.contains(host)) live.refresh([host])
  })
  addEventListener("spell-server:file", (event) => {
    const path = event.detail?.path
    if (typeof path !== "string") return
    const changed = decodeURIComponent(path)
    for (const host of main.querySelectorAll("[source]")) {
      const url = sourceUrl(host)
      if (!url || decodeURIComponent(url.pathname) !== changed) continue
      if (hasLoaded(host)) enqueue(() => reloadBody(host))
      else forgetSource(url.href)
    }
  })

  /**
   * Re-fetch `host`'s body, keeping the line being read where it is.
   * - what had the focus inside it, a note box being typed in:  focused again, its caret where it was
   *   - `dock()` puts the same box back;
   *     an `<epic-item>`'s is in its shadow root, which the reload may hide for a moment
   */
  async function reloadBody(host) {
    const anchor = readingAnchor(main)
    const active = host.contains(document.activeElement) ? deepActiveElement() : null
    const caret = active && "selectionStart" in active ? [active.selectionStart, active.selectionEnd] : null
    // the body goes in on the host's `ui-load`, which can come after `reload()` resolves;
    // the runtime's pieces go back on it (`live.refresh()`):  wait for it (2s at most), then for them
    const loaded =
      active &&
      new Promise((done) => {
        host.addEventListener("ui-load", done, { once: true })
        setTimeout(done, 2000)
      })
    await host.reload?.()
    keepAnchor(anchor)
    if (!active) return
    await loaded
    for (let frame = 0; frame < 60 && !active.isConnected; frame++) await nextFrames(1)
    // the host draws what it hid while loading (a frame):  hidden, the box can't take the focus
    await nextFrames(1)
    if (!active.isConnected || deepActiveElement() === active) return
    active.focus({ preventScroll: true })
    if (caret) active.setSelectionRange(...caret)
  }
}

/** The element with the focus, inside shadow roots too (`document.activeElement` stops at their hosts). */
function deepActiveElement() {
  let active = document.activeElement
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
  return active
}

/** Absolute URL of `host`'s `source`, when it's on this page's origin;  else null. */
function sourceUrl(host) {
  try {
    const url = new URL(host.getAttribute("source"), document.baseURI)
    return url.origin === location.origin ? url : null
  } catch {
    return null
  }
}

/** Has `host` started on its body (loading, loaded, or failed:  then a re-fetch tries again)? */
function hasLoaded(host) {
  try {
    return host.matches(":state(loaded), :state(loading), :state(error)")
  } catch {
    return false
  }
}

/** Drop `url` from UI's cache of fetched files (`UI.sources`), so the next load fetches it. */
function forgetSource(url) {
  try {
    void window.SpellUI?.UI?.load?.()?.then((ui) => ui.sources.forget(url))
  } catch {
    // no UI yet:  nothing cached either
  }
}

/**
 * The host whose unloaded body holds element `id`:  its `data-part-ids` (the ids inside, written by
 * `PlanParts`;  a plan doc's `<epic-*>`:  `part-ids`), when the element isn't in the page yet;  else null.
 */
function hostHolding(main, id) {
  if (!id || document.getElementById(id)) return null
  const ids = (host) => (host.getAttribute("data-part-ids") ?? host.getAttribute("part-ids") ?? "").split(/\s+/)
  return (
    Array.from(main.querySelectorAll("[source]:is([data-part-ids], [part-ids])")).find((host) =>
      ids(host).includes(id)
    ) ?? null
  )
}

/** Parse a page's HTML into an inert document. */
function parse(html) {
  return new DOMParser().parseFromString(html, "text/html")
}

/** A document's (or body's) `main`, as `start()` finds it. */
function mainIn(root) {
  return root.querySelector("main.spell-doc-main") ?? root.querySelector("main")
}

/**
 * Patch the live page from source `before` to source `after` (parsed documents);  the plan, or null when it
 * can't be done safely (see `wireLiveUpdate()`).
 * - plans everything first (`planMorph()`), so a patch too big is refused before anything changes
 * - keeps the line being read where it is (`readingAnchor()`), whatever changed above it
 * - the `<title>` follows
 */
function patchPage(main, before, after) {
  const was = mainIn(before)
  const now = mainIn(after)
  if (!was || !now || headKey(before) !== headKey(after) || shellKey(before) !== shellKey(after)) return null
  const plan = { ops: [], weight: 0, changed: [] }
  planBodyAttributes(before.body, after.body, plan)
  if (planMorph(was, now, main, plan) !== main || plan.weight > now.outerHTML.length / 2) return null
  const anchor = readingAnchor(main)
  if (after.title !== before.title) document.title = after.title
  for (const op of plan.ops) op()
  keepAnchor(anchor)
  return plan
}

/**
 * What a page loads:  its stylesheets and scripts (not what the page server injects, nor inert data blocks:
 * `isInert()`), one line each.
 */
function headKey(doc) {
  const parts = Array.from(
    doc.querySelectorAll('link[rel~="stylesheet"]'),
    (link) => `css ${link.getAttribute("href")}`
  )
  for (const script of doc.querySelectorAll("script")) {
    const src = script.getAttribute("src")
    if (src?.startsWith("/_server/") || (!src && script.textContent.includes("SPELL_SERVER"))) continue
    if (!src && isInert(script)) continue
    parts.push(src ? `js ${src}` : `inline ${squash(script.textContent)}`)
  }
  return parts.join("\n")
}

/**
 * Everything in a page's `<body>` but `main`'s content, the scripts and `<body>`'s attributes (bar its `class`:
 * the runtime adds classes of its own), whitespace squashed.  The attributes are patched (`planBodyAttributes()`).
 */
function shellKey(doc) {
  const body = doc.body.cloneNode(true)
  mainIn(body)?.replaceChildren()
  for (const script of body.querySelectorAll("script")) script.remove()
  for (const name of body.getAttributeNames()) if (name !== "class") body.removeAttribute(name)
  return squash(body.outerHTML)
}

/**
 * Plan setting the `<body>` attributes whose source changed from `before` to `after` (`data-recent-since`,
 * `data-bedtime` ...) on the live `<body>`;  never `class` (`shellKey()` holds it).
 */
function planBodyAttributes(before, after, plan) {
  for (const name of new Set([...before.getAttributeNames(), ...after.getAttributeNames()])) {
    const value = after.getAttribute(name)
    if (name === "class" || value === before.getAttribute(name)) continue
    plan.ops.push(() =>
      value === null ? document.body.removeAttribute(name) : document.body.setAttribute(name, value)
    )
  }
}

/**
 * Plan turning `live` (whose source was `before`) into `after`;  returns the node that ends up in `live`'s place:
 * `live` itself when it's patched in place, else its replacement.
 * - unchanged (`sameNode()`):  nothing
 * - in place:  its source attributes that changed (not `KEPT_ATTRIBUTES`), then its children, matched by `id`, else
 *   in order by tag (`matchOf()`):  each patched in turn, new ones added, gone ones removed
 * - REPLACED, its reader's state carried over (`carryState()`):  a tag change, text of its own (a paragraph, a
 *   title:  the smallest thing that holds the changed text), a `MANAGERS` element, or children the live page
 *   doesn't line up with
 * - an `<epic-*>` element (`EPIC_TAG`) is NEVER replaced while its tag stays (P10 of `epic-components`):
 *   it keeps its fold, its loaded part and its controller.
 *   Its attributes are patched in place (its page state kept:  `EPIC_PAGE_STATE`), its children morphed as above;
 *   only where they can't be (text of its own changed, children that don't line up)
 *   are its CHILDREN replaced (`planContent()`), never the element
 * - SIDE EFFECT:  pushes the live changes onto `plan.ops`, and what's new onto `plan.changed`
 */
function planMorph(before, after, live, plan) {
  if (sameNode(before, after)) return live
  if (isHost(before, after, live)) return planHost(before, after, live, plan)
  const sameTag = live.localName === after.localName && before.localName === after.localName
  const epic = sameTag && EPIC_TAG.test(after.localName)
  if (!sameTag || (!epic && (live.matches(MANAGERS) || hasText(before) || hasText(after))))
    return planReplace(after, live, plan)
  const was = Array.from(before.children)
  const kids = liveKids(was, live)
  if (epic && (!kids || hasText(before) || hasText(after))) return planContent(before, after, live, plan)
  if (!kids) return planReplace(after, live, plan)
  planAttributes(before, after, live, plan)
  const now = Array.from(after.children)
  const free = new Set(was)
  let cursor = 0
  const slots = now.map((kid, index) => {
    const match = matchOf(kid, index)
    if (!match) return planNew(kid, plan)
    free.delete(match)
    const at = was.indexOf(match)
    if (!kid.id) cursor = at + 1
    return planMorph(match, kid, kids[at], plan)
  })
  if (slots.length !== kids.length || slots.some((slot, index) => slot !== kids[index]))
    plan.ops.push(() => placeChildren(live, kids, slots))
  return live

  /**
   * The old child new child `kid` (at `index`) is:  by `id`;  else the next unmatched one of its tag, preferring
   * one that's unchanged, but never one a LATER new child is identical to (then `kid` was inserted before it).
   */
  function matchOf(kid, index) {
    if (kid.id) {
      const match = was.find((old) => old.id === kid.id)
      return match && free.has(match) && match.localName === kid.localName ? match : undefined
    }
    const candidates = was.slice(cursor).filter((old) => free.has(old) && !old.id && old.localName === kid.localName)
    const equal = candidates.find((old) => sameNode(old, kid))
    if (equal) return equal
    const first = candidates[0]
    const later = now.slice(index + 1)
    if (first && !later.some((next) => !next.id && sameNode(first, next))) return first
    return undefined
  }
}

/**
 * Is `live` a section whose body comes from a file (`source`), the same file before and after?
 * Its body is the file's (`wireSourceBodies()`), not the page source's:  `planHost()`.
 * - not an accordion host (`<ui-accordion source>`):  a `MANAGERS` element, replaced whole as ever, its open panel
 *   carried over, so it loads its body again
 */
function isHost(before, after, live) {
  const source = after.getAttribute("source")
  return (
    source !== null &&
    before.getAttribute("source") === source &&
    live.getAttribute("source") === source &&
    live.localName === after.localName &&
    before.localName === after.localName &&
    !live.matches(MANAGERS)
  )
}

/**
 * Plan patching host `live` (`isHost()`):  its attributes, and its SLOTTED children (icon, header), each patched in
 * turn;  the body (every other child:  what the file put there, or the placeholder) is left alone.
 * - slotted children that don't line up:  the whole host is replaced, and loads its body again when open
 */
function planHost(before, after, live, plan) {
  const was = slottedOf(before)
  const now = slottedOf(after)
  const kids = slottedOf(live).filter((kid) => !kid.matches(ADDED))
  const lined =
    was.length === now.length &&
    kids.length === was.length &&
    was.every((kid, at) => kid.localName === now[at].localName && kids[at].localName === kid.localName)
  if (!lined) return planReplace(after, live, plan)
  planAttributes(before, after, live, plan)
  was.forEach((kid, at) => {
    const slot = planMorph(kid, now[at], kids[at], plan)
    if (slot !== kids[at]) plan.ops.push(() => kids[at].replaceWith(slot))
  })
  return live
}

/** `element`'s children headed for a named slot (`slot="icon"` ...). */
function slottedOf(element) {
  return Array.from(element.children).filter((kid) => kid.hasAttribute("slot"))
}

/**
 * `live`'s children that stand for source children `was`, in order:  the next live child of each one's tag (and
 * `id`), stepping over what the runtime added (`ADDED`) and other extras;  null when they don't line up.
 */
function liveKids(was, live) {
  const kids = Array.from(live.children).filter((kid) => !kid.matches(ADDED))
  const mapped = []
  let at = 0
  for (const old of was) {
    while (at < kids.length && (kids[at].localName !== old.localName || (old.id && kids[at].id !== old.id))) at++
    if (at === kids.length) return null
    mapped.push(kids[at++])
  }
  return mapped
}

/** Plan setting the source attributes that changed from `before` to `after` on `live`. */
function planAttributes(before, after, live, plan) {
  const changes = []
  for (const name of new Set([...before.getAttributeNames(), ...after.getAttributeNames()])) {
    const value = after.getAttribute(name)
    if (!KEPT_ATTRIBUTES.has(name) && value !== before.getAttribute(name)) changes.push([name, value])
  }
  if (!changes.length) return
  plan.changed.push(live)
  plan.ops.push(() => {
    for (const [name, value] of changes)
      if (value === null) live.removeAttribute(name)
      else live.setAttribute(name, value)
  })
}

/**
 * Plan giving `<epic-*>` element `live` the children of `after`, the element itself kept (`planMorph()`):
 * its source attributes patched, then its children replaced by copies of `after`'s, the reader's state carried over
 * (`carryState()`);  what the runtime or the page's review controls added (`ADDED`) stays.  Returns `live`.
 */
function planContent(before, after, live, plan) {
  planAttributes(before, after, live, plan)
  const nodes = Array.from(after.childNodes, (node) => {
    const copy = node.cloneNode(true)
    if (copy.nodeType === Node.ELEMENT_NODE) carryState(live, copy)
    return document.importNode(copy, true)
  })
  plan.weight += after.innerHTML.length
  plan.changed.push(...nodes.filter((node) => node.nodeType === Node.ELEMENT_NODE))
  plan.ops.push(() => {
    const kept = Array.from(live.children).filter((kid) => kid.matches(ADDED))
    live.replaceChildren(...nodes, ...kept)
  })
  return live
}

/** Plan replacing `live` with a copy of `after`, the reader's state carried over;  returns the copy. */
function planReplace(after, live, plan) {
  const copy = after.cloneNode(true)
  carryState(live, copy)
  return adopt(copy, after, plan)
}

/** Plan adding a copy of source element `after`, folded as a new section should be;  returns the copy. */
function planNew(after, plan) {
  const copy = after.cloneNode(true)
  carryFolds(copy)
  return adopt(copy, after, plan)
}

/**
 * `copy` (still in the parsed document) brought into this one, counted in the plan's weight.
 * - NOTE: its folds and panels are set BEFORE it's imported, so it draws that way first:  nothing animates
 */
function adopt(copy, source, plan) {
  const node = document.importNode(copy, true)
  plan.weight += source.outerHTML.length
  plan.changed.push(node)
  return node
}

/**
 * Put `slots` in `parent` in that order:  `kids` (its children as they were) not among them go, the rest stay where
 * they are when already in order, new ones go in after the slot before them.
 * - extras (`ADDED`, or anything else not in the source) stay where they are
 */
function placeChildren(parent, kids, slots) {
  for (const kid of kids) if (!slots.includes(kid)) kid.remove()
  let previous = null
  for (const node of slots) {
    const placed =
      node.parentNode === parent &&
      (!previous || previous.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)
    if (!placed) {
      if (previous) previous.after(node)
      else {
        const next = slots.find((slot) => slot !== node && slot.parentNode === parent)
        if (next) next.before(node)
        else parent.prepend(node)
      }
    }
    previous = node
  }
}

/**
 * Carry the reader's state from `live` to `copy`, its replacement (not yet imported):
 * - folds:  every section keeps its fold, new ones fold as `carryFolds()` says
 * - open panels:  each accordion's, matched by its nearest ancestor with an `id` and its order under it
 * - `<epic-*>` page state:  `carryEpicState()`
 * - typed text:  fields with an `id`
 */
function carryState(live, copy) {
  carryFolds(copy)
  carryEpicState(copy)
  const panels = accordionsOf(live)
  for (const [key, accordion] of accordionsOf(copy)) {
    const old = panels.get(key)
    if (!old) continue
    const open = openIndexes(old).join(" ")
    if (open) accordion.setAttribute("open", open)
    else accordion.removeAttribute("open")
  }
  for (const field of withSelf(copy, "textarea[id], input[id]")) {
    const old = document.getElementById(field.id)
    if (!old || !live.contains(old) || old.value === undefined) continue
    if (field.localName === "textarea") field.textContent = old.value
    else field.setAttribute("value", old.value)
  }
}

/**
 * Fold every collapsible section in `copy` as the reader has it:  as the live one with its `id`, else as saved
 * (`spell-folds:<path>`), else a plan doc's start-folded (`wireFolds()`);  else the markup's `collapsed` stands.
 */
function carryFolds(copy) {
  const saved = readJSON(`${FOLD_KEY_PREFIX}${location.pathname}`)
  const planDoc = document.body.classList.contains("plan-doc")
  for (const section of withSelf(copy, "ui-section[collapsible]")) {
    const old = section.id ? document.getElementById(section.id) : null
    if (old?.localName === "ui-section") section.toggleAttribute("collapsed", isCollapsed(old))
    else if (section.id && section.id in saved) section.toggleAttribute("collapsed", !!saved[section.id])
    else if (planDoc) section.setAttribute("collapsed", "")
  }
}

/**
 * Give every `<epic-*>` element with an `id` in `copy` the page state (`EPIC_PAGE_STATE`:  `open` ...) of the live one
 * with that `id` and tag;  a new one starts as its markup says (folded:  `open` is never in the file).
 */
function carryEpicState(copy) {
  for (const element of withSelf(copy, "[id]")) {
    if (!EPIC_TAG.test(element.localName)) continue
    const old = document.getElementById(element.id)
    if (old?.localName !== element.localName) continue
    for (const name of EPIC_PAGE_STATE) {
      const value = old.getAttribute(name)
      if (value === null) element.removeAttribute(name)
      else element.setAttribute(name, value)
    }
  }
}

/** `root`'s accordions (itself included), by `<owner id>:<n>`:  the nearest ancestor with an `id` inside `root`. */
function accordionsOf(root) {
  const byKey = new Map()
  const counts = new Map()
  for (const accordion of withSelf(root, "ui-accordion")) {
    let owner = accordion === root ? null : accordion.parentElement
    while (owner && owner !== root && !owner.id) owner = owner.parentElement
    const name = accordion === root ? "" : (owner?.id ?? "")
    const n = counts.get(name) ?? 0
    counts.set(name, n + 1)
    byKey.set(`${name}:${n}`, accordion)
  }
  return byKey
}

/** `root` (when it matches `selector`) and every element under it that does, in document order. */
function withSelf(root, selector) {
  return [...(root.matches(selector) ? [root] : []), ...root.querySelectorAll(selector)]
}

/** Are two source elements the same, ignoring how whitespace falls (a reformat re-wraps lines)? */
function sameNode(a, b) {
  return a.isEqualNode(b) || squashedOf(a) === squashedOf(b)
}

/** `squash()`ed `outerHTML` of source node `node`, cached. */
function squashedOf(node) {
  let value = squashed.get(node)
  if (value === undefined) squashed.set(node, (value = squash(node.outerHTML)))
  return value
}

/** Markup with every run of whitespace one space, and none between tags. */
function squash(html) {
  return html.replace(/\s+/g, " ").replace(/> </g, "><").trim()
}

/** Does `element` hold text of its own (not just whitespace between its children)? */
function hasText(element) {
  return Array.from(element.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.data.trim())
}

/** What the reader is looking at:  the element just below the stuck titles, mid-column, and its top. */
function readingAnchor(main) {
  const box = main.getBoundingClientRect()
  const element = document.elementFromPoint(box.left + box.width / 2, Math.min(innerHeight - 1, stuckBottom(main) + 8))
  return element && main.contains(element) ? { element, top: element.getBoundingClientRect().top } : null
}

/** Scroll so `anchor` (`readingAnchor()`) is where it was, if it's still in the page. */
function keepAnchor(anchor) {
  if (!anchor?.element.isConnected) return
  const moved = anchor.element.getBoundingClientRect().top - anchor.top
  if (Math.abs(moved) >= 1) scrollBy({ top: moved, behavior: "instant" })
}

/**
 * After a patch, redo what the runtime built from the markup, as `start()` did:
 * - the outline (ids for new entries), counts, item filters
 * - the toolbar, rebuilt only when its entries, icons or counts changed (`railKey()`)
 * - sticky lines, re-tracked when new sections came in
 * - code colors in what's new;  scroll-follow re-read
 * - then `spell-doc:updated` on `window`, `detail.changed`
 * - `page`:  what `start()` wired (`{ main, rail, sticky, follow, entries }`);  updated here
 */
async function rewire(page, changed) {
  const { main } = page
  // a plan doc's blocks take the change in a microtask (Solid batches):  their entries (`contentsEntry`) read it after
  if (main.querySelector("epic-page")) await nextFrames(1)
  const outline = outlineOf(main)
  const counts = countItems(outline)
  wireItemFilters(main)
  highlightIn(changed)
  const entries = railKey(outline, counts)
  if (entries !== page.entries) page.rail = buildNavigation(main, outline, counts)
  page.entries = entries
  if (changed.some((node) => withSelf(node, "ui-section").length)) page.sticky = trackStickyHeights(main, outline)
  page.follow.rescan(page.rail)
  await nextFrames(UNFOLD_FRAMES)
  page.sticky.measure()
  page.follow?.update()
  dispatchEvent(new CustomEvent("spell-doc:updated", { detail: { changed } }))
}

/** What the toolbar is built from, as one string:  entries, labels, icons, what needs Owen. */
function railKey(outline, counts) {
  return JSON.stringify(outline.groups.map(entry))

  /** One top-level entry:  its id, label, icon and state, and how many of its items need Owen (and how). */
  function entry(node) {
    const count = counts.get(node.element)
    return [node.id, node.label, node.glyph, node.element.dataset.state, count?.attention ?? 0, count?.replied ?? 0]
  }
}

/** Color the code blocks in `elements` that aren't yet (`highlight()` colored the rest at load). */
function highlightIn(elements) {
  const hljs = globalThis.hljs
  if (!hljs?.highlightElement) return
  for (const element of elements)
    for (const code of withSelf(element, "pre code"))
      try {
        if (!code.dataset.highlighted) hljs.highlightElement(code)
      } catch {
        // plain monospace is fine
      }
}

////////////////
// ## Outline
////////////////

/**
 * The page's outline, from either markup (see the header):  what the toolbar, the counts, scroll-follow
 * and the anchors work from.
 * - SECTIONS markup (`main > ui-section`, or a plan doc's `<epic-page>`):  top-level sections are the groups
 *   - their entries, at any depth:
 *     nested sections, and the h3s / h4s in a section's own content (CHEATSHEET cards, sub-sub-items)
 *   - an h4 right after an h3 of the same section goes under it
 *   - a plan doc's sections are its folding blocks
 *     (`EPIC_FOLDS`:  the Overview and its parts, the sections, the phases)
 * - HEADINGS markup:  h2s are the groups, h3s their entries, h4s under the h3 before them
 * - a node:  `{ element, id, label, glyph, children }` -- `glyph` the name of its (first) `<ui-icon>`, for the toolbar
 * - returns `{ sections, groups, orphans, targets, entryOf, groupOf, folded }`:
 *   - `orphans`:  entries before or outside any group
 *   - `targets`:  selector of every entry's element, for scroll-follow
 *   - `entryOf(element)`:  the entry holding `element`, which a jump to it makes current
 *   - `groupOf(entry)`:  its top-level element, for the toolbar
 *   - `folded(element)`:  hidden by a folded section around it (SECTIONS;  HEADINGS hide those with `display`)
 * - SIDE EFFECT:  gives an entry with no `id` a slug of its label (`-2`, `-3` ... when taken)
 */
function outlineOf(main) {
  const sections = !!main.querySelector(":scope > :is(ui-section, epic-page)")
  const groups = []
  const orphans = []
  if (sections) readSections()
  else readHeadings()
  return {
    sections,
    groups,
    orphans,
    targets: sections ? `:is(${SECTIONS}, h3, h4)[id]` : "h2[id], h3[id], h4[id]",
    entryOf,
    groupOf,
    folded
  }

  /**
   * SECTIONS:  every section, h3 and h4 in `main`, under the section it's in.
   * - not the headings in a plan item's earlier versions (`<epic-original>`):  earlier text, not the page's
   */
  function readSections() {
    const nodes = new Map()
    const elements = Array.from(main.querySelectorAll(`${SECTIONS}, h3, h4`)).filter(
      (element) => !element.closest("epic-original")
    )
    for (const element of elements) {
      const node = nodeOf(element)
      nodes.set(element, node)
      const owner = element.parentElement?.closest(SECTIONS)
      const list = owner ? nodes.get(owner).children : element.matches(SECTIONS) ? groups : orphans
      const last = list.at(-1)
      if (element.localName === "h4" && last?.element.localName === "h3") last.children.push(node)
      else list.push(node)
    }
  }

  /** HEADINGS:  h2 / h3 / h4 in document order. */
  function readHeadings() {
    for (const heading of main.querySelectorAll("h2, h3, h4")) {
      const node = nodeOf(heading)
      const group = groups.at(-1)
      if (heading.localName === "h2") groups.push(node)
      else if (heading.localName === "h3") (group?.children ?? orphans).push(node)
      else {
        const parent = group?.children.at(-1)
        if (parent?.element.localName === "h3") parent.children.push(node)
        else (group?.children ?? orphans).push(node)
      }
    }
  }

  /** The entry a jump to `element` makes current:  itself, else its section's (heading's) entry. */
  function entryOf(element) {
    if (sections) return element.closest(`${SECTIONS}, h3, h4`)
    if (/^H[234]$/.test(element.tagName)) return element
    return element.closest("section")?.querySelector(":scope > ui-sticky > :is(h2, h3)") ?? null
  }

  /** The top-level element `entry` is in:  the outermost section, or the h2. */
  function groupOf(entry) {
    if (!sections) return entry.localName === "h2" ? entry : entry.closest("section.s2")?.querySelector("h2")
    let top = null
    for (let section = entry.closest(SECTIONS); section; section = section.parentElement?.closest(SECTIONS))
      top = section
    return top
  }

  /** Is `element` inside a folded section (not counting itself)? */
  function folded(element) {
    if (!sections) return false
    for (let section = element.parentElement?.closest(SECTIONS); section;) {
      if (isCollapsed(section)) return true
      section = section.parentElement?.closest(SECTIONS)
    }
    return false
  }
}

/**
 * An outline node for a heading, a `<ui-section>` or a plan doc's block;  gives it an id if it has none.
 * - a block:  what its host says (`contentsEntry`), its id before it has drawn
 */
function nodeOf(element) {
  if (element.matches(EPIC_FOLDS)) {
    const entry = element.contentsEntry
    return { element, id: element.id, label: entry?.label ?? element.id, glyph: entry?.icon, children: [] }
  }
  const section = element.localName === "ui-section"
  const label = section ? sectionLabel(element) : labelOf(element)
  if (!element.id) element.id = uniqueId(slug(label) || "section")
  const glyph = section
    ? (element.querySelector(':scope > ui-icon[slot="icon"]')?.getAttribute("name") ?? element.getAttribute("icon"))
    : element.querySelector("ui-icon")?.getAttribute("name")
  return { element, id: element.id, label, glyph: glyph || undefined, children: [] }
}

/** A `<ui-section>`'s label:  its `header`, else the text of its `slot="header"` child. */
function sectionLabel(section) {
  const header = section.getAttribute("header")?.trim()
  if (header) return header
  const slotted = section.querySelector(':scope > [slot="header"]')
  return slotted ? labelOf(slotted) : ""
}

/** `id`, or `id-2`, `id-3` ... if the page already has it. */
function uniqueId(id) {
  let candidate = id
  for (let n = 2; document.getElementById(candidate); n++) candidate = `${id}-${n}`
  return candidate
}

/**
 * Is `section` folded?  A `<ui-section>`:  its `collapsed` property, else (not upgraded yet) the attribute;
 * a plan doc's block (or item):  not `open`, by the property, else the attribute.
 */
function isCollapsed(section) {
  if (section.matches(EPIC_OPENERS))
    return !(typeof section.open === "boolean" ? section.open : section.hasAttribute("open"))
  return typeof section.collapsed === "boolean" ? section.collapsed : section.hasAttribute("collapsed")
}

/**
 * Fold or unfold a section without an event:  `collapsed` (`<ui-section>`) and `open` (a plan doc's blocks and
 * items) are controlled, so writing them announces nothing.
 */
function setCollapsed(section, collapsed) {
  if (section.matches(EPIC_OPENERS)) section.toggleAttribute("open", !collapsed)
  else section.toggleAttribute("collapsed", collapsed)
}

/**
 * The shadow title bar of a `<ui-section>` (its public `title` part), once it has rendered;  a plan doc's block's:
 * the one of the `<ui-section>` it draws in its own shadow root.
 */
function titleOf(section) {
  const inner = section.matches(EPIC_FOLDS) ? section.shadowRoot?.querySelector("ui-section") : section
  return inner?.shadowRoot?.querySelector('[part~="title"]') ?? null
}

////////////////
// ## Text
////////////////

/** A heading's label:  its text without badges, whitespace collapsed. */
function labelOf(heading) {
  const clone = heading.cloneNode(true)
  for (const badge of clone.querySelectorAll(".tag, ui-label")) badge.remove()
  return clone.textContent.replace(/\s+/g, " ").trim()
}

/** Slug for a heading id. */
function slug(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
}

/** Escape for HTML text. */
function text(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** Escape for a double-quoted attribute value. */
function attr(value) {
  return text(value).replace(/"/g, "&quot;")
}

////////////////
// ## Counts
////////////////

/**
 * Item statuses that DON'T count as open:  finished (`done`), made moot (`canceled`), and a plan's answered
 * questions (`decided`) -- in "Questions" only the questions waiting on the reader are open.
 * - `$/epics/tool/planDoc.types` `CLOSED` is the same set
 */
const CLOSED = new Set(["done", "decided", "canceled"])

/**
 * A plan doc's block's items that need Owen, when its `contentsEntry` count doesn't say:
 * its own items (`COUNTED` in `packages/epics`' `EpicSection.types.ts`) the plan-doc tool marked
 * - `attention` (red)
 * - or `replied` (orange:  Claude answered with options, Owen's turn to pick;  `EpicItem.types.ts` `NEEDS_OWEN`).
 */
const EPIC_ATTENTION =
  ':scope > epic-item:is([state="attention"], [state="replied"]), :scope > epic-phase[state="attention"]'

/**
 * Of those, the ones Claude answered with options, waiting on Owen's pick (`replied`, orange):  the plan-doc toolbar
 * shows them apart from the urgent ones (red;  `buildToolbar()`).
 */
const EPIC_REPLIED = ':scope > :is(epic-item, epic-phase)[state="replied"]'

/** A count pill's tooltip:  "2 need you", "1 needs you". */
function needYou({ attention }) {
  return `${attention} ${attention === 1 ? "needs" : "need"} you`
}

/**
 * Each top-level section's items -- `[data-status]` elements, not counting ones inside another --
 * as `{ open, total, attention }`, by the group's element (the `<ui-section>`, or the h2).
 * - "open":  any status but `CLOSED`'s
 * - "attention":  the items that need Owen (`stateOf()`:  the toolbar's red badge, Q20 of epic `epic-components`)
 * - sections without items are left out;  nested sections get no count of their own
 * - the Epics index's epic cards, the goals pages' items
 * - a plan doc's sections count themselves (`<epic-section>`, on their titles):  their count is read from their
 *   hosts' `contentsEntry`, never written;
 *   its `attention` too, else the items' `state="attention"` (`EPIC_ATTENTION`);
 *   and `replied`, how many of those wait on Owen's pick (`EPIC_REPLIED`:  the toolbar's orange badge)
 * - SIDE EFFECT:  writes `open/total` on the section's title:  its `badge` (SECTIONS), or a `ui-label.spell-count`
 *   at the right of the h2 (HEADINGS);  callable again (it replaces both)
 */
function countItems(outline) {
  const counts = new Map()
  for (const { element } of outline.groups) {
    if (element.matches(EPIC_FOLDS)) {
      const count = element.contentsEntry?.count
      if (count) {
        const attention = count.attention ?? element.querySelectorAll(EPIC_ATTENTION).length
        const replied = Math.min(attention, element.querySelectorAll(EPIC_REPLIED).length)
        counts.set(element, { ...count, attention, replied })
      }
      continue
    }
    const section = outline.sections ? element : headingSection(element)
    if (!section) continue
    const items = Array.from(section.querySelectorAll("[data-status]")).filter((item) => outermost(item, section))
    if (!items.length) continue
    const open = items.filter((item) => !CLOSED.has(item.dataset.status)).length
    const attention = items.filter((item) => stateOf(item) === "attention").length
    counts.set(element, { open, total: items.length, attention })
    if (outline.sections) {
      element.setAttribute("badge", `${open}/${items.length}`)
      continue
    }
    element.querySelector(":scope > ui-label.spell-count")?.remove()
    const label = document.createElement("ui-label")
    label.className = "spell-count"
    label.setAttribute("size", "tiny")
    label.setAttribute("basic", "")
    label.title = `${open} open of ${items.length}`
    label.textContent = `${open}/${items.length}`
    element.append(label)
  }
  return counts
}

/** The `section.s2` an h2 heads (`section > ui-sticky.spell-h2 > h2`), else null. */
function headingSection(h2) {
  const sticky = h2.parentElement
  return sticky?.matches("section > ui-sticky.spell-h2") ? sticky.parentElement : null
}

/** Is `item` the outermost `[data-status]` within `section` (not an item's part)? */
function outermost(item, section) {
  const outer = item.parentElement?.closest("[data-status]")
  return !outer || !section.contains(outer)
}

////////////////
// ## Item states and filter
////////////////

/**
 * Where an item stands, in the colours Owen reads at a glance:  `[state, tooltip words]`, in the item filter's order
 * after "all" (the plan docs' order, `<epic-section>`'s `FILTER_STATES`).
 * - the colour scheme (Q20 of epic `epic-components`, 2026-10-08;  `templates/epics/plan-doc.md`, "Colours"):
 *   attention red, progress blue (Claude is working on it), open yellow, recent green, old grey;
 *   `spell-doc.css`'s `--spell-state-*` tokens
 * - for the Epics index's epic cards (`.spell-epics`) and the goals pages' items (`.plan-items`, coloured by
 *   `goals.css`);  a plan doc's items colour and filter themselves (`<epic-item>`, `<epic-section>`)
 * - `data-state` when the page writes one;  else from the status (`stateOf()`)
 */
const ITEM_STATES = [
  ["attention", "needs you"],
  ["progress", "Claude is working on it"],
  ["open", "open, still undecided"],
  ["recent", "decided or done"],
  ["old", "no longer relevant"]
]

/**
 * A closed item's state, by its status:  decided or done stay `recent` (green) however old;  only `canceled` is `old`
 * (grey:  no longer relevant).  Owen, 2026-10-08;  `packages/epics` `PlanReader.itemState()`, the same rule.
 */
const CLOSED_STATES = { done: "recent", decided: "recent", canceled: "old" }

/** The state names, for checking a `data-state`. */
const STATE_NAMES = new Set(ITEM_STATES.map(([state]) => state))

/** The goals pages' items, and the index's epic cards:  what states and the filter apply to. */
const STATE_ITEMS = ":is(.plan-items, .spell-epics) > [data-status]"

/** The goals pages' items that wait on Owen while open:  their questions (`/goals` talks them through with him). */
const ASKS_OWEN = '.plan-items[data-kind="question"] > *'

/**
 * An item's state:  its `data-state`, else (the index's epic cards, the goals pages' items) from its status:
 * `done` / `decided` are `recent`, `canceled` `old` (`CLOSED_STATES`);  an open goals question (`ASKS_OWEN`)
 * `attention`;  anything else `open`.
 */
function stateOf(item) {
  const state = item.dataset.state
  if (STATE_NAMES.has(state)) return state
  if (CLOSED.has(item.dataset.status)) return CLOSED_STATES[item.dataset.status]
  return item.matches(ASKS_OWEN) ? "attention" : "open"
}

/**
 * An item's id chip's tooltip:  where it stands in words, then its review marks (Owen, 2026-10-04), e.g.
 * "Needs your attention · not reviewed yet", "Decided or reviewed recently · reviewed 2026-10-03".
 */
function stateTip(item) {
  const words = ITEM_STATES.find(([state]) => state === item.dataset.spellState)?.[1] ?? ""
  const parts = [words.charAt(0).toUpperCase() + words.slice(1)]
  const { reviewed, deferred, queued, work, status } = item.dataset
  if (queued) parts.push(`to do:  ${work || "queued"}`)
  if (reviewed) parts.push(`reviewed ${reviewed}`)
  else if (deferred) parts.push(`deferred ${deferred}`)
  else if (status === "open") parts.push("not reviewed yet")
  return parts.join(" · ")
}

/**
 * Mark every item's state as `data-spell-state` (`stateOf()`), so CSS has ONE attribute to color by;
 * an item's id chip (`.plan-id`, the goals pages') says it in words.
 * - SIDE EFFECT:  sets `data-spell-state`;
 *   callable again (a page updated in place:  a replaced item comes back without it)
 */
function markItemStates(main) {
  for (const item of main.querySelectorAll(STATE_ITEMS)) {
    item.dataset.spellState = stateOf(item)
    const chip = item.querySelector(".plan-id")
    if (chip) chip.title = stateTip(item)
  }
}

/**
 * The status filter on every top-level `<ui-section>` with a filterable list
 * (the index's `.spell-epics`, a `.plan-items` list, each holding `[data-status]` children):
 * - ONE chip per state the section has items in, in its colour, with how many (Owen, 2026-10-10:  no filter icon):
 *   SOLID while its items show, OUTLINED while hidden
 * - a click, by `nextShown()`:  everything showing, only that state;  else a hidden state shows too and a shown one
 *   hides;  the only one showing, everything again
 * - in the title's `actions` slot (`span.spell-item-filter`);  `spell-doc.css` puts it left of the count badge
 * - a filtered list shows "3 hidden · show all" under it (`.spell-hidden-note`):  a click there shows all
 * - the choice:  `data-show="<states shown>"` on the section (none for all), `data-spell-hidden` on the items it
 *   hides (CSS hides them);  remembered per page (`localStorage`, `{ [section id]: [states] }`);  all by default
 * - a plan doc's sections filter themselves (`<epic-section>`), by the same rule
 * - SIDE EFFECT:  marks the items' states (`markItemStates()`), adds the chips and notes to the page;
 *   callable again (it replaces the ones it added)
 */
function wireItemFilters(main) {
  const key = `${ITEM_FILTER_KEY_PREFIX}${location.pathname}`
  const saved = readJSON(key)
  for (const old of main.querySelectorAll(":scope > ui-section > .spell-item-filter, a.spell-hidden-note")) old.remove()
  markItemStates(main)
  for (const section of main.querySelectorAll(":scope > ui-section[id]")) {
    const lists = Array.from(section.querySelectorAll(".plan-items, .spell-epics")).filter((list) =>
      list.querySelector(":scope > [data-status]")
    )
    if (!lists.length) continue
    const counts = new Map()
    for (const item of lists.flatMap(itemsOf))
      counts.set(item.dataset.spellState, (counts.get(item.dataset.spellState) ?? 0) + 1)
    const present = ITEM_STATES.filter(([state]) => counts.has(state))
    const states = present.map(([state]) => state)
    const group = document.createElement("span")
    group.className = "spell-item-filter"
    group.slot = "actions"
    group.dataset.spellAdded = ""
    group.setAttribute("role", "group")
    group.setAttribute("aria-label", "Show items by state")
    const buttons = present.map(([state]) => stateButton(state, counts.get(state)))
    group.append(...buttons)
    const notes = lists.map((list) => {
      const note = document.createElement("a")
      note.className = "spell-hidden-note"
      note.href = "#"
      note.dataset.spellAdded = ""
      note.addEventListener("click", (event) => {
        event.preventDefault()
        choose(states)
      })
      list.after(note)
      return note
    })
    const filter = { section, lists, notes, buttons, present, counts }
    for (const button of buttons)
      button.addEventListener("click", () => choose(nextShown(states, filterShown(filter), button.dataset.state)))
    section.append(group)
    const remembered = Array.isArray(saved[section.id]) ? saved[section.id].filter((state) => counts.has(state)) : []
    showItems(filter, remembered.length ? remembered : states)

    /** The reader picked the states `shown`:  apply them and remember. */
    function choose(shown) {
      showItems(filter, shown)
      saved[section.id] = shown
      writeJSON(key, saved)
    }
  }

  /** A state chip:  `state` (`spell-doc.css` colours it by it), its `count` of items. */
  function stateButton(state, count) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "spell-state-toggle"
    button.dataset.state = state
    button.textContent = String(count)
    return button
  }
}

/**
 * What shows after a click on `clicked`'s chip, of the states `present`, `shown` showing now (Owen, 2026-10-10:
 * "if all states are showing and I click one state, I want you to show just that state"):
 * - everything showing:  only `clicked`;  `clicked` hidden:  it shows too;
 *   `clicked` showing with others:  it hides;  `clicked` the only one showing:  everything again
 * - the plan docs' rule too:  `packages/epics` `StateFilter.nextShown()`, the same lines (the pack can't be imported)
 */
function nextShown(present, shown, clicked) {
  const showing = present.filter((state) => shown.includes(state))
  if (showing.length === present.length) return [clicked]
  if (!showing.includes(clicked)) return present.filter((state) => state === clicked || showing.includes(state))
  if (showing.length === 1) return [...present]
  return showing.filter((state) => state !== clicked)
}

/** The states a filter shows now (`{ buttons }`, see `wireItemFilters()`). */
function filterShown({ buttons }) {
  return buttons
    .filter((button) => button.getAttribute("aria-pressed") === "true")
    .map((button) => button.dataset.state)
}

/**
 * Show the items of the states `shown` in a filter's section (`{ section, lists, notes, buttons, present, counts }`):
 * each chip pressed or not, its tooltip saying how many, which state and what its click does;
 * an "N hidden" note under each list that hides any.
 */
function showItems({ section, lists, notes, buttons, present, counts }, shown) {
  const showing = new Set(shown)
  const states = present.map(([state]) => state)
  for (const button of buttons) {
    const state = button.dataset.state
    button.setAttribute("aria-pressed", String(showing.has(state)))
    const words = ITEM_STATES.find(([each]) => each === state)?.[1] ?? ""
    const next = nextShown(states, [...showing], state)
    const does =
      next.length === states.length
        ? "show everything"
        : next.length === 1 && next[0] === state
          ? "show only these"
          : next.includes(state)
            ? "show these too"
            : "hide these"
    button.title = `${counts.get(state)} ${words}:  ${does}`
    button.setAttribute("aria-label", button.title)
  }
  const everything = states.every((state) => showing.has(state))
  if (everything) delete section.dataset.show
  else section.dataset.show = [...showing].join(" ")
  lists.forEach((list, index) => {
    let hidden = 0
    for (const item of itemsOf(list)) {
      const hide = !showing.has(item.dataset.spellState)
      item.toggleAttribute("data-spell-hidden", hide)
      if (hide) hidden++
    }
    notes[index].hidden = hidden === 0
    notes[index].textContent = `${hidden} hidden · show all`
  })
}

/** A filterable list's items:  its `[data-status]` children. */
function itemsOf(list) {
  return Array.from(list.querySelectorAll(":scope > [data-status]"))
}

////////////////
// ## Toolbar
////////////////

/** Below this many px for each title, a page toolbar shows its buttons' icons only (`fitTitles()`). */
const MIN_TITLE_PX = 50

/**
 * The page's navigation:  a plan doc's toolbar (`buildToolbar()`), else the page toolbar (`buildPageToolbar()`).
 * - returns the `<nav>`, whose `[data-rail]` entries scroll-follow marks;  none without top-level sections
 * - `data-rail`:  the name the floating rail gave them (gone since epic `airplane` P8);  kept, as scroll-follow,
 *   `details.js` and `check-spell.js` read it
 */
function buildNavigation(main, outline, counts) {
  const page = document.body.classList.contains("plan-doc") ? main.querySelector("epic-page") : null
  return page ? buildToolbar(page, outline, counts) : buildPageToolbar(main, outline, counts)
}

/**
 * Every other page's navigation (Owen, 2026-10-10:  "Make the floating sidebar in guides a sticky top toolbar like the
 * plan doc.  Have section titles in this one"):  a row of buttons, one per top-level section, in the sticky page
 * header, in place of the floating rail.
 * - each:  the section's mark and its title, a link to it (`wireAnchors()` lands it);  scroll-follow marks the current
 *   one `selected`, by `data-rail`
 *   - the mark:  an item's number for an item (`Q3 · When?` shows 3, coloured by the section's `data-state`:  a
 *     details page's questions, `details.js`);  else its `<ui-icon>`;  else its number (`2.`);  else its first letter
 *   - a red badge:  how many of its items need Owen (`counts`, `attention`);  none, none
 * - titles too long for the row end in `...`;  when each would get under `MIN_TITLE_PX`, they go, and the buttons
 *   show their marks only, the title as their tooltip (`fitTitles()`);  still too wide, the row scrolls sideways
 * - where:  the last row of the sticky page header (`ui-sticky.spell-h1 > header.spell-page-head`), so it sticks with
 *   it and the titles stick below it;  a page without one (the goals pages, a cheat sheet):  the last row of its
 *   filter bar (`.spell-filter`), else a sticky bar of its own before the first section (`.spell-toolbar-alone`,
 *   measured as the filter bar is:  `trackStickyHeights()`)
 * - HEADINGS (the goals pages):  only the h2s that head a sticky section
 * - callable again (a page updated in place):  replaces the toolbar it built before
 * - SIDE EFFECT:  adds the `<nav>` inside `main`, marked `data-spell-added` so the live patch steps around it;
 *   removes a hand-written `.spell-toc-open` (pages before 2026-10-01 had a "Contents" button)
 */
function buildPageToolbar(main, outline, counts) {
  for (const old of document.querySelectorAll(".spell-toc-open, nav.spell-toolbar")) old.remove()
  const groups = outline.sections ? outline.groups : outline.groups.filter((group) => headingSection(group.element))
  const entries = groups.map(({ element, id, label, glyph }) => {
    // an item id first in the label (`Q3 · When?`) says more than any icon:  every question's would be the same
    const itemNumber = label.match(/^[A-Z](\d+)\b/)?.[1]
    const mark = itemNumber
      ? `<b class="spell-toolbar-number">${text(itemNumber)}</b>`
      : glyph
        ? `<ui-icon name="${attr(glyph)}"></ui-icon>`
        : `<b>${text((label.match(/^\d+/) ?? [label.charAt(0)])[0])}</b>`
    const name = itemNumber ? label : shortLabel(label)
    const count = counts.get(element)
    const badge = count?.attention
      ? `<span class="spell-toolbar-count urgent" title="${needYou(count)}">${count.attention}</span>`
      : ""
    const state = element.dataset.state ? ` data-state="${attr(element.dataset.state)}"` : ""
    return (
      `<a class="spell-toolbar-item" href="#${attr(id)}" data-rail="${attr(id)}" title="${attr(label)}"${state}>` +
      `<span class="spell-toolbar-icon">${mark}</span><span class="spell-toolbar-label">${text(name)}</span>` +
      `${badge}</a>`
    )
  })
  if (!entries.length) return undefined
  const toolbar = document.createElement("nav")
  toolbar.className = "spell-toolbar spell-toolbar-titled"
  toolbar.dataset.spellAdded = ""
  toolbar.setAttribute("aria-label", "Sections")
  toolbar.innerHTML = `<div class="spell-toolbar-items">${entries.join("")}</div>`
  const head =
    main.querySelector(":scope > ui-sticky.spell-h1 > .spell-page-head") ?? main.querySelector(".spell-filter")
  if (head) head.append(toolbar)
  else {
    toolbar.classList.add("spell-toolbar-alone")
    const first = groups[0].element
    ;(outline.sections ? first : (headingSection(first) ?? first)).before(toolbar)
  }
  // the current button in view, on a row scrolled sideways
  new MutationObserver((changes) => {
    for (const { target } of changes) if (target.hasAttribute("selected")) scrollIntoRow(target)
  }).observe(toolbar, { subtree: true, attributeFilter: ["selected"] })
  // fitted again as the window changes width, and as the icons draw and the fonts load
  const fit = new ResizeObserver(() => fitTitles(toolbar))
  for (const box of [toolbar, ...toolbar.querySelectorAll(".spell-toolbar-icon")]) fit.observe(box)
  void document.fonts?.ready.then(() => fitTitles(toolbar))
  return toolbar
}

/**
 * The page toolbar's titles:  shown, shrinking with `...` (CSS), while each gets `MIN_TITLE_PX` or more of the row;
 * else gone (`spell-toolbar-icons`), the marks only (Owen, 2026-10-10:  "remove the titles entirely if they each only
 * get less than 50px").
 * - each title's share:  the row's room, less every button's mark, badge and padding, split evenly
 */
function fitTitles(toolbar) {
  const row = toolbar.firstElementChild
  const items = Array.from(row.children)
  toolbar.classList.remove("spell-toolbar-icons")
  if (!items.length) return
  const style = getComputedStyle(row)
  const room =
    row.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight) -
    (parseFloat(style.columnGap) || 0) * (items.length - 1)
  const fixed = items.reduce(
    (sum, item) => sum + item.offsetWidth - (item.querySelector(".spell-toolbar-label")?.offsetWidth ?? 0),
    0
  )
  if ((room - fixed) / items.length < MIN_TITLE_PX) toolbar.classList.add("spell-toolbar-icons")
}

/**
 * A PLAN DOC's navigation (epic `airplane` P8, Owen 2026-10-10:  "The contents sidebar on the plan doc should be a
 * sticky top toolbar instead"):  a row of buttons across the bottom of `<epic-page>`'s sticky header, one per
 * top-level block (Overview, Phases, Questions ... Log), in place of the floating rail it had before.
 * - each:  the block's icon, a link to it (`wireAnchors()` lands it);  its title without its number (`Questions`)
 *   only as its tooltip and name (Owen, 2026-10-10:  "lose the titles ... when I click on the thing it goes to that
 *   section anyway");  scroll-follow marks the current one `selected`, by `data-rail` (as the rail's)
 * - BADGES:  how many of the block's items wait on Owen, from `counts` (none:  no badge)
 *   - red:  urgent (`state="attention"`)
 *   - orange:  Claude answered with options, his turn to pick (`state="replied"`)
 *   - both kinds:  both badges, red first
 *   - over the icon's top right, a third of a badge on the icon (Owen, 2026-10-10:  "Make badge 1/3 way overlap the
 *     icon"):  every button is the same width, badge or not
 * - in the header's `toolbar` slot (`<epic-page>`'s):  it sticks with the header, and the header's measured height,
 *   where every title below sticks (`--epic-stack`), takes it in;  `<epic-page>` draws the rest of that row at its
 *   right (the page's state filter, collapse-all, the new item button)
 * - a window too narrow for every button:  the row scrolls sideways (`spell-doc.css`, "Toolbar"), the current button
 *   scrolled into view
 * - callable again (a page updated in place):  replaces the toolbar built before
 * - SIDE EFFECT:  appends the `<nav>` to `page`, marked `data-spell-added` so the live patch steps around it
 */
function buildToolbar(page, outline, counts) {
  for (const old of document.querySelectorAll(".spell-toc-open, nav.spell-toolbar")) old.remove()
  const entries = outline.groups.map(({ element, id, label, glyph }) => {
    const count = counts.get(element)
    const replied = count?.replied ?? 0
    const urgent = (count?.attention ?? 0) - replied
    const name = shortLabel(label)
    // spoken:  the name, then what the badges say
    const spoken = [name, urgent > 0 && `${urgent} urgent`, replied > 0 && `${replied} replied`]
      .filter(Boolean)
      .join(", ")
    // no icon:  the label's first letter stands in
    const mark = glyph ? `<ui-icon name="${attr(glyph)}"></ui-icon>` : `<b>${text(name.charAt(0))}</b>`
    const badges =
      badge("urgent", urgent, `${urgent} urgent`) +
      badge("replied", replied, `${replied} replied:  ${replied === 1 ? "waits" : "wait"} for your pick`)
    // the badges inside the icon's box, over its top right:  every button the same width, badges or not
    return (
      `<a class="spell-toolbar-item" href="#${attr(id)}" data-rail="${attr(id)}" title="${attr(name)}" ` +
      `aria-label="${attr(spoken)}"><span class="spell-toolbar-icon">${mark}` +
      (badges && `<span class="spell-toolbar-badges">${badges}</span>`) +
      `</span></a>`
    )
  })
  if (!entries.length) return undefined
  const toolbar = document.createElement("nav")
  toolbar.className = "spell-toolbar"
  toolbar.slot = "toolbar"
  toolbar.dataset.spellAdded = ""
  toolbar.setAttribute("aria-label", "Sections")
  toolbar.innerHTML = `<div class="spell-toolbar-items">${entries.join("")}</div>`
  // the current button in view, on a row scrolled sideways
  new MutationObserver((changes) => {
    for (const { target } of changes) if (target.hasAttribute("selected")) scrollIntoRow(target)
  }).observe(toolbar, { subtree: true, attributeFilter: ["selected"] })
  page.append(toolbar)
  return toolbar

  /** A badge of `number` items of `kind`, or nothing for none. */
  function badge(kind, number, tip) {
    return number > 0 ? `<span class="spell-toolbar-count ${kind}" title="${attr(tip)}">${number}</span>` : ""
  }
}

/** A block's label without its number:  `3. Questions` is `Questions`. */
function shortLabel(label) {
  return label.replace(/^\d+(?:\.\d+)*\.?\s+/, "")
}

/** Scroll `item`'s row sideways (never the page) until it shows whole, centred if it has to move. */
function scrollIntoRow(item) {
  const row = item.parentElement
  if (!row || row.scrollWidth <= row.clientWidth) return
  const start = item.getBoundingClientRect().left - row.getBoundingClientRect().left + row.scrollLeft
  if (start >= row.scrollLeft && start + item.offsetWidth <= row.scrollLeft + row.clientWidth) return
  row.scrollTo({ left: start - (row.clientWidth - item.offsetWidth) / 2, behavior: "smooth" })
}

////////////////
// ## Folding
////////////////

/**
 * Every section folds, and the reader's folds are remembered per page (`localStorage`, `{ [id]: folded }`).
 * - SECTIONS:  `<ui-section collapsible>` folds itself;
 *   this restores the saved folds (else the markup's `collapsed` stands)
 *   and saves the reader's toggles (`ui-open` / `ui-close`)
 *   - a PLAN DOC (`body.plan-doc`):  every section and sub-section not in the saved folds starts FOLDED,
 *     whatever its markup says:  Owen opens what he wants to read (2026-10-03)
 *     - a link to an id inside still lands (`reveal()` unfolds around it)
 *     - its `<epic-*>` blocks start folded by themselves;
 *       the ones the reader left open open again (`restoreEpicFolds()`, before they draw),
 *       and their toggles are saved as a section's
 * - HEADINGS:  a chevron button starts each h2 / h3,
 *   and a click anywhere on the heading (not on a link or button in it) toggles it too;
 *   folded:  `section.spell-folded`, all but the heading hidden by CSS.
 *   Starts folded as saved, else when the section says `data-fold="closed"`.
 * - `reveal()` unfolding for a link is never saved
 * - returns `{ reveal(element) }`:  unfold every section hiding `element` (a plan doc's blocks and items too),
 *   and open its own panel, or itself if it's a folded plan item;
 *   true when it unfolded something (it draws a little later)
 *   - a `<ui-section>` unfolds WITHOUT its height animation (`--ui-section-duration: 0s` on `main` for a few frames):
 *     the jump measures the target once it has drawn,
 *     and a growing box would move it (scroll anchoring) after the page has landed
 * - callable again (a page updated in place):  drops the listeners of the call before (`foldWiring`);
 *   a heading that has its chevron keeps it
 */
function wireFolds(main, outline) {
  foldWiring?.abort()
  foldWiring = new AbortController()
  const { signal } = foldWiring
  const key = `${FOLD_KEY_PREFIX}${location.pathname}`
  const saved = readJSON(key)
  if (outline.sections) wireSectionFolds()
  else wireHeadingFolds()
  return { reveal }

  /** SECTIONS:  restore the saved folds (a plan doc:  the rest start folded), save the reader's. */
  function wireSectionFolds() {
    const startFolded = document.body.classList.contains("plan-doc")
    for (const section of main.querySelectorAll("ui-section[collapsible][id]"))
      if (section.id in saved) setCollapsed(section, !!saved[section.id])
      else if (startFolded) setCollapsed(section, true)
    main.addEventListener("ui-open", onToggle, { signal })
    main.addEventListener("ui-close", onToggle, { signal })
    main.addEventListener("ui-close", holdWhileFolding, { signal })
  }

  /**
   * Any fold closing (a section, a plan doc's Overview part, phase or item):  its header stays where it is on screen
   * while the content folds away under it.
   * - why:  the browser's scroll anchoring kept something BELOW the fold in place instead, so the clicked header slid
   *   down hundreds of pixels as its body shrank, then wobbled (Owen, 2026-10-10:  "the 1.1 sections bounce when
   *   closed";  measured:  the header moved 336 -> 692px)
   * - anchoring is off for the page while it folds;  each frame, the header is put back where it was
   * - starts after the toggle's own handlers (a microtask):  `keepTitlePut()` / an item's `keepLinePut()` may first
   *   scroll a STUCK title into place, and that's the place kept
   * - near the end of a short page (everything else folded), the page would get shorter than where it's scrolled to,
   *   and the browser pulls it back:  the header jumps down.  So the page keeps its height (`min-height`) until the
   *   reader scrolls back far enough for the shorter page to hold him
   * - stops after `FOLD_HOLD_MS`, or at once when the reader scrolls
   */
  function holdWhileFolding(event) {
    if (event.defaultPrevented || !event.cancelable || !(event.target instanceof Element)) return
    const element = event.target
    queueMicrotask(() => {
      const root = document.documentElement
      const before = element.getBoundingClientRect().top
      const until = performance.now() + FOLD_HOLD_MS
      let stopped = false
      const stop = () => (stopped = true)
      addEventListener("wheel", stop, { once: true, passive: true })
      addEventListener("touchmove", stop, { once: true, passive: true })
      root.style.overflowAnchor = "none"
      root.style.minHeight = `${root.scrollHeight}px`
      const hold = () => {
        const off = element.getBoundingClientRect().top - before
        if (!stopped && Math.abs(off) >= 1) scrollTo({ top: scrollY + off, behavior: "instant" })
        if (!stopped && performance.now() < until) return requestAnimationFrame(hold)
        root.style.overflowAnchor = ""
        removeEventListener("wheel", stop)
        removeEventListener("touchmove", stop)
        releaseHeight(root)
      }
      requestAnimationFrame(hold)
    })
  }

  /**
   * Let the page take its natural height again once that no longer pulls the reader back:  at once if it fits where
   * he's scrolled to, else as soon as he scrolls up far enough.
   */
  function releaseHeight(root) {
    const kept = root.style.minHeight
    const natural = () => {
      root.style.minHeight = ""
      const height = root.scrollHeight
      root.style.minHeight = kept
      return height
    }
    const release = () => {
      if (scrollY + innerHeight > natural() + 1) return false
      root.style.minHeight = ""
      removeEventListener("scroll", release)
      return true
    }
    if (!release()) addEventListener("scroll", release, { passive: true })
  }

  /**
   * The reader folded or unfolded a section (accordions' `ui-open` / `ui-close` bubble here too:  not ours).
   * - a `ui-open` that can't be cancelled is the BROWSER's reveal (find-in-page, a `#hash` load):
   *   not saved, as a link's unfold isn't
   */
  function onToggle(event) {
    const section = event.target
    if (event.defaultPrevented || !event.cancelable || !section.matches?.(SECTIONS) || !section.id) return
    saved[section.id] = !event.detail?.open
    writeJSON(key, saved)
    if (!event.detail?.open) keepTitlePut(section)
  }

  /**
   * Folding a section the reader is INSIDE (its title stuck, its top scrolled past):  scroll at once so the title
   * stays where it's stuck, and the content folds away below it.
   * - why:  else the title drops back to the section's top, far above, and the page slides up after the
   *   shrinking content (Owen's "bounce", 2026-10-04)
   */
  function keepTitlePut(section) {
    const title = titleOf(section)
    if (!title) return
    const stuckAt = title.getBoundingClientRect().top
    const top = section.getBoundingClientRect().top
    if (top >= stuckAt - 1) return
    scrollTo({ top: scrollY + top - stuckAt, behavior: "instant" })
  }

  /** HEADINGS:  a chevron on every h2 / h3 of a sticky section. */
  function wireHeadingFolds() {
    for (const sticky of main.querySelectorAll("section > ui-sticky:is(.spell-h2, .spell-h3)")) {
      const heading = sticky.firstElementChild
      if (!heading?.id || heading.querySelector(":scope > ui-button.spell-fold")) continue
      const section = sticky.parentElement
      const button = document.createElement("ui-button")
      button.className = "spell-fold"
      for (const [name, value] of Object.entries({ circular: "", basic: "", size: "mini", icon: "chevron down" }))
        button.setAttribute(name, value)
      const tip = document.createElement("ui-popup")
      for (const [name, value] of Object.entries({ inverted: "", size: "mini", content: "Fold / unfold" }))
        tip.setAttribute(name, value)
      heading.prepend(button, tip)
      heading.classList.add("spell-foldable")
      setFolded(section, heading.id in saved ? !!saved[heading.id] : section.dataset.fold === "closed")
      heading.addEventListener("click", (event) => {
        // the chevron's own `<button>` (in its shadow root) comes first in the path:  look for the HOST
        const path = event.composedPath()
        if (!path.includes(button)) {
          const before = path.slice(0, Math.max(0, path.indexOf(heading)))
          if (before.some((node) => node instanceof Element && node.matches("a, ui-button, button"))) return
        }
        event.preventDefault()
        const folded = !section.classList.contains("spell-folded")
        setFolded(section, folded)
        saved[heading.id] = folded
        writeJSON(key, saved)
      })
    }
  }

  /**
   * Unfold every section around `element`;  open `element`'s own folded panel.
   * - `self: false`:  only what's AROUND it -- a folded section, or an item's closed panel, stays as it is
   */
  function reveal(element, { self = true } = {}) {
    let unfolded = false
    if (outline.sections) {
      const folds = `ui-section, ${EPIC_OPENERS}`
      for (
        let section = self ? element.closest(folds) : element.parentElement?.closest(folds);
        section;
        section = section.parentElement?.closest(folds)
      ) {
        if (!isCollapsed(section)) continue
        if (!unfolded) main.style.setProperty("--ui-section-duration", "0s")
        setCollapsed(section, false)
        unfolded = true
      }
      if (unfolded) void nextFrames(UNFOLD_FRAMES + 1).then(() => main.style.removeProperty("--ui-section-duration"))
    } else {
      for (
        let section = element.closest("section.spell-folded");
        section;
        section = section.parentElement?.closest("section.spell-folded")
      )
        setFolded(section, false)
    }
    const panel = self ? element.querySelector(":scope > ui-accordion > ui-title") : null
    if (panel && !isPanelOpen(panel)) setPanel(panel, true)
    // an id INSIDE a closed panel (an old decision's `#d7`, now the answer card in its question):
    // open the panels around it, or the jump lands on nothing
    for (
      let content = element.closest("ui-accordion > ui-content");
      content;
      content = content.parentElement.parentElement?.closest("ui-accordion > ui-content")
    ) {
      const accordion = content.parentElement
      const contents = Array.from(accordion.children).filter((child) => child.localName === "ui-content")
      const title = titlesOf(accordion)[contents.indexOf(content)]
      if (!title || isPanelOpen(title)) continue
      setPanel(title, true)
      unfolded = true
    }
    return unfolded
  }
}

/**
 * A plan doc's blocks the reader left open on this page (saved folds, `spell-folds:<path>`):
 * open again, before they first draw (their `open` attribute), so nothing animates;
 * the rest start folded, as the blocks do.
 */
function restoreEpicFolds(main) {
  const saved = readJSON(`${FOLD_KEY_PREFIX}${location.pathname}`)
  for (const block of main.querySelectorAll(EPIC_FOLDS))
    if (block.id && saved[block.id] === false) block.setAttribute("open", "")
}

/**
 * HEADINGS:  fold or unfold `section`:
 * its class, its chevron (down / right) and the chevron's state for screen readers.
 */
function setFolded(section, folded) {
  section.classList.toggle("spell-folded", folded)
  const button = section.querySelector(":scope > ui-sticky > * > ui-button.spell-fold")
  if (!button) return
  button.setAttribute("icon", folded ? "chevron right" : "chevron down")
  button.setAttribute("aria-label", folded ? "Unfold section" : "Fold section")
  button.setAttribute("aria-expanded", String(!folded))
}

////////////////
// ## Sticky headers
////////////////

/** `trackStickyHeights()`'s current observer:  disconnected when it runs again. */
let stickyObserver

/**
 * Where each sticky title sticks:  below the fixed site header (`siteHeaderHeight()`), then whatever sticks above
 * every section -- the page header (`ui-sticky.spell-h1`) and the CHEATSHEET's filter bar (`.spell-filter`), whose
 * heights are `--spell-top` on `main`.
 * - SECTIONS:  sets each top-level `<ui-section>`'s `offset`;  nested ones stack themselves below their parents'.
 *   Writes `--spell-section-top` (where its title sticks) and `--spell-stack` (the bottom of its stack of stuck
 *   titles) on every section, which `scroll-margin-top` reads (`spell-doc.css`):  a section lands at its sticky
 *   line, anything in it below its stack.
 * - HEADINGS:  h2s below the bar, h3s just below their section's h2;  sets each sticky's `offset`, and
 *   `--spell-h2-h` / `--spell-h3-h` on the sections, which the headings' `scroll-margin-top` reads
 * - also sticks the page header just below the site header (its `offset`), and writes
 *   the page header's height as `--spell-head-h` on `main` (the filter bar sticks below it)
 * - NOTE: the `offset`s are from the VIEWPORT top, so they include the site header;  the CSS variables (and so
 *   every `scroll-margin-top`) leave it OUT, as the browser adds it (see "Landing" in the header)
 * - re-measured whenever a title changes size (fonts loading, the window narrowing and titles wrapping)
 * - returns `{ measure, offsetFor }`:  `offsetFor(target)` is how far below the viewport top it should land
 * - callable again (a page updated in place):  disconnects the previous call's observer (`stickyObserver`)
 */
function trackStickyHeights(main, outline) {
  const head = main.querySelector(":scope > ui-sticky.spell-h1")
  // the filter bar, or a page toolbar sticking by itself (`buildPageToolbar()`):  never both
  const bar = main.querySelector(".spell-filter, nav.spell-toolbar-alone")
  const h2Stickies = outline.sections ? [] : Array.from(main.querySelectorAll("ui-sticky.spell-h2"))
  const h3Stickies = outline.sections ? [] : Array.from(main.querySelectorAll("ui-sticky.spell-h3"))
  const sections = outline.sections ? Array.from(main.querySelectorAll("ui-section")) : []
  // called again after an in-place update:  the previous call's observer stops first
  stickyObserver?.disconnect()
  const observer = new ResizeObserver(() => measure())
  stickyObserver = observer
  for (const sticky of [head, ...h2Stickies, ...h3Stickies]) {
    const heading = sticky?.firstElementChild
    if (heading) observer.observe(heading)
  }
  if (bar) observer.observe(bar)
  measure()
  return { measure, offsetFor }

  /** The site header and what sticks above the sections;  then each section's (heading's) sticky line. */
  function measure() {
    const header = siteHeaderHeight()
    const headHeight = head ? heightOf(head) : 0
    const top = Math.round(headHeight + (bar ? bar.getBoundingClientRect().height : 0))
    setPixels(main, "--spell-head-h", headHeight)
    setPixels(main, "--spell-top", top)
    if (head) setOffset(head, header)
    if (outline.sections) measureSections(header, top)
    else measureHeadings(header, top)
  }

  /**
   * SECTIONS:  top-level `offset`s, and each section's sticky line and stack bottom, parents first.
   * - `header`:  the site header's height;  `top`:  what sticks below it, above every section
   */
  function measureSections(header, top) {
    const bottoms = new Map()
    for (const section of sections) {
      const parent = section.parentElement?.closest("ui-section")
      const line = parent ? (bottoms.get(parent) ?? top) : top
      const title = titleOf(section)
      // a title renders once UI has loaded:  observe it when it's there (observing twice is a no-op)
      if (title) observer.observe(title)
      const height = title && section.hasAttribute("sticky") ? title.getBoundingClientRect().height : 0
      bottoms.set(section, line + height)
      setPixels(section, "--spell-section-top", line)
      setPixels(section, "--spell-stack", line + height)
      if (!parent) setOffset(section, header + top)
    }
  }

  /** HEADINGS:  the h2 / h3 stickies' `offset`s and heights. */
  function measureHeadings(header, top) {
    for (const sticky of h2Stickies) {
      sticky.parentElement.style.setProperty("--spell-h2-h", `${heightOf(sticky)}px`)
      setOffset(sticky, header + top)
    }
    for (const sticky of h3Stickies) {
      sticky.parentElement.style.setProperty("--spell-h3-h", `${heightOf(sticky)}px`)
      setOffset(sticky, header + top + h2HeightAbove(sticky))
    }
  }

  /** How far below the viewport top a target lands (`landingLine()`). */
  function offsetFor(target) {
    return landingLine(target)
  }
}

/**
 * How far below the viewport top `target` lands, px:
 * - inside a plan doc (`<epic-page>`):  where the titles stuck over it end, the `--epic-stack` it inherits (a block's
 *   own title sticks there;  anything else lands `EPIC_LAND_GAP` below), and below its item's line when it's in an
 *   item's details (the line sticks there too)
 * - else:  the site header, then its own `scroll-margin-top` (CSS derives it from the sections)
 */
function landingLine(target) {
  const stack = target.closest("epic-page")
    ? parseFloat(getComputedStyle(target).getPropertyValue("--epic-stack"))
    : NaN
  if (Number.isNaN(stack)) return siteHeaderHeight() + (parseFloat(getComputedStyle(target).scrollMarginTop) || 0)
  if (target.matches(EPIC_OPENERS)) return stack
  const item = target.parentElement?.closest("epic-item")
  const line = item?.shadowRoot?.querySelector('[part~="line"]')
  return stack + EPIC_LAND_GAP + (line ? line.getBoundingClientRect().height : 0)
}

/**
 * Height of the fixed `<spell-site-header>` on top of the page, px:  its `--spell-site-header-height` on `:root`.
 * - 0 when the page has none (or it isn't defined yet):  then everything sticks at the viewport top, as before
 */
function siteHeaderHeight() {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--spell-site-header-height")
  return parseFloat(value) || 0
}

/** Write `pixels` as custom property `name` on `element`, unless it's already that. */
function setPixels(element, name, pixels) {
  const value = `${Math.round(pixels * 100) / 100}px`
  if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value)
}

/**
 * A sticky's (top-level section's) `offset`, in whole pixels;
 * re-setting the same value would restart its observer for nothing.
 */
function setOffset(sticky, offset) {
  const text = String(Math.round(offset))
  if (sticky.getAttribute("offset") !== text) sticky.setAttribute("offset", text)
}

/** Height of a sticky's heading (the sticky host is `display: contents`, so measure what it holds). */
function heightOf(sticky) {
  return sticky.firstElementChild?.getBoundingClientRect().height ?? 0
}

/** Height of the h2 whose section holds `sticky`'s section:  where an h3 sticks. */
function h2HeightAbove(sticky) {
  for (let section = sticky.parentElement?.parentElement; section; section = section.parentElement) {
    const h2 = section.querySelector(":scope > ui-sticky.spell-h2")
    if (h2) return heightOf(h2)
  }
  return 0
}

////////////////
// ## Anchors
////////////////

/**
 * Same-page links to anything with an id in `main` (a section, a heading, a plan item) jump there ourselves, and
 * the toolbar follows AT ONCE.
 * - a section lands with its title at its sticky line;  anything else below every stuck title above it (both by
 *   the site header plus their `scroll-margin-top`, "Landing" in the header):  the browser's own jump would add
 *   the stuck titles' scroll padding (they reserve it) on top
 * - HEADINGS:  a STICKY heading's jump goes to its section:  a stuck heading already "is" at the top, so the
 *   browser's own jump to it does nothing -- e.g. the toolbar's entry of the section you're reading
 * - folded sections around the target unfold first, and a target that is a folded item opens (`folds.reveal()`);
 *   an unfolded `<ui-section>` draws on the next frames, so the jump lands once it has, and once more after a fold's
 *   transition (`SETTLE_MS`) unless the reader scrolled meanwhile
 * - the target's entry becomes the current one even when the page can't scroll it up to its line (the last
 *   short sections), until the user scrolls on (`follow.pin()`)
 * - `hashchange` / `popstate` (back, forward, a typed hash) jump the same way
 * - in a frame (VS Code's view), the parent's `{ spell: "go", hash }` too:  the view showing the page it already
 *   shows, at an id (`packages/vscode/src/DocView.ts`);  a history entry, as a click's
 * - a jump that moves the address says so (`spell-doc:place`):  `pushState()` fires no `hashchange`
 * - returns `{ jump, go, canGo }`:
 *   - `jump(id, { unfoldTarget })`:  `unfoldTarget: false` unfolds only what's AROUND a folded target section
 *     (`land()`:  a reload lands on the section being read as it was, folded or not)
 *   - `go(id)`:  as a click on a link to `#id` (a history entry, then the jump);  `canGo(id)`:  is there one to land on
 */
function wireAnchors(main, outline, sticky, follow, folds) {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
    const id = targetIdOf(event)
    if (!id || !(targetIn(id) || hostHolding(main, id))) return
    event.preventDefault()
    go(id)
  })
  addEventListener("popstate", () => jump(hashId()))
  addEventListener("hashchange", () => jump(hashId()))
  if (window.parent !== window) addEventListener("message", onMessage)
  return { jump, go, canGo: (id) => !!(targetIn(id) || hostHolding(main, id)) }

  /** Follow a same-page link to `id`:  a history entry (unless the address is there already), then the jump. */
  function go(id) {
    if (hashId() !== id) {
      history.pushState(null, "", `#${id}`)
      dispatchEvent(new Event("spell-doc:place"))
    }
    jump(id)
  }

  /** The frame's parent posted `{ spell: "go", hash }`:  go there, as a link to it would. */
  function onMessage(event) {
    const data = event.data
    if (event.source !== window.parent || data?.spell !== "go" || typeof data.hash !== "string") return
    const id = decodeHash(data.hash.replace(/^#/, ""))
    if (targetIn(id) || hostHolding(main, id)) go(id)
  }

  /**
   * Scroll to `id` and make its entry the current one;  once what it unfolded has drawn.
   * Returns a promise that settles once it has landed (or found nothing to land on).
   * - `id` inside a body not loaded yet (a split plan doc's part:  an Overview `h4`, an old `#d7` answer card):
   *   its host loads the body first (`hostHolding()`, `load()`), then the jump goes on (caveat C8 of `claude-design`)
   */
  function jump(id, { unfoldTarget = true } = {}) {
    const target = targetIn(id)
    if (!target) {
      const host = hostHolding(main, id)
      if (!host?.load) return Promise.resolve()
      return host.load().then(
        () => (targetIn(id) ? jump(id, { unfoldTarget }) : undefined),
        () => undefined
      )
    }
    let landed = NaN
    // what a jump unfolds opens at once, without the fold animation, so the page gets there quickly (Owen,
    // 2026-10-04):  `spell-doc.css` zeroes `--ui-section-duration` under `data-spell-jumping`
    const root = document.documentElement
    root.setAttribute("data-spell-jumping", "")
    const done = folds.reveal(target, { self: unfoldTarget })
      ? nextFrames(UNFOLD_FRAMES).then(land)
      : (land(), undefined)
    setTimeout(() => root.removeAttribute("data-spell-jumping"), SETTLE_MS)
    if (outline.sections) setTimeout(() => Math.abs(scrollY - landed) < 2 && land(), SETTLE_MS)
    return done ?? Promise.resolve()

    /** Scroll to the target, pin its entry. */
    function land() {
      scrollToId(id, sticky)
      const entry = outline.entryOf(target)
      if (entry) follow?.pin(entry)
      landed = scrollY
    }
  }

  /** The `id` a click goes to:  a same-page `#hash` link's. */
  function targetIdOf(event) {
    for (const node of event.composedPath()) {
      if (!(node instanceof Element)) continue
      const href = node.getAttribute("href")
      if (node.localName === "a" && href?.startsWith("#") && href.length > 1) return decodeURIComponent(href.slice(1))
    }
    return undefined
  }

  /** The element with `id` in `main`, if any. */
  function targetIn(id) {
    const element = id ? document.getElementById(id) : null
    return element && main.contains(element) ? element : null
  }
}

/**
 * Scroll so `id` sits where its anchor should:  by its own box, the site header and its `scroll-margin-top`
 * (`offsetFor()`);  a HEADINGS sticky heading by its SECTION's box (it can't be measured where it is while stuck).
 * Instant, as the browser's own jump.
 */
function scrollToId(id, sticky) {
  const element = document.getElementById(id)
  if (!element) return
  const stuck = element.parentElement?.localName === "ui-sticky"
  const box = stuck ? element.parentElement.parentElement : element
  const top = topOf(box) + scrollY - sticky.offsetFor(element)
  scrollTo({ top: Math.max(0, top), behavior: "instant" })
}

/**
 * Viewport top of `element`'s box;
 * for a host with no box of its own (`display: contents`, e.g. `<ui-item>`), of what it holds.
 */
function topOf(element) {
  if (element.getClientRects().length) return element.getBoundingClientRect().top
  const range = document.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect().top
}

////////////////
// ## Jump to an item (Cmd / Ctrl + K)
////////////////

/**
 * Cmd-K (Ctrl-K) on a plan doc asks which item to jump to (Owen, 2026-10-10:  "add command-k which brings up
 * ui-prompt asking what number I want to jump to (e.g. J7)"), and lands there exactly as a link to `#j7` does
 * (`go()`:  what hides it unfolds, an item opens, it lands below the stuck titles).
 * - any id on the page, case and a `#` aside:  `J7`, `q3`, `P2`, `o1`, `#decisions`
 * - an id that isn't there:  the dialog says so and stays open, the text selected for typing over
 * - never while typing in a field (a note box, the new item form), nor with a dialog already open
 * - the dialog is a `<ui-modal>` built as `UI.modals.prompt()` builds its own (`ModalDialogs`):
 *   no `<ui-prompt>` element exists, and `prompt()` closes on any answer, so it couldn't stay open on a miss;
 *   here its cancelable `ui-approve` is cancelled instead
 * - K is free:  the live client takes only Cmd / Ctrl + A C X V Z in VS Code's view (`liveClient.ts` `editKey()`)
 */
function wireJumpKey(go, canGo) {
  document.addEventListener("keydown", (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey || event.defaultPrevented) return
    if (event.key.toLowerCase() !== "k" || event.isComposing) return
    if (document.querySelector("dialog[open], ui-modal:not([hidden])") || typingIn(event)) return
    event.preventDefault()
    openJumpPrompt(go, canGo)
  })
}

/** The jump dialog:  an id typed, Go lands there;  Cancel or Escape just closes it. */
function openJumpPrompt(go, canGo) {
  const modal = document.createElement("ui-modal")
  for (const [name, value] of Object.entries({ size: "tiny", closedby: "closerequest", header: "Jump to which item?" }))
    modal.setAttribute(name, value)
  modal.dataset.spellAdded = ""
  const content = document.createElement("ui-content")
  const label = document.createElement("label")
  label.className = "ui-native spell-jump"
  label.append("Its id:  J7, q3, P2 ...")
  const input = document.createElement("input")
  input.type = "text"
  input.autofocus = true
  input.autocomplete = "off"
  input.spellcheck = false
  const miss = document.createElement("p")
  miss.className = "spell-jump-miss"
  miss.setAttribute("role", "alert")
  miss.hidden = true
  label.append(input)
  content.append(label, miss)
  const actions = document.createElement("ui-actions")
  const cancel = document.createElement("ui-button")
  cancel.className = "cancel"
  cancel.textContent = "Cancel"
  const approve = document.createElement("ui-button")
  approve.className = "approve"
  approve.setAttribute("primary", "")
  approve.textContent = "Go"
  actions.append(cancel, approve)
  modal.append(content, actions)
  let target = ""
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") approve.click()
  })
  input.addEventListener("input", () => (miss.hidden = true))
  modal.addEventListener("ui-approve", (event) => {
    const id = input.value.trim().replace(/^#/, "").toLowerCase()
    if (id && canGo(id)) {
      target = id
      return
    }
    // stays open:  says what it couldn't find
    event.preventDefault()
    miss.textContent = id ? `No ${input.value.trim()} on this page.` : "Type an id first."
    miss.hidden = false
    input.select()
  })
  modal.addEventListener(
    "ui-hide",
    () => {
      modal.remove()
      if (target) go(target)
    },
    { once: true }
  )
  document.body.append(modal)
  modal.visible = true
  // the input once the dialog has drawn:  `autofocus` alone loses to the dialog's own focus on some opens
  void nextFrames(2).then(() => input.focus())
}

/** Is `event`'s key typed into a field (an input, a textarea, a select, editable text)? */
function typingIn(event) {
  return event
    .composedPath()
    .some((node) => node instanceof Element && (node.isContentEditable || node.matches(`${FIELDS}, textarea, input`)))
}

////////////////
// ## Paging
////////////////

/**
 * Page Down / Page Up / Space / Shift+Space page the document ourselves, so a page always continues just below the
 * stuck titles.
 * - why:  the browser pages by the `scroll-padding-top` of where it STARTS (`StickyWatch`'s stuck edge), but paging
 *   down can stick more titles (entering a nested section), which then cover the old bottom lines
 * - down:  the old viewport bottom lands just below the lowest title stuck at the NEW position (`stuckBottom()`,
 *   measured there:  a sticky box's position is computed in layout, so an instant scroll and a read find it);
 *   up:  the old first line below the stuck titles lands at the viewport bottom
 * - measured with instant scrolls, then put back and scrolled there for real (smooth, unless reduced motion):
 *   nothing paints in between
 * - left to the browser:
 *   modifier keys, a key in a field, button, link or a scrolling box of its own (a wide `pre`), an open dialog
 */
function wirePaging(main) {
  const keys = { PageDown: 1, PageUp: -1, " ": 1 }
  document.addEventListener("keydown", (event) => {
    let direction = keys[event.key]
    if (!direction || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === " " && event.shiftKey) direction = -1
    if (document.querySelector("dialog[open]") || !pageOwnsKey(event, event.key === " ")) return
    event.preventDefault()
    const from = scrollY
    const to = direction > 0 ? pageDownTo() : pageUpTo()
    if (Math.abs(to - from) < 1) return
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches
    scrollTo({ top: from, behavior: "instant" })
    scrollTo({ top: to, behavior: smooth ? "smooth" : "instant" })
  })

  /**
   * Where Page Down goes:  the old viewport bottom just below the titles stuck THERE (settles in a few tries).
   * - the furthest try that leaves the old bottom uncovered:  where the old bottom IS a title, the two positions
   *   either side of its sticking alternate, and the nearer one shows it below the stack instead of stuck on it
   */
  function pageDownTo() {
    const bottom = scrollY + innerHeight
    const max = document.documentElement.scrollHeight - innerHeight
    let top = scrollY
    let best = top
    for (let tries = 0; tries < 4; tries++) {
      const next = Math.min(max, Math.max(0, bottom - stuckBottom(main)))
      if (Math.abs(next - top) < 1) break
      top = next
      scrollTo({ top, behavior: "instant" })
      if (bottom - top >= stuckBottom(main) - 1) best = Math.max(best, top)
    }
    return best
  }

  /** Where Page Up goes:  the first line below the stuck titles to the viewport bottom. */
  function pageUpTo() {
    return Math.max(0, scrollY + stuckBottom(main) - innerHeight)
  }
}

/**
 * Whether a paging key belongs to the page:  not to a field or a box that scrolls on its own;
 * Space not to a control either (it presses a button, follows a link).
 */
function pageOwnsKey(event, space) {
  for (const node of event.composedPath()) {
    if (!(node instanceof Element) || node === document.body || node === document.documentElement) continue
    if (node.isContentEditable || node.matches(FIELDS) || (space && node.matches(CONTROLS))) return false
    const overflow = getComputedStyle(node).overflowY
    if ((overflow === "auto" || overflow === "scroll") && node.scrollHeight > node.clientHeight) return false
  }
  return true
}

/** What types or picks with a paging key. */
const FIELDS = "input, textarea, select, ui-input, ui-select, ui-dropdown"

/** What Space presses. */
const CONTROLS = "a[href], button, summary, [tabindex], ui-button, ui-checkbox, ui-title, ui-item"

/**
 * The bottom of the lowest box stuck at the top now, from the viewport top:  the site header, the page header, the
 * filter bar, every stuck (or being pushed out) section title or sticky heading in `main`.
 * - a sticky box is stuck when it sits at (or above:  pushed out by its section's end) its computed `top`
 */
function stuckBottom(main) {
  let bottom = siteHeaderHeight()
  const boxes = Array.from(main.querySelectorAll(".spell-filter"))
  // a `<ui-sticky>` host is `display: contents`:  the box that sticks is its shadow `sticky` part
  for (const sticky of main.querySelectorAll("ui-sticky"))
    boxes.push(sticky.shadowRoot?.querySelector('[part~="sticky"]'))
  for (const section of main.querySelectorAll(`ui-section[sticky], ${EPIC_FOLDS}`)) boxes.push(titleOf(section))
  // a plan doc's page header and its toolbar's bar under it (the title between them scrolls away);  an OPEN item's
  // line sticks below the titles (a closed one's isn't sticky:  skipped)
  for (const page of main.querySelectorAll("epic-page"))
    boxes.push(...(page.shadowRoot?.querySelectorAll('[part~="header"], [part~="bar"]') ?? []))
  for (const item of main.querySelectorAll("epic-item")) boxes.push(item.shadowRoot?.querySelector('[part~="line"]'))
  for (const box of boxes) {
    if (!box) continue
    const style = getComputedStyle(box)
    const line = parseFloat(style.top)
    if (style.position !== "sticky" || Number.isNaN(line)) continue
    const rect = box.getBoundingClientRect()
    if (rect.height && rect.top <= line + 1 && rect.bottom > bottom) bottom = rect.bottom
  }
  return bottom
}

/** The URL's `#hash` as an id, or "". */
function hashId() {
  return decodeHash(location.hash.slice(1))
}

/** A `#hash` (without its `#`) as an id:  percent-decoded, or as it is when that fails. */
function decodeHash(hash) {
  try {
    return decodeURIComponent(hash)
  } catch {
    return hash
  }
}

////////////////
// ## Scroll-follow
////////////////

/**
 * Mark the toolbar's entry of the section being read, and let the address follow it.
 * - "Current":  the last entry (section, heading) whose top has reached its landing line (the site header and its
 *   `scroll-margin-top`, plus a little);  entries hidden by the filter or inside a folded section don't count
 * - the toolbar's entry of the current entry's top-level section is `selected`
 * - the ADDRESS follows too, once `followAddress()` has been called (`land()`, after the page has landed):
 *   the current entry's `#id` replaces the URL's hash (`history.replaceState()`:  no history entry, no jump);
 *   not while a followed link is pinned (its click set the hash), and no hash above the first entry
 *   - so a reload, or VS Code restarting the view, lands on the section being read
 *   - `replaceState()` fires no `hashchange`:  `spell-doc:place` on `window` tells the live client, which tells
 *     VS Code's view (`liveClient.ts` `reportPlace()`)
 * - returns `{ update, pin, followAddress, rescan }`:
 *   - `pin(entry)` makes it current until the page scrolls again (a link was followed)
 *   - `rescan(rail)` reads the entries and the toolbar again:  the page was updated in place (`rewire()`)
 */
function followScroll(main, outline, rail) {
  let headings = []
  let railItems = []
  let active = null
  let scheduled = false
  let pinned = null
  let addressing = false

  rescan(rail)
  addEventListener("scroll", schedule, { passive: true })
  addEventListener("resize", schedule, { passive: true })
  return { update, pin, followAddress, rescan }

  /** Read the entries and the toolbar's items;  a rebuilt toolbar gets its mark again on the next update. */
  function rescan(nextRail) {
    headings = Array.from(main.querySelectorAll(outline.targets))
    const items = Array.from(nextRail?.querySelectorAll("[data-rail]") ?? [])
    if (items[0] !== railItems[0]) active = null
    railItems = items
  }

  /** From now on, the address follows the current entry. */
  function followAddress() {
    addressing = true
    update()
  }

  /** At most one update per frame. */
  function schedule() {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      update()
    })
  }

  /** Find the current heading and mark it;  a pinned one stays while the page hasn't scrolled. */
  function update() {
    if (pinned && Math.abs(scrollY - pinned.scrollY) < 2) return setActive(pinned.heading)
    pinned = null
    let current = headings[0]
    let reached = null
    for (const heading of headings) {
      if (!heading.isConnected) continue // replaced by an in-place update, until `rescan()`
      if (heading.offsetParent === null && !heading.getClientRects().length) continue // hidden by the filter
      if (outline.folded(heading)) continue // laid out in a folded box, but not shown
      const line = landingLine(heading) + 4
      if (heading.getBoundingClientRect().top > line) break // document order:  the first below its line ends it
      current = reached = heading
    }
    setActive(current)
    writeAddress(reached?.id ?? "")
  }

  /**
   * Put `#id` in the address ("":  no hash) without a history entry or a jump, and say so (`spell-doc:place`).
   * - only once `followAddress()` was called, and only when it changes
   */
  function writeAddress(id) {
    if (!addressing || hashId() === id) return
    history.replaceState(history.state, "", `${location.pathname}${location.search}${id ? `#${id}` : ""}`)
    dispatchEvent(new Event("spell-doc:place"))
  }

  /** Mark the toolbar's entry of `heading`'s top-level section. */
  function setActive(heading) {
    if (!heading || heading === active) return
    active = heading
    const group = outline.groupOf(heading)
    for (const item of railItems) item.toggleAttribute("selected", item.dataset.rail === group?.id)
  }

  /** `heading` is current, wherever it is, until the page scrolls from here. */
  function pin(heading) {
    pinned = { heading, scrollY }
    setActive(heading)
  }
}

////////////////
// ## Panels
////////////////

/** Is `title`'s panel open? */
function isPanelOpen(title) {
  return openIndexes(title.parentElement).includes(titlesOf(title.parentElement).indexOf(title))
}

/** Open or close `title`'s panel, keeping the accordion's other panels as they are. */
function setPanel(title, open) {
  const accordion = title.parentElement
  const index = titlesOf(accordion).indexOf(title)
  const indexes = new Set(openIndexes(accordion))
  if (open) indexes.add(index)
  else indexes.delete(index)
  accordion.open = [...indexes].sort((a, b) => a - b).join(" ")
}

/** An accordion's open panel indexes, from its `open` property (or attribute, before it upgraded). */
function openIndexes(accordion) {
  const text = accordion.open ?? accordion.getAttribute("open") ?? ""
  return String(text)
    .split(/[\s,]+/)
    .filter((word) => /^\d+$/.test(word))
    .map(Number)
}

/** The `<ui-title>` children of `accordion`:  one per panel, in order. */
function titlesOf(accordion) {
  return Array.from(accordion.children).filter((child) => child.localName === "ui-title")
}

////////////////
// ## CHEATSHEET filter
////////////////

/**
 * `ui-input[data-spell-filter]` shows only the cards holding every typed word, and `ui-select[data-spell-filter-badge]`
 * only those with a `ui-label` badge of the chosen text ("" = any);  sections without a visible card hide too, and
 * so do their toolbar buttons.
 * - reads values from the events' `detail`:  during `ui-input` / `ui-change` the element's `value` is still the old one
 * - SIDE EFFECT:  remembers the typed filter (not the badge) in `localStorage` (when the browser allows it), per
 *   page:  under the input's `data-spell-filter` value, or `FILTER_KEY_PREFIX` + the page's path
 */
function wireFilter(main) {
  const input = document.querySelector("ui-input[data-spell-filter]")
  const badge = document.querySelector("ui-select[data-spell-filter-badge]")
  if (!input && !badge) return
  const key = input?.dataset.spellFilter || `${FILTER_KEY_PREFIX}${location.pathname}`
  const cards = Array.from(main.querySelectorAll("ui-card"))
  // HEADINGS' `section`s, or `<ui-section>`s (`:host([hidden])` hides one)
  const sections = Array.from(main.querySelectorAll("section, ui-section")).filter((section) =>
    section.querySelector("ui-card")
  )
  const empty = document.getElementById("empty")
  let typed = input ? readSaved(key) : ""
  let chosen = String(badge?.value ?? "")
  /** Folded sections the filter unfolded, to fold back when it's cleared. */
  const filterOpened = new Set()
  input?.addEventListener("ui-input", onType)
  input?.addEventListener("ui-change", onType)
  badge?.addEventListener("ui-change", (event) => {
    chosen = String(event.detail?.value ?? badge.value ?? "")
    apply()
  })
  if (typed) input.value = typed
  if (typed || chosen) apply()

  /** The typed filter changed:  apply and save it. */
  function onType(event) {
    typed = String(event.detail?.value ?? input.value ?? "")
    apply()
    try {
      localStorage.setItem(key, typed)
    } catch {
      // private window:  the filter just isn't remembered
    }
  }

  /**
   * Hide what doesn't match.
   * - while a filter is set, a folded section holding a match unfolds
   *   (not saved:  sections start folded, so matches would hide in them);
   *   clearing the filter folds back the ones it opened
   */
  function apply() {
    const words = typed.toLowerCase().split(/\s+/).filter(Boolean)
    const wanted = chosen.trim().toLowerCase()
    let shown = 0
    for (const card of cards) {
      const content = card.textContent.toLowerCase()
      const badges = Array.from(card.querySelectorAll("ui-label"), (label) => label.textContent.trim().toLowerCase())
      card.hidden = !words.every((word) => content.includes(word)) || (!!wanted && !badges.includes(wanted))
      if (!card.hidden) shown++
    }
    const filtering = words.length > 0 || !!wanted
    for (const section of sections) {
      section.hidden = !section.querySelector("ui-card:not([hidden])")
      if (section.localName !== "ui-section") continue
      if (filtering && !section.hidden && isCollapsed(section)) {
        setCollapsed(section, false)
        filterOpened.add(section)
      } else if (!filtering && filterOpened.has(section)) {
        setCollapsed(section, true)
        filterOpened.delete(section)
      }
    }
    if (empty) empty.hidden = shown > 0
    for (const item of document.querySelectorAll("nav.spell-toolbar [data-rail]")) {
      item.hidden = !!document.getElementById(item.dataset.rail)?.closest("[hidden]")
    }
  }
}

/** The object saved as JSON under `key`, or `{}` (nothing saved, bad JSON, or storage that throws). */
function readJSON(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "{}")
    return value && typeof value === "object" ? value : {}
  } catch {
    return {}
  }
}

/** Save `value` as JSON under `key`;  a browser that blocks storage just doesn't remember. */
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // private window:  not remembered
  }
}

/** The filter saved under `key`, or "" (storage can throw, e.g. blocked site data). */
function readSaved(key) {
  try {
    return localStorage.getItem(key) ?? ""
  } catch {
    return ""
  }
}

////////////////
// ## Page notes
////////////////

/**
 * PAGE NOTES (epic `airplane`, P3):  notes written INTO a page (`<spell-notes>` / `<spell-note>`;  the markup and its
 * rules:  `packages/docs/tools/PageNotes.js`), each drawn as a folded card (`drawNoteCards()`).
 * - READ ONLY since P11:  comments (below) replaced the bubbles and the Note pill that wrote them;
 *   the notes already written still show, and `spell dev notes` still answers them
 * - every page, `file://` too;  drawn again on `spell-doc:updated` (an answer changes the page)
 */
function wireNotes(main) {
  drawNoteCards(main)
  addEventListener("spell-doc:updated", () => drawNoteCards(main))
}

/**
 * Give each `<spell-note>` its head line, again after every update (the status or replies may have changed):
 * "Owen · 10/10 14:02", the first line of the note while folded, its status, how many replies.
 * - the head is a button that folds and unfolds the card (the note's `open`, which a live patch keeps)
 */
function drawNoteCards(main) {
  for (const note of main.querySelectorAll("spell-note")) {
    note.querySelector(":scope > .spell-note-head")?.remove()
    const status = note.getAttribute("status") || "new"
    const replies = note.querySelectorAll(":scope > spell-note-reply").length
    const head = document.createElement("div")
    head.className = "spell-note-head"
    head.dataset.spellAdded = ""
    head.innerHTML =
      `<button type="button" class="spell-note-fold" aria-expanded="${note.hasAttribute("open")}">` +
      `<ui-icon name="comment"></ui-icon><b>Owen</b> · ${text(shortStamp(note.getAttribute("at")))}` +
      `<span class="spell-note-preview">${text(noteText(note).split("\n")[0])}</span>` +
      `<span class="spell-note-status" data-note-status="${attr(status)}">${text(status)}` +
      `${replies ? ` · ${replies} ${replies === 1 ? "reply" : "replies"}` : ""}</span></button>`
    head.querySelector(".spell-note-fold").addEventListener("click", () => {
      note.toggleAttribute("open")
      head.querySelector(".spell-note-fold").setAttribute("aria-expanded", String(note.hasAttribute("open")))
    })
    note.prepend(head)
  }
}

////////////////
// ## Comments
////////////////

/** The page server's comments routes (`packages/docs/tools/commentsRoutes.ts`). */
const COMMENTS_API = "/api/comments"

/** `localStorage` key prefix of a page's unsaved comments (`{ [anchor | comment id]: text }`), per page. */
const COMMENT_DRAFT_KEY_PREFIX = "spell-comment-draft:"

/** The CSS highlight the quoted text of every comment is drawn with (`::highlight()` in `spell-doc.css`). */
const QUOTE_HIGHLIGHT = "spell-comment-quote"

/** How long after Owen stops typing the comment box saves itself, ms. */
const COMMENT_SAVE_MS = 600

/** How many characters of the selected text (or the block's) the comment box's header shows. */
const HEADLINE_CHARS = 40

/** How long after the page's content changes (a plan doc's part loading) the comments draw again, ms. */
const REDRAW_MS = 150

/** What a block kind is called in the bullhorn's tooltip and the comment box. */
const KIND_NAMES = {
  section: "section",
  item: "item",
  field: "field",
  summary: "summary",
  prose: "paragraph",
  table: "table",
  aside: "aside",
  code: "code block",
  message: "message",
  cards: "cards",
  steps: "steps",
  list: "list",
  page: "page"
}

/**
 * COMMENTS (epic `airplane`, P11):  Owen's comments for Claude, on a page's blocks or on text he selected, kept by
 * the page server (`commentsRoutes.ts`):  a docs page's in its inbox file (`<page>.inbox.json`), a plan doc's in the
 * epic's review inbox.  No Claude, no network:  only the page server, so it works on a plane.
 * - served by the page server with a token, on a page that takes comments (the `GET` says `takesComments`):
 *   - a BULLHORN beside every major block (`BlockAnchors.js` `blocksIn()`:  sections, tables, asides, code,
 *     messages, cards, steps, top-level lists;  a plan doc's items, phase fields, summary and Overview prose) and in
 *     the page header (the whole page):  shown while the block is hovered, always once it has comments, with a count
 *   - SELECTED TEXT:  ⌘ / Ctrl I, or the bullhorn that floats beside the selection:  the box opens for that block,
 *     its header the text's first words;  the comment keeps the quote, highlighted on the page while it exists
 *   - the box is a small PANE, fixed on the screen, just under the selection (or the button clicked):  the page
 *     never scrolls, and Owen drags it by its header (Owen, 2026-10-10:  "a little floating pane below the selected
 *     text that I can move around -- don't scroll the page and lose context!")
 *   - in it:  a header (the first words, a floppy, a trash once saved, ×) and a textarea that grows, with no
 *     placeholder;  ivory, no buttons below (Owen, 2026-10-10);  it saves itself as Owen types, the floppy says so;
 *     × or Escape closes it;  what's typed and not saved yet is kept in this browser (`COMMENT_DRAFT_KEY_PREFIX`)
 *   - NEVER an empty comment:  nothing typed saves nothing;  emptied, it's deleted at once
 *   - a click on a highlighted quote opens its comment in the pane again:  to edit while it waits, else to read
 *     with Claude's answers, and delete
 *   - each comment:  a card under its block, Owen's, "Owen · 10/10 14:02";  its state by the fill rule
 *     (`templates/epics/plan-doc.md`, "Colours"):  saved, "Saved 14:02 · waiting for Claude":  outlined;
 *     "Taken by Claude" (a guide's, into epic `guide-changes`) or "Answered":  solid.  Edit while it waits;
 *     a trash on every card (two clicks:  `delete` while it waits, else `clear`);  Claude's answers under it, violet
 * - drawn again after a live patch (`spell-doc:updated`), when the page's content changes (a plan doc's part
 *   loading), when the inbox file changes (`spell-server:file`:  another window, Claude), and when the page comes
 *   back into view
 * - what it adds in `main` carries `data-spell-added`:  a patch steps around it, the anchors never count it
 * - NEVER throws:  a page with no server, or a server without the routes, shows no bullhorns
 */
async function wireComments(main) {
  if (!window.SPELL_SERVER?.token || location.protocol === "file:") return
  const comments = new PageComments(main)
  if (!(await comments.load())) return
  comments.draw()
  const reload = () => void comments.load().then((takes) => takes && comments.draw())
  addEventListener("spell-doc:updated", () => comments.draw())
  addEventListener("spell-server:file", (event) => {
    if (comments.inboxPaths.includes(decodeURIComponent(event.detail?.path ?? ""))) reload()
  })
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && reload())
  // leaving (a reload, another page):  what's typed in the pane and not saved yet goes now
  addEventListener("pagehide", () => comments.open?.flush?.())
  comments.watchContent()
  comments.wireSelection()
}

/****************
 * ### `PageComments`
 * One page's comments:  what the server holds, drawn under their blocks;  the one comment pane open;  the floating
 * bullhorn of a text selection.
 * - `list`:  the comments as the server last answered;  every write answers the whole list, which is drawn again
 * - NEVER throws:  a failed save says so (the floppy turns red), the text kept in the pane
 ****************/
class PageComments {
  /** - `main`:  the page's `main`, where the blocks are */
  constructor(main) {
    /** the page's `main` */
    this.main = main
    /** the comments, as the server last answered (`CommentList` `all`) */
    this.list = []
    /**
     * the pane open, if any:  `{ key, place, id?, text?, view?, finish? }` (`place`:  `{ anchor, kind, label, excerpt,
     * quote? ... }`;  `view`:  a comment Claude has, shown, not edited;  `finish()`:  saves what's typed, then forgets
     * its draft)
     */
    this.open = null
    /** the open pane's element (`showPane()`), in `main` but fixed on the screen:  a redraw never touches it */
    this.pane = null
    /** each quote's range on the page, by comment id (`highlightQuotes()`):  a click on one opens its comment */
    this.quotes = []
    /** each card's fold, by comment id, as the reader left it;  else waiting ones open, the rest folded */
    this.folds = new Map()
    const page = decodeURIComponent(location.pathname)
    /** the URL paths of the inbox files the comments may be in, as the page server announces their changes */
    this.inboxPaths = [page.replace(/(\.plan)?\.html$/, ".inbox.json")]
    /** the `localStorage` key of this page's drafts */
    this.draftKey = `${COMMENT_DRAFT_KEY_PREFIX}${location.pathname}`
  }

  /** Fetch the page's comments;  resolves to whether the page takes comments.  NEVER throws. */
  async load() {
    try {
      const response = await fetch(`${COMMENTS_API}?page=${encodeURIComponent(location.pathname)}`, {
        cache: "no-store"
      })
      const answer = response.ok ? await response.json() : {}
      if (answer.takesComments !== true) return false
      this.list = answer.comments ?? []
      return true
    } catch {
      return false
    }
  }

  /**
   * Draw it all again:  every bullhorn, every block's comments, the quotes' highlight.
   * - a comment whose block can't be found any more goes under the page header, saying so
   * - the open pane stays as it is, where Owen put it, the cursor in it
   */
  draw() {
    const { main } = this
    for (const old of main.querySelectorAll(".spell-comment-mark, .spell-comments")) old.remove()
    const blocks = blocksIn(main)
    const head = pageHeadIn(main)
    const onBlock = new Map()
    const quotes = []
    for (const comment of this.list) {
      const { block, exact } = findBlock(main, comment, blocks)
      const at = block ?? head
      if (!at) continue
      if (!onBlock.has(at)) onBlock.set(at, [])
      onBlock.get(at).push({ comment, exact: exact && Boolean(block) })
      const quoted = block && comment.quote && quoteIn(block, comment.quote, comment.offset)
      if (quoted) quotes.push({ ...quoted, id: comment.id })
    }
    for (const block of head ? [head, ...blocks] : blocks) this.addBullhorn(block, onBlock.get(block)?.length ?? 0)
    for (const [block, found] of onBlock) this.boxFor(block).append(...found.map((each) => this.card(each)))
    this.quotes = highlightQuotes(quotes)
  }

  /**
   * Draw again when the page's own content changes:  a plan doc's part loads its blocks when it opens.
   * - changes inside what this adds (`data-spell-added`) don't count:  drawing would wake it again
   */
  watchContent() {
    let timer = 0
    const ours = (node) =>
      node.nodeType === 1 && (node.matches("[data-spell-added]") || node.closest("[data-spell-added]"))
    new MutationObserver((records) => {
      const theirs = records.some(
        (record) =>
          !ours(record.target) &&
          [...record.addedNodes, ...record.removedNodes].some((node) => node.nodeType === 1 && !ours(node))
      )
      if (!theirs) return
      clearTimeout(timer)
      timer = setTimeout(() => this.draw(), REDRAW_MS)
    }).observe(this.main, { childList: true, subtree: true })
  }

  ////////////////
  // ## Bullhorns
  ////////////////

  /**
   * The bullhorn of `block`:  in a docs section's title (its `actions` slot), in the page header,
   * else just before the block, over its top right corner.
   */
  addBullhorn(block, count) {
    const place = this.placeOf(block)
    const what = place.kind === "page" ? "this page" : `this ${KIND_NAMES[place.kind] ?? place.kind}`
    const tip = count ? `${count} ${count === 1 ? "comment" : "comments"} on ${what};  add one` : `Comment on ${what}`
    const inline = place.kind === "section" || place.kind === "page"
    const mark = document.createElement(inline ? "span" : "div")
    mark.className = `spell-comment-mark at-${inline ? place.kind : "block"}`
    mark.dataset.spellAdded = ""
    if (count) mark.dataset.count = String(count)
    mark.innerHTML =
      `<ui-button circular basic size="mini" icon="bullhorn" title="${attr(tip)}" aria-label="${attr(tip)}">` +
      `${count || ""}</ui-button>`
    mark.querySelector("ui-button").addEventListener("click", (event) => {
      event.stopPropagation()
      this.openBox({ key: place.anchor, place }, event.currentTarget.getBoundingClientRect())
    })
    if (place.kind === "section") {
      mark.slot = "actions"
      block.append(mark)
    } else if (place.kind === "page") {
      // in the page header, before its toolbar:  the toolbar stays its last row
      const head = block.querySelector(".spell-page-head")
      if (head) beforeToolbar(head, mark)
      else block.append(mark)
    } else block.before(mark)
  }

  /** Where `block` is, as a comment on it is saved:  `{ anchor, kind, label, excerpt }` (`BlockAnchors.js`). */
  placeOf(block) {
    if (block === pageHeadIn(this.main)) return { anchor: PAGE_ANCHOR, kind: "page", label: "", excerpt: "" }
    const kind = kindOf(block)
    const section = kind === "section" || kind === "item" ? block : sectionOf(block, this.main)
    return {
      anchor: anchorOf(block, this.main),
      kind,
      label: section ? sectionTitle(section) : "",
      excerpt: excerptOf(block)
    }
  }

  /**
   * The box of comments under `block`, made on first use:  a docs section's first in its body (under its title),
   * the page's right under the page header, any other block's right after it.
   */
  boxFor(block) {
    const next = block.localName === "ui-section" ? firstContentChild(block) : block.nextElementSibling
    if (next?.classList.contains("spell-comments")) return next
    const box = document.createElement("div")
    box.className = "spell-comments"
    box.dataset.spellAdded = ""
    if (block.localName !== "ui-section") block.after(box)
    else if (next) next.before(box)
    else block.append(box)
    return box
  }

  ////////////////
  // ## Selected text
  ////////////////

  /**
   * Comment on selected text:  ⌘ / Ctrl I, or the bullhorn floating beside the selection (`floatingBullhorn()`).
   * - only a selection inside one of the page's blocks;  never in a comment box or a field
   * - leaves the selection alone:  copy, ⌘ A ... work as before
   * - a click on a comment's highlighted quote opens that comment in the pane again (`quoteAt()`);  the pointer
   *   says so over one
   */
  wireSelection() {
    let timer = 0
    document.addEventListener("selectionchange", () => {
      clearTimeout(timer)
      timer = setTimeout(() => this.showFloating(), 120)
    })
    document.addEventListener("click", (event) => {
      if (!getSelection()?.isCollapsed) return
      if (event.target.closest?.("a, button, ui-button, input, textarea, [data-spell-added]")) return
      const hit = this.quoteAt(event.clientX, event.clientY)
      if (hit) this.openComment(hit.id, hit.rect)
    })
    let pending = false
    document.addEventListener(
      "pointermove",
      (event) => {
        if (pending || !this.quotes.length) return
        pending = true
        requestAnimationFrame(() => {
          pending = false
          document.documentElement.classList.toggle("spell-over-quote", !!this.quoteAt(event.clientX, event.clientY))
        })
      },
      { passive: true }
    )
    addEventListener("scroll", () => this.floating?.setAttribute("hidden", ""), { passive: true })
    document.addEventListener("keydown", (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey || event.key.toLowerCase() !== "i") return
      const selected = this.selected()
      if (!selected) return
      event.preventDefault()
      this.commentOn(selected)
    })
  }

  /** The selection, when it's text in one of the page's blocks:  `{ block, quote, offset, range }`;  else `null`. */
  selected() {
    const selection = getSelection()
    if (!selection || selection.isCollapsed || !selection.rangeCount) return null
    const range = selection.getRangeAt(0)
    const start = range.startContainer
    if (!this.main.contains(start)) return null
    const element = start.nodeType === 1 ? start : start.parentElement
    if (element?.closest("[data-spell-added], textarea, input")) return null
    const block = blockAround(start, blocksIn(this.main))
    const quote = selection.toString().trim()
    if (!block || !quote) return null
    return { block, quote, offset: offsetIn(block, start, range.startOffset), range }
  }

  /** Open the comment pane on the selection's block, its text quoted, just under the selection. */
  commentOn({ block, quote, offset, range }) {
    this.floating?.setAttribute("hidden", "")
    const rects = range.getClientRects()
    const near = rects[rects.length - 1] ?? range.getBoundingClientRect()
    const place = { ...this.placeOf(block), quote: quote.slice(0, 2000), offset }
    this.openBox({ key: `${place.anchor}~${offset}`, place }, near)
  }

  /** The quote under the point (`x`, `y`):  `{ id, rect }`, the comment's id and the line hit;  else `null`. */
  quoteAt(x, y) {
    for (const { id, range } of this.quotes) {
      const rect = Array.from(range.getClientRects()).find(
        (each) => x >= each.left && x <= each.right && y >= each.top && y <= each.bottom
      )
      if (rect) return { id, rect }
    }
    return null
  }

  /**
   * Open comment `id` in the pane, under `near`:  to edit while it waits for Claude, else (`view`) to read with its
   * answers, and delete.  Already open:  the cursor goes back into it, where it is.
   */
  openComment(id, near) {
    if (this.open?.id === id && this.pane) return this.focusPane()
    const comment = this.list.find((each) => each.id === id)
    if (!comment) return
    const { anchor, kind, label, excerpt, quote, offset } = comment
    const place = { anchor, kind, label, excerpt, quote, offset }
    const view = commentState(comment) !== "saved"
    this.openBox({ key: id, id, place, text: comment.text, view }, near)
  }

  /** Show the floating bullhorn beside a selection in a block;  hide it otherwise. */
  showFloating() {
    const selected = this.selected()
    const button = this.floatingBullhorn()
    if (!selected) return button.setAttribute("hidden", "")
    const rects = selected.range.getClientRects()
    const last = rects[rects.length - 1] ?? selected.range.getBoundingClientRect()
    button.style.left = `${Math.min(innerWidth - 36, last.right + 6)}px`
    button.style.top = `${Math.max(4, last.top - 4)}px`
    button.removeAttribute("hidden")
  }

  /** The floating bullhorn, made once (in `body`, outside `main`):  a click comments on the selection. */
  floatingBullhorn() {
    if (this.floating) return this.floating
    const button = document.createElement("button")
    button.type = "button"
    button.className = "spell-comment-float"
    button.hidden = true
    const tip = `Comment on this text (${/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl "}I)`
    button.title = tip
    button.setAttribute("aria-label", tip)
    button.innerHTML = `<ui-icon name="bullhorn"></ui-icon>`
    // keep the selection:  a press would otherwise clear it before the click
    button.addEventListener("pointerdown", (event) => event.preventDefault())
    button.addEventListener("click", () => {
      const selected = this.selected()
      if (selected) this.commentOn(selected)
    })
    document.body.append(button)
    return (this.floating = button)
  }

  ////////////////
  // ## Cards
  ////////////////

  /**
   * A comment's card, drawn as the pane is (Owen, 2026-10-10:  "bullhorn popup looks good.  These are ugly"):  its
   * header ("Owen", its state, the date, then the trash and, while it waits, Edit at the far right), then a box of
   * the quote it's on, its text, and Claude's answers.  Folds by its header;  folded, the header shows the
   * comment's first line.
   * - `exact` false:  its block changed or moved since, so the card says what it was on
   */
  card({ comment, exact }) {
    const card = document.createElement("div")
    card.className = "spell-comment"
    card.id = `comment-${comment.id}`
    const state = commentState(comment)
    card.dataset.state = state
    const open = this.folds.get(comment.id) ?? state === "saved"
    if (!open) card.dataset.folded = ""
    const editing = this.open?.id === comment.id
    // waiting:  the date says when it was saved, so the state doesn't say it again
    const said = state === "saved" ? "Waiting for Claude" : stateLabel(comment, state)
    card.innerHTML =
      `<div class="spell-comment-head"><div class="spell-comment-line">` +
      `<button type="button" class="spell-comment-fold" aria-expanded="${open}" title="${open ? "Fold" : "Unfold"} this comment">` +
      `<ui-icon name="bullhorn"></ui-icon><b>Owen</b><span class="spell-comment-preview">${text(comment.text.split("\n")[0])}</span></button>` +
      `<span class="spell-comment-state">${said}</span>` +
      `<span class="spell-comment-date">${text(shortStamp(localStamp(comment.at)))}</span></div>` +
      deleteButton(state) +
      (state === "saved" && !editing
        ? `<button type="button" class="spell-comment-tool spell-comment-edit" ` +
          `title="Edit this comment, until Claude takes it:  emptied, it's deleted" aria-label="Edit this comment">` +
          `<ui-icon name="pen to square"></ui-icon></button>`
        : "") +
      `</div><div class="spell-comment-body">` +
      (exact ? "" : `<p class="spell-comment-moved">The block changed since:  it was “${text(comment.excerpt)}”.</p>`) +
      (comment.quote ? `<blockquote class="spell-comment-quote">${text(comment.quote)}</blockquote>` : "") +
      commentHTML(comment.text) +
      (comment.replies ?? [])
        .map(
          (reply) =>
            `<div class="spell-comment-reply"><div class="spell-comment-who">${text(reply.by)} · ` +
            `${text(shortStamp(localStamp(reply.at)))}</div>${reply.html}</div>`
        )
        .join("") +
      `</div>`
    if (editing) card.hidden = true
    const fold = card.querySelector(".spell-comment-fold")
    fold.addEventListener("click", () => {
      const opening = card.hasAttribute("data-folded")
      card.toggleAttribute("data-folded", !opening)
      fold.setAttribute("aria-expanded", String(opening))
      fold.title = `${opening ? "Fold" : "Unfold"} this comment`
      this.folds.set(comment.id, opening)
    })
    card.querySelector(".spell-comment-edit")?.addEventListener("click", (event) => {
      this.openComment(comment.id, event.currentTarget.getBoundingClientRect())
    })
    wireDelete(card.querySelector(".spell-comment-delete"), () => this.remove(comment.id))
    return card
  }

  /**
   * Delete comment `id`, whatever its state:  gone from the inbox, its card and highlight with it.  NEVER throws.
   * - while it waits for Claude:  `delete`;  once Claude has it:  `clear` (a taken one stays in its epic)
   * - its pane, if open, closes;  any draft of it is forgotten
   */
  async remove(id) {
    const action = this.waiting(id) ? "delete" : "clear"
    try {
      const answer = await postJSON(COMMENTS_API, { page: location.pathname, action, id })
      this.list = answer.comments ?? this.list
      this.forget(id)
      if (this.open?.id === id) this.closePane()
      else this.draw()
      noteToast("Comment deleted", "success")
    } catch (error) {
      noteToast(`Couldn't delete the comment:  ${error.message}`, "error")
    }
  }

  ////////////////
  // ## The comment pane
  ////////////////

  /**
   * Open the comment pane for `open` (`{ key, place, id?, text?, view? }`), just under `near` (a `DOMRect`:  the
   * selection's last line, the button clicked):  a new comment on `place`'s block (`quote`:  on that text), editing
   * comment `id` (its card hidden meanwhile), or (`view`) showing one Claude has.
   * - only one is open:  opening another saves what's typed in this one, then closes it
   * - the same one again:  the cursor goes back into it, where Owen put it
   * - the page never scrolls (Owen, 2026-10-10:  "don't scroll the page and lose context!")
   */
  openBox(open, near) {
    if (this.pane && this.open?.key === open.key) return this.focusPane()
    void this.open?.finish?.()
    this.pane?.remove()
    this.open = open
    this.draw()
    this.showPane(near)
  }

  /** Close the pane, and draw the comments again (the card it hid comes back). */
  closePane() {
    this.pane?.remove()
    this.pane = null
    this.open = null
    this.draw()
  }

  /**
   * Put the pane on the screen under `near`, else above it when there's no room below, never past the window's
   * edges;  the cursor in its field.
   * - fixed on the screen, in `main` (where the comments' styles reach):  the page scrolls under it
   */
  showPane(near) {
    const pane = (this.pane = this.paneFor(this.open))
    this.main.append(pane)
    const field = pane.querySelector("textarea")
    if (field) growField(field)
    const { width, height } = pane.getBoundingClientRect()
    const left = near?.left ?? (innerWidth - width) / 2
    let top = near ? near.bottom + 8 : 80
    if (near && top + height > innerHeight - 8) top = near.top - height - 8
    movePane(pane, left, top)
    this.focusPane()
  }

  /** The cursor into the open pane's field, at the end (or into the pane, when it has none);  no scrolling. */
  focusPane() {
    const field = this.pane?.querySelector("textarea")
    if (!field) return this.pane?.focus({ preventScroll: true })
    field.focus({ preventScroll: true })
    field.setSelectionRange(field.value.length, field.value.length)
  }

  /**
   * The pane's markup and wiring, for `open` (`openBox()`'s):  a header, then the text;  no buttons below it.
   * - the header:  a few words of what it's on (the selected text, else the block:  `headline()`), the floppy, the
   *   trash, ×;  its tooltip names the block in full (`aboutTip()`);  Owen drags the pane by it
   * - the field has no placeholder (Owen, 2026-10-10:  "remove the 'Anything:  a correction...' placeholder")
   * - the trash deletes the comment (two clicks:  `wireDelete()`);  shown once it's saved
   * - `view`:  the comment and Claude's answers instead of the field;  no floppy
   * - × or Escape closes it (⌘ / Ctrl Enter too, in the field), saving what's typed first
   */
  paneFor(open) {
    const pane = document.createElement("div")
    pane.className = "spell-comment-pane"
    pane.dataset.spellAdded = ""
    pane.tabIndex = -1
    pane.setAttribute("role", "dialog")
    pane.setAttribute("aria-label", `Comment on ${headline(open.place)}`)
    const comment = open.view ? this.list.find((each) => each.id === open.id) : null
    pane.innerHTML =
      `<div class="spell-comment-about" title="${attr(`${aboutTip(open)}\n(Drag to move)`)}">` +
      `<ui-icon name="bullhorn"></ui-icon><span class="spell-comment-on">${text(headline(open.place))}</span>` +
      (open.view
        ? ""
        : `<span class="spell-comment-saved" hidden><ui-icon name="floppy disk outline"></ui-icon></span>`) +
      deleteButton(comment ? commentState(comment) : "saved", !open.id) +
      `<button type="button" class="spell-comment-tool spell-comment-close" title="${open.view ? "Close" : CLOSE_TIP}" ` +
      `aria-label="Close the comment box"><ui-icon name="xmark"></ui-icon></button></div>` +
      (open.view
        ? `<div class="spell-comment-view">${comment ? viewHTML(comment) : ""}</div>`
        : `<textarea class="spell-comment-field" rows="3" aria-label="Your comment"></textarea>`)
    wireDrag(pane, pane.querySelector(".spell-comment-about"))
    const close = open.view ? async () => this.open === open && this.closePane() : this.wireField(pane, open)
    pane.querySelector(".spell-comment-close").addEventListener("click", () => void close())
    pane.addEventListener("keydown", (event) => {
      const closing = event.key === "Escape" || (event.key === "Enter" && (event.metaKey || event.ctrlKey))
      if (!closing) return
      event.preventDefault()
      event.stopPropagation()
      void close()
    })
    wireDelete(pane.querySelector(".spell-comment-delete"), () =>
      open.discard ? open.discard() : this.remove(open.id)
    )
    return pane
  }

  /**
   * Wire the pane's field for `open`;  returns what closes it.
   * - saves itself as Owen types, `COMMENT_SAVE_MS` after he stops (Owen, 2026-10-10:  "Save should just happen as I
   *   type"):  the first save adds the comment, the next ones edit it;  the floppy says how the last one went
   * - NEVER an empty comment (Owen, 2026-10-10:  "don't save an empty bullhorn comment"):  nothing typed (or only
   *   spaces) saves nothing;  emptied, a saved one goes at once (`delete`, else `clear`);  the trash deletes it
   * - a DRAFT is kept in this browser (`COMMENT_DRAFT_KEY_PREFIX`) only while what's typed differs from what the
   *   server holds:  under the comment's id once it has one, else under the pane's `key`.
   *   - So a reload never brings back, as a NEW comment, text already saved.
   *     Before 2026-10-10 it did, and closing the pane at once saved that text a second time.
   *   - A new comment's draft that copies a comment already on its block is dropped (`draftOf()`).
   * - leaving the page (`pagehide`):  what's typed and not saved yet goes at once (`flush()`)
   */
  wireField(pane, open) {
    const { key, place } = open
    const field = pane.querySelector("textarea")
    const floppy = pane.querySelector(".spell-comment-saved")
    const trash = pane.querySelector(".spell-comment-delete")
    // what the server holds;  one save at a time, in order, so a quick typist never adds the comment twice
    let saved = (open.text ?? "").trim()
    let saving = Promise.resolve(true)
    let timer = 0
    // deleted with the trash:  nothing more is saved
    let gone = false
    // where its draft is kept
    const slot = () => open.id ?? key
    field.value = this.draftOf(open) ?? open.text ?? ""
    // keep what's typed as the draft while it differs from what's saved;  else none (`before`:  its old slot)
    const keep = (before = slot()) => {
      const drafts = readJSON(this.draftKey)
      delete drafts[before]
      const words = field.value.trim()
      if (words && words !== saved) drafts[slot()] = field.value
      else delete drafts[slot()]
      writeJSON(this.draftKey, drafts)
    }
    const save = async ({ keepalive = false } = {}) => {
      const words = field.value.trim()
      if (gone || words === saved) return true
      if (!words && !open.id) return true
      const change = !words
        ? { action: this.waiting(open.id) ? "delete" : "clear", id: open.id }
        : open.id
          ? { action: "edit", id: open.id, text: words }
          : { action: "add", ...place, text: words }
      try {
        const answer = await postJSON(COMMENTS_API, { page: location.pathname, ...change }, { keepalive })
        const before = slot()
        open.id = words ? (open.id ?? answer.id) : undefined
        saved = words
        this.list = answer.comments ?? this.list
        keep(before)
        floppy.hidden = !words
        floppy.removeAttribute("data-failed")
        floppy.title = `Saved ${localStamp(new Date().toISOString()).slice(11)} · waiting for Claude`
        trash.hidden = !open.id
        // its highlight on the page, at once;  its card stays hidden while the pane is open
        if (this.open === open) this.draw()
        return true
      } catch (error) {
        floppy.hidden = false
        floppy.setAttribute("data-failed", "")
        floppy.title = `Not saved:  ${error.message} (kept in this browser)`
        return false
      }
    }
    const saveNow = () => {
      clearTimeout(timer)
      return (saving = saving.then(() => save()))
    }
    open.finish = async () => {
      if (!(await saveNow())) return false
      this.forget(slot())
      this.forget(key)
      return true
    }
    // the page is going:  a request that outlives it
    open.flush = () => {
      clearTimeout(timer)
      saving = saving.then(() => save({ keepalive: true }))
    }
    open.discard = async () => {
      clearTimeout(timer)
      // a save on its way first:  it may bring the comment's id
      await saving
      gone = true
      this.forget(slot())
      this.forget(key)
      if (open.id) return this.remove(open.id)
      if (this.open === open) this.closePane()
    }
    field.addEventListener("input", () => {
      growField(field)
      keep()
      clearTimeout(timer)
      timer = setTimeout(saveNow, COMMENT_SAVE_MS)
    })
    field.addEventListener("blur", () => void saveNow())
    return async () => {
      if (!(await open.finish())) return noteToast(floppy.title, "error")
      if (this.open === open) this.closePane()
    }
  }

  /**
   * The draft kept for `open`'s pane (`wireField()`), or `undefined`:  none, blank, or (a new comment's) a copy of a
   * comment already on its block, which is dropped.
   */
  draftOf(open) {
    const slot = open.id ?? open.key
    const draft = readJSON(this.draftKey)[slot]
    if (typeof draft !== "string" || !draft.trim()) return undefined
    const { anchor, quote } = open.place
    const copy =
      !open.id &&
      this.list.some(
        (each) => each.anchor === anchor && (each.quote ?? "") === (quote ?? "") && each.text === draft.trim()
      )
    if (!copy) return draft
    this.forget(slot)
    return undefined
  }

  /** Whether comment `id` still waits for Claude, as the server last answered. */
  waiting(id) {
    const comment = this.list.find((each) => each.id === id)
    return !comment || commentState(comment) === "saved"
  }

  /** Drop the draft under `key`. */
  forget(key) {
    const drafts = readJSON(this.draftKey)
    delete drafts[key]
    writeJSON(this.draftKey, drafts)
  }
}

/**
 * A few words of what a comment box is on, for its header:  the start of the selected text, else of its block's
 * text, in quotes;  "This page" for the page.
 */
function headline(place) {
  if (place.kind === "page") return "This page"
  const words = (place.quote || place.excerpt || place.label || "").replace(/\s+/g, " ").trim()
  if (!words) return `This ${KIND_NAMES[place.kind] ?? place.kind}`
  return `“${words.length > HEADLINE_CHARS ? `${words.slice(0, HEADLINE_CHARS).trimEnd()}…` : words}”`
}

/** The comment box header's tooltip:  which block it's on, in full ("On a field in Guide Comments"). */
function aboutTip({ id, place }) {
  const what = place.kind === "page" ? "the page" : `a ${KIND_NAMES[place.kind] ?? place.kind}`
  const named = place.kind === "section" || place.kind === "item"
  const on = named && place.label ? `“${place.label}”` : what
  const where = place.kind === "page" || named || !place.label ? "" : ` in “${place.label}”`
  return `${id ? `Comment ${id}, on` : "On"} ${on}${where}${place.quote ? `:  “${place.quote}”` : ""}`
}

/**
 * A comment's state, by the fill rule:  `saved` (waiting for Claude:  outlined), `taken` (a guide's, into an epic's
 * phase) or `answered` (both solid).
 */
function commentState(comment) {
  if (comment.status === "answered" || comment.replies?.length) return "answered"
  return comment.status === "taken" ? "taken" : "saved"
}

/**
 * What a comment says of its state, in the pane (and, once Claude has it, on its card):
 * "Saved 14:02 · waiting for Claude", "Taken by Claude · P3" ...
 */
function stateLabel(comment, state) {
  if (state === "saved") return `Saved ${text(localStamp(comment.at).slice(11))} · waiting for Claude`
  const taken = comment.taken
  const where = taken
    ? ` · <a href="${attr(planLink(taken))}">${text(taken.epic)} P${text(String(taken.phase))}</a>`
    : ""
  return state === "taken" ? `Taken by Claude${where}` : `Answered${where}`
}

/** A comment Claude has, as the pane shows it to read:  its state, its text, Claude's answers;  no quote. */
function viewHTML(comment) {
  return (
    `<p class="spell-comment-status">${stateLabel(comment, commentState(comment))}</p>` +
    commentHTML(comment.text) +
    (comment.replies ?? [])
      .map(
        (reply) =>
          `<div class="spell-comment-reply"><div class="spell-comment-who">${text(reply.by)} · ` +
          `${text(shortStamp(localStamp(reply.at)))}</div>${reply.html}</div>`
      )
      .join("")
  )
}

/**
 * Highlight each quote's text on the page, softly (`QUOTE_HIGHLIGHT`);  returns each one's range, by comment id
 * (`[{ id, range }]`), for a click to find.  Not highlighted where the browser can't, but still found.
 */
function highlightQuotes(quotes) {
  const found = quotes.flatMap(({ id, start, end }) => {
    try {
      const range = document.createRange()
      range.setStart(...start)
      range.setEnd(...end)
      return [{ id, range }]
    } catch {
      return []
    }
  })
  if (globalThis.Highlight && globalThis.CSS?.highlights)
    CSS.highlights.set(QUOTE_HIGHLIGHT, new Highlight(...found.map(({ range }) => range)))
  return found
}

/** What the pane's × says, in its tooltip. */
const CLOSE_TIP = "Close (Escape):  it's saved as you type;  emptied, the comment is deleted"

/** How long a trash waits for its second click, ms. */
const DELETE_ARMED_MS = 3000

/** What a trash says, in its tooltip:  a comment still waiting for Claude, and one Claude has. */
const DELETE_TIPS = {
  saved: "Delete this comment (two clicks)",
  had: "Delete this comment (two clicks):  gone from the page, whatever Claude did with it"
}

/**
 * A comment's trash (Owen, 2026-10-10:  "allow me to delete bullhorn comments"):  on its card's header, and in the
 * pane's;  icon only, plain as the pane's × (Owen, 2026-10-10:  "no round border like everything else").
 * `state`:  the comment's (`commentState()`);  `hidden`:  not saved yet (a new comment's pane).
 */
function deleteButton(state, hidden = false) {
  const tip = DELETE_TIPS[state === "saved" ? "saved" : "had"]
  return (
    `<button type="button" class="spell-comment-tool spell-comment-delete" title="${attr(tip)}" ` +
    `aria-label="Delete this comment"${hidden ? " hidden" : ""}><ui-icon name="trash can"></ui-icon></button>`
  )
}

/**
 * Wire trash `button` (`deleteButton()`) to `act`, on a second click:  no browser dialog.  The first click turns it
 * red, "Click again to delete", for `DELETE_ARMED_MS`.
 */
function wireDelete(button, act) {
  if (!button) return
  const tip = button.title
  let timer = 0
  button.addEventListener("click", (event) => {
    event.stopPropagation()
    if (button.hasAttribute("data-armed")) {
      clearTimeout(timer)
      return void act()
    }
    button.setAttribute("data-armed", "")
    button.title = "Click again to delete"
    timer = setTimeout(() => {
      button.removeAttribute("data-armed")
      button.title = tip
    }, DELETE_ARMED_MS)
  })
}

/** Put the pane at (`left`, `top`) on the screen, inside the window's edges, 8px in. */
function movePane(pane, left, top) {
  const { width, height } = pane.getBoundingClientRect()
  pane.style.left = `${Math.max(8, Math.min(left, innerWidth - width - 8))}px`
  pane.style.top = `${Math.max(8, Math.min(top, innerHeight - height - 8))}px`
}

/** Let `handle` drag `pane` around the screen (not from a button on it). */
function wireDrag(pane, handle) {
  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest("ui-button, button")) return
    event.preventDefault()
    const start = pane.getBoundingClientRect()
    const dx = event.clientX - start.left
    const dy = event.clientY - start.top
    handle.setPointerCapture(event.pointerId)
    const move = (each) => movePane(pane, each.clientX - dx, each.clientY - dy)
    const stop = () => {
      handle.removeEventListener("pointermove", move)
      handle.removeEventListener("pointerup", stop)
      handle.removeEventListener("pointercancel", stop)
    }
    handle.addEventListener("pointermove", move)
    handle.addEventListener("pointerup", stop)
    handle.addEventListener("pointercancel", stop)
  })
}

/** A docs section's first child in its body (not its slotted icon, header or actions);  `null` for none. */
function firstContentChild(section) {
  return Array.from(section.children).find((child) => !child.hasAttribute("slot")) ?? null
}

/**
 * A comment's text as markup:  a `<p>` per block (split at blank lines), a single newline a `<br>`,
 * `backticked` runs `<code>`.  `PageNotes.js` `htmlOf()` does the same on the server.
 */
function commentHTML(words) {
  return words
    .trim()
    .split(/\n[ \t]*\n\s*/)
    .map(
      (block) =>
        `<p>${text(block.trim())
          .replace(/`([^`]+)`/g, "<code>$1</code>")
          .replace(/\n/g, "<br />")}</p>`
    )
    .join("")
}

/** An ISO time as local `YYYY-MM-DD HH:MM` (`shortStamp()` takes it from there). */
function localStamp(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso ?? ""
  const two = (value) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())} ${two(date.getHours())}:${two(date.getMinutes())}`
}

/** The URL of the phase a comment was taken into, from this checkout's root (a worktree's `/worktrees/<w>/` too). */
function planLink({ epic, phase }) {
  const root = /^\/worktrees\/[^/]+\//.exec(location.pathname)?.[0] ?? "/"
  return `${root}epics/${encodeURIComponent(epic)}/${encodeURIComponent(epic)}.plan.html#p${phase}`
}

/**
 * POST `body` as JSON to page-server route `url`, with the page server's token;  returns its answer.
 * - a 403 on the token (the server restarted since the page loaded):  takes the new token from the page as served
 *   now, and tries once more
 * - `keepalive`:  the request outlives the page (sent as it goes:  a small body only, under 64 KB)
 * - throws an `Error` saying why (the route's `error`)
 */
async function postJSON(url, body, { keepalive = false, retried = false } = {}) {
  const server = window.SPELL_SERVER
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-server-token": server.token },
    body: JSON.stringify(body),
    keepalive
  })
  const answer = await response.json().catch(() => ({}))
  if (response.ok) return answer
  if (response.status === 403 && /token/i.test(answer.error ?? "") && !retried && server.readPage) {
    const { html } = await server.readPage()
    const fresh = /window\.SPELL_SERVER = (\{.*?\})<\/script>/.exec(html)
    if (fresh) {
      server.token = JSON.parse(fresh[1]).token
      return postJSON(url, body, { keepalive, retried: true })
    }
  }
  throw new Error(answer.error ?? `${response.status} ${response.statusText}`)
}

////////////////
// ## Favorite epics
////////////////

/** The page server's route that stars and unstars an epic (`packages/epics/src/tool/epicRoutes.ts`). */
const FAVORITE_API = "/api/epics/favorite"

/** An Epics page group (`$/server/site/EpicCards` `epicGroupsHtml()`):  its heading's count, its card list. */
const EPIC_GROUP = ".spell-epic-group[data-group]"

/** Whether the stars' click listener is on `document` already:  once per page, whatever re-wires it. */
let favoritesWired = false

/**
 * FAVORITE EPICS (epic `airplane` P8, Owen 2026-10-10):  the star at each Epics card's top right
 * (`$/server/site/EpicCards` `epicStarHtml()`).
 * - a click stars or unstars the epic at once:  the card moves to Favorites (or back to its own group,
 *   `data-group`), alphabetical there, and each group's count follows (`regroupEpics()`);  no reload
 * - then the page server writes it (`FAVORITE_API`, into the shared `epics/favorites.json`);  refused:  the card
 *   goes back, and a toast says why
 * - its answer (every favourite) sets every star:  another window may have starred one meanwhile
 * - the card's own link never fires:  the star is a button of its own, its click stopped there
 * - only served by the page server with a token:  from `file://`, the stars show what the docs index wrote, and
 *   say they need the page server
 * - a live update of the page (`spell-doc:updated`) may leave a moved card twice:  `regroupEpics()` keeps one
 */
function wireFavorites(main) {
  const stars = main.querySelectorAll(".spell-epic-star")
  if (!stars.length) return
  const writable = !!window.SPELL_SERVER?.token && location.protocol !== "file:"
  if (!writable) {
    for (const star of stars) {
      star.disabled = true
      star.title = "Starring needs the page server (spell dev server ensure)"
    }
    return
  }
  regroupEpics(main)
  if (favoritesWired) return
  favoritesWired = true
  document.addEventListener("click", (event) => {
    const star = event.target instanceof Element ? event.target.closest(".spell-epic-star") : null
    if (!star) return
    event.preventDefault()
    event.stopPropagation()
    void toggleFavorite(star.closest("ui-card[data-epic]"))
  })
}

/** Star or unstar `card`'s epic:  at once on the page, then on the page server (`wireFavorites()`). */
async function toggleFavorite(card) {
  const main = card?.closest("main")
  if (!main) return
  const name = card.dataset.epic
  const favorite = card.querySelector(".spell-epic-star").getAttribute("aria-pressed") !== "true"
  setStar(card, favorite)
  regroupEpics(main)
  try {
    const { favorites } = await postJSON(FAVORITE_API, { name, favorite })
    const starred = new Set(favorites)
    for (const each of main.querySelectorAll("ui-card[data-epic]")) setStar(each, starred.has(each.dataset.epic))
  } catch (error) {
    setStar(card, !favorite)
    noteToast(`Couldn't ${favorite ? "star" : "unstar"} ${name}:  ${error.message}`, "error")
  }
  regroupEpics(main)
}

/** `card`'s star drawn as `favorite` says:  solid and pressed, or its outline (`epicStarHtml()`'s look). */
function setStar(card, favorite) {
  const star = card.querySelector(".spell-epic-star")
  if (!star) return
  const name = card.dataset.epic
  star.setAttribute("aria-pressed", String(favorite))
  star.setAttribute("aria-label", `${favorite ? "Unstar" : "Star"} ${name}`)
  star.title = favorite ? "A favorite:  listed first.  Click to unstar" : "Star it:  listed first, under Favorites"
  star.querySelector("ui-icon")?.setAttribute("name", favorite ? "star" : "star outline")
}

/**
 * Put every Epics card in its group:  Favorites when starred, else its own (`data-group`);  alphabetical by title
 * (`data-title`) in each;  each group's count, and empty ones hidden.
 * - a card twice (`data-epic`:  a live update re-added one this moved):  the first stays
 * - SIDE EFFECT:  moves cards between the groups' lists;  callable any time
 */
function regroupEpics(main) {
  const groups = new Map(
    Array.from(main.querySelectorAll(EPIC_GROUP), (group) => [group.dataset.group, group.querySelector("ui-cards")])
  )
  if (!groups.size) return
  const seen = new Set()
  const cards = []
  for (const card of main.querySelectorAll(`${EPIC_GROUP} ui-card[data-epic]`)) {
    if (seen.has(card.dataset.epic)) card.remove()
    else {
      seen.add(card.dataset.epic)
      cards.push(card)
    }
  }
  const byTitle = (a, b) =>
    (a.dataset.title ?? "").localeCompare(b.dataset.title ?? "", "en", { sensitivity: "base", numeric: true })
  for (const [name, list] of groups) {
    const mine = cards
      .filter((card) => {
        const starred = card.querySelector(".spell-epic-star")?.getAttribute("aria-pressed") === "true"
        return (starred ? "favorites" : card.dataset.group) === name
      })
      .toSorted(byTitle)
    // only what's out of place moves:  a card that stays keeps its focus and hover
    mine.forEach((card, index) => {
      if (list?.children[index] !== card) list?.insertBefore(card, list.children[index] ?? null)
    })
    const group = list?.closest(EPIC_GROUP)
    if (!group) continue
    group.hidden = mine.length === 0
    const count = group.querySelector(".spell-epic-group-count")
    if (count) count.textContent = String(mine.length)
  }
}

////////////////
// ## New epic
////////////////

/** The page server's New epic route (`packages/epics/src/tool/epicRoutes.ts`). */
const NEW_EPIC_API = "/api/epics/new"

/** `localStorage` key of the New epic box's unsaved text (`{ title, prompt }`), one for every Epics page. */
const NEW_EPIC_DRAFT_KEY = "spell-new-epic-draft"

/**
 * NEW EPIC (epic `airplane` P7):  on the Epics page (`epics/index.html`), a New epic pill in the page header.
 * - its box:  a title and the kickoff prompt (a textarea that grows with its text);  ⌘ / Ctrl Enter saves
 * - the page server writes a FUTURE epic at once (`epicRoutes.ts`):  no Claude needed, so it works on a plane;
 *   the docs index is rewritten, so the new card shows here with its seedling;  `/airplane land` offers to start it
 * - only served by the page server with a token:  from `file://`, no pill
 * - what's typed and not saved is kept (`NEW_EPIC_DRAFT_KEY`) until it's saved
 */
function wireNewEpic(main) {
  if (!/(^|\/)epics\/(index\.html)?$/.test(location.pathname)) return
  if (!window.SPELL_SERVER?.token || location.protocol === "file:") return
  const head = main.querySelector(".spell-page-head")
  if (!head || head.querySelector(":scope > .spell-new-epic")) return
  const pill = document.createElement("span")
  pill.className = "spell-new-epic"
  pill.dataset.spellAdded = ""
  // the browser's own tooltip, a `title` (Owen, 2026-10-10:  never a `<ui-popup>` as a tooltip)
  pill.innerHTML = `<ui-button circular basic size="tiny" icon="seedling" title="Write an idea down as a future epic">New epic</ui-button>`
  pill.querySelector("ui-button").addEventListener("click", openNewEpicBox)
  beforeToolbar(head, pill)
}

/** Add `pill` to the page header `head`, before its toolbar (`buildPageToolbar()`):  the toolbar stays its last row. */
function beforeToolbar(head, pill) {
  const toolbar = head.querySelector(":scope > nav.spell-toolbar")
  if (toolbar) toolbar.before(pill)
  else head.append(pill)
}

/** Open the New epic box, with the draft typed so far. */
function openNewEpicBox() {
  const box = newEpicBox()
  const draft = readJSON(NEW_EPIC_DRAFT_KEY)
  const [title, prompt] = box.querySelectorAll("input, textarea")
  title.value = typeof draft.title === "string" ? draft.title : ""
  prompt.value = typeof draft.prompt === "string" ? draft.prompt : ""
  box.visible = true
  requestAnimationFrame(() => {
    growField(prompt)
    ;(title.value ? prompt : title).focus()
  })
}

/** The New epic box, made once (outside `main`:  a live patch never sees it). */
function newEpicBox() {
  let box = document.getElementById("spell-new-epic-box")
  if (box) return box
  const template = document.createElement("template")
  template.innerHTML = `<ui-modal id="spell-new-epic-box" class="spell-note-box" size="small" closable>
  <ui-header><ui-icon name="seedling"></ui-icon> A new epic</ui-header>
  <ui-content>
    <input class="spell-note-field spell-new-epic-title" type="text" aria-label="Title" placeholder="Title:  a few words" />
    <textarea class="spell-note-field" rows="4" aria-label="What it's for"
      placeholder="What it's for, as you'd type it after /epic <name>:  the kickoff prompt."></textarea>
    <p class="spell-note-hint">⌘ Enter saves.  It's written down as a future epic, with a seedling on this page;  /airplane land asks whether to start it.</p>
  </ui-content>
  <ui-actions>
    <ui-button class="spell-note-cancel" circular basic>Cancel</ui-button>
    <ui-button class="spell-note-save" circular primary icon="seedling">Make the epic</ui-button>
  </ui-actions>
</ui-modal>`
  box = template.content.firstElementChild
  const [title, prompt] = box.querySelectorAll("input, textarea")
  const save = box.querySelector(".spell-note-save")
  const close = () => (box.visible = false)
  const keep = () => writeJSON(NEW_EPIC_DRAFT_KEY, { title: title.value, prompt: prompt.value })
  const submit = async () => {
    if (!title.value.trim()) return title.focus()
    save.setAttribute("loading", "")
    try {
      const { name } = await postJSON(NEW_EPIC_API, { title: title.value.trim(), prompt: prompt.value.trim() })
      writeJSON(NEW_EPIC_DRAFT_KEY, {})
      close()
      noteToast(`Future epic ${name} written down`, "success")
    } catch (error) {
      noteToast(`Couldn't make the epic:  ${error.message}`, "error")
    } finally {
      save.removeAttribute("loading")
    }
  }
  title.addEventListener("input", keep)
  prompt.addEventListener("input", () => {
    growField(prompt)
    keep()
  })
  for (const field of [title, prompt])
    field.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void submit()
    })
  save.addEventListener("click", () => void submit())
  box.querySelector(".spell-note-cancel").addEventListener("click", close)
  document.body.append(box)
  return box
}

/** `field` as tall as its text (between its CSS `min-height` and `max-height`). */
function growField(field) {
  field.style.height = "auto"
  field.style.height = `${field.scrollHeight + 2}px`
}

/** A toast through `UI.toast()`;  the console when toasts aren't there. */
function noteToast(message, type) {
  try {
    window.SpellUI.UI.toast({ message, type, position: "bottom right", displayTime: 3000, showIcon: true })
  } catch {
    console.info(message)
  }
}

/**
 * A note's text as typed:  paragraphs split by blank lines, `<br>` a newline, `<code>` in backticks;
 * its head and replies left out.  `PageNotes.js` `textOf()` is the same, on the server.
 */
function noteText(note) {
  const blocks = []
  for (const child of note.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE && child.matches(".spell-note-head, spell-note-reply")) continue
    const words = child.nodeType === Node.ELEMENT_NODE ? inlineText(child) : child.textContent
    if (words.trim()) blocks.push(words.trim())
  }
  return blocks.join("\n\n")

  /** `node`'s text:  `<br>` a newline, `<code>` in backticks, white space as one space. */
  function inlineText(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent.replace(/\s+/g, " ")
    if (node.nodeType !== Node.ELEMENT_NODE) return ""
    if (node.localName === "br") return "\n"
    const inner = Array.from(node.childNodes, inlineText).join("")
    return node.localName === "code" ? `\`${inner}\`` : inner
  }
}

/** A note's or comment's `at` (`2026-10-10 14:02`) as its card shows it:  `10/10 14:02`. */
function shortStamp(at) {
  const parts = /^\d{4}-(\d\d)-(\d\d)[ T](\d\d:\d\d)/.exec(at ?? "")
  return parts ? `${Number(parts[1])}/${Number(parts[2])} ${parts[3]}` : (at ?? "")
}

////////////////
// ## Helpers
////////////////

/** Resolves after `count` animation frames:  long enough for UI's first render after its definitions. */
async function nextFrames(count) {
  for (let left = count; left > 0; left--) await new Promise((resolve) => requestAnimationFrame(resolve))
}
