import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { sectionsVocabulary } from "./UISections.en"
import { sectionVocabulary } from "./UISection.en"

import sectionCSS from "./UISection.css?inline"

/****************
 * ### `UISections`
 * The component behind `<ui-sections>`:  a run of sections, spaced as one section would be.
 *
 * - Its shadow DOM is one box around a slot:  `<div class="ui … sections" part="group"><slot></slot></div>`.
 * - Plain, it changes nothing in its sections.
 * - `collapsing`:  every `<ui-section>` under it, sub-sections at any depth included, folds by default.
 *   - A section's own `collapsible` attribute wins, `"false"` included.
 *   - Each section reads `collapsing` from its NEAREST group (`UISection.group`),
 *     so a plain `<ui-sections>` nested inside turns the default off again.
 * - The spacing is CSS:  `UISection.css` hands the stacking down to the sections
 *   through the inherited `--_ui-sections-stack` switch, which a nested plain group resets.
 * - It owns `section` parts (`ownsParts`), so a section's `PartContext` stops here.
 *   Its own `context` finds the section (or group) around it,
 *   which `UISection.parent` climbs to, so levels and sticky stacks carry through.
 ****************/
export class UISections extends E.UIComponent<typeof sectionsVocabulary> {
  @E.proto static vocabulary = sectionsVocabulary
  @E.proto static styleSheets = { section: sectionCSS }

  /** Enclosing section or group (`:state(in-section)` / `:state(in-sections)`);  climbs through any component. */
  readonly context = new E.PartContext({
    domElement: this.domElement,
    noun: sectionVocabulary.noun,
    barrier: E.PartContext.noBarrier
  })

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("group")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UISections extends E.AttributeValues<typeof sectionsVocabulary> {}
