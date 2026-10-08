/**
 * The ad family:  defines `<ui-ad>` and exports its component, `UIAd`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-ad` entry (its size is in `docs/report.md`).
 */

import { UIAd } from "./UIAd"

UIAd.define()

export { UIAd }
