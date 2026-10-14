import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

// its view of the review inbox:  the file, not `epic-review`'s barrel (`index.ts` defines that family)
import { ReviewState } from "$/epics/components/epic-review/ReviewState"
import { SHOW_NOTE, type ReviewShows } from "$/epics/components/epic-review/EpicReview.types"
import { STATUS_SLOT } from "$/epics/components/epic-item/EpicItem.types"
// Import directly:  the fold base, not the `epic-section` barrel (which defines `<epic-section>`)
import { EpicFold } from "$/epics/components/epic-section/EpicFold"
import type { ContentsEntry } from "$/epics/components/epic-section/EpicSection.types"

import { epicPhaseVocabulary } from "./EpicPhase.en"
import { ICON } from "./EpicPhase.types"

import collapseAllCSS from "$/epics/components/epic-item/CollapseAll.css?inline"
import foldCSS from "$/epics/components/epic-section/EpicFold.css?inline"
import phaseCSS from "./EpicPhase.css?inline"
import tooltipCSS from "$/epics/components/epic-item/Tooltip.css?inline"

/****************
 * ### `EpicPhase`
 * The component behind `<epic-phase>`:  one phase of the plan, in the Phases section --
 * a fold (`EpicFold`) titled `P3 · <title>`.
 * - Its title line:
 *   - the status icon in its colour (grey to do, blue under way, green done)
 *   - `P3 · <title>` (`title`, or `slot="title"`);  a done phase's title reads quieter
 *   - while it isn't done and its plan changed (`changes`, written by the tool):  an orange pen and how many times,
 *     so a folded phase says so too (its body, a part, isn't loaded until it opens)
 *   - the estimate as a badge
 * - Its children, in order (the vocabulary's):
 *   - `<epic-field>`s (Symptom, Changes, Requests, Goal), Owen's kept notes (`<epic-reply>`)
 *   - its PLAN CHANGES, `<epic-update at summary>` blocks, at the end of its description, after Goal
 *     (Owen, 2026-10-11:  "lose the "Plan changes" surround.  The updated blocks themselves go at the end of the
 *     phase description"):  plain children, each its own block, with no box around them
 *   - Done, `<epic-commit>`s, Files, Verify, To review
 *   - An older doc's `<epic-updated>` lines (its `changes` slot, P6) show at the end of its body, unboxed,
 *     until the epic tool's next write migrates them (`updates-as-epic-update`)
 *   - Files and Verify show only while the Phases title's toggles say so;  commits while the page's git toggle does
 * - Its body is usually a part (`source="parts/p3.html"`), loaded the first time it opens.
 * - REVIEWED as an Overview sub-section is, only while the page is reviewed
 *   (epic `airplane` P2;  `<epic-review buttons="part">`):
 *   - Revisit, Make Todo, Do Now at its title's end (no Approve:  notes on the plan, not sign-off)
 *   - a marked note at the top of its body
 *   - its note box at the end, Claude's status cards (`slot="status"`) just above it
 *   - Revisit and Edit unfold it (`epic-show-note`)
 * - SIDE EFFECT:  follows the review inbox while connected.
 ****************/
