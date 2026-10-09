import { For, Show, createEffect, createSignal, onSettled, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { DRAFT_SAVE_MS, FOCUS_HOLD_MS, NOBODY_LISTENING, clockOf, isImmediate, type InboxMark } from "$/epics/review"

import {
  NOTE_ACTIONS,
  NOTE_BOX,
  NOTE_BUTTONS,
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
  type NoteHow,
  type ReviewButtonSpec,
  type ReviewFill,
  type ReviewText
} from "./EpicItem.types"
import type { ReviewState } from "./ReviewState"

/*
 * The review controls (P9), drawn by `<epic-item>` in its line and details;  by an Overview `<epic-section>` (decision
 * Q14) and an `<epic-phase>` (epic `airplane` P2) in their title and body;  by `<epic-summary>` under its lede.
 * - the same pieces, the same look (`ReviewControls.css`, adopted by each)
 * - Plain Solid components, no element of their own:  each takes its element's `ReviewState` and `text()`.
 * - Shown only while the page is reviewed:  the CALLER wraps them in `<Show when={review.reviewing()}>`.
 */

/****************
 * ### `<ReviewButtons>`
 * The controls at the end of a line:  the note bubble (what Owen wrote, its words as the tooltip), a pick's letter,
 * the group (Approve, Revisit, Make Todo), then Do Now apart (decision Q20).
 * - every button shows at every step, its FILL saying how far its mark has got (`ReviewFill`, `fillOf()`):  a grey
 *   outline available;  dashed in its colour pressed, not sent;  outlined sent (a Do Now:  taken);  solid done (the
 *   item's `review-as`, `appliedAs`).  Colours:  green decided (Approve, Make Todo), blue an ask of Claude (Revisit,
 *   Do Now)
 * - work on its way or under way (`ReviewState.busyButton()`):  that button's icon turns while Claude is on it
 *   (`data-busy`);  queued with nobody listening, it stays dashed.  Clicked then:  "nevermind"
 * - Revisit asks the element to take the reader to the note box (`onOpenBox`);  Do Now takes the note in it along
 *   (`ReviewClient.press()`)
 * - tooltips:  the plain browser ones (`title`), just the name (Q8), then the element's review label
 *   (`Approve · reviewed 10/7/26`:  Owen, 2026-10-07, in place of the label beside them);  a screen reader hears the
 *   state too
 ****************/
export function ReviewButtons(props: ReviewButtonsProps) {
  const group = () => props.buttons.filter((spec) => spec.action !== "details")
  const doNow = () => props.buttons.find((spec) => spec.action === "details")
  return (
    <span
      class={REVIEW_CONTROLS}
      part={props.part}
      role="group"
      aria-label={props.text("reviewControls", { id: props.label })}
    >
      <Show when={noteWords()}>
        <span class={REVIEW_NOTED} data-sent={noteSent() ? "" : undefined} title={noteTip()}>
          <ui-icon name={props.review.draft() ? "comment outline" : "comment"} />
        </span>
      </Show>
      <Show when={props.review.mark()?.pick}>
        {(pick) => (
          <span
            class={REVIEW_PICK}
            data-fill={props.review.isSent() ? "outline" : "dashed"}
            title={props.text(props.review.isSent() ? "pickedSent" : "pickedUnsent", { letter: pick() })}
          >
            {pick()}
          </span>
        )}
      </Show>
      <ui-buttons class={REVIEW_GROUP} basic="" icon="" size="mini">
        <For each={group()}>{(spec) => button(spec)}</For>
      </ui-buttons>
      <Show when={doNow()}>{(spec) => button(spec(), REVIEW_DO_NOW)}</Show>
    </span>
  )

  /** One review button, as its action stands. */
  function button(spec: ReviewButtonSpec, extra?: string): JSX.Element {
    const busy = () => props.review.busyButton() === spec.action
    return (
      <ui-button
        class={extra}
        basic={extra ? "" : undefined}
        size={extra ? "mini" : undefined}
        icon={spec.icon}
        data-action={spec.action}
        data-color={spec.color}
        data-fill={fillOf(spec)}
        data-busy={busy() && props.review.workedOn() ? "" : undefined}
        title={busy() ? props.text("callOff", { label: props.text(spec.label) }) : name(spec)}
        aria-label={`${props.text(spec.label)} · ${state(spec)}`}
        onClick={(event: MouseEvent) => {
          // the line's own click would fold it
          event.preventDefault()
          event.stopPropagation()
          if (props.review.press(spec.action) === "open-box") props.onOpenBox()
        }}
      />
    )
  }

  /** How far `spec`'s mark has got:  its fill (`ReviewState.fillOf()`, which the id chip reads too). */
  function fillOf(spec: ReviewButtonSpec): ReviewFill {
    return props.review.fillOf(spec.action, props.appliedAs)
  }

  /** A button's plain tooltip:  its name, then the element's review label (`Approve · reviewed 10/7/26`). */
  function name(spec: ReviewButtonSpec): string {
    const label = props.text(spec.label)
    return props.reviewTip ? `${label} · ${props.reviewTip}` : label
  }

  /** A button's state, for a screen reader. */
  function state(spec: ReviewButtonSpec): string {
    const review = props.review
    if (review.busyButton() === spec.action) {
      if (review.running()?.queued) return props.text("waiting", { why: NOBODY_LISTENING })
      return props.text(review.workedOn() ? "working" : "asked")
    }
    const fill = fillOf(spec)
    if (fill === "dashed") return props.text("chosenUnsent")
    if (fill === "outline") return props.text("chosenSent")
    if (fill === "solid") return props.text("doneBefore")
    const tip = props.text(spec.tip)
    return spec.action === "details" && !review.listening() ? `${tip}.  ${NOBODY_LISTENING}` : tip
  }

  /** What Owen wrote:  the draft, else the mark's note;  `""` for none. */
  function noteWords(): string {
    return props.review.draft()?.note ?? props.review.mark()?.note ?? ""
  }

  /** The note is a mark's, sent. */
  function noteSent(): boolean {
    return !props.review.draft() && !!props.review.mark()?.note && props.review.isSent()
  }

  /** The bubble's tooltip:  whose note, how far it got, its words. */
  function noteTip(): string {
    const note = noteWords()
    if (props.review.draft()) return props.text("noteDraft", { note })
    return props.text(noteSent() ? "noteSent" : "noteUnsent", { note })
  }
}

/** Props for `<ReviewButtons>`. */
export type ReviewButtonsProps = {
  /** the element's view of the inbox */
  review: ReviewState
  /** the element's `text()` */
  text: ReviewText
  /** the element's id as shown (`Q7`, `O1`):  the group's spoken name */
  label: string
  /** which buttons, in their order:  an item's four;  an Overview section's, without Approve */
  buttons: readonly ReviewButtonSpec[]
  /** how Claude handled an earlier mark (`review-as`;  `now`:  Do Now):  that button is solid, done */
  appliedAs?: string
  /** the element's review label in words (`reviewed 10/7/26`), after every button's name in its tooltip */
  reviewTip?: string
  /** the `part` of the controls' box */
  part: string
  /** Revisit was pressed:  take the reader to the note box */
  onOpenBox: () => void
}

/****************
 * ### `<NoteBox>`
 * The note box (Owen, 2026-10-06, Q8):  Owen's voice, on ivory -- a note that grows as it's typed in, a small Saved
 * mark in its corner, and two round buttons stacked at its right:  Revisit Later (blue:  revisit soon, the line's
 * Revisit icon), Make Todo (green).  Do Now is the line's (decision Q20):  it takes the note along.
 * - SAVED as typed:  to the inbox as a draft, `DRAFT_SAVE_MS` after the last key, and at once when the box loses focus
 *   or the page goes away;  the floppy says Saved (its tooltip:  when), or turns red with why not;  a localStorage
 *   backup too, for a save that fails (`ReviewClient.type()`)
 * - a button makes the note a mark, then empties the box;  Escape leaves it, the draft kept (`onEscape`)
 * - the button for the element's mark wears the fill rule (`data-mark`, `data-sent`):  dashed until sent, outlined
 *   once sent;  the rest a grey outline
 * - SIDE EFFECT:  listens for `pagehide` while drawn
 ****************/
export function NoteBox(props: NoteBoxProps) {
  let note: HTMLTextAreaElement | undefined
  let timer = 0
  const review = props.review
  const [saved, setSaved] = createSignal<{ ok: boolean; at?: string } | undefined>(
    untrack(() => (review.draft() ? { ok: true, at: review.draft()!.at } : undefined))
  )
  // what's typed, put back when it changes elsewhere (a request called off, Edit), unless it's being typed in
  createEffect(
    () => review.typed(),
    (text) => {
      if (note && note.value !== text && (!note.value || !note.matches(":focus"))) note.value = text
    }
  )
  onSettled(() => {
    const onPageHide = () => flush({ keepalive: true })
    window.addEventListener("pagehide", onPageHide)
    return () => {
      window.removeEventListener("pagehide", onPageHide)
      clearTimeout(timer)
    }
  })
  return (
    <div
      class={NOTE_BOX}
      part={props.part}
      data-mark={markButton(review.mark())}
      data-sent={markButton(review.mark()) && review.isSent() ? "" : undefined}
    >
      <span class={NOTE_TEXT}>
        <textarea
          ref={(element) => {
            note = element
            element.value = untrack(review.typed)
            props.ref?.(element)
          }}
          class={NOTE_INPUT}
          rows="2"
          placeholder={props.text("notePlaceholder")}
          aria-label={props.text("noteLabel", { id: props.label })}
          onInput={onInput}
          onBlur={() => flush()}
          onKeyDown={onKeyDown}
        />
        {/* a span around the icon:  `ui-icon`'s host is `display: contents`, which can't be placed */}
        <span
          class={NOTE_SAVED}
          hidden={!saved()}
          data-failed={saved() && !saved()!.ok ? "" : undefined}
          title={savedTip()}
        >
          <ui-icon name="floppy disk outline" />
        </span>
      </span>
      <span class={NOTE_ACTIONS}>
        <For each={NOTE_BUTTONS}>
          {(spec) => (
            <button
              type="button"
              data-how={spec.how}
              data-color={spec.color}
              title={props.text(spec.label)}
              aria-label={props.text(spec.tip)}
              onClick={() => use(spec.how)}
            >
              <ui-icon name={spec.icon} />
            </button>
          )}
        </For>
      </span>
    </div>
  )

  /** A key typed:  kept and backed up at once, saved to the inbox once typing stops. */
  function onInput() {
    review.client?.type(review.id(), note!.value)
    setSaved(undefined)
    clearTimeout(timer)
    timer = window.setTimeout(() => void saveDraft(), DRAFT_SAVE_MS)
  }

  /** Escape:  leave the box, the draft saved. */
  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "Escape") return
    event.stopPropagation()
    flush()
    note!.blur()
    props.onEscape?.()
  }

  /** A note box button:  the note becomes a mark;  the box empties. */
  function use(how: NoteHow) {
    clearTimeout(timer)
    timer = 0
    const text = note!.value.trim()
    note!.value = ""
    setSaved(undefined)
    void review.client?.useNote(review.id(), how, text)
    props.onUsed?.()
  }

  /** Save a pending draft now (`keepalive`:  the page is going away). */
  function flush({ keepalive = false } = {}) {
    if (!timer) return
    clearTimeout(timer)
    void saveDraft({ keepalive })
  }

  /** Save the note as the element's draft;  the floppy says how it went. */
  async function saveDraft({ keepalive = false } = {}) {
    timer = 0
    const client = review.client
    if (!client || !note) return
    const text = note.value
    const ok = await client.saveDraft(review.id(), text, { keepalive })
    if (note.value !== text) return
    if (!ok) setSaved({ ok: false })
    else setSaved(text.trim() ? { ok: true, at: new Date().toISOString() } : undefined)
  }

  /** The floppy's tooltip:  when it was saved, or why not. */
  function savedTip(): string {
    const state = saved()
    if (!state) return ""
    if (state.ok) return props.text("saved", { time: clockOf(state.at) })
    return props.text("notSaved", { why: review.lastWriteError })
  }
}

