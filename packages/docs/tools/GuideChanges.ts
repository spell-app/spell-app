import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join, posix, relative } from "node:path"

import type { IdentifiedComment } from "$/epics/tool/CommentList"
import { PlanDocCommands } from "$/epics/tool/PlanDocCommands"
import { PlanDocFiles } from "$/epics/tool/PlanDocFiles"

import { targetOf } from "./BlockAnchors.js"
import { GuideInbox } from "./GuideInbox"
import { editNotes, notesIn, type PageNote } from "./notesOnDisk"
import { htmlOf } from "./PageNotes.js"

/** The epic Owen's comments on docs pages are gathered into, one phase per page. */
export const GUIDE_CHANGES = "guide-changes"

/** The folders, from the checkout's root, whose pages take comments (`commentsRoutes.ts`). */
const COMMENT_FOLDERS = ["guides", "pages", "epics"]

/** Folders under those that hold no pages of their own:  a split plan doc's bodies, experiments' output. */
const SKIPPED = /(^|\/)(parts|experiments|node_modules)(\/|$)/

/** The kickoff prompt of the epic, when the first gather makes it. */
const PROMPT =
  "Owen's comments on the docs pages (guides, the docs home, epics' own pages), gathered from each page's inbox by " +
  "`spell dev comments gather`:  one phase per page.  Work each comment into its page (or say why not), then answer " +
  "it under the comment:  `spell dev comments answer <page> <id> --file <reply.html>`."

/****************
 * ### `GuideChanges`
 * Gathers the comments Owen left on docs pages into ONE epic, `guide-changes` (epic `airplane`, P11):
 * `spell dev comments gather` (`comments.ts`), and `/airplane land`.
 * - what it gathers, per page:
 *   - its inbox's comments still waiting (`GuideInbox`, `<page>.inbox.json`;  `CommentList` `waiting`)
 *   - its page notes still `new` (`<spell-note status="new">`, written before P11:  `notesOnDisk.ts`)
 * - ONE PHASE PER PAGE:  the comments its goal, each linked back to the page and its block, quoted;
 *   a page with a phase still open (to do or under way) gets an Updated block in it instead (`addPhaseUpdate()`)
 *   - a page's phase is found by the link to it in the phase's Symptom
 * - the epic is made the first time (`plan-doc new guide-changes --title "Guide Changes"`)
 * - then each comment is marked taken (`taken:  { epic, phase }`), each note answered with a link to the phase:
 *   the page shows where it went, and Owen can no longer edit it
 * - plan docs' comments are NOT gathered:  they wait in their epic's review inbox for `/epic review`
 ****************/
export class GuideChanges {
  /** the checkout's root:  its `guides/`, `pages/`, `epics/` */
  readonly root: string
  /** the epic gathered into:  `guide-changes`, or another (a scratch one, in a test) */
  readonly epic: string

  constructor({ root, epic = GUIDE_CHANGES }: { root: string; epic?: string }) {
    this.root = root
    this.epic = epic
  }

  /**
   * Every page with comments waiting or new notes, in page order;  `pages` (from the root:  `guides/x.html`) only
   * those.
   */
  waiting(pages?: string[]): PageWaiting[] {
    const notes = notesIn(
      COMMENT_FOLDERS.map((folder) => join(this.root, folder)),
      this.root
    )
    const found = new Map<string, PageWaiting>()
    const entry = (page: string) => {
      if (!found.has(page)) found.set(page, { page, title: titleOf(join(this.root, page)), comments: [], notes: [] })
      return found.get(page)!
    }
    for (const inbox of this.inboxFiles()) {
      const page = relative(this.root, inbox).replace(/\.inbox\.json$/, ".html")
      const comments = GuideInbox.read(inbox).commentList.waiting
      if (comments.length) entry(page).comments.push(...comments)
    }
    for (const note of notes) entry(note.page).notes.push(note)
    const wanted = pages && new Set(pages.map((page) => posix.normalize(page)))
    return [...found.values()]
      .filter((each) => !wanted || wanted.has(each.page))
      .sort((a, b) => a.page.localeCompare(b.page))
  }

  /**
   * Gather what's waiting (`waiting(pages)`) into the epic:  a phase per page, or an Updated block in its open phase;
   * then mark each comment taken and answer each note.  Resolves to what went where.
   * - nothing waiting:  `[]`, and no epic is made
   * - throws what the plan-doc tool throws;  nothing is marked taken until the doc is written
   * - SIDE EFFECT:  writes the plan doc (made the first time), the pages' inboxes and the notes' pages
   */
  async gather(pages?: string[]): Promise<Gathered[]> {
    const waiting = this.waiting(pages)
    if (!waiting.length) return []
    const files = new PlanDocFiles({ root: this.root })
    const doc = await this.epicDoc(files)
    const gathered = await files.edit(doc, (plan) =>
      waiting.map((page): Gathered => {
        const link = this.hrefTo(page.page)
        const open = plan.phases.find(
          (phase) => phase.status !== "done" && plan.phase(phase.n).querySelector(`a[href="${link}"]`)
        )
        const list = `<ul>${[...page.comments.map((each) => this.commentItem(page.page, each)), ...page.notes.map((each) => this.noteItem(page.page, each))].join("")}</ul>`
        const count = page.comments.length + page.notes.length
        const many = (n: number) => `${n} ${n === 1 ? "comment" : "comments"}`
        let phase: number
        if (open) {
          phase = open.n
          plan.addPhaseUpdate(phase, `<p>${many(count)} more from Owen:</p>${list}`)
        } else {
          phase = plan.addPhase(page.title, {
            symptom: `Owen left ${many(count)} on <a href="${link}">${escape(page.title)}</a> (<code>${escape(page.page)}</code>).`,
            changes:
              `Work each into the page, or say why not;  then answer it under the comment:  ` +
              `<code>spell dev comments answer ${escape(page.page)} &lt;id&gt; --file reply.html</code>.`,
            goal: list
          })
          plan.log(`P${phase} added:  ${page.title} (${many(count)}, spell dev comments gather)`)
        }
        return {
          page: page.page,
          epic: this.epic,
          phase,
          as: open ? "update" : "phase",
          comments: page.comments.map((each) => each.id),
          notes: page.notes.map((each) => each.id)
        }
      })
    )
    for (const each of gathered) await this.markTaken(each)
    files.reindex()
    return gathered
  }

