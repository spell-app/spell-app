import { untrack } from "solid-js"
import { isServer } from "@solidjs/web"

import { E } from "$/ui/core"

import {
  NOTICE_MS,
  ReviewClient,
  isSent,
  type InboxDraft,
  type InboxMark,
  type ReviewAction,
  type Running
} from "$/epics/review"

import { PAGE_TAG, REVIEWING } from "./EpicItem.types"

/****************
 * ### `ReviewState`
 * One element's view of the page's review inbox (`ReviewClient.forPage()`):  `<epic-item>`'s, or an Overview
 * `<epic-section>`'s.  Its reads are TRACKED:  a counter `Cell` bumped on every change the client reports, so the
 * element's controls redraw.
 * - `connect()` while the element is connected (it returns the undo):  the client is plain code, and a kept-alive
 *   element that's gone must stop listening
 * - the page's side, once per page (`watchPage()`):  `<epic-page reviewing>` while reviewed, and the notice line at
 *   the bottom of the window (`ReviewNotice`) for what can't be said on an item (a failed save, nobody listening)
 * - MUST be created under the element's owner (a field initializer):  it creates a signal
 * - Server render:  no client, never reviewing
 ****************/
export class ReviewState {
  /** The page's client;  none in a server render. */
  readonly client: ReviewClient | undefined = isServer ? undefined : ReviewClient.forPage()

  /** The client's `version`, as a signal:  every read below tracks it. */
  private readonly version = new E.Cell(0)

  /** `id`:  the element's id (lower-case, as the inbox keys it), read when asked. */
  constructor(private readonly idOf: () => string | undefined) {}

  /** Follow the client's changes;  returns the undo.  SIDE EFFECT:  the page's side, once (`watchPage()`). */
  connect(): () => void {
    const client = this.client
    if (!client) return () => undefined
    ReviewState.watchPage(client)
    this.version.set(client.version)
    return client.subscribe(() => this.version.set(client.version))
  }

  ////////////////
  // ## Reads (tracked)
  ////////////////

  /** The page is being reviewed:  the controls show. */
  readonly reviewing = (): boolean => this.read((client) => client.reviewing) ?? false

  /** Its mark, if any. */
  readonly mark = (): InboxMark | undefined => this.read((client, id) => client.markOf(id))

  /** Its saved draft, if any. */
  readonly draft = (): InboxDraft | undefined => this.read((client, id) => client.draftOf(id))

  /** Its immediate request at work, if any. */
  readonly running = (): Running | null => this.read((client, id) => client.runningOf(id)) ?? null

  /** Has its mark gone to Claude? */
  readonly isSent = (): boolean =>
    this.read((client, id) => !!client.markOf(id) && client.isSent(client.markOf(id)!)) ?? false

  /** Is a Claude session listening? */
  readonly listening = (): boolean => this.read((client) => client.listening) ?? false

  /** Its note box open by itself, or being written in. */
  readonly boxOpen = (): boolean => this.read((client, id) => client.isBoxOpen(id)) ?? false

  /** What's typed in its note box. */
  readonly typed = (): string => this.read((client, id) => client.typedOf(id)) ?? ""

  /** Owen's urgency for it, not applied yet:  `calm` (true:  not urgent), and has it gone with a send?  Else none. */
  readonly urgency = (): { calm: boolean; sent: boolean } | undefined =>
    this.read((client, id) => {
      const entry = client.inbox.urgency[id]
      return entry && { calm: entry.calm, sent: isSent({ action: "urgency", at: entry.at }, client.inbox.sent) }
    })

  /** Its id, as the inbox keys it. */
  readonly id = (): string => (this.idOf() ?? "").toLowerCase()

  ////////////////
  // ## Acts (untracked:  from handlers)
  ////////////////

  /** Its `action` button clicked:  `"open-box"` when the caller should take the reader to the note box. */
  press(action: ReviewAction): "open-box" | undefined {
    return this.client?.press(untrack(this.id), action)
  }

  /** Its id chip clicked:  urgent <-> not urgent (`docCalm`:  what the doc says). */
  toggleCalm(docCalm: boolean) {
    void this.client?.toggleCalm(untrack(this.id), docCalm)
  }

  /** A failed save's words:  the client's last write error. */
  get lastWriteError(): string {
    return this.client?.lastWriteError ?? ""
  }

  /** `fn(client, id)`, tracking the version;  `undefined` without a client or an id. */
  private read<T>(fn: (client: ReviewClient, id: string) => T): T | undefined {
    this.version.get()
    const id = this.id()
    return this.client && id ? fn(this.client, id) : undefined
  }

  ////////////////
  // ## The page
  ////////////////

  /** The clients whose page side is on. */
  private static readonly watched = new WeakSet<ReviewClient>()

  /**
   * The page's side of `client`, once:  `<epic-page reviewing>` while it's reviewed, and the notice line.
   * - SIDE EFFECT:  sets the attribute on every `<epic-page>`;  adds the notice line to `document.body` on the first
   *   notice
   */
  private static watchPage(client: ReviewClient) {
    if (ReviewState.watched.has(client)) return
    ReviewState.watched.add(client)
    const mark = () => {
      for (const page of document.querySelectorAll(PAGE_TAG)) page.toggleAttribute(REVIEWING, client.reviewing)
    }
    mark()
    client.subscribe(mark)
    const notice = new ReviewNotice()
    client.onNotice((message) => notice.show(message))
  }
}

/****************
 * ### `ReviewNotice`
 * The line at the bottom of the window saying what can't be said on an item:  a failed save, nobody listening, a
 * request called off.  One per page;  drawn in a shadow root of its own, so it needs no page stylesheet.
 * - `role="status"`:  read out as it changes
 * - SIDE EFFECT:  adds its host to `document.body` on the first `show()`
 ****************/
class ReviewNotice {
  /** The host, once shown. */
  private line: HTMLElement | undefined

  /** The timer hiding it. */
  private timer?: E.CancelablePromise<unknown>

  /** Say `message` for a few seconds (`NOTICE_MS`). */
  show(message: string) {
    const line = (this.line ??= ReviewNotice.build())
    line.shadowRoot!.querySelector("p")!.textContent = message
    line.hidden = false
    this.timer?.cancel()
    this.timer = E.after(NOTICE_MS / 1000, () => (line.hidden = true))
  }

  /** The host:  fixed at the bottom of the window, ink on paper reversed. */
  private static build(): HTMLElement {
    const line = document.createElement("div")
    line.setAttribute("role", "status")
    line.hidden = true
    line.attachShadow({ mode: "open" }).innerHTML = `<style>${NOTICE_CSS}</style><p></p>`
    document.body.append(line)
    return line
  }
}

/** The notice line's look:  the page's ink and paper, swapped. */
const NOTICE_CSS = `
:host { position: fixed; z-index: 1000; inset-inline: 12px; inset-block-end: 12px; display: block; }
:host([hidden]) { display: none; }
p {
  box-sizing: border-box; max-width: 520px; margin: 0 auto; padding: 8px 12px; border-radius: 8px;
  background: var(--ui-text-color, CanvasText); color: var(--ui-background, Canvas);
  box-shadow: 0 6px 20px rgb(0 0 0 / 0.2); font: 14px/1.4 var(--ui-font-family, system-ui, sans-serif);
}`
