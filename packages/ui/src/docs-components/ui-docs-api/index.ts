/**
 * The docs API reference family:  defines `<ui-docs-api>` and exports its component, `UIDocsApi`,
 * and its helpers (`ApiModel`, `InlineCode`).
 * - A DOC-ONLY family (`src/docs-components/`):  no lib entry;  `<ui-root>` loads it on first use.
 * - SIDE EFFECT:  importing it defines the tag, and the widgets its shadow DOM is built of:
 *   `<ui-header>` (`ui-parts`), `<ui-table>`, `<ui-label>` / `<ui-labels>`, `<ui-message>`.
 *   A `<ui-root>` only loads what's in the page's light DOM, so a family that is built of other widgets
 *   imports them itself.
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
