import {
  Converters,
  type FieldValue,
  type FormFieldRules,
  type FormRules,
  type FormValues,
  type ValidationRule
} from "$/ui/core"
import { Validator } from "$/ui/forms"
import {
  VALIDITY_FLAGS,
  CONTROL_SELECTOR,
  FIELD_SELECTOR,
  EMPTY,
  NOT_EMPTY,
  MULTIPLE,
  VALUE,
  DEFAULT_VALUE,
  BUTTON_TYPES,
  type Field,
  type FieldSpec
} from "./ui-form.types"

/****************
 * ### `FormFields`
 * What `<ui-form>` validates:  its controls grouped by name (else id), their values and labels, and one field's
 * errors -- plain DOM, no Solid, so it reads light-DOM natives and `ui-*` hosts alike.
 * - Controls:  the native form's `elements` (which include form-associated `ui-*` hosts), those inside the
 *   `<ui-form>` when the form is outside it;  without a form, every control inside.  Buttons are skipped;  a
 *   `ui-*` host counts when it has the form-control API (`validity`), so `<ui-button>` doesn't.
 * - Values, Fomantic's `get.values()` shape:
 *   - checkboxes (`ui-checkbox` / native):  one => `value` (or `true`) when chosen, else `false`;  several of one
 *     name => the chosen values
 *   - radios:  the chosen one's value, else `null`
 *   - anything else:  its `value` (`string`, or `string[]` for a multiple dropdown / select);  several => a list
 * - Errors of a field:  its `rules` through `Validator` (with every value for `match` / `different`, and every
 *   label for their prompts), THEN each control's own constraint validation (`validationMessage`), de-duplicated.
 ****************/
export class FormFields {
  /** Shared rule engine. */
  static validator = new Validator()

  /** The `<ui-form>` host. */
  private readonly host: HTMLElement

  /** The native form, when there is one. */
  private readonly form: () => HTMLFormElement | null

  constructor(host: HTMLElement, form: () => HTMLFormElement | null) {
    this.host = host
    this.form = form
  }

  ////////////////
  // ## Reading
  ////////////////

  /** Every control, in document order. */
  controls(): Element[] {
    const form = this.form()
    const candidates = form ? [...form.elements] : [...this.host.querySelectorAll(CONTROL_SELECTOR), ...this.faces()]
    const inside = !form || !form.contains(this.host) ? candidates : candidates.filter((el) => this.host.contains(el))
    return [...new Set(inside)].filter(FormFields.isControl).sort(FormFields.byDocumentOrder)
  }

  /** Fields by identifier, in document order. */
  fields(): Field[] {
    const byIdentifier = new Map<string, Element[]>()
    for (const control of this.controls()) {
      const identifier = FormFields.identifierOf(control)
      if (!identifier) continue
      const list = byIdentifier.get(identifier)
      if (list) list.push(control)
      else byIdentifier.set(identifier, [control])
    }
    return [...byIdentifier].map(([identifier, controls]) => ({ identifier, controls }))
  }

  /** The field named `identifier`, if any. */
  field(identifier: string): Field | undefined {
    return this.fields().find((field) => field.identifier === identifier)
  }

  /** Every field's value, see the class doc. */
  values(fields: readonly Field[] = this.fields()): FormValues {
    const values: FormValues = {}
    for (const { identifier, controls } of fields) values[identifier] = FormFields.valueOf(controls)
    return values
  }

  /** Human label of a field:  its controls' `<label>`s, else its `<ui-field>`'s label, else the identifier. */
  label({ identifier, controls }: Field): string {
    for (const control of controls) {
      const labels = (control as { labels?: NodeList | null }).labels
      const text = labels ? [...labels].map((label) => label.textContent?.trim() ?? "").find(Boolean) : undefined
      if (text) return text
    }
    const field = controls[0]?.closest(FIELD_SELECTOR)
    const fieldLabel = field?.querySelector(":scope > label")?.textContent?.trim()
    if (fieldLabel) return fieldLabel
    const own =
      controls.length === 1 && FormFields.isCheckable(controls[0]!) ? controls[0]!.textContent?.trim() : undefined
    return own || identifier
  }

  ////////////////
  // ## Validating
  ////////////////

  /**
   * Prompts of one field, `[]` when it passes.
   * - `rules` for it (by identifier, or a spec whose `identifier` names it), then the controls' own validity.
   * - Controls that don't validate (`willValidate` false:  disabled, readonly, fieldset-disabled) and fields in a
   *   disabled `<ui-field>` are skipped.
   */
  errors(field: Field, rules: FormRules | undefined, values: FormValues, labels: Record<string, string>): string[] {
    const live = field.controls.filter((control) => FormFields.willValidate(control))
    if (!live.length) return []
    const errors: string[] = []
    const flags = new Set<string>()
    const spec = FormFields.spec(rules, field.identifier)
    if (spec && !(spec.depends && FormFields.isBlank(values[spec.depends]))) {
      const result = FormFields.validator.validate(values[field.identifier], spec.rules, {
        name: field.identifier,
        label: labels[field.identifier],
        fieldValues: values,
        fieldLabels: labels,
        optional: spec.optional
      })
      for (const error of result.errors) {
        errors.push(error.message)
        flags.add(error.flag)
      }
    }
    for (const control of live) {
      const validity = (control as { validity?: ValidityState }).validity
      const message = (control as { validationMessage?: string }).validationMessage
      if (!validity || validity.valid || !message || errors.includes(message)) continue
      // a rule already said it (`email` rule + `type="email"`):  the rule's prompt wins
      if (VALIDITY_FLAGS.filter((flag) => validity[flag]).every((flag) => flags.has(flag))) continue
      errors.push(message)
    }
    return errors
  }

