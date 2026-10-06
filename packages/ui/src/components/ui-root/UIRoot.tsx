import { Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { LoaderMessage, type RootLoading } from "./LoaderMessage"
import { PlaceholderSkeleton, type RootSkeletonRenderer } from "./PlaceholderSkeleton"
import { RootBox } from "./RootBox"
import { RootLoader } from "./RootLoader"
import { RootFallback } from "./ui-root.fallback"
import {
  RootTimeout,
  type RootFailure,
  type RootFailureReason,
  type RootSkeleton,
  type RootVocabulary
} from "./ui-root.types"
import { rootVocabulary } from "./ui-root.vocabulary.en"

import rootCSS from "./ui-root.css?inline"

/****************
 * ### `<ui-root>`
 * The top of a page or app:  `<slot>` for the page, plus what shows while it loads.
 * - Loads on demand:  every undefined `ui-*` tag inside (now, and as content is added) imports its family once
 *   (`RootLoader`);  nothing is imported up front.  So does every tag a component pack added (`<ui-components>`),
 *   whatever its name;  while a pack is on its way, a tag nobody knows yet waits for it before it's `unknown`.
 * - Ready:  every family settled, then every `ui-*` element inside `ready` (a nested root:  its own `settled`), or the
 *   `timeout`.  Then `:state(ready)`, `ui-ready { failed }`, and the content shows.  Each tag that didn't load fires a
 *   cancelable `ui-error` first.  Content added later loads too, but is never hidden again.
 * - While loading (`display`, not `immediately`):  the slot is hidden by an INLINE style (`canRenderUnstyled`,
 *   before any sheet), with its space kept (`when-ready`), or not drawn at all when the `loading` message or the
 *   skeletons show instead.
 * - `skeleton`:  every element inside whose tag describes a skeleton (`E.ComponentVocabulary.skeleton`, in the generated
 *   catalog, or a pack's) gets a `<ui-placeholder>` in the root's shadow, in page order;  one inside another is
 *   covered by it.  Found again once the packs on their way are in.  Nothing described:  as `when-ready`.
 * - What shows while loading is swappable:  `UIRoot.Loading` (`LoaderMessage`, a `<ui-loader>`) and `UIRoot.Skeleton`
 *   (`PlaceholderSkeleton`).
 * - Settings for everything inside (`E.RootSettings`):  `icons` (a child icon-pack set over the outer root's, or the
 *   page's), `emoji` (a name set);  nested roots inherit what they don't set.  A change redraws the icons / emoji
 *   inside (`E.RootSettings.generation`).
 * - Theme, size, box:  `:state(light | dark)`, `:state(box)`, `:state(fixed)` in `ui-root.css`;  width, height and the
 *   subtree's `--ui-scale` in the root's own sheet (`RootBox`).
 * - `stack-with`:  the subtree's `--ui-stack-with` token (also in `RootBox`), which every stacking element without a
 *   `stack-with` of its own follows (`UIT.STACK_WITH_TOKEN`).
 * - Static server render (`$/ui/static`):  nothing loads and nothing is hidden;  the root is a plain wrapper
 *   (`serverWrapper()`).
 ****************/
export class UIRoot extends E.UIElement<RootVocabulary> {
  @E.proto static vocabulary = rootVocabulary
  @E.proto static styles = { root: rootCSS }
  @E.proto static Fallback = RootFallback
  @E.proto static delegatesFocus = false
  @E.proto static canRenderUnstyled = true

  /** What shows with `loading`:  swap it for another look (`UIRoot.Loading = MyLoading`). */
  @E.proto static Loading: RootLoading = LoaderMessage

  /** What shows with `display="skeleton"`:  swap it for another look (`UIRoot.Skeleton = MySkeleton`). */
  @E.proto static Skeleton: RootSkeletonRenderer = PlaceholderSkeleton

  declare Loading: RootLoading
  declare Skeleton: RootSkeletonRenderer

  /** Host `aria-label`:  the scrolling region's name. */
  readonly ariaLabel = new E.HostAttribute({ host: this.host, name: UIT.ARIA_LABEL })

  /** Everything inside is ready (or the timeout passed). */
  readonly isReady = new E.Cell(false)

  /** The skeletons to draw while loading (`display="skeleton"`), found when loading starts. */
  readonly skeletons = new E.Cell<readonly RootSkeleton[]>([])

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

  /** Settings requests, so a slower earlier one can't win. */
  private settingsRequest = 0

  /** Started loading (on first connect). */
  private started = false

  /** The display mode. */
  private readonly display = createMemo(() => this.attrs.display ?? DISPLAY.skeleton)

  /** The `loading` message shows. */
  private readonly showLoading = createMemo(
    () => !this.isReady.get() && this.display() !== DISPLAY.immediately && this.attrs.loading !== undefined
  )

  /** The skeletons show. */
  private readonly showSkeleton = createMemo(
    () => !this.isReady.get() && this.display() === DISPLAY.skeleton && this.skeletons.get().length > 0
  )

  protected hostStates() {
    // a static server render waits for nothing:  ready at once
    const ready = isServer || this.isReady.get()
    return {
      loading: !ready,
      ready,
      light: this.attrs.theme === "light",
      dark: this.attrs.theme === "dark",
      box: RootBox.isBox(this.attrs),
      fixed: !!this.attrs.fixed
    }
  }

  render(): JSX.Element {
    if (isServer) return this.serverWrapper()
    this.effects()
    return (
      <>
        <Show when={this.showLoading()}>{this.Loading.render(this.part("loading"), () => this.message())}</Show>
        <Show when={this.showSkeleton()}>{this.Skeleton.render(this.part("skeleton"), this.skeletons.get)}</Show>
        <Show when={this.scrolls()} fallback={<slot class={this.classes()} style={this.slotStyle()} />}>
          {this.scroller(<slot class={this.classes()} style={this.slotStyle()} />)}
        </Show>
      </>
    )
  }

  /**
   * The root in a static server render:  a `<div>` around the content, carrying its classes and theme / box states
   * (the flattener's `data-state`), never hidden -- a static page has nothing to wait for.
   * - Its inline style is what the browser puts on the host:  `RootBox`'s width, height, `--ui-scale` and
   *   `--ui-stack-with`, and `display: contents` unless it's a box (the host's own `display`, which a static
   *   stylesheet drops).
   * - A box scrolls its content in the same named region as in the browser.
   */
  private serverWrapper(): JSX.Element {
    return (
      <div class={this.classes()} style={this.serverStyle()}>
        <Show when={this.scrolls()} fallback={<slot />}>
          {this.scroller(<slot />)}
        </Show>
      </div>
    )
  }

  /** The scrolling region of a box around `slot`:  a tab stop named by the host's `aria-label`, else "Content". */
  private scroller(slot: JSX.Element): JSX.Element {
    return (
      <div
        part={this.part("scroller")}
        tabindex="0"
        role={UIT.REGION}
        aria-label={this.ariaLabel.get() ?? this.runtimeText("label")}
      >
        {slot}
      </div>
    )
  }

  /** The server wrapper's inline style:  `RootBox`'s declarations, or `display: contents` when not a box. */
  private serverStyle(): string | undefined {
    const declarations = [this.scrolls() ? "" : SERVER_CONTENTS, this.boxCSS()].filter(Boolean)
    return declarations.join("; ") || undefined
  }

  /**
   * A box (`width` / `height` / `fixed`):  its content scrolls in an inner region, a tab stop with a name (as a
   * scrolling `<ui-table>`'s), so people on a keyboard can scroll it -- Firefox doesn't make a scroller focusable by itself.
   */
  private scrolls(): boolean {
    return RootBox.isBox(this.attrs) || !!this.attrs.fixed
  }

  /** The loader's message:  `loading`'s value, or the default text for a bare `loading`. */
  private message(): string {
    return this.attrs.loading || (this.runtimeText("loading") ?? "")
  }

  /**
   * Text `key` once the runtime is loaded (tracked), else `undefined`:  the root renders at once (`canRenderUnstyled`), before `UI.i18n`
   * exists, and `text()` throws until then.
   */
  private runtimeText(key: Parameters<UIRoot["text"]>[0]): string | undefined {
    return this.isLoaded() ? this.text(key) : undefined
  }

  /** Inline style of the slot:  hidden while loading (unless `immediately`);  not drawn while the message or skeletons show. */
  private slotStyle(): string | undefined {
    if (this.isReady.get() || this.display() === DISPLAY.immediately) return undefined
    return this.showLoading() || this.showSkeleton() ? "display: none" : "visibility: hidden"
  }

  /** Watch the content while connected;  keep the root's own sheet current. */
  private effects() {
    if (isServer) return
    createEffect(
      () => this.isConnected.get(),
      (connected) => (connected ? this.watch() : undefined)
    )
    createEffect(
      () => ({
        connected: this.isConnected.get(),
        icons: this.attrs.icons,
        emoji: this.attrs.emoji,
        assets: this.attrs.assets
      }),
      ({ connected, icons, emoji, assets }) => {
        if (connected) this.applySettings({ packs: UIRoot.packs(icons), emoji, assets })
        else E.RootSettings.delete(this.host)
      }
    )
    const box = new RootBox({ root: this.host.renderRoot })
    createEffect(
      () => this.boxCSS(),
      (css) => box.set(css)
    )
  }

  /** The root's own declarations (`RootBox`):  width, height, `--ui-scale`, `--ui-stack-with`.  Tracked. */
  private boxCSS(): string {
    const { width, height, size, stackWith } = this.attrs
    return RootBox.css({ width, height, size, stackWith })
  }

  /** Load what's inside now (first connect:  and wait for it), and whatever is added later;  returns the undo. */
  private watch(): E.Disposer {
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
  // ## Settings
  ////////////////

  /**
   * Give everything inside `emoji` at once, and an icon-pack set of `packs` (built-ins from `assets`) over the outer
   * root's (or the page's) once the runtime is loaded.
   */
  private applySettings({ packs, emoji, assets }: { packs: string[]; emoji?: string; assets?: string }) {
    const request = ++this.settingsRequest
    E.RootSettings.set(this.host, { emoji })
    if (!packs.length) return
    void UI.load().then((ui) => {
      if (request !== this.settingsRequest || !this.host.isConnected) return
      const parent = () => this.outerPacks(ui.icons)
      E.RootSettings.set(this.host, { emoji, icons: ui.icons.scope(packs, { assets, parent }) })
    })
  }

  /**
   * The icon packs this root's set goes over:  never its own, but whatever is ABOVE it -- the outer root's, else
   * `page` (`UI.icons`).  Read when an icon is drawn, so a later outer root still counts.
   */
  private outerPacks(page: E.IconPacks): E.IconPacks {
    const above = E.flatParentFor(this.host)
    return above ? E.IconGlyph.packsFor(above, page) : page
  }

  /**
   * `icons="fa7-free, /packs/lucide/pack.js"` => its packs, spaces around commas ignored.
   * - Static:  pure.
   */
  private static packs(icons: string | undefined): string[] {
    return (icons ?? "")
      .split(PACK_SEPARATOR)
      .map((pack) => pack.trim())
      .filter(Boolean)
  }

  ////////////////
  // ## Loading
  ////////////////

  /** Load, wait (or time out), then show the content and say so. */
  private async start() {
    if (untrack(this.display) === DISPLAY.skeleton) this.skeletons.set(this.findSkeletons())
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

  /** Each element inside whose tag describes a skeleton, in page order, skipping those inside another one. */
  private findSkeletons(): RootSkeleton[] {
    const skeletons: RootSkeleton[] = []
    for (const element of this.host.querySelectorAll("*")) {
      const spec = RootLoader.skeletonFor(element.localName)
      if (!spec || skeletons.some((outer) => outer.element.contains(element))) continue
      skeletons.push({ element, spec })
    }
    return skeletons
  }

  /**
   * Import what defines every undefined tag inside (`RootLoader.undefinedTags()`);  resolves once each import settled.
   * - A pack on its way (`RootLoader.whenAdded()`) may name a tag nobody knows yet, or one not named `ui-*`:  look
   *   again once it's in, before calling any tag `unknown`.
   */
  private loadUndefined(): Promise<void> {
    const loads: Promise<void>[] = []
    const unknown: string[] = []
    for (const tag of RootLoader.undefinedTags(this.host)) {
      const load = RootLoader.loadTag(tag)
      if (load) loads.push(load.catch((error: unknown) => this.fail(tag, "failed", error)))
      else unknown.push(tag)
    }
    const added = RootLoader.whenAdded()
    if (added) loads.push(added.then(() => this.packsAdded()))
    else for (const tag of unknown) this.fail(tag, "unknown")
    return Promise.all(loads).then(() => undefined)
  }

  /** The packs on their way are in:  find the skeletons again (their tags may have some), then load again. */
  private packsAdded(): Promise<void> {
    if (!untrack(this.isReady.get) && untrack(this.display) === DISPLAY.skeleton) {
      this.skeletons.set(this.findSkeletons())
    }
    return this.loadUndefined()
  }

  /** Defined `ui-*` elements inside, not awaited yet. */
  private pendingElements(): E.UIHost[] {
    return [...this.host.querySelectorAll("*")].filter(
      (element): element is E.UIHost => element instanceof E.UIHost && !this.awaited.has(element)
    )
  }

  /** Resolves once `element` is ready:  a nested root once IT is settled. */
  private async whenReady(element: E.UIHost): Promise<void> {
    this.awaited.add(element)
    this.waiting.add(element)
    await element.ready
    if (element.controller instanceof UIRoot) await element.controller.settled
    this.waiting.delete(element)
  }

  /** The timeout passed:  report what's still undefined or not ready. */
  private timedOut() {
    for (const tag of RootLoader.undefinedTags(this.host)) {
      if (RootLoader.knows(tag)) this.fail(tag, "timeout")
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
    if (this.emit("ui-error", failure)) E.Warnings.warn("<ui-root>", `<${tag}> didn't load (${reason}):`, error ?? "")
  }
}

/** `display` values. */
const DISPLAY = { skeleton: "skeleton", whenReady: "when-ready", immediately: "immediately" } as const

/** Separates the packs in `icons="fa7-free, /packs/lucide/pack.js"`. */
const PACK_SEPARATOR = ","

/** The static server render's wrapper when it isn't a box:  no box of its own, as the browser's host. */
const SERVER_CONTENTS = "display: contents"

/** Rounds of "load what's undefined, wait for what's defined":  content that keeps adding new tags stops here. */
const MAX_ROUNDS = 10
