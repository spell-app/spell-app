/**
 * `spell dev choices <command>`:  SYNTAX-CHOICES pages, a table of names (or any syntax) Claude recommends, one row
 * per use site, which Owen goes through one by one:  each row's Recommended box is pre-filled and he types over the
 * ones he'd call differently, then presses "Do it".  For a call too big for a details page's options (P13's ~180
 * boolean names), where each name needs its own context.  Docs:  `guides/syntax-choices.html`.
 * - `new <slug> --rows <rows.json> [--title "..."] [--epic <name>] [--description "..."]` -- a page from
 *   `templates/syntax-choices.html`, plus its rows beside it (`<slug>.rows.json`);  prints the page's path
 *   - scratch:  `pages/details/<slug>.html`, ignored by version control, swept with the details pages after 14 days
 *   - `--epic <name>`:  `epics/<name>/details/<slug>.html`, kept with the plan doc
 * - `show <page> [--wait] [--timeout 8h]` -- show it in THIS session's VS Code side bar (Chrome outside VS Code);
 *   `--wait`:  then `wait`
 * - `wait <page> [--timeout 8h]` -- block until Owen presses "Do it" (an answer NEWER than the wait's start), print
 *   it as plain text, exit 0.  Run it in the BACKGROUND:  its exit wakes the session.  Timeout:  exit 2
 * - `answer <page>` -- print the answer already sent (exit 1 if none)
 * - `list` -- every syntax-choices page:  answered, draft (typed, not sent) or waiting
 * - `<page>`:  a slug, `<epic>/<slug>`, or a path, as `spell dev details` takes them
 * - Beside the page (`<slug>.html`):
 *   - `<slug>.rows.json` -- the rows (`ChoicesData`, below), written by `new`;  the page fetches it, so it needs the
 *     page server.  Why a file and not rows inlined in the page:  the page can't save without the server anyway,
 *     `answer` / `wait` read plain JSON, and the route knows a choices page by it
 *   - `<slug>.draft.json` -- what Owen typed so far, saved by the page every 5s (`choicesRoutes.ts`);  never wakes
 *     anyone
 *   - `<slug>.answer.json` -- what "Do it" sent:  `wait` exits with it
 * - Shares `details.js`' page lookup, answer file and waiting:  a choices page lives in the same `details/` folders.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { parseHTML } from "linkedom"

import {
  SLUG,
  attr,
  duration,
  findPage,
  listPages,
  parseArgs,
  readAnswer,
  shown,
  today,
  waitForAnswer
} from "./details.js"
import { ROOT, atDepth, openInVSCode, serialize } from "./pages.js"

/** How long `wait` waits by default:  8 hours, as `spell dev details wait`. */
const DEFAULT_TIMEOUT = "8h"

/** Run `spell dev choices <argv>`;  the exit code. */
async function main(argv) {
  const { positional, flags } = parseArgs(argv)
  const [command, target] = positional
  try {
    if (command === "new") {
      if (!flags.rows || flags.rows === true) throw new Error("new needs --rows <rows.json>")
      const data = JSON.parse(readFileSync(findFile(flags.rows), "utf8"))
      console.log(shown(createPage(ROOT, target, { ...flags, data })))
      return 0
    }
    if (command === "show") {
      const file = findChoicesPage(ROOT, target)
      await openInVSCode(file)
      return flags.wait ? await waitAndPrint(file, flags) : 0
    }
    if (command === "wait") return await waitAndPrint(findChoicesPage(ROOT, target), flags)
    if (command === "answer") {
      const file = findChoicesPage(ROOT, target)
      const answer = readAnswer(file)
      console.log(answer ? formatAnswer(file, answer) : `no answer yet:  ${shown(file)}`)
      return answer ? 0 : 1
    }
    if (command === "list") {
      for (const file of listPages(ROOT).filter(isChoicesPage)) console.log(`${status(file)}  ${relative(ROOT, file)}`)
      return 0
    }
    console.error(USAGE)
    return 1
  } catch (error) {
    console.error(`choices:  ${error.message}`)
    return 1
  }
}

/** `spell dev choices` with no or a wrong command. */
const USAGE = `usage:  spell dev choices new <slug> --rows <rows.json> [--title "..."] [--epic <name>] [--description "..."]
        spell dev choices show <page> [--wait] [--timeout 8h]
        spell dev choices wait <page> [--timeout 8h]
        spell dev choices answer <page>
        spell dev choices list`

////////////////
// ## Pages
////////////////

/**
 * Write a new syntax-choices page `slug` in checkout `docs` from the template, and its rows beside it;  the page's
 * absolute path.
 * - `data`:  `ChoicesData`, checked (`checkData()`);  `title` / `description` flags beat its own
 * - `epic`:  in that epic's `details/` (the epic must exist);  else the scratch `pages/details/`
 * - refuses to overwrite either file
 * - SIDE EFFECT:  writes `<slug>.html` and `<slug>.rows.json`
 */
