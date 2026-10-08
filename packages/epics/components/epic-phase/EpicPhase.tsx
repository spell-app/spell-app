import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

// Import directly:  the fold base, not the `epic-section` barrel (which defines `<epic-section>`)
import { EpicFold } from "$/epics/components/epic-section/EpicFold"
import type { ContentsEntry } from "$/epics/components/epic-section/EpicSection.types"

import { epicPhaseVocabulary } from "./EpicPhase.en"
import { ICON } from "./EpicPhase.types"

import foldCSS from "$/epics/components/epic-section/EpicFold.css?inline"
import phaseCSS from "./EpicPhase.css?inline"

/****************
 * ### `EpicPhase`
 * The component behind `<epic-phase>`:  one phase of the plan, in the Phases section -- a fold (`EpicFold`) titled
 * `P3 · <title>`.
 * - Its title line:  the status icon in its colour (grey to do, blue under way, green done), `P3 · <title>`
 *   (`title`, or `slot="title"`), the estimate as a badge;  a done phase's title reads quieter.
 * - Its children, in order:  `<epic-field>`s (Symptom, Changes, Goal, Done, Files, Verify, To review),
 *   `<epic-updated>` lines under Changes, `<epic-commit>`s.  Files and Verify show only while the Phases title's
 *   toggles say so;  commits while the page's git toggle does.
 * - Its body is usually a part (`source="parts/p3.html"`), loaded the first time it opens.
 ****************/
export class EpicPhase extends EpicFold<typeof epicPhaseVocabulary> {
  @E.proto static vocabulary = epicPhaseVocabulary
  @E.proto static styleSheets = { "epic-fold": foldCSS, "epic-phase": phaseCSS }

  /** Its status, as drawn:  `todo` for anything unknown. */
  get shownStatus(): PhaseStatus {
    const status = this.status
    return status && status in STATUS_ICONS ? status : "todo"
  }

  /** Its status icon. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => STATUS_ICONS[this.shownStatus] })

  /**
   * The contents entry (`EpicFold.contentsEntry()`):  `P3 · <title>`, its status icon in its colour.
   * - From the attributes as they are NOW, read off the DOM element:  the live update reads it right after a patch
   */
  contentsEntry(): ContentsEntry {
    const written = this.domElement.getAttribute("status") ?? ""
    const status: PhaseStatus = written in STATUS_ICONS ? (written as PhaseStatus) : "todo"
    const label = `${this.domElement.id.toUpperCase()} · ${EpicPhase.titleText(this.domElement)}`
    return { label, icon: STATUS_ICONS[status], color: STATUS_COLORS[status] }
  }

  render(): JSX.Element {
    return this.renderFold({
      title: () => (
        <>
          <span class="id">{(this.id ?? "").toUpperCase()}</span>
          <span class="dot" aria-hidden="true">
            {" · "}
          </span>
          <slot name={this.slotForName("title")}>{this.title}</slot>
        </>
      ),
      icon: () => (
        <span
          class={[ICON, this.shownStatus]}
          part={this.partForName("status")}
          role="img"
          aria-label={this.translationForKey(this.shownStatus)}
        >
          {this.glyph.svg}
        </span>
      ),
      badge: () => this.estimate
    })
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicPhase extends E.AttributeValues<typeof epicPhaseVocabulary> {}

/** A phase's status => its icon (Spell UI's names, from the docs bundle's set). */
const STATUS_ICONS = {
  todo: "circle outline",
  active: "circle half stroke",
  done: "circle check"
} as const

/** A phase's status. */
type PhaseStatus = keyof typeof STATUS_ICONS

/**
 * A phase's status => its icon's colour (Spell UI's `color`), as `EpicPhase.css`'s:  its `contentsEntry`'s, which only
 * the contents list drew (gone 2026-10-08).
 */
const STATUS_COLORS = {
  todo: "grey",
  active: "blue",
  done: "green"
} as const satisfies Record<PhaseStatus, string>
