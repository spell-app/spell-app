/**
 * `spell dev details <command>`:  details pages, questions Claude explains on a page and Owen answers ON it (`/details`,
 * `.claude/skills/details/SKILL.md`).
 * - `new <slug> [--title "..."] [--epic <name>] [--description "..."] [--from <questions.json>]` --
 *   a page from the tool's own template (`templates/details.html` beside it);  prints its path
 *   - built in the epics pack's `<epic-*>` elements (`answerPages.js`)
 *   - `--from`:  the whole page from a JSON list of questions (`DetailsSpec`, below),
 *     so a skill with many questions to ask (`/worktrees`, `/bedtime`) needn't hand-write it
 *   - scratch:  `pages/details/<slug>.html`, ignored by version control, swept after 14 days
 *   - `--epic <name>`:  `epics/<name>/details/<slug>.html`, committed with the epic page
 * - `show <page> [--wait]` -- start the page server if needed, and show the page in THIS session's VS Code window
 *   - the right side bar's "Review" view, where Owen answers things (epic `windows-and-review` P6, Owen 2026-10-06)
 *   - Chrome outside VS Code
 *   - `--wait`:  then `wait`
 * - `wait <page> [--timeout 8h]` -- block until Owen sends an answer NEWER than the wait's start
 *   - prints it as plain text, exit 0
 *   - run it in the BACKGROUND:  its exit wakes the session
 *   - timeout:  exit 2, saying so
 * - `answer <page>` -- print the answer already sent (exit 1 if none)
 * - `draft <page>` -- print what Owen typed on the page and hasn't sent (exit 1 if nothing):  its draft,
 *   `<slug>.draft.json5`, newer than the answer (epic `epic-workflow` P18).  Run it BEFORE rewriting a page he may
 *   have open:  the page puts the draft back by id, and keeps text whose id the rewrite removes in a box of its own
 * - `list` -- every details page, answered or waiting
 * - `sweep [--days 14]` -- delete scratch pages (and their answers) older than that;  never an epic's
 *   - `new` sweeps first, by itself
 * - `<page>`:  a slug (`pick-layout`), `<epic>/<slug>`, or a path
 *   (absolute, or from the root, `pages/` or `packages/epics`)
 * - paths print absolute:  they mean the same in whichever checkout Claude reads them
 * - The answer itself is written by the page server's route module (`tools/detailsRoutes.ts`) into
 *   `<slug>.answer.json5` beside the page.
 * - Its files are data files (`DataFile`, epic `epic-workflow` P21):  JSON5, read by their old `.json` names too.
 *   - the draft into `<slug>.draft.json5`, which Send deletes
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { basename, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { parseHTML } from "linkedom"

import {
  ASK,
  CHOICES,
  OPTION,
  TOOL_TEMPLATES,
  appendHTML,
  commentBox,
  fillHead,
  fillWords,
  make,
  questionSection
} from "./answerPages.js"
import { DataFile } from "../src/data/DataFile.ts"
import { ROOT, atDepth, openInVSCode, serialize } from "./pages.js"

/** How long `wait` waits by default:  8 hours (decision D9). */
const DEFAULT_TIMEOUT = "8h"

/** How often `wait` looks for the answer, in ms. */
const POLL = 1000

/** Scratch pages older than this many days go in a `sweep`. */
const SWEEP_DAYS = 14

/** A slug:  lower-kebab-case. */
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** The files `sweep()` deletes:  pages, answers, and a choice page's rows and draft (`choices.js`). */
const SWEPT = /\.(html|(answer|rows|draft)\.json5?)$/

