/**
 * The comment family:  defines `<ui-comments>` and `<ui-comment>`,
 * and exports their components, `UIComments` and `UIComment`.
 * - SIDE EFFECT:  importing it defines the tags, and the generic content parts through the parts barrel,
 *   so a page never has to import what its comments hold.
 * - Also the library's `@spell-app/ui/ui-comment` entry (its size is in `docs/report.md`).
 */

import { UIComment } from "./UIComment"
import { UIComments } from "./UIComments"

import "$/ui/components/ui-parts"

UIComments.define()
UIComment.define()

export { UIComment, UIComments }
