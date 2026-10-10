// oxlint-disable-next-line spell-ui/no-solid-effect -- a helper class, not a component:  one effect per bound control, in a root of its own
import { createEffect, createRoot } from "solid-js"

import { E } from "$/ui/core"
import { FormFields } from "./FormFields"

/****************
 * ### `FormBinding`
 * Ties a `<ui-form value>`'s named controls to an object, both ways:
 * each control shows its property of the object, and writes it back as the person changes it.
 *
 * - What a control binds to, its SCOPE:  the nearest scope holder at or above it.
 *   - a `<ui-repeat>` row's elements hold the row's item;  the `<ui-form>` holds its `value`
 *   - they say so through `FormBinding.hold()`;  `scopeAround()` finds one, so a nested `<ui-repeat>` reads its
 *     list from its own row's item
 * - Object => control:  one Solid effect per control, reading `scope[name]`.
 *   - So it follows whatever Solid can:  signals, Spell UI's reactive members,
 *     spell's objects (their page bridges spell cells into Solid)
 *   - a checkbox / toggle shows `!!value` (`selected`);  a radio is chosen while `value` is its own value;
 *     anything else shows `value` (`""` for nullish)
 * - Control => object:  a change from a bound control (`input`, `change`, `ui-change`) writes `scope[name]`
 *   a microtask later, once the control holds its new value.
 *   - a checkbox writes its `selected`;  a chosen radio, its value;  anything else, its `value`
 *   - numbers:  a `type="number"` / `"range"` control writes a number (`null` while blank);
 *     any other control keeps a number property a number while what's typed reads as one
 *   - never when equal (`===`);  showing a value sends no event, so nothing loops
 * - Controls come and go (rows of a repeat, conditional fields):  `update()` binds the new ones
 *   and lets go of those gone.
 *   - a `ui-*` control whose family loads later (`<ui-root>` loads them on demand) is bound once its tag is defined
 * - Plain DOM plus Solid:  knows `<ui-form>` and `<ui-repeat>` only as scope holders, and reads controls the way
 *   `FormFields` does.
 ****************/
export class FormBinding {
  /**
   * The `<ui-form>`'s DOM element.
   * - STATIC for the object's life:  a different DOM element is a different `FormBinding`.
   */
  private readonly domElement: HTMLElement

  /** The form's controls, read from the DOM. */
  private readonly fields: FormFields

  /** Bound controls, each with its binding. */
  private readonly bindings = new Map<Element, Binding>()

  /** Controls changed, to write back on the next microtask. */
  private readonly changed = new Set<Element>()

  constructor({ domElement, fields }: FormBindingProps) {
    this.domElement = domElement
    this.fields = fields
  }

  ////////////////
  // ## Binding
  ////////////////

  /** Binding now:  between `update()` and `stop()`. */
  private isBinding = false

  /** Tags inside the form not defined yet, each waited for once:  a page may load a control's family later. */
  private readonly awaitedTags = new Set<string>()

  /**
   * Bind every named control not bound yet;  let go of those no longer in the form.
   * - A `ui-*` control whose tag isn't defined yet isn't a control yet:  this runs again once it is.
   */
  update() {
    this.isBinding = true
    for (const element of this.domElement.querySelectorAll(":not(:defined)")) this.updateWhenDefined(element.localName)
    const controls = new Set(this.fields.controls())
    for (const [control, binding] of this.bindings) {
      if (controls.has(control)) continue
      binding.dispose()
      this.bindings.delete(control)
    }
    for (const control of controls) {
      if (this.bindings.has(control)) continue
      const name = FormFields.nameOf(control)
      const scope = name ? FormBinding.holderAround(control) : undefined
      if (name && scope) this.bindings.set(control, FormBinding.bind(control, name, scope))
    }
  }

  /** `update()` again once `tag` is defined (while still binding). */
  private updateWhenDefined(tag: string) {
    if (this.awaitedTags.has(tag)) return
    this.awaitedTags.add(tag)
    void customElements
      .whenDefined(tag)
      .then(() => {
        this.awaitedTags.delete(tag)
        if (this.isBinding) this.update()
      })
      .catch((error) => E.Warnings.warn("<ui-form value>", `can't wait for <${tag}>:`, error))
  }

  /** Let go of every control. */
  stop() {
    this.isBinding = false
    for (const binding of this.bindings.values()) binding.dispose()
    this.bindings.clear()
    this.changed.clear()
  }

  /**
   * One control:  an effect showing `scope()[name]` in it, in a root of its own (disposed when it goes).
   * - STATIC:  needs only its arguments.
   */
  private static bind(control: Element, name: string, scope: () => unknown): Binding {
    return createRoot((dispose) => {
      createEffect(
        () => {
          const target = scope()
          return FormBinding.isObject(target) ? target[name] : UNBOUND
        },
        (value) => {
          if (value !== UNBOUND) FormBinding.show(control, value)
        }
      )
      return { name, scope, dispose }
    })
  }

  ////////////////
  // ## Writing back
  ////////////////

  /** A control changed:  write it back on the next microtask, once it holds its new value. */
  readonly onChange = (event: Event) => {
    if (!this.bindings.size) return
    const control = this.controlFor(event)
    if (!control || this.changed.has(control)) return
    this.changed.add(control)
    E.afterSolidUpdate(() => {
      if (!this.changed.delete(control)) return
      this.writeBack(control)
    })
  }

