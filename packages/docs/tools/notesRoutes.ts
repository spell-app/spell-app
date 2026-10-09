/**
 * Page notes, on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`), listed in the repo root's
 * `package.json` `"pageServer": { "routes": [...] }`.
 * - A PAGE NOTE:  a note Owen leaves on a docs page for Claude, from a bubble on a section's title or the page's
 *   Note pill (`_assets/spell-doc-runtime.js`, "Page notes"), written INTO the page's HTML (`PageNotes.js` has the
 *   markup), so the shared content repo commits it like any other edit (epic `airplane`, P3).
 *   Claude finds them with `spell dev notes list`, and answers under them (`notes.ts`).
 * - `GET /api/notes?page=<path>` -- the page's notes, every status:  `{ page, notes }`
 *   - the runtime asks as the page loads, and draws the bubbles only when this answers:
 *     a server without this module, `file://`, or a page that takes no notes shows none
 * - `POST /api/notes` `{ page, action, for?, id?, text? }` -- change one note;  answers `{ ok, id, notes }`
 *   - `add` `{ for, text }`:  `for` a section's `id`, or `page` for the whole page;  answers the new note's `id`
 *   - `edit` `{ id, text }`, `delete` `{ id }`:  only while the note is `new` (else 409)
 * - `page`:  the page's URL path, as served (a worktree's `/worktrees/<w>/...` too).
 *   Which pages take notes (`notesPage()`):
 *   - any `.html` under `guides/`, `pages/` (the docs home, details pages) and `epics/` (an epic's own pages)
 *   - NOT a plan doc (`*.plan.html`, `<epic-page>`, a split doc's `parts/`):  its items have the review inbox
 *   - NOT a details page with questions, or a syntax-choices page:  they're answered on the page
 *   - NOT `templates/`:  a note there would be copied into every page made from it;  NOT the goals pages (they
 *     have thoughts), Spell UI's docs or the brand pages (they don't load the docs runtime)
 *   - anything else:  403;  no such page:  404;  bad input:  400
 * - every write:  under the page's lock (`SRV.FileLock`), atomic, the page formatted after when it was formatted
 *   before (`editNotes()`);  the page server's live update then patches the page in place
 * - every POST needs the page server's token (`x-server-token`) and its own origin (`SRV.Guard`)
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { basename, dirname, join } from "node:path"

import { AS } from "$/assembler"
import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"

import { NotesError, PageNotes } from "./PageNotes.js"

/** Where the routes live. */
const API = "/api/notes"

/** Biggest body accepted:  a note is a few lines. */
const MAX_BODY = 64 * 1024

/** A page that may take notes, by URL path:  under `guides/`, `pages/` or `epics/`, on any checkout's mount. */
const NOTES_PAGE = /^\/(?:worktrees\/[^/]+\/)?(?:guides|pages|epics)\/(?:[^/]+\/)*[^/]+\.html$/

/** Pages under those that don't:  plan docs (`<name>.plan.html`;  `<name>/<name>.html` before 2026-10-04), parts. */
const NO_NOTES = /\.plan\.html$|\/parts\/[^/]+\.html$|\/epics\/([^/]+)\/\1\.html$/

/** Markup of a page answered on the page:  a plan doc's, a details page's questions. */
const ANSWERED_ON_PAGE = /<epic-page\b|class="spell-question\b/

const notesRoutes: RouteModule = {
  name: "notes",
  setup({ router, guard, web }) {
    router.get(API, (request, reply) => {
      const page = one(request.query.page)
      const file = notesPage(web.files, page)
      const notes = new PageNotes(readFileSync(file, "utf8")).notes({ all: true })
      reply.set("Cache-Control", "no-store").json({ page, notes })
    })
    router.post(API, guard.writeCheck, SRV.parseBodies({ limit: MAX_BODY }), async (request, reply) => {
      const change = toChange(request.body)
      const file = notesPage(web.files, change.page)
      const id = await editNotes(file, (notes) => changeNote(notes, change)).catch((error: unknown) => {
        throw httpError(error)
      })
      const notes = new PageNotes(readFileSync(file, "utf8")).notes({ all: true })
      reply.json({ ok: true, id, notes })
    })
  }
}

