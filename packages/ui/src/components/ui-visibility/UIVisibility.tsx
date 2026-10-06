import { createEffect } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { visibilityVocabulary } from "./ui-visibility.vocabulary.en"
import { VisibilityFallback } from "./ui-visibility.fallback"
import {
  DATA_SRC,
  DATA_SRCSET,
  LAZY,
  LAZY_IMAGES,
  LOADING,
  SRC,
  type VisibilityVocabulary
} from "./ui-visibility.types"

import visibilityCSS from "./ui-visibility.css?inline"

/****************
 * ### `<ui-visibility>`
 * A block (`<div class="ui visibility" part="visibility">` around the slot) around content that reports where it is
 * against the screen:  Fomantic's visibility callbacks as `ui-*` events (`ui-visible`, `ui-hidden`, `ui-top-passed`
 * ...), through `UI.observeVisibility()` -- `IntersectionObserver`, no scroll listener.
 * - Watches while connected, again whenever `once`, `continuous`, `offset` or the image settings change (which
 *   re-arms `once`).
 * - `:state(visible)`:  on screen as of the last check.
 * - `type="image"`:  each `<img data-src>` inside (found now and as content changes) goes through
 *   `UI.visibility.lazyImage()`:  its source is set once it's on screen, then it fades in and `ui-load` fires.
 * - Measured against the viewport (Fomantic's default `context`).
 ****************/
export class UIVisibility extends E.UIElement<VisibilityVocabulary> {
  @E.proto static vocabulary = visibilityVocabulary
  @E.proto static styles = { visibility: visibilityCSS }
  @E.proto static Fallback = VisibilityFallback
  // a wrapper:  a click on its text must not jump to a link inside
  @E.proto static delegatesFocus = false

  /** On screen as of the last check. */
  readonly isOnScreen = new E.Cell(false)

  protected hostStates() {
    return { visible: this.isOnScreen.get() }
  }

  /** `image` after the noun for a lazy-image wrapper (`ui visibility image`), a hook for page CSS. */
  protected extraClasses(): string | undefined {
    return this.attrs.type === UIT.IMAGE ? UIT.IMAGE : undefined
  }

  render(): JSX.Element {
    this.watchScreen()
    if (isServer && this.attrs.type === UIT.IMAGE) this.serverImages()
    return (
      <div class={this.classes()} part={this.part("visibility")}>
        <slot />
      </div>
    )
  }

  /** Watch while connected;  anew when the settings change. */
  private watchScreen() {
    createEffect(
      () => ({
        connected: this.connected.get(),
        once: this.attrs.once !== false,
        continuous: !!this.attrs.continuous,
        offset: this.attrs.offset ?? 0,
        images: this.attrs.type === UIT.IMAGE,
        transition: this.attrs.transition,
        duration: this.attrs.duration ?? DEFAULT_DURATION
      }),
      (config) => (config.connected ? this.watch(config) : undefined)
    )
  }

  /** Observe the host (and lazy images);  returns the undo. */
  private watch(config: VisibilityConfig): E.Disposer {
    const emit = (name: Parameters<UIVisibility["emit"]>[0]) => (calculations: E.VisibilityCalculations) =>
      void this.emit(name, calculations)
    const options: E.VisibilityOptions = {
      once: config.once,
      continuous: config.continuous,
      offset: config.offset,
      onOnScreen: emit("ui-visible"),
      onOffScreen: emit("ui-hidden"),
      onTopVisible: emit("ui-top-visible"),
      onBottomVisible: emit("ui-bottom-visible"),
      onTopPassed: emit("ui-top-passed"),
      onBottomPassed: emit("ui-bottom-passed"),
      onPassing: emit("ui-passing"),
      onUpdate: (calculations) => this.isOnScreen.set(calculations.onScreen)
    }
    const stop = UI.observeVisibility(this.host, options)
    const stopImages = config.images ? this.watchImages(config) : undefined
    return () => {
      stop()
      stopImages?.()
    }
  }

  /** Lazy-load every `<img data-src>` inside, now and as content changes;  returns the undo. */
  private watchImages({ transition, duration, offset }: VisibilityConfig): E.Disposer {
    const stops = new Map<HTMLImageElement, E.Disposer>()
    const options: E.LazyImageOptions = { transition: UIVisibility.animationFor(transition), duration, offset }
    this.lazyLoad(stops, options)
    const observer = new MutationObserver(() => this.lazyLoad(stops, options))
    observer.observe(this.host, { childList: true, subtree: true, attributeFilter: [DATA_SRC] })
    return () => {
      observer.disconnect()
      for (const stop of stops.values()) stop()
    }
  }

  /**
   * Hand every `<img data-src>` inside that isn't in `stops` yet to `UI.visibility.lazyImage()`.
   * - SIDE EFFECT:  records each one's undo in `stops`.
   */
  private lazyLoad(stops: Map<HTMLImageElement, E.Disposer>, options: E.LazyImageOptions) {
    for (const image of this.host.querySelectorAll<HTMLImageElement>(LAZY_IMAGES)) {
      if (stops.has(image)) continue
      stops.set(image, UI.visibility.lazyImage(image, { ...options, onLoad: this.onImageLoad }))
    }
  }

  /** A lazy image has its `src`. */
  private readonly onImageLoad = (image: HTMLImageElement) => {
    this.emit("ui-load", { image })
  }

  /**
   * Static server render (`$/ui/static`):  nothing will observe, so each `<img data-src>` gets its source now, with
   * `loading="lazy"` (unless it says otherwise):  crawlers and no-JS readers see the image, the browser defers it.
   * - SIDE EFFECT:  writes the host's light-DOM images, which the flattener then moves into the root.
   */
  private serverImages() {
    for (const image of this.host.querySelectorAll(LAZY_IMAGES)) {
      image.setAttribute(SRC, image.getAttribute(DATA_SRC)!)
      const srcset = image.getAttribute(DATA_SRCSET)
      if (srcset) image.setAttribute(SRCSET, srcset)
      if (!image.hasAttribute(LOADING)) image.setAttribute(LOADING, LAZY)
    }
  }

  /**
   * `transition` as a `UI.transitions` name, `false` for `none` or an unknown name.
   * - STATIC:  pure.
   */
  private static animationFor(transition: string | undefined): E.AnimationName | false {
    const name = transition ?? FADE
    return (E.AnimationNames as readonly string[]).includes(name) ? (name as E.AnimationName) : false
  }
}

/** What a watch depends on. */
type VisibilityConfig = {
  /** the host is in the document */
  connected: boolean
  /** each event fires at most once (re-armed by a change here) */
  once: boolean
  /** events fire at every check while their condition holds */
  continuous: boolean
  /** px below the viewport top that count as the screen top */
  offset: number
  /** `type="image"`:  lazy-load the images inside */
  images: boolean
  /** a lazy image's fade, a `UI.transitions` name;  default `fade` */
  transition: string | undefined
  /** its ms */
  duration: number
}

/** Default lazy-image transition (Fomantic's `fade in`). */
const FADE = "fade"

/** Its default ms (Fomantic's 1000). */
const DEFAULT_DURATION = 1000

/** A lazy image's `srcset`, set from `data-srcset` in a server render. */
const SRCSET = "srcset"
