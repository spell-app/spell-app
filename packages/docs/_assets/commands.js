/*
 * Command reference pages (`templates/commands.html`, e.g. `dev/commands/commands.html`):  draws the page's tables
 * from the JSON beside it, then boots the docs bundle.
 * - Loaded INSTEAD of `spell-ui.js`:  the runtime builds the contents sidebar, the rail and the sticky titles from
 *   `main`'s sections once, at start, so the families must be in the page before it runs.  This script fetches,
 *   draws, then adds `spell-ui.js` (same folder), whatever happened.
 * - The data:  `<page>.json` (`body[data-commands]` overrides), fetched, so the page needs the PAGE SERVER
 *   (`yarn docs:open <page>`);  from `file://` it shows a notice where the tables go.
 * - JSON:  `{ families: [{ id, title, icon?, intro?, rows: [Row] }] }` (a family `id` shares the page's id space:  never
 *   reuse a hand-written section's);  `Row`:
 *   - `op` -- the operation, in words;  `id?` -- anchor, default `<family id>-<slug of op>`
 *   - `cli`, `skill`, `yarn` -- `{ mark, names?, note? }`:  `mark` one of `same` (✓, under the shared name),
 *     `other` (≈, another name), `could` (○, doesn't but could), `no` (—, couldn't really);  `names` the commands:
 *     `spell compile`, `/epic`, `<package> <script>` (`root plan-doc`, `ui gen:icons`)
 *   - `runs` -- the tool doing the work (`scripts/window.mjs`, `status.py`, `prose`);  `target`, `notes` -- text
 *   - in `target`, a roadmap id in parens, `(R3)`, links to `#r3`:  the page's roadmap rows carry those ids
 *   - text fields:  `` `code` `` becomes `<code>`;  everything else is escaped
 * - Placeholders the template holds, all optional:  `[data-commands-families]` (the families go in it, as nested
 *   `<ui-section>`s numbered after its parent section), `[data-commands-stats]` (a `ui-statistics`),
 *   `[data-commands-filter]` (a `ui-input`:  hides rows without every typed word)
 * - Classic script, no imports:  same rule as every docs asset.
 */
