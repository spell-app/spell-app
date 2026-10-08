/**
 * `yarn site:data [--check]`:  write the Spell UI site's data, `site/_data/components.json` and `icons.json` (the icon
 * browser's search terms), and keep `site/_data/pages.json` complete (see `tools/SiteDataBuilder.ts`);  and
 * `search.json` (every page's sections, for `<ui-docs-search>`) beside the shared pages it's read from,
 * `ui/_data/search.json`.
 * - Also, from the same data, the editors' element descriptions (`tools/ElementManifests.ts`):
 *   `custom-elements.json` (a Custom Elements Manifest) and `html-custom-data.json` (VS Code's `html.customData`).
 * - All COMMITTED (`search.json`:  shared, so the shared repo's own commit):  the docs pages fetch them as they are,
 *   with no build step.  Rerun after changing a vocabulary, a family's sheet (its tokens), `pages.json` or a page's
 *   sections;  `tools/SiteDataBuilder.test.ts` fails while stale.
 * - `--check`:  write nothing;  exit 1 (saying which) if any file would change.
 * - Formatting:  `JSON.stringify(..., 2)`;  oxfmt skips `site/_data/` (`vite.lint.ts`), so the bytes stay ours.
 */
import path from "node:path"
import { parseArgs } from "node:util"

import { ElementManifests } from "../tools/ElementManifests.ts"
import { SiteDataBuilder } from "../tools/SiteDataBuilder.ts"
import { Terminal } from "../tools/Terminal.ts"

import { type GeneratedOutput, writeOrCheck } from "./generatedFiles.ts"

const { values } = parseArgs({ options: { check: { type: "boolean", default: false } } })
const builder = new SiteDataBuilder()
const { data, pages } = await builder.build()
const outputs: GeneratedOutput[] = [
  [builder.dataFile, SiteDataBuilder.stringify(data)],
  [builder.pagesFile, SiteDataBuilder.stringify(pages)],
  [builder.iconsFile, builder.iconsText()],
  [builder.searchFile, builder.searchText()],
  ...new ElementManifests({ data, packageFolder: path.join(builder.dataFolder, "../..") }).outputs(builder.dataFolder)
]

const stale = writeOrCheck(outputs, { command: "site:data", isCheck: values.check })
if (!values.check) {
  const kb = (Buffer.byteLength(outputs[0]![1]) / 1024).toFixed(1)
  Terminal.out(
    `site data:  ${data.components.length} component tags + ${data.docs.length} docs tags, ` +
      `${Object.keys(data.families).length} families, ${kb} KB;  ` +
      (stale.length ? `wrote ${stale.map((file) => path.basename(file)).join(", ")}` : "unchanged")
  )
}
