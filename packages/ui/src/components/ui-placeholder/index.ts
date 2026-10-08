/**
 * The placeholder family:  defines `<ui-placeholder>` and its shapes
 * (`<ui-placeholder-header>`, `-paragraph`, `-line`, `-image`), and exports their components.
 * - SIDE EFFECT:  importing it defines the tags.
 * - Also the library's `@spell-app/ui/ui-placeholder` entry (its size is in `docs/report.md`).
 * - `PlaceholderShape` (the shapes' base) is internal:  not exported.
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
