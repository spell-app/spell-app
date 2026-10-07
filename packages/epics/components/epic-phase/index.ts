/**
 * `epic-phase` family barrel:  defines `<epic-phase>`, `<epic-field>`, `<epic-updated>` (SIDE EFFECT) and exports
 * their classes.
 */
import { EpicPhase } from "./EpicPhase"
import { EpicField } from "./EpicField"
import { EpicUpdated } from "./EpicUpdated"

EpicPhase.define()
EpicField.define()
EpicUpdated.define()

export { EpicPhase, EpicField, EpicUpdated }
