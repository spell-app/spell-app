/**
 * The component-pack family:  defines `<ui-components>` and exports its component, `UIComponents`, with
 * `ComponentPacks` (the page's registry and loader of packs) and `registerPack()` (what a pack's script calls).
 * - SIDE EFFECT:  importing it defines `<ui-components>`.
 * - `<ui-root>`'s barrel imports this family, so a page with a root has all three.
 * - Also the library's `@spell-app/ui/ui-components` entry.
 */

import { UIComponents } from "./UIComponents"

UIComponents.define()

export { UIComponents }
export type { ComponentPack } from "./UIComponents.types"
export { ComponentPacks, registerPack } from "./ComponentPacks"
