import { Show, createMemo } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { PlanDates } from "$/epics/dates"
// its view of the review inbox:  the file, not `epic-review`'s barrel (`index.ts` defines that family)
import { ReviewState } from "$/epics/components/epic-review/ReviewState"
import {
  REVIEW_BUTTONS,
  SHOW_NOTE,
  TODO_BUTTONS,
  type ReviewShows
} from "$/epics/components/epic-review/EpicReview.types"

import { epicItemVocabulary } from "./EpicItem.en"
import { CONTROLS, Fold } from "./Fold"
import {
  BED_ICON,
  CALM_ID,
  CANCELED,
  CELL,
  CHIP,
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
  NOTE_OPEN,
  OVERNIGHT,
  REVIEW,
  STATE_TIP_KEYS,
  STATUS_SLOT,
  STATUS_STATES,
  TITLE,
  TODO_ID,
  TOGGLE,
  UNDER_LINE,
  UNFOLDED,
  type ChipMark,
  type EpicItemVocabulary,
  type ItemState,
  type ReviewLabel
} from "./EpicItem.types"

import itemCSS from "./EpicItem.css?inline"

/****************
 * ### `EpicItem`
 * The component behind `<epic-item>`:  one item -- question, judgement call, caveat, todo, issue or test -- its kind its id's letter (Q11).
 * - Its LINE, in the shadow root:  the fold chevron (only with details),
 *   the id chip (`Q7`, a link to `#q7`) in its state's colour, the title (`title`, or `slot="title"`),
 *   the bed icon (`overnight`:  made overnight), the git icon (with commits),
 *   the review label (`reviewed 10/6/26`, `deferred`, `to do`) and the review buttons.
 *   Sticky while open, under the section titles stuck above it.
 * - `calm`:  an open judgement call or issue not reviewed yet is yellow (`open`), not red (`attention`).
 * - Its COMMITS (`<epic-commit>` children, or `commits` while its part isn't in):  hidden until the page's git toggle
 *   shows every commit;  its git icon shows just its own (T17, the old runtime's `plan-git-hint`), opening it first,
 *   and hides them again.  Through the same custom property, set on its details:  off, it sets nothing, so the
 *   page's toggle still shows them.
 * - Its DETAILS:  its light-DOM children, through the default slot, so find-in-page, `#d7` links and the live update
 *   see them (Q12);  hidden `until-found` while folded.  Over its own text, `Original question` (answered) or
 *   `Original reply` (with a More Details card);  under them Claude's status cards (`<epic-status slot="status">`,
 *   P13), then the note box.
 * - Review (P9, three `<epic-review>`s:  its buttons, its note box, a marked note):
 *   only while the page is reviewed (served with a token, its inbox answering:  `ReviewState`).
 *   Revisit and Edit unfold it to show the box (`epic-show-note`).
 *   Approve, Revisit, Make Todo, then Do Now (the wand) at the line's end;
 *   a todo's:  the plane (do it in the next phase), Revisit, the x (drop it:  Owen, 2026-10-09);
 *   the review label in their tooltips (not beside them:  Owen, 2026-10-07);
 *   the note box LAST in its details, whatever its state, sticky at the window's bottom
 *   while it's open and taller than the window, or, without details, under its line once Revisit opens it
 *   (lined up with where details start;  its chevron then shows, and folding closes the box);
 *   a marked note just above the box, with Edit, and Claude's status cards between the two.
 *   - While it carries a mark (a button dashed or outlined, or a pick), its id chip MATCHES the chosen button:
 *     that button's colour and fill (`chipMark`, Owen, 2026-10-08);  without one, its state's colour, solid.
 *   - Once Claude has handled the mark the buttons CLEAR (Owen's input, taken):  the chip carries the result.
 *   - The id chip of an item Owen may call urgent or not (`canCalm`) is a button:
 *     urgent <-> not urgent, through the inbox (`ReviewClient.toggleCalm()`).
 *   - All in the shadow root:  a part reloaded keeps a half-typed note.
 * - Folding:  `open` (page state, never in the file);  a click on the line (not on a link or control in it) or
 *   Enter / Space on the chevron go through the cancelable `ui-open` / `ui-close`.  A link to the item, to an id
 *   in `part-ids`, or to an element inside it opens it, as does find-in-page.
 * - Source:  `source="parts/q7.html"` is fetched the first time it opens (`LoadableBody`,
 *   as `<ui-section source>`), into its LIGHT children, replacing the placeholder;  `ui-load` then.
 *   From `file://` it can't load:  the `Loads from ... (needs the page server)` note, as today.
 * - The DOM element's own `title` would show as a tooltip over everything in it, prose included:
 *   the shadow wrapper's EMPTY `title` stops it there (T8).
 * - SIDE EFFECT:  with `source`, replaces its own light children (the placeholder) with the part;
 *   listens for `hashchange` while connected.
 ****************/
