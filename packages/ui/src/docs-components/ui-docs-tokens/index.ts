/**
 * Barrel for the docs token tables -- a DOC-ONLY family (`src/docs-components/`):  no lib entry, loaded by `<ui-root>`
 * on first use.
 * - SIDE EFFECT:  defines `<ui-docs-tokens>`, plus the widgets its shadow root is built from:  `<ui-table>`,
 *   `<ui-label>` (the swatches), `<ui-input>`, `<ui-segment>`, `<ui-button>`, `<ui-header>` (`ui-parts`),
 *   `<ui-message>`.  A `<ui-root>` only loads what's in the page's light DOM, so a family that composes widgets imports
 *   them itself.
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
