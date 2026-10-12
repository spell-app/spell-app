/**
 * `yarn site:data [--check]` (in `packages/app`):  the App UI docs set's data, `components/_data/components.json`
 * and `search.json`,
 * from `components/_data/pages.json` (hand-kept), the web components' vocabularies and the Solid components' source
 * (`tools/AppUIDataBuilder.ts`).
 * - The set's pages read it (`<ui-docs-nav>`'s side column, `<ui-docs-api>`'s tables), as they are:  COMMITTED.
 * - Rerun it after changing a documented component's banner, props or uses, a vocabulary, or `pages.json`;
 *   `tools/AppUIDataBuilder.test.ts` fails while it's stale.
 * - `--check`:  write nothing;  exit 1 if a file would change.
 * - `search.json`:  every page's sections, read from the pages:  rerun after adding a page or a section too.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"

import { SiteDataBuilder } from "$/ui/tools/SiteDataBuilder"

import { AppUIDataBuilder } from "../tools/AppUIDataBuilder.ts"

const { values } = parseArgs({ options: { check: { type: "boolean", default: false } } })
const builder = new AppUIDataBuilder()
const data = await builder.build()
const outputs: [file: string, text: string][] = [
  [builder.dataFile, SiteDataBuilder.stringify(data)],
  [builder.searchFile, builder.searchText()]
]
const stale = outputs.filter(([file, text]) => !existsSync(file) || readFileSync(file, "utf8") !== text)
const names = stale.map(([file]) => path.relative(process.cwd(), file)).join(", ")

if (values.check) {
  if (stale.length) {
    process.stderr.write(`app site data:  ${names} stale;  run \`yarn site:data\` in packages/app\n`)
    process.exit(1)
  }
} else {
  mkdirSync(builder.dataFolder, { recursive: true })
  for (const [file, text] of stale) writeFileSync(file, text)
}
process.stdout.write(
  `app site data:  ${data.components.length} tags on ${Object.keys(data.families).length} pages, ` +
    `${data.topics.length} groups;  ${stale.length ? (values.check ? "stale" : "wrote") + ` ${names}` : "unchanged"}\n`
)
