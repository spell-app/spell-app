import { Converters, NativeFallback, proto, type NativeFallbackRoot, UIT } from "$/ui/core"

import { stepsVocabulary } from "./ui-steps.vocabulary.en"
import { stepVocabulary } from "./ui-step.vocabulary.en"
import { COMPLETED, COLOR_CLASS_PREFIX } from "./ui-step.types"
import { ACTIVE, VISUALLY_HIDDEN, LIST } from "$/ui/components/components.types"

/****************
 * ### `StepFallback`
 * The group's or a step's markup, keyed by the host's tag -- the same markup as the elements, so `ui-step.css` (and
 * `ui-parts.css` for a step's shorthand content) style it unchanged:
 * - `<ui-steps>`:  `<ol class="ui ... steps" part="steps" role="list"><slot>`
 * - `<ui-step>`:  `<div | a href class="... step" part="step" [aria-current=step]>` holding the shorthand content,
 *   the `<slot>` and a visually hidden "Completed";  the host stays a `listitem` (internals)
 ****************/
export class StepFallback extends NativeFallback {
  @proto static degraded = [
    "the `icon` glyph and the completed check (an ordered step's CSS check stays)",
    "`link` steps without `href` (a plain box)",
    "translated `stepCompleted` text (English)"
  ]

  constructor(host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) {
    super(host, root, error, internals)
    // Shadows the prototype's placeholder vocabulary, see `@proto`.
    this.vocabulary = host.localName === stepsVocabulary.tag ? stepsVocabulary : stepVocabulary
  }

  protected override build() {
    if (this.vocabulary === stepsVocabulary) {
      const steps = this.create("ol", { class: this.classes(), role: LIST }, this.slot())
      return [this.decorate(steps, "steps")]
    }
    const selected = this.flag("selected") || Converters.boolean(this.host.getAttribute(ACTIVE), ACTIVE)
    const alias = selected && !this.flag("selected")
    const href = this.attr("href")
    const disabled = this.flag("disabled")
    const color = this.attr("color")
    const extra = [alias ? ACTIVE : "", color ? `${COLOR_CLASS_PREFIX}${color}` : ""].filter(Boolean).join(" ")
    const step = this.create(href === null ? "div" : "a", {
      class: this.classes(extra || undefined),
      href: href !== null && !disabled ? href : null,
      target: href !== null ? this.attr("target") : null,
      "aria-disabled": disabled ? "true" : null,
      "aria-current": selected ? "step" : null
    })
    const header = this.attr("header")
    const description = this.attr("description")
    if (header || description) {
      const owner = `${UIT.PART_STATIC_CLASS_PREFIX}${stepVocabulary.noun}`
      const content = this.create("div", { class: `content ${owner}`, part: "content" })
      if (header) content.append(this.create("div", { class: `title ${owner}`, part: "title" }, header))
      if (description) {
        content.append(this.create("div", { class: `description ${owner}`, part: "description" }, description))
      }
      step.append(content)
    }
    step.append(this.slot())
    if (this.flag("completed")) {
      step.append(this.create("span", { class: VISUALLY_HIDDEN }, COMPLETED))
    }
    return [this.decorate(step, "step")]
  }
}
