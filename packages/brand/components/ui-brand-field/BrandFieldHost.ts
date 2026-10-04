import { UIHost } from "$/ui/core"

/****************
 * ### `BrandFieldHost`
 * Host base of `<ui-brand-field>`:  `showErrors(messages)`, which `<ui-form>` calls on the field it finds through
 * `:state(field)` (as on a `<ui-field>`:  `packages/ui`'s `FieldHost`, which isn't exported).
 * - `errors` -- the messages `<ui-form>` asked to show
 * - NOTE: the fork checks host prototype members against prop names;  neither is one.
 ****************/
export class BrandFieldHost extends UIHost {
  /** Show `messages` under the control (and the `error` state);  `[]` clears. */
  showErrors(messages: readonly string[]) {
    ;(this.controller as { showErrors?(messages: readonly string[]): void } | undefined)?.showErrors?.(messages)
  }

  /** Messages `<ui-form>` asked to show. */
  get errors(): readonly string[] {
    return (this.controller as { shownErrors?(): readonly string[] } | undefined)?.shownErrors?.() ?? []
  }
}
