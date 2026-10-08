/**
 * `spell dev details <command>`:  details pages, questions Claude explains on a page and Owen answers ON it (`/details`,
 * `.claude/skills/details/SKILL.md`).
 * - `new <slug> [--title "..."] [--epic <name>] [--description "..."] [--from <questions.json>]` -- a page from
 *   `templates/details.html`;  prints its path.  `--from`:  the whole page from a JSON list of questions
 *   (`DetailsSpec`, below), so a skill with many questions to ask (`/worktrees`, `/bedtime`) needn't hand-write it
 *   - scratch:  `pages/details/<slug>.html`, ignored by version control, swept after 14 days
 *   - `--epic <name>`:  `epics/<name>/details/<slug>.html`, committed with the plan doc
 * - `show <page> [--wait]` -- start the page server if needed, show the page in THIS session's VS Code window (the
 *   right side bar's "Review" view, where Owen answers things;  Chrome outside VS Code;  epic `windows-and-review`
 *   P6, Owen 2026-10-06);  `--wait`:  then `wait`
 * - `wait <page> [--timeout 8h]` -- block until Owen sends an answer NEWER than the wait's start, print it as plain
 *   text, exit 0.  Run it in the BACKGROUND:  its exit wakes the session.  Timeout:  exit 2, saying so.
 * - `answer <page>` -- print the answer already sent (exit 1 if none)
 * - `list` -- every details page, answered or waiting
 * - `sweep [--days 14]` -- delete scratch pages (and their answers) older than that;  never an epic's.  `new` sweeps
 *   first, by itself
 * - `<page>`:  a slug (`pick-layout`), `<epic>/<slug>`, or a path (absolute, or from the root, `pages/` or `packages/docs`)
 * - paths print absolute:  they mean the same in whichever checkout Claude reads them
 * - The answer itself is written by the page server's route module (`scripts/detailsRoutes.ts`) into
 *   `<slug>.answer.json` beside the page.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { basename, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { parseHTML } from "linkedom"

import { ROOT, atDepth, openInVSCode, serialize } from "./pages.js"

/** How long `wait` waits by default:  8 hours (decision D9). */
const DEFAULT_TIMEOUT = "8h"

/** How often `wait` looks for the answer, in ms. */
const POLL = 1000

/** Scratch pages older than this many days go in a `sweep`. */
const SWEEP_DAYS = 14

/** A slug:  lower-kebab-case. */
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** The files `sweep()` deletes:  pages, answers, and a syntax-choices page's rows and draft (`choices.js`). */
const SWEPT = /\.(html|answer\.json|rows\.json|draft\.json)$/

