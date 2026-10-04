/**
 * Barrel for the docs search -- a DOC-ONLY family (`src/docs-components/`):  no lib entry, loaded by `<ui-root>` on
 * first use (or by `<ui-docs-nav>`, whose header band holds one).
 * - SIDE EFFECT:  defines `<ui-docs-search>`, plus `<ui-icon>`, which its shadow root is built from.  A `<ui-root>`
 *   only loads what's in the page's light DOM, so a family that composes widgets imports them itself.
 */

import { UIDocsSearch } from "./UIDocsSearch"
import { DocsSearchHost } from "./DocsSearchHost"
import { PageOutline } from "./PageOutline"
import { SearchData } from "./SearchData"
import { SearchIndex } from "./SearchIndex"

import "$/ui/components/ui-icon"

UIDocsSearch.define()

export { UIDocsSearch, DocsSearchHost, PageOutline, SearchData, SearchIndex }
