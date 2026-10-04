/*
 * Page behaviour for the `.html` docs.
 * Bundled into `spell-ui.js` (a classic IIFE, beside @spell-app/ui) by `scripts/bundle-spell-ui.js`;  side
 * effects only.  The page's markup is hand-authored;  this only DRIVES it.
 * - Two page markups, read into ONE outline (`outlineOf()`) that everything below works from:
 *   - SECTIONS (every page but the goals pages):  `<ui-section id header sticky collapsible dividing>` in `main`,
 *     nested for sub-sections, `collapsed` to start folded.  The element draws the title, the fold button, the rule
 *     and the stack of stuck titles;  this runtime sets the top-level `offset`s, remembers folds, writes counts.
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
 * - counts:  a top-level section holding `[data-status]` items (plan docs' phases, questions, issues ...) shows
 *   open / all on its title, and the open count as a badge in the contents and the rail;  plan item sections also
 *   get a round filter button stepping through the items' states (`wireItemFilters()`)
 * - plan docs' commits:  a git button in the page header shows or hides them all, a git icon on an item's line
 *   shows its own (`wireCommits()`)
 * - plan docs' review actions, served by the page server:  an ellipsis menu on every item, Revisit notes, "Choose"
 *   on option cards, and the header's "Send to Claude", all saved in the doc's inbox file (`wireReview()`)
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
 * - else the URL's `#hash`, WITHOUT unfolding the target itself:  the address follows the section being read
 *   (`followScroll()`), so a reload (or VS Code restarting) lands on it, folded or not, as the reader left it
 * - else nowhere:  the top
 * - then the address starts following the scroll
 */
function land({ hash, scroll }, jump, follow) {
  if (scroll !== undefined) {
    scrollTo({ top: scroll, behavior: "instant" })
    const landed = scrollY
    setTimeout(() => {
      if (Math.abs(scrollY - landed) < 2) scrollTo({ top: scroll, behavior: "instant" })
    }, SETTLE_MS)
    follow?.update()
  } else if (hash) jump(hash, { unfoldTarget: false })
  else follow?.update()
  follow?.followAddress()
}

/**
 * A plan doc (`epics/<name>/<name>.plan.html`;  before 2026-10-04 `<name>.html`) names its tab `<name>`:  every
 * link to it has `target="<name>"` (`doc-links.js`), so they reuse this tab, as `yarn plan-doc open <name>` does.
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
const ADDED = ".spell-item-filter, .spell-hidden-note, .plan-review, [data-spell-added]"

/**
 * Attributes the reader's state lives in (folds, open panels, counts, the item filter, the phases' Files / Verify
 * toggles):  a patch keeps them (`isKept()`).
 */
const KEPT_ATTRIBUTES = new Set(["collapsed", "open", "badge", "data-show", "data-show-files", "data-show-verify"])

/** Does a patch keep attribute `name` of `element` (the reader's)?  Not a phase's `badge`:  its estimate, from the source. */
function isKept(name, element) {
  return KEPT_ATTRIBUTES.has(name) && !(name === "badge" && element.hasAttribute("data-phase"))
}

/**
 * Elements that manage their children (panels and tabs by index, options):  a change inside replaces the whole
 * element, its open panels carried over (`carryState()`).
 */
const MANAGERS = "ui-accordion, ui-tabs, ui-select, ui-dropdown"

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
 *     highlight.js (it may have built from the markup):  never taken
 *   - stylesheets, scripts or anything outside `main` changed, more than half of `main` changed, the source as
 *     loaded couldn't be read, or the patch threw
 * - returns `{ ready(page) }`:  `start()` hands over what it wired;  a change waits for it
 */
function wireLiveUpdate(main) {
  const server = window.SPELL_SERVER
  let ready = () => {}
  const started = new Promise((resolve) => (ready = resolve))
  if (!server?.readPage || !canPatch(main)) return { ready }
  // the source as loaded:  null when it can't be trusted (the file changed before it was read)
  let base = server.readPage().then(
    ({ html, etag }) => (etag && etag === server.etag ? html : null),
    () => null
  )
  // one update at a time, in order
  let queue = Promise.resolve()
  addEventListener("spell-server:change", (event) => {
    const { html, reload } = event.detail ?? {}
    if (typeof html !== "string" || typeof reload !== "function") return
    event.preventDefault()
    queue = queue.then(() => update(html, reload)).catch(() => reload())
  })
  return { ready }

  /** Patch the page to `html`, then re-wire it;  reload when it can't be patched. */
  async function update(html, reload) {
    const [before, page] = await Promise.all([base, started])
    const patched = before === null ? null : patchPage(page.main, parse(before), parse(html))
    if (!patched) return reload()
    base = Promise.resolve(html)
    await rewire(page, patched.changed)
  }
}

/**
 * Can this page be patched in place?  `<ui-section>` markup, no CHEATSHEET filter, and no script but the bundle,
 * highlight.js and what the page server injects.
 */
function canPatch(main) {
  if (!main.querySelector(":scope > ui-section")) return false
  if (document.querySelector("[data-spell-filter], [data-spell-filter-badge]")) return false
  return Array.from(document.scripts).every((script) => {
    const src = script.getAttribute("src")
    if (!src) return script.textContent.includes("SPELL_SERVER")
    return /^\/_server\//.test(src) || /(^|\/)(spell-ui|highlight(\.min)?)\.js$/.test(src)
  })
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
  if (planMorph(was, now, main, plan) !== main || plan.weight > now.outerHTML.length / 2) return null
  const anchor = readingAnchor(main)
  if (after.title !== before.title) document.title = after.title
  for (const op of plan.ops) op()
  keepAnchor(anchor)
  return plan
}

/** What a page loads:  its stylesheets and scripts (not what the page server injects), one line each. */
function headKey(doc) {
  const parts = Array.from(
    doc.querySelectorAll('link[rel~="stylesheet"]'),
    (link) => `css ${link.getAttribute("href")}`
  )
  for (const script of doc.querySelectorAll("script")) {
    const src = script.getAttribute("src")
    if (src?.startsWith("/_server/") || (!src && script.textContent.includes("SPELL_SERVER"))) continue
    parts.push(src ? `js ${src}` : `inline ${squash(script.textContent)}`)
  }
  return parts.join("\n")
}

