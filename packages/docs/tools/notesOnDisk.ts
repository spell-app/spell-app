import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"

import { PageNotes } from "./PageNotes.js"

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