/** Run `spell dev details <argv>`;  the exit code. */
async function main(argv) {
  const { positional, flags } = parseArgs(argv)
  const [command, target] = positional
  try {
    if (command === "new") {
      // scratch pages sweep themselves:  nobody has to remember to
      for (const file of sweep(ROOT, SWEEP_DAYS)) console.error(`swept ${relative(ROOT, file)}`)
      const spec = flags.from ? DataFile.parse(readFileSync(findFile(flags.from), "utf8")) : undefined
      console.log(shown(createPage(ROOT, target, { ...flags, spec })))
      return 0
    }
    if (command === "show") {
      const file = findPage(ROOT, target)
      await openInVSCode(file, { view: "review" })
      return flags.wait ? await waitAndPrint(file, flags) : 0
    }
    if (command === "wait") return await waitAndPrint(findPage(ROOT, target), flags)
    if (command === "answer") {
      const file = findPage(ROOT, target)
      const answer = readAnswer(file)
      console.log(answer ? formatAnswer(file, answer) : `no answer yet:  ${shown(file)}`)
      return answer ? 0 : 1
    }
    if (command === "draft") {
      const file = findPage(ROOT, target)
      const draft = readDraft(file)
      console.log(draft ? formatDraft(file, draft) : `nothing typed and not sent:  ${shown(file)}`)
      return draft ? 0 : 1
    }
    if (command === "list") {
      for (const file of listPages(ROOT))
        console.log(`${readAnswer(file) ? "answered" : "waiting "}  ${relative(ROOT, file)}`)
      return 0
    }
    if (command === "sweep") {
      const gone = sweep(ROOT, Number(flags.days ?? SWEEP_DAYS))
      console.log(gone.length ? gone.map((file) => `deleted ${relative(ROOT, file)}`).join("\n") : "nothing to sweep")
      return 0
    }
    console.error(USAGE)
    return 1
  } catch (error) {
    console.error(`details:  ${error.message}`)
    return 1
  }
}

/** `spell dev details` with no or a wrong command. */
const USAGE = `usage:  epic ask new <slug> [--title "..."] [--epic <name>] [--description "..."] [--from <questions.json>]
        epic ask show <page> [--wait] [--timeout 8h]
        epic ask wait <page> [--timeout 8h]
        epic ask answer <page>
        epic ask draft <page>
        epic ask list
        epic ask sweep [--days 14]
(the old spelling, spell dev details, runs the same)`

////////////////
// ## Pages
////////////////

/**
 * Write a new details page `slug` in checkout `docs` (its root:  `pages/details/`, `epics/`) from the tool's template
 * (`answerPages.js` `TOOL_TEMPLATES`);  its absolute path.
 * - `--epic <name>`:  in that epic's `details/` (the epic must exist);  else the scratch `details/`
 * - sets `<title>`, the h1, the breadcrumb, the description and the "Asked" date;  refuses to overwrite
 * - `spec`:  the whole page (`fillFromSpec()`)
 */
export function createPage(docs, slug, { title, epic, description, spec } = {}) {
  title ??= spec?.title ?? "Details"
  if (!slug || !SLUG.test(slug)) throw new Error(`a slug is lower-kebab-case:  '${slug ?? ""}'`)
  if (epic && !existsSync(join(docs, "epics", epic))) throw new Error(`no epic '${epic}' (epics/${epic}/)`)
  const folder = epic ? join(docs, "epics", epic, "details") : join(docs, "pages", "details")
  const file = join(folder, `${slug}.html`)
  if (existsSync(file)) throw new Error(`${relative(docs, file)} already exists`)
  const depth = relative(docs, folder).split("/").length
  const { document } = parseHTML(atDepth(readFileSync(join(TOOL_TEMPLATES, "details.html"), "utf8"), depth))
  // the date up top, under "Asked by":  the notes are the page's bottom, so no footer
  fillHead(document, {
    title,
    description: description ?? `Details:  ${title}`,
    asked: "[data-details-asked]",
    date: today()
  })
  if (spec) fillFromSpec(document, spec)
  mkdirSync(folder, { recursive: true })
  writeFileSync(file, serialize(document))
  return file
}

/**
 * Fill a new page's `document` from `spec` (`DetailsSpec`):  lede, "Asked by", the "Where we are" box, the context,
 * then one question section per question, in place of the template's example (`answerPages.js`
 * `questionSection()`).
 * - text fields are HTML (Claude writes them);  titles and letters go in attributes
 */
function fillFromSpec(document, spec) {
  // a page that's only a form (`/epic review`'s item picker):  no site header
  if (spec.bare) document.querySelector("spell-site-header")?.remove()
  fillWords(document, spec)
  const context = document.querySelector("ui-section#context")
  if (context) {
    if (spec.context)
      context.replaceChildren(
        make(document, "ui-icon", { slot: "icon", name: "lightbulb" }),
        ...appendHTML(document.createElement("div"), spec.context).childNodes,
        commentBox(document, "context")
      )
    else context.remove()
  }
  const example = [...document.querySelectorAll("ui-section")].find((section) => section.querySelector(ASK))
  const sections = (spec.questions ?? []).map((question, i) => questionSection(document, question, i))
  if (example) example.replaceWith(...sections)
}

