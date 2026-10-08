import { E } from "$/ui/core"
import type { UITransition } from "./UITransition"

/****************
 * ### `TransitionHost`
 * Host of `<ui-transition>`:  Fomantic's behaviours as METHODS, since an attention animation (`shake`) has no
 * state an attribute could carry.
 * - Each resolves once its animation has run:  `true` when it finished, `false` when a later one interrupted it
 *   (`interrupt`), or when the element isn't rendered yet.
 * - `show()` / `hide()` / `toggle()` write `visible` (so it reflects, and frameworks see it), which queues the
 *   animation;  `transition()` is Fomantic's `$(el).transition(name)`.
 * - NOTE: `transition`, not `animate`:  `Element.animate()` is the Web Animations API.
 ****************/
export class TransitionHost extends E.UIHost {
  /** Animate in (the `animation` attribute's), then `ui-show`. */
  show(): Promise<boolean> {
    return this.transitionController?.animateTo(true) ?? Promise.resolve(false)
  }

  /** Animate out, then `ui-hide`. */
  hide(): Promise<boolean> {
    return this.transitionController?.animateTo(false) ?? Promise.resolve(false)
  }

  /** `show()` when hidden, else `hide()`. */
  toggle(): Promise<boolean> {
    return this.transitionController?.toggle() ?? Promise.resolve(false)
  }

  /**
   * Run `animation` (Fomantic's name, `fade up`, or the runtime's, `fade-up`;  default the `animation` attribute's):
   * an attention one in place, an appear / disappear one toggling visibility.  Queued like every other.
   */
  transition(animation?: string): Promise<boolean> {
    return this.transitionController?.transition(animation) ?? Promise.resolve(false)
  }

  /** The controller, typed, once rendered (`transition` is taken:  the method above). */
  private get transitionController(): UITransition | undefined {
    return this.controller as UITransition | undefined
  }
}