export function createPage(docs, slug, { title, epic, description, data } = {}) {
  const checked = checkData(data)
  title ??= checked.title ?? "Syntax choices"
  if (!slug || !SLUG.test(slug)) throw new Error(`a slug is lower-kebab-case:  '${slug ?? ""}'`)
  if (epic && !existsSync(join(docs, "epics", epic))) throw new Error(`no epic '${epic}' (epics/${epic}/)`)
  const folder = epic ? join(docs, "epics", epic, "details") : join(docs, "pages", "details")
  const file = join(folder, `${slug}.html`)
  for (const each of [file, rowsFile(file)])
    if (existsSync(each)) throw new Error(`${relative(docs, each)} already exists`)
  const depth = relative(docs, folder).split("/").length
  const { document } = parseHTML(atDepth(readFileSync(join(docs, "templates/syntax-choices.html"), "utf8"), depth))
  document.querySelector("title").textContent = title
  document.querySelector("h1").textContent = title
  const crumb = document.querySelector("ui-breadcrumb-section[active]")
  if (crumb) crumb.textContent = title
  const about = description ?? `Syntax choices:  ${title}`
  document.querySelector('meta[name="description"]').setAttribute("content", about)
  const asked = document.querySelector("[data-choices-asked]")
  if (asked) asked.textContent = `Asked:  ${today()}`
  const rowsName = document.querySelector("[data-choices-rows] code")
  if (rowsName) rowsName.textContent = basename(rowsFile(file))
  fillPage(document, checked)
  mkdirSync(folder, { recursive: true })
  writeFileSync(file, serialize(document))
  writeFileSync(rowsFile(file), `${JSON.stringify({ sections: checked.sections, rows: checked.rows }, null, 2)}\n`)
  return file
}

/** The page's own words from `data`:  lede, "Asked by", the "Where we are" box. */
function fillPage(document, data) {
  const lede = document.querySelector("p.lede")
  if (lede && data.lede) lede.innerHTML = data.lede
  const asked = document.querySelector('ui-item[icon="comments"]')
  if (asked && data.askedBy) asked.innerHTML = `Asked by:  ${data.askedBy}`
  const where = document.querySelector("ui-message.spell-where ul")
  if (where && data.where) {
    const rows = [
      ["Epic", data.where.epic],
      ["Just now", data.where.justNow],
      ["This decides", data.where.decides]
    ].filter(([, text]) => text)
    where.innerHTML = rows.map(([label, text]) => `<li><b>${label}:</b>  ${text}</li>`).join("")
  }
}

/**
 * `data` checked, each row with an `id`;  throws naming the first problem.
 * - a missing `id` is made from the section, file and line (`q22-UISection-169`), `-2` ... on a clash
 */
export function checkData(data) {
  if (!data || typeof data !== "object") throw new Error("rows:  not a JSON object")
  const sections = data.sections
  if (!Array.isArray(sections) || !sections.length) throw new Error("rows:  no sections")
  for (const section of sections)
    if (!section?.id || !section.title) throw new Error(`rows:  a section needs an id and a title:  ${json(section)}`)
  const known = new Set(sections.map((section) => section.id))
  if (!Array.isArray(data.rows) || !data.rows.length) throw new Error("rows:  no rows")
  const ids = new Set()
  const rows = data.rows.map((row) => {
    for (const key of ["section", "file", "purpose", "current", "recommended"])
      if (typeof row?.[key] !== "string") throw new Error(`rows:  a row needs ${key}:  ${json(row)}`)
    if (!Number.isInteger(row.line) || row.line < 1) throw new Error(`rows:  a row needs a line:  ${json(row)}`)
    if (!known.has(row.section)) throw new Error(`rows:  no section '${row.section}':  ${json(row)}`)
    const made = `${row.section}-${basename(row.file).replace(/\.\w+$/, "")}-${row.line}`
    let id = row.id ?? made
    if (row.id && ids.has(id)) throw new Error(`rows:  two rows are '${id}'`)
    for (let n = 2; ids.has(id); n++) id = `${made}-${n}`
    ids.add(id)
    return { id, ...row }
  })
  return { ...data, rows }
}

/** `value`, short, for an error message. */
function json(value) {
  return JSON.stringify(value)?.slice(0, 120)
}

/** `path` as given:  absolute, else from where `spell` ran, the checkout's root or `packages/docs`. */
function findFile(path) {
  const found = [process.env.INIT_CWD ?? process.cwd(), ROOT, join(ROOT, "packages", "docs")]
    .map((base) => resolve(base, path))
    .find((each) => existsSync(each))
  if (!found) throw new Error(`no file ${path}`)
  return found
}

/** The syntax-choices page `target` names (`findPage()`), refusing a details page. */
export function findChoicesPage(docs, target) {
  const file = findPage(docs, target)
  if (!isChoicesPage(file)) throw new Error(`not a syntax-choices page (no ${basename(rowsFile(file))}):  ${file}`)
  return file
}

