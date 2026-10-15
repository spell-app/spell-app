/**
 * MIGRATE the docs' pages, by page KIND (epic `epic-workflow`, P8;  J44):  each kind's named, dated, idempotent steps,
 * oldest first, on each page of that kind, under its lock;  a report per page that changed.
 * - the epic page's steps are the `epic` tool's (`$/epics/tool/migrations`, `Migrations`):  this file holds the
 *   OTHER kinds', and `spell dev plan-doc migrate` runs it as a child for them (`MigrateCommands`)
 * - `KINDS`:  every page kind, the same list as `PAGE_KINDS` in `$/epics/tool/migrations` (`migrate.test.ts` checks)
 * - `pageKind()`:  which kind a page is, from where it lives and what it loads
 * - `STEPS`:  the steps.  Today's one-off fixers, as steps of their kind:
 *   - `ui-section`:  `to-ui-section.js`, old `section.s2|s3` sections to `<ui-section>`
 *   - `answer-elements`:  `to-answer-elements.js`, a details or choice page (and the old shared templates of
 *     both) in the epics pack's elements, its old page script gone (epic `epic-workflow` P12)
 *   - NOT the shared-content repair (`relocate.js`):  it moves files between folders rather than fixing a page's
 *     markup, and `spell dev shared commit` runs its reorg every turn already
 * - `DATA_FILES`, beside the steps:  the tooling's data files outside the epics' folders renamed `.json` -> `.json5`
 *   (epic `epic-workflow` P21;  `dataFileMoves()`), and every page's links to a data file by its old name, but an epic
 *   page's (`dataFileLinks()`).  Not a page kind's step:  it renames files, and touches only links.  An epic's own
 *   files and links are its page's step, `json5-data-files` (`$/epics/tool/migrations`)
 * - A new step:  an entry in `STEPS`, LAST, in the same commit as the markup change it follows;  it must change
 *   nothing on a page it has migrated already, and keep every word
 * - `node tools/migrate.js [--root <checkout>] [<kind>] [--file <page>] [--step <name>] [--dry-run] [--list]`:
 *   every kind with steps, or one kind;  one page (`--file`, its kind found unless given);  `--list`:  the steps
 *   - the data files' renames run with every kind (no `<kind>`, no `--file`), or alone with `--step json5-data-files`
 */
import { existsSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs"
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path"
import { pathToFileURL } from "node:url"

import { parseHTML } from "linkedom"

import { DataFile } from "../src/data/DataFile.ts"
import { TOOL_TEMPLATES } from "./answerPages.js"
import { checkData, rowsFile } from "./choices.js"
import { listPages } from "./details.js"
import { findPages, pageFile, parseArgs, ROOT, serialize, tidy } from "./pages.js"
import { withLocks } from "./relocate.js"
import { convertChoicesPage, convertDetailsPage, needsConversion } from "./to-answer-elements.js"
import { convertSections } from "./to-ui-section.js"

/**
 * Every page kind, by its key:  `$/epics/tool/migrations` `PAGE_KINDS`, kept the same.
 * - keys, typed on the command line (`epic migrate detail`);  what's printed is the kind's name (`KIND_NAMES`)
 */
export const KINDS = [
  "epic",
  "goal",
  "guide",
  "cheatsheet",
  "command",
  "changelog",
  "template",
  "home",
  "list",
  "detail",
  "choice",
  "component",
  "brand",
  "goal-set"
]

/** Each kind's name, as people read it (Owen, 2026-10-14, epic `epic-workflow` P14), where it isn't its key. */
const KIND_NAMES = {
  epic: "epic page",
  goal: "saga page",
  command: "commands page",
  home: "home page",
  list: "list page",
  detail: "details page",
  choice: "choice page",
  component: "components page",
  brand: "brand page",
  "goal-set": "saga page (parked)"
}

/** The kind `kind`'s pages, in words:  `details pages`, `guides`. */
function kindPages(kind) {
  const name = KIND_NAMES[kind] ?? kind
  return name.replace(/^(\S+ page|\S+)/, "$1s")
}

/**
 * The steps, oldest first:  `{ name, date, kinds, description, applies(html), run(document) }`.
 * - `applies(html)`:  a cheap test on the page's text, so a page with nothing to do isn't parsed
 * - `run(document, { file })`:  changes the page IN PLACE (`file`:  its path, for what lies beside it);  returns
 *   `{ changed, notes }`, `notes` one line each
 */
export const STEPS = [
  {
    name: "ui-section",
    date: "2026-10-02",
    kinds: ["guide", "cheatsheet", "command", "changelog", "template", "home", "list"],
    description: "old `section.s2|s3` sections become `<ui-section>`, ids kept (to-ui-section.js)",
    applies: (html) => /<section\b[^>]*\bclass="[^"]*\bs[23]\b/.test(html),
    run(document) {
      const report = convertSections(document)
      const notes = [
        ...report.slotHeaders.map((id) => `#${id}:  a title with markup, now slot="header"`),
        ...report.droppedIds.map((id) => `#${id}:  a section id dropped (the heading's id wins)`),
        ...report.levels.map((level) => `level set:  ${level}`),
        ...report.skipped.map((html) => `SKIPPED (not section > ui-sticky > h2|h3[id]):  ${html}`)
      ]
      return { changed: report.converted > 0, notes: [`${report.converted} sections -> <ui-section>`, ...notes] }
    }
  },
  {
    name: "answer-elements",
    date: "2026-10-14",
    kinds: ["detail", "choice", "template"],
    description:
      "a page Owen answers on, in the epics pack's elements:  its old page script gone (to-answer-elements.js, epic-workflow P12)",
    applies: needsConversion,
    run(document, { file }) {
      // the old shared templates:  the tools read their own since P12, so these become copies of them
      const template = /(?:^|\/)templates\/(details|syntax-choices)\.html$/.exec(file.split(sep).join("/"))?.[1]
      if (template) {
        const { document: fresh } = parseHTML(readFileSync(join(TOOL_TEMPLATES, `${template}.html`), "utf8"))
        document.documentElement.replaceWith(fresh.documentElement)
        return { changed: true, notes: [`now a copy of the tool's own template (tools/templates/${template}.html)`] }
      }
      if (document.querySelector('script[src$="syntax-choices.js"]')) {
        const rows = rowsFile(file)
        if (!DataFile.exists(rows)) return { changed: false, notes: [`SKIPPED:  no ${basename(rows)} beside it`] }
        return convertChoicesPage(document, checkData(DataFile.read(rows)))
      }
      return convertDetailsPage(document)
    }
  }
]

/**
 * Which kind page `file` is (`KINDS`), from where it lives in checkout `root` and what it loads.
 * - a details page with `<slug>.rows.json5` (or its old `.json`) beside it is a choice page;  a review page counts as
 *   a details page
 * - under `guides/`:  a page loading `commands.js` is a commands page, one with a card filter a cheatsheet
 */
export function pageKind(file, root = ROOT, html = existsSync(file) ? readFileSync(file, "utf8") : "") {
  const path = relative(root, file).split(sep).join("/")
  if (/(^|\/)details\//.test(path)) return DataFile.exists(rowsFile(file)) ? "choice" : "detail"
  if (/^epics\/([^/]+)\/\1(\.plan)?\.html$/.test(path) || /<epic-page\b/.test(html)) return "epic"
  if (/\.goal\.html$/.test(path)) return "goal"
  if (path === "pages/index.html") return "home"
  if (/^(epics|guides|templates|brand)\/index\.html$/.test(path)) return "list"
  if (path.startsWith("goals/") || path.startsWith("templates/goals/")) return "goal-set"
  if (path.startsWith("templates/")) return "template"
  if (path.startsWith("brand/")) return "brand"
  if (path.startsWith("ui/")) return "component"
  if (path === "guides/changelog.html") return "changelog"
  if (/\bcommands\.js\b/.test(html)) return "command"
  if (/\bclass="[^"]*\bspell-filter\b/.test(html)) return "cheatsheet"
  return "guide"
}

/** The steps for `kind`, oldest first (or just `step`);  throws for a step that isn't one. */
export function stepsFor(kind, step) {
  if (step && !STEPS.some((each) => each.name === step)) throw new MigrateError(`no step "${step}" (--list lists them)`)
  return STEPS.filter((each) => each.kinds.includes(kind) && (!step || each.name === step))
}

/**
 * The pages of checkout `root` that some step is for:  every page of the docs' areas, the Brand list page too, and
 * every details and choice page (`details.js` `listPages()`:  `findPages()` skips `details/` folders),
 * as `{ file, kind }`, sorted;  epic pages, goal sets, brand and components pages left out (no step is for them).
 * - `kind`:  only that kind
 */
