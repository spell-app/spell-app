/**
 * Barrel for the root component -- also the `root` lib entry (`@spell-app/ui/ui-root`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-root>`, and `<ui-loader>` (its loading message).  Every other family is imported on
 *   demand, by what's inside a root.
 */

import { UIRoot } from "./UIRoot"

UIRoot.define()

export { UIRoot }
export { LoaderMessage, type RootLoading } from "./LoaderMessage"
export { RootLoader } from "./RootLoader"
export type { RootFailure, RootFailureReason } from "./ui-root.types"
