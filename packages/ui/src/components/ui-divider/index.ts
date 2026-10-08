/**
 * The divider family:  defines `<ui-divider>` and exports its component, `UIDivider`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-divider` entry (its size is in `docs/report.md`).
 */

import { UIDivider } from "./UIDivider"

UIDivider.define()

export { UIDivider }
