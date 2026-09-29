// Import directly to avoid circular import
import { RootScope } from "./RootScope"

/**
 * What a project imports from other projects, as a layer between the root scope and its `ProjectScope`.
 * - Holds imported types, constants and rules:  the project's own lists fall through to ours, so its files parse
 *   as if the imports' sources had come first.
 * - Own `parser`, a clone of the root's, holds the imported rules.  The project's parser clones THAT, so
 *   imports sit in a base layer its `journal` never records -- incremental edits never undo them.
 * - Nothing in it came from source here, so its records have no `declaredBy`.  Editors read `declaredAt` on its
 *   types, variables and constants instead, and `declared` on its rules -- see `P.DeclaredAt`.
 */
export class ImportScope extends RootScope {
  /**
   * Where each imported name came from, e.g. `Card` => `@library/cards`.
   * - So a compiled project can import each name it uses from the right place.
   */
  origins = new Map<string, string>()

  /**
   * ES module each import's names come from, and the names it provides that were loaded -- as import specifiers,
   * e.g. `@spell/project/@system:library:cards` => `["Card as Playingcard", "Deck"]`.
   * - So a compiled project can `import { Card, Deck } from "@spell/project/..."` -- see `SpellProject.importHeader()`.
   * - Only imports given a `module` -- one read just to parse against needs none.
   */
  modules = new Map<string, string[]>()
}