export class EpicPhase extends EpicFold<typeof epicPhaseVocabulary> {
  @E.proto static vocabulary = epicPhaseVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: {
      "epic-tooltip": tooltipCSS,
      "epic-fold": foldCSS,
      "epic-collapse-all": collapseAllCSS,
      "epic-phase": phaseCSS
    }
  } satisfies Partial<E.ElementSetup>

  /** Its status, as drawn:  `todo` for anything unknown. */
  get shownStatus(): PhaseStatus {
    const status = this.status
    return status && status in STATUS_ICONS ? status : "todo"
  }

  /** Its status icon. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => STATUS_ICONS[this.shownStatus] })

  /** Its view of the review inbox, keyed by its id (`p3`):  is the page reviewed?  Has it a marked note? */
  readonly reviewState = new ReviewState(() => this.id)

  /** The pen of its title's mark:  its plan changed. */
  readonly changedGlyph = new E.IconGlyph({ owner: this, name: () => "pen to square" })

  /** How many plan changes its title says it has:  `changes`, while it isn't done;  0 for none. */
  get changedCount(): number {
    return this.shownStatus === "done" ? 0 : (this.changes ?? 0)
  }

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

  /** Follow the review inbox while connected (kept alive:  a removed phase stops). */
  @E.whileConnected
  protected followReviews() {
    return this.reviewState.connect()
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
          {this.changedMark()}
        </>
      ),
      icon: () => (
        <span
          class={[ICON, this.shownStatus]}
          part={this.partForName("status")}
          role="img"
          aria-label={this.translationForKey(STATUS_TEXTS[this.shownStatus])}
        >
          {this.glyph.svg}
        </span>
      ),
      badge: () => this.estimate,
      tools: () => this.reviewButtons(),
      before: () => this.saidNote(),
      after: () => (
        <>
          {/* an older doc's plan changes (`slot="changes"`, until the tool migrates them):  unboxed, at the end */}
          <slot name={this.slotForName("changes")} />
          {/* Claude's status cards (P13):  at the end of its body, above the note box */}
          <slot name={this.slotForName(STATUS_SLOT)} />
          <Show when={this.reviewState.reviewing()}>{this.reviewControl("note", "note-box")}</Show>
        </>
      )
    })
  }

  ////////////////
  // ## Plan changed
  ////////////////

  /**
   * Its title's mark while it isn't done and its plan changed:  the pen and how many times, in orange;
   * its name and tooltip say so (`changedTip`).
   */
  private changedMark(): JSX.Element {
    return (
      <Show when={this.changedCount}>
        {(count) => (
          <span
            class={CHANGED}
            part={this.partForName("changed")}
            role="img"
            aria-label={this.translationForKey("changedTip", { count: count() })}
            title={this.translationForKey("changedTip", { count: count() })}
          >
            {this.changedGlyph.svg}
            {count()}
          </span>
        )}
      </Show>
    )
  }

  ////////////////
  // ## Review
  ////////////////

  /** The review buttons at the title's end:  Revisit, Make Todo, Do Now. */
  private reviewButtons(): JSX.Element {
    return <Show when={this.reviewState.reviewing()}>{this.reviewControl("buttons", "review-buttons")}</Show>
  }

  /** A marked note, at the top of its body. */
  private saidNote(): JSX.Element {
    return (
      <Show when={this.reviewState.reviewing() && this.reviewState.noted()}>{this.reviewControl("said", "said")}</Show>
    )
  }

  /** One of its review controls (`<epic-review>`):  what it `shows`, as its `part`. */
  private reviewControl(shows: ReviewShows, part: "review-buttons" | "note-box" | "said"): JSX.Element {
    return <epic-review of={this.id} shows={shows} buttons="part" part={this.partForName(part)} />
  }

  /** Revisit or Edit, pressed on its own review controls:  unfolded, its part loaded, to show the note box. */
  @E.on(SHOW_NOTE, { target: "renderRoot" })
  protected onShowNote(event: Event) {
    // its own controls' only:  a nested element's come through here too
    if ((event.target as Node).getRootNode() !== event.currentTarget) return
    event.stopPropagation()
    void this.reveal()
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicPhase extends E.AttributeValues<typeof epicPhaseVocabulary> {}

/** Class of the shadow markup:  the title's mark, its plan changed. */
const CHANGED = "changed"

/** A phase's status => its icon (Spell UI's names, from the docs bundle's set). */
const STATUS_ICONS = {
  todo: "circle outline",
  active: "circle half stroke",
  done: "circle check"
} as const

/** A phase's status. */
type PhaseStatus = keyof typeof STATUS_ICONS

/** A phase's status => its icon's name's text key (`status*`:  the review controls' `todo` is Make Todo). */
const STATUS_TEXTS = {
  todo: "statusTodo",
  active: "statusActive",
  done: "statusDone"
} as const satisfies Record<PhaseStatus, string>

/**
 * A phase's status => its icon's colour (Spell UI's `color`), as `EpicPhase.css`'s:
 * its `contentsEntry`'s, which only the contents list drew (gone 2026-10-08).
 */
const STATUS_COLORS = {
  todo: "grey",
  active: "blue",
  done: "green"
} as const satisfies Record<PhaseStatus, string>
