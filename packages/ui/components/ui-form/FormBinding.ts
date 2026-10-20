// oxlint-disable-next-line spell-ui/no-solid-effect -- a helper class, not a component:  one effect per bound control, in a root of its own
import { createEffect, createRoot } from "solid-js"

import { E, UIT } from "$/ui/core"
import { FormFields } from "./FormFields"
import { FIELD_SELECTOR, type FieldApply } from "./UIForm.types"

/****************
 * ### `FormBinding`
 * Ties a `<ui-form value>`'s named controls to an object (or to many), both ways:
 * each control shows its property of the object, and writes it back as the person changes it.
 *
 * - What a control binds to, its SCOPE:  the nearest scope holder at or above it.
 *   - a `<ui-repeat>` row's elements hold the row's item;  the `<ui-form>` holds its `value`
 *   - they say so through `FormBinding.hold()`;  `scopeAround()` finds one, so a nested `<ui-repeat>` reads its
 *     list from its own row's item
 * - MANY THINGS:  a scope that's a list (an array) binds each control to every thing in it.
 *   - a control shows the value they all agree on;  when they don't, it shows blank, its `<ui-field>` gets
 *     `mixed`, and the control a "Mixed" placeholder
 *   - a write sets the property on all of them
 * - Object => control:  one Solid effect per control, reading `scope[name]`.
 *   - So it follows whatever Solid can:  signals, Spell UI's reactive members,
 *     spell's objects (their page bridges spell cells into Solid)
 *   - a checkbox / toggle shows `!!value` (`selected`);  a radio is chosen while `value` is its own value;
 *     anything else shows `value` (`""` for nullish)
 * - A dotted `name` reaches into nested things:  `name="font.size"` shows and writes `scope.font.size`.
 * - Control => object:  a change from a bound control (`input`, `change`, `ui-change`) writes `scope[name]`,
 *   when its `<ui-field apply>` says (`applyOf()`):
 *   - `immediately` (the default):  a microtask later, once the control holds its new value
 *   - `delayed [ms]`:  after a pause in typing (300ms);  a committed `change` writes at once
 *   - `on leave`:  when the cursor leaves the field (`onLeave()`), or the control commits (`change`)
 *   - a checkbox writes its `selected`;  a chosen radio, its value;  anything else, its `value`
 *   - numbers:  a `type="number"` / `"range"` control writes a number (`null` while blank);
 *     any other control keeps a number property a number while what's typed reads as one
 *   - never when equal (`===`);  showing a value sends no event, so nothing loops
 *   - never a value the form refuses (`canWrite`:  it fails validation)
 * - HELD edits (`<ui-form apply="on save">`, `isHolding`):  a write is kept, not made, until `save()`;
 *   `cancel()` drops them and shows the object again.
 * - Controls come and go (rows of a repeat, conditional fields):  `update()` binds the new ones
 *   and lets go of those gone.
 *   - a `ui-*` control whose family loads later (`<ui-root>` loads them on demand) is bound once its tag is defined
 * - Plain DOM plus Solid:  knows `<ui-form>` and `<ui-repeat>` only as scope holders, `<ui-field>` by its
 *   attributes, and reads controls the way `FormFields` does.
 ****************/
export class FormBinding {
  /**
   * The `<ui-form>`'s DOM element.
   * - STATIC for the object's life:  a different DOM element is a different `FormBinding`.
   */
  private readonly domElement: HTMLElement

  /** The form's controls, read from the DOM. */
  private readonly fields: FormFields

  /** What the form says about writes:  hold them, and may this control's value be written. */
  private readonly form: FormBindingProps["form"]

  /** Bound controls, each with its binding. */
  private readonly bindings = new Map<Element, Binding>()

  /** Controls changed, to write back on the next microtask. */
  private readonly changed = new Set<Element>()

  /** `delayed` controls waiting for a pause in typing, each with its timer. */
  private readonly delayed = new Map<Element, { cancel(): void }>()

