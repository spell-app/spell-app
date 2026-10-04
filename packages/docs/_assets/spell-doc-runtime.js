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
 *   get "Open | All" (`wireItemFilters()`)
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

/** `localStorage` key prefix of a page's item filters (`{ [section id]: "open" | "all" }`), per page. */
const ITEM_FILTER_KEY_PREFIX = "spell-item-filter:"

/** `localStorage` key of "contents column hidden":  one reader preference for every page. */
const TOC_HIDDEN_KEY = "spell-toc-hidden"

/** Where the contents stop being a column and become a drawer (`spell-doc.css` has the same width). */
const NARROW = "(max-width: 1100px)"

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
  highlight()
  const outline = outlineOf(main)
  const counts = countItems(outline)
  if (outline.sections) wireItemFilters(main)
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
  // UI renders its shadow content a little after the definitions:  land on the URL's target once it has
  await nextFrames(2)
  sticky.measure()
  if (location.hash) jump(hashId())
  else follow?.update()
}

/**
 * A plan doc (`epics/<name>/<name>.html`) names its tab `<name>`:  every link to it has `target="<name>"`
 * (`doc-links.py`), so they reuse this tab, as `yarn plan-doc open <name>` does.
 */
function nameTab() {
  const plan = /\/epics\/([^/]+)\/\1\.html$/.exec(decodeURIComponent(location.pathname))
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
 * - a group with open items (`counts`) gets their number as a round badge after its link
 * - SIDE EFFECT:  inserts the aside after `main`
 */
function buildContents(main, outline, counts) {
  const pairs = outline.groups.map(
    (group) =>
      `<ui-title>${link(group)}${badge(counts.get(group.element))}</ui-title>` +
      `<ui-content>${nodes(group.children)}</ui-content>`
  )
  const toc = document.createElement("aside")
  toc.className = "spell-doc-toc"
  toc.id = "spell-toc"
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

  /** The round badge of a group's open items, or "" when none are open. */
  function badge(count) {
    if (!count?.open) return ""
    return `<ui-label class="spell-toc-count" circular size="mini" color="orange" title="${count.open} open">${count.open}</ui-label>`
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
 * Item statuses that DON'T count as open:  finished (`done`), and a plan's decisions in force (`decided`) -- in
 * "Questions & Decisions" only the questions waiting on the reader are open.
 */
const CLOSED = new Set(["done", "decided"])

/**
 * Each top-level section's items -- `[data-status]` elements, not counting ones inside another -- as
 * `{ open, total }`, by the group's element (the `<ui-section>`, or the h2);  "open" is any status but `CLOSED`'s.
 * Sections without items are left out;  nested sections get no count of their own.
 * - plan docs:  phases (`ui-section[data-phase]`), questions, decisions, caveats, todos, issues
 * - SIDE EFFECT:  writes `open/total` on the section's title:  its `badge` (SECTIONS), or a `ui-label.spell-count`
 *   at the right of the h2 (HEADINGS)
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

/**
 * An "Open | All" button group on every top-level `<ui-section>` with plan items (`.plan-items > [data-status]`):
 * Open hides its struck items (`data-status="done"`), All shows them again.
 * - in the title's `actions` slot;  `plan-doc.css` moves it left of the count badge
 * - Open also shows "3 hidden · show all" under the list (`.spell-hidden-note`):  a click there is All's
 * - the choice:  `data-show="open"` on the section (CSS hides);  remembered per page (`localStorage`,
 *   `{ [section id]: "open" | "all" }`);  Open by default, set before the page first draws
 * - SIDE EFFECT:  adds the buttons and the note to the page
 */
function wireItemFilters(main) {
  const key = `${ITEM_FILTER_KEY_PREFIX}${location.pathname}`
  const saved = readJSON(key)
  for (const section of main.querySelectorAll(":scope > ui-section[id]")) {
    const list = section.querySelector(".plan-items")
    if (!list?.querySelector(":scope > [data-status]")) continue
    const group = document.createElement("ui-buttons")
    group.className = "spell-item-filter"
    for (const [name, value] of Object.entries({ slot: "actions", size: "mini", basic: "" }))
      group.setAttribute(name, value)
    const note = document.createElement("a")
    note.className = "spell-hidden-note"
    note.href = "#"
    const filter = { section, list, note, buttons: [] }
    for (const show of ["open", "all"]) {
      const button = document.createElement("ui-button")
      button.dataset.show = show
      button.textContent = show === "open" ? "Open" : "All"
      button.addEventListener("click", () => choose(show))
      group.append(button)
      filter.buttons.push(button)
    }
    note.addEventListener("click", (event) => {
      event.preventDefault()
      choose("all")
    })
    section.append(group)
    list.after(note)
    showItems(filter, saved[section.id] === "all" ? "all" : "open")

    /** The reader picked `show`:  apply it and remember it. */
    function choose(show) {
      showItems(filter, show)
      saved[section.id] = show
      writeJSON(key, saved)
    }
  }
}

/**
 * Show `show`'s items (`"open"` / `"all"`) in a filter's section (`{ section, list, note, buttons }`):  that button
 * pressed, the "N hidden" note under the list while Open hides any.
 */
function showItems({ section, list, note, buttons }, show) {
  if (show === "open") section.dataset.show = "open"
  else delete section.dataset.show
  for (const button of buttons) button.toggleAttribute("active", button.dataset.show === show)
  const hidden = show === "open" ? list.querySelectorAll(':scope > [data-status="done"]').length : 0
  note.hidden = hidden === 0
  note.textContent = `${hidden} hidden · show all`
}

////////////////
// ## Rail
////////////////

/**
 * The rail:  a narrow strip at the right edge, the contents button (bars) on top, then one icon per top-level
 * section that jumps to it -- for when the contents column isn't shown (narrow screens, or the reader hid it).
 * - a section's icon is its own `<ui-icon>` (or `icon`);  one without shows its number (`2.`), else its first letter
 * - the section's open items (`counts`) float on its icon as a small badge
 * - every entry has a tooltip:  its section's label
 * - CSS decides when it shows (`spell-doc.css`, "Rail");  scroll-follow selects the current section's entry
 * - SIDE EFFECT:  appends the `<nav>` to the body;  removes a hand-written `.spell-toc-open` (pages before
 *   2026-10-01 had a "Contents" button at the bottom)
 */
function buildRail(outline, counts) {
  for (const old of document.querySelectorAll(".spell-toc-open")) old.remove()
  // HEADINGS:  only the h2s that head a sticky section (an index page's plain h2s get no icon)
  const groups = outline.sections ? outline.groups : outline.groups.filter((group) => headingSection(group.element))
  const entries = groups.map(({ element, id, label, glyph }) => {
    const mark = glyph ? "" : text((label.match(/^\d+/) ?? [label.charAt(0)])[0])
    const count = counts.get(element)
    const badge = count?.open ? `<ui-label floating circular size="mini" color="orange">${count.open}</ui-label>` : ""
    const icon = glyph ? ` icon="${attr(glyph)}"` : ""
    return (
      `<ui-item href="#${attr(id)}" data-rail="${attr(id)}" aria-label="${attr(label)}"${icon}>` +
      `${mark}${badge}</ui-item>` +
      `<ui-popup inverted size="mini" position="left center" content="${attr(label)}"></ui-popup>`
    )
  })
  const rail = document.createElement("nav")
  rail.className = "spell-rail"
  rail.setAttribute("aria-label", "Sections")
  rail.innerHTML =
    `<ui-button class="spell-toc-open" circular basic icon="bars" aria-label="Contents"></ui-button>` +
    `<ui-popup inverted size="mini" position="left center" content="Contents"></ui-popup>` +
    `<ui-menu class="spell-rail-menu" vertical text>${entries.join("")}</ui-menu>`
  document.body.append(rail)
  return rail
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
 */
function wireFolds(main, outline) {
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
    main.addEventListener("ui-open", onToggle)
    main.addEventListener("ui-close", onToggle)
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
  }

  /** HEADINGS:  a chevron on every h2 / h3 of a sticky section. */
  function wireHeadingFolds() {
    for (const sticky of main.querySelectorAll("section > ui-sticky:is(.spell-h2, .spell-h3)")) {
      const heading = sticky.firstElementChild
      if (!heading?.id) continue
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

  /** Unfold every section around `element`;  open `element`'s own folded panel. */
  function reveal(element) {
    let unfolded = false
    if (outline.sections) {
      for (
        let section = element.closest("ui-section");
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
    const panel = element.querySelector(":scope > ui-accordion > ui-title")
    if (panel && !isPanelOpen(panel)) setPanel(panel, true)
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
 */
function trackStickyHeights(main, outline) {
  const head = main.querySelector(":scope > ui-sticky.spell-h1")
  const bar = main.querySelector(".spell-filter")
  const contents = document.querySelector(".spell-doc-toc > ui-sticky")
  const h2Stickies = outline.sections ? [] : Array.from(main.querySelectorAll("ui-sticky.spell-h2"))
  const h3Stickies = outline.sections ? [] : Array.from(main.querySelectorAll("ui-sticky.spell-h3"))
  const sections = outline.sections ? Array.from(main.querySelectorAll("ui-section")) : []
  const observer = new ResizeObserver(() => measure())
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
 * - returns `jump(id)`
 */
function wireAnchors(main, outline, sticky, follow, folds) {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
    const id = targetIdOf(event)
    if (!id || !targetIn(id)) return
    event.preventDefault()
    if (location.hash !== `#${id}`) history.pushState(null, "", `#${id}`)
    jump(id)
  })
  addEventListener("popstate", () => jump(hashId()))
  addEventListener("hashchange", () => jump(hashId()))
  return jump

  /** Scroll to `id` and make its entry the current one;  once what it unfolded has drawn. */
  function jump(id) {
    const target = targetIn(id)
    if (!target) return
    let landed = NaN
    if (folds.reveal(target)) void nextFrames(UNFOLD_FRAMES).then(land)
    else land()
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
  try {
    return decodeURIComponent(location.hash.slice(1))
  } catch {
    return location.hash.slice(1)
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
 * - returns `{ update, reset, pin }`:
 *   - `reset()` forgets what the scroll opened (after collapse-all)
 *   - `pin(entry)` makes it current until the page scrolls again (a link was followed)
 */
function followScroll(main, outline, toc, rail) {
  const headings = Array.from(main.querySelectorAll(outline.targets))
  const links = new Map()
  for (const link of toc.querySelectorAll("[data-target]")) links.set(link.dataset.target, link)
  const railItems = Array.from(rail?.querySelectorAll("[data-rail]") ?? [])
  const scroller = toc.querySelector(".spell-toc-inner") ?? toc
  let active = null
  let autoOpened = new Set()
  let scheduled = false
  let pinned = null

  addEventListener("scroll", schedule, { passive: true })
  addEventListener("resize", schedule, { passive: true })
  // the user's own panel changes:  never auto-close those
  toc.addEventListener("ui-open", markUser)
  toc.addEventListener("ui-close", markUser)
  return { update, reset, pin }

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
    const header = siteHeaderHeight()
    for (const heading of headings) {
      if (heading.offsetParent === null && !heading.getClientRects().length) continue // hidden by the filter
      if (outline.folded(heading)) continue // laid out in a folded box, but not shown
      const line = header + (parseFloat(getComputedStyle(heading).scrollMarginTop) || 0) + 4
      if (heading.getBoundingClientRect().top <= line) current = heading
      else break // document order:  the first heading below its line ends the search
    }
    setActive(current)
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
 */
function wireContents(main, toc, follow) {
  const opener = document.querySelector(".spell-toc-open")
  const narrow = matchMedia(NARROW)
  setHidden(readSaved(TOC_HIDDEN_KEY) === "1")
  toc.addEventListener("click", (event) => {
    const button = event.target.closest("[data-toc]")
    if (button) return onButton(button.dataset.toc)
    if (event.target.closest("[data-target]")) setDrawer(false)
  })
  opener?.addEventListener("click", (event) => {
    event.stopPropagation()
    if (narrow.matches) setDrawer(!toc.classList.contains("open"))
    else setHidden(false)
  })
  document.addEventListener("click", (event) => {
    if (toc.classList.contains("open") && !event.composedPath().includes(toc)) setDrawer(false)
  })
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toc.classList.contains("open")) {
      setDrawer(false)
      opener?.focus()
    }
  })
  opener?.setAttribute("aria-controls", toc.id)
  opener?.setAttribute("aria-expanded", "false")
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
// ## Helpers
////////////////

/** Resolves after `count` animation frames:  long enough for UI's first render after its definitions. */
async function nextFrames(count) {
  for (let left = count; left > 0; left--) await new Promise((resolve) => requestAnimationFrame(resolve))
}
