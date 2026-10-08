import { Show, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI } from "$/ui/core"
import { ComponentPacks } from "$/ui/components/ui-components/ComponentPacks"
import { componentsVocabulary } from "$/ui/components/ui-components/UIComponents.en"
import { SOURCE } from "$/ui/components/ui-components/UIComponents.types"
import { LoaderMessage, type RootLoading } from "./LoaderMessage"
import { PlaceholderSkeleton, type RootSkeletonRenderer } from "./PlaceholderSkeleton"
import { RootBox } from "./RootBox"
import { RootLoader } from "./RootLoader"
import { RootTimeout, type RootFailure, type RootSkeleton, type RootVocabulary } from "./UIRoot.types"
import { rootVocabulary } from "./UIRoot.en"

import rootCSS from "./UIRoot.css?inline"

/****************
 * ### `UIRoot`
 * The component behind `<ui-root>`:  the top of a page or app,
 * a `<slot>` for the page, plus what shows while it loads.
 *
 * - Loads on demand:  every undefined `ui-*` tag inside (now, and as content is added) imports its family once
 *   (`RootLoader`);  nothing is imported up front.
 * - Component packs:  each `<ui-components source>` inside loads its pack's script once per page
 *   (`ComponentPacks`), which defines the pack's tags (`epic-*` ...);  then the root treats them as its own:
 *   ready waits for them, skeletons come from the pack's catalog, unknown ones are reported.  A pack that fails to
 *   load doesn't stop the root getting ready:  a console error names its `source`.
 * - Ready:  every family settled, then every `ui-*` element inside `ready` (a nested root:  its own `settled`),
 *   or the `timeout`.  Then `:state(ready)`, `ui-ready { failed }`, and the content shows.  Each tag that didn't load
 *   fires a cancelable `ui-error` first.  Content added later loads too, but is never hidden again.
 * - While loading (`display`, not `immediately`):  the slot is hidden by an INLINE style (`canRenderUnstyled`,
 *   before any sheet), with its space kept (`when-ready`),
 *   or not drawn at all when the `loading` message or the skeletons show instead.
 * - `skeleton`:  every element inside whose tag describes a skeleton (`E.ComponentVocabulary.skeleton`,
 *   in the generated catalog, or a registered pack's catalog) gets a `<ui-placeholder>` in the root's shadow, in
 *   page order;  one inside another is covered by it.  Found again when a pack registers (its catalog comes with it).
 *   Nothing described:  as `when-ready`.
 * - What shows while loading is swappable:
 *   `UIRoot.Loading` (`LoaderMessage`, a `<ui-loader>`) and `UIRoot.Skeleton` (`PlaceholderSkeleton`).
 * - Settings for everything inside (`E.RootSettings`):  `icons` (a child icon-pack set over the outer root's,
 *   or the page's), `emoji` (a name set);  nested roots inherit what they don't set.
 *   A change redraws the icons / emoji inside (`E.RootSettings.generation`).
 * - Theme, size, box:  `:state(light | dark)`, `:state(box)`, `:state(fixed)` in `UIRoot.css`;  width,
 *   height and the subtree's `--ui-scale` in the root's own sheet (`RootBox`).
 * - `stack-with`:  the subtree's `--ui-stack-with` token (also in `RootBox`), which every stacking element without a
 *   `stack-with` of its own follows (`UIT.STACK_WITH_TOKEN`).
 * - Static server render (`$/ui/static`):  nothing loads and nothing is hidden;  the root is a plain wrapper
 *   (`serverWrapper()`).  None of its `@E.onChange` effects runs there (none writes the DOM element).
 ****************/
export class UIRoot extends E.UIComponent<RootVocabulary> {
  @E.proto static vocabulary = rootVocabulary
  @E.proto static styleSheets = { root: rootCSS }
  @E.proto static elementSetup = { delegatesFocus: false, canRenderUnstyled: true } satisfies Partial<E.ElementSetup>

  /** What shows with `loading`:  swap it for another look (`UIRoot.Loading = MyLoading`). */
  @E.proto static Loading: RootLoading = LoaderMessage

  /** What shows with `display="skeleton"`:  swap it for another look (`UIRoot.Skeleton = MySkeleton`). */
  @E.proto static Skeleton: RootSkeletonRenderer = PlaceholderSkeleton

  declare Loading: RootLoading
  declare Skeleton: RootSkeletonRenderer

  ////////////////
  // ## Ready
  ////////////////

  /** Everything inside is ready (or the timeout passed). */
  @E.state accessor contentIsReady = false

  /** Shown as ready?  `:state(ready)`.  A static server render waits for nothing:  ready at once. */
  @E.cssState("ready")
  get looksReady(): boolean {
    return isServer || this.contentIsReady
  }