export class EpicItem extends E.UIComponent<EpicItemVocabulary> {
  @E.proto static vocabulary = epicItemVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-item": itemCSS },
    DOMElement: E.DOMLoadableBodyElement,
    // a container:  a click on its text must not jump to the fold button or a link inside
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## State
  ////////////////

  /** Light-DOM slot occupancy:  has it details? */
  readonly slots = new E.SlotContent(this.domElement)

  /** `open`:  the DOM element's (a boolean is always the DOM element's, see `@controlled`). */
  @E.controlled("open") accessor isMarkedOpen = false

  /**
   * What its light children start with, and whether a More Details card is among them:  for its label.
   * - Follows them as they change.
   */
  @E.fromContent({ childList: true, characterData: true, subtree: true })
  get childScan(): ChildScan {
    return this.scanChildren()
  }

  /** Its view of the page's review inbox:  its chip, its state, where its review controls show. */
  readonly reviewState = new ReviewState(() => this.id)

  /** Its own commits show (its git icon pressed). */
  @E.state accessor showCommits = false

  /** The git icon's glyph. */
  readonly gitGlyph = new E.IconGlyph({ owner: this, name: () => "git" })

  /** The bed icon's glyph:  made overnight. */
  readonly bedGlyph = new E.IconGlyph({ owner: this, name: () => (this.overnight ? BED_ICON : undefined) })

  /** Its details from `source`, loaded the first time it opens;  into the DOM element's light DOM. */
  readonly body = new E.LoadableBody({
    domElement: this.domElement,
    source: () => this.partSource(),
    select: () => undefined,
    target: () => this.domElement,
    send: (name, detail) => this.send(name as never, detail)
  })

  /** Its `source`, for `body`:  untracked, so a load never follows it. */
  @E.untracked
  private partSource(): string | undefined {
    return this.source || undefined
  }

  /** Load the `source` part whenever it's open and connected (`open` alone:  a `source` means details). */
  @E.onChange("source", "isMarkedOpen", "isConnected")
  protected onSourceShown(source: string | undefined, open: boolean, connected: boolean) {
    if (source && open && connected) this.body.load().catch(() => undefined)
  }

  ////////////////
  // ## Derived state
  ////////////////

  /**
   * Its review buttons, in their order:  a todo's three (the plane, Revisit, the x:  Owen, 2026-10-09), else an
   * item's four.  Before `chipMark`, which reads it (memos compute as they're made).
   */
  readonly reviewButtons = createMemo(() => (TODO_ID.test(this.id ?? "") ? TODO_BUTTONS : REVIEW_BUTTONS))

  /**
   * May Owen call it urgent or not (its id chip, while the page is reviewed)?  An open judgement call or issue, not
   * reviewed, nothing queued or under way:  the items red for want of a review (`PlanReader.itemState()`).
   */
  readonly canCalm = createMemo(() => {
    const { id, status, reviewed, queued, working } = this
    return CALM_ID.test(id ?? "") && status === "open" && !reviewed && !queued && !working
  })

  /**
   * Where it stands:  `state` as the script wrote it,
   * else by its status (`STATUS_STATES`:  decided or done `recent`, canceled `old`, else `open`).
   * - Claude's agent at work on it (the review inbox's `working`, the page's live view of it):
   *   `progress` (blue), at once, before the script rewrites `state`
   * - Owen's urgency, not applied yet (its id chip clicked):
   *   `open` (yellow) when not urgent, `attention` (red) when urgent, at once
   */
  readonly itemState = createMemo((): ItemState => {
    if (this.reviewState.workedOn()) return "progress"
    const urgency = this.reviewState.urgency()
    if (urgency && this.canCalm()) return urgency.calm ? "open" : "attention"
    const state = this.state
    if (state && (ITEM_STATES as readonly string[]).includes(state)) return state
    return STATUS_STATES[this.status ?? ""] ?? "open"
  })

