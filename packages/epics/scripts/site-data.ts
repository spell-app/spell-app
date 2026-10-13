/**
 * `yarn site:data [--check]`:  Epic UI's data, `packages/epics/docs/__data/components.json` and `search.json`,
 * from the epics pack's definitions and the set's pages (`EpicUISite`;  epic `epic-workflow` P10).
 * - `--check`:  write nothing;  exit 1 while either file is stale (`EpicUISite.test.ts` checks the same)
 * - Rerun after adding or changing an element, or a page's sections;  commit what it writes.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { EpicUISite } from "$/epics/site/EpicUISite"

const site = new EpicUISite()
const isCheck = process.argv.includes("--check")
let stale = 0
for (const [name, text] of Object.entries(site.files())) {
  const file = join(site.folder, "__data", name)
  const before = readOrEmpty(file)
  if (before === text) continue
  stale++
  if (isCheck) console.error(`stale:  ${file}  (yarn site:data, in packages/epics)`)
  else writeFileSync(file, text)
}
console.log(
  `Epic UI's data:  ${stale ? `${stale} file${stale === 1 ? "" : "s"} ${isCheck ? "stale" : "written"}` : "current"}`
)
if (isCheck && stale) process.exit(1)

/** `file`'s text;  `""` when it doesn't exist yet. */
function readOrEmpty(file: string): string {
  try {
    return readFileSync(file, "utf8")
  } catch {
    return ""
  }
}
