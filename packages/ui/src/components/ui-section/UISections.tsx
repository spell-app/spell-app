import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { sectionsVocabulary } from "./ui-sections.vocabulary.en"
import { sectionVocabulary } from "./ui-section.vocabulary.en"

import sectionCSS from "./ui-section.css?inline"

/****************
 * ### `<ui-sections>`
 * A run of sections:  `<div class="ui ... sections" part="group"><slot></slot></div>`.
 * - Plain:  a block spaced as one section would be;  changes nothing in its sections.
 * - `collapsing`:  every `<ui-section>` under it, sub-sections at any depth included, folds by default (its own
 *   `collapsible` attribute, `"false"` included, wins);  each section reads `collapsing` off its NEAREST group
 *   (`UISection.group`), so a nested plain `<ui-sections>` turns the default off again.
 * - Spacing is CSS:  `ui-section.css` hands the stacking to the sections below through the inherited
 *   `--_ui-sections-stack` switch, which a nested plain group resets.
 * - Owns `section` parts (`ownsParts`), so a section's `PartContext` stops here;  its own `context` finds the
 *   section (or group) around it, which `UISection.parent` climbs to, so levels and sticky stacks carry through.
 ****************/
export class UISections extends E.UIElement<typeof sectionsVocabulary> {
  @E.proto static vocabulary = sectionsVocabulary
  @E.proto static styleSheets = { section: sectionCSS }

  /** Enclosing section or group (`:state(in-section)` / `:state(in-sections)`);  climbs through any component. */
  readonly context = new E.PartContext({
    host: this.host,
    noun: sectionVocabulary.noun,
    barrier: E.PartContext.noBarrier
  })

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("group")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UISections extends E.AttributeValues<typeof sectionsVocabulary> {}
