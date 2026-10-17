/**
 * Details pages' answers, on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`), listed in the repo
 * root's `package.json` `"pageServer": { "routes": [...] }`.
 * - A DETAILS PAGE:  a page Claude writes to explain a question (`/details`, `epic ask`).
 *   - shown in VS Code's side bar
 *   - Owen answers ON it, and its `<epic-send>` posts the answer here (`$/epics/answers` `AnswerForm`)
 * - `POST /api/docs/details/answer` `{ page, answers, comments, notes, kept }` --
 *   write `<slug>.answer.json5` beside the page `<slug>.html`
 *   - `page`:  the page's URL path, as it was served
 *     - `/pages/details/x.html`, or a worktree's `/worktrees/<w>/...` on the main checkout's server
 *   - ONLY a details page:  anything else is a 403
 *     - scratch `pages/details/`, or an epic's `epics/<name>/details/`
 *     - either under the old `packages/docs/content/` too
 *   - sent again (Owen sends as often as he likes:  the page never locks):
 *     replaces the file, `changes` counts up, and `changed` lists what's new since the last send
 *   - `kept`:  text typed for a question, option or section an agent's rewrite took off the page
 *     (epic `epic-workflow` P18), `[{ id, label, text }]`;  none:  left out
 *   - it deletes the page's draft:  sent, it's done with
 * - `GET /api/docs/details/answer?page=<path>` -- the answer sent, or `{ answer: null }`:  the page shows it on load
 *   - a plain fetch of the missing `.answer.json5` would log a 404 in every fresh page's console
 * - `POST /api/docs/details/draft` `{ page, answers, comments, notes, labels, kept }` --
 *   save what's typed and not sent to `<slug>.draft.json5` beside the page (P18)
 *   - a moment after each change, and as the page goes away
 *   - wakes NOBODY:  `epic ask wait` watches the answer only
 *   - `labels`:  every id the page's parts hold, with its title (`q1` -> `Q1 · Which layout?`),
 *     so text whose question is gone from a rewritten page is kept under its old title
 * - `GET /api/docs/details/draft?page=<path>` -- the draft, or `{ draft: null }`:
 *   the page puts it back on load when it's newer than the answer sent
 * - `epic ask draft <page>` prints the draft for an agent about to rewrite the page (`details.js`)
 * - `epic ask wait` polls for the file itself, and wakes the waiting Claude session when it lands.
 * - every POST needs the page server's token (`x-server-token`) and its own origin (`SRV.Guard`)
 */
