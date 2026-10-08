import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import type { ComponentVocabulary } from "../src/vocabulary/vocabulary.types.ts"

/****************
 * ### `VocabularyFiles`
 * Every English vocabulary of a folder of families (`src/components/`, `src/docs-components/`), read from its
 * `UI<Name>.vocabulary.en.ts` files in node:  what `yarn gen:root`, `yarn site:data` (`SiteDataBuilder`) and
 * `yarn site:bundle` (the docs' component pack) read.
 * - Imports each FILE (`import()`), never a family's `index.ts`:  nothing is defined, no Solid or CSS loads.
 *   Vocabularies are pure data for this reason (`AGENTS.md` "Overview";  `test/vocabularies.test.ts`).
 * - A vocabulary is any export with a `tag` and an `attributes` array.
 * - Static:  a read of files, no state.
 ****************/
export class VocabularyFiles {
  /** Every vocabulary under `folder`, by family folder, then file name;  none when `folder` doesn't exist. */
  static async read(folder: string): Promise<FamilyVocabulary[]> {
    const vocabularies: FamilyVocabulary[] = []
    if (!existsSync(folder)) return vocabularies
    for (const family of readdirSync(folder, { withFileTypes: true })) {
      if (!family.isDirectory()) continue
      for (const file of readdirSync(join(folder, family.name)).sort()) {
        if (!file.endsWith(VOCABULARY_FILE)) continue
        const module = (await import(pathToFileURL(join(folder, family.name, file)).href)) as Record<string, unknown>
        for (const value of Object.values(module)) {
          if (VocabularyFiles.isVocabulary(value)) vocabularies.push({ folder: family.name, vocabulary: value })
        }
      }
    }
    return vocabularies
  }

  /** Is `value` a vocabulary (a `tag` and `attributes`)? */
  private static isVocabulary(value: unknown): value is ComponentVocabulary {
    return typeof value === "object" && value !== null && "tag" in value && "attributes" in value
  }
}

/** One vocabulary and the family folder it's in. */
export type FamilyVocabulary = {
  /** Its family's folder name, e.g. `ui-button` for `UIOr.vocabulary.en.ts`. */
  readonly folder: string
  /** The vocabulary. */
  readonly vocabulary: ComponentVocabulary
}

/** An English vocabulary file's suffix. */
const VOCABULARY_FILE = ".vocabulary.en.ts"