export function pagesFor(root, kind) {
  const areas = ["pages", "guides", "templates", "epics"].map((area) => join(root, area))
  const found = [...findPages(areas), join(root, "brand", "index.html"), ...listPages(root)]
  const files = [...new Set(found)].filter((file) => existsSync(file)).sort((one, other) => one.localeCompare(other))
  return files
    .map((file) => ({ file, kind: pageKind(file, root) }))
    .filter((page) => (kind ? page.kind === kind : STEPS.some((step) => step.kinds.includes(page.kind))))
}

/**
 * Migrate `pages` (`{ file, kind }`):  each one's steps, oldest first (or just `step`), each page under its lock;
 * returns `{ results, written }`:  `results` one per page, `{ file, kind, ran, notes }`.
 * - `dryRun`:  the same results, nothing written
 * - `tidied`:  tidy what it wrote, as every tool that writes a page does (link targets, oxfmt;  `pages.js` `tidy()`)
 */
export function migratePages(pages, { step, dryRun = false, tidied = true } = {}) {
  const results = []
  const written = []
  for (const { file, kind } of pages) {
    const steps = stepsFor(kind, step)
    const html = readFileSync(file, "utf8")
    if (!steps.some((each) => each.applies(html))) {
      results.push({ file, kind, ran: [], notes: [] })
      continue
    }
    const result = withLocks(dryRun ? [] : [file], () => {
      const { document } = parseHTML(readFileSync(file, "utf8"))
      const ran = []
      const notes = []
      for (const each of steps) {
        const done = each.run(document, { file })
        if (!done.changed) continue
        ran.push(each.name)
        notes.push(...done.notes.map((note) => `${each.name}:  ${note}`))
      }
      if (ran.length && !dryRun) {
        writeFileSync(file, serialize(document))
        written.push(file)
      }
      return { file, kind, ran, notes }
    })
    results.push(result)
  }
  if (tidied && written.length && !tidy(written)) throw new MigrateError("tidying the migrated pages failed (above)")
  return { results, written }
}

/** The report's lines:  one per page that changed (each with its notes), then one per kind. */
export function report(results, root, { dryRun = false, all = false } = {}) {
  const lines = []
  const kinds = new Map()
  for (const { file, kind, ran, notes } of results) {
    const counts = kinds.get(kind) ?? { pages: 0, changed: 0, steps: new Map() }
    kinds.set(kind, counts)
    counts.pages++
    if (!ran.length) {
      if (all) lines.push(`${relative(root, file)}:  up to date`)
      continue
    }
    counts.changed++
    for (const each of ran) counts.steps.set(each, (counts.steps.get(each) ?? 0) + 1)
    lines.push(`${relative(root, file)}:  ${dryRun ? "would run " : ""}${ran.join(", ")}`)
    for (const note of notes) lines.push(`  ${note}`)
  }
  for (const [kind, { pages, changed, steps }] of kinds) {
    const byStep = [...steps].map(([each, n]) => `${each} ${n}`).join(", ")
    lines.push(
      `${kindPages(kind)}:  ${changed} of ${pages} ${dryRun ? "would change" : "changed"}${byStep ? ` (${byStep})` : ""}`
    )
  }
  return lines
}

/**
 * The DATA FILES' renames (epic `epic-workflow` P21):  the tooling's data files in checkout `root` still named
 * `.json`, outside the epics' own folders (those are their page's step, `json5-data-files`), as `DataFile.moveOf()`
 * gives them (`{ from, to, clash }`), sorted.  The files:
 * - the docs home's:  the tooling home and the starred epics (`epics/home.json`, `epics/favorites.json`)
 * - the sagas' list (`sagas/sagas.json`), and a saga page's review inbox
 * - a docs page's comments (`<page>.inbox.json` beside it):  in `guides/`, `pages/`, a component set's `docs/`
 * - a scratch details page's answer, draft and rows (`pages/details/`)
 * - a commands page's data (`<page>.json` beside a page loading `commands.js`), and its template's
 * - the choice page template's example rows (`templates/syntax-choices.rows.json`)
 */
