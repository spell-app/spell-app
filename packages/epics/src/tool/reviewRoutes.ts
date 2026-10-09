/**
 * Plan docs' review marks, on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`), listed in the repo
 * root's `package.json` `"pageServer": { "routes": [...] }`.
 * - Owen marks a plan doc's items ON the page (the elements' review controls, `$/epics/review`):
 *   approve, todo, details, revisit, pick an option card, an id chip's urgency.
 *   The marks wait in the doc's INBOX FILE, `<name>.inbox.json` beside `<name>.plan.html` (`ReviewInbox`),
 *   until a Claude session takes them (P6 of `review-review`, `spell dev plan-doc inbox`)
 * - `page`:  the plan doc's URL path, as it was served:
 *   `/epics/x/x.plan.html`, or a worktree's `/worktrees/<w>/...` on the main checkout's server.
 *   ONLY a plan doc:  anything else is a 403
 * - every answer is the whole inbox, as `ReviewInbox` keeps it (an empty one when there's no file),
 *   except a `listening` whose heartbeat stopped:
 *   `null` (`ReviewInbox.forPage()`), so the page warns nobody is reviewing
 * - `GET /api/review/inbox?page=<path>` -- the inbox;  the page polls it
 * - `POST /api/review/mark` `{ page, id, mark }` -- set item `id`'s mark, or remove it (`mark: null`)
 *   - the mark:  `{ action, when?, note?, pick?, choices? }`, `at` stamped here;
 *     a revisit may carry a `pick` letter too;  `choices`, the pick's card set by position (I8)
 *   - `id` must be an item, phase, Overview sub-section or the summary (`summary`) of that doc
 *     (400 otherwise:  `ReviewInbox.itemIds()`)
 * - `POST /api/review/new` `{ page, id?, entry }` -- a NEW todo or question asked for from the page
 *   (epic `airplane` P2):  `entry` `{ kind, title, note?, near? }` under key `id` (`new1` ...),
 *   or, without one, the next free key
 *   - `entry: null` removes it (`ReviewInbox.setNew()`)
 *   - `near`, when given, must be an id of that doc
 * - `POST /api/review/now` `{ page, id, action, note? }` -- an immediate request, queued on `now`,
 *   and the item's mark set:  `details`, or `revisit`, which keeps the item's pick
 * - `POST /api/review/cancel` `{ page, id }` -- "nevermind":
 *   call off item `id`'s immediate request, queued or being worked on (`ReviewInbox.cancelNow()`)
 * - `POST /api/review/draft` `{ page, id, action, note }` -- a note box's text as Owen types it
 *   (`revisit` or `todo`;  empty or `null` drops it):  kept until the mark that uses it (`ReviewInbox.setDraft()`)
 * - `POST /api/review/urgency` `{ page, id, calm }` -- Owen clicked an open judgement call's or issue's id chip:
 *   `calm` true, not urgent;  false, urgent;  `null` drops it (`ReviewInbox.setUrgency()`)
 * - `POST /api/review/send` `{ page, now? }` -- "send to Claude":  `sent` is now;
 *   `now: true` is "Review Now" (epic `windows-and-review` P4):
 *   every revisit waiting becomes an immediate request too (`ReviewInbox.reviewNow()`)
 * - writes:  under the inbox's lock, atomic (`ReviewInbox.updateAsync()`);
 *   each needs the page server's token (`x-server-token`) and its own origin (`SRV.Guard`)
 * - Loaded by the page server under `tsx` (`PageServer.loadRoutes()`), with `packages/server/tsconfig.json`'s aliases.
 *   Imports `ReviewInbox` only, never `PlanDoc`:  a request reads the doc's TEXT (`ReviewInbox.itemIds()`).
 * - From `packages/docs/tools/reviewRoutes.ts` (epic `epic-components`, P7).
 */
import { readFileSync } from "node:fs"

import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"

import { InboxError, ReviewInbox, type InboxRecord } from "./ReviewInbox"

/** Where the routes live. */
const API = "/api/review"

/** Biggest body accepted:  a revisit note is a few lines. */
const MAX_BODY = 64 * 1024

/** A plan doc's file:  `epics/<name>/<name>.plan.html` (before 2026-10-05 under `packages/docs/content/`). */
const PLAN_DOC = /\/(?:packages\/docs\/content\/)?epics\/([^/]+)\/\1\.plan\.html$/

