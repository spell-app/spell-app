/**
 * `epic-aside` family barrel:  defines `<epic-aside>` (SIDE EFFECT) and exports its component, `EpicAside`, and
 * `EpicPanel`, the folded panel it shares with `<epic-code>`.
 */
import { EpicAside } from "./EpicAside"
import { EpicPanel } from "./EpicPanel"

EpicAside.define()

export { EpicAside, EpicPanel }
