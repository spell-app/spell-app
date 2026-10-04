/**
 * Barrel for the root component -- also the `root` lib entry (`@spell-app/ui/ui-root`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-root>`, `<ui-loader>` (its loading message) and the `<ui-placeholder>`s (its
 *   skeletons).  Every other family is imported on demand, by what's inside a root.
 * - NOTE: the two families are imported HERE, not by `LoaderMessage` / `PlaceholderSkeleton`:  the static server
 *   render (`$/ui/server`) loads `UIRoot` from its own file, and defining an element throws in node.
 */

import { UIRoot } from "./UIRoot"

import "$/ui/components/ui-loader"
import "$/ui/components/ui-placeholder"

UIRoot.define()

export { UIRoot }
export { LoaderMessage, type RootLoading } from "./LoaderMessage"
export { RootLoader } from "./RootLoader"
export type { RootFailure, RootFailureReason } from "./ui-root.types"
