import { join } from "node:path"

/****************
 * ### `FamilyFiles`
 * Where a component family's own files are, by name.
 * - A family is a folder named for its main tag (`src/components/ui-button/`).
 *   Its files are named for its main COMPONENT, the class behind that tag:
 *   `UIButton.css`, `UIButton.types.ts`, `UIButton.test.tsx`.
 * - A family with several tags names each tag's vocabulary for that tag's component:
 *   `UIButtons.vocabulary.en.ts`, `UIOr.vocabulary.en.ts`.
 * - For tools that look up a family's file by name (`FamilyTokens`, `yarn gen:root`).
 *   Tools that only need "every vocabulary" or "every sheet" match the suffix instead
 *   (`VocabularyFiles`):  that works whatever the file is called.
 * - Static:  pure name rules, no state.
 ****************/
export class FamilyFiles {
  /**
   * The name a family's files start with:  its folder's name in PascalCase, `ui-` as `UI`.
   * - `ui-button` => `UIButton`, `ui-tree-diagram` => `UITreeDiagram`, `ui-brand-color` => `UIBrandColor`.
   * - The same rule names a tag's component:  `ui-or` => `UIOr`.
   *   (A few classes add their owner's name, `<ui-event>` is `UIFeedEvent`:
   *   those files follow the class, not this rule.)
   */
  static stem(folder: string): string {
    const words = folder.replace(/^ui-/, "").split("-")
    return `UI${words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("")}`
  }

  /**
   * The path of the family file ending in `suffix` (`".css"`, `".types.ts"`), in the family folder `folderPath`.
   * - `src/components/ui-button` and `".css"` => `src/components/ui-button/UIButton.css`.
   * - The folder's own name is its last path segment.
   * - It doesn't check the file exists.
   */
  static path(folderPath: string, suffix: string): string {
    const folder = folderPath
      .replace(/[\\/]+$/, "")
      .split(/[\\/]/)
      .pop()!
    return join(folderPath, FamilyFiles.stem(folder) + suffix)
  }
}
