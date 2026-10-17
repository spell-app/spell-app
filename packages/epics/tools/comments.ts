/**
 * `epic comments <verb> ...`:  the comments Owen leaves on docs pages' blocks, for Claude (epic `airplane`, P11).
 * - Owen writes them from a page's bullhorns (`commentsRoutes.ts`) into the page's inbox file, `<page>.inbox.json5`
 *   (`GuideInbox`);  this is Claude's side:
 *
 *     epic comments list
 *     guides/solid/solid-2.html#M3  table in 2. Memory  2026-10-10T14:02:00.000Z
 *       Too wide on a phone?
 *     epic comments gather
 *     guides/solid/solid-2.html  ->  guide-changes#P4 (new phase):  M3
 *     epic comments answer guides/solid/solid-2.html#M3 --file /tmp/reply.html
 *
 * - `list [<epic>] [--all] [--json]` (default):  every comment still waiting, on every docs page, by page
 *   - `<epic>`:  only that epic's:  on a page it owns (its own `epics/<epic>/details/`, or a guide its See Also
 *     claims:  `SeeAlso.ownerOf()`), or taken into it
 *   - `--all`:  taken and answered ones too
 *   - `--json`:  `[{ page, id, anchor, kind, label, excerpt, quote?, text, at, status, ... }]`
 * - `gather [<page>... | --all] [--epic <name>] [--json]`:  every waiting comment (and page note still `new`) into
 *   epic `guide-changes`, one phase per page (`GuideChanges`);  each comment marked taken
 *   - no page:  every page no epic owns (as `--all`)
 *   - `--epic`:  another epic than `guide-changes` (a scratch one, to try it)
 *   - `--json`:  `[{ page, epic, phase, as: "phase" | "update", comments, notes }]`
 * - `answer <page>#<id> --file <html> [--commit <sha>]`:  Claude's answer on the comment's thread (the file's
 *   markup, as is);  `--commit`, the commit it was built in (the thread's Done line shows it)
 * - `wait [<page>...] [--timeout 8h]`:  block until a comment starts waiting for Claude (on those pages, else on any),
 *   print it as `list` does, exit 0;  timeout:  exit 2.  Run it in the background:  its exit wakes the session
 * - `working <page>#<id> on | off`:  Claude is thinking about the comment (on), or stopped:  its thread shows a
 *   "Claude: thinking…" stub meanwhile;  `answer` turns it off
 * - a THREAD:  Owen answers Claude's answer on the page (that's good, reply, skip it:  `CommentList`);  his reply is
 *   waiting work, as a new comment is:  `list` shows it under the comment, `gather` takes it again
 * - `<page>`:  from the checkout's root (`guides/x.html`), or from an area (`pages.js` `pageFile()`);  a comment on
 *   it, `<page>#<id>`, as on an epic page (`seo#M3`), or as two words, `<page> <id>` (`pageAndId()`)
 * - `<id>`:  a comment's, as the page shows it, `M3`;  `m3` and the old `cm3` read the same (`CommentList.idOf()`).
 *   Printed `M3`
 * - epic pages' comments wait in their epic's review inbox instead:  `epic inbox <name>`
 * - a page an epic owns (epic `epic-workflow` P13):  its header's Send hands its comments to that epic's session
 *   (`epic inbox <epic> wait` prints them under the page);  `working` and `answer`, here, take them one at a time.
 *   `gather` leaves them out, unless the page is named.
 * - Exit codes:  0;  1 a comment or page that isn't there (the message says why);  2 usage.
 */
import { existsSync, readFileSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { CommentList, CommentsError } from "$/epics/tool/CommentList"
import { GuideInbox } from "$/epics/tool/GuideInbox"
import { ReviewInbox } from "$/epics/tool/ReviewInbox"
import { SeeAlso } from "$/epics/tool/SeeAlso"

import { duration } from "./details.js"
import { GUIDE_CHANGES, GuideChanges } from "./GuideChanges"
import { ROOT, pageAndId, pageFile, parseArgs } from "./pages.js"

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2))
  process.exitCode = await run(positional, flags)
}