import { DataFile } from "$/epics/data/DataFile"
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
      const answer = DataFile.read<DetailsAnswer>(answerFile(detailsPage(web.files, request.query.page))) ?? null
      reply.set("Cache-Control", "no-store").json({ answer })
    })
    api.get("/draft", (request, reply) => {
      const draft = DataFile.read<DetailsDraft>(draftFile(detailsPage(web.files, request.query.page))) ?? null
      reply.set("Cache-Control", "no-store").json({ draft })
    })
    api.use(guard.writeCheck, SRV.parseBodies({ limit: MAX_BODY }))
    api.post("/answer", async (request, reply) => {
      const body = request.body as PostBody
      const file = detailsPage(web.files, body.page)
      const notes = typeof body.notes === "string" ? body.notes : ""
      const answers = toAnswers(body.answers)
      const answer = await saveAnswer(file, body.page as string, answers, notes, toComments(body.comments), {
        kept: toKept(body.kept)
      })
      reply.json({ ok: true, answer })
    })
    api.post("/draft", async (request, reply) => {
      const body = request.body as PostBody & { labels?: unknown }
      const file = detailsPage(web.files, body.page)
      const draft: DetailsDraft = {
        page: body.page as string,
        saved: new Date().toISOString(),
        answers: toAnswers(body.answers),
        comments: toComments(body.comments),
        notes: typeof body.notes === "string" ? body.notes : "",
        labels: toLabels(body.labels)
      }
      const kept = toKept(body.kept)
      if (kept.length) draft.kept = kept
      await saveData(draftFile(file), () => draft)
      reply.json({ ok: true, draft })
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
 * Write `answers` for details page `file` to `<slug>.answer.json5` beside it;  return what was written.
 * - `changed`:  what differs from the answer sent before (none before:  everything sent)
 * - `kept`:  text from questions gone from the page (P18);  none:  left out of the file
 * - the page's draft is deleted:  sent, it's done with
 * - through the page server's one safe write (`SRV.FileOperations.save()`):  the answer before is read and the new
 *   one written under the file's lock, all at once, so `epic ask wait` never reads half a file
 * - a comment added to the file by hand stays (`saveData()`)
 * - SIDE EFFECT:  writes the file, deletes the draft
 */
export async function saveAnswer(
  file: string,
  page: string,
  answers: DetailsAnswers,
  notes: string,
  comments: DetailsComments = {},
  { kept = [] }: { kept?: KeptText[] } = {}
): Promise<DetailsAnswer> {
  let answer!: DetailsAnswer
  await saveData<Partial<DetailsAnswer>>(answerFile(file), (before) => {
    answer = {
      page,
      answered: new Date().toISOString(),
      changes: before ? (before.changes ?? 0) + 1 : 0,
      changed: [],
      answers,
      comments,
      notes: notes.trim()
    }
    if (kept.length) answer.kept = kept
    answer.changed = changedSince(before, answer)
    return answer
  })
  DataFile.remove(draftFile(file))
  return answer
}

/** `<slug>.answer.json5` beside page `<slug>.html`. */
export function answerFile(page: string): string {
  return DataFile.besidePage(page, "answer")
}

/** `<slug>.draft.json5` beside page `<slug>.html`:  what's typed and not sent (P18). */
export function draftFile(page: string): string {
  return DataFile.besidePage(page, "draft")
}

/**
 * Save data file `file` through the page server's one safe write (`SRV.FileOperations.save()`):  `change` gets the
 * data there (its old `.json` too;  `undefined` for none) and returns the new data, written keeping any comment added
 * to the file by hand (`DataFile.edited()`), under the file's lock;  the old `.json` goes.
 * - SIDE EFFECT:  writes `file`, removes its old name
 */
export async function saveData<T>(file: string, change: (before: T | undefined) => unknown): Promise<void> {
  await SRV.FileOperations.save(file, (current) => DataFile.edited<T>(file, current, change))
  DataFile.removeOld(file)
}

/**
 * The keys of `now` that differ from `before`:  question ids (`q3`, `q3-more`), `comment:<section id>`, `notes`,
 * `kept`.
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
  if (!same(before?.kept ?? [], now.kept ?? [])) changed.push("kept")
  return changed
}

/**
 * `kept` from the request, checked:  `[{ id, label, text }]`, blank texts dropped.
 * - 400 unless an array of those (absent:  none)
 */
function toKept(kept: unknown): KeptText[] {
  if (kept === undefined) return []
  if (!Array.isArray(kept)) throw new SRV.HttpError(400, "bad kept text")
  return kept.map((each: unknown) => {
    const { id, label, text } = (each ?? {}) as Record<string, unknown>
    if (typeof id !== "string" || typeof label !== "string" || typeof text !== "string")
      throw new SRV.HttpError(400, "bad kept text")
    return { id, label, text }
  })
}

/**
 * `labels` from the request, checked:  id -> title.
 * - 400 unless an object of strings (absent:  none)
 */
function toLabels(labels: unknown): Record<string, string> {
  if (labels === undefined) return {}
  if (!labels || typeof labels !== "object" || Array.isArray(labels)) throw new SRV.HttpError(400, "bad labels")
  for (const [id, label] of Object.entries(labels)) {
    if (typeof label !== "string") throw new SRV.HttpError(400, `bad label of ${id}`)
  }
  return labels as Record<string, string>
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
 * What a details page's `<slug>.answer.json5` holds.
 * - `page`:  the page's URL path, as sent
 * - `answered`:  when, ISO
 * - `changes`:  how often Owen sent it again (0:  the first answer)
 * - `changed`:  what's new since the send before (`changedSince()`);  absent in answers from before 2026-10-08
 * - `answers`:  by question id (`q1` ...);  a question not decided yet is `{ picked: [] }`
 * - `comments`:  by section id, the comment box under each section that isn't a question;
 *   an option's box is `<question id>-<letter>` (`q1-B`)
 * - `notes`:  the page's notes box, trimmed
 * - `kept`:  text typed for questions, options or sections gone from the page since (P18);  absent for none
 */
export type DetailsAnswer = {
  page: string
  answered: string
  changes: number
  changed?: string[]
  answers: DetailsAnswers
  comments?: DetailsComments
  notes: string
  kept?: KeptText[]
}

/**
 * A details page's `<slug>.draft.json5` (P18):  what's typed and not sent.
 * - `saved`:  when, ISO (the server's clock);  only a draft newer than the answer counts
 * - `labels`:  every id the page's parts held, with its title
 * - `kept`:  as an answer's
 */
export type DetailsDraft = Omit<DetailsAnswer, "answered" | "changes" | "changed"> & {
  saved: string
  comments: DetailsComments
  labels: Record<string, string>
}

/**
 * Text kept after its question, option or section left the page (an agent's rewrite):  the id it was under
 * (`q3`, `q1-B`, `context`, `notes`), its old title, what was typed or picked.
 */
export type KeptText = { id: string; label: string; text: string }

/** A POST's body, unchecked. */
type PostBody = { page?: unknown; answers?: unknown; comments?: unknown; notes?: unknown; kept?: unknown }

/** Comments by section id (`c-today`), or by option (`q1-B`):  trimmed, none blank. */
export type DetailsComments = Record<string, string>

/**
 * Answers by question id.
 * - `picked`:  the options' letters (`["B"]`;  several for a "pick several" question;  `[]` for none or only Other)
 * - `other`:  the "Other" box, when filled
 */
export type DetailsAnswers = Record<string, { picked: string[]; other?: string }>
