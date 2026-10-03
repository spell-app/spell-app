/**
 * Barrel for the docs table of contents -- a DOC-ONLY family (`src/docs-components/`):  no lib entry, loaded by
 * `<ui-root>` on first use.
 * - SIDE EFFECT:  defines `<ui-docs-toc>`, plus the widgets its shadow root is built from:  `<ui-menu>` +
 *   `<ui-item>` (`ui-menu`, `ui-item`), `<ui-header>` (`ui-parts`).  A `<ui-root>` only loads what's in the page's
 *   light DOM, so a family that composes widgets imports them itself.
 */

import { UIDocsToc } from "./UIDocsToc"
import { TocIndex } from "./TocIndex"

import "$/ui/components/ui-menu"
import "$/ui/components/ui-item"
import "$/ui/components/ui-parts"

UIDocsToc.define()

export { UIDocsToc, TocIndex }
