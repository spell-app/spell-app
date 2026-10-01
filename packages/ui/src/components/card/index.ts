/**
 * Barrel for the card components -- also the `card` lib entry (`@spell-app/ui/card`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-card>` and `<ui-cards>`, and the generic content parts through the parts barrel,
 *   so a page never has to import what its cards hold.
 */

import { UICard } from "./UICard"
import { UICards } from "./UICards"

import "$/ui/components/parts"

UICard.define()
UICards.define()

export { UICard, UICards }
