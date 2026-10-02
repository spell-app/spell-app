/*
 * Page behaviour for the `.html` docs.
 * Bundled into `spell-ui.js` (a classic IIFE, beside @spell-app/ui) by `scripts/bundle-spell-ui.js`;  side
 * effects only.  The page's markup is hand-authored;  this only DRIVES it:
 * - contents sidebar:  built from `main`'s h2 / h3 / h4 when the page has no `#spell-toc` (`buildContents()`)
 * - sticky headers:  each h3 `<ui-sticky>` sticks just below its section's h2 (`offset`, re-measured on resize);
 *   the sections carry `--spell-h2-h` / `--spell-h3-h` so anchors land below both
 * - everything that sticks or lands at the top starts BELOW the fixed site header (`<spell-site-header>`,
 *   `siteHeaderHeight()`)
 * - scroll-follow:  the current heading's contents link is highlighted and its panels open;  panels the scroll
 *   opened close again, panels the USER opened stay open
 * - the contents buttons (expand / collapse / code), the narrow-screen drawer, the CHEATSHEET card filters
 * - highlight.js, when the page loaded it
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
  "ui-icon"
]

/** Contents links further than this from the contents column's edges get scrolled into view. */
const TOC_MARGIN = 60

/**
 * `localStorage` key prefix of a page's card filter, unless its input names a key (`data-spell-filter="..."`).
 * - per page:  every `file://` page shares one origin, so one key would leak a filter between cheat sheets
 */
const FILTER_KEY_PREFIX = "spell-filter:"

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
  const toc = document.getElementById("spell-toc") ?? buildContents(main)
  const used = TAGS.filter((tag) => document.querySelector(tag))
  await Promise.all(used.map((tag) => customElements.whenDefined(tag)))
  const sticky = trackStickyHeights(main)
  const follow = toc ? followScroll(main, toc) : undefined
  if (toc) wireContents(main, toc, follow)
  const jump = wireAnchors(main, sticky, follow)
  wireFilter(main, toc)
  // UI renders its shadow content a little after the definitions:  land on the URL's heading once it has
  await nextFrames(2)
  sticky.measure()
  if (location.hash) jump(hashId())
  else follow?.update()
}

/**
 * A plan doc (`plans/<name>/<name>.html`) names its tab `<name>`:  every link to it has `target="<name>"`
 * (`doc-links.py`), so they reuse this tab, as `yarn plan-doc open <name>` does.
 */
