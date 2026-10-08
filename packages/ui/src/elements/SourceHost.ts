import type { E } from "$/ui/core"
// Import directly to avoid circular import
import { UIHost } from "./UIHost"

/****************
 * ### `SourceHost`
 * Host base of the source elements (`<ui-include>`, `<ui-code>`, `<ui-markdown>`):  their script API, delegated
 * to the controller (`SourceElement`).
 * - `content` -- the text shown now, edits included;  set it to show other text (`dirty` until saved)
 * - `etag` -- version of the last load / save;  `dirty` -- changed since then
 * - `loaded` -- resolves with the content once the CURRENT load is done (a new `source` starts a new one);
 *   rejects when it fails
 * - `save(text?)` / `reload()` -- see `SourceElement`
 * - Works before the first render:  a `content` set early is kept and shown once the controller exists.
 * - Knows its controller only as a `SourceController` (`elements.types`):  NEVER imports `SourceElement`, which
 *   imports it.
 * - NOTE: the fork checks host prototype members against prop names;  none of these is an attribute.  Private
 *   members too:  NEVER call one `source` or `load` (instance fields would hide the attributes' accessors).
 ****************/
export class SourceHost extends UIHost {
  /** `content` set before the controller existed;  the controller takes it */
  private pendingContent?: string

  /** the current load's promise and how to settle it */
  private currentLoad = SourceHost.deferred()

  /** has the current load settled? */
  private settled = false

  ////////////////
  // ## Script API
  ////////////////

  /**
   * The text shown now, edits included;  synchronous, even right after a set.
   * - Before the controller exists:  what was set early, else `""`.
   */
  get content(): string {
    return this.sourceController?.content ?? this.pendingContent ?? ""
  }

  /**
   * Show `text` instead of the source's, until `source` changes or `reload()`;  `dirty` until saved, `ui-change`.
   * - Before the controller exists:  kept, and shown once it does.
   */
  set content(text: string) {
    if (this.sourceController) this.sourceController.content = text
    else this.pendingContent = text
  }

  /** Version of the last load / save (the response's `ETag`);  `undefined` before one, or when there was none. */
  get etag(): string | undefined {
    return this.sourceController?.lastETag
  }

  /**
   * Changed since loaded / saved?  The controller's `isDirty`.
   * - Before the controller exists:  whether `content` was set early.
   */
  get dirty(): boolean {
    return this.sourceController?.isDirty ?? this.pendingContent !== undefined
  }

  /**
   * Resolves with the content once the CURRENT load is done;  rejects when it fails.
   * - A new `source` starts a new load, and a new promise:  read `loaded` after changing it.
   */
  get loaded(): Promise<string> {
    return this.currentLoad.promise
  }

  /**
   * Save `text` (default the content) back to `source`;  resolves `true` once saved here (`SourceElement.save()`).
   * - Before the controller exists:  `false`, nothing saved.
   */
  save(text?: string): Promise<boolean> {
    return this.sourceController?.save(text) ?? Promise.resolve(false)
  }

  /**
   * Fetch `source` again past the cache, dropping edits;  resolves with the new content.
   * - Before the controller exists:  `loaded`.
   */
  reload(): Promise<string> {
    return this.sourceController?.reload() ?? this.currentLoad.promise
  }

  ////////////////
  // ## For the controller
  ////////////////

  /** `content` set before the controller existed, once;  `undefined` when none was. */
  takePendingContent(): string | undefined {
    const text = this.pendingContent
    this.pendingContent = undefined
    return text
  }

  /** A new load started:  `loaded` becomes a new promise, unless the current one is still waiting. */
  beginLoad() {
    if (!this.settled) return
    this.currentLoad = SourceHost.deferred()
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

  /** The controller, typed;  `undefined` until the fork creates it. */
  private get sourceController(): E.SourceController | undefined {
    return this.controller as unknown as E.SourceController | undefined
  }

  /**
   * A promise with its settle functions.
   * - Its rejection is pre-handled:  nobody awaiting `loaded` must not be an "unhandled rejection";  an awaiting
   *   caller still sees it.
   * - Static:  needs no host.
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
