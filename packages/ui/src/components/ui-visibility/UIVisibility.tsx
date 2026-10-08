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
  @E.proto static styleSheets = { visibility: visibilityCSS }
  @E.proto static elementSetup = {
    Fallback: VisibilityFallback,
    // a wrapper:  a click on its text must not jump to a link inside
    delegatesFocus: false
  }

  /** On screen as of the last check.  `:state(visible)`. */
  @E.cssState("visible")
  @E.state
  accessor isOnScreen = false

  /** `image` after the noun for a lazy-image wrapper (`ui visibility image`), a hook for page CSS. */
  protected get extraClasses(): string | undefined {
    return this.type === UIT.IMAGE ? UIT.IMAGE : undefined
  }

  render(): JSX.Element {
    if (isServer && this.type === UIT.IMAGE) this.serverImages()
    return (
      <div class={this.rootClasses} part={this.partForName("visibility")}>
        <slot />
      </div>
    )
  }

  /**
   * Watch while connected, once rendered (`isReady`, as when the render started it);  anew when the settings change.
   * - Returns the undo, run before the next watch.
   */
  @E.onChange("isReady", "isConnected", "once", "continuous", "offset", "type", "transition", "duration")
  protected onWatchSettingsChanged(
    isReady: boolean,
    isConnected: boolean,
    once: UIVisibility["once"],
    continuous: UIVisibility["continuous"],
    offset: UIVisibility["offset"],
    type: UIVisibility["type"],
    transition: UIVisibility["transition"],
    duration: UIVisibility["duration"]
  ): E.Disposer | undefined {
    if (!isReady || !isConnected) return undefined
    return this.watch({
      once: once !== false,
      continuous: !!continuous,
      offset: offset ?? 0,
      images: type === UIT.IMAGE,
      transition,
      duration: duration ?? DEFAULT_DURATION
    })
  }

  /** Observe the host (and lazy images);  returns the undo. */
  private watch(config: VisibilityConfig): E.Disposer {
    const emit = (name: Parameters<UIVisibility["send"]>[0]) => (calculations: E.VisibilityCalculations) =>
      void this.send(name, calculations)
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
      onUpdate: (calculations) => (this.isOnScreen = calculations.onScreen)
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
    this.send("ui-load", { image })
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

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIVisibility extends E.AttributeValues<VisibilityVocabulary> {}

/** What a watch depends on. */
type VisibilityConfig = {
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
