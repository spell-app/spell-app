import { Show, createEffect, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { DOMElement, PartContext, proto, protoMerged, UIComponent, UIT, type ElementSetup, type AttributeValues } from "$/ui/core"

import { brandCheckVocabulary } from "./UIBrandCheck.en"
import {
  ACTIVE,
  CHECK_NOUN,
  DONE,
  PENDING,
  type BrandCheckChangeDetail,
  type BrandCheckVocabulary,
  type CheckFont,
  type CheckState,
  type ChecklistOwner
} from "./UIBrandChecklist.types"

import checkCSS from "./UIBrandCheck.css?inline"

/****************
 * ### `DOMBrandCheckElement`
 * The DOM element of `<ui-brand-check>`:  it adds `checked` as another name for `selected`,
 * as Spell UI's `DOMCheckElement` does for `<ui-checkbox>` (`selected` is canonical, `checked` accepted on checkboxes).
 *
 * - `checked` is a property here, not a vocabulary attribute:  `el.checked = true` sets `el.selected` (which reflects).
 *   The `checked` ATTRIBUTE in markup is read by the component, as a native checkbox reads its own.
 * - `DOMElement` refuses a member named like an attribute's property:  `checked` is no prop.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMBrandCheckElement extends DOMElement {
  /** Another name for `selected`. */
  get checked(): boolean {
    return !!(this as unknown as { selected?: boolean }).selected
  }

  set checked(value: boolean) {
    ;(this as unknown as { selected?: boolean }).selected = value
  }
}

/****************
 * ### `UIBrandCheck`
 * The component behind `<ui-brand-check>`:  one line of a checklist, with the brand's round to-do mark.
 *
 * - Its shadow DOM:  `<div class="check <state>" part="check">` (a `<button role="checkbox">` when `checkable`)
 *   holding the mark (`part="marker"`:  a check once done) and the slotted text (`part="label"`).
 *
 * - Progress (the build card):  `state` is `done` (filled accent, a white check),
 *   `active` (soft accent, pulsing, `aria-current="step"`) or `pending` (an empty ring, subtle text).
 *   Done and active steps carry a visually hidden "done" / "in progress" after their text:
 *   the mark alone says nothing to a screen reader.
 *
 * - Ticking (the phone's habits):  `checkable` makes the line a checkbox (click, Space, Enter);
 *   done ~== `selected`, the text then subtle and struck through.
 *   A tick sends `ui-change` first, then sets `selected` (reflected), unless a handler set it first.
 *   `checked` is another name for `selected` (`DOMBrandCheckElement`;  the attribute ticks it).
 *
 * - Owned (`PartContext`, `:state(in-checklist)`):  the `<ui-brand-checklist>` around it decides its state
 *   from its `step`, and makes it `checkable`;  the DOM element is then a `listitem` (internals).
 *   Alone, its own attributes decide.
 * - Text:  `font` (sans 14px / serif 15px), else the checklist's (`checkState()`), as the class word `serif`;
 *   sizes from the `--ui-brand-checklist-*` tokens.
 * - The mark sits beside the text's middle;  `--ui-brand-checklist-align: start` puts it beside the FIRST line
 *   (a title over a description line).
 * - Motion:  the pulse runs only with `prefers-reduced-motion: no-preference` (`UIBrandCheck.css`).
 ****************/
export class UIBrandCheck extends UIComponent<BrandCheckVocabulary> {
  @proto static vocabulary = brandCheckVocabulary
  @protoMerged static elementSetup = {
    styleSheets: { brandCheck: checkCSS },
    DOMElement: DOMBrandCheckElement
  } satisfies Partial<ElementSetup>

  ////////////////
  // ## State
  ////////////////

  /** `selected`:  the DOM element's property (a boolean is always controlled, see `Controlled`). */
  readonly selectedState = this.controlled("selected", false)

  /** The DOM element's `checked` attribute, another name for `selected`. */
  get checkedAttribute(): string | undefined {
    return this.attributes["checked"] ?? undefined
  }

  /** The checklist that owns it. */
  readonly context = new PartContext({ domElement: this.domElement, noun: CHECK_NOUN })

  ////////////////
  // ## Derived state
  ////////////////

  /** The owning checklist's component, if it answers `checkState()`. */
  readonly owner = createMemo((): ChecklistOwner | undefined => {
    const owner = this.context.ownerComponent<Partial<ChecklistOwner>>()
    return owner?.checkState ? (owner as ChecklistOwner) : undefined
  })

  /** The owner's say, or `undefined` alone. */
  readonly ownerState = createMemo(() => this.owner()?.checkState(this.domElement))

