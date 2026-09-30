/**
 * Barrel for the nag -- also the `nag` lib entry (`@spell/ui/nag`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-nag>`.
 */

import { UINag } from "./UINag"
import { UINagHost } from "./UINagHost"
import { DismissalStore } from "./DismissalStore"

UINag.define()

export { UINag, UINagHost, DismissalStore }
