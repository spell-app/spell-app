/*
 * Shared behaviour for HTML docs in `docs/` -- see "Creating docs" in AGENTS.md.
 * A doc only needs a `<main>` with h1 / h2 / h3 / h4 headings and content;  on load this script:
 * - gives every h2 / h3 / h4 an id (slug of its text) unless it has one
 * - wraps each h2 and h3 with its content in `section.s2` / `section.s3`, so their headers stick and hand off
 * - folds every bare `<pre>` into `details.code` (open when 30 lines or fewer)
 * - builds the contents sidebar:  expandable per section, follows the scroll, a drawer on narrow screens
 * - colors code with highlight.js, when the page loaded it
 * Idempotent:  a doc that already has sections, ids, `details.code` or the sidebar markup keeps them.
 */
;(function () {
  const main = document.querySelector("main")
  if (!main) return

  assignIds()
  wrapSections()
  foldCode()
  const { aside, list, opener } = sidebar()
  const headings = Array.from(main.querySelectorAll("h2[id], h3[id], h4[id]"))
  const linkFor = buildToc()
  trackStickyHeights()
  followScroll()
  wireButtons()
  try {
    globalThis.hljs?.highlightAll()
  } catch (error) {
    // plain monospace is fine
  }

  ////////////////
  // ## Structure
  ////////////////

  /** Slug ids for headings that lack one;  unique within the page. */
  function assignIds() {
    const used = new Set(Array.from(document.querySelectorAll("[id]"), (el) => el.id))
    for (const heading of main.querySelectorAll("h2, h3, h4")) {
      if (heading.id) continue
      const base = slug(labelOf(heading)) || "section"
      let id = base
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`
      used.add(id)
      heading.id = id
    }
  }

  /** Wrap each h2 / h3 and what follows it (up to the next h2 / h3) in `section.s2` / `section.s3`. */
  function wrapSections() {
    if (main.querySelector("section.s2")) return
    let s2 = null
    let s3 = null
    for (const node of Array.from(main.childNodes)) {
      if (node.nodeType === 1 && node.tagName === "H2") {
        s2 = document.createElement("section")
        s2.className = "s2"
        s3 = null
        main.insertBefore(s2, node)
      } else if (node.nodeType === 1 && node.tagName === "H3" && s2) {
        s3 = document.createElement("section")
        s3.className = "s3"
        s2.append(s3)
      }
      ;(s3 ?? s2)?.append(node)
    }
  }

  /** Every `<pre>` not already in a `<details>` becomes a foldable `details.code`. */
  function foldCode() {
    for (const pre of main.querySelectorAll("pre")) {
      if (pre.closest("details")) {
        pre.closest("details").classList.add("code")
        continue
      }
      const lines = pre.textContent.split("\n").length
      const comment = /^\s*\/\/\s*(.+)/.exec(pre.textContent)
      const details = document.createElement("details")
      details.className = "code"
      details.open = lines <= 30
      const summary = document.createElement("summary")
      summary.textContent = `${comment ? comment[1].slice(0, 90) : languageOf(pre)} · ${lines} lines`
      pre.replaceWith(details)
      details.append(summary, pre)
    }
  }

  /** The sidebar and its narrow-screen opener:  reuse the page's markup, or create it. */
  function sidebar() {
    let aside = document.getElementById("toc")
    if (!aside) {
      const page = document.createElement("div")
      page.className = "page"
      main.replaceWith(page)
      page.append(main)
      aside = document.createElement("aside")
      aside.className = "toc"
      aside.id = "toc"
      aside.setAttribute("aria-label", "Contents")
      aside.innerHTML = `
        <div class="toc-head">
          <b>Contents</b>
          <span class="toc-actions">
            <button type="button" data-toc="expand" title="Expand every section">expand</button>
            <button type="button" data-toc="collapse" title="Collapse every section">collapse</button>
            <button type="button" data-toc="code" title="Fold or unfold every code block">code</button>
          </span>
        </div>
        <nav id="toc-list"></nav>`
      page.append(aside)
    }
    let opener = document.querySelector(".toc-open")
    if (!opener) {
      opener = document.createElement("button")
      opener.type = "button"
      opener.className = "toc-open"
      opener.setAttribute("aria-controls", "toc")
      opener.setAttribute("aria-expanded", "false")
      opener.textContent = "Contents"
      document.body.append(opener)
    }
    return { aside, list: aside.querySelector("#toc-list"), opener }
  }

  ////////////////
  // ## Contents
  ////////////////

  /** Nested, expandable list of every h2 / h3 / h4;  returns heading -> link. */
  function buildToc() {
    const links = new Map()
    const root = document.createElement("ol")
    root.className = "l2"
    let l2 = null
    let l3 = null
    for (const heading of headings) {
      const level = Number(heading.tagName[1])
      const link = document.createElement("a")
      link.href = "#" + heading.id
      link.textContent = labelOf(heading)
      links.set(heading, link)
      const item = { li: document.createElement("li"), ol: null }
      item.li.append(link)
      if (level === 2 || !l2) {
        root.append(item.li)
        l2 = item
        l3 = null
      } else {
        const parent = level === 3 || !l3 ? l2 : l3
        parent.ol ??= nest(parent.li, parent === l2 ? "l3" : "l4")
        parent.ol.append(item.li)
        if (level === 3) l3 = item
      }
    }
    list.replaceChildren(root)
    for (const li of list.querySelectorAll("li")) if (!li.querySelector(":scope > details")) li.classList.add("leaf")
    return links
  }

  /** Wrap `li`'s link in a <details> / <summary> with a nested list;  returns the list. */
  function nest(li, className) {
    const details = document.createElement("details")
    const summary = document.createElement("summary")
    summary.append(li.firstChild)
    const ol = document.createElement("ol")
    ol.className = className
    details.append(summary, ol)
    li.append(details)
    return ol
  }

  /** Each section knows its own h2 / h3 height:  h3s stick below their h2, anchors land below both. */
  function trackStickyHeights() {
    const measure = () => {
      for (const section of main.querySelectorAll("section.s2")) {
        const h2 = section.querySelector(":scope > h2")
        if (h2) section.style.setProperty("--h2-h", h2.offsetHeight + "px")
      }
      for (const section of main.querySelectorAll("section.s3")) {
        const h3 = section.querySelector(":scope > h3")
        if (h3) section.style.setProperty("--h3-h", h3.offsetHeight + "px")
      }
    }
    measure()
    new ResizeObserver(measure).observe(main)
  }

  /** Highlight the current heading's link;  open its groups, close groups the scroll opened before. */
  function followScroll() {
    let active = null
    let autoOpened = new Set()
    let scheduled = false
    const onScroll = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        let current = headings[0]
        for (const heading of headings) {
          if (heading.getBoundingClientRect().top <= 110) current = heading
          else break // document order:  the first heading below the line ends the search
        }
        setActive(current)
      })
    }
    addEventListener("scroll", onScroll, { passive: true })
    onScroll()

    function setActive(heading) {
      if (!heading || heading === active) return
      linkFor.get(active)?.classList.remove("active")
      active = heading
      const link = linkFor.get(heading)
      link.classList.add("active")
      const chain = new Set()
      for (let d = link.closest("details"); d; d = d.parentElement.closest("details")) chain.add(d)
      for (const d of autoOpened) if (!chain.has(d) && !d.dataset.user) d.open = false
      autoOpened = new Set([...chain].filter((d) => !d.open || autoOpened.has(d)))
      for (const d of chain) d.open = true
      const top = link.offsetTop - aside.offsetTop
      if (top < aside.scrollTop + 60 || top > aside.scrollTop + aside.clientHeight - 60) {
        aside.scrollTop = top - aside.clientHeight / 3
      }
    }
  }

  /** Expand / collapse all, fold / unfold all code, the narrow-screen drawer. */
  function wireButtons() {
    list.addEventListener("click", (event) => {
      const summary = event.target.closest("summary")
      if (summary && !event.target.closest("a")) summary.parentElement.dataset.user = "1" // never auto-close it
      if (event.target.closest("a")) setDrawer(false)
    })
    aside.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-toc]")
      if (!button) return
      if (button.dataset.toc === "code") {
        const blocks = Array.from(main.querySelectorAll("details.code"))
        const open = blocks.some((block) => !block.open)
        for (const block of blocks) block.open = open
        return
      }
      for (const details of list.querySelectorAll("details")) {
        details.open = button.dataset.toc === "expand"
        details.dataset.user = "1"
      }
    })
    opener.addEventListener("click", () => setDrawer(!aside.classList.contains("open")))

    function setDrawer(open) {
      aside.classList.toggle("open", open)
      opener.setAttribute("aria-expanded", String(open))
    }
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A heading's text for the contents list:  without `.tag` badges, whitespace collapsed. */
  function labelOf(heading) {
    const clone = heading.cloneNode(true)
    for (const tag of clone.querySelectorAll(".tag")) tag.remove()
    return clone.textContent.replace(/\s+/g, " ").trim()
  }

  function slug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48)
  }

  function languageOf(pre) {
    const match = /language-(\w+)/.exec(pre.querySelector("code")?.className ?? "")
    return { ts: "TypeScript", tsx: "TSX", js: "JavaScript", sh: "Shell", json: "JSON" }[match?.[1]] ?? "Code"
  }
})()
