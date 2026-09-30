/// <reference types="node" />

import { existsSync, readFileSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import solid from "@solidjs/vite-plugin"
import * as vite from "vite"

/**
 * Compiles the Solid 2 host app (`frameworks/solid/app.tsx` => `frameworks/solid/dist/app.js`) for the smoke page
 * `frameworks/solid.html`.
 * - `solid-js` and `@solidjs/web` EXTERNAL:  the page's import map decides the copy -- the SAME vendored files the
 *   components run on, which the identity probe then proves (`frameworks/solid/identity.js`).
 * - Production Solid (`dev: false`), unminified.
 * - `SmokeRunner` / `yarn vendor` call `ensure()`, which builds when the output is missing or older than the
 *   source;  `PeerVendor` reads the output's imports, so the vendored Solid holds what the app needs too.
 */
export class HostApp {
  /** `tools/`, absolute, with a trailing slash */
  static readonly ROOT = fileURLToPath(new URL("./", import.meta.url))
  /** the app source */
  static readonly SOURCE = `${HostApp.ROOT}frameworks/solid/app.tsx`
  /** the compiled app */
  static readonly OUTPUT = `${HostApp.ROOT}frameworks/solid/dist/app.js`
  /** the app's specifiers resolve through the page's import map */
  static readonly SOLID_EXTERNAL = /^solid-js(\/|$)|^@solidjs\/web(\/|$)/

  /** Build when missing or stale;  resolves once `OUTPUT` is current. */
  static async ensure(): Promise<void> {
    const stale = !existsSync(HostApp.OUTPUT) || statSync(HostApp.OUTPUT).mtimeMs < statSync(HostApp.SOURCE).mtimeMs
    if (stale) await HostApp.build()
  }

  /** Compile the app. */
  static async build(): Promise<void> {
    const pkg = JSON.parse(
      readFileSync(fileURLToPath(new URL("../node_modules/solid-js/package.json", import.meta.url)), "utf8")
    )
    await vite.build({
      root: HostApp.ROOT,
      configFile: false,
      logLevel: "warn",
      plugins: [solid({ dev: false })],
      define: { __SOLID_VERSION__: JSON.stringify((pkg as { version: string }).version) },
      build: {
        outDir: `${HostApp.ROOT}frameworks/solid/dist`,
        emptyOutDir: true,
        minify: false,
        lib: { entry: { app: HostApp.SOURCE }, formats: ["es"] },
        rolldownOptions: { external: (id) => HostApp.SOLID_EXTERNAL.test(id) }
      }
    })
    console.log("built tools/frameworks/solid/dist/app.js")
  }
}