  /**
   * Owen's live mark, as its id chip wears it:  the chosen review button's colour and fill (dashed until sent, then
   * outlined), or a pick's (green);  `undefined` without one, so the chip shows its state.
   * - a mark Claude handled is gone from the inbox:  the buttons clear,
   *   and the chip shows the RESULT, solid in its state's colour
   *   (green decided, yellow still open, red needs Owen:  Owen, 2026-10-08;  orange Owen's turn to pick)
   * - the note box's x (`skip`, Owen, 2026-10-09) has no button on the line:  the chip alone shows it, grey
   */
  readonly chipMark = createMemo((): ChipMark | undefined => {
    for (const spec of this.reviewButtons()) {
      const fill = this.reviewState.fillOf(spec.action)
      if (fill === "dashed" || fill === "outline") return { color: spec.color, fill, label: spec.label }
    }
    const mark = this.reviewState.mark()
    const fill = this.reviewState.isSent() ? "outline" : "dashed"
    if (mark?.action === "skip") return { color: "grey", fill, label: "boxSkip" }
    if (!mark?.pick) return undefined
    return { color: "green", fill, label: { pick: mark.pick } }
  })

  /** Is its id chip a button (urgent <-> not urgent) now?  Only while the page is reviewed. */
  readonly chipToggles = createMemo(() => this.reviewState.reviewing() && this.canCalm())

  /** Has details to fold:  a `source`, or children in the default slot or the status cards' (`slot="status"`). */
  readonly hasDetails = createMemo(
    () => !!this.source || this.slots.hasContent("") || this.slots.hasContent(this.slotForName(STATUS_SLOT))
  )

  /** Unfolded. */
  readonly isOpen = createMemo(() => !!this.isMarkedOpen && this.hasDetails())

  /**
   * Its note box is open under its line (an item without details, Revisit pressed):  its chevron shows, unfolded, and
   * folding closes the box, its draft kept (Owen, 2026-10-09:  "note item is not collapsible").
   */
  readonly boxUnderLine = createMemo(
    () => this.reviewState.reviewing() && !this.hasDetails() && this.reviewState.boxOpen()
  )

  /** Has a chevron:  details to fold, or a note box open under its line. */
  readonly foldable = createMemo(() => this.hasDetails() || this.boxUnderLine())

  /** Shows as unfolded:  its details, or its note box under the line. */
  readonly showsOpen = createMemo(() => this.isOpen() || this.boxUnderLine())

  /** Details box held closed while the `source` part is on its way. */
  readonly veiled = createMemo(() => !isServer && !!this.source && this.body.isVeiled)

  /** Its id as shown:  `Q7`. */
  readonly label = createMemo(() => (this.id ?? "").toUpperCase())

  /** The review label, from its marks:  `to do`, else `deferred`, else `reviewed 10/6/26`;  none when unmarked. */
  readonly review = createMemo((): ReviewLabel | undefined => {
    const { queued, deferred, reviewed, work } = this
    if (queued) return { words: this.translationForKey("reviewTodo"), look: "todo", tip: work || undefined }
    if (deferred) {
      const tip = this.translationForKey("tipDeferred", { date: PlanDates.format(deferred) })
      return { words: this.translationForKey("reviewDeferred"), look: "deferred", tip }
    }
    if (reviewed) {
      const look = this.itemState() === "recent" ? "recent" : "old"
      return { words: this.translationForKey("reviewed", { date: PlanDates.format(reviewed) }), look }
    }
    return undefined
  })

  /** Lists commits:  `commits` (its part not in yet), or `<epic-commit>` children. */
  readonly hasCommits = createMemo(() => !!this.commits || this.childScan.hasCommits)

  /**
   * The review label, in words, for the review buttons' tooltips (`Approve · reviewed 10/7/26`):
   * while the page is reviewed, the buttons say it, not a label beside them (Owen, 2026-10-07).
   */
  readonly reviewTip = createMemo((): string | undefined => {
    const { queued, work, deferred, reviewed } = this
    if (queued) return this.translationForKey("tipTodo", { work: work || queued })
    if (deferred) return this.translationForKey("tipDeferred", { date: PlanDates.format(deferred) })
    if (reviewed) return this.translationForKey("reviewed", { date: PlanDates.format(reviewed) })
    return undefined
  })

  /** Anything at the end of the line:  the bed and git icons, a review label, or the review buttons. */
  readonly hasExtras = createMemo(
    () => !!this.overnight || this.hasCommits() || !!this.review() || this.reviewState.reviewing()
  )

