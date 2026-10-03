import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { DEFAULT_ICON_PACK } from "$/ui/icons"
import { Vocabulary } from "$/ui/vocabulary"
import { RUNTIME_KEY, RUNTIME_VERSION, type IconPacks as IconPacksType, type RuntimeGlobal, type UIRuntime } from "$/ui/runtime"
import { Browser } from "$/ui/runtime/Browser"
import { I18n } from "$/ui/runtime/I18n"
import { IconPacks } from "$/ui/runtime/IconPacks"
import { Ids } from "$/ui/runtime/Ids"
import { IconGlyph } from "$/ui/elements"

/****************
 * ### `ServerRuntime`
 * The `UI` runtime as a server render sees it:  the services a render reads, on `globalThis[RUNTIME_KEY]`.
 * - Why not `UIRuntime`:  its constructor registers the foundation sheets with `new CSSStyleSheet()`, which node
 *   doesn't have.
 * - Real:  `browser` (every `supports` flag false in node), `ids`, `i18n` (English), `vocabulary`, `icons`.
 * - Stubbed:  `styles` (nothing is adopted on a server;  page sheets registered while rendering are kept).
 * - Anything else a render reaches throws, naming the service:  a family that needs it isn't server-ready yet.
 ****************/
export class ServerRuntime {
  /**
   * Page sheets components registered while rendering (`UI.styles.register(name, css, { page: true })`), by name:
   * `ui-dimmer.page.css`, the toast container's.  `StaticStylesheet.build()` includes them.
   */
  static readonly pageSheets = new Map<string, string>()

  /**
   * Install a server runtime on `globalThis`, unless one is there;  returns the page's runtime.
   * - SIDE EFFECT:  also gives `IconGlyph` its server source (`iconMarkup()`).
   */
  static install(): UIRuntime {
    const global = globalThis as RuntimeGlobal
    IconGlyph.serverMarkup ??= ServerRuntime.iconMarkup
    return (global[RUNTIME_KEY] ??= ServerRuntime.create())
  }

  /**
   * Load icon packs (`"fa7-free"`, a `pack.js` URL) into the page's set, so a render can draw their icons.
   * - MUST be awaited before rendering:  pack indexes load asynchronously, the render is synchronous.
   * - In node the default pack isn't loaded by itself (`IconPacks` starts it only with a `document`).
   */
  static async icons(sources: readonly string[] = [DEFAULT_ICON_PACK]): Promise<void> {
    const { icons } = ServerRuntime.install()
    await Promise.all(sources.map((source) => icons.use(source)))
  }

  /**
   * `name`'s SVG markup from `packs`, read from disk (cached), or `undefined`:  unknown name, or a pack not on a
   * `file:` URL.
   */
  static iconMarkup(packs: IconPacksType, name: string): string | undefined {
    const url = packs.resolve(name)?.url
    if (!url?.startsWith("file:")) return undefined
    let markup = SVG_FILES.get(url)
    if (markup === undefined) SVG_FILES.set(url, (markup = readFileSync(fileURLToPath(url), "utf8").trim()))
    return markup
  }

  /** A fresh server runtime, typed as the real one;  services it lacks throw on first use. */
  static create(): UIRuntime {
    const browser = new Browser()
    const services: Record<string, unknown> = {
      version: RUNTIME_VERSION,
      ready: Promise.resolve(),
      load: () => Promise.resolve(runtime),
      browser,
      ids: new Ids(),
      i18n: new I18n({ locale: "en", browser }),
      vocabulary: new Vocabulary(),
      icons: new IconPacks(),
      styles: SERVER_STYLES
    }
    const runtime = new Proxy(services, {
      get(target, key) {
        if (key in target || typeof key === "symbol" || key === "then") return target[key as string]
        throw new Error(`UI.${String(key)}:  not available in a server render (ServerRuntime)`)
      }
    }) as unknown as UIRuntime
    return runtime
  }
}

/** SVG file text by `file:` URL:  read once per process. */
const SVG_FILES = new Map<string, string>()

/**
 * `UI.styles` on a server:  adoption does nothing;  registrations are only recorded, PAGE sheets with their CSS
 * (`ServerRuntime.pageSheets`), for the static stylesheet.
 */
const SERVER_STYLES = {
  has: (name: string) => REGISTERED.has(name),
  register: (name: string, css: unknown, { page = false }: { page?: boolean } = {}) => {
    REGISTERED.add(name)
    if (page && typeof css === "string") ServerRuntime.pageSheets.set(name, css)
  },
  adoptInto: () => undefined,
  sheet: () => undefined
}

/** Sheet names registered during renders (`UI.styles.has()`). */
const REGISTERED = new Set<string>()
