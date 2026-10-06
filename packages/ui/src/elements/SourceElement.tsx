import { createEffect, createMemo, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

// Import directly to avoid circular import
import { proto } from "$/ui/util"
import { E, UI, type UIT } from "$/ui/core"
// Import directly to avoid circular import
import { UIElement } from "./UIElement"
import { SourceHost } from "./SourceHost"
import { SOURCE_LOADER_TAG, SOURCE_MESSAGE_TAG } from "./elements.types"

/****************
 * ### `SourceElement`
 * Base CONTROLLER of the elements that show a text file:  `<ui-include>`, `<ui-code>`, `<ui-markdown>`.  Owns where
 * the text comes from, the loading / error look, and saving;  a subclass only says how to show the text
 * (`renderContent()`, reading `contentText()`).
 * - Text comes from, first match wins:
 *   1. `source`:  fetched through `UI.sources` (same origin only), when `load` says (`eager`, `visible`, `idle`)
 *   2. the host's own content (`inlineContent`):  a `<script type="text/...">` child (exact text), else a
 *      `<template>` child (its markup), else the host's text;  dedented;  followed by a `MutationObserver`
 *   3. `host.content = "..."` overrides either until `source` changes or `reload()`
 * - States:  `:state(loading)` (a `<ui-loader>` shows), `:state(error)` (a `<ui-message>` says why, unless the
 *   cancelable `ui-error` was cancelled), `:state(saving)`, `:state(dirty)`.
 * - Saving (`save()`):  the cancelable `ui-save` first, then `UI.sources.save()` through the page's saver;
 *   `ui-saved` or `ui-error` after.  A save failure never replaces the content with a message.
 * - The vocabulary MUST spread `UIT.SourceAttributes` / `SourceEvents` / `SourceParts` / `SourceStates` / `SourceTexts`:  the names
 *   used here.  The family barrel MUST import `ui-loader` and `ui-message` (built here by tag, see
 *   `SOURCE_LOADER_TAG`).
 * - A moved element keeps its content:  reconnecting doesn't fetch again (`keepAlive`).
 * - Imports the core as `E` / `UI` / `UIT`, except what its class definition reads (the base class, `Host`, the
 *   status tags):  directly (WWOD §4 › "Circular imports").  NEVER a value from `$/ui/components`:  the vocabulary
 *   pieces it relies on (`UIT.Source*`) only as types.
 ****************/
export abstract class SourceElement<V extends E.ComponentVocabulary = E.ComponentVocabulary>
  extends UIElement<V>
  implements E.SourceController
{
  /** Read the host's own content as the text?  See `@proto static inlineContent`. */
  declare inlineContent: boolean

  /** Host with the script API (`content`, `save()`, `loaded` ...). */
  @proto static Host = SourceHost

  /**
   * Read the host's own content as the text when there's no `source`.
   * - `false` for `<ui-include>`, whose children are a placeholder shown until the include loads.
   */
  @proto static inlineContent = true

  ////////////////
  // ## State
  ////////////////

  /** The host's own content as text, dedented (`inlineContent`). */
  readonly inlineText = new E.Cell(isServer || !this.readsInline() ? "" : SourceElement.inlineTextFor(this.host))

  /** Last text fetched from `source`. */
  readonly fetched = new E.Cell<string | undefined>(undefined)

  /** Text set through `host.content`, shown instead of the source's;  `undefined` when none. */
  readonly edited = new E.Cell<string | undefined>((this.host as SourceHost).takePendingContent())

  /** Where loading is. */
  readonly status = new E.Cell<E.SourceStatus>(E.SourceStatus.idle)

  /** What the error message says;  `undefined` when there's none to show. */
  readonly failure = new E.Cell<E.SourceFailure | undefined>(undefined)

  /** A save is in progress. */
  readonly saving = new E.Cell(false)

  /** Content changed since it was loaded or saved;  tracked (`isDirty` is the synchronous read). */
  readonly dirty = new E.Cell(untrack(() => this.edited.get()) !== undefined)

  /** The text to show:  edits, else the fetched source, else the host's own content. */
  readonly contentText = createMemo(() => {
    const edited = this.edited.get()
    if (edited !== undefined) return edited
    return this.sourceAttribute() ? (this.fetched.get() ?? "") : this.inlineText.get()
  })

  /** The error message's text, or `undefined`. */
  readonly failureText = createMemo(() => {
    const failure = this.failure.get()
    if (!failure) return undefined
    const key = E.SOURCE_FAILURE_KEYS[failure.kind] ?? E.SOURCE_FAILURE_KEYS.load
    return this.text(key as E.TextKey<V>, { source: this.sourceAttribute() ?? "" })
  })

  /** `source` the current content belongs to;  a different one drops edits. */
  private current: string | undefined

  /** `source` whose text is in `fetched`;  reconnecting with the same one fetches nothing. */
  private fetchedFor: string | undefined

  /** The latest edit, synchronously:  `edited` is staged until the microtask. */
  private latestEdit: string | undefined = untrack(() => this.edited.get())

  /** Next fetch skips the cache (`reload()`). */
  private fresh = false

  /** Stops the scheduled / running load. */
  private stopLoad: (() => void) | undefined

  /** The loader, built on first use (Solid's JSX has no types for our tags). */
  private loaderElement?: HTMLElement

  /** The error message, built on first use, as `loaderElement`. */
  private messageElement?: HTMLElement

  ////////////////
  // ## Rendering
  ////////////////

  /** The shown text, as the subclass shows it. */
  protected abstract renderContent(): JSX.Element

  render(): JSX.Element {
    return (
      <>
        {this.status.get() === E.SourceStatus.loading ? this.loader() : undefined}
        {this.failureText() ? this.message() : undefined}
        {this.renderContent()}
      </>
    )
  }

  /**
   * Start following inline content and `source`, then render.
   * - The load effect tracks `source`, `load` and `isConnected`:  a change stops the old load and schedules the new
   *   one;  disconnecting stops it.
   */
  mount(): JSX.Element {
    if (!isServer) {
      if (this.readsInline()) {
        onSettled(() => {
          const observer = new MutationObserver(() => this.inlineText.set(SourceElement.inlineTextFor(this.host)))
          observer.observe(this.host, { childList: true, characterData: true, subtree: true })
          return () => observer.disconnect()
        })
      }
      createEffect(
        () => ({ source: this.sourceAttribute(), mode: this.loadMode(), connected: this.isConnected.get() }),
        ({ source, mode, connected }) => {
          if (!connected) return
          this.stopLoad = this.schedule(source, mode)
          return () => {
            this.stopLoad?.()
            this.stopLoad = undefined
          }
        }
      )
    }
    return super.mount()
  }

  protected hostStates(): Partial<Record<E.StateName<V>, boolean>> {
    return {
      loading: this.status.get() === E.SourceStatus.loading,
      error: this.status.get() === E.SourceStatus.error,
      saving: this.saving.get(),
      dirty: this.dirty.get()
    } as Partial<Record<E.StateName<V>, boolean>>
  }

  /** The loader, its label following `source`. */
  private loader(): HTMLElement {
    const loader = (this.loaderElement ??= this.statusElement(SOURCE_LOADER_TAG, "loader"))
    loader.setAttribute(
      "aria-label",
      this.text("sourceLoading" as E.TextKey<V>, { source: this.sourceAttribute() ?? "" })
    )
    return loader
  }

  /** The error message, its text following the failure. */
  private message(): HTMLElement {
    const message = (this.messageElement ??= this.statusElement(SOURCE_MESSAGE_TAG, "error"))
    message.textContent = this.failureText() ?? ""
    return message
  }

  /** A `<ui-loader>` or `<ui-message>` with part `part`, and the attributes `STATUS_ATTRIBUTES` gives its tag. */
  private statusElement(tag: keyof typeof STATUS_ATTRIBUTES, part: string): HTMLElement {
    const element = this.host.ownerDocument.createElement(tag)
    element.setAttribute("part", this.part(part as never))
    for (const [name, value] of Object.entries(STATUS_ATTRIBUTES[tag])) element.setAttribute(name, value)
    return element
  }

  ////////////////
  // ## Loading
  ////////////////

  /** `inlineContent`, through a method:  a field initializer may read the prototype's value, TS can't tell. */
  private readsInline(): boolean {
    return this.inlineContent
  }

  /** `source`, as written;  `undefined` when absent or empty. */
  protected sourceAttribute(): string | undefined {
    return (this.attrs as unknown as SourceAttributeValues).source || undefined
  }

  /** `load`, default `eager` (also for a value the vocabulary doesn't know). */
  private loadMode(): UIT.SourceLoadMode {
    return (this.attrs as unknown as SourceAttributeValues).load || AT_ONCE
  }

  /**
   * Start showing `source` (or the inline content) as `mode` says;  returns how to stop.
   * - A new `source` drops edits and starts a new `host.loaded`;  the same one already fetched does nothing
   *   (a reconnect).
   */
  private schedule(source: string | undefined, mode: UIT.SourceLoadMode): (() => void) | undefined {
    const host = this.host as SourceHost
    if (source !== this.current) {
      this.current = source
      this.dropEdits()
      host.beginLoad()
    }
    if (!source) {
      this.status.set(E.SourceStatus.loaded)
      this.failure.set(undefined)
      queueMicrotask(() => this.loadedWith(untrack(this.contentText)))
      return undefined
    }
    if (source === this.fetchedFor && !this.fresh) return undefined
    try {
      this.checkSource(source)
    } catch (error) {
      this.loadFailed(error)
      return undefined
    }
    const controller = new AbortController()
    let undo: (() => void) | undefined
    const start = () => {
      undo?.()
      undo = undefined
      void this.fetch(source, controller.signal)
    }
    if (mode === "visible") {
      void UI.load().then(() => {
        if (!controller.signal.aborted) undo = UI.visibility.observe(this.host, { onOnScreen: start, once: true })
      })
    } else if (mode === "idle" && typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(start)
      undo = () => cancelIdleCallback(id)
    } else start()
    return () => {
      controller.abort()
      undo?.()
    }
  }

  /** Fetch `source` into `fetched`;  failures become the error state. */
  private async fetch(source: string, signal: AbortSignal) {
    this.status.set(E.SourceStatus.loading)
    this.failure.set(undefined)
    const fresh = this.fresh
    this.fresh = false
    try {
      const ui = await UI.load()
      const loaded = await ui.sources.load(source, { signal, fresh })
      this.fetchedFor = source
      this.fetched.set(loaded.text)
      this.lastEtag = loaded.etag
      this.status.set(E.SourceStatus.loaded)
      this.loadedWith(loaded.text)
    } catch (error) {
      if (signal.aborted) return
      this.loadFailed(error)
    }
  }

  /** Content arrived:  settle `host.loaded`, then `ui-load` (`latestEdit`, when set, wins as the content). */
  private loadedWith(text: string) {
    const content = this.latestEdit ?? text
    ;(this.host as SourceHost).endLoad(content)
    this.emitSource(E.SourceEvent.load, { source: untrack(() => this.sourceAttribute()), content })
  }

  /**
   * Loading or showing failed:  `ui-error`, then the message unless it was cancelled.
   * - Subclasses call it for `render` failures (bad markup, an unknown language ...).
   */
  protected loadFailed(error: unknown, kind: E.SourceErrorKind = "load") {
    const reason = E.SourceError.kindFor(error, kind)
    this.status.set(E.SourceStatus.error)
    ;(this.host as SourceHost).failLoad(error)
    const source = untrack(() => this.sourceAttribute())
    const shown = this.emitSource(E.SourceEvent.error, { kind: reason, source, error })
    if (shown) this.failure.set({ kind: reason, error })
  }

  /** Forget edits:  a new `source`, or `reload()`. */
  private dropEdits() {
    this.latestEdit = undefined
    this.edited.set(undefined)
    this.setDirty(false)
  }

  /** `dirty`, now (`isDirty`) and for the cell. */
  private setDirty(dirty: boolean) {
    this.dirtyNow = dirty
    this.dirty.set(dirty)
  }

  ////////////////
  // ## Script API (`SourceHost`)
  ////////////////

  /** The text shown now, edits included;  synchronous even right after `setContent()`. */
  get content(): string {
    return this.latestEdit ?? untrack(this.contentText)
  }

  /** Show `text` instead (`dirty` until saved);  `ui-change`. */
  setContent(text: string) {
    if (text === this.content) return
    this.latestEdit = text
    this.edited.set(text)
    this.setDirty(true)
    this.emitSource(E.SourceEvent.change, { content: text })
  }

  /** Version of the last load / save (`ETag`);  `undefined` before one, or when the server sent none. */
  get etag(): string | undefined {
    return this.lastEtag
  }
  private lastEtag: string | undefined

  /** Changed since loaded / saved?  Synchronous:  the `dirty` cell is staged until the microtask. */
  get isDirty(): boolean {
    return this.dirtyNow
  }
  private dirtyNow = untrack(this.dirty.get)

  /**
   * Save `text` (default the content) back to `source`;  resolves `true` once saved HERE.
   * - `text` given:  shown first, as `setContent()`.
   * - The cancelable `ui-save` first:  cancelled -> `false` (the listener saves).
   * - No `source`:  nothing to write -- the content stays, `ui-saved`, `true`.
   * - Else `UI.sources.save()` (`fragment`:  `saveFragment()`);  `ui-saved` with the new `etag`, or `ui-error`
   *   (`save`, `conflict`, `no-saver` ...) and `false`.  The content stays either way.
   */
  async save(text?: string): Promise<boolean> {
    if (text !== undefined) this.setContent(text)
    const { content, etag } = this
    const source = untrack(() => this.sourceAttribute())
    if (!this.emitSource(E.SourceEvent.save, { source, content, etag })) return false
    if (!source) {
      this.setDirty(false)
      this.emitSource(E.SourceEvent.saved, { source })
      return true
    }
    this.saving.set(true)
    try {
      const ui = await UI.load()
      const result = await ui.sources.save({ url: source, text: content, etag, fragment: this.saveFragment() })
      this.lastEtag = result.etag
      this.setDirty(false)
      this.emitSource(E.SourceEvent.saved, { source, etag: result.etag })
      return true
    } catch (error) {
      const kind = E.SourceError.kindFor(error, "save")
      this.emitSource(E.SourceEvent.error, { kind, source, error })
      return false
    } finally {
      this.saving.set(false)
    }
  }

  /** Fetch `source` again past the cache, dropping edits;  resolves with the new content. */
  reload(): Promise<string> {
    const host = this.host as SourceHost
    const source = untrack(() => this.sourceAttribute())
    this.dropEdits()
    if (!source) return host.loaded
    this.stopLoad?.()
    host.beginLoad()
    this.fresh = true
    this.fetchedFor = undefined
    this.stopLoad = this.schedule(source, AT_ONCE)
    return host.loaded
  }

  ////////////////
  // ## Subclass hooks
  ////////////////

  /**
   * Throws (a `SourceError`, its `kind` the failure's) when this element must NOT load `source`, checked before
   * fetching;  default never.
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

  /** `emit()` for the shared source events (`SourceEvent`), which every source vocabulary spreads. */
  protected emitSource(name: string, detail: object): boolean {
    return (this.emit as (name: string, detail: object) => boolean)(name, detail)
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * `host`'s own content as text:  a `<script type="text/...">` child's exact text, else a `<template>` child's
   * markup, else the host's text;  dedented.
   * - Static:  the native fallbacks (`ui-code`, `ui-markdown`) read the same text, without a controller.
   * - `localName`, not `instanceof HTMLScriptElement`:  shared code never names a DOM global (`AGENTS.md` "Solid
   *   authoring" › SSR).
   */
  static inlineTextFor(host: HTMLElement): string {
    let text = host.textContent ?? ""
    for (const child of host.children) {
      if (child.localName === "script" && (child as HTMLScriptElement).type.startsWith(TEXT_SCRIPT)) {
        text = (child as HTMLScriptElement).text
        break
      }
      if (child.localName === "template") {
        text = child.innerHTML
        break
      }
    }
    return SourceElement.dedent(text)
  }

  /**
   * `text` without its common indent, and without blank first / last lines:  inline content is indented with the
   * page's markup.
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

/** The shared attributes (`UIT.SourceAttributes`), as `attrs` has them. */
type SourceAttributeValues = {
  /** URL of the file to show */
  source?: string
  /** when to fetch it;  `undefined` for a value the vocabulary doesn't know */
  load?: UIT.SourceLoadMode
}

/** `load` that fetches at once:  the default, and what `reload()` uses. */
const AT_ONCE: UIT.SourceLoadMode = "eager"

/** `<script type>` prefix that marks inline text. */
const TEXT_SCRIPT = "text/"

/** Attributes of the status elements, by tag:  the loader a centred spinner in the flow, the message an error. */
const STATUS_ATTRIBUTES = {
  [SOURCE_LOADER_TAG]: { active: "", inline: "", centered: "" },
  [SOURCE_MESSAGE_TAG]: { state: "error" }
} as const