/** Props for `<NoteBox>`. */
export type NoteBoxProps = {
  /** the element's view of the inbox */
  review: ReviewState
  /** the element's `text()` */
  text: ReviewText
  /** the element's id as shown (`Q7`):  the note's spoken name */
  label: string
  /** the `part` of the box */
  part: string
  /** the note's `<textarea>`, as it's drawn:  for focusing it */
  ref?: (note: HTMLTextAreaElement) => void
  /** Escape pressed in it */
  onEscape?: () => void
  /** a button made the note a mark */
  onUsed?: () => void
}

/****************
 * ### `<SaidNote>`
 * A marked note, its box closed (epic `windows-and-review` P1:  a note must never seem lost):  ONE line, the note,
 * then "revisit soon · sent 10:42" small at its end, then Edit (an icon), which puts it back in the box;  a changed note is unsent again until the next
 * send.  Draws nothing while there's no marked note, a draft, or the box is being written in.
 ****************/
export function SaidNote(props: SaidNoteProps) {
  const review = props.review
  const noted = () => (review.mark()?.note && !review.draft() && !review.boxOpen() ? review.mark() : undefined)
  return (
    <Show when={noted()}>
      {(mark) => (
        <div class={SAID} part={props.part} aria-label={props.text("you")}>
          <ui-icon name="comment" />
          <p class={SAID_NOTE}>{mark().note}</p>
          <span class={SAID_WHAT}>{what(mark())}</span>
          <button
            type="button"
            class={SAID_EDIT}
            title={props.text("edit")}
            aria-label={props.text("edit")}
            onClick={() => props.onEdit()}
          >
            <ui-icon name="edit" />
          </button>
        </div>
      )}
    </Show>
  )

  /** `revisit soon · sent 10:42`. */
  function what(mark: InboxMark): string {
    const how = props.text(mark.action === "todo" ? "howTodo" : mark.when === "now" ? "howNow" : "howSoon")
    if (!review.isSent()) return props.text("saidUnsent", { how })
    const sent = mark.when === "now" ? mark.at : review.client?.inbox.sent
    return props.text("saidSent", { how, time: clockOf(sent) })
  }
}

