/**
 * MIGRATE the docs' pages, by page KIND (epic `epic-workflow`, P8;  J44):  each kind's named, dated, idempotent steps,
 * oldest first, on each page of that kind, under its lock;  a report per page that changed.
 * - the epic page's steps are the plan-doc tool's (`$/epics/tool/migrations`, `Migrations`):  this file holds the
 *   OTHER kinds', and `spell dev plan-doc migrate` runs it as a child for them (`MigrateCommands`)
 * - `KINDS`:  every page kind, the same list as `PAGE_KINDS` in `$/epics/tool/migrations` (`migrate.test.ts` checks)
 * - `pageKind()`:  which kind a page is, from where it lives and what it loads
 * - `STEPS`:  the steps.  Today's one-off fixers, as steps of their kind:
 *   - `ui-section`:  `to-ui-section.js`, old `section.s2|s3` sections to `<ui-section>`
 *   - `answer-elements`:  `to-answer-elements.js`, a details or syntax-choices page (and the old shared templates of
 *     both) in the epics pack's elements, its old page script gone (epic `epic-workflow` P12)
 *   - NOT the shared-content repair (`relocate.js`):  it moves files between folders rather than fixing a page's
 *     markup, and `spell dev shared commit` runs its reorg every turn already
 * - A new step:  an entry in `STEPS`, LAST, in the same commit as the markup change it follows;  it must change
 *   nothing on a page it has migrated already, and keep every word
 * - `node tools/migrate.js [--root <checkout>] [<kind>] [--file <page>] [--step <name>] [--dry-run] [--list]`:
 *   every kind with steps, or one kind;  one page (`--file`, its kind found unless given);  `--list`:  the steps
 */
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs"
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path"
import { pathToFileURL } from "node:url"

import { parseHTML } from "linkedom"

import { TOOL_TEMPLATES } from "./answerPages.js"
import { checkData, rowsFile } from "./choices.js"
import { listPages } from "./details.js"
import { findPages, pageFile, parseArgs, ROOT, serialize, tidy } from "./pages.js"
import { withLocks } from "./relocate.js"
import { convertChoicesPage, convertDetailsPage, needsConversion } from "./to-answer-elements.js"
import { convertSections } from "./to-ui-section.js"

/** Every page kind, by the names P14 proposes:  `$/epics/tool/migrations` `PAGE_KINDS`, kept the same. */
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
        if (!existsSync(rows)) return { changed: false, notes: [`SKIPPED:  no ${basename(rows)} beside it`] }
        return convertChoicesPage(document, checkData(JSON.parse(readFileSync(rows, "utf8"))))
      }
      return convertDetailsPage(document)
    }
  }
]

/**
 * Which kind page `file` is (`KINDS`), from where it lives in checkout `root` and what it loads.
 * - a details page with `<slug>.rows.json` beside it is a choice page;  a review page counts as a detail page
 * - under `guides/`:  a page loading `commands.js` is a command page, one with a card filter a cheatsheet
 */
export function pageKind(file, root = ROOT, html = existsSync(file) ? readFileSync(file, "utf8") : "") {
  const path = relative(root, file).split(sep).join("/")
  if (/(^|\/)details\//.test(path)) return existsSync(file.replace(/\.html$/, ".rows.json")) ? "choice" : "detail"
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
 * every details and syntax-choices page (`details.js` `listPages()`:  `findPages()` skips `details/` folders),
 * as `{ file, kind }`, sorted;  epic pages, goal sets, brand and component pages left out (no step is for them).
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
      `${kind} pages:  ${changed} of ${pages} ${dryRun ? "would change" : "changed"}${byStep ? ` (${byStep})` : ""}`
    )
  }
  return lines
}

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
    if (kind === "epic") throw new MigrateError("epic pages are the plan-doc tool's:  spell dev plan-doc migrate epic")
    if (flags.list) {
      for (const step of STEPS.filter((each) => !kind || each.kinds.includes(kind)))
        say(`${step.kinds.join(",").padEnd(11)} ${step.date}  ${step.name.padEnd(24)} ${step.description}`)
      return 0
    }
    const step = typeof flags.step === "string" ? flags.step : undefined
    let pages
    if (typeof flags.file === "string") {
      const file = fileOf(flags.file, root)
      if (!existsSync(file)) throw new MigrateError(`no page ${flags.file}`)
      const found = kind ?? pageKind(file, root)
      if (found === "epic") throw new MigrateError("an epic page:  spell dev plan-doc migrate --file <page>")
      pages = [{ file, kind: found }]
    } else pages = pagesFor(root, kind)
    if (kind && !stepsFor(kind, step).length) {
      say(`${kind} pages:  no steps${step ? ` called ${step}` : ""} for them yet`)
      return 0
    }
    const dryRun = Boolean(flags["dry-run"])
    const { results } = migratePages(pages, { step, dryRun })
    for (const line of report(results, root, { dryRun, all: typeof flags.file === "string" })) say(line)
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
