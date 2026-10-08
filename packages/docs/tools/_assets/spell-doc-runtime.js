/*
 * Page behaviour for the `.html` docs.
 * Bundled into `spell-ui.js` (a classic IIFE, beside @spell-app/ui) by `scripts/bundle-spell-ui.js`;  side
 * effects only.  The page's markup is hand-authored;  this only DRIVES it.
 * - Two page markups, read into ONE outline (`outlineOf()`) that everything below works from:
 *   - SECTIONS (every page but the goals pages):  `<ui-section id header sticky collapsible dividing>` in `main`,
 *     nested for sub-sections, `collapsed` to start folded.  The element draws the title, the fold button, the rule
 *     and the stack of stuck titles;  this runtime sets the top-level `offset`s, remembers folds, writes counts.
 *     - a PLAN DOC is `<epic-page>` markup (the `epics` pack, `packages/epics`):  its folding blocks
 *       (`<epic-overview>`, `<epic-section>`, `<epic-phase>`, `EPIC_FOLDS`) are its sections.  They draw and stick
 *       themselves, count their items, filter them, and draw the page header, the review line, the commits and
 *       every review control;  this runtime only lists them (each host's `contentsEntry`:  label, icon, count),
 *       remembers their folds, and lands links inside them
 *   - HEADINGS (the goals pages):  `section.s2|s3` > `<ui-sticky class="spell-h2|spell-h3">` > `<h2|h3 id>`;
 *     this runtime adds the fold chevrons and every sticky's `offset`
 * - contents sidebar:  built from the outline when the page has no `#spell-toc` (`buildContents()`)
 * - the RAIL:  a strip of the top-level sections' icons at the right edge, with the contents button (bars) on top,
 *   shown while the contents column isn't:  narrow screens, or hidden by its button (remembered for every page)
 * - sticky headers:  the page header (`ui-sticky.spell-h1`) sticks at the top, each top-level title below it,
 *   nested ones below their parents' (re-measured on resize);  CSS variables on the sections let anchors land below
 *   them all
 * - everything that sticks or lands at the top starts BELOW the fixed site header (`<spell-site-header>`,
 *   `siteHeaderHeight()`):  the page header, the titles, the contents column, the rail, the drawer
 * - folding:  every section folds from a chevron on its title;  folds are remembered per page, and `collapsed`
 *   (`data-fold="closed"` on HEADINGS pages) starts one folded
 * - counts:  a top-level section holding `[data-status]` items (the Epics index's epic cards, the goals pages'
 *   items) shows open / all on its title, and the open count as a badge in the contents and the rail;  an epic card
 *   section also gets a round filter button stepping through the items' states (`wireItemFilters()`)
 * - scroll-follow:  the current section's (heading's) contents link is highlighted and its panels open;  panels the
 *   scroll opened close again, panels the USER opened stay open
 * - links to any id in `main` (a section, a heading, a plan item) land below the stuck titles, unfolding what
 *   hides it
 * - the contents buttons (expand / collapse / code / hide), the narrow-screen drawer, the CHEATSHEET card filters
 * - highlight.js, when the page loaded it
 * LANDING -- where a jump puts its target, ONE model for every kind of jump:
 * - the line:  just below the lowest title that will be stuck over the target:  site header + `--spell-top` (page
 *   header, filter bar) + the stack of the target's sections' titles
 * - CSS `scroll-margin-top` holds that line MINUS the site header (`spell-doc.css`);  the site header is added by
 *   whoever does the scrolling, once:
 *   - our jumps (link clicks, a `#hash` load, `hashchange` / `popstate`, so also `location.hash = id`):
 *     `scrollTo()` with a computed top, which `scroll-padding` never touches:  `offsetFor()` adds the site header
 *   - the browser's own (a `#hash` before this runs, `scrollIntoView()`, focus):  `:root`'s `scroll-padding-top`,
 *     the site header's height (`<spell-site-header>` installs it)
 *   - paging (Page Down / Up, Space):  ours (`wirePaging()`), measured at the destination:  the old bottom lands
 *     just below the titles stuck THERE.  The browser's own paging (where ours stands aside) goes by
 *     `scroll-padding-top`:  while titles are stuck, `<ui-section>` / `<ui-sticky>` (`StickyWatch`) write the
 *     lowest stuck edge as an INLINE `scroll-padding-top` on `<html>` (it includes the site header:  titles stick
 *     below it), overriding `:root`'s;  removed once none is stuck.  That's where it STARTS, so a title that sticks
 *     on the way can cover the old bottom.
 * - NOTE: a browser jump made WHILE titles are stuck adds that inline padding to the margin, landing one stack
 *   lower:  every such jump that changes the hash (`hashchange`) lands again through ours;  `scrollIntoView()` from
 *   code doesn't -- call `jump`'s path (a click on a `#id` link, or set `location.hash`) instead
 * NOTE: panels open and close through the accordion's `open` PROPERTY (panel indexes as text):  that's
 * `<ui-accordion>`'s controlled state, and writing it announces nothing (`ui-open` / `ui-close` mean the user).
 */

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
 * When a jump on a `<ui-section>` page lands once more, unless the reader scrolled since:  a fold the BROWSER
 * opened (a `#hash` load reveals `hidden="until-found"` content itself) grows with its transition
 * (`--ui-section-duration`, 300ms) and moves the target a few pixels after the first landing.
 */
const SETTLE_MS = 450

/**
 * A plan doc's folding blocks (`packages/epics`):  its sections, in the outline, the folds and the landing.  Each
 * host has `open` (page state) and `contentsEntry` (`EpicFoldHost`).
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

/** Contents links further than this from the contents column's edges get scrolled into view. */
const TOC_MARGIN = 60

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

/** `localStorage` key of "contents column hidden":  one reader preference for every page. */
const TOC_HIDDEN_KEY = "spell-toc-hidden"

/** Where the contents stop being a column and become a drawer (`spell-doc.css` has the same width). */
const NARROW = "(max-width: 1100px)"

/** The listeners of the last `wireContents()` call:  aborted by the next, so a rebuilt page doesn't double them. */
let contentsWiring = null