/** Is `page` a syntax-choices page:  are its rows beside it? */
export function isChoicesPage(page) {
  return existsSync(rowsFile(page))
}

/** `page`'s state for `list`:  `answered`, `draft` (typed, not sent) or `waiting`. */
function status(page) {
  if (readAnswer(page)) return "answered"
  return existsSync(draftFile(page)) ? "draft   " : "waiting "
}

////////////////
// ## Files
////////////////

/** `<slug>.rows.json` beside page `<slug>.html`. */
export function rowsFile(page) {
  return page.replace(/\.html$/, ".rows.json")
}

/** `<slug>.draft.json` beside page `<slug>.html`. */
export function draftFile(page) {
  return page.replace(/\.html$/, ".draft.json")
}

/** The rows of `page` (`ChoicesData`, as `new` wrote them). */
export function readRows(page) {
  return JSON.parse(readFileSync(rowsFile(page), "utf8"))
}

////////////////
// ## Answers
////////////////

/**
 * `answer` to `page` as plain text, for Claude:  the page and when, the CHANGED rows by section
 * (`file:line  current -> recommended  =>  typed`), how many stayed as recommended (accepted), then the feedback.
 */
export function formatAnswer(page, answer) {
  const { document } = parseHTML(readFileSync(page, "utf8"))
  const title = document.querySelector("h1")?.textContent?.trim() ?? basename(page)
  const { sections, rows } = readRows(page)
  const values = answer.values ?? {}
  const lines = [`Choices on "${title}" (${shown(page)}), sent ${answer.answered}:`]
  if (answer.changes) lines[0] += `  (sent ${answer.changes + 1}×)`
  lines.push(`  Rows:  ${shown(rowsFile(page))}`)
  const changed = rows.filter((row) => row.id in values)
  lines.push(`  Changed (${changed.length}):`)
  for (const section of sections) {
    const mine = changed.filter((row) => row.section === section.id)
    if (!mine.length) continue
    lines.push(`    ${section.title}`)
    for (const row of mine) {
      const typed = values[row.id].trim() || "(blank)"
      lines.push(`      ${row.file}:${row.line}  ${row.current} -> ${row.recommended}  =>  ${typed}`)
    }
  }
  if (!changed.length) lines.push("    (none)")
  const unknown = Object.keys(values).filter((id) => !rows.some((row) => row.id === id))
  if (unknown.length) lines.push(`  Rows no longer on the page, ignored:  ${unknown.join(", ")}`)
  const accepted = rows.filter((row) => !(row.id in values))
  const renames = accepted.filter((row) => row.recommended !== row.current).length
  lines.push(
    `  Unchanged (accepted as recommended):  ${accepted.length} -- ${renames} to rename, ${accepted.length - renames} to stay`
  )
  lines.push(answer.feedback ? `  Feedback:\n${indent(answer.feedback, "    ")}` : "  Feedback:  (none)")
  return lines.join("\n")
}

/** `text`'s lines, each after `prefix`. */
function indent(text, prefix) {
  return text
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n")
}

/** `wait`:  wait for `file`'s answer, print it;  exit code 0, or 2 on timeout. */
async function waitAndPrint(file, flags) {
  const timeout = flags.timeout ?? DEFAULT_TIMEOUT
  console.log(`waiting for "Do it" on ${shown(file)} (up to ${timeout})`)
  const answer = await waitForAnswer(file, { timeout: duration(timeout) })
  if (!answer) {
    console.log(`no answer yet after ${timeout}:  ${shown(file)}`)
    return 2
  }
  console.log(formatAnswer(file, answer))
  return 0
}

/**
 * What `new --rows` reads:  a whole page as data.  `new` writes `sections` and `rows` (ids filled in) beside the
 * page as `<slug>.rows.json`;  the rest goes into the page.
 * - `title`, `lede`, `askedBy` (`session <code>x</code>, while ...`);  HTML allowed except in `title`
 * - `where`:  `{ epic, justNow, decides }`, the "Where we are" box, as a details page's
 * - `sections[]`:  `{ id, title, description? }`, in page order;  `description`:  one line saying which question it
 *   answers and the recommended rule;  `` `code` `` in it is shown as code
 * - `rows[]`:  `{ id?, section, file, line, purpose, current, recommended, note? }`
 *   - `file`:  repo-relative;  `line`:  1-based, current at the branch's HEAD:  the page links `file:line` into VS Code
 *   - `purpose`:  1-3 words, what it's for;  `current`:  as a reader sees it at a use site (`this.isOpen()`);
 *     `recommended`:  that use site as Claude would write it (equal to `current` for a row that stays)
 *   - `note`:  a short why, shown under the purpose;  `` `code` `` as in `description`
 * - plain JS:  no type, this comment is the spec
 */

// run as a script (`spell dev choices`), not when a test imports it;  last, so every `const` above is set
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2))
}
