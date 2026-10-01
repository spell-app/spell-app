/**
 * Barrel for the comment components -- also the `comment` lib entry (`@spell-app/ui/ui-comment`), measured in
 * `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-comments>` and `<ui-comment>`, and the generic content parts through the parts
 *   barrel, so a page never has to import what its comments hold.
 */

import { UIComment } from "./UIComment"
import { UIComments } from "./UIComments"

import "$/ui/components/ui-parts"

UIComments.define()
UIComment.define()

export { UIComment, UIComments }
