import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { E } from "$/ui/core"
// Service classes by path:  the runtime's barrel (and so `$/ui/core`) exports them as types only (its header says why)
import { Browser } from "$/ui/runtime/Browser"
import { I18n } from "$/ui/runtime/I18n"
import { IconPacks } from "$/ui/runtime/IconPacks"
import { SSR } from "$/ui/static"

/****************
 * ### `ServerRuntime`
 * The `UI` runtime as a server render sees it:  the services a render reads, on `globalThis[RUNTIME_KEY]`.
 * - Why not `UIRuntime`:  its constructor registers the foundation sheets with `new CSSStyleSheet()`, which node
 *   doesn't have.
 * - Real:  `browser` (every `supports` flag false in node), `ids`, `i18n` (English), `vocabulary`, `icons`.
 * - Stubbed:  `styles` (nothing is adopted on a server;  page sheets registered while rendering are kept).
 * - Anything else a render reaches throws, naming the service:  a family that needs it isn't server-ready yet.
 * - Node only (`$/ui/static`:  reads icon SVGs from disk);  NEVER imported by a component or `$/ui`.
 * - STATIC:  ONE runtime per process, like the page's ONE `UI`;  its registries are page-wide.
 ****************/
export class ServerRuntime {
  /**
   * Page sheets components registered while rendering (`UI.styles.register(name, css, { page: true })`), by name:
   * `ui-dimmer.page.css`, the toast container's.  `StaticStylesheet.build()` includes them.
   * - Static:  every render's registrations, read by the stylesheet built after them.
   */
  static readonly pageSheets = new Map<string, string>()

  /** Sheet names registered during renders (`UI.styles.has()`):  page-wide, as the real `Styles` keeps them. */
  private static readonly registered = new Set<string>()

  /** SVG file text by `file:` URL:  read once per process. */
  private static readonly svgFiles = new Map<string, string>()

  /**
   * Install a server runtime on `globalThis`, unless one is there;  returns the page's runtime.
   * - SIDE EFFECT:  also gives `IconGlyph` its server source (`iconMarkup()`).
   */
  static install(): E.UIRuntime {
    const global = globalThis as E.RuntimeGlobal
    E.IconGlyph.serverMarkup ??= ServerRuntime.iconMarkup
    return (global[E.RUNTIME_KEY] ??= ServerRuntime.create())
  }

  /**
   * Load icon packs (`"fa7-free"`, a `pack.js` URL) into the page's set, so a render can draw their icons.
   * - MUST be awaited before rendering:  pack indexes load asynchronously, the render is synchronous.
   * - In node the default pack isn't loaded by itself (`IconPacks` starts it only with a `document`).
   */
  static async icons(sources: readonly string[] = [E.DEFAULT_ICON_PACK]): Promise<void> {
    const { icons } = ServerRuntime.install()
    await Promise.all(sources.map((source) => icons.use(source)))
  }

  /**
   * `name`'s SVG markup from `packs`, read from disk (cached), or `undefined`:  unknown name, or a pack not on a
   * `file:` URL.
   */
  static iconMarkup(packs: IconPacks, name: string): string | undefined {
    const url = packs.resolve(name)?.url
    if (!url?.startsWith("file:")) return undefined
    let markup = ServerRuntime.svgFiles.get(url)
    if (markup === undefined)
      ServerRuntime.svgFiles.set(url, (markup = readFileSync(fileURLToPath(url), "utf8").trim()))
    return markup
  }

  /**
   * A fresh server runtime, typed as the real one.
   * - Services it lacks throw on first use:  "UI.toasts isn't available in a server render ...".
   */
  static create(): E.UIRuntime {
    const browser = new Browser()
    const services: Record<string, unknown> = {
      version: E.RUNTIME_VERSION,
      ready: Promise.resolve(),
      load: () => Promise.resolve(runtime),
      browser,
      ids: new SSR.ServerIds(),
      i18n: new I18n({ locale: "en", browser }),
      vocabulary: new E.Vocabulary(),
      icons: new IconPacks(),
      styles: ServerRuntime.STYLES
    }
    const runtime = new Proxy(services, {
      get(target, key) {
        if (key in target || typeof key === "symbol" || key === "then") return target[key as string]
        throw new Error(
          `ServerRuntime:  UI.${String(key)} isn't available in a server render;  stub it in ` +
            `ServerRuntime.create(), or leave the family that reads it out of StaticRender.define()`
        )
      }
    }) as unknown as E.UIRuntime
    return runtime
  }

  /**
   * Forget what renders registered (`pageSheets`, sheet names) and the cached SVG files, for tests.
   * - The installed runtime stays:  its services keep their own state (`ids` restarts per page anyway).
   */
  static reset() {
    ServerRuntime.pageSheets.clear()
    ServerRuntime.registered.clear()
    ServerRuntime.svgFiles.clear()
  }

  ////////////////
  // ## Constants
  ////////////////

  /**
   * `UI.styles` on a server:  adoption does nothing;  registrations are only recorded, PAGE sheets with their CSS
   * (`pageSheets`), for the static stylesheet.
   * - Stays a `private static` (epic `wwod-spell-ui`, Q18):  its closures reach the private `registered`, which a
   *   module `const` can't.
   */
  private static readonly STYLES = {
    has: (name: string) => ServerRuntime.registered.has(name),
    register: (name: string, css: unknown, { page = false }: { page?: boolean } = {}) => {
      ServerRuntime.registered.add(name)
      if (page && typeof css === "string") ServerRuntime.pageSheets.set(name, css)
    },
    adoptInto: () => undefined,
    sheet: () => undefined
  }
}
