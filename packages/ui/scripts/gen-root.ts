/**
 * `yarn gen:root`:  write `src/components/ui-root/ui-root.catalog.ts`, every component tag => what `<ui-root>` needs
 * BEFORE that tag's family loads:  its folder (which family to import) and its skeleton
 * (`ComponentVocabulary.skeleton`, skeleton text parsed by `SkeletonText` into a `SkeletonSpec`;  `none` writes no
 * `skeleton` key).
 * - Run after adding or moving a tag, or changing a skeleton.  `src/components/ui-root/ui-root.catalog.test.ts` and
 *   `test/vocabularies.test.ts` fail while the file is stale.
 * - Why generated, not `ComponentDefinitions`:  that roll-up imports every vocabulary (~325 kB of source);  a lib
 *   entry importing it would split each vocabulary into a chunk shared with its family.  The catalog is a few kB.
 * - Reads the vocabularies the way `ComponentDefinitions` does (`tools/VocabularyFiles.ts`):  every
 *   `<tag>.vocabulary.en.ts` of every folder, every export with a `tag` and `attributes`.
 * - Scans `src/components/` AND `src/docs-components/` (the doc-only `<ui-docs-*>` elements):  `<ui-root>` loads
 *   both alike.  A folder name is unique across the two (`RootLoader` finds the family by name alone).
 * - The catalog is a `src/` file, so its own import (`./ui-root.types`) has no `.ts` extension:  Vite's resolution,
 *   not `tsx`'s.
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { SkeletonText } from "../src/vocabulary/SkeletonText.ts"
import { Terminal } from "../tools/Terminal.ts"
import { VocabularyFiles } from "../tools/VocabularyFiles.ts"

import { formatFiles } from "./generatedFiles.ts"

/** `src/components/`. */
const COMPONENTS = fileURLToPath(new URL("../src/components/", import.meta.url))

/** `src/docs-components/`:  the doc-only element families. */
const DOCS_COMPONENTS = fileURLToPath(new URL("../src/docs-components/", import.meta.url))

/** The generated file. */
const OUTPUT = path.join(COMPONENTS, "ui-root", "ui-root.catalog.ts")

/** Tag => its entry. */
const entries: Record<string, { folder: string; skeleton?: unknown }> = {}
for (const root of [COMPONENTS, DOCS_COMPONENTS]) {
  for (const { folder, vocabulary } of await VocabularyFiles.read(root)) {
    const skeleton = vocabulary.skeleton === undefined ? false : SkeletonText.parse(vocabulary.skeleton)
    entries[vocabulary.tag] = skeleton ? { folder, skeleton } : { folder }
  }
}

const lines = Object.keys(entries)
  .sort()
  .map((tag) => `  ${JSON.stringify(tag)}: ${JSON.stringify(entries[tag])}`)
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
formatFiles([OUTPUT])
Terminal.out(`wrote ${path.relative(process.cwd(), OUTPUT)}:  ${lines.length} tags`)
