import { Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, UIHost, proto, UIElement, type Disposer } from "$/ui/core"

import { LoaderMessage, type RootLoading } from "./LoaderMessage"
import { RootBox } from "./RootBox"
import { RootLoader } from "./RootLoader"
import { RootFallback } from "./ui-root.fallback"
import {
  DISPLAY,
  MAX_ROUNDS,
  RootTimeout,
  type RootFailure,
  type RootFailureReason,
  type RootVocabulary
} from "./ui-root.types"
import { rootVocabulary } from "./ui-root.vocabulary.en"

import rootCSS from "./ui-root.css?inline"

/****************
 * ### `<ui-root>`
 * The top of a page or app:  `<slot>` for the page, plus what shows while it loads.
 * - Loads on demand:  every undefined `ui-*` tag inside (now, and as content is added) imports its family once
 *   (`RootLoader`);  nothing is imported up front.
 * - Ready:  every family settled, then every `ui-*` element inside `ready` (a nested root:  its own `settled`), or the
 *   `timeout`.  Then `:state(ready)`, `ui-ready { failed }`, and the content shows.  Each tag that didn't load fires a
 *   cancelable `ui-error` first.  Content added later loads too, but is never hidden again.
 * - While loading (`display`, not `immediately`):  the slot is hidden by an INLINE style (the root renders `eager`ly,
 *   before any sheet), with its space kept (`when-ready`, `skeleton` until skeletons exist) or not drawn at all when
 *   the `loading` message shows instead.
 * - What shows while loading is swappable:  `UIRoot.Loading` (`LoaderMessage`, a `<ui-loader>`).
 * - Theme, size, box:  `:state(light | dark)`, `:state(box)`, `:state(fixed)` in `ui-root.css`;  width, height and the
 *   subtree's `--ui-scale` in the root's own sheet (`RootBox`).
 ****************/
export class UIRoot extends UIElement<RootVocabulary> {
  @proto static vocabulary = rootVocabulary
  @proto static styles = { root: rootCSS }
  @proto static Fallback = RootFallback
  @proto static delegatesFocus = false
  @proto static eager = true

  /** What shows with `loading`:  swap it for another look (`UIRoot.Loading = MyLoading`). */
  @proto static Loading: RootLoading = LoaderMessage

  declare Loading: RootLoading

  /** Everything inside is ready (or the timeout passed). */
  readonly isReady = new Cell(false)

  /** Resolves `settled`. */
  private resolveSettled!: (failures: readonly RootFailure[]) => void

  /** Resolves with what didn't load, once ready;  an outer root waits for it. */
  readonly settled = new Promise<readonly RootFailure[]>((resolve) => (this.resolveSettled = resolve))

  /** What didn't load, in order. */
  private readonly failures: RootFailure[] = []

  /** `tag reason` pairs already reported, so each is reported once. */
  private readonly reported = new Set<string>()

  /** Elements inside not ready yet (for the timeout's report). */
  private readonly waiting = new Set<Element>()

  /** Elements already awaited. */
  private readonly awaited = new WeakSet<Element>()

  /** Started loading (on first connect). */
  private started = false

  /** The display mode. */
  private readonly display = createMemo(() => this.attrs.display ?? DISPLAY.skeleton)

  /** The `loading` message shows. */
  private readonly showLoading = createMemo(
    () =>
      !this.isReady.get() &&
      this.display() !== DISPLAY.immediately &&
      this.attrs.loading !== undefined &&
      this.attrs.loading !== null
  )

  protected hostStates() {
    const ready = this.isReady.get()
    return {
      loading: !ready,
      ready,
      light: this.attrs.theme === "light",
      dark: this.attrs.theme === "dark",
      box: RootBox.isBox(this.attrs.width, this.attrs.height),
      fixed: !!this.attrs.fixed
    }
  }

  render(): JSX.Element {
    this.effects()
    return (
      <>
        <Show when={this.showLoading()}>{this.Loading.render(this.part("loading"), () => this.message())}</Show>
        <slot class={this.classes()} style={this.slotStyle()} />
      </>
    )
  }

  /** The loader's message:  `loading`'s value, or the default text for a bare `loading`. */
  private message(): string {
    return this.attrs.loading || this.text("loading")
  }

