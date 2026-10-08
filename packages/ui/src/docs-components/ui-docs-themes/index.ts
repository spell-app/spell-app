/**
 * The docs theme controls family:  defines `<ui-docs-themes>` and exports its component, `UIDocsThemes`,
 * and `ThemeMenu`.
 * - A DOC-ONLY family (`src/docs-components/`):  no lib entry;  `<ui-root>` loads it on first use.
 * - SIDE EFFECT:  importing it defines the tag, and the widgets its shadow DOM is built of:
 *   `<ui-popup>` (the overlay and the tooltips), `<ui-icon>` (sun, moon, palette, check),
 *   `<ui-dropdown>` and `<ui-item>` (its rows, `show="theme"`).
 *   A `<ui-root>` only loads what's in the page's light DOM, so a family that is built of other widgets
 *   imports them itself.
 * - It applies themes through the runtime (`UI.themes`, in the runtime's chunk),
 *   and every theme sheet stays its own lazy chunk, fetched on `apply()`.
 */

import { UIDocsThemes } from "./UIDocsThemes"
import { ThemeMenu } from "./ThemeMenu"

import "$/ui/components/ui-dropdown"
import "$/ui/components/ui-item"
import "$/ui/components/ui-popup"
import "$/ui/components/ui-icon"

UIDocsThemes.define()

export { UIDocsThemes, ThemeMenu }
