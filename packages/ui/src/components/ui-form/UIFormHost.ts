import { UIHost, UIT } from "$/ui/core"
import type { FormController } from "./ui-form.types"

/****************
 * ### `UIFormHost`
 * Host base of `<ui-form>`:  its script API, delegated to the controller (`UIForm`).
 * - `validate()` -- validate every field, show prompts and states;  true when valid
 * - `isValid()` -- the same verdict, showing nothing
 * - `reset()` -- the native form's reset (controls back to their starting values) + prompts cleared
 * - `clear()` -- every control emptied (text `""`, checkboxes unchosen) + prompts cleared
 * - `values` -- every field's value, by name (Fomantic's `get values`)
 * - `nativeForm` -- the `<form>` it works with, or `null`
 * - NOTE: the fork checks host prototype members against prop names;  none of these is one.
 ****************/
export class UIFormHost extends UIHost {
  /** The controller, typed. */
  private get form(): FormController | undefined {
    return this.controller as unknown as FormController | undefined
  }

  validate(): boolean {
    return this.form?.validate() ?? true
  }

  isValid(): boolean {
    return this.form?.isValid() ?? true
  }

  reset() {
    this.form?.reset()
  }

  clear() {
    this.form?.clear()
  }

  get values(): UIT.FormValues {
    return this.form?.values() ?? {}
  }

  get nativeForm(): HTMLFormElement | null {
    return this.form?.nativeForm() ?? null
  }
}
