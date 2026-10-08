import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { stepsVocabulary } from "./ui-steps.vocabulary.en"
import { StepFallback } from "./ui-step.fallback"

import stepCSS from "./ui-step.css?inline"

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
 * - Host states:  `steps` always;  `block` while the root is block-level (`fluid`, or `circular` and not
 *   `vertical`), `circular` while circular.  Why `block`:  the host is a size container (its own formatting
 *   context), so a block-level root's outer margin sits on the HOST to collapse with the content above, as class
 *   grammar's does;  an inline-flex root's never collapses, so it stays on the root (`ui-step.css`).
 ****************/
export class UISteps extends E.UIElement<typeof stepsVocabulary> {
  @E.proto static vocabulary = stepsVocabulary
  @E.proto static styleSheets = { step: stepCSS }
  @E.proto static elementSetup = {
    Fallback: StepFallback,
    // the steps are the focus targets, each its own host
    delegatesFocus: false
  }

  /** Always:  the size container `ui-steps` (`:state(steps)`). */
  @E.cssState("steps")
  get isStepGroup(): boolean {
    return true
  }

  /** The root is block-level:  `fluid`, or `circular` and not `vertical` (`:state(block)`). */
  @E.cssState("block")
  get isBlockLevel(): boolean {
    return !!this.fluid || (this.isCircular && !this.vertical)
  }

  /** `circular`:  `:state(circular)`. */
  @E.cssState("circular")
  get isCircular(): boolean {
    return !!this.circular
  }

  /** `stack-with`'s class (`UIT.StackClasses`). */
  protected get extraClasses(): string | undefined {
    return UIT.StackClasses.classFor(this.stackWith)
  }

  render(): JSX.Element {
    return (
      <ol class={this.rootClasses} part={this.partForName("steps")} role={UIT.LIST}>
        <slot />
      </ol>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UISteps extends E.AttributeValues<typeof stepsVocabulary> {}
