/**
 * Syntax-choices pages' drafts and answers, on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`),
 * listed in the repo root's `package.json` `"pageServer": { "routes": [...] }`.
 * - A SYNTAX-CHOICES PAGE:  a table of names Claude recommends, one row per use site, each pre-filled in a box Owen
 *   types over (`spell dev choices`, `choices.js`);  `_assets/syntax-choices.js` posts here.
 * - `GET /api/choices/draft?page=<path>` -- what was typed so far, `{ draft: ChoicesDraft | null }`:  the page
 *   restores it on load
 * - `POST /api/choices/draft` `{ page, values, feedback }` -- save it to `<slug>.draft.json` beside the page.  Every 5s
 *   while Owen types, and as the page goes away.  Wakes NOBODY:  `spell dev choices wait` watches the answer only
 * - `GET /api/choices/answer?page=<path>` -- the answer sent, `{ answer: ChoicesAnswer | null }`
 * - `POST /api/choices/answer` `{ page, values, feedback }` -- "Do it":  writes `<slug>.answer.json` (and the draft,
 *   so a reload shows what was sent);  sent again, `changes` counts up.  `spell dev choices wait` exits with it
 * - `page`:  the page's URL path, as served (a worktree's `/worktrees/<w>/...` too);  ONLY a details-folder page
 *   (`detailsPage()`) with its `<slug>.rows.json` beside it:  anything else is a 403
 * - `values`:  row id -> what's in its box, ONLY the rows that differ from the recommendation;  ids not in the rows
 *   file are a 400 (a page older than its rows:  reload it)
 * - every POST needs the page server's token (`x-server-token`) and its own origin (`SRV.Guard`)
 * - Shares nothing with `choices.js` at runtime (that's plain node JS):  the file names are said again here.
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs"

import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"

import { detailsPage } from "./detailsRoutes"

/** Where the routes live. */
const API = "/api/choices"

/** Biggest body accepted:  a value per row (a few hundred) and the feedback. */
const MAX_BODY = 256 * 1024

const choicesRoutes: RouteModule = {
  name: "choices",
  setup({ router, guard, web }) {
    const api = new SRV.Router()
    api.get("/draft", (request, reply) => {
      const draft = readJson<ChoicesDraft>(draftFile(choicesPage(web.files, request.query.page)))
      reply.set("Cache-Control", "no-store").json({ draft })
    })
    api.get("/answer", (request, reply) => {
      const answer = readJson<ChoicesAnswer>(answerFile(choicesPage(web.files, request.query.page)))
      reply.set("Cache-Control", "no-store").json({ answer })
    })
    api.use(guard.writeCheck, SRV.parseBodies({ limit: MAX_BODY }))
    api.post("/draft", (request, reply) => {
      const { file, page, values, feedback } = toChoices(web.files, request.body)
      reply.json({ ok: true, draft: saveDraft(file, page, values, feedback) })
    })
    api.post("/answer", (request, reply) => {
      const { file, page, values, feedback } = toChoices(web.files, request.body)
      reply.json({ ok: true, answer: saveAnswer(file, page, values, feedback) })
    })
    router.use(API, api)
  }
}

export default choicesRoutes

/**
 * The syntax-choices page file URL path `page` names, through the server's mounts.
 * - 400:  not a path;  404:  no such page;  403:  outside a mount, not in a `details/` folder, or no rows beside it
 */
export function choicesPage(files: SRV.StaticHandler, page: unknown): string {
  const file = detailsPage(files, page)
  if (!existsSync(rowsFile(file))) throw new SRV.HttpError(403, `not a syntax-choices page:  ${String(page)}`)
  return file
}

/**
 * Save what was typed on page `file` to `<slug>.draft.json`;  return what was written.
 * - atomic (`writeJson()`);  SIDE EFFECT:  writes the file
 */
export function saveDraft(file: string, page: string, values: ChoicesValues, feedback: string): ChoicesDraft {
  const draft: ChoicesDraft = { page, saved: new Date().toISOString(), values, feedback }
  writeJson(draftFile(file), draft)
  return draft
}

