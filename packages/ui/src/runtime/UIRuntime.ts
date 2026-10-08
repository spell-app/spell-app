// The runtime sits BELOW `core` (which re-exports its loader):  never the `$/ui/core` entry, or Rolldown splits the
// modules both reach into a chunk of their own (I16)
import { proto, Warnings } from "$/ui/util"
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
  UTILITIES_SHEET,
  type Disposer,
  type RuntimeGlobal,
  type ToastHandle,
  type ToastOptions,
  type VisibilityOptions
} from "./runtime.types"
import { Api } from "./Api"
import { Browser } from "./Browser"
import { CodeLanguages } from "./CodeLanguages"
import { Focus } from "./Focus"
import { I18n } from "./I18n"
import { IconPacks } from "./IconPacks"
import { Ids } from "./Ids"
import { Keyboard } from "./Keyboard"
import { Modals } from "./Modals"
import { Overlays } from "./Overlays"
import { Sources } from "./Sources"
import { Styles } from "./Styles"
import { Themes } from "./Themes"
import { Toasts } from "./Toasts"
import { Transitions } from "./Transitions"
import { Visibility } from "./Visibility"
import { load } from "./load"

/****************
 * ### `UIRuntime`
 * The shared `UI` runtime:  ONE instance per page, holding every service as a readonly field.
 * - The root of the runtime's LAZY chunk:  `load.ts` dynamic-imports this module;  nothing imports it statically
 *   (`import type` only), so components never carry the services.  It imports `$/ui/core` (already loaded by then)
 *   and `$/ui/styles` (the foundation's text), which lands in this chunk.
 * - Why one:  keyboard scopes, the overlay stack, scroll lock and the stylesheet registry only work if every
 *   component on the page talks to the SAME instance -- including components from a second copy of the
 *   package (duplicate bundles, micro-frontends).  So the instance lives on `globalThis[RUNTIME_KEY]`
 *   and `UIRuntime.instance` reuses whatever is there.
 * - Loaded lazily:  components call `UI.load()` (see `load.ts`) from `connectedCallback`, which
 *   dynamic-imports THIS module once, so the runtime is its own chunk and pages pay for it only when a
 *   component actually connects.
 * - Constructs outside a browser too (SSR):  services touch the DOM only when used.
 * - NOTE: it holds the `Vocabulary` registry itself (`UI.vocabulary`), and registers the foundation stylesheets
 *   with `UI.styles` as it's constructed (`registerFoundation()`):  `$/ui/vocabulary` and `$/ui/styles` stay plain
 *   data, which never reach for the runtime.
 ****************/
export class UIRuntime {
  /**
   * this build's version;  a runtime from another bundle may differ
   * - `@proto` default:  a fact about the build, the same for every instance
   */
  declare readonly version: string
  @proto static version = RUNTIME_VERSION

  /** feature flags and sniffing */
  readonly browser = new Browser()
  /** unique ids for ARIA wiring */
  readonly ids = new Ids()
  /** shortcut registry with scopes */
  readonly keyboard = new Keyboard({ isApple: this.browser.isApple })
  /** focus helpers that cross shadow roots */
  readonly focus = new Focus()
  /** constructable stylesheet registry + `#ui-app-stylesheet` */
  readonly styles = new Styles()
  /** the theme sheets, loaded on demand, and `apply()`, which registers one with `styles` */
  readonly themes = new Themes({ styles: this.styles })
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
  /** same-origin text files elements load and save (`<ui-include>`, `<ui-code>`, `<ui-markdown>`) */
  readonly sources = new Sources()
  /** languages `<ui-code>` highlights beyond its own:  `register()`, e.g. spell */
  readonly code = new CodeLanguages()
  /** canonical + localized component names (the translation hook) */
  readonly vocabulary = new Vocabulary()

  /** Resolves once every service is constructed and the runtime is published on `globalThis`. */
  readonly ready: Promise<void>

  constructor() {
    this.registerFoundation()
    this.ready = Promise.resolve()
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

  ////////////////
  // ## Internals
  ////////////////

  /**
   * Register the CSS foundation with `styles`, so every shadow root adopts it and the page gets the light-side sheets.
   * - Every sheet goes on the page (`PAGE_SHEETS`);  shadow roots adopt `FOUNDATION_SHEETS` first, and the
   *   utilities after their own sheets (`Styles`' default `setUtilities()`).
   * - Here rather than in `$/ui/styles`:  the runtime chunk is loaded exactly once per page, which is also how often
   *   the foundation must be registered;  `$/ui/styles` stays plain data.
   */
  private registerFoundation() {
    // `linked`:  `ui.css` carries every one of these, so a page that links it doesn't get them twice
    for (const [name, css] of Object.entries(PAGE_SHEETS)) {
      this.styles.register(name, css, { page: true, linked: true })
    }
    this.styles.setFoundation(Object.keys(FOUNDATION_SHEETS))
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * THE runtime for this page:  the one on `globalThis[RUNTIME_KEY]`, created on first access.
   * - STATIC:  it's how the one instance is found or made, so there's no instance to ask yet.
   * - A second bundle's `UIRuntime` class finds the first bundle's instance here;  a version mismatch warns in dev.
   */
  static get instance(): UIRuntime {
    const global = globalThis as RuntimeGlobal
    const existing = global[RUNTIME_KEY]
    if (existing) {
      if (import.meta.env.DEV && existing.version !== RUNTIME_VERSION) {
        Warnings.warn("UI", `runtime ${existing.version} already loaded;  this bundle is ${RUNTIME_VERSION}`)
      }
      return existing
    }
    return (global[RUNTIME_KEY] = new UIRuntime())
  }

  /**
   * Load (if needed) and return the page runtime, once `ready`.
   * - Same as `UI.load()` / `loadUI()`;  here for callers that already hold the class.
   * - STATIC:  for code holding the class before any instance exists.
   */
  static load(): Promise<UIRuntime> {
    return load()
  }
}

/**
 * Sheets every shadow root adopts BEFORE its own, by name, in cascade order:  `foundationCSS` (`$/ui/styles`)
 * less the utilities, which `Styles` adopts after a component's sheets.
 */
const FOUNDATION_SHEETS = {
  layers: layersCSS,
  reset: resetCSS,
  tokens: tokensCSS,
  colors: colorsCSS,
  sizes: sizesCSS,
  animations: animationsCSS
}

/**
 * Every sheet the runtime registers, by name, in `pageCSS` order (`$/ui/styles`):  all go on the page.
 * - `typography` and `native` style light-DOM markup only;  shadow roots never adopt them.
 */
const PAGE_SHEETS = {
  ...FOUNDATION_SHEETS,
  [UTILITIES_SHEET]: utilitiesCSS,
  typography: typographyCSS,
  native: nativeCSS
}
