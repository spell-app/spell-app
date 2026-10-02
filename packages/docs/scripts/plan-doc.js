/**
 * `yarn plan-doc <command> <name> ...`:  edit the structured parts of a plan doc, `plans/<name>/<name>.html`.
 * Rules, ids and markup:  `templates/plans/plan-doc.md`.  Used by the `/plan-doc` skill and its agents.
 * - Commands:  `new`, `add-phase`, `phase`, `add`, `close`, `reopen`, `log`, `summary`, `check`, `open`
 *   (`node scripts/plan-doc.js` with no command lists them).
 * - Every edit:  takes the doc's lock (parallel agents queue instead of clobbering each other), parses it with
 *   linkedom, changes it through `PlanDoc`, stamps "updated", writes it, then tidies it (link targets, oxfmt).
 * - `PlanDoc` is pure (a parsed document in, changes on it):  `plan-doc.test.js` drives it directly.
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { pathToFileURL } from "node:url"

import { parseHTML } from "linkedom"

import { SRV } from "$/server"

import { DOCS, openInVSCode, serialize, tidy } from "./pages.js"

/** The template `new` copies, relative to `DOCS`. */
const TEMPLATE = "templates/plans/plan.html"

/** Phase status -> its icon and color (UI's `color` attribute, so themes and dark mode just work). */
export const STATUS = {
  todo: { icon: "circle outline", color: "grey" },
  active: { icon: "circle half stroke", color: "orange" },
  done: { icon: "circle check", color: "green" }
}

/** Item kind -> its id prefix (`c3`) and the section its list lives in. */
export const KINDS = {
  question: { prefix: "q", section: "questions" },
  caveat: { prefix: "c", section: "caveats" },
  issue: { prefix: "i", section: "issues" },
  todo: { prefix: "t", section: "todos" },
  decision: { prefix: "d", section: "decisions" }
}

/** Kinds `summary` reports while open, in the order a reader should act on them. */
const OPEN_KINDS = ["question", "issue", "caveat", "todo"]

////////////////
// ## PlanDoc
////////////////

/****************
 * ### `PlanDoc`
 * A parsed plan doc and the edits `plan-doc.js` makes to it.  Pure:  no files, no clock unless passed one.
 ****************/
export class PlanDoc {
  /**
   * - `document`:  linkedom (or browser) document of the plan doc
   * - `now`:  when edits happen (a `Date`):  the log's timestamps and the "updated" date, in LOCAL time
   */
  constructor(document, now = new Date()) {
    this.document = document
    this.now = now
  }

  /** `PlanDoc` of HTML text. */
  static parse(html, now) {
    return new PlanDoc(parseHTML(html).document, now)
  }

  /** `now`'s date, `YYYY-MM-DD`. */
  get today() {
    return isoDate(this.now)
  }

  /**
   * The doc as HTML text, ready to write.
   * - boolean attributes go back to bare (`styled`, not `styled=""`), as written by hand and by oxfmt
   */
  toString() {
    return serialize(this.document)
  }

  ////////////////
  // ## Phases
  ////////////////

  /**
   * Every phase, in order:  `{ n, name, status }`.
   * - the list is `<ui-steps class="plan-phases">` of `<ui-step header>`s;  docs made before 2026-10-01 have
   *   `<ul class="plan-phases">` of `<li>`s with a link
   */
  get phases() {
    return Array.from(this.document.querySelectorAll(".plan-phases > [data-phase]"), (entry) => ({
      n: Number(entry.getAttribute("data-phase")),
      name: phaseName(entry.getAttribute("header") ?? entry.querySelector("a")?.textContent ?? ""),
      status: entry.getAttribute("data-status") ?? "todo"
    }))
  }

  /** Number of the phase in progress, if any. */
  get activePhase() {
    return this.phases.find((phase) => phase.status === "active")?.n
  }

  /**
   * Append phase `name` (2-4 words) to the phase list and to `#phases`;  returns its number.
   * - `goal` / `files` / `verify`:  its body's bullets, as HTML;  omitted ones get a placeholder to fill in
   */
  addPhase(name, { goal, files, verify } = {}) {
    const list = this.require(".plan-phases")
    const section = this.require("#phases-section")
    const n = this.phases.length + 1
    const label = `P${n} · ${name}`
    if (list.localName === "ui-steps") {
      list.append(this.element("ui-step", { "data-phase": n, "data-status": "todo", href: `#p${n}`, header: label }))
    } else {
      const li = this.element("li", { "data-phase": n, "data-status": "todo" })
      li.innerHTML = `${icon("todo")} <a href="#p${n}">${text(label)}</a>`
      list.append(li)
    }
    const body = [
      ["Goal", goal],
      ["Files", files],
      ["Verify", verify]
    ].map(([field, html]) => `<li><b>${field}:</b>  ${html ?? "TBD"}</li>`)
    const phase = this.element("section", { class: "s3", "data-phase": n, "data-status": "todo" })
    phase.innerHTML = `<ui-sticky class="spell-h3"><h3 id="p${n}">${icon("todo")} ${text(label)}</h3></ui-sticky>
<ul class="plan-phase-body">${body.join("")}</ul>`
    section.append(phase)
    this.updateProgress()
    return n
  }

