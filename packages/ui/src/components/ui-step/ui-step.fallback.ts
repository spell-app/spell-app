import { E, UIT } from "$/ui/core"
import { stepsVocabulary } from "./ui-steps.vocabulary.en"
import { stepVocabulary } from "./ui-step.vocabulary.en"
import { BOX, CURRENT_STEP, TITLE_PART } from "./ui-step.types"

/****************
 * ### `StepFallback`
 * The group's or a step's markup, keyed by the host's tag -- the same markup as the elements, so `ui-step.css` (and
 * `ui-parts.css` for a step's shorthand content) style it unchanged:
 * - `<ui-steps>`:  `<ol class="ui ... steps" part="steps" role="list"><slot>`
 * - `<ui-step>`:  `<div | a href class="... step" part="step" [aria-current=step]>` holding the shorthand content,
 *   the `<slot>` and a visually hidden "Completed";  the host stays a `listitem` (internals)
 ****************/
export class StepFallback extends E.NativeFallback<FallbackVocabulary> {
  @E.proto static vocabularies = [stepVocabulary, stepsVocabulary]
  @E.proto static degraded = [
    "the `icon` glyph and the completed check (an ordered step's CSS check stays)",
    "`link` steps without `href` (a plain box)",
    "translated `stepCompleted` text (English)"
  ]

  protected override build() {
    if (this.vocabulary === stepsVocabulary) {
      const steps = this.create("ol", { class: this.classes(), role: UIT.LIST }, this.slot())
      return [this.decorate(steps, "steps")]
    }
    const isSelected = this.flag("selected") || E.Converters.boolean(this.host.getAttribute(UIT.ACTIVE), UIT.ACTIVE)
    const isAlias = isSelected && !this.flag("selected")
    // `attr()` is `getAttribute()`:  `null` when absent
    const href = this.attr("href")
    const isDisabled = this.flag("disabled")
    const color = this.attr("color")
    const extra = [isAlias ? UIT.ACTIVE : "", color ? `${UIT.COLOR_CLASS_PREFIX}${color}` : ""]
      .filter(Boolean)
      .join(" ")
    const isLink = href !== null
    const step = this.create(isLink ? UIT.ANCHOR_TAG : BOX, {
      class: this.classes(extra || undefined),
      href: isLink && !isDisabled ? href : undefined,
      target: isLink ? this.attr("target") : undefined,
      "aria-disabled": isDisabled ? UIT.TRUE : undefined,
      "aria-current": isSelected ? CURRENT_STEP : undefined
    })
    const header = this.attr("header")
    const description = this.attr("description")
    if (header || description) {
      const content = this.part(UIT.CONTENT)
      if (header) content.append(this.part(TITLE_PART, header))
      if (description) content.append(this.part(UIT.DESCRIPTION, description))
      step.append(content)
    }
    step.append(this.slot())
    if (this.flag("completed")) step.append(this.create("span", { class: UIT.VISUALLY_HIDDEN }, COMPLETED))
    return [this.decorate(step, "step")]
  }

  /** A shorthand's static part:  `<div class="<noun> in-step" part="<noun>">text</div>`. */
  private part(noun: string, text?: string): HTMLDivElement {
    const owner = `${UIT.PART_STATIC_CLASS_PREFIX}${stepVocabulary.noun}`
    return this.create("div", { class: `${noun} ${owner}`, part: noun }, ...(text ? [text] : []))
  }
}

/** Either vocabulary:  the fallback serves both tags. */
type FallbackVocabulary = typeof stepVocabulary | typeof stepsVocabulary

/** The English "Completed", from the vocabulary:  a failed render can't count on the runtime's translations. */
const COMPLETED = stepVocabulary.texts.find(({ key }) => key === "stepCompleted")!.text
