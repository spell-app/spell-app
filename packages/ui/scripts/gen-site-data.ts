/**
 * `yarn site:data`:  write the Spell UI site's data, `site/_data/components.json` and `icons.json` (the icon
 * browser's search terms), and keep `site/_data/pages.json` complete (see `tools/SiteDataBuilder.ts`).
 * - All COMMITTED:  the docs pages fetch `components.json` as is, with no build step.  Rerun after changing a
 *   vocabulary, a family's sheet (its tokens), or `pages.json`;  `tools/SiteDataBuilder.test.ts` fails while stale.
 * - `--check`:  write nothing;  exit 1 (saying which) if any file would change.
 * - Formatting:  `JSON.stringify(..., 2)`;  oxfmt skips `site/_data/` (`.oxfmtrc.json`), so the bytes stay ours.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { SiteDataBuilder } from "../tools/SiteDataBuilder.ts"

const check = process.argv.includes("--check")
const builder = new SiteDataBuilder()
const { data, pages } = await builder.build()
const outputs: [file: string, text: string][] = [
  [builder.dataFile, SiteDataBuilder.stringify(data)],
  [builder.pagesFile, SiteDataBuilder.stringify(pages)],
  [builder.iconsFile, builder.iconsText()]
]

const stale = outputs.filter(([file, text]) => !existsSync(file) || readFileSync(file, "utf8") !== text)
if (check) {
  for (const [file] of stale) console.error(`stale:  ${path.relative(process.cwd(), file)} (run \`yarn site:data\`)`)
  process.exitCode = stale.length ? 1 : 0
} else {
  mkdirSync(builder.dataFolder, { recursive: true })
  for (const [file, text] of stale) writeFileSync(file, text)
  const kb = (Buffer.byteLength(outputs[0]![1]) / 1024).toFixed(1)
  console.log(
    `site data:  ${data.components.length} component tags + ${data.docs.length} docs tags, ` +
      `${Object.keys(data.families).length} families, ${kb} KB;  ` +
      (stale.length ? `wrote ${stale.map(([file]) => path.basename(file)).join(", ")}` : "unchanged")
  )
}
