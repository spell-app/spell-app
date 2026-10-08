/// <reference types="node" />

import { existsSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import solid from "@solidjs/vite-plugin"
import * as vite from "vite"

import { NodePackage } from "./NodePackage.ts"
import { Terminal } from "./Terminal.ts"

/****************
 * ### `HostApp`
 * Compiles the Solid 2 host app (`frameworks/solid/app.tsx` => `frameworks/solid/dist/app.js`) for the smoke page
 * `frameworks/solid.html`.
 * - `solid-js` and `@solidjs/web` EXTERNAL:  the page's import map decides the copy -- the SAME vendored files the
 *   components run on, which the identity probe then proves (`frameworks/solid/identity.js`).
 * - Production Solid (`dev: false`), unminified.
 * - `SmokeRunner` / `yarn vendor` call `ensure()`, which builds when the output is missing or older than the
 *   source;  `PeerVendor` reads the output's imports, so the vendored Solid holds what the app needs too.
 * - STATIC and instance-free:  there is one host app.
 ****************/
export class HostApp {
  /** Build when missing or stale;  resolves once the compiled app is current. */
  static async ensure(): Promise<void> {
    const isStale = !existsSync(OUTPUT) || statSync(OUTPUT).mtimeMs < statSync(SOURCE).mtimeMs
    if (isStale) await HostApp.build()
  }

  /** Compile the app. */
  static async build(): Promise<void> {
    const version = NodePackage.version("solid-js")
    await vite.build({
      root: TOOLS,
      configFile: false,
      logLevel: "warn",
      plugins: [solid({ dev: false })],
      define: { __SOLID_VERSION__: JSON.stringify(version) },
      build: {
        outDir: `${TOOLS}frameworks/solid/dist`,
        emptyOutDir: true,
        minify: false,
        lib: { entry: { app: SOURCE }, formats: ["es"] },
        rolldownOptions: { external: (id) => SOLID_EXTERNAL.test(id) }
      }
    })
    Terminal.err("built tools/frameworks/solid/dist/app.js")
  }
}

/** `tools/`, absolute, with a trailing slash. */
const TOOLS = fileURLToPath(new URL("./", import.meta.url))

/** The app's source. */
const SOURCE = `${TOOLS}frameworks/solid/app.tsx`

/** The compiled app. */
const OUTPUT = `${TOOLS}frameworks/solid/dist/app.js`

/** What the app leaves to the page's import map:  `solid-js` and `@solidjs/web`, subpaths included. */
const SOLID_EXTERNAL = /^solid-js(\/|$)|^@solidjs\/web(\/|$)/
