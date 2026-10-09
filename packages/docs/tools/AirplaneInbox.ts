import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

import { readAnswer, listPages } from "./details.js"
import { GoalsPage } from "./goals/page.js"
import { notesIn, type PageNote } from "./notesOnDisk"

/** Where page notes can be (`notesRoutes.ts` takes them on pages there), from the checkout's root. */
const NOTE_FOLDERS = ["pages", "guides", "epics"]

/****************
 * ### `AirplaneInbox`
 * Everything Owen left while he worked with no Claude (epic `airplane` P5):  what `/airplane land` works through,
 * gathered from every place it waits.
 * - each epic's review inbox (`epics/<name>/<name>.inbox.json`, `ReviewInbox`):  marks SENT OR NOT (Owen's
 *   decision Q3 of `airplane`:  on the plane, nobody was there to send them to), drafts (typed, never submitted:
 *   asked about, never acted on), and the requests for now (Do Now, revisit now)
 * - page notes not yet answered (`<spell-note status="new">` in guides and other pages:  `notesOnDisk.ts`)
 * - details pages answered since the flight began (`<slug>.answer.json`, newer than `since`)
 * - goals thoughts not yet digested (`li.goals-thought[data-status="new"]` in the goals pages)
 * - read only:  taking the work is each place's own command (`plan-doc inbox apply`, `details answer`, `/goals-update`)
 ****************/
export class AirplaneInbox {
  /**
   * What's waiting under checkout `root`.
   * - `since`:  when the flight began (ISO time;  `AirplaneMode`'s `since`):  details answers older than it were
   *   answered before, and are left out.  None:  every details answer is left out (no way to tell new from handled)
   */
  static gather(root: string, { since }: { since?: string } = {}): AirplaneInbox {
    return Object.assign(new AirplaneInbox(), {
      since: since ?? null,
      epics: epicsWaiting(root),
      notes: notesIn(
        NOTE_FOLDERS.map((folder) => join(root, folder)),
        root
      ),
      details: since ? detailsAnswered(root, Date.parse(since)) : [],
      thoughts: thoughtsWaiting(root)
    })
  }

  /** the page notes not yet answered (`status="new"`) */
  notes: PageNote[] = []

  /** when the flight began, else `null` */
  since: string | null = null

  /** each epic with anything in its inbox */
  epics: EpicWaiting[] = []

  /** details pages answered since `since` */
  details: DetailsAnswered[] = []

  /** goals thoughts not yet digested */
  thoughts: ThoughtWaiting[] = []

  /** Nothing waiting anywhere. */
  get isEmpty(): boolean {
    return !this.epics.length && !this.notes.length && !this.details.length && !this.thoughts.length
  }

  /** One line per place, for a person:  `epic airplane:  3 marks (1 not sent), 1 draft, 2 for now`. */
  get lines(): string[] {
    const count = (n: number, what: string) => `${n} ${what}${n === 1 ? "" : "s"}`
    return [
      ...this.epics.map((epic) => {
        const unsent = epic.marks.filter((mark) => !mark.sent).length
        const parts = [
          epic.marks.length && `${count(epic.marks.length, "mark")}${unsent ? ` (${unsent} not sent)` : ""}`,
          epic.drafts.length && count(epic.drafts.length, "draft"),
          epic.now.length && `${epic.now.length} for now`
        ].filter(Boolean)
        return `epic ${epic.name}:  ${parts.join(", ")}`
      }),
      ...this.notes.map((note) => `note ${note.page} ${note.id} (${note.label}):  ${note.text.slice(0, 80)}`),
      ...this.details.map((page) => `details ${page.page}:  answered ${page.answered}`),
      ...this.thoughts.map((thought) => `goals ${thought.page} ${thought.id}:  ${thought.text.slice(0, 80)}`)
    ]
  }
}

/** An epic's inbox, as `/airplane land` takes it. */
export type EpicWaiting = {
  name: string
  /** the plan doc, from the checkout's root */
  doc: string
  /** every mark, sent or not:  `{ id, action, at, note?, pick?, ... , sent }` */
  marks: (Record<string, unknown> & { id: string; action: string; sent: boolean })[]
  /** a note box's text, never submitted */
  drafts: (Record<string, unknown> & { id: string; note: string })[]
  /** requests for now:  Do Now, revisit now */
  now: Record<string, unknown>[]
}

/** A details page answered while Owen was away. */
export type DetailsAnswered = { page: string; answered: string }

/** A goals thought waiting to be digested. */
export type ThoughtWaiting = { page: string; id: string; for: string; text: string; date: string }

/** Each epic with anything in its inbox file, by name. */
function epicsWaiting(root: string): EpicWaiting[] {
  const epics = join(root, "epics")
  if (!existsSync(epics)) return []
  return readdirSync(epics)
    .sort()
    .flatMap((name) => {
      const file = join(epics, name, `${name}.inbox.json`)
      if (!existsSync(file)) return []
      const inbox = JSON.parse(readFileSync(file, "utf8")) as InboxFile
      const sent = inbox.sent ? Date.parse(inbox.sent) : 0
      const marks = Object.entries(inbox.marks ?? {}).map(([id, mark]) => ({
        id,
        ...mark,
        sent: Date.parse(String(mark.at)) <= sent
      }))
      const drafts = Object.entries(inbox.drafts ?? {}).map(([id, draft]) => ({ id, ...draft }))
      const now = inbox.now ?? []
      if (!marks.length && !drafts.length && !now.length) return []
      return [{ name, doc: `epics/${name}/${name}.plan.html`, marks, drafts, now }]
    })
}

/** An inbox file's parts read here:  the rest is `ReviewInbox`'s. */
type InboxFile = {
  marks?: Record<string, { action: string; at: string } & Record<string, unknown>>
  drafts?: Record<string, { note: string } & Record<string, unknown>>
  now?: Record<string, unknown>[]
  sent?: string | null
}

/** Details pages whose answer was saved after `since` (ms). */
function detailsAnswered(root: string, since: number): DetailsAnswered[] {
  return (listPages(root) as string[]).flatMap((page) => {
    const answer = page.replace(/\.html$/, ".answer.json")
    if (!existsSync(answer) || statSync(answer).mtimeMs < since || !readAnswer(page)) return []
    return [{ page: relative(root, page), answered: statSync(answer).mtime.toISOString() }]
  })
}

/** Goals thoughts not yet digested, in every goals page. */
function thoughtsWaiting(root: string): ThoughtWaiting[] {
  const goals = join(root, "goals")
  if (!existsSync(goals)) return []
  return htmlUnder(goals).flatMap((file) => {
    const html = readFileSync(file, "utf8")
    if (!html.includes("goals-thought")) return []
    const page = relative(root, file)
    return (GoalsPage.parse(html).thoughts() as { id: string; for: string; text: string; date: string }[]).map(
      (thought) => ({ page, id: thought.id, for: thought.for, text: thought.text, date: thought.date })
    )
  })
}

/** Every `.html` file under `folder`, following links. */
function htmlUnder(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".")) return []
    const full = join(folder, entry.name)
    const isFolder = entry.isDirectory() || (entry.isSymbolicLink() && statSync(full).isDirectory())
    return isFolder ? htmlUnder(full) : entry.name.endsWith(".html") ? [full] : []
  })
}
