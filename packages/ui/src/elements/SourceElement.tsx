import { createEffect, createMemo, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { proto } from "$/ui/util"
import { SourceError, UI, type SourceErrorKind } from "$/ui/runtime"
import type { ComponentVocabulary } from "$/ui/vocabulary"

import {
  SOURCE_FAILURE_KEYS,
  SOURCE_LOADER_TAG,
  SOURCE_MESSAGE_TAG,
  type SourceController,
  type SourceFailure,
  type SourceStatus,
  type StateName,
  type TextKey
} from "./elements.types"
import { Cell } from "./Cell"
import { SourceHost } from "./SourceHost"
import { UIElement } from "./UIElement"

/**
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
 * - The vocabulary MUST spread `UIT.SOURCE_ATTRIBUTES` / `_EVENTS` / `_PARTS` / `_STATES` / `_TEXTS`:  the names
 *   used here.  The family barrel MUST import `ui-loader` and `ui-message` (built here by tag, see
 *   `SOURCE_LOADER_TAG`).
 * - A moved element keeps its content:  reconnecting doesn't fetch again (`keepAlive`).
 */
export abstract class SourceElement<V extends ComponentVocabulary = ComponentVocabulary>
  extends UIElement<V>
  implements SourceController
{
  declare inlineContent: boolean

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
  readonly inlineText = new Cell(isServer || !this.readsInline() ? "" : SourceElement.readInline(this.host))

  /** Last text fetched from `source`. */
  readonly fetched = new Cell<string | undefined>(undefined)

  /** Text set through `host.content`, shown instead of the source's;  `undefined` when none. */
  readonly edited = new Cell<string | undefined>((this.host as SourceHost).takePendingContent())

  /** Where loading is. */
  readonly status = new Cell<SourceStatus>("idle")

  /** What the error message says;  `undefined` when there's none to show. */
  readonly failure = new Cell<SourceFailure | undefined>(undefined)

  /** A save is in progress. */
  readonly saving = new Cell(false)

  /** Content changed since it was loaded or saved. */
  readonly dirty = new Cell(untrack(() => this.edited.get()) !== undefined)

  /** Version of the last load / save (`ETag`). */
  readonly etag = new Cell<string | undefined>(undefined)

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
    const key = SOURCE_FAILURE_KEYS[failure.kind] ?? SOURCE_FAILURE_KEYS.load
    return this.text(key as TextKey<V>, { source: this.sourceAttribute() ?? "" })
  })

  /** `source` the current content belongs to;  a different one drops edits. */
  private current: string | undefined = undefined

  /** `source` whose text is in `fetched`;  reconnecting with the same one fetches nothing. */
  private fetchedFor: string | undefined = undefined

  /** The latest edit, synchronously:  `edited` is staged until the microtask. */
  private latestEdit: string | undefined = untrack(() => this.edited.get())

  /** `dirty` and `etag` as last written:  the cells are staged until the microtask, script reads aren't. */
  private dirtyNow = untrack(this.dirty.get)
  private etagNow: string | undefined = undefined

  /** Next fetch skips the cache (`reload()`). */
  private fresh = false

  /** Stops the scheduled / running load. */
  private stopLoad: (() => void) | undefined = undefined

  /** The loader and the message, built on first use (Solid's JSX has no types for our tags). */
  private loaderElement?: HTMLElement
  private messageElement?: HTMLElement

  ////////////////
  // ## Rendering
  ////////////////

  /** The shown text, as the subclass shows it. */
  protected abstract renderContent(): JSX.Element

  render(): JSX.Element {
    return (
      <>
        {this.status.get() === "loading" ? this.loader() : undefined}
        {this.failureText() ? this.message() : undefined}
        {this.renderContent()}
      </>
    )
  }

  /**
   * Start following inline content and `source`, then render.
   * - The load effect tracks `source`, `load` and `connected`:  a change stops the old load and schedules the new
   *   one;  disconnecting stops it.
   */
  mount(): JSX.Element {
    if (!isServer) {
      if (this.readsInline()) {
        onSettled(() => {
          const observer = new MutationObserver(() => this.inlineText.set(SourceElement.readInline(this.host)))
          observer.observe(this.host, { childList: true, characterData: true, subtree: true })
          return () => observer.disconnect()
        })
      }
      createEffect(
        () => ({ source: this.sourceAttribute(), mode: this.loadMode(), connected: this.connected.get() }),
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

  protected hostStates(): Partial<Record<StateName<V>, boolean>> {
    return {
      loading: this.status.get() === "loading",
      error: this.status.get() === "error",
      saving: this.saving.get(),
      dirty: this.dirty.get()
    } as Partial<Record<StateName<V>, boolean>>
  }

  /** The loader, its label following `source`. */
  private loader(): HTMLElement {
    const loader = (this.loaderElement ??= this.statusElement(SOURCE_LOADER_TAG, "loader"))
    loader.setAttribute(
      "aria-label",
      this.text("sourceLoading" as TextKey<V>, { source: this.sourceAttribute() ?? "" })
    )
    return loader
  }

  /** The error message, its text following the failure. */
  private message(): HTMLElement {
    const message = (this.messageElement ??= this.statusElement(SOURCE_MESSAGE_TAG, "error"))
    message.textContent = this.failureText() ?? ""
    return message
  }

  /** A `<ui-loader>` (`active inline centered`) or `<ui-message>` (`state="error"`) with part `part`. */
  private statusElement(tag: string, part: string): HTMLElement {
    const element = this.host.ownerDocument.createElement(tag)
    element.setAttribute("part", this.part(part as never))
    if (tag === SOURCE_LOADER_TAG) for (const name of LOADER_SWITCHES) element.setAttribute(name, "")
    else element.setAttribute(MESSAGE_STATE, MESSAGE_ERROR)
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
    return (this.attrs as unknown as SourceAttributes).source || undefined
  }

  /** `load`, default `eager`. */
  private loadMode(): string {
    return (this.attrs as unknown as SourceAttributes).load || EAGER
  }

  /**
   * Start showing `source` (or the inline content) as `mode` says;  returns how to stop.
   * - A new `source` drops edits and starts a new `host.loaded`;  the same one already fetched does nothing
   *   (a reconnect).
   */
  private schedule(source: string | undefined, mode: string): (() => void) | undefined {
    const host = this.host as SourceHost
    if (source !== this.current) {
      this.current = source
      this.dropEdits()
      host.beginLoad()
    }
    if (!source) {
      this.status.set("loaded")
      this.failure.set(undefined)
      queueMicrotask(() => this.loadedWith(untrack(this.contentText)))
      return undefined
    }
    if (source === this.fetchedFor && !this.fresh) return undefined
    const refusal = this.refuseSource(source)
    if (refusal) {
      this.loadFailed(refusal, refusal.kind)
      return undefined
    }
    const controller = new AbortController()
    let undo: (() => void) | undefined
    const start = () => {
      undo?.()
      undo = undefined
      void this.fetch(source, controller.signal)
    }
    if (mode === VISIBLE) {
      void UI.load().then(() => {
        if (!controller.signal.aborted) undo = UI.visibility.observe(this.host, { onOnScreen: start, once: true })
      })
    } else if (mode === IDLE && typeof requestIdleCallback === "function") {
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
    this.status.set("loading")
    this.failure.set(undefined)
    const fresh = this.fresh
    this.fresh = false
    try {
      const ui = await UI.load()
      const loaded = await ui.sources.load(source, { signal, fresh })
      this.fetchedFor = source
      this.fetched.set(loaded.text)
      this.setEtag(loaded.etag)
      this.status.set("loaded")
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
    this.emitSource("ui-load", { source: untrack(() => this.sourceAttribute()), content })
  }

  /**
   * Loading or showing failed:  `ui-error`, then the message unless it was cancelled.
   * - Subclasses call it for `render` failures (bad markup, an unknown language ...).
   */
  protected loadFailed(error: unknown, kind: SourceErrorKind = "load") {
    const reason = error instanceof SourceError ? error.kind : kind
    this.status.set("error")
    ;(this.host as SourceHost).failLoad(error)
    const shown = this.emitSource("ui-error", { kind: reason, source: untrack(() => this.sourceAttribute()), error })
    if (shown) this.failure.set({ kind: reason, error })
  }

  /** Forget edits:  a new `source`, or `reload()`. */
  private dropEdits() {
    this.latestEdit = undefined
    this.edited.set(undefined)
    this.setDirty(false)
  }

  /** `dirty`, now and for the cell. */
  private setDirty(dirty: boolean) {
    this.dirtyNow = dirty
    this.dirty.set(dirty)
  }

  /** `etag`, now and for the cell. */
  private setEtag(etag: string | undefined) {
    this.etagNow = etag
    this.etag.set(etag)
  }

  ////////////////
  // ## Script API (`SourceHost`)
  ////////////////

  /** The text shown now, edits included;  synchronous even right after `setContent()`. */
  getContent(): string {
    return this.latestEdit ?? untrack(this.contentText)
  }

  /** Show `text` instead (`dirty` until saved);  `ui-change`. */
  setContent(text: string) {
    if (text === this.getContent()) return
    this.latestEdit = text
    this.edited.set(text)
    this.setDirty(true)
    this.emitSource("ui-change", { content: text })
  }

  getEtag(): string | undefined {
    return this.etagNow
  }

  isDirty(): boolean {
    return this.dirtyNow
  }

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
    const content = this.getContent()
    const source = untrack(() => this.sourceAttribute())
    const etag = this.getEtag()
    if (!this.emitSource("ui-save", { source, content, etag })) return false
    if (!source) {
      this.setDirty(false)
      this.emitSource("ui-saved", { source })
      return true
    }
    this.saving.set(true)
    try {
      const ui = await UI.load()
      const result = await ui.sources.save({ url: source, text: content, etag, fragment: this.saveFragment() })
      this.setEtag(result.etag)
      this.setDirty(false)
      this.emitSource("ui-saved", { source, etag: result.etag })
      return true
    } catch (error) {
      const kind = error instanceof SourceError ? error.kind : "save"
      this.emitSource("ui-error", { kind, source, error })
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
    this.stopLoad = this.schedule(source, EAGER)
    return host.loaded
  }

  /**
   * A reason NOT to load `source`, checked before fetching;  default none.
   * - `<ui-include>`:  a cycle (an include inside an include of the same file).
   */
  protected refuseSource(_source: string): SourceError | undefined {
    return undefined
  }

  /** `id` of the one element a save replaces (`<ui-include select>`);  default the whole file. */
  protected saveFragment(): string | undefined {
    return undefined
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** `emit()` for the shared source events (`UIT.SOURCE_EVENTS`), which every source vocabulary spreads. */
  protected emitSource(name: string, detail: object): boolean {
    return (this.emit as (name: string, detail: object) => boolean)(name, detail)
  }

  /**
   * `host`'s own content as text:  a `<script type="text/...">` child's exact text, else a `<template>` child's
   * markup, else the host's text;  dedented.
   */
  static readInline(host: HTMLElement): string {
    let text = host.textContent ?? ""
    for (const child of host.children) {
      if (child instanceof HTMLScriptElement && child.type.startsWith(TEXT_SCRIPT)) {
        text = child.text
        break
      }
      if (child instanceof HTMLTemplateElement) {
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

/** The shared attributes, as `attrs` has them. */
type SourceAttributes = {
  source?: string | null
  load?: string | null
}

/** `load` values. */
const EAGER = "eager"
const VISIBLE = "visible"
const IDLE = "idle"

/** `<script type>` prefix that marks inline text. */
const TEXT_SCRIPT = "text/"

/** The loader's switches:  a centred spinner in the flow. */
const LOADER_SWITCHES = ["active", "inline", "centered"]

/** The message's state attribute and value. */
const MESSAGE_STATE = "state"
const MESSAGE_ERROR = "error"
