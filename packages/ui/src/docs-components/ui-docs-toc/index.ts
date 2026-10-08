/**
 * The docs table of contents family:  defines `<ui-docs-toc>` and exports its component, `UIDocsToc`,
 * and `TocIndex`.
 * - A DOC-ONLY family (`src/docs-components/`):  no lib entry;  `<ui-root>` loads it on first use.
 * - SIDE EFFECT:  importing it defines the tag, and the widgets its shadow DOM is built of:
 *   `<ui-menu>` + `<ui-item>` (`ui-menu`, `ui-item`), `<ui-header>` (`ui-parts`).
 *   A `<ui-root>` only loads what's in the page's light DOM, so a family that is built of other widgets
 *   imports them itself.
 */

import { UIDocsToc } from "./UIDocsToc"
import { TocIndex } from "./TocIndex"

import "$/ui/components/ui-menu"
import "$/ui/components/ui-item"
import "$/ui/components/ui-parts"

UIDocsToc.define()

export { UIDocsToc, TocIndex }
