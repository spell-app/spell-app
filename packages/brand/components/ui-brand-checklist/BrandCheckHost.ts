import { UIHost } from "$/ui/core"

/****************
 * ### `BrandCheckHost`
 * Host base of `<ui-brand-check>`:  `checked` as an alias of `selected`, as Spell UI's `CheckHost` gives
 * `<ui-checkbox>` (`selected` is canonical, `checked` accepted on checkboxes).
 * - A property alias, not a vocabulary attribute:  `el.checked = true` sets `el.selected` (which reflects);  the
 *   `checked` ATTRIBUTE in markup is read by the controller, as a native checkbox's is.
 * - NOTE: the fork checks host prototype members against prop names;  `checked` is no prop.
 ****************/
export class BrandCheckHost extends UIHost {
  /** Alias of `selected`. */
  get checked(): boolean {
    return !!(this as unknown as { selected?: boolean }).selected
  }

  set checked(value: boolean) {
    ;(this as unknown as { selected?: boolean }).selected = value
  }
}
