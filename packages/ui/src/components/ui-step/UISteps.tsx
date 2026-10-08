import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { stepsVocabulary } from "./UISteps.en"

import stepCSS from "./UIStep.css?inline"

/****************
 * ### `UISteps`
 * The component behind `<ui-steps>`:  a group of steps,
 * `<ol class="ui … steps" part="steps" role="list"><slot></slot></ol>`.
 * Steps are a sequence, and each `<ui-step>`'s DOM element is a `listitem`.
 *
 * - `role="list"` is explicit:  `list-style: none` drops the list semantics in Safari.
 *
 * - The root resolves every variation into inherited `--_ui-steps-*` tokens the steps read (`UIStep.css`).
 *   That includes stacking:  the DOM element is a block and the size container `ui-steps` (`:state(steps)`),
 *   and the root turns `stacked` below 768px of it unless `unstackable`;
 *   with `stack-with="page"` (a private class after the noun), below 768px of the screen.
 *
 * - Numbering (`ordered`) is a CSS counter, reset here and incremented by each step, across the shadow boundaries.
 *
 * - The DOM element's states:  `steps` always;  `block` while the root is block-level
 *   (`fluid`, or `circular` and not `vertical`);  `circular` while circular.
 *   - Why `block`:  the DOM element is a size container (its own formatting context),
 *     so a block-level root's outer margin sits on the DOM ELEMENT, to collapse with the content above
 *     as class grammar's does.  An inline-flex root's never collapses, so it stays on the root (`UIStep.css`).
 ****************/
export class UISteps extends E.UIComponent<typeof stepsVocabulary> {
  @E.proto static vocabulary = stepsVocabulary
  @E.proto static styleSheets = { step: stepCSS }
  @E.proto static elementSetup = {
    // the steps are the focus targets, each its own DOM element
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

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
      <ol class={this.rootClasses} part={this.partForName("steps")} role="list">
        <slot />
      </ol>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UISteps extends E.AttributeValues<typeof stepsVocabulary> {}
