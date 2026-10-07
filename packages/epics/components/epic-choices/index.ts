/**
 * `epic-choices` family barrel:  defines `<epic-choices>`, `<epic-option>` (SIDE EFFECT) and exports their classes.
 */
import { EpicChoices } from "./EpicChoices"
import { EpicOption } from "./EpicOption"

EpicChoices.define()
EpicOption.define()

export { EpicChoices, EpicOption }
