/**
 * The root family:  defines `<ui-components>` (component packs) and `<ui-root>`, and exports their components,
 * `UIComponents` and `UIRoot`, with what a root is built from.
 * - SIDE EFFECT:  importing it defines those tags, and `<ui-loader>` (a root's loading message) and the
 *   `<ui-placeholder>`s (its skeletons).  Every other family is imported on demand, by what's inside a root.
 * - `<ui-components>` BEFORE `<ui-root>`:  defining a tag upgrades its elements in place,
 *   so every pack on the page is asked for before any root looks at its tags (`UIComponents`).
 * - NOTE: the two families are imported HERE, not by `LoaderMessage` / `PlaceholderSkeleton`:
 *   the static server render (`$/ui/static`) loads `UIRoot` from its own file, and defining an element throws in node.
 * - Also the library's `@spell-app/ui/ui-root` entry (its size is in `docs/report.md`).
 */

import { UIComponents } from "./UIComponents"
import { UIRoot } from "./UIRoot"

import "$/ui/components/ui-loader"
import "$/ui/components/ui-placeholder"

UIComponents.define()
UIRoot.define()

export { UIComponents, UIRoot }
export { ComponentPack } from "./ComponentPack"
export { LoaderMessage, type RootLoading } from "./LoaderMessage"
export { RootLoader } from "./RootLoader"
export type {
  ComponentLoadPolicy,
  ComponentPackEntry,
  RootFailure,
  RootFailureReason,
  RootPackTag
} from "./UIRoot.types"
