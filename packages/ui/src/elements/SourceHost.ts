import type { SourceController } from "./elements.types"
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
 * - NOTE: the fork checks host prototype members against prop names;  none of these is an attribute.  Private
 *   members too:  NEVER call one `source` or `load` (instance fields would hide the attributes' accessors).
 ****************/
export class SourceHost extends UIHost {
  /** `content` set before the controller existed;  the controller takes it */
  private pendingContent?: string

  /** the current load's promise and how to settle it */
  private current = SourceHost.deferred()

  /** has the current load settled? */
  private settled = false

  ////////////////
  // ## Script API
  ////////////////

  get content(): string {
    return this.controllerApi?.getContent() ?? this.pendingContent ?? ""
  }

  set content(text: string) {
    if (this.controllerApi) this.controllerApi.setContent(text)
    else this.pendingContent = text
  }

  get etag(): string | undefined {
    return this.controllerApi?.getEtag()
  }

  get dirty(): boolean {
    return this.controllerApi?.isDirty() ?? this.pendingContent !== undefined
  }

  get loaded(): Promise<string> {
    return this.current.promise
  }

  save(text?: string): Promise<boolean> {
    return this.controllerApi?.save(text) ?? Promise.resolve(false)
  }

  reload(): Promise<string> {
    return this.controllerApi?.reload() ?? this.current.promise
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
    this.current = SourceHost.deferred()
    this.settled = false
  }

  /** The current load is done with `text`. */
  endLoad(text: string) {
    this.settled = true
    this.current.resolve(text)
  }

  /** The current load failed with `error`. */
  failLoad(error: unknown) {
    this.settled = true
    this.current.reject(error)
  }

  /** The controller, typed. */
  private get controllerApi(): SourceController | undefined {
    return this.controller as unknown as SourceController | undefined
  }

  /**
   * A promise with its settle functions.
   * - Its rejection is pre-handled:  nobody awaiting `loaded` must not be an "unhandled rejection";  an awaiting
   *   caller still sees it.
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
