import { Show, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { IconGlyph, proto, SlotContent, UIT } from "$/ui/core"

// Import directly:  the fold base, not the `epic-section` barrel (which defines `<epic-section>`)
import { EpicFold } from "$/epics/components/epic-section/EpicFold"

import { epicOverviewVocabulary } from "./epic-overview.vocabulary.en"
import { EpicOverviewFallback } from "./epic-overview.fallback"
import { ESTIMATE, PROMPT, type EpicOverviewVocabulary } from "./epic-overview.types"

import foldCSS from "$/epics/components/epic-section/epic-fold.css?inline"
import overviewCSS from "./epic-overview.css?inline"

/****************
 * ### `<epic-overview>`
 * A plan doc's Overview:  `1. Overview`, a fold (`EpicFold`), its lightbulb icon.
 * - Inside, in order:  the summary (`slot="summary"`, a lede), the Kickoff prompt (`slot="prompt"`) folded in a
 *   `<details>`, the estimate line (`estimate`), then its sub-sections (`<epic-section kind="overview-part">`).
 ****************/
export class EpicOverview extends EpicFold<EpicOverviewVocabulary> {
  @proto static vocabulary = epicOverviewVocabulary
  @proto static styles = { "epic-fold": foldCSS, "epic-overview": overviewCSS }
  @proto static Fallback = EpicOverviewFallback

  /** Light-DOM slot occupancy:  is there a kickoff prompt? */
  readonly slots = new SlotContent(this.host)

  /** Its icons:  the title's, the prompt's chevron, the estimate's. */
  readonly icons = {
    title: new IconGlyph(this, () => "lightbulb"),
    chevron: new IconGlyph(this, () => "chevron right"),
    estimate: new IconGlyph(this, () => "clock outline")
  }

  /** Its number, by its place among the page's blocks (always the first:  `1`). */
  readonly number = createMemo(() => {
    this.layout()
    const parent = this.connected.get() ? this.host.parentElement : null
    const blocks = Array.from(parent?.querySelectorAll(":scope > epic-overview, :scope > epic-section") ?? [])
    return blocks.indexOf(this.host) + 1 || 1
  })

  render(): JSX.Element {
    return this.renderFold({
      title: () => `${this.number()}. ${this.text("title")}`,
      icon: () => this.icons.title.svg(),
      before: () => (
        <>
          <slot name={this.slot("summary")} />
          <Show when={this.slots.has(this.slot("prompt"))}>
            <details class={PROMPT} part={this.part("prompt")}>
              <summary>
                <span class="chevron" aria-hidden={UIT.TRUE}>
                  {this.icons.chevron.svg()}
                </span>
                {this.text("prompt")}
              </summary>
              <slot name={this.slot("prompt")} />
            </details>
          </Show>
          <Show when={this.attrs.estimate}>
            <p class={ESTIMATE} part={this.part("estimate")}>
              <span class="icon" aria-hidden={UIT.TRUE}>
                {this.icons.estimate.svg()}
              </span>
              <span>
                <b>{this.text("estimate")}</b> {this.attrs.estimate}
              </span>
            </p>
          </Show>
        </>
      )
    })
  }
}