/** The listeners of the last `wireFolds()` call, as `contentsWiring`. */
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
  if (outline.sections) wireItemFilters(main)
  const builtToc = !document.getElementById("spell-toc")
  const toc = document.getElementById("spell-toc") ?? buildContents(main, outline, counts)
  const rail = toc ? buildRail(outline, counts) : undefined
  // before the sections first draw, so a saved fold doesn't animate shut
  const folds = wireFolds(main, outline)
  const used = TAGS.filter((tag) => document.querySelector(tag))
  await Promise.all(used.map((tag) => customElements.whenDefined(tag)))
  const sticky = trackStickyHeights(main, outline)
  const follow = toc ? followScroll(main, outline, toc, rail) : undefined
  if (toc) wireContents(main, toc, follow)
  const jump = wireAnchors(main, outline, sticky, follow, folds)
  wirePaging(main)
  wireFilter(main, toc)
  // UI renders its shadow content a little after the definitions:  land once it has
  await nextFrames(2)
  sticky.measure()
  land(landing, jump, follow)
  live.ready({ main, toc, rail, builtToc, sticky, follow, contents: contentsKey(outline, counts) })
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
 * - then the address starts following the scroll;  after a `#hash`, only once the jump has landed:  a target in a
 *   body not loaded yet (a split plan doc's part) lands a moment later, and following before that saw the top of
 *   the page, and wrote the hash away (I3 of `windows-and-review`)
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
 * A plan doc (`epics/<name>/<name>.plan.html`;  before 2026-10-04 `<name>.html`) names its tab `<name>`:  every
 * link to it has `target="<name>"` (`doc-links.js`), so they reuse this tab, as `spell dev plan-doc open <name>` does.
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
 * - NOTE: anything else the runtime (or a page script) adds in `main` should carry `data-spell-added`;  an
 *   unknown extra is stepped around too when its tag doesn't collide with its source siblings' (`liveKids()`)
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
 * Attributes the reader's state lives in (folds, counts, the item filter, `EPIC_PAGE_STATE`):  a patch keeps them
 * (`planAttributes()`).
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
 *   and fires a cancelable `spell-server:change` on `window`, `detail` `{ path, html, etag, reload() }`:  taking it
 *   (`preventDefault()`) stops its reload
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
 *   (`planMorph()`), their page state kept (`EPIC_PAGE_STATE`);  their parts (`<epic-item source>` ...) live the
 *   bodies' life above
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
 * Can this page be patched in place?  `<ui-section>` markup (or a plan doc in `<epic-*>` markup:  its
 * `<epic-page>`), no CHEATSHEET filter, and no script but the bundle, highlight.js, what the page server injects,
 * component packs (`<ui-components source="x.pack.js">`'s script, which only defines elements) and inert data
 * blocks (`isInert()`).
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
 * Hosts whose body comes from a file (`<ui-section source>`, `<ui-accordion source>`;  a plan doc's parts,
 * `epics/<name>/parts/<id>.html`, epic `claude-design` P3, on its `<epic-*>` blocks and items) in step with the files
 * and the page:
 * - a body loads (`ui-load`, the first open or a re-fetch):  the page is re-wired around it (`live.refresh()`):  the
 *   outline (headings inside), contents, counts, item filters, code colors
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
   * - what had the focus inside it, a note box being typed in (`dock()`, which puts the same box back;  an
   *   `<epic-item>`'s, in its shadow root, which the reload may hide for a moment):  focused again, its caret where
   *   it was
   */
  async function reloadBody(host) {
    const anchor = readingAnchor(main)
    const active = host.contains(document.activeElement) ? deepActiveElement() : null
    const caret = active && "selectionStart" in active ? [active.selectionStart, active.selectionEnd] : null
    // the body goes in on the host's `ui-load`, which can come after `reload()` resolves;  the runtime's pieces go
    // back on it (`live.refresh()`):  wait for it (2s at most), then for them
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
 * `plan-parts.js`;  a plan doc's `<epic-*>`:  `part-ids`), when the element isn't in the page yet;  else null.
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
 * - an `<epic-*>` element (`EPIC_TAG`) is NEVER replaced while its tag stays (P10 of `epic-components`):  it keeps
 *   its fold, its loaded part and its controller.  Its attributes are patched in place (its page state kept:
 *   `EPIC_PAGE_STATE`), its children morphed as above;  only where they can't be (text of its own changed, children
 *   that don't line up) are its CHILDREN replaced (`planContent()`), never the element
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
 * Is `live` a section whose body comes from a file (`source`), the same file before and after?  Its body is the
 * file's (`wireSourceBodies()`), not the page source's:  `planHost()`.
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
 * Plan giving `<epic-*>` element `live` the children of `after`, the element itself kept (`planMorph()`):  its source
 * attributes patched, then its children replaced by copies of `after`'s, the reader's state carried over
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
 * - the contents and the rail, rebuilt only when their entries, icons or counts changed (`contentsKey()`)
 * - sticky lines, re-tracked when new sections came in
 * - code colors in what's new;  scroll-follow re-read
 * - then `spell-doc:updated` on `window`, `detail.changed`
 * - `page`:  what `start()` wired (`{ main, toc, rail, builtToc, sticky, follow, contents }`);  updated here
 */
async function rewire(page, changed) {
  const { main } = page
  // a plan doc's blocks take the change in a microtask (Solid batches):  their contents entries read it after
  if (main.querySelector("epic-page")) await nextFrames(1)
  const outline = outlineOf(main)
  const counts = countItems(outline)
  wireItemFilters(main)
  highlightIn(changed)
  const contents = contentsKey(outline, counts)
  if (page.builtToc && page.toc && contents !== page.contents) {
    page.toc = buildContents(main, outline, counts)
    page.rail = buildRail(outline, counts)
    wireContents(main, page.toc, page.follow)
    const head = page.toc.querySelector(":scope > ui-sticky")
    if (head) setOffset(head, siteHeaderHeight())
  }
  page.contents = contents
  if (changed.some((node) => withSelf(node, "ui-section").length)) page.sticky = trackStickyHeights(main, outline)
  if (page.toc) page.follow?.rescan(page.toc, page.rail)
  await nextFrames(UNFOLD_FRAMES)
  page.sticky.measure()
  page.follow?.update()
  dispatchEvent(new CustomEvent("spell-doc:updated", { detail: { changed } }))
}

/** What the contents and the rail are built from, as one string:  entries, labels, icons, open counts. */
function contentsKey(outline, counts) {
  return JSON.stringify([outline.orphans.map(entry), outline.groups.map(entry)])

  /** One entry and its children, with its group's open count. */
  function entry(node) {
    return [node.id, node.label, node.icons, counts.get(node.element)?.open ?? 0, node.children.map(entry)]
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
 * The page's outline, from either markup (see the header):  what the contents, the rail, the counts, scroll-follow
 * and the anchors work from.
 * - SECTIONS markup (`main > ui-section`, or a plan doc's `<epic-page>`):  top-level sections are the groups;
 *   nested sections, and the h3s / h4s in a section's own content (CHEATSHEET cards, sub-sub-items), are their
 *   entries, at any depth.  An h4 right after an h3 of the same section goes under it.  A plan doc's sections are
 *   its folding blocks (`EPIC_FOLDS`:  the Overview and its parts, the sections, the phases).
 * - HEADINGS markup:  h2s are the groups, h3s their entries, h4s under the h3 before them
 * - a node:  `{ element, id, label, icons, glyph, children }` -- `icons` the HTML of its `<ui-icon>`s, `glyph` the
 *   first one's name
 * - returns `{ sections, groups, orphans, targets, entryOf, groupOf, folded }`:
 *   - `orphans`:  entries before or outside any group
 *   - `targets`:  selector of every entry's element, for scroll-follow
 *   - `entryOf(element)`:  the entry holding `element`, which a jump to it makes current
 *   - `groupOf(entry)`:  its top-level element, for the rail
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
    const glyph = entry?.icon
    const color = entry?.color ? ` color="${attr(entry.color)}"` : ""
    const icons = glyph ? `<ui-icon name="${attr(glyph)}"${color}></ui-icon>` : ""
    return { element, id: element.id, label: entry?.label ?? element.id, icons, glyph, children: [] }
  }
  const section = element.localName === "ui-section"
  const label = section ? sectionLabel(element) : labelOf(element)
  if (!element.id) element.id = uniqueId(slug(label) || "section")
  const icons = section
    ? sectionIcon(element)
    : Array.from(element.querySelectorAll("ui-icon"), (icon) => icon.outerHTML).join("")
  const glyph = section
    ? (element.querySelector(':scope > ui-icon[slot="icon"]')?.getAttribute("name") ?? element.getAttribute("icon"))
    : element.querySelector("ui-icon")?.getAttribute("name")
  return { element, id: element.id, label, icons, glyph: glyph || undefined, children: [] }
}

/** A `<ui-section>`'s label:  its `header`, else the text of its `slot="header"` child. */
function sectionLabel(section) {
  const header = section.getAttribute("header")?.trim()
  if (header) return header
  const slotted = section.querySelector(':scope > [slot="header"]')
  return slotted ? labelOf(slotted) : ""
}

/**
 * A `<ui-section>`'s icon as contents HTML:  a copy of its slotted `<ui-icon>` (without `slot`, which would
 * slot it into the contents item's own icon box), else a `<ui-icon>` of its `icon` attribute, else "".
 */
function sectionIcon(section) {
  const slotted = section.querySelector(':scope > [slot="icon"]')
  if (slotted) {
    if (slotted.localName !== "ui-icon") return ""
    const copy = slotted.cloneNode(true)
    copy.removeAttribute("slot")
    return copy.outerHTML
  }
  const name = section.getAttribute("icon")
  return name ? `<ui-icon name="${attr(name)}"></ui-icon>` : ""
}

/** `id`, or `id-2`, `id-3` ... if the page already has it. */
function uniqueId(id) {
  let candidate = id
  for (let n = 2; document.getElementById(candidate); n++) candidate = `${id}-${n}`
  return candidate
}

/**
 * Is `section` folded?  A `<ui-section>`:  its `collapsed` property, else (not upgraded yet) the attribute;  a plan
 * doc's block (or item):  not `open`, by the property, else the attribute.
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
// ## Contents
////////////////

/**
 * Build the contents sidebar from the outline, and return it.
 * - Hand-authored pages never write one:  this is its ONLY source, so it can't drift from the sections.
 * - one accordion pair per group;  inside, runs of leaf entries share a `ui-menu`, an entry with children gets a
 *   nested one-pair accordion
 * - every link carries `data-target` for scroll-follow
 * - an entry's `<ui-icon>`s (e.g. a plan phase's status) are copied in front of its label;  `ui-label` badges
 *   are left out
 * - a group with open items (`counts`) gets their number as a small accent pill after its link
 * - callable again (a page updated in place):  replaces the contents it built before, keeping the drawer open if
 *   it was;  then `wireContents()` again, and `followScroll()` with the new aside
 * - SIDE EFFECT:  inserts the aside after `main`
 */
function buildContents(main, outline, counts) {
  const old = document.querySelector("aside#spell-toc[data-spell-built]")
  const pairs = outline.groups.map(
    (group) =>
      `<ui-title>${link(group)}${badge(counts.get(group.element))}</ui-title>` +
      `<ui-content>${nodes(group.children)}</ui-content>`
  )
  const toc = document.createElement("aside")
  toc.className = "spell-doc-toc"
  if (old?.classList.contains("open")) toc.classList.add("open")
  old?.remove()
  toc.id = "spell-toc"
  toc.dataset.spellBuilt = ""
  toc.setAttribute("aria-label", "Contents")
  toc.innerHTML = `<ui-sticky offset="0"><div class="spell-toc-inner">
<div class="spell-toc-head"><b>Contents</b><div class="spell-toc-tools">
${tool("expand", "angles down", "Expand all", "Open every section of the contents")}
${tool("collapse", "angles up", "Collapse all", "Close every section of the contents")}
${tool("code", "code", "Fold code", "Fold or unfold every code block on the page")}
${tool("hide", "bars", "Hide contents", "Hide the contents:  icons only")}</div></div>
${nodes(outline.orphans)}<ui-accordion class="spell-toc" exclusive="no">${pairs.join("")}</ui-accordion>
</div></ui-sticky>`
  main.after(toc)
  return toc

  /** The pill of a group's open items, or "" when none are open. */
  function badge(count) {
    if (!count?.open) return ""
    return `<span class="spell-toc-count" title="${count.open} open">${count.open}</span>`
  }

  /**
   * A contents button:  round, icon only, named for screen readers, with a tooltip (a `<ui-popup>` right after
   * it targets it).
   */
  function tool(action, icon, label, tip) {
    return (
      `<ui-button data-toc="${action}" circular basic size="tiny" icon="${icon}" aria-label="${label}"></ui-button>` +
      `<ui-popup inverted size="mini" position="bottom center" content="${tip}"></ui-popup>`
    )
  }

  /** Menus for runs of leaf nodes, a nested accordion for each node with children, in order. */
  function nodes(list) {
    const out = []
    let run = []
    for (const node of list) {
      if (!node.children.length) {
        run.push(node)
        continue
      }
      flush()
      out.push(
        `<ui-accordion exclusive="no"><ui-title>${link(node)}</ui-title>` +
          `<ui-content>${nodes(node.children)}</ui-content></ui-accordion>`
      )
    }
    flush()
    return out.join("")

    /** Emit the pending run of leaves as one vertical text menu. */
    function flush() {
      if (!run.length) return
      const items = run.map(
        (node) => `<ui-item href="#${attr(node.id)}" data-target="${attr(node.id)}">${label(node)}</ui-item>`
      )
      out.push(`<ui-menu vertical text fluid>${items.join("")}</ui-menu>`)
      run = []
    }
  }

  /** A title's link to an entry. */
  function link(node) {
    return `<a href="#${attr(node.id)}" data-target="${attr(node.id)}">${label(node)}</a>`
  }

  /** A contents entry's inner HTML:  the entry's icons, then its text. */
  function label(node) {
    return `${node.icons}${text(node.label)}`
  }
}

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
 * - `plan-doc.js` `CLOSED` is the same set
 */
const CLOSED = new Set(["done", "decided", "canceled"])

/**
 * Each top-level section's items -- `[data-status]` elements, not counting ones inside another -- as
 * `{ open, total }`, by the group's element (the `<ui-section>`, or the h2);  "open" is any status but `CLOSED`'s.
 * Sections without items are left out;  nested sections get no count of their own.
 * - the Epics index's epic cards, the goals pages' items
 * - a plan doc's sections count themselves (`<epic-section>`, on their titles):  their count is read from their
 *   hosts' `contentsEntry`, never written
 * - SIDE EFFECT:  writes `open/total` on the section's title:  its `badge` (SECTIONS), or a `ui-label.spell-count`
 *   at the right of the h2 (HEADINGS);  callable again (it replaces both)
 */
function countItems(outline) {
  const counts = new Map()
  for (const { element } of outline.groups) {
    if (element.matches(EPIC_FOLDS)) {
      const count = element.contentsEntry?.count
      if (count) counts.set(element, count)
      continue
    }
    const section = outline.sections ? element : headingSection(element)
    if (!section) continue
    const items = Array.from(section.querySelectorAll("[data-status]")).filter((item) => outermost(item, section))
    if (!items.length) continue
    const open = items.filter((item) => !CLOSED.has(item.dataset.status)).length
    counts.set(element, { open, total: items.length })
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
 * Where an item stands, in the colors Owen reads at a glance (plan doc `review-review`, 1.4 "Item status colors"):
 * `[state, button color, tooltip words]`, in the item filter's order after "all".
 * - for the Epics index's epic cards (`.spell-epics`) and the goals pages' items (`.plan-items`, colored by
 *   `goals.css`);  a plan doc's items color and filter themselves (`<epic-item>`, `<epic-section>`)
 * - `data-state` when the page writes one;  else from the status (`stateOf()`)
 */
const ITEM_STATES = [
  ["progress", "orange", "in progress"],
  ["attention", "red", "needs attention"],
  ["open", "blue", "open, not urgent"],
  ["recent", "green", "decided or reviewed recently"],
  ["old", "grey", "decided or reviewed earlier"]
]

/** The state names, for checking a `data-state`. */
const STATE_NAMES = new Set(ITEM_STATES.map(([state]) => state))

/** The goals pages' items, and the index's epic cards:  what states and the filter apply to. */
const STATE_ITEMS = ":is(.plan-items, .spell-epics) > [data-status]"

/**
 * An item's state:  its `data-state`, else (the index's epic cards, the goals pages' items) from its status:
 * `done` / `decided` are `old`, anything else `open`.
 */
function stateOf(item) {
  const state = item.dataset.state
  if (STATE_NAMES.has(state)) return state
  return CLOSED.has(item.dataset.status) ? "old" : "open"
}

/**
 * An item's id chip's tooltip:  where it stands in words, then its review marks (Owen, 2026-10-04), e.g.
 * "Needs your attention · not reviewed yet", "Decided or reviewed recently · reviewed 2026-10-03".
 */
function stateTip(item) {
  const words = ITEM_STATES.find(([state]) => state === item.dataset.spellState)?.[2] ?? ""
  const parts = [words.charAt(0).toUpperCase() + words.slice(1)]
  const { reviewed, deferred, queued, work, status } = item.dataset
  if (queued) parts.push(`to do:  ${work || "queued"}`)
  if (reviewed) parts.push(`reviewed ${reviewed}`)
  else if (deferred) parts.push(`deferred ${deferred}`)
  else if (status === "open") parts.push("not reviewed yet")
  return parts.join(" · ")
}

/**
 * Mark every item's state as `data-spell-state` (`stateOf()`), so CSS has ONE attribute to color by;  an item's id
 * chip (`.plan-id`, the goals pages') says it in words.
 * - SIDE EFFECT:  sets `data-spell-state`;  callable again (a page updated in place:  a replaced item comes back
 *   without it)
 */
function markItemStates(main) {
  for (const item of main.querySelectorAll(STATE_ITEMS)) {
    item.dataset.spellState = stateOf(item)
    const chip = item.querySelector(".plan-id")
    if (chip) chip.title = stateTip(item)
  }
}

/**
 * The status filter on every top-level `<ui-section>` with a filterable list (the index's `.spell-epics`, a
 * `.plan-items` list, each holding `[data-status]` children):  ONE round button per state the section has items
 * in, used like checkboxes -- filled in its color while its items show, outlined while hidden -- and first a grey
 * filter button that flips between "show all" and "show only what needs you" (red), rather than a useless "none"
 * (Owen, 2026-10-04).
 * - in the title's `actions` slot (`span.spell-item-filter`);  `spell-doc.css` puts it left of the count badge
 * - a filtered list shows "3 hidden · show all" under it (`.spell-hidden-note`):  a click there shows all
 * - the choice:  `data-show="<states shown>"` on the section (none for all), `data-spell-hidden` on the items it
 *   hides (CSS hides them);  remembered per page (`localStorage`, `{ [section id]: [states] }`);  all by default
 * - SIDE EFFECT:  marks the items' states (`markItemStates()`), adds the buttons and notes to the page;  callable
 *   again (it replaces the ones it added)
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
    const has = new Set(lists.flatMap((list) => itemsOf(list).map((item) => item.dataset.spellState)))
    const present = ITEM_STATES.filter(([state]) => has.has(state))
    const group = document.createElement("span")
    group.className = "spell-item-filter"
    group.slot = "actions"
    group.dataset.spellAdded = ""
    const all = stateButton("all", "grey", "")
    all.innerHTML = `<ui-icon name="filter"></ui-icon>`
    group.append(all)
    const buttons = present.map(([state, color, words]) => stateButton(state, color, words))
    group.append(...buttons)
    const notes = lists.map((list) => {
      const note = document.createElement("a")
      note.className = "spell-hidden-note"
      note.href = "#"
      note.dataset.spellAdded = ""
      note.addEventListener("click", (event) => {
        event.preventDefault()
        choose(present.map(([state]) => state))
      })
      list.after(note)
      return note
    })
    const filter = { section, lists, notes, all, buttons, present }
    all.addEventListener("click", () => {
      const showingAll = filterShown(filter).length === present.length
      const red = present.some(([state]) => state === "attention")
      choose(showingAll && red ? ["attention"] : present.map(([state]) => state))
    })
    for (const button of buttons)
      button.addEventListener("click", () => {
        const shown = new Set(filterShown(filter))
        if (shown.has(button.dataset.state)) shown.delete(button.dataset.state)
        else shown.add(button.dataset.state)
        choose([...shown])
      })
    section.append(group)
    const remembered = Array.isArray(saved[section.id]) ? saved[section.id].filter((state) => has.has(state)) : []
    showItems(filter, remembered.length ? remembered : present.map(([state]) => state))

    /** The reader picked the states `shown`:  apply them and remember. */
    function choose(shown) {
      showItems(filter, shown)
      saved[section.id] = shown
      writeJSON(key, saved)
    }
  }

  /** A round state button:  `state`, its UI `color`, its tooltip's `words`. */
  function stateButton(state, color, words) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "spell-state-toggle"
    button.dataset.state = state
    button.dataset.color = color
    if (words) button.title = words
    return button
  }
}

/** The states a filter shows now (`{ buttons }`, see `wireItemFilters()`). */
function filterShown({ buttons }) {
  return buttons
    .filter((button) => button.getAttribute("aria-pressed") === "true")
    .map((button) => button.dataset.state)
}

/**
 * Show the items of the states `shown` in a filter's section (`{ section, lists, notes, all, buttons, present }`):
 * each state button pressed or not, the grey button's tooltip saying what its click does, an "N hidden" note under
 * each list that hides any.
 */
function showItems({ section, lists, notes, all, buttons, present }, shown) {
  const showing = new Set(shown)
  for (const button of buttons) {
    const on = showing.has(button.dataset.state)
    button.setAttribute("aria-pressed", String(on))
    const words = ITEM_STATES.find(([state]) => state === button.dataset.state)?.[2] ?? ""
    button.title = `${on ? "Showing" : "Hiding"}:  ${words}`
  }
  const everything = showing.size >= present.length
  if (everything) delete section.dataset.show
  else section.dataset.show = [...showing].join(" ")
  const red = present.some(([state]) => state === "attention")
  all.title = everything && red ? "Show only what needs you" : "Show everything"
  all.setAttribute("aria-label", all.title)
  all.setAttribute("aria-pressed", String(everything))
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
// ## Rail
////////////////

/**
 * The rail:  a narrow strip at the right edge, the contents button (bars) on top, then one icon per top-level
 * section that jumps to it -- for when the contents column isn't shown (narrow screens, or the reader hid it).
 * - a section's icon is its own `<ui-icon>` (or `icon`);  one without shows its number (`2.`), else its first letter
 * - the section's open items (`counts`) sit on its icon's corner as a small pill, inside the strip
 * - every entry carries its section's label, shown when the rail widens (hover, keyboard focus:  CSS), so no
 *   tooltips
 * - plain elements (`<button>`, `<a>`), not `ui-*`:  the strip is the page's own chrome, every box styled here
 * - CSS decides when it shows, and on very narrow screens hides all but the bars (`spell-doc.css`, "Rail");
 *   scroll-follow marks the current section's entry `selected`, by `data-rail`
 * - callable again (a page updated in place):  replaces the rail it built before;  then `wireContents()` again
 * - SIDE EFFECT:  appends the `<nav>` to the body;  removes a hand-written `.spell-toc-open` (pages before
 *   2026-10-01 had a "Contents" button at the bottom) and the rail built before
 */
function buildRail(outline, counts) {
  for (const old of document.querySelectorAll(".spell-toc-open, nav.spell-rail")) old.remove()
  // HEADINGS:  only the h2s that head a sticky section (an index page's plain h2s get no icon)
  const groups = outline.sections ? outline.groups : outline.groups.filter((group) => headingSection(group.element))
  const entries = groups.map(({ element, id, label, glyph }) => {
    const mark = glyph
      ? `<ui-icon name="${attr(glyph)}"></ui-icon>`
      : `<b>${text((label.match(/^\d+/) ?? [label.charAt(0)])[0])}</b>`
    const count = counts.get(element)
    const badge = count?.open ? `<span class="spell-rail-count" title="${count.open} open">${count.open}</span>` : ""
    return (
      `<a class="spell-rail-item" href="#${attr(id)}" data-rail="${attr(id)}">` +
      `<span class="spell-rail-label">${text(label)}</span><span class="spell-rail-icon">${mark}${badge}</span></a>`
    )
  })
  const rail = document.createElement("nav")
  rail.className = "spell-rail"
  rail.setAttribute("aria-label", "Sections")
  rail.innerHTML =
    `<button type="button" class="spell-toc-open spell-rail-item" aria-label="Contents">` +
    `<span class="spell-rail-label">Contents</span>` +
    `<span class="spell-rail-icon"><ui-icon name="bars"></ui-icon></span></button>` +
    `<div class="spell-rail-items">${entries.join("")}</div>`
  rail.addEventListener("click", (event) => {
    if (event.target.closest?.("a.spell-rail-item")) restRail(rail)
  })
  document.body.append(rail)
  return rail
}

/**
 * A section was picked from the widened rail:  it narrows back at once, though the pointer is still over it (Owen,
 * 2026-10-04:  it stayed open until a click in the page).  `spell-rail-resting` holds it narrow until the pointer
 * leaves;  the focus leaves too (`:focus-within` widens it).
 */
function restRail(rail) {
  rail.classList.add("spell-rail-resting")
  rail.addEventListener("pointerleave", () => rail.classList.remove("spell-rail-resting"), { once: true })
  if (rail.contains(document.activeElement)) document.activeElement.blur()
}

////////////////
// ## Folding
////////////////

/**
 * Every section folds, and the reader's folds are remembered per page (`localStorage`, `{ [id]: folded }`).
 * - SECTIONS:  `<ui-section collapsible>` folds itself;  this restores the saved folds (else the markup's
 *   `collapsed` stands) and saves the reader's toggles (`ui-open` / `ui-close`)
 *   - a PLAN DOC (`body.plan-doc`):  every section and sub-section not in the saved folds starts FOLDED, whatever
 *     its markup says:  Owen opens what he wants to read (2026-10-03).  A link to an id inside still lands
 *     (`reveal()` unfolds around it).  Its `<epic-*>` blocks start folded by themselves;  the ones the reader left
 *     open open again (`restoreEpicFolds()`, before they draw), and their toggles are saved as a section's
 * - HEADINGS:  a chevron button starts each h2 / h3, and a click anywhere on the heading (not on a link or button
 *   in it) toggles it too;  folded:  `section.spell-folded`, all but the heading hidden by CSS.  Starts folded as
 *   saved, else when the section says `data-fold="closed"`.
 * - `reveal()` unfolding for a link is never saved
 * - returns `{ reveal(element) }`:  unfold every section hiding `element` (a plan doc's blocks and items too), and
 *   open its own panel, or itself if it's a folded plan item;  true when it unfolded something (it draws a little
 *   later)
 *   - a `<ui-section>` unfolds WITHOUT its height animation (`--ui-section-duration: 0s` on `main` for a few
 *     frames):  the jump measures the target once it has drawn, and a growing box would move it (scroll
 *     anchoring) after the page has landed
 * - callable again (a page updated in place):  drops the listeners of the call before (`foldWiring`);  a heading
 *   that has its chevron keeps it
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
  }

  /**
   * The reader folded or unfolded a section (accordions' `ui-open` / `ui-close` bubble here too:  not ours).
   * - a `ui-open` that can't be cancelled is the BROWSER's reveal (find-in-page, a `#hash` load):  not saved,
   *   as a link's unfold isn't
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
    // an id INSIDE a closed panel (an old decision's `#d7`, now the answer card in its question):  open the panels
    // around it, or the jump lands on nothing
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
 * A plan doc's blocks the reader left open on this page (saved folds, `spell-folds:<path>`):  open again, before
 * they first draw (their `open` attribute), so nothing animates;  the rest start folded, as the blocks do.
 */
function restoreEpicFolds(main) {
  const saved = readJSON(`${FOLD_KEY_PREFIX}${location.pathname}`)
  for (const block of main.querySelectorAll(EPIC_FOLDS))
    if (block.id && saved[block.id] === false) block.setAttribute("open", "")
}

/**
 * HEADINGS:  fold or unfold `section`:  its class, its chevron (down / right) and the chevron's state for screen
 * readers.
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
 * - also sticks the page header and the contents column just below the site header (their `offset`), and writes
 *   the page header's height as `--spell-head-h` on `main` (the filter bar sticks below it)
 * - NOTE: the `offset`s are from the VIEWPORT top, so they include the site header;  the CSS variables (and so
 *   every `scroll-margin-top`) leave it OUT, as the browser adds it (see "Landing" in the header)
 * - re-measured whenever a title changes size (fonts loading, the window narrowing and titles wrapping)
 * - returns `{ measure, offsetFor }`:  `offsetFor(target)` is how far below the viewport top it should land
 * - callable again (a page updated in place):  disconnects the previous call's observer (`stickyObserver`)
 */
function trackStickyHeights(main, outline) {
  const head = main.querySelector(":scope > ui-sticky.spell-h1")
  const bar = main.querySelector(".spell-filter")
  const contents = document.querySelector(".spell-doc-toc > ui-sticky")
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
    if (contents) setOffset(contents, header)
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
 * A sticky's (top-level section's) `offset`, in whole pixels;  re-setting the same value would restart its
 * observer for nothing.
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
 * the contents follow AT ONCE.
 * - a section lands with its title at its sticky line;  anything else below every stuck title above it (both by
 *   the site header plus their `scroll-margin-top`, "Landing" in the header):  the browser's own jump would add
 *   the stuck titles' scroll padding (they reserve it) on top
 * - HEADINGS:  a STICKY heading's jump goes to its section:  a stuck heading already "is" at the top, so the
 *   browser's own jump to it does nothing -- e.g. the contents link of the section you're reading
 * - folded sections around the target unfold first, and a target that is a folded item opens (`folds.reveal()`);
 *   an unfolded `<ui-section>` draws on the next frames, so the jump lands once it has, and once more after a fold's
 *   transition (`SETTLE_MS`) unless the reader scrolled meanwhile
 * - the target's entry becomes the current one even when the page can't scroll it up to its line (the last
 *   short sections), until the user scrolls on (`follow.pin()`)
 * - `hashchange` / `popstate` (back, forward, a typed hash) jump the same way
 * - in a frame (VS Code's view), the parent's `{ spell: "go", hash }` too:  the view showing the page it already
 *   shows, at an id (`packages/vscode/src/DocView.ts`);  a history entry, as a click's
 * - a jump that moves the address says so (`spell-doc:place`):  `pushState()` fires no `hashchange`
 * - returns `jump(id, { unfoldTarget })`:  `unfoldTarget: false` unfolds only what's AROUND a folded target
 *   section (`land()`:  a reload lands on the section being read as it was, folded or not)
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
  return jump

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
   * Scroll to `id` and make its entry the current one;  once what it unfolded has drawn.  Returns a promise that
   * settles once it has landed (or found nothing to land on).
   * - `id` inside a body not loaded yet (a split plan doc's part:  an Overview `h4`, an old `#d7` answer card):  its
   *   host loads the body first (`hostHolding()`, `load()`), then the jump goes on (caveat C8 of `claude-design`)
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

  /** The `id` a click goes to:  a contents entry's `data-target`, or a same-page `#hash` link. */
  function targetIdOf(event) {
    for (const node of event.composedPath()) {
      if (!(node instanceof Element)) continue
      if (node.dataset?.target) return node.dataset.target
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
 * Viewport top of `element`'s box;  for a host with no box of its own (`display: contents`, e.g. `<ui-item>`), of
 * what it holds.
 */
function topOf(element) {
  if (element.getClientRects().length) return element.getBoundingClientRect().top
  const range = document.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect().top
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
 * - left to the browser:  modifier keys, a key in a field, button, link or a scrolling box of its own (the contents
 *   column, a wide `pre`), an open dialog
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
 * Whether a paging key belongs to the page:  not to a field or a box that scrolls on its own;  Space not to a
 * control either (it presses a button, follows a link).
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
  // a plan doc's page header;  an OPEN item's line sticks below the titles (a closed one's isn't sticky:  skipped)
  for (const page of main.querySelectorAll("epic-page")) boxes.push(page.shadowRoot?.querySelector('[part~="header"]'))
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
// ## Contents:  scroll-follow
////////////////

/**
 * Highlight the current entry's contents link;  open its panels, close panels the scroll opened before.
 * - "Current":  the last entry (section, heading) whose top has reached its landing line (the site header and its
 *   `scroll-margin-top`, plus a little);  entries hidden by the filter or inside a folded section don't count
 * - highlight:  a `<ui-item>` gets `selected`, a title's `<a>` class `active`
 * - panels the user opened or closed (`ui-open` / `ui-close`, only ever the user's) are left alone:
 *   `panel.dataset.user`
 * - the rail's entry of the current entry's top-level section is `selected` too
 * - the ADDRESS follows too, once `followAddress()` has been called (`land()`, after the page has landed):  the
 *   current entry's `#id` replaces the URL's hash (`history.replaceState()`:  no history entry, no jump);  not
 *   while a followed link is pinned (its click set the hash), and no hash above the first entry
 *   - so a reload, or VS Code restarting the view, lands on the section being read
 *   - `replaceState()` fires no `hashchange`:  `spell-doc:place` on `window` tells the live client, which tells
 *     VS Code's view (`liveClient.ts` `reportPlace()`)
 * - returns `{ update, reset, pin, followAddress, rescan }`:
 *   - `reset()` forgets what the scroll opened (after collapse-all)
 *   - `pin(entry)` makes it current until the page scrolls again (a link was followed)
 *   - `rescan(toc, rail)` reads the entries and links again:  the page was updated in place (`rewire()`)
 */
function followScroll(main, outline, toc, rail) {
  let headings = []
  const links = new Map()
  let railItems = []
  let scroller = toc
  let active = null
  let autoOpened = new Set()
  let scheduled = false
  let pinned = null
  let addressing = false
  // the contents' own listeners, dropped when `rescan()` gets a new aside
  let tocWiring = null

  rescan(toc, rail)
  addEventListener("scroll", schedule, { passive: true })
  addEventListener("resize", schedule, { passive: true })
  return { update, reset, pin, followAddress, rescan }

  /** Read the entries, the contents links and the rail's items;  listen to the contents' panels. */
  function rescan(nextToc, nextRail) {
    headings = Array.from(main.querySelectorAll(outline.targets))
    links.clear()
    for (const link of nextToc.querySelectorAll("[data-target]")) links.set(link.dataset.target, link)
    railItems = Array.from(nextRail?.querySelectorAll("[data-rail]") ?? [])
    scroller = nextToc.querySelector(".spell-toc-inner") ?? nextToc
    if (tocWiring && nextToc === toc) return
    tocWiring?.abort()
    tocWiring = new AbortController()
    // the user's own panel changes:  never auto-close those
    nextToc.addEventListener("ui-open", markUser, { signal: tocWiring.signal })
    nextToc.addEventListener("ui-close", markUser, { signal: tocWiring.signal })
    // a new aside:  highlight and open around the current entry again
    if (nextToc !== toc) {
      autoOpened = new Set()
      active = null
    }
    toc = nextToc
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

  /** Find the current heading and highlight it;  a pinned one stays while the page hasn't scrolled. */
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

  /** Move the highlight to `heading`'s link and open the panels leading to it. */
  function setActive(heading) {
    if (!heading || heading === active) return
    highlightLink(links.get(active?.id), false)
    active = heading
    const group = outline.groupOf(heading)
    for (const item of railItems) item.toggleAttribute("selected", item.dataset.rail === group?.id)
    const link = links.get(heading.id)
    if (!link) return
    highlightLink(link, true)
    const chain = panelsAround(link)
    for (const title of autoOpened) if (!chain.includes(title) && !title.dataset.user) setPanel(title, false)
    autoOpened = new Set(chain.filter((title) => !isPanelOpen(title) || autoOpened.has(title)))
    for (const title of chain) if (!isPanelOpen(title)) setPanel(title, true)
    // panels animate open:  scroll once now, once they've settled
    revealLink(link)
    setTimeout(() => revealLink(link), 320)
  }

  /** `heading` is current, wherever it is, until the page scrolls from here. */
  function pin(heading) {
    pinned = { heading, scrollY }
    setActive(heading)
  }

  /** Forget what the scroll opened, and the highlight, so the next update re-opens around the current heading. */
  function reset() {
    autoOpened = new Set()
    highlightLink(links.get(active?.id), false)
    active = null
  }

  /** `ui-open` / `ui-close` bubbled from a contents accordion:  the user (or find-in-page) toggled that panel. */
  function markUser(event) {
    const title = event.detail?.title
    if (title) title.dataset.user = "1"
  }

  /** Keep `link` inside the contents column's visible part, a third of the way down when it must move. */
  function revealLink(link) {
    const box = scroller.getBoundingClientRect()
    const rect = link.getBoundingClientRect()
    if (!rect.height) return
    const top = rect.top - box.top
    if (top < TOC_MARGIN || top > scroller.clientHeight - TOC_MARGIN) {
      scroller.scrollTop += top - scroller.clientHeight / 3
    }
  }
}

/** Select or deselect a contents link:  a `<ui-item>` by `selected`, a title's `<a>` by class `active`. */
function highlightLink(link, on) {
  if (!link) return
  if (link.localName === "ui-item") link.toggleAttribute("selected", on)
  else link.classList.toggle("active", on)
}

/**
 * The panels holding `link`, outermost first, as their `<ui-title>`s:  every `<ui-content>` it's inside (that
 * panel's title is the element before it), plus its own panel when the link IS a title's.
 */
function panelsAround(link) {
  const titles = []
  for (let node = link; node && !node.matches("#spell-toc"); node = node.parentElement) {
    const accordion = node.parentElement
    if (accordion?.localName !== "ui-accordion") continue
    if (node.localName === "ui-title") titles.push(node)
    else if (node.previousElementSibling?.localName === "ui-title") titles.push(node.previousElementSibling)
  }
  return titles.reverse()
}

////////////////
// ## Contents:  buttons and drawer
////////////////

/**
 * expand / collapse every contents panel, fold / unfold every code block, hide the contents, and the
 * narrow-screen drawer.
 * - expand marks every panel the user's (the scroll never closes them);  collapse forgets every mark
 * - hide:  wide screens drop the contents column for the rail (`body.spell-toc-hidden`, remembered for every
 *   page);  narrow ones just close the drawer
 * - the rail's bars button:  narrow screens slide the drawer in or out;  wide ones bring the column back
 * - the drawer closes on a contents link, on Escape, and on a click outside it
 * - callable again (contents or rail rebuilt):  drops the listeners of the call before (`contentsWiring`)
 */
function wireContents(main, toc, follow) {
  contentsWiring?.abort()
  contentsWiring = new AbortController()
  const { signal } = contentsWiring
  const opener = document.querySelector(".spell-toc-open")
  const narrow = matchMedia(NARROW)
  setHidden(readSaved(TOC_HIDDEN_KEY) === "1")
  toc.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("[data-toc]")
      if (button) return onButton(button.dataset.toc)
      if (event.target.closest("[data-target]")) setDrawer(false)
    },
    { signal }
  )
  opener?.addEventListener(
    "click",
    (event) => {
      event.stopPropagation()
      if (narrow.matches) setDrawer(!toc.classList.contains("open"))
      else setHidden(false)
    },
    { signal }
  )
  document.addEventListener(
    "click",
    (event) => {
      if (toc.classList.contains("open") && !event.composedPath().includes(toc)) setDrawer(false)
    },
    { signal }
  )
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && toc.classList.contains("open")) {
        setDrawer(false)
        opener?.focus()
      }
    },
    { signal }
  )
  opener?.setAttribute("aria-controls", toc.id)
  opener?.setAttribute("aria-expanded", String(toc.classList.contains("open")))
  // a page without folding code blocks (the CHEATSHEET's snippets stay bare) has no use for `code`
  const codeButton = toc.querySelector('[data-toc="code"]')
  if (codeButton && !main.querySelector("ui-accordion.spell-code")) {
    codeButton.hidden = true
    // its tooltip too:  the `<ui-popup>` right after it
    if (codeButton.nextElementSibling?.localName === "ui-popup") codeButton.nextElementSibling.hidden = true
  }

  /** One of the contents buttons. */
  function onButton(action) {
    if (action === "code") return toggleCode(main)
    if (action === "hide") return narrow.matches ? setDrawer(false) : setHidden(true)
    const open = action === "expand"
    for (const title of toc.querySelectorAll("ui-accordion > ui-title")) {
      if (open) title.dataset.user = "1"
      else delete title.dataset.user
    }
    for (const accordion of toc.querySelectorAll("ui-accordion")) {
      accordion.open = open
        ? titlesOf(accordion)
            .map((_, index) => index)
            .join(" ")
        : ""
    }
    if (!open) follow?.reset()
  }

  /** Slide the drawer in or out (narrow screens;  wide ones ignore the class). */
  function setDrawer(open) {
    toc.classList.toggle("open", open)
    opener?.setAttribute("aria-expanded", String(open))
  }

  /**
   * Hide or show the contents column (wide screens;  narrow ones ignore the class), and remember it.
   * - SIDE EFFECT:  `localStorage` under `TOC_HIDDEN_KEY`
   */
  function setHidden(hidden) {
    document.body.classList.toggle("spell-toc-hidden", hidden)
    try {
      localStorage.setItem(TOC_HIDDEN_KEY, hidden ? "1" : "")
    } catch {
      // private window:  not remembered
    }
  }
}

/** Unfold every code block if any is folded, else fold them all. */
function toggleCode(main) {
  const blocks = Array.from(main.querySelectorAll("ui-accordion.spell-code"))
  const open = blocks.some((block) => !openIndexes(block).includes(0))
  for (const block of blocks) block.open = open ? "0" : ""
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
 * so do their contents entries.
 * - reads values from the events' `detail`:  during `ui-input` / `ui-change` the element's `value` is still the old one
 * - SIDE EFFECT:  remembers the typed filter (not the badge) in `localStorage` (when the browser allows it), per
 *   page:  under the input's `data-spell-filter` value, or `FILTER_KEY_PREFIX` + the page's path
 */
function wireFilter(main, toc) {
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
  const contents = toc ? filterContents(toc) : undefined
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
   * - while a filter is set, a folded section holding a match unfolds (not saved:  sections start folded, so
   *   matches would hide in them);  clearing the filter folds back the ones it opened
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
    contents?.()
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

/**
 * Contents entries follow the filter:  returns `update()`, which hides every entry whose heading is hidden.
 * - a `<ui-item>` just gets `hidden`
 * - a panel (`<ui-title>` + its `<ui-content>`) is PARKED:  taken out of its accordion, a comment marking its
 *   place.  Why:  `<ui-accordion>` still draws a panel (its arrow) for a hidden title, so hiding isn't enough.
 *   `open` counts panels by index, so each touched accordion's open set is carried over to the new indexes.
 */
function filterContents(toc) {
  const entries = []
  for (const link of toc.querySelectorAll("[data-target]")) {
    const entry = link.localName === "ui-item" ? link : link.closest("ui-title")
    if (entry) entries.push({ id: link.dataset.target, entry })
  }
  const parked = new Map()
  return update

  /** Hide / park what the filter hid, show / unpark what it shows again. */
  function update() {
    const openBefore = new Map()
    for (const { id, entry } of entries) {
      const hidden = !!document.getElementById(id)?.closest("[hidden]")
      if (entry.localName === "ui-item") {
        entry.hidden = hidden
        continue
      }
      if (hidden === parked.has(entry)) continue
      const accordion = parked.get(entry)?.place.parentElement ?? entry.parentElement
      if (!openBefore.has(accordion)) openBefore.set(accordion, titlesOf(accordion).filter(isPanelOpen))
      if (hidden) park(entry)
      else unpark(entry)
    }
    for (const [accordion, open] of openBefore) {
      const titles = titlesOf(accordion)
      accordion.open = open
        .map((title) => titles.indexOf(title))
        .filter((index) => index >= 0)
        .join(" ")
    }
  }

  /** Take `title` and its content out of the accordion, leaving a comment in their place. */
  function park(title) {
    const place = document.createComment(" filtered ")
    const content = title.nextElementSibling?.localName === "ui-title" ? null : title.nextElementSibling
    title.before(place)
    title.remove()
    content?.remove()
    parked.set(title, { place, content })
  }

  /** Put `title` and its content back where they were. */
  function unpark(title) {
    const { place, content } = parked.get(title)
    place.replaceWith(...(content ? [title, content] : [title]))
    parked.delete(title)
  }
}

////////////////
// ## Helpers
////////////////

/** Resolves after `count` animation frames:  long enough for UI's first render after its definitions. */
async function nextFrames(count) {
  for (let left = count; left > 0; left--) await new Promise((resolve) => requestAnimationFrame(resolve))
}
