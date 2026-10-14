/**
 * `spell dev choices <command>`:  SYNTAX-CHOICES pages, a table of names (or any syntax) Claude recommends, one row
 * per use site, which Owen goes through one by one:  each row's Recommended box is pre-filled and he types over the
 * ones he'd call differently, then presses "Do it".  For a call too big for a details page's options (P13's ~180
 * boolean names), where each name needs its own context.  Docs:  `guides/syntax-choices.html`.
 * - `new <slug> --rows <rows.json> [--title "..."] [--epic <name>] [--description "..."]` -- a page from the tool's
 *   own template (`templates/syntax-choices.html` beside it), its rows written into it as the epics pack's
 *   `<epic-choice-row>`s (`answerPages.js`), plus the rows beside it (`<slug>.rows.json`);  prints the page's path
 *   - scratch:  `pages/details/<slug>.html`, ignored by version control, swept with the details pages after 14 days
 *   - `--epic <name>`:  `epics/<name>/details/<slug>.html`, kept with the plan doc
 * - `show <page> [--wait] [--timeout 8h]` -- show it in THIS session's VS Code side bar (Chrome outside VS Code);
 *   `--wait`:  then `wait`
 * - `wait <page> [--timeout 8h]` -- block until Owen presses "Do it" (an answer NEWER than the wait's start), print
 *   it as plain text, exit 0.  Run it in the BACKGROUND:  its exit wakes the session.  Timeout:  exit 2
 * - `answer <page>` -- print the answer already sent (exit 1 if none)
 * - `list [<epic>]` -- every syntax-choices page:  answered, draft (typed, not sent) or waiting;  with an epic, only
 *   that epic's (`epics/<epic>/details/`)
 * - `<page>`:  a slug, `<epic>/<slug>`, or a path, as `spell dev details` takes them
 * - A DOCS page may take choices too, naming its own rows on its `<body data-choices-rows="...">` (`declaredRows()`):
 *   the spell syntax guide (`guides/spell-syntax/spell-syntax.html`), whose rows are generated from the code.
 *   `show`, `wait` and `answer` work on it by its path;  `list` covers only the `details/` folders
 * - Beside the page (`<slug>.html`):
 *   - `<slug>.rows.json` -- the rows (`ChoicesData`, below), written by `new`, beside the same rows in the page:
 *     `answer` / `wait` read plain JSON, and the route knows a choices page by it (and checks the ids it's sent).
 *     Before epic `epic-workflow` P12 the page fetched it and drew its tables from it
 *   - `<slug>.draft.json` -- what Owen typed so far, saved by the page every 5s (`choicesRoutes.ts`);  never wakes
 *     anyone
 *   - `<slug>.answer.json` -- what "Do it" sent:  `wait` exits with it
 * - Shares `details.js`' page lookup, answer file and waiting:  a choices page lives in the same `details/` folders.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { parseHTML } from "linkedom"

import { ROWS, TOOL_TEMPLATES, choiceSections, fillHead, fillWords } from "./answerPages.js"
import { SLUG, duration, findPage, listPages, parseArgs, readAnswer, shown, today, waitForAnswer } from "./details.js"
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
      const pages = listPages(ROOT).filter((file) => isChoicesPage(file) && (!target || isEpicsPage(file, target)))
      for (const file of pages) console.log(`${status(file)}  ${relative(ROOT, file)}`)
      return 0
    }
    console.error(USAGE)
    return 1
  } catch (error) {
    console.error(`choices:  ${error.message}`)
    return 1
  }
}

/** Is `file` one of epic `epic`'s own pages (under `epics/<epic>/`)? */
function isEpicsPage(file, epic) {
  return relative(join(ROOT, "epics", epic), file).split("/")[0] !== ".."
}

