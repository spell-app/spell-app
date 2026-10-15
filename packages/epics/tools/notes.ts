/**
 * `epic notes <verb> ...`:  the page notes Owen leaves on docs pages, for Claude (epic `airplane`, P3).
 * - Owen wrote them from a page's bubbles, INTO the page, until P11 (guide comments) replaced the bubbles:
 *   the notes already written still show, and this is still how Claude answers them:
 *
 *     epic notes list
 *     guides/solid/solid-2.html#n3  1. The model  2026-10-10 14:02
 *       Why a store here, not a signal?
 *     epic notes answer guides/solid/solid-2.html#n3 --file /tmp/reply.html
 *     epic notes done guides/solid/solid-2.html#n3
 *
 * - `list [<epic>] [--all] [--json]` (default):  every `new` note on every page in the shared folders, by page
 *   - `<epic>`:  only on the pages that epic owns (its own `epics/<epic>/`, or a guide its See Also claims:
 *     `SeeAlso.ownerOf()`), as `epic comments list <epic>`
 *   - `--all`:  answered and done ones too
 *   - `--json`:  `[{ page, id, for, label, status, at, text, replies }]`
 * - `answer <page>#<id> --file <html>`:  Claude's reply under the note
 *   (the file's markup, as is:  a `<p>` or more), and the note `answered`
 * - `done <page>#<id>`:  the note `done`:  nothing more to do for it
 * - `<page>#<id>`:  the note `id` on `<page>`, from the checkout's root (`guides/x.html`) or from an area
 *   (`pages.js` `pageFile()`);  as two words (`guides/x.html n3`) too (`pageAndId()`)
 * - Every write under the page's lock, atomic, formatted (`notesOnDisk.ts` `editNotes()`).
 * - New ones:  `epic comments gather` takes them into epic `guide-changes` too, with the page's comments.
 * - Exit codes:  0;  1 a note or page that isn't there, or can't change (the message says why);  2 usage.
 */
import { readFileSync } from "node:fs"
import { relative, resolve } from "node:path"

import { editNotes, notesIn } from "./notesOnDisk"
import { SeeAlso } from "$/epics/tool/SeeAlso"

import { NotesError } from "./PageNotes.js"
import { AREAS, ROOT, pageAndId, pageFile, parseArgs } from "./pages.js"

const { positional, flags } = parseArgs(process.argv.slice(2))
process.exitCode = await run(positional, flags)

/** Run verb `positional[0]` with its arguments;  returns the exit code. */
async function run([verb = "list", ...words]: string[], flags: Record<string, string | true>): Promise<number> {
  try {
    if (verb === "list") return list(flags, words[0])
    const [page, id] = pageAndId(words)
    if (!page || !id) return usage()
    const file = pageFile(page)
    if (verb === "answer") {
      if (typeof flags.file !== "string") return usage()
      const reply = readFileSync(resolve(flags.file), "utf8")
      await editNotes(file, (notes) => notes.answer(id, reply))
    } else if (verb === "done") await editNotes(file, (notes) => notes.setStatus(id, "done"))
    else return usage()
    console.log(`${relative(ROOT, file)}#${id}  ${verb === "done" ? "done" : "answered"}`)
    return 0
  } catch (error) {
    if (!(error instanceof NotesError) && !isMissingFile(error)) throw error
    console.error((error as Error).message)
    return 1
  }
}

/**
 * Print the notes:  `new` ones unless `--all`;  as JSON with `--json`.
 * - `epic`:  only on the pages epic `epic` owns (`SeeAlso.ownerOf()`)
 */
function list(flags: Record<string, string | true>, epic?: string): number {
  const owners = new SeeAlso(ROOT)
  const notes = notesIn(AREAS, ROOT, { all: Boolean(flags.all) }).filter(
    (note) => !epic || owners.ownerOf(note.page) === epic
  )
  if (flags.json) console.log(JSON.stringify(notes, null, 2))
  else if (!notes.length) console.log(flags.all ? "no notes" : "no new notes")
  else
    for (const note of notes) {
      console.log(
        `${note.page}#${note.id}  ${note.label}  ${note.at}${note.status === "new" ? "" : `  (${note.status})`}`
      )
      for (const line of note.text.split("\n")) console.log(line ? `  ${line}` : "")
    }
  return 0
}

/** A missing page or `--file`:  a message, not a stack trace. */
function isMissingFile(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === "ENOENT"
}

/** Say how it's used;  returns the usage exit code. */
function usage(): number {
  console.error(
    "usage:  epic notes list [<epic>] [--all] [--json]\n" +
      "        epic notes answer <page>#<id> --file <reply.html>\n" +
      "        epic notes done <page>#<id>"
  )
  return 2
}