  /**
   * Set phase `n` to `status` (`todo` / `active` / `done`), in the list and on its heading.
   * - `done` removes the phase's UPDATE markers:  once it's finished, its changes are just the plan
   * - SIDE EFFECT:  logs the change
   */
  setPhase(n, status) {
    if (!STATUS[status]) throw new PlanDocError(`status must be ${Object.keys(STATUS).join(" / ")}, not "${status}"`)
    const entry = this.require(`.plan-phases > [data-phase="${n}"]`)
    const section = this.document.querySelector(`#phases-section section[data-phase="${n}"]`)
    for (const node of [entry, section]) {
      if (!node) continue
      node.setAttribute("data-status", status)
      node.querySelector("ui-icon")?.replaceWith(this.fragment(icon(status)))
    }
    if (entry.localName === "ui-step") {
      toggle(entry, "selected", status === "active")
      toggle(entry, "completed", status === "done")
    }
    if (status === "done") for (const marker of this.updateMarkers(n)) marker.remove()
    this.updateProgress()
    this.log(`P${n} ${status}`)
  }

  /** The phases' progress bar (`ui-progress.plan-progress`, if the doc has one):  done of all, hidden while none. */
  updateProgress() {
    const bar = this.document.querySelector("ui-progress.plan-progress")
    if (!bar) return
    const phases = this.phases
    bar.setAttribute("value", String(phases.filter((phase) => phase.status === "done").length))
    bar.setAttribute("total", String(phases.length))
    toggle(bar, "hidden", phases.length === 0)
  }

  /** UPDATE markers of phase `n`. */
  updateMarkers(n) {
    return Array.from(this.document.querySelectorAll(`.plan-update[data-phase="${n}"]`))
  }

  ////////////////
  // ## Items
  ////////////////

  /**
   * Append a `kind` item titled `title`;  returns its id (`c3`).
   * - `details`:  HTML for a collapsed "details" panel
   * - while a phase is active, the item gets that phase's UPDATE label
   */
  addItem(kind, title, { details } = {}) {
    const spec = KINDS[kind]
    if (!spec) throw new PlanDocError(`kind must be ${Object.keys(KINDS).join(" / ")}, not "${kind}"`)
    const list = this.require(`ol.plan-items[data-kind="${kind}"]`)
    const taken = Array.from(list.children, (li) => Number(li.id.slice(spec.prefix.length)) || 0)
    const id = `${spec.prefix}${Math.max(0, ...taken) + 1}`
    const li = this.element("li", { id, "data-status": "open" })
    li.innerHTML =
      `<a class="plan-id" href="#${id}">${id.toUpperCase()}</a> <span class="plan-title">${text(title)}</span>` +
      (details
        ? `<ui-accordion class="spell-aside" styled><ui-title>details</ui-title><ui-content>${details}</ui-content></ui-accordion>`
        : "")
    list.append(li)
    this.markUpdate(li)
    return id
  }

  /** Set item `id` open or done;  done items stay, struck through.  Returns its title. */
  setItem(id, status) {
    if (status !== "open" && status !== "done") throw new PlanDocError(`item status must be open / done`)
    const li = this.document.getElementById(id.toLowerCase())
    if (!li?.closest("ol.plan-items")) throw new PlanDocError(`no item "${id}"`)
    li.setAttribute("data-status", status)
    this.markUpdate(li)
    return li.querySelector(".plan-title")?.textContent ?? id
  }

  /** Items of `kind`, in order:  `{ id, title, status }`. */
  items(kind) {
    return Array.from(this.document.querySelectorAll(`ol.plan-items[data-kind="${kind}"] > li`), (li) => ({
      id: li.id,
      title: li.querySelector(".plan-title")?.textContent.trim() ?? "",
      status: li.getAttribute("data-status") ?? "open"
    }))
  }