  /** Labels of every field, for prompts. */
  labels(fields: readonly Field[]): Record<string, string> {
    const labels: Record<string, string> = {}
    for (const field of fields) labels[field.identifier] = this.label(field)
    return labels
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Form-associated custom elements inside the host (not reachable by a selector). */
  private faces(): Element[] {
    return [...this.host.querySelectorAll("*")].filter(
      (element) => (element.constructor as { formAssociated?: boolean }).formAssociated
    )
  }

  /** The value of a field made of `controls`. */
  static valueOf(controls: readonly Element[]): FieldValue {
    const [first] = controls
    if (!first) return null
    if (FormFields.isRadio(first)) {
      const chosen = controls.find((control) => FormFields.isChosen(control))
      return chosen ? FormFields.chosenValue(chosen) : null
    }
    if (FormFields.isCheckable(first)) {
      if (controls.length === 1) return FormFields.isChosen(first) ? (first.getAttribute(VALUE) ?? true) : false
      return controls
        .filter((control) => FormFields.isChosen(control))
        .map((control) => FormFields.chosenValue(control))
    }
    const values = controls.map((control) => FormFields.ownValue(control))
    return values.length === 1 ? values[0]! : values.flat()
  }

  /** `rules` for `identifier`, normalized;  `empty` => `notEmpty`. */
  static spec(rules: FormRules | undefined, identifier: string): FieldSpec | undefined {
    if (!rules) return undefined
    let entry: FormFieldRules | undefined = rules[identifier]
    if (entry === undefined) {
      entry = Object.values(rules).find(
        (value) =>
          typeof value === "object" && !Array.isArray(value) && "rules" in value && value.identifier === identifier
      )
    }
    if (entry === undefined) return undefined
    const spec: FieldSpec =
      typeof entry === "object" && !Array.isArray(entry) && "rules" in entry
        ? { rules: [...entry.rules], optional: !!entry.optional, depends: entry.depends, identifier: entry.identifier }
        : { rules: Array.isArray(entry) ? [...entry] : [entry as ValidationRule], optional: false }
    spec.rules = spec.rules.map(FormFields.renameEmpty)
    return spec
  }

  /** Fomantic's deprecated `empty` rule is `notEmpty`. */
  private static renameEmpty(rule: ValidationRule): ValidationRule {
    if (typeof rule === "string") return rule === EMPTY ? NOT_EMPTY : rule
    return rule.type === EMPTY ? { ...rule, type: NOT_EMPTY } : rule
  }

  /** Blank, as `depends` sees it. */
  static isBlank(value: FieldValue): boolean {
    return value == null || value === false || value === "" || (Array.isArray(value) && !value.length)
  }

  /** A control `<ui-form>` reads:  native value controls, and `ui-*` hosts with the form-control API. */
  private static isControl(element: Element): boolean {
    if (element instanceof HTMLInputElement) return !BUTTON_TYPES.has(element.type)
    if (element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) return true
    if (element instanceof HTMLButtonElement || element instanceof HTMLFieldSetElement) return false
    return "validity" in element && (element.constructor as { formAssociated?: boolean }).formAssociated === true
  }

  /** `name`, else `id`. */
  private static identifierOf(control: Element): string | undefined {
    const name = (control as { name?: unknown }).name
    return (typeof name === "string" && name) || control.getAttribute("name") || control.id || undefined
  }

  /** A checkbox (native, or a `ui-*` host saying so). */
  private static isCheckable(control: Element): boolean {
    if (control instanceof HTMLInputElement) return control.type === "checkbox" || control.type === "radio"
    return !!(control as { checkable?: string }).checkable
  }

  /** A radio (native, or a `ui-*` host saying so). */
  private static isRadio(control: Element): boolean {
    if (control instanceof HTMLInputElement) return control.type === "radio"
    return (control as { checkable?: string }).checkable === "radio"
  }

  /** Chosen now. */
  private static isChosen(control: Element): boolean {
    if (control instanceof HTMLInputElement) return control.checked
    return !!(control as { selected?: boolean }).selected
  }

  /** What a chosen checkable submits:  its `value` attribute, else `on` (native default). */
  private static chosenValue(control: Element): string {
    return control.getAttribute(VALUE) ?? DEFAULT_VALUE
  }

  /** The value of a non-checkable control. */
  private static ownValue(control: Element): string | string[] {
    if (control instanceof HTMLSelectElement && control.multiple) {
      return [...control.selectedOptions].map((option) => option.value)
    }
    const value = (control as { value?: unknown }).value
    if (Array.isArray(value)) return value.map(String)
    // a `multiple` element's attribute value is a list in one string (`value="a,b"`)
    if (typeof value === "string" && control.hasAttribute(MULTIPLE) && !(control instanceof HTMLInputElement)) {
      return Converters.list(value)
    }
    if (typeof value === "string") return value
    return typeof value === "number" || typeof value === "boolean" ? String(value) : ""
  }

  /** Takes part in validation? */
  private static willValidate(control: Element): boolean {
    if ((control as { willValidate?: boolean }).willValidate === false) return false
    return !control.closest(FIELD_SELECTOR)?.matches(":state(disabled)")
  }

  /** Sort comparator:  document order. */
  private static byDocumentOrder(a: Element, b: Element): number {
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  }
}
