import { E, UI } from "$/ui/core"
// Import directly to avoid circular import
import { state, untracked } from "./Reactive"

/****************
 * ### `LoadableBody`
 * The content of a `<ui-section source>` or `<ui-accordion source>`, fetched the first time it opens,
 * so a long page can ship as a SKELETON (every title) and load each body on demand.
 * - One per owning element, which says WHEN (`load()` once it opens) and WHERE (`target()`).
 * - This does the rest, in the owner's LIGHT DOM, so the page's CSS reaches it.
 * - Fetched through `UI.sources` (same origin only, cached per URL:  the path `<ui-include>` takes).
 * - Parsed by `SourceMarkup`:  `<body>` or the `select` match, scripts inert, relative URLs rewritten against `source`.
 * - Insert:  replaces the target's PLACEHOLDER,
 *   every child but an element with a `slot` attribute (a section's header, icon, badge ... stay);
 *   on `reload()`, replaces the body it put there before too.
 * - Events through the owner:
 *   - `ui-load` once the body is in
 *   - the cancelable `ui-error` on failure, after which `loadError` holds what to say (unless cancelled)
 *   - a failure isn't remembered:  the next `load()` tries again
 * - `isVeiled`:  the owner keeps its content box closed while it's true,
 *   so an opening section or panel shows the body, not the placeholder, and animates once.
 *   - It turns false when the body arrives, on failure, or after `SOURCE_BODY_HOLD_MS`
 *     (then `isOverdue`:  the owner shows its loading look over the placeholder).
 *   - Only before the FIRST body:  a `reload()` (the live update) keeps the old body shown
 *     until the new one replaces it in place, so an open section doesn't blink, and its controls keep the focus.
 * - The families of `ui-*` tags in the body are NOT loaded here:  light DOM is the page's,
 *   so whatever defines the page's tags (a `<ui-root>`, which watches its subtree, or a bundle) defines these too.
 * - NOTE: a cycle (a body holding a source of its own file) or nesting deeper than `MAX_DEPTH` is a `render` error.
 * - Knows its owner only as a `LoadableBodyOwner` (`elements.types`):  NEVER imports a component.
 ****************/
export class LoadableBody {
  /** Where the body is (`LoadableComponent`'s name for the same). */
  @state accessor loadStatus: E.SourceStatus = E.SourceStatus.idle

  /** The load has taken longer than `SOURCE_BODY_HOLD_MS`:  stop holding the content box closed. */
  @state accessor isOverdue = false

  /** What the error line says;  `undefined` when there's none to show. */
  @state accessor loadError: E.SourceFailure | undefined = undefined

  /** A body has been inserted:  nothing to hold closed for any more. */
  @state accessor hasShownABody = false

  /** The element whose body this is. */
  private readonly owner: E.LoadableBodyOwner

  /** The current load (in flight, or done for `pendingKey`). */
  private pending?: Promise<void>

  /** `source` + `select` of `pending`. */
  private pendingKey?: string

  /** Counts loads:  a newer one makes an older one's result moot. */
  private generation = 0

  /** Nodes the last insert put in the target, removed by the next one. */
  private inserted: ChildNode[] = []

  /** The body of `owner`, which calls `load()` once it opens. */
  constructor(owner: E.LoadableBodyOwner) {
    this.owner = owner
  }

  ////////////////
  // ## State
  ////////////////

  /** Hold the content box closed?  True while the FIRST body is on its way and not `isOverdue`;  tracked. */
  get isVeiled(): boolean {
    if (this.hasShownABody) return false
    const status = this.loadStatus
    return (status === E.SourceStatus.idle || status === E.SourceStatus.loading) && !this.isOverdue
  }

  /** Is a load in flight and past `SOURCE_BODY_HOLD_MS`?  The owner's loading look;  tracked. */
  get isBusy(): boolean {
    return this.loadStatus === E.SourceStatus.loading && this.isOverdue
  }

  ////////////////
  // ## Loading
  ////////////////

  /**
   * Fetch and insert the body for the current `source` (and `select`), once:
   * the same promise until either changes.
   * - Rejects when it fails.
   * - No `source`:  resolves at once, nothing changes.
   * - Untracked:  a load never follows `source` / `select` (the owner says when to load),
   *   so the owner's `source()` / `select()` read plainly.
   */
  @untracked
  load(): Promise<void> {
    const source = this.owner.source()
    if (!source) return Promise.resolve()
    const select = this.owner.select()
    if (this.pending && this.pendingKey === LoadableBody.key(source, select)) return this.pending
    return this.start({ source, select, fresh: false })
  }

  /** Fetch the body again past the cache, and replace the one inserted;  resolves once it's in.  Untracked, as `load()`. */
  @untracked
  reload(): Promise<void> {
    const source = this.owner.source()
    if (!source) return Promise.resolve()
    return this.start({ source, select: this.owner.select(), fresh: true })
  }

  /** A new load, replacing any in flight. */
  private start(request: BodyLoad): Promise<void> {
    const generation = ++this.generation
    this.pendingKey = LoadableBody.key(request.source, request.select)
    this.loadStatus = E.SourceStatus.loading
    this.loadError = undefined
    this.isOverdue = false
    const timer = E.after(E.SOURCE_BODY_HOLD_MS / 1000, () => {
      if (generation === this.generation) this.isOverdue = true
    })
    const load = this.fetch(request, generation).finally(() => timer.cancel())
    this.pending = load
    // a failure isn't remembered:  the next `load()` tries again
    load.catch(() => {
      if (this.pending === load) this.pending = undefined
    })
    return load
  }

  /** Fetch, parse and insert;  a newer load (`generation`) since makes this one quietly do nothing. */
  private async fetch({ source, select, fresh }: BodyLoad, generation: number) {
    const { domElement } = this.owner
    try {
      E.SourceMarkup.checkNesting(domElement, source, (node) => node.hasAttribute(E.SOURCE_ATTRIBUTE))
      const ui = await UI.load()
      const loaded = await ui.sources.load(source, { fresh })
      if (generation !== this.generation) return
      this.insert(E.SourceMarkup.parse(loaded.text, { page: domElement.ownerDocument, source, select }))
      this.loadStatus = E.SourceStatus.loaded
      this.owner.send(E.SourceEvent.load, { source, content: loaded.text })
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
    for (const node of [...target.childNodes]) if (LoadableBody.isPlaceholder(node)) node.remove()
    this.inserted = [...fragment.childNodes]
    target.append(fragment)
    this.hasShownABody = true
  }

  /** Loading or showing failed:  `ui-error`, then the error line unless it was cancelled. */
  private fail(source: string, error: unknown) {
    const kind = E.SourceError.kindFor(error, "load")
    this.loadStatus = E.SourceStatus.error
    const shown = this.owner.send(E.SourceEvent.error, { kind, source, error })
    this.loadError = shown ? { kind, error } : undefined
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Identity of a load:  `source` and `select`.  Static:  pure. */
  private static key(source: string, select: string | undefined): string {
    return select ? `${source} ${select}` : source
  }

  /**
   * Is `node` part of the placeholder?  Anything but an element headed for a named slot.
   * - Static:  pure.  `NodeType`, not the `Node` global, which a server render has none of.
   */
  private static isPlaceholder(node: Node): boolean {
    return !(node.nodeType === E.NodeType.element && (node as Element).hasAttribute("slot"))
  }
}

/** One load of a `LoadableBody`:  what to fetch, and whether past the cache. */
type BodyLoad = {
  /** `source`, as written */
  source: string
  /** `select`, as written */
  select: string | undefined
  /** skip the cache (`reload()`) */
  fresh: boolean
}
