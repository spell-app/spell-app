/**
 * The include family:  defines `<ui-include>` and exports its component, `UIInclude`,
 * and its DOM element class, `DOMIncludeElement`.
 * - SIDE EFFECT:  importing it defines the tag, and `<ui-loader>` and `<ui-message>` (its loading and error looks).
 *   `UIInclude` imports `<ui-root>`'s family, whose `RootLoader` loads the families the included markup uses.
 * - Also the library's `@spell-app/ui/ui-include` entry (its size is in `docs/report.md`).
 */

import { DOMIncludeElement, UIInclude } from "./UIInclude"

import "$/ui/components/ui-loader"
import "$/ui/components/ui-message"

UIInclude.define()

export { UIInclude, DOMIncludeElement }
