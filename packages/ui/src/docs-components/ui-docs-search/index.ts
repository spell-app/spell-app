/**
 * The docs search family:  defines `<ui-docs-search>` and exports its component, `UIDocsSearch`,
 * its DOM element class, `DOMDocsSearchElement`, and its helpers (`PageOutline`, `SearchData`, `SearchIndex`).
 * - A DOC-ONLY family (`src/docs-components/`):  no lib entry.
 *   `<ui-root>` loads it on first use, or `<ui-docs-nav>` does (its header band holds one).
 * - SIDE EFFECT:  importing it defines the tag, and `<ui-icon>`, which its shadow DOM is built of.
 *   A `<ui-root>` only loads what's in the page's light DOM, so a family that is built of other widgets
 *   imports them itself.
 */

import { DOMDocsSearchElement, UIDocsSearch } from "./UIDocsSearch"
import { PageOutline } from "./PageOutline"
import { SearchData } from "./SearchData"
import { SearchIndex } from "./SearchIndex"

import "$/ui/components/ui-icon"

UIDocsSearch.define()

export { UIDocsSearch, DOMDocsSearchElement, PageOutline, SearchData, SearchIndex }