  /** Still loading?  `:state(loading)`. */
  @E.cssState("loading")
  get isLoading(): boolean {
    return !this.looksReady
  }

  /** Resolves `settled`. */
  private resolveSettled!: (failures: readonly RootFailure[]) => void

  /** Resolves with what didn't load, once ready;  an outer root waits for it. */
  readonly settled = new Promise<readonly RootFailure[]>((resolve) => (this.resolveSettled = resolve))

  ////////////////
  // ## While loading
  ////////////////

  /** The display mode. */
  private get displayMode(): NonNullable<UIRoot["display"]> {
    return this.display ?? DISPLAY.skeleton
  }

  /** The skeletons to draw while loading (`display="skeleton"`), found when loading starts. */
  @E.state accessor skeletons: readonly RootSkeleton[] = []

  /** The `loading` message shows. */
  private get showsLoadingMessage(): boolean {
    return !this.contentIsReady && this.displayMode !== DISPLAY.immediately && this.loading !== undefined
  }

  /** The skeletons show. */
  private get showsSkeletons(): boolean {
    return !this.contentIsReady && this.displayMode === DISPLAY.skeleton && this.skeletons.length > 0
  }

  /** The loader's message:  `loading`'s value, or the default text for a bare `loading`. */
  private get loadingMessage(): string {
    return this.loading || (this.runtimeText("loading") ?? "")
  }

  /**
   * Inline style of the slot:  hidden while loading (unless `immediately`);
   * not drawn while the message or skeletons show.
   */
  private get slotStyle(): string | undefined {
    if (this.contentIsReady || this.displayMode === DISPLAY.immediately) return undefined
    return this.showsLoadingMessage || this.showsSkeletons ? "display: none" : "visibility: hidden"
  }

  /**
   * Text `key` once the runtime is loaded (tracked), else `undefined`:  the root renders at once
   * (`canRenderUnstyled`), before `UI.i18n` exists, and `translationForKey()` throws until then.
   */
  private runtimeText(key: Parameters<UIRoot["translationForKey"]>[0]): string | undefined {
    return this.isReady ? this.translationForKey(key) : undefined
  }

  ////////////////
  // ## Theme and box
  ////////////////

  /** `theme="light"`?  `:state(light)`. */
  @E.cssState("light")
  get isLight(): boolean {
    return this.theme === "light"
  }

  /** `theme="dark"`?  `:state(dark)`. */
  @E.cssState("dark")
  get isDark(): boolean {
    return this.theme === "dark"
  }

  /** A box (a valid `width` / `height`)?  `:state(box)`. */
  @E.cssState("box")
  get isBox(): boolean {
    return RootBox.isBox({ width: this.width, height: this.height })
  }

  /** `fixed`?  `:state(fixed)`. */
  @E.cssState("fixed")
  get isFixed(): boolean {
    return !!this.fixed
  }

  /**
   * A box (`width` / `height` / `fixed`):  its content scrolls in an inner region, a tab stop with a name (as a
   * scrolling `<ui-table>`'s), so people on a keyboard can scroll it --
   * Firefox doesn't make a scroller focusable by itself.
   */
  private get scrolls(): boolean {
    return this.isBox || this.isFixed
  }

  /** The root's own sheet. */
  private readonly rootBox = new RootBox({ root: this.domElement.renderRoot })

  /** The root's own declarations (`RootBox`):  width, height, `--ui-scale`, `--ui-stack-with`. */
  @E.derived
  get boxCSS(): string {
    return RootBox.css({ width: this.width, height: this.height, size: this.size, stackWith: this.stackWith })
  }

  /** Keep the root's own sheet current. */
  @E.onChange("boxCSS")
  protected onBoxCSSChanged(css: string) {
    this.rootBox.set(css)
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    if (isServer) return this.serverWrapper()
    return (
      <>
        <Show when={this.showsLoadingMessage}>
          {this.Loading.render(this.partForName("loading"), () => this.loadingMessage)}
        </Show>
        <Show when={this.showsSkeletons}>{this.Skeleton.render(this.partForName("skeleton"), this.$.skeletons)}</Show>
        <Show when={this.scrolls} fallback={<slot class={this.rootClasses} style={this.slotStyle} />}>
          {this.scroller(<slot class={this.rootClasses} style={this.slotStyle} />)}
        </Show>
      </>
    )
  }

