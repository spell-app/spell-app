/**
 * The docs example family:  defines `<ui-docs-example>` and exports its component, `UIDocsExample`,
 * and its helpers (`ExampleSource`, `HtmlFormatter`).
 * - A DOC-ONLY family (`src/docs-components/`):  no lib entry;  `<ui-root>` loads it on first use.
 * - SIDE EFFECT:  importing it defines the tag, and the widgets its shadow DOM is built of:
 *   `<ui-segment>`, `<ui-header>` (`ui-parts`), `<ui-button>`, `<ui-code>`.
 *   A `<ui-root>` only loads what's in the page's light DOM, so a family that is built of other widgets
 *   imports them itself.
 */

import { UIDocsExample } from "./UIDocsExample"
import { ExampleSource } from "./ExampleSource"
import { HtmlFormatter } from "./HtmlFormatter"

import "$/ui/components/ui-segment"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-button"
import "$/ui/components/ui-code"

UIDocsExample.define()

export { UIDocsExample, ExampleSource, HtmlFormatter }