/**
 * "Do it" on page `file`:  write `<slug>.answer.json`, and the draft to match;  return the answer.
 * - sent again:  replaces it, `changes` counts up
 * - atomic (`writeJson()`):  `spell dev choices wait` never reads half a file
 * - SIDE EFFECT:  writes both files
 */
export function saveAnswer(file: string, page: string, values: ChoicesValues, feedback: string): ChoicesAnswer {
  const before = readJson<ChoicesAnswer>(answerFile(file))
  const answer: ChoicesAnswer = {
    page,
    answered: new Date().toISOString(),
    changes: before ? before.changes + 1 : 0,
    values,
    feedback
  }
  saveDraft(file, page, values, feedback)
  writeJson(answerFile(file), answer)
  return answer
}

/**
 * A POST's body, checked:  the page's file and path, its values, the feedback (trimmed).
 * - 400 unless `values` is an object of strings keyed by the page's row ids
 */
function toChoices(files: SRV.StaticHandler, body: unknown) {
  const { page, values, feedback } = (body ?? {}) as { page?: unknown; values?: unknown; feedback?: unknown }
  const file = choicesPage(files, page)
  if (!values || typeof values !== "object" || Array.isArray(values)) throw new SRV.HttpError(400, "no values")
  const ids = new Set(readJson<{ rows: { id: string }[] }>(rowsFile(file))?.rows.map((row) => row.id))
  for (const [id, value] of Object.entries(values)) {
    if (typeof value !== "string") throw new SRV.HttpError(400, `bad value for ${id}`)
    if (!ids.has(id)) throw new SRV.HttpError(400, `no row '${id}' on this page:  reload it`)
  }
  if (feedback !== undefined && typeof feedback !== "string") throw new SRV.HttpError(400, "bad feedback")
  return { file, page: page as string, values: values as ChoicesValues, feedback: (feedback ?? "").trim() }
}

////////////////
// ## Files
////////////////

/** `<slug>.rows.json` beside page `<slug>.html`:  the rows (`choices.js` `new` writes it). */
export function rowsFile(page: string): string {
  return page.replace(/\.html$/, ".rows.json")
}

/** `<slug>.draft.json` beside page `<slug>.html`. */
export function draftFile(page: string): string {
  return page.replace(/\.html$/, ".draft.json")
}

/** `<slug>.answer.json` beside page `<slug>.html`:  the same file `spell dev details wait` would watch. */
export function answerFile(page: string): string {
  return page.replace(/\.html$/, ".answer.json")
}

/** `file` as JSON, or `null` when it isn't there. */
function readJson<T>(file: string): T | null {
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as T) : null
}

/** Write `data` to `file` as JSON, atomically:  a temp file renamed over it. */
function writeJson(file: string, data: unknown) {
  writeFileSync(`${file}.tmp`, `${JSON.stringify(data, null, 2)}\n`)
  renameSync(`${file}.tmp`, file)
}

////////////////
// ## Types
////////////////

/** What's in the boxes that differ from the recommendation:  row id -> typed text (maybe blank). */
export type ChoicesValues = Record<string, string>

/**
 * A page's `<slug>.draft.json`:  what was typed, not sent.
 * - `page`:  the page's URL path, as sent;  `saved`:  when, ISO
 * - `values`:  the changed boxes;  `feedback`:  the toolbar's text, trimmed
 */
export type ChoicesDraft = {
  page: string
  saved: string
  values: ChoicesValues
  feedback: string
}

/**
 * A page's `<slug>.answer.json`:  what "Do it" sent.
 * - `answered`:  when, ISO;  `changes`:  how often it was sent again (0:  the first time)
 * - `values`, `feedback`:  as the draft's
 */
export type ChoicesAnswer = {
  page: string
  answered: string
  changes: number
  values: ChoicesValues
  feedback: string
}
