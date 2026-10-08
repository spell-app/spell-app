import { SkeletonText } from "../src/vocabulary/SkeletonText.ts"
import type { SkeletonSpec } from "../src/vocabulary/vocabulary.types.ts"

import { VocabularyFiles } from "./VocabularyFiles.ts"

/****************
 * ### `RootCatalog`
 * What `<ui-root>` needs of each tag BEFORE that tag's family loads -- its folder (which family to import) and its
 * skeleton (`ComponentVocabulary.skeleton`, skeleton text parsed by `SkeletonText` into a `SkeletonSpec`) -- read
 * from the vocabulary FILES.
 * - Every `<Name>.en.ts` of every family folder (`VocabularyFiles`), every export with a `tag` and `attributes`:
 *   the way `ComponentDefinitions` reads them, without Vite's `import.meta.glob`.  A vocabulary without a skeleton
 *   writes no `skeleton` key.
 * - Two writers:  `yarn gen:root` (`scripts/gen-root.ts`), Spell UI's `UIRoot.catalog.ts`;  and
 *   `spell dev pack build` (`packages/cli/src/dev/packBuild.ts`), a component pack's `<pack>.catalog.ts`.
 * - Static:  nothing to keep between calls.  Node only:  `import()`s each vocabulary, which is pure data.
 ****************/
export class RootCatalog {
  /**
   * Tag => its entry, for every family folder in `roots` (absolute folders).
   * - A folder name must be unique across `roots`:  `RootLoader` finds a family by name alone.
   * - Throws a `TypeError` naming the text when a skeleton isn't skeleton text.
   * - NOTE: `import()` caches:  a process that reads again after a vocabulary changes gets the old one.  Both writers
   *   are one-shot commands.  (A `?t=` cache-buster works under `tsx`, but Vitest's runner won't transform it.)
   */
  static async read(roots: string[]): Promise<Record<string, RootCatalogEntry>> {
    const entries: Record<string, RootCatalogEntry> = {}
    for (const root of roots) {
      for (const { folder, vocabulary } of await VocabularyFiles.read(root)) {
        entries[vocabulary.tag] =
          vocabulary.skeleton === undefined ? { folder } : { folder, skeleton: SkeletonText.parse(vocabulary.skeleton) }
      }
    }
    return entries
  }

  /** `entries` as the catalog object's lines, `  "tag": {...}`, sorted by tag:  join them with `,\n` inside `{ }`. */
  static lines(entries: Record<string, RootCatalogEntry>): string[] {
    return Object.keys(entries)
      .sort()
      .map((tag) => `  ${JSON.stringify(tag)}: ${JSON.stringify(entries[tag])}`)
  }
}

/**
 * What `<ui-root>` knows of a tag before its family loads:  `RootCatalogEntry`'s shape (`UIRoot.types.ts`).
 * - Its own, not imported:  `UIRoot.types.ts` imports `$/ui/core` (types), which drags the element files (JSX) into
 *   `tsc -p scripts` and into the CLI's type check.
 */
export type RootCatalogEntry = { readonly folder: string; readonly skeleton?: SkeletonSpec }
