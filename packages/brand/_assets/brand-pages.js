/*
 * Brand pages:  the list of Claude Design's pages, the Brand index's tables, and the Compare view.
 * - A CLASSIC script, loaded after the docs bundle (`spell-ui.js`), so it works from `file://` like every page.
 * - ONE list, `PAGES`:  the index's rows and Compare's page menu both come from it.
 * - Each page is `spell-design-system/<name>.dc.html` (Claude Design's original) beside `<name>.spell.html` (its copy
 *   on Spell UI);  a copy not built yet (`built: false`) shows "not yet".
 */
;(function () {
  /**
   * Every top-level page Claude Design made, by kind, in the order the index lists them.
   * - `kind`:  `mockup` (a product screen), `tool` (works on colours or themes), `brand` (marks, art, the index)
   * - `built`:  its `.spell.html` copy exists.  MUST flip to `true` in the change that adds the copy.  Why a flag, not
   *   a `HEAD` request:  works from `file://`, and a 404 logs a console error, which page checks fail on
   */
  const PAGES = [
    {
      name: "Spell App",
      kind: "mockup",
      built: false,
      about: "The builder:  Build with the spell composer and build checklist, Your Apps, Templates, Settings."
    },
    {
      name: "Spell Docs",
      kind: "mockup",
      built: false,
      about: "A docs site:  three columns, tip callout, numbered steps, Spell / Compiled example tabs."
    },
    {
      name: "Spell Marketing",
      kind: "mockup",
      built: false,
      about: "The public site:  hero with “try a spell”, how it works, Spell vs Compiled, call to action."
    },
    {
      name: "Color Palette",
      kind: "tool",
      built: true,
      about: "20 colour sets × 17 steps of chips;  click one to copy it."
    },
    {
      name: "Color Set Chooser",
      kind: "tool",
      built: true,
      about: "An inspector panel that makes a colour ladder from one base colour, with preview and CSS."
    },
    {
      name: "Theme Creator",
      kind: "tool",
      built: true,
      about: "Picks colour sets, type and shape;  writes a Spell UI theme sheet."
    },
    {
      name: "Brand Palette",
      kind: "tool",
      built: true,
      about: "Four candidate purples side by side, with contrast labels and specimens."
    },
    {
      name: "Design System",
      kind: "brand",
      built: false,
      about: "Claude Design's own index:  a card per page, with a live thumbnail."
    },
    {
      name: "Design Guide",
      kind: "brand",
      built: false,
      about: "The brand readme, rendered, with a table of contents."
    },
    { name: "Logo", kind: "brand", built: false, about: "Lockups, the hat mark, app icons, and how not to use them." },
    { name: "Logo Explorations", kind: "brand", built: false, about: "Earlier rounds of the logo." },
    { name: "Flourishes", kind: "brand", built: false, about: "Generated swoops and blobs:  click one for another." },
    {
      name: "Brand Montage",
      kind: "brand",
      built: false,
      about: "One 1600 × 1600 board:  lockup, light and dark app, palette, tiles."
    }
  ]

  /** Folder of the pages, relative to this package's root (`index.html`, `compare.html`). */
  const FOLDER = "spell-design-system/"

  window.BrandPages = { PAGES, href }

  if (document.querySelector("[data-brand-pages]")) fillIndex()
  if (document.querySelector(".brand-compare")) startCompare()

  ////////////////
  // ## Shared
  ////////////////

  /**
   * URL of one page's original (`dc`) or copy (`spell`), relative to the package root.
   * - spaces encoded:  `Brand%20Montage.spell.html`
   */
  function href(name, version) {
    return FOLDER + encodeURIComponent(name) + "." + version + ".html"
  }

  /** Whether a page's `.spell.html` copy exists (`PAGES`, `built`). */
  function built(name) {
    return PAGES.some((page) => page.name === name && page.built)
  }

  ////////////////
  // ## Index
  ////////////////

  /**
   * Fills each `<tbody data-brand-pages="<kind>">` with a row per page of that kind:  name, what it is, and its
   * Original / Spell / Compare links.
   * - SIDE EFFECT:  rows carry `data-spell-added`, so the page server's in-place update steps around them
   */
  function fillIndex() {
    for (const body of document.querySelectorAll("[data-brand-pages]")) {
      const kind = body.getAttribute("data-brand-pages")
      for (const page of PAGES.filter((page) => page.kind === kind)) body.append(row(page))
    }
  }

  /** One index row:  `<tr>` with the page's name, what it is, and its links. */
  function row(page) {
    const tr = document.createElement("tr")
    tr.setAttribute("data-spell-added", "")
    const spell = page.built
      ? `<a href="${href(page.name, "spell")}" target="brand-spell-${slug(page.name)}">Spell</a>`
      : `<ui-label size="mini" basic>not yet</ui-label>`
    tr.innerHTML = `
      <td><b>${page.name}</b></td>
      <td>${page.about}</td>
      <td class="brand-links">
        <a href="${href(page.name, "dc")}" target="brand-dc-${slug(page.name)}">Original</a>
        <span class="brand-spell">${spell}</span>
        <a href="compare.html?page=${encodeURIComponent(page.name)}">Compare</a>
      </td>`
    return tr
  }

  /** Lower-kebab-case of a page name, for link targets:  `Brand Montage` -> `brand-montage`. */
  function slug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  }

  ////////////////
  // ## Compare
  ////////////////

  /**
   * Wires the Compare view:  the page menu, the mode and width buttons, the overlay's opacity, the two frames.
   * - state lives in the address (`?page=...&mode=...&width=...&mix=...`), so a reload or a shared link lands on the
   *   same view
   * - each frame renders the page at the chosen WIDTH, then scales down to fit its pane, so both show the same layout
   * - scrolling one frame scrolls the other (same origin only:  served, not `file://`)
   */
  function startCompare() {
    const root = document.querySelector(".brand-compare")
    const params = new URLSearchParams(location.search)
    const state = {
      page: PAGES.some((page) => page.name === params.get("page")) ? params.get("page") : PAGES[0].name,
      mode: ["side", "overlay", "dc", "spell"].includes(params.get("mode")) ? params.get("mode") : "side",
      width: Number(params.get("width")) || 1280,
      mix: params.has("mix") ? Number(params.get("mix")) : 50
    }
    const frames = {
      dc: root.querySelector(".brand-pane[data-version=dc] iframe"),
      spell: root.querySelector(".brand-pane[data-version=spell] iframe")
    }
    const menu = root.querySelector(".brand-page-menu")
    const mix = root.querySelector(".brand-mix")

    menu.innerHTML = PAGES.map((page) => `<ui-item value="${page.name}">${page.name}</ui-item>`).join("")
    menu.setAttribute("value", state.page)
    menu.addEventListener("ui-change", (event) => update({ page: event.detail.value }))
    for (const button of root.querySelectorAll("[data-mode]")) {
      button.addEventListener("click", () => update({ mode: button.getAttribute("data-mode") }))
    }
    for (const button of root.querySelectorAll("[data-width]")) {
      button.addEventListener("click", () => update({ width: Number(button.getAttribute("data-width")) }))
    }
    mix.setAttribute("value", String(state.mix))
    mix.addEventListener("ui-change", (event) => update({ mix: Number(event.detail.value) }, { reload: false }))
    for (const frame of Object.values(frames)) frame.addEventListener("load", () => syncScroll(frames))
    new ResizeObserver(() => fit(root, state)).observe(root.querySelector(".brand-panes"))

    update({})

    /**
     * Applies a change to the view:  address, buttons, frames.
     * - `reload: false`:  only the overlay mix changed;  the frames keep their pages
     */
    function update(change, { reload = true } = {}) {
      const pageChanged = change.page && change.page !== state.page
      Object.assign(state, change)
      const query = new URLSearchParams({ page: state.page, mode: state.mode, width: String(state.width) })
      if (state.mode === "overlay") query.set("mix", String(state.mix))
      history.replaceState(null, "", "?" + query)
      root.setAttribute("data-mode", state.mode)
      root.style.setProperty("--brand-mix", String(state.mix / 100))
      for (const button of root.querySelectorAll("[data-mode]")) {
        button.toggleAttribute("active", button.getAttribute("data-mode") === state.mode)
      }
      for (const button of root.querySelectorAll("[data-width]")) {
        button.toggleAttribute("active", Number(button.getAttribute("data-width")) === state.width)
      }
      root.querySelector(".brand-open-dc").setAttribute("href", href(state.page, "dc"))
      root.querySelector(".brand-open-spell").setAttribute("href", href(state.page, "spell"))
      document.title = `Compare:  ${state.page}`
      if (reload && (pageChanged || !frames.dc.src)) load(frames, state.page)
      fit(root, state)
    }
  }

  /**
   * Points both frames at a page;  a copy not built yet shows a note in its pane instead.
   */
  function load(frames, name) {
    frames.dc.src = href(name, "dc")
    const ok = built(name)
    frames.spell.closest(".brand-pane").toggleAttribute("data-missing", !ok)
    if (ok) frames.spell.src = href(name, "spell")
    else frames.spell.removeAttribute("src")
  }

  /**
   * Sizes each frame to the chosen width, scaled to fit its pane:  `--brand-scale` on the panes.
   * - never scales UP:  a pane wider than the width shows the page at 100%
   */
  function fit(root, state) {
    for (const pane of root.querySelectorAll(".brand-pane")) {
      const box = pane.querySelector(".brand-frame-box")
      const scale = Math.min(1, box.clientWidth / state.width)
      pane.style.setProperty("--brand-width", state.width + "px")
      pane.style.setProperty("--brand-scale", String(scale))
      pane.style.setProperty("--brand-height", box.clientHeight / scale + "px")
    }
  }

  /**
   * Scrolling either frame scrolls the other to the same place.
   * - same origin only:  from `file://` the frames' documents are out of reach, and this does nothing
   * - `syncing` stops the echo:  the scroll it causes doesn't scroll back
   */
  function syncScroll(frames) {
    const pair = [frames.dc, frames.spell]
    for (const frame of pair) {
      const other = pair.find((each) => each !== frame)
      try {
        const view = frame.contentWindow
        if (!view || view.brandScrollWired) continue
        view.brandScrollWired = true
        view.addEventListener("scroll", () => {
          if (syncScroll.syncing === view) return
          try {
            syncScroll.syncing = other.contentWindow
            other.contentWindow?.scrollTo(view.scrollX, view.scrollY)
            requestAnimationFrame(() => (syncScroll.syncing = null))
          } catch {
            // NOTE:  the other frame isn't reachable (not loaded yet, or another origin)
          }
        })
      } catch {
        // NOTE:  from `file://` the frame's window is another origin:  no scroll sync
      }
    }
  }
})()