  /** While a phase is active, flag `li` as changed in it (once). */
  markUpdate(li) {
    const n = this.activePhase
    if (!n || li.querySelector(":scope > .plan-update")) return
    li.append(
      this.fragment(` <ui-label class="plan-update" size="mini" color="orange" data-phase="${n}">UPDATE</ui-label>`)
    )
  }

  ////////////////
  // ## Log, stamps, summary
  ////////////////

  /**
   * Add a line to the log, stamped with the local date and time.
   * - the log is a `<ui-feed class="plan-log">` of events;  docs made before 2026-10-01 have a `<ul>`
   */
  log(line) {
    const list = this.require(".plan-log")
    if (list.localName === "ui-feed") {
      const event = this.element("ui-event", { icon: "pen to square" })
      event.innerHTML = `<ui-content><ui-summary><ui-date>${timeTag(this.now)}</ui-date> ${text(line)}</ui-summary></ui-content>`
      list.append(event)
      return
    }
    const li = this.element("li")
    li.innerHTML = `${timeTag(this.now)} ${text(line)}`
    list.append(li)
  }

  /** Stamp "updated" with today. */
  touch() {
    const updated = this.document.getElementById("plan-updated")
    if (updated) updated.textContent = this.today
  }

  /**
   * What needs attention:  the phases, the next one to do, and the open questions / issues / caveats / todos.
   * - feeds the end-of-phase reply and its AskUserQuestion options
   */
  summary() {
    const phases = this.phases
    const open = Object.fromEntries(
      OPEN_KINDS.map((kind) => [kind, this.items(kind).filter((item) => item.status === "open")])
    )
    return {
      title: this.document.querySelector("h1")?.textContent.trim() ?? "",
      phases,
      active: phases.find((phase) => phase.status === "active"),
      next: phases.find((phase) => phase.status === "todo"),
      open
    }
  }

  /**
   * Structural problems, as text:  duplicate ids, `#id` links to nowhere, phases without a valid status, list and
   * sections out of step.
   */
  check() {
    const problems = []
    const seen = new Map()
    for (const el of this.document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1)
    for (const [id, count] of seen) if (count > 1) problems.push(`id "${id}" used ${count} times`)
    for (const a of this.document.querySelectorAll('a[href^="#"]')) {
      const id = a.getAttribute("href").slice(1)
      if (id && !seen.has(id)) problems.push(`link to missing #${id} ("${a.textContent.trim()}")`)
    }
    const sections = this.document.querySelectorAll("#phases-section section[data-phase]")
    for (const phase of this.phases) {
      if (!STATUS[phase.status]) problems.push(`P${phase.n} has status "${phase.status}"`)
      if (!this.document.getElementById(`p${phase.n}`)) problems.push(`P${phase.n} has no section #p${phase.n}`)
    }
    if (sections.length !== this.phases.length)
      problems.push(`${this.phases.length} phases listed, ${sections.length} phase sections`)
    return problems
  }

  ////////////////
  // ## DOM helpers
  ////////////////

  /** The element matching `selector`;  throws if the doc doesn't have it (not a plan doc, or a broken one). */
  require(selector) {
    const found = this.document.querySelector(selector)
    if (!found) throw new PlanDocError(`no ${selector} in the doc:  is it a plan doc?`)
    return found
  }

  /** New element with attributes. */
  element(tag, attributes = {}) {
    const el = this.document.createElement(tag)
    for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, String(value))
    return el
  }

  /** Nodes of an HTML snippet, as a fragment to insert. */
  fragment(html) {
    const template = this.document.createElement("template")
    template.innerHTML = html
    return template.content
  }
}

/** A problem the user should see as a message, not a stack trace. */
export class PlanDocError extends Error {}

/** A phase's status icon. */
function icon(status) {
  const { icon: name, color } = STATUS[status]
  return `<ui-icon name="${name}" color="${color}"></ui-icon>`
}

/** Set or remove boolean attribute `name` on `element`. */
function toggle(element, name, on) {
  if (on) element.setAttribute(name, "")
  else element.removeAttribute(name)
}

/** `P2 · Short Name` -> `Short Name`. */
function phaseName(label) {
  return label.replace(/^\s*P\d+\s*·\s*/, "").trim()
}

