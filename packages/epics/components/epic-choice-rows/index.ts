/**
 * `epic-choice-rows` family barrel:  defines `<epic-choice-rows>` and `<epic-choice-row>` (SIDE EFFECT) and exports
 * their components, `EpicChoiceRows` and `EpicChoiceRow`.
 */
import { EpicChoiceRow } from "./EpicChoiceRow"
import { EpicChoiceRows } from "./EpicChoiceRows"

EpicChoiceRows.define()
EpicChoiceRow.define()

export { EpicChoiceRow, EpicChoiceRows }