  /**
   * The id chip's tooltip:  where it stands, then its review marks (`Needs attention · not reviewed yet`);
   * while it toggles, what a click does (and an urgency not sent yet).
   */
  readonly chipTip = createMemo(() => {
    const { queued, work, reviewed, deferred, status } = this
    const parts = [this.translationForKey(STATE_TIP_KEYS[this.itemState()])]
    const mark = this.chipMark()
    if (mark) {
      const { label } = mark
      const chosen =
        typeof label === "string"
          ? this.translationForKey(label)
          : this.translationForKey("tipPick", { letter: label.pick })
      parts.push(this.translationForKey(mark.fill === "dashed" ? "tipMarkUnsent" : "tipMarkSent", { chosen }))
    }
    if (queued) parts.push(this.translationForKey("tipTodo", { work: work || queued }))
    if (reviewed) parts.push(this.translationForKey("tipReviewed", { date: PlanDates.format(reviewed) }))
    else if (deferred) parts.push(this.translationForKey("tipDeferred", { date: PlanDates.format(deferred) }))
    else if (status === "open") parts.push(this.translationForKey("tipNotReviewed"))
    if (this.chipToggles()) {
      const urgency = this.reviewState.urgency()
      if (urgency && !urgency.sent) parts.push(this.translationForKey("tipUrgencyUnsent"))
      parts.push(this.translationForKey(this.itemState() === "attention" ? "tipMakeCalm" : "tipMakeUrgent"))
    }
    return parts.join(" · ")
  })

  /** `Original question` / `Original reply` over its own text, or none. */
  readonly textLabel = createMemo((): string | undefined => {
    const { startsWithProse, hasMore } = this.childScan
    if (!startsWithProse) return undefined
    if (this.answered) return this.translationForKey("originalQuestion")
    return hasMore ? this.translationForKey("originalReply") : undefined
  })

  /** The note when the `source` part failed;  else `undefined`. */
  readonly failureText = createMemo(() => {
    const failure = this.body.loadError
    if (!failure) return undefined
    const key = E.SOURCE_FAILURE_KEYS[failure.kind] ?? E.SOURCE_FAILURE_KEYS.load
    return this.translationForKey(key as never, { source: this.source ?? "" })
  })

  ////////////////
  // ## Element hooks
  ////////////////

  /**
   * Words before the noun:  its state (`attention item`), `canceled`, `has-details`, `note-open`, `unfolded`.
   * - NOTE: `unfolded`, not `open`:  `open` is a state (yellow) already;  of the statuses only `canceled` looks
   *   different (struck through), so only it is a word here.
   */
  protected get extraClass(): string | undefined {
    const canceled = this.status === CANCELED
    return [
      this.itemState(),
      canceled && CANCELED,
      this.hasDetails() && HAS_DETAILS,
      this.boxUnderLine() && NOTE_OPEN,
      this.isOpen() && UNFOLDED
    ]
      .filter(Boolean)
      .join(" ")
  }

