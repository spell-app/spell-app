import { E, UI } from "$/ui/core"
// the family barrel, not the leaf:  the lib build then imports `ui-form.js` instead of splitting a shared chunk
// (SIDE EFFECT:  defines the form family:  a property is a field, in a form)
import { DOMFieldElement, UIField } from "$/ui/components/ui-form"
import type { fieldVocabulary } from "$/ui/components/ui-form/UIField.en"
import { PropertySchemas } from "$/ui/property"
import type { AttributeSpec, PropertySchema, ValueType } from "$/ui/vocabulary"
import type { Choice, PropertyControl } from "$/ui/runtime"
import { propertyVocabulary } from "./UIProperty.en"
import { EDITOR_TAG, GROUP_TAG, MADE_ATTRIBUTE, VALUE_FROM_ATTRIBUTE } from "./UIPropertyEditor.types"

import propertyCSS from "./UIProperty.css?inline"

/****************
 * ### `DOMPropertyElement`
 * The DOM element of `<ui-property>`:  a field's (`showErrors()`, `errors`), plus what its editor reads of it.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMPropertyElement extends DOMFieldElement {
  /** The schema's rules for it (`rules`, and `min` / `max` / `pattern` as rules):  `<ui-form>` adds them to the form's. */
  @E.untracked
  get schemaRules(): readonly string[] | undefined {
    return (this.component as UIProperty | undefined)?.schemaRules
  }

  /** Show it as holding an edit not saved yet (`:state(changed)`);  the editor says. */
  markChanged(isChanged: boolean) {
    const component = this.component as UIProperty | undefined
    if (component) component.isChanged = isChanged
  }
}

/****************
 * ### `UIProperty`
 * The component behind `<ui-property>`:  one property of the thing its `<ui-property-editor>` edits.
 *
 * - It IS a `<ui-field>` (it extends `UIField`):  the label row, the tip, the hint, the error lines, `apply`, `mixed`,
 *   `rules`;  `<ui-form>` finds it as a field (`:state(field)`) and binds its control.
 * - What it knows of its property comes from the editor's SCHEMA (`spec`), found by `name` (a dotted name reaches into
 *   a nested thing's attributes):
 *   - the label (`labelOf()`:  its own, else made from the name) and the tip, unless the field's own say otherwise
 *   - its value's type, so its default control (`UI.propertyControls.kindFor()`)
 *   - its choices (`values`, a `choicesFrom` source), limits and rules
 * - Its CONTROL:  one it holds already (the author's), else one it MAKES, as `as` says (else the type's kind),
 *   and adds to its own light DOM, as `<ui-repeat>` adds rows.
 *   - Made with `name` = the property's name, so the editor's form binds it;  its choices as children.
 *   - Made again when the kind or the choices change;  taken away when the author adds their own.
 *   - SIDE EFFECT:  adds and removes elements in its light DOM, marked `data-ui-made`.
 * - `readonly` nests:  its own, or a `readonly` group or editor around it, makes the control readonly.
 * - `:state(changed)`:  its edit is held, not saved yet (the editor says, `markChanged()`).
 ****************/
export class UIProperty extends UIField {
  // the field's names under the property's tag, and its own:  TypeScript only knows the field's literals
  @E.proto static vocabulary = propertyVocabulary as unknown as typeof fieldVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { ...UIField.prototype.elementSetup.styleSheets, property: propertyCSS },
    DOMElement: DOMPropertyElement
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Its own attributes
  ////////////////

  /** The property it edits:  `name`. */
  get propertyName(): string {
    return this.attributes.name ?? ""
  }

  /** The control kind it was asked for:  `as`. */
  get requestedKind(): string | undefined {
    return this.attributes.as ?? undefined
  }

  /** Where its choices come from, when not the schema's:  `options`. */
  get optionsText(): string | undefined {
    return this.attributes.options ?? undefined
  }

  ////////////////
  // ## The editor and the schema
  ////////////////

  /** The `<ui-property-editor>` around it, while connected. */
  @E.state accessor editor: DOMEditorLike | undefined = undefined

