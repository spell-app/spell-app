import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"

import { DataFile } from "$/epics/data/DataFile"

import type { Migration, MigrationContext } from "./migrations.types"

/****************
 * ### `Json5DataFiles`
 * The migration `json5-data-files` (epic `epic-workflow` P21):  an epic's DATA FILES, beside its page, renamed from
 * `.json` to `.json5`, the name the tooling writes now (`DataFile`).
 * - the files:  in the page's folder, its review inbox (`<name>.inbox.json`) and running agents (`agents.json`);  in
 *   its `details/`, each page's answer, draft and rows (`<slug>.answer.json`, `.draft.json`, `.rows.json`, an
 *   archived `<slug>.round2.answer.json` too)
 * - the step says which files to rename (`context.files`), and the runner renames them after the page
 *   (`PlanDocFiles.migrate()`), as `links-agree`'s comment moves are written after it
 * - a file whose new name is there too is left, said in the notes:  a checkout on older code wrote the old one since
 * - the page's LINKS to any data file by its old name (its own, another epic's, the docs home's ...) take the new one
 *   (`DataFile.linkFor()`):  the only change to the page, which is then written, as any step's change is.  Other
 *   pages' links:  the docs tools' data files pass (`packages/epics/tools/migrate.js`)
 * - why a step and not just the readers:  they read the old name while there's no `.json5`, but a file nothing writes
 *   again would keep it for ever
 * - IDEMPOTENT:  once no old-named data file is left, and no link names one, it finds nothing
 * - Runs on command (`migrate`), never on every edit:  it renames files
 ****************/
export class Json5DataFiles implements Migration {
  readonly name = "json5-data-files"
  readonly kind = "epic"
  readonly date = "2026-10-14"
  readonly everyEdit = false
  readonly description = "the epic's data files (inbox, agents, details pages' answers, drafts, rows):  .json -> .json5"

  /**
   * Find the old-named data files in the page's folder (`context.folder`) into `context.files`, and point the page's
   * links to data files at their new names;  did the page change?
   */
  run(document: Document, context: MigrationContext): boolean {
    if (!context.folder) return false
    const links = this.relink(document, context.folder, context.root ?? join(context.folder, "..", ".."))
    if (links) context.notes?.push(`${this.name}:  ${links} link${links === 1 ? "" : "s"} to .json5`)
    const old = [
      ...namesIn(context.folder, OWN_FILE).map((name) => join(context.folder!, name)),
      ...namesIn(join(context.folder, "details"), DETAILS_FILE).map((name) => join(context.folder!, "details", name))
    ]
    if (!old.length) return links > 0
    const moves = old.map((file) => DataFile.moveOf(file))
    context.files = [...(context.files ?? []), ...moves]
    const named = (each: string) => each.slice(context.folder!.length + 1)
    const renamed = moves.filter((move) => !move.clash)
    const clashes = moves.filter((move) => move.clash)
    if (renamed.length)
      context.notes?.push(
        `${this.name}:  ${renamed.length} to .json5 (${renamed.map((move) => named(move.from)).join(", ")})`
      )
    if (clashes.length)
      context.notes?.push(
        `${this.name}:  LEFT, both names there (merge them by hand):  ${clashes.map((move) => named(move.from)).join(", ")}`
      )
    return links > 0
  }

  /** Point `document`'s links to data files by their old names at their new ones;  how many changed. */
  private relink(document: Document, folder: string, root: string): number {
    let changed = 0
    for (const link of document.querySelectorAll("a[href]")) {
      const href = DataFile.linkFor(link.getAttribute("href")!, folder, root)
      if (href === undefined) continue
      link.setAttribute("href", href)
      changed++
    }
    return changed
  }
}

/** The names in `folder` matching `pattern`, sorted;  none for no folder. */
function namesIn(folder: string, pattern: RegExp): string[] {
  if (!existsSync(folder)) return []
  return readdirSync(folder)
    .filter((name) => pattern.test(name))
    .sort()
}

/** An old-named data file beside an epic (or saga) page:  its review inbox, its running agents. */
const OWN_FILE = /^(.+\.inbox|agents)\.json$/

/** An old-named data file in an epic's `details/`:  a page's answer (an archived round's too), draft or rows. */
const DETAILS_FILE = /\.(answer|draft|rows)\.json$/
