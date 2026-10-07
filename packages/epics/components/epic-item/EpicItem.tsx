import { Show, createEffect, createMemo, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, SlotContent, SOURCE_FAILURE_KEYS, SourceBody, SourceBodyHost, UIElement, UIT } from "$/ui/core"

import { epicItemVocabulary } from "./epic-item.vocabulary.en"
import { EpicItemFallback } from "./epic-item.fallback"
import { Chevron } from "./Chevron"
import {
  BEFORE_MATCH,
  CANCELED,
  CELL,
  CHIP,
  CLOSED_STATUSES,
  DETAILS,
  DETAILS_ID,
  EPIC_TAG,
  EXTRAS,
  FLOW_TAGS,
  FOLD,
  HAS_DETAILS,
  ITEM_STATES,
  LABEL,
  LINE,
  MORE_TAG,
  NOTE,
  REVIEW,
  STATE_TIP_KEYS,
  TITLE,
  TOGGLE,
  UNFOLDED,
  UNTIL_FOUND,
  type EpicItemVocabulary,
  type ItemState,
  type ReviewLabel
} from "./epic-item.types"

import itemCSS from "./epic-item.css?inline"

/****************
 * ### `<epic-item>`
 * One item -- question, judgement call, caveat, todo, issue or test -- its kind its id's letter (Q11).
 * - Its LINE, in the shadow root:  the fold chevron (only with details), the id chip (`Q7`, a link to `#q7`) in its
 *   state's colour, the title (`title`, or `slot="title"`), the review label (`reviewed 10-06`, `deferred`, `to do`)
 *   and the `actions` slot (P9's review buttons).  Sticky while open, under the section titles stuck above it.
 * - Its DETAILS:  its light-DOM children, through the default slot, so find-in-page, `#d7` links and the live update
 *   see them (Q12);  hidden `until-found` while folded.  Over its own text, `Original question` (answered) or
 *   `Original reply` (with a More Details card);  under them the `note` slot (P9's note box).
 * - Folding:  `open` (page state, never in the file);  a click on the line (not on a link or control in it) or
 *   Enter / Space on the chevron go through the cancelable `ui-open` / `ui-close`.  A link to the item, to an id
 *   in `part-ids`, or to an element inside it opens it, as does find-in-page.
 * - Source:  `source="parts/q7.htm"` is fetched the first time it opens (`SourceBody`, as `<ui-section source>`),
 *   into its LIGHT children, replacing the placeholder;  `ui-load` then.  From `file://` it can't load:  the
 *   `Loads from ... (needs the page server)` note, as today.
 * - The host's own `title` would show as a tooltip over everything in it, prose included:  the shadow wrapper's
 *   EMPTY `title` stops it there (T8).
 * - SIDE EFFECT:  with `source`, replaces its own light children (the placeholder) with the part;  listens for
 *   `hashchange` while connected.
 ****************/
export class EpicItem extends UIElement<EpicItemVocabulary> {
  @proto static vocabulary = epicItemVocabulary
  @proto static styles = { item: itemCSS }
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

  /** Where it stands:  `state` as the script wrote it, else `old` once closed, `open` before. */
  readonly itemState = createMemo((): ItemState => {
    const state = this.attrs.state
    if (state && (ITEM_STATES as readonly string[]).includes(state)) return state
    return (CLOSED_STATUSES as readonly string[]).includes(this.attrs.status ?? "") ? "old" : "open"
  })

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

  /** Anything at the end of the line:  a review label, or P9's controls in `actions`. */
  readonly hasExtras = createMemo(() => !!this.review() || this.slots.has(this.slot("actions")))

  /** The id chip's tooltip:  where it stands, then its review marks (`Needs attention · not reviewed yet`). */
  readonly chipTip = createMemo(() => {
    const { queued, work, reviewed, deferred, status } = this.attrs
    const parts = [this.text(STATE_TIP_KEYS[this.itemState()])]
    if (queued) parts.push(this.text("tipTodo", { work: work || queued }))
    if (reviewed) parts.push(this.text("tipReviewed", { date: reviewed }))
    else if (deferred) parts.push(this.text("tipDeferred", { date: deferred }))
    else if (status === "open") parts.push(this.text("tipNotReviewed"))
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
    return { open: this.isOpen(), loaded: status === "loaded", error: status === "error" }
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
        <div
          ref={(element) => element.addEventListener(BEFORE_MATCH, this.onBeforeMatch)}
          id={DETAILS_ID}
          class={DETAILS}
          part={this.part("details")}
          hidden={!this.isOpen() || this.veiled() ? UNTIL_FOUND : undefined}
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
          <slot name={this.slot("note")} />
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
            >
              <Chevron />
            </button>
          </Show>
        </span>
        <span class={CELL}>
          <a class={CHIP} part={this.part("id")} href={`#${this.attrs.id ?? ""}`} title={this.chipTip()}>
            {this.label()}
          </a>
        </span>
        <span class={TITLE} part={this.part("title")}>
          <slot name={this.slot("title")}>{this.attrs.title}</slot>
        </span>
        <span class={[CELL, EXTRAS]} part={this.part("actions")} hidden={!this.hasExtras()}>
          <Show when={this.review()}>
            {(review) => (
              <span class={[REVIEW, review().look]} part={this.part("review")} title={review().tip}>
                {review().words}
              </span>
            )}
          </Show>
          <slot name={this.slot("actions")} />
        </span>
      </div>
    )
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
    return { startsWithProse: first === "prose", hasMore: !!this.host.querySelector(`:scope > ${MORE_TAG}`) }
  }
}

/** `EpicItem.scanChildren()`'s answer. */
type ChildScan = {
  /** the default slot's first content is prose (its text), not one of its parts */
  startsWithProse: boolean
  /** a More Details card is among its children */
  hasMore: boolean
}

/** What, on the line, acts by itself:  a click there doesn't fold. */
const CONTROLS = "a[href], button, input, select, textarea, label, summary, [role='button'], [contenteditable]"
