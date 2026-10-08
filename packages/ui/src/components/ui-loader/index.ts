/**
 * The loader family:  defines `<ui-loader>` and exports its component, `UILoader`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-loader` entry (its size is in `docs/report.md`).
 */

import { UILoader } from "./UILoader"

UILoader.define()

export { UILoader }
