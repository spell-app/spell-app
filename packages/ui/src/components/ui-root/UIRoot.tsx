import { Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import {
  Cell,
  HostAttribute,
  IconGlyph,
  RootSettings,
  UI,
  UIHost,
  UIT,
  proto,
  UIElement,
  type Disposer
} from "$/ui/core"
import { ComponentPacks } from "$/ui/components/ui-components/ComponentPacks"
import { SOURCE } from "$/ui/components/ui-components/ui-components.types"
import { componentsVocabulary } from "$/ui/components/ui-components/ui-components.vocabulary.en"

import { LoaderMessage, type RootLoading } from "./LoaderMessage"
import { PlaceholderSkeleton, type RootSkeletonRenderer } from "./PlaceholderSkeleton"
import { RootBox } from "./RootBox"
import { RootLoader } from "./RootLoader"
import { RootFallback } from "./ui-root.fallback"
import {
  DISPLAY,
  MAX_ROUNDS,
  PACK_SEPARATOR,
  SERVER_CONTENTS,
  RootTimeout,
  type RootFailure,
  type RootSkeleton,
  type RootVocabulary
} from "./ui-root.types"
import { rootVocabulary } from "./ui-root.vocabulary.en"

import rootCSS from "./ui-root.css?inline"

/****************
 * ### `<ui-root>`
 * The top of a page or app:  `<slot>` for the page, plus what shows while it loads.
 * - Loads on demand:  every undefined `ui-*` tag inside (now, and as content is added) imports its family once
 *   (`RootLoader`);  nothing is imported up front.
 * - Component packs:  each `<ui-components source>` inside loads its pack's script once per page
 *   (`ComponentPacks`), which defines the pack's tags (`epic-*` ...);  then the root treats them as its own:  ready
 *   waits for them, skeletons come from the pack's catalog, unknown ones are reported.  A pack that fails to load
 *   doesn't stop the root getting ready:  a console error names its `source`.
 * - Ready:  every family settled, then every `ui-*` element inside `ready` (a nested root:  its own `settled`), or the
 *   `timeout`.  Then `:state(ready)`, `ui-ready { failed }`, and the content shows.  Each tag that didn't load fires a
 *   cancelable `ui-error` first.  Content added later loads too, but is never hidden again.
 * - While loading (`display`, not `immediately`):  the slot is hidden by an INLINE style (the root renders `eager`ly,
 *   before any sheet), with its space kept (`when-ready`), or not drawn at all when the `loading` message or the
 *   skeletons show instead.
 * - `skeleton`:  every element inside whose tag describes a skeleton (`ComponentVocabulary.skeleton`, in the generated
 *   catalog) gets a `<ui-placeholder>` in the root's shadow, in page order;  one inside another is covered by it.
 *   Nothing described:  as `when-ready`.
 * - What shows while loading is swappable:  `UIRoot.Loading` (`LoaderMessage`, a `<ui-loader>`) and `UIRoot.Skeleton`
 *   (`PlaceholderSkeleton`).
 * - Settings for everything inside (`RootSettings`):  `icons` (a child icon-pack set over the outer root's, or the
 *   page's), `emoji` (a name set);  nested roots inherit what they don't set.  A change redraws the icons / emoji
 *   inside (`RootSettings.generation`).
 * - Theme, size, box:  `:state(light | dark)`, `:state(box)`, `:state(fixed)` in `ui-root.css`;  width, height and the
 *   subtree's `--ui-scale` in the root's own sheet (`RootBox`).
 * - `stack-with`:  the subtree's `--ui-stack-with` token (also in `RootBox`), which every stacking element without a
 *   `stack-with` of its own follows (`UIT.STACK_WITH_TOKEN`).
 * - Static server render (`$/ui/server`):  nothing loads and nothing is hidden;  the root is a plain wrapper
 *   (`serverRender()`).
 ****************/
export class UIRoot extends UIElement<RootVocabulary> {
  @proto static vocabulary = rootVocabulary
  @proto static styles = { root: rootCSS }
  @proto static Fallback = RootFallback
  @proto static delegatesFocus = false
  @proto static eager = true

  /** What shows with `loading`:  swap it for another look (`UIRoot.Loading = MyLoading`). */
  @proto static Loading: RootLoading = LoaderMessage

  /** What shows with `display="skeleton"`:  swap it for another look (`UIRoot.Skeleton = MySkeleton`). */
  @proto static Skeleton: RootSkeletonRenderer = PlaceholderSkeleton

  declare Loading: RootLoading
  declare Skeleton: RootSkeletonRenderer

  /** Host `aria-label`:  the scrolling region's name. */
  readonly ariaLabel = new HostAttribute(this.host, UIT.ARIA_LABEL)

  /** Everything inside is ready (or the timeout passed). */
  readonly isReady = new Cell(false)

  /** The skeletons to draw while loading (`display="skeleton"`), found when loading starts. */
  readonly skeletons = new Cell<readonly RootSkeleton[]>([])

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

  /** `<ui-components>` whose pack load has started. */
  private readonly packElements = new WeakSet<Element>()

  /** `source`s of the packs still loading (for the timeout's report). */
  private readonly waitingPacks = new Set<string>()

  /** Settings requests, so a slower earlier one can't win. */
  private settingsRequest = 0

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
      box: RootBox.isBox(this.attrs.width, this.attrs.height),
      fixed: !!this.attrs.fixed
    }
  }

  render(): JSX.Element {
    if (isServer) return this.serverRender()
    this.effects()
    return (
      <>
        <Show when={this.showLoading()}>{this.Loading.render(this.part("loading"), () => this.message())}</Show>
        <Show when={this.showSkeleton()}>{this.Skeleton.render(this.part("skeleton"), this.skeletons.get)}</Show>
        <Show when={this.scrolls()} fallback={<slot class={this.classes()} style={this.slotStyle()} />}>
          <div
            part={this.part("scroller")}
            tabindex="0"
            role="region"
            aria-label={this.ariaLabel.get() ?? this.runtimeText("label")}
          >
            <slot class={this.classes()} style={this.slotStyle()} />
          </div>
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
  private serverRender(): JSX.Element {
    return (
      <div class={this.classes()} style={this.serverStyle()}>
        <Show when={this.scrolls()} fallback={<slot />}>
          <div
            part={this.part("scroller")}
            tabindex="0"
            role="region"
            aria-label={this.ariaLabel.get() ?? this.runtimeText("label")}
          >
            <slot />
          </div>
        </Show>
      </div>
    )
  }

  /** The server wrapper's inline style:  `RootBox`'s declarations, or `display: contents` when not a box. */
  private serverStyle(): string | undefined {
    const box = RootBox.css({
      width: this.attrs.width,
      height: this.attrs.height,
      size: this.attrs.size,
      stackWith: this.attrs.stackWith
    })
    const declarations = [this.scrolls() ? "" : SERVER_CONTENTS, box].filter(Boolean)
    return declarations.join("; ") || undefined
  }

  /**
   * A box (`width` / `height` / `fixed`):  its content scrolls in an inner region, a tab stop with a name (as a
   * scrolling `<ui-table>`'s), so keyboard users can scroll it -- Firefox doesn't make a scroller focusable by itself.
   */
  private scrolls(): boolean {
    return RootBox.isBox(this.attrs.width, this.attrs.height) || !!this.attrs.fixed
  }

  /** The loader's message:  `loading`'s value, or the default text for a bare `loading`. */
  private message(): string {
    return this.attrs.loading || (this.runtimeText("loading") ?? "")
  }

  /**
   * Text `key` once the runtime is loaded (tracked), else `undefined`:  the root renders `eager`ly, before `UI.i18n`
   * exists, and `text()` throws until then.
   */
  private runtimeText(key: Parameters<UIRoot["text"]>[0]): string | undefined {
    return this.loaded() ? this.text(key) : undefined
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
      () => this.connected.get(),
      (connected) => (connected ? this.watch() : undefined)
    )
    createEffect(
      () => ({
        connected: this.connected.get(),
        icons: this.attrs.icons,
        emoji: this.attrs.emoji,
        assets: this.attrs.assets
      }),
      ({ connected, icons, emoji, assets }) => {
        if (connected) this.applySettings(UIRoot.packs(icons), emoji, assets)
        else RootSettings.delete(this.host)
      }
    )
    const box = new RootBox(this.host.renderRoot)
    createEffect(
      () =>
        RootBox.css({
          width: this.attrs.width,
          height: this.attrs.height,
          size: this.attrs.size,
          stackWith: this.attrs.stackWith
        }),
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
  // ## Settings
  ////////////////

  /**
   * Give everything inside `emoji` at once, and an icon-pack set of `packs` over the outer root's (or the page's)
   * once the runtime is loaded.
   */
  private applySettings(packs: string[], emoji: string | undefined, assets: string | undefined) {
    const request = ++this.settingsRequest
    RootSettings.set(this.host, { emoji })
    if (!packs.length) return
    void UI.load().then((ui) => {
      if (request !== this.settingsRequest || !this.host.isConnected) return
      // never this root's own set:  its parent is whatever is ABOVE it
      const outer = () => {
        const above = RootSettings.parentOf(this.host)
        return above ? IconGlyph.packsFor(above, ui.icons) : ui.icons
      }
      RootSettings.set(this.host, { emoji, icons: ui.icons.scope(packs, { assets, parent: outer }) })
    })
  }

  /** `icons="fa7-free, /packs/lucide/pack.js"` => its packs, spaces around commas ignored. */
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

  /**
   * Rounds of:  load every pack and import every undefined tag's family, then await every element inside, until
   * nothing new turns up.  A pack's tags are defined by the end of the first round, so the next one sees them.
   */
  private async settle(): Promise<void> {
    for (let round = 0; round < MAX_ROUNDS; round++) {
      await this.loadUndefined()
      const pending = this.pendingElements()
      if (!pending.length) return
      await Promise.all(pending.map((element) => this.whenReady(element)))
    }
  }

  /**
   * Each element inside whose tag describes a skeleton (Spell UI's catalog, or a registered pack's), in page order,
   * skipping those inside another one.
   */
  private findSkeletons(): RootSkeleton[] {
    const skeletons: RootSkeleton[] = []
    for (const element of this.host.querySelectorAll("*")) {
      const spec = RootLoader.entryOf(element.localName)?.skeleton
      if (!spec || skeletons.some((outer) => outer.element.contains(element))) continue
      skeletons.push({ element, spec })
    }
    return skeletons
  }

  /**
   * Load every new pack inside, and import the family of every undefined `ui-*` tag;  resolves once each settled.
   * - An undefined tag of a registered pack is `unknown` when its catalog doesn't list it, else `failed`:  the pack
   *   defines every tag it lists as it registers.
   */
  private loadUndefined(): Promise<void> {
    const loads = this.loadPacks()
    for (const tag of RootLoader.undefinedTags(this.host)) {
      const folder = RootLoader.folderOf(tag)
      if (folder) {
        loads.push(RootLoader.load(folder).catch((error: unknown) => this.fail({ tag, reason: "failed", error })))
      } else if (RootLoader.entryOf(tag)) {
        this.fail({ tag, reason: "failed", error: new Error("its pack didn't define it") })
      } else {
        this.fail({ tag, reason: "unknown" })
      }
    }
    return Promise.all(loads).then(() => undefined)
  }

  /**
   * Start loading the pack of each `<ui-components source>` inside not seen yet (`ComponentPacks.load()`:  once per
   * page);  each promise settles once its pack registered, or failed (reported).
   */
  private loadPacks(): Promise<void>[] {
    const loads: Promise<void>[] = []
    for (const element of this.host.querySelectorAll(`${componentsVocabulary.tag}[${SOURCE}]`)) {
      const source = element.getAttribute(SOURCE)
      if (!source || this.packElements.has(element)) continue
      this.packElements.add(element)
      this.waitingPacks.add(source)
      const load = ComponentPacks.load(source).then(
        () => this.packLoaded(),
        (error: unknown) => this.fail({ tag: componentsVocabulary.tag, reason: "failed", error, source })
      )
      loads.push(load.finally(() => this.waitingPacks.delete(source)))
    }
    return loads
  }

  /** A pack registered:  while the skeletons still show, draw its tags' too (its catalog is known now). */
  private packLoaded() {
    if (untrack(() => this.isReady.get()) || untrack(this.display) !== DISPLAY.skeleton) return
    this.skeletons.set(this.findSkeletons())
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

  /** The timeout passed:  report what's still undefined or not ready, and the packs still loading. */
  private timedOut() {
    for (const tag of RootLoader.undefinedTags(this.host)) {
      if (RootLoader.entryOf(tag)) this.fail({ tag, reason: "timeout" })
    }
    for (const element of this.waiting) this.fail({ tag: element.localName, reason: "timeout" })
    for (const source of this.waitingPacks) this.fail({ tag: componentsVocabulary.tag, reason: "timeout", source })
  }

  /**
   * Record what didn't load (once per tag, reason and pack):  `ui-error`, then, unless cancelled, a console warning
   * -- an ERROR naming the `source` for a pack, whose whole set of tags is missing.
   */
  private fail(failure: RootFailure) {
    const { tag, reason, error, source } = failure
    const key = `${tag} ${reason} ${source ?? ""}`
    if (this.reported.has(key)) return
    this.reported.add(key)
    this.failures.push(failure)
    if (!this.emit("ui-error", failure)) return
    if (source) console.error(`<ui-root>:  component pack ${source} didn't load (${reason})`, error ?? "")
    else console.warn(`<ui-root>:  <${tag}> didn't load (${reason})`, error ?? "")
  }
}
