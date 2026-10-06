/**
 * `yarn design:build [--out <dir>]` (also `spell dev design build`):  write the claude.ai Design System's files for
 * Spell UI into `<dir>/project/` (default `packages/ui/build/design-system/`, git-ignored), from the vocabularies
 * (`site/_data/components.json`), the element examples and the Spell theme (see `tools/DesignExport.ts`).
 * - `<dir>` is relative to the folder `yarn` ran from (`environment.invocationDir`).
 * - Reads `components.json` as committed:  run `yarn site:data` first after changing a vocabulary.
 * - Leaves `project/components/bundle.js` / `bundle.css` alone:  the design bundle's build (epic `claude-design`, P8).
 * - Prints what it wrote:  cards per group, tokens per family, tokens left out.
 */
import { join, resolve } from "node:path"
import { parseArgs } from "node:util"

import { DesignExport } from "../tools/DesignExport.ts"
import { environment } from "../tools/environment.ts"
import { Terminal } from "../tools/Terminal.ts"

const { values } = parseArgs({ options: { out: { type: "string" } } })
const exporter = new DesignExport()
const out = values.out ? resolve(environment.invocationDir, values.out) : join(exporter.uiFolder, "build/design-system")
const result = exporter.write(out)

const groups = new Map<string, number>()
for (const family of result.families) groups.set(family.group, (groups.get(family.group) ?? 0) + 1)
const bytes = result.files.reduce((sum, file) => sum + Buffer.byteLength(file.text), 0)
Terminal.out(
  `design system:  ${result.files.length} files, ${(bytes / 1024).toFixed(1)} KB, in ${join(out, "project")}`
)
Terminal.out(
  `  cards:  ${result.families.length} (${[...groups].map(([group, count]) => `${group} ${count}`).join(", ")})`
)
Terminal.out(
  `  tokens:  ${Object.entries(result.tokenCounts)
    .map(([family, count]) => `${family} ${count}`)
    .join(", ")}`
)
Terminal.out(
  `  left out:  ${result.skipped.length}` +
    (result.skipped.length ? `  (${result.skipped.map((entry) => entry.name).join(", ")})` : "")
)
