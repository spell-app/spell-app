/**
 * Details pages' answers, on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`), listed in the repo
 * root's `package.json` `"pageServer": { "routes": [...] }`.
 * - A DETAILS PAGE:  a page Claude writes to explain a question (`/details`, `spell dev details`).
 *   - shown in VS Code's side bar
 *   - Owen answers ON it, and `_assets/details.js` posts the answer here
 * - `POST /api/docs/details/answer` `{ page, answers, comments, notes }` --
 *   write `<slug>.answer.json` beside the page `<slug>.html`
 *   - `page`:  the page's URL path, as it was served
 *     - `/pages/details/x.html`, or a worktree's `/worktrees/<w>/...` on the main checkout's server
 *   - ONLY a details page:  anything else is a 403
 *     - scratch `pages/details/`, or an epic's `epics/<name>/details/`
 *     - either under the old `packages/docs/content/` too
 *   - sent again (Owen sends as often as he likes:  the page never locks):
 *     replaces the file, `changes` counts up, and `changed` lists what's new since the last send
 * - `GET /api/docs/details/answer?page=<path>` -- the answer sent, or `{ answer: null }`:  the page shows it on load
 *   - a plain fetch of the missing `.answer.json` would log a 404 in every fresh page's console
 * - `spell dev details wait` polls for the file itself, and wakes the waiting Claude session when it lands.
 * - every POST needs the page server's token (`x-server-token`) and its own origin (`SRV.Guard`)
 */
import { existsSync, readFileSync } from "node:fs"

import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"

/** Where the routes live. */
const API = "/api/docs/details"

/** Biggest body accepted:  answers and notes are short. */
const MAX_BODY = 64 * 1024

/**
 * A details page's file:  `pages/details/<slug>.html` or `epics/<name>/details/<slug>.html`.
 * - before 2026-10-05 (claude-design P4):
 *   `packages/docs/content/details/...` or `packages/docs/content/epics/<name>/details/...`
 */
