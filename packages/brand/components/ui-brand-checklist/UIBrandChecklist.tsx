import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"

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
 * - Its shadow DOM, a `<div class="checklist" part="list" role="list"><slot>`
 *   then a visually hidden live region (`part="status"`).
 * - `step` (progress, the build card):
 *   checks before index `step` are done, the one at `step` active, the rest pending;  at or past the end, all done.
 *   - Each check asks `checkState()` (it finds this list through `PartContext`:  `ownsParts:  check`),
 *     so a page moves the whole list with one attribute.
 * - Announces progress politely:  "<text> done" as `step` moves past a check, "All done" at the end.
 *   Never on first render, nor when `step` goes back.
 * - `checkable` (the phone's habits):  every check is a checkbox;  their `ui-change`s bubble through the list.
 * - `font` (`sans` / `serif`):
 *   each check without its own asks it through `checkState()` and draws the face's defaults (`check serif`).
 *   The `--ui-brand-checklist-*` tokens set on the list reach the checks by inheritance.
 * - The DOM element's `aria-label` names the list.
 ****************/
export class UIBrandChecklist extends E.UIComponent<BrandChecklistVocabulary> implements ChecklistOwner {
  @E.proto static vocabulary = brandChecklistVocabulary
  // the checks are the focus targets
  @E.protoMerged static elementSetup = {
    styleSheets: { brandChecklist: checklistCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The checks
  ////////////////

  /** The checks' DOM elements among the children (upgraded or not);  notifies on every write. */
  @E.state({ equals: false }) accessor checks: readonly E.DOMElement[] = this.readChecks()

  /** A check re-read is queued. */
  private refreshQueued = false

  /**
   * `ChecklistOwner`:  how `check` shows.  Tracked.
   * - SIDE EFFECT:  a check not among the children read so far (it upgraded later) queues a re-read.
   */
  checkState(check: Element): ChecklistCheckState {
    const index = this.checks.indexOf(check as E.DOMElement)
    if (index < 0) this.queueRefresh()
    const step = this.currentStep
    const checkable = !!this.checkable
    const font = this.font
    if (step === undefined || index < 0 || checkable) return { state: undefined, checkable, font }
    return { state: index < step ? DONE : index === step ? ACTIVE : PENDING, checkable, font }
  }

  /** Read the checks again (a slot change, or a check that upgraded late). */
  private refreshChecks() {
    this.checks = this.readChecks()
  }

  /**
   * Queue `refreshChecks()` once:  it writes `checks`, so never from the tracked scope that asked
   * (a check's `checkState()` call, which reads `checks`).
   */
  private queueRefresh() {
    if (this.refreshQueued) return
    this.refreshQueued = true
    E.afterSolidUpdate(() => {
      this.refreshQueued = false
      this.refreshChecks()
    })
  }

  /** The check children, in order, upgraded or not. */
  private readChecks(): E.DOMElement[] {
    return [...this.domElement.children].filter(UIBrandChecklist.isCheck) as E.DOMElement[]
  }

  /** A check child:  an element DEFINED with the check's noun (`<ui-brand-check>`, or its translated tag). */
  private static isCheck(this: void, element: Element): boolean {
    return E.UIComponent.registry.definitions.get(element.localName)?.vocabulary.noun === CHECK_NOUN
  }

  ////////////////
  // ## Progress
  ////////////////

  /** `step` as a whole number, or `undefined`. */
  get currentStep(): number | undefined {
    const step = this.step
    return step === undefined ? undefined : Math.max(0, Math.floor(step))
  }

  /** The step progress is announced for:  `currentStep`, never while `checkable`. */
  get announcedStep(): number | undefined {
    return this.checkable ? undefined : this.currentStep
  }

  /** What the live region says now. */
  @E.state accessor announcement = ""

  /** `announcedStep` as last seen:  the announcement says what moved past since. */
  private stepBefore = this.currentStep

  /** As `step` moves forward, announce what was just finished;  never on first render, nor going back. */
  @E.onChange("announcedStep")
  protected onStepChanged(step: number | undefined) {
    const previous = this.stepBefore
    this.stepBefore = step
    if (step === undefined || previous === undefined || step <= previous) return
    this.announcement = this.announce(step)
  }

  /** What to say on reaching `step`:  "All done" at the end, else "<text> done" for the check before it. */
  private announce(step: number): string {
    const checks = this.checks
    if (step >= checks.length) return this.translationForKey("allDone")
    const label = checks[step - 1]?.textContent?.trim() ?? ""
    return label ? this.translationForKey("stepDone", { label }) : ""
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The DOM element's `aria-label`, passed on to the list. */
  get ariaLabel(): string | undefined {
    return this.attributes["aria-label"] ?? undefined
  }

  render(): JSX.Element {
    return (
      <>
        <div class={this.rootClass} part={this.partForName("list")} role="list" aria-label={this.ariaLabel}>
          <slot onSlotChange={() => this.refreshChecks()} />
        </div>
        <span class={UIT.VISUALLY_HIDDEN} part={this.partForName("status")} role="status">
          {this.announcement}
        </span>
      </>
    )
  }
}

export interface UIBrandChecklist extends E.AttributeValues<BrandChecklistVocabulary> {}
