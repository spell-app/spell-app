import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

// the review controls, shared with `<epic-item>`:  its files, not its barrel (which would define `<epic-item>` here)
import { NoteBox, ReviewButtons, SaidNote, takeToNote } from "$/epics/components/epic-item/ReviewControls"
import { ReviewState } from "$/epics/components/epic-item/ReviewState"
import { OVERVIEW_BUTTONS, STATUS_SLOT, type ReviewTextKey } from "$/epics/components/epic-item/EpicItem.types"
// Import directly:  the fold base, not the `epic-section` barrel (which defines `<epic-section>`)
import { EpicFold } from "$/epics/components/epic-section/EpicFold"
import type { ContentsEntry } from "$/epics/components/epic-section/EpicSection.types"

import { epicPhaseVocabulary } from "./EpicPhase.en"
import { ICON } from "./EpicPhase.types"

import collapseAllCSS from "$/epics/components/epic-item/CollapseAllButton.css?inline"
import reviewCSS from "$/epics/components/epic-item/ReviewControls.css?inline"
import foldCSS from "$/epics/components/epic-section/EpicFold.css?inline"
import phaseCSS from "./EpicPhase.css?inline"

/****************
 * ### `EpicPhase`
 * The component behind `<epic-phase>`:  one phase of the plan, in the Phases section --
 * a fold (`EpicFold`) titled `P3 · <title>`.
 * - Its title line:  the status icon in its colour (grey to do, blue under way, green done), `P3 · <title>`
 *   (`title`, or `slot="title"`), the estimate as a badge;  a done phase's title reads quieter.
 * - Its children, in order:  `<epic-field>`s (Symptom, Changes, Goal, Done, Files, Verify, To review),
 *   `<epic-updated>` lines under Changes, Owen's kept notes (`<epic-reply>`), `<epic-commit>`s.
 *   Files and Verify show only while the Phases title's toggles say so;  commits while the page's git toggle does.
 * - Its body is usually a part (`source="parts/p3.html"`), loaded the first time it opens.
 * - REVIEWED as an Overview sub-section is (epic `airplane` P2;  `ReviewControls.tsx`):  Revisit, Make Todo, Do Now at
 *   its title's end (no Approve:  notes on the plan, not sign-off), a marked note at the top of its body, its note box
 *   at the end, Claude's status cards (`slot="status"`) just above it;  only while the page is reviewed.
 * - SIDE EFFECT:  follows the review inbox while connected.
 ****************/
export class EpicPhase extends EpicFold<typeof epicPhaseVocabulary> {
  @E.proto static vocabulary = epicPhaseVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: {
      "epic-fold": foldCSS,
      "epic-collapse-all": collapseAllCSS,
      "epic-phase": phaseCSS,
      "epic-review": reviewCSS
    }
  } satisfies Partial<E.ElementSetup>

  /** Its status, as drawn:  `todo` for anything unknown. */
  get shownStatus(): PhaseStatus {
    const status = this.status
    return status && status in STATUS_ICONS ? status : "todo"
  }

  /** Its status icon. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => STATUS_ICONS[this.shownStatus] })

  /** Its view of the review inbox, keyed by its id (`p3`). */
  readonly reviewState = new ReviewState(() => this.id)

  /** Its note box `<textarea>`, once drawn:  Revisit and Edit focus it. */
  private noteInput: HTMLTextAreaElement | undefined

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
          {/* Claude's status cards (P13):  at the end of its body, above the note box */}
          <slot name={this.slotForName(STATUS_SLOT)} />
          <Show when={this.reviewState.reviewing()}>{this.noteBox()}</Show>
        </>
      )
    })
  }

  ////////////////
  // ## Review
  ////////////////

  /** The review buttons at the title's end:  Revisit, Make Todo, Do Now. */
  private reviewButtons(): JSX.Element {
    return (
      <Show when={this.reviewState.reviewing()}>
        <ReviewButtons
          review={this.reviewState}
          text={this.reviewText}
          label={(this.id ?? "").toUpperCase()}
          buttons={OVERVIEW_BUTTONS}
          part={this.partForName("review-buttons")}
          onOpenBox={() => this.takeToNote()}
        />
      </Show>
    )
  }

  /** A marked note, at the top of its body. */
  private saidNote(): JSX.Element {
    return (
      <Show when={this.reviewState.reviewing()}>
        <SaidNote
          review={this.reviewState}
          text={this.reviewText}
          part={this.partForName("said")}
          onEdit={() => this.takeToNote(this.reviewState.mark()?.note)}
        />
      </Show>
    )
  }

  /** The note box, at the end of its body. */
  private noteBox(): JSX.Element {
    return (
      <NoteBox
        review={this.reviewState}
        text={this.reviewText}
        label={(this.id ?? "").toUpperCase()}
        part={this.partForName("note-box")}
        ref={(note) => (this.noteInput = note)}
        onEscape={() => this.leaveNote()}
        onUsed={() => this.leaveNote()}
      />
    )
  }

  /** Its texts, as the review controls ask for them. */
  private readonly reviewText = (key: ReviewTextKey, params?: Record<string, string | number>) =>
    this.translationForKey(key, params)

  /** Take the reader to its note box (Revisit;  Edit, with the marked `note`):  unfolded first, its part loaded. */
  private takeToNote(note?: string) {
    takeToNote(
      this.reviewState,
      () => void this.reveal(),
      () => this.noteInput,
      note
    )
  }

  /** Done with the note box:  it stays, but stops counting as written in once it's empty. */
  @E.untracked
  private leaveNote() {
    if (!this.noteInput?.value.trim()) this.reviewState.client?.closeBox(this.reviewState.id(), false)
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