const DETAILS_PAGE =
  /\/(?:pages\/details|epics\/[^/]+\/details|packages\/docs\/content\/(?:epics\/[^/]+\/)?details)\/[^/]+\.html$/

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
    api.post("/answer", async (request, reply) => {
      const body = request.body as { page?: unknown; answers?: unknown; comments?: unknown; notes?: unknown }
      const file = detailsPage(web.files, body.page)
      const notes = typeof body.notes === "string" ? body.notes : ""
      const answers = toAnswers(body.answers)
      const answer = await saveAnswer(file, body.page as string, answers, notes, toComments(body.comments))
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
  const file = servedPage(files, page)
  if (!isDetailsPage(file)) throw new SRV.HttpError(403, `not a details page:  ${String(page)}`)
  return file
}

/**
 * The file of the page at URL path `page`, through the server's mounts;  any page.
 * - 400:  not a path, or a folder;  404:  no such page;  403:  outside a mount
 */
export function servedPage(files: SRV.StaticHandler, page: unknown): string {
  if (typeof page !== "string" || !page.startsWith("/")) throw new SRV.HttpError(400, "no page")
  const resolved = files.resolve(page)
  if (!resolved) throw new SRV.HttpError(403, `not served here:  ${page}`)
  if ("redirect" in resolved) throw new SRV.HttpError(400, `a folder, not a page:  ${page}`)
  if ("status" in resolved) throw new SRV.HttpError(resolved.status, resolved.message)
  return resolved.file
}

/** Is `file` a details page:  in a `details/` folder (`DETAILS_PAGE`)? */
export function isDetailsPage(file: string): boolean {
  return DETAILS_PAGE.test(file)
}

/**
 * Write `answers` for details page `file` to `<slug>.answer.json` beside it;  return what was written.
 * - `changed`:  what differs from the answer sent before (none before:  everything sent)
 * - through the page server's one safe write (`SRV.FileOperations.save()`):  the answer before is read and the new
 *   one written under the file's lock, all at once, so `spell dev details wait` never reads half a file
 * - SIDE EFFECT:  writes the file
 */
export async function saveAnswer(
  file: string,
  page: string,
  answers: DetailsAnswers,
  notes: string,
  comments: DetailsComments = {}
): Promise<DetailsAnswer> {
  let answer!: DetailsAnswer
  await SRV.FileOperations.save(answerFile(file), (current) => {
    const before = current ? (JSON.parse(current) as Partial<DetailsAnswer>) : undefined
    answer = {
      page,
      answered: new Date().toISOString(),
      changes: before ? (before.changes ?? 0) + 1 : 0,
      changed: [],
      answers,
      comments,
      notes: notes.trim()
    }
    answer.changed = changedSince(before, answer)
    return `${JSON.stringify(answer, null, 2)}\n`
  })
  return answer
}

/** `<slug>.answer.json` beside page `<slug>.html`. */
export function answerFile(page: string): string {
  return page.replace(/\.html$/, ".answer.json")
}

/**
 * The keys of `now` that differ from `before`:  question ids (`q3`, `q3-more`), `comment:<section id>`, `notes`.
 * - nothing before:  every key with something in it
 */
export function changedSince(before: Partial<DetailsAnswer> | undefined, now: DetailsAnswer): string[] {
  const same = (one: unknown, other: unknown) => JSON.stringify(one ?? null) === JSON.stringify(other ?? null)
  const blank = (answer?: { picked: string[]; other?: string }) => !answer || (!answer.picked.length && !answer.other)
  const changed: string[] = []
  for (const id of new Set([...Object.keys(before?.answers ?? {}), ...Object.keys(now.answers)])) {
    const was = before?.answers?.[id]
    const is = now.answers[id]
    if (before ? !same(blank(was) ? null : was, blank(is) ? null : is) : !blank(is)) changed.push(id)
  }
  for (const id of new Set([...Object.keys(before?.comments ?? {}), ...Object.keys(now.comments ?? {})]))
    if (!same(before?.comments?.[id], now.comments?.[id])) changed.push(`comment:${id}`)
  if ((before?.notes ?? "") !== now.notes) changed.push("notes")
  return changed
}

/**
 * `comments` from the request, checked:  section id -> text;  blank ones dropped.
 * - 400 unless an object of strings (absent:  none)
 */
function toComments(comments: unknown): DetailsComments {
  if (comments === undefined) return {}
  if (!comments || typeof comments !== "object" || Array.isArray(comments)) throw new SRV.HttpError(400, "bad comments")
  const result: DetailsComments = {}
  for (const [id, text] of Object.entries(comments as Record<string, unknown>)) {
    if (typeof text !== "string") throw new SRV.HttpError(400, `bad comment on ${id}`)
    if (text.trim()) result[id] = text.trim()
  }
  return result
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
 * - `changed`:  what's new since the send before (`changedSince()`);  absent in answers from before 2026-10-08
 * - `answers`:  by question id (`q1` ...);  a question not decided yet is `{ picked: [] }`
 * - `comments`:  by section id, the comment box under each section that isn't a question;
 *   an option's box is `<question id>-<letter>` (`q1-B`)
 * - `notes`:  the page's notes box, trimmed
 */
export type DetailsAnswer = {
  page: string
  answered: string
  changes: number
  changed?: string[]
  answers: DetailsAnswers
  comments?: DetailsComments
  notes: string
}

/** Comments by section id (`c-today`), or by option (`q1-B`):  trimmed, none blank. */
export type DetailsComments = Record<string, string>

/**
 * Answers by question id.
 * - `picked`:  the options' letters (`["B"]`;  several for a "pick several" question;  `[]` for none or only Other)
 * - `other`:  the "Other" box, when filled
 */
export type DetailsAnswers = Record<string, { picked: string[]; other?: string }>
