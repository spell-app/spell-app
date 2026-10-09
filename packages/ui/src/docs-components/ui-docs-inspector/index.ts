/**
 * The docs inspector family:  defines `<ui-docs-inspector>` and exports its component, `UIDocsInspector`,
 * and `ElementSnapshot`.
 * - A DOC-ONLY family (`src/docs-components/`):  no lib entry;  `<ui-root>` loads it on first use.
 * - SIDE EFFECT:  importing it defines the tag.  Its shadow DOM is plain markup:  it renders no other widget.
 * - The custom elements guide (`guides/custom-elements/`) loads it in a bundle of its own, beside its live examples.
 */

import { UIDocsInspector } from "./UIDocsInspector"
import { ElementSnapshot } from "./ElementSnapshot"

UIDocsInspector.define()

export { UIDocsInspector, ElementSnapshot }
