import { SourceError, UI } from "$/ui/runtime"

import { SOURCE_BODY_HOLD_MS, type SourceBodyOwner, type SourceFailure, type SourceStatus } from "./elements.types"
import { Cell } from "./Cell"
import { SourceMarkup } from "./SourceMarkup"

/****************
 * ### `SourceBody`
 * The content of a `<ui-section source>` or `<ui-accordion source>`, fetched the first time it opens, so a long
 * page can ship as a SKELETON (every title) and load each body on demand.  One per owning element, which says WHEN
 * (`load()` once it opens) and WHERE (`target()`);  this does the rest, in the owner's LIGHT DOM, so the page's CSS
 * reaches it.
 * - Fetched through `UI.sources` (same origin only, cached per URL:  the path `<ui-include>` takes), parsed by
 *   `SourceMarkup` (`<body>` or the `select` match, scripts inert, relative URLs rewritten against `source`).
 * - Insert:  replaces the target's PLACEHOLDER -- every child but an element with a `slot` attribute (a section's
 *   header, icon, badge ... stay) -- and, on `reload()`, the body it put there before.
 * - Events through the owner:  `ui-load` once the body is in;  the cancelable `ui-error` on failure, after which
 *   `failure` holds what to say (unless cancelled).  A failure isn't remembered:  the next `load()` tries again.
 * - `veiled()`:  the owner keeps its content box closed while it's true, so an opening section or panel shows the
 *   body, not the placeholder, and animates once;  it turns false when the body arrives, on failure, or after
 *   `SOURCE_BODY_HOLD_MS` (then `overdue`:  the owner shows its loading look over the placeholder).  Only before the
 *   FIRST body:  a `reload()` (the live update) keeps the old body shown until the new one replaces it in place, so
 *   an open section doesn't blink, and its controls keep the focus.
 * - The families of `ui-*` tags in the body are NOT loaded here:  light DOM is the page's, so whatever defines the
 *   page's tags (a `<ui-root>`, which watches its subtree, or a bundle) defines these too.
 * - NOTE: a cycle (a body holding a source of its own file) or nesting deeper than `MAX_DEPTH` is a `render` error.
 ****************/
export class SourceBody {
  /** Where the body is. */
  readonly status = new Cell<SourceStatus>("idle")

  /** The load has taken longer than `SOURCE_BODY_HOLD_MS`:  stop holding the content box closed. */
  readonly overdue = new Cell(false)

  /** What the error line says;  `undefined` when there's none to show. */
  readonly failure = new Cell<SourceFailure | undefined>(undefined)

  /** A body has been inserted:  nothing to hold closed for any more. */
  private readonly shown = new Cell(false)

  /** The element whose body this is. */
  private readonly owner: SourceBodyOwner

  /** The current load (in flight, or done for `loadedKey`). */
  private pending?: Promise<void>

  /** `source` + `select` of `pending`. */
  private pendingKey?: string

  /** Counts loads:  a newer one makes an older one's result moot. */
  private generation = 0

  /** Nodes the last insert put in the target, removed by the next one. */
  private inserted: ChildNode[] = []

  constructor(owner: SourceBodyOwner) {
    this.owner = owner
  }

  ////////////////
  // ## State
  ////////////////

  /** Hold the content box closed?  True while the FIRST body is on its way and not `overdue`;  tracked. */
  veiled(): boolean {
    if (this.shown.get()) return false
    const status = this.status.get()
    return (status === "idle" || status === "loading") && !this.overdue.get()
  }

  /** Is a load in flight and past `SOURCE_BODY_HOLD_MS`?  The owner's loading look;  tracked. */
  busy(): boolean {
    return this.status.get() === "loading" && this.overdue.get()
  }

  ////////////////
  // ## Loading
  ////////////////

