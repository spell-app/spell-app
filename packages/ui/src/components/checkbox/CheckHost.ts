import { FormHost } from "$/forms"

/****************
 * ### `CheckHost`
 * Host base of `<ui-checkbox>` and `<ui-radio>`:  the form-control API, plus `checked` as an alias of `selected`
 * (`AGENTS.md`:  `selected` is canonical, `checked` accepted on checkbox / radio).
 * - A property alias, not a vocabulary attribute:  `el.checked = true` sets `el.selected`;  the `checked`
 *   ATTRIBUTE in markup is read by the controller (`CheckControl`), as a native checkbox's is.
 * - `checkable` tells `<ui-form>` how to read the value (`"checkbox"` / `"radio"`), without importing this family.
 * - NOTE: the fork checks host prototype members against prop names;  neither name is a prop.
 ****************/
export class CheckHost extends FormHost {
  /** Alias of `selected`. */
  get checked(): boolean {
    return !!(this as unknown as { selected?: boolean }).selected
  }

  set checked(value: boolean) {
    ;(this as unknown as { selected?: boolean }).selected = value
  }

  /** How a form reads it:  `"radio"` for `<ui-radio>`, else `"checkbox"`. */
  get checkable(): "checkbox" | "radio" {
    return (this.controller as { checkable?: "checkbox" | "radio" } | undefined)?.checkable ?? "checkbox"
  }
}