  /** Inline style of the slot:  hidden while loading (unless `immediately`);  not drawn while the message shows. */
  private slotStyle(): string | undefined {
    if (this.isReady.get() || this.display() === DISPLAY.immediately) return undefined
    return this.showLoading() ? "display: none" : "visibility: hidden"
  }

  /** Watch the content while connected;  keep the root's own sheet current. */
  private effects() {
    if (isServer) return
    createEffect(
      () => this.connected.get(),
      (connected) => (connected ? this.watch() : undefined)
    )
    const box = new RootBox(this.host.renderRoot)
    createEffect(
      () => RootBox.css({ width: this.attrs.width, height: this.attrs.height, size: this.attrs.size }),
      (css) => box.set(css)
    )
  }

  /** Load what's inside now (first connect:  and wait for it), and whatever is added later;  returns the undo. */
  private watch(): Disposer {
    const observer = new MutationObserver(() => void this.loadUndefined())
    observer.observe(this.host, { childList: true, subtree: true })
    if (this.started) void this.loadUndefined()
    else {
      this.started = true
      void this.start()
    }
    return () => observer.disconnect()
  }

  ////////////////
  // ## Loading
  ////////////////

  /** Load, wait (or time out), then show the content and say so. */
  private async start() {
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<"timeout">((resolve) => {
      timer = setTimeout(() => resolve("timeout"), RootTimeout.parse(untrack(() => this.attrs.timeout)))
    })
    const outcome = await Promise.race([this.settle(), timeout])
    clearTimeout(timer)
    if (outcome === "timeout") this.timedOut()
    this.isReady.set(true)
    this.emit("ui-ready", { failed: [...this.failures] })
    this.resolveSettled([...this.failures])
  }

  /** Rounds of:  import every undefined tag's family, then await every element inside, until nothing new turns up. */
  private async settle(): Promise<void> {
    for (let round = 0; round < MAX_ROUNDS; round++) {
      await this.loadUndefined()
      const pending = this.pendingElements()
      if (!pending.length) return
      await Promise.all(pending.map((element) => this.whenReady(element)))
    }
  }

  /** Import the family of every undefined `ui-*` tag inside;  resolves once each import settled. */
  private loadUndefined(): Promise<void> {
    const loads: Promise<void>[] = []
    for (const tag of RootLoader.undefinedTags(this.host)) {
      const folder = RootLoader.folderOf(tag)
      if (!folder) {
        this.fail(tag, "unknown")
        continue
      }
      loads.push(RootLoader.load(folder).catch((error: unknown) => this.fail(tag, "failed", error)))
    }
    return Promise.all(loads).then(() => undefined)
  }

  /** Defined `ui-*` elements inside, not awaited yet. */
  private pendingElements(): UIHost[] {
    return [...this.host.querySelectorAll("*")].filter(
      (element): element is UIHost => element instanceof UIHost && !this.awaited.has(element)
    )
  }

  /** Resolves once `element` is ready:  a nested root once IT is settled. */
  private async whenReady(element: UIHost): Promise<void> {
    this.awaited.add(element)
    this.waiting.add(element)
    await element.ready
    if (element.controller instanceof UIRoot) await element.controller.settled
    this.waiting.delete(element)
  }

  /** The timeout passed:  report what's still undefined or not ready. */
  private timedOut() {
    for (const tag of RootLoader.undefinedTags(this.host)) {
      if (RootLoader.folderOf(tag)) this.fail(tag, "timeout")
    }
    for (const element of this.waiting) this.fail(element.localName, "timeout")
  }

  /** Record that `tag` didn't load (once per tag and reason):  `ui-error`, then a console warning unless cancelled. */
  private fail(tag: string, reason: RootFailureReason, error?: unknown) {
    const key = `${tag} ${reason}`
    if (this.reported.has(key)) return
    this.reported.add(key)
    const failure: RootFailure = error === undefined ? { tag, reason } : { tag, reason, error }
    this.failures.push(failure)
    if (this.emit("ui-error", failure)) console.warn(`<ui-root>:  <${tag}> didn't load (${reason})`, error ?? "")
  }
}
