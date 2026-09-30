// through the `core` ENTRY, see `FormElement.ts`
import { UIHost } from "$/core"

/**
 * Host base of form-associated components (`ui-dropdown`, and `ui-button` for `type=submit|reset`):  the usual
 * form-control API (`form`, `validity`, `checkValidity()` ...), read from `internals`.
 * - Form association itself is the fork's `formAssociated` option (`@proto static formAssociated`, passed by
 *   `UIElement.define()`);  form callbacks reach the controller through the fork's `onFormReset` /
 *   `onFormDisabled` hooks.
 */
export class FormHost extends UIHost {
  /** Form owner. */
  get form(): HTMLFormElement | null {
    return this.internals.form
  }

  /** Constraint validation state. */
  get validity(): ValidityState {
    return this.internals.validity
  }

  /** Current validation message. */
  get validationMessage(): string {
    return this.internals.validationMessage
  }

  /** Takes part in constraint validation? */
  get willValidate(): boolean {
    return this.internals.willValidate
  }

  /** `<label>`s pointing at this element. */
  get labels(): NodeList {
    return this.internals.labels
  }

  /** Valid?  Fires `invalid` when not. */
  checkValidity(): boolean {
    return this.internals.checkValidity()
  }

  /** Valid?  Shows the browser's message when not. */
  reportValidity(): boolean {
    return this.internals.reportValidity()
  }
}
