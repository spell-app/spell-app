/**
 * The rating family:  defines `<ui-rating>`, and exports its component
 * and its DOM element class, `DOMRatingElement`.
 * - Also the `rating` lib entry (`@spell-app/ui/ui-rating`), measured in `docs/report.md`.
 * - SIDE EFFECT:  importing it defines the tag.
 */

import { DOMRatingElement, UIRating } from "./UIRating"

UIRating.define()

export { UIRating, DOMRatingElement }