/** Run `spell dev details <argv>`;  the exit code. */
async function main(argv) {
  const { positional, flags } = parseArgs(argv)
  const [command, target] = positional
  try {
    if (command === "new") {
      // scratch pages sweep themselves:  nobody has to remember to
      for (const file of sweep(ROOT, SWEEP_DAYS)) console.error(`swept ${relative(ROOT, file)}`)
      const spec = flags.from ? JSON.parse(readFileSync(findFile(flags.from), "utf8")) : undefined
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
const USAGE = `usage:  spell dev details new <slug> [--title "..."] [--epic <name>] [--description "..."]
        spell dev details show <page> [--wait] [--timeout 8h]
        spell dev details wait <page> [--timeout 8h]
        spell dev details answer <page>
        spell dev details list
        spell dev details sweep [--days 14]`

////////////////
// ## Pages
////////////////

/**
 * Write a new details page `slug` in checkout `docs` (its root:  `pages/details/`, `epics/`, `templates/`) from the
 * template;  its absolute path.
 * - `--epic <name>`:  in that epic's `details/` (the epic must exist);  else the scratch `details/`
 * - sets `<title>`, the h1, the breadcrumb, the description and the "Asked" date;  refuses to overwrite
 */
export function createPage(docs, slug, { title, epic, description, spec } = {}) {
  title ??= spec?.title ?? "Details"
  if (!slug || !SLUG.test(slug)) throw new Error(`a slug is lower-kebab-case:  '${slug ?? ""}'`)
  if (epic && !existsSync(join(docs, "epics", epic))) throw new Error(`no epic '${epic}' (epics/${epic}/)`)
  const folder = epic ? join(docs, "epics", epic, "details") : join(docs, "pages", "details")
  const file = join(folder, `${slug}.html`)
  if (existsSync(file)) throw new Error(`${relative(docs, file)} already exists`)
  const depth = relative(docs, folder).split("/").length
  const { document } = parseHTML(atDepth(readFileSync(join(docs, "templates/details.html"), "utf8"), depth))
  document.querySelector("title").textContent = title
  document.querySelector("h1").textContent = title
  const crumb = document.querySelector("ui-breadcrumb-section[active]")
  if (crumb) crumb.textContent = title
  document.querySelector('meta[name="description"]').setAttribute("content", description ?? `Details:  ${title}`)
  // the date up top, under "Asked by":  the Send bar is the page's bottom, so no footer
  const asked = document.querySelector("[data-details-asked]")
  if (asked) asked.textContent = `Asked:  ${today()}`
  if (spec) fillFromSpec(document, spec)
  mkdirSync(folder, { recursive: true })
  writeFileSync(file, serialize(document))
  return file
}

/**
 * Fill a new page's `document` from `spec` (`DetailsSpec`):  lede, "Asked by", the "Where we are" box, the context,
 * then one question section per question, replacing the template's examples.
 * - text fields are HTML (Claude writes them);  titles and letters go in attributes, escaped
 */
function fillFromSpec(document, spec) {
  // a page that's only a form (`/epic review`'s item picker):  no site header
  if (spec.bare) document.querySelector("spell-site-header")?.remove()
  const lede = document.querySelector("p.lede")
  if (lede && spec.lede) lede.innerHTML = spec.lede
  const asked = document.querySelector('ui-item[icon="comments"]')
  if (asked && spec.askedBy) asked.innerHTML = `Asked by:  ${spec.askedBy}`
  const where = document.querySelector("ui-message.spell-where ul")
  if (where && spec.where) {
    const rows = [
      ["Epic", spec.where.epic],
      ["Just now", spec.where.justNow],
      ["This decides", spec.where.decides]
    ].filter(([, text]) => text)
    where.innerHTML = rows.map(([label, text]) => `<li><b>${label}:</b>  ${text}</li>`).join("")
  }
  const context = document.querySelector("ui-section#context")
  if (context) {
    if (spec.context) context.innerHTML = `<ui-icon slot="icon" name="lightbulb"></ui-icon>${spec.context}`
    else context.remove()
  }
  const example = document.querySelector("ui-section.spell-question")
  const html = (spec.questions ?? []).map((question, i) => questionHtml(question, i)).join("\n")
  if (example) example.outerHTML = html
}

/** One question's section, from a `DetailsSpec` question;  `i`:  its place, for the default id (`q1` ...). */
function questionHtml(question, i) {
  const id = question.id ?? `q${i + 1}`
  const options = (question.options ?? []).map((option, j) => {
    const letter = option.letter ?? String.fromCharCode(65 + j)
    const fold = option.detailsTitle ? ` data-title="${attr(option.detailsTitle)}"` : ""
    const more = option.details ? `<div class="spell-option-details"${fold}>${option.details}</div>` : ""
    const flags = [
      option.recommended && " data-recommended",
      option.checked && " data-checked",
      option.done && " data-done",
      option.badge && ` data-badge="${attr(option.badge)}"`,
      option.badgeColor && ` data-badge-color="${attr(option.badgeColor)}"`,
      option.state && ` data-state-icon="${attr(option.state.icon)}"`,
      option.state?.color && ` data-state-color="${attr(option.state.color)}"`,
      option.state?.label && ` data-state-label="${attr(option.state.label)}"`
    ]
    const summary = option.summary ? `<p>${option.summary}</p>` : ""
    return `<div class="spell-option" data-option="${attr(letter)}" data-title="${attr(option.title ?? letter)}"${flags.filter(Boolean).join("")}>${summary}${option.body ?? ""}${more}</div>`
  })
  const multiple = question.multiple ? " data-multiple" : ""
  const tools = `${question.selectAll ? " data-select-all" : ""}${question.filter ? " data-filter" : ""}${question.moreDetails ? " data-more" : ""}`
  const header = attr(question.title ?? `Q${i + 1}`)
  const text = question.text ? `<p>${question.text}</p>` : ""
  return `<ui-section id="${attr(id)}" class="spell-question" header="${header}" sticky collapsible dividing${multiple}${tools}><ui-icon slot="icon" name="circle question"></ui-icon>${text}${options.join("")}</ui-section>`
}

/** `path` as given:  absolute, else from the checkout's root or `packages/docs` (`yarn workspace` hides where yarn ran). */
function findFile(path) {
  const found = [ROOT, join(ROOT, "packages", "docs")]
    .map((base) => resolve(base, path))
    .find((each) => existsSync(each))
  if (!found) throw new Error(`no file ${path}`)
  return found
}

/** `text` safe in a double-quoted attribute. */
export function attr(text) {
  return String(text).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
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
 * - an option:  `{ letter?, title, summary?, body?, details?, detailsTitle?, recommended?, checked?, done?, badge?,
 *   badgeColor? }`
 *   - letters default to A, B ...
 *   - `summary`:  one line;  `body`:  block HTML after it (the whole text:  long ones clamp to 150px, "Show more")
 *   - `details`:  folded, under `detailsTitle` (default "Details");  only when there IS more than the body
 *   - `checked`:  ticked to start with;  `done`:  hidden under "Open";  `badge` / `badgeColor`:  a label beside the
 *     title;  `state`:  `{ icon, color, label }`, an icon under the tick box (in `ICONS`), `label` on hover
 * - plain JS:  no type, this comment is the spec
 */

/**
 * The details page `target` names under `docs`:  a path, a slug in the scratch `details/`, `<epic>/<slug>`, or a
 * slug in any epic's `details/` (the first found).
 */
export function findPage(docs, target) {
  if (!target) throw new Error("which page?  a slug, a path or <epic>/<slug>")
  // `yarn workspace` sets `INIT_CWD` to `packages/docs`, not where `yarn` was run:  so a path is from the root, `pages/`
  // or the docs package
  const path = [docs, join(docs, "pages"), join(docs, "packages", "docs")]
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
 * - a syntax-choices page's files too (`choices.js`):  its rows and draft
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

/** `<slug>.answer.json` beside page `<slug>.html`. */
export function answerFile(page) {
  return page.replace(/\.html$/, ".answer.json")
}

/** The answer sent for `page`, or `undefined`. */
export function readAnswer(page) {
  const file = answerFile(page)
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : undefined
}

/**
 * Wait for an answer to `page` sent after `since` (ms;  default:  now), checking every `poll` ms;  the answer, or
 * `undefined` once `timeout` ms pass.
 * - newer than `since`:  a page asked again (Owen changed his answer) waits for the NEW one
 */
export async function waitForAnswer(page, { since = Date.now(), timeout, poll = POLL } = {}) {
  const file = answerFile(page)
  const end = Date.now() + timeout
  for (;;) {
    if (existsSync(file) && statSync(file).mtimeMs > since) {
      try {
        return JSON.parse(readFileSync(file, "utf8"))
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
  const title = document.querySelector("h1")?.textContent?.trim() ?? basename(page)
  const lines = [`Answer to "${title}" (${shown(page)}), sent ${answer.answered}:`]
  if (answer.changes) lines[0] += `  (sent ${answer.changes + 1}×)`
  const changed = new Set(answer.changes ? (answer.changed ?? []) : [])
  const isNew = (key) => (changed.has(key) ? "  (new)" : "")
  const questions = [...document.querySelectorAll(".spell-question")]
  const decided = questions.filter((question) => {
    const got = answer.answers?.[question.id]
    return got?.picked?.length || got?.other
  })
  lines.push(`  ${decided.length} of ${questions.length} decided`)
  for (const question of questions) {
    const got = answer.answers?.[question.id] ?? { picked: [] }
    const picked = got.picked.map((letter) => {
      const option = question.querySelector(`.spell-option[data-option="${letter}"]`)
      const recommended = option?.hasAttribute("data-recommended") ? " (recommended)" : ""
      return `${letter} · ${option?.getAttribute("data-title") ?? "?"}${recommended}`
    })
    if (got.other) picked.push(`Other:  ${got.other}`)
    const header = question.getAttribute("header") ?? question.id
    lines.push(`  ${header}:  ${picked.join(";  ") || "(not decided yet)"}${isNew(question.id)}`)
  }
  // "Provide more details" (`moreDetails`):  `<question id>-more`, the options' letters
  for (const question of document.querySelectorAll(".spell-question[data-more]")) {
    const more = answer.answers?.[`${question.id}-more`]?.picked ?? []
    if (more.length)
      lines.push(`  More details wanted on ${question.id}:  ${more.join(", ")}${isNew(`${question.id}-more`)}`)
  }
  // the comment box under each section that isn't a question, and under each option (`q1-B`)
  const comments = Object.entries(answer.comments ?? {})
  if (comments.length) lines.push("  Comments:")
  for (const [id, text] of comments) lines.push(`    ${commentPlace(document, id)}:  ${text}${isNew(`comment:${id}`)}`)
  if (answer.notes) lines.push(`  Notes:  ${answer.notes}${isNew("notes")}`)
  return lines.join("\n")
}

/**
 * Where comment `id` was written, for people:  a section's header (`1.2 What exists today`), or an option's question
 * and title (`Q1 · Revisit's colour, A · Blue`) for `<question id>-<letter>`;  else the id itself.
 */
function commentPlace(document, id) {
  const section = document.getElementById(id)
  if (section) return section.getAttribute("header") ?? id
  const [, question, letter] = /^(.+)-([A-Z])$/.exec(id) ?? []
  const asked = question && document.getElementById(question)
  const option = asked?.querySelector(`.spell-option[data-option="${letter}"]`)
  if (!option) return id
  return `${asked.getAttribute("header") ?? question}, ${letter} · ${option.getAttribute("data-title") ?? "?"}`
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