/** `epic choices` with no or a wrong command. */
const USAGE = `usage:  epic choices new <slug> --rows <rows.json> [--title "..."] [--epic <name>] [--description "..."]
        epic choices show <page> [--wait] [--timeout 8h]
        epic choices wait <page> [--timeout 8h]
        epic choices answer <page>
        epic choices list [<epic>]`

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
  const template = readFileSync(join(TOOL_TEMPLATES, "syntax-choices.html"), "utf8")
  const { document } = parseHTML(atDepth(template, depth))
  fillHead(document, {
    title,
    description: description ?? `Syntax choices:  ${title}`,
    asked: "[data-choices-asked]",
    date: today()
  })
  const rowsName = document.querySelector("[data-choices-rows] code")
  if (rowsName) rowsName.textContent = basename(rowsFile(file))
  fillWords(document, checked)
  // the rows, as elements, where the template's example section is
  const example = [...document.querySelectorAll("ui-section")].find((section) => section.querySelector(ROWS))
  example?.replaceWith(...choiceSections(document, checked))
  mkdirSync(folder, { recursive: true })
  writeFileSync(file, serialize(document))
  const { sections, rows, fileColumn, stacked } = checked
  // the layout flags, kept only when they change the default (the migration redraws a page from them:  `migrate.js`)
  const kept = { ...(fileColumn === false && { fileColumn }), ...(stacked === true && { stacked }), sections, rows }
  writeFileSync(rowsFile(file), `${JSON.stringify(kept, null, 2)}\n`)
  return file
}

/**
 * `data` checked, each row with an `id`;  throws naming the first problem.
 * - a missing `id` is made from the section, file and line (`q22-UISection-169`), `-2` ... on a clash
 */
export function checkData(data) {
  if (!data || typeof data !== "object") throw new Error("rows:  not a JSON object")
  const sections = data.sections
  if (!Array.isArray(sections) || !sections.length) throw new Error("rows:  no sections")
  if (data.fileColumn !== undefined && typeof data.fileColumn !== "boolean")
    throw new Error(`rows:  fileColumn is true or false:  ${json(data.fileColumn)}`)
  if (data.stacked !== undefined && typeof data.stacked !== "boolean")
    throw new Error(`rows:  stacked is true or false:  ${json(data.stacked)}`)
  for (const section of sections) {
    if (!section?.id || !section.title) throw new Error(`rows:  a section needs an id and a title:  ${json(section)}`)
    if (section.reorder !== undefined && typeof section.reorder !== "boolean")
      throw new Error(`rows:  a section's reorder is true or false:  ${json(section)}`)
  }
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

/** Is `page` a syntax-choices page:  are its rows beside it, or does it name them (`declaredRows()`)? */
export function isChoicesPage(page) {
  return existsSync(rowsFile(page)) || !!declaredRows(page)
}

/**
 * The rows file `page` names on its `<body data-choices-rows="...">`, absolute;  none:  `undefined`.
 * - A docs page whose rows are its own business, e.g. the spell syntax guide's, generated from the code:
 *   its boxes are keyed `<row>.<field>` (`IsGtLt.py`), and `answer` prints them as typed
 * - Said again from `choicesRoutes.ts` (`declaredRows()`), which shares nothing with this file at runtime
 */
export function declaredRows(page) {
  if (!page.endsWith(".html") || !existsSync(page)) return undefined
  const named = /<body\b[^>]*\bdata-choices-rows="([^"]*)"/.exec(readFileSync(page, "utf8"))?.[1]
  return named ? resolve(dirname(page), named) : undefined
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
  if (!existsSync(rowsFile(page))) return formatDeclared(page, title, answer)
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
  lines.push(...formatOrder(sections, rows, answer.order ?? {}))
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

/**
 * The order Owen left each reorderable section's rows in (`reorder: true`), as lines for `formatAnswer()`:  "as
 * proposed", or the rows in his order, each with its place in Claude's (`was 3`).
 * - a section the answer has no order for:  as proposed;  a row it doesn't name:  after the rest, in Claude's order
 */
