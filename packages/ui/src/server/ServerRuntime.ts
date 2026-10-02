import { Vocabulary } from "$/ui/vocabulary"
import { RUNTIME_KEY, RUNTIME_VERSION, type RuntimeGlobal, type UIRuntime } from "$/ui/runtime"
import { Browser } from "$/ui/runtime/Browser"
import { I18n } from "$/ui/runtime/I18n"
import { IconPacks } from "$/ui/runtime/IconPacks"
import { Ids } from "$/ui/runtime/Ids"

/****************
 * ### `ServerRuntime`
 * The `UI` runtime as a server render sees it:  the services a render reads, on `globalThis[RUNTIME_KEY]`.
 * - Why not `UIRuntime`:  its constructor registers the foundation sheets with `new CSSStyleSheet()`, which node
 *   doesn't have.
 * - Real:  `browser` (every `supports` flag false in node), `ids`, `i18n` (English), `vocabulary`, `icons`.
 * - Stubbed:  `styles` (nothing is adopted on a server;  `has()` says yes so nothing registers).
 * - Anything else a render reaches throws, naming the service:  a family that needs it isn't server-ready yet.
 ****************/
export class ServerRuntime {
  /** Install a server runtime on `globalThis`, unless one is there;  returns the page's runtime. */
  static install(): UIRuntime {
    const global = globalThis as RuntimeGlobal
    return (global[RUNTIME_KEY] ??= ServerRuntime.create())
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

/** `UI.styles` on a server:  every sheet counts as registered, adoption does nothing. */
const SERVER_STYLES = {
  has: () => true,
  register: () => undefined,
  adoptInto: () => undefined,
  sheet: () => undefined
}
