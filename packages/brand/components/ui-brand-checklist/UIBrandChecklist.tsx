import { createEffect, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { Cell, proto, UIComponent, type DOMElement, UIT, type ElementSetup } from "$/ui/core"

import { brandChecklistVocabulary } from "./UIBrandChecklist.en"
import {
  ACTIVE,
  CHECK_NOUN,
  DONE,
  PENDING,
  type BrandChecklistVocabulary,
  type ChecklistCheckState,
  type ChecklistOwner
} from "./UIBrandChecklist.types"

import checklistCSS from "./UIBrandChecklist.css?inline"

/****************
 * ### `UIBrandChecklist`
 * The component behind `<ui-brand-checklist>`:  a list of `<ui-brand-check>`s, its light-DOM children.
 *
 * - Its shadow DOM:  `<div class="checklist" part="list" role="list"><slot>`,
 *   then a visually hidden live region (`part="status"`).
 * - `step` (progress, the build card):  checks before index `step` are done, the one at `step` active,
 *   the rest pending;  at or past the end, all done.  Each check asks `checkState()` (it finds this list through
 *   `PartContext`:  `ownsParts:  check`), so a page moves the whole list with one attribute.
 * - Announces progress politely:  "<text> done" as `step` moves past a check, "All done" at the end.
 *   Never on first render, nor when `step` goes back.
 * - `checkable` (the phone's habits):  every check is a checkbox;  their `ui-change`s bubble through the list.
 * - `font` (`sans` / `serif`):  each check without its own asks it through `checkState()` and draws the face's
 *   defaults (`check serif`);  the `--ui-brand-checklist-*` tokens set on the list reach the checks by inheritance.
 * - The DOM element's `aria-label` names the list.
 ****************/
export class UIBrandChecklist extends UIComponent<BrandChecklistVocabulary> implements ChecklistOwner {
  @proto static vocabulary = brandChecklistVocabulary
  @proto static styleSheets = { brandChecklist: checklistCSS }
  // the checks are the focus targets
  @proto static elementSetup = { delegatesFocus: false } satisfies Partial<ElementSetup>

  ////////////////
  // ## State
  ////////////////

  /** The checks' DOM elements among the children (upgraded or not);  notifies on every read of the children. */
  readonly checks = new Cell<readonly DOMElement[]>(this.readChecks(), { equals: false })

  /** What the live region says now. */
  readonly announcement = new Cell("")

  /** The DOM element's `aria-label`, passed on to the list. */
  get ariaLabel(): string | undefined {
    return this.attributes["aria-label"] ?? undefined
  }

  /** A check re-read is queued. */
  private refreshQueued = false

  ////////////////
  // ## Derived state
  ////////////////

  /** `step` as a whole number, or `undefined`. */
  readonly step = createMemo(() => {
    const step = this.attrs.step
    return step === undefined ? undefined : Math.max(0, Math.floor(step))
  })

  ////////////////
  // ## ChecklistOwner
  ////////////////

  /**
   * `ChecklistOwner`:  how `check` shows.  Tracked.
   * - SIDE EFFECT:  a check not among the children read so far (it upgraded later) queues a re-read.
   */
  checkState(check: Element): ChecklistCheckState {
    const index = this.checks.get().indexOf(check as DOMElement)
    if (index < 0) this.queueRefresh()
    const step = this.step()
    const checkable = !!this.attrs.checkable
    const font = this.attrs.font
    if (step === undefined || index < 0 || checkable) return { state: undefined, checkable, font }
    return { state: index < step ? DONE : index === step ? ACTIVE : PENDING, checkable, font }
  }

  ////////////////
  // ## Rendering
  ////////////////

  onMount(): JSX.Element {
    this.effects()
    return super.onMount()
  }

  render(): JSX.Element {
    return (
      <>
        <div class={this.rootClasses} part={this.partForName("list")} role="list" aria-label={this.ariaLabel}>
          <slot onSlotChange={() => this.refreshChecks()} />
        </div>
        <span class={UIT.VISUALLY_HIDDEN} part={this.partForName("status")} role="status">
          {this.announcement.get()}
        </span>
      </>
    )
  }

  /**
   * The announcement:  as `step` moves forward, what was just finished.
   * - Created in `onMount()`:  it reads every field.
   * - The APPLY writes the live region's text (a signal write is allowed there).
   */
  private effects() {
    let before: number | undefined = untrack(this.step)
    createEffect(
      () => (this.attrs.checkable ? undefined : this.step()),
      (step) => {
        const previous = before
        before = step
        if (step === undefined || previous === undefined || step <= previous) return
        this.announcement.set(this.announce(step))
      },
      { defer: true }
    )
  }

  /** What to say on reaching `step`:  "All done" at the end, else "<text> done" for the check before it. */
  private announce(step: number): string {
    const checks = untrack(this.checks.get)
    if (step >= checks.length) return this.translationForKey("allDone")
    const label = checks[step - 1]?.textContent?.trim() ?? ""
    return label ? this.translationForKey("stepDone", { label }) : ""
  }

  ////////////////
  // ## Checks
  ////////////////

  /** Read the checks again (a slot change, or a check that upgraded late). */
  private refreshChecks() {
    this.checks.set(this.readChecks())
  }

  /** Queue `refreshChecks()` once:  it writes a signal, so never from the tracked scope that asked. */
  private queueRefresh() {
    if (this.refreshQueued) return
    this.refreshQueued = true
    queueMicrotask(() => {
      this.refreshQueued = false
      this.refreshChecks()
    })
  }

  /** The check children, in order, upgraded or not. */
  private readChecks(): DOMElement[] {
    return [...this.domElement.children].filter(UIBrandChecklist.isCheck) as DOMElement[]
  }

  /** A check child:  an element DEFINED with the check's noun (`<ui-brand-check>`, or its translated tag). */
  private static isCheck(this: void, element: Element): boolean {
    return UIComponent.definitions.get(element.localName)?.vocabulary.noun === CHECK_NOUN
  }
}