/** Everything in a page's `<body>` but `main`'s content and the scripts, whitespace squashed. */
function shellKey(doc) {
  const body = doc.body.cloneNode(true)
  mainIn(body)?.replaceChildren()
  for (const script of body.querySelectorAll("script")) script.remove()
  return squash(body.outerHTML)
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
 * - SIDE EFFECT:  pushes the live changes onto `plan.ops`, and what's new onto `plan.changed`
 */
function planMorph(before, after, live, plan) {
  if (sameNode(before, after)) return live
  if (
    live.localName !== after.localName ||
    before.localName !== after.localName ||
    live.matches(MANAGERS) ||
    hasText(before) ||
    hasText(after)
  )
    return planReplace(after, live, plan)
  const was = Array.from(before.children)
  const kids = liveKids(was, live)
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
    if (!isKept(name, before) && value !== before.getAttribute(name)) changes.push([name, value])
  }
  if (!changes.length) return
  plan.changed.push(live)
  plan.ops.push(() => {
    for (const [name, value] of changes)
      if (value === null) live.removeAttribute(name)
      else live.setAttribute(name, value)
  })
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
 * - typed text:  fields with an `id`
 */
function carryState(live, copy) {
  carryFolds(copy)
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
 * - SECTIONS markup (`main > ui-section` exists):  top-level `<ui-section>`s are the groups;  nested sections, and
 *   the h3s / h4s in a section's own content (CHEATSHEET cards, sub-sub-items), are their entries, at any depth.
 *   An h4 right after an h3 of the same section goes under it.
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
  const sections = !!main.querySelector(":scope > ui-section")
  const groups = []
  const orphans = []
  if (sections) readSections()
  else readHeadings()
  return {
    sections,
    groups,
    orphans,
    targets: sections ? "ui-section[id], h3[id], h4[id]" : "h2[id], h3[id], h4[id]",
    entryOf,
    groupOf,
    folded
  }

  /** SECTIONS:  every `<ui-section>`, h3 and h4 in `main`, under the section it's in. */
  function readSections() {
    const nodes = new Map()
    for (const element of main.querySelectorAll("ui-section, h3, h4")) {
      const node = nodeOf(element)
      nodes.set(element, node)
      const owner = element.parentElement?.closest("ui-section")
      const list = owner ? nodes.get(owner).children : element.localName === "ui-section" ? groups : orphans
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
    if (sections) return element.closest("ui-section, h3, h4")
    if (/^H[234]$/.test(element.tagName)) return element
    return element.closest("section")?.querySelector(":scope > ui-sticky > :is(h2, h3)") ?? null
  }

  /** The top-level element `entry` is in:  the outermost section, or the h2. */
  function groupOf(entry) {
    if (!sections) return entry.localName === "h2" ? entry : entry.closest("section.s2")?.querySelector("h2")
    let top = null
    for (let section = entry.closest("ui-section"); section; section = section.parentElement?.closest("ui-section"))
      top = section
    return top
  }

  /** Is `element` inside a folded `<ui-section>` (not counting itself)? */
  function folded(element) {
    if (!sections) return false
    for (let section = element.parentElement?.closest("ui-section"); section;) {
      if (isCollapsed(section)) return true
      section = section.parentElement?.closest("ui-section")
    }
    return false
  }
}

/** An outline node for a heading or a `<ui-section>`;  gives it an id if it has none. */
function nodeOf(element) {
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

/** Is `section` (a `<ui-section>`) folded?  Its `collapsed` property, else (not upgraded yet) the attribute. */
function isCollapsed(section) {
  return typeof section.collapsed === "boolean" ? section.collapsed : section.hasAttribute("collapsed")
}

/** Fold or unfold a `<ui-section>` without an event:  `collapsed` is controlled, so writing it announces nothing. */
function setCollapsed(section, collapsed) {
  section.toggleAttribute("collapsed", collapsed)
}

/** The shadow title bar of a `<ui-section>` (its public `title` part), once it has rendered. */
function titleOf(section) {
  return section.shadowRoot?.querySelector('[part~="title"]') ?? null
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
 * - plan docs:  phases (`ui-section[data-phase]`), questions, decisions, caveats, todos, issues
 * - SIDE EFFECT:  writes `open/total` on the section's title:  its `badge` (SECTIONS), or a `ui-label.spell-count`
 *   at the right of the h2 (HEADINGS);  callable again (it replaces both)
 */
function countItems(outline) {
  const counts = new Map()
  for (const { element } of outline.groups) {
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
 * - `plan-doc.js` writes `data-state` on every plan item;  docs from before P3 have none (`stateOf()`)
 * - `plan-doc.css` colors an item's id chip by it, and the "To review" line's links
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

/** Plan items, and the index's epic cards:  what states and the filter apply to. */
const STATE_ITEMS = ":is(.plan-items, .spell-epics) > [data-status]"

/**
 * An item's state:  its `data-state`, else (docs from before P3, the index's epic cards) from its status:  `done`
 * / `decided` are `old`, anything else `open`.
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
 * Mark every item's state as `data-spell-state` (`stateOf()`), and every "To review" link
 * (`.plan-to-review a[href^="#"]`) with its item's, so CSS has ONE attribute to color by, old docs included.
 * - SIDE EFFECT:  sets `data-spell-state`;  callable again (a page updated in place:  a replaced item comes back
 *   without it)
 */
function markItemStates(main) {
  for (const item of main.querySelectorAll(STATE_ITEMS)) {
    item.dataset.spellState = stateOf(item)
    const chip = item.querySelector(".plan-id")
    if (chip) chip.title = stateTip(item)
  }
  for (const link of main.querySelectorAll('.plan-to-review a[href^="#"]')) {
    const target = document.getElementById(decodeURIComponent(link.getAttribute("href").slice(1)))
    const item = target?.closest("[data-spell-state]")
    if (item) link.dataset.spellState = item.dataset.spellState
    else delete link.dataset.spellState
  }
}

/**
 * The status filter on every top-level `<ui-section>` with a filterable list (a plan doc's `.plan-items`, the
 * index's `.spell-epics`, each holding `[data-status]` children):  ONE round button per state the section has items
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
 *     (`reveal()` unfolds around it)
 * - HEADINGS:  a chevron button starts each h2 / h3, and a click anywhere on the heading (not on a link or button
 *   in it) toggles it too;  folded:  `section.spell-folded`, all but the heading hidden by CSS.  Starts folded as
 *   saved, else when the section says `data-fold="closed"`.
 * - `reveal()` unfolding for a link is never saved
 * - returns `{ reveal(element) }`:  unfold every section hiding `element`, and open its own panel if it is a
 *   folded item (a plan item's details);  true when it unfolded a `<ui-section>` (it draws a little later)
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
    if (event.defaultPrevented || !event.cancelable || section.localName !== "ui-section" || !section.id) return
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
    const title = section.shadowRoot?.querySelector("[part~=title]")
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
      for (
        let section = self ? element.closest("ui-section") : element.parentElement?.closest("ui-section");
        section;
        section = section.parentElement?.closest("ui-section")
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

  /**
   * How far below the viewport top a target lands:  the site header, then its own `scroll-margin-top` (CSS
   * derives it from the sections).
   */
  function offsetFor(target) {
    return siteHeaderHeight() + (parseFloat(getComputedStyle(target).scrollMarginTop) || 0)
  }
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
    if (!id || !targetIn(id)) return
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
    if (targetIn(id)) go(id)
  }

  /** Scroll to `id` and make its entry the current one;  once what it unfolded has drawn. */
  function jump(id, { unfoldTarget = true } = {}) {
    const target = targetIn(id)
    if (!target) return
    let landed = NaN
    // what a jump unfolds opens at once, without the fold animation, so the page gets there quickly (Owen,
    // 2026-10-04):  `spell-doc.css` zeroes `--ui-section-duration` under `data-spell-jumping`
    const root = document.documentElement
    root.setAttribute("data-spell-jumping", "")
    if (folds.reveal(target, { self: unfoldTarget })) void nextFrames(UNFOLD_FRAMES).then(land)
    else land()
    setTimeout(() => root.removeAttribute("data-spell-jumping"), SETTLE_MS)
    if (outline.sections) setTimeout(() => Math.abs(scrollY - landed) < 2 && land(), SETTLE_MS)

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
  for (const section of main.querySelectorAll("ui-section[sticky]")) boxes.push(titleOf(section))
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
    const header = siteHeaderHeight()
    for (const heading of headings) {
      if (!heading.isConnected) continue // replaced by an in-place update, until `rescan()`
      if (heading.offsetParent === null && !heading.getClientRects().length) continue // hidden by the filter
      if (outline.folded(heading)) continue // laid out in a folded box, but not shown
      const line = header + (parseFloat(getComputedStyle(heading).scrollMarginTop) || 0) + 4
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

  /** Hide what doesn't match. */
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
    for (const section of sections) section.hidden = !section.querySelector("ui-card:not([hidden])")
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
// ## Page chrome
////////////////

/** How long the review line's background flashes after a copy:  `plan-doc.css`'s animation is as long. */
const FLASH_MS = 900

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildChrome, { once: true })
else buildChrome()

/**
 * Chrome the runtime adds to a page whatever its markup's age, so no doc needs migrating for it.
 * - its own start, apart from `start()`:  plain DOM, nothing to wait for
 */
function buildChrome() {
  const main = document.querySelector("main.spell-doc-main") ?? document.querySelector("main")
  if (!main) return
  buildReviewLine(main)
  wireOptions(main)
  wirePhaseToggles(main)
  wireCommits(main)
  void wireTips(main)
  // after the git button:  the send button goes left of it
  void wireReview(main)
  addEventListener("spell-doc:updated", () => {
    wirePhaseToggles(main)
    wireCommits(main)
    void wireTips(main)
  })
}

/** localStorage key prefix of a plan doc's "show commits":  `spell-commits:<path>`, `"1"` while shown. */
const COMMITS_KEY_PREFIX = "spell-commits:"

/**
 * A plan doc's commits (`.plan-commits`:  a phase body's `ui-item`, or a `div` ending an item's details), hidden
 * until asked for (plan doc `review-review`, P3):
 * - a round git button in the page header (`.spell-page-head`, before the step label) shows or hides them all;
 *   pressed = colored;  remembered per page (`localStorage`);  only on a doc that has commits
 * - a small git icon on the line of each item whose details hold commits (`button.plan-git-hint`, in its title's
 *   right-hand extras):  a click opens the item and shows its commits, a second hides them again
 * - the choice:  `data-show-commits` on `main` (all), or on the item (`plan-doc.css` hides the rest)
 * - SIDE EFFECT:  adds the button and the icons (`data-spell-added`);  callable again (a page updated in place):
 *   replaces the ones it added
 */
function wireCommits(main) {
  if (!document.body.classList.contains("plan-doc")) return
  for (const old of main.querySelectorAll(".plan-git-toggle, .plan-git-hint")) old.remove()
  const head = main.querySelector(".spell-page-head")
  if (!head || !main.querySelector(".plan-commits")) return
  const key = `${COMMITS_KEY_PREFIX}${location.pathname}`
  const group = document.createElement("span")
  group.className = "plan-git-toggle"
  group.dataset.spellAdded = ""
  // icon only, as tall as the step label beside it (Owen, 2026-10-04)
  group.innerHTML = `<button type="button" class="plan-git-button"><ui-icon name="git"></ui-icon></button>`
  const button = group.firstElementChild
  button.addEventListener("click", () => show(!main.hasAttribute("data-show-commits")))
  const step = head.querySelector(":scope > .plan-step")
  if (step) step.before(group)
  else head.append(group)
  show(readSaved(key) === "1", false)
  for (const item of main.querySelectorAll(".plan-items > [data-status]")) {
    const title = item.querySelector(":scope > ui-accordion.plan-item > ui-title")
    if (!title || !item.querySelector(":scope > ui-accordion > ui-content .plan-commits")) continue
    const hint = document.createElement("button")
    hint.type = "button"
    hint.className = "plan-git-hint"
    hint.dataset.spellAdded = ""
    hint.title = "Show this item's commits"
    hint.setAttribute("aria-label", hint.title)
    hint.innerHTML = `<ui-icon name="git"></ui-icon>`
    hint.addEventListener("click", (event) => {
      // the line's own click would toggle the panel
      event.preventDefault()
      event.stopPropagation()
      const showing = item.hasAttribute("data-show-commits") && isPanelOpen(title)
      item.toggleAttribute("data-show-commits", !showing)
      if (!showing) setPanel(title, true)
    })
    title.append(hint)
  }

  /** Show (or hide) every commit, press the button to match;  remember it unless `save` is false. */
  function show(on, save = true) {
    main.toggleAttribute("data-show-commits", on)
    button.setAttribute("aria-pressed", String(on))
    const label = on ? "Hide the commits" : "Show the commits"
    button.setAttribute("aria-label", label)
    button.title = label
    if (!save) return
    try {
      localStorage.setItem(key, on ? "1" : "")
    } catch {
      // private mode:  the choice lasts the visit
    }
  }
}

/** The option cards' labels inside plan items:  a click folds or unfolds the card (`wireOptions()`). */
const OPTION_LABEL = ".plan-items ui-grid.spell-pros-cons > ui-column ui-label[attached]"

/**
 * A plan item's option cards (`ui-grid.spell-pros-cons`, A / B / C) fold to their labels;  a click on a label
 * opens or closes that card.  The CHOSEN one (`data-chosen` on its `ui-column`, `plan-doc.js decide --option`)
 * shows open, framed green (Owen, 2026-10-04).
 * - open:  `data-open`;  a chosen card closed by the reader:  `data-shut` (`plan-doc.css` reads both)
 * - one listener on `main`, so cards an in-place update brings in fold too;  wired once
 */
function wireOptions(main) {
  if (main.dataset.spellOptions) return
  main.dataset.spellOptions = ""
  main.addEventListener("click", (event) => {
    const label = event.target.closest?.(OPTION_LABEL)
    if (!label) return
    const column = label.closest("ui-column")
    const open = column.hasAttribute("data-chosen")
      ? !column.hasAttribute("data-shut")
      : column.hasAttribute("data-open")
    if (column.hasAttribute("data-chosen")) column.toggleAttribute("data-shut", open)
    else column.toggleAttribute("data-open", !open)
  })
}

/** localStorage key prefix of a plan doc's Files / Verify toggles:  `spell-phase-fields:<path>`. */
const PHASE_FIELDS_KEY_PREFIX = "spell-phase-fields:"

/** The phases' fields a toggle shows:  the field, its icon (the body item's too), and the button's tooltip. */
const PHASE_TOGGLES = [
  ["files", "folder", "Show each phase's files"],
  ["verify", "flask", "Show how each phase is checked"]
]

/**
 * A plan doc's Phases section (`#phases`):  a bare folder and flask button on its title, showing or hiding every
 * phase's Files and Verify lines, hidden by default (Owen, 2026-10-04).
 * - the choice:  `data-show-files` / `data-show-verify` on `#phases` (`plan-doc.css` hides the lines without
 *   them);  a pressed button is colored;  remembered per page (`localStorage`)
 * - in the title's `actions` slot;  callable again (a page updated in place):  replaces the buttons it added
 */
function wirePhaseToggles(main) {
  const phases = main.querySelector(":scope > ui-section#phases")
  phases?.querySelector(":scope > .plan-phase-toggles")?.remove()
  if (!phases?.querySelector(".plan-phase-body")) return
  const key = `${PHASE_FIELDS_KEY_PREFIX}${location.pathname}`
  const saved = readJSON(key)
  const group = document.createElement("span")
  group.className = "plan-phase-toggles"
  group.slot = "actions"
  group.dataset.spellAdded = ""
  for (const [field, glyph, tip] of PHASE_TOGGLES) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "plan-phase-toggle"
    button.title = tip
    button.setAttribute("aria-label", tip)
    button.innerHTML = `<ui-icon name="${glyph}"></ui-icon>`
    button.addEventListener("click", () => show(field, button, !phases.hasAttribute(`data-show-${field}`)))
    group.append(button)
    show(field, button, !!saved[field], false)
  }
  phases.append(group)

  /** Show (or hide) `field`'s lines, press `button` to match;  remember it unless `save` is false. */
  function show(field, button, on, save = true) {
    phases.toggleAttribute(`data-show-${field}`, on)
    button.setAttribute("aria-pressed", String(on))
    if (!save) return
    saved[field] = on
    writeJSON(key, saved)
  }
}

/**
 * A section's `data-tip` (its intro, moved there by `plan-doc.js` `introsToTips()`) as the tooltip of its title's
 * text:  the `title` of the shadow `[part~=header]`, so hovering the section's body shows nothing.
 * - waits for `<ui-section>` to define and draw;  callable again (a page updated in place)
 */
async function wireTips(main) {
  const sections = main.querySelectorAll("ui-section[data-tip]")
  if (!sections.length) return
  await customElements.whenDefined("ui-section")
  await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))
  for (const section of sections) {
    const header = section.shadowRoot?.querySelector("[part~=header]")
    if (header) header.title = section.dataset.tip
  }
}

/**
 * A plan doc's (`body.plan-doc`) review line, under its page header:  "To review this doc, type `/epic review
 * <name>`".  A click copies the command and flashes the line (`.plan-review-cmd.flash`, `plan-doc.css`).
 * - the epic's name:  the body's `data-plan` (the template sets it), else the doc's folder (`epics/<name>/`)
 * - callable again (a page updated in place):  replaces the line it added
 * - SIDE EFFECT:  inserts the line after the page header (`ui-sticky.spell-h1`), else after the h1
 */
function buildReviewLine(main) {
  if (!document.body.classList.contains("plan-doc")) return
  main.querySelector(":scope > .plan-review-cmd")?.remove()
  const name = document.body.dataset.plan || /\/epics\/([^/]+)\/[^/]+$/.exec(decodeURIComponent(location.pathname))?.[1]
  const anchor = main.querySelector(":scope > ui-sticky.spell-h1") ?? main.querySelector(":scope > h1")
  if (!name || !anchor) return
  const command = `/epic review ${name}`
  const line = document.createElement("button")
  line.type = "button"
  line.className = "plan-review-cmd"
  // added by the runtime, not in the source:  the in-place update leaves it alone ("Live update")
  line.dataset.spellAdded = ""
  line.title = "Copy the command"
  line.innerHTML =
    `<ui-icon name="copy"></ui-icon><span>To review this doc, type <code>${text(command)}</code></span>` +
    `<span class="plan-review-cmd-done" aria-live="polite"></span>`
  line.addEventListener("click", () => void copy())
  anchor.after(line)

  /** Copy the command, then flash the line and say so. */
  async function copy() {
    if (!(await copyText(command))) return
    const done = line.querySelector(".plan-review-cmd-done")
    line.classList.remove("flash")
    void line.offsetWidth // restart the animation on a second click
    line.classList.add("flash")
    done.textContent = "copied"
    setTimeout(() => {
      line.classList.remove("flash")
      done.textContent = ""
    }, FLASH_MS + 600)
  }
}

/**
 * Put `value` on the clipboard;  true when it got there.
 * - the async Clipboard API first;  where it's refused (a webview without the permission), the old
 *   `execCommand("copy")` from a hidden textarea
 */
async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    const area = document.createElement("textarea")
    area.value = value
    area.setAttribute("readonly", "")
    area.style.cssText = "position: fixed; opacity: 0; pointer-events: none"
    document.body.append(area)
    area.select()
    const copied = document.execCommand("copy")
    area.remove()
    return copied
  }
}

////////////////
// ## Review actions
////////////////

/** The review store's routes (`tools/reviewRoutes.ts`):  every reply is the page's whole inbox. */
const REVIEW_API = "/api/review"

/** How often a VISIBLE plan doc re-reads its inbox, so what Claude does to it (P6 of `review-review`) shows. */
const REVIEW_POLL_MS = 4000

/** localStorage key prefix of a plan doc's unsaved Revisit notes:  `spell-revisit:<path>`, `{ [item id]: text }`. */
const REVISIT_KEY_PREFIX = "spell-revisit:"

/** How long a review notice (`notify()`) stays up. */
const NOTICE_MS = 6000

/**
 * What the page says when no Claude session waits on the inbox (plan doc `review-review`, D6):  `listening` null,
 * which the routes also answer once a session's heartbeat stops (`tools/inbox.js` `forPage()`).
 */
const NOBODY_LISTENING = "No Claude session is reviewing this doc:  this waits for the next /epic review"

/**
 * The item menu's actions, in its order:  `[action, UI color, icon, label, what it does]`.
 * - colors:  Owen's (2026-10-04);  violet for "Add to todo" is ours
 * - the menu adds "Clear" under them while the item has a mark
 */
const REVIEW_ACTIONS = [
  ["approve", "green", "check", "Approve", "Fine as it is"],
  ["todo", "violet", "list check", "Add to todo", "Follow it up later, as a todo"],
  ["details", "blue", "magic", "Add Details", "Claude writes a fuller explanation into the item, in the background"],
  ["revisit", "orange", "history", "Revisit", "A note box:  talk it over in the next batch, or now"]
]

/** Every plan item a review mark can go on:  the items of every list, open or closed (not the phases). */
const REVIEW_ITEMS = ".plan-items > [data-status][id]"

/** An item's option cards' labels (`A · ...`), as `wireOptions()` folds them, from the item down. */
const ITEM_OPTION_LABELS = ":scope ui-grid.spell-pros-cons > ui-column ui-label[attached]"

/**
 * Review a plan doc ON the page (plan doc `review-review`, P5):  marks wait in the doc's INBOX FILE
 * (`<name>.inbox.json`, through the page server's `tools/reviewRoutes.ts`) until "Send to Claude" hands them over.
 * - only a plan doc (`body.plan-doc`) served by the page server (`SPELL_SERVER.token`), and only once its inbox
 *   answers:  from `file://`, or a server without the review routes, nothing is added
 * - every item's line ends in a round grey ellipsis (`span.plan-act` > `button.plan-act-button`, at the far right,
 *   `plan-doc.css`):  its menu (`div.plan-act-menu`, a popover in `body`, opening in place) marks it Approve, Add to
 *   todo, Add Details or Revisit, or clears its mark;  the button then takes that action's color, filled while
 *   unsent, outlined once sent
 * - "Add Details" and Revisit's "revisit now" go in the inbox's `now` queue:  a spinner beside the button while the
 *   request waits or Claude works on the item (`working[id]`);  queued with nobody listening, a still dashed ring
 * - Revisit opens a note box under the item's line (`div.plan-revisit`):  a grey check saves it for the next batch
 *   ("revisit soon"), a blue send asks for it now;  the unsaved note survives reloads (`REVISIT_KEY_PREFIX`)
 * - an OPEN item's option cards get a "Choose" pill on their label (`button.plan-choose`):  a click marks that
 *   letter picked (`data-picked` on its `ui-column`, framed orange), a second click clears it
 *   - a pick and a revisit live together ("pick B, but ..."):  the revisit mark carries `pick` (`markWith()`);
 *     choosing keeps the note, writing a revisit keeps the pick, a second click on the chosen pill drops just the
 *     pick, Clear drops both;  the button shows the letter in the revisit's orange
 * - the page header's round paper plane (`button.plan-send`, left of the git button):  grey with nothing to send,
 *   blue with unsent marks, outlined blue once sent while marks wait for Claude
 * - nobody listening (`listening` null:  none, or its heartbeat stopped, as the routes answer it):  the send
 *   button's tooltip and the "now" actions say so (`NOBODY_LISTENING`, decision D6)
 * - re-reads the inbox when the page server says its file changed (`SPELL_SERVER.events`), and every
 *   `REVIEW_POLL_MS` while visible, as a fallback
 * - NOTE: nothing here scrolls the page:  the menu and notices are fixed, focus moves with `preventScroll`
 * - SIDE EFFECT:  adds the controls (`data-spell-added` inside `main`), re-adds what an in-place update dropped
 *   (`spell-doc:updated`)
 */
async function wireReview(main) {
  const server = window.SPELL_SERVER
  if (!document.body.classList.contains("plan-doc") || !server?.token) return
  const page = location.pathname
  const draftsKey = `${REVISIT_KEY_PREFIX}${page}`
  // the inbox as last read or written;  ids with a "now" request in flight;  ids whose note box is open
  let inbox = null
  const asking = new Set()
  const boxes = new Set(Object.keys(readJSON(draftsKey)))
  // writes in flight:  a poll's answer can't overwrite what they're about to
  let writing = 0
  // the button the menu is open on, and the notice's timer
  let menuOwner = null
  let noticeTimer = 0
  if (!(await load())) return
  document.body.classList.add("plan-reviewing")
  const menu = buildMenu()
  const notice = buildNotice()
  decorate()
  addEventListener("spell-doc:updated", decorate)
  setInterval(() => {
    if (document.visibilityState === "visible" && !writing) void load().then((read) => read && render())
  }, REVIEW_POLL_MS)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void load().then((read) => read && render())
  })
  // every inbox write is also a file change the page server announces:  re-read at once (the poll is the fallback)
  const inboxFile = (server.file ?? page).replace(/(?:\.plan)?\.html$/, ".inbox.json")
  if (server.events)
    new EventSource(server.events).addEventListener("change", (event) => {
      if (writing) return
      try {
        if (JSON.parse(event.data).path === inboxFile) void load().then((read) => read && render())
      } catch {
        // not ours
      }
    })

  /** Read the inbox;  true when it answered (a write in flight wins:  its answer is newer). */
  async function load() {
    try {
      const response = await fetch(`${REVIEW_API}/inbox?page=${encodeURIComponent(page)}`, { cache: "no-store" })
      if (!response.ok) return false
      const read = inboxOf(await response.json())
      if (!writing) inbox = read
      return true
    } catch {
      return false
    }
  }

  /**
   * Add what's missing (an in-place update may have replaced an item's line, a label, the page header), then
   * `render()`.  Callable again.
   */
  function decorate() {
    for (const item of main.querySelectorAll(REVIEW_ITEMS)) {
      const line = item.querySelector(":scope > ui-accordion.plan-item > ui-title") ?? item
      if (!line.querySelector(":scope > .plan-act")) line.append(actOf(item))
      const open = !CLOSED.has(item.dataset.status)
      for (const label of item.querySelectorAll(ITEM_OPTION_LABELS)) {
        const pill = label.querySelector(":scope > .plan-choose")
        if (!open) {
          pill?.remove()
          label.closest("ui-column")?.removeAttribute("data-picked")
        } else if (!pill) {
          const letter = /^\s*([A-Z])\b/.exec(label.textContent)?.[1]
          if (letter) label.append(chooseOf(item, letter))
        }
      }
      if (boxes.has(item.id) && !item.querySelector(":scope > .plan-revisit")) item.append(boxOf(item))
    }
    const head = main.querySelector(".spell-page-head")
    if (head && !head.querySelector(":scope > .plan-send")) {
      const before = head.querySelector(":scope > :is(.plan-git-toggle, .plan-step)")
      if (before) before.before(sendOf())
      else head.append(sendOf())
    }
    render()
  }

  /** Show the inbox:  every item's button and spinner, the picked cards, the send button. */
  function render() {
    const { marks, sent, working, now, listening } = inbox
    for (const item of main.querySelectorAll(REVIEW_ITEMS)) {
      const act = item.querySelector(".plan-act")
      if (!act) continue
      const mark = marks[item.id]
      const button = act.querySelector(".plan-act-button")
      const [, color, , label] = REVIEW_ACTIONS.find(([action]) => action === mark?.action) ?? []
      const done = !!mark && isSent(mark, sent)
      if (mark) button.dataset.color = mark.action === "pick" ? "orange" : color
      else delete button.dataset.color
      button.toggleAttribute("data-sent", done)
      // a pick shows its letter:  a plain pick, or a revisit carrying one ("pick B, but ...")
      const letter = act.querySelector(".plan-act-letter")
      letter.textContent = mark?.pick ?? ""
      act.querySelector("ui-icon").hidden = !!mark?.pick
      const revisit = `Revisit ${mark?.when === "now" ? "now" : "soon"}${mark?.note ? `:  "${mark.note}"` : ""}`
      const what =
        mark?.action === "pick"
          ? `Picked ${mark.pick}`
          : mark?.action === "revisit"
            ? `${mark.pick ? `Picked ${mark.pick}, ` : ""}${revisit}`
            : label
      button.title = mark ? `${what}${done ? " · sent" : ""} · click to change` : "Review this item"
      button.setAttribute("aria-label", button.title)
      // Claude at it, or asked and waiting
      const spin = act.querySelector(".plan-act-spin")
      const work = working[item.id]
      const busy = asking.has(item.id) || !!work
      const queued = !busy && !listening && now.some((entry) => entry.id === item.id)
      spin.hidden = !busy && !queued
      spin.toggleAttribute("data-waiting", queued)
      act.toggleAttribute("data-busy", !spin.hidden)
      spin.title = queued
        ? NOBODY_LISTENING
        : (work?.action ?? mark?.action) === "revisit"
          ? "Claude is looking into this..."
          : "Claude is adding details..."
      for (const pill of item.querySelectorAll(".plan-choose")) {
        const picked = !!mark?.pick && mark.pick === pill.dataset.letter
        pill.closest("ui-column")?.toggleAttribute("data-picked", picked)
        pill.setAttribute("aria-pressed", String(picked))
        pill.textContent = picked ? "Chosen" : "Choose"
        pill.title = picked ? `${pill.dataset.letter} is picked:  click to un-pick` : `Pick ${pill.dataset.letter}`
      }
    }
    const send = main.querySelector(".plan-send")
    if (!send) return
    const all = Object.values(marks)
    const unsent = all.filter((mark) => !isSent(mark, sent)).length
    send.dataset.state = unsent ? "unsent" : all.length ? "sent" : "idle"
    const tip = unsent
      ? `Send ${unsent} mark${unsent === 1 ? "" : "s"} to Claude`
      : send.dataset.state === "sent"
        ? "Sent:  waiting for Claude"
        : "Nothing to send:  mark an item first (its ... button)"
    send.title = listening || !all.length ? tip : `${tip}.  ${NOBODY_LISTENING}`
    send.setAttribute("aria-label", tip)
  }

  ////////////////
  // ## Controls
  ////////////////

  /** An item's ellipsis button and the spinner beside it:  `span.plan-act`. */
  function actOf(item) {
    const act = document.createElement("span")
    act.className = "plan-act"
    act.dataset.spellAdded = ""
    act.innerHTML =
      `<span class="plan-act-spin" hidden></span>` +
      `<button type="button" class="plan-act-button" aria-haspopup="menu">` +
      `<ui-icon name="ellipsis"></ui-icon><span class="plan-act-letter"></span></button>`
    const button = act.querySelector("button")
    // open when the press began:  the popover's light dismiss shuts it before this click arrives
    let wasOpen = false
    button.addEventListener("pointerdown", () => (wasOpen = isOpenFor(item)))
    button.addEventListener("click", (event) => {
      // the line's own click would fold the item
      event.preventDefault()
      event.stopPropagation()
      if (wasOpen || isOpenFor(item)) menu.hidePopover()
      else openMenu(item, button, event.detail === 0)
      wasOpen = false
    })
    return act
  }

  /** An option card's "Choose" pill, for `letter`, on its label (the label's own click still folds the card). */
  function chooseOf(item, letter) {
    const pill = document.createElement("button")
    pill.type = "button"
    pill.className = "plan-choose"
    pill.dataset.spellAdded = ""
    pill.dataset.letter = letter
    pill.textContent = "Choose"
    pill.addEventListener("click", (event) => {
      event.preventDefault()
      event.stopPropagation()
      const mark = inbox.marks[item.id]
      void save(item.id, markWith(mark, mark?.pick === letter ? null : letter))
    })
    return pill
  }

  /**
   * `mark` with its pick set to `letter` (`null`:  dropped), as a "Choose" pill click saves it.
   * - a revisit keeps its note:  "pick B, but ...";  one asked NOW turns `soon`, so the pick waits for the send
   *   with it (an immediate mark counts as sent:  Claude would never see the new pick)
   * - anything else (no mark, a plain pick, approve ...) becomes a plain pick, or none
   */
  function markWith(mark, letter) {
    if (mark?.action !== "revisit") return letter ? { action: "pick", pick: letter } : null
    return { action: "revisit", when: "soon", note: mark.note ?? "", ...(letter && { pick: letter }) }
  }

  /**
   * An item's Revisit box:  `div.plan-revisit`, a note and two round buttons stacked at its right, a grey check
   * ("revisit soon") over a blue send ("revisit now").  Its text is saved as typed (`draftsKey`) until a button
   * saves the mark;  Escape closes it, keeping the draft.
   */
  function boxOf(item) {
    const id = item.id
    const box = document.createElement("div")
    box.className = "plan-revisit"
    box.dataset.spellAdded = ""
    box.innerHTML =
      `<textarea class="plan-revisit-note" rows="3" placeholder="Your question or comment"></textarea>` +
      `<span class="plan-revisit-buttons">` +
      `<button type="button" class="plan-revisit-soon"><ui-icon name="check"></ui-icon></button>` +
      `<button type="button" class="plan-revisit-now"><ui-icon name="paper plane"></ui-icon></button></span>`
    const note = box.querySelector("textarea")
    note.setAttribute("aria-label", `Revisit ${id.toUpperCase()}:  your question or comment`)
    note.value = readJSON(draftsKey)[id] ?? inbox.marks[id]?.note ?? ""
    const [soon, now] = box.querySelectorAll("button")
    label(soon, "Revisit soon:  talk it over in the next batch")
    label(now, `Revisit now:  Claude looks into it at once${inbox.listening ? "" : `.  ${NOBODY_LISTENING}`}`)
    note.addEventListener("input", () => {
      const drafts = readJSON(draftsKey)
      if (note.value) drafts[id] = note.value
      else delete drafts[id]
      writeJSON(draftsKey, drafts)
    })
    note.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return
      event.stopPropagation()
      closeBox(item, false)
      item.querySelector(".plan-act-button")?.focus({ preventScroll: true })
    })
    soon.addEventListener("click", () => {
      const text = note.value.trim()
      // a picked question keeps its pick:  "pick B, but ..."
      const pick = inbox.marks[id]?.pick
      closeBox(item, true)
      void save(id, { action: "revisit", when: "soon", note: text, ...(pick && { pick }) })
    })
    now.addEventListener("click", () => {
      const text = note.value.trim()
      closeBox(item, true)
      void askNow(id, "revisit", text)
    })
    return box

    /** Give icon-only `button` its tooltip and label. */
    function label(button, tip) {
      button.title = tip
      button.setAttribute("aria-label", tip)
    }
  }

  /** The page header's "Send to Claude" button:  `button.plan-send`, a round paper plane. */
  function sendOf() {
    const send = document.createElement("button")
    send.type = "button"
    send.className = "plan-send"
    send.dataset.spellAdded = ""
    send.innerHTML = `<ui-icon name="paper plane"></ui-icon>`
    send.addEventListener("click", () => void sendMarks())
    return send
  }

  /** The item menu:  ONE popover in `body`, filled for the item it opens on (`openMenu()`). */
  function buildMenu() {
    const element = document.createElement("div")
    element.className = "plan-act-menu"
    element.popover = "auto"
    element.setAttribute("role", "menu")
    document.body.append(element)
    element.addEventListener("keydown", (event) => {
      const rows = Array.from(element.querySelectorAll("button"))
      const at = rows.indexOf(document.activeElement)
      const step = { ArrowDown: 1, ArrowUp: -1 }[event.key]
      if (!step) return
      event.preventDefault()
      rows[(at + step + rows.length) % rows.length]?.focus({ preventScroll: true })
    })
    element.addEventListener("toggle", (event) => {
      if (event.newState === "open") return
      removeEventListener("scroll", place, true)
      if (element.contains(document.activeElement)) menuOwner?.focus({ preventScroll: true })
    })
    return element
  }

  /** The notice line at the bottom of the window:  what can't be said on the item (D6, a failed write). */
  function buildNotice() {
    const element = document.createElement("div")
    element.className = "plan-review-notice"
    element.setAttribute("role", "status")
    element.hidden = true
    document.body.append(element)
    return element
  }

  ////////////////
  // ## Menu
  ////////////////

  /** Is the menu open on `item`? */
  function isOpenFor(item) {
    return menu.matches(":popover-open") && menu.dataset.item === item.id
  }

  /** Open the menu on `item`, under (or above) `button`, its current mark checked;  `keyboard`:  focus its first row. */
  function openMenu(item, button, keyboard) {
    const mark = inbox.marks[item.id]
    menu.dataset.item = item.id
    menuOwner = button
    menu.replaceChildren()
    for (const [action, color, glyph, label, tip] of REVIEW_ACTIONS) {
      const current = mark?.action === action
      const row = menuRow(color, glyph, label, current && action === "revisit" ? `${tip} (open the note)` : tip)
      row.setAttribute("aria-checked", String(current))
      if (action === "details" && !inbox.listening) row.title = `${tip}.  ${NOBODY_LISTENING}`
      row.addEventListener("click", () => choose(item, action))
      menu.append(row)
    }
    if (mark) {
      const tip =
        mark.action === "revisit" && mark.pick ? "Remove this item's pick and note" : "Remove this item's mark"
      const row = menuRow("grey", "xmark", "Clear", tip)
      row.classList.add("plan-act-clear")
      row.addEventListener("click", () => choose(item, "clear"))
      menu.append(row)
    }
    menu.showPopover()
    place()
    addEventListener("scroll", place, { capture: true, passive: true })
    if (keyboard)
      (menu.querySelector('[aria-checked="true"]') ?? menu.querySelector("button"))?.focus({ preventScroll: true })
  }

  /** One menu row:  a round icon in `color`, then `label`;  `tip` as its tooltip. */
  function menuRow(color, glyph, label, tip) {
    const row = document.createElement("button")
    row.type = "button"
    row.setAttribute("role", "menuitemradio")
    row.dataset.color = color
    row.title = tip
    row.innerHTML = `<span class="plan-act-dot"><ui-icon name="${glyph}"></ui-icon></span><span>${text(label)}</span>`
    return row
  }

  /**
   * Put the open menu under its button, right edges aligned;  above it when there's no room below.  Fixed
   * coordinates in the window:  nothing scrolls.
   */
  function place() {
    const button = menuOwner
    if (!button?.isConnected) return menu.hidePopover()
    const at = button.getBoundingClientRect()
    const { width, height } = menu.getBoundingClientRect()
    const below = at.bottom + 4
    const top = below + height <= innerHeight - 4 ? below : Math.max(4, at.top - height - 4)
    menu.style.top = `${top}px`
    menu.style.left = `${Math.max(4, Math.min(at.right - width, innerWidth - width - 4))}px`
  }

  /** The reader picked `action` in `item`'s menu. */
  function choose(item, action) {
    menu.hidePopover()
    if (action === "clear") {
      closeBox(item, true)
      return void save(item.id, null)
    }
    if (action === "revisit") return openBox(item)
    if (action === "details") return void askNow(item.id, "details")
    void save(item.id, { action })
  }

  ////////////////
  // ## Revisit box
  ////////////////

  /** Open `item`'s Revisit box (or focus it, already open). */
  function openBox(item) {
    boxes.add(item.id)
    let box = item.querySelector(":scope > .plan-revisit")
    if (!box) item.append((box = boxOf(item)))
    box.querySelector("textarea").focus({ preventScroll: true })
  }

  /** Close `item`'s Revisit box;  `saved`:  its draft goes too. */
  function closeBox(item, saved) {
    boxes.delete(item.id)
    item.querySelector(":scope > .plan-revisit")?.remove()
    if (!saved) return
    const drafts = readJSON(draftsKey)
    delete drafts[item.id]
    writeJSON(draftsKey, drafts)
  }

  ////////////////
  // ## Writes
  ////////////////

  /** Mark item `id` (`mark`:  `{ action, ... }`, or null to clear), shown at once, then saved. */
  async function save(id, mark) {
    if (mark) inbox.marks[id] = { ...mark, at: new Date().toISOString() }
    else delete inbox.marks[id]
    render()
    await write("mark", { id, mark })
  }

  /**
   * Ask Claude to act on item `id` NOW (`action`:  `details` | `revisit`):  queued in the inbox's `now`.
   * - a revisit keeps the item's pick (the route does too:  `inbox.js` `requestNow()`)
   */
  async function askNow(id, action, note) {
    const pick = inbox.marks[id]?.pick
    inbox.marks[id] =
      action === "revisit"
        ? { action, when: "now", note: note ?? "", ...(pick && { pick }), at: new Date().toISOString() }
        : { action, at: new Date().toISOString() }
    asking.add(id)
    render()
    const written = await write("now", note === undefined ? { id, action } : { id, action, note })
    asking.delete(id)
    render()
    if (written && !inbox.listening) notify(NOBODY_LISTENING)
  }

  /** "Send to Claude":  every unsent mark goes. */
  async function sendMarks() {
    const unsent = Object.values(inbox.marks).filter((mark) => !isSent(mark, inbox.sent))
    if (!unsent.length)
      return notify(
        Object.keys(inbox.marks).length ? "Sent already:  waiting for Claude" : "Nothing to send:  mark an item first"
      )
    if (!(await write("send", {}))) return
    render()
    notify(inbox.listening ? `Sent ${unsent.length} to Claude` : `Saved.  ${NOBODY_LISTENING}`)
  }

  /**
   * POST `body` (plus `page`) to `route`;  the reply is the new inbox.  True when written;  else says why
   * (`notify()`) and re-reads the inbox, undoing what was shown early.
   */
  async function write(route, body) {
    writing++
    try {
      const response = await fetch(`${REVIEW_API}/${route}`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-server-token": server.token },
        body: JSON.stringify({ page, ...body })
      })
      const reply = await response.json().catch(() => ({}))
      if (response.ok) {
        inbox = inboxOf(reply)
        return true
      }
      if (response.status === 403 && /token/i.test(reply.error ?? ""))
        notify("The page server restarted since this page loaded:  reload the page, then mark again.")
      else notify(reply.error ?? `Couldn't save (${response.status}).`)
    } catch (error) {
      notify(`Couldn't reach the page server (${error.message}).`)
    } finally {
      writing--
    }
    await load()
    render()
    return false
  }

  /** Say `message` at the bottom of the window for a few seconds. */
  function notify(message) {
    notice.textContent = message
    notice.hidden = false
    clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => (notice.hidden = true), NOTICE_MS)
  }
}

/** A route's reply as an inbox, every field there (`tools/inbox.js` has the file's shape). */
function inboxOf(reply) {
  const inbox = reply?.inbox ?? reply ?? {}
  return {
    marks: inbox.marks && typeof inbox.marks === "object" ? inbox.marks : {},
    sent: inbox.sent ?? null,
    now: Array.isArray(inbox.now) ? inbox.now : [],
    working: inbox.working && typeof inbox.working === "object" ? inbox.working : {},
    listening: inbox.listening ?? null
  }
}

/**
 * Has `mark` gone to Claude?  Made before the last "Send to Claude" (`sent`, ISO time or null), or an immediate one
 * (Add Details, revisit now:  handed over when made), as `tools/inbox.js` `unsentMarks()` counts.
 */
function isSent(mark, sent) {
  if (mark.action === "details" || (mark.action === "revisit" && mark.when === "now")) return true
  return !!sent && Date.parse(mark.at) <= Date.parse(sent)
}

////////////////
// ## Helpers
////////////////

/** Resolves after `count` animation frames:  long enough for UI's first render after its definitions. */
async function nextFrames(count) {
  for (let left = count; left > 0; left--) await new Promise((resolve) => requestAnimationFrame(resolve))
}
