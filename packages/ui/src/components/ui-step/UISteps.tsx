import type { JSX } from "@solidjs/web"

import { proto, UIElement, UIT } from "$/ui/core"

import { stepsVocabulary } from "./ui-steps.vocabulary.en"
import { StepFallback } from "./ui-step.fallback"

import stepCSS from "./ui-step.css?inline"
import { LIST } from "$/ui/components/components.types"

/****************
 * ### `<ui-steps>`
 * A step group:  `<ol class="ui … steps" part="steps" role="list"><slot></slot></ol>` -- steps are a sequence, and
 * each `<ui-step>` host is a `listitem`.
 * - `role="list"` explicitly:  `list-style: none` drops the list semantics in Safari.
 * - The root resolves every variation into inherited `--_ui-steps-*` tokens the steps read (`ui-step.css`), including
 *   stacking:  the host is a block and the size container `ui-steps` (`:state(steps)`), and the root turns
 *   `stacked` below 768px of it unless `unstackable` -- or of the screen, with `stack-with="page"` (a private class
 *   after the noun).
 * - Numbering (`ordered`) is a CSS counter reset here and incremented by each step, across the shadow boundaries.
 ****************/
export class UISteps extends UIElement<typeof stepsVocabulary> {
  @proto static vocabulary = stepsVocabulary
  @proto static styles = { step: stepCSS }
  @proto static Fallback = StepFallback
  @proto static delegatesFocus = false

  protected hostStates() {
    return { steps: true }
  }

  /** `stack-with`'s class (`UIT.StackClasses`). */
  protected extraClasses(): string | undefined {
    return UIT.StackClasses.of(this.attrs.stackWith)
  }

  render(): JSX.Element {
    return (
      <ol class={this.classes()} part={this.part("steps")} role={LIST}>
        <slot />
      </ol>
    )
  }
}