/** Escape for HTML text. */
function text(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/**
 * `<time>` for `date`, local:  shows `YYYY-MM-DD HH:MM`, `datetime` carries the offset (`2026-09-30T23:30-07:00`).
 */
export function timeTag(date = new Date()) {
  const clock = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  const minutes = -date.getTimezoneOffset()
  const offset = `${minutes < 0 ? "-" : "+"}${String(Math.floor(Math.abs(minutes) / 60)).padStart(2, "0")}:${String(
    Math.abs(minutes) % 60
  ).padStart(2, "0")}`
  return `<time datetime="${isoDate(date)}T${clock}${offset}">${isoDate(date)} ${clock}</time>`
}

/** `date`'s local date, `YYYY-MM-DD`. */
export function isoDate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

////////////////
// ## Command line
////////////////

/** Usage, printed with no command or a bad one. */
const USAGE = `usage:  yarn plan-doc <command> <name> ...    (doc:  packages/docs/plans/<name>/<name>.html)
  new <name> [--title "Title"]                     copy the template, fill it in, update the docs index
  add-phase <name> "Short Name" [--goal html] [--files html] [--verify html]
  phase <name> <N> todo|active|done [--no-open]    set a phase's status;  done drops its UPDATE markers;
                                                   reloads the doc's VS Code tab
  add <name> question|caveat|issue|todo|decision "title" [--details html]    prints the new id
  close <name> <id>  /  reopen <name> <id>         strike / unstrike an item
  log <name> "text"                                timestamped line in the log
  summary <name> [--json]                          open questions, issues, caveats, todos;  the next phase
  check <name> [--no-browser]                      ids, links, phases;  then check-spell.js
  open <name>                                      show in VS Code, beside the editor (reloads its tab)`

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    await main(process.argv.slice(2))
  } catch (error) {
    if (!(error instanceof PlanDocError)) throw error
    console.error(`plan-doc:  ${error.message}`)
    process.exit(1)
  }
}

/** Run one command;  may return a promise (`phase` and `open` show the doc in VS Code). */
function main(argv) {
  const { positional, flags } = parseArgs(argv)
  const [command, name, ...rest] = positional
  if (!command || !name) return usage()
  const file = docPath(name)
  switch (command) {
    case "new":
      return create(name, file, flags)
    case "add-phase": {
      const n = edit(file, (plan) => {
        const added = plan.addPhase(need(rest[0], "a short name"), flags)
        plan.log(`P${added} added:  ${rest[0]}`)
        return added
      })
      return console.log(`P${n}`)
    }
    case "phase":
      edit(file, (plan) => plan.setPhase(Number(need(rest[0], "a phase number")), need(rest[1], "a status")))
      reindex()
      // a new stage:  show it to the user (their tab reloads), unless told not to
      return flags.noOpen ? undefined : openInVSCode(file)
    case "add": {
      const id = edit(file, (plan) => plan.addItem(need(rest[0], "a kind"), need(rest[1], "a title"), flags))
      return console.log(id.toUpperCase())
    }
    case "close":
    case "reopen":
      return edit(file, (plan) => {
        const title = plan.setItem(need(rest[0], "an item id"), command === "close" ? "done" : "open")
        plan.log(`${rest[0].toUpperCase()} ${command === "close" ? "closed" : "reopened"}:  ${title}`)
      })
    case "log":
      return edit(file, (plan) => plan.log(need(rest[0], "the text")))
    case "summary":
      return printSummary(read(file).summary(), flags.json)
    case "check":
      return check(file, flags)
    case "open":
      return open(file)
    default:
      return usage()
  }
}

/** `--key value` flags and `--key` switches, plus everything else in order. */
function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const match = argv[i].match(/^--([\w-]+)$/)
    if (!match) positional.push(argv[i])
    else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) flags[camel(match[1])] = argv[++i]
    else flags[camel(match[1])] = true
  }
  return { positional, flags }
}

/** `no-browser` -> `noBrowser`. */
function camel(flag) {
  return flag.replace(/-(\w)/g, (_, letter) => letter.toUpperCase())
}

/** `value`, or a usage error naming what's missing. */
function need(value, what) {
  if (value === undefined || value === "") throw new PlanDocError(`missing ${what}\n${USAGE}`)
  return value
}

/** Print usage and fail. */
function usage() {
  console.error(USAGE)
  process.exit(2)
}

/** The doc of plan `name`;  names are lower-kebab-case, as the folder and file. */
function docPath(name) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) throw new PlanDocError(`name "${name}" must be lower-kebab-case`)
  return join(DOCS, "plans", name, `${name}.html`)
}

/** The plan doc at `file`, parsed. */
function read(file) {
  if (!existsSync(file)) throw new PlanDocError(`no plan doc ${relative(DOCS, file)}:  \`yarn plan-doc new\` first`)
  return PlanDoc.parse(readFileSync(file, "utf8"))
}

/**
 * Change the doc at `file` with `change(plan)`, under its lock (`SRV.FileLock`:  parallel agents, and the page
 * server's page edits, take turns);  returns what `change` returned.
 * - stamps "updated", writes, tidies (link targets + oxfmt)
 */