/** Run verb `positional[0]` with its arguments;  returns the exit code. */
export async function run([verb = "list", ...rest]: string[], flags: Record<string, string | true>): Promise<number> {
  try {
    if (verb === "list") return list(flags, rest[0])
    if (verb === "gather") return await gather(rest, flags)
    if (verb === "wait") return await wait(rest, flags)
    if (verb === "working") return working(pageAndId(rest))
    if (verb !== "answer") return usage()
    const [page, id] = pageAndId(rest)
    if (!page || !id || typeof flags.file !== "string") return usage()
    const reply = readFileSync(resolve(flags.file), "utf8")
    const commit = typeof flags.commit === "string" ? flags.commit : undefined
    GuideInbox.update(GuideInbox.fileFor(pageFile(page)), (comments) => comments.answer(id, reply, new Date(), commit))
    touchOwner(page)
    console.log(`${relative(ROOT, pageFile(page))}#${CommentList.label(id)}  answered`)
    return 0
  } catch (error) {
    if (!(error instanceof CommentsError) && !isMissingFile(error)) throw error
    console.error((error as Error).message)
    return 1
  }
}

/**
 * `working <page>#<id> on | off`:  Claude is thinking about comment `id` on `page`, or stopped;  the thread shows a
 * "Claude: thinking…" stub meanwhile (`CommentList.setWorking()`).  `answer` turns it off.
 */
function working([page, id, on]: string[]): number {
  if (!page || !id || (on !== "on" && on !== "off")) return usage()
  GuideInbox.update(GuideInbox.fileFor(pageFile(page)), (comments) => comments.setWorking(id, on === "on"))
  touchOwner(page)
  console.log(`${relative(ROOT, pageFile(page))}#${CommentList.label(id)}  working:  ${on}`)
  return 0
}

/**
 * A session answering comments on a page an epic owns is still listening to that epic (epic `epic-workflow` P13):
 * stamp the heartbeat of the session listening to its review inbox, as `epic inbox ... working` does.
 * - nobody listening, or no epic owns the page:  nothing written
 */
function touchOwner(page: string): void {
  const epic = new SeeAlso(ROOT).ownerOf(relative(ROOT, pageFile(page)))
  if (!epic) return
  const file = ReviewInbox.pathFor(join(ROOT, "epics", epic, `${epic}.plan.html`))
  if (!existsSync(file) || !ReviewInbox.read(file).listening) return
  ReviewInbox.update(file, (box) => box.touchListening())
}

/**
 * Print the comments:  waiting ones unless `--all`;  as JSON with `--json`.
 * - `epic`:  only epic `epic`'s:  on a page it owns (`SeeAlso.ownerOf()`), or taken into one of its phases
 */
function list(flags: Record<string, string | true>, epic?: string): number {
  const comments = pageComments(new GuideChanges({ root: ROOT }).inboxFiles(), flags.all ? "all" : "waiting")
  const owners = new SeeAlso(ROOT)
  const shown = epic
    ? comments.filter((comment) => comment.taken?.epic === epic || owners.ownerOf(comment.page) === epic)
    : comments
  if (flags.json) console.log(JSON.stringify(shown, null, 2))
  else if (!shown.length) console.log(flags.all ? "no comments" : "no comments waiting")
  else printComments(shown)
  return 0
}

/**
 * `wait [<page>...] [--timeout 8h]`:
 * block until a comment starts WAITING for Claude on one of `pages` (none:  any docs page),
 * print it as `list` does, exit 0;  `--timeout` passes first:  exit 2.
 * - Run it in the BACKGROUND:  its exit wakes the session, as `epic ask wait` does for a details page.
 * - New:  a comment that wasn't waiting as it started, or Owen's newer reply on one that was.
 * - e.g. the spell syntax guide's wand, which adds a comment on its row:  "Provide more details here"
 */