  constructor({ domElement, fields, form }: FormBindingProps) {
    this.domElement = domElement
    this.fields = fields
    this.form = form
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
      this.held.delete(control)
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

  /** Let go of every control, and of held edits. */
  stop() {
    this.isBinding = false
    for (const binding of this.bindings.values()) binding.dispose()
    for (const timer of this.delayed.values()) timer.cancel()
    this.bindings.clear()
    this.changed.clear()
    this.delayed.clear()
    this.dropHeld()
  }

  /**
   * One control:  an effect showing `scope()[name]` in it, in a root of its own (disposed when it goes).
   * - Many things:  the value they agree on, else `MIXED`.
   * - STATIC:  needs only its arguments.
   */
  private static bind(control: Element, name: string, scope: () => unknown): Binding {
    return createRoot((dispose) => {
      createEffect(
        () => FormBinding.valueIn(scope(), name),
        (value) => {
          if (value === UNBOUND) return
          FormBinding.markMixed(control, value === MIXED)
          FormBinding.show(control, value === MIXED ? undefined : value)
        }
      )
      return { name, scope, dispose }
    })
  }

  ////////////////
  // ## Writing back
  ////////////////

  /**
   * A control changed:  write it back when its field's `apply` says (see the class doc).
   * - `change` is a COMMITTED change (a text field left, a choice made):  it writes a `delayed` or `on leave` one too.
   */
  readonly onChange = (event: Event) => {
    if (!this.bindings.size) return
    const control = this.controlFor(event)
    if (!control) return
    const apply = FormBinding.applyOf(control)
    const isCommitted = event.type === "change"
    if (apply.mode === "on leave" && !isCommitted) return
    if (apply.mode === "delayed" && !isCommitted) return this.writeAfterPause(control, apply.delay)
    this.delayed.get(control)?.cancel()
    this.delayed.delete(control)
    this.writeSoon(control)
  }

  /** The cursor left a control:  write it back if its field writes `on leave` (or has a `delayed` write waiting). */
  readonly onLeave = (event: Event) => {
    if (!this.bindings.size) return
    const control = this.controlFor(event)
    if (!control) return
    const apply = FormBinding.applyOf(control)
    if (apply.mode === "on leave" || this.delayed.has(control)) {
      this.delayed.get(control)?.cancel()
      this.delayed.delete(control)
      this.writeSoon(control)
    }
  }

  /** Write `control` back on the next microtask, once it holds its new value. */
  private writeSoon(control: Element) {
    if (this.changed.has(control)) return
    this.changed.add(control)
    E.afterSolidUpdate(() => {
      if (!this.changed.delete(control)) return
      this.writeBack(control)
    })
  }

  /** Write `control` back once typing pauses for `delay` ms;  each change starts the wait again. */
  private writeAfterPause(control: Element, delay: number) {
    this.delayed.get(control)?.cancel()
    this.delayed.set(
      control,
      E.after(delay / 1000, () => {
        this.delayed.delete(control)
        this.writeBack(control)
      })
    )
  }

  /** Write every bound control back:  after a reset or a clear changed them all. */
  writeAll() {
    for (const control of this.bindings.keys()) this.writeBack(control)
  }

  /**
   * `scope[name] = ` what the control holds now (on every thing, for many), unless that's what it holds already;
   * held instead while the form holds edits.
   * - NEVER throws:  a property that can't be set (a getter alone) warns.
   * - Untracked:  it reads the scope and the property to write them, never to follow them.
   */
  @E.untracked
  private writeBack(control: Element) {
    const binding = this.bindings.get(control)
    if (!binding) return
    const targets = FormBinding.targetsOf(binding.scope())
    if (!targets.length) return
    const current = FormBinding.valueIn(binding.scope(), binding.name)
    const next = FormBinding.valueFor(control, current === MIXED ? undefined : current)
    if (next === UNBOUND || !this.form.canWrite(control)) return
    if (this.form.isHolding()) return this.hold(control, binding, next)
    if (next === current) return
    FormBinding.markMixed(control, false)
    for (const target of targets) FormBinding.write(target, binding.name, next)
    this.form.onWrite?.({ control, name: binding.name, value: next, things: targets })
  }

  /** `target[name] = value`, unless it's that already;  warns if it can't be set. */
  private static write(target: Record<PropertyKey, unknown>, name: string, value: unknown) {
    if (FormBinding.read(target, name) === value) return
    try {
      const { owner, key } = FormBinding.ownerOf(target, name)
      if (owner) owner[key] = value
    } catch (error) {
      E.Warnings.warn("<ui-form value>", `can't set \`${name}\`:`, error)
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
  // ## Held edits (`apply="on save"`)
  ////////////////

  /** Edits held until `save()`, by control:  the control keeps showing its new value meanwhile. */
  private readonly held = new Map<Element, HeldEdit>()

  /** The controls whose edits are held. */
  get heldControls(): Element[] {
    return [...this.held.keys()]
  }

  /** Holds edits now. */
  get hasHeld(): boolean {
    return this.held.size > 0
  }

  /** The held edits, in the order they were made:  one per thing a control writes to. */
  get changes(): UIT.FormChange[] {
    const changes: UIT.FormChange[] = []
    for (const { binding, value } of this.held.values()) {
      for (const target of FormBinding.targetsOf(binding.scope())) changes.push({ name: binding.name, value, target })
    }
    return changes
  }

  /** Hold `control`'s new value;  an edit back to the object's own value is no longer held. */
  private hold(control: Element, binding: Binding, value: unknown) {
    this.held.delete(control)
    if (value !== FormBinding.valueIn(binding.scope(), binding.name)) this.held.set(control, { binding, value })
    this.form.onHeldChange()
  }

  /** Write every held edit, then hold none. */
  @E.untracked
  saveHeld() {
    for (const [control, { binding, value }] of this.held) {
      FormBinding.markMixed(control, false)
      const things = FormBinding.targetsOf(binding.scope())
      for (const target of things) FormBinding.write(target, binding.name, value)
      this.form.onWrite?.({ control, name: binding.name, value, things })
    }
    this.held.clear()
    this.form.onHeldChange()
  }

  /** Drop every held edit:  each control shows the object's value again. */
  @E.untracked
  dropHeld() {
    if (!this.held.size) return
    for (const [control, { binding }] of this.held) {
      const value = FormBinding.valueIn(binding.scope(), binding.name)
      if (value === UNBOUND) continue
      FormBinding.markMixed(control, value === MIXED)
      FormBinding.show(control, value === MIXED ? undefined : value)
    }
    this.held.clear()
    this.form.onHeldChange()
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

  /** The things a scope binds to:  each of a list's (objects only), else the scope itself;  `[]` for none. */
  private static targetsOf(scope: unknown): Record<PropertyKey, unknown>[] {
    if (Array.isArray(scope)) return scope.filter(FormBinding.isObject)
    return FormBinding.isObject(scope) ? [scope] : []
  }

  /**
   * `scope[name]`:  for many things, the value they agree on, else `MIXED`;  `UNBOUND` for nothing to bind to.
   * - Tracked inside a computation:  it reads each thing's property.
   */
  private static valueIn(scope: unknown, name: string): unknown {
    const targets = FormBinding.targetsOf(scope)
    if (!targets.length) return UNBOUND
    const first = FormBinding.read(targets[0]!, name)
    return targets.every((target) => FormBinding.read(target, name) === first) ? first : MIXED
  }

  /**
   * `target`'s property `name`;  a dotted name reaches into nested things (`font.size`).
   * - `undefined` where the path meets nothing.
   */
  static read(target: unknown, name: string): unknown {
    let value = target
    for (const key of name.split(".")) {
      if (!FormBinding.isObject(value)) return undefined
      value = value[key]
    }
    return value
  }

  /** What a dotted `name` writes to:  the thing holding its last key (`undefined` where the path meets nothing), and that key. */
  private static ownerOf(
    target: Record<PropertyKey, unknown>,
    name: string
  ): { owner?: Record<PropertyKey, unknown>; key: string } {
    const keys = name.split(".")
    const key = keys.pop()!
    const owner = keys.length ? FormBinding.read(target, keys.join(".")) : target
    return { owner: FormBinding.isObject(owner) ? owner : undefined, key }
  }

  /**
   * When `control`'s field takes an edit:  its `<ui-field apply>`, read from its text.
   * - `delayed` alone is 300ms;  `delayed 100`, 100ms.  Anything unknown is `immediately`.
   */
  static applyOf(control: Element): FieldApply {
    const text = control.closest(FIELD_SELECTOR)?.getAttribute("apply")?.trim() ?? ""
    if (text === "on leave") return { mode: "on leave" }
    const delayed = /^delayed(?:\s+(\d+)(?:\s*ms)?)?$/.exec(text)
    if (delayed) return { mode: "delayed", delay: delayed[1] ? Number(delayed[1]) : DEFAULT_DELAY }
    return { mode: "immediately" }
  }

  /**
   * Show "mixed" on `control`, or stop:  its `<ui-field>`'s `mixed`, and a "Mixed" placeholder (its own kept).
   * - SIDE EFFECT:  writes the field's `mixed` and the control's `placeholder`.
   */
  private static markMixed(control: Element, isMixed: boolean) {
    const field = control.closest(FIELD_SELECTOR) as (Element & { mixedText?: string }) | null
    if (field && field.hasAttribute("mixed") !== isMixed) field.toggleAttribute("mixed", isMixed)
    const wasMixed = FormBinding.ownPlaceholders.has(control)
    if (isMixed === wasMixed || FormFields.isCheckable(control)) return
    if (isMixed) {
      FormBinding.ownPlaceholders.set(control, control.getAttribute("placeholder"))
      control.setAttribute("placeholder", field?.mixedText ?? MIXED_TEXT)
    } else {
      const own = FormBinding.ownPlaceholders.get(control)
      FormBinding.ownPlaceholders.delete(control)
      if (own == null) control.removeAttribute("placeholder")
      else control.setAttribute("placeholder", own)
    }
  }

  /** A mixed control's own placeholder (`null`:  none), to put back when it's no longer mixed. */
  private static readonly ownPlaceholders = new WeakMap<Element, string | null>()

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
  /** What the form says about writes. */
  form: {
    /** Hold edits instead of writing them (`apply="on save"`). */
    isHolding(): boolean
    /** May `control`'s value be written:  it passes validation. */
    canWrite(control: Element): boolean
    /** The held edits changed:  some, none, or others. */
    onHeldChange(): void
    /** A control's value was written to its things (after a save, for held edits). */
    onWrite?(write: { control: Element; name: string; value: unknown; things: readonly object[] }): void
  }
}

/** One bound control. */
type Binding = {
  /** The property it shows and writes. */
  name: string
  /** Its scope holder's `read`:  the object (or list of things) it binds to. */
  scope: () => unknown
  /** Stop its effect. */
  dispose: () => void
}

/** One held edit:  the control's binding, and the value it will write. */
type HeldEdit = { binding: Binding; value: unknown }

/** "No value to show or write":  no object to bind to, or a radio that isn't chosen. */
const UNBOUND = Symbol("unbound")

/** "The things disagree":  the control shows blank, and mixed. */
const MIXED = Symbol("mixed")

/** A mixed control's placeholder, when its field doesn't say (`<ui-field>`'s `mixed` text). */
const MIXED_TEXT = "Mixed"

/** `apply="delayed"`'s pause, in ms, when it names none. */
const DEFAULT_DELAY = 300

/** Input `type`s whose value is a number:  they write a number (`null` while blank). */
const NUMBER_TYPES = new Set(["number", "range"])