/**
 * `path` as given:  absolute, else from the checkout's root or `packages/epics`
 * (`yarn workspace` hides where yarn ran).
 */
function findFile(path) {
  const found = [ROOT, join(ROOT, "packages", "epics")]
    .map((base) => resolve(base, path))
    .find((each) => existsSync(each))
  if (!found) throw new Error(`no file ${path}`)
  return found
}

/**
 * What `new --from` reads:  a whole page as data.
 * - `title`, `lede`, `askedBy` (`session <code>x</code>, while ...`);  HTML allowed except in `title`
 * - `where`:  `{ epic, justNow, decides }`, the "Where we are" box (`.claude/skills/details/SKILL.md`, "Writing for Owen")
 * - `context`:  HTML for "1. Context" (the picture);  none:  the section goes
 * - `bare`:  no site header (a page that's only a form)
 * - `questions[]`:  `{ id?, title, text?, multiple?, selectAll?, filter?, options[] }`
 *   - `selectAll`:  "Select all" / "Select none" in its title (with `multiple`)
 *   - `filter`:  "Open | All" in its title;  Open (the default) hides options marked `done`
 *   - `moreDetails`:  a (?) "Provide more details" on each option;  the ones pressed come back as `<id>-more`
 * - an option:
 *   `{ letter?, title, summary?, body?, details?, detailsTitle?, recommended?, checked?, done?, badge?, badgeColor? }`
 *   - letters default to A, B ...
 *   - `summary`:  one line
 *   - `body`:  block HTML after it (the whole text:  the card folds by its chevron)
 *   - `details`:  folded, under `detailsTitle` (default "Details");  only when there IS more than the body
 *   - `checked`:  ticked to start with
 *   - `done`:  hidden under "Open"
 *   - `badge` / `badgeColor`:  a label beside the title
 *   - `state`:  `{ icon, color, label }`, an icon at the end of its header (in `ICONS`), `label` its tooltip
 * - plain JS:  no type, this comment is the spec
 */

/**
 * The details page `target` names under `docs`:  a path, a slug in the scratch `details/`, `<epic>/<slug>`, or a
 * slug in any epic's `details/` (the first found).
 */
export function findPage(docs, target) {
  if (!target) throw new Error("which page?  a slug, a path or <epic>/<slug>")
  // `yarn workspace` sets `INIT_CWD` to `packages/epics`, not where `yarn` was run:
  // so a path is from the root, `pages/` or the epics package
  const path = [docs, join(docs, "pages"), join(docs, "packages", "epics")]
    .map((base) => resolve(base, target))
    .find((each) => existsSync(each))
  if (target.endsWith(".html") && path) return path
  const slug = target.replace(/\.html$/, "")
  const candidates = [join(docs, "pages", "details", `${slug}.html`)]
  if (slug.includes("/")) {
    const [epic, name] = slug.split("/")
    candidates.push(join(docs, "epics", epic, "details", `${name}.html`))
  }
  candidates.push(...listPages(docs).filter((file) => basename(file) === `${basename(slug)}.html`))
  const found = candidates.find((file) => existsSync(file))
  if (!found) throw new Error(`no details page '${target}'`)
  return found
}

/** Every details page under `docs`:  the scratch ones, then each epic's. */
export function listPages(docs) {
  const folders = [join(docs, "pages", "details")]
  const epics = join(docs, "epics")
  if (existsSync(epics)) for (const epic of readdirSync(epics).sort()) folders.push(join(epics, epic, "details"))
  return folders.flatMap((folder) =>
    existsSync(folder)
      ? readdirSync(folder)
          .filter((name) => name.endsWith(".html"))
          .sort()
          .map((name) => join(folder, name))
      : []
  )
}

/**
 * Delete the scratch pages under `docs` last changed more than `days` ago, with their answers;  what went.
 * - only `pages/details/`:  an epic's pages are its record
 * - a choice page's files too (`choices.js`):  its rows and draft
 * - SIDE EFFECT:  deletes files
 */
export function sweep(docs, days, now = Date.now()) {
  const folder = join(docs, "pages", "details")
  if (!existsSync(folder)) return []
  const gone = []
  for (const name of readdirSync(folder)) {
    const file = join(folder, name)
    if (!SWEPT.test(name) || now - statSync(file).mtimeMs < days * 86_400_000) continue
    rmSync(file)
    gone.push(file)
  }
  return gone
}

////////////////
// ## Answers
////////////////

