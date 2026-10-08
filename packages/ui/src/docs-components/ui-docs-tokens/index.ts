/**
 * The docs token tables family:  defines `<ui-docs-tokens>` and exports its component, `UIDocsTokens`,
 * and its helpers (`TokenRows`, `ColorProbe`).
 * - A DOC-ONLY family (`src/docs-components/`):  no lib entry;  `<ui-root>` loads it on first use.
 * - SIDE EFFECT:  importing it defines the tag, and the widgets its shadow DOM is built of:
 *   `<ui-table>`, `<ui-label>` (the swatches), `<ui-input>`, `<ui-segment>`, `<ui-button>`, `<ui-header>` (`ui-parts`),
 *   `<ui-message>`.  A `<ui-root>` only loads what's in the page's light DOM,
 *   so a family that is built of other widgets imports them itself.
 */

import { UIDocsTokens } from "./UIDocsTokens"
import { TokenRows } from "./TokenRows"
import { ColorProbe } from "./ColorProbe"

import "$/ui/components/ui-table"
import "$/ui/components/ui-label"
import "$/ui/components/ui-input"
import "$/ui/components/ui-segment"
import "$/ui/components/ui-button"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-message"

UIDocsTokens.define()

export { UIDocsTokens, TokenRows, ColorProbe }
