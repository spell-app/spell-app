/**
 * `yarn details <command>`:  details pages, questions Claude explains on a page and Owen answers ON it (`/details`,
 * `.claude/skills/details/SKILL.md`).
 * - `new <slug> [--title "..."] [--epic <name>] [--description "..."] [--from <questions.json>]` -- a page from
 *   `templates/details.html`;  prints its path.  `--from`:  the whole page from a JSON list of questions
 *   (`DetailsSpec`, below), so a skill with many questions to ask (`/worktrees`, `/bedtime`) needn't hand-write it
 *   - scratch:  `packages/docs/details/<slug>.html`, ignored by version control, swept after 14 days
 *   - `--epic <name>`:  `packages/docs/epics/<name>/details/<slug>.html`, committed with the plan doc
 * - `show <page> [--wait]` -- start the page server if needed, show the page in THIS session's VS Code window (the
 *   right side bar's "Spell Docs" view;  Chrome outside VS Code);  `--wait`:  then `wait`
 * - `wait <page> [--timeout 8h]` -- block until Owen sends an answer NEWER than the wait's start, print it as plain
 *   text, exit 0.  Run it in the BACKGROUND:  its exit wakes the session.  Timeout:  exit 2, saying so.
 * - `answer <page>` -- print the answer already sent (exit 1 if none)
 * - `list` -- every details page, answered or waiting
 * - `sweep [--days 14]` -- delete scratch pages (and their answers) older than that;  never an epic's.  `new` sweeps
 *   first, by itself
 * - `<page>`:  a slug (`pick-layout`), `<epic>/<slug>`, or a path (absolute, or from `packages/docs` or the root)
 * - paths print absolute:  they mean the same in whichever checkout Claude reads them
 * - The answer itself is written by the page server's route module (`scripts/detailsRoutes.ts`) into
 *   `<slug>.answer.json` beside the page.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { basename, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { parseHTML } from "linkedom"

import { DOCS, atDepth, openInVSCode, serialize } from "./pages.js"

/** How long `wait` waits by default:  8 hours (decision D9). */
const DEFAULT_TIMEOUT = "8h"

/** How often `wait` looks for the answer, in ms. */
const POLL = 1000

/** Scratch pages older than this many days go in a `sweep`. */
const SWEEP_DAYS = 14

/** A slug:  lower-kebab-case. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Run `yarn details <argv>`;  the exit code. */
async function main(argv) {
  const { positional, flags } = parseArgs(argv)
  const [command, target] = positional
  try {
    if (command === "new") {
      // scratch pages sweep themselves:  nobody has to remember to
      for (const file of sweep(DOCS, SWEEP_DAYS)) console.error(`swept ${relative(DOCS, file)}`)
      const spec = flags.from ? JSON.parse(readFileSync(findFile(flags.from), "utf8")) : undefined
      console.log(shown(createPage(DOCS, target, { ...flags, spec })))
      return 0
    }
    if (command === "show") {
      const file = findPage(DOCS, target)
      await openInVSCode(file)
      return flags.wait ? await waitAndPrint(file, flags) : 0
    }
    if (command === "wait") return await waitAndPrint(findPage(DOCS, target), flags)
    if (command === "answer") {
      const file = findPage(DOCS, target)
      const answer = readAnswer(file)
      console.log(answer ? formatAnswer(file, answer) : `no answer yet:  ${shown(file)}`)
      return answer ? 0 : 1
    }
    if (command === "list") {
      for (const file of listPages(DOCS))
        console.log(`${readAnswer(file) ? "answered" : "waiting "}  ${relative(DOCS, file)}`)
      return 0
    }
    if (command === "sweep") {
      const gone = sweep(DOCS, Number(flags.days ?? SWEEP_DAYS))
      console.log(gone.length ? gone.map((file) => `deleted ${relative(DOCS, file)}`).join("\n") : "nothing to sweep")
      return 0
    }
    console.error(USAGE)
    return 1
  } catch (error) {
    console.error(`details:  ${error.message}`)
    return 1
  }
}

/** `yarn details` with no or a wrong command. */
const USAGE = `usage:  yarn details new <slug> [--title "..."] [--epic <name>] [--description "..."]
        yarn details show <page> [--wait] [--timeout 8h]
        yarn details wait <page> [--timeout 8h]
        yarn details answer <page>
        yarn details list
        yarn details sweep [--days 14]`

////////////////
// ## Pages
////////////////

/**
 * Write a new details page `slug` under `docs` from the template;  its absolute path.
 * - `--epic <name>`:  in that epic's `details/` (the epic must exist);  else the scratch `details/`
 * - sets `<title>`, the h1, the breadcrumb, the description and the footer's date;  refuses to overwrite
 */
