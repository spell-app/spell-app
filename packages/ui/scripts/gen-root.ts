/**
 * `yarn gen:root`:  write `src/components/ui-root/UIRoot.catalog.ts`, every component tag => what `<ui-root>` needs
 * BEFORE that tag's family loads:  its folder (which family to import) and its skeleton
 * (`ComponentVocabulary.skeleton`, skeleton text parsed by `SkeletonText` into a `SkeletonSpec`;  a vocabulary
 * without one writes no `skeleton` key).
 * - Run after adding or moving a tag, or changing a skeleton.  `src/components/ui-root/UIRoot.catalog.test.ts` and
 *   `test/vocabularies.test.ts` fail while the file is stale.
 * - Why generated, not `ComponentDefinitions`:  that roll-up imports every vocabulary (~325 kB of source);  a lib
 *   entry importing it would split each vocabulary into a chunk shared with its family.  The catalog is a few kB.
 * - Reads the vocabularies the way `ComponentDefinitions` does (`tools/VocabularyFiles.ts`):  every
 *   `UI<Name>.vocabulary.en.ts` of every folder, every export with a `tag` and `attributes`.
 * - Scans `src/components/` AND `src/docs-components/` (the doc-only `<ui-docs-*>` elements):  `<ui-root>` loads
 *   both alike.  A folder name is unique across the two (`RootLoader` finds the family by name alone).
 * - The catalog is a `src/` file, so its own import (`./UIRoot.types`) has no `.ts` extension:  Vite's resolution,
 *   not `tsx`'s.
 * - The catalog and the types file it imports are named through `FamilyFiles`
 *   (`UIRoot.catalog.ts`, `UIRoot.types.ts`).
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { SkeletonText } from "../src/vocabulary/SkeletonText.ts"
import { FamilyFiles } from "../tools/FamilyFiles.ts"
import { Terminal } from "../tools/Terminal.ts"
import { VocabularyFiles } from "../tools/VocabularyFiles.ts"

import { formatFiles } from "./generatedFiles.ts"

/** `src/components/`. */
const COMPONENTS = fileURLToPath(new URL("../src/components/", import.meta.url))

/** `src/docs-components/`:  the doc-only element families. */
const DOCS_COMPONENTS = fileURLToPath(new URL("../src/docs-components/", import.meta.url))

/** `<ui-root>`'s family folder. */
const ROOT_FAMILY = path.join(COMPONENTS, "ui-root")

/** The generated file. */
const OUTPUT = FamilyFiles.path(ROOT_FAMILY, ".catalog.ts")

/** The module the generated file imports its types from:  the family's types file, without `.ts`. */
const TYPES_MODULE = `./${path.basename(FamilyFiles.path(ROOT_FAMILY, ".types.ts"), ".ts")}`

/** Tag => its entry. */
const entries: Record<string, { folder: string; skeleton?: unknown }> = {}
for (const root of [COMPONENTS, DOCS_COMPONENTS]) {
  for (const { folder, vocabulary } of await VocabularyFiles.read(root)) {
    entries[vocabulary.tag] =
      vocabulary.skeleton === undefined ? { folder } : { folder, skeleton: SkeletonText.parse(vocabulary.skeleton) }
  }
}

const lines = Object.keys(entries)
  .sort()
  .map((tag) => `  ${JSON.stringify(tag)}: ${JSON.stringify(entries[tag])}`)
writeFileSync(
  OUTPUT,
  `/* GENERATED -- do not edit, run \`yarn gen:root\` (source:  every \`UI<Name>.vocabulary.en.ts\`) */

import type { RootCatalogEntry } from "${TYPES_MODULE}"

/** Every component tag => what \`<ui-root>\` needs before its family loads. */
export const ROOT_CATALOG: Readonly<Record<string, RootCatalogEntry>> = {
${lines.join(",\n")}
}
`
)
formatFiles([OUTPUT])
Terminal.out(`wrote ${path.relative(process.cwd(), OUTPUT)}:  ${lines.length} tags`)