  /** Find the editor (and a `readonly` group or editor) on connect. */
  @E.whileConnected
  protected watchEditor() {
    this.editor = (this.domElement.closest(EDITOR_TAG) as DOMEditorLike | null) ?? undefined
    this.isInReadonly = !!this.domElement.parentElement?.closest(`${GROUP_TAG}[readonly], ${EDITOR_TAG}[readonly]`)
    return () => {
      this.editor = undefined
    }
  }

  /** What the schema says of its property, if the editor has a schema that names it. */
  get spec(): AttributeSpec | undefined {
    const schema = this.editor?.currentSchema
    return schema ? UIProperty.specFor(schema, this.propertyName) : undefined
  }

  /** Its label:  the field's own `label`, else the schema's (or one made from its name). */
  get labelText(): string | undefined {
    if (this.label) return this.label
    const spec = this.spec
    return spec ? PropertySchemas.labelOf(spec) : this.propertyName && PropertySchemas.labelOf(NAMED(this.propertyName))
  }

  /** Its tip:  the field's own `description`, else the schema's `tip`. */
  get descriptionText(): string | undefined {
    return this.description ?? this.spec?.tip
  }

  /** Its value's type, as a form edits it:  the schema's, else `text`. */
  get valueType(): ValueType {
    const spec = this.spec
    return spec ? PropertySchemas.typeOf(spec) : TEXT
  }

  /** The schema's rules for it, as `<ui-form>` rule strings:  its `rules`, then its limits. */
  get schemaRules(): readonly string[] | undefined {
    const spec = this.spec
    if (!spec) return undefined
    const rules = spec.rules === undefined ? [] : Array.isArray(spec.rules) ? [...spec.rules] : [spec.rules as string]
    if (spec.pattern) rules.push(`regExp[/${spec.pattern}/]`)
    return rules.length ? rules : undefined
  }

  ////////////////
  // ## Readonly and changed
  ////////////////

  /** A `readonly` group or editor is around it. */
  @E.state accessor isInReadonly = false

  /** `:state(readonly)`:  its own `readonly`, or a group's or the editor's. */
  @E.cssState("readonly")
  get isReadOnly(): boolean {
    return !!this.readonly || this.isInReadonly
  }

  /** `:state(changed)`:  its edit is held, not saved yet. */
  @E.cssState("changed")
  @E.state
  accessor isChanged = false

  ////////////////
  // ## The control it makes
  ////////////////

  /** The kind of control it draws:  `as`, else its type's default.  `undefined` until the page's runtime is in. */
  get controlKind(): string | undefined {
    if (!this.isReady) return undefined
    return this.requestedKind ?? UI.propertyControls.kindFor(this.valueType)
  }

  /** `:state(buttons)`:  its control is a row of choices (a kind drawn as `radios`). */
  @E.cssState("buttons")
  get isButtonRow(): boolean {
    const kind = this.controlKind
    return !!kind && UI.propertyControls.get(kind)?.choices === RADIOS
  }

  /** Choices loaded from a source (`options`, `choicesFrom`), once they arrive. */
  @E.state accessor loadedChoices: readonly Choice[] | undefined = undefined

  /** Its choices:  `options` written as a list, else a source's (once loaded), else the schema's `values`. */
  get choices(): readonly Choice[] | undefined {
    const text = this.optionsText
    if (text && text.includes(",")) return text.split(",").map((choice) => choice.trim())
    if (text || this.spec?.choicesFrom) return this.loadedChoices
    return this.spec?.values as readonly string[] | undefined
  }

  /** A choice source to load:  `options` naming one, else the schema's `choicesFrom`. */
  @E.onChange("optionsText", "spec", "isReady")
  protected onChoiceSourceChanged(text: string | undefined, spec: AttributeSpec | undefined, isReady: boolean) {
    const source = text && !text.includes(",") ? text : spec?.choicesFrom
    if (!isReady || !source) return
    let isCurrent = true
    void UI.propertyControls
      .choices(source)
      .then((choices) => {
        if (isCurrent) this.loadedChoices = choices ?? []
      })
      .catch((error) => E.Warnings.warn("<ui-property>", `can't load the choices of \`${source}\`:`, error))
    return () => {
      isCurrent = false
    }
  }

