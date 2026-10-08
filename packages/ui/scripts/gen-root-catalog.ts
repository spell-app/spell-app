/**
 * Generates `src/components/ui-root/ui-root.catalog.ts`:  every component tag => what `<ui-root>` needs BEFORE that
 * tag's family loads:  its folder (which family to import) and its skeleton (`ComponentVocabulary.skeleton`).
 * - Run with `yarn gen:root` (`tsc -p scripts && tsx scripts/gen-root-catalog.ts`) after adding or moving a tag.
 *   `test/root-catalog.test.ts` fails while the file is stale.
 * - Why generated, not `ComponentDefinitions`:  that roll-up imports every vocabulary (~325 kB of source);  a lib
 *   entry importing it would split each vocabulary into a chunk shared with its family.  The catalog is a few kB.
 * - Reads the vocabularies with `tools/RootCatalog.ts` (`spell dev pack build` shares it, for a component pack's
 *   catalog):  every `<tag>.vocabulary.en.ts` of every folder, every export with a `tag` and `attributes`.
 * - Scans `src/components/` AND `src/docs-components/` (the doc-only `<ui-docs-*>` elements):  `<ui-root>` loads
 *   both alike.  A folder name is unique across the two (`RootLoader` finds the family by name alone).
 */
import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { NodePackage } from "../tools/NodePackage.ts"
import { RootCatalog } from "../tools/RootCatalog.ts"

/** `src/components/`. */
const COMPONENTS = fileURLToPath(new URL("../src/components/", import.meta.url))

/** `src/docs-components/`:  the doc-only element families. */
const DOCS_COMPONENTS = fileURLToPath(new URL("../src/docs-components/", import.meta.url))

/** The generated file. */
const OUTPUT = path.join(COMPONENTS, "ui-root", "ui-root.catalog.ts")

const lines = RootCatalog.lines(await RootCatalog.read([COMPONENTS, DOCS_COMPONENTS]))
writeFileSync(
  OUTPUT,
  `/* GENERATED -- do not edit, run \`yarn gen:root\` (source:  every \`<tag>.vocabulary.en.ts\`) */

import type { RootCatalogEntry } from "./ui-root.types"

/** Every component tag => what \`<ui-root>\` needs before its family loads. */
export const ROOT_CATALOG: Readonly<Record<string, RootCatalogEntry>> = {
${lines.join(",\n")}
}
`
)
execFileSync(`${NodePackage.need("oxfmt")}/bin/oxfmt`, [OUTPUT], { stdio: "ignore" })
console.log(`wrote ${path.relative(process.cwd(), OUTPUT)}:  ${lines.length} tags`)
