/*
 * The core reference page (`guides/targets/core-reference.html`, epic `python-target` P29):  draws every name the
 * javascript core offers, file by file, with Python's name for each and whether spell_core has it yet;  then boots
 * the docs bundle.
 * - Loaded INSTEAD of `spell-ui.js`, as `commands.js` is:  the runtime builds the toolbar and the sticky titles from
 *   `main`'s sections once, at start, so the tables must be in the page before it runs.  This script fetches, draws,
 *   then adds `spell-ui.js` (same folder), whatever happened.
 * - The data, two JSON files, fetched from the checkout SERVING the page (paths relative to the page, in `<body>`'s
 *   data attributes), so the page shows that checkout's core and can't go stale:
 *   - `data-core-declarations`:  `packages/core/spellCore.declarations.json`, the core's method list
 *     (`yarn gen:declarations` in `packages/core`, `coreDeclarations.ts`);  `{ provides, statements: [Statement] }`
 *   - `data-not-ported`:  `packages/py/core/not_ported_yet.json`, what spell_core doesn't have yet;
 *     `{ about, groups: [{ why, names: [javascript name] }] }`.  Optional:  without it the Python column says "?"
 * - `Statement`, by its keys:
 *   - a method of `spellCore`:  `{ kind: "method", name, of, module, params?: [{ name }], section?, description? }`
 *   - a property of `spellCore`:  `{ property, of, module, section?, description? }`
 *   - a class compiled code imports:  `{ type, superType?, module, description? }`
 *   - a function compiled code imports:  `{ kind: "function", name, module, params?, description? }`
 *   - `module`:  the core's file under `packages/core/src/`, without `.ts` (`classes` is `classes/index.ts`);
 *     `section`:  the `// ## Heading` it's under there
 * - Python's names, as `packages/py/core/tests/test_core_declarations.py` checks them:  `snakeCase()` of the
 *   javascript name;  a member is `core.get_item_at()`, a class keeps its name (`spell_core.Thing`)
 * - Placeholders the page holds, all optional:
 *   - `[data-core-stats]` (a `ui-statistics`)
 *   - `[data-core-modules]`:  one nested `<ui-section>` per file, numbered after its parent section, each a table
 *     with a sub-heading row per heading of the file (`headingRuns()`)
 *   - `[data-core-filter]` (a `ui-input`):  hides rows without every typed word
 *   - `[data-core-not-ported]`:  spell_core's missing names, by why, each linked to its row
 * - From `file://` it shows a notice where the tables go:  the page needs the PAGE SERVER
 *   (`spell dev docs open <page>`).
 * - Classic script, no imports:  same rule as every docs asset.
 */