export function dataFileMoves(root) {
  const found = [
    ...["epics/home.json", "epics/favorites.json", "sagas/sagas.json", "templates/syntax-choices.rows.json"].map(
      (path) => join(root, path)
    ),
    ...filesUnder(join(root, "sagas"), INBOX),
    ...filesUnder(join(root, "guides"), INBOX),
    ...filesUnder(join(root, "pages"), INBOX),
    ...filesUnder(join(root, "pages", "details"), DETAILS_DATA),
    ...COMMAND_FOLDERS.flatMap((folder) => filesUnder(join(root, folder), /\.json$/)).filter(isCommandsData),
    ...readdirOr(join(root, "packages")).flatMap((name) => filesUnder(join(root, "packages", name, "docs"), INBOX))
  ]
  return [...new Set(found)]
    .filter((file) => existsSync(file))
    .sort((one, other) => one.localeCompare(other))
    .map((file) => DataFile.moveOf(file))
}

/** Rename `moves` (`dataFileMoves()`), each under its new name's lock, the one its writers take;  the renamed ones. */
export function renameDataFiles(moves) {
  return moves.filter((move) => withLocks([move.to], () => DataFile.rename(move)))
}

/**
 * Point every page's links to a data file by its old name at its new one (`DataFile.linkFor()`), in checkout `root`:
 * guides, details and choice pages, templates, saga pages, the list pages ...;  NOT an epic page or its parts (its
 * own step's, `json5-data-files`).  Returns `{ file, links }` for each page with any, sorted.
 * - only the links' text changes, every other byte kept;  each page under its lock
 * - `dryRun`:  the same count, nothing written
 */
export function dataFileLinks(root, { dryRun = false } = {}) {
  const pages = LINKING_FOLDERS.flatMap((folder) => filesUnder(join(root, folder), /\.html$/)).filter(
    (file) => !EPIC_PAGE.test(relative(root, file).split(sep).join("/"))
  )
  const changed = []
  for (const file of pages.sort((one, other) => one.localeCompare(other))) {
    const links = withLocks(dryRun ? [] : [file], () => {
      let count = 0
      const before = readFileSync(file, "utf8")
      const after = before.replace(HREF, (whole, open, href, close) => {
        const to = DataFile.linkFor(href, dirname(file), root)
        if (to === undefined) return whole
        count++
        return `${open}${to}${close}`
      })
      if (count && !dryRun) writeFileSync(file, after)
      return count
    })
    if (links) changed.push({ file, links })
  }
  return changed
}

/** The data files' report:  what was (or would be) renamed, what's left with both names there, the links. */
function dataFilesReport(moves, links, root, { dryRun = false } = {}) {
  const renamed = moves.filter((move) => !move.clash)
  const clashes = moves.filter((move) => move.clash)
  const linked = links.reduce((sum, page) => sum + page.links, 0)
  return [
    ...renamed.map((move) => `${relative(root, move.from)}:  ${dryRun ? "would be " : ""}renamed ${basename(move.to)}`),
    ...clashes.map(
      (move) => `${relative(root, move.from)}:  LEFT, ${basename(move.to)} is there too (merge them by hand)`
    ),
    ...links.map(
      ({ file, links: n }) =>
        `${relative(root, file)}:  ${dryRun ? "would point " : ""}${n} link${n === 1 ? "" : "s"} to .json5`
    ),
    `data files:  ${renamed.length} ${dryRun ? "would be renamed" : "renamed"} .json -> .json5${clashes.length ? `, ${clashes.length} left` : ""};  ` +
      `${linked} link${linked === 1 ? "" : "s"} in ${links.length} page${links.length === 1 ? "" : "s"}`
  ]
}

/** Run the data files' pass in checkout `root` (renames, then links), and say what it did. */
function migrateDataFiles(root, { dryRun = false } = {}, say) {
  const moves = dataFileMoves(root)
  if (!dryRun) renameDataFiles(moves)
  const links = dataFileLinks(root, { dryRun })
  for (const line of dataFilesReport(moves, links, root, { dryRun })) say(line)
}

/** The files under `folder` (any depth, never a split epic page's `parts/`, experiments or packages) matching `pattern`. */
function filesUnder(folder, pattern) {
  let names
  try {
    names = readdirSync(folder, { recursive: true, encoding: "utf8" })
  } catch {
    return []
  }
  return names.filter((name) => pattern.test(name) && !NOT_PAGES.test(name)).map((name) => join(folder, name))
}

/** The names in `folder`;  none when there's no folder. */
function readdirOr(folder) {
  return existsSync(folder) ? readdirSync(folder) : []
}

/** Is `file` a commands page's data:  `<page>.json` beside a `<page>.html` that loads `commands.js`? */
function isCommandsData(file) {
  const page = file.replace(/\.json$/, ".html")
  return existsSync(page) && /\bcommands\.js\b/.test(readFileSync(page, "utf8"))
}

