/**
 * Comments on docs pages and plan docs, on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`),
 * listed in the repo root's `package.json` `"pageServer": { "routes": [...] }` (epic `airplane`, P11).
 * - A COMMENT:  what Owen writes on one block of a page, from the bullhorn beside it, or on text he selected there
 *   (⌘ I, or the floating bullhorn):  `_assets/spell-doc-runtime.js`, "Comments".  No Claude needed, so it works on
 *   a plane.  Its shape and every change to it:  `CommentList` (`$/epics/tool/CommentList`).
 * - Where it's kept (`inboxOf()`):
 *   - a docs page's:  its own inbox file, `<page>.inbox.json` beside it (`GuideInbox`);
 *     Claude takes them into epic `guide-changes` with `spell dev comments gather`
 *   - a plan doc's:  the epic's review inbox, `<name>.inbox.json`, under `comments` (`ReviewInbox`);
 *     Claude answers them as a revisit's note (`/epic review`, `/airplane land`)
 *   - both git-ignored in the shared repo:  waiting work, per machine, never the record
 * - `GET /api/comments?page=<path>` -- the page's comments, every status:  `{ page, takesComments, comments }`
 *   - the runtime asks as the page loads, and draws the bullhorns only when `takesComments`:
 *     a server without this module, `file://`, or a page that takes none shows none
 * - `POST /api/comments` `{ page, action, ... }` -- change one comment;  answers `{ ok, id, comments }`
 *   - `add` `{ anchor, kind, label, excerpt, quote?, offset?, text }`:  a new comment;  answers its `id`
 *   - `edit` `{ id, text }`, `delete` `{ id }`:  only while the comment is `new` (else 409)
 *   - `clear` `{ id }`:  gone, whatever its status (`CommentList.clear()`)
 * - `page`:  the page's URL path, as served (a worktree's `/worktrees/<w>/...` too).
 *   Which pages take comments (`commentsPage()`):
 *   - any `.html` under `guides/`, `pages/` (the docs home, details pages) and `epics/` (plan docs, an epic's own
 *     pages)
 *   - NOT a split plan doc's `parts/` (they're shown inside their doc), nor a plan doc's pre-2026-10-04 name
 *   - NOT a details page with questions, or a syntax-choices page:  they're answered on the page
 *   - NOT `templates/`, the goals pages (they have thoughts), Spell UI's docs or the brand pages
 *   - anything else:  `takesComments: false` to a GET, 403 to a POST;  no such page:  404;  bad input:  400
 * - every write:  under the inbox file's lock (`SRV.FileLock`), atomic;
 *   the page server announces the file's change, and every open copy of the page draws its comments again
 * - every POST needs the page server's token (`x-server-token`) and its own origin (`SRV.Guard`)
 * - Before P11 docs pages took PAGE NOTES, written into the page (`PageNotes.js`):  the ones written still show,
 *   read only, and `spell dev notes` still answers them
 */
import { existsSync, readFileSync } from "node:fs"

import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"
import { CommentsError, type CommentList, type CommentPlace } from "$/epics/tool/CommentList"
import { ReviewInbox } from "$/epics/tool/ReviewInbox"

import { GuideInbox } from "./GuideInbox"

/** Where the routes live. */
const API = "/api/comments"

/** Biggest body accepted:  a comment is a few paragraphs. */
const MAX_BODY = 64 * 1024

/** A page that may take comments, by URL path:  under `guides/`, `pages/` or `epics/`, on any checkout's mount. */
const COMMENTS_PAGE = /^\/(?:worktrees\/[^/]+\/)?(?:guides|pages|epics)\/(?:[^/]+\/)*[^/]+\.html$/

/** Pages under those that don't:  a split plan doc's parts, a plan doc's old name (`<name>/<name>.html`). */
const NO_COMMENTS = /\/parts\/[^/]+\.html$|\/epics\/([^/]+)\/\1\.html$/

/** A plan doc, by its file:  its comments go in the epic's review inbox. */
const PLAN_DOC = /\.plan\.html$/

/** Markup of a page answered on the page:  a details page's questions. */
const ANSWERED_ON_PAGE = /class="spell-question\b/

const commentsRoutes: RouteModule = {
  name: "comments",
  setup({ router, guard, web }) {
    // every docs page asks, so a page that takes no comments is an answer (`takesComments: false`), not a 403:
    // the browser logs every 4xx in the console, which `check-spell.js` fails on
    router.get(API, (request, reply) => {
      const page = one(request.query.page)
      let file: string
      try {
        file = commentsPage(web.files, page)
      } catch (error) {
        if (!(error instanceof SRV.HttpError) || error.status !== 403) throw error
        return reply.set("Cache-Control", "no-store").json({ page, takesComments: false, comments: [] })
      }
      reply.set("Cache-Control", "no-store").json({ page, takesComments: true, comments: commentsOf(file).all })
    })
    router.post(API, guard.writeCheck, SRV.parseBodies({ limit: MAX_BODY }), async (request, reply) => {
      const change = toChange(request.body)
      const file = commentsPage(web.files, change.page)
      const id = await changeComments(file, (comments) => changeComment(comments, change)).catch((error: unknown) => {
        throw error instanceof CommentsError ? new SRV.HttpError(error.status, error.message) : error
      })
      reply.json({ ok: true, id, comments: commentsOf(file).all })
    })
  }
}

