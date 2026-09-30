import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/core"

import { stepsVocabulary } from "./step.vocabulary.en"
import { StepFallback } from "./step.fallback"

import stepCSS from "./step.css?inline"

/****************
 * ### `<ui-steps>`
 * A step group:  `<ol class="ui … steps" part="steps" role="list"><slot></slot></ol>` -- steps are a sequence, and
 * each `<ui-step>` host is a `listitem`.
 * - `role="list"` explicitly:  `list-style: none` drops the list semantics in Safari.
 * - The root resolves every variation into inherited `--_ui-steps-*` tokens the steps read (`step.css`), including
 *   stacking:  the host is a block and the size container `ui-steps` (`:state(steps)`), and the root turns
 *   `stacked` below 768px of it unless `unstackable`.
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

  render(): JSX.Element {
    return (
      <ol class={this.classes()} part={this.part("steps")} role={LIST}>
        <slot />
      </ol>
    )
  }
}

/** Explicit list role (see the class docs). */
const LIST = "list"
