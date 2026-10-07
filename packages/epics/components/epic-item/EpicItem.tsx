import { Show, createEffect, createMemo, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import {
  Cell,
  IconGlyph,
  proto,
  SlotContent,
  SOURCE_FAILURE_KEYS,
  SourceBody,
  SourceBodyHost,
  UIElement,
  UIT
} from "$/ui/core"

import { epicItemVocabulary } from "./epic-item.vocabulary.en"
import { EpicItemFallback } from "./epic-item.fallback"
import { Chevron } from "./Chevron"
import { NoteBox, ReviewButtons, SaidNote, takeToNote } from "./ReviewControls"
import { ReviewState } from "./ReviewState"
import {
  BED_ICON,
  BEFORE_MATCH,
  CALM_ID,
  CANCELED,
  CELL,
  CHIP,
  CLOSED_STATUSES,
  COMMIT_TAG,
  COMMITS_PROPERTY,
  DETAILS,
  DETAILS_ID,
  EPIC_TAG,
  EXTRAS,
  FLOW_TAGS,
  FOLD,
  GIT,
  HAS_DETAILS,
  ITEM_STATES,
  LABEL,
  LINE,
  MORE_TAG,
  NOTE,
  OVERNIGHT,
  REVIEW,
  REVIEW_BUTTONS,
  STATE_TIP_KEYS,
  TITLE,
  TOGGLE,
  UNDER_LINE,
  UNFOLDED,
  UNTIL_FOUND,
  type EpicItemVocabulary,
  type ItemState,
  type ReviewLabel,
  type ReviewTextKey
} from "./epic-item.types"

import itemCSS from "./epic-item.css?inline"
import reviewCSS from "./review-controls.css?inline"

/****************
 * ### `<epic-item>`
 * One item -- question, judgement call, caveat, todo, issue or test -- its kind its id's letter (Q11).
 * - Its LINE, in the shadow root:  the fold chevron (only with details), the id chip (`Q7`, a link to `#q7`) in its
 *   state's colour, the title (`title`, or `slot="title"`), the bed icon (`overnight`:  made overnight), the git icon
 *   (with commits), the review label (`reviewed 10-06`, `deferred`, `to do`) and the review buttons.  Sticky while
 *   open, under the section titles stuck above it.
 * - `calm`:  an open judgement call or issue not reviewed yet is blue (`open`), not red (`attention`).
 * - Its COMMITS (`<epic-commit>` children, or `commits` while its part isn't in):  hidden until the page's git toggle
 *   shows every commit;  its git icon shows just its own (T17, the old runtime's `plan-git-hint`), opening it first,
 *   and hides them again.  Through the same custom property, set on its details:  off, it sets nothing, so the
 *   page's toggle still shows them.
 * - Its DETAILS:  its light-DOM children, through the default slot, so find-in-page, `#d7` links and the live update
 *   see them (Q12);  hidden `until-found` while folded.  Over its own text, `Original question` (answered) or
 *   `Original reply` (with a More Details card);  under them the note box.
 * - Review (P9, `ReviewControls.tsx`):  only while the page is reviewed (served with a token, its inbox answering:
 *   `ReviewState`).  Approve, Make Todo, Revisit, Add Details Now at the line's end, the review label in their
 *   tooltips (not beside them:  Owen, 2026-10-07);  the note box LAST in its details, whatever its state, sticky at
 *   the window's bottom while it's open and taller than the window, or, without details, under its line once
 *   Revisit opens it;  a marked note just above the box, with Edit.  The id chip of an item Owen may call urgent or
 *   not (`canCalm`) is a button:  urgent <-> not urgent, through the inbox (`ReviewClient.toggleCalm()`).  All in
 *   the shadow root:  a part reloaded keeps a half-typed note.
 * - Folding:  `open` (page state, never in the file);  a click on the line (not on a link or control in it) or
 *   Enter / Space on the chevron go through the cancelable `ui-open` / `ui-close`.  A link to the item, to an id
 *   in `part-ids`, or to an element inside it opens it, as does find-in-page.
 * - Source:  `source="parts/q7.html"` is fetched the first time it opens (`SourceBody`, as `<ui-section source>`),
 *   into its LIGHT children, replacing the placeholder;  `ui-load` then.  From `file://` it can't load:  the
 *   `Loads from ... (needs the page server)` note, as today.
 * - The host's own `title` would show as a tooltip over everything in it, prose included:  the shadow wrapper's
 *   EMPTY `title` stops it there (T8).
 * - SIDE EFFECT:  with `source`, replaces its own light children (the placeholder) with the part;  listens for
 *   `hashchange` while connected.
 ****************/
export class EpicItem extends UIElement<EpicItemVocabulary> {
  @proto static vocabulary = epicItemVocabulary
  @proto static styles = { item: itemCSS, review: reviewCSS }
  @proto static Fallback = EpicItemFallback
  @proto static Host = SourceBodyHost
  // a container:  a click on its text must not jump to the fold button or a link inside
  @proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** Light-DOM slot occupancy:  has it details? */
  readonly slots = new SlotContent(this.host)

  /** `open`:  the host's. */
  readonly openState = this.controlled("open", false)

  /** What its light children start with, and whether a More Details card is among them:  for its label. */
  readonly childScan = new Cell(untrack(() => this.scanChildren()))

  /** Its view of the page's review inbox. */
  readonly reviewState = new ReviewState(() => this.attrs.id)

  /** The note box's `<textarea>`, once drawn:  Revisit and Edit focus it. */
  private noteInput: HTMLTextAreaElement | undefined

  /** Its own commits show (its git icon pressed). */
  readonly showCommits = new Cell(false)

  /** The git icon's glyph. */
  readonly gitGlyph = new IconGlyph(this, () => "git")

  /** The bed icon's glyph:  made overnight. */
  readonly bedGlyph = new IconGlyph(this, () => (this.attrs.overnight ? BED_ICON : undefined))

  /** Its details from `source`, loaded the first time it opens;  into the host's light DOM. */
  readonly body = new SourceBody({
    host: this.host,
    source: () => untrack(() => this.attrs.source) || undefined,
    select: () => undefined,
    target: () => this.host,
    emit: (name, detail) => this.emit(name as never, detail)
  })

  ////////////////
  // ## Derived state
  ////////////////

  /**
   * May Owen call it urgent or not (its id chip, while the page is reviewed)?  An open judgement call or issue, not
   * reviewed, nothing queued or under way:  the items red for want of a review (`PlanReader.itemState()`).
   */
  readonly canCalm = createMemo(() => {
    const { id, status, reviewed, queued, working } = this.attrs
    return CALM_ID.test(id ?? "") && status === "open" && !reviewed && !queued && !working
  })

  /**
   * Where it stands:  `state` as the script wrote it, else `old` once closed, `open` before.
   * - Owen's urgency, not applied yet (its id chip clicked):  `open` (blue) when not urgent, `attention` (red) when
   *   urgent, at once
   */
  readonly itemState = createMemo((): ItemState => {
    const urgency = this.reviewState.urgency()
    if (urgency && this.canCalm()) return urgency.calm ? "open" : "attention"
    const state = this.attrs.state
    if (state && (ITEM_STATES as readonly string[]).includes(state)) return state
    return (CLOSED_STATUSES as readonly string[]).includes(this.attrs.status ?? "") ? "old" : "open"
  })

  /** Is its id chip a button (urgent <-> not urgent) now?  Only while the page is reviewed. */
  readonly chipToggles = createMemo(() => this.reviewState.reviewing() && this.canCalm())

  /** Has details to fold:  a `source`, or children in the default slot. */
  readonly hasDetails = createMemo(() => !!this.attrs.source || this.slots.has(""))

  /** Unfolded. */
  readonly isOpen = createMemo(() => !!this.openState.get() && this.hasDetails())

  /** Details box held closed while the `source` part is on its way. */
  readonly veiled = createMemo(() => !isServer && !!this.attrs.source && this.body.veiled())

  /** Its id as shown:  `Q7`. */
  readonly label = createMemo(() => (this.attrs.id ?? "").toUpperCase())

  /** The review label, from its marks:  `to do`, else `deferred`, else `reviewed 10-06`;  none when unmarked. */
  readonly review = createMemo((): ReviewLabel | undefined => {
    const { queued, deferred, reviewed, work } = this.attrs
    if (queued) return { words: this.text("reviewTodo"), look: "todo", tip: work || undefined }
    if (deferred) {
      return { words: this.text("reviewDeferred"), look: "deferred", tip: this.text("tipDeferred", { date: deferred }) }
    }
    if (reviewed) {
      const look = this.itemState() === "recent" ? "recent" : "old"
      return { words: this.text("reviewed", { date: reviewed.slice(5) }), look }
    }
    return undefined
  })

  /** Lists commits:  `commits` (its part not in yet), or `<epic-commit>` children. */
  readonly hasCommits = createMemo(() => !!this.attrs.commits || this.childScan.get().hasCommits)

  /**
   * The review label, in words, for the review buttons' tooltips (`Approve · reviewed 10-07`):  while the page is
   * reviewed, the buttons say it, not a label beside them (Owen, 2026-10-07).
   */
  readonly reviewTip = createMemo((): string | undefined => {
    const { queued, work, deferred, reviewed } = this.attrs
    if (queued) return this.text("tipTodo", { work: work || queued })
    if (deferred) return this.text("tipDeferred", { date: deferred.slice(5) })
    if (reviewed) return this.text("reviewed", { date: reviewed.slice(5) })
    return undefined
  })

  /** Anything at the end of the line:  the bed and git icons, a review label, or the review buttons. */
  readonly hasExtras = createMemo(
    () => !!this.attrs.overnight || this.hasCommits() || !!this.review() || this.reviewState.reviewing()
  )

  /**
   * The id chip's tooltip:  where it stands, then its review marks (`Needs attention · not reviewed yet`);  while it
   * toggles, what a click does (and an urgency not sent yet).
   */
  readonly chipTip = createMemo(() => {
    const { queued, work, reviewed, deferred, status } = this.attrs
    const parts = [this.text(STATE_TIP_KEYS[this.itemState()])]
    if (queued) parts.push(this.text("tipTodo", { work: work || queued }))
    if (reviewed) parts.push(this.text("tipReviewed", { date: reviewed }))
    else if (deferred) parts.push(this.text("tipDeferred", { date: deferred }))
    else if (status === "open") parts.push(this.text("tipNotReviewed"))
    if (this.chipToggles()) {
      const urgency = this.reviewState.urgency()
      if (urgency && !urgency.sent) parts.push(this.text("tipUrgencyUnsent"))
      parts.push(this.text(this.itemState() === "attention" ? "tipMakeCalm" : "tipMakeUrgent"))
    }
    return parts.join(" · ")
  })

  /** `Original question` / `Original reply` over its own text, or none. */
  readonly textLabel = createMemo((): string | undefined => {
    const { startsWithProse, hasMore } = this.childScan.get()
    if (!startsWithProse) return undefined
    if (this.attrs.answered) return this.text("originalQuestion")
    return hasMore ? this.text("originalReply") : undefined
  })

  /** The note when the `source` part failed;  else `undefined`. */
  readonly failureText = createMemo(() => {
    const failure = this.body.failure.get()
    if (!failure) return undefined
    const key = SOURCE_FAILURE_KEYS[failure.kind] ?? SOURCE_FAILURE_KEYS.load
    return this.text(key as never, { source: this.attrs.source ?? "" })
  })

  ////////////////
  // ## Element hooks
  ////////////////

  /**
   * Words after the noun:  its state (`item attention`), `canceled`, `has-details`, `unfolded`.
   * - NOTE: `unfolded`, not `open`:  `open` is a state (blue) already;  of the statuses only `canceled` looks
   *   different (struck through), so only it is a word here.
   */
  protected extraClasses(): string | undefined {
    const canceled = this.attrs.status === CANCELED
    return [this.itemState(), canceled && CANCELED, this.hasDetails() && HAS_DETAILS, this.isOpen() && UNFOLDED]
      .filter(Boolean)
      .join(" ")
  }

  protected hostStates() {
    const status = this.body.status.get()
    return {
      open: this.isOpen(),
      loaded: status === "loaded",
      error: status === "error",
      commits: this.showCommits.get() && this.hasCommits()
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Load the `source` part whenever it's open and connected;  follow links to it and its children's changes.
   * - In `mount()`, not `render()`:  effects outside the drawing.
   */
  mount(): JSX.Element {
    if (!isServer) {
      createEffect(
        () => ({ source: this.attrs.source, open: this.isOpen(), connected: this.connected.get() }),
        ({ source, open, connected }) => {
          if (source && open && connected) this.body.load().catch(() => undefined)
        }
      )
      // the inbox's changes, while connected (kept alive, a removed item must stop listening)
      createEffect(
        () => this.connected.get(),
        (connected) => (connected ? this.reviewState.connect() : undefined)
      )
      onSettled(() => {
        const observer = new MutationObserver(() => this.childScan.set(this.scanChildren()))
        observer.observe(this.host, { childList: true, characterData: true, subtree: true })
        this.childScan.set(this.scanChildren())
        window.addEventListener("hashchange", this.followHash)
        this.followHash()
        return () => {
          observer.disconnect()
          window.removeEventListener("hashchange", this.followHash)
        }
      })
    }
    return super.mount()
  }

  render(): JSX.Element {
    return (
      // an EMPTY title:  the host's `title` would otherwise be a tooltip over all of it (T8)
      <div class={this.classes()} part={this.part("base")} title="">
        {this.renderLine()}
        <Show when={this.reviewState.reviewing() && !this.hasDetails()}>
          <div class={UNDER_LINE}>
            {this.saidNote()}
            <Show when={this.reviewState.boxOpen()}>{this.noteBox()}</Show>
          </div>
        </Show>
        <div
          ref={(element) => element.addEventListener(BEFORE_MATCH, this.onBeforeMatch)}
          id={DETAILS_ID}
          class={DETAILS}
          part={this.part("details")}
          hidden={!this.isOpen() || this.veiled() ? UNTIL_FOUND : undefined}
          style={this.showCommits.get() ? { [COMMITS_PROPERTY]: "block" } : undefined}
        >
          <Show when={this.failureText()}>
            <p class={NOTE} part={this.part("error")}>
              {this.failureText()}
            </p>
          </Show>
          <Show when={this.textLabel()}>
            <div class={LABEL} part={this.part("label")}>
              {this.textLabel()}
            </div>
          </Show>
          <slot />
          {/* last in every item, whatever its state (Owen, 2026-10-07):  what was noted, then the box */}
          <Show when={this.reviewState.reviewing() && this.hasDetails()}>
            {this.saidNote()}
            {this.noteBox()}
          </Show>
        </div>
      </div>
    )
  }

  /** The line:  chevron, id chip, title, review label, actions. */
  private renderLine(): JSX.Element {
    return (
      <div class={LINE} part={this.part("line")} onClick={this.onLineClick}>
        <span class={[CELL, FOLD]}>
          <Show when={this.hasDetails()}>
            <button
              type={UIT.BUTTON}
              class={TOGGLE}
              part={this.part("toggle")}
              aria-expanded={this.isOpen() ? UIT.TRUE : UIT.FALSE}
              aria-controls={DETAILS_ID}
              aria-label={this.text(this.isOpen() ? "fold" : "unfold", { id: this.label() })}
              title={this.text(this.isOpen() ? "fold" : "unfold", { id: this.label() })}
            >
              <Chevron />
            </button>
          </Show>
        </span>
        <span class={CELL}>
          <Show
            when={this.chipToggles()}
            fallback={
              <a class={CHIP} part={this.part("id")} href={`#${this.attrs.id ?? ""}`} title={this.chipTip()}>
                {this.label()}
              </a>
            }
          >
            <button
              type={UIT.BUTTON}
              class={CHIP}
              part={this.part("id")}
              aria-pressed={this.itemState() === "attention" ? UIT.TRUE : UIT.FALSE}
              data-unsent={this.reviewState.urgency()?.sent === false ? "" : undefined}
              title={this.chipTip()}
              onClick={this.flipUrgency}
            >
              {this.label()}
            </button>
          </Show>
        </span>
        <span class={TITLE} part={this.part("title")}>
          <slot name={this.slot("title")}>{this.attrs.title}</slot>
        </span>
        <span class={[CELL, EXTRAS]} part={this.part("actions")} hidden={!this.hasExtras()}>
          <Show when={this.attrs.overnight}>
            <span
              class={OVERNIGHT}
              part={this.part("overnight")}
              role="img"
              aria-label={this.text("madeOvernight")}
              title={this.text("madeOvernight")}
            >
              {this.bedGlyph.svg()}
            </span>
          </Show>
          <Show when={this.hasCommits()}>{this.gitButton()}</Show>
          <Show when={!this.reviewState.reviewing() && this.review()}>
            {(review) => (
              <span class={[REVIEW, review().look]} part={this.part("review")} title={review().tip}>
                {review().words}
              </span>
            )}
          </Show>
          <Show when={this.reviewState.reviewing()}>
            <ReviewButtons
              review={this.reviewState}
              text={this.reviewText}
              label={this.label()}
              buttons={REVIEW_BUTTONS}
              appliedAs={this.attrs.reviewAs}
              reviewTip={this.reviewTip()}
              part={this.part("review-buttons")}
              onOpenBox={() => this.takeToNote()}
            />
          </Show>
        </span>
      </div>
    )
  }

  /** The git icon:  shows or hides its own commits;  pressed while they show. */
  private gitButton(): JSX.Element {
    const words = () => this.text(this.showCommits.get() ? "hideCommits" : "showCommits")
    return (
      <button
        type={UIT.BUTTON}
        class={GIT}
        part={this.part("git")}
        aria-pressed={this.showCommits.get() ? UIT.TRUE : UIT.FALSE}
        aria-label={words()}
        title={words()}
        onClick={this.flipCommits}
      >
        {this.gitGlyph.svg()}
      </button>
    )
  }

  /** A marked note, its box closed:  just above the note box. */
  private saidNote(): JSX.Element {
    return (
      <SaidNote
        review={this.reviewState}
        text={this.reviewText}
        part={this.part("said")}
        onEdit={() => this.takeToNote(this.reviewState.mark()?.note)}
      />
    )
  }

  /** The note box:  docked at the end of its details, or under its line (an item without details). */
  private noteBox(): JSX.Element {
    return (
      <NoteBox
        review={this.reviewState}
        text={this.reviewText}
        label={this.label()}
        part={this.part("note-box")}
        ref={(note) => (this.noteInput = note)}
        onEscape={() => this.leaveNote()}
        onUsed={() => this.leaveNote()}
      />
    )
  }

  ////////////////
  // ## Review
  ////////////////

  /** Its texts, as the review controls ask for them. */
  private readonly reviewText = (key: ReviewTextKey, params?: Record<string, string | number>) => this.text(key, params)

  /** Take the reader to its note box (Revisit;  Edit, with the marked `note`):  unfolded first, if it has details. */
  private takeToNote(note?: string) {
    takeToNote(
      this.reviewState,
      () => this.reveal(),
      () => this.noteInput,
      note
    )
  }

  /** Done with the note box:  closed under the line;  a docked one stays, but stops counting as written in. */
  private leaveNote() {
    const client = this.reviewState.client
    if (!client) return
    const docked = untrack(this.hasDetails)
    if (!docked || !this.noteInput?.value.trim()) client.closeBox(untrack(this.reviewState.id), false)
  }

  ////////////////
  // ## Source (`SourceBodyHost`)
  ////////////////

  /** Fetch and insert the `source` part now, folded or not;  once per `source`. */
  loadBody(): Promise<void> {
    return this.body.load()
  }

  /** Fetch the `source` part again past the cache, and replace it (the live update). */
  reloadBody(): Promise<void> {
    return this.body.reload()
  }

  ////////////////
  // ## Folding
  ////////////////

  /**
   * Fold or unfold as the user would:  the cancelable `ui-open` / `ui-close` first, then `open`.  True when applied.
   * - Does nothing without details.
   */
  toggle(originalEvent?: Event): boolean {
    if (!untrack(this.hasDetails)) return false
    const opening = !untrack(this.isOpen)
    const detail = { open: opening, item: this.host, originalEvent }
    return this.openState.request(opening, () => this.emit(opening ? "ui-open" : "ui-close", detail))
  }

  /** Unfold for a link or find-in-page:  `ui-open` after the fact (not cancelable). */
  private reveal() {
    if (untrack(this.isOpen) || !untrack(this.hasDetails)) return
    const detail = { open: true, item: this.host }
    const init = { bubbles: true, composed: true, cancelable: false, detail }
    this.host.dispatchEvent(new CustomEvent(this.definition.event("ui-open"), init))
    this.openState.set(true)
  }

  /** The git icon, clicked:  its commits shown (it opens, loading its part) or hidden again;  the line doesn't fold. */
  private readonly flipCommits = () => {
    const on = !untrack(() => this.showCommits.get())
    this.showCommits.set(on)
    if (on) this.reveal()
  }

  /** The id chip clicked while it toggles:  urgent <-> not urgent;  the line doesn't fold. */
  private readonly flipUrgency = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    this.reviewState.toggleCalm(!!untrack(() => this.attrs.calm))
  }

  /** A click on the line:  folds, unless it landed on a link or control (the id chip, P9's buttons). */
  private readonly onLineClick = (event: MouseEvent) => {
    for (const target of event.composedPath()) {
      if (!(target instanceof Element)) continue
      if (target.classList.contains(TOGGLE) || target.classList.contains(LINE)) break
      if (target.matches(CONTROLS)) return
    }
    // a drag that selected text in the title isn't a click on it
    if (String(window.getSelection() ?? "")) return
    this.toggle(event)
  }

  /** Find-in-page matched inside the folded details:  the browser has revealed them;  adopt it. */
  private readonly onBeforeMatch = () => {
    this.reveal()
  }

  /**
   * The page's `#hash` names this item, an id in its `part-ids`, or an element inside it:  open it;  a part id lands
   * once the part is in.
   */
  private readonly followHash = () => {
    const target = decodeURIComponent(location.hash.slice(1))
    if (!target) return
    const partIds = (untrack(() => this.attrs.partIds) ?? "").split(/\s+/)
    if (partIds.includes(target)) {
      this.reveal()
      this.body
        .load()
        .then(() => document.getElementById(target)?.scrollIntoView())
        .catch(() => undefined)
      return
    }
    const element = target === this.host.id ? this.host : document.getElementById(target)
    if (element && this.host.contains(element)) this.reveal()
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Its light children, read now:  does the default slot start with prose?  Is there a More Details card? */
  private scanChildren(): ChildScan {
    let first: "prose" | "part" | undefined
    for (const node of this.host.childNodes) {
      if (first) break
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) first = "prose"
      if (node.nodeType !== Node.ELEMENT_NODE) continue
      const element = node as Element
      if (element.hasAttribute("slot")) continue
      const tag = element.localName
      first = EPIC_TAG.test(tag) && !FLOW_TAGS.includes(tag) ? "part" : "prose"
    }
    return {
      startsWithProse: first === "prose",
      hasMore: !!this.host.querySelector(`:scope > ${MORE_TAG}`),
      hasCommits: !!this.host.querySelector(`:scope > ${COMMIT_TAG}`)
    }
  }
}

/** `EpicItem.scanChildren()`'s answer. */
type ChildScan = {
  /** the default slot's first content is prose (its text), not one of its parts */
  startsWithProse: boolean
  /** a More Details card is among its children */
  hasMore: boolean
  /** a commit is among its children */
  hasCommits: boolean
}

/** What, on the line, acts by itself:  a click there doesn't fold. */
const CONTROLS = "a[href], button, input, select, textarea, label, summary, [role='button'], [contenteditable]"
