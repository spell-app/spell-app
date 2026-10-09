/**
 * `spell dev notes <verb> ...`:  the page notes Owen leaves on docs pages, for Claude (epic `airplane`, P3).
 * - Owen writes them from a page's bubbles (`notesRoutes.ts`), INTO the page;  this is Claude's side:
 *
 *     spell dev notes list
 *     guides/solid/solid-2.html  n3  1. The model  2026-10-10 14:02
 *       Why a store here, not a signal?
 *     spell dev notes answer guides/solid/solid-2.html n3 --file /tmp/reply.html
 *     spell dev notes done guides/solid/solid-2.html n3
 *
 * - `list [--all] [--json]` (default):  every `new` note on every page in the shared folders (`--all`:  answered
 *   and done ones too), by page;  `--json`:  `[{ page, id, for, label, status, at, text, replies }]`
 * - `answer <page> <id> --file <html>`:  Claude's reply under the note (the file's markup, as is:  a `<p>` or
 *   more), and the note `answered`
 * - `done <page> <id>`:  the note `done`:  nothing more to do for it
 * - `<page>`:  from the checkout's root (`guides/x.html`), or from an area (`pages.js` `pageFile()`)
 * - Every write as the page's bubbles write:  under the page's lock, atomic, formatted (`editNotes()`).
 * - Exit codes:  0;  1 a note or page that isn't there, or can't change (the message says why);  2 usage.
 */
import { readFileSync, readdirSync } from "node:fs"
import { join, relative, resolve } from "node:path"

import { editNotes } from "./notesRoutes"
import { NotesError, PageNotes } from "./PageNotes.js"
import { AREAS, ROOT, pageFile, parseArgs } from "./pages.js"

/** Folders under the areas that hold no pages of their own:  a split plan doc's bodies, experiments' output. */
const SKIPPED = /(^|\/)(parts|experiments|node_modules)(\/|$)/

const { positional, flags } = parseArgs(process.argv.slice(2))
process.exitCode = await run(positional, flags)

/** Run verb `positional[0]` with its arguments;  returns the exit code. */
async function run([verb = "list", page, id]: string[], flags: Record<string, string | true>): Promise<number> {
  try {
    if (verb === "list") return list(flags)
    if (!page || !id) return usage()
    const file = pageFile(page)
    if (verb === "answer") {
      if (typeof flags.file !== "string") return usage()
      const reply = readFileSync(resolve(flags.file), "utf8")
      await editNotes(file, (notes) => notes.answer(id, reply))
    } else if (verb === "done") await editNotes(file, (notes) => notes.setStatus(id, "done"))
    else return usage()
    console.log(`${relative(ROOT, file)}  ${id}  ${verb === "done" ? "done" : "answered"}`)
    return 0
  } catch (error) {
    if (!(error instanceof NotesError) && !isMissingFile(error)) throw error
    console.error((error as Error).message)
    return 1
  }
}

/** Print the notes:  `new` ones unless `--all`;  as JSON with `--json`. */
function list(flags: Record<string, string | true>): number {
  const notes = notesIn(AREAS, { all: Boolean(flags.all) })
  if (flags.json) console.log(JSON.stringify(notes, null, 2))
  else if (!notes.length) console.log(flags.all ? "no notes" : "no new notes")
  else
    for (const note of notes) {
      console.log(
        `${note.page}  ${note.id}  ${note.label}  ${note.at}${note.status === "new" ? "" : `  (${note.status})`}`
      )
      for (const line of note.text.split("\n")) console.log(line ? `  ${line}` : "")
    }
  return 0
}

/**
 * The notes on every page under `folders`, page by page:  each note with its page, from the checkout's root.
 * - reads only the pages that hold one (a text check first);  skips `SKIPPED` folders
 */
function notesIn(folders: string[], { all = false } = {}): PageNote[] {
  const found: PageNote[] = []
  for (const folder of folders)
    for (const file of htmlFiles(folder)) {
      const html = readFileSync(file, "utf8")
      if (!html.includes("<spell-note")) continue
      for (const note of new PageNotes(html).notes({ all })) found.push({ page: relative(ROOT, file), ...note })
    }
  return found
}

/** Every `.html` file under `folder` (a link into the shared repo is followed), sorted;  none when it's missing. */
function htmlFiles(folder: string): string[] {
  let names: string[]
  try {
    names = readdirSync(folder, { recursive: true, encoding: "utf8" })
  } catch {
    return []
  }
  return names
    .filter((name) => name.endsWith(".html") && !SKIPPED.test(name))
    .sort()
    .map((name) => join(folder, name))
}

/** A missing page or `--file`:  a message, not a stack trace. */
function isMissingFile(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === "ENOENT"
}

/** Say how it's used;  returns the usage exit code. */
function usage(): number {
  console.error(
    "usage:  spell dev notes list [--all] [--json]\n" +
      "        spell dev notes answer <page> <id> --file <reply.html>\n" +
      "        spell dev notes done <page> <id>"
  )
  return 2
}

/** A note, with the page it's on (from the checkout's root):  as `PageNotes.notes()` gives it, plus `page`. */
type PageNote = { page: string } & ReturnType<PageNotes["notes"]>[number]
