import { untrack } from "solid-js"

import { E, UIT } from "$/ui/core"
import type { FormController } from "./ui-form.types"

/****************
 * ### `UIFormHost`
 * Host base of `<ui-form>`:  its script API, delegated to the controller (`UIForm`).
 * - Before the controller exists, it answers as an empty form:  valid, no values, no native form.
 * - NOTE: the fork checks host prototype members against prop names;  none of these is one.
 ****************/
export class UIFormHost extends E.UIHost {
  /** The controller, typed. */
  private get form(): FormController | undefined {
    return this.controller as unknown as FormController | undefined
  }

  /** Validate every field, show prompts and states;  true when valid. */
  validate(): boolean {
    return this.form?.validate() ?? true
  }

  /** The same verdict as `validate()`, showing nothing. */
  isValid(): boolean {
    return this.form?.isValid() ?? true
  }

  /** The native form's reset (controls back to their starting values), then prompts cleared. */
  reset() {
    this.form?.reset()
  }

  /** Every control emptied (text `""`, checkboxes unchosen), then prompts cleared. */
  clear() {
    this.form?.clear()
  }

  /** Every field's value, by name (Fomantic's `get values`). */
  get values(): UIT.FormValues {
    return this.form?.values ?? {}
  }

  /** The `<form>` it works with, if any. */
  get nativeForm(): HTMLFormElement | undefined {
    return untrack(() => this.form?.nativeForm)
  }
}