;(function () {
  /** Cell marks:  the sign shown, the table cell's verdict class, the legend's words. */
  const MARKS = {
    same: { sign: "✓", cls: "yes positive", words: "does it, shared name" },
    other: { sign: "≈", cls: "meh warning", words: "does it, other name" },
    could: { sign: "○", cls: "", words: "doesn't, but could" },
    no: { sign: "—", cls: "no negative", words: "couldn't really" }
  }
  /** Surface columns, in order:  JSON key, header. */
  const SURFACES = [
    ["cli", "CLI"],
    ["skill", "skill"],
    ["yarn", "yarn"]
  ]
  const script = document.currentScript
  const bundle = new URL("spell-ui.js", script.src).href

  void start()

  ////////////////
  // ## Start
  ////////////////

  /** Draw from the JSON (or the notice), then boot the bundle. */
  async function start() {
    try {
      const data = await load()
      if (data) draw(data)
    } catch (error) {
      notice(`Couldn't draw the tables:  ${error.message}`)
    }
    const tag = document.createElement("script")
    tag.src = bundle
    document.body.append(tag)
  }

  /** The page's JSON, or `undefined` after showing why not. */
  async function load() {
    const file =
      document.body.dataset.commands || location.pathname.replace(/[^/]*$/, (name) => name.replace(/\.html?$/, ".json"))
    if (location.protocol === "file:") {
      notice(
        `This page draws its tables from ${file.split("/").pop()}:  open it through the page server, e.g. \`yarn docs:open ${pagePath()}\`.`
      )
      return undefined
    }
    const response = await fetch(file, { cache: "no-store" })
    if (!response.ok) throw new Error(`${file}:  ${response.status} ${response.statusText}`)
    return response.json()
  }

  ////////////////
  // ## Drawing
  ////////////////

  /** Fill every placeholder from `data`. */
  function draw(data) {
    const families = data.families ?? []
    const holder = document.querySelector("[data-commands-families]")
    if (holder) {
      const number = sectionNumber(holder.closest("ui-section"))
      holder.innerHTML = families.map((family, i) => familyHTML(family, number ? `${number}.${i + 1} ` : "")).join("\n")
    }
    const stats = document.querySelector("[data-commands-stats]")
    if (stats) stats.innerHTML = statsHTML(families)
    const filter = document.querySelector("[data-commands-filter]")
    if (filter) wireFilter(filter)
  }

  /** One family:  a nested `<ui-section>` with its table. */
  function familyHTML(family, prefix) {
    const icon = family.icon ? `<ui-icon slot="icon" name="${attr(family.icon)}"></ui-icon>` : ""
    const intro = family.intro ? `<p>${text(family.intro)}</p>` : ""
    const rows = (family.rows ?? []).map((row) => rowHTML(family, row)).join("")
    return `<ui-section id="${attr(family.id)}" header="${attr(prefix + family.title)}" sticky collapsible dividing>
      ${icon}${intro}
      <ui-table celled compact striped unstackable>
        <table>
          <thead><tr><th>operation</th>${SURFACES.map(([, label]) => `<th>${label}</th>`).join("")}<th>runs</th><th>target</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </ui-table>
    </ui-section>`
  }

  /** One operation's row;  its notes go under the operation. */
  function rowHTML(family, row) {
    const id = row.id ?? `${family.id}-${slug(row.op)}`
    const notes = row.notes ? `<div class="commands-notes">${text(row.notes)}</div>` : ""
    const cells = SURFACES.map(([key]) => cellHTML(row[key])).join("")
    return `<tr id="${attr(id)}"><td><b>${text(row.op)}</b>${notes}</td>${cells}<td>${text(row.runs ?? "")}</td><td>${roadmapLinks(text(row.target ?? ""))}</td></tr>`
  }

  /** One surface's cell:  its mark, the names, the note. */
  function cellHTML(cell) {
    if (!cell) return `<td></td>`
    const mark = MARKS[cell.mark] ?? { sign: "?", cls: "", words: "" }
    const names = namesHTML(cell.names)
    const note = cell.note ? `<div class="commands-notes">${text(cell.note)}</div>` : ""
    return `<td class="${mark.cls}" title="${attr(mark.words)}">${mark.sign} ${names}${note}</td>`
  }

  /**
   * Names as code, yarn's grouped by script:  `ts` (app, cli, core) rather than 3 `<package> ts`s.
   * - a name of two words whose second has no space and isn't a CLI's (`spell ...`) is `<package> <script>`
   */
  function namesHTML(names) {
    if (!names) return ""
    const list = Array.isArray(names) ? names : [names]
    const byScript = new Map()
    const plain = []
    for (const name of list) {
      const words = name.split(" ")
      if (words.length === 2 && words[0] !== "spell" && !name.startsWith("/")) {
        if (!byScript.has(words[1])) byScript.set(words[1], [])
        byScript.get(words[1]).push(words[0])
      } else plain.push(`<code>${escape(name)}</code>`)
    }
    const grouped = [...byScript].map(
      ([name, packages]) =>
        `<code>${escape(name)}</code> <span class="commands-where">(${packages.map(escape).join(", ")})</span>`
    )
    return [...plain, ...grouped].join(", ")
  }

  /** Headline numbers:  operations, families, and how many each surface does. */
  function statsHTML(families) {
    const rows = families.flatMap((family) => family.rows ?? [])
    return [
      [rows.length, "operations"],
      [does("cli"), "in the CLI"],
      [does("skill"), "in a skill"],
      [does("yarn"), "in yarn"]
    ]
      .map(([value, label]) => `<ui-statistic value="${value}" label="${label}"></ui-statistic>`)
      .join("")

    /** How many rows surface `key` does, under either name. */
    function does(key) {
      return rows.filter((row) => ["same", "other"].includes(row[key]?.mark)).length
    }
  }

  /** Show `message` where the tables go (or at the top of `main`). */
  function notice(message) {
    const holder = document.querySelector("[data-commands-families]") ?? document.querySelector("main")
    holder?.insertAdjacentHTML(
      "afterbegin",
      `<ui-message state="warning" header="Tables not drawn"><p>${text(message)}</p></ui-message>`
    )
  }

  ////////////////
  // ## Filter
  ////////////////

  /**
   * Hide the rows without every typed word, and the families left empty.
   * - reads the value from the events' `detail`:  during `ui-input` the element's `value` is still the old one
   */
  function wireFilter(input) {
    input.addEventListener("ui-input", apply)
    input.addEventListener("ui-change", apply)

    /** Apply the filter in `event`. */
    function apply(event) {
      const words = String(event.detail?.value ?? input.value ?? "")
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
      for (const section of document.querySelectorAll("[data-commands-families] > ui-section")) {
        let shown = 0
        for (const row of section.querySelectorAll("tbody tr")) {
          const content = row.textContent.toLowerCase()
          row.hidden = !words.every((word) => content.includes(word))
          if (!row.hidden) shown++
        }
        section.hidden = shown === 0
      }
    }
  }

  ////////////////
  // ## Text
  ////////////////

  /** `value` escaped, with `` `code` `` as `<code>`. */
  function text(value) {
    return escape(String(value)).replace(/`([^`]+)`/g, "<code>$1</code>")
  }

  /** Escaped `html` with each roadmap id in parens, `(R3)`, linked to its row, `#r3`. */
  function roadmapLinks(html) {
    return html.replace(/\((R\d+)\)/g, (_, id) => `(<a href="#${id.toLowerCase()}">${id}</a>)`)
  }

  /** `value` safe in an attribute. */
  function attr(value) {
    return escape(String(value)).replace(/"/g, "&quot;")
  }

  /** `value` with `&`, `<`, `>` escaped. */
  function escape(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }

  /** `value` as an id:  lowercase words joined by dashes. */
  function slug(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  /** The leading number of `section`'s header (`2` for "2. Operations"), or "". */
  function sectionNumber(section) {
    return /^\s*(\d+(?:\.\d+)*)\.?\s/.exec(section?.getAttribute("header") ?? "")?.[1] ?? ""
  }

  /** This page's path inside `packages/docs`, for the notice's command. */
  function pagePath() {
    return decodeURIComponent(location.pathname).replace(/^.*\/packages\/docs\//, "")
  }
})()
