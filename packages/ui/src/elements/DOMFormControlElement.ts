import { E } from "$/ui/core"

/****************
 * ### `DOMFormControlElement`
 * The DOM element of a form control (`<ui-dropdown>`, `<ui-input>`, `<ui-checkbox>` ...):
 * it adds the platform's form-control API (`form`, `validity`, `checkValidity()` ...), read from `internals`.
 * - Its component is a `FormComponent`, whose `elementSetup.DOMElement` names this class.
 * - Form association itself is solid-element's `formAssociated` option (`elementSetup.isAFormControl`, passed by
 *   `UIComponent.define()`);  form callbacks reach the component through solid-element's `onFormReset` /
 *   `onFormDisabled` hooks.
 * - `<ui-button type="submit|reset">` is form-associated too, but keeps `DOMElement`:  it needs no value or validity.
 * - Part of the `forms` entry:  extends `E.DOMElement` through the `$/ui/core` ENTRY, never its leaf;  safe while this
 *   module evaluates, since the core never imports `forms` (see `FormComponent`).
 * - `null` where the platform says it (`form`):  the same API as a native control.
 ****************/
export class DOMFormControlElement extends E.DOMElement {
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
