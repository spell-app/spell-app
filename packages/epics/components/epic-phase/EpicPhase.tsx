import { createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { IconGlyph, proto } from "$/ui/core"

// Import directly:  the fold base, not the `epic-section` barrel (which defines `<epic-section>`)
import { EpicFold } from "$/epics/components/epic-section/EpicFold"
import type { ContentsEntry } from "$/epics/components/epic-section/epic-section.types"

import { epicPhaseVocabulary } from "./epic-phase.vocabulary.en"
import { EpicPhaseFallback } from "./epic-phase.fallback"
import { ICON, STATUS_COLORS, STATUS_ICONS, type EpicPhaseVocabulary, type PhaseStatus } from "./epic-phase.types"

import foldCSS from "$/epics/components/epic-section/epic-fold.css?inline"
import phaseCSS from "./epic-phase.css?inline"

/****************
 * ### `<epic-phase>`
 * One phase of the plan, in the Phases section:  a fold (`EpicFold`) titled `P3 · <title>`.
 * - Its title line:  the status icon in its colour (grey to do, orange under way, green done), `P3 · <title>`
 *   (`title`, or `slot="title"`), the estimate as a badge;  a done phase's title reads quieter.
 * - Its children, in order:  `<epic-field>`s (Symptom, Changes, Goal, Done, Files, Verify, To review),
 *   `<epic-updated>` lines under Changes, `<epic-commit>`s.  Files and Verify show only while the Phases title's
 *   toggles say so;  commits while the page's git toggle does.
 * - Its body is usually a part (`source="parts/p3.html"`), loaded the first time it opens.
 ****************/
export class EpicPhase extends EpicFold<EpicPhaseVocabulary> {
  @proto static vocabulary = epicPhaseVocabulary
  @proto static styles = { "epic-fold": foldCSS, "epic-phase": phaseCSS }
  @proto static Fallback = EpicPhaseFallback

  /** Its status, as drawn:  `todo` for anything unknown. */
  readonly status = createMemo((): PhaseStatus => {
    const status = this.attrs.status
    return status && status in STATUS_ICONS ? status : "todo"
  })

  /** Its status icon. */
  readonly glyph = new IconGlyph(this, () => STATUS_ICONS[this.status()])

  /**
   * The contents entry (`EpicFold.contentsEntry()`):  `P3 · <title>`, its status icon in its colour.
   * - From the attributes as they are NOW, not the memos:  the live update reads it right after a patch
   */
  contentsEntry(): ContentsEntry {
    const written = this.host.getAttribute("status") ?? ""
    const status: PhaseStatus = written in STATUS_ICONS ? (written as PhaseStatus) : "todo"
    const label = `${this.host.id.toUpperCase()} · ${EpicPhase.titleText(this.host)}`
    return { label, icon: STATUS_ICONS[status], color: STATUS_COLORS[status] }
  }

  render(): JSX.Element {
    return this.renderFold({
      title: () => (
        <>
          <span class="id">{(this.attrs.id ?? "").toUpperCase()}</span>
          <span class="dot" aria-hidden="true">
            {" · "}
          </span>
          <slot name={this.slot("title")}>{this.attrs.title}</slot>
        </>
      ),
      icon: () => (
        <span class={[ICON, this.status()]} part={this.part("status")} role="img" aria-label={this.text(this.status())}>
          {this.glyph.svg()}
        </span>
      ),
      badge: () => this.attrs.estimate
    })
  }
}
