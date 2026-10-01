import { createEffect, createMemo, onCleanup, untrack, type Accessor } from "solid-js"
import { onConnect, onDisconnect, onFormAssociated } from "@spell-app/solid-element"

import { Cell, proto, REQUIRED_RULE, type AttributeName, type ValidationResult } from "$/ui/core"
import { FormElement } from "$/ui/forms"

import { radioVocabulary } from "./ui-radio.vocabulary.en"
import { CheckControl } from "./CheckControl"
import { RadioGroup } from "./RadioGroup"
import { NAME, NEXT, PREVIOUS, RADIO, RadioMember } from "./ui-checkbox.types"

/****************
 * ### `<ui-radio>`
 * One radio button:  `<div class="ui radio checkbox" part="checkbox">` (`slider` / `toggle` looks too) around a native
 * `<input type="radio" part="control">` and its `<label part="label">` (see `CheckControl`).
 * - Grouped by `name` within its form owner, else its root node (`RadioGroup`):  choosing one unchooses the rest
 *   (without events, as natively);  only the group's tab stop is tabbable -- the chosen one, else the first
 *   enabled;  Arrow Down / Right choose the next enabled one and Arrow Up / Left the previous, wrapping.
 * - Only the newly chosen radio dispatches `ui-change`;  the form gets the chosen one's `name=value`.
 * - `required` on any member requires a choice in the group:  every member reports `valueMissing`.
 ****************/
export class UIRadio extends CheckControl<typeof radioVocabulary> implements RadioMember {
  @proto static vocabulary = radioVocabulary

  readonly checkable = RADIO

  /** `name`, as last written:  the prop signal lags a microtask behind a write. */
  private groupName: string | undefined = untrack(() => this.attrs.name) ?? undefined

  /** The group it's a member of right now;  `group` publishes it (a microtask late). */
  private joined: RadioGroup | undefined = this.findGroup()

  /**
   * The group it's in, if named and connected;  tracked.
   * - Starts as the group found at construction (joined in the constructor), so the first render is final.
   * - Then written ONLY by `joinGroup()`, together with the membership, so readers never see one without the other.
   * - `ownedWrite`:  `joinGroup()` runs from the fork's hooks, possibly inside a Solid render.
   */
  readonly group = new Cell<RadioGroup | undefined>(this.joined, { ownedWrite: true })

  /** Group-wide validation:  a choice required by any member. */
  override readonly validation: Accessor<ValidationResult> = createMemo(
    () => {
      const group = this.group.get()
      const required = group ? group.isRequired() : this.attrs.required
      const chosen = group ? group.selected()?.choiceValue() : this.isSelected() ? this.choiceValue() : undefined
      return FormElement.validator.validate(chosen ?? "", required ? [REQUIRED_RULE] : [], {
        label: this.validationLabel()
      })
    },
    { lazy: true }
  )

  constructor(...args: ConstructorParameters<typeof CheckControl>) {
    super(...args)
    this.joined?.join(this)
    const join = () => this.joinGroup()
    onConnect(join)
    onDisconnect(join)
    onFormAssociated(join)
    this.host.addPropertyChangedCallback((key: string, value: unknown) => {
      if (key !== NAME) return
      this.groupName = (value as string | null | undefined) ?? undefined
      this.joinGroup()
    })
    // disposal (`host.dispose()`):  out of the group, without publishing into a dying root
    onCleanup(() => this.joined?.leave(this))
  }

  isRequired(): boolean {
    return this.attrs.required
  }

  protected inputType() {
    return RADIO as typeof RADIO
  }

  protected classValue(name: AttributeName<typeof radioVocabulary>): unknown {
    if (name === "type") return this.attrs.type ?? RADIO
    return super.classValue(name)
  }

  protected tabIndex(): number {
    const group = this.group.get()
    return !group || group.tabbable() === this ? 0 : -1
  }

  protected validationLabel(): string | undefined {
    return this.attrs.name ?? super.validationLabel()
  }

  /**
   * Join the group its name, connection and form owner call for now (leaving the old one), and publish it.
   * - Called where those change:  construction, connect / disconnect, form association, a `name` write.  NEVER
   *   from an effect on a memo of them (see `RadioGroup`).
   * - Reads the platform synchronously (`isConnected`, `internals.form`):  signals would be a microtask late.
   */
  private joinGroup() {
    const next = this.findGroup()
    if (next === this.joined) return
    this.joined?.leave(this)
    next?.join(this)
    this.joined = next
    this.group.set(next)
  }

  /** The group its name, connection and form owner call for now. */
  private findGroup(): RadioGroup | undefined {
    const { host, groupName } = this
    if (!groupName || !host.isConnected) return undefined
    return RadioGroup.of(host.internals.form ?? host.getRootNode(), groupName)
  }

  /** Adds unchoosing the others when this one is chosen. */
  mount() {
    createEffect(
      () => (this.isSelected() ? this.group.get() : undefined),
      (group) => {
        for (const other of group?.others(this) ?? []) if (untrack(() => other.isSelected())) other.setSelected(false)
      }
    )
    return super.mount()
  }

  /** Arrow keys move the choice through the group, focus following. */
  protected keyDown(event: KeyboardEvent) {
    const delta = NEXT.has(event.key) ? 1 : PREVIOUS.has(event.key) ? -1 : 0
    const group = untrack(() => this.group.get())
    if (!delta || !group) return
    event.preventDefault()
    // `readonly` never changes the choice, from either end of the move
    if (untrack(() => this.common.readonly)) return
    const target = group.step(this, delta) as UIRadio | undefined
    if (!target || untrack(() => target.common.readonly)) return
    target.focus()
    target.choose(true, event)
  }
}
