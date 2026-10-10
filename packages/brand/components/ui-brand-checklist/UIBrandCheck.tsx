import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"

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
export class DOMBrandCheckElement extends E.DOMElement<UIBrandCheck> {
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
 *   - A tick sends `ui-change` first, then sets `selected` (reflected), unless a handler set it first.
 *   - `checked` is another name for `selected` (`DOMBrandCheckElement`;  the attribute ticks it).
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
export class UIBrandCheck extends E.UIComponent<BrandCheckVocabulary> {
  @E.proto static vocabulary = brandCheckVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { brandCheck: checkCSS },
    DOMElement: DOMBrandCheckElement
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Ticked
  ////////////////

  /** Ticked:  the DOM element's `selected` property (a boolean is always the DOM element's);  a write goes to it. */
  @E.controlled("selected") accessor isSelected = false

  /** The DOM element's `checked` attribute, another name for `selected`. */
  get checkedAttribute(): string | undefined {
    return this.attributes["checked"] ?? undefined
  }

  /** `onCheckedChanged()` has seen the `checked` attribute once:  only the first look is markup's. */
  private hasSeenChecked = false

  /**
   * The `checked` attribute:  in markup it ticks the check, as a native checkbox's does;
   * set or removed later, it ticks or unticks it.
   */
  @E.onChange("checkedAttribute")
  protected onCheckedChanged(checked: string | undefined) {
    const isFirst = !this.hasSeenChecked
    this.hasSeenChecked = true
    // at the start, only `checked` in markup counts:  without it, `selected` stands as the page set it
    if (isFirst && (checked === undefined || this.isSelected)) return
    this.isSelected = checked !== undefined
  }

  /**
   * A click (or Space / Enter on the button):  send `ui-change`, then set `selected`, unless a handler set it first.
   */
  @E.untracked
  private readonly onToggle = (event: MouseEvent) => {
    const selected = !this.isSelected
    const detail: BrandCheckChangeDetail = { selected, checked: selected, originalEvent: event }
    this.requestChange("isSelected", selected, () => this.send("ui-change", detail))
  }

  ////////////////
  // ## The checklist
  ////////////////

  /** The checklist that owns it. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: CHECK_NOUN })

  /** The owning checklist's component, if it answers `checkState()`. */
  get owner(): ChecklistOwner | undefined {
    const owner = this.context.ownerComponent<Partial<ChecklistOwner>>()
    return owner?.checkState ? (owner as ChecklistOwner) : undefined
  }

  /** The owner's say, or `undefined` alone. */
  get ownerState() {
    return this.owner?.checkState(this.domElement)
  }

  /** Owned, the DOM element is one item of the list. */
  @E.aria("role")
  protected get ariaRole(): string | undefined {
    return this.owner ? "listitem" : undefined
  }

  ////////////////
  // ## How it shows
  ////////////////

  /** The text face:  its own `font`, else its list's, else `sans`. */
  get shownFont(): CheckFont | undefined {
    return this.font ?? this.ownerState?.font
  }

  /** A checkbox the user ticks:  its own `checkable`, or its list's. */
  get isCheckable(): boolean {
    return !!this.checkable || !!this.ownerState?.checkable
  }

  /**
   * How it shows:
   * - `checkable`:  done while `selected`, else pending
   * - else the list's `step`;  else done while `selected`;  else its own `state`
   */
  get shownState(): CheckState {
    const selected = this.isSelected
    if (this.isCheckable) return selected ? DONE : PENDING
    const owned = this.ownerState?.state
    if (owned) return owned
    if (selected) return DONE
    return this.state ?? PENDING
  }

  /** The active step is the current one. */
  @E.aria("ariaCurrent")
  protected get currentText(): string | undefined {
    return this.shownState === ACTIVE && !this.isCheckable ? "step" : undefined
  }

  /** The state word, `checkable` and `serif`:  `check done checkable serif`. */
  protected get extraClass(): string | undefined {
    return [this.shownState, this.isCheckable ? CHECKABLE : "", this.shownFont === SERIF ? SERIF : ""]
      .filter(Boolean)
      .join(" ")
  }

  protected cssStates() {
    const state = this.shownState
    return {
      done: state === DONE,
      active: state === ACTIVE,
      pending: state === PENDING,
      checkable: this.isCheckable
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <Show when={this.isCheckable} fallback={this.line()}>
        {this.checkbox()}
      </Show>
    )
  }

  /** A progress line:  the mark, the text and, done or active, what the mark means. */
  private line(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("check")}>
        {this.marker()}
        <span class="label" part={this.partForName("label")}>
          <slot />
        </span>
        <Show when={this.shownState !== PENDING}>
          <span class={UIT.VISUALLY_HIDDEN}>
            {" "}
            {this.translationForKey(this.shownState === DONE ? "done" : "active")}
          </span>
        </Show>
      </div>
    )
  }

  /** A line the user ticks:  a `<button role="checkbox">`, so Space and Enter both tick it. */
  private checkbox(): JSX.Element {
    return (
      <button
        type="button"
        role="checkbox"
        class={this.rootClass}
        part={this.partForName("check")}
        aria-checked={this.shownState === DONE ? "true" : "false"}
        onClick={this.onToggle}
      >
        {this.marker()}
        <span class="label" part={this.partForName("label")}>
          <slot />
        </span>
      </button>
    )
  }

  /** The round mark:  a check, shown once done (`UIBrandCheck.css`). */
  private marker(): JSX.Element {
    return (
      <span class="marker" part={this.partForName("marker")} aria-hidden="true">
        <svg viewBox={CHECK_VIEW_BOX}>
          <path d={CHECK_PATH} />
        </svg>
      </span>
    )
  }
}

export interface UIBrandCheck extends E.AttributeValues<BrandCheckVocabulary> {}

/** The class word of a check the user ticks. */
const CHECKABLE = "checkable"

/** The class word of a serif check (`UIBrandCheck.css` switches its defaults on it). */
const SERIF: CheckFont = "serif"

/** The check mark's path, in a 16 x 16 box. */
const CHECK_PATH = "M3.75 8.5 6.6 11.25 12.25 5"

/** The check mark's `viewBox`. */
const CHECK_VIEW_BOX = "0 0 16 16"