async function wait(pages: string[], flags: Record<string, string | true>): Promise<number> {
  const timeout = duration(typeof flags.timeout === "string" ? flags.timeout : DEFAULT_TIMEOUT)
  const inboxes = () =>
    pages.length
      ? pages.map((page) => GuideInbox.fileFor(pageFile(page)))
      : new GuideChanges({ root: ROOT }).inboxFiles()
  const known = new Set(pageComments(inboxes(), "waiting").map(waitingKey))
  console.log(`waiting for a new comment on ${pages.length ? pages.join(", ") : "any docs page"}`)
  for (const end = Date.now() + timeout; Date.now() < end;) {
    await new Promise((done) => setTimeout(done, Math.min(WAIT_POLL_MS, Math.max(0, end - Date.now()))))
    const fresh = pageComments(inboxes(), "waiting").filter((comment) => !known.has(waitingKey(comment)))
    if (!fresh.length) continue
    printComments(fresh)
    return 0
  }
  console.log(`no new comment after ${String(flags.timeout ?? DEFAULT_TIMEOUT)}`)
  return 2
}

/** The comments in inbox files `files` (`all`, or only those `waiting` for Claude), each with its page. */
function pageComments(files: string[], which: "all" | "waiting") {
  return files.flatMap((file) => {
    const page = relative(ROOT, file).replace(/\.inbox\.json5?$/, ".html")
    const { commentList } = GuideInbox.read(file)
    return (which === "all" ? commentList.all : commentList.waiting).map((comment) => ({ page, ...comment }))
  })
}

/** What makes a waiting comment new to `wait`:  its page, its id, and Owen's last words on it. */
function waitingKey(comment: ReturnType<typeof pageComments>[number]): string {
  const owen = comment.replies?.findLast((each) => each.by === "Owen")
  return `${comment.page}#${comment.id}@${owen?.at ?? comment.at}`
}

/** Print `comments` as `list` does:  page, id, where, when;  the quote;  the text;  Owen's latest reply. */
function printComments(comments: ReturnType<typeof pageComments>) {
  for (const comment of comments) {
    const where =
      comment.kind === "section" ? comment.label : `${comment.kind}${comment.label ? ` in ${comment.label}` : ""}`
    const state = comment.status === "new" ? "" : `  (${comment.status})`
    console.log(`${comment.page}#${CommentList.label(comment.id)}  ${where || comment.anchor}  ${comment.at}${state}`)
    if (comment.quote) console.log(`  on "${comment.quote}"`)
    for (const line of comment.text.split("\n")) console.log(line ? `  ${line}` : "")
    // his reply on the thread since Claude answered:  the work now
    const reply = CommentList.isWaiting(comment) && comment.replies?.findLast((each) => each.by === "Owen")
    if (!reply) continue
    console.log(`  Owen replied ${reply.at}:`)
    for (const line of reply.text!.split("\n")) console.log(line ? `    ${line}` : "")
  }
}

/** How long `wait` waits by default:  8 hours, as `epic ask wait`. */
const DEFAULT_TIMEOUT = "8h"

/** How often `wait` looks at the inbox files, ms. */
const WAIT_POLL_MS = 2000

/** Gather the waiting comments into the epic, one phase per page;  print what went where. */
async function gather(pages: string[], flags: Record<string, string | true>): Promise<number> {
  const epic = typeof flags.epic === "string" ? flags.epic : GUIDE_CHANGES
  const only = flags.all || !pages.length ? undefined : pages.map((page) => relative(ROOT, pageFile(page)))
  const gathered = await new GuideChanges({ root: ROOT, epic }).gather(only)
  if (flags.json) console.log(JSON.stringify(gathered, null, 2))
  else if (!gathered.length) console.log("no comments waiting")
  else
    for (const each of gathered)
      console.log(
        `${each.page}  ->  ${each.epic}#P${each.phase} (${each.as === "phase" ? "new phase" : "updated"}):  ` +
          [...each.comments.map(CommentList.label), ...each.notes].join(" ")
      )
  return 0
}

/** A missing page or `--file`:  a message, not a stack trace. */
function isMissingFile(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === "ENOENT"
}

/** Say how it's used;  returns the usage exit code. */
function usage(): number {
  console.error(
    "usage:  epic comments list [<epic>] [--all] [--json]\n" +
      "        epic comments gather [<page>... | --all] [--epic <name>] [--json]\n" +
      "        epic comments wait [<page>...] [--timeout 8h]\n" +
      "        epic comments answer <page>#<id> --file <reply.html> [--commit <sha>]\n" +
      "        epic comments working <page>#<id> on | off"
  )
  return 2
}
