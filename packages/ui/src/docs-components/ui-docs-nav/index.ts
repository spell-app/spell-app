/**
 * The docs nav family:  defines `<ui-docs-nav>` and exports its component, `UIDocsNav`,
 * its DOM element class, `DOMDocsNavElement`, and its helpers (`NavIndex`, `NavPreferences`).
 * - A DOC-ONLY family (`src/docs-components/`):  no lib entry;  `<ui-root>` loads it on first use.
 * - SIDE EFFECT:  importing it defines the tag, and the widgets its shadow DOM is built of:
 *   the site search `<ui-docs-search>`, `<ui-button>` / `<ui-buttons>`, `<ui-icon>`, `<ui-label>`, `<ui-message>`.
 *   A `<ui-root>` only loads what's in the page's light DOM, so a family that is built of other widgets
 *   imports them itself.
 */

import { DOMDocsNavElement, UIDocsNav } from "./UIDocsNav"
import { NavIndex } from "./NavIndex"
import { NavPreferences } from "./NavPreferences"

import "$/ui/docs-components/ui-docs-search"
import "$/ui/components/ui-icon"
import "$/ui/components/ui-button"
import "$/ui/components/ui-label"
import "$/ui/components/ui-message"

UIDocsNav.define()

export { UIDocsNav, DOMDocsNavElement, NavIndex, NavPreferences }
