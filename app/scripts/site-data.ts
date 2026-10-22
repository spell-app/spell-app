/**
 * `yarn site:data [--check]`:  the App UI docs set's data, `app/docs/__data/components.json5`
 * and `search.json5`,
 * from `app/docs/__data/pages.json5` (hand-kept), the web components' vocabularies and the Solid components' source
 * (`AppUIDataBuilder`, in `src/app/tools/`).
 * - The set's pages read it (`<ui-docs-nav>`'s side column, `<ui-docs-api>`'s tables), as they are:  COMMITTED.
 * - Rerun it after changing a documented component's banner, props or uses, a vocabulary, or `pages.json5`;
 *   `tests/app/tools/AppUIDataBuilder.test.ts` fails while it's stale.
 * - `--check`:  write nothing;  exit 1 if a file would change.
 * - `search.json5`:  every page's sections, read from the pages:  rerun after adding a page or a section too.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"

import { keepingCommentsIn } from "spell-kit/util/node/json5"
import { SiteDataBuilder } from "spell-ui/tools/SiteDataBuilder"

import { AppUIDataBuilder } from "spell-app/app/tools/AppUIDataBuilder"

const { values } = parseArgs({ options: { check: { type: "boolean", default: false } } })
const builder = new AppUIDataBuilder()
const data = await builder.build()
// each file's text keeps the comments somebody wrote into it
const outputs: [file: string, text: string][] = [
  [builder.dataFile, SiteDataBuilder.stringify(data)],
  [builder.searchFile, builder.searchText()]
].map(([file, text]) => [file, keepingCommentsIn(file, text)])
const stale = outputs.filter(([file, text]) => !existsSync(file) || readFileSync(file, "utf8") !== text)
const names = stale.map(([file]) => path.relative(process.cwd(), file)).join(", ")

if (values.check) {
  if (stale.length) {
    process.stderr.write(`app site data:  ${names} stale;  run \`yarn site:data\`\n`)
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