const reviewRoutes: RouteModule = {
  name: "review",
  setup({ router, guard, web }) {
    const api = new SRV.Router()
    api.get("/inbox", (request, reply) => {
      const inbox = ReviewInbox.read(ReviewInbox.pathFor(planDoc(web.files, request.query.page)))
      reply.set("Cache-Control", "no-store").json(inbox.forPage())
    })
    api.use(guard.writeCheck, SRV.parseBodies({ limit: MAX_BODY }))
    api.post("/mark", async (request, reply) => {
      const body = request.body as { page?: unknown; id?: unknown; mark?: unknown }
      const file = planDoc(web.files, body.page)
      const id = itemOf(file, body.id)
      if (body.mark === undefined) throw new SRV.HttpError(400, "no mark (null removes one)")
      reply.json(await update(file, (inbox) => inbox.setMark(id, body.mark)))
    })
    api.post("/now", async (request, reply) => {
      const body = request.body as { page?: unknown; id?: unknown; action?: unknown; note?: unknown }
      const file = planDoc(web.files, body.page)
      const id = itemOf(file, body.id)
      reply.json(await update(file, (inbox) => inbox.requestNow(id, body.action, (body.note ?? "") as string)))
    })
    api.post("/cancel", async (request, reply) => {
      const body = request.body as { page?: unknown; id?: unknown }
      const file = planDoc(web.files, body.page)
      const id = itemOf(file, body.id)
      reply.json(await update(file, (inbox) => inbox.cancelNow(id)))
    })
    api.post("/draft", async (request, reply) => {
      const body = request.body as { page?: unknown; id?: unknown; action?: unknown; note?: unknown }
      const file = planDoc(web.files, body.page)
      const id = itemOf(file, body.id)
      reply.json(await update(file, (inbox) => inbox.setDraft(id, body.action, body.note ?? null)))
    })
    api.post("/urgency", async (request, reply) => {
      const body = request.body as { page?: unknown; id?: unknown; calm?: unknown }
      const file = planDoc(web.files, body.page)
      const id = itemOf(file, body.id)
      reply.json(await update(file, (inbox) => inbox.setUrgency(id, body.calm ?? null)))
    })
    api.post("/new", async (request, reply) => {
      const body = request.body as { page?: unknown; id?: unknown; entry?: unknown }
      const file = planDoc(web.files, body.page)
      if (body.entry === undefined) throw new SRV.HttpError(400, "no entry (null removes one)")
      const near = (body.entry as { near?: unknown } | null)?.near
      if (near !== undefined && near !== null && near !== "") itemOf(file, near)
      reply.json(await update(file, (inbox) => inbox.setNew(body.id, body.entry)))
    })
    api.post("/send", async (request, reply) => {
      const body = request.body as { page?: unknown; now?: unknown }
      const file = planDoc(web.files, body.page)
      reply.json(await update(file, (inbox) => (body.now === true ? inbox.reviewNow() : inbox.markSent())))
    })
    router.use(API, api)
  }
}

export default reviewRoutes

/**
 * The plan doc file URL path `page` names, through the server's mounts.
 * - 400:  not a path;  404:  no such page;  403:  outside a mount, or not a plan doc
 */
export function planDoc(files: SRV.StaticHandler, page: unknown): string {
  if (typeof page !== "string" || !page.startsWith("/")) throw new SRV.HttpError(400, "no page")
  const resolved = files.resolve(page)
  if (!resolved) throw new SRV.HttpError(403, `not served here:  ${page}`)
  if ("redirect" in resolved) throw new SRV.HttpError(400, `a folder, not a page:  ${page}`)
  if ("status" in resolved) throw new SRV.HttpError(resolved.status, resolved.message)
  if (!PLAN_DOC.test(resolved.file)) throw new SRV.HttpError(403, `not a plan doc:  ${page}`)
  return resolved.file
}

/**
 * `id` from a request, as the inbox keys it (lower-case);  400 unless plan doc `file` has it:
 * an item, an Overview sub-section (`o3`, Q14), a phase (`p3`) or the summary (`summary`:  epic `airplane` P2);
 * either markup until the switch (`ReviewInbox.itemIds()`).
 * - reads the doc each time:  an item added a moment ago (Claude, `plan-doc add`) is markable at once
 */
function itemOf(file: string, id: unknown): string {
  const key = asHttp(() => ReviewInbox.toItemId(id))
  if (!ReviewInbox.itemIds(readFileSync(file, "utf8")).has(key))
    throw new SRV.HttpError(400, `no item ${String(id)} in that doc`)
  return key
}

/**
 * Change plan doc `file`'s inbox with `change`, under its lock;
 * the inbox after, as the page reads it (`ReviewInbox.forPage()`).
 * - an `InboxError` (a bad mark, a bad action) is a 400
 */
async function update(file: string, change: (inbox: ReviewInbox) => unknown): Promise<InboxRecord> {
  const inbox = await ReviewInbox.updateAsync(ReviewInbox.pathFor(file), (each) => asHttp(() => change(each)))
  return inbox.forPage()
}

/** Run `fn`;  an `InboxError` it throws becomes a 400. */
function asHttp<T>(fn: () => T): T {
  try {
    return fn()
  } catch (error) {
    if (error instanceof InboxError) throw new SRV.HttpError(400, error.message)
    throw error
  }
}
