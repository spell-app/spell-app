import { untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

// Import directly to avoid circular import
import { lazy, proto, protoMerged } from "$/ui/util"
import { E, UI, type UIT } from "$/ui/core"
// Import directly to avoid circular import
import { UIComponent } from "./UIComponent"
import { DOMLoadableElement } from "./DOMLoadableElement"
import { cssState, fromContent, onChange, state, untracked } from "./Reactive"
import { SOURCE_LOADER_TAG, SOURCE_MESSAGE_TAG } from "./elements.types"

/****************
 * ### `LoadableComponent`
 * The base class of the components that show a text file:  `<ui-include>`, `<ui-code>`, `<ui-markdown>`.
 * - It owns where the text comes from, the loading / error look, and saving.
 *   A subclass only says how to show the text (`renderContent()`, reading `textToShow`).
 * - Its DOM element is a `DOMLoadableElement`, with the script API (`content`, `loaded`, `save()` ...).
 * - Text comes from, first match wins:
 *   1. `domElement.content = "..."` (`wasEdited`), until `source` changes or `reload()`
 *   2. `source`:  fetched through `UI.sources` (same origin only), when `load` says (`eager`, `visible`, `idle`)
 *   3. the DOM element's own content (`wantsInlineContent`), dedented, followed as it changes (`@fromContent`):
 *      a `<script type="text/...">` child (exact text), else a `<template>` child (its markup),
 *      else the DOM element's text
 * - States:
 *   - `:state(loading)`:  a `<ui-loader>` shows
 *   - `:state(error)`:  a `<ui-message>` says why, unless the cancelable `ui-error` was cancelled
 *   - `:state(saving)`, `:state(dirty)`
 * - Saving (`save()`):  the cancelable `ui-save` first, then `UI.sources.save()` through the page's saver;
 *   `ui-saved` or `ui-error` after.
 *   - A save failure never replaces the content with a message.
 * - The vocabulary MUST spread the names used here:
 *   `UIT.SourceAttributes` / `SourceEvents` / `SourceParts` / `SourceStates` / `SourceTexts`.
 * - The family barrel MUST import `ui-loader` and `ui-message` (built here by tag, see `SOURCE_LOADER_TAG`).
 * - A moved element keeps its content:  reconnecting doesn't fetch again (`keepAlive`).
 * - Imports the core as `E` / `UI` / `UIT`, except what its class definition reads:
 *   the base class, `elementSetup.DOMElement`, the decorators and the status tags come directly
 *   (WWOD §4 › "Circular imports").
 *   - NEVER a value from `$/ui/components`:  the vocabulary pieces it relies on (`UIT.Source*`) only as types.
 ****************/
export abstract class LoadableComponent<V extends E.ComponentVocabulary = E.ComponentVocabulary>
  extends UIComponent<V>
  implements E.LoadableComponentShape
{
  /**
   * Read the DOM element's own content as the text when there's no `source`?
   * - See `@proto static wantsInlineContent`.
   */
  declare wantsInlineContent: boolean

  // NOTE: `this.domElement as DOMLoadableElement` below, not a `declare readonly domElement: DOMLoadableElement`:
  // two field initializers here read it,
  // and TypeScript refuses those as "used before its initialization" (TS2729)
  @protoMerged static elementSetup: Partial<E.ElementSetup> = {
    // with the script API (`content`, `save()`, `loaded` ...)
    DOMElement: DOMLoadableElement
  }

  /**
   * Read the DOM element's own content as the text when there's no `source`.
   * - `false` for `<ui-include>`, whose children are a placeholder shown until the include loads.
   */
  @proto static wantsInlineContent = true

  /** `source`:  URL of the file to show, as written;  the vocabulary's getter (`UIT.SourceAttributes`). */
  declare source: string | undefined

  /**
   * `load`:  when to fetch `source`;  `undefined` for a value the vocabulary doesn't know.
   * - The vocabulary's getter, as `source`.
   */
  declare load: UIT.SourceLoadMode | undefined

  ////////////////
  // ## The text
  ////////////////

  /**
   * The DOM element's own content as text, dedented (`wantsInlineContent`);  follows it as the page changes it.
   * - `""` on a server, and for a class that doesn't want inline content.
   */
  @fromContent({ childList: true, characterData: true, subtree: true })
  get inlineText(): string {
    return isServer || !this.wantsInlineContent ? "" : LoadableComponent.inlineTextOf(this.domElement)
  }

  /** Last text fetched from `source`. */
  @state accessor fetchedText: string | undefined = undefined

  /** Text set through `domElement.content`, shown instead of the source's;  `undefined` when none. */
  @state accessor wasEdited: string | undefined = (this.domElement as DOMLoadableElement).takePendingContent()

  /** The text to show:  edits, else the fetched source, else the DOM element's own content. */
  get textToShow(): string {
    const edited = this.wasEdited
    if (edited !== undefined) return edited
    return this.source ? (this.fetchedText ?? "") : this.inlineText
  }

  /** The text shown now, edits included;  the script API's (`DOMLoadableElement.content`). */
  get content(): string {
    return untrack(() => this.textToShow)
  }

  /** Show `text` instead (`isDirty` until saved);  sends `ui-change`. */
  set content(text: string) {
    if (text === this.content) return
    this.wasEdited = text
    this.isDirty = true
    this.sendSourceEvent(E.SourceEvent.change, { content: text })
  }

  ////////////////
  // ## Loading
  ////////////////

  /** Where loading is. */
  @state accessor loadStatus: E.SourceStatus = E.SourceStatus.idle

  /** Is `source` loading?  `:state(loading)`. */
  @cssState("loading")
  get isLoading(): boolean {
    return this.loadStatus === E.SourceStatus.loading
  }

  /** When to fetch:  `load`, default `eager` (also for a value the vocabulary doesn't know). */
  protected get loadingPolicy(): UIT.SourceLoadMode {
    return this.load ?? "eager"
  }

  /**
   * `source` the current content belongs to;  a different one drops edits.
   * - Not reactive:  nothing renders it.
   */
  private contentSource: E.URLString | undefined

  /** `source` whose text is in `fetchedText`;  reconnecting with the same one fetches nothing. */
  private fetchedSource: E.URLString | undefined

  /** The next fetch skips the cache (`reload()`). */
  private isFresh = false

  /** Stops the scheduled / running load. */
  private stopLoading: (() => void) | undefined

  /**
   * `source`, `load` or the connection changed:  stop the old load, schedule the new one;  disconnected, nothing.
   * - Returns the stop, run before the next change.
   */
  @onChange("source", "loadingPolicy", "isConnected")
  protected onSourceChanged(source: string | undefined, policy: UIT.SourceLoadMode, isConnected: boolean) {
    if (!isConnected) return
    this.stopLoading = this.scheduleLoad(source || undefined, policy)
    return () => {
      this.stopLoading?.()
      this.stopLoading = undefined
    }
  }

  /**
   * Start showing `source` (or the inline content) as `policy` says;  returns how to stop.
   * - A new `source` drops edits and starts a new `domElement.loaded`.
   * - The same one already fetched does nothing (a reconnect).
   */
  private scheduleLoad(source: E.URLString | undefined, policy: UIT.SourceLoadMode): (() => void) | undefined {
    const domElement = this.domElement as DOMLoadableElement
    if (source !== this.contentSource) {
      this.contentSource = source
      this.dropEdits()
      domElement.beginLoad()
    }
    if (!source) {
      this.loadStatus = E.SourceStatus.loaded
      this.loadError = undefined
      E.afterSolidUpdate(() => this.onLoaded(this.textToShow))
      return undefined
    }
    if (source === this.fetchedSource && !this.isFresh) return undefined
    try {
      this.checkSource(source)
    } catch (error) {
      this.onLoadError(error)
      return undefined
    }
    const controller = new AbortController()
    let undo: (() => void) | undefined
    const start = () => {
      undo?.()
      undo = undefined
      void this.fetchSource(source, controller.signal)
    }
    if (policy === "visible") {
      void UI.load().then(() => {
        if (!controller.signal.aborted) undo = UI.visibility.observe(this.domElement, { onOnScreen: start, once: true })
      })
    } else if (policy === "idle" && typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(start)
      undo = () => cancelIdleCallback(id)
    } else start()
    return () => {
      controller.abort()
      undo?.()
    }
  }

  /** Fetch `source` into `fetchedText`;  failures become the error state. */
  private async fetchSource(source: E.URLString, signal: AbortSignal) {
    this.loadStatus = E.SourceStatus.loading
    this.loadError = undefined
    const fresh = this.isFresh
    this.isFresh = false
    try {
      const ui = await UI.load()
      const loaded = await ui.sources.load(source, { signal, fresh })
      this.fetchedSource = source
      this.fetchedText = loaded.text
      this.lastETag = loaded.etag
      this.loadStatus = E.SourceStatus.loaded
      this.onLoaded(loaded.text)
    } catch (error) {
      if (signal.aborted) return
      this.onLoadError(error)
    }
  }

  /**
   * Content arrived:  settle `domElement.loaded`, then `ui-load`.
   * - An edit, when there is one, wins as the content.
   */
  @untracked
  private onLoaded(text: string) {
    const content = this.wasEdited ?? text
    ;(this.domElement as DOMLoadableElement).endLoad(content)
    this.sendSourceEvent(E.SourceEvent.load, { source: this.source || undefined, content })
  }

  /** Fetch `source` again past the cache, dropping edits;  resolves with the new content. */
  @untracked
  reload(): Promise<string> {
    const domElement = this.domElement as DOMLoadableElement
    const source = this.source || undefined
    this.dropEdits()
    if (!source) return domElement.loaded
    this.stopLoading?.()
    domElement.beginLoad()
    this.isFresh = true
    this.fetchedSource = undefined
    this.stopLoading = this.scheduleLoad(source, "eager")
    return domElement.loaded
  }

  ////////////////
  // ## Errors
  ////////////////

  /**
   * What the error message says;  `undefined` when there's none to show.
   * - Holds `render` failures too, and stays `undefined` when an app cancelled `ui-error`.
   */
  @state accessor loadError: E.SourceFailure | undefined = undefined

  /** Did loading (or showing) fail?  `:state(error)`. */
  @cssState("error")
  get hasError(): boolean {
    return this.loadStatus === E.SourceStatus.error
  }

  /** The error message's text, or `undefined`. */
  get errorText(): string | undefined {
    const failure = this.loadError
    if (!failure) return undefined
    const key = E.SOURCE_FAILURE_KEYS[failure.kind] ?? E.SOURCE_FAILURE_KEYS.load
    return this.translationForKey(key as E.TextKey<V>, { source: this.source ?? "" })
  }

  /**
   * Loading or showing failed:  `ui-error`, then the message unless it was cancelled.
   * - Subclasses call it for `render` failures (bad markup, an unknown language ...).
   */
  @untracked
  protected onLoadError(error: unknown, kind: E.SourceErrorKind = "load") {
    const reason = E.SourceError.kindFor(error, kind)
    this.loadStatus = E.SourceStatus.error
    ;(this.domElement as DOMLoadableElement).failLoad(error)
    const source = this.source || undefined
    const isShown = this.sendSourceEvent(E.SourceEvent.error, { kind: reason, source, error })
    if (isShown) this.loadError = { kind: reason, error }
  }

  ////////////////
  // ## Saving
  ////////////////

  /** A save is in progress.  `:state(saving)`. */
  @cssState("saving")
  @state
  accessor isSaving = false

  /** Content changed since it was loaded or saved.  `:state(dirty)`;  the script API's `dirty`. */
  @cssState("dirty")
  @state
  accessor isDirty = this.wasEdited !== undefined

  /** Version of the last load / save (`ETag`);  `undefined` before one, or when the server sent none. */
  lastETag: string | undefined

  /**
   * Save `text` (default the content) back to `source`;  resolves `true` once saved HERE.
   * - `text` given:  shown first, as setting `content`.
   * - The cancelable `ui-save` first:  cancelled -> `false` (the listener saves).
   * - No `source`:  nothing to write -- the content stays, `ui-saved`, `true`.
   * - Else `UI.sources.save()` (`fragment`:  `saveFragment()`), then
   *   - `ui-saved` with the new `etag`
   *   - or `ui-error` (`save`, `conflict`, `no-saver` ...) and `false`
   * - The content stays either way.
   */
  @untracked
  async save(text?: string): Promise<boolean> {
    if (text !== undefined) this.content = text
    const { content, lastETag: etag } = this
    const source = this.source || undefined
    if (!this.sendSourceEvent(E.SourceEvent.save, { source, content, etag })) return false
    if (!source) {
      this.isDirty = false
      this.sendSourceEvent(E.SourceEvent.saved, { source })
      return true
    }
    this.isSaving = true
    try {
      const ui = await UI.load()
      const result = await ui.sources.save({ url: source, text: content, etag, fragment: this.saveFragment() })
      this.lastETag = result.etag
      this.isDirty = false
      this.sendSourceEvent(E.SourceEvent.saved, { source, etag: result.etag })
      return true
    } catch (error) {
      const kind = E.SourceError.kindFor(error, "save")
      this.sendSourceEvent(E.SourceEvent.error, { kind, source, error })
      return false
    } finally {
      this.isSaving = false
    }
  }

  /** Forget edits:  a new `source`, or `reload()`. */
  private dropEdits() {
    this.wasEdited = undefined
    this.isDirty = false
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The shown text, as the subclass shows it. */
  protected abstract renderContent(): JSX.Element

  render(): JSX.Element {
    return (
      <>
        {this.isLoading ? this.loader() : undefined}
        {this.errorText ? this.errorMessage() : undefined}
        {this.renderContent()}
      </>
    )
  }

  /**
   * The `<ui-loader>` shown while loading.
   * - Built once, by the DOM (`statusElement()`:  Solid's JSX has no types for our tags).
   * - Each time it shows, its `aria-label` says what's loading ("Loading <source>").
   */
  private loader(): HTMLElement {
    const loader = this.loaderElement
    loader.setAttribute(
      "aria-label",
      this.translationForKey("sourceLoading" as E.TextKey<V>, { source: this.source ?? "" })
    )
    return loader
  }

  /** The loader, built on first use. */
  @lazy private get loaderElement(): HTMLElement {
    return this.statusElement(SOURCE_LOADER_TAG, "loader")
  }

  /** The `<ui-message>` shown on failure, built once as the loader is;  its text follows `errorText`. */
  private errorMessage(): HTMLElement {
    const message = this.errorElement
    message.textContent = this.errorText ?? ""
    return message
  }

  /** The error message, built on first use. */
  @lazy private get errorElement(): HTMLElement {
    return this.statusElement(SOURCE_MESSAGE_TAG, "error")
  }

  /** A `<ui-loader>` or `<ui-message>` with part `part`, and the attributes `STATUS_ATTRIBUTES` gives its tag. */
  private statusElement(tag: keyof typeof STATUS_ATTRIBUTES, part: string): HTMLElement {
    const element = this.domElement.ownerDocument.createElement(tag)
    element.setAttribute("part", this.partForName(part as never))
    for (const [name, value] of Object.entries(STATUS_ATTRIBUTES[tag])) element.setAttribute(name, value)
    return element
  }

  ////////////////
  // ## Subclass hooks
  ////////////////

  /**
   * Hook, checked before fetching:  throws when this element must NOT load `source`;  default never.
   * - Throws a `SourceError`, its `kind` the failure's.
   * - `<ui-include>`:  a cycle (an include inside an include of the same file).
   */
  protected checkSource(_source: string) {}

  /** `id` of the one element a save replaces (`<ui-include select>`);  default the whole file. */
  protected saveFragment(): string | undefined {
    return undefined
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** `send()` for the shared source events (`E.SourceEvent`), which every source vocabulary spreads. */
  protected sendSourceEvent(name: E.SourceEventName, detail: object): boolean {
    return (this.send as (name: string, detail: object) => boolean)(name, detail)
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * `domElement`'s own content as text, dedented:
   * a `<script type="text/...">` child's exact text, else a `<template>` child's markup, else the DOM element's text.
   * - Static:  the native fallbacks (`ui-code`, `ui-markdown`) read the same text, without a component.
   * - `localName`, not `instanceof HTMLScriptElement`:
   *   shared code never names a DOM global (`AGENTS.md` "Solid authoring" › SSR).
   */
  static inlineTextOf(domElement: HTMLElement): string {
    let text = domElement.textContent ?? ""
    for (const child of domElement.children) {
      if (child.localName === "script" && (child as HTMLScriptElement).type.startsWith("text/")) {
        text = (child as HTMLScriptElement).text
        break
      }
      if (child.localName === "template") {
        text = child.innerHTML
        break
      }
    }
    return LoadableComponent.dedent(text)
  }

  /**
   * `text` without its common indent, and without blank first / last lines:
   * inline content is indented with the page's markup.
   * - Tabs and spaces count one each;  blank lines don't set the indent.
   * - Static:  pure text, no element needed.
   */
  static dedent(text: string): string {
    const lines = text.replace(/\r\n?/g, "\n").split("\n")
    while (lines.length && !lines[0].trim()) lines.shift()
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop()
    let indent = Infinity
    for (const line of lines) if (line.trim()) indent = Math.min(indent, line.length - line.trimStart().length)
    if (!Number.isFinite(indent) || indent === 0) return lines.join("\n")
    return lines.map((line) => line.slice(Math.min(indent, line.length - line.trimStart().length))).join("\n")
  }
}

/**
 * Attributes each status element gets, by tag:
 * - the loader:  spinning (`active`), in the text flow (`inline`), centred (`centered`)
 * - the message:  the error look (`state="error"`)
 */
const STATUS_ATTRIBUTES = {
  [SOURCE_LOADER_TAG]: { active: "", inline: "", centered: "" },
  [SOURCE_MESSAGE_TAG]: { state: "error" }
} as const