/** `<slug>.answer.json5` beside page `<slug>.html`. */
export function answerFile(page) {
  return DataFile.besidePage(page, "answer")
}

/** The answer sent for `page` (its old `.json` too), or `undefined`. */
export function readAnswer(page) {
  return DataFile.read(answerFile(page))
}

/** `<slug>.draft.json5` beside page `<slug>.html`:  what's typed and not sent (`detailsRoutes.ts`). */
export function draftFile(page) {
  return DataFile.besidePage(page, "draft")
}

/**
 * The draft of `page` NEWER than its answer (an older one was sent already), or `undefined`.
 * - the draft's shape:  `detailsRoutes.ts` `DetailsDraft`
 */
export function readDraft(page) {
  const draft = DataFile.read(draftFile(page))
  if (!draft) return undefined
  const answer = readAnswer(page)
  return !answer || Date.parse(draft.saved) > Date.parse(answer.answered) ? draft : undefined
}

/**
 * `draft` of `page` as plain text, for Claude:  as an answer reads (`formatAnswer()`), under its own first line,
 * "Not sent:  typed on ... (draft saved ...)".
 */
export function formatDraft(page, draft) {
  const [, ...rest] = formatAnswer(page, { ...draft, answered: draft.saved, changes: 0 }).split("\n")
  return [`Not sent:  typed on "${titleOf(page)}" (${shown(page)}), draft saved ${draft.saved}:`, ...rest].join("\n")
}

/**
 * Wait for an answer to `page` sent after `since` (ms;  default:  now), checking every `poll` ms.
 * - returns the answer, or `undefined` once `timeout` ms pass
 * - newer than `since`:  a page asked again (Owen changed his answer) waits for the NEW one
 */
export async function waitForAnswer(page, { since = Date.now(), timeout, poll = POLL } = {}) {
  const file = answerFile(page)
  const end = Date.now() + timeout
  for (;;) {
    const found = DataFile.found(file)
    if (found && statSync(found).mtimeMs > since) {
      try {
        return DataFile.parse(readFileSync(found, "utf8"))
      } catch {
        // mid-write (the route renames a whole file in, so this is unlikely):  look again next time
      }
    }
    if (Date.now() >= end) return undefined
    await new Promise((done) => setTimeout(done, Math.min(poll, Math.max(0, end - Date.now()))))
  }
}

/**
 * `answer` to `page` as plain text, for Claude:  how many questions are decided, each question's title, the options
 * picked (with their titles), Other, the sections' comments, then the notes.
 * - a question with nothing picked:  "(not decided yet)":  Owen sends partial answers, and decides the rest later
 * - sent again:  what's new since the send before is marked "(new)" (`answer.changed`, the route's)
 */
export function formatAnswer(page, answer) {
  const { document } = parseHTML(readFileSync(page, "utf8"))
  const title = titleOf(page, document)
  const lines = [`Answer to "${title}" (${shown(page)}), sent ${answer.answered}:`]
  if (answer.changes) lines[0] += `  (sent ${answer.changes + 1}×)`
  const changed = new Set(answer.changes ? (answer.changed ?? []) : [])
  const isNew = (key) => (changed.has(key) ? "  (new)" : "")
  const questions = [...document.querySelectorAll(ASK)]
  const decided = questions.filter((question) => {
    const got = answer.answers?.[askKey(question)]
    return got?.picked?.length || got?.other
  })
  lines.push(`  ${decided.length} of ${questions.length} decided`)
  for (const question of questions) {
    const key = askKey(question)
    const got = answer.answers?.[key] ?? { picked: [] }
    const picked = got.picked.map((letter) => {
      const option = optionOf(question, letter)
      const recommended = option?.hasAttribute("recommended") ? " (recommended)" : ""
      return `${letter} · ${option?.getAttribute("title") ?? "?"}${recommended}`
    })
    if (got.other) picked.push(`Other:  ${got.other}`)
    lines.push(`  ${askHeader(question)}:  ${picked.join(";  ") || "(not decided yet)"}${isNew(key)}`)
  }
  // "Provide more details" (`moreDetails`):  `<question key>-more`, the options' letters
  for (const question of questions.filter((each) => each.hasAttribute("more-details"))) {
    const key = askKey(question)
    const more = answer.answers?.[`${key}-more`]?.picked ?? []
    if (more.length) lines.push(`  More details wanted on ${key}:  ${more.join(", ")}${isNew(`${key}-more`)}`)
  }
  // the comment box under each section that isn't a question, and under each option (`q1-B`)
  const comments = Object.entries(answer.comments ?? {})
  if (comments.length) lines.push("  Comments:")
  for (const [id, text] of comments) lines.push(`    ${commentPlace(document, id)}:  ${text}${isNew(`comment:${id}`)}`)
  if (answer.notes) lines.push(`  Notes:  ${answer.notes}${isNew("notes")}`)
  // text typed for questions, options or sections a rewrite took off the page (epic `epic-workflow` P18)
  if (answer.kept?.length) lines.push(`  Kept from before the page changed:${isNew("kept")}`)
  for (const { id, label, text } of answer.kept ?? []) lines.push(`    ${label} (${id}):  ${text}`)
  return lines.join("\n")
}