  /** Make (or make again) its control as the kind, choices, name, readonly state or limits change. */
  @E.onChange("controlKind", "choices", "propertyName", "isReadOnly", "spec")
  protected onControlNeeded(kind: string | undefined) {
    if (!kind || this.holdsOwnControl) return this.removeMadeControls()
    this.makeControl(kind)
  }

  /** The author put a control of their own in it:  any element child it didn't make, outside the named slots. */
  private get holdsOwnControl(): boolean {
    return [...this.domElement.children].some((child) => !child.hasAttribute(MADE_ATTRIBUTE) && !child.slot)
  }

  /**
   * Replace the controls it made with one of `kind`.
   * - SIDE EFFECT:  writes its light DOM.
   */
  @E.untracked
  private makeControl(kind: string) {
    const control = UI.propertyControls.get(kind)
    if (!control) {
      E.Warnings.warn("<ui-property>", `no control kind \`${kind}\`:  add it with UI.propertyControls.add()`)
      return
    }
    this.removeMadeControls()
    const made = control.choices === "radios" ? this.radios(control) : [this.controlElement(control)]
    for (const element of made) element.setAttribute(MADE_ATTRIBUTE, "")
    this.domElement.append(...made)
  }

  /** One control element of `control`'s kind:  named, limited, readonly, its choices as `<ui-item>`s. */
  private controlElement(control: PropertyControl): HTMLElement {
    const element = document.createElement(control.tag)
    for (const [name, value] of Object.entries(control.attributes ?? {})) element.setAttribute(name, value)
    element.setAttribute("name", this.propertyName)
    const spec = this.spec
    if (spec?.min !== undefined) element.setAttribute("min", String(spec.min))
    if (spec?.max !== undefined) element.setAttribute("max", String(spec.max))
    if (spec?.step !== undefined) element.setAttribute("step", String(spec.step))
    if (this.isReadOnly) element.setAttribute("readonly", "")
    if (control.choices === "items") {
      for (const choice of this.choices ?? []) element.append(UIProperty.item(choice))
    }
    if (control.tag === EDITOR_TAG) element.setAttribute(VALUE_FROM_ATTRIBUTE, this.propertyName)
    return element
  }

  /** One radio per choice, of one name:  the `buttons` kind. */
  private radios(control: PropertyControl): HTMLElement[] {
    return (this.choices ?? []).map((choice) => {
      const radio = this.controlElement(control)
      const { value, text } = UIProperty.choiceParts(choice)
      radio.setAttribute("value", value)
      radio.textContent = text
      return radio
    })
  }

  /**
   * Take away every control it made.
   * - SIDE EFFECT:  writes its light DOM.
   */
  @E.untracked
  private removeMadeControls() {
    for (const child of [...this.domElement.children]) if (child.hasAttribute(MADE_ATTRIBUTE)) child.remove()
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * What `schema` says of property `name`;  a dotted name reaches into a nested thing's `attributesOf`.
   * - STATIC:  pure.
   */
  static specFor(schema: PropertySchema, name: string): AttributeSpec | undefined {
    let attributes: readonly AttributeSpec[] | undefined = schema.attributes
    let spec: AttributeSpec | undefined
    for (const key of name.split(".")) {
      spec = attributes?.find((candidate) => candidate.name === key || candidate.property === key)
      attributes = spec?.attributesOf
    }
    return spec
  }

  /** A choice's value and text. */
  private static choiceParts(choice: Choice): { value: string; text: string } {
    return typeof choice === "string" ? { value: choice, text: choice } : choice
  }

  /** A `<ui-item value>` for a choice. */
  private static item(choice: Choice): HTMLElement {
    const { value, text } = UIProperty.choiceParts(choice)
    const item = document.createElement("ui-item")
    item.setAttribute("value", value)
    item.textContent = text
    return item
  }
}

/** What a property reads of its editor's DOM element. */
type DOMEditorLike = HTMLElement & { readonly currentSchema?: PropertySchema }

/** A kind's choices drawn one control each. */
const RADIOS = "radios"

/** The type of a property the schema doesn't name. */
const TEXT: ValueType = "text"

/** A bare attribute named `name`, to make a label from. */
const NAMED = (name: string): AttributeSpec => ({ name, kind: "string", description: "" })
