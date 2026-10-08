import type { E } from "$/ui/core"
// Import directly to avoid circular import
import { DOMElement } from "./DOMElement"

/****************
 * ### `DOMLoadableElement`
 * The DOM element of the components that show a text file (`<ui-include>`, `<ui-code>`, `<ui-markdown>`):
 * their script API, handed on to the component (a `LoadableComponent`).
 * - `content` -- the text shown now, edits included;  set it to show other text (`dirty` until saved)
 * - `etag` -- version of the last load / save;  `dirty` -- changed since then
 * - `loaded` -- resolves with the content once the CURRENT load is done (a new `source` starts a new one);
 *   rejects when it fails
 * - `save(text?)` / `reload()` -- see `LoadableComponent`
 * - Works before the first render:  a `content` set early is kept and shown once the component exists.
 * - Knows its component only as a `LoadableComponentShape` (`elements.types`):  NEVER imports `LoadableComponent`,
 *   which imports it.
 * - NOTE: solid-element checks DOM element prototype members against prop names;  none of these is an attribute.
 *   Private members too:  NEVER call one `source` or `load` (instance fields would hide the attributes' accessors).
 ****************/
export class DOMLoadableElement extends DOMElement {
  /** `content` set before the component existed;  the component takes it */
  private pendingContent?: string

  /** the current load's promise and how to settle it */
  private currentLoad = DOMLoadableElement.deferred()

  /** has the current load settled? */
  private settled = false

  ////////////////
  // ## Script API
  ////////////////

  /**
   * The text shown now, edits included;  synchronous, even right after a set.
   * - Before the component exists:  what was set early, else `""`.
   */
  get content(): string {
    return this.loadable?.content ?? this.pendingContent ?? ""
  }

  /**
   * Show `text` instead of the source's, until `source` changes or `reload()`;  `dirty` until saved, `ui-change`.
   * - Before the component exists:  kept, and shown once it does.
   */
  set content(text: string) {
    if (this.loadable) this.loadable.content = text
    else this.pendingContent = text
  }

  /** Version of the last load / save (the response's `ETag`);  `undefined` before one, or when there was none. */
  get etag(): string | undefined {
    return this.loadable?.lastETag
  }

  /**
   * Changed since loaded / saved?  The component's `isDirty`.
   * - Before the component exists:  whether `content` was set early.
   */
  get dirty(): boolean {
    return this.loadable?.isDirty ?? this.pendingContent !== undefined
  }

  /**
   * Resolves with the content once the CURRENT load is done;  rejects when it fails.
   * - A new `source` starts a new load, and a new promise:  read `loaded` after changing it.
   */
  get loaded(): Promise<string> {
    return this.currentLoad.promise
  }

  /**
   * Save `text` (default the content) back to `source`;  resolves `true` once saved here (`LoadableComponent.save()`).
   * - Before the component exists:  `false`, nothing saved.
   */
  save(text?: string): Promise<boolean> {
    return this.loadable?.save(text) ?? Promise.resolve(false)
  }

  /**
   * Fetch `source` again past the cache, dropping edits;  resolves with the new content.
   * - Before the component exists:  `loaded`.
   */
  reload(): Promise<string> {
    return this.loadable?.reload() ?? this.currentLoad.promise
  }

  ////////////////
  // ## For the component
  ////////////////

  /** `content` set before the component existed, once;  `undefined` when none was. */
  takePendingContent(): string | undefined {
    const text = this.pendingContent
    this.pendingContent = undefined
    return text
  }

  /** A new load started:  `loaded` becomes a new promise, unless the current one is still waiting. */
  beginLoad() {
    if (!this.settled) return
    this.currentLoad = DOMLoadableElement.deferred()
    this.settled = false
  }

  /** The current load is done with `text`. */
  endLoad(text: string) {
    this.settled = true
    this.currentLoad.resolve(text)
  }

  /** The current load failed with `error`. */
  failLoad(error: unknown) {
    this.settled = true
    this.currentLoad.reject(error)
  }

  /** The component, typed;  `undefined` until solid-element creates it. */
  private get loadable(): E.LoadableComponentShape | undefined {
    return this.component as unknown as E.LoadableComponentShape | undefined
  }

  /**
   * A promise with its settle functions.
   * - Its rejection is pre-handled:  nobody awaiting `loaded` must not be an "unhandled rejection";  an awaiting
   *   caller still sees it.
   * - Static:  needs no DOM element.
   */
  private static deferred() {
    let resolve!: (text: string) => void
    let reject!: (error: unknown) => void
    const promise = new Promise<string>((yes, no) => {
      resolve = yes
      reject = no
    })
    promise.catch(() => {})
    return { promise, resolve, reject }
  }
}
