/**
 * `yarn design:build [--out <dir>]` (also `spell dev design build`):  write the claude.ai Design System's files for
 * Spell UI into `<dir>/project/` (default `packages/ui/build/design-system/`, git-ignored), from the vocabularies
 * (`site/_data/components.json`), the element examples and the Spell theme (see `tools/DesignExport.ts`).
 * - Reads `components.json` as committed:  run `yarn site:data` first after changing a vocabulary.
 * - Leaves `project/components/bundle.js` / `bundle.css` alone:  the design bundle's build (epic `claude-design`, P8).
 * - Prints what it wrote:  cards per group, tokens per family, tokens left out.
 */
import { join, resolve } from "node:path"

import { DesignExport } from "../tools/DesignExport.ts"

const exporter = new DesignExport()
const flag = process.argv.indexOf("--out")
const out =
  flag >= 0 && process.argv[flag + 1]
    ? resolve(process.argv[flag + 1]!)
    : join(exporter.uiFolder, "build/design-system")
const result = exporter.write(out)

const groups = new Map<string, number>()
for (const family of result.families) groups.set(family.group, (groups.get(family.group) ?? 0) + 1)
const bytes = result.files.reduce((sum, file) => sum + Buffer.byteLength(file.text), 0)
console.log(`design system:  ${result.files.length} files, ${(bytes / 1024).toFixed(1)} KB, in ${join(out, "project")}`)
console.log(
  `  cards:  ${result.families.length} (${[...groups].map(([group, count]) => `${group} ${count}`).join(", ")})`
)
console.log(
  `  tokens:  ${Object.entries(result.tokenCounts)
    .map(([family, count]) => `${family} ${count}`)
    .join(", ")}`
)
console.log(
  `  left out:  ${result.skipped.length}` +
    (result.skipped.length ? `  (${result.skipped.map((entry) => entry.name).join(", ")})` : "")
)