export function createPage(docs, slug, { title, epic, description, spec } = {}) {
  title ??= spec?.title ?? "Details"
  if (!slug || !SLUG.test(slug)) throw new Error(`a slug is lower-kebab-case:  '${slug ?? ""}'`)
  if (epic && !existsSync(join(docs, "epics", epic))) throw new Error(`no epic '${epic}' (epics/${epic}/)`)
  const folder = epic ? join(docs, "epics", epic, "details") : join(docs, "details")
  const file = join(folder, `${slug}.html`)
  if (existsSync(file)) throw new Error(`${relative(docs, file)} already exists`)
  const depth = relative(docs, folder).split("/").length
  const { document } = parseHTML(atDepth(readFileSync(join(docs, "templates/details.html"), "utf8"), depth))
  document.querySelector("title").textContent = title
  document.querySelector("h1").textContent = title
  const crumb = document.querySelector("ui-breadcrumb-section[active]")
  if (crumb) crumb.textContent = title
  document.querySelector('meta[name="description"]').setAttribute("content", description ?? `Details:  ${title}`)
  const footer = document.querySelector("footer .meta")
  if (footer) footer.textContent = `Asked ${today()}.`
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
    const more = option.details ? `<div class="spell-option-details">${option.details}</div>` : ""
    const flag = `${option.recommended ? " data-recommended" : ""}${option.checked ? " data-checked" : ""}`
    return `<div class="spell-option" data-option="${attr(letter)}" data-title="${attr(option.title ?? letter)}"${flag}><p>${option.summary ?? ""}</p>${more}</div>`
  })
  const multiple = question.multiple ? " data-multiple" : ""
  const header = attr(question.title ?? `Q${i + 1}`)
  return `<ui-section id="${attr(id)}" class="spell-question" header="${header}" sticky collapsible dividing${multiple}><ui-icon slot="icon" name="circle question"></ui-icon><p>${question.text ?? ""}</p>${options.join("")}</ui-section>`
}

/** `path` as given:  absolute, else from `packages/docs` or the repo root (`yarn workspace` hides where yarn ran). */
function findFile(path) {
  const found = [DOCS, resolve(DOCS, "../..")].map((base) => resolve(base, path)).find((each) => existsSync(each))
  if (!found) throw new Error(`no file ${path}`)
  return found
}

/** `text` safe in a double-quoted attribute. */
function attr(text) {
  return String(text).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
}

/**
 * What `new --from` reads:  a whole page as data.
 * - `title`, `lede`, `askedBy` (`session <code>x</code>, while ...`);  HTML allowed except in `title`
 * - `where`:  `{ epic, justNow, decides }`, the "Where we are" box (`.claude/skills/details/SKILL.md`, "Writing for Owen")
 * - `context`:  HTML for "1. Context" (the picture);  none:  the section goes
 * - `questions[]`:  `{ id?, title, text, multiple?, options[] }`;  an option:  `{ letter?, title, summary,
 *   details?, recommended?, checked? }` (letters default to A, B ...;  `checked`:  ticked to start with)
 * - plain JS:  no type, this comment is the spec
 */

/**
 * The details page `target` names under `docs`:  a path, a slug in the scratch `details/`, `<epic>/<slug>`, or a
 * slug in any epic's `details/` (the first found).
 */
export function findPage(docs, target) {
  if (!target) throw new Error("which page?  a slug, a path or <epic>/<slug>")
  // `yarn workspace` sets `INIT_CWD` to `packages/docs`, not where `yarn` was run:  so a path is from the docs or the root
  const path = [docs, resolve(docs, "../..")].map((base) => resolve(base, target)).find((each) => existsSync(each))
  if (target.endsWith(".html") && path) return path
  const slug = target.replace(/\.html$/, "")
  const candidates = [join(docs, "details", `${slug}.html`)]
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
  const folders = [join(docs, "details")]
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
 * - only `details/`:  an epic's pages are its record
 * - SIDE EFFECT:  deletes files
 */
export function sweep(docs, days, now = Date.now()) {
  const folder = join(docs, "details")
  if (!existsSync(folder)) return []
  const gone = []
  for (const name of readdirSync(folder)) {
    const file = join(folder, name)
    if (!/\.(html|answer\.json)$/.test(name) || now - statSync(file).mtimeMs < days * 86_400_000) continue
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
 * `answer` to `page` as plain text, for Claude:  each question's title, the options picked (with their titles),
 * Other, then the notes.
 */
export function formatAnswer(page, answer) {
  const { document } = parseHTML(readFileSync(page, "utf8"))
  const title = document.querySelector("h1")?.textContent?.trim() ?? basename(page)
  const lines = [`Answer to "${title}" (${shown(page)}), sent ${answer.answered}:`]
  if (answer.changes) lines[0] += `  (changed ${answer.changes}×)`
  for (const question of document.querySelectorAll(".spell-question")) {
    const got = answer.answers?.[question.id] ?? { picked: [] }
    const picked = got.picked.map((letter) => {
      const option = question.querySelector(`.spell-option[data-option="${letter}"]`)
      const recommended = option?.hasAttribute("data-recommended") ? " (recommended)" : ""
      return `${letter} · ${option?.getAttribute("data-title") ?? "?"}${recommended}`
    })
    if (got.other) picked.push(`Other:  ${got.other}`)
    lines.push(`  ${question.getAttribute("header") ?? question.id}:  ${picked.join(";  ") || "(no answer)"}`)
  }
  if (answer.notes) lines.push(`  Notes:  ${answer.notes}`)
  return lines.join("\n")
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
function shown(file) {
  return resolve(file)
}

/** Today, `YYYY-MM-DD`, local time. */
function today() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

/** `--key value` flags (`--wait` alone is `true`), plus everything else in order;  flags go AFTER the page. */
function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) positional.push(argv[i])
    else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) flags[argv[i].slice(2)] = argv[++i]
    else flags[argv[i].slice(2)] = true
  }
  return { positional, flags }
}

// run as a script (`yarn details`), not when a test imports it;  last, so every `const` above is set
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2))
}