  /**
   * Fetch and insert the body for the current `source` (and `select`), once:  the same promise until either
   * changes.  Rejects when it fails.
   * - No `source`:  resolves at once, nothing changes.
   */
  load(): Promise<void> {
    const source = this.owner.source()
    if (!source) return Promise.resolve()
    const select = this.owner.select()
    if (this.pending && this.pendingKey === SourceBody.key(source, select)) return this.pending
    return this.start(source, select, false)
  }

  /** Fetch the body again past the cache, and replace the one inserted;  resolves once it's in. */
  reload(): Promise<void> {
    const source = this.owner.source()
    if (!source) return Promise.resolve()
    return this.start(source, this.owner.select(), true)
  }

  /** A new load:  `fresh` skips the cache. */
  private start(source: string, select: string | undefined, fresh: boolean): Promise<void> {
    const generation = ++this.generation
    this.pendingKey = SourceBody.key(source, select)
    this.status.set("loading")
    this.failure.set(undefined)
    this.overdue.set(false)
    const timer = setTimeout(() => {
      if (generation === this.generation) this.overdue.set(true)
    }, SOURCE_BODY_HOLD_MS)
    const load = this.fetch(source, select, fresh, generation).finally(() => clearTimeout(timer))
    this.pending = load
    // a failure isn't remembered:  the next `load()` tries again
    load.catch(() => {
      if (this.pending === load) this.pending = undefined
    })
    return load
  }

  /** Fetch, parse and insert;  a newer load since makes this one quietly do nothing. */
  private async fetch(source: string, select: string | undefined, fresh: boolean, generation: number) {
    const { host } = this.owner
    try {
      const refusal = SourceMarkup.refusal(host, source, (node) => node.hasAttribute(SOURCE_ATTRIBUTE))
      if (refusal) throw refusal
      const ui = await UI.load()
      const loaded = await ui.sources.load(source, { fresh })
      if (generation !== this.generation) return
      const fragment = SourceMarkup.parse(loaded.text, { page: host.ownerDocument, source, select })
      if (fragment instanceof SourceError) throw fragment
      this.insert(fragment)
      this.status.set("loaded")
      this.owner.emit(LOAD_EVENT, { source, content: loaded.text })
    } catch (error) {
      if (generation !== this.generation) return
      this.fail(source, error)
      throw error
    }
  }

  /** Put `fragment` in the target, in place of the placeholder (and the body inserted before). */
  private insert(fragment: DocumentFragment) {
    const target = this.owner.target()
    for (const node of this.inserted) node.remove()
    for (const node of [...target.childNodes]) if (SourceBody.isPlaceholder(node)) node.remove()
    this.inserted = [...fragment.childNodes]
    target.append(fragment)
    this.shown.set(true)
  }

  /** Loading or showing failed:  `ui-error`, then the error line unless it was cancelled. */
  private fail(source: string, error: unknown) {
    const kind = error instanceof SourceError ? error.kind : "load"
    this.status.set("error")
    const shown = this.owner.emit(ERROR_EVENT, { kind, source, error })
    this.failure.set(shown ? { kind, error } : undefined)
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Identity of a load:  `source` and `select`. */
  private static key(source: string, select: string | undefined): string {
    return select ? `${source} ${select}` : source
  }

  /** Is `node` part of the placeholder?  Anything but an element headed for a named slot. */
  private static isPlaceholder(node: Node): boolean {
    return !(node.nodeType === Node.ELEMENT_NODE && (node as Element).hasAttribute(SLOT_ATTRIBUTE))
  }
}

/** The attribute naming an element's file:  what counts as an enclosing source. */
const SOURCE_ATTRIBUTE = "source"

/** A child with this attribute goes to a named slot:  never a placeholder. */
const SLOT_ATTRIBUTE = "slot"

/** Events the owner's vocabulary MUST have (`UIT.SOURCE_BODY_EVENTS`). */
const LOAD_EVENT = "ui-load"
const ERROR_EVENT = "ui-error"
