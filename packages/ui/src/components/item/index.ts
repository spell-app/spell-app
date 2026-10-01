/**
 * Barrel for the generic item -- also the `item` lib entry (`@spell-app/ui/item`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-item>`.  Every family with items (`dropdown`, `list`, `menu`) imports this barrel
 *   first, so a page never has to.
 * - Exports the vocabulary too:  the dropdown reads items as data and recognizes them by it (`SlottedItems`).
 */

import { UIItem } from "./UIItem"

UIItem.define()

export { itemVocabulary } from "./item.vocabulary.en"
export { UIItem }
