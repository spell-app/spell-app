import { onCleanup, untrack } from "solid-js"
import { onConnect, onDisconnect, onFormAssociated } from "@spell-app/solid-element"

import { E, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { radioVocabulary } from "./ui-radio.vocabulary.en"
import { CheckControl } from "./CheckControl"
import { RadioGroup } from "./RadioGroup"
import { RADIO, type RadioMember } from "./ui-checkbox.types"

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
  @E.proto static vocabulary = radioVocabulary

  readonly checkable = RADIO

  ////////////////
  // ## The group
  ////////////////

  /**
   * The group it's in, if named and connected;  tracked.
   * - Starts as the group found at construction (joined in the constructor), so the first render is final.
   * - Then written ONLY by `joinGroup()`, together with the membership, so readers never see one without the other.
   * - `ownedWrite`:  `joinGroup()` runs from the fork's hooks, possibly inside a Solid render.
   */
  @E.state({ ownedWrite: true }) accessor group: RadioGroup | undefined = this.findGroup()

  constructor(...args: ConstructorParameters<typeof CheckControl>) {
    super(...args)
    untrack(() => this.group)?.join(this)
    const join = () => this.joinGroup()
    onConnect(join)
    onDisconnect(join)
    onFormAssociated(join)
    // `name` reads fresh here:  the host's record has the new value before its callbacks run
    this.host.addPropertyChangedCallback((key: string) => {
      if (key === NAME) this.joinGroup()
    })
    // disposal (`host.dispose()`):  out of the group, without publishing into a dying root
    onCleanup(() => untrack(() => this.group)?.leave(this))
  }

  /**
   * Join the group its name, connection and form owner call for now (leaving the old one), and publish it.
   * - Called where those change:  construction, connect / disconnect, form association, a `name` write.  NEVER
   *   from an effect on a memo of them (see `RadioGroup`).
   * - Reads the platform synchronously (`isConnected`, `internals.form`), and its own members untracked:  it may run
   *   inside someone else's Solid computation.
   */
  private joinGroup() {
    const next = this.findGroup()
    const current = untrack(() => this.group)
    if (next === current) return
    current?.leave(this)
    next?.join(this)
    this.group = next
  }

  /** The group its name, connection and form owner call for now. */
  private findGroup(): RadioGroup | undefined {
    const { host } = this
    const groupName = untrack(() => this.name)
    if (!groupName || !host.isConnected) return undefined
    return RadioGroup.of(host.internals.form ?? host.getRootNode(), groupName)
  }

  /** This one was chosen:  unchoose the others in its group (no events, as natively). */
  @E.onChange("isSelected", "group")
  protected onGroupChoiceChanged(isSelected: boolean, group: RadioGroup | undefined) {
    if (!isSelected || !group) return
    for (const other of group.others(this)) if (untrack(() => other.isSelected)) other.isSelected = false
  }

  /** Arrow keys move the choice through the group, focus following. */
  protected onKeyDown(event: KeyboardEvent) {
    const delta = NEXT.has(event.key) ? 1 : PREVIOUS.has(event.key) ? -1 : 0
    const group = untrack(() => this.group)
    if (!delta || !group) return
    event.preventDefault()
    // `readonly` never changes the choice, from either end of the move
    if (untrack(() => this.readonly)) return
    const target = group.step(this, delta) as UIRadio | undefined
    if (!target || untrack(() => target.readonly)) return
    target.focus()
    target.choose(true, event)
  }

  /** The group's tab stop is tabbable, the others aren't;  alone, it is. */
  protected get inputTabIndex(): number {
    const group = this.group
    return !group || group.tabStop === this ? 0 : -1
  }

  ////////////////
  // ## Validity
  ////////////////

  /**
   * Group-wide validation:  a choice required by any member.
   * - `@derived`:  runs the validator over the group, and every member's effects read it.
   */
  @E.derived
  override get validation(): E.ValidationResult {
    const group = this.group
    const required = group ? group.isRequired : this.required
    const chosen = group ? group.selectedMember?.chosenValue : this.isSelected ? this.chosenValue : undefined
    return F.FormElement.validator.validate(chosen ?? "", required ? [UIT.REQUIRED_RULE] : [], {
      label: this.validationLabel
    })
  }

  protected get validationLabel(): string | undefined {
    return this.name ?? super.validationLabel
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected get inputType(): typeof RADIO {
    return RADIO
  }

  protected classValue(name: E.AttributeName<typeof radioVocabulary>): unknown {
    if (name === "type") return this.type ?? RADIO
    return super.classValue(name)
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIRadio extends E.AttributeValues<typeof radioVocabulary> {}

/** The `name` prop's key, as the fork's change callback reports it. */
const NAME: E.AttributeName<typeof radioVocabulary> = "name"

/** Keys that move to the next radio. */
const NEXT = new Set<string>([UIT.Key.arrowDown, UIT.Key.arrowRight])

/** Keys that move to the previous radio. */
const PREVIOUS = new Set<string>([UIT.Key.arrowUp, UIT.Key.arrowLeft])
