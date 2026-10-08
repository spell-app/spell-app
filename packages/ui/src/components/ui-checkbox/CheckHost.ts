import { F } from "$/ui/forms"
import { CHECKBOX, type CheckValues, type RADIO } from "./ui-checkbox.types"

/****************
 * ### `CheckHost`
 * Host base of `<ui-checkbox>` and `<ui-radio>`:  the form-control API, plus `checked` as an alias of `selected`.
 * - `AGENTS.md`:  `selected` is canonical, `checked` accepted on checkbox / radio.
 * - A property alias, not a vocabulary attribute:  `el.checked = true` sets `el.selected`;  the `checked`
 *   ATTRIBUTE in markup is read by the controller (`CheckControl`), as a native checkbox's is.
 * - `checkable` tells `<ui-form>` how to read the value (`"checkbox"` / `"radio"`), without importing this family;
 *   `chosenValue` / `unchosenValue` what it submits, class defaults included, which no attribute says.
 * - NOTE: the fork checks host prototype members against prop names;  none of these names is a prop.
 ****************/
export class CheckHost extends F.FormHost {
  /** Alias of `selected`. */
  get checked(): boolean {
    return !!(this as unknown as { selected?: boolean }).selected
  }

  set checked(value: boolean) {
    ;(this as unknown as { selected?: boolean }).selected = value
  }

  /** How a form reads it:  `"radio"` for `<ui-radio>`, else `"checkbox"`. */
  get checkable(): Checkable {
    return (this.controller as { checkable?: Checkable } | undefined)?.checkable ?? CHECKBOX
  }

  /** Submitted while chosen:  `value`, else its class's `defaultChosenValue`;  none before its controller exists. */
  get chosenValue(): string | undefined {
    return (this.controller as CheckValues | undefined)?.chosenValue
  }

  /** Submitted while unchosen:  `off-value`, else its class's `defaultUnchosenValue`;  none ~== nothing. */
  get unchosenValue(): string | undefined {
    return (this.controller as CheckValues | undefined)?.unchosenValue
  }
}

/** What `<ui-form>` reads a checkable host as. */
type Checkable = typeof CHECKBOX | typeof RADIO
