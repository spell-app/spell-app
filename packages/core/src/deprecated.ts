/**
 * `spellCore`'s old names, kept for programs compiled before they changed -- nothing recompiles a saved program.
 * - NOT the core contract:  another target's core (Python's, later) needs only the new names.
 * - Epic `output-targets` P16 (Q47):
 *   core says "position" where it means a position, and "item" only for an element of a list.
 *   - e.g. `spellCore.itemOf(pile, card)` was always a POSITION (3), not an item:  now `spellCore.positionOf()`.
 *   - Each old name is the SAME function as its new one, so the two never drift apart.
 *   - Programs compiled before P16 still run:  `cli`'s `contract.test.ts` runs one.
 */
import { spellCore } from "./core"
import { collectionCoreMethods, positionOf } from "./collection-core"
import { collectionOtherMethods } from "./collection-other"
import { defineSpellCoreModule } from "./spellCore.types"

export const deprecatedMethods = defineSpellCoreModule({
  /** @deprecated  `positionOf()`, since epic `output-targets` P16. */
  itemOf: positionOf,
  /** @deprecated  `getItemAt()`, since epic `output-targets` P16. */
  getItemOf: collectionCoreMethods.getItemAt,
  /** @deprecated  `setItemAt()`, since epic `output-targets` P16. */
  setItemOf: collectionCoreMethods.setItemAt,
  /** @deprecated  `removeItemAt()`, since epic `output-targets` P16. */
  removeItemOf: collectionCoreMethods.removeItemAt,
  /** @deprecated  `removeItemsAt()`, since epic `output-targets` P16. */
  removeItemsOf: collectionOtherMethods.removeItemsAt,
  /** @deprecated  `duplicateList()`, since epic `output-targets` P16. */
  duplicateCollection: collectionOtherMethods.duplicateList,
  /** @deprecated  `mergeLists()`, since epic `output-targets` P16. */
  mergeCollections: collectionOtherMethods.mergeLists,
  /** @deprecated  `mergeListsInto()`, since epic `output-targets` P16. */
  mergeCollectionsInto: collectionOtherMethods.mergeListsInto
})
Object.assign(spellCore, deprecatedMethods)

/**
 * @deprecated  `positionOf()`, since epic `output-targets` P16:  TypeScript compiled before it imports
 * `{ itemOf } from "@spell/core"`.
 */
export const itemOf = positionOf
