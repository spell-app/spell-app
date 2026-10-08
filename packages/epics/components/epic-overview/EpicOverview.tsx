import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

// Import directly:  the fold base, not the `epic-section` barrel (which defines `<epic-section>`)
import { EpicFold } from "$/epics/components/epic-section/EpicFold"
import type { ContentsEntry } from "$/epics/components/epic-section/EpicSection.types"

import { epicOverviewVocabulary } from "./EpicOverview.en"

import foldCSS from "$/epics/components/epic-section/EpicFold.css?inline"
import overviewCSS from "./EpicOverview.css?inline"

/****************
 * ### `EpicOverview`
 * The component behind `<epic-overview>`:  a plan doc's Overview -- `1. Overview`, a fold (`EpicFold`), its
 * lightbulb icon.
 * - Inside, in order:  the summary (`<epic-summary>`, a lede), the Kickoff prompt (`<epic-prompt>`, folded), the
 *   estimate line (`estimate`), then its sub-sections (`<epic-section kind="overview-part">`).
 * - Summary and prompt are its light children, in the default slot with the sub-sections, so the estimate drawn
 *   between them is put in its place by flex `order` (`EpicOverview.css`), not by a slot of its own.
 * - Older docs (until P14's second conversion pass):  `<p slot="summary">` and `<blockquote slot="prompt">`, drawn in
 *   the same places;  the prompt folded in a `<details>` of its own here.
 *   TODO:  drop the two slots once every doc is migrated (`epic-components` P14, wave 2).
 ****************/
export class EpicOverview extends EpicFold<typeof epicOverviewVocabulary> {
  @E.proto static vocabulary = epicOverviewVocabulary
  @E.proto static styleSheets = { "epic-fold": foldCSS, "epic-overview": overviewCSS }

  /** Light-DOM slot occupancy:  is there a kickoff prompt? */
  readonly slots = new E.SlotContent(this.domElement)

  /** Its icons:  the title's, the prompt's chevron, the estimate's. */
  readonly icons = {
    title: new E.IconGlyph({ owner: this, name: () => TITLE_ICON }),
    chevron: new E.IconGlyph({ owner: this, name: () => "chevron right" }),
    estimate: new E.IconGlyph({ owner: this, name: () => "clock outline" })
  }

  /** Its number, by its place among the page's blocks (always the first:  `1`). */
  get number(): number {
    void this.layout
    return this.place(this.isConnected)
  }

  /** The contents entry (`EpicFold.contentsEntry()`):  `1. Overview`, its lightbulb;  its place as it is now. */
  contentsEntry(): ContentsEntry {
    return { label: `${this.place(this.domElement.isConnected)}. ${this.translationForKey("title")}`, icon: TITLE_ICON }
  }

  /** Its place among the page's blocks, from 1;  1 when it isn't `connected`. */
  private place(connected: boolean): number {
    const parent = connected ? this.domElement.parentElement : null
    const blocks = Array.from(parent?.querySelectorAll(":scope > epic-overview, :scope > epic-section") ?? [])
    return blocks.indexOf(this.domElement) + 1 || 1
  }

  render(): JSX.Element {
    return this.renderFold({
      title: () => `${this.number}. ${this.translationForKey("title")}`,
      icon: () => this.icons.title.svg,
      before: () => (
        <>
          <slot name={this.slotForName("summary")} />
          <Show when={this.slots.hasContent(this.slotForName("prompt"))}>
            <details class={PROMPT} part={this.partForName("prompt")}>
              <summary>
                <span class="chevron" aria-hidden="true">
                  {this.icons.chevron.svg}
                </span>
                {this.translationForKey("prompt")}
              </summary>
              <slot name={this.slotForName("prompt")} />
            </details>
          </Show>
          <Show when={this.estimate}>
            <p class={ESTIMATE} part={this.partForName("estimate")}>
              <span class="icon" aria-hidden="true">
                {this.icons.estimate.svg}
              </span>
              <span>
                <b>{this.translationForKey("estimate")}</b> {this.estimate}
              </span>
            </p>
          </Show>
        </>
      )
    })
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicOverview extends E.AttributeValues<typeof epicOverviewVocabulary> {}

/** Classes of the shadow markup:  the folded prompt, the estimate line. */
const PROMPT = "prompt"
const ESTIMATE = "estimate"

/** Its icon:  the title's, and its contents entry's. */
const TITLE_ICON = "lightbulb"
