/**
 * `spell dev comments <verb> ...`:  the comments Owen leaves on docs pages' blocks, for Claude (epic `airplane`, P11).
 * - Owen writes them from a page's bullhorns (`commentsRoutes.ts`) into the page's inbox file, `<page>.inbox.json`
 *   (`GuideInbox`);  this is Claude's side:
 *
 *     spell dev comments list
 *     guides/solid/solid-2.html  cm3  table in 2. Memory  2026-10-10T14:02:00.000Z
 *       Too wide on a phone?
 *     spell dev comments gather
 *     guides/solid/solid-2.html  ->  guide-changes P4 (new phase):  cm3
 *     spell dev comments answer guides/solid/solid-2.html cm3 --file /tmp/reply.html
 *
 * - `list [--all] [--json]` (default):  every comment still waiting, on every docs page, by page
 *   - `--all`:  taken and answered ones too
 *   - `--json`:  `[{ page, id, anchor, kind, label, excerpt, quote?, text, at, status, ... }]`
 * - `gather [<page>... | --all] [--epic <name>] [--json]`:  every waiting comment (and page note still `new`) into
 *   epic `guide-changes`, one phase per page (`GuideChanges`);  each comment marked taken
 *   - no page:  every page (as `--all`)
 *   - `--epic`:  another epic than `guide-changes` (a scratch one, to try it)
 *   - `--json`:  `[{ page, epic, phase, as: "phase" | "update", comments, notes }]`
 * - `answer <page> <id> --file <html> [--commit <sha>]`:  Claude's answer on the comment's thread (the file's
 *   markup, as is);  `--commit`, the commit it was built in (the thread's Done line shows it)
 * - `working <page> <id> on | off`:  Claude is thinking about the comment (on), or stopped:  its thread shows a
 *   "Claude: thinking…" stub meanwhile;  `answer` turns it off
 * - a THREAD:  Owen answers Claude's answer on the page (that's good, reply, skip it:  `CommentList`);  his reply is
 *   waiting work, as a new comment is:  `list` shows it under the comment, `gather` takes it again
 * - `<page>`:  from the checkout's root (`guides/x.html`), or from an area (`pages.js` `pageFile()`)
 * - plan docs' comments wait in their epic's review inbox instead:  `spell dev plan-doc inbox <name>`
 * - Exit codes:  0;  1 a comment or page that isn't there (the message says why);  2 usage.
 */
import { readFileSync } from "node:fs"
import { relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { CommentList, CommentsError } from "$/epics/tool/CommentList"

import { GUIDE_CHANGES, GuideChanges } from "./GuideChanges"
import { GuideInbox } from "./GuideInbox"
import { ROOT, pageFile, parseArgs } from "./pages.js"

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2))
  process.exitCode = await run(positional, flags)
}

/** Run verb `positional[0]` with its arguments;  returns the exit code. */
export async function run([verb = "list", ...rest]: string[], flags: Record<string, string | true>): Promise<number> {
  try {
    if (verb === "list") return list(flags)
    if (verb === "gather") return await gather(rest, flags)
    if (verb === "working") return working(rest)
    if (verb !== "answer") return usage()
    const [page, id] = rest
    if (!page || !id || typeof flags.file !== "string") return usage()
    const reply = readFileSync(resolve(flags.file), "utf8")
    const commit = typeof flags.commit === "string" ? flags.commit : undefined
    GuideInbox.update(GuideInbox.fileFor(pageFile(page)), (comments) => comments.answer(id, reply, new Date(), commit))
    console.log(`${relative(ROOT, pageFile(page))}  ${id}  answered`)
    return 0
  } catch (error) {
    if (!(error instanceof CommentsError) && !isMissingFile(error)) throw error
    console.error((error as Error).message)
    return 1
  }
}

/**
 * `working <page> <id> on | off`:  Claude is thinking about comment `id` on `page`, or stopped;  the thread shows a
 * "Claude: thinking…" stub meanwhile (`CommentList.setWorking()`).  `answer` turns it off.
 */
function working([page, id, on]: string[]): number {
  if (!page || !id || (on !== "on" && on !== "off")) return usage()
  GuideInbox.update(GuideInbox.fileFor(pageFile(page)), (comments) => comments.setWorking(id, on === "on"))
  console.log(`${relative(ROOT, pageFile(page))}  ${id}  working:  ${on}`)
  return 0
}

/** Print the comments:  waiting ones unless `--all`;  as JSON with `--json`. */
function list(flags: Record<string, string | true>): number {
  const changes = new GuideChanges({ root: ROOT })
  const comments = changes.inboxFiles().flatMap((file) => {
    const page = relative(ROOT, file).replace(/\.inbox\.json$/, ".html")
    const { commentList } = GuideInbox.read(file)
    return (flags.all ? commentList.all : commentList.waiting).map((comment) => ({ page, ...comment }))
  })
  if (flags.json) console.log(JSON.stringify(comments, null, 2))
  else if (!comments.length) console.log(flags.all ? "no comments" : "no comments waiting")
  else
    for (const comment of comments) {
      const where =
        comment.kind === "section" ? comment.label : `${comment.kind}${comment.label ? ` in ${comment.label}` : ""}`
      const state = comment.status === "new" ? "" : `  (${comment.status})`
      console.log(`${comment.page}  ${comment.id}  ${where || comment.anchor}  ${comment.at}${state}`)
      if (comment.quote) console.log(`  on "${comment.quote}"`)
      for (const line of comment.text.split("\n")) console.log(line ? `  ${line}` : "")
      // his reply on the thread since Claude answered:  the work now
      const reply = CommentList.isWaiting(comment) && comment.replies?.findLast((each) => each.by === "Owen")
      if (!reply) continue
      console.log(`  Owen replied ${reply.at}:`)
      for (const line of reply.text!.split("\n")) console.log(line ? `    ${line}` : "")
    }
  return 0
}

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
        `${each.page}  ->  ${each.epic} P${each.phase} (${each.as === "phase" ? "new phase" : "updated"}):  ` +
          [...each.comments, ...each.notes].join(" ")
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
    "usage:  spell dev comments list [--all] [--json]\n" +
      "        spell dev comments gather [<page>... | --all] [--epic <name>] [--json]\n" +
      "        spell dev comments answer <page> <id> --file <reply.html> [--commit <sha>]\n" +
      "        spell dev comments working <page> <id> on | off"
  )
  return 2
}
