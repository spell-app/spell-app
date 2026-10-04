import type { JSX } from "@solidjs/web"

import { PartContext, proto, UIElement } from "$/ui/core"

import { sectionsVocabulary } from "./ui-sections.vocabulary.en"
import { sectionVocabulary } from "./ui-section.vocabulary.en"

import sectionCSS from "./ui-section.css?inline"

/****************
 * ### `<ui-sections>`
 * A run of sections:  `<div class="ui … sections" part="group"><slot></slot></div>`.
 * - Plain:  a block spaced as one section would be;  changes nothing in its sections.
 * - `collapsing`:  every `<ui-section>` under it, sub-sections at any depth included, folds by default (its own
 *   `collapsible` attribute, `"false"` included, wins);  each section reads `attrs.collapsing` off its NEAREST group
 *   (`UISection.group`), so a nested plain `<ui-sections>` turns the default off again.
 * - Spacing is CSS:  `ui-section.css` hands the stacking to the sections below through the inherited
 *   `--_ui-sections-stack` switch, which a nested plain group resets.
 * - Owns `section` parts (`ownsParts`), so a section's `PartContext` stops here;  its own `context` finds the
 *   section (or group) around it, which `UISection.parent` climbs to, so levels and sticky stacks carry through.
 ****************/
export class UISections extends UIElement<typeof sectionsVocabulary> {
  @proto static vocabulary = sectionsVocabulary
  @proto static styles = { section: sectionCSS }

  /** Enclosing section or group (`:state(in-section)` / `:state(in-sections)`);  climbs through any component. */
  readonly context = new PartContext(this.host, sectionVocabulary.noun, { barrier: PartContext.noBarrier })

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("group")}>
        <slot />
      </div>
    )
  }
}
