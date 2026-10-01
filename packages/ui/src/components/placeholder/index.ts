/**
 * Barrel for the placeholder components -- also the `placeholder` lib entry (`@spell-app/ui/placeholder`), measured
 * in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-placeholder>` and its shapes `<ui-placeholder-header>`, `-paragraph`, `-line`,
 *   `-image`.
 * - NOTE: `PlaceholderShape` (the shapes' base) is internal.
 */

import { UIPlaceholder } from "./UIPlaceholder"
import { UIPlaceholderHeader } from "./UIPlaceholderHeader"
import { UIPlaceholderParagraph } from "./UIPlaceholderParagraph"
import { UIPlaceholderLine } from "./UIPlaceholderLine"
import { UIPlaceholderImage } from "./UIPlaceholderImage"

UIPlaceholder.define()
UIPlaceholderHeader.define()
UIPlaceholderParagraph.define()
UIPlaceholderLine.define()
UIPlaceholderImage.define()

export { UIPlaceholder, UIPlaceholderHeader, UIPlaceholderParagraph, UIPlaceholderLine, UIPlaceholderImage }
