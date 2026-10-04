/**
 * Barrel for the docs theme controls -- a DOC-ONLY family (`src/docs-components/`):  no lib entry, loaded by
 * `<ui-root>` on first use.
 * - SIDE EFFECT:  defines `<ui-docs-themes>`, plus the widgets its shadow root is built from:  `<ui-popup>` (the
 *   overlay and the tooltips), `<ui-icon>` (sun, moon, palette, check), `<ui-dropdown>` and `<ui-item>` (its rows,
 *   `show="theme"`).  A `<ui-root>` only loads what's in the page's light DOM, so a family that composes widgets
 *   imports them itself.
 * - `ThemeSheets` (`$/ui/styles`) comes with it:  in a code-split bundle that's the runtime's chunk, and every theme
 *   sheet stays its own lazy chunk, fetched on `apply()`.
 */

import { UIDocsThemes } from "./UIDocsThemes"
import { ThemeMenu } from "./ThemeMenu"

import "$/ui/components/ui-dropdown"
import "$/ui/components/ui-item"
import "$/ui/components/ui-popup"
import "$/ui/components/ui-icon"

UIDocsThemes.define()

export { UIDocsThemes, ThemeMenu }
