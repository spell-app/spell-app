/**
 * Barrel for the search -- also the `search` lib entry (`@spell/ui/search`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-search>`.
 * - Exports `SearchMatcher` too:  Fomantic's local matching, pure data, usable on its own.
 */

import { UISearch } from "./UISearch"
import { SearchMatcher } from "./SearchMatcher"

UISearch.define()

export { SearchMatcher, UISearch }
