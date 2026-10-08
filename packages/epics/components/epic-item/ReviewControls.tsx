import { For, Show, createEffect, createSignal, onSettled, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { UIT } from "$/ui/core"

import { DRAFT_SAVE_MS, FOCUS_HOLD_MS, NOBODY_LISTENING, clockOf, type InboxMark } from "$/epics/review"

import {
  NOTE_ACTIONS,
  NOTE_BOX,
  NOTE_BUTTONS,
  NOTE_INPUT,
  NOTE_SAVED,
  NOTE_TEXT,
  REVIEW_CONTROLS,
  REVIEW_DETAILS,
  REVIEW_GROUP,
  REVIEW_NOTED,
  REVIEW_PICK,
  SAID,
  SAID_EDIT,
  SAID_NOTE,
  SAID_WHAT,
  type NoteHow,
  type ReviewButtonSpec,
  type ReviewText
} from "./epic-item.types"
import type { ReviewState } from "./ReviewState"

/*
 * The review controls (P9), drawn by `<epic-item>` in its line and details, and by an Overview `<epic-section>` in
 * its title and body (decision Q14):  the same pieces, the same look (`review-controls.css`, adopted by both).
 * - Plain Solid components, no element of their own:  each takes its element's `ReviewState` and `text()`.
 * - Shown only while the page is reviewed:  the CALLER wraps them in `<Show when={review.reviewing()}>`.
 */

/****************
 * ### `<ReviewButtons>`
 * The controls at the end of a line:  the note bubble (what Owen wrote, its words as the tooltip), a pick's letter,
 * the state buttons in a group (Approve, Make Todo, Revisit), then Add Details Now on its own.
 * - unchosen:  a grey outline;  chosen:  filled in its colour (green decided, orange pending);  sent:  outlined in
 *   it;  the button of an earlier mark Claude applied (`appliedAs`) stays outlined
 * - an immediate request at work:  its button's spinner (`loading`);  queued with nobody listening:  a still,
 *   dashed ring.  Clicked while it spins:  "nevermind"
 * - Revisit asks the element to take the reader to the note box (`onOpenBox`)
 * - tooltips:  the plain browser ones (`title`), just the name (Q8), then the element's review label
 *   (`Approve · reviewed 10/7/26`:  Owen, 2026-10-07, in place of the label beside them);  a screen reader hears the
 *   state too
 ****************/
export function ReviewButtons(props: ReviewButtonsProps) {
  const group = () => props.buttons.filter((spec) => spec.action !== "details")
  const details = () => props.buttons.find((spec) => spec.action === "details")
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
            data-color={props.review.mark()?.action === "revisit" ? "orange" : "green"}
            data-sent={props.review.isSent() ? "" : undefined}
            title={props.text(props.review.isSent() ? "pickedSent" : "pickedUnsent", { letter: pick() })}
          >
            {pick()}
          </span>
        )}
      </Show>
      <ui-buttons class={REVIEW_GROUP} basic="" icon="" size="mini">
        <For each={group()}>{(spec) => button(spec)}</For>
      </ui-buttons>
      <Show when={details()}>{(spec) => button(spec(), REVIEW_DETAILS)}</Show>
    </span>
  )

  /** One review button, as its action stands. */
  function button(spec: ReviewButtonSpec, extra?: string): JSX.Element {
    const chosen = () => props.review.mark()?.action === spec.action
    const applied = () => !props.review.mark() && props.appliedAs === spec.action
    const spinning = () => props.review.running()?.action === spec.action
    const queued = () => spinning() && !!props.review.running()?.queued
    return (
      <ui-button
        class={extra}
        basic={extra ? "" : undefined}
        size={extra ? "mini" : undefined}
        icon={spec.icon}
        data-action={spec.action}
        data-color={spec.color}
        data-chosen={chosen() || applied() ? "" : undefined}
        data-sent={(chosen() && props.review.isSent()) || applied() ? "" : undefined}
        data-waiting={queued() ? "" : undefined}
        loading={spinning() && !queued() ? "" : undefined}
        title={spinning() && !queued() ? props.text("callOff", { label: props.text(spec.label) }) : name(spec)}
        aria-label={`${props.text(spec.label)} · ${state(spec, chosen(), applied(), spinning(), queued())}`}
        onClick={(event: MouseEvent) => {
          // the line's own click would fold it
          event.preventDefault()
          event.stopPropagation()
          if (props.review.press(spec.action) === "open-box") props.onOpenBox()
        }}
      />
    )
  }

  /** A button's plain tooltip:  its name, then the element's review label (`Approve · reviewed 10/7/26`). */
  function name(spec: ReviewButtonSpec): string {
    const label = props.text(spec.label)
    return props.reviewTip ? `${label} · ${props.reviewTip}` : label
  }

  /** A button's state, for a screen reader. */
  function state(spec: ReviewButtonSpec, chosen: boolean, applied: boolean, spinning: boolean, queued: boolean) {
    if (queued) return props.text("waiting", { why: NOBODY_LISTENING })
    if (spinning) return props.text(spec.action === "revisit" ? "revisiting" : "detailing")
    if (chosen) return props.text(props.review.isSent() ? "chosenSent" : "chosenUnsent")
    if (applied) return props.text("doneBefore")
    const tip = props.text(spec.tip)
    return spec.action === "details" && !props.review.listening() ? `${tip}.  ${NOBODY_LISTENING}` : tip
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
  /** how Claude applied an earlier mark (`review-as`):  that button stays outlined */
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
 * The note box (Owen, 2026-10-06, Q8):  a note that grows as it's typed in, a small Saved mark in its corner, and three
 * round buttons stacked at its right:  Revisit Later (orange:  revisit soon, the line's Revisit icon), Do Now (blue:
 * revisit now), Make Todo (green).
 * - SAVED as typed:  to the inbox as a draft, `DRAFT_SAVE_MS` after the last key, and at once when the box loses focus
 *   or the page goes away;  the floppy says Saved (its tooltip:  when), or turns red with why not;  a localStorage
 *   backup too, for a save that fails (`ReviewClient.type()`)
 * - a button makes the note a mark, then empties the box;  Escape leaves it, the draft kept (`onEscape`)
 * - the button for the element's mark is filled (`data-mark`)
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
    <div class={NOTE_BOX} part={props.part} data-mark={markButton(review.mark())}>
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
              type={UIT.BUTTON}
              data-how={spec.how}
              title={props.text(spec.label)}
              aria-label={tip(spec.how, props.text(spec.tip))}
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

  /** A note box button's spoken label:  Do Now says when nobody is listening. */
  function tip(how: NoteHow, words: string): string {
    return how === "now" && !review.listening() ? `${words}.  ${NOBODY_LISTENING}` : words
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
            type={UIT.BUTTON}
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

/** The note box button `mark` stands for:  `todo`, `soon` (Later), `now` (Do Now);  else none. */
function markButton(mark: InboxMark | undefined): NoteHow | undefined {
  if (mark?.action === "todo") return "todo"
  if (mark?.action === "revisit") return mark.when === "now" ? "now" : "soon"
  return undefined
}