/** `page`'s title, its h1 (`document`:  the page, parsed);  else its file's name. */
function titleOf(page, document = parseHTML(readFileSync(page, "utf8")).document) {
  return document.querySelector("h1")?.textContent?.trim() ?? basename(page)
}

/**
 * Where comment `id` was written, for people:  a section's header (`1.2 What exists today`), or an option's question
 * and title (`Q1 · Revisit's colour, A · Blue`) for `<question id>-<letter>`;  else the id itself.
 */
function commentPlace(document, id) {
  const section = document.getElementById(id)
  if (section) return section.getAttribute("header") ?? id
  // a letter is `B`, or the item picker's item id (`J7`)
  const [, key, letter] = /^(.+)-([A-Z][A-Za-z0-9]*)$/.exec(id) ?? []
  const question = key && [...document.querySelectorAll(ASK)].find((each) => askKey(each) === key)
  const option = question && optionOf(question, letter)
  if (!option) return id
  return `${askHeader(question)}, ${letter} · ${option.getAttribute("title") ?? "?"}`
}

/** A question's (`<epic-ask>`) key:  its `name`, else its section's id, as the element works it out. */
export function askKey(question) {
  return question.getAttribute("name") ?? question.closest("ui-section[id]")?.id ?? ""
}

/** A question's title, for people:  its section's `header` (`Q1 · Which layout?`), else its key. */
function askHeader(question) {
  return question.closest("ui-section[id]")?.getAttribute("header") ?? askKey(question)
}

/** Option `letter` of question `question`:  its own options only, not one quoted in an option's text. */
function optionOf(question, letter) {
  return [...question.children]
    .filter((child) => child.localName === CHOICES)
    .flatMap((choices) => [...choices.children])
    .find((child) => child.localName === OPTION && child.getAttribute("letter") === letter)
}

/** `wait`:  wait for `file`'s answer, print it;  exit code 0, or 2 on timeout. */
async function waitAndPrint(file, flags) {
  const timeout = duration(flags.timeout ?? DEFAULT_TIMEOUT)
  console.log(`waiting for an answer on ${shown(file)} (up to ${flags.timeout ?? DEFAULT_TIMEOUT})`)
  const answer = await waitForAnswer(file, { timeout })
  if (!answer) {
    console.log(`no answer yet after ${flags.timeout ?? DEFAULT_TIMEOUT}:  ${shown(file)}`)
    return 2
  }
  console.log(formatAnswer(file, answer))
  return 0
}

////////////////
// ## Helpers
////////////////

/** `"8h"`, `"30m"`, `"90s"`, `"1h30m"` in ms. */
export function duration(text) {
  const parts = [...String(text).matchAll(/(\d+(?:\.\d+)?)\s*(h|m|s)/g)]
  if (!parts.length) throw new Error(`a duration is like 8h, 30m or 1h30m:  '${text}'`)
  const unit = { h: 3_600_000, m: 60_000, s: 1000 }
  return parts.reduce((total, [, amount, which]) => total + Number(amount) * unit[which], 0)
}

/** `file` as printed:  absolute, so it means the same wherever Claude reads it. */
export function shown(file) {
  return resolve(file)
}

/** Today, `YYYY-MM-DD`, local time. */
export function today() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

/** `--key value` flags (`--wait` alone is `true`), plus everything else in order;  flags go AFTER the page. */
export function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) positional.push(argv[i])
    else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) flags[argv[i].slice(2)] = argv[++i]
    else flags[argv[i].slice(2)] = true
  }
  return { positional, flags }
}

// run as a script (`spell dev details`), not when a test imports it;  last, so every `const` above is set
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2))
}