export function formatOrder(sections, rows, order) {
  const lines = []
  for (const section of sections.filter((each) => each.reorder)) {
    const proposed = rows.filter((row) => row.section === section.id)
    const named = (order[section.id] ?? []).flatMap((id) => proposed.filter((row) => row.id === id))
    const now = [...named, ...proposed.filter((row) => !named.includes(row))]
    if (now.every((row, i) => row === proposed[i])) {
      lines.push(`  Order of ${section.title}:  as proposed`)
      continue
    }
    lines.push(`  Order of ${section.title} (Owen moved rows):`)
    now.forEach((row, i) => {
      const was = proposed.indexOf(row)
      lines.push(`    ${i + 1}. ${row.id}  ${row.recommended}${was === i ? "" : `  (was ${was + 1})`}`)
    })
  }
  return lines
}

/**
 * `answer` to a page naming its own rows (`declaredRows()`) as plain text, for Claude:  the page and when, its rows
 * file, each box Owen changed by its row (`IsGtLt`), then `field  =>  typed`, then the feedback.
 * - What each box held before is in the rows file:  the page's business, not this tool's
 */
function formatDeclared(page, title, answer) {
  const values = answer.values ?? {}
  const lines = [`Choices on "${title}" (${shown(page)}), sent ${answer.answered}:`]
  if (answer.changes) lines[0] += `  (sent ${answer.changes + 1}×)`
  lines.push(`  Rows:  ${declaredRows(page) ?? "(the page names none)"}`)
  const byRow = new Map()
  for (const [id, typed] of Object.entries(values)) {
    const [row, field = ""] = id.split(/\.(.*)/s)
    if (!byRow.has(row)) byRow.set(row, [])
    byRow.get(row).push([field, typed])
  }
  lines.push(`  Changed (${Object.keys(values).length}):`)
  for (const [row, fields] of byRow) {
    lines.push(`    ${row}`)
    for (const [field, typed] of fields) lines.push(`      ${field || "(box)"}  =>  ${typed.trim() || "(blank)"}`)
  }
  if (!byRow.size) lines.push("    (none)")
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
 * What `new --rows` reads:  a whole page as data.  `new` writes `sections` and `rows` (ids filled in), and
 * `fileColumn` when false and `stacked` when true, beside the page as `<slug>.rows.json`;  the rest goes into the page.
 * - `title`, `lede`, `askedBy` (`session <code>x</code>, while ...`);  HTML allowed except in `title`
 * - `fileColumn`:  `false` drops the page's File column, for rows whose place in the code doesn't matter to the
 *   reader (a list of commands, epic `epic-workflow` CM4);  the rows still name their `file` and `line`, which
 *   `answer` / `wait` print for Claude.  Default:  shown
 * - `stacked`:  `true` puts Current and Recommended in one Syntax column, today's text over the box (Owen, 2026-10-11,
 *   the epic command's review page).  Default:  two columns
 * - `where`:  `{ epic, justNow, decides }`, the "Where we are" box, as a details page's
 * - `sections[]`:  `{ id, title, description?, icon?, reorder? }`, in page order;  `description`:  one line saying
 *   which question it answers and the recommended rule;  `` `code` `` in it is shown as code
 *   - `reorder`:  `true` lets Owen put its rows in order (epic `epic-workflow` P15):  each row gets its place and move
 *     up / move down;  the order he leaves goes with the draft and "Do it" (`order`, by section id), and `answer`
 *     prints it.  Its rows start in the data's order, Claude's proposal
 * - `rows[]`:  `{ id?, section, file, line, purpose, current, recommended, note? }`
 *   - `file`:  repo-relative;  `line`:  1-based, current at the branch's HEAD:  the page links `file:line` into VS Code
 *   - `purpose`:  what it's for, in words a reader new to it follows:  1-3 words for a name, or a short sentence
 *     and when it's used, for a command;  `current`:  as a reader sees it at a use site (`this.isOpen()`);
 *     `recommended`:  that use site as Claude would write it (equal to `current` for a row that stays)
 *   - `note`:  a short why, shown under the purpose;  `` `code` `` as in `description`
 * - plain JS:  no type, this comment is the spec
 */

// run as a script (`spell dev choices`), not when a test imports it;  last, so every `const` above is set
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2))
}
