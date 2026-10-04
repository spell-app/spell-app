/**
 * Details pages' answers, on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`), listed in the repo
 * root's `package.json` `"pageServer": { "routes": [...] }`.
 * - A DETAILS PAGE:  a page Claude writes to explain a question (`/details`, `yarn details`), shown in VS Code's
 *   side bar;  Owen answers ON it, and `_assets/details.js` posts the answer here.
 * - `POST /api/details/answer` `{ page, answers, notes }` -- write `<slug>.answer.json` beside the page `<slug>.html`
 *   - `page`:  the page's URL path, as it was served:  `/packages/docs/details/x.html`, or a worktree's
 *     `/worktrees/<w>/packages/docs/...` on the main checkout's server
 *   - ONLY a page in a `details/` folder of `packages/docs` (scratch, or an epic's):  anything else is a 403
 *   - sent again (Owen changed his answer):  replaces the file, `changes` counts up
 * - `GET /api/details/answer?page=<path>` -- the answer sent, or `{ answer: null }`:  the page shows it on load (a
 *   plain fetch of the missing `.answer.json` would log a 404 in every fresh page's console)
 * - `yarn details wait` polls for the file itself, and wakes the waiting Claude session when it lands.
 * - every POST needs the page server's token (`x-server-token`) and its own origin (`SRV.Guard`)
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs"

import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"

/** Where the routes live. */
const API = "/api/details"

/** Biggest body accepted:  answers and notes are short. */
const MAX_BODY = 64 * 1024

/** A details page's file:  `packages/docs/details/<slug>.html` or `packages/docs/epics/<name>/details/<slug>.html`. */
const DETAILS_PAGE = /\/packages\/docs\/(?:epics\/[^/]+\/)?details\/[^/]+\.html$/

const detailsRoutes: RouteModule = {
  name: "details",
  setup({ router, guard, web }) {
    const api = new SRV.Router()
    api.get("/answer", (request, reply) => {
      const out = answerFile(detailsPage(web.files, request.query.page))
      const answer = existsSync(out) ? (JSON.parse(readFileSync(out, "utf8")) as DetailsAnswer) : null
      reply.set("Cache-Control", "no-store").json({ answer })
    })
    api.use(guard.writeCheck, SRV.parseBodies({ limit: MAX_BODY }))
    api.post("/answer", (request, reply) => {
      const body = request.body as { page?: unknown; answers?: unknown; notes?: unknown }
      const file = detailsPage(web.files, body.page)
      const notes = typeof body.notes === "string" ? body.notes : ""
      const answer = saveAnswer(file, body.page as string, toAnswers(body.answers), notes)
      reply.json({ ok: true, answer })
    })
    router.use(API, api)
  }
}

export default detailsRoutes

/**
 * The details page file URL path `page` names, through the server's mounts.
 * - 400:  not a path;  404:  no such page;  403:  outside a mount, or not a details page
 */
export function detailsPage(files: SRV.StaticHandler, page: unknown): string {
  if (typeof page !== "string" || !page.startsWith("/")) throw new SRV.HttpError(400, "no page")
  const resolved = files.resolve(page)
  if (!resolved) throw new SRV.HttpError(403, `not served here:  ${page}`)
  if ("redirect" in resolved) throw new SRV.HttpError(400, `a folder, not a page:  ${page}`)
  if ("status" in resolved) throw new SRV.HttpError(resolved.status, resolved.message)
  if (!DETAILS_PAGE.test(resolved.file)) throw new SRV.HttpError(403, `not a details page:  ${page}`)
  return resolved.file
}

/**
 * Write `answers` for details page `file` to `<slug>.answer.json` beside it;  return what was written.
 * - atomic (a temp file renamed over it):  `yarn details wait` never reads half a file
 * - SIDE EFFECT:  writes the file
 */
export function saveAnswer(file: string, page: string, answers: DetailsAnswers, notes: string): DetailsAnswer {
  const out = answerFile(file)
  const before = existsSync(out) ? (JSON.parse(readFileSync(out, "utf8")) as Partial<DetailsAnswer>) : undefined
  const answer: DetailsAnswer = {
    page,
    answered: new Date().toISOString(),
    changes: before ? (before.changes ?? 0) + 1 : 0,
    answers,
    notes: notes.trim()
  }
  writeFileSync(`${out}.tmp`, `${JSON.stringify(answer, null, 2)}\n`)
  renameSync(`${out}.tmp`, out)
  return answer
}

/** `<slug>.answer.json` beside page `<slug>.html`. */
export function answerFile(page: string): string {
  return page.replace(/\.html$/, ".answer.json")
}

/**
 * `answers` from the request, checked:  question id -> what was picked.
 * - 400 unless an object of `{ picked: string[], other?: string }`
 * - a blank `other` is dropped
 */
function toAnswers(answers: unknown): DetailsAnswers {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) throw new SRV.HttpError(400, "no answers")
  const result: DetailsAnswers = {}
  for (const [id, value] of Object.entries(answers as Record<string, unknown>)) {
    const { picked, other } = (value ?? {}) as { picked?: unknown; other?: unknown }
    if (!Array.isArray(picked) || !picked.every((each) => typeof each === "string"))
      throw new SRV.HttpError(400, `bad answer to ${id}`)
    if (other !== undefined && typeof other !== "string") throw new SRV.HttpError(400, `bad answer to ${id}`)
    result[id] = other?.trim() ? { picked, other: other.trim() } : { picked }
  }
  return result
}

/**
 * What a details page's `<slug>.answer.json` holds.
 * - `page`:  the page's URL path, as sent
 * - `answered`:  when, ISO
 * - `changes`:  how often Owen sent it again (0:  the first answer)
 * - `answers`:  by question id (`q1` ...)
 * - `notes`:  the page's notes box, trimmed
 */
export type DetailsAnswer = {
  page: string
  answered: string
  changes: number
  answers: DetailsAnswers
  notes: string
}

/**
 * Answers by question id.
 * - `picked`:  the options' letters (`["B"]`;  several for a "pick several" question;  `[]` for none or only Other)
 * - `other`:  the "Other" box, when filled
 */
export type DetailsAnswers = Record<string, { picked: string[]; other?: string }>
