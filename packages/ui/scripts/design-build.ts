/**
 * `yarn design:build [--out <dir>] [--brand <folder>] [--brand-book <file>]` (also `spell dev design build`):  write
 * the claude.ai Design System's files for Spell UI into `<dir>/project/` (default `packages/ui/build/design-system/`,
 * git-ignored), from the vocabularies (`docs/__data/components.json5`), the element examples and the Spell theme
 * (see `tools/DesignExport.ts`).
 * - `--brand`:  the brand's package folder, whose `<brand-*>` cards join the system (a "Brand" group);
 *   `--brand-book`:  Claude Design's brand book, whose content rules join the README.
 *   Spell UI never names either itself (epic `repo-split` P5):  `spell dev design build` passes spell-app's.
 * - Every path is relative to the folder `yarn` ran from (`environment.invocationDir`).
 * - Reads `components.json5` as committed:  run `yarn site:data` first after changing a vocabulary.
 * - Leaves `project/components/bundle.js` / `bundle.css` alone:  the design bundle's build (epic `claude-design`, P8).
 * - Prints what it wrote:  cards per group, tokens per family, tokens left out.
 */
import { join, resolve } from "node:path"
import { parseArgs } from "node:util"

import { DesignExport } from "../tools/DesignExport.ts"
import { environment } from "../tools/environment.ts"
import { Terminal } from "../tools/Terminal.ts"

const { values } = parseArgs({
  options: { out: { type: "string" }, brand: { type: "string" }, "brand-book": { type: "string" } }
})
const given = (path: string | undefined) => (path === undefined ? undefined : resolve(environment.invocationDir, path))
const exporter = new DesignExport({ brand: given(values.brand), brandBook: given(values["brand-book"]) })
const out = given(values.out) ?? join(exporter.uiFolder, "build/design-system")
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
