/**
 * Barrel for component packs -- also the `components` lib entry (`@spell-app/ui/ui-components`).
 * - SIDE EFFECT:  defines `<ui-components>`.
 * - `ComponentPacks` (the page's registry and loader of packs) and `registerPack()` (what a pack's script calls):
 *   `<ui-root>`'s barrel imports this family, so a page with a root has both.
 */

import { UIComponents } from "./UIComponents"

UIComponents.define()

export { UIComponents }
export type { ComponentPack } from "./ui-components.types"
export { ComponentPacks, registerPack } from "./ComponentPacks"
