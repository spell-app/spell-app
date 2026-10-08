/**
 * The card family:  defines `<ui-card>` and `<ui-cards>`, and exports their components, `UICard` and `UICards`.
 * - SIDE EFFECT:  importing it defines the tags, and the generic content parts through the parts barrel,
 *   so a page never has to import what its cards hold.
 * - Also the library's `@spell-app/ui/ui-card` entry (its size is in `docs/report.md`).
 */

import { UICard } from "./UICard"
import { UICards } from "./UICards"

import "$/ui/components/ui-parts"

UICard.define()
UICards.define()

export { UICard, UICards }
