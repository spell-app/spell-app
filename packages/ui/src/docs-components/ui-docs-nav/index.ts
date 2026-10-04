/**
 * Barrel for the docs nav -- a DOC-ONLY family (`src/docs-components/`):  no lib entry, loaded by `<ui-root>` on
 * first use.
 * - SIDE EFFECT:  defines `<ui-docs-nav>`, plus the widgets its shadow root is built from:  `<ui-menu>`, `<ui-item>`,
 *   `<ui-header>` (`ui-parts`), `<ui-input>`, `<ui-button>` / `<ui-buttons>`, `<ui-label>`, `<ui-message>`.  A
 *   `<ui-root>` only loads what's in the page's light DOM, so a family that composes widgets imports them itself.
 */

import { UIDocsNav } from "./UIDocsNav"
import { DocsNavHost } from "./DocsNavHost"
import { NavIndex } from "./NavIndex"
import { NavPreferences } from "./NavPreferences"

import "$/ui/components/ui-menu"
import "$/ui/components/ui-item"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-input"
import "$/ui/components/ui-button"
import "$/ui/components/ui-label"
import "$/ui/components/ui-message"

UIDocsNav.define()

export { UIDocsNav, DocsNavHost, NavIndex, NavPreferences }
