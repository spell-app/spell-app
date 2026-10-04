/**
 * Plan docs' review marks, on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`), listed in the repo
 * root's `package.json` `"pageServer": { "routes": [...] }`.
 * - Owen marks a plan doc's items ON the page (`_assets/spell-doc-runtime.js`:  approve, todo, details, revisit,
 *   pick an option card);  the marks wait in the doc's INBOX FILE, `<name>.inbox.json` beside `<name>.plan.html`
 *   (`inbox.js`), until a Claude session takes them (P6 of `review-review`, `yarn plan-doc inbox`)
 * - `page`:  the plan doc's URL path, as it was served:  `/packages/docs/epics/x/x.plan.html`, or a worktree's
 *   `/worktrees/<w>/packages/docs/...` on the main checkout's server.  ONLY a plan doc:  anything else is a 403
 * - every answer is the whole inbox, as `inbox.js` keeps it (an empty one when there's no file)
 * - `GET /api/review/inbox?page=<path>` -- the inbox;  the page polls it
 * - `POST /api/review/mark` `{ page, id, mark }` -- set item `id`'s mark (`{ action, when?, note?, pick? }`, `at`
 *   stamped here), or remove it (`mark: null`);  `id` must be an item of that doc (400 otherwise)
 * - `POST /api/review/now` `{ page, id, action, note? }` -- an immediate request (`details`, or `revisit`):  queued on
 *   `now`, and the item's mark set
 * - `POST /api/review/send` `{ page }` -- "send to Claude":  `sent` is now
 * - writes:  under the inbox's lock, atomic (`inbox.js` `updateInboxAsync()`);  each needs the page server's token
 *   (`x-server-token`) and its own origin (`SRV.Guard`)
 */
import { readFileSync } from "node:fs"

import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"

import {
  InboxError,
  inboxPath,
  itemIds,
  markSent,
  readInbox,
  requestNow,
  setMark,
  toItemId,
  updateInboxAsync
} from "./inbox.js"

/** Where the routes live. */
const API = "/api/review"

/** Biggest body accepted:  a revisit note is a few lines. */
const MAX_BODY = 64 * 1024

/** A plan doc's file:  `packages/docs/epics/<name>/<name>.plan.html`. */
const PLAN_DOC = /\/packages\/docs\/epics\/([^/]+)\/\1\.plan\.html$/

const reviewRoutes: RouteModule = {
  name: "review",
  setup({ router, guard, web }) {
    const api = new SRV.Router()
    api.get("/inbox", (request, reply) => {
      const inbox = readInbox(inboxPath(planDoc(web.files, request.query.page)))
      reply.set("Cache-Control", "no-store").json(inbox)
    })
    api.use(guard.writeCheck, SRV.parseBodies({ limit: MAX_BODY }))
    api.post("/mark", async (request, reply) => {
      const body = request.body as { page?: unknown; id?: unknown; mark?: unknown }
      const file = planDoc(web.files, body.page)
      const id = itemOf(file, body.id)
      if (body.mark === undefined) throw new SRV.HttpError(400, "no mark (null removes one)")
      reply.json(await update(file, (inbox) => setMark(inbox, id, body.mark)))
    })
    api.post("/now", async (request, reply) => {
      const body = request.body as { page?: unknown; id?: unknown; action?: unknown; note?: unknown }
      const file = planDoc(web.files, body.page)
      const id = itemOf(file, body.id)
      reply.json(await update(file, (inbox) => requestNow(inbox, id, body.action, (body.note ?? "") as string)))
    })
    api.post("/send", async (request, reply) => {
      const body = request.body as { page?: unknown }
      reply.json(await update(planDoc(web.files, body.page), (inbox) => markSent(inbox)))
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
 * `id` from a request, as the inbox keys it (lower-case);  400 unless it's an item of plan doc `file`.
 * - reads the doc each time:  an item added a moment ago (Claude, `plan-doc add`) is markable at once
 */
function itemOf(file: string, id: unknown): string {
  const key = asHttp(() => toItemId(id))
  if (!itemIds(readFileSync(file, "utf8")).has(key)) throw new SRV.HttpError(400, `no item ${String(id)} in that doc`)
  return key
}

/**
 * Change plan doc `file`'s inbox with `change`, under its lock;  the inbox after.
 * - an `InboxError` (a bad mark, a bad action) is a 400
 */
function update(file: string, change: (inbox: Inbox) => unknown): Promise<Inbox> {
  return updateInboxAsync(inboxPath(file), (inbox: Inbox) => asHttp(() => change(inbox)))
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

/** A plan doc's review inbox, as `inbox.js` reads it (plain JS:  its shape is in that file's header). */
type Inbox = ReturnType<typeof readInbox>