  protected cssStates() {
    const status = this.body.loadStatus
    return {
      open: this.isOpen(),
      loaded: status === "loaded",
      error: status === "error",
      commits: this.showCommits && this.hasCommits()
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The inbox's changes, while connected (kept alive:  a removed item must stop listening). */
  @E.whileConnected
  protected followReviews() {
    return this.reviewState.connect()
  }

  render(): JSX.Element {
    return (
      // an EMPTY title:  the DOM element's `title` would otherwise be a tooltip over all of it (T8)
      <div class={this.rootClass} part={this.partForName("base")} title="">
        {this.renderLine()}
        <Show when={this.reviewState.reviewing() && !this.hasDetails()}>
          <div class={UNDER_LINE}>
            {this.saidNote()}
            <Show when={this.reviewState.boxOpen()}>{this.noteBox()}</Show>
          </div>
        </Show>
        <div
          id={DETAILS_ID}
          class={DETAILS}
          part={this.partForName("details")}
          hidden={!this.isOpen() || this.veiled() ? "until-found" : undefined}
          style={this.showCommits ? { [COMMITS_PROPERTY]: "block" } : undefined}
        >
          <Show when={this.failureText()}>
            <p class={NOTE} part={this.partForName("error")}>
              {this.failureText()}
            </p>
          </Show>
          <Show when={this.textLabel()}>
            <div class={LABEL} part={this.partForName("label")}>
              {this.textLabel()}
            </div>
          </Show>
          <slot />
          {/* last in every item, whatever its state (Owen, 2026-10-07):  what was noted, Claude's status cards under
              it ("under my input", Owen, 2026-10-08, P13), then the box */}
          <Show when={this.reviewState.reviewing() && this.hasDetails()}>{this.saidNote()}</Show>
          <slot name={this.slotForName(STATUS_SLOT)} />
          <Show when={this.reviewState.reviewing() && this.hasDetails()}>{this.noteBox()}</Show>
        </div>
      </div>
    )
  }

  /** The line:  chevron, id chip, title, review label, actions. */
  private renderLine(): JSX.Element {
    return (
      <div class={LINE} part={this.partForName("line")} onClick={this.onLineClick}>
        <span class={[CELL, FOLD]}>
          <Show when={this.foldable()}>
            <button
              type="button"
              class={TOGGLE}
              part={this.partForName("toggle")}
              aria-expanded={this.showsOpen() ? "true" : "false"}
              aria-controls={this.hasDetails() ? DETAILS_ID : undefined}
              aria-label={this.translationForKey(this.showsOpen() ? "fold" : "unfold", { id: this.label() })}
              title={this.translationForKey(this.showsOpen() ? "fold" : "unfold", { id: this.label() })}
            >
              {Fold.chevron()}
            </button>
          </Show>
        </span>
        <span class={CELL}>
          <Show
            when={this.chipToggles()}
            fallback={
              <a
                class={CHIP}
                part={this.partForName("id")}
                href={`#${this.id ?? ""}`}
                data-color={this.chipMark()?.color}
                data-fill={this.chipMark()?.fill}
                title={this.chipTip()}
              >
                {this.label()}
              </a>
            }
          >
            <button
              type="button"
              class={CHIP}
              part={this.partForName("id")}
              data-color={this.chipMark()?.color}
              data-fill={this.chipMark()?.fill}
              aria-pressed={this.itemState() === "attention" ? "true" : "false"}
              data-unsent={this.reviewState.urgency()?.sent === false ? "" : undefined}
              title={this.chipTip()}
              onClick={this.flipUrgency}
            >
              {this.label()}
            </button>
          </Show>
        </span>
        <span class={TITLE} part={this.partForName("title")}>
          <slot name={this.slotForName("title")}>{this.title}</slot>
        </span>
        <span class={[CELL, EXTRAS]} part={this.partForName("actions")} hidden={!this.hasExtras()}>
          <Show when={this.overnight}>
            <span
              class={OVERNIGHT}
              part={this.partForName("overnight")}
              role="img"
              aria-label={this.translationForKey("madeOvernight")}
              title={this.translationForKey("madeOvernight")}
            >
              {this.bedGlyph.svg}
            </span>
          </Show>
          <Show when={this.hasCommits()}>{this.gitButton()}</Show>
          <Show when={!this.reviewState.reviewing() && this.review()}>
            {(review) => (
              <span class={[REVIEW, review().look]} part={this.partForName("review")} title={review().tip}>
                {review().words}
              </span>
            )}
          </Show>
          <Show when={this.reviewState.reviewing()}>{this.reviewControl("buttons", "review-buttons")}</Show>
        </span>
      </div>
    )
  }

  /** The git icon:  shows or hides its own commits;  pressed while they show. */
  private gitButton(): JSX.Element {
    const words = () => this.translationForKey(this.showCommits ? "hideCommits" : "showCommits")
    return (
      <button
        type="button"
        class={GIT}
        part={this.partForName("git")}
        aria-pressed={this.showCommits ? "true" : "false"}
        aria-label={words()}
        title={words()}
        onClick={this.flipCommits}
      >
        {this.gitGlyph.svg}
      </button>
    )
  }

  /** A marked note, its box closed:  just above the note box;  nothing without one. */
  private saidNote(): JSX.Element {
    return <Show when={this.reviewState.noted()}>{this.reviewControl("said", "said")}</Show>
  }

  /**
   * The note box:  docked at the end of its details, or under its line (an item without details:  `under-line`,
   * so leaving it closes it).
   */
  private noteBox(): JSX.Element {
    return this.reviewControl("note", "note-box")
  }

  /** One of its review controls (`<epic-review>`):  what it `shows`, as its `part`. */
  private reviewControl(shows: ReviewShows, part: "review-buttons" | "note-box" | "said"): JSX.Element {
    return (
      <epic-review
        of={this.id}
        shows={shows}
        buttons={TODO_ID.test(this.id ?? "") ? "todo" : "item"}
        label={this.label()}
        tip={this.reviewTip()}
        under-line={shows === "note" && !this.hasDetails() ? "" : undefined}
        part={this.partForName(part)}
      />
    )
  }

  ////////////////
  // ## Review
  ////////////////

  /** Revisit or Edit, pressed on its own review controls:  unfolded to show the note box, if it has details. */
  @E.on(SHOW_NOTE, { target: "renderRoot" })
  protected onShowNote(event: Event) {
    // its own controls' only:  a nested item's come through here too
    if ((event.target as Node).getRootNode() !== event.currentTarget) return
    event.stopPropagation()
    this.reveal()
  }

  ////////////////
  // ## Source (`DOMLoadableBodyElement`)
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
   * - Without details:  folding its note box open under the line closes it, the draft kept;  else nothing.
   */
  @E.untracked
  toggle(originalEvent?: Event): boolean {
    if (!this.hasDetails()) {
      if (!this.boxUnderLine()) return false
      this.reviewState.client?.closeBox(this.reviewState.id(), false)
      return true
    }
    const opening = !this.isOpen()
    const detail = { open: opening, item: this.domElement, originalEvent }
    return this.requestChange("isMarkedOpen", opening, () => this.send(opening ? "ui-open" : "ui-close", detail))
  }

  /** Unfold for a link or find-in-page:  `ui-open` after the fact (not cancelable). */
  @E.untracked
  private reveal() {
    if (this.isOpen() || !this.hasDetails()) return
    const detail = { open: true, item: this.domElement }
    const init = { bubbles: true, composed: true, cancelable: false, detail }
    this.domElement.dispatchEvent(new CustomEvent(this.elementDefinition.event("ui-open"), init))
    this.isMarkedOpen = true
  }

  /** The git icon, clicked:  its commits shown (it opens, loading its part) or hidden again;  the line doesn't fold. */
  private readonly flipCommits = () => {
    const on = !this.showCommits
    this.showCommits = on
    if (on) this.reveal()
  }

  /** The id chip clicked while it toggles:  urgent <-> not urgent;  the line doesn't fold. */
  @E.untracked
  private readonly flipUrgency = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    this.reviewState.toggleCalm(!!this.calm)
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
  @E.on("beforematch", { target: "renderRoot" })
  protected onBeforeMatch() {
    this.reveal()
  }

  /** The address's own `#hash` was followed:  an item that moves doesn't open for it again as it reconnects. */
  private hasFollowedHash = false

  /** While connected, follow links (`hashchange`);  the first time, the address's own `#hash` too.  Returns the undo. */
  @E.whileConnected
  protected watchHash() {
    const listeners = new AbortController()
    window.addEventListener("hashchange", this.followHash, { signal: listeners.signal })
    if (!this.hasFollowedHash) {
      this.hasFollowedHash = true
      this.followHash()
    }
    return () => listeners.abort()
  }

  /**
   * The page's `#hash` names this item, an id in its `part-ids`, or an element inside it:  open it;
   * a part id lands once the part is in.
   */
  @E.untracked
  private readonly followHash = () => {
    const target = decodeURIComponent(location.hash.slice(1))
    if (!target) return
    const partIds = (this.partIds ?? "").split(/\s+/)
    if (partIds.includes(target)) {
      this.reveal()
      this.body
        .load()
        .then(() => document.getElementById(target)?.scrollIntoView())
        .catch(() => undefined)
      return
    }
    const element = target === this.domElement.id ? this.domElement : document.getElementById(target)
    if (element && this.domElement.contains(element)) this.reveal()
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Its light children, read now:  does the default slot start with prose?  Is there a More Details card? */
  private scanChildren(): ChildScan {
    let first: "prose" | "part" | undefined
    for (const node of this.domElement.childNodes) {
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
      hasMore: !!this.domElement.querySelector(`:scope > ${MORE_TAG}`),
      hasCommits: !!this.domElement.querySelector(`:scope > ${COMMIT_TAG}`)
    }
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicItem extends E.AttributeValues<EpicItemVocabulary> {}

/** `EpicItem.scanChildren()`'s answer. */
type ChildScan = {
  /** the default slot's first content is prose (its text), not one of its parts */
  startsWithProse: boolean
  /** a More Details card is among its children */
  hasMore: boolean
  /** a commit is among its children */
  hasCommits: boolean
}
