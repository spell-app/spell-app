/**
 * The sticky family:  defines `<ui-sticky>` and exports its component, `UISticky`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-sticky` entry (its size is in `docs/report.md`).
 */

import { UISticky } from "./UISticky"

UISticky.define()

export { UISticky }
