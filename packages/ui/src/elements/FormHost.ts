import { E } from "$/ui/core"

/****************
 * ### `FormHost`
 * Host base of form-associated components (`<ui-dropdown>`, `<ui-input>`, `<ui-checkbox>` ...):  the usual
 * form-control API (`form`, `validity`, `checkValidity()` ...), read from `internals`.
 * - Form association itself is the fork's `formAssociated` option (`elementSetup.isAFormControl`, passed by
 *   `UIElement.define()`);  form callbacks reach the controller through the fork's `onFormReset` /
 *   `onFormDisabled` hooks.
 * - `<ui-button type="submit|reset">` is form-associated too, but keeps `UIHost`:  it needs no value or validity.
 * - Part of the `forms` entry:  extends `E.UIHost` through the `$/ui/core` ENTRY, never its leaf;  safe while this
 *   module evaluates, since the core never imports `forms` (see `FormElement`).
 * - `null` where the platform says it (`form`):  the same API as a native control.
 ****************/
export class FormHost extends E.UIHost {
  /** Form owner;  `null` outside a form, as a native control's. */
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
