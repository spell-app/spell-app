/**
 * Barrel for the transition -- also the `transition` lib entry (`@spell/ui/transition`), measured in
 * `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-transition>`.
 * - NOTE: the keyframes are `animations.css`, part of the foundation every page and shadow root already has;
 *   `UI.transitions` animates any element with them, no element needed.
 */

import { UITransition } from "./UITransition"
import { TransitionHost } from "./TransitionHost"

UITransition.define()

export { UITransition, TransitionHost }
