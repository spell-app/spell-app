/**
 * Barrel for the slider component -- also the `slider` lib entry (`@spell-app/ui/ui-slider`), measured in
 * `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-slider>`.
 * - NOTE: `SliderScale` (the number line) is exported too:  an app can snap values the same way.
 */

import { UISlider } from "./UISlider"
import { SliderScale } from "./SliderScale"

UISlider.define()

export { UISlider, SliderScale }
