import { E } from "$/ui/core"

/****************
 * ### `FieldHost`
 * Host base of `<ui-field>`:  `showErrors(messages)`, which `<ui-form>` calls to show (or with `[]`, clear) the
 * field's inline prompt and error state.
 * - No attribute is written, so the author's `state` stays theirs.
 * - `errors` -- the prompts shown now
 * - NOTE: the fork checks host prototype members against prop names;  neither is one.
 ****************/
export class FieldHost extends E.UIHost {
  /** Show `messages` as the field's prompt (and `error` state);  `[]` clears. */
  showErrors(messages: readonly string[]) {
    ;(this.controller as { showErrors?(messages: readonly string[]): void } | undefined)?.showErrors?.(messages)
  }

  /** Prompts shown now. */
  get errors(): readonly string[] {
    return (this.controller as { shownErrors?(): readonly string[] } | undefined)?.shownErrors?.() ?? []
  }
}
