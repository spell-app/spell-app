/**
 * The search family:  defines `<ui-search>`, and exports its component.
 * - Also the `search` lib entry (`@spell-app/ui/ui-search`), measured in `docs/report.md`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Exports `SearchMatcher` too:  Fomantic's local matching, pure data, usable on its own.
 */

import { UISearch } from "./UISearch"
import { SearchMatcher } from "./SearchMatcher"

UISearch.define()

export { SearchMatcher, UISearch }