/** Props for `<SaidNote>`. */
export type SaidNoteProps = {
  /** the element's view of the inbox */
  review: ReviewState
  /** the element's `text()` */
  text: ReviewText
  /** the `part` of the block */
  part: string
  /** Edit pressed:  the note back in the box */
  onEdit: () => void
}

////////////////
// ## Helpers
////////////////

/**
 * Take the reader to an element's note box (Revisit, Edit):  `open()` shows it (unfolds the element, or opens a
 * box by itself under its line), then the note takes the focus -- each frame until it can (details just opened may
 * not be drawn yet, a part may still be loading), for `FOCUS_HOLD_MS` at most.
 * - Edit (`note`):  the marked note goes back in the box, unless something is typed there already
 */
export function takeToNote(
  review: ReviewState,
  open: () => void,
  noteBox: () => HTMLTextAreaElement | undefined,
  note?: string
) {
  const client = review.client
  if (!client) return
  const id = untrack(review.id)
  if (note && !client.typedOf(id)) client.type(id, note)
  client.openBox(id)
  open()
  const until = performance.now() + FOCUS_HOLD_MS
  const focus = () => {
    const box = noteBox()
    box?.focus({ preventScroll: true })
    const focused = !!box && box.matches(":focus")
    if (!focused && performance.now() < until) requestAnimationFrame(focus)
  }
  requestAnimationFrame(focus)
}

/** The note box button `mark` stands for:  `todo`, `soon` (Later);  else none (a Do Now is the line's). */
function markButton(mark: InboxMark | undefined): NoteHow | undefined {
  if (mark?.action === "todo") return "todo"
  if (mark?.action === "revisit" && !isImmediate(mark)) return "soon"
  return undefined
}
