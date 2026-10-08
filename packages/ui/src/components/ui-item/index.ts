/**
 * The generic item family:  defines `<ui-item>` and exports its component, `UIItem`, and its vocabulary.
 * - SIDE EFFECT:  importing it defines the tag.
 *   Every family with items (dropdown, list, menu) imports this barrel first, so a page never has to.
 * - The vocabulary is exported too:  the dropdown reads its items as data, and recognizes them by it (`SlottedItems`).
 * - Also the library's `@spell-app/ui/ui-item` entry (its size is in `docs/report.md`).
 */

import { UIItem } from "./UIItem"

UIItem.define()

export { itemVocabulary } from "./UIItem.vocabulary.en"
export { UIItem }
