/**
 * Barrel for the root component -- also the `root` lib entry (`@spell-app/ui/ui-root`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-root>`, `<ui-loader>` (its loading message), the `<ui-placeholder>`s (its
 *   skeletons) and `<ui-components>` (the component packs it loads, with `ComponentPacks` / `registerPack()`).
 *   Every other family is imported on demand, by what's inside a root.
 * - NOTE: the three families are imported HERE, not by `LoaderMessage` / `PlaceholderSkeleton` / `UIRoot`:  the
 *   static server render (`$/ui/server`) loads `UIRoot` from its own file, and defining an element throws in node.
 */

import { UIRoot } from "./UIRoot"

import "$/ui/components/ui-loader"
import "$/ui/components/ui-placeholder"
import "$/ui/components/ui-components"

UIRoot.define()

export { UIRoot }
export { LoaderMessage, type RootLoading } from "./LoaderMessage"
export { RootLoader } from "./RootLoader"
export type { RootFailure, RootFailureReason } from "./ui-root.types"