  /**
   * The root in a static server render:  a `<div>` around the content, carrying its classes and theme / box states
   * (the flattener's `data-state`), never hidden -- a static page has nothing to wait for.
   * - Its inline style is what the browser puts on the DOM element:
   *   `RootBox`'s width, height, `--ui-scale` and `--ui-stack-with`, and `display: contents` unless it's a box
   *   (the DOM element's own `display`, which a static stylesheet drops).
   * - A box scrolls its content in the same named region as in the browser.
   */
  private serverWrapper(): JSX.Element {
    return (
      <div class={this.rootClasses} style={this.serverStyle}>
        <Show when={this.scrolls} fallback={<slot />}>
          {this.scroller(<slot />)}
        </Show>
      </div>
    )
  }

  /**
   * The scrolling region of a box around `slot`:  a tab stop named by the DOM element's `aria-label`, else "Content".
   */
  private scroller(slot: JSX.Element): JSX.Element {
    return (
      <div
        part={this.partForName("scroller")}
        tabindex="0"
        role="region"
        aria-label={this.attributes["aria-label"] ?? this.runtimeText("label")}
      >
        {slot}
      </div>
    )
  }

  /** The server wrapper's inline style:  `RootBox`'s declarations, or `display: contents` when not a box. */
  private get serverStyle(): string | undefined {
    const declarations = [this.scrolls ? "" : SERVER_CONTENTS, this.boxCSS].filter(Boolean)
    return declarations.join("; ") || undefined
  }

  ////////////////
  // ## Loading
  ////////////////

  /** What didn't load, in order. */
  private readonly failures: RootFailure[] = []

  /** `tag reason` pairs already reported, so each is reported once. */
  private readonly reportedFailures = new Set<string>()

  /** Elements inside not ready yet (for the timeout's report). */
  private readonly elementsNotReady = new Set<Element>()

  /** Elements already awaited. */
  private readonly awaitedElements = new WeakSet<Element>()

  /** `<ui-components>` whose pack load has started. */
  private readonly packElements = new WeakSet<Element>()

  /** `source`s of the packs still loading (for the timeout's report). */
  private readonly packsLoading = new Set<string>()

  /** Started loading (on first connect). */
  private hasStarted = false

  /**
   * Watch the content while connected;  returns `watch()`'s undo.
   * - Declared before `onSettingsChanged()`:  loading starts before the settings are handed out, as it always has.
   */
  @E.onChange("isConnected")
  protected onConnectedChanged(isConnected: boolean) {
    return isConnected ? this.watch() : undefined
  }

  /** Load what's inside now (first connect:  and wait for it), and whatever is added later;  returns the undo. */
  private watch(): E.Disposer {
    const observer = new MutationObserver(() => void this.loadUndefined())
    observer.observe(this.domElement, { childList: true, subtree: true })
    if (this.hasStarted) void this.loadUndefined()
    else {
      this.hasStarted = true
      void this.start()
    }
    return () => observer.disconnect()
  }

