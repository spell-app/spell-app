import { readdirSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

import type { SkeletonSpec } from "../src/vocabulary/vocabulary.types.ts"

/****************
 * ### `RootCatalog`
 * What `<ui-root>` needs of each tag BEFORE that tag's family loads -- its folder (which family to import) and its
 * skeleton (`ComponentVocabulary.skeleton`) -- read from the vocabulary FILES.
 * - Every `<tag>.vocabulary.en.ts` of every family folder, every export with a `tag` and `attributes`:  the way
 *   `ComponentDefinitions` reads them, without Vite's `import.meta.glob`.
 * - Two writers:  `yarn gen:root` (`scripts/gen-root-catalog.ts`), Spell UI's `ui-root.catalog.ts`;  and
 *   `spell dev pack build` (`packages/cli/src/dev/packBuild.ts`), a component pack's `<pack>.catalog.ts`.
 * - STATIC:  nothing to keep between calls.  Node-only:  `import()`s each vocabulary, which is pure data.
 ****************/
export class RootCatalog {
  /**
   * Tag => its entry, for every family folder in `roots` (absolute folders).
   * - A folder name must be unique across `roots`:  `RootLoader` finds a family by name alone.
   * - NOTE: `import()` caches:  a process that reads again after a vocabulary changes gets the old one.  Both writers
   *   are one-shot commands.  (A `?t=` cache-buster works under `tsx`, but Vitest's runner won't transform it.)
   */
  static async read(roots: string[]): Promise<Record<string, RootCatalogEntry>> {
    const entries: Record<string, RootCatalogEntry> = {}
    for (const root of roots) {
      for (const folder of readdirSync(root, { withFileTypes: true })) {
        if (!folder.isDirectory()) continue
        for (const file of readdirSync(path.join(root, folder.name))) {
          if (!file.endsWith(VOCABULARY_SUFFIX)) continue
          const vocabulary = path.join(root, folder.name, file)
          const module = (await import(pathToFileURL(vocabulary).href)) as Record<string, unknown>
          for (const value of Object.values(module)) {
            if (typeof value === "object" && value !== null && "tag" in value && "attributes" in value) {
              const skeleton = (value as { skeleton?: SkeletonSpec | null }).skeleton
              entries[String(value.tag)] = skeleton ? { folder: folder.name, skeleton } : { folder: folder.name }
            }
          }
        }
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
 * What `<ui-root>` knows of a tag before its family loads:  `RootCatalogEntry`'s shape (`ui-root.types.ts`).
 * - Its own, not imported:  `ui-root.types.ts` imports `$/ui/core`, which drags the element files (JSX) into
 *   `tsc -p scripts` and into the CLI's type check.
 */
export type RootCatalogEntry = { readonly folder: string; readonly skeleton?: SkeletonSpec }

/** A family's vocabulary file:  `<tag>.vocabulary.en.ts`. */
const VOCABULARY_SUFFIX = ".vocabulary.en.ts"
