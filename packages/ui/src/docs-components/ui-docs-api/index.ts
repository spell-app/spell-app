/**
 * Barrel for the docs API reference -- a DOC-ONLY family (`src/docs-components/`):  no lib entry, loaded by
 * `<ui-root>` on first use.
 * - SIDE EFFECT:  defines `<ui-docs-api>`, plus the widgets its shadow root is built from:  `<ui-header>`
 *   (`ui-parts`), `<ui-table>`, `<ui-label>` / `<ui-labels>`, `<ui-message>`.  A `<ui-root>` only loads what's in
 *   the page's light DOM, so a family that composes widgets imports them itself.
 */

import { UIDocsApi } from "./UIDocsApi"
import { ApiModel } from "./ApiModel"
import { InlineCode } from "./InlineCode"

import "$/ui/components/ui-parts"
import "$/ui/components/ui-table"
import "$/ui/components/ui-label"
import "$/ui/components/ui-message"

UIDocsApi.define()

export { UIDocsApi, ApiModel, InlineCode }
