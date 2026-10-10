/**
 * The root family:  defines `<ui-root>` and exports its component, `UIRoot`, with what a root is built from.
 * - SIDE EFFECT:  importing it defines
 *   - `<ui-root>`
 *   - `<ui-loader>`:  a root's loading message
 *   - the `<ui-placeholder>`s:  its skeletons
 *   - `<ui-components>`:  the component packs it loads, with `ComponentPacks` / `registerPack()`
 * - Every other family is imported on demand, by what's inside a root.
 * - NOTE: the three families are imported HERE, not by `LoaderMessage` / `PlaceholderSkeleton` / `UIRoot`:
 *   the static server render (`$/ui/static`) loads `UIRoot` from its own file, and defining an element throws in node.
 * - `RootCatalogEntry` is exported for component packs:  `spell dev pack build` writes a catalog of them.
 * - `RootVocabulary`, for a subclass's vocabulary (`<spell-app>`'s).
 * - Also the library's `@spell-app/ui/ui-root` entry (its size is in `docs/report.md`).
 */

import { UIRoot } from "./UIRoot"

import "$/ui/components/ui-loader"
import "$/ui/components/ui-placeholder"
import "$/ui/components/ui-components"

UIRoot.define()

export { UIRoot }
export { LoaderMessage, type RootLoading } from "./LoaderMessage"
export { RootLoader } from "./RootLoader"
export type { RootCatalogEntry, RootFailure, RootFailureReason, RootVocabulary } from "./UIRoot.types"
