import { readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs"
import { basename, dirname, join, relative } from "node:path"

import { AS } from "$/assembler"
import { SRV } from "$/server"

import { PageNotes } from "./PageNotes.js"

/**
 * Change the notes of the page at `file` with `change(notes)`, under the page's lock;
 * returns what `change` returned (`spell dev notes answer | done`, and `spell dev comments gather`).
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

/**
 * The page notes on every page under `folders`, page by page:  each note with its page, from checkout `root`
 * (epic `airplane`:  `spell dev notes list`, and `/airplane land`'s `AirplaneInbox`).
 * - `all`:  answered and done notes too;  default:  the `new` ones
 * - reads only the pages that hold one (a text check first);  skips `SKIPPED` folders
 */
export function notesIn(folders: string[], root: string, { all = false } = {}): PageNote[] {
  const found: PageNote[] = []
  for (const folder of folders)
    for (const file of htmlFiles(folder)) {
      const html = readFileSync(file, "utf8")
      if (!html.includes("<spell-note")) continue
      for (const note of new PageNotes(html).notes({ all })) found.push({ page: relative(root, file), ...note })
    }
  return found
}

/** A note, with the page it's on (from the checkout's root):  as `PageNotes.notes()` gives it, plus `page`. */
export type PageNote = { page: string } & ReturnType<PageNotes["notes"]>[number]

/** Folders under the areas that hold no pages of their own:  a split plan doc's bodies, experiments' output. */
const SKIPPED = /(^|\/)(parts|experiments|node_modules)(\/|$)/

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
