/**
 * Barrel for the docs example -- a DOC-ONLY family (`src/docs-components/`):  no lib entry, loaded by `<ui-root>` on
 * first use.
 * - SIDE EFFECT:  defines `<ui-docs-example>`, plus the widgets its shadow root is built from:  `<ui-segment>`,
 *   `<ui-header>` (`ui-parts`), `<ui-button>`, `<ui-code>`.  A `<ui-root>` only loads what's in the page's light DOM,
 *   so a family that composes widgets imports them itself.
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