  /** Write every bound control back:  after a reset or a clear changed them all. */
  writeAll() {
    for (const control of this.bindings.keys()) this.writeBack(control)
  }

  /**
   * `scope[name] = ` what the control holds now, unless that's what it holds already.
   * - NEVER throws:  a property that can't be set (a getter alone) warns.
   * - Untracked:  it reads the scope and the property to write them, never to follow them.
   */
  @E.untracked
  private writeBack(control: Element) {
    const binding = this.bindings.get(control)
    if (!binding) return
    const target = binding.scope()
    if (!FormBinding.isObject(target)) return
    const current = target[binding.name]
    const next = FormBinding.valueFor(control, current)
    if (next === UNBOUND || next === current) return
    try {
      target[binding.name] = next
    } catch (error) {
      E.Warnings.warn("<ui-form value>", `can't set \`${binding.name}\`:`, error)
    }
  }

  /** The bound control an event came from:  the first at or above its `target`, inside the form. */
  private controlFor(event: Event): Element | undefined {
    for (let node = event.target as Element | null; node && node !== this.domElement; node = node.parentElement) {
      if (this.bindings.has(node)) return node
    }
    return undefined
  }

  ////////////////
  // ## Scopes
  ////////////////

  /**
   * Make `element` a scope holder:  bound controls (and `<ui-repeat>`s) at or inside it read `read()`.
   * - `<ui-form>` holds its `value`;  each top-level element of a `<ui-repeat>` row holds its item.
   */
  static hold(element: Element, read: () => unknown) {
    FormBinding.holders.set(element, read)
  }

  /** The scope at `element`:  its nearest holder's (itself included), read now;  tracked inside a computation. */
  static scopeAround(element: Element): unknown {
    return FormBinding.holderAround(element)?.()
  }

  /** The nearest holder's `read`, at or above `element`. */
  private static holderAround(element: Element): (() => unknown) | undefined {
    for (let node: Element | null = element; node; node = node.parentElement) {
      const read = FormBinding.holders.get(node)
      if (read) return read
    }
    return undefined
  }

  /**
   * Every scope holder, page-wide.
   * - A `WeakMap`:  a holder that leaves the page goes with it, so there's nothing to reset.
   */
  private static readonly holders = new WeakMap<Element, () => unknown>()

  ////////////////
  // ## Pure helpers
  // STATIC, every one:  it reads only its arguments, so it needs no instance.
  ////////////////

  /** Something with properties to bind to:  an object (a class instance, an array ...) or a function. */
  static isObject(value: unknown): value is Record<PropertyKey, unknown> {
    return value !== null && (typeof value === "object" || typeof value === "function")
  }

  /** Show `value` in `control`, see the class doc;  writes nothing that's already shown. */
  private static show(control: Element, value: unknown) {
    if (FormFields.isCheckable(control)) {
      const chosen = FormFields.isRadio(control) ? FormBinding.isRadioValue(control, value) : !!value
      if (FormFields.isChosen(control) === chosen) return
      if (control instanceof HTMLInputElement) control.checked = chosen
      else (control as Element & { selected: boolean }).selected = chosen
      return
    }
    const shown = Array.isArray(value) ? value : FormBinding.textOf(value)
    const element = control as Element & { value: unknown }
    if (element.value !== shown) element.value = shown
  }

  /** What `control` writes back, see the class doc;  `UNBOUND` for nothing (a radio not chosen). */
  private static valueFor(control: Element, current: unknown): unknown {
    if (FormFields.isRadio(control)) {
      return FormFields.isChosen(control)
        ? FormBinding.keepNumber(FormFields.chosenValueFor(control), current)
        : UNBOUND
    }
    if (FormFields.isCheckable(control)) return FormFields.isChosen(control)
    const { value, type } = control as Element & { value?: unknown; type?: unknown }
    if (typeof value === "string" && NUMBER_TYPES.has(type as string)) return value.trim() === "" ? null : Number(value)
    return FormBinding.keepNumber(value, current)
  }

  /** A radio's own value is `value` (as text:  a number property matches `value="2"`). */
  private static isRadioValue(control: Element, value: unknown): boolean {
    return value != null && FormBinding.textOf(value) === FormFields.chosenValueFor(control)
  }

  /** `value` as a control shows it:  `""` for nullish, a primitive as text, anything else as JSON. */
  private static textOf(value: unknown): string {
    if (value == null) return ""
    if (typeof value === "string") return value
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value)
    return JSON.stringify(value) ?? ""
  }

  /** `value` as a number when the property it replaces is one and it reads as one;  else `value` itself. */
  private static keepNumber(value: unknown, current: unknown): unknown {
    if (typeof current !== "number" || typeof value !== "string" || value.trim() === "") return value
    const number = Number(value)
    return Number.isFinite(number) ? number : value
  }
}

/** What `new FormBinding()` reads:  the collaborators it works over. */
export type FormBindingProps = {
  /** The `<ui-form>`'s DOM element. */
  domElement: HTMLElement
  /** The form's controls. */
  fields: FormFields
}

/** One bound control. */
type Binding = {
  /** The property it shows and writes. */
  name: string
  /** Its scope holder's `read`:  the object it binds to. */
  scope: () => unknown
  /** Stop its effect. */
  dispose: () => void
}

/** "No value to show or write":  no object to bind to, or a radio that isn't chosen. */
const UNBOUND = Symbol("unbound")

/** Input `type`s whose value is a number:  they write a number (`null` while blank). */
const NUMBER_TYPES = new Set(["number", "range"])