  /** Load, wait (or time out), then show the content and say so. */
  private async start() {
    if (untrack(() => this.displayMode) === DISPLAY.skeleton) this.skeletons = this.findSkeletons()
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<"timeout">((resolve) => {
      timer = setTimeout(() => resolve("timeout"), RootTimeout.parse(untrack(() => this.timeout)))
    })
    const outcome = await Promise.race([this.settle(), timeout])
    clearTimeout(timer)
    if (outcome === "timeout") this.timedOut()
    this.contentIsReady = true
    this.send("ui-ready", { failed: [...this.failures] })
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
    for (const element of this.domElement.querySelectorAll("*")) {
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
    for (const tag of RootLoader.undefinedTags(this.domElement)) {
      const load = RootLoader.loadTag(tag)
      if (load) loads.push(load.catch((error: unknown) => this.fail({ tag, reason: "failed", error })))
      else if (RootLoader.entryOf(tag))
        this.fail({ tag, reason: "failed", error: new Error("its pack didn't define it") })
      else this.fail({ tag, reason: "unknown" })
    }
    return Promise.all(loads).then(() => undefined)
  }

  /**
   * Start loading the pack of each `<ui-components source>` inside not seen yet (`ComponentPacks.load()`:  once per
   * page);  each promise settles once its pack registered, or failed (reported).
   */
  private loadPacks(): Promise<void>[] {
    const loads: Promise<void>[] = []
    for (const element of this.domElement.querySelectorAll(`${componentsVocabulary.tag}[${SOURCE}]`)) {
      const source = element.getAttribute(SOURCE)
      if (!source || this.packElements.has(element)) continue
      this.packElements.add(element)
      this.packsLoading.add(source)
      const load = ComponentPacks.load(source).then(
        () => this.onPackLoaded(),
        (error: unknown) => this.fail({ tag: componentsVocabulary.tag, reason: "failed", error, source })
      )
      loads.push(load.finally(() => this.packsLoading.delete(source)))
    }
    return loads
  }

  /** A pack registered:  while the skeletons still show, draw its tags' too (its catalog is known now). */
  private onPackLoaded() {
    if (untrack(() => this.contentIsReady) || untrack(() => this.displayMode) !== DISPLAY.skeleton) return
    this.skeletons = this.findSkeletons()
  }

  /** Defined `ui-*` elements inside, not awaited yet. */
  private pendingElements(): E.DOMElement[] {
    return [...this.domElement.querySelectorAll("*")].filter(
      (element): element is E.DOMElement => element instanceof E.DOMElement && !this.awaitedElements.has(element)
    )
  }

  /** Resolves once `element` is ready:  a nested root once IT is settled. */
  private async whenReady(element: E.DOMElement): Promise<void> {
    this.awaitedElements.add(element)
    this.elementsNotReady.add(element)
    await element.ready
    if (element.component instanceof UIRoot) await element.component.settled
    this.elementsNotReady.delete(element)
  }

  /** The timeout passed:  report what's still undefined or not ready, and the packs still loading. */
  private timedOut() {
    for (const tag of RootLoader.undefinedTags(this.domElement)) {
      if (RootLoader.entryOf(tag)) this.fail({ tag, reason: "timeout" })
    }
    for (const element of this.elementsNotReady) this.fail({ tag: element.localName, reason: "timeout" })
    for (const source of this.packsLoading) this.fail({ tag: componentsVocabulary.tag, reason: "timeout", source })
  }

  /**
   * Record what didn't load (once per tag, reason and pack):  `ui-error`, then, unless cancelled, a console warning
   * -- an ERROR naming the `source` for a pack, whose whole set of tags is missing.
   */
  private fail(failure: RootFailure) {
    const { tag, reason, error, source } = failure
    const key = `${tag} ${reason} ${source ?? ""}`
    if (this.reportedFailures.has(key)) return
    this.reportedFailures.add(key)
    this.failures.push(failure)
    if (!this.send("ui-error", failure)) return
    if (source) E.Warnings.error("<ui-root>", `component pack ${source} didn't load (${reason}):`, error ?? "")
    else E.Warnings.warn("<ui-root>", `<${tag}> didn't load (${reason}):`, error ?? "")
  }

  ////////////////
  // ## Settings
  ////////////////

  /** Settings requests, so a slower earlier one can't win. */
  private latestSettingsRequest = 0

  /** The settings (or the connection) changed:  hand them to everything inside;  disconnected, forget them. */
  @E.onChange("isConnected", "icons", "emoji", "assets")
  protected onSettingsChanged(
    isConnected: boolean,
    icons: string | undefined,
    emoji: string | undefined,
    assets: string | undefined
  ) {
    if (isConnected) this.applySettings({ packs: UIRoot.packs(icons), emoji, assets })
    else E.RootSettings.delete(this.domElement)
  }

  /**
   * Give everything inside `emoji` at once, and an icon-pack set of `packs` (built-ins from `assets`) over the outer
   * root's (or the page's) once the runtime is loaded.
   */
  private applySettings({ packs, emoji, assets }: { packs: string[]; emoji?: string; assets?: string }) {
    const request = ++this.latestSettingsRequest
    E.RootSettings.set(this.domElement, { emoji })
    if (!packs.length) return
    void UI.load().then((ui) => {
      if (request !== this.latestSettingsRequest || !this.domElement.isConnected) return
      const parent = () => this.outerPacks(ui.icons)
      E.RootSettings.set(this.domElement, { emoji, icons: ui.icons.scope(packs, { assets, parent }) })
    })
  }

  /**
   * The icon packs this root's set goes over:  never its own, but whatever is ABOVE it -- the outer root's,
   * else `page` (`UI.icons`).  Read when an icon is drawn, so a later outer root still counts.
   */
  private outerPacks(page: E.IconPacks): E.IconPacks {
    const above = E.flatParentFor(this.domElement)
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
}
/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIRoot extends E.AttributeValues<RootVocabulary> {}

/** `display` values. */
const DISPLAY = { skeleton: "skeleton", whenReady: "when-ready", immediately: "immediately" } as const

/** Separates the packs in `icons="fa7-free, /packs/lucide/pack.js"`. */
const PACK_SEPARATOR = ","

/**
 * The static server render's wrapper when it isn't a box:  no box of its own,
 * as the DOM element has none in the browser.
 */
const SERVER_CONTENTS = "display: contents"

/** Rounds of "load what's undefined, wait for what's defined":  content that keeps adding new tags stops here. */
const MAX_ROUNDS = 10