;(function () {
  /** Columns of every file's table. */
  const COLUMNS = ["name", "Python", "in Python", "what it does"]
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
      notice(`Couldn't draw the reference:  ${error.message}`)
    }
    const tag = document.createElement("script")
    tag.src = bundle
    document.body.append(tag)
  }

  /**
   * Both files, as `{ declarations, notPorted? }`, or `undefined` after showing why not.
   * - throws when the core's method list can't be read;  a missing `not_ported_yet.json` only leaves `notPorted` out
   */
  async function load() {
    const { coreDeclarations, notPorted } = document.body.dataset
    if (location.protocol === "file:") {
      notice(
        `This page draws the core's method list from the checkout serving it:  open it through the page server, e.g. \`spell dev docs open ${pagePath()}\`.`
      )
      return undefined
    }
    if (!coreDeclarations) throw new Error("the page's `<body>` has no `data-core-declarations`")
    const [declarations, groups] = await Promise.all([
      fetchJSON(coreDeclarations),
      notPorted ? fetchJSON(notPorted).catch(() => undefined) : undefined
    ])
    return { declarations, notPorted: groups }
  }

  /** The JSON at `path`, relative to the page;  throws on a failed response. */
  async function fetchJSON(path) {
    const response = await fetch(path, { cache: "no-store" })
    if (!response.ok) throw new Error(`${path}:  ${response.status} ${response.statusText}`)
    return response.json()
  }

  ////////////////
  // ## Drawing
  ////////////////

  /** Fill every placeholder from `data`. */
  function draw({ declarations, notPorted }) {
    const statements = declarations.statements ?? []
    const missing = missingNames(notPorted)
    const modules = byModule(statements)
    const holder = document.querySelector("[data-core-modules]")
    if (holder) {
      const number = sectionNumber(holder.closest("ui-section"))
      holder.innerHTML = [...modules]
        .map(([module, rows], i) => moduleHTML(module, rows, missing, number ? `${number}.${i + 1} ` : ""))
        .join("\n")
    }
    const stats = document.querySelector("[data-core-stats]")
    if (stats) stats.innerHTML = statsHTML(statements, modules, missing)
    const list = document.querySelector("[data-core-not-ported]")
    if (list) list.innerHTML = notPortedHTML(statements, notPorted)
    const filter = document.querySelector("[data-core-filter]")
    if (filter) wireFilter(filter)
  }

  /** The statements by file, in the list's order. */
  function byModule(statements) {
    const modules = new Map()
    for (const statement of statements) {
      const module = statement.module ?? "core"
      if (!modules.has(module)) modules.set(module, [])
      modules.get(module).push(statement)
    }
    return modules
  }

  /**
   * One file:  a nested `<ui-section>` with its table, a `<tbody>` per run of names under one heading.
   * - a link to its source file in the title bar's `actions`, an icon (a phone has little room);  its count in the `badge`
   */
  function moduleHTML(module, statements, missing, prefix) {
    const file = sourceFile(module)
    const notIn = missing ? statements.filter((statement) => missing.has(jsName(statement))).length : 0
    const badge = notIn ? `${statements.length} · ${notIn} not in Python` : `${statements.length}`
    const bodies = headingRuns(statements)
      .map(({ heading, rows }) => {
        const head = heading ? `<tr><th colspan="${COLUMNS.length}">${text(heading)}</th></tr>` : ""
        return `<tbody>${head}${rows.map((statement) => rowHTML(statement, missing)).join("")}</tbody>`
      })
      .join("")
    const path = `packages/core/src/${file}`
    return `<ui-section id="${attr(`file-${slug(module)}`)}" header="${attr(prefix + module)}" badge="${attr(badge)}" sticky collapsible dividing collapsed>
      <a slot="actions" href="${attr(sourceHref(file))}" target="${attr(`src-${slug(path)}`)}" title="${attr(path)}" aria-label="${attr(`Open ${file.split("/").pop()}`)}"><ui-icon name="code"></ui-icon></a>
      <ui-table celled compact striped unstackable>
        <table>
          <thead><tr>${COLUMNS.map((label) => `<th>${label}</th>`).join("")}</tr></thead>
          ${bodies}
        </table>
      </ui-table>
    </ui-section>`
  }

  /**
   * A file's names in the list's order (the file's), cut into runs under one heading:  `[{ heading, rows }]`.
   * - members of `spellCore` under their `section`;  one without, after one with, stays under the one before
   *   (the list says no section for a few whose first declaration is above every heading:  an overload, an interface's
   *   member)
   * - what compiled code imports by name, classes and functions, under "imported by name"
   */
  function headingRuns(statements) {
    const runs = []
    for (const statement of statements) {
      const heading =
        statement.of === "spellCore" ? (statement.section ?? runs.at(-1)?.heading ?? "") : "imported by name"
      if (runs.at(-1)?.heading !== heading) runs.push({ heading, rows: [] })
      runs.at(-1).rows.push(statement)
    }
    return runs
  }

  /** One name's row. */
  function rowHTML(statement, missing) {
    const name = jsName(statement)
    return `<tr id="${attr(rowId(statement))}"><td>${nameHTML(statement)}</td><td><code>${escape(pythonName(statement))}</code></td>${portedHTML(name, missing)}<td>${text(statement.description ?? "")}</td></tr>`
  }

  /** The javascript name, with its parameters, and a label saying what it is unless it's a method of `spellCore`. */
  function nameHTML(statement) {
    const params = statement.params ? `(${statement.params.map((param) => param.name).join(", ")})` : ""
    const code = `<code>${escape(jsName(statement) + (statement.kind ? params || "()" : ""))}</code>`
    const kind = kindOf(statement)
    const label = kind === "method" ? "" : ` <ui-label size="mini">${kind}</ui-label>`
    const extending = statement.superType ? ` extends <code>${escape(statement.superType)}</code>` : ""
    return code + label + extending
  }

  /** "in Python" cell:  ✓, or ✗ with why as its tooltip;  "?" without `not_ported_yet.json`. */
  function portedHTML(name, missing) {
    if (!missing) return `<td title="this checkout has no packages/py/core/not_ported_yet.json">?</td>`
    const why = missing.get(name)
    if (why === undefined) return `<td class="yes positive" title="spell_core has it">✓</td>`
    return `<td class="no negative" title="${attr(why)}">✗ not yet</td>`
  }

  /** Headline numbers:  names, files, how many Python has and hasn't. */
  function statsHTML(statements, modules, missing) {
    const notIn = missing ? statements.filter((statement) => missing.has(jsName(statement))).length : undefined
    return [
      [statements.length, "names"],
      [modules.size, "files"],
      [notIn === undefined ? "?" : statements.length - notIn, "in Python"],
      [notIn ?? "?", "not in Python yet"]
    ]
      .map(([value, label]) => `<ui-statistic value="${value}" label="${label}"></ui-statistic>`)
      .join("")
  }

  /** spell_core's missing names:  one bullet per group, its why, then its names linked to their rows. */
  function notPortedHTML(statements, notPorted) {
    if (!notPorted)
      return `<ui-message state="warning" header="No list of what Python lacks"><p>This checkout has no <code>packages/py/core/not_ported_yet.json</code>.</p></ui-message>`
    const byName = new Map(statements.map((statement) => [jsName(statement), statement]))
    const items = (notPorted.groups ?? []).map((group) => {
      const names = group.names.map((name) => {
        const statement = byName.get(name)
        return statement
          ? `<a href="#${attr(rowId(statement))}"><code>${escape(name)}</code></a>`
          : `<code>${escape(name)}</code>`
      })
      return `<li>${text(group.why)} (${group.names.length}):<br />${names.join(", ")}</li>`
    })
    return `<ul>${items.join("")}</ul>`
  }

  /** Show `message` where the tables go (or at the top of `main`). */
  function notice(message) {
    const holder = document.querySelector("[data-core-modules]") ?? document.querySelector("main")
    holder?.insertAdjacentHTML(
      "afterbegin",
      `<ui-message state="warning" header="Reference not drawn"><p>${text(message)}</p></ui-message>`
    )
  }

  ////////////////
  // ## Names
  ////////////////

  /** The javascript name a statement declares:  a member's, a class's or a function's. */
  function jsName(statement) {
    return statement.name ?? statement.property ?? statement.type
  }

  /** What a statement declares, as its label says:  `method`, `property`, `class` or `import` (a function). */
  function kindOf(statement) {
    if (statement.type) return "class"
    if (statement.property) return "property"
    return statement.kind === "function" ? "import" : "method"
  }

  /** The row's id:  unique, though a few names are both a method and an import (`positionOf`). */
  function rowId(statement) {
    const kind = kindOf(statement)
    const prefix = kind === "class" ? "class" : kind === "import" ? "import" : "spellcore"
    return `${prefix}-${jsName(statement)}`
  }

  /**
   * Python's name for `statement`, as spell_core's test looks for it.
   * - a member of `spellCore`:  `core.get_item_at()`, `core.time_units_map` (a constant may keep its capitals)
   * - a class:  `spell_core.Thing`;  a function compiled code imports:  `position_of()`, on `core` or the package
   */
  function pythonName(statement) {
    const kind = kindOf(statement)
    if (kind === "class") return `spell_core.${statement.type}`
    const name = snakeCase(jsName(statement))
    if (kind === "property") return `core.${name}`
    return kind === "import" ? `${name}()` : `core.${name}()`
  }

  /**
   * `name` as Python writes it:  `getItemAt` is `get_item_at`.
   * - capitals together stay one word:  `isANumber` is `is_a_number`, `fromJSON` `from_json`
   * - a name all in capitals is lowercased:  `ACTIVE_TEST` is `active_test`
   * - SEE:  `snake_case()` in `packages/py/core/tests/test_core_declarations.py`, which this must match
   */
  function snakeCase(name) {
    if (/^[A-Z0-9_]+$/.test(name)) return name.toLowerCase()
    return name
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      .toLowerCase()
  }

  /** The names spell_core doesn't have yet, each to its group's why;  `undefined` without the file. */
  function missingNames(notPorted) {
    if (!notPorted) return undefined
    return new Map((notPorted.groups ?? []).flatMap((group) => group.names.map((name) => [name, group.why])))
  }

  /** `module`'s file under `packages/core/src/`:  `classes` is `classes/index.ts`. */
  function sourceFile(module) {
    return module === "classes" ? "classes/index.ts" : `${module}.ts`
  }

  /** `file`'s link from this page:  `src/<file>` beside the core's method list, wherever the page says that is. */
  function sourceHref(file) {
    return (document.body.dataset.coreDeclarations ?? "").replace(/[^/]*$/, `src/${file}`)
  }

  ////////////////
  // ## Filter
  ////////////////

  /**
   * Hide the rows without every typed word, the sub-headings left empty, and the files left empty.
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
      for (const section of document.querySelectorAll("[data-core-modules] > ui-section")) {
        let shown = 0
        for (const body of section.querySelectorAll("tbody")) {
          let inBody = 0
          for (const row of body.querySelectorAll("tr:has(td)")) {
            const content = row.textContent.toLowerCase()
            row.hidden = !words.every((word) => content.includes(word))
            if (!row.hidden) inBody++
          }
          const head = body.querySelector("tr:not(:has(td))")
          if (head) head.hidden = inBody === 0
          shown += inBody
        }
        section.hidden = shown === 0
      }
    }
  }

  ////////////////
  // ## Text
  ////////////////

  /** `value` escaped, with `` `code` `` (and a flattened ```` ```lang ...``` ```` block) as `<code>`. */
  function text(value) {
    return escape(String(value))
      .replace(/```(?:[a-z]+\s)?([\s\S]*?)```/g, (_, code) => `<code>${code.trim()}</code>`)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
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

  /** The leading number of `section`'s header (`3` for "3. The core, file by file"), or "". */
  function sectionNumber(section) {
    return /^\s*(\d+(?:\.\d+)*)\.?\s/.exec(section?.getAttribute("header") ?? "")?.[1] ?? ""
  }

  /** This page's path from the checkout's root (`guides/...`), for the notice's command. */
  function pagePath() {
    return decodeURIComponent(location.pathname).replace(/^.*\/(?=(?:guides|epics|templates|pages)\/)/, "")
  }
})()
