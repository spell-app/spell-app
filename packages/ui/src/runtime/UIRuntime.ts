import { proto } from "$/ui/util"
import { Vocabulary } from "$/ui/vocabulary"
import {
  animationsCSS,
  colorsCSS,
  layersCSS,
  nativeCSS,
  resetCSS,
  sizesCSS,
  tokensCSS,
  typographyCSS,
  utilitiesCSS
} from "$/ui/styles"

import {
  RUNTIME_KEY,
  RUNTIME_VERSION,
  type Disposer,
  type RuntimeGlobal,
  type ToastHandle,
  type ToastOptions,
  type VisibilityOptions
} from "./runtime.types"
import { Api } from "./Api"
import { Browser } from "./Browser"
import { Focus } from "./Focus"
import { I18n } from "./I18n"
import { IconPacks } from "./IconPacks"
import { Ids } from "./Ids"
import { Keyboard } from "./Keyboard"
import { Modals } from "./Modals"
import { Overlays } from "./Overlays"
import { Styles } from "./Styles"
import { Toasts } from "./Toasts"
import { Transitions } from "./Transitions"
import { Visibility } from "./Visibility"
import { load } from "./load"

/**
 * The shared `UI` runtime:  ONE instance per page, holding every service as a readonly field.
 * - Why one:  keyboard scopes, the overlay stack, scroll lock and the stylesheet registry only work if every
 *   component on the page talks to the SAME instance -- including components from a second copy of the
 *   package (duplicate bundles, micro-frontends).  So the instance lives on `globalThis[RUNTIME_KEY]`
 *   and `UIRuntime.instance` reuses whatever is there.
 * - Loaded lazily:  components call `UI.load()` (see `load.ts`) from `connectedCallback`, which
 *   dynamic-imports THIS module once, so the runtime is its own chunk and pages pay for it only when a
 *   component actually connects.
 * - Constructs outside a browser too (SSR):  services touch the DOM only when used.
 * - NOTE: `Vocabulary` and the foundation stylesheets are wired in by their own sub-systems
 *   (`$/ui/vocabulary`, `$/ui/styles`), which register into `UI.styles` / the runtime after load.
 */
export class UIRuntime {
  /** this build's version;  a runtime from another bundle may differ */
  declare readonly version: string
  @proto static version = RUNTIME_VERSION

  /** feature flags and sniffing */
  readonly browser = new Browser()
  /** unique ids for ARIA wiring */
  readonly ids = new Ids()
  /** shortcut registry with scopes */
  readonly keyboard = new Keyboard({ apple: this.browser.isApple })
  /** focus helpers that cross shadow roots */
  readonly focus = new Focus()
  /** constructable stylesheet registry + `#ui-app-stylesheet` */
  readonly styles = new Styles()
  /** top-layer stack:  Escape, outside clicks, scroll lock, focus restore */
  readonly overlays = new Overlays({
    keyboard: this.keyboard,
    focus: this.focus,
    browser: this.browser,
    styles: this.styles
  })
  /** keyframe catalogue runner */
  readonly transitions = new Transitions({ browser: this.browser })
  /** scroll position callbacks and lazy images, on `IntersectionObserver` */
  readonly visibility = new Visibility({ transitions: this.transitions })
  /** strings and `Intl` formatting */
  readonly i18n = new I18n({ browser: this.browser })
  /** programmatic toasts (provider registered by `ui-toast`) */
  readonly toasts = new Toasts()
  /** promise dialogs (provider registered by `ui-modal`) */
  readonly modals = new Modals()
  /** `fetch` with URL templates and throttling */
  readonly api = new Api()
  /** the page's icon packs (`<ui-root icons>` adds child sets) and the SVG cache */
  readonly icons = new IconPacks()
  /** canonical + localized component names (the translation hook) */
  readonly vocabulary = new Vocabulary()

  /** Resolves once every service is constructed and the runtime is published on `globalThis`. */
  readonly ready: Promise<void>

  constructor() {
    this.registerFoundation()
    this.ready = Promise.resolve()
  }

  /**
   * Register the CSS foundation with `styles`, so every shadow root adopts it and the page gets the light-side sheets.
   * - Foundation sheets (every tree scope, in cascade order):  layers, reset, tokens, colors, sizes, animations, utilities.
   * - Page-only sheets:  typography and native (they style light-DOM markup;  shadow roots don't need them).
   * - Here rather than in `$/ui/styles`:  the runtime chunk is loaded exactly once per page, which is also how often
   *   the foundation must be registered;  `$/ui/styles` stays plain data.
   */
  private registerFoundation() {
    const foundation: Array<[string, string]> = [
      ["layers", layersCSS],
      ["reset", resetCSS],
      ["tokens", tokensCSS],
      ["colors", colorsCSS],
      ["sizes", sizesCSS],
      ["animations", animationsCSS],
      ["utilities", utilitiesCSS]
    ]
    // `linked`:  `ui.css` carries these, so a page that links it doesn't get them twice
    for (const [name, css] of foundation) this.styles.register(name, css, { page: true, linked: true })
    this.styles.register("typography", typographyCSS, { page: true, linked: true })
    this.styles.register("native", nativeCSS, { page: true, linked: true })
    this.styles.setFoundation(foundation.map(([name]) => name).filter((name) => name !== "utilities"))
    this.styles.setUtilities(["utilities"])
  }

  /**
   * THE runtime for this page:  the one on `globalThis[RUNTIME_KEY]`, created on first access.
   * - A second bundle's `UIRuntime` class finds the first bundle's instance here;  a version mismatch warns in dev.
   */
  static get instance(): UIRuntime {
    const global = globalThis as RuntimeGlobal
    const existing = global[RUNTIME_KEY]
    if (existing) {
      if (import.meta.env.DEV && existing.version !== RUNTIME_VERSION) {
        console.warn(`@spell-app/ui: runtime ${existing.version} already loaded;  this bundle is ${RUNTIME_VERSION}.`)
      }
      return existing
    }
    return (global[RUNTIME_KEY] = new UIRuntime())
  }

  /**
   * Load (if needed) and return the page runtime, once `ready`.
   * - Same as `UI.load()` / `loadUI()`;  here for callers that already hold the class.
   */
  static load(): Promise<UIRuntime> {
    return load()
  }

  /** Resolve with this runtime once `ready`;  what `UI.load()` returns once the chunk is in. */
  async load(): Promise<this> {
    await this.ready
    return this
  }

  /** Shortcut for `toasts.show()`, the Fomantic `$.toast({...})` spelling. */
  toast(options: ToastOptions): ToastHandle {
    return this.toasts.show(options)
  }

  /** Shortcut for `visibility.observe()`, Fomantic's `$(el).visibility({...})`;  returns the undo. */
  observeVisibility(element: Element, options: VisibilityOptions): Disposer {
    return this.visibility.observe(element, options)
  }
}