export default commentsRoutes

/**
 * The file of page `page` (a URL path) through the server's mounts, when it takes comments.
 * - 400:  not a path;  404:  no such page;
 *   403:  outside a mount, or a page that takes no comments (this module's header says which)
 */
export function commentsPage(files: SRV.StaticHandler, page: unknown): string {
  if (typeof page !== "string" || !page.startsWith("/")) throw new SRV.HttpError(400, "no page")
  if (!COMMENTS_PAGE.test(page) || NO_COMMENTS.test(page)) throw new SRV.HttpError(403, `no comments on ${page}`)
  const resolved = files.resolve(page)
  if (!resolved) throw new SRV.HttpError(403, `not served here:  ${page}`)
  if ("redirect" in resolved) throw new SRV.HttpError(400, `a folder, not a page:  ${page}`)
  if ("status" in resolved) throw new SRV.HttpError(resolved.status, resolved.message)
  if (ANSWERED_ON_PAGE.test(readFileSync(resolved.file, "utf8")) || existsSync(rowsFile(resolved.file)))
    throw new SRV.HttpError(403, `${page} is answered on the page, not with comments`)
  return resolved.file
}

/** The comments of the page at `file`, as its inbox holds them now (read without the lock). */
export function commentsOf(file: string): CommentList {
  return PLAN_DOC.test(file)
    ? ReviewInbox.read(ReviewInbox.pathFor(file)).commentList
    : GuideInbox.read(GuideInbox.fileFor(file)).commentList
}

/**
 * Change the comments of the page at `file` with `change`, in its inbox, under the inbox's lock;
 * resolves to what `change` returned.
 * - SIDE EFFECT:  writes the inbox file
 */
export async function changeComments<T>(file: string, change: (comments: CommentList) => T): Promise<T> {
  if (!PLAN_DOC.test(file)) return GuideInbox.updateAsync(GuideInbox.fileFor(file), change)
  let result: T | undefined
  await ReviewInbox.updateAsync(ReviewInbox.pathFor(file), (inbox) => (result = change(inbox.commentList)))
  return result as T
}

/** Make `change` in `comments`;  returns the comment's id. */
function changeComment(comments: CommentList, change: CommentChange): string {
  if (change.action === "add") return comments.add(change.place, change.text)
  if (change.action === "edit") comments.edit(change.id, change.text)
  else if (change.action === "clear") comments.clear(change.id)
  else comments.remove(change.id)
  return change.id
}

/**
 * A POST's body, checked.
 * - 400:  an unknown `action`, or what it needs missing (`anchor` and `kind` to add, `id` to edit, delete or clear);
 *   the rest is checked by `CommentList`
 */
function toChange(body: unknown): CommentChange {
  const { page, action, id, text, anchor, kind, label, excerpt, quote, offset } = (body ?? {}) as Record<
    string,
    unknown
  >
  const words = typeof text === "string" ? text : ""
  if (action === "add") {
    if (typeof anchor !== "string" || typeof kind !== "string")
      throw new SRV.HttpError(400, "add:  which block is it on?  (anchor, kind)")
    const place: CommentPlace = {
      anchor,
      kind,
      label: typeof label === "string" ? label : "",
      excerpt: typeof excerpt === "string" ? excerpt : ""
    }
    if (typeof quote === "string") Object.assign(place, { quote, offset: Number(offset) })
    return { page, action, place, text: words }
  }
  if (action !== "edit" && action !== "delete" && action !== "clear")
    throw new SRV.HttpError(400, `action is add, edit, delete or clear, not "${String(action)}"`)
  if (typeof id !== "string") throw new SRV.HttpError(400, `${action}:  which comment?`)
  return action === "edit" ? { page, action, id, text: words } : { page, action, id }
}

/** `<slug>.rows.json` beside page `<slug>.html`:  a syntax-choices page's rows (`choicesRoutes.ts`). */
function rowsFile(page: string): string {
  return page.replace(/\.html$/, ".rows.json")
}

/** The first value of a query parameter. */
function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/**
 * One change to a page's comments, as a POST asks for it.
 * - `page`:  the page's URL path, checked by `commentsPage()`
 */
type CommentChange =
  | { page: unknown; action: "add"; place: CommentPlace; text: string }
  | { page: unknown; action: "edit"; id: string; text: string }
  | { page: unknown; action: "delete" | "clear"; id: string }