/** A page's old-named review or comments inbox. */
const INBOX = /\.inbox\.json$/

/** A details page's old-named answer (an archived round's too), draft or rows. */
const DETAILS_DATA = /\.(answer|draft|rows)\.json$/

/** Where commands pages and their template live. */
const COMMAND_FOLDERS = ["guides", "templates"]

/** The shared folders whose pages may link a data file. */
const LINKING_FOLDERS = ["epics", "guides", "pages", "templates", "sagas", "brand"]

/** An epic page, from the checkout's root:  `epics/<name>/<name>.plan.html` (or an older `<name>.html`). */
const EPIC_PAGE = /^epics\/([^/]+)\/\1(\.plan)?\.html$/

/** A link's address in a page's text:  `href="..."`, in its three parts. */
const HREF = /(\bhref=")([^"]*)(")/g

/** What's under a docs folder but no page's:  a split epic page's bodies, experiments, installed packages. */
const NOT_PAGES = /(^|\/)(parts|experiments|node_modules)(\/|$)/

/** The data files' renames, as `--step` and `--list` name them:  the epic page's step's name. */
const DATA_FILES = "json5-data-files"

/** A problem to say, not a stack trace:  exit 2. */
export class MigrateError extends Error {}

/** Page argument `page`:  absolute as is, else from `root`, else as `pages.js` `pageFile()` reads it. */
function fileOf(page, root) {
  if (isAbsolute(page)) return page
  const there = resolve(root, page)
  return existsSync(there) ? there : pageFile(page)
}

/**
 * The command line, `argv` after the script:  prints with `say(line)`;  returns the exit code (2:  a usage problem,
 * said on stderr).
 * - returns rather than exits:  `process.exit()` cuts off output still on its way down a pipe
 */
export function main(argv, say = (line) => process.stdout.write(`${line}\n`)) {
  const { positional, flags } = parseArgs(argv)
  const root = resolve(typeof flags.root === "string" ? flags.root : ROOT)
  const [kind] = positional
  try {
    if (kind && !KINDS.includes(kind)) throw new MigrateError(`no page kind "${kind}":  ${KINDS.join(", ")}`)
    if (kind === "epic") throw new MigrateError("epic pages are the `epic` tool's:  epic migrate epic")
    if (flags.list) {
      for (const step of STEPS.filter((each) => !kind || each.kinds.includes(kind)))
        say(`${step.kinds.join(",").padEnd(11)} ${step.date}  ${step.name.padEnd(24)} ${step.description}`)
      if (!kind)
        say(`${"data-files".padEnd(11)} 2026-10-14  ${DATA_FILES.padEnd(24)} the docs' data files:  .json -> .json5`)
      return 0
    }
    const step = typeof flags.step === "string" ? flags.step : undefined
    const dryRun = Boolean(flags["dry-run"])
    const dataFiles = !kind && typeof flags.file !== "string" && (!step || step === DATA_FILES)
    if (step === DATA_FILES) {
      if (!dataFiles) throw new MigrateError(`${DATA_FILES} renames files, not pages:  no <kind>, no --file`)
      migrateDataFiles(root, { dryRun }, say)
      return 0
    }
    let pages
    if (typeof flags.file === "string") {
      const file = fileOf(flags.file, root)
      if (!existsSync(file)) throw new MigrateError(`no page ${flags.file}`)
      const found = kind ?? pageKind(file, root)
      if (found === "epic") throw new MigrateError("an epic page:  epic migrate --file <page>")
      pages = [{ file, kind: found }]
    } else pages = pagesFor(root, kind)
    if (kind && !stepsFor(kind, step).length) {
      say(`${kindPages(kind)}:  no steps${step ? ` called ${step}` : ""} for them yet`)
      return 0
    }
    const { results } = migratePages(pages, { step, dryRun })
    for (const line of report(results, root, { dryRun, all: typeof flags.file === "string" })) say(line)
    if (dataFiles) migrateDataFiles(root, { dryRun }, say)
    return 0
  } catch (error) {
    if (!(error instanceof MigrateError)) throw error
    process.stderr.write(`migrate:  ${error.message}\n`)
    return 2
  }
}

// by real path:  node runs a script reached through a link by its real one
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href)
  process.exitCode = main(process.argv.slice(2))
