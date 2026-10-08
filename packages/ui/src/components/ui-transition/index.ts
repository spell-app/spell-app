/**
 * The transition family:  defines `<ui-transition>` and exports its component, `UITransition`,
 * and its DOM element, `DOMTransitionElement`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - NOTE: the keyframes are `animations.css`, part of the foundation every page and shadow root already has:
 *   `UI.transitions` animates any element with them, no `<ui-transition>` needed.
 * - Also the library's `@spell-app/ui/ui-transition` entry (its size is in `docs/report.md`).
 */

import { DOMTransitionElement, UITransition } from "./UITransition"

UITransition.define()

export { UITransition, DOMTransitionElement }
