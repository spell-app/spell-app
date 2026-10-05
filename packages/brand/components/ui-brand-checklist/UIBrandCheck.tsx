import { Show, createEffect, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { HostAttribute, PartContext, proto, UIElement, type UIHost, UIT } from "$/ui/core"

import { brandCheckVocabulary } from "./ui-brand-check.vocabulary.en"
import { BrandChecklistFallback } from "./ui-brand-checklist.fallback"
import { BrandCheckHost } from "./BrandCheckHost"
import {
  ACTIVE,
  CHECK_NOUN,
  CHECK_PATH,
  CHECK_VIEW_BOX,
  CHECKABLE,
  CHECKBOX,
  CHECKED,
  DONE,
  PENDING,
  SERIF,
  STEP,
  type BrandCheckChangeDetail,
  type BrandCheckVocabulary,
  type CheckFont,
  type CheckState,
  type ChecklistOwner
} from "./ui-brand-checklist.types"

import checkCSS from "./ui-brand-check.css?inline"

/****************
 * ### `<ui-brand-check>`
 * One line of a checklist, the brand's round to-do mark:  `<div class="check <state>" part="check">` (a
 * `<button role="checkbox">` when `checkable`) holding the mark (`part="marker"`:  a check once done) and the
 * slotted text (`part="label"`).
 * - Progress (the build card):  `state` -- `done` (filled accent, a white check), `active` (soft accent, pulsing,
 *   `aria-current="step"`), `pending` (an empty ring, subtle text).  Done and active steps carry a visually hidden
 *   "done" / "in progress" after their text:  the mark alone says nothing to a screen reader.
 * - Ticking (the phone's habits):  `checkable` makes the line a checkbox (click, Space, Enter);  done ~== `selected`,
 *   the text then subtle and struck through.  A tick dispatches `ui-change` first, then sets `selected` (reflected),
 *   unless a handler re-set it.  `checked` is `selected`'s alias (`BrandCheckHost`;  the attribute ticks it).
 * - Owned (`PartContext`, `:state(in-checklist)`):  the `<ui-brand-checklist>` around it decides its state from its
 *   `step`, and makes it `checkable`;  the host is then a `listitem` (internals).  Alone, its own attributes decide.
 * - Text:  `font` (sans 14px / serif 15px), else the checklist's (`checkState()`), as the class word `serif`;  sizes
 *   from `--ui-brand-checklist-*` tokens.
 * - The mark sits beside the text's middle;  `--ui-brand-checklist-align: start` puts it beside the FIRST line (a
 *   title over a description line).
 * - Motion:  the pulse runs only with `prefers-reduced-motion: no-preference` (`ui-brand-check.css`).
 ****************/
export class UIBrandCheck extends UIElement<BrandCheckVocabulary> {
  @proto static vocabulary = brandCheckVocabulary
  @proto static styles = { brandCheck: checkCSS }
  @proto static Host = BrandCheckHost
  @proto static Fallback = BrandChecklistFallback

  ////////////////
  // ## State
  ////////////////

  /** `selected`:  the host's property (a boolean is always controlled, see `Controlled`). */
  readonly selectedState = this.controlled("selected", false)

  /** Host `checked` attribute, the alias. */
  readonly checkedAttribute = new HostAttribute(this.host, CHECKED)

  /** Owning checklist. */
  readonly context = new PartContext(this.host, CHECK_NOUN)

  ////////////////
  // ## Derived state
  ////////////////

  /** The owning checklist's controller, if it answers `checkState()`. */
  readonly owner = createMemo((): ChecklistOwner | undefined => {
    const controller = (this.context.owner.get()?.owner as UIHost | undefined)?.controller as
      | Partial<ChecklistOwner>
      | undefined
    return controller?.checkState ? (controller as ChecklistOwner) : undefined
  })

  /** The owner's say, or `undefined` alone. */
  readonly ownerState = createMemo(() => this.owner()?.checkState(this.host))

  /** Text face:  its own `font`, else its list's, else `sans`. */
  readonly font = createMemo((): CheckFont | undefined => this.attrs.font ?? this.ownerState()?.font)

  /** A checkbox the user ticks:  its own `checkable`, or its list's. */
  readonly isCheckable = createMemo(() => !!this.attrs.checkable || !!this.ownerState()?.checkable)

  /**
   * How it shows:
   * - `checkable`:  done while `selected`, else pending
   * - else the list's `step`;  else done while `selected`;  else its own `state`
   */
  readonly state = createMemo((): CheckState => {
    const selected = !!this.selectedState.get()
    if (this.isCheckable()) return selected ? DONE : PENDING
    const owned = this.ownerState()?.state
    if (owned) return owned
    if (selected) return DONE
    return this.attrs.state ?? PENDING
  })

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    // a `checked` attribute in markup ticks it, as a native checkbox's does
    if (this.host.hasAttribute(CHECKED) && !untrack(() => this.attrs.selected)) {
      queueMicrotask(() => this.selectedState.set(true))
    }
    // SIDE EFFECT:  owned, the host is one item of the list;  the active step is the current one
    this.hostEffect(
      () => ({ owned: !!this.owner(), active: this.state() === ACTIVE && !this.isCheckable() }),
      ({ owned, active }) => {
        this.host.internals.role = owned ? UIT.LISTITEM : null
        this.host.internals.ariaCurrent = active ? STEP : null
      }
    )
  }

  ////////////////
  // ## Element hooks
  ////////////////

  /** The state word, `checkable` and `serif`:  `check done checkable serif`. */
  protected extraClasses(): string | undefined {
    return [this.state(), this.isCheckable() ? CHECKABLE : "", this.font() === SERIF ? SERIF : ""]
      .filter(Boolean)
      .join(" ")
  }

  protected hostStates() {
    const state = this.state()
    return {
      done: state === DONE,
      active: state === ACTIVE,
      pending: state === PENDING,
      checkable: this.isCheckable()
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Adds the `checked` attribute alias:  setting or removing it later ticks or unticks. */
  mount(): JSX.Element {
    createEffect(
      () => this.checkedAttribute.get(),
      (checked) => {
        this.selectedState.set(checked !== null)
      },
      { defer: true }
    )
    return super.mount()
  }

  render(): JSX.Element {
    return (
      <Show when={this.isCheckable()} fallback={this.renderLine()}>
        {this.renderCheckbox()}
      </Show>
    )
  }

  /** A progress line:  the mark, the text and, done or active, what the mark means. */
  private renderLine(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("check")}>
        {this.renderMarker()}
        <span class="label" part={this.part("label")}>
          <slot />
        </span>
        <Show when={this.state() !== PENDING}>
          <span class={UIT.VISUALLY_HIDDEN}> {this.text(this.state() === DONE ? "done" : "active")}</span>
        </Show>
      </div>
    )
  }

  /** A line the user ticks:  a `<button role="checkbox">`, so Space and Enter both tick it. */
  private renderCheckbox(): JSX.Element {
    return (
      <button
        type="button"
        role={CHECKBOX}
        class={this.classes()}
        part={this.part("check")}
        aria-checked={this.state() === DONE ? UIT.TRUE : UIT.FALSE}
        onClick={this.onToggle}
      >
        {this.renderMarker()}
        <span class="label" part={this.part("label")}>
          <slot />
        </span>
      </button>
    )
  }

  /** The round mark:  a check, shown once done (`ui-brand-check.css`). */
  private renderMarker(): JSX.Element {
    return (
      <span class="marker" part={this.part("marker")} aria-hidden={UIT.TRUE}>
        <svg viewBox={CHECK_VIEW_BOX}>
          <path d={CHECK_PATH} />
        </svg>
      </span>
    )
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** A click (or Space / Enter on the button):  `ui-change`, then `selected`, unless a handler re-set it. */
  private readonly onToggle = (event: MouseEvent) => {
    const selected = !untrack(this.selectedState.get)
    const detail: BrandCheckChangeDetail = { selected, checked: selected, originalEvent: event }
    this.selectedState.request(selected, () => this.emit("ui-change", detail))
  }
}
