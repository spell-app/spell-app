import { For, Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { DRAFT_SAVE_MS, FOCUS_HOLD_MS, NOBODY_LISTENING, clockOf, isImmediate, type InboxMark } from "$/epics/review"

import { epicReviewVocabulary } from "./EpicReview.en"
import { ReviewState } from "./ReviewState"
import {
  BUTTONS_OF,
  CHOSEN,
  NOTE_ACTIONS,
  NOTE_BOX,
  NOTE_BUTTONS_OF,
  NOTE_INPUT,
  NOTE_SAVED,
  NOTE_TEXT,
  REVIEW_CONTROLS,
  REVIEW_DO_NOW,
  REVIEW_GROUP,
  REVIEW_NOTED,
  REVIEW_PICK,
  SAID,
  SAID_EDIT,
  SAID_NOTE,
  SAID_WHAT,
  SHOW_NOTE,
  type EpicReviewVocabulary,
  type NoteButtonSpec,
  type NoteHow,
  type ReviewButtonSpec,
  type ReviewFill
} from "./EpicReview.types"

import reviewCSS from "./EpicReview.css?inline"

/****************
 * ### `EpicReview`
 * The component behind `<epic-review>`:  the review controls (P9) of one item, Overview sub-section, phase or the
 * summary, in one of three places (`shows`), each drawn by its family in its own shadow root:
 * - `buttons`:  the controls at the end of a line or title (`controls()`)
 * - `note`:  the note box (`noteBox()`)
 * - `said`:  a marked note, its box closed (`said()`)
 * - Drawn by `<epic-item>` (its line, details, or under its line), an Overview `<epic-section>` and an `<epic-phase>`
 *   (their title and body), `<epic-summary>` (under its lede);  only while the page is reviewed:  the family wraps
 *   it in `<Show when={reviewState.reviewing()}>`.
 * - Each one is a view of the page's review inbox of its own (`ReviewState`, keyed by `of`), following it while
 *   connected.
 * - Revisit and Edit take the reader to the note box (`takeToNote()`):  `epic-show-note`, so the family unfolds,
 *   then the box beside it (the `<epic-review shows="note">` of the same shadow root) takes the focus.
 * - A button that chose an action (a review button, a note box button) sends `epic-chosen`:  `<epic-item>` folds,
 *   so Owen moves on to the next (Owen, 2026-10-10).
 * - SIDE EFFECT:  the note box listens for `pagehide` while connected, to save a draft as the page goes.
 ****************/
export class EpicReview extends E.UIComponent<EpicReviewVocabulary> {
  @E.proto static vocabulary = epicReviewVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-review": reviewCSS },
    // a click on a marked note's words must not jump to its Edit button
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The inbox
  ////////////////

  /** Its view of the page's review inbox, keyed by `of`. */
  readonly review = new ReviewState(() => this.of)

  /** Follow the inbox while connected (kept alive:  a removed one must stop listening). */
  @E.whileConnected
  protected followReviews() {
    return this.review.connect()
  }

  /** Its element's name as shown (`Q7`, `the summary`):  `label`, else `of` in capitals. */
  get name(): string {
    return this.label || (this.of ?? "").toUpperCase()
  }

  render(): JSX.Element {
    return (
      <>
        <Show when={this.shows === "buttons"}>{this.controls()}</Show>
        <Show when={this.shows === "note"}>{this.noteBox()}</Show>
        <Show when={this.shows === "said"}>{this.said()}</Show>
      </>
    )
  }

  ////////////////
  // ## The buttons
  ////////////////

  /**
   * The controls at the end of a line:  the note bubble (what Owen wrote, its words as the tooltip), a pick's letter,
   * the group (Approve, Revisit, Make Todo), then Do Now apart (decision Q20, the wand);
   * a todo's group instead:  the plane (do it in the next phase), Revisit, the x (drop it:  Owen, 2026-10-09).
   * - every button shows at every step, its FILL saying how far its mark has got (`ReviewFill`):
   *   a grey outline available;  dashed in its colour pressed, not sent;  outlined sent (a Do Now:  taken);
   *   then CLEARED, a grey outline again, once Claude has handled it (they're Owen's input:  the id chip carries
   *   the result, Owen, 2026-10-08)
   * - colours:  green decided (Approve, Make Todo, a todo's plane), blue an ask of Claude (Revisit, Do Now),
   *   grey no longer relevant (a todo's x)
   * - work on its way or under way (`ReviewState.busyButton()`):  that button's icon turns while Claude is on it
   *   (`data-busy`);  queued with nobody listening, it stays dashed.  Clicked then:  "nevermind"
   * - Revisit takes the reader to the note box (`takeToNote()`);  Do Now takes the note in it along
   *   (`ReviewClient.press()`)
   * - tooltips:  the plain browser ones (`title`), just the name (Q8), then the element's review label (`tip`:
   *   `Approve · reviewed 10/7/26`:  Owen, 2026-10-07, in place of the label beside them);
   *   a screen reader hears the state too
   */
  private controls(): JSX.Element {
    const specs = () => BUTTONS_OF[this.buttons ?? "item"]
    const group = () => specs().filter((spec) => spec.action !== "details")
    const doNow = () => specs().find((spec) => spec.action === "details")
    return (
      <span
        class={REVIEW_CONTROLS}
        part={this.partForName("base")}
        role="group"
        aria-label={this.translationForKey("reviewControls", { id: this.name })}
      >
        <Show when={this.noteWords}>
          <span class={REVIEW_NOTED} data-sent={this.isNoteSent ? "" : undefined} title={this.noteTip}>
            <ui-icon name={this.review.draft() ? "comment outline" : "comment"} />
          </span>
        </Show>
        <Show when={this.review.mark()?.pick}>
          {(pick) => (
            <span
              class={REVIEW_PICK}
              data-fill={this.review.isSent() ? "outline" : "dashed"}
              title={this.translationForKey(this.review.isSent() ? "pickedSent" : "pickedUnsent", { letter: pick() })}
            >
              {pick()}
            </span>
          )}
        </Show>
        <ui-buttons class={REVIEW_GROUP} basic="" icon="" size="mini">
          <For each={group()}>{(spec) => this.button(spec)}</For>
        </ui-buttons>
        <Show when={doNow()}>{(spec) => this.button(spec(), REVIEW_DO_NOW)}</Show>
      </span>
    )
  }

  /** One review button, as its action stands. */
  private button(spec: ReviewButtonSpec, extra?: string): JSX.Element {
    const busy = () => this.review.busyButton() === spec.action
    return (
      <ui-button
        class={extra}
        basic={extra ? "" : undefined}
        size={extra ? "mini" : undefined}
        icon={spec.icon}
        data-action={spec.action}
        data-color={spec.color}
        data-fill={this.fillOf(spec)}
        data-busy={busy() && this.review.workedOn() ? "" : undefined}
        title={
          busy() ? this.translationForKey("callOff", { label: this.translationForKey(spec.label) }) : this.tipOf(spec)
        }
        aria-label={`${this.translationForKey(spec.label)} · ${this.stateOf(spec)}`}
        onClick={(event: MouseEvent) => this.press(event, spec)}
      />
    )
  }

  /**
   * A review button clicked:  its mark (`ReviewClient.press()`);  Revisit takes the reader to the note box;
   * a click that CHOSE an action (not one that cleared a mark or called a request off) says so (`epic-chosen`):
   * an item folds, so Owen moves on to the next (Owen, 2026-10-10).
   */
  @E.untracked
  private press(event: MouseEvent, spec: ReviewButtonSpec) {
    // the line's own click would fold it
    event.preventDefault()
    event.stopPropagation()
    const pressed = this.review.press(spec.action)
    if (pressed === "open-box") this.takeToNote()
    else if (pressed === "chosen") this.send(CHOSEN, { of: this.review.id() })
  }

  /** How far `spec`'s mark has got:  its fill (`ReviewState.fillOf()`, which the id chip reads too). */
  private fillOf(spec: ReviewButtonSpec): ReviewFill {
    return this.review.fillOf(spec.action)
  }

  /** A button's plain tooltip:  its name, then the element's review label (`Approve · reviewed 10/7/26`). */
  private tipOf(spec: ReviewButtonSpec): string {
    const label = this.translationForKey(spec.label)
    return this.tip ? `${label} · ${this.tip}` : label
  }

  /** A button's state, for a screen reader. */
  private stateOf(spec: ReviewButtonSpec): string {
    const review = this.review
    if (review.busyButton() === spec.action) {
      if (review.running()?.queued) return this.translationForKey("waiting", { why: NOBODY_LISTENING })
      return this.translationForKey(review.workedOn() ? "working" : "asked")
    }
    const fill = this.fillOf(spec)
    if (fill === "dashed") return this.translationForKey("chosenUnsent")
    if (fill === "outline") return this.translationForKey("chosenSent")
    const tip = this.translationForKey(spec.tip)
    return spec.action === "details" && !review.listening() ? `${tip}.  ${NOBODY_LISTENING}` : tip
  }

  /** What Owen wrote:  the draft, else the mark's note;  `""` for none. */
  get noteWords(): string {
    return this.review.draft()?.note ?? this.review.mark()?.note ?? ""
  }

  /** The note is a mark's, sent. */
  get isNoteSent(): boolean {
    return !this.review.draft() && !!this.review.mark()?.note && this.review.isSent()
  }

  /** The note bubble's tooltip:  whose note, how far it got, its words. */
  get noteTip(): string {
    const note = this.noteWords
    if (this.review.draft()) return this.translationForKey("noteDraft", { note })
    return this.translationForKey(this.isNoteSent ? "noteSent" : "noteUnsent", { note })
  }

  ////////////////
  // ## The note box
  ////////////////

  /** Its draft's save:  saved (`at`, when), failed (`ok: false`), or nothing to say. */
  @E.state accessor saved: SaveState | undefined = this.startingSave()

  /** The note's `<textarea>`, once drawn. */
  private noteInput: HTMLTextAreaElement | undefined

  /** The timer saving a draft once typing stops;  `undefined` with nothing pending. */
  private saveTimer: E.CancelablePromise<unknown> | undefined

  /**
   * The note box (Owen, 2026-10-06, Q8):  Owen's voice, on ivory --
   * a note that grows as it's typed in, a small Saved mark in its corner,
   * and two round buttons stacked at its right:
   * Revisit Later (blue:  revisit soon, the line's Revisit icon), the x (grey:  skip this, nothing to do;
   * Owen, 2026-10-09, in place of Make Todo, which stays on the line);
   * a todo's (`TODO_NOTE_BUTTONS`):  the plane (green), Revisit Later, the x (grey:  drop it), in its line's order.
   * Do Now is the line's (decision Q20):  it takes the note along.
   * - SAVED as typed:  to the inbox as a draft, `DRAFT_SAVE_MS` after the last key,
   *   and at once when the box loses focus or the page goes away (`watchPageHide()`)
   *   - the floppy says Saved (its tooltip:  when), or turns red with why not
   *   - a localStorage backup too, for a save that fails (`ReviewClient.type()`)
   * - a button makes the note a mark, then empties the box;  Escape leaves it, the draft kept (`leaveNote()`)
   * - the button for the element's mark wears the fill rule (`data-mark`, `data-sent`):
   *   dashed until sent, outlined once sent;  the rest a grey outline
   */
  private noteBox(): JSX.Element {
    const mark = () => markButton(this.review.mark())
    return (
      <div
        class={NOTE_BOX}
        part={this.partForName("base")}
        data-mark={mark()}
        data-sent={mark() && this.review.isSent() ? "" : undefined}
      >
        <span class={NOTE_TEXT}>
          <textarea
            ref={this.onNoteDrawn}
            class={NOTE_INPUT}
            rows="2"
            placeholder={this.translationForKey("notePlaceholder")}
            aria-label={this.translationForKey("noteLabel", { id: this.name })}
            onInput={() => this.onInput()}
            onBlur={() => this.flush()}
            onKeyDown={(event: KeyboardEvent) => this.onNoteKey(event)}
          />
          {/* a span around the icon:  `ui-icon`'s host is `display: contents`, which can't be placed */}
          <span
            class={NOTE_SAVED}
            hidden={!this.saved}
            data-failed={this.saved && !this.saved.ok ? "" : undefined}
            title={this.savedTip}
          >
            <ui-icon name="floppy disk outline" />
          </span>
        </span>
        <span class={NOTE_ACTIONS}>
          <For each={NOTE_BUTTONS_OF[this.buttons ?? "item"]}>{(spec) => this.noteButton(spec)}</For>
        </span>
      </div>
    )
  }

  /** One note box button. */
  private noteButton(spec: NoteButtonSpec): JSX.Element {
    return (
      <button
        type="button"
        data-how={spec.how}
        data-color={spec.color}
        title={this.translationForKey(spec.label)}
        aria-label={this.translationForKey(spec.tip)}
        onClick={() => this.use(spec.how)}
      >
        <ui-icon name={spec.icon} />
      </button>
    )
  }

  /** The note's `<textarea>`, as it's drawn:  kept, and given what's typed so far. */
  @E.untracked
  private readonly onNoteDrawn = (note: HTMLTextAreaElement) => {
    this.noteInput = note
    note.value = this.review.typed()
  }

  /** What's typed in its note box, by the inbox's client:  `onTypedElsewhere()` follows it. */
  get typed(): string {
    return this.review.typed()
  }

  /** What's typed changed elsewhere (a request called off, Edit):  put back in the box, unless it's being typed in. */
  @E.onChange("typed")
  protected onTypedElsewhere(text: string) {
    const note = this.noteInput
    if (note && note.value !== text && (!note.value || !note.matches(":focus"))) note.value = text
  }

  /**
   * The page going away:  a pending draft saved (`keepalive`);  the box gone (disconnected), saved too
   * (an item without details, folded by its chevron).  Only the note box.
   */
  @E.whileConnected
  protected watchPageHide() {
    if (this.shows !== "note") return undefined
    const onPageHide = () => this.flush({ keepalive: true })
    window.addEventListener("pagehide", onPageHide)
    return () => {
      window.removeEventListener("pagehide", onPageHide)
      this.flush()
    }
  }

  /** A key typed:  kept and backed up at once, saved to the inbox once typing stops. */
  @E.untracked
  private onInput() {
    this.review.client?.type(this.review.id(), this.noteInput!.value)
    this.saved = undefined
    this.saveTimer?.cancel()
    this.saveTimer = E.after(DRAFT_SAVE_MS / 1000, () => void this.saveDraft())
  }

  /** Escape:  leave the box, the draft saved. */
  @E.untracked
  private onNoteKey(event: KeyboardEvent) {
    if (event.key !== "Escape") return
    event.stopPropagation()
    this.flush()
    this.noteInput!.blur()
    this.leaveNote()
  }

  /** A note box button:  the note becomes a mark (an action chosen:  `epic-chosen`);  the box empties. */
  @E.untracked
  private use(how: NoteHow) {
    this.saveTimer?.cancel()
    this.saveTimer = undefined
    const note = this.noteInput!
    const text = note.value.trim()
    note.value = ""
    this.saved = undefined
    void this.review.client?.useNote(this.review.id(), how, text)
    // an action chosen:  an item folds
    this.send(CHOSEN, { of: this.review.id() })
    this.leaveNote()
  }

  /**
   * Done with the note box:  under an item's line (`under-line`), it closes;
   * else it stays, but stops counting as written in once it's empty.  The draft is kept either way.
   */
  @E.untracked
  private leaveNote() {
    const client = this.review.client
    if (!client) return
    if (this.underLine || !this.noteInput?.value.trim()) client.closeBox(this.review.id(), false)
  }

  /** Save a pending draft now (`keepalive`:  the page is going away). */
  private flush({ keepalive = false } = {}) {
    if (!this.saveTimer) return
    this.saveTimer.cancel()
    void this.saveDraft({ keepalive })
  }

  /** Save the note as the element's draft;  the floppy says how it went. */
  private async saveDraft({ keepalive = false } = {}) {
    this.saveTimer = undefined
    const client = this.review.client
    const note = this.noteInput
    if (!client || !note) return
    const text = note.value
    const ok = await client.saveDraft(this.review.id(), text, { keepalive })
    if (note.value !== text) return
    if (!ok) this.saved = { ok: false }
    else this.saved = text.trim() ? { ok: true, at: new Date().toISOString() } : undefined
  }

  /** The floppy's tooltip:  when it was saved, or why not. */
  get savedTip(): string {
    const state = this.saved
    if (!state) return ""
    if (state.ok) return this.translationForKey("saved", { time: clockOf(state.at) })
    return this.translationForKey("notSaved", { why: this.review.lastWriteError })
  }

  /** What the floppy starts with:  Saved, when there's a saved draft. */
  @E.untracked
  private startingSave(): SaveState | undefined {
    const draft = this.review.draft()
    return draft ? { ok: true, at: draft.at } : undefined
  }

  ////////////////
  // ## A marked note
  ////////////////

  /**
   * A marked note, its box closed (epic `windows-and-review` P1:  a note must never seem lost):
   * ONE line, the note, then "revisit soon · sent 10:42" small at its end,
   * then Edit (an icon), which puts it back in the box.
   * - a changed note is unsent again until the next send
   * - draws nothing while there's no marked note, a draft, or the box is being written in
   *   (`ReviewState.noted()`, which the family reads too, to draw it at all)
   */
  private said(): JSX.Element {
    return (
      <Show when={this.review.noted()}>
        {(mark) => (
          <div class={SAID} part={this.partForName("base")} aria-label={this.translationForKey("you")}>
            <ui-icon name="comment" />
            <p class={SAID_NOTE}>{mark().note}</p>
            <span class={SAID_WHAT}>{this.what(mark())}</span>
            <button
              type="button"
              class={SAID_EDIT}
              title={this.translationForKey("edit")}
              aria-label={this.translationForKey("edit")}
              onClick={() => this.takeToNote(this.review.mark()?.note)}
            >
              <ui-icon name="edit" />
            </button>
          </div>
        )}
      </Show>
    )
  }

  /** `revisit soon · sent 10:42`. */
  private what(mark: InboxMark): string {
    const how = this.translationForKey(HOW_KEYS[mark.action] ?? (mark.when === "now" ? "howNow" : "howSoon"))
    if (!this.review.isSent()) return this.translationForKey("saidUnsent", { how })
    const sent = mark.when === "now" ? mark.at : this.review.client?.inbox.sent
    return this.translationForKey("saidSent", { how, time: clockOf(sent) })
  }

  ////////////////
  // ## Taking the reader to the note box
  ////////////////

  /**
   * Take the reader to the note box (Revisit;  Edit, with the marked `note`):
   * the box opens (`ReviewClient.openBox()`), `epic-show-note` asks the family to show it (it unfolds, or opens a
   * box by itself under its line), then the note takes the focus -- each frame until it can (details just opened may
   * not be drawn yet, a part may still be loading), for `FOCUS_HOLD_MS` at most.
   * - Edit (`note`):  the marked note goes back in the box, unless something is typed there already
   */
  @E.untracked
  private takeToNote(note?: string) {
    const client = this.review.client
    if (!client) return
    const id = this.review.id()
    if (note && !client.typedOf(id)) client.type(id, note)
    client.openBox(id)
    this.send(SHOW_NOTE, { of: id })
    const until = performance.now() + FOCUS_HOLD_MS
    const focus = () => {
      const box = this.noteBeside()
      box?.focus({ preventScroll: true })
      const focused = !!box && box.matches(":focus")
      if (!focused && performance.now() < until) E.beforeNextPaint(focus)
    }
    E.beforeNextPaint(focus)
  }

  /** The note's `<textarea>` of the note box beside it:  the `<epic-review shows="note">` of the same `of`, if drawn. */
  private noteBeside(): HTMLTextAreaElement | undefined {
    const root = this.domElement.getRootNode() as ParentNode
    const selector = `${this.domElement.localName}[shows="note"][of="${CSS.escape(this.of ?? "")}"]`
    const box = root.querySelector<E.DOMElement<EpicReview>>(selector)
    return box?.component?.noteInput
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicReview extends E.AttributeValues<EpicReviewVocabulary> {}

/** A note box's draft save, as its floppy shows it. */
type SaveState = { ok: boolean; at?: string }

/** A marked note's kind, by its mark's action;  a revisit's is by its `when`. */
const HOW_KEYS: Partial<Record<string, "howTodo" | "howNext" | "howDrop" | "howSkip">> = {
  todo: "howTodo",
  next: "howNext",
  drop: "howDrop",
  skip: "howSkip"
}

/**
 * The note box button `mark` stands for:  the x (`skip`;  a todo's `drop`), a todo's plane (`next`), `soon` (Later);
 * else none (a Make Todo or a Do Now is the line's).
 */
function markButton(mark: InboxMark | undefined): NoteHow | undefined {
  if (mark?.action === "skip" || mark?.action === "next" || mark?.action === "drop") return mark.action
  if (mark?.action === "revisit" && !isImmediate(mark)) return "soon"
  return undefined
}