  /** The text face:  its own `font`, else its list's, else `sans`. */
  readonly shownFont = createMemo((): CheckFont | undefined => this.font ?? this.ownerState()?.font)

  /** A checkbox the user ticks:  its own `checkable`, or its list's. */
  readonly isCheckable = createMemo(() => !!this.checkable || !!this.ownerState()?.checkable)

  /**
   * How it shows:
   * - `checkable`:  done while `selected`, else pending
   * - else the list's `step`;  else done while `selected`;  else its own `state`
   */
  readonly shownState = createMemo((): CheckState => {
    const selected = !!this.selectedState.get()
    if (this.isCheckable()) return selected ? DONE : PENDING
    const owned = this.ownerState()?.state
    if (owned) return owned
    if (selected) return DONE
    return this.state ?? PENDING
  })

  constructor(...args: ConstructorParameters<typeof UIComponent>) {
    super(...args)
    // a `checked` attribute in markup ticks it, as a native checkbox's does
    if (this.domElement.hasAttribute("checked") && !untrack(() => this.selected)) {
      queueMicrotask(() => this.selectedState.set(true))
    }
    // SIDE EFFECT:  owned, the DOM element is one item of the list;  the active step is the current one
    this.addElementEffect(
      () => ({ owned: !!this.owner(), active: this.shownState() === ACTIVE && !this.isCheckable() }),
      ({ owned, active }) => {
        this.domElement.internals.role = owned ? "listitem" : null
        this.domElement.internals.ariaCurrent = active ? "step" : null
      }
    )
  }

  ////////////////
  // ## Classes and states
  ////////////////

  /** The state word, `checkable` and `serif`:  `check done checkable serif`. */
  protected get extraClass(): string | undefined {
    return [this.shownState(), this.isCheckable() ? CHECKABLE : "", this.shownFont() === SERIF ? SERIF : ""]
      .filter(Boolean)
      .join(" ")
  }

  protected cssStates() {
    const state = this.shownState()
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

  /** Adds the `checked` attribute:  setting or removing it later ticks or unticks. */
  onMount(): JSX.Element {
    createEffect(
      () => this.checkedAttribute,
      (checked) => {
        this.selectedState.set(checked !== undefined)
      },
      { defer: true }
    )
    return super.onMount()
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
      <div class={this.rootClass} part={this.partForName("check")}>
        {this.renderMarker()}
        <span class="label" part={this.partForName("label")}>
          <slot />
        </span>
        <Show when={this.shownState() !== PENDING}>
          <span class={UIT.VISUALLY_HIDDEN}>
            {" "}
            {this.translationForKey(this.shownState() === DONE ? "done" : "active")}
          </span>
        </Show>
      </div>
    )
  }

  /** A line the user ticks:  a `<button role="checkbox">`, so Space and Enter both tick it. */
  private renderCheckbox(): JSX.Element {
    return (
      <button
        type="button"
        role="checkbox"
        class={this.rootClass}
        part={this.partForName("check")}
        aria-checked={this.shownState() === DONE ? "true" : "false"}
        onClick={this.onToggle}
      >
        {this.renderMarker()}
        <span class="label" part={this.partForName("label")}>
          <slot />
        </span>
      </button>
    )
  }

  /** The round mark:  a check, shown once done (`UIBrandCheck.css`). */
  private renderMarker(): JSX.Element {
    return (
      <span class="marker" part={this.partForName("marker")} aria-hidden="true">
        <svg viewBox={CHECK_VIEW_BOX}>
          <path d={CHECK_PATH} />
        </svg>
      </span>
    )
  }

  ////////////////
  // ## Handlers
  ////////////////

  /**
   * A click (or Space / Enter on the button):  send `ui-change`, then set `selected`, unless a handler set it first.
   */
  private readonly onToggle = (event: MouseEvent) => {
    const selected = !untrack(this.selectedState.get)
    const detail: BrandCheckChangeDetail = { selected, checked: selected, originalEvent: event }
    this.selectedState.request(selected, () => this.send("ui-change", detail))
  }
}

export interface UIBrandCheck extends AttributeValues<BrandCheckVocabulary> {}

/** The class word of a check the user ticks. */
const CHECKABLE = "checkable"

/** The class word of a serif check (`UIBrandCheck.css` switches its defaults on it). */
const SERIF: CheckFont = "serif"

/** The check mark's path, in a 16 x 16 box. */
const CHECK_PATH = "M3.75 8.5 6.6 11.25 12.25 5"

/** The check mark's `viewBox`. */
const CHECK_VIEW_BOX = "0 0 16 16"
