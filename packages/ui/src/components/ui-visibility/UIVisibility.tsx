import { createEffect } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import {
  ANIMATION_NAMES,
  Cell,
  proto,
  UI,
  UIElement,
  type AnimationName,
  type Disposer,
  type VisibilityCalculations,
  type VisibilityOptions
} from "$/ui/core"

import { visibilityVocabulary } from "./ui-visibility.vocabulary.en"
import { VisibilityFallback } from "./ui-visibility.fallback"

import visibilityCSS from "./ui-visibility.css?inline"
import {
  DEFAULT_DURATION,
  LAZY_IMAGES,
  DATA_SRC,
  DATA_SRCSET,
  FADE,
  LAZY,
  LOADING,
  SRC,
  SRCSET
} from "./ui-visibility.types"
import type { VisibilityVocabulary, VisibilityConfig } from "./ui-visibility.types"
import { IMAGE } from "$/ui/components/components.types"

/****************
 * ### `<ui-visibility>`
 * A block (`<div class="ui visibility" part="visibility">` around the slot) around content that reports where it is against the screen:  Fomantic's visibility callbacks as `ui-*`
 * events (`ui-visible`, `ui-hidden`, `ui-top-passed` ...), through `UI.observeVisibility()` -- `IntersectionObserver`,
 * no scroll listener.
 * - Watches while connected, again whenever `once`, `continuous`, `offset` or the image settings change (which
 *   re-arms `once`).
 * - `:state(visible)`:  on screen as of the last check.
 * - `type="image"`:  each `<img data-src>` inside (found now and as content changes) goes through
 *   `UI.visibility.lazyImage()`:  its source is set once it's on screen, then it fades in and `ui-load` fires.
 * - Measured against the viewport (Fomantic's default `context`).
 ****************/
export class UIVisibility extends UIElement<VisibilityVocabulary> {
  @proto static vocabulary = visibilityVocabulary
  @proto static styles = { visibility: visibilityCSS }
  @proto static Fallback = VisibilityFallback
  // a wrapper:  a click on its text must not jump to a link inside
  @proto static delegatesFocus = false

  /** On screen as of the last check. */
  readonly visible = new Cell(false)

  protected hostStates() {
    return { visible: this.visible.get() }
  }

  /** `image` after the noun for a lazy-image wrapper (`ui visibility image`), a hook for page CSS. */
  protected extraClasses(): string | undefined {
    return this.attrs.type === IMAGE ? IMAGE : undefined
  }

  render(): JSX.Element {
    this.effects()
    if (isServer && this.attrs.type === IMAGE) this.serverImages()
    return (
      <div class={this.classes()} part={this.part("visibility")}>
        <slot />
      </div>
    )
  }

  /** Watch while connected;  anew when the settings change. */
  private effects() {
    createEffect(
      () => ({
        connected: this.connected.get(),
        once: this.attrs.once !== false,
        continuous: !!this.attrs.continuous,
        offset: this.attrs.offset ?? 0,
        images: this.attrs.type === IMAGE,
        transition: this.attrs.transition,
        duration: this.attrs.duration ?? DEFAULT_DURATION
      }),
      (config) => (config.connected ? this.watch(config) : undefined)
    )
  }

  /** Observe the host (and lazy images);  returns the undo. */
  private watch(config: VisibilityConfig): Disposer {
    const emit = (name: Parameters<UIVisibility["emit"]>[0]) => (calculations: VisibilityCalculations) =>
      void this.emit(name, calculations)
    const options: VisibilityOptions = {
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
      onUpdate: (calculations) => this.visible.set(calculations.onScreen)
    }
    const stop = UI.observeVisibility(this.host, options)
    const stopImages = config.images ? this.watchImages(config) : undefined
    return () => {
      stop()
      stopImages?.()
    }
  }

  /** Lazy-load every `<img data-src>` inside, now and as content changes;  returns the undo. */
  private watchImages({ transition, duration, offset }: VisibilityConfig): Disposer {
    const stops = new Map<HTMLImageElement, Disposer>()
    const animation = UIVisibility.animation(transition)
    const scan = () => {
      for (const image of this.host.querySelectorAll<HTMLImageElement>(LAZY_IMAGES)) {
        if (stops.has(image)) continue
        const onLoad = (loaded: HTMLImageElement) => void this.emit("ui-load", { image: loaded })
        stops.set(image, UI.visibility.lazyImage(image, { transition: animation, duration, offset, onLoad }))
      }
    }
    scan()
    const observer = new MutationObserver(scan)
    observer.observe(this.host, { childList: true, subtree: true, attributeFilter: [DATA_SRC] })
    return () => {
      observer.disconnect()
      for (const stop of stops.values()) stop()
    }
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

  /** `transition` as a `UI.transitions` name, `false` for `none` or an unknown name. */
  private static animation(transition: string | null | undefined): AnimationName | false {
    const name = transition ?? FADE
    return (ANIMATION_NAMES as readonly string[]).includes(name) ? (name as AnimationName) : false
  }
}
