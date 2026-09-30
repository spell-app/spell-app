import { FormHost } from "$/forms"

/****************
 * ### `RatingHost`
 * Host of `<ui-rating>`:  the form-control API, and `focus()` onto the group's TAB STOP.
 * - Why:  `delegatesFocus` hands a plain `host.focus()` to the shadow root's FIRST focusable element -- radio 1 --
 *   even when radio 3 is chosen;  Tab and `<label for>` already reach the chosen one.
 * - NOTE: the fork checks host prototype members against prop names;  `focus` is not a prop.
 ****************/
export class RatingHost extends FormHost {
  /** Focus the chosen radio, else the first. */
  override focus(options?: FocusOptions) {
    const controller = this.controller as { focus?(options?: FocusOptions): boolean } | undefined
    if (!controller?.focus?.(options)) super.focus(options)
  }
}