function nameTab() {
  const plan = /\/plans\/([^/]+)\/\1\.html$/.exec(decodeURIComponent(location.pathname))
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
// ## Contents
////////////////

/**
 * Build the contents sidebar from `main`'s h2 / h3 / h4, in document order, and return it.
 * - Hand-authored pages never write one:  this is its ONLY source, so it can't drift from the headings.
 * - one accordion pair per h2;  inside, runs of leaf h3s (and h4s straight under the h2) share a `ui-menu`,
 *   an h3 with h4s gets a nested one-pair accordion
 * - every link carries `data-target` for scroll-follow
 * - a heading's `<ui-icon>`s (e.g. a plan phase's status) are copied in front of its label;  `ui-label` badges
 *   are left out
 * - SIDE EFFECT:  gives a heading with no `id` a slug of its label (`-2`, `-3` ... when taken);  inserts the
 *   aside after `main`, and the narrow-screen `.spell-toc-open` button if the page has none
 */
function buildContents(main) {
  const groups = []
  const orphans = []
  for (const heading of main.querySelectorAll("h2, h3, h4")) {
    if (!heading.id) heading.id = uniqueId(slug(labelOf(heading)) || "section")
    const group = groups.at(-1)
    if (heading.localName === "h2") groups.push({ heading, children: [] })
    else if (heading.localName === "h3") (group?.children ?? orphans).push({ heading, children: [] })
    else {
      const parent = group?.children.at(-1)
      if (parent?.heading.localName === "h3") parent.children.push({ heading, children: [] })
      else (group?.children ?? orphans).push({ heading, children: [] })
    }
  }
  const pairs = groups.map(
    (group) => `<ui-title>${link(group.heading)}</ui-title><ui-content>${nodes(group.children)}</ui-content>`
  )
  const toc = document.createElement("aside")
  toc.className = "spell-doc-toc"
  toc.id = "spell-toc"
  toc.setAttribute("aria-label", "Contents")
  toc.innerHTML = `<ui-sticky offset="0"><div class="spell-toc-inner">
<div class="spell-toc-head"><b>Contents</b><div class="spell-toc-tools">
${tool("expand", "angles down", "Expand all", "Open every section of the contents")}
${tool("collapse", "angles up", "Collapse all", "Close every section of the contents")}
${tool("code", "code", "Fold code", "Fold or unfold every code block on the page")}</div></div>
${nodes(orphans)}<ui-accordion class="spell-toc" exclusive="no">${pairs.join("")}</ui-accordion>
</div></ui-sticky>`
  main.after(toc)
  if (!document.querySelector(".spell-toc-open")) {
    const opener = document.createElement("ui-button")
    opener.className = "spell-toc-open"
    opener.setAttribute("size", "small")
    opener.textContent = "Contents"
    document.body.append(opener)
  }
  return toc

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
        `<ui-accordion exclusive="no"><ui-title>${link(node.heading)}</ui-title>` +
          `<ui-content>${nodes(node.children)}</ui-content></ui-accordion>`
      )
    }
    flush()
    return out.join("")

    /** Emit the pending run of leaves as one vertical text menu. */
    function flush() {
      if (!run.length) return
      const items = run.map(
        ({ heading }) =>
          `<ui-item href="#${attr(heading.id)}" data-target="${attr(heading.id)}">${label(heading)}</ui-item>`
      )
      out.push(`<ui-menu vertical text fluid>${items.join("")}</ui-menu>`)
      run = []
    }
  }

  /** A title's link to a heading. */
  function link(heading) {
    return `<a href="#${attr(heading.id)}" data-target="${attr(heading.id)}">${label(heading)}</a>`
  }

  /** A contents entry's inner HTML:  the heading's icons, then its text. */
  function label(heading) {
    const icons = Array.from(heading.querySelectorAll("ui-icon"), (icon) => icon.outerHTML).join("")
    return `${icons}${text(labelOf(heading))}`
  }

  /** `id`, or `id-2`, `id-3` ... if the page already has it. */
  function uniqueId(id) {
    let candidate = id
    for (let n = 2; document.getElementById(candidate); n++) candidate = `${id}-${n}`
    return candidate
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
// ## Sticky headers
////////////////

/**
 * Each h2 / h3 `<ui-sticky>` sticks within its parent (the section):  h2s below whatever sticks above every
 * section (the site header, then the CHEATSHEET's filter bar, `.spell-filter`), h3s just below their section's h2.
 * - SIDE EFFECT:  sets each sticky's `offset` (the contents' too:  just below the site header), `--spell-top` on
 *   `main` and `--spell-h2-h` / `--spell-h3-h` on the sections, which the headings' `scroll-margin-top` reads
 *   (`spell-doc.css`)
 * - NOTE: `--spell-top` and `scroll-margin-top` leave the site header OUT:  the header's own `scroll-padding-top`
 *   on `:root` adds it to the browser's jumps, so it's added here only where we measure from the viewport top
 * - re-measured whenever a heading changes size (fonts loading, the window narrowing and titles wrapping)
 * - returns `{ measure, offsetFor }`:  `offsetFor(heading)` is how far below the viewport top it should land
 */
function trackStickyHeights(main) {
  const h2Stickies = Array.from(main.querySelectorAll("ui-sticky.spell-h2"))
  const h3Stickies = Array.from(main.querySelectorAll("ui-sticky.spell-h3"))
  const bar = main.querySelector(".spell-filter")
  const contents = document.querySelector(".spell-doc-toc > ui-sticky")
  const observer = new ResizeObserver(() => measure())
  for (const sticky of [...h2Stickies, ...h3Stickies]) {
    const heading = sticky.firstElementChild
    if (heading) observer.observe(heading)
  }
  if (bar) observer.observe(bar)
  measure()
  return { measure, offsetFor }

  /** Heights of the bar and every h2 / h3 onto `main` and their sections;  each sticky's `offset` from them. */
  function measure() {
    const header = siteHeaderHeight()
    const top = bar ? bar.getBoundingClientRect().height : 0
    main.style.setProperty("--spell-top", `${top}px`)
    if (contents) setOffset(contents, header)
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
   * How far below the viewport top a heading lands:  the site header, then its own `scroll-margin-top` (CSS
   * derives it from the sections).
   */
  function offsetFor(heading) {
    return siteHeaderHeight() + (parseFloat(getComputedStyle(heading).scrollMarginTop) || 0)
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

/** A sticky's `offset`, in whole pixels;  re-setting the same value would restart its observer for nothing. */
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
 * Same-page links to a heading in `main` jump there ourselves, and the contents follow AT ONCE.
 * - a STICKY heading's jump goes to its section:  a stuck heading already "is" at the top, so the browser's own
 *   jump to it does nothing -- e.g. the contents link of the section you're reading
 * - other targets land by their `scroll-margin-top`, as the browser would
 * - the target becomes the current heading even when the page can't scroll it up to its line (the last short
 *   sections), until the user scrolls on (`follow.pin()`)
 * - `hashchange` / `popstate` (back, forward, a typed hash) jump the same way
 * - returns `jump(id)`
 */
function wireAnchors(main, sticky, follow) {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
    const id = targetIdOf(event)
    if (!id || !headingIn(id)) return
    event.preventDefault()
    if (location.hash !== `#${id}`) history.pushState(null, "", `#${id}`)
    jump(id)
  })
  addEventListener("popstate", () => jump(hashId()))
  addEventListener("hashchange", () => jump(hashId()))
  return jump

  /** Scroll to heading `id` and make it the current one. */
  function jump(id) {
    const heading = headingIn(id)
    if (!heading) return
    scrollToId(id, sticky)
    follow?.pin(heading)
  }

  /** The heading `id` a click goes to:  a contents entry's `data-target`, or a same-page `#hash` link. */
  function targetIdOf(event) {
    for (const node of event.composedPath()) {
      if (!(node instanceof Element)) continue
      if (node.dataset?.target) return node.dataset.target
      const href = node.getAttribute("href")
      if (node.localName === "a" && href?.startsWith("#") && href.length > 1) return decodeURIComponent(href.slice(1))
    }
    return undefined
  }

  /** The h2 / h3 / h4 with `id` in `main`, if any. */
  function headingIn(id) {
    const element = id ? document.getElementById(id) : null
    return element && main.contains(element) && /^H[234]$/.test(element.tagName) ? element : null
  }
}

/**
 * Scroll so heading `id` sits where its anchor should:  a sticky heading at the top of its SECTION (it can't be
 * measured where it is while stuck), anything else by its own box.  Instant, as the browser's own jump.
 */
function scrollToId(id, sticky) {
  const element = document.getElementById(id)
  if (!element) return
  const stuck = element.parentElement?.localName === "ui-sticky"
  const box = stuck ? element.parentElement.parentElement : element
  const top = box.getBoundingClientRect().top + scrollY - sticky.offsetFor(element)
  scrollTo({ top: Math.max(0, top), behavior: "instant" })
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
 * Highlight the current heading's contents link;  open its panels, close panels the scroll opened before.
 * - "Current":  the last heading whose top has reached its landing line (the site header and its
 *   `scroll-margin-top`, plus a little)
 * - highlight:  a `<ui-item>` gets `selected`, a title's `<a>` class `active`
 * - panels the user opened or closed (`ui-open` / `ui-close`, only ever the user's) are left alone:
 *   `panel.dataset.user`
 * - returns `{ update, reset, pin }`:
 *   - `reset()` forgets what the scroll opened (after collapse-all)
 *   - `pin(heading)` makes it current until the page scrolls again (a link was followed)
 */
function followScroll(main, toc) {
  const headings = Array.from(main.querySelectorAll("h2[id], h3[id], h4[id]"))
  const links = new Map()
  for (const link of toc.querySelectorAll("[data-target]")) links.set(link.dataset.target, link)
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
 * expand / collapse every contents panel, fold / unfold every code block, and the narrow-screen drawer.
 * - expand marks every panel the user's (the scroll never closes them);  collapse forgets every mark
 * - the drawer closes on a contents link, on Escape, and on a click outside it
 */
function wireContents(main, toc, follow) {
  const opener = document.querySelector(".spell-toc-open")
  toc.addEventListener("click", (event) => {
    const button = event.target.closest("[data-toc]")
    if (button) return onButton(button.dataset.toc)
    if (event.target.closest("[data-target]")) setDrawer(false)
  })
  opener?.addEventListener("click", (event) => {
    event.stopPropagation()
    setDrawer(!toc.classList.contains("open"))
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
  const sections = Array.from(main.querySelectorAll("section")).filter((section) => section.querySelector("ui-card"))
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