export default notesRoutes

/**
 * The file of page `page` (a URL path) through the server's mounts, when it takes notes.
 * - 400:  not a path;  404:  no such page;
 *   403:  outside a mount, or a page that takes no notes (this module's header says which)
 */
export function notesPage(files: SRV.StaticHandler, page: unknown): string {
  if (typeof page !== "string" || !page.startsWith("/")) throw new SRV.HttpError(400, "no page")
  if (!NOTES_PAGE.test(page) || NO_NOTES.test(page)) throw new SRV.HttpError(403, `no notes on ${page}`)
  const resolved = files.resolve(page)
  if (!resolved) throw new SRV.HttpError(403, `not served here:  ${page}`)
  if ("redirect" in resolved) throw new SRV.HttpError(400, `a folder, not a page:  ${page}`)
  if ("status" in resolved) throw new SRV.HttpError(resolved.status, resolved.message)
  if (ANSWERED_ON_PAGE.test(readFileSync(resolved.file, "utf8")) || existsSync(rowsFile(resolved.file)))
    throw new SRV.HttpError(403, `${page} is answered on the page, not with notes`)
  return resolved.file
}

/**
 * Change the notes of the page at `file` with `change(notes)`, under the page's lock;
 * returns what `change` returned.
 * - formats the page after (oxfmt, in memory:  `AS.formatHTML()`) only when it was formatted before:
 *   a long note wraps as `vp fmt` would wrap it, and a page that wasn't keeps every other byte
 * - atomic:  a temp file renamed over the page, so the live reload never reads half a page
 * - throws what `change` throws (`NotesError` ...);  the page is left as it was
 * - SIDE EFFECT:  writes the page
 */
export async function editNotes<T>(file: string, change: (notes: PageNotes) => T): Promise<T> {
  return SRV.FileLock.runAsync(file, async () => {
    const before = readFileSync(file, "utf8")
    const formatted = (await AS.formatHTML(file, before).catch(() => undefined)) === before
    const notes = new PageNotes(before)
    const result = change(notes)
    const html = formatted ? await AS.formatHTML(file, notes.html) : notes.html
    const temp = join(dirname(file), `.${basename(file)}.${process.pid}.tmp`)
    writeFileSync(temp, html)
    renameSync(temp, file)
    return result
  })
}

/** Make `change` on `notes`;  returns the note's id. */
function changeNote(notes: PageNotes, change: NoteChange): string {
  if (change.action === "add") return notes.add(change.for, change.text) as string
  if (change.action === "edit") notes.edit(change.id, change.text)
  else notes.remove(change.id)
  return change.id
}

/**
 * A POST's body, checked.
 * - 400:  an unknown `action`, or what it needs missing (`for` and `text` to add, `id` to edit or delete, `text` to
 *   edit);  the text itself is checked by `PageNotes`
 */
function toChange(body: unknown): NoteChange {
  const { page, action, for: anchor, id, text } = (body ?? {}) as Record<string, unknown>
  const words = typeof text === "string" ? text : ""
  if (action === "add") {
    if (typeof anchor !== "string" || !anchor) throw new SRV.HttpError(400, "add:  which section is it for?")
    return { page, action, for: anchor, text: words }
  }
  if (action !== "edit" && action !== "delete")
    throw new SRV.HttpError(400, `action is add, edit or delete, not "${String(action)}"`)
  if (typeof id !== "string") throw new SRV.HttpError(400, `${action}:  which note?`)
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

/** `error` as the page server answers it:  a `NotesError` with its status, the rest as is. */
function httpError(error: unknown): unknown {
  return error instanceof NotesError ? new SRV.HttpError(error.status, error.message) : error
}

/**
 * One change to a page's notes, as a POST asks for it.
 * - `page`:  the page's URL path, checked by `notesPage()`
 */
type NoteChange =
  | { page: unknown; action: "add"; for: string; text: string }
  | { page: unknown; action: "edit"; id: string; text: string }
  | { page: unknown; action: "delete"; id: string }