  ////////////////
  // ## The epic
  ////////////////

  /** The epic's plan doc;  made the first time, as `plan-doc new <epic> --title "Guide Changes"`. */
  private async epicDoc(files: PlanDocFiles): Promise<string> {
    const found = PlanDocFiles.planDocIn(join(files.epics, this.epic), this.epic)
    if (found) return found
    const commands = new PlanDocCommands({ files })
    // the tool prints what it wrote;  here that goes nowhere
    commands.print = () => {}
    const made = await commands.run(["new", this.epic, "--title", "Guide Changes", "--prompt", PROMPT])
    if (made !== 0) throw new Error(`GuideChanges.gather():  couldn't make epic ${this.epic}`)
    return files.docPath(this.epic)
  }

  /** A link from the epic's plan doc (`epics/<epic>/`) to `page` (from the root), with `hash`. */
  private hrefTo(page: string, hash = ""): string {
    return `../../${page}${hash ? `#${hash}` : ""}`
  }

  /** A comment, as its line in the phase's goal:  where (linked), what it quotes, Owen's words, its id. */
  private commentItem(page: string, comment: IdentifiedComment): string {
    const where =
      comment.kind === "page"
        ? "the page"
        : comment.kind === "section"
          ? comment.label
          : `${comment.kind}${comment.label ? ` in ${comment.label}` : ""}`
    const about = comment.quote
      ? ` on <q>${escape(comment.quote)}</q>`
      : comment.excerpt && comment.kind !== "section"
        ? ` (<q>${escape(comment.excerpt)}</q>)`
        : ""
    const words = htmlOf(comment.text).join("")
    return `<li><a href="${this.hrefTo(page, targetOf(comment.anchor))}">${escape(where || comment.anchor)}</a>${about}, <code>${comment.id}</code>:  ${words}</li>`
  }

  /** A page note (before P11), as its line in the phase's goal. */
  private noteItem(page: string, note: PageNote): string {
    const target = note.for === "page" ? "" : note.for
    return `<li><a href="${this.hrefTo(page, target)}">${escape(note.label)}</a>, page note <code>${note.id}</code>:  ${htmlOf(note.text).join("")}</li>`
  }

  /** Mark what went into a phase as taken:  the comments in the page's inbox, the notes answered with a link. */
  private async markTaken({ page, phase, comments, notes }: Gathered): Promise<void> {
    const file = join(this.root, page)
    if (comments.length)
      GuideInbox.update(GuideInbox.fileFor(file), (list) => {
        for (const id of comments) list.take(id, { epic: this.epic, phase })
      })
    if (!notes.length) return
    const doc = relative(dirname(file), join(this.root, "epics", this.epic, `${this.epic}.plan.html`))
    const reply = `<p>Taken into <a href="${doc}#p${phase}">${this.epic} P${phase}</a>.</p>`
    await editNotes(file, (pageNotes) => {
      for (const id of notes) pageNotes.answer(id, reply)
    })
  }

  ////////////////
  // ## Finding inboxes
  ////////////////

  /** Every docs page's inbox file (`<page>.inbox.json` beside a `<page>.html`, never a plan doc's), sorted. */
  inboxFiles(): string[] {
    return COMMENT_FOLDERS.flatMap((folder) => {
      const top = join(this.root, folder)
      let names: string[]
      try {
        names = readdirSync(top, { recursive: true, encoding: "utf8" })
      } catch {
        return []
      }
      return names
        .filter((name) => name.endsWith(".inbox.json") && !SKIPPED.test(name))
        .map((name) => join(top, name))
        .filter((file) => existsSync(file.replace(/\.inbox\.json$/, ".html")))
        .sort()
    })
  }
}

/** A page with comments or notes waiting. */
export type PageWaiting = {
  /** the page, from the checkout's root:  `guides/x.html` */
  page: string
  /** its `<title>`, short:  the phase's name */
  title: string
  /** its comments still waiting */
  comments: IdentifiedComment[]
  /** its page notes still `new` */
  notes: PageNote[]
}

/** What a gather did for one page. */
export type Gathered = {
  page: string
  epic: string
  /** the phase it went into */
  phase: number
  /** `phase`:  a new phase;  `update`:  an Updated block in the page's open phase */
  as: "phase" | "update"
  /** the comments' ids, now taken */
  comments: string[]
  /** the notes' ids, now answered */
  notes: string[]
}

/** Page `file`'s `<title>`, without a site suffix (` · Spell docs`);  its file name when it has none. */
function titleOf(file: string): string {
  const html = existsSync(file) ? readFileSync(file, "utf8") : ""
  const title = /<title>([^<]*)<\/title>/
    .exec(html)?.[1]
    ?.split(/\s+[·|—–-]\s+/)[0]
    ?.replace(/&amp;/g, "&")
    .trim()
  return title || file.replace(/^.*\/|\.html$/g, "")
}

/** Escape for HTML text. */
function escape(value: string): string {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
