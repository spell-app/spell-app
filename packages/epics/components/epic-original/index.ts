/**
 * `epic-original` family barrel:  defines `<epic-original>`, `<epic-version>` (SIDE EFFECT) and exports their classes.
 */
import { EpicOriginal } from "./EpicOriginal"
import { EpicVersion } from "./EpicVersion"

EpicOriginal.define()
EpicVersion.define()

export { EpicOriginal, EpicVersion }