function edit(file, change) {
  return SRV.FileLock.run(file, () => {
    const plan = read(file)
    const result = change(plan)
    plan.touch()
    writeFileSync(file, plan.toString())
    if (!tidy([relative(DOCS, file)])) throw new PlanDocError("tidy failed (see above)")
    return result
  })
}

/**
 * `new`:  copy the template to `file`, fill in name, title, date, branch and worktree, then update the index.
 * - refuses to overwrite:  the skill asks the user whether to reuse an existing doc
 */
function create(name, file, { title = titleCase(name) }) {
  if (existsSync(file)) throw new PlanDocError(`${relative(DOCS, file)} already exists`)
  const now = new Date()
  const today = isoDate(now)
  const fill = {
    name,
    title,
    date: today,
    timestamp: timeTag(now),
    branch: git("branch", "--show-current") || "(detached)",
    worktree: git("rev-parse", "--show-toplevel") || DOCS
  }
  const html = readFileSync(join(DOCS, TEMPLATE), "utf8")
    .replace(/\{\{(\w+)\}\}/g, (whole, key) =>
      key === "timestamp" ? fill.timestamp : key in fill ? escapeAll(fill[key]) : whole
    )
    .replace(/\n\s*<!--\s*PLAN DOC TEMPLATE\.[\s\S]*?-->/, "")
  const plan = PlanDoc.parse(html, now)
  plan.document.querySelector("title").textContent = title
  plan.document.querySelector('meta[name="description"]').setAttribute("content", `Plan doc:  ${title}.`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, plan.toString())
  if (!tidy([relative(DOCS, file)])) throw new PlanDocError("tidy failed (see above)")
  reindex()
  console.log(relative(process.cwd(), file))
}

/** `kebab-name` -> `Kebab Name`. */
function titleCase(name) {
  return name.replace(/(^|-)(\w)/g, (_, dash, letter) => `${dash ? " " : ""}${letter.toUpperCase()}`)
}

/** Escape for HTML text AND a double-quoted attribute:  placeholders sit in both. */
function escapeAll(value) {
  return text(value).replace(/"/g, "&quot;")
}

/** `git <args>` in `DOCS`, trimmed stdout ("" on failure). */
function git(...args) {
  const run = spawnSync("git", args, { cwd: DOCS, encoding: "utf8" })
  return run.status === 0 ? run.stdout.trim() : ""
}

/** Rewrite the docs index:  a plan's status badge follows its phases. */
function reindex() {
  const run = spawnSync("node", ["scripts/index.js"], { cwd: DOCS, encoding: "utf8" })
  if (run.status !== 0) process.stderr.write(`plan-doc:  docs index not updated\n${run.stdout}${run.stderr}`)
}

/** `summary`:  bullets for a reply (or JSON for a script). */
function printSummary(summary, json) {
  if (json) return console.log(JSON.stringify(summary, null, 2))
  const lines = [`${summary.title}`]
  for (const phase of summary.phases) {
    const mark = { todo: "[ ]", active: "[~]", done: "[x]" }[phase.status] ?? "[?]"
    lines.push(`  ${mark} P${phase.n} · ${phase.name}`)
  }
  if (summary.next) lines.push(`next:  P${summary.next.n} · ${summary.next.name}`)
  for (const kind of OPEN_KINDS) {
    const open = summary.open[kind]
    if (!open.length) continue
    lines.push(`open ${kind}s:`)
    for (const item of open) lines.push(`  - ${item.id.toUpperCase()}  ${item.title}`)
  }
  console.log(lines.join("\n"))
}

/** `check`:  structural problems, then the browser check;  exits 1 on any. */
function check(file, { noBrowser }) {
  const problems = read(file).check()
  for (const problem of problems) console.error(`PROBLEM:  ${problem}`)
  if (!problems.length) console.log(`${relative(DOCS, file)}:  structure ok`)
  let browserOk = true
  if (!noBrowser) {
    const run = spawnSync("node", ["scripts/check-spell.js", relative(DOCS, file)], { cwd: DOCS, encoding: "utf8" })
    browserOk = run.status === 0
    process.stderr.write(run.stderr ?? "")
    console.log(browserOk ? "check-spell:  ok" : "check-spell:  FAILED (problems above)")
  }
  if (problems.length || !browserOk) process.exit(1)
}

/** `open`:  show the doc rendered in VS Code, reusing its tab (`pages.js` `openInVSCode()`). */
function open(file) {
  read(file)
  return openInVSCode(file)
}
